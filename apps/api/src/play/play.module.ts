/**
 * Luồng chơi có AI (CL-03 `PlayModule`) và luồng sự kiện tới trình duyệt.
 * Chỉ chạy ở process API; việc AI nằm ở worker, nói chuyện qua queue và
 * Redis (§5.3.1).
 */
import { Module } from '@nestjs/common';
import { AssessmentModule } from '../assessment/assessment.module';
import { StreamController } from '../core/stream.controller';
import { ProgressService } from '../progress/progress.service';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { SummaryService } from './summary.service';

@Module({
  imports: [AssessmentModule],
  controllers: [RunController, StreamController],
  providers: [RunService, SummaryService, ProgressService],
  exports: [RunService],
})
export class PlayModule {}
