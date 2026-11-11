/**
 * CL-04 AssessmentService, phía API: lưu lượt rồi đẩy job, không gọi model
 * trong request (CLAUDE.md §1, SD-01).
 */
import { Inject, Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { TURN_QUEUE, type TurnJob } from '../core/queues';

@Injectable()
export class AssessmentService {
  constructor(@Inject(TURN_QUEUE) private readonly queue: Queue<TurnJob>) {}

  /** Một lượt cần AI. `jobId` = `turnId`, nên đẩy hai lần vẫn chỉ một job. */
  async requestTurn(
    runId: string,
    turnId: string,
    attempt = 0,
  ): Promise<string> {
    const jobId = attempt === 0 ? turnId : `${turnId}-r${attempt}`;
    await this.queue.add(
      'turn',
      { runId, turnId },
      {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: 1_000,
        removeOnFail: 5_000,
      },
    );
    return jobId;
  }
}
