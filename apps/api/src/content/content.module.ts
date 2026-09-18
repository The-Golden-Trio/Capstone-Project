import { Global, Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

/**
 * Toàn cục vì gần như module nào cũng cần tra nội dung: tiến trình cần danh
 * sách cấp bậc của nghề, hồ sơ cần sự kiện phụ, màn chơi cần kịch bản.
 */
@Global()
@Module({
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
