/**
 * CL-05 `ScenarioModule` (API + worker): mở, giao, soạn, sinh bằng AI, kiểm,
 * nộp scenario (SD-05). Chỉ đổi trạng thái qua `LifecycleModule`.
 * `GenerationProcessor` chỉ đăng ký ở `WorkerModule`.
 */
import { Module, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { FakeScenarioGenerator } from '../ai/generation/fake-scenario-generator';
import { SCENARIO_GENERATOR } from '../ai/generation/generation.types';
import { ScenarioGeneratorService } from '../ai/generation/scenario-generator.service';
import { AuthModule } from '../auth/auth.module';
import { aiModeOf, type Env } from '../config/env';
import { LifecycleModule } from '../lifecycle/lifecycle.module';
import { ReviewModule } from '../review/review.module';
import { ContentService } from './content.service';
import { GenerationService } from './generation.service';
import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';

/** `live` qua gateway; `fake` chỉ khi dev (`AI_MODE`, D-92). */
export const scenarioGeneratorProvider: Provider = {
  provide: SCENARIO_GENERATOR,
  inject: [ConfigService, ScenarioGeneratorService],
  useFactory: (
    config: ConfigService<Env, true>,
    live: ScenarioGeneratorService,
  ) =>
    aiModeOf({
      AI_MODE: config.get('AI_MODE', { infer: true }),
      NODE_ENV: config.get('NODE_ENV', { infer: true }),
    }) === 'fake'
      ? new FakeScenarioGenerator()
      : live,
};

@Module({
  imports: [AuthModule, LifecycleModule, ReviewModule, AiModule],
  controllers: [ScenarioController],
  providers: [
    ScenarioService,
    ContentService,
    GenerationService,
    scenarioGeneratorProvider,
  ],
  exports: [ScenarioService, SCENARIO_GENERATOR],
})
export class ScenarioModule {}
