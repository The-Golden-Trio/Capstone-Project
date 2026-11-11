/**
 * Worker BullMQ nhận job lượt ca làm và giao cho `TurnProcessor`. Chỉ nạp ở
 * worker process (`AssessmentModule.forWorker()`).
 */
import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import type { Env } from '../config/env';
import { QUEUES, redisOptions, type TurnJob } from '../core/queues';
import { TurnProcessor } from './turn.processor';

/** Số lượt xử lý song song. Mỗi lượt chủ yếu chờ model, nên đặt cao hơn số lõi. */
const CONCURRENCY = 8;

@Injectable()
export class TurnWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TurnWorker.name);
  private worker: Worker<TurnJob> | null = null;

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly processor: TurnProcessor,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker<TurnJob>(
      QUEUES.turn,
      (job) => this.processor.run(job.data),
      {
        connection: redisOptions(this.config.get('REDIS_URL', { infer: true })),
        concurrency: CONCURRENCY,
      },
    );
    this.worker.on('failed', (job, err) =>
      this.logger.error(
        `Job ${job?.id ?? '?'} lỗi (lần ${job?.attemptsMade ?? 0}): ${err.message}`,
      ),
    );
    this.worker.on('error', (err) => this.logger.warn(`Redis: ${err.message}`));
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
