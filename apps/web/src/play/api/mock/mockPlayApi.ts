/**
 * `PlayApi` giả, chạy trọn trong trình duyệt — để demo màn chơi khi máy chủ
 * chưa có các endpoint `/runs…`.
 *
 * Nó đóng vai máy chủ theo đúng hình dạng của hợp đồng: câu đóng chấm ngay
 * (200 `AnswerResult`), câu tự luận trả 202 rồi kết quả về qua luồng sự kiện
 * (`answer.graded` → `followup.asked` hoặc `activity.closed`), kết thúc màn
 * trả 202 rồi `summary.ready`.
 *
 * Những gì là GIẢ và phải nói rõ khi demo:
 * - Câu tự luận chấm bằng so khớp từ khoá của game-core (`keywordGrader`),
 *   không phải hội đồng ba judge. Không có điểm phạt phản tác dụng.
 * - Một kịch bản duy nhất, không có chuyện xen ngang, không mở cấp.
 * - Trạng thái nằm trong `sessionStorage` của tab.
 *
 * Luật chơi lấy từ `scenarioEngine` của game-core, trừ hai chỗ theo quyết định
 * mới (Q5): thang 0/1/2 thay cho +2/0/-1, và xem gợi ý không hạ điểm — nên
 * gợi ý không bao giờ được đưa vào engine.
 */
import {
  anchorRank,
  findFollowupLine,
  keywordGrader,
  makeDeps,
  normalizeVi,
  runReducer,
  startRun as startEngine,
  stripNpcPrefix,
  type Activity,
  type EngineDeps,
  type RunAction,
  type RunState,
  type Scenario,
} from '@datn/game-core';
import { PlayApiError, type PlayApi } from '../contract';
import type {
  ActivityView,
  AnswerInput,
  AnswerResult,
  FlagContentInput,
  JobAccepted,
  PlayStreamEvent,
  Problem,
  Run,
  ScenarioSummary,
  Score,
  StreamPayloads,
} from '../types';
import { DEMO_SCENARIO_KEY, demoScenario } from './demoScenario';

/* ── Trạng thái lưu ────────────────────────────────────────────────── */

type StoredAnswer =
  | { kind: 'result'; result: AnswerResult }
  | { kind: 'job'; job: JobAccepted; result: AnswerResult | null };

interface QueuedEvent {
  due: number;
  event: PlayStreamEvent;
}

interface MockRun {
  id: string;
  taskId: string;
  enrolmentId: string;
  status: NonNullable<Run['status']>;
  startedAt: string;
  engine: RunState;
  /** Hoạt động đã xem gợi ý. Chỉ để ghi nhận và đếm ở tổng kết. */
  hints: string[];
  answers: Record<string, StoredAnswer>;
  flags: FlagContentInput[];
  summary: ScenarioSummary | null;
  /** Câu tự luận đang chờ chấm thì chưa nhận câu mới. */
  grading: boolean;
  /** Sự kiện chưa giao, giữ lại để tải lại trang không mất. */
  outbox: QueuedEvent[];
}

type Db = Record<string, MockRun>;

export interface MockPlayApiOptions {
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  /** Thời gian giả của một vòng mạng. `0` thì trả ngay (dùng cho test). */
  networkMs?: number;
  /** Thời gian giả của việc chấm tự luận và soạn tổng kết. */
  gradingMs?: number;
  summaryMs?: number;
  /** Giả nhà cung cấp model chậm: phát `provider.delay` trước kết quả. */
  slowProvider?: boolean;
  now?: () => number;
  uuid?: () => string;
}

const STORAGE_KEY = 'jobquest.mock.play.v1';

/* ── Tiện ích ──────────────────────────────────────────────────────── */

const problem = (
  status: number,
  code: string,
  title: string,
  errors?: Problem['errors'],
): PlayApiError =>
  new PlayApiError({ type: 'about:blank', status, code, title, errors });

const toScore = (rank: number): Score =>
  Math.max(0, Math.min(2, rank)) as Score;

const TASK_TYPE: Record<
  Activity['type'],
  NonNullable<ActivityView['taskType']>
> = {
  CHOICE: 'CHOICE',
  ORDERING: 'ORDERING',
  PRIORITIZING: 'PRIORITIZING',
  FREETEXT: 'FREE_TEXT',
};

/** "Hà: 'câu nói'" → người nói, đối chiếu với `cast`. */
function speakerOf(
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
function npcName(scenario: Scenario, npcKey: string): string {
  for (const activity of scenario.activities) {
    for (const line of [
      activity.npc_line,
      ...activity.hints.map((h) => h.text),
    ]) {
      const speaker = line ? speakerOf(scenario, line) : null;
      if (speaker?.npcKey === npcKey) return speaker.name;
    }
  }
  return npcKey.charAt(0).toUpperCase() + npcKey.slice(1);
}

const activityOf = (scenario: Scenario, id: string): Activity => {
  const activity = scenario.activities.find((a) => a.activity_id === id);
  if (!activity) throw problem(404, 'NOT_FOUND', `Activity ${id} not found`);
  return activity;
};

/** Mức của một hoạt động: mức thấp nhất trên các kỹ năng nó quan sát. */
function activityScore(engine: RunState, activityId: string): Score | null {
  const ranks = engine.evidence
    .filter((e) => e.activityId === activityId)
    .map((e) => anchorRank[e.anchor]);
  return ranks.length ? toScore(Math.min(...ranks)) : null;
}

/* ── Bản giả ───────────────────────────────────────────────────────── */

export function createMockPlayApi(options: MockPlayApiOptions = {}): PlayApi {
  const storage =
    options.storage ??
    (typeof sessionStorage === 'undefined' ? memoryStorage() : sessionStorage);
  const networkMs = options.networkMs ?? 180;
  const gradingMs = options.gradingMs ?? 1600;
  const summaryMs = options.summaryMs ?? 1400;
  const slowProvider = options.slowProvider ?? false;
  const now = options.now ?? Date.now;
  const uuid = options.uuid ?? (() => crypto.randomUUID());

  const scenario = demoScenario();
  const deps: EngineDeps = makeDeps(scenario, {
    followupLine: (activityId) =>
      findFollowupLine(DEMO_SCENARIO_KEY, activityId),
    grader: keywordGrader,
    // Bản demo không có chuyện xen ngang: mọi `chance` < 1 đều trượt.
    rng: () => 1,
    now,
  });

  const listeners = new Set<(event: PlayStreamEvent) => void>();
  let pumpTimer: ReturnType<typeof setTimeout> | null = null;

  /* ── Lưu trữ ── */

  const load = (): Db => {
    try {
      return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as Db;
    } catch {
      return {};
    }
  };
  const save = (db: Db) => storage.setItem(STORAGE_KEY, JSON.stringify(db));

  function withRun<T>(runId: string, fn: (run: MockRun) => T): T {
    const db = load();
    const run = db[runId];
    if (!run) throw problem(404, 'NOT_FOUND', `Run ${runId} not found`);
    const out = fn(run);
    save(db);
    return out;
  }

  const network = async () => {
    if (networkMs > 0) await new Promise((r) => setTimeout(r, networkMs));
  };

  /* ── Luồng sự kiện: giao khi có người nghe, giữ lại khi chưa ── */

  function pump() {
    pumpTimer = null;
    if (listeners.size === 0) return;
    const db = load();
    const due: PlayStreamEvent[] = [];
    let next = Infinity;
    for (const run of Object.values(db)) {
      const keep: QueuedEvent[] = [];
      for (const queued of run.outbox) {
        if (queued.due <= now()) {
          due.push(queued.event);
          const type = queued.event.type;
          if (type === 'followup.asked' || type === 'activity.closed')
            run.grading = false;
        } else {
          keep.push(queued);
          next = Math.min(next, queued.due);
        }
      }
      run.outbox = keep;
    }
    save(db);
    for (const event of due) listeners.forEach((l) => l(event));
    if (next !== Infinity) armPump(next - now());
  }

  function armPump(delay: number) {
    if (pumpTimer) clearTimeout(pumpTimer);
    pumpTimer = setTimeout(pump, Math.max(0, delay));
  }

  function enqueue<K extends keyof StreamPayloads>(
    run: MockRun,
    delay: number,
    type: K,
    payload: StreamPayloads[K],
    jobId?: string,
  ) {
    run.outbox.push({
      due: now() + delay,
      event: { type, runId: run.id, jobId, payload } as PlayStreamEvent,
    });
  }

  /* ── Ánh xạ sang kiểu của hợp đồng ── */

  function toRun(run: MockRun): Run {
    const { job, context, cast } = scenario;
    return {
      id: run.id,
      status: run.status,
      isPlaytest: false,
      releaseVersion: `${DEMO_SCENARIO_KEY}@demo`,
      intro: job.user_context ?? '',
      context: {
        role: `${job.title_vn} · ${job.role_name_vn}`,
        team: cast.map((c) => c.role_in_scene).join('\n'),
        situation: context.situation ?? '',
        stakes: context.stakes ?? '',
      },
      currentActivityKey:
        run.engine.phase === 'ended' ? null : run.engine.activityId,
      startedAt: run.startedAt,
    };
  }

  function toActivityView(run: MockRun): ActivityView {
    const activity = activityOf(scenario, run.engine.activityId);
    const npc = activity.npc_line
      ? speakerOf(scenario, activity.npc_line)
      : null;

    let items: ActivityView['items'];
    if (activity.type === 'CHOICE') {
      items = (activity.options ?? []).map((text, i) => ({
        key: String(i),
        text,
      }));
    } else if (activity.type === 'ORDERING') {
      // Thứ tự xáo cố định của engine, để mọi người cùng thấy một đề.
      items = (run.engine.order ?? []).map((id) => {
        const item = activity.items?.find((x) => x.item_id === id);
        return { key: id, text: item?.text ?? id };
      });
    } else if (activity.type === 'PRIORITIZING') {
      items = (activity.items ?? []).map((item) => ({
        key: item.item_id,
        text: item.text,
        ...(item.note ? { note: item.note } : {}),
      }));
    }

    return {
      activityKey: activity.activity_id,
      taskType: TASK_TYPE[activity.type],
      setup: activity.setup,
      ...(npc && activity.npc_line
        ? {
            npc: {
              npcKey: npc.npcKey,
              name: npc.name,
              line: stripNpcPrefix(activity.npc_line),
            },
          }
        : {}),
      ...(activity.input_prompt ? { inputPrompt: activity.input_prompt } : {}),
      ...(items ? { items } : {}),
      ...(activity.type === 'PRIORITIZING'
        ? { pickCount: activity.pick_count ?? 0 }
        : {}),
      hintAvailable: activity.hints.length > 0,
      randomEvent: null,
    };
  }

  /* ── Trả lời ── */

  const step = (run: MockRun, action: RunAction) => {
    run.engine = runReducer(run.engine, action, deps);
  };

  function validateClosed(activity: Activity, input: AnswerInput): RunAction {
    const invalid = (reason: string) =>
      problem(422, 'ANSWER_INVALID', 'Answer breaks the activity rules', [
        { field: 'selection', reason },
      ]);
    const keys = (activity.items ?? []).map((i) => i.item_id);
    const selection = input.selection;

    if (activity.type === 'CHOICE') {
      const index = Number(selection);
      if (
        typeof selection !== 'string' ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= (activity.options?.length ?? 0)
      )
        throw invalid('Chọn đúng một hướng xử lý.');
      return { type: 'ANSWER_CHOICE', optionIndex: index };
    }

    if (
      !Array.isArray(selection) ||
      new Set(selection).size !== selection.length
    )
      throw invalid('Danh sách gửi lên bị trùng hoặc sai dạng.');
    if (selection.some((key) => !keys.includes(key)))
      throw invalid('Có mục không thuộc hoạt động này.');

    if (activity.type === 'ORDERING') {
      if (selection.length !== keys.length)
        throw invalid('Phải sắp đủ mọi bước.');
      return { type: 'ANSWER_ORDERING' };
    }

    const pickCount = activity.pick_count ?? 0;
    if (selection.length !== pickCount)
      throw invalid(`Phải chọn đúng ${pickCount} mục.`);
    return { type: 'ANSWER_PRIORITIZING' };
  }

  function answerClosed(
    run: MockRun,
    activity: Activity,
    input: AnswerInput,
  ): AnswerResult {
    const action = validateClosed(activity, input);
    const selection = input.selection as string[];
    if (activity.type === 'ORDERING')
      run.engine = { ...run.engine, order: selection };
    if (activity.type === 'PRIORITIZING')
      run.engine = { ...run.engine, picked: selection };

    step(run, action);
    const score = activityScore(run.engine, activity.activity_id) ?? 0;
    step(run, { type: 'CONTINUE' });

    return {
      answerId: input.answerId,
      score,
      hintUsed: run.hints.includes(activity.activity_id),
      closingLine: activity.closing_prompt,
      nextActivityKey:
        activity.forward_to === 'END' ? null : activity.forward_to,
    };
  }

  function answerText(
    run: MockRun,
    activity: Activity,
    input: AnswerInput,
  ): JobAccepted {
    const text = (input.text ?? '').trim();
    if (text.length < 2 || text.length > 4000)
      throw problem(422, 'ANSWER_INVALID', 'Answer breaks the activity rules', [
        { field: 'text', reason: 'Câu trả lời phải dài từ 2 tới 4000 ký tự.' },
      ]);

    const isFollowup = run.engine.phase === 'followup';
    const expectedNo = isFollowup ? run.engine.followupUsed : 0;
    if ((input.followupNo ?? 0) !== expectedNo)
      throw problem(409, 'INVALID_TRANSITION', 'Not the current follow-up');

    // Mức của riêng câu này (trước khi engine giữ câu tốt hơn ở lượt đào sâu).
    const ranks = activity.observes.map(
      (o) =>
        anchorRank[
          keywordGrader.grade({
            text,
            scenarioKey: DEMO_SCENARIO_KEY,
            activityId: activity.activity_id,
            skill: o.skill,
          })
        ],
    );
    const score = toScore(Math.min(...ranks));

    step(run, { type: 'ANSWER_TEXT', text });

    const jobId = uuid();
    const job: JobAccepted = {
      jobId,
      answerId: input.answerId,
      streamEvent: 'answer.graded',
    };

    let t = gradingMs;
    if (slowProvider) {
      enqueue(
        run,
        Math.round(gradingMs * 0.6),
        'provider.delay',
        { waitingFor: 'grading' },
        jobId,
      );
      t = gradingMs * 3;
    }
    enqueue(
      run,
      t,
      'answer.graded',
      {
        answerId: input.answerId,
        activityKey: activity.activity_id,
        followupNo: expectedNo,
        score,
        counterproductive: false,
      },
      jobId,
    );

    const result: AnswerResult = {
      answerId: input.answerId,
      score,
      hintUsed: run.hints.includes(activity.activity_id),
    };

    if (run.engine.phase === 'followup') {
      const line = findFollowupLine(DEMO_SCENARIO_KEY, activity.activity_id);
      if (line) {
        enqueue(run, t + 500, 'followup.asked', {
          activityKey: activity.activity_id,
          followupNo: run.engine.followupUsed,
          npcKey: line.who,
          name: npcName(scenario, line.who),
          question: line.text,
        });
      }
    } else {
      const nextActivityKey =
        activity.forward_to === 'END' ? null : activity.forward_to;
      enqueue(run, t + 500, 'activity.closed', {
        activityKey: activity.activity_id,
        closingLine: activity.closing_prompt,
        nextActivityKey,
      });
      step(run, { type: 'CONTINUE' });
      result.closingLine = activity.closing_prompt;
      result.nextActivityKey = nextActivityKey;
    }

    // Còn chấm thì chưa nhận câu mới; `pump` gỡ cờ khi giao sự kiện cuối.
    run.grading = true;
    run.answers[input.answerId] = { kind: 'job', job, result };
    return job;
  }

  /* ── Tổng kết ── */

  function buildSummary(run: MockRun): ScenarioSummary {
    const { engine } = run;
    const ending =
      engine.ending ?? scenario.endings[scenario.endings.length - 1];

    const levels = scenario.activities.map((a) =>
      activityScore(engine, a.activity_id),
    );
    const count = (level: Score) => levels.filter((l) => l === level).length;

    const feedback = engine.evidence
      .map((e) => {
        const activity = activityOf(scenario, e.activityId);
        return `${activity.summary}: ${e.why}`;
      })
      .join('\n');

    const guidance = engine.evidence
      .filter((e) => anchorRank[e.anchor] < 2)
      .map((e) => {
        const activity = activityOf(scenario, e.activityId);
        const observe = activity.observes.find((o) => o.skill === e.skill);
        return `${e.skill}: ${observe?.anchors['+2'] ?? ''}`;
      })
      .join('\n');

    const points = { expertise: 0, softSkill: 0 };
    for (const e of engine.evidence) {
      const rank = anchorRank[e.anchor];
      if (e.skillType === 'hard') points.expertise += rank;
      else points.softSkill += rank;
    }

    return {
      runId: run.id,
      scenarioTitle: scenario.scenario_title,
      ending: {
        type: ending.type,
        text: ending.text,
        reveals: ending.reveals ?? null,
      },
      result:
        `Hoàn thành ${scenario.activities.length} hoạt động: ` +
        `${count(2)} làm tốt (mức 2), ${count(1)} đạt (mức 1), ${count(0)} chưa đạt (mức 0).`,
      feedback,
      guidance:
        guidance ||
        'Bạn đã làm tốt mọi hoạt động. Thử một nhiệm vụ khác ở cấp này để mở cấp kế tiếp.',
      pointsEarned: points,
      hintsUsed: run.hints.length,
      levelUnlocked: false,
      suggestedTasks: [],
      finishedAt: new Date(now()).toISOString(),
    };
  }

  /* ── Hợp đồng ── */

  const api: PlayApi = {
    mode: 'mock',

    async startRun(input) {
      await network();
      if (input.taskId !== DEMO_SCENARIO_KEY)
        throw problem(
          409,
          'SCENARIO_UNAVAILABLE',
          'Bản demo chỉ có một kịch bản',
        );

      const db = load();
      const existing = Object.values(db).find(
        (r) => r.taskId === input.taskId && r.status === 'IN_PROGRESS',
      );
      if (existing) return toRun(existing);

      const run: MockRun = {
        id: uuid(),
        taskId: input.taskId,
        enrolmentId: input.enrolmentId,
        status: 'IN_PROGRESS',
        startedAt: new Date(now()).toISOString(),
        engine: startEngine(DEMO_SCENARIO_KEY, deps),
        hints: [],
        answers: {},
        flags: [],
        summary: null,
        grading: false,
        outbox: [],
      };
      db[run.id] = run;
      save(db);
      return toRun(run);
    },

    async getRun(runId) {
      await network();
      return withRun(runId, toRun);
    },

    async getCurrentActivity(runId) {
      await network();
      return withRun(runId, (run) => {
        if (run.engine.phase === 'ended')
          throw problem(409, 'INVALID_TRANSITION', 'Run has no activity left');
        return toActivityView(run);
      });
    },

    async submitAnswer(runId, input) {
      await network();
      try {
        return withRun(
          runId,
          (run): Awaited<ReturnType<PlayApi['submitAnswer']>> => {
            const stored = run.answers[input.answerId];
            if (stored) {
              // NFR-04: gửi lại cùng `answerId` thì nhận lại đúng kết quả cũ.
              if (stored.kind === 'result')
                return { status: 200, body: stored.result };
              if (!run.grading && stored.result)
                return { status: 200, body: stored.result };
              return { status: 202, body: stored.job };
            }

            if (run.status !== 'IN_PROGRESS' || run.engine.phase === 'ended')
              throw problem(409, 'INVALID_TRANSITION', 'Run is not open');
            if (input.activityKey !== run.engine.activityId)
              throw problem(
                409,
                'INVALID_TRANSITION',
                'Not the current activity',
              );
            if (run.grading)
              throw problem(
                409,
                'INVALID_TRANSITION',
                'Previous answer is still being graded',
              );

            const activity = activityOf(scenario, run.engine.activityId);
            if (
              activity.type === 'FREETEXT' ||
              run.engine.phase === 'followup'
            ) {
              const job = answerText(run, activity, input);
              return { status: 202 as const, body: job };
            }

            const result = answerClosed(run, activity, input);
            run.answers[input.answerId] = { kind: 'result', result };
            return { status: 200 as const, body: result };
          },
        );
      } finally {
        armPump(0);
      }
    },

    async viewHint(runId, activityKey) {
      await network();
      return withRun(runId, (run) => {
        if (activityKey !== run.engine.activityId)
          throw problem(409, 'INVALID_TRANSITION', 'Not the current activity');
        const hint = activityOf(scenario, activityKey).hints[0];
        if (!hint) throw problem(404, 'NOT_FOUND', 'This activity has no hint');
        if (!run.hints.includes(activityKey)) run.hints.push(activityKey);
        const speaker = speakerOf(scenario, hint.text);
        return {
          npcKey: speaker?.npcKey ?? '',
          text: stripNpcPrefix(hint.text),
          hintUsed: true as const,
        };
      });
    },

    async flagContent(runId, input) {
      await network();
      withRun(runId, (run) => {
        run.flags.push(input);
      });
    },

    async finishRun(runId) {
      await network();
      try {
        return withRun(
          runId,
          (run): Awaited<ReturnType<PlayApi['finishRun']>> => {
            if (run.summary) return { status: 200 as const, body: run.summary };
            if (run.engine.phase !== 'ended' || run.grading)
              throw problem(409, 'INVALID_TRANSITION', 'Run is not over yet');

            run.summary = buildSummary(run);
            run.status = 'FINISHED';
            const jobId = uuid();
            if (slowProvider)
              enqueue(
                run,
                Math.round(summaryMs * 0.6),
                'provider.delay',
                { waitingFor: 'summary' },
                jobId,
              );
            enqueue(
              run,
              slowProvider ? summaryMs * 3 : summaryMs,
              'summary.ready',
              {},
              jobId,
            );
            return {
              status: 202 as const,
              body: { jobId, streamEvent: 'summary.ready' },
            };
          },
        );
      } finally {
        armPump(0);
      }
    },

    async getRunSummary(runId) {
      await network();
      return withRun(runId, (run) => {
        if (!run.summary) throw problem(404, 'NOT_FOUND', 'Summary not ready');
        return run.summary;
      });
    },

    openEventStream(onEvent) {
      listeners.add(onEvent);
      armPump(0);
      return () => {
        listeners.delete(onEvent);
      };
    },

    async loadRelease() {
      await network();
      return scenario;
    },
  };

  return api;
}

function memoryStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}
