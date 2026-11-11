/**
 * Lỗi lúc gắn key phải chỉ ra việc cần làm. Thông báo không kèm hướng xử lý
 * thì người gắn key vẫn phải đi đọc trang mã lỗi của hãng.
 */
import { keyWarnings, explainGatewayError } from './diagnose';
import { qwenAdapter, openRouterAdapter } from './adapters';

const qwen = (status: number, code: string, message = 'x') =>
  explainGatewayError(qwenAdapter.error(status, { error: { code, message } }));
const openrouter = (status: number, message: string) =>
  explainGatewayError(openRouterAdapter.error(status, { error: { code: status, message } }));

describe('key dán nhầm chỗ', () => {
  const base = { allowUnconfirmedProviders: false };
  const qwenKey = (apiKey: string) => ({ apiKey, region: 'ap-southeast-1', cacheMode: 'implicit' }) as const;

  it('key OpenRouter ở QWEN_API_KEY', () => {
    expect(keyWarnings({ ...base, qwen: qwenKey('sk-or-v1-abc') })[0]).toContain('OPENROUTER_API_KEY');
  });

  it('key Alibaba ở OPENROUTER_API_KEY', () => {
    expect(keyWarnings({ ...base, openrouter: { apiKey: 'sk-abc' } })[0]).toContain('QWEN_API_KEY');
  });

  it('key gói sk-sp-: chỉ đúng endpoint của gói', () => {
    const [warning] = keyWarnings({ ...base, qwen: qwenKey('sk-sp-abc') });
    expect(warning).toContain('token-plan');
  });

  it('có khoảng trắng ở giữa', () => {
    expect(keyWarnings({ ...base, qwen: qwenKey('sk-a b') })[0]).toContain('khoảng trắng');
  });

  it('key đúng chỗ thì không cảnh báo', () => {
    expect(keyWarnings({ ...base, qwen: qwenKey('sk-abc'), openrouter: { apiKey: 'sk-or-v1-abc' } })).toEqual([]);
  });

  it('không in key ra', () => {
    const warnings = keyWarnings({ ...base, qwen: qwenKey('sk-or-BI-MAT') }).join(' ');
    expect(warnings).not.toContain('BI-MAT');
  });
});

describe('Qwen: lỗi → việc cần làm', () => {
  it.each([
    [401, 'invalid_api_key', 'QWEN_REGION'],
    [404, 'WorkSpaceNotFound', 'QWEN_WORKSPACE_ID'],
    [403, 'Arrearage', 'nạp'],
    [403, 'AllocationQuota.FreeTierOnly', 'miễn phí'],
    [403, 'AccessDenied.Unpurchased', 'kích hoạt'],
    [404, 'model_not_found', 'qwen3.8-flash'],
    [429, 'Throttling.RateQuota', 'Chờ một phút'],
  ])('%i %s nhắc tới "%s"', (status, code, expected) => {
    expect(qwen(status, code)).toContain(expected);
  });

  it('region từ chối JSON Schema thì chỉ cách đổi, không cần sửa code', () => {
    expect(qwen(400, 'InvalidParameter', 'json_schema is not supported')).toContain('QWEN_JSON_MODE=object');
  });
});

describe('OpenRouter: lỗi → việc cần làm', () => {
  it.each([
    [401, 'User not found.', 'openrouter.ai/keys'],
    [402, 'Insufficient credits', 'credits'],
    [404, 'No endpoints found', 'data_collection'],
    [503, 'No available provider', 'data_collection'],
    [400, 'Bad param', 'openRouterAdapter'],
  ])('%i %s nhắc tới "%s"', (status, message, expected) => {
    expect(openrouter(status, message)).toContain(expected);
  });
});
