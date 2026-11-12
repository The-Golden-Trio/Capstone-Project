/**
 * Luồng chơi có AI (CL-03 `PlayModule`) và luồng sự kiện tới trình duyệt.
 * Chỉ chạy ở process API; việc AI nằm ở worker, nói chuyện qua queue và
 * Redis (§5.3.1).
 */
import { Module } from '@nestjs/common';
import { AssessmentModule } from '../assessment/assessment.module';

import { ProgressService } from '../progress/progress.service';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { ShiftRunController } from './shift-run.controller';
import { ShiftRunService } from './shift-run.service';
import { SummaryService } from './summary.service';

@Module({
  imports: [AssessmentModule],
  controllers: [RunController, ShiftRunController],
  providers: [RunService, SummaryService, ProgressService, ShiftRunService],
  exports: [RunService],
})
export class PlayModule {}
