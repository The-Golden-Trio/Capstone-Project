/**
 * Job queue giữa API và worker (§5.3.1): hai process không gọi nhau trực
 * tiếp, chỉ qua queue và pub/sub trên Redis.
 *
 * Dùng thẳng `bullmq` (bản CommonJS) thay cho `@nestjs/bullmq` 12 — gói bọc đó
 * chỉ có bản ESM, mà API build bằng webpack/tsc CommonJS và test bằng jest.
 */
import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';

export const REDIS_URL = Symbol('REDIS_URL');

/** CL-07 `QUEUES`. Prototype mới dùng `grading`. */
export const GRADING_QUEUE = 'grading';

/** Một câu tự luận cần panel chấm (AI-5), kèm quyết định hỏi vặn của engine (AI-4). */
export interface GradeJob {
  aiJobId: string;
  runId: string;
  answerId: string;
}

/**
 * Thử lại khi panel chưa đủ judge (D-108: điểm chờ, câu trả lời được giữ).
 * Lùi dần: 15 s, 30 s, 60 s, 120 s — đủ để nhà cung cấp hồi lại sau một đợt
 * quá tải ngắn mà không chờ người chơi quá lâu. Giá trị khởi đầu, chưa đo.
 */
export const GRADING_ATTEMPTS = 5;
export const GRADING_BACKOFF_MS = 15_000;

export const redisOptions = (url: string) => ({
  url,
  // BullMQ yêu cầu `null` cho kết nối của worker: lệnh chặn không được tự huỷ.
  maxRetriesPerRequest: null,
});

@Injectable()
export class QueueService implements OnModuleDestroy {
  readonly grading: Queue<GradeJob>;

  constructor(@Inject(REDIS_URL) url: string) {
    this.grading = new Queue<GradeJob>(GRADING_QUEUE, {
      connection: redisOptions(url),
    });
  }

  /** `jobId` = `ai_job.id`: gửi lại cùng việc thì BullMQ bỏ qua bản trùng. */
  enqueueGrading(job: GradeJob): Promise<unknown> {
    return this.grading.add('grade', job, {
      jobId: job.aiJobId,
      attempts: GRADING_ATTEMPTS,
      backoff: { type: 'exponential', delay: GRADING_BACKOFF_MS },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.grading.close();
  }
}
