/**
 * Phần AI của một lượt ca làm (chỉ chạy ở worker, queue `shift-turn`).
 *
 * Mỗi vòng: đọc lượt và fold → engine đang chờ AI việc gì (`pendingRequest`)
 * → gọi cổng AI (AI-4 theo nhịp, hay bộ phán có/không) → ghi kết quả thành
 * một bản ghi có provenance, có khoá → đẩy các dòng mới lên SSE. Lặp tới khi
 * engine chờ người chơi. Yêu cầu đang chờ dựng lại được từ chuỗi sự kiện,
 * nên job chết giữa chừng chạy lại vẫn tiếp đúng chỗ, không gọi lại bước đã
 * xong.
 *
 * Hết model dùng được: ghi `RUN_PAUSED`, phiên tạm dừng, giữ tiến độ (D-92).
 */
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { shift } from '@datn/game-core';
import { Worker } from 'bullmq';
import {
  SHIFT_CHECKER,
  SHIFT_NARRATOR,
  type AiCallOptions,
  type ShiftChecker,
  type ShiftNarrator,
} from '../ai/shift/types';
import {
  REDIS_URL,
  SHIFT_QUEUE,
  redisOptions,
  type ShiftTurnJob,
} from '../core/queues';
import { ShiftLogService, presentLines } from '../core/shift-log.service';
import { StreamService } from '../core/stream.service';
import { PrismaService } from '../prisma/prisma.service';

/** Trần chi phí AI của một lượt ca làm (NFR-11). Giá trị khởi đầu, chưa chốt. */
export const SHIFT_RUN_BUDGET_USD = 0.25;
/** Model chạy quá lâu thì báo màn hình đang chờ nhà cung cấp. */
export const DELAY_NOTICE_MS = 4_000;
const MAX_STEPS = 40;
const CONCURRENCY = 8;

@Injectable()
export class ShiftTurnProcessor
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('Worker·ca làm');
  private worker: Worker<ShiftTurnJob> | null = null;

  constructor(
    @Inject(REDIS_URL) private readonly redisUrl: string,
    private readonly prisma: PrismaService,
    private readonly log: ShiftLogService,
    private readonly stream: StreamService,
    @Inject(SHIFT_NARRATOR) private readonly narrator: ShiftNarrator,
    @Inject(SHIFT_CHECKER) private readonly checker: ShiftChecker,
  ) {}

  onApplicationBootstrap(): void {
    this.worker = new Worker<ShiftTurnJob>(
      SHIFT_QUEUE,
      (job) => this.run(job.data),
      {
        connection: redisOptions(this.redisUrl),
        concurrency: CONCURRENCY,
      },
    );
    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id ?? '?'} lỗi: ${err.message}`);
      if (job && job.attemptsMade >= (job.opts.attempts ?? 1))
        void this.prisma.aiJob
          .update({
            where: { id: job.data.aiJobId },
            data: {
              status: 'FAILED',
              lastError: err.message,
              finishedAt: new Date(),
            },
          })
          .catch(() => undefined);
    });
    this.worker.on('error', (err) =>
      this.logger.error(`Worker lỗi: ${err.message}`),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  async run({ aiJobId, runId, turnId }: ShiftTurnJob): Promise<void> {
    await this.prisma.aiJob
      .update({
        where: { id: aiJobId },
        data: { status: 'RUNNING', attempts: { increment: 1 } },
      })
      .catch(() => undefined);

    for (let i = 0; i < MAX_STEPS; i++) {
      const loaded = await this.log.load(runId);
      const { state, ctx, run } = loaded;
      const pending = shift.pendingRequest(state, ctx);

      if (!pending) {
        await this.prisma.aiJob.update({
          where: { id: aiJobId },
          data: { status: 'SUCCEEDED', finishedAt: new Date() },
        });
        await this.stream.publish(run.userId, {
          type: 'turn.done',
          runId,
          jobId: aiJobId,
          payload: {
            turnId,
            scene: shift.sceneView(state, ctx),
            ended: state.ended,
          },
        });
        return;
      }

      const { identity, displayName } = await this.log.identity(run.userId);
      const opts: AiCallOptions = {
        identity,
        budgetUsd: Math.max(0, SHIFT_RUN_BUDGET_USD - loaded.costUsd),
        castNames: ctx.seed.cast.map((c) => c.name),
        ctx,
        contentVersion: run.contentVersion,
      };
      const requestId = pending.request.requestId;
      const waitingFor = pending.type === 'narrate' ? 'narration' : 'checks';
      const notice = setTimeout(() => {
        void this.stream
          .publish(run.userId, {
            type: 'provider.delay',
            runId,
            jobId: aiJobId,
            payload: { turnId, waitingFor },
          })
          .catch(() => undefined);
      }, DELAY_NOTICE_MS);

      let input: shift.AiInput | null = null;
      let reason = '';
      try {
        if (pending.type === 'narrate') {
          const out = await this.narrator.narrate(pending.request, opts);
          if (out.status === 'ok')
            input = {
              type: 'NARRATION',
              requestId,
              beats: out.value,
              provenance: out.provenance,
            };
          else reason = out.reason;
        } else {
          const out = await this.checker.check(pending.request, opts);
          if (out.status === 'ok')
            input = {
              type: 'CHECKS',
              requestId,
              answers: out.value,
              provenance: out.provenance,
            };
          else reason = out.reason;
        }
      } finally {
        clearTimeout(notice);
      }

      if (!input) {
        await this.pause(runId, run.userId, turnId, aiJobId, requestId, reason);
        return;
      }

      // Ghi có khoá; yêu cầu đã được trả lời ở chỗ khác thì bỏ, đọc lại.
      const aiInput = input;
      const lines = await this.log.update(runId, (fresh) => {
        if (fresh.state.pending?.requestId !== requestId)
          return { result: [] as shift.TranscriptLine[] };
        const next = shift.step(fresh.state, aiInput, fresh.ctx).state;
        return {
          append: [
            {
              type: aiInput.type === 'NARRATION' ? 'AI_NARRATION' : 'AI_CHECKS',
              turnId,
              input: aiInput,
            },
          ],
          result: next.transcript.slice(fresh.state.transcript.length),
        };
      });
      if (lines.length > 0)
        await this.stream.publish(run.userId, {
          type: 'turn.lines',
          runId,
          jobId: aiJobId,
          payload: { turnId, lines: presentLines(lines, displayName) },
        });
    }
    throw new Error(`Lượt ${turnId} vượt quá ${MAX_STEPS} bước AI`);
  }

  private async pause(
    runId: string,
    userId: string,
    turnId: string,
    aiJobId: string,
    requestId: string,
    reason: string,
  ): Promise<void> {
    this.logger.warn(`Tạm dừng lượt ${runId}: ${reason}`);
    await this.log.update(runId, () => ({
      append: [{ type: 'RUN_PAUSED', turnId, data: { requestId, reason } }],
      result: null,
    }));
    await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: 'PAUSED', lastError: reason, finishedAt: new Date() },
    });
    await this.stream.publish(userId, {
      type: 'run.paused',
      runId,
      jobId: aiJobId,
      payload: { turnId, reason },
    });
  }
}
