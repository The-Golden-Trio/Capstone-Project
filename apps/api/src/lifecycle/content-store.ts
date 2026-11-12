/**
 * Ánh xạ openapi `ScenarioContent` ↔ các bảng ERD-03. Chỉ `ScenarioModule`
 * (trong Content lifecycle) gọi, và chỉ khi scenario ở DRAFT.
 *
 * Ghi theo khoá (`activity_key`, `item_key`, `npc_key`, năng lực của tiêu
 * chí) để giữ id: câu mẫu (`reference_answer`), điểm của câu mẫu và lựa chọn
 * trình bày (`presentation_*`) trỏ tới các id đó.
 */
import type { Prisma } from '../generated/prisma/client';
import type { TaskType } from '../generated/prisma/enums';
import type { Tx } from './scenario-state-machine';
import type {
  ActivityContent,
  ScenarioContent,
} from '../scenario/dto/scenario-content.schema';

/** ERD-03 `activity.summary` bắt buộc nhưng openapi không có (07 A22+): lấy đầu câu hỏi. */
export const summaryOf = (a: ActivityContent): string =>
  a.inputPrompt.replace(/\s+/g, ' ').trim().slice(0, 160);

const toDecimal = (n: number | undefined) =>
  n === undefined ? null : n.toFixed(1);

export async function writeContent(
  tx: Tx,
  scenarioId: string,
  content: ScenarioContent,
): Promise<void> {
  await tx.scenario.update({
    where: { id: scenarioId },
    data: {
      intro: content.intro ?? null,
      situation: content.situation ?? null,
      stakes: content.stakes ?? null,
      estimatedMinutes: toDecimal(content.estimatedMinutes),
    },
  });

  // NPC
  const cast = content.cast ?? [];
  await tx.castMember.deleteMany({
    where: { scenarioId, npcKey: { notIn: cast.map((m) => m.npcKey) } },
  });
  for (const m of cast) {
    const data = {
      name: m.name ?? null,
      roleInScene: m.roleInScene,
      pressure: m.pressure ?? null,
      voice: m.voice ?? null,
    };
    await tx.castMember.upsert({
      where: { scenarioId_npcKey: { scenarioId, npcKey: m.npcKey } },
      create: { scenarioId, npcKey: m.npcKey, ...data },
      update: data,
    });
  }

  // Activity: hai lượt, vì con trỏ forward_to cần id của activity đích.
  const keys = content.activities.map((a) => a.key);
  await tx.randomEvent.deleteMany({ where: { scenarioId } });
  await tx.activity.updateMany({
    where: { scenarioId },
    data: { forwardToId: null },
  });
  await tx.activity.deleteMany({
    where: { scenarioId, activityKey: { notIn: keys } },
  });
  const idByKey = new Map<string, string>();
  for (const a of content.activities) {
    const data = {
      summary: summaryOf(a),
      setup: a.setup ?? '',
      npcLine: a.npcLine ?? null,
      inputPrompt: a.inputPrompt,
      jobScope: a.jobScope,
      closingLine: a.closingLine,
      isOrigin: a.isOrigin ?? false,
      followupLimit: a.followupLimit ?? 0,
      followupGoal: a.followupGoal ?? null,
      defaultFollowup: a.defaultFollowup ?? null,
    };
    const row = await tx.activity.upsert({
      where: { scenarioId_activityKey: { scenarioId, activityKey: a.key } },
      create: { scenarioId, activityKey: a.key, ...data },
      update: data,
      select: { id: true },
    });
    idByKey.set(a.key, row.id);
  }

  for (const a of content.activities) {
    const activityId = idByKey.get(a.key) as string;
    if (a.forwardTo)
      await tx.activity.update({
        where: { id: activityId },
        data: { forwardToId: idByKey.get(a.forwardTo) ?? null },
      });

    // Dạng task cho phép: chỉ xoá dạng bị bỏ, để không kéo theo lựa chọn
    // trình bày của dạng vẫn còn.
    await tx.activityAllowedType.deleteMany({
      where: {
        activityId,
        taskType: { notIn: a.allowedTypes as TaskType[] },
      },
    });
    await tx.activityAllowedType.createMany({
      data: a.allowedTypes.map((taskType) => ({ activityId, taskType })),
      skipDuplicates: true,
    });

    const items = a.items ?? [];
    await tx.activityItem.deleteMany({
      where: { activityId, itemKey: { notIn: items.map((i) => i.key) } },
    });
    for (const [sortOrder, it] of items.entries()) {
      const data = {
        text: it.text,
        score: it.score ?? null,
        why: it.why ?? null,
        correctPosition: it.correctPosition ?? null,
        pickRule: it.pickRule ?? null,
        note: it.note ?? null,
        sortOrder,
      };
      await tx.activityItem.upsert({
        where: { activityId_itemKey: { activityId, itemKey: it.key } },
        create: { activityId, itemKey: it.key, ...data },
        update: data,
      });
    }

    await tx.rubricCriterion.deleteMany({
      where: {
        activityId,
        competencyId: { notIn: a.rubric.map((r) => r.competencyId) },
      },
    });
    for (const r of a.rubric) {
      const data = {
        anchor2: r.anchor2,
        anchor1: r.anchor1,
        anchor0: r.anchor0,
        counterproductiveSigns: r.counterproductiveSigns ?? null,
      };
      await tx.rubricCriterion.upsert({
        where: {
          activityId_competencyId: { activityId, competencyId: r.competencyId },
        },
        create: { activityId, competencyId: r.competencyId, ...data },
        update: data,
      });
    }

    await tx.hint.deleteMany({ where: { activityId } });
    await tx.hint.createMany({
      data: (a.hints ?? []).map((text, sortOrder) => ({
        activityId,
        text,
        sortOrder,
      })),
    });
  }

  await tx.randomEvent.createMany({
    data: (content.randomEvents ?? []).flatMap((e) => {
      const activityId = idByKey.get(e.activityKey);
      return activityId
        ? [
            {
              scenarioId,
              activityId,
              chance: e.chance.toFixed(2),
              text: e.text,
              prompt: e.prompt,
              targetCompetencyId: e.targetCompetencyId,
              anchor2: e.anchor2,
              anchor1: e.anchor1,
              anchor0: e.anchor0,
              counterproductiveSigns: e.counterproductiveSigns ?? null,
            },
          ]
        : [];
    }),
  });

  await tx.ending.deleteMany({ where: { scenarioId } });
  await tx.ending.createMany({
    data: content.endings.map((e) => ({
      scenarioId,
      type: e.type,
      priority: e.priority,
      minTotalScore: e.minTotalScore ?? null,
      extraBehaviour: e.extraBehaviour ?? null,
      text: e.text,
      reveals: e.reveals ?? null,
    })),
  });

  await tx.sideQuest.deleteMany({ where: { scenarioId } });
  await tx.sideQuest.createMany({
    data: (content.sideQuests ?? []).map((q) => ({
      scenarioId,
      prompt: q.prompt,
      taskType: q.taskType,
      points: q.points,
      answerKey:
        q.answerKey === undefined
          ? undefined
          : (q.answerKey as Prisma.InputJsonValue),
    })),
  });
}

const contentInclude = {
  cast: { orderBy: { npcKey: 'asc' } },
  activities: {
    include: {
      forwardTo: { select: { activityKey: true } },
      allowedTypes: true,
      items: { orderBy: { sortOrder: 'asc' } },
      rubric: true,
      hints: { orderBy: { sortOrder: 'asc' } },
    },
  },
  randomEvents: { include: { activity: { select: { activityKey: true } } } },
  endings: { orderBy: { priority: 'asc' } },
  sideQuests: true,
} satisfies Prisma.ScenarioInclude;

type Loaded = Prisma.ScenarioGetPayload<{ include: typeof contentInclude }>;

const TASK_ORDER: TaskType[] = [
  'FREE_TEXT',
  'CHOICE',
  'ORDERING',
  'PRIORITIZING',
];

/** Sắp activity theo chuỗi con trỏ từ activity gốc; activity lạc ở cuối. */
function orderActivities(rows: Loaded['activities']) {
  const byId = new Map(rows.map((a) => [a.id, a]));
  const out: typeof rows = [];
  let cur = rows.find((a) => a.isOrigin);
  while (cur && !out.includes(cur)) {
    out.push(cur);
    cur = cur.forwardToId ? byId.get(cur.forwardToId) : undefined;
  }
  for (const a of [...rows].sort((x, y) =>
    x.activityKey.localeCompare(y.activityKey),
  ))
    if (!out.includes(a)) out.push(a);
  return out;
}

/** Đọc nội dung đã lưu; `null` khi chưa có activity nào (chưa sinh). */
export async function readContent(
  db: Tx,
  scenarioId: string,
): Promise<ScenarioContent | null> {
  const s = await db.scenario.findUnique({
    where: { id: scenarioId },
    include: contentInclude,
  });
  if (!s || s.activities.length === 0) return null;
  const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);
  return {
    ...(s.intro !== null ? { intro: s.intro } : {}),
    ...(s.situation !== null ? { situation: s.situation } : {}),
    ...(s.stakes !== null ? { stakes: s.stakes } : {}),
    ...(s.estimatedMinutes !== null
      ? { estimatedMinutes: Number(s.estimatedMinutes) }
      : {}),
    cast: s.cast.map((m) => ({
      npcKey: m.npcKey,
      name: opt(m.name),
      roleInScene: m.roleInScene,
      pressure: opt(m.pressure),
      voice: opt(m.voice),
    })),
    activities: orderActivities(s.activities).map((a) => ({
      key: a.activityKey,
      isOrigin: a.isOrigin,
      forwardTo: a.forwardTo?.activityKey ?? null,
      setup: a.setup,
      npcLine: opt(a.npcLine),
      inputPrompt: a.inputPrompt,
      jobScope: a.jobScope,
      closingLine: a.closingLine,
      allowedTypes: TASK_ORDER.filter((t) =>
        a.allowedTypes.some((x) => x.taskType === t),
      ),
      items: a.items.map((it) => ({
        key: it.itemKey,
        text: it.text,
        score: opt(it.score) as 0 | 1 | 2 | undefined,
        why: opt(it.why),
        correctPosition: opt(it.correctPosition),
        pickRule: opt(it.pickRule),
        note: opt(it.note),
      })),
      followupLimit: a.followupLimit,
      followupGoal: opt(a.followupGoal),
      defaultFollowup: opt(a.defaultFollowup),
      hints: a.hints.map((h) => h.text),
      rubric: a.rubric.map((r) => ({
        id: r.id,
        competencyId: r.competencyId,
        anchor2: r.anchor2,
        anchor1: r.anchor1,
        anchor0: r.anchor0,
        counterproductiveSigns: opt(r.counterproductiveSigns),
      })),
    })),
    randomEvents: s.randomEvents.map((e) => ({
      activityKey: e.activity.activityKey,
      chance: Number(e.chance),
      text: e.text,
      prompt: e.prompt,
      targetCompetencyId: e.targetCompetencyId,
      anchor2: e.anchor2,
      anchor1: e.anchor1,
      anchor0: e.anchor0,
      counterproductiveSigns: opt(e.counterproductiveSigns),
    })),
    endings: s.endings.map((e) => ({
      type: e.type,
      priority: e.priority,
      minTotalScore: e.minTotalScore,
      extraBehaviour: e.extraBehaviour,
      text: e.text,
      reveals: e.reveals,
    })),
    sideQuests: s.sideQuests.map((q) => ({
      prompt: q.prompt,
      taskType: q.taskType,
      points: q.points,
      ...(q.answerKey !== null ? { answerKey: q.answerKey } : {}),
    })),
  };
}

/** Đọc một phần nội dung theo đường dẫn `activities[1].rubric`, `intro`… */
export function pathGet(root: unknown, path: string): unknown {
  const tokens = path.match(/[^.[\]]+/g) ?? [];
  let cur: unknown = root;
  for (const t of tokens) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) {
      const i = Number(t);
      if (!Number.isInteger(i)) return undefined;
      cur = cur[i];
    } else if (typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[t];
    } else return undefined;
  }
  return cur;
}

/** Bản sao của `root` với giá trị ở `path` thay bằng `value`. */
export function pathSet<T>(root: T, path: string, value: unknown): T {
  const copy = structuredClone(root) as unknown;
  const tokens = path.match(/[^.[\]]+/g) ?? [];
  if (!tokens.length) return value as T;
  let cur = copy as Record<string, unknown>;
  for (const t of tokens.slice(0, -1))
    cur = cur[Array.isArray(cur) ? Number(t) : t] as Record<string, unknown>;
  const last = tokens[tokens.length - 1];
  cur[Array.isArray(cur) ? Number(last) : last] = value;
  return copy as T;
}
