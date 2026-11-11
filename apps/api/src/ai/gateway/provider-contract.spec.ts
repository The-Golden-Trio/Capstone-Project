/**
 * Toàn bộ đường gọi thật, không giả ở tầng nào của mình: `NarratorService` →
 * adapter → `fetch` → HTTP trên localhost → máy chủ khắt khe theo tài liệu hãng
 * (`strict-provider.ts`). Body nào hãng nói sẽ từ chối thì ở đây cũng bị 400.
 *
 * Đây là phần chứng minh được khi chưa có key. Phần còn lại (key đúng region,
 * tài khoản đã kích hoạt, hãng có làm đúng tài liệu) do `--mode=check` kiểm.
 */
import { fixtureData } from '@datn/game-core/testing';
import { NARRATOR_PROFILE } from '../narrator/narrator.profile';
import { narrationJsonSchema } from '@datn/game-core';
import { NarratorService } from '../narrator/narrator.service';
import { buildNarratorMessages } from '../narrator/narrator.prompt';
import { narratorView } from '@datn/game-core';
import {
  SAMPLE_ACTIVITY_ID,
  SAMPLE_ANSWERS,
  SAMPLE_SCENARIO_KEY,
  transcriptBefore,
} from '../testing/sample-turn';
import {
  okResponse,
  openRouterViolations,
  qwenViolations,
  startStrictProvider,
  VALID_LINE,
  type StrictProvider,
  type StrictProviderOptions,
} from '../testing/strict-provider';
import { CircuitBreaker } from './circuit-breaker';
import type { ModelSpec } from './gateway.types';
import { ModelGateway, fetchTransport } from './model-gateway';
import { gatewayKeys, narratorChain, openRouterQwenFlash, qwenFlash, type QwenSettings } from './models';

const scenario = fixtureData().scenarios[SAMPLE_SCENARIO_KEY];
const KEY = 'sk-that-su-la-key';

let server: StrictProvider | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

const start = async (options: Omit<StrictProviderOptions, 'apiKey'>) => {
  server = await startStrictProvider({ apiKey: KEY, ...options });
  return server;
};

const service = (spec: ModelSpec, key = KEY) =>
  new NarratorService(
    new ModelGateway({ [spec.provider]: key }, fetchTransport),
    new CircuitBreaker(),
    [spec],
  );

const narrate = (s: NarratorService) =>
  s.narrate({
    scenario,
    activityId: SAMPLE_ACTIVITY_ID,
    transcript: transcriptBefore(scenario, SAMPLE_ACTIVITY_ID),
    answer: SAMPLE_ANSWERS.dung_kich_ban,
    followUpAllowed: true,
  });

const qwenSpec = (baseUrl: string, over: Partial<QwenSettings> = {}) =>
  qwenFlash({ apiKey: KEY, region: 'ap-southeast-1', baseUrl, cacheMode: 'implicit', ...over });

describe('Qwen trực tiếp: request thật qua HTTP', () => {
  it('chỉ có key (Singapore, json_object): chạy tới câu được nhận', async () => {
    const { url } = await start({ provider: 'qwen', allowSchema: false });
    const result = await narrate(service(qwenSpec(url)));
    expect(result.status).toBe('ok');
    expect(result.records[0]).toMatchObject({ outcome: 'accepted', error: null });
    expect(result.records[0].usage).toMatchObject({ input: 3019, cachedInput: 2048, output: 104 });
  });

  it('Frankfurt, JSON Schema strict: body hợp lệ với schema thật của kịch bản', async () => {
    const { url, received } = await start({ provider: 'qwen', allowSchema: true });
    const result = await narrate(service(qwenSpec(url, { region: 'eu-central-1', workspaceId: 'ws' })));
    expect(result.status).toBe('ok');
    expect(received[0]['response_format']).toMatchObject({ type: 'json_schema' });
  });

  it('cache explicit: content dạng mảng, điểm cache đúng chỗ', async () => {
    const { url, received } = await start({ provider: 'qwen' });
    const result = await narrate(service(qwenSpec(url, { region: 'eu-central-1', workspaceId: 'ws', cacheMode: 'explicit' })));
    expect(result.status).toBe('ok');
    const user = (received[0]['messages'] as Array<{ role: string; content: unknown }>)[1];
    expect(Array.isArray(user.content)).toBe(true);
  });

  it('gửi trần 600 token, tắt thinking', async () => {
    const { url, received } = await start({ provider: 'qwen', allowSchema: false });
    await narrate(service(qwenSpec(url)));
    expect(received[0]).toMatchObject({ max_completion_tokens: 600, enable_thinking: false, stream: false, temperature: 0.7 });
  });

  it('bắt viết lại: message nối thêm vẫn hợp lệ với hãng', async () => {
    const { url, received } = await start({
      provider: 'qwen',
      allowSchema: false,
      reply: (_, i) => ({
        json: okResponse('qwen', i === 0 ? JSON.stringify({ speaker: 'an', follow_up: 'Em sửa trong 15 phút nhé.' }) : VALID_LINE),
      }),
    });
    const result = await narrate(service(qwenSpec(url)));
    expect(result.status).toBe('ok');
    expect(result.records.map((r) => r.outcome)).toEqual(['rejected', 'accepted']);
    expect((received[1]['messages'] as unknown[]).length).toBe(4);
  });

  it('nếu code gửi JSON Schema ở Singapore thì máy chủ từ chối, tức phép thử có tác dụng', async () => {
    const { url } = await start({ provider: 'qwen', allowSchema: false });
    const result = await narrate(service(qwenSpec(url, { jsonMode: 'schema' })));
    expect(result.status).toBe('unavailable');
    expect(result.records[0].error).toMatchObject({ kind: 'bad_request', status: 400 });
  });
});

describe('Qwen qua OpenRouter: request thật qua HTTP', () => {
  const spec = (baseUrl: string) => openRouterQwenFlash({ apiKey: KEY, baseUrl }, { allowDataCollection: false });

  it('chỉ có key: chạy tới câu được nhận', async () => {
    const { url, received } = await start({ provider: 'openrouter' });
    const result = await narrate(service(spec(url)));
    expect(result.status).toBe('ok');
    expect(received[0]).toMatchObject({ max_tokens: 600, reasoning: { effort: 'none' }, temperature: 0.7 });
    expect(result.records[0].cost?.basis).toBe('list');
  });

  it('HTTP 200 có error trong body: đổi model, không bắt viết lại', async () => {
    const { url, received } = await start({
      provider: 'openrouter',
      reply: () => ({ json: { error: { code: 502, message: 'Provider returned error' } } }),
    });
    const result = await narrate(service(spec(url)));
    expect(result.status).toBe('unavailable');
    expect(received).toHaveLength(1);
    expect(result.records[0].error).toMatchObject({ kind: 'server' });
  });
});

describe('lỗi thật qua HTTP', () => {
  it('sai key: báo auth, không thử lại vô ích', async () => {
    const { url, received } = await start({ provider: 'qwen', allowSchema: false });
    const result = await narrate(service(qwenSpec(url), 'sk-sai'));
    expect(result.status).toBe('unavailable');
    expect(result.records[0].error).toMatchObject({ kind: 'auth', status: 401 });
    expect(received).toHaveLength(0);
  });

  it('hết tiền', async () => {
    const { url } = await start({
      provider: 'qwen',
      allowSchema: false,
      reply: () => ({ status: 403, json: { error: { code: 'Arrearage', message: 'Access denied, please make sure your account is in good standing.' } } }),
    });
    const result = await narrate(service(qwenSpec(url)));
    expect(result.records[0].error).toMatchObject({ kind: 'quota' });
  });

  it('bộ lọc nội dung: trả blocked, không thử lại', async () => {
    const { url, received } = await start({
      provider: 'qwen',
      allowSchema: false,
      reply: () => ({ status: 400, json: { error: { code: 'data_inspection_failed', message: 'Input or output data may contain inappropriate content.' } } }),
    });
    const result = await narrate(service(qwenSpec(url)));
    expect(result.status).toBe('blocked');
    expect(received).toHaveLength(1);
  });

  it('gateway trả trang HTML thay vì JSON: không vỡ', async () => {
    const { url } = await start({
      provider: 'qwen',
      allowSchema: false,
      reply: () => ({ status: 502, raw: '<html>Bad Gateway</html>' }),
    });
    const result = await narrate(service(qwenSpec(url)));
    expect(result.status).toBe('unavailable');
    expect(result.records[0].error).toMatchObject({ kind: 'server', status: 502 });
  });

  it('không nối được máy chủ: báo network', async () => {
    const { url } = await start({ provider: 'qwen', allowSchema: false });
    await server?.close();
    server = undefined;
    const result = await narrate(service(qwenSpec(url)));
    expect(result.records[0].error).toMatchObject({ kind: 'network' });
  });

  it('quá giờ thật: AbortSignal cắt được request đang chờ', async () => {
    const { url } = await start({
      provider: 'qwen',
      allowSchema: false,
      reply: () => ({ delayMs: 500, json: okResponse('qwen', VALID_LINE) }),
    });
    const view = narratorView(scenario, SAMPLE_ACTIVITY_ID);
    const spec = qwenSpec(url);
    await expect(
      new ModelGateway({ qwen: KEY }, fetchTransport).complete({
        model: spec,
        messages: buildNarratorMessages(
          { view, activityId: SAMPLE_ACTIVITY_ID, transcript: [], answer: 'x' },
          'qwen',
        ),
        temperature: 0.7,
        maxOutputTokens: NARRATOR_PROFILE.maxOutputTokens.qwen,
        json: { name: 'narration', schema: narrationJsonSchema(['an']) },
        timeoutMs: 50,
      }),
    ).rejects.toMatchObject({ kind: 'timeout' });
  });
});

describe('cấu hình từ .env tới request', () => {
  it('chỉ đặt key: chuỗi có Qwen Singapore, gateway có đúng key', () => {
    const settings = {
      qwen: { apiKey: KEY, region: 'ap-southeast-1', cacheMode: 'implicit' } as const,
      allowUnconfirmedProviders: false,
    };
    const { chain } = narratorChain(settings);
    expect(chain[0].baseUrl).toBe('https://dashscope-intl.aliyuncs.com/compatible-mode/v1');
    expect(gatewayKeys(settings).qwen).toBe(KEY);
  });
});

describe('bộ kiểm khắt khe thật sự bắt lỗi — kiểm chính phép thử', () => {
  const good = {
    model: 'qwen3.8-flash',
    messages: [{ role: 'user', content: 'trả về json' }],
    temperature: 0.7,
    max_completion_tokens: 600,
    enable_thinking: false,
    response_format: { type: 'json_object' },
    stream: false,
  };
  const options = { allowSchema: true };

  it('body đúng thì không có vi phạm', () => {
    expect(qwenViolations(good, options)).toEqual([]);
  });

  it.each([
    ['thiếu enable_thinking', { enable_thinking: undefined }],
    ['bật thinking', { enable_thinking: true }],
    ['dùng max_tokens', { max_tokens: 300 }],
    ['thêm top_p', { top_p: 0.8 }],
    ['temperature bằng 2', { temperature: 2 }],
    ['sai tên model', { model: 'qwen-flash' }],
    ['stream', { stream: true }],
    ['role lạ', { messages: [{ role: 'developer', content: 'json' }] }],
    ['json_object mà không có chữ json', { messages: [{ role: 'user', content: 'xin chào' }] }],
    [
      'schema dùng từ khoá bị cấm',
      { response_format: { type: 'json_schema', json_schema: { name: 'a', schema: { uniqueItems: true } } } },
    ],
    ['schema thiếu name', { response_format: { type: 'json_schema', json_schema: { schema: {} } } }],
  ])('Qwen: %s', (_, change) => {
    const body = { ...good, ...change } as Record<string, unknown>;
    for (const key of Object.keys(body)) if (body[key] === undefined) delete body[key];
    expect(qwenViolations(body, options).length).toBeGreaterThan(0);
  });

  const goodRouter = {
    model: 'qwen/qwen3.8-flash',
    messages: [{ role: 'user', content: 'trả về json' }],
    temperature: 0.7,
    max_tokens: 600,
    reasoning: { effort: 'none' },
    response_format: { type: 'json_object' },
    provider: { only: ['alibaba'], allow_fallbacks: false, require_parameters: true, data_collection: 'deny' },
    stream: false,
  };

  it('OpenRouter: body đúng thì không có vi phạm', () => {
    expect(openRouterViolations(goodRouter)).toEqual([]);
  });

  it.each([
    ['dùng enable_thinking', { enable_thinking: false }],
    ['không tắt suy nghĩ', { reasoning: { exclude: true } }],
    ['sai id model', { model: 'qwen3.8-flash' }],
    ['cho đổi hãng', { provider: { ...goodRouter.provider, allow_fallbacks: true } }],
    ['không khoá Alibaba', { provider: { ...goodRouter.provider, only: [] } }],
    ['trường lạ trong provider', { provider: { ...goodRouter.provider, foo: 1 } }],
  ])('OpenRouter: %s', (_, change) => {
    expect(openRouterViolations({ ...goodRouter, ...change }).length).toBeGreaterThan(0);
  });
});
