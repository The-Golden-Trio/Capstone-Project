/**
 * Chỉ cần key là API khởi động và có `NarratorService`, đi qua đúng đường cấu
 * hình thật: biến môi trường → `loadEnv` → `ConfigService` → `AiModule`.
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { loadEnv } from '../config/env';
import { AiModule } from './ai.module';
import { NARRATOR_CHAIN, NarratorService } from './narrator/narrator.service';
import type { ModelSpec } from './gateway/gateway.types';

const REQUIRED = {
  DATABASE_URL: 'postgres://x',
  DIRECT_URL: 'postgres://x',
  GOOGLE_CLIENT_ID: 'x',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  JWT_REFRESH_SECRET: 'x'.repeat(32),
};

async function chainFor(ai: Record<string, string>): Promise<ModelSpec[]> {
  // Thay `ConfigService` bằng bản chỉ đọc đúng biến của ca này, dựng bằng
  // `loadEnv` của app. Không để `.env` thật của máy lọt vào test.
  const env = loadEnv({ ...REQUIRED, ...ai } as NodeJS.ProcessEnv);
  const moduleRef = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), AiModule],
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: keyof typeof env) => env[key] })
    .setLogger(false as never)
    .compile();
  expect(moduleRef.get(NarratorService)).toBeInstanceOf(NarratorService);
  return moduleRef.get<ModelSpec[]>(NARRATOR_CHAIN);
}

describe('AiModule khởi động từ biến môi trường', () => {
  it('không có key: API vẫn chạy, chuỗi rỗng', async () => {
    expect(await chainFor({})).toEqual([]);
  });

  it('chỉ có QWEN_API_KEY: Qwen Singapore, json_object', async () => {
    const [spec] = await chainFor({ QWEN_API_KEY: 'sk-a' });
    expect(spec).toMatchObject({
      key: 'qwen3.8-flash@ap-southeast-1',
      baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      supports: { jsonSchema: false },
    });
  });

  it('dòng để trống trong .env coi như không đặt', async () => {
    const [spec] = await chainFor({ QWEN_API_KEY: 'sk-a', QWEN_REGION: '', QWEN_WORKSPACE_ID: '', QWEN_BASE_URL: '', QWEN_JSON_MODE: '' });
    expect(spec.key).toBe('qwen3.8-flash@ap-southeast-1');
  });

  it('chỉ có OPENROUTER_API_KEY: Qwen qua OpenRouter', async () => {
    const [spec] = await chainFor({ OPENROUTER_API_KEY: 'sk-or-a' });
    expect(spec).toMatchObject({ provider: 'openrouter', model: 'qwen/qwen3.8-flash', supports: { jsonSchema: true } });
  });

  it('Frankfurt có workspace: JSON Schema strict', async () => {
    const [spec] = await chainFor({ QWEN_API_KEY: 'sk-a', QWEN_REGION: 'eu-central-1', QWEN_WORKSPACE_ID: 'ws1' });
    expect(spec).toMatchObject({
      baseUrl: 'https://ws1.eu-central-1.maas.aliyuncs.com/compatible-mode/v1',
      supports: { jsonSchema: true },
    });
  });

  it('Frankfurt thiếu workspace: API không sập, chỉ không có model', async () => {
    expect(await chainFor({ QWEN_API_KEY: 'sk-a', QWEN_REGION: 'eu-central-1' })).toEqual([]);
  });

  it('key gói sk-sp-: chưa kiểm được điều khoản dữ liệu, chỉ chạy khi cố ý cho phép', async () => {
    const env = { QWEN_API_KEY: 'sk-sp-a', QWEN_BASE_URL: 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1' };
    expect(await chainFor(env)).toEqual([]);
    const [spec] = await chainFor({ ...env, AI_ALLOW_UNCONFIRMED_PROVIDERS: 'true' });
    expect(spec.dataPolicy.noTraining).toBe('not_found');
  });

  it('dán nguyên API Host vào QWEN_BASE_URL', async () => {
    const [spec] = await chainFor({ QWEN_API_KEY: 'sk-a', QWEN_BASE_URL: 'https://ws9.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/' });
    expect(spec.baseUrl).toBe('https://ws9.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1');
  });

  it('region gõ sai: báo tên biến lúc khởi động', () => {
    expect(() => loadEnv({ ...REQUIRED, QWEN_REGION: 'singapore' } as NodeJS.ProcessEnv)).toThrow(/QWEN_REGION/);
  });
});
