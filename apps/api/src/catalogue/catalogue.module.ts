/** CL-02 `CatalogueModule` (rút gọn cho P2/P3). Import của CL-00 tới FeedbackModule bỏ tới khi có module đó. */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { ReviewCriteriaService } from './review-criteria.service';

@Module({
  imports: [AuthModule],
  controllers: [CatalogueController],
  providers: [CatalogueService, ReviewCriteriaService],
  exports: [ReviewCriteriaService],
})
export class CatalogueModule {}
