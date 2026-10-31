/**
 * Model giả, cho test và cho chế độ chạy thử khi chưa có key.
 *
 * Giả ở tầng `Transport` — chỗ thấp nhất — nên mọi thứ phía trên vẫn chạy
 * thật: adapter dựng body đúng như sẽ gửi, đọc câu trả lời đúng định dạng của
 * từng hãng, phân loại lỗi đúng như với lỗi thật. Chỉ khác chỗ trả lời.
 */
import type { Clock, Transport } from '../gateway/gateway.types';

export class FakeClock implements Clock {
  constructor(private t = 1_000_000) {}
  now(): number {
    return this.t;
  }
  advance(ms: number): void {
    this.t += ms;
  }
}

export interface FakeTurn {
  /** Nội dung model trả về. */
  content?: string;
  finishReason?: string;
  /** HTTP status; khác 2xx thì trả body lỗi. */
  status?: number;
  errorCode?: string;
  errorMessage?: string;
  /** Lỗi mạng (không có HTTP status). */
  network?: boolean;
  latencyMs?: number;
  promptTokens?: number;
  cachedTokens?: number;
  completionTokens?: number;
}

export interface FakeCall {
  url: string;
  body: Record<string, unknown>;
  headers: Record<string, string>;
}

/** Khoảng 2,5 ký tự tiếng Việt một token — chỉ để số liệu giả trông hợp lý. */
const roughTokens = (chars: number) => Math.ceil(chars / 2.5);

function okBody(url: string, request: Record<string, unknown>, turn: FakeTurn, index: number) {
  const content = turn.content ?? '';
  const prompt = turn.promptTokens ?? roughTokens(JSON.stringify(request['messages']).length);
  const cached = turn.cachedTokens ?? 0;
  const completion = turn.completionTokens ?? roughTokens(content.length);
  const usage = url.includes('deepseek')
    ? {
        prompt_tokens: prompt,
        completion_tokens: completion,
        prompt_cache_hit_tokens: cached,
        prompt_cache_miss_tokens: prompt - cached,
        completion_tokens_details: { reasoning_tokens: 0 },
      }
    : {
        prompt_tokens: prompt,
        completion_tokens: completion,
        prompt_tokens_details: { cached_tokens: cached },
        completion_tokens_details: { reasoning_tokens: 0 },
      };
  return {
    // Cố định theo thứ tự lượt gọi, để file ví dụ xuất ra giống nhau mỗi lần chạy.
    id: `chatcmpl-fake-${index + 1}`,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: turn.finishReason ?? 'stop',
      },
    ],
    usage,
  };
}

/**
 * Transport trả lời theo kịch bản: lượt gọi thứ i nhận `script[i]` (hết kịch
 * bản thì lặp lại lượt cuối), hoặc theo hàm nếu cần nhìn vào request.
 */
export function fakeTransport(
  script: readonly FakeTurn[] | ((call: FakeCall, index: number) => FakeTurn),
  clock: FakeClock,
): Transport & { calls: FakeCall[] } {
  const calls: FakeCall[] = [];

  const transport = async (
    url: string,
    init: Parameters<Transport>[1],
  ): ReturnType<Transport> => {
    const call: FakeCall = { url, body: JSON.parse(init.body), headers: init.headers };
    calls.push(call);
    const index = calls.length - 1;
    const turn =
      typeof script === 'function'
        ? script(call, index)
        : (script[index] ?? script[script.length - 1]);

    const latency = turn.latencyMs ?? 800;
    if (latency > init.timeoutMs) {
      clock.advance(init.timeoutMs);
      throw Object.assign(new Error('The operation was aborted due to timeout'), {
        name: 'TimeoutError',
      });
    }
    clock.advance(latency);
    if (turn.network) throw new TypeError('fetch failed');

    const status = turn.status ?? 200;
    const json =
      status >= 200 && status < 300
        ? okBody(url, call.body, turn, index)
        : { error: { code: turn.errorCode ?? 'error', message: turn.errorMessage ?? 'lỗi giả' } };
    return { status, text: async () => JSON.stringify(json) };
  };

  return Object.assign(transport, { calls });
}
