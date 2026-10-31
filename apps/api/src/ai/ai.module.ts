/**
 * Phần AI của API: gateway gọi model và người dẫn truyện (AI-4).
 *
 * Chưa có controller nào: AI-4 được gọi từ luồng chơi, mà luồng chơi có AI
 * còn chờ nhóm chốt thời điểm chấm so với lúc hỏi đào sâu. Module xuất
 * `NarratorService` để luồng ấy dùng khi chốt xong.
 */
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiEnv, Env } from '../config/env';
import { CircuitBreaker } from './gateway/circuit-breaker';
import { ModelGateway } from './gateway/model-gateway';
import { narratorChain, type AiSettings } from './gateway/models';
import { NARRATOR_CHAIN, NarratorService } from './narrator/narrator.service';

export const AI_SETTINGS = Symbol('AI_SETTINGS');

/** Dùng chung cho module và cho script chạy thử. */
export function aiSettingsFromEnv(env: AiEnv): AiSettings {
  return {
    qwen: env.QWEN_API_KEY
      ? {
          apiKey: env.QWEN_API_KEY,
          region: env.QWEN_REGION,
          workspaceId: env.QWEN_WORKSPACE_ID,
          baseUrl: env.QWEN_BASE_URL,
          cacheMode: env.QWEN_CACHE_MODE,
        }
      : undefined,
    deepseek: env.DEEPSEEK_API_KEY ? { apiKey: env.DEEPSEEK_API_KEY } : undefined,
    allowUnconfirmedProviders: env.AI_ALLOW_UNCONFIRMED_PROVIDERS,
  };
}

function aiSettingsFromConfig(config: ConfigService<Env, true>): AiSettings {
  const get = <K extends keyof AiEnv>(key: K) => config.get(key, { infer: true });
  return aiSettingsFromEnv({
    QWEN_API_KEY: get('QWEN_API_KEY'),
    QWEN_REGION: get('QWEN_REGION'),
    QWEN_WORKSPACE_ID: get('QWEN_WORKSPACE_ID'),
    QWEN_BASE_URL: get('QWEN_BASE_URL'),
    QWEN_CACHE_MODE: get('QWEN_CACHE_MODE'),
    DEEPSEEK_API_KEY: get('DEEPSEEK_API_KEY'),
    AI_ALLOW_UNCONFIRMED_PROVIDERS: get('AI_ALLOW_UNCONFIRMED_PROVIDERS'),
  });
}

@Module({
  providers: [
    { provide: AI_SETTINGS, inject: [ConfigService], useFactory: aiSettingsFromConfig },
    {
      provide: ModelGateway,
      inject: [AI_SETTINGS],
      useFactory: (settings: AiSettings) =>
        new ModelGateway({
          qwen: settings.qwen?.apiKey,
          deepseek: settings.deepseek?.apiKey,
        }),
    },
    { provide: CircuitBreaker, useFactory: () => new CircuitBreaker() },
    {
      provide: NARRATOR_CHAIN,
      inject: [AI_SETTINGS],
      useFactory: (settings: AiSettings) => {
        const { chain, excluded } = narratorChain(settings);
        const logger = new Logger('AI-4');
        // Nói rõ lúc khởi động model nào bị loại và vì sao — thay vì để tới
        // lượt chơi đầu tiên mới biết không có dự phòng.
        for (const { provider, reason } of excluded)
          logger.warn(`Không dùng ${provider}: ${reason}`);
        logger.log(
          chain.length > 0
            ? `Chuỗi dẫn truyện: ${chain.map((s) => s.key).join(' → ')}`
            : 'Chưa có model dẫn truyện nào dùng được',
        );
        return chain;
      },
    },
    NarratorService,
  ],
  exports: [NarratorService],
})
export class AiModule {}
