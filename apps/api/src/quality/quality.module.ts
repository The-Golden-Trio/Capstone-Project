/** CL-04 QualityModule. Hiện chỉ có phần nhận báo lỗi nội dung từ người chơi. */
import { Module } from '@nestjs/common';
import { FlagService } from './flag.service';

@Module({
  providers: [FlagService],
  exports: [FlagService],
})
export class QualityModule {}
