/**
 * Body gửi đi phải đúng từng tham số đã chọn trong call profile — và KHÔNG có
 * những tham số đã quyết không gửi. Một tham số lọt vào body mà không ai để ý
 * (ví dụ `top_p` cùng `temperature`) là đổi hành vi model mà không ai biết.
 */
import { GatewayError, type ChatRequest } from './gateway.types';
import { deepseekAdapter, qwenAdapter } from './adapters';
import { deepseekFlash, qwenFlash } from './models';

const messages: ChatRequest['messages'] = [
  { role: 'system', parts: [{ text: 'luật json' }] },
  { role: 'user', parts: [{ text: 'kịch bản', cacheBreakpoint: true }, { text: ' câu người chơi' }] },
];

const request = (model: ChatRequest['model']): ChatRequest => ({
  model,
  messages,
  temperature: 0.7,
  maxOutputTokens: 300,
  json: { name: 'narration', schema: { type: 'object' } },
  timeoutMs: 4500,
});

const qwen = (over: Partial<Parameters<typeof qwenFlash>[0]> = {}) =>
  qwenFlash({ apiKey: 'k', region: 'eu-central-1', workspaceId: 'ws', cacheMode: 'implicit', ...over });

describe('Qwen — body', () => {
  it('tắt thinking, không stream, giới hạn token ra, chỉ gửi temperature', () => {
    const body = qwenAdapter.body(request(qwen()));
    expect(body).toMatchObject({
      model: 'qwen3.8-flash',
      enable_thinking: false,
      stream: false,
      temperature: 0.7,
      max_completion_tokens: 300,
    });
    for (const absent of ['top_p', 'presence_penalty', 'max_tokens', 'seed', 'n', 'stream_options'])
      expect(body).not.toHaveProperty(absent);
  });

  it('JSON Schema strict ở region hỗ trợ, json_object ở Singapore', () => {
    expect(qwenAdapter.body(request(qwen()))['response_format']).toMatchObject({
      type: 'json_schema',
      json_schema: { name: 'narration', strict: true },
    });
    expect(
      qwenAdapter.body(request(qwen({ region: 'ap-southeast-1', workspaceId: undefined })))['response_format'],
    ).toEqual({ type: 'json_object' });
  });

  it('cache implicit: content là chuỗi nối liền, không có cache_control', () => {
    const body = qwenAdapter.body(request(qwen()));
    const user = (body['messages'] as Array<{ content: unknown }>)[1];
    expect(user.content).toBe('kịch bản câu người chơi');
    expect(JSON.stringify(body)).not.toContain('cache_control');
  });

  it('cache explicit: điểm cache gắn đúng sau đoạn kịch bản, không gắn sau câu người chơi', () => {
    const body = qwenAdapter.body(request(qwen({ cacheMode: 'explicit' })));
    const user = (body['messages'] as Array<{ content: Array<Record<string, unknown>> }>)[1];
    expect(user.content).toEqual([
      { type: 'text', text: 'kịch bản', cache_control: { type: 'ephemeral' } },
      { type: 'text', text: ' câu người chơi' },
    ]);
  });
});

describe('Qwen — đọc kết quả', () => {
  it('chuẩn hoá số token, kể cả phần trúng cache và phần tạo cache', () => {
    const reply = qwenAdapter.read({
      id: 'chatcmpl-1',
      choices: [{ message: { content: '{"a":1}' }, finish_reason: 'stop' }],
      usage: {
        prompt_tokens: 3000,
        completion_tokens: 120,
        prompt_tokens_details: { cached_tokens: 2048, cache_creation_input_tokens: 0 },
      },
    });
    expect(reply).toEqual({
      text: '{"a":1}',
      finishReason: 'stop',
      requestId: 'chatcmpl-1',
      usage: { input: 3000, cachedInput: 2048, cacheWrite: 0, output: 120, reasoning: 0 },
    });
  });
});

describe('Qwen — phân loại lỗi', () => {
  it.each([
    [400, 'data_inspection_failed', 'content_filtered'],
    [400, 'DataInspectionFailed', 'content_filtered'],
    [400, 'invalid_parameter_error', 'bad_request'],
    [401, 'invalid_api_key', 'auth'],
    [429, 'limit_requests', 'rate_limited'],
    [429, 'insufficient_quota', 'quota'],
    [429, 'Throttling.AllocationQuota', 'quota'],
    [429, 'BudgetLimitExceeded', 'quota'],
    [429, 'Throttling.ServiceOverloaded', 'overloaded'],
    [500, 'internal_error', 'server'],
    [503, '', 'overloaded'],
  ] as const)('%i %s → %s', (status, code, kind) => {
    const error = qwenAdapter.error(status, { error: { code, message: 'x' } });
    expect(error).toBeInstanceOf(GatewayError);
    expect(error.kind).toBe(kind);
  });
});

describe('DeepSeek — body', () => {
  it('tắt thinking bằng tham số của DeepSeek, json_object, max_tokens', () => {
    const body = deepseekAdapter.body(request(deepseekFlash()));
    expect(body).toMatchObject({
      model: 'deepseek-flash',
      thinking: { type: 'disabled' },
      response_format: { type: 'json_object' },
      max_tokens: 300,
      stream: false,
    });
    for (const absent of ['enable_thinking', 'top_p', 'presence_penalty', 'frequency_penalty', 'max_completion_tokens'])
      expect(body).not.toHaveProperty(absent);
  });

  it('không có cache explicit: gửi chuỗi thường, cùng chữ với Qwen', () => {
    const body = deepseekAdapter.body(request(deepseekFlash()));
    expect((body['messages'] as Array<{ content: unknown }>)[1].content).toBe('kịch bản câu người chơi');
  });
});

describe('DeepSeek — đọc kết quả', () => {
  it('lấy số token trúng cache từ prompt_cache_hit_tokens', () => {
    const reply = deepseekAdapter.read({
      choices: [{ message: { content: '{}' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 3000, completion_tokens: 90, prompt_cache_hit_tokens: 2944, prompt_cache_miss_tokens: 56 },
    });
    expect(reply.usage).toEqual({ input: 3000, cachedInput: 2944, cacheWrite: 0, output: 90, reasoning: 0 });
  });

  it('hết tài nguyên giữa chừng là lỗi hạ tầng, không phải câu tồi', () => {
    expect(() =>
      deepseekAdapter.read({ choices: [{ message: { content: '' }, finish_reason: 'insufficient_system_resource' }] }),
    ).toThrow(expect.objectContaining({ kind: 'overloaded' }));
  });

  it.each([
    [401, 'auth'],
    [402, 'quota'],
    [422, 'bad_request'],
    [429, 'rate_limited'],
    [500, 'server'],
    [503, 'overloaded'],
  ] as const)('%i → %s', (status, kind) => {
    expect(deepseekAdapter.error(status, {}).kind).toBe(kind);
  });
});
