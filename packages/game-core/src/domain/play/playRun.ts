/**
 * Luật của luồng chơi có AI (SD-01, SD-02): lượt chơi là chuỗi sự kiện chỉ
 * ghi thêm, trạng thái là fold các sự kiện qua đây (§5.3.1).
 *
 * Khác `scenarioEngine` (luồng prototype, chấm từ khoá đồng bộ): ở đây câu tự
 * luận được chấm bất đồng bộ bởi panel ba judge (AI-5), nên điểm tới SAU dưới
 * dạng sự kiện `ANSWER_GRADED`. Có hỏi vặn hay không do engine quyết TRƯỚC,
 * không dựa vào điểm (quyết định ① 30/10 trong thiết kế AI-4, §4.1).
 *
 * Thuần: không mạng, không DB, không đồng hồ — máy chủ, worker và trình duyệt
 * fold cùng một chuỗi sự kiện ra cùng một trạng thái.
 *
 * Thang điểm 0/1/2 (D-116). Nội dung prototype còn ghi mốc +2 / 0 / −1, ánh xạ
 * theo thứ tự: +2 → 2, 0 → 1, −1 → 0.
 */
import type {
  Activity,
  Anchor,
  Ending,
  Scenario,
  SkillType,
} from '../../data/schema.js';
import { followupCap } from '../followups.js';
import { normalizeVi } from '../format.js';
import {
  gradeChoice,
  gradeOrdering,
  gradePrioritizing,
} from '../grading/structuredGrading.js';

export type PlayScore = 0 | 1 | 2;

export const SCORE_OF_ANCHOR: Readonly<Record<Anchor, PlayScore>> = {
  '+2': 2,
  '0': 1,
  '-1': 0,
};
export const ANCHOR_OF_SCORE: Readonly<Record<PlayScore, Anchor>> = {
  2: '+2',
  1: '0',
  0: '-1',
};

/* ── Sự kiện ───────────────────────────────────────────────────────── */

/** Một tiêu chí đã được panel chấm (ERD-06 `criterion_grade`), kèm đủ để tổng kết không phải tra lại. */
export interface GradedCriterion {
  key: string;
  skill: string;
  skillType: SkillType;
  /** `null` = không xét. */
  score: PlayScore | null;
  counterproductive: boolean;
  highDisagreement: boolean;
  /** Lý do và câu trích của một judge có mức bằng mức gộp — để viết nhận xét có dẫn chứng (FR-11). */
  rationale: string;
  quote: string;
}

/** Nguồn gốc của một đầu ra model (§5.3.1: không bao giờ tính lại). */
export interface Provenance {
  modelKey: string;
  promptVersion: string;
  costUsd: number;
  latencyMs: number | null;
}

export type PlayEvent =
  | {
      type: 'RUN_STARTED';
      scenarioKey: string;
      contentVersion: number;
      band: string;
    }
  | {
      type: 'CLOSED_ANSWERED';
      activityKey: string;
      answerId: string;
      score: PlayScore;
      why: string;
      quote: string;
    }
  | {
      type: 'TEXT_SUBMITTED';
      activityKey: string;
      answerId: string;
      followupNo: number;
      /** Engine đã quyết lúc nhận câu: có gọi AI-4 hỏi vặn không. */
      followUpAllowed: boolean;
    }
  | {
      type: 'FOLLOWUP_ASKED';
      activityKey: string;
      followupNo: number;
      npcKey: string;
      name: string;
      question: string;
      /** `ai`: AI-4 viết; `expert_default`: câu chuyên gia soạn sẵn, dùng khi AI-4 không cho được câu qua luật (SD-01). */
      source: 'ai' | 'expert_default';
      provenance: Provenance | null;
    }
  | {
      type: 'ANSWER_GRADED';
      activityKey: string;
      answerId: string;
      followupNo: number;
      /** Mức của riêng câu này (thấp nhất trên các tiêu chí có xét); `null` khi mọi tiêu chí "không xét". */
      score: PlayScore | null;
      counterproductive: boolean;
      criteria: GradedCriterion[];
      method: string;
      panelSize: number;
      costUsd: number;
    }
  | {
      type: 'ACTIVITY_CLOSED';
      activityKey: string;
      nextActivityKey: string | null;
    }
  | { type: 'HINT_VIEWED'; activityKey: string }
  | { type: 'CONTENT_FLAGGED'; activityKey: string; reason: string }
  | { type: 'FINISH_REQUESTED' }
  | { type: 'RUN_FINISHED'; endingId: string; endingType: Ending['type'] };

export type PlayEventType = PlayEvent['type'];

/* ── Trạng thái ────────────────────────────────────────────────────── */

export type PlayStage =
  /** Hoạt động đang mở, chờ câu trả lời chính. */
  | 'answering'
  /** Đã nhận câu tự luận, đang chờ quyết hỏi vặn hay đóng hoạt động. */
  | 'awaiting'
  /** NPC đã hỏi vặn, chờ người chơi trả lời. */
  | 'followup'
  /** Hết hoạt động. */
  | 'ended';

export interface PlayAnswer {
  answerId: string;
  activityKey: string;
  followupNo: number;
  kind: 'closed' | 'text';
  graded: boolean;
  score: PlayScore | null;
  counterproductive: boolean;
}

export interface PlayState {
  scenarioKey: string;
  contentVersion: number;
  band: string;
  /** Hoạt động đang mở; `null` khi đã đóng hoạt động cuối. */
  activityKey: string | null;
  stage: PlayStage;
  /** `followupNo` mà câu trả lời kế tiếp phải mang. */
  followupNo: number;
  followupsInActivity: number;
  followupTotal: number;
  /** Câu hỏi vặn đang chờ trả lời, để mở lại màn sau khi tải lại trang. */
  pendingFollowup: Extract<PlayEvent, { type: 'FOLLOWUP_ASKED' }> | null;
  hints: string[];
  answers: PlayAnswer[];
  closed: string[];
  graded: Array<Extract<PlayEvent, { type: 'ANSWER_GRADED' }>>;
  closedScores: Array<Extract<PlayEvent, { type: 'CLOSED_ANSWERED' }>>;
  flags: number;
  finishRequested: boolean;
  ending: { endingId: string; endingType: Ending['type'] } | null;
}

const blank = (): PlayState => ({
  scenarioKey: '',
  contentVersion: 0,
  band: '',
  activityKey: null,
  stage: 'ended',
  followupNo: 0,
  followupsInActivity: 0,
  followupTotal: 0,
  pendingFollowup: null,
  hints: [],
  answers: [],
  closed: [],
  graded: [],
  closedScores: [],
  flags: 0,
  finishRequested: false,
  ending: null,
});

/** Hoạt động mở đầu: `isOrigin`, hoặc hoạt động đầu tiên. */
export const originActivity = (scenario: Scenario): Activity =>
  scenario.activities.find((a) => a.isOrigin) ?? scenario.activities[0];

export function findActivity(scenario: Scenario, key: string): Activity {
  const activity = scenario.activities.find((a) => a.activity_id === key);
  if (!activity) throw new Error(`Kịch bản không có hoạt động "${key}"`);
  return activity;
}

/** Fold một sự kiện. Sự kiện không hợp với trạng thái thì bỏ qua, không ném: chuỗi đã ghi là sự thật. */
export function applyPlayEvent(
  state: PlayState,
  event: PlayEvent,
  scenario: Scenario,
): PlayState {
  switch (event.type) {
    case 'RUN_STARTED':
      return {
        ...blank(),
        scenarioKey: event.scenarioKey,
        contentVersion: event.contentVersion,
        band: event.band,
        activityKey: originActivity(scenario).activity_id,
        stage: 'answering',
      };

    case 'CLOSED_ANSWERED':
      return {
        ...state,
        answers: [
          ...state.answers,
          {
            answerId: event.answerId,
            activityKey: event.activityKey,
            followupNo: 0,
            kind: 'closed',
            graded: true,
            score: event.score,
            counterproductive: false,
          },
        ],
        closedScores: [...state.closedScores, event],
      };

    case 'TEXT_SUBMITTED':
      return {
        ...state,
        stage: 'awaiting',
        pendingFollowup: null,
        answers: [
          ...state.answers,
          {
            answerId: event.answerId,
            activityKey: event.activityKey,
            followupNo: event.followupNo,
            kind: 'text',
            graded: false,
            score: null,
            counterproductive: false,
          },
        ],
      };

    case 'FOLLOWUP_ASKED':
      if (event.activityKey !== state.activityKey) return state;
      return {
        ...state,
        stage: 'followup',
        followupNo: event.followupNo,
        followupsInActivity: state.followupsInActivity + 1,
        followupTotal: state.followupTotal + 1,
        pendingFollowup: event,
      };

    case 'ANSWER_GRADED':
      return {
        ...state,
        graded: [...state.graded, event],
        answers: state.answers.map((a) =>
          a.answerId === event.answerId
            ? {
                ...a,
                graded: true,
                score: event.score,
                counterproductive: event.counterproductive,
              }
            : a,
        ),
      };

    case 'ACTIVITY_CLOSED': {
      if (event.activityKey !== state.activityKey) return state;
      const next = event.nextActivityKey;
      return {
        ...state,
        closed: [...state.closed, event.activityKey],
        activityKey: next,
        stage: next ? 'answering' : 'ended',
        followupNo: 0,
        followupsInActivity: 0,
        pendingFollowup: null,
      };
    }

    case 'HINT_VIEWED':
      return state.hints.includes(event.activityKey)
        ? state
        : { ...state, hints: [...state.hints, event.activityKey] };

    case 'CONTENT_FLAGGED':
      return { ...state, flags: state.flags + 1 };

    case 'FINISH_REQUESTED':
      return { ...state, finishRequested: true };

    case 'RUN_FINISHED':
      return {
        ...state,
        ending: { endingId: event.endingId, endingType: event.endingType },
      };
  }
}

export function foldPlay(
  events: readonly PlayEvent[],
  scenario: Scenario,
): PlayState {
  return events.reduce(
    (state, event) => applyPlayEvent(state, event, scenario),
    blank(),
  );
}

/** Câu tự luận còn chờ panel chấm. */
export const ungraded = (state: PlayState): PlayAnswer[] =>
  state.answers.filter((a) => a.kind === 'text' && !a.graded);

/* ── Hỏi vặn: bốn điều kiện, không dựa vào điểm ────────────────────── */

/**
 * Thiết kế AI-4 §4.1 (① chốt 30/10): hỏi đào sâu khi CẢ BỐN đúng —
 *   1. hoạt động có mục tiêu đào sâu (`followup_goal`);
 *   2. chưa quá `limitFollowup` của hoạt động;
 *   3. chưa quá trần cả màn theo cấp (`followupCap`);
 *   4. đây chưa phải câu trả lời cho một câu đào sâu.
 */
export function followUpAllowed(
  activity: Activity,
  state: PlayState,
  followupNo: number,
): boolean {
  return (
    Boolean(activity.followup_goal?.trim()) &&
    state.followupsInActivity < activity.limitFollowup &&
    state.followupTotal < followupCap(state.band) &&
    followupNo === 0
  );
}

export const nextActivityKey = (activity: Activity): string | null =>
  activity.forward_to === 'END' ? null : activity.forward_to;

/* ── Câu đóng: kiểm và chấm ngay bằng khoá của chuyên gia ──────────── */

export type ClosedCheck =
  | { ok: true; score: PlayScore; why: string; quote: string }
  | { ok: false; reason: string };

/**
 * Kiểm rồi chấm câu CHOICE, ORDERING, PRIORITIZING. Không bao giờ trừ điểm vì
 * xem gợi ý (FR-13, Q5): gợi ý chỉ được ghi nhận.
 */
export function scoreClosed(
  activity: Activity,
  selection: unknown,
): ClosedCheck {
  const items = (activity.items ?? []).map((i) => i.item_id);
  const text = (id: string) =>
    activity.items?.find((i) => i.item_id === id)?.text ?? id;

  if (activity.type === 'CHOICE') {
    const index = typeof selection === 'string' ? Number(selection) : NaN;
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= (activity.options?.length ?? 0)
    )
      return { ok: false, reason: 'Chọn đúng một hướng xử lý.' };
    const { anchor, why } = gradeChoice(activity, index);
    return {
      ok: true,
      score: SCORE_OF_ANCHOR[anchor],
      why,
      quote: activity.options?.[index] ?? '',
    };
  }

  if (activity.type === 'FREETEXT')
    return { ok: false, reason: 'Hoạt động này cần câu tự viết.' };

  if (!Array.isArray(selection) || selection.some((k) => typeof k !== 'string'))
    return { ok: false, reason: 'Danh sách gửi lên sai dạng.' };
  const keys = selection as string[];
  if (new Set(keys).size !== keys.length)
    return { ok: false, reason: 'Danh sách gửi lên bị trùng.' };
  if (keys.some((k) => !items.includes(k)))
    return { ok: false, reason: 'Có mục không thuộc hoạt động này.' };

  if (activity.type === 'ORDERING') {
    if (keys.length !== items.length)
      return { ok: false, reason: 'Phải sắp đủ mọi bước.' };
    const { anchor, why } = gradeOrdering(activity, keys);
    return {
      ok: true,
      score: SCORE_OF_ANCHOR[anchor],
      why,
      quote: keys.map((k, i) => `${i + 1}. ${text(k)}`).join(' · '),
    };
  }

  const pickCount = activity.pick_count ?? 0;
  if (keys.length !== pickCount)
    return { ok: false, reason: `Phải chọn đúng ${pickCount} mục.` };
  const { anchor, why } = gradePrioritizing(activity, keys);
  return {
    ok: true,
    score: SCORE_OF_ANCHOR[anchor],
    why,
    quote: keys.map(text).join(' · '),
  };
}

/** Thứ tự xáo cố định của ORDERING: mọi người cùng thấy một đề, không lộ đáp án. */
export function orderingShuffle(activity: Activity): string[] {
  const items = activity.items ?? [];
  const seed = [2, 0, 4, 1, 3].filter((i) => i < items.length);
  for (let i = 0; i < items.length; i++) if (!seed.includes(i)) seed.push(i);
  return seed.map((i) => items[i].item_id);
}

/* ── Nhân vật ──────────────────────────────────────────────────────── */

/** "Hà: 'câu nói'" → người nói, đối chiếu với `cast`. */
export function speakerOf(
  scenario: Scenario,
  line: string,
): { npcKey: string; name: string } | null {
  const name = line.match(/^([^:]{1,14}):/)?.[1].trim();
  if (!name) return null;
  const key = normalizeVi(name);
  const member = scenario.cast.find((c) => normalizeVi(c.npc_id) === key);
  return { npcKey: member?.npc_id ?? key, name };
}

/** Tên có dấu của NPC, đọc từ tiền tố các câu thoại trong kịch bản ("Hà: …"). */
export function npcDisplayName(scenario: Scenario, npcKey: string): string {
  for (const activity of scenario.activities)
    for (const line of [
      activity.npc_line,
      ...activity.hints.map((h) => h.text),
    ]) {
      const speaker = line ? speakerOf(scenario, line) : null;
      if (speaker?.npcKey === npcKey) return speaker.name;
    }
  return npcKey.charAt(0).toUpperCase() + npcKey.slice(1);
}

/* ── Kết quả từng hoạt động ────────────────────────────────────────── */

/** Một mẩu bằng chứng cho một kỹ năng ở một hoạt động — cùng hình với `RunEvidence` của profile. */
export interface PlayEvidence {
  activityKey: string;
  skill: string;
  skillType: SkillType;
  score: PlayScore;
  counterproductive: boolean;
  why: string;
  quote: string | null;
  highDisagreement: boolean;
}

export interface ActivityResult {
  activityKey: string;
  /** `null`: chưa chấm xong, hoặc mọi tiêu chí là "không xét". */
  score: PlayScore | null;
  counterproductiveCount: number;
  hintUsed: boolean;
  evidence: PlayEvidence[];
}

/**
 * Điểm một hoạt động.
 *
 * - Mỗi tiêu chí lấy mức CAO NHẤT qua câu chính và câu trả lời hỏi vặn: hỏi
 *   vặn là để người chơi nói rõ ý, không để bị phạt hai lần (luật prototype,
 *   giữ tới khi D-95 chốt luật gộp).
 * - Mức của hoạt động là mức THẤP NHẤT trên các tiêu chí có xét — cùng quy
 *   ước bản demo của web đang dùng. TẠM: thiết kế chưa nói cách quy nhiều
 *   tiêu chí về một mức.
 */
export function activityResults(
  state: PlayState,
  scenario: Scenario,
): ActivityResult[] {
  return scenario.activities
    .filter((a) => state.closed.includes(a.activity_id))
    .map((activity) => {
      const key = activity.activity_id;
      const hintUsed = state.hints.includes(key);
      const closed = state.closedScores.find((c) => c.activityKey === key);
      if (closed) {
        const observe = activity.observes[0];
        return {
          activityKey: key,
          score: closed.score,
          counterproductiveCount: 0,
          hintUsed,
          evidence: [
            {
              activityKey: key,
              skill: observe.skill,
              skillType: observe.skill_type,
              score: closed.score,
              counterproductive: false,
              why: closed.why,
              quote: closed.quote,
              highDisagreement: false,
            },
          ],
        };
      }

      const grades = state.graded.filter((g) => g.activityKey === key);
      const best = new Map<string, GradedCriterion>();
      let counterproductiveCount = 0;
      for (const grade of grades)
        for (const c of grade.criteria) {
          if (c.counterproductive) counterproductiveCount++;
          const prev = best.get(c.key);
          if (!prev || (c.score ?? -1) > (prev.score ?? -1)) best.set(c.key, c);
        }

      const evidence: PlayEvidence[] = [...best.values()]
        .filter(
          (c): c is GradedCriterion & { score: PlayScore } => c.score !== null,
        )
        .map((c) => ({
          activityKey: key,
          skill: c.skill,
          skillType: c.skillType,
          score: c.score,
          counterproductive: c.counterproductive,
          why: c.rationale,
          quote: c.quote || null,
          highDisagreement: c.highDisagreement,
        }));
      const scores = evidence.map((e) => e.score);
      return {
        activityKey: key,
        score: scores.length > 0 ? (Math.min(...scores) as PlayScore) : null,
        counterproductiveCount,
        hintUsed,
        evidence,
      };
    });
}

/**
 * Chọn kết cục theo điều kiện của kịch bản (`min_plus2`, `max_minus1`), đếm
 * trên bằng chứng: mức 2 là "+2", mức 0 là "−1". Kết cục SECRET (`extra`)
 * chưa mở được ở luồng này: điều kiện "chạm bí mật" của prototype là so khớp
 * từ khoá, còn thiết kế mới chờ game design (D-101).
 */
export function pickPlayEnding(
  scenario: Scenario,
  results: readonly ActivityResult[],
): Ending {
  const evidence = results.flatMap((r) => r.evidence);
  const plus2 = evidence.filter((e) => e.score === 2).length;
  const minus1 = evidence.filter((e) => e.score === 0).length;
  const found = [...scenario.endings]
    .sort((a, b) => a.priority - b.priority)
    .find((ending) => {
      const c = ending.condition;
      if (c.extra) return false;
      if (c.min_plus2 != null && plus2 < c.min_plus2) return false;
      if (c.max_minus1 != null && minus1 > c.max_minus1) return false;
      return true;
    });
  return found ?? scenario.endings[scenario.endings.length - 1];
}
