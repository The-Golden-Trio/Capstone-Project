/**
 * CL-04 AssessmentModule (worker): phần AI của lượt ca làm.
 *
 * `forApi()`: API dùng để lưu lượt và đẩy job; không xử lý job.
 * `forWorker()`: worker nạp thêm `TurnProcessor` và `TurnWorker` (nhận job BullMQ).
 * Cổng AI chọn theo `AI_MODE`: `live` qua model gateway, `fake` chỉ khi dev.
 */
import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { FakeShiftChecker, FakeShiftNarrator } from '../ai/shift/fake';
import { ShiftCheckerService } from '../ai/shift/checker.service';
import { ShiftNarratorService } from '../ai/shift/shift-narrator.service';
import { SHIFT_CHECKER, SHIFT_NARRATOR } from '../ai/shift/types';
import { aiModeOf, type Env } from '../config/env';
import { AssessmentService } from './assessment.service';
import { RunStore } from './run-store.service';
import { TurnProcessor } from './turn.processor';
import { TurnWorker } from './turn.worker';

const mode = (config: ConfigService<Env, true>) =>
  aiModeOf({
    AI_MODE: config.get('AI_MODE', { infer: true }),
    NODE_ENV: config.get('NODE_ENV', { infer: true }),
  });

const ports: Provider[] = [
  {
    provide: SHIFT_NARRATOR,
    inject: [ConfigService, ShiftNarratorService],
    useFactory: (
      config: ConfigService<Env, true>,
      live: ShiftNarratorService,
    ) => (mode(config) === 'fake' ? new FakeShiftNarrator() : live),
  },
  {
    provide: SHIFT_CHECKER,
    inject: [ConfigService, ShiftCheckerService],
    useFactory: (
      config: ConfigService<Env, true>,
      live: ShiftCheckerService,
    ) => (mode(config) === 'fake' ? new FakeShiftChecker() : live),
  },
];

@Module({})
export class AssessmentModule {
  static forApi(): DynamicModule {
    return {
      module: AssessmentModule,
      imports: [AiModule],
      providers: [RunStore, AssessmentService, ...ports],
      exports: [RunStore, AssessmentService],
    };
  }

  static forWorker(): DynamicModule {
    return {
      module: AssessmentModule,
      imports: [AiModule],
      providers: [
        RunStore,
        AssessmentService,
        TurnProcessor,
        TurnWorker,
        ...ports,
      ],
      exports: [RunStore],
    };
  }
}
