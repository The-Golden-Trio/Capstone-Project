/**
 * Chấm và hỏi vặn (CL-04 `AssessmentModule`). API dùng `AssessmentService` để
 * ghi việc chấm và đẩy vào queue; worker đăng ký thêm `GradingProcessor`
 * (xem `worker.module.ts`). Module này không biết gì về controller hay HTTP.
 */
import { Module, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { ShiftCheckerService } from '../ai/shift/checker.service';
import { FakeShiftChecker, FakeShiftNarrator } from '../ai/shift/fake';
import { SHIFT_CHECKER, SHIFT_NARRATOR } from '../ai/shift/types';
import { aiModeOf, type Env } from '../config/env';
import { ShiftSceneNarrator } from './shift-scene';
import { AssessmentService } from './assessment.service';
import { FollowUpService } from './follow-up.service';

/** Cổng AI của ca làm: `live` qua gateway, `fake` chỉ khi dev (`AI_MODE`, D-92). */
const mode = (config: ConfigService<Env, true>) =>
  aiModeOf({
    AI_MODE: config.get('AI_MODE', { infer: true }),
    NODE_ENV: config.get('NODE_ENV', { infer: true }),
  });

const shiftPorts: Provider[] = [
  ShiftSceneNarrator,
  {
    provide: SHIFT_NARRATOR,
    inject: [ConfigService, ShiftSceneNarrator],
    useFactory: (config: ConfigService<Env, true>, live: ShiftSceneNarrator) =>
      mode(config) === 'fake' ? new FakeShiftNarrator() : live,
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

@Module({
  imports: [AiModule],
  providers: [AssessmentService, FollowUpService, ...shiftPorts],
  exports: [
    AssessmentService,
    FollowUpService,
    AiModule,
    SHIFT_NARRATOR,
    SHIFT_CHECKER,
  ],
})
export class AssessmentModule {}
