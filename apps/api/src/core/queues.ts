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

/** Ca làm (Game Design W45): một lượt cần AI-4 viết lời hay bộ phán trả lời câu kiểm. */
export const SHIFT_QUEUE = 'shift-turn';

export interface ShiftTurnJob {
  /** `ai_job.id`, cũng là `turnId` của lượt (lần thử lại có hậu tố). */
  aiJobId: string;
  runId: string;
  turnId: string;
}

/** CL-07 `QUEUES.email`: gửi một thông báo kênh EMAIL. */
export const EMAIL_QUEUE = 'email';

export interface EmailJob {
  notificationId: string;
  /**
   * Phần chỉ đi trong email, không lưu vào `notification.payload` — ví dụ
   * link đặt lại mật khẩu: DB chỉ giữ băm của token.
   */
  secret?: Record<string, string>;
}

/** CL-07 `QUEUES.generation`: sinh hoặc sửa nội dung scenario (SD-05). */
export const GENERATION_QUEUE = 'generation';

export interface GenerationJob {
  /** `ai_job.id`. */
  aiJobId: string;
  generationRunId: string;
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  readonly grading: Queue<GradeJob>;
  readonly shift: Queue<ShiftTurnJob>;
  readonly email: Queue<EmailJob>;
  readonly generation: Queue<GenerationJob>;

  constructor(@Inject(REDIS_URL) url: string) {
    this.email = new Queue<EmailJob>(EMAIL_QUEUE, {
      connection: redisOptions(url),
    });
    this.generation = new Queue<GenerationJob>(GENERATION_QUEUE, {
      connection: redisOptions(url),
    });
    this.grading = new Queue<GradeJob>(GRADING_QUEUE, {
      connection: redisOptions(url),
    });
    this.shift = new Queue<ShiftTurnJob>(SHIFT_QUEUE, {
      connection: redisOptions(url),
    });
  }

  /** `jobId` = `ai_job.id`: gửi lại cùng việc thì BullMQ bỏ qua bản trùng. */
  enqueueShiftTurn(job: ShiftTurnJob): Promise<unknown> {
    return this.shift.add('turn', job, {
      jobId: job.aiJobId,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2_000 },
      removeOnComplete: 1000,
      removeOnFail: 1000,
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

  enqueueEmail(job: EmailJob): Promise<unknown> {
    return this.email.add('send', job, {
      jobId: job.notificationId,
      attempts: 5,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  }

  /** `jobId` = `ai_job.id`: gửi lại cùng việc thì BullMQ bỏ qua bản trùng. */
  enqueueGeneration(job: GenerationJob): Promise<unknown> {
    return this.generation.add('generate', job, {
      jobId: job.aiJobId,
      attempts: 1,
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.grading.close(),
      this.shift.close(),
      this.email.close(),
      this.generation.close(),
    ]);
  }
}
