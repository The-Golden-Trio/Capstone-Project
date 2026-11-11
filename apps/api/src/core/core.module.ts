/**
 * Hạ tầng dùng chung của API và worker (CL-07 CoreModule): hàng đợi job.
 * Prisma nằm ở `PrismaModule` (đã toàn cục từ trước).
 *
 * Dùng thẳng `bullmq` thay vì lớp bọc `@nestjs/bullmq`: bản 12 của lớp bọc
 * chỉ có ESM, không chạy được trong Jest (CJS) của API.
 */
import { Global, Inject, Module, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type { Env } from '../config/env';
import { QUEUES, TURN_QUEUE, redisOptions, type TurnJob } from './queues';

@Global()
@Module({
  providers: [
    {
      provide: TURN_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Queue<TurnJob>(QUEUES.turn, {
          connection: redisOptions(config.get('REDIS_URL', { infer: true })),
        }),
    },
  ],
  exports: [TURN_QUEUE],
})
export class CoreModule implements OnModuleDestroy {
  constructor(@Inject(TURN_QUEUE) private readonly queue: Queue<TurnJob>) {}

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
