/**
 * Hạ tầng dùng chung cho cả API và worker (CL-07 `CoreModule`, rút gọn):
 * Redis, job queue, luồng sự kiện, sổ sự kiện của lượt chơi.
 */
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env';
import { QueueService, REDIS_URL } from './queues';
import { RunLogService } from './run-log.service';
import { ShiftLogService } from './shift-log.service';
import { StreamService } from './stream.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_URL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        config.get('REDIS_URL', { infer: true }),
    },
    QueueService,
    StreamService,
    RunLogService,
    ShiftLogService,
  ],
  exports: [
    REDIS_URL,
    QueueService,
    StreamService,
    RunLogService,
    ShiftLogService,
  ],
})
export class CoreModule {}
