/**
 * Máy chủ HTTP giả, KHẮT KHE theo đúng tài liệu của hãng.
 *
 * Model giả ở `fake-model.ts` chấp nhận mọi request; máy chủ này thì không. Nó
 * chép lại những điều hãng nói sẽ từ chối, nên body sai tham số sẽ bị 400 y như
 * thật, đi qua `fetch` và mạng thật trên localhost.
 *
 * Nó chứng minh code khớp với TÀI LIỆU. Nó không chứng minh tài liệu khớp với
 * hãng: phần đó chỉ lệnh `narrator-try --mode=check` với key thật mới biết.
 *
 * Nguồn, đọc ngày 6/11/2026:
 *   - Alibaba: qwen-api-via-openai-chat-completions, json-mode, context-cache,
 *     error-code. Hình dạng lỗi 401 lấy từ phản hồi thật khi gọi bằng key giả.
 *   - OpenRouter: openapi.json (`ChatRequest`, `ProviderPreferences`), và
 *     `supported_parameters` của endpoint qwen/qwen3.8-flash.
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

type Body = Record<string, unknown>;

export type ProviderKind = 'qwen' | 'openrouter';

const asObject = (value: unknown): Body =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Body) : {};

/** Alibaba trả 400 cho các từ khoá này trong schema. */
const QWEN_UNSUPPORTED_SCHEMA = [
  'multipleOf',
  'uniqueItems',
  'contains',
  'minContains',
  'maxContains',
  'additionalItems',
  'patternProperties',
  'propertyNames',
];

const QWEN_ALLOWED = new Set([
  'model',
  'messages',
  'temperature',
  'max_completion_tokens',
  'enable_thinking',
  'response_format',
  'stream',
]);

/** `supported_parameters` của endpoint Alibaba, cộng các trường của OpenRouter. */
const OPENROUTER_ALLOWED = new Set([
  'model',
  'messages',
  'temperature',
  'max_tokens',
  'reasoning',
  'response_format',
  'provider',
  'stream',
]);

const OPENROUTER_PROVIDER_FIELDS = new Set([
  'only',
  'allow_fallbacks',
  'require_parameters',
  'data_collection',
]);

function schemaKeywords(schema: unknown): string[] {
  if (Array.isArray(schema)) return schema.flatMap(schemaKeywords);
  if (!schema || typeof schema !== 'object') return [];
  return Object.entries(schema as Body).flatMap(([key, value]) => [key, ...schemaKeywords(value)]);
}

function messageViolations(body: Body): string[] {
  const messages = body['messages'];
  if (!Array.isArray(messages) || messages.length === 0) return ['messages phải là mảng khác rỗng'];

  return (messages as Body[]).flatMap((message, i) => {
    const out: string[] = [];
    if (!['system', 'user', 'assistant'].includes(String(message['role'])))
      out.push(`messages[${i}].role không hợp lệ`);
    const content = message['content'];
    if (typeof content === 'string') {
      if (content.length === 0) out.push(`messages[${i}].content rỗng`);
    } else if (Array.isArray(content)) {
      for (const part of content as Body[]) {
        if (part['type'] !== 'text' || typeof part['text'] !== 'string')
          out.push(`messages[${i}].content có đoạn không phải text`);
        const marker = part['cache_control'];
        if (marker !== undefined && asObject(marker)['type'] !== 'ephemeral')
          out.push(`messages[${i}] cache_control sai`);
      }
    } else {
      out.push(`messages[${i}].content phải là chuỗi hoặc mảng`);
    }
    return out;
  });
}

function responseFormatViolations(body: Body, allowSchema: boolean): string[] {
  const format = asObject(body['response_format']);
  if (format['type'] === 'json_object') {
    return /json/i.test(JSON.stringify(body['messages']))
      ? []
      : ["'messages' must contain the word 'json' in some form, to use 'response_format' of type 'json_object'."];
  }
  if (format['type'] !== 'json_schema') return ['response_format.type phải là json_object hoặc json_schema'];
  if (!allowSchema) return ['json_schema is not supported in this region'];

  const inner = asObject(format['json_schema']);
  const out: string[] = [];
  if (typeof inner['name'] !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(inner['name']))
    out.push('json_schema.name bắt buộc');
  if (!inner['schema'] || typeof inner['schema'] !== 'object') out.push('json_schema.schema bắt buộc');
  for (const keyword of schemaKeywords(inner['schema']))
    if (QWEN_UNSUPPORTED_SCHEMA.includes(keyword)) out.push(`schema dùng từ khoá không hỗ trợ: ${keyword}`);
  return out;
}

export function qwenViolations(body: Body, options: { allowSchema: boolean }): string[] {
  const out = [
    ...Object.keys(body).filter((k) => !QWEN_ALLOWED.has(k)).map((k) => `tham số ngoài danh sách đã chọn: ${k}`),
    ...messageViolations(body),
    ...responseFormatViolations(body, options.allowSchema),
  ];
  if (body['model'] !== 'qwen3.8-flash') out.push('model phải là qwen3.8-flash');
  // qwen3.8-flash bật thinking mặc định; không stream thì phải tắt.
  if (body['stream'] !== false) out.push('stream phải là false');
  if (body['enable_thinking'] !== false)
    out.push('parameter.enable_thinking must be set to false for non-streaming calls');
  const limit = body['max_completion_tokens'];
  if (!Number.isInteger(limit) || (limit as number) < 1) out.push('max_completion_tokens phải là số nguyên ≥ 1');
  const temperature = body['temperature'];
  if (typeof temperature !== 'number' || temperature < 0 || temperature >= 2)
    out.push('temperature phải trong [0, 2)');
  return out;
}

export function openRouterViolations(body: Body): string[] {
  const out = [
    ...Object.keys(body).filter((k) => !OPENROUTER_ALLOWED.has(k)).map((k) => `tham số endpoint không hỗ trợ: ${k}`),
    ...messageViolations(body),
    ...responseFormatViolations(body, true),
  ];
  if (body['model'] !== 'qwen/qwen3.8-flash') out.push('model phải là qwen/qwen3.8-flash');
  if (body['stream'] !== false) out.push('stream phải là false');
  if (asObject(body['reasoning'])['effort'] !== 'none') out.push('phải tắt suy nghĩ bằng reasoning.effort = none');
  const limit = body['max_tokens'];
  if (!Number.isInteger(limit) || (limit as number) < 16) out.push('max_tokens phải là số nguyên ≥ 16');

  const provider = asObject(body['provider']);
  for (const key of Object.keys(provider))
    if (!OPENROUTER_PROVIDER_FIELDS.has(key)) out.push(`provider.${key} không có trong ProviderPreferences`);
  if (JSON.stringify(provider['only']) !== '["alibaba"]') out.push('provider.only phải chỉ có alibaba');
  if (provider['allow_fallbacks'] !== false) out.push('provider.allow_fallbacks phải là false');
  if (provider['require_parameters'] !== true) out.push('provider.require_parameters phải là true');
  if (!['allow', 'deny'].includes(String(provider['data_collection']))) out.push('provider.data_collection sai');
  return out;
}

/** Câu trả lời thật theo hình dạng trong tài liệu, kèm `usage` đủ trường. */
export function okResponse(provider: ProviderKind, content: string, finishReason = 'stop'): Body {
  const usage =
    provider === 'qwen'
      ? {
          prompt_tokens: 3019,
          completion_tokens: 104,
          total_tokens: 3123,
          prompt_tokens_details: { cached_tokens: 2048 },
          completion_tokens_details: { reasoning_tokens: 0, text_tokens: 104 },
        }
      : {
          prompt_tokens: 3019,
          completion_tokens: 104,
          total_tokens: 3123,
          cost: 0.00027,
          prompt_tokens_details: { cached_tokens: 2048, cache_write_tokens: 0 },
          completion_tokens_details: { reasoning_tokens: 0 },
        };
  return {
    id: 'chatcmpl-6ada9ed2-7f33-9de2-8bb0-78bd4035025a',
    object: 'chat.completion',
    created: 1735120033,
    model: provider === 'qwen' ? 'qwen3.8-flash' : 'qwen/qwen3.8-flash',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: finishReason,
        logprobs: null,
      },
    ],
    usage,
  };
}

export interface ServerReply {
  status?: number;
  /** Object thì gửi JSON; chuỗi thì gửi nguyên văn (giả lập trang HTML của gateway). */
  json?: unknown;
  raw?: string;
  delayMs?: number;
}

export interface StrictProvider {
  url: string;
  received: Body[];
  close(): Promise<void>;
}

export interface StrictProviderOptions {
  provider: ProviderKind;
  apiKey: string;
  /** Giả lập region Singapore: từ chối JSON Schema. */
  allowSchema?: boolean;
  /** Trả lời khi request đã đúng hết. Mặc định là một câu hợp lệ. */
  reply?: (body: Body, index: number) => ServerReply;
}

export const VALID_LINE = JSON.stringify({
  speaker: 'an',
  follow_up: 'Thế nếu sau này có khách còn nhiều đơn hơn nữa thì endpoint này sẽ ra sao?',
});

export async function startStrictProvider(options: StrictProviderOptions): Promise<StrictProvider> {
  const received: Body[] = [];
  const { provider, apiKey, allowSchema = true } = options;

  const server: Server = createServer((request, response) => {
    let raw = '';
    request.on('data', (chunk: Buffer) => (raw += chunk.toString()));
    request.on('end', () => {
      const send = async (reply: ServerReply) => {
        if (reply.delayMs) await new Promise((resolve) => setTimeout(resolve, reply.delayMs));
        response.writeHead(reply.status ?? 200, {
          'Content-Type': reply.raw === undefined ? 'application/json' : 'text/html',
        });
        response.end(reply.raw ?? JSON.stringify(reply.json));
      };

      if (request.method !== 'POST' || !request.url?.endsWith('/chat/completions'))
        return void send({ status: 404, json: { error: { message: 'Not Found', code: 404 } } });

      if (request.headers['authorization'] !== `Bearer ${apiKey}`)
        return void send({
          status: 401,
          json:
            provider === 'qwen'
              ? { error: { message: 'Incorrect API key provided.', type: 'invalid_request_error', param: null, code: 'invalid_api_key' }, request_id: 'x' }
              : { error: { message: 'User not found.', code: 401 } },
        });

      if (request.headers['content-type'] !== 'application/json')
        return void send({ status: 400, json: { error: { message: 'Content-Type phải là application/json', code: 'invalid_request_error' } } });

      const body = JSON.parse(raw) as Body;
      received.push(body);

      const violations =
        provider === 'qwen' ? qwenViolations(body, { allowSchema }) : openRouterViolations(body);
      if (violations.length > 0)
        return void send({
          status: 400,
          json:
            provider === 'qwen'
              ? { error: { message: violations.join('; '), type: 'invalid_request_error', code: 'invalid_parameter_error' } }
              : { error: { message: violations.join('; '), code: 400 } },
        });

      void send(
        options.reply?.(body, received.length - 1) ?? { json: okResponse(provider, VALID_LINE) },
      );
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}/v1`,
    received,
    close: () =>
      new Promise((resolve, reject) => {
        server.closeAllConnections();
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
