/** CL-07 NotificationModule: đẩy tin tới màn đang mở qua Redis pub/sub và SSE. */
import { Global, Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';

@Global()
@Module({
  providers: [StreamService],
  exports: [StreamService],
})
export class NotificationCoreModule {}

/** Phần có route — chỉ API nạp; worker chỉ cần `NotificationCoreModule` để publish. */
@Module({
  imports: [NotificationCoreModule],
  controllers: [StreamController],
})
export class NotificationModule {}
