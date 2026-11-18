/**
 * Chạy một kịch bản người chơi qua engine ca làm, trong bộ nhớ.
 *
 * Mỗi việc của người chơi đi qua `shift.step`, rồi vòng giải `pendingRequest`
 * y như `ShiftTurnProcessor.run`: hỏi engine đang chờ AI việc gì, gọi cổng
 * `ShiftNarrator` hoặc `ShiftChecker`, đưa kết quả về engine như một đầu vào,
 * lặp tới khi engine chờ người chơi. Khác worker ở chỗ không có DB, Redis hay
 * SSE; hết model thì dừng ở đó như `RUN_PAUSED` (D-92), không có đường khác.
 */
import { shift } from '@datn/game-core';
import type { KnownIdentity } from '@datn/game-core';
import type {
  AiCallOptions,
  ShiftChecker,
  ShiftNarrator,
} from '../../ai/shift/types';
import {
  describeStep,
  stepApplies,
  toPlayerInput,
  type Playthrough,
  type Step,
} from './playthrough';

/** Giống `MAX_STEPS` của worker: một lượt người chơi không được sinh quá ngần này bước AI. */
export const MAX_AI_STEPS = 40;

/** Một lượt gọi model của gateway, đã chuẩn hoá. */
export interface GatewayCallLog {
  model: string;
  latencyMs: number;
  finishReason?: string;
  usage?: {
    input: number;
    cachedInput: number;
    output: number;
    reasoning: number;
  };
  costUsd?: number;
  error?: { kind: string; message: string };
}

/** Một lần model dẫn truyện viết và bị luật R1–R4 kiểm. */
export interface NarratorAttemptLog {
  attempt: number;
  model: string;
  outcome: 'accepted' | 'rejected' | 'error';
  violations: Array<{ rule: string; detail: string }>;
  latencyMs: number | null;
  output: string | null;
  error?: string;
}

/** Một cặp request, response gửi nhà cung cấp, nguyên văn (không có header). */
export interface ExchangeLog {
  url: string;
  body: unknown;
  status: number;
  response: unknown;
}

/** Những gì cổng AI để lại sau một yêu cầu, ngoài kết quả chính. Trống khi dùng bản giả. */
export interface CallDetail {
  gateway: GatewayCallLog[];
  attempts: NarratorAttemptLog[];
  exchanges: ExchangeLog[];
}

export const emptyDetail = (): CallDetail => ({
  gateway: [],
  attempts: [],
  exchanges: [],
});

export interface LabPorts {
  narrator: ShiftNarrator;
  checker: ShiftChecker;
  /** `fake` khi cổng đó dùng bản giả, kể cả khi `--only` để loại kia chạy thật. */
  narratorMode: 'fake' | 'live';
  checkerMode: 'fake' | 'live';
  /** Lấy và xoá chi tiết các lượt gọi từ lần `drain` trước. */
  drain(): CallDetail;
}

export interface CallLog {
  index: number;
  step: number;
  service: 'narrator' | 'checker';
  adapter: string;
  request: shift.NarrateRequest | shift.CheckRequest;
  status: 'ok' | 'unavailable';
  reason?: string;
  beats?: shift.Beat[];
  answers?: shift.CheckAnswer[];
  flagsAdded: string[];
  provenance?: shift.Provenance;
  /** Thời gian chờ thật của lượt gọi, đo ở máy này. */
  elapsedMs: number;
  detail: CallDetail;
}

export interface StepLog {
  index: number;
  step: Step;
  /** Giờ trong ca trước khi làm. */
  time: string;
  lines: shift.TranscriptLine[];
  calls: CallLog[];
  awaitAfter: shift.AwaitState;
  /** Bước có `ifAwait` mà engine đang chờ việc khác: không làm. */
  skipped?: boolean;
}

export interface LabObserver {
  stepStart?(index: number, step: Step, time: string): void;
  stepSkipped?(index: number, step: Step, awaiting: string): void;
  lines?(lines: shift.TranscriptLine[]): void;
  call?(call: CallLog): void;
}

export type RunOutcome = 'ended' | 'incomplete' | 'paused' | 'script_error';

export interface RunResult {
  playthrough: string;
  outcome: RunOutcome;
  message?: string;
  steps: StepLog[];
  calls: CallLog[];
  state: shift.ShiftState;
  summary: shift.ShiftSummary;
  costUsd: number;
}

export interface RunOptions {
  ctx: shift.ShiftContext;
  ports: LabPorts;
  identity?: KnownIdentity;
  /** Trần chi phí AI của cả ca (NFR-11). */
  budgetUsd: number;
  contentVersion?: number;
  observer?: LabObserver;
}

const timeOf = (state: shift.ShiftState, ctx: shift.ShiftContext): string =>
  shift.clockAt(state.points, ctx.seed.clock.start, ctx.pack.minutes_per_point);

/** Việc người chơi làm được lúc này, để lời báo lỗi kịch bản chỉ đúng chỗ. */
function hintForScript(
  state: shift.ShiftState,
  ctx: shift.ShiftContext,
): string {
  const usable = ctx.seed.actions
    .filter((a) => shift.actionAvailability(state, ctx, a).ok)
    .map((a) => a.key);
  return `Engine đang chờ "${state.await.kind}"${
    'node' in state.await ? ` (nút ${state.await.node})` : ''
  }. Hành động dùng được: ${usable.join(', ') || '(không có)'}.`;
}

/**
 * Giải mọi yêu cầu AI đang chờ. Trả về `null` khi xong, hoặc lý do dừng khi
 * hết model dùng được.
 */
async function resolvePending(
  state: shift.ShiftState,
  args: {
    ctx: shift.ShiftContext;
    ports: LabPorts;
    options: RunOptions;
    spent: () => number;
    step: number;
    calls: CallLog[];
    nextIndex: () => number;
  },
): Promise<{ state: shift.ShiftState; pausedBecause: string | null }> {
  const { ctx, ports, options } = args;
  let current = state;
  for (let i = 0; i < MAX_AI_STEPS; i++) {
    const pending = shift.pendingRequest(current, ctx);
    if (!pending) return { state: current, pausedBecause: null };

    const opts: AiCallOptions = {
      identity: options.identity,
      budgetUsd: Math.max(0, options.budgetUsd - args.spent()),
      castNames: ctx.seed.cast.map((c) => c.name),
      ctx,
      contentVersion: options.contentVersion,
    };
    const requestId = pending.request.requestId;
    const started = Date.now();
    ports.drain();

    let input: shift.AiInput | null = null;
    let status: CallLog['status'] = 'ok';
    let reason: string | undefined;
    let beats: shift.Beat[] | undefined;
    let answers: shift.CheckAnswer[] | undefined;
    let provenance: shift.Provenance | undefined;

    if (pending.type === 'narrate') {
      const out = await ports.narrator.narrate(pending.request, opts);
      provenance = out.provenance;
      if (out.status === 'ok') {
        beats = out.value;
        input = { type: 'NARRATION', requestId, beats, provenance };
      } else {
        status = 'unavailable';
        reason = out.reason;
      }
    } else {
      const out = await ports.checker.check(pending.request, opts);
      provenance = out.provenance;
      if (out.status === 'ok') {
        answers = out.value;
        input = { type: 'CHECKS', requestId, answers, provenance };
      } else {
        status = 'unavailable';
        reason = out.reason;
      }
    }

    const before = new Set(current.flags);
    if (input) current = shift.step(current, input, ctx).state;

    const call: CallLog = {
      index: args.nextIndex(),
      step: args.step,
      service: pending.type === 'narrate' ? 'narrator' : 'checker',
      adapter: provenance?.adapter ?? 'unknown',
      request: pending.request,
      status,
      reason,
      beats,
      answers,
      flagsAdded: current.flags.filter((f) => !before.has(f)),
      provenance,
      elapsedMs: Date.now() - started,
      detail: ports.drain(),
    };
    args.calls.push(call);
    options.observer?.call?.(call);
    if (!input) return { state: current, pausedBecause: reason ?? 'unknown' };
  }
  throw new Error(`Một lượt vượt quá ${MAX_AI_STEPS} bước AI`);
}

export async function runPlaythrough(
  playthrough: Playthrough,
  options: RunOptions,
): Promise<RunResult> {
  const { ctx, observer } = options;
  let state = shift.initialState(ctx);
  const steps: StepLog[] = [];
  const calls: CallLog[] = [];
  let outcome: RunOutcome = 'incomplete';
  let message: string | undefined;
  let callIndex = 0;

  const spent = () =>
    calls.reduce((sum, c) => sum + (c.provenance?.costUsd ?? 0), 0);

  for (const [index, step] of playthrough.steps.entries()) {
    const time = timeOf(state, ctx);
    if (!stepApplies(step, state.await.kind)) {
      observer?.stepSkipped?.(index + 1, step, state.await.kind);
      steps.push({
        index: index + 1,
        step,
        time,
        lines: [],
        calls: [],
        awaitAfter: state.await,
        skipped: true,
      });
      continue;
    }
    observer?.stepStart?.(index + 1, step, time);
    const lineFrom = state.transcript.length;
    const stepCalls: CallLog[] = [];

    try {
      state = shift.step(state, toPlayerInput(step), ctx).state;
    } catch (err) {
      if (err instanceof shift.ShiftRuleError) {
        outcome = 'script_error';
        message = `Bước ${index + 1} (${describeStep(step)}) bị engine từ chối: ${err.message}. ${hintForScript(state, ctx)}`;
        break;
      }
      throw err;
    }

    const resolved = await resolvePending(state, {
      ctx,
      ports: options.ports,
      options,
      spent,
      step: index + 1,
      calls: stepCalls,
      nextIndex: () => ++callIndex,
    });
    state = resolved.state;
    calls.push(...stepCalls);

    const lines = state.transcript.slice(lineFrom);
    observer?.lines?.(lines);
    steps.push({
      index: index + 1,
      step,
      time,
      lines,
      calls: stepCalls,
      awaitAfter: state.await,
    });

    if (resolved.pausedBecause) {
      outcome = 'paused';
      message = `Hết model dùng được ở bước ${index + 1}: ${resolved.pausedBecause}. Ca tạm dừng, giữ tiến độ (D-92).`;
      break;
    }
    if (state.ended) {
      // Ca hết sớm hơn kịch bản dự tính: chỉ là lỗi nếu còn bước bắt buộc.
      const rest = playthrough.steps.slice(index + 1);
      const required = rest.findIndex((x) => x.ifAwait === undefined);
      if (required >= 0) {
        outcome = 'script_error';
        message = `Ca đã hết ở bước ${index + 1} nhưng kịch bản còn bước bắt buộc ${index + 2 + required} (${describeStep(rest[required])}).`;
      } else outcome = 'ended';
      break;
    }
  }

  if (outcome === 'incomplete')
    message = `Kịch bản hết mà ca chưa xong (engine đang chờ "${state.await.kind}").`;

  return {
    playthrough: playthrough.name,
    outcome,
    message,
    steps,
    calls,
    state,
    summary: shift.shiftSummary(state, ctx),
    costUsd: spent(),
  };
}
