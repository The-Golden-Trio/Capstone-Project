/**
 * Máy chạy màn chơi kịch bản — reducer thuần.
 *
 * Mọi luật chơi nằm ở đây: chấm, hạ trần khi xem gợi ý, mở lượt đào sâu,
 * gieo sự kiện xen ngang, chọn kết cục. Không import React, không đọc DOM,
 * không gọi `Math.random` trực tiếp (rng được tiêm vào) — nên một lượt chơi
 * sai có thể tái hiện lại nguyên vẹn mà không cần trình duyệt.
 */
import type {
  Activity,
  Anchor,
  Ending,
  Observe,
  RandomEvent,
  Scenario,
  SkillType,
} from '../data/schema.js';
import { POINTS } from './bands.js';
import { followupCap, type FollowupLine } from './followups.js';
import { defaultTextGrader } from './grading/keywordGrader.js';
import {
  gradeChoice,
  gradeOrdering,
  gradePrioritizing,
} from './grading/structuredGrading.js';
import { anchorRank, type TextGrader } from './grading/types.js';

/* ── Trạng thái ────────────────────────────────────────────────────── */

export type RunPhase =
  /** Đang ở câu chính của hoạt động. */
  | 'main'
  /** NPC hỏi vặn thêm một lượt. */
  | 'followup'
  /** Đã trả lời xong, đang đọc lời kết của hoạt động. */
  | 'closing'
  /** Có chuyện xen ngang. */
  | 'event'
  /** Hết màn. */
  | 'ended';

export interface Evidence {
  activityId: string;
  skill: string;
  /** Cứng hay mềm — chép từ mốc quan sát, để tổng kết tách được hai nhóm. */
  skillType: SkillType;
  anchor: Anchor;
  /** `true` khi mốc +2 bị hạ xuống 0 vì người chơi đã xem gợi ý. */
  capped: boolean;
  why: string;
  quote: string | null;
  timeout: boolean;
}

export interface ChatLine {
  from: 'player' | 'npc';
  /** Tên ngắn hiện trên avatar, chỉ dùng cho `npc`. */
  name?: string;
  text: string;
}

export interface RunState {
  scenarioKey: string;
  activityId: string;
  phase: RunPhase;
  /** Số lượt đào sâu đã dùng trong hoạt động hiện tại. */
  followupUsed: number;
  /** Số lượt đào sâu đã dùng trong cả màn. */
  followupTotal: number;
  hintsUsed: string[];
  eventsFired: string[];
  plus2: number;
  minus1: number;
  evidence: Evidence[];
  log: ChatLine[];
  /** Người chơi đã tự chạm tới "bí mật" của kịch bản chưa. */
  secret: boolean;
  ending: Ending | null;
  /** Thứ tự hiện tại của ORDERING. */
  order: string[] | null;
  /** Các mục đang chọn của PRIORITIZING. */
  picked: string[] | null;
  pendingEvent: RandomEvent | null;
  /** Mốc hết giờ (epoch ms) của hoạt động có đếm ngược. */
  deadline: number | null;
}

export type RunAction =
  | { type: 'ANSWER_CHOICE'; optionIndex: number }
  | { type: 'ANSWER_TEXT'; text: string }
  | { type: 'ANSWER_ORDERING' }
  | { type: 'ANSWER_PRIORITIZING' }
  | { type: 'MOVE_ITEM'; index: number; direction: -1 | 1 }
  | { type: 'TOGGLE_PICK'; itemId: string }
  | { type: 'USE_HINT' }
  | { type: 'TIMEOUT' }
  | { type: 'CONTINUE' };

/**
 * Mọi thứ engine cần từ bên ngoài, kể cả chính kịch bản.
 *
 * Trước đây engine tự tra kịch bản từ bộ dữ liệu nạp sẵn trong mã. Nội dung
 * giờ nằm trong database, nên nó phải được ĐƯA VÀO chứ không đi tìm — và đó
 * cũng là điều mà cơ chế chấm điểm bằng chạy lại vốn cần: máy chủ chạy lại
 * một lượt chơi bằng đúng bản kịch bản đã ghim cho lượt ấy, không phải bản
 * mới nhất.
 */
export interface EngineDeps {
  /** Kịch bản của lượt chơi này. */
  scenario: Scenario;
  /** Lời NPC cho lượt đào sâu; có lời mới được mở lượt đào sâu. */
  followupLine: (activityId: string) => FollowupLine | undefined;
  grader: TextGrader;
  /** Trả số trong [0,1). Tiêm vào để lượt chơi tái hiện được. */
  rng: () => number;
  now: () => number;
}

/** Bộ phụ thuộc mặc định cho một kịch bản, cho phép đè từng phần. */
export const makeDeps = (
  scenario: Scenario,
  over: Partial<Omit<EngineDeps, 'scenario'>> = {},
): EngineDeps => ({
  scenario,
  followupLine: () => undefined,
  grader: defaultTextGrader,
  rng: Math.random,
  now: Date.now,
  ...over,
});

/* ── Truy cập kịch bản ─────────────────────────────────────────────── */

export function currentActivity(
  state: RunState,
  scenario: Scenario,
): Activity {
  const activity = scenario.activities.find(
    (a) => a.activity_id === state.activityId,
  );
  if (!activity)
    throw new Error(
      `Kịch bản "${state.scenarioKey}" không có hoạt động "${state.activityId}"`,
    );
  return activity;
}

export const activityIndex = (state: RunState, scenario: Scenario): number =>
  scenario.activities.findIndex((a) => a.activity_id === state.activityId);

/** Tên ngắn của một NPC, để hiện trên avatar. */
export function npcShortName(scenario: Scenario, npcId: string): string {
  const member = scenario.cast.find((c) => c.npc_id === npcId);
  if (!member) return npcId;
  return member.role_in_scene.split(/[,·]/)[0].trim().split(/\s+/)[0].slice(0, 4);
}

/** Tổng điểm kỹ năng thu được trong màn chơi này. */
export const pointsEarned = (state: RunState): number =>
  state.evidence.reduce((sum, e) => sum + POINTS[e.anchor], 0);

/**
 * Điểm tách theo kỹ năng cứng / mềm.
 *
 * Nhận mảng bằng chứng thay vì `RunState` để máy chủ dùng được với hàng đã
 * lưu trong cơ sở dữ liệu — cùng một phép cộng cho màn tổng kết và hồ sơ.
 */
export const pointsByType = (
  evidence: ReadonlyArray<Pick<Evidence, 'anchor' | 'skillType'>>,
): Record<SkillType, number> =>
  evidence.reduce(
    (sum, e) => {
      sum[e.skillType] += POINTS[e.anchor];
      return sum;
    },
    { hard: 0, soft: 0 } as Record<SkillType, number>,
  );

/* ── Khởi tạo ──────────────────────────────────────────────────────── */

/** Xáo cố định, không random: cùng một hoạt động luôn mở ra cùng thứ tự. */
function shuffledOrder(activity: Activity): string[] {
  const items = activity.items ?? [];
  const seed = [2, 0, 4, 1, 3].filter((i) => i < items.length);
  for (let i = 0; i < items.length; i++) if (!seed.includes(i)) seed.push(i);
  return seed.map((i) => items[i].item_id);
}

function enterActivity(
  state: RunState,
  activityId: string,
  deps: EngineDeps,
): RunState {
  const next: RunState = {
    ...state,
    activityId,
    phase: 'main',
    followupUsed: 0,
    log: [],
    order: null,
    picked: null,
    deadline: null,
  };
  const activity = currentActivity(next, deps.scenario);

  if (activity.type === 'ORDERING') next.order = shuffledOrder(activity);
  if (activity.type === 'PRIORITIZING') next.picked = [];
  if (activity.quick_action && activity.time_limit_seconds)
    next.deadline = deps.now() + activity.time_limit_seconds * 1000;

  return next;
}

export function startRun(scenarioKey: string, deps: EngineDeps): RunState {
  const origin =
    deps.scenario.activities.find((a) => a.isOrigin) ??
    deps.scenario.activities[0];

  const blank: RunState = {
    scenarioKey,
    activityId: origin.activity_id,
    phase: 'main',
    followupUsed: 0,
    followupTotal: 0,
    hintsUsed: [],
    eventsFired: [],
    plus2: 0,
    minus1: 0,
    evidence: [],
    log: [],
    secret: false,
    ending: null,
    order: null,
    picked: null,
    pendingEvent: null,
    deadline: null,
  };

  return enterActivity(blank, origin.activity_id, deps);
}

/* ── Ghi nhận bằng chứng ───────────────────────────────────────────── */

interface EmitInput {
  observe: Observe;
  anchor: Anchor;
  why: string;
  quote?: string | null;
  timeout?: boolean;
}

/**
 * Ghi một mẩu bằng chứng. Đã xem gợi ý thì trần của hoạt động đó hạ xuống 0 —
 * trả lời hay tới đâu cũng không đạt +2 nữa.
 */
function emit(state: RunState, input: EmitInput): RunState {
  const capped = state.hintsUsed.includes(state.activityId) && input.anchor === '+2';
  const anchor: Anchor = capped ? '0' : input.anchor;

  return {
    ...state,
    plus2: state.plus2 + (anchor === '+2' ? 1 : 0),
    minus1: state.minus1 + (anchor === '-1' ? 1 : 0),
    evidence: [
      ...state.evidence,
      {
        activityId: state.activityId,
        skill: input.observe.skill,
        skillType: input.observe.skill_type,
        anchor,
        capped,
        why: input.why,
        quote: input.quote ?? null,
        timeout: Boolean(input.timeout),
      },
    ],
  };
}

const withPlayerLine = (state: RunState, text: string): RunState => ({
  ...state,
  log: [...state.log, { from: 'player', text }],
});

const toClosing = (state: RunState): RunState => ({
  ...state,
  phase: 'closing',
  deadline: null,
});

/* ── Trả lời ───────────────────────────────────────────────────────── */

function answerChoice(
  state: RunState,
  optionIndex: number,
  scenario: Scenario,
): RunState {
  const activity = currentActivity(state, scenario);
  const { anchor, why } = gradeChoice(activity, optionIndex);
  const quote = activity.options?.[optionIndex] ?? '';

  let next = emit(state, {
    observe: activity.observes[0],
    anchor,
    why,
    quote,
  });
  next = withPlayerLine(next, quote);
  return toClosing(next);
}

function answerOrdering(state: RunState, scenario: Scenario): RunState {
  const activity = currentActivity(state, scenario);
  const order = state.order ?? [];
  const { anchor, why } = gradeOrdering(activity, order);
  const quote = order
    .map((id, i) => `${i + 1}. ${activity.items?.find((x) => x.item_id === id)?.text ?? id}`)
    .join(' · ');

  let next = emit(state, {
    observe: activity.observes[0],
    anchor,
    why,
    quote,
  });
  next = withPlayerLine(next, quote);
  return toClosing(next);
}

function answerPrioritizing(state: RunState, scenario: Scenario): RunState {
  const activity = currentActivity(state, scenario);
  const picked = state.picked ?? [];
  const { anchor, why } = gradePrioritizing(activity, picked);
  const quote = picked
    .map((id) => activity.items?.find((x) => x.item_id === id)?.text ?? id)
    .join(' · ');

  let next = emit(state, {
    observe: activity.observes[0],
    anchor,
    why,
    quote,
  });
  next = withPlayerLine(next, quote);
  return toClosing(next);
}

/**
 * Chấm câu gõ tự do trên mọi kỹ năng mà hoạt động này quan sát.
 *
 * Ở lượt đào sâu, câu mới chỉ thay câu cũ khi khá hơn — hỏi vặn là để người
 * chơi có cơ hội nói rõ ý, không phải để bị phạt hai lần.
 */
function answerText(state: RunState, text: string, deps: EngineDeps): RunState {
  const activity = currentActivity(state, deps.scenario);
  const isFollowup = state.phase === 'followup';

  let next = withPlayerLine(state, text);

  if (
    deps.grader.hitsSecret({
      text,
      scenarioKey: state.scenarioKey,
      activityId: activity.activity_id,
    })
  ) {
    next = { ...next, secret: true };
  }

  let missedSkill: string | null = null;

  for (const observe of activity.observes) {
    const anchor = deps.grader.grade({
      text,
      scenarioKey: state.scenarioKey,
      activityId: activity.activity_id,
      skill: observe.skill,
    });
    const why = observe.anchors[anchor];

    if (isFollowup) {
      const previous = next.evidence
        .filter(
          (e) => e.activityId === activity.activity_id && e.skill === observe.skill,
        )
        .pop();

      if (previous && anchorRank[anchor] > anchorRank[previous.anchor]) {
        next = {
          ...next,
          plus2: next.plus2 - (previous.anchor === '+2' ? 1 : 0),
          minus1: next.minus1 - (previous.anchor === '-1' ? 1 : 0),
          evidence: next.evidence.filter((e) => e !== previous),
        };
        next = emit(next, { observe, anchor, why, quote: text });
      }
      continue;
    }

    next = emit(next, { observe, anchor, why, quote: text });
    if (anchor !== '+2' && !missedSkill) missedSkill = observe.skill;
  }

  const canFollowup =
    !isFollowup &&
    missedSkill !== null &&
    Boolean(deps.followupLine(activity.activity_id)) &&
    next.followupUsed < activity.limitFollowup &&
    next.followupTotal < followupCap(deps.scenario.job.band);

  if (canFollowup) {
    return {
      ...next,
      phase: 'followup',
      followupUsed: next.followupUsed + 1,
      followupTotal: next.followupTotal + 1,
      deadline: null,
    };
  }

  return toClosing(next);
}

function timeout(state: RunState, scenario: Scenario): RunState {
  const activity = currentActivity(state, scenario);
  let next = emit(state, {
    observe: activity.observes[0],
    anchor: '-1',
    why: 'Hết giờ mà chưa hành động — sự cố không tự đợi',
    timeout: true,
  });
  next = withPlayerLine(next, '(không kịp phản ứng)');
  return toClosing(next);
}

function applyHint(state: RunState, scenario: Scenario): RunState {
  const activity = currentActivity(state, scenario);
  const hint = activity.hints[0];
  if (!hint || state.hintsUsed.includes(state.activityId)) return state;

  return {
    ...state,
    hintsUsed: [...state.hintsUsed, state.activityId],
    log: [
      ...state.log,
      { from: 'npc', name: 'An', text: stripSpeaker(hint.text) },
    ],
  };
}

const stripSpeaker = (line: string): string =>
  line.replace(/^[^:]{1,14}:\s*/, '').replace(/^['"]|['"]$/g, '');

/* ── Đi tiếp ───────────────────────────────────────────────────────── */

/**
 * Chọn kết cục: xét theo `priority` tăng dần, lấy cái đầu tiên thoả điều kiện.
 * `extra` nghĩa là kết cục chỉ mở khi người chơi tự chạm "bí mật".
 */
export function pickEnding(state: RunState, scenario: Scenario): Ending {
  const found = [...scenario.endings]
    .sort((a, b) => a.priority - b.priority)
    .find((ending) => {
      const c = ending.condition;
      if (c.extra && !state.secret) return false;
      if (c.min_plus2 != null && state.plus2 < c.min_plus2) return false;
      if (c.max_minus1 != null && state.minus1 > c.max_minus1) return false;
      return true;
    });

  // Dataset luôn có một kết cục không điều kiện làm lưới đỡ.
  return found ?? scenario.endings[scenario.endings.length - 1];
}

const finish = (state: RunState, ending: Ending): RunState => ({
  ...state,
  phase: 'ended',
  ending,
  deadline: null,
});

function advance(state: RunState, deps: EngineDeps): RunState {
  const activity = currentActivity(state, deps.scenario);
  if (activity.forward_to === 'END')
    return finish(state, pickEnding(state, deps.scenario));
  return enterActivity(state, activity.forward_to, deps);
}

/** Hết lời kết: gieo xem có chuyện xen ngang không, rồi mới đi tiếp. */
function afterClosing(state: RunState, deps: EngineDeps): RunState {
  const scenario = deps.scenario;
  const candidate = scenario.random_events.find(
    (e) =>
      e.after_activity === state.activityId &&
      !state.eventsFired.includes(e.event_id),
  );

  if (candidate) {
    const condition = candidate.condition;
    const conditionOk =
      !condition ||
      condition.min_minus1 == null ||
      state.minus1 >= condition.min_minus1;

    if (conditionOk && deps.rng() < candidate.chance) {
      return {
        ...state,
        phase: 'event',
        eventsFired: [...state.eventsFired, candidate.event_id],
        pendingEvent: candidate,
      };
    }
  }

  return advance(state, deps);
}

function afterEvent(state: RunState, deps: EngineDeps): RunState {
  const event = state.pendingEvent;
  const cleared: RunState = { ...state, pendingEvent: null };
  if (!event) return advance(cleared, deps);

  if (event.outcome === 'EARLY_END') {
    const scenario = deps.scenario;
    const ending =
      scenario.endings.find((e) => e.ending_id === event.early_ending_id) ??
      pickEnding(cleared, scenario);
    return finish(cleared, ending);
  }

  return advance(cleared, deps);
}

/* ── Reducer ───────────────────────────────────────────────────────── */

export function runReducer(
  state: RunState,
  action: RunAction,
  deps: EngineDeps,
): RunState {
  switch (action.type) {
    case 'ANSWER_CHOICE':
      if (state.phase !== 'main') return state;
      return answerChoice(state, action.optionIndex, deps.scenario);

    case 'ANSWER_TEXT':
      if (state.phase !== 'main' && state.phase !== 'followup') return state;
      return answerText(state, action.text, deps);

    case 'ANSWER_ORDERING':
      if (state.phase !== 'main') return state;
      return answerOrdering(state, deps.scenario);

    case 'ANSWER_PRIORITIZING':
      if (state.phase !== 'main') return state;
      return answerPrioritizing(state, deps.scenario);

    case 'MOVE_ITEM': {
      if (!state.order) return state;
      const target = action.index + action.direction;
      if (target < 0 || target >= state.order.length) return state;
      const order = [...state.order];
      [order[action.index], order[target]] = [order[target], order[action.index]];
      return { ...state, order };
    }

    case 'TOGGLE_PICK': {
      if (!state.picked) return state;
      const limit = currentActivity(state, deps.scenario).pick_count ?? 0;
      if (state.picked.includes(action.itemId))
        return {
          ...state,
          picked: state.picked.filter((id) => id !== action.itemId),
        };
      if (state.picked.length >= limit) return state;
      return { ...state, picked: [...state.picked, action.itemId] };
    }

    case 'USE_HINT':
      return applyHint(state, deps.scenario);

    case 'TIMEOUT':
      if (state.phase !== 'main') return state;
      return timeout(state, deps.scenario);

    case 'CONTINUE':
      if (state.phase === 'event') return afterEvent(state, deps);
      if (state.phase === 'closing') return afterClosing(state, deps);
      return state;

    default:
      return state;
  }
}
