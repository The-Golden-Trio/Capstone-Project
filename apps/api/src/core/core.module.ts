/**
 * Hạ tầng dùng chung cho cả API và worker (CL-07 `CoreModule`, rút gọn):
 * Redis, job queue, sổ sự kiện của lượt chơi, kho object (`STORAGE`).
 */
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env';
import { QueueService, REDIS_URL } from './queues';
import { RunLogService } from './run-log.service';
import { ShiftLogService } from './shift-log.service';
import { S3StorageAdapter } from './storage/s3-storage.adapter';
import { STORAGE } from './storage/storage.port';

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
    RunLogService,
    ShiftLogService,
    {
      provide: STORAGE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new S3StorageAdapter({
          S3_ENDPOINT: config.get('S3_ENDPOINT', { infer: true }),
          S3_PUBLIC_ENDPOINT: config.get('S3_PUBLIC_ENDPOINT', { infer: true }),
          S3_REGION: config.get('S3_REGION', { infer: true }),
          S3_BUCKET: config.get('S3_BUCKET', { infer: true }),
          S3_ACCESS_KEY: config.get('S3_ACCESS_KEY', { infer: true }),
          S3_SECRET_KEY: config.get('S3_SECRET_KEY', { infer: true }),
        }),
    },
  ],
  exports: [STORAGE, REDIS_URL, QueueService, RunLogService, ShiftLogService],
})
export class CoreModule {}
