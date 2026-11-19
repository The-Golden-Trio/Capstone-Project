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
  /** Tên ghi vào kết quả và nhật ký; `runPlaythrough` lấy từ kịch bản. */
  playthroughName?: string;
}

const callsCost = (calls: readonly CallLog[]): number =>
  calls.reduce((sum, c) => sum + (c.provenance?.costUsd ?? 0), 0);

const timeOf = (state: shift.ShiftState, ctx: shift.ShiftContext): string =>
  shift.clockAt(state.points, ctx.seed.clock.start, ctx.pack.minutes_per_point);

/** Việc người chơi làm được lúc này, để lời báo lỗi kịch bản chỉ đúng chỗ. */
export function hintForScript(
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
      budgetUsd: Math.max(
        0,
        options.budgetUsd - args.spent() - callsCost(args.calls),
      ),
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

export type ApplyOutcome =
  | { status: 'applied'; log: StepLog; pausedBecause: string | null }
  | { status: 'skipped'; log: StepLog }
  /** Engine từ chối: trạng thái giữ nguyên, không ghi bước. */
  | { status: 'rejected'; message: string };

/**
 * Một ca đang chạy trong bộ nhớ: giữ trạng thái và nhật ký, nhận từng bước một.
 * `runPlaythrough` đẩy cả kịch bản qua đây; chế độ chơi tay đẩy từng lệnh của
 * tester, cùng một đường đi qua engine và vòng giải yêu cầu AI.
 */
export class LabSession {
  state: shift.ShiftState;
  readonly steps: StepLog[] = [];
  readonly calls: CallLog[] = [];
  private callIndex = 0;

  constructor(readonly options: RunOptions) {
    this.state = shift.initialState(options.ctx);
  }

  get time(): string {
    return timeOf(this.state, this.options.ctx);
  }

  get costUsd(): number {
    return callsCost(this.calls);
  }

  async apply(step: Step): Promise<ApplyOutcome> {
    const { ctx, observer } = this.options;
    const index = this.steps.length + 1;
    const time = this.time;
    if (!stepApplies(step, this.state.await.kind)) {
      observer?.stepSkipped?.(index, step, this.state.await.kind);
      const log: StepLog = {
        index,
        step,
        time,
        lines: [],
        calls: [],
        awaitAfter: this.state.await,
        skipped: true,
      };
      this.steps.push(log);
      return { status: 'skipped', log };
    }

    observer?.stepStart?.(index, step, time);
    let next: shift.ShiftState;
    try {
      next = shift.step(this.state, toPlayerInput(step), ctx).state;
    } catch (err) {
      if (err instanceof shift.ShiftRuleError)
        return { status: 'rejected', message: err.message };
      throw err;
    }

    const lineFrom = this.state.transcript.length;
    const stepCalls: CallLog[] = [];
    const resolved = await resolvePending(next, {
      ctx,
      ports: this.options.ports,
      options: this.options,
      spent: () => this.costUsd,
      step: index,
      calls: stepCalls,
      nextIndex: () => ++this.callIndex,
    });
    this.state = resolved.state;
    this.calls.push(...stepCalls);

    const lines = this.state.transcript.slice(lineFrom);
    observer?.lines?.(lines);
    const log: StepLog = {
      index,
      step,
      time,
      lines,
      calls: stepCalls,
      awaitAfter: this.state.await,
    };
    this.steps.push(log);
    return { status: 'applied', log, pausedBecause: resolved.pausedBecause };
  }

  /**
   * Giải lại yêu cầu AI còn treo sau khi `apply` dừng vì hết model (D-92),
   * để tester thử lại mà không mất tiến độ. Nhật ký gộp vào bước cuối.
   */
  async resume(): Promise<{
    lines: shift.TranscriptLine[];
    calls: CallLog[];
    pausedBecause: string | null;
  }> {
    const lineFrom = this.state.transcript.length;
    const stepCalls: CallLog[] = [];
    const resolved = await resolvePending(this.state, {
      ctx: this.options.ctx,
      ports: this.options.ports,
      options: this.options,
      spent: () => this.costUsd,
      step: this.steps.length,
      calls: stepCalls,
      nextIndex: () => ++this.callIndex,
    });
    this.state = resolved.state;
    this.calls.push(...stepCalls);
    const lines = this.state.transcript.slice(lineFrom);
    const last = this.steps.at(-1);
    if (last) {
      last.lines.push(...lines);
      last.calls.push(...stepCalls);
      last.awaitAfter = this.state.await;
    }
    return { lines, calls: stepCalls, pausedBecause: resolved.pausedBecause };
  }

  result(outcome: RunOutcome, message?: string): RunResult {
    return {
      playthrough: this.options.playthroughName ?? 'choi-thu',
      outcome,
      message,
      steps: this.steps,
      calls: this.calls,
      state: this.state,
      summary: shift.shiftSummary(this.state, this.options.ctx),
      costUsd: this.costUsd,
    };
  }
}

export async function runPlaythrough(
  playthrough: Playthrough,
  options: RunOptions,
): Promise<RunResult> {
  const { ctx } = options;
  const session = new LabSession({
    ...options,
    playthroughName: playthrough.name,
  });
  let outcome: RunOutcome = 'incomplete';
  let message: string | undefined;

  for (const [index, step] of playthrough.steps.entries()) {
    const done = await session.apply(step);
    if (done.status === 'skipped') continue;
    if (done.status === 'rejected') {
      outcome = 'script_error';
      message = `Bước ${index + 1} (${describeStep(step)}) bị engine từ chối: ${done.message}. ${hintForScript(session.state, ctx)}`;
      break;
    }
    if (done.pausedBecause) {
      outcome = 'paused';
      message = `Hết model dùng được ở bước ${index + 1}: ${done.pausedBecause}. Ca tạm dừng, giữ tiến độ (D-92).`;
      break;
    }
    if (session.state.ended) {
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
    message = `Kịch bản hết mà ca chưa xong (engine đang chờ "${session.state.await.kind}").`;

  return session.result(outcome, message);
}
