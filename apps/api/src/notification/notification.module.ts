/**
 * CL-07 `NotificationModule` (global, chạy ở cả API và worker): luồng sự kiện
 * SSE tới màn đang mở, thông báo trong app và email. `EmailProcessor` chỉ
 * được đăng ký ở `WorkerModule`.
 */
import { Global, Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';

@Global()
@Module({
  controllers: [StreamController, NotificationController],
  providers: [StreamService, NotificationService, MailerService],
  exports: [StreamService, NotificationService, MailerService],
})
export class NotificationModule {}
