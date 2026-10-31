import { narratorChain, qwenBaseUrl, qwenFlash } from './models';

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

  it('giá chưa đối chiếu lại thì đánh dấu chưa kiểm', () => {
    expect(qwenFlash(qwen).price.verified).toBe(false);
  });
});
