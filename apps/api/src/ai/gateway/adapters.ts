/**
 * Adapter từng hãng: dịch một `ChatRequest` chung sang body của hãng, đọc
 * câu trả lời về dạng chung, và phân loại lỗi.
 *
 * Từng tham số gửi đi đều có lý do ghi ngay tại chỗ. Tham số KHÔNG gửi cũng
 * có lý do — bỏ trống một tham số là một quyết định, không phải quên.
 */
import {
  GatewayError,
  type ChatMessage,
  type ChatRequest,
  type ModelSpec,
  type ProviderId,
  type TokenUsage,
} from './gateway.types';

export interface AdapterReply {
  text: string;
  finishReason: string;
  usage: TokenUsage;
  requestId: string | null;
}

export interface ProviderAdapter {
  readonly provider: ProviderId;
  endpoint(spec: ModelSpec): string;
  body(request: ChatRequest): Record<string, unknown>;
  read(json: unknown): AdapterReply;
  error(status: number, json: unknown): GatewayError;
}

/* ── Đọc chung kiểu OpenAI ─────────────────────────────────────────── */

type Json = Record<string, unknown>;

const obj = (value: unknown): Json =>
  value && typeof value === 'object' ? (value as Json) : {};
const num = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;
const str = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

function firstChoice(json: unknown): { text: string; finishReason: string } {
  const choices = obj(json)['choices'];
  const first = obj(Array.isArray(choices) ? choices[0] : undefined);
  const message = obj(first['message']);
  return {
    text: str(message['content']) ?? '',
    finishReason: str(first['finish_reason']) ?? 'unknown',
  };
}

/** `{ error: { code, message } }` hay `{ code, message }` — hãng nào cũng có lúc dùng kiểu kia. */
function errorFields(json: unknown): { code: string; message: string } {
  const body = obj(json);
  const inner = obj(body['error']);
  return {
    code: str(inner['code']) ?? str(body['code']) ?? str(inner['type']) ?? '',
    message: str(inner['message']) ?? str(body['message']) ?? 'không có thông báo lỗi',
  };
}

const joined = (message: ChatMessage): string =>
  message.parts.map((p) => p.text).join('');

/* ── Qwen (Alibaba Cloud Model Studio, chế độ tương thích OpenAI) ───── */

export const qwenAdapter: ProviderAdapter = {
  provider: 'qwen',

  endpoint: (spec) => `${spec.baseUrl}/chat/completions`,

  body(request) {
    const { model: spec } = request;
    const explicit = spec.cacheMode === 'explicit' && spec.supports.explicitCache;

    return {
      model: spec.model,

      // Cache explicit cần `content` là MẢNG đoạn, điểm cache gắn vào đoạn.
      // Cache implicit thì gửi chuỗi thường — prefix vẫn y hệt nên vẫn trúng.
      messages: request.messages.map((message) =>
        explicit && message.parts.some((p) => p.cacheBreakpoint)
          ? {
              role: message.role,
              content: message.parts.map((part) => ({
                type: 'text',
                text: part.text,
                ...(part.cacheBreakpoint
                  ? { cache_control: { type: 'ephemeral' } }
                  : {}),
              })),
            }
          : { role: message.role, content: joined(message) },
      ),

      temperature: request.temperature,
      // Không gửi `top_p`: Alibaba khuyên "set only one of them" giữa
      // temperature và top_p. Không gửi `presence_penalty`: qwen3.8-flash ở
      // chế độ không thinking đã mặc định 1,5 để chống lặp — đổi nó cần bằng
      // chứng, chưa có.

      // `max_tokens` đã bị Alibaba đánh dấu deprecated; `max_completion_tokens`
      // tính cả phần suy nghĩ, nhưng thinking đã tắt nên hai cái như nhau.
      max_completion_tokens: request.maxOutputTokens,

      // qwen3.8-flash BẬT thinking mặc định. Phải tắt: thinking sinh thêm hàng
      // trăm token trước câu trả lời (phá ngân sách 4,6 s), Alibaba bắt tắt khi
      // không stream ("enable_thinking must be set to false for non-streaming
      // calls"), và không cho JSON mode đi cùng thinking.
      enable_thinking: false,

      // Strict ép đúng khuôn ngay tại model — R4 ít hỏng, ít phải sinh lại.
      // Region chưa hỗ trợ thì lùi về json_object, và prompt phải có chữ "json".
      response_format: spec.supports.jsonSchema
        ? {
            type: 'json_schema',
            json_schema: {
              name: request.json.name,
              schema: request.json.schema,
              strict: true,
            },
          }
        : { type: 'json_object' },

      // Không stream: câu phải qua R1–R4 TRƯỚC khi hiện, stream từng chữ ra
      // màn hình là hiện câu chưa kiểm.
      stream: false,
    };
  },

  read(json) {
    const { text, finishReason } = firstChoice(json);
    const usage = obj(obj(json)['usage']);
    const promptDetails = obj(usage['prompt_tokens_details']);
    const completionDetails = obj(usage['completion_tokens_details']);
    return {
      text,
      finishReason,
      usage: {
        // Theo tài liệu Context cache, `cached_tokens` là một phần của `prompt_tokens`.
        input: num(usage['prompt_tokens']),
        cachedInput: num(promptDetails['cached_tokens']),
        cacheWrite: num(promptDetails['cache_creation_input_tokens']),
        output: num(usage['completion_tokens']),
        reasoning: num(completionDetails['reasoning_tokens']),
      },
      requestId: str(obj(json)['id']),
    };
  },

  error(status, json) {
    const { code, message } = errorFields(json);
    const fail = (kind: GatewayError['kind']) =>
      new GatewayError(kind, `Qwen ${status} ${code}: ${message}`, 'qwen', status, code || null);

    // "Input or output data may contain inappropriate content."
    if (/data_inspection_failed|datainspectionfailed/i.test(code) || /inappropriate content/i.test(message))
      return fail('content_filtered');
    if (status === 401 || (status === 403 && !/quota/i.test(code))) return fail('auth');
    if (status === 402 || /insufficient_quota|allocationquota|budgetlimit|freetier/i.test(code))
      return fail('quota');
    if (status === 429 && /overload/i.test(code)) return fail('overloaded');
    if (status === 429) return fail('rate_limited');
    if (status === 400 || status === 404 || status === 422) return fail('bad_request');
    if (status === 503) return fail('overloaded');
    return fail('server');
  },
};

/* ── DeepSeek ──────────────────────────────────────────────────────── */

export const deepseekAdapter: ProviderAdapter = {
  provider: 'deepseek',

  endpoint: (spec) => `${spec.baseUrl}/chat/completions`,

  body(request) {
    const { model: spec } = request;
    return {
      model: spec.model,
      // DeepSeek không có cache explicit: gửi chuỗi thường. Cache trên ổ đĩa
      // của họ khớp theo prefix, nên thứ tự message là tất cả.
      messages: request.messages.map((m) => ({ role: m.role, content: joined(m) })),

      // deepseek-flash BẬT thinking mặc định; tắt vì cùng lý do như Qwen.
      thinking: { type: 'disabled' },

      temperature: request.temperature,
      // Không gửi `top_p`: ở chế độ không thinking DeepSeek bỏ qua và cố định
      // 1,0. Không gửi `presence_penalty`, `frequency_penalty`: đã "deprecated,
      // no effect".

      // Mặc định 8K ở chế độ không thinking — một lần "nói dài" là hàng chục
      // giây. DeepSeek tự khuyên đặt hợp lý để JSON không bị cắt giữa chừng.
      max_tokens: request.maxOutputTokens,

      // Chỉ có `json_object`. Điều kiện: prompt phải có chữ "json" và một mẫu.
      response_format: { type: 'json_object' },

      stream: false,
    };
  },

  read(json) {
    const { text, finishReason } = firstChoice(json);

    // Hệ thống của họ hết tài nguyên giữa chừng: là lỗi hạ tầng, không phải
    // câu trả lời tồi — chuyển model, đừng bắt model viết lại.
    if (finishReason === 'insufficient_system_resource')
      throw new GatewayError('overloaded', 'DeepSeek: insufficient_system_resource', 'deepseek');
    if (finishReason === 'content_filter')
      throw new GatewayError('content_filtered', 'DeepSeek: content_filter', 'deepseek');

    const usage = obj(obj(json)['usage']);
    const completionDetails = obj(usage['completion_tokens_details']);
    return {
      text,
      finishReason,
      usage: {
        input: num(usage['prompt_tokens']),
        cachedInput: num(usage['prompt_cache_hit_tokens']),
        cacheWrite: 0,
        output: num(usage['completion_tokens']),
        reasoning: num(completionDetails['reasoning_tokens']),
      },
      requestId: str(obj(json)['id']),
    };
  },

  error(status, json) {
    const { code, message } = errorFields(json);
    const fail = (kind: GatewayError['kind']) =>
      new GatewayError(kind, `DeepSeek ${status} ${code}: ${message}`, 'deepseek', status, code || null);

    if (status === 401) return fail('auth');
    if (status === 402) return fail('quota');
    if (status === 429) return fail('rate_limited');
    if (status === 400 || status === 422) return fail('bad_request');
    if (status === 503) return fail('overloaded');
    return fail('server');
  },
};

export const ADAPTERS: Record<ProviderId, ProviderAdapter> = {
  qwen: qwenAdapter,
  deepseek: deepseekAdapter,
};
