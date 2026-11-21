/**
 * Chấm một đoạn bằng chứng của ca làm (AI-5 theo checklist, D-116) — chỉ chạy
 * ở worker, qua queue `grading` (job `shift-segment`, `GradingProcessor` rẽ tới
 * đây).
 *
 * Đoạn được xếp hàng khi nút đóng hay ca kết thúc (`ShiftLogService`). Kết quả
 * ghi thành bản ghi `SEGMENT_GRADED` trong sổ sự kiện (append-only, kèm
 * provenance) và không bao giờ tính lại. Panel chưa đủ judge thì ném lỗi để
 * BullMQ thử lại (D-108); từ lần thử thứ 3 gộp hai judge, mức thấp hơn
 * (D-132). Hết lượt thử thì ghi đoạn hỏng và giữ lời người chơi, không chấm
 * thay bằng cách khác (D-92).
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { shift } from '@datn/game-core';
import type { Job } from 'bullmq';
import type { ChecklistPanelResult } from '../ai/judge/checklist.types';
import { SHIFT_JUDGE, type ShiftJudge } from '../ai/judge/fake-checklist';
import { oneJudgeDownPolicy } from '../ai/judge/judge.profile';
import { SHIFT_GRADING_JOB, type ShiftGradeJob } from '../core/queues';
import { ShiftLogService } from '../core/shift-log.service';
import { StreamService } from '../notification/stream.service';
import { PrismaService } from '../prisma/prisma.service';
import { SHIFT_RUN_BUDGET_USD } from './shift-turn.processor';
import { gradingSettled, settledSegments } from './shift-grading.view';
import type { UsageRow } from './usage';

export const isShiftGradingJob = (job: Job): job is Job<ShiftGradeJob> =>
  job.name === SHIFT_GRADING_JOB;

@Injectable()
export class ShiftSegmentGrader {
  private readonly logger = new Logger('Worker·chấm ca làm');

  constructor(
    private readonly prisma: PrismaService,
    private readonly log: ShiftLogService,
    private readonly stream: StreamService,
    @Inject(SHIFT_JUDGE) private readonly judge: ShiftJudge,
  ) {}

  async process(job: Job<ShiftGradeJob>): Promise<void> {
    const { aiJobId, runId, segment } = job.data;
    await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: 'RUNNING', attempts: job.attemptsMade + 1 },
    });

    const loaded = await this.log.load(runId);
    const { ctx, run, state, records } = loaded;
    if (settledSegments(records).has(segment)) {
      await this.succeed(aiJobId);
      return;
    }
    const observes = ctx.seed.observes ?? [];
    const seg = shift
      .closedSegments(state, ctx, observes)
      .find((s) => s.id === segment);
    if (!seg) {
      this.logger.warn(`Job ${aiJobId}: không dựng lại được đoạn ${segment}`);
      await this.settle(runId, run.userId, segment, aiJobId, 'segment_missing');
      return;
    }

    const { identity } = await this.log.identity(run.userId);
    const attempt = job.attemptsMade + 1;
    const result = await this.judge.gradeChecklist({
      jobId: aiJobId,
      segments: [seg],
      observes,
      identity,
      budgetUsd: Math.max(0, SHIFT_RUN_BUDGET_USD - loaded.costUsd),
      whenOneJudgeDown: oneJudgeDownPolicy(attempt),
      contentVersion: run.contentVersion,
    });
    await this.recordUsage(aiJobId, result);

    if (result.status !== 'graded') {
      const reason =
        result.status === 'pending'
          ? result.reason
          : `unavailable:${result.reason}`;
      await this.prisma.aiJob.update({
        where: { id: aiJobId },
        data: { lastError: reason },
      });
      if (state.ended)
        await this.stream.publish(run.userId, {
          type: 'provider.delay',
          runId,
          jobId: aiJobId,
          payload: { waitingFor: 'summary' },
        });
      throw new Error(
        `Panel chưa chấm được đoạn ${segment} (${reason}): ${result.slots.map((s) => `${s.family}=${s.status}`).join(', ')}`,
      );
    }

    const written = await this.log.update(runId, ({ records: fresh }) => {
      if (settledSegments(fresh).has(segment)) return { result: false };
      return {
        append: [
          {
            type: 'SEGMENT_GRADED',
            data: {
              segment,
              aiJobId,
              method: result.method,
              panelSize: result.panelSize,
              items: result.items.map((i) => ({
                sub: i.sub,
                segment: i.segment,
                level: i.level,
                fixed: i.fixed,
                method: i.method,
                highDisagreement: i.highDisagreement,
                judgeLevels: i.judgeLevels,
                forcedZero: i.forcedZero,
              })),
              flags: result.flags,
              quoteChecks: result.quoteChecks,
              models: result.slots.flatMap((s) =>
                s.status === 'ok' && s.modelKey ? [s.modelKey] : [],
              ),
              promptVersion: 'judge-v2',
              costUsd: result.cost.usd,
              latencyMs: Math.max(
                0,
                ...result.records.map((r) => r.latencyMs ?? 0),
              ),
            },
          },
        ],
        result: true,
      };
    });
    await this.succeed(aiJobId);
    if (!written) return;
    await this.stream.publish(run.userId, {
      type: 'judgement.ready',
      runId,
      jobId: aiJobId,
      payload: { segment },
    });
    await this.announceIfSettled(runId, run.userId);
  }

  /** Lần thử cuối cũng hỏng: ghi đoạn hỏng, không chấm thay (D-92), báo nếu đã xong hết. */
  async onFailed(job: Job<ShiftGradeJob>, err: Error): Promise<void> {
    const { aiJobId, runId, segment } = job.data;
    const final = job.attemptsMade >= (job.opts.attempts ?? 1);
    this.logger.warn(
      `Job ${aiJobId} lần ${job.attemptsMade}${final ? ' (lần cuối)' : ''}: ${err.message}`,
    );
    await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: {
        lastError: err.message,
        ...(final ? { status: 'FAILED', finishedAt: new Date() } : {}),
      },
    });
    if (!final) return;
    const { run } = await this.log.load(runId);
    await this.settle(runId, run.userId, segment, aiJobId, err.message);
  }

  private async settle(
    runId: string,
    userId: string,
    segment: string,
    aiJobId: string,
    reason: string,
  ): Promise<void> {
    await this.log.update(runId, ({ records }) =>
      settledSegments(records).has(segment)
        ? { result: null }
        : {
            append: [
              {
                type: 'SEGMENT_GRADED',
                data: { segment, aiJobId, failed: true, reason, costUsd: 0 },
              },
            ],
            result: null,
          },
    );
    await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: 'FAILED', finishedAt: new Date() },
    });
    await this.announceIfSettled(runId, userId);
  }

  /** Ca đã hết và không còn đoạn nào chờ: báo màn tổng kết. */
  private async announceIfSettled(
    runId: string,
    userId: string,
  ): Promise<void> {
    const { records, state } = await this.log.load(runId);
    if (!gradingSettled(records, state.ended)) return;
    await this.stream.publish(userId, {
      type: 'summary.ready',
      runId,
      payload: {},
    });
  }

  private succeed(aiJobId: string) {
    return this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: 'SUCCEEDED', finishedAt: new Date(), lastError: null },
    });
  }

  private async recordUsage(
    aiJobId: string,
    result: ChecklistPanelResult,
  ): Promise<void> {
    const rows: UsageRow[] = result.records.map((r) => ({
      role: 'judge',
      modelId: r.modelKey,
      tokensIn: r.usage?.input ?? 0,
      tokensOut: r.usage?.output ?? 0,
      costUsd: r.cost?.usd ?? 0,
      latencyMs: r.latencyMs,
      succeeded: r.outcome === 'accepted',
    }));
    if (rows.length === 0) return;
    await this.prisma.usageCost.createMany({
      data: rows.map((r) => ({ aiJobId, ...r, costUsd: r.costUsd.toFixed(8) })),
    });
  }
}
