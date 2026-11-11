/**
 * Phía API của việc chấm (CL-04 `AssessmentService`): ghi câu trả lời và việc
 * chấm vào PostgreSQL TRƯỚC, đẩy job vào queue SAU khi transaction xong, trả
 * lời ngay. Không gọi model trong request nộp câu trả lời (§5.3.1, NFR-01).
 */
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { QueueService } from '../core/queues';
import type { Tx } from '../core/run-log.service';

export interface GradingRequest {
  aiJobId: string;
  runId: string;
  answerId: string;
}

@Injectable()
export class AssessmentService {
  constructor(private readonly queues: QueueService) {}

  /** Trong transaction của câu trả lời: tạo `ai_job` và `assessment` ở trạng thái chờ. */
  async requestGrading(
    tx: Tx,
    runId: string,
    answerId: string,
  ): Promise<GradingRequest> {
    const aiJobId = randomUUID();
    await tx.aiJob.create({ data: { id: aiJobId, kind: 'GRADING', runId } });
    await tx.assessment.create({ data: { answerId, aiJobId } });
    return { aiJobId, runId, answerId };
  }

  /** Sau khi transaction đã ghi: worker đọc được mọi thứ nó cần. */
  async enqueue(request: GradingRequest): Promise<void> {
    await this.queues.enqueueGrading(request);
  }
}
