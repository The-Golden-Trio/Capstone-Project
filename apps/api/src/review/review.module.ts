/** CL-05 `ReviewModule`: giao và duyệt scenario (SD-06, FR-25, FR-32, FR-34). Kiểm định lại (P6) chưa làm. */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { LifecycleModule } from '../lifecycle/lifecycle.module';
import { AssignmentService } from './assignment.service';
import {
  ReviewAssignmentController,
  ReviewController,
} from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [AuthModule, LifecycleModule, CatalogueModule],
  controllers: [ReviewController, ReviewAssignmentController],
  providers: [AssignmentService, ReviewService],
  exports: [AssignmentService],
})
export class ReviewModule {}
