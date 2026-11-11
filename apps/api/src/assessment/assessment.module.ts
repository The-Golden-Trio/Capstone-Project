/**
 * Chấm và hỏi vặn (CL-04 `AssessmentModule`). API dùng `AssessmentService` để
 * ghi việc chấm và đẩy vào queue; worker đăng ký thêm `GradingProcessor`
 * (xem `worker.module.ts`). Module này không biết gì về controller hay HTTP.
 */
import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AssessmentService } from './assessment.service';
import { FollowUpService } from './follow-up.service';

@Module({
  imports: [AiModule],
  providers: [AssessmentService, FollowUpService],
  exports: [AssessmentService, FollowUpService, AiModule],
})
export class AssessmentModule {}
