/**
 * Body gửi đi phải đúng từng tham số đã chọn trong call profile — và KHÔNG có
 * những tham số đã quyết không gửi. Một tham số lọt vào body mà không ai để ý
 * (ví dụ `top_p` cùng `temperature`) là đổi hành vi model mà không ai biết.
 */
import { GatewayError, type ChatRequest } from './gateway.types';
import { deepseekAdapter, openRouterAdapter, qwenAdapter } from './adapters';
import { deepseekFlash, openRouterQwenFlash, qwenFlash } from './models';

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

  it.each([
    ['ngay dưới prompt_tokens_details', { cached_tokens: 0, cache_creation_input_tokens: 1800 }],
    ['lồng trong cache_creation', { cached_tokens: 0, cache_creation: { cache_creation_input_tokens: 1800 } }],
  ])('đọc được phí tạo cache %s — hai trang tài liệu ghi khác nhau', (_, details) => {
    const reply = qwenAdapter.read({
      choices: [{ message: { content: '{}' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 3000, completion_tokens: 10, prompt_tokens_details: details },
    });
    expect(reply.usage.cacheWrite).toBe(1800);
  });

  it('HTTP 200 mà không có choices là lỗi hạ tầng, không phải câu rỗng', () => {
    expect(() => qwenAdapter.read({ code: 'x', message: 'y' })).toThrow(
      expect.objectContaining({ kind: 'server' }),
    );
  });
});

describe('Qwen — phân loại lỗi', () => {
  it.each([
    [400, 'data_inspection_failed', 'content_filtered'],
    [400, 'DataInspectionFailed', 'content_filtered'],
    [400, 'invalid_parameter_error', 'bad_request'],
    [401, 'invalid_api_key', 'auth'],
    [429, 'limit_requests', 'rate_limited'],
    [429, 'insufficient_quota', 'rate_limited'],
    [429, 'Throttling.AllocationQuota', 'rate_limited'],
    [429, 'Throttling.RateQuota', 'rate_limited'],
    [429, 'Throttling.Concurrency', 'rate_limited'],
    [429, 'BudgetLimitExceeded', 'quota'],
    [403, 'Arrearage', 'quota'],
    [403, 'isv.OUT_OF_SERVICE', 'quota'],
    [403, 'AllocationQuota.FreeTierOnly', 'quota'],
    [403, 'AccessDenied.Unpurchased', 'auth'],
    [403, 'access_denied', 'auth'],
    [404, 'WorkSpaceNotFound', 'auth'],
    [404, 'model_not_found', 'auth'],
    [429, 'Throttling.ServiceOverloaded', 'overloaded'],
    [500, 'internal_error', 'server'],
    [503, '', 'overloaded'],
  ] as const)('%i %s → %s', (status, code, kind) => {
    const error = qwenAdapter.error(status, { error: { code, message: 'x' } });
    expect(error).toBeInstanceOf(GatewayError);
    expect(error.kind).toBe(kind);
  });
});

describe('Qwen — phân loại lỗi theo lời báo', () => {
  it.each([
    [429, 'Throttling.AllocationQuota', 'Free allocated quota exceeded.', 'quota'],
    [400, 'InvalidParameter', 'The product is not activated, please confirm', 'auth'],
    [400, 'InvalidParameter', 'No backend server available', 'overloaded'],
    [400, 'InvalidParameter', 'Input or output data may contain inappropriate content.', 'content_filtered'],
  ] as const)('%i %s "%s" → %s', (status, code, message, kind) => {
    expect(qwenAdapter.error(status, { error: { code, message } }).kind).toBe(kind);
  });
});

describe('OpenRouter — body', () => {
  const openrouter = () => openRouterQwenFlash({ apiKey: 'o' }, { allowDataCollection: false });

  it('tắt suy nghĩ bằng reasoning.effort, dùng max_tokens, không có tham số riêng của Alibaba', () => {
    const body = openRouterAdapter.body(request(openrouter()));
    expect(body).toMatchObject({
      model: 'qwen/qwen3.8-flash',
      reasoning: { effort: 'none' },
      max_tokens: 300,
      temperature: 0.7,
      stream: false,
    });
    for (const absent of ['enable_thinking', 'max_completion_tokens', 'top_p', 'thinking'])
      expect(body).not.toHaveProperty(absent);
  });

  it('chỉ Alibaba, không đổi hãng, không cho hãng bỏ qua tham số, không thu thập dữ liệu', () => {
    expect(openRouterAdapter.body(request(openrouter()))['provider']).toEqual({
      only: ['alibaba'],
      allow_fallbacks: false,
      require_parameters: true,
      data_collection: 'deny',
    });
  });

  it('JSON Schema strict', () => {
    expect(openRouterAdapter.body(request(openrouter()))['response_format']).toMatchObject({
      type: 'json_schema',
      json_schema: { name: 'narration', strict: true },
    });
  });

  it('cùng chữ với gọi trực tiếp, không có cache_control', () => {
    const body = openRouterAdapter.body(request(openrouter()));
    expect((body['messages'] as Array<{ content: unknown }>)[1].content).toBe('kịch bản câu người chơi');
    expect(JSON.stringify(body)).not.toContain('cache_control');
  });
});

describe('OpenRouter — đọc kết quả', () => {
  it('chuẩn hoá số token, kể cả cache_write_tokens', () => {
    const reply = openRouterAdapter.read({
      id: 'gen-1',
      choices: [{ message: { content: '{}' }, finish_reason: 'stop' }],
      usage: {
        prompt_tokens: 3000,
        completion_tokens: 90,
        cost: 0.0003,
        prompt_tokens_details: { cached_tokens: 2048, cache_write_tokens: 100 },
        completion_tokens_details: { reasoning_tokens: 0 },
      },
    });
    expect(reply.usage).toEqual({ input: 3000, cachedInput: 2048, cacheWrite: 100, output: 90, reasoning: 0 });
  });

  it('HTTP 200 có error trong body: lỗi, không phải câu rỗng', () => {
    expect(() => openRouterAdapter.read({ error: { code: 502, message: 'Provider returned error' } })).toThrow(
      expect.objectContaining({ kind: 'server', status: 502 }),
    );
  });

  it('HTTP 200 có error trong choice, finish_reason "error"', () => {
    expect(() =>
      openRouterAdapter.read({
        choices: [{ message: { content: 'nửa câu' }, finish_reason: 'error', error: { code: 429, message: 'chậm lại' } }],
      }),
    ).toThrow(expect.objectContaining({ kind: 'rate_limited' }));
  });

  it('content_filter thì dừng, không đẩy nội dung sang chỗ khác', () => {
    expect(() =>
      openRouterAdapter.read({ choices: [{ message: { content: '' }, finish_reason: 'content_filter' }] }),
    ).toThrow(expect.objectContaining({ kind: 'content_filtered' }));
  });
});

describe('OpenRouter — phân loại lỗi', () => {
  it.each([
    [400, 'Invalid parameter', 'bad_request'],
    [401, 'User not found.', 'auth'],
    [402, 'Insufficient credits', 'quota'],
    [403, 'Your input was flagged by moderation', 'content_filtered'],
    [403, 'Key not allowed', 'auth'],
    [404, 'No endpoints found matching your data policy', 'bad_request'],
    [408, 'Timed out', 'timeout'],
    [429, 'Rate limited', 'rate_limited'],
    [502, 'Provider returned error', 'server'],
    [503, 'No available provider', 'overloaded'],
  ] as const)('%i %s → %s', (status, message, kind) => {
    expect(openRouterAdapter.error(status, { error: { code: status, message } }).kind).toBe(kind);
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
