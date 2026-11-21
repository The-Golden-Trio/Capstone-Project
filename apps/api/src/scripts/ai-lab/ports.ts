/**
 * Dựng hai cổng AI cho `ai-lab`, ngoài Nest, giống cách `narrator-try` và
 * `judge-try` dựng service: bản giả là `ai/shift/fake.ts`; bản thật là đúng
 * `ShiftSceneNarrator` và `ShiftCheckerService` mà worker dùng, chỉ khác chỗ
 * gateway được bọc để ghi lại từng lượt gọi (token, độ trễ, tiền, request và
 * response nguyên văn) và NarratorService được bọc để giữ vết R1–R4.
 */
import { CircuitBreaker } from '../../ai/gateway/circuit-breaker';
import { costOf } from '../../ai/gateway/cost';
import {
  GatewayError,
  type ChatRequest,
  type ChatResult,
  type Transport,
} from '../../ai/gateway/gateway.types';
import { ModelGateway, fetchTransport } from '../../ai/gateway/model-gateway';
import {
  gatewayKeys,
  judgePanel,
  narratorChain,
  type AiSettings,
  type JudgeSlot,
} from '../../ai/gateway/models';
import { NarratorService } from '../../ai/narrator/narrator.service';
import { FakeShiftChecker, FakeShiftNarrator } from '../../ai/shift/fake';
import { ShiftCheckerService } from '../../ai/shift/checker.service';
import { ShiftSceneNarrator } from '../../assessment/shift-scene';
import {
  emptyDetail,
  type CallDetail,
  type LabPorts,
  type NarratorAttemptLog,
} from './runner';
import type { LabRuntime } from './stages';

/** Tên biến môi trường giữ key của một địa chỉ, để nhật ký không bao giờ có key. */
export const keyName = (url: string): string => {
  if (url.includes('deepseek')) return '{DEEPSEEK_API_KEY}';
  return url.includes('openrouter') ? '{OPENROUTER_API_KEY}' : '{QWEN_API_KEY}';
};

/** Bọc transport để ghi nguyên văn request (không header) và response. */
export function recordingTransport(
  inner: Transport,
  sink: () => CallDetail,
): Transport {
  return async (url, init) => {
    const res = await inner(url, init);
    const text = await res.text();
    let response: unknown = text;
    try {
      response = JSON.parse(text);
    } catch {
      // Giữ nguyên chuỗi nếu không phải JSON.
    }
    sink().exchanges.push({
      url,
      body: JSON.parse(init.body),
      status: res.status,
      response,
    });
    return { status: res.status, text: async () => text };
  };
}

/** Bọc `gateway.complete` để ghi từng lượt gọi, kể cả khi lỗi. */
export function spyOnGateway(
  gateway: ModelGateway,
  sink: () => CallDetail,
): void {
  const complete = gateway.complete.bind(gateway);
  gateway.complete = async (request: ChatRequest): Promise<ChatResult> => {
    const started = Date.now();
    try {
      const result = await complete(request);
      sink().gateway.push({
        model: request.model.key,
        latencyMs: result.latencyMs,
        finishReason: result.finishReason,
        usage: {
          input: result.usage.input,
          cachedInput: result.usage.cachedInput,
          output: result.usage.output,
          reasoning: result.usage.reasoning,
        },
        costUsd: costOf(result.usage, request.model.price).usd,
      });
      return result;
    } catch (err) {
      const error =
        err instanceof GatewayError
          ? { kind: err.kind, message: err.message }
          : { kind: 'unknown', message: String(err) };
      sink().gateway.push({
        model: request.model.key,
        latencyMs: Date.now() - started,
        error,
      });
      throw err;
    }
  };
}

/** Những gì dựng được từ cấu hình hiện có, và điều còn thiếu. */
export function liveSetup(settings: AiSettings) {
  const narrator = narratorChain(settings);
  const narratorFamilies = [
    'qwen',
    'deepseek',
    ...narrator.chain.map((s) => s.family),
  ];
  const panel = judgePanel(settings, { narratorFamilies });
  return {
    chain: narrator.chain,
    excluded: narrator.excluded,
    slots: panel.slots,
    problems: panel.problems,
  };
}

export interface Runtime extends LabRuntime {
  /** Chi tiết các lượt gọi từ lần lấy trước. */
  sink: CallDetail;
}

export function fakeRuntime(settings: AiSettings): Runtime {
  return {
    mode: 'fake',
    settings,
    gateway: null,
    judgeSlots: [],
    sink: emptyDetail(),
  };
}

export function liveRuntime(
  settings: AiSettings,
  transport: Transport = fetchTransport,
): Runtime {
  const runtime: Runtime = {
    mode: 'live',
    settings,
    gateway: null,
    judgeSlots: liveSetup(settings).slots,
    sink: emptyDetail(),
  };
  const gateway = new ModelGateway(
    gatewayKeys(settings),
    recordingTransport(transport, () => runtime.sink),
  );
  spyOnGateway(gateway, () => runtime.sink);
  runtime.gateway = gateway;
  return runtime;
}

export type Only = 'narrator' | 'checker' | 'judge' | undefined;

export function createPorts(runtime: Runtime, only: Only): LabPorts {
  const drain = (): CallDetail => {
    const detail = runtime.sink;
    runtime.sink = emptyDetail();
    return detail;
  };
  const useLive = runtime.mode === 'live' && runtime.gateway !== null;
  const liveNarrator = useLive && (only === undefined || only === 'narrator');
  const liveChecker = useLive && (only === undefined || only === 'checker');

  let narrator: LabPorts['narrator'] = new FakeShiftNarrator();
  let checker: LabPorts['checker'] = new FakeShiftChecker();

  if (runtime.gateway && (liveNarrator || liveChecker)) {
    const breaker = new CircuitBreaker();
    if (liveNarrator) {
      const { chain } = narratorChain(runtime.settings);
      const real = new NarratorService(runtime.gateway, breaker, chain);
      const spy = {
        narrateScene: async (
          input: Parameters<NarratorService['narrateScene']>[0],
        ) => {
          const result = await real.narrateScene(input);
          runtime.sink.attempts.push(
            ...result.records.map((r): NarratorAttemptLog => ({
              attempt: r.attempt,
              model: r.modelKey,
              outcome: r.outcome,
              violations: r.violations,
              latencyMs: r.latencyMs,
              output: r.output,
              ...(r.error
                ? { error: `${r.error.kind}: ${r.error.message}` }
                : {}),
            })),
          );
          return result;
        },
      } as unknown as NarratorService;
      narrator = new ShiftSceneNarrator(spy);
    }
    if (liveChecker)
      checker = new ShiftCheckerService(
        runtime.gateway,
        breaker,
        runtime.judgeSlots as JudgeSlot[],
      );
  }

  return {
    narrator,
    checker,
    narratorMode: liveNarrator ? 'live' : 'fake',
    checkerMode: liveChecker ? 'live' : 'fake',
    drain,
  };
}
