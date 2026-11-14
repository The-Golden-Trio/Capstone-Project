/**
 * CL-03 `FeedbackModule` (chạy ở API): đánh giá nghề (FR-19) và góp ý app
 * (FR-20). `ProgressService` là service prototype, khai báo lại ở đây như
 * `PlayModule` đang làm, cho tới khi có `LevelAccessService`/enrolment ERD-05.
 */
import { Module } from '@nestjs/common';
import { ProgressService } from '../progress/progress.service';
import { AppFeedbackService } from './app-feedback.service';
import { AppFeedbackController, RatingController } from './feedback.controller';
import { RatingService } from './rating.service';

@Module({
  controllers: [RatingController, AppFeedbackController],
  providers: [RatingService, AppFeedbackService, ProgressService],
  exports: [RatingService, AppFeedbackService],
})
export class FeedbackModule {}
