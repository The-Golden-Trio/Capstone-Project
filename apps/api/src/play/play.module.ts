/**
 * CL-03 PlayModule — phần ca làm. Theo CL-00: PlayModule nhập AssessmentModule
 * và QualityModule. CatalogueModule chưa có; nội dung đọc qua `ContentModule`
 * (toàn cục) của prototype.
 */
import { Module } from '@nestjs/common';
import { AssessmentModule } from '../assessment/assessment.module';
import { QualityModule } from '../quality/quality.module';
import { RunController } from './run.controller';
import { RunService } from './run.service';

@Module({
  imports: [AssessmentModule.forApi(), QualityModule],
  controllers: [RunController],
  providers: [RunService],
})
export class PlayModule {}
