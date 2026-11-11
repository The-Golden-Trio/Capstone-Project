import { gatewayKeys, narratorChain, openRouterQwenFlash, qwenBaseUrl, qwenFlash } from './models';

const qwen = { apiKey: 'k', region: 'eu-central-1', workspaceId: 'ws1', cacheMode: 'implicit' } as const;

describe('chuỗi dẫn truyện', () => {
  it('mặc định loại DeepSeek vì chưa có cam kết không huấn luyện, và nói rõ lý do', () => {
    const { chain, excluded } = narratorChain({ qwen, deepseek: { apiKey: 'd' }, allowUnconfirmedProviders: false });
    expect(chain.map((s) => s.provider)).toEqual(['qwen']);
    expect(excluded).toEqual([
      expect.objectContaining({ provider: 'deepseek', reason: expect.stringContaining('cam kết') }),
    ]);
  });

  it('chỉ dùng DeepSeek khi cố ý cho phép (thử bằng dữ liệu giả)', () => {
    const { chain } = narratorChain({ qwen, deepseek: { apiKey: 'd' }, allowUnconfirmedProviders: true });
    expect(chain.map((s) => s.provider)).toEqual(['qwen', 'deepseek']);
  });

  it('không có key thì chuỗi rỗng, không lỗi', () => {
    expect(narratorChain({ allowUnconfirmedProviders: false }).chain).toEqual([]);
  });

  it('chỉ cần key OpenRouter là có model', () => {
    const { chain } = narratorChain({ openrouter: { apiKey: 'o' }, allowUnconfirmedProviders: false });
    expect(chain.map((s) => s.key)).toEqual(['qwen3.8-flash@openrouter']);
  });

  it('thứ tự: Qwen trực tiếp, OpenRouter, DeepSeek', () => {
    const { chain } = narratorChain({
      qwen,
      openrouter: { apiKey: 'o' },
      deepseek: { apiKey: 'd' },
      allowUnconfirmedProviders: true,
    });
    expect(chain.map((s) => s.provider)).toEqual(['qwen', 'openrouter', 'deepseek']);
  });

  it('thiếu workspace không làm sập API lúc khởi động: loại model, nói rõ lý do', () => {
    const { chain, excluded } = narratorChain({
      qwen: { ...qwen, workspaceId: undefined },
      allowUnconfirmedProviders: false,
    });
    expect(chain).toEqual([]);
    expect(excluded[0]).toEqual(
      expect.objectContaining({ provider: 'qwen', reason: expect.stringContaining('QWEN_WORKSPACE_ID') }),
    );
  });

  it('gateway nhận key của cả ba hãng', () => {
    expect(
      gatewayKeys({ qwen, openrouter: { apiKey: 'o' }, deepseek: { apiKey: 'd' }, allowUnconfirmedProviders: false }),
    ).toEqual({ qwen: 'k', openrouter: 'o', deepseek: 'd' });
  });
});

describe('Qwen theo region', () => {
  it('endpoint theo workspace', () => {
    expect(qwenBaseUrl(qwen)).toBe('https://ws1.eu-central-1.maas.aliyuncs.com/compatible-mode/v1');
  });

  it('Singapore không cần workspace nhưng không có JSON Schema strict', () => {
    const spec = qwenFlash({ ...qwen, region: 'ap-southeast-1', workspaceId: undefined });
    expect(spec.baseUrl).toBe('https://dashscope-intl.aliyuncs.com/compatible-mode/v1');
    expect(spec.supports.jsonSchema).toBe(false);
  });

  it('region khác Singapore mà thiếu workspace thì báo lỗi lúc khởi động', () => {
    expect(() => qwenFlash({ ...qwen, workspaceId: undefined })).toThrow(/QWEN_WORKSPACE_ID/);
  });

  it('giá đã đối chiếu trang giá; tỉ lệ cache của model này chưa công bố nên để trống', () => {
    const { price } = qwenFlash(qwen);
    expect(price.verified).toBe(true);
    expect(price.cachedInputRatio).toBeNull();
    expect(price.cacheWriteRatio).toBeNull();
  });

  it('QWEN_JSON_MODE đè cách suy theo region', () => {
    expect(qwenFlash({ ...qwen, jsonMode: 'object' }).supports.jsonSchema).toBe(false);
    expect(
      qwenFlash({ ...qwen, region: 'ap-southeast-1', workspaceId: undefined, jsonMode: 'schema' }).supports.jsonSchema,
    ).toBe(true);
  });

  it('endpoint không có dấu / thừa ở cuối', () => {
    expect(qwenBaseUrl({ ...qwen, baseUrl: 'https://a.example/compatible-mode/v1/' })).toBe(
      'https://a.example/compatible-mode/v1',
    );
    expect(openRouterQwenFlash({ apiKey: 'o', baseUrl: 'https://b.example/v1/' }, { allowDataCollection: false }).baseUrl).toBe(
      'https://b.example/v1',
    );
  });
});

describe('Qwen qua OpenRouter', () => {
  const spec = (allowDataCollection: boolean) => openRouterQwenFlash({ apiKey: 'o' }, { allowDataCollection });

  it('đúng id model, cùng họ qwen, chỉ Alibaba phục vụ', () => {
    expect(spec(false)).toMatchObject({
      model: 'qwen/qwen3.8-flash',
      family: 'qwen',
      baseUrl: 'https://openrouter.ai/api/v1',
      routing: { only: ['alibaba'], dataCollection: 'deny' },
    });
  });

  it('chỉ cho thu thập dữ liệu khi cố ý cho phép', () => {
    expect(spec(true).routing?.dataCollection).toBe('allow');
  });
});
