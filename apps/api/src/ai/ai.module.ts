/**
 * Phần AI của API: gateway gọi model và người dẫn truyện (AI-4).
 *
 * Chưa có controller nào. `NarratorService` (AI-4 bản 1) chưa nối vào luồng
 * chơi cũ. Luồng ca làm (`AssessmentModule`) dùng `ShiftNarratorService`
 * (AI-4 bản 2, nháp D-130) và `ShiftCheckerService` (bộ phán có/không).
 */
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiEnv, Env } from '../config/env';
import { CircuitBreaker } from './gateway/circuit-breaker';
import { ModelGateway } from './gateway/model-gateway';
import { gatewayKeys, narratorChain, type AiSettings } from './gateway/models';
import { NARRATOR_CHAIN, NarratorService } from './narrator/narrator.service';
import { ShiftCheckerService } from './shift/checker.service';
import { ShiftNarratorService } from './shift/shift-narrator.service';

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
          jsonMode: env.QWEN_JSON_MODE,
        }
      : undefined,
    openrouter: env.OPENROUTER_API_KEY
      ? { apiKey: env.OPENROUTER_API_KEY, baseUrl: env.OPENROUTER_BASE_URL }
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
    QWEN_JSON_MODE: get('QWEN_JSON_MODE'),
    OPENROUTER_API_KEY: get('OPENROUTER_API_KEY'),
    OPENROUTER_BASE_URL: get('OPENROUTER_BASE_URL'),
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
      useFactory: (settings: AiSettings) => new ModelGateway(gatewayKeys(settings)),
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
    ShiftNarratorService,
    ShiftCheckerService,
  ],
  exports: [NarratorService, ShiftNarratorService, ShiftCheckerService],
})
export class AiModule {}
