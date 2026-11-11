/**
 * Worker chấm một câu tự luận (CL-04 `GradingProcessor`, SD-01) — chỉ chạy ở
 * process worker.
 *
 * Hai việc chạy SONG SONG, không bên nào chờ bên nào (quyết định ① 30/10 của
 * thiết kế AI-4 §4.3):
 *   - AI-5: panel ba judge chấm câu trả lời theo rubric;
 *   - AI-4: nếu engine đã cho hỏi vặn lúc nhận câu, viết câu hỏi vặn (hoặc
 *     dùng câu chuyên gia soạn sẵn), rồi mở lượt hỏi vặn hay đóng hoạt động.
 * Mỗi việc xong là ghi sự kiện vào sổ của lượt chơi và đẩy về trình duyệt
 * ngay — người chơi không phải chờ điểm để đi tiếp.
 *
 * Panel chưa đủ judge (D-108: điểm chờ) thì ném lỗi để BullMQ thử lại sau;
 * việc hỏi vặn đã ghi thì không làm lại. Một ghế hỏng hẳn thì từ lượt thử thứ
 * 3 chấm bằng hai judge còn lại, lấy mức thấp hơn (D-132). Hết lượt thử thì
 * đánh dấu FAILED và giữ câu trả lời (NFR-04) — không chấm thay bằng cách
 * khác (D-92).
 */
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import {
  findActivity,
  nextActivityKey,
  type Activity,
  type GradedCriterion,
  type KnownIdentity,
  type PlayEvent,
  type PlayScore,
} from '@datn/game-core';
import { Worker, type Job } from 'bullmq';
import type {
  JudgeCallRecord,
  PanelResult,
  SlotOutcome,
} from '../ai/judge/judge-panel.service';
import { JudgePanelService } from '../ai/judge/judge-panel.service';
import { oneJudgeDownPolicy } from '../ai/judge/judge.profile';
import { criteriaFromActivity } from '../ai/judge/judge.types';
import {
  GRADING_QUEUE,
  REDIS_URL,
  redisOptions,
  type GradeJob,
} from '../core/queues';
import { RunLogService, type LoadedRun } from '../core/run-log.service';
import { StreamService } from '../core/stream.service';
import { PrismaService } from '../prisma/prisma.service';
import { FollowUpService } from './follow-up.service';
import { transcriptBefore } from './transcript';
import type { UsageRow } from './usage';

/** Số job chạy cùng lúc. Mỗi job gọi tối đa 3 judge + 1 người dẫn truyện. */
const CONCURRENCY = 4;

type AnswerRow = {
  id: string;
  runId: string;
  activityKey: string;
  followupNo: number;
  followupQuestion: string | null;
  text: string | null;
};

@Injectable()
export class GradingProcessor
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('Worker·grading');
  private worker: Worker<GradeJob> | null = null;

  constructor(
    @Inject(REDIS_URL) private readonly redisUrl: string,
    private readonly prisma: PrismaService,
    private readonly runLog: RunLogService,
    private readonly panel: JudgePanelService,
    private readonly followUps: FollowUpService,
    private readonly stream: StreamService,
  ) {}

  onApplicationBootstrap(): void {
    this.worker = new Worker<GradeJob>(
      GRADING_QUEUE,
      (job) => this.process(job),
      {
        connection: redisOptions(this.redisUrl),
        concurrency: CONCURRENCY,
      },
    );
    this.worker.on('failed', (job, err) => {
      if (job)
        void this.onFailed(job, err).catch((e: unknown) =>
          this.logger.error(String(e)),
        );
    });
    this.worker.on('error', (err) =>
      this.logger.error(`Worker lỗi: ${err.message}`),
    );
    this.logger.log(
      `Đang nghe queue "${GRADING_QUEUE}" (${CONCURRENCY} job cùng lúc)`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  /* ── Một job ─────────────────────────────────────────────────────── */

  async process(job: Job<GradeJob>): Promise<void> {
    const { aiJobId, runId, answerId } = job.data;
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: { assessment: true },
    });
    if (!answer?.assessment) {
      this.logger.warn(
        `Job ${aiJobId}: không thấy câu trả lời ${answerId}, bỏ qua`,
      );
      return;
    }
    await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: 'RUNNING', attempts: job.attemptsMade + 1 },
    });

    const loaded = await this.runLog.load(runId);
    const activity = findActivity(loaded.scenario, answer.activityKey);
    const identity = await this.identityOf(loaded.run.userId);

    const submitted = loaded.events.find(
      (e): e is Extract<PlayEvent, { type: 'TEXT_SUBMITTED' }> =>
        e.type === 'TEXT_SUBMITTED' && e.answerId === answerId,
    );
    const awaitingFollowUp =
      Boolean(submitted?.followUpAllowed) &&
      loaded.state.stage === 'awaiting' &&
      loaded.state.activityKey === answer.activityKey;

    const [followUp, grade] = await Promise.allSettled([
      awaitingFollowUp
        ? this.followUp(loaded, answer, activity, identity, aiJobId)
        : Promise.resolve(),
      answer.assessment.status === 'GRADED'
        ? Promise.resolve()
        : this.grade(
            loaded,
            answer,
            activity,
            identity,
            aiJobId,
            answer.assessment.id,
            job.attemptsMade + 1,
          ),
    ]);
    if (followUp.status === 'rejected') throw followUp.reason;
    if (grade.status === 'rejected') throw grade.reason;

    await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: 'SUCCEEDED', finishedAt: new Date(), lastError: null },
    });
  }

  /* ── AI-4: hỏi vặn hay đóng hoạt động ────────────────────────────── */

  private async followUp(
    loaded: LoadedRun,
    answer: AnswerRow,
    activity: Activity,
    identity: KnownIdentity,
    aiJobId: string,
  ): Promise<void> {
    const answers = await this.prisma.answer.findMany({
      where: { runId: answer.runId },
      select: { id: true, activityKey: true, followupNo: true, text: true },
    });
    const decision = await this.followUps.decide({
      scenario: loaded.scenario,
      scenarioKey: loaded.run.scenarioKey,
      contentVersion: loaded.run.contentVersion,
      activityKey: answer.activityKey,
      transcript: transcriptBefore(loaded.scenario, loaded.events, answers, {
        activityKey: answer.activityKey,
        answerId: answer.id,
      }),
      answer: answer.text ?? '',
      identity,
    });
    await this.recordUsage(aiJobId, decision.usage);
    if (decision.aiOutcome)
      this.logger.warn(
        `AI-4 không cho câu dùng được (${decision.aiOutcome}) ở ${loaded.run.scenarioKey}/${answer.activityKey}` +
          (decision.asked
            ? ': dùng câu chuyên gia soạn sẵn'
            : ': không hỏi vặn'),
      );

    const written = await this.runLog.update(loaded.run.id, ({ state }) => {
      // Đã có ai quyết rồi (job chạy lại sau khi đã ghi) thì thôi.
      if (
        state.stage !== 'awaiting' ||
        state.activityKey !== answer.activityKey
      )
        return { result: null };
      const event: PlayEvent = decision.asked ?? {
        type: 'ACTIVITY_CLOSED',
        activityKey: answer.activityKey,
        nextActivityKey: nextActivityKey(activity),
      };
      return { append: [event], result: event };
    });
    if (!written) return;

    if (written.type === 'FOLLOWUP_ASKED')
      await this.stream.publish(loaded.run.userId, {
        type: 'followup.asked',
        runId: loaded.run.id,
        jobId: aiJobId,
        payload: {
          activityKey: written.activityKey,
          followupNo: written.followupNo,
          npcKey: written.npcKey,
          name: written.name,
          question: written.question,
        },
      });
    else if (written.type === 'ACTIVITY_CLOSED')
      await this.stream.publish(loaded.run.userId, {
        type: 'activity.closed',
        runId: loaded.run.id,
        jobId: aiJobId,
        payload: {
          activityKey: written.activityKey,
          closingLine: activity.closing_prompt,
          nextActivityKey: written.nextActivityKey,
        },
      });
  }

  /* ── AI-5: panel ba judge ────────────────────────────────────────── */

  private async grade(
    loaded: LoadedRun,
    answer: AnswerRow,
    activity: Activity,
    identity: KnownIdentity,
    aiJobId: string,
    assessmentId: string,
    /** Lượt thử thứ mấy của job (từ 1): quyết chờ hay gộp hai judge (D-132). */
    attempt: number,
  ): Promise<void> {
    const started = Date.now();
    const criteria = criteriaFromActivity(activity);
    const result = await this.panel.grade({
      whenOneJudgeDown: oneJudgeDownPolicy(attempt),
      answer: answer.text ?? '',
      criteria,
      situation: [activity.setup, activity.npc_line].filter(Boolean).join('\n'),
      question: answer.followupQuestion ?? activity.input_prompt ?? undefined,
      identity,
      contentVersion: loaded.run.contentVersion,
    });
    await this.recordUsage(aiJobId, result.records.map(judgeUsage));
    await this.saveJudges(assessmentId, result.slots);

    if (result.status !== 'graded') {
      const reason =
        result.status === 'pending'
          ? result.reason
          : `unavailable:${result.reason}`;
      await this.prisma.assessment.update({
        where: { id: assessmentId },
        data: { status: 'PENDING' },
      });
      await this.prisma.aiJob.update({
        where: { id: aiJobId },
        data: { lastError: reason },
      });
      const fresh = await this.runLog.load(loaded.run.id);
      if (fresh.state.finishRequested)
        await this.stream.publish(loaded.run.userId, {
          type: 'provider.delay',
          runId: loaded.run.id,
          jobId: aiJobId,
          payload: { waitingFor: 'summary' },
        });
      throw new Error(
        `Panel chưa chấm được (${reason}): ${result.slots.map((s) => `${s.family}=${s.status}`).join(', ')}`,
      );
    }

    const graded = gradedEvent(answer, activity, result);
    const written = await this.runLog.update(
      loaded.run.id,
      async ({ state }, tx) => {
        if (state.answers.find((a) => a.answerId === answer.id)?.graded)
          return { result: null };
        await tx.criterionGrade.deleteMany({ where: { assessmentId } });
        await tx.criterionGrade.createMany({
          data: result.grades.map((g) => ({
            assessmentId,
            criterionKey: g.criterionId,
            score: g.score,
            counterproductive: g.counterproductive,
            method: g.method,
            highDisagreement: g.highDisagreement,
          })),
        });
        await tx.assessment.update({
          where: { id: assessmentId },
          data: {
            status: 'GRADED',
            panelSize: result.panelSize,
            method: result.method,
            score: graded.score,
            counterproductive: graded.counterproductive,
            gradedAt: new Date(),
            latencyMs: Date.now() - started,
          },
        });
        return {
          append: [graded],
          result: { finishRequested: state.finishRequested },
        };
      },
    );
    if (!written) return;

    await this.stream.publish(loaded.run.userId, {
      type: 'answer.graded',
      runId: loaded.run.id,
      jobId: aiJobId,
      payload: {
        answerId: answer.id,
        activityKey: answer.activityKey,
        followupNo: answer.followupNo,
        score: graded.score,
        counterproductive: graded.counterproductive,
      },
    });
    if (written.finishRequested)
      await this.announceSummaryIfReady(loaded.run.id, loaded.run.userId);
  }

  /* ── Phụ trợ ─────────────────────────────────────────────────────── */

  private async onFailed(job: Job<GradeJob>, err: Error): Promise<void> {
    const { aiJobId, runId, answerId } = job.data;
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
    await this.prisma.assessment.updateMany({
      where: { answerId, status: { not: 'GRADED' } },
      data: { status: 'FAILED' },
    });
    const run = await this.prisma.scenarioRun.findUnique({
      where: { id: runId },
      select: { userId: true },
    });
    if (run) await this.announceSummaryIfReady(runId, run.userId);
  }

  /** Người chơi đã bấm kết thúc và không còn câu nào chờ chấm: báo màn tổng kết. */
  private async announceSummaryIfReady(
    runId: string,
    userId: string,
  ): Promise<void> {
    const loaded = await this.runLog.load(runId);
    if (!loaded.state.finishRequested) return;
    const waiting = await this.prisma.assessment.count({
      where: { answer: { runId }, status: { in: ['QUEUED', 'PENDING'] } },
    });
    if (waiting > 0) return;
    await this.stream.publish(userId, {
      type: 'summary.ready',
      runId,
      payload: {},
    });
  }

  private async identityOf(userId: string): Promise<KnownIdentity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true, email: true },
    });
    if (!user) return {};
    return {
      names: [user.displayName],
      usernames: [user.username],
      emails: user.email ? [user.email] : [],
    };
  }

  private async recordUsage(aiJobId: string, rows: UsageRow[]): Promise<void> {
    if (rows.length === 0) return;
    await this.prisma.usageCost.createMany({
      data: rows.map((r) => ({ aiJobId, ...r, costUsd: r.costUsd.toFixed(8) })),
    });
  }

  /** Bản ghi từng ghế của lần chấm mới nhất (ERD-06 `judge_result`, `judge_score`). */
  private async saveJudges(
    assessmentId: string,
    slots: SlotOutcome[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.judgeResult.deleteMany({ where: { assessmentId } });
      for (const slot of slots) {
        const row = await tx.judgeResult.create({
          data: {
            assessmentId,
            judgeSlot: slot.slot,
            family: slot.family,
            modelId: slot.modelKey,
            status: slot.status,
            attempts: slot.attempts,
            error: slot.error,
          },
        });
        if (slot.judgments.length > 0)
          await tx.judgeScore.createMany({
            data: slot.judgments.map((j) => ({
              judgeResultId: row.id,
              criterionKey: j.criterionId,
              score: j.score,
              counterproductive: j.counterproductive,
              quote: j.quote || null,
              // Kết quả của ghế chỉ được giữ khi mọi câu trích qua J1.
              quoteVerified: true,
              rationale: j.rationale,
            })),
          });
      }
    });
  }
}

const judgeUsage = (r: JudgeCallRecord): UsageRow => ({
  role: 'judge',
  modelId: r.modelKey,
  tokensIn: r.usage?.input ?? 0,
  tokensOut: r.usage?.output ?? 0,
  costUsd: r.cost?.usd ?? 0,
  latencyMs: r.latencyMs,
  succeeded: r.outcome === 'accepted',
});

/**
 * Sự kiện `ANSWER_GRADED`: mức gộp của từng tiêu chí, kèm lý do và câu trích
 * của một judge cho đúng mức đó (để nhận xét cuối màn có dẫn chứng, FR-11).
 */
function gradedEvent(
  answer: AnswerRow,
  activity: Activity,
  result: Extract<PanelResult, { status: 'graded' }>,
): Extract<PlayEvent, { type: 'ANSWER_GRADED' }> {
  const okSlots = result.slots.filter((s) => s.status === 'ok');
  const criteria: GradedCriterion[] = result.grades.map((g, i) => {
    const observe = activity.observes[i] ?? activity.observes[0];
    const own = okSlots
      .map((s) => s.judgments.find((j) => j.criterionId === g.criterionId))
      .filter((j): j is NonNullable<typeof j> => Boolean(j));
    const witness = own.find((j) => j.score === g.score) ?? own[0];
    return {
      key: g.criterionId,
      skill: observe.skill,
      skillType: observe.skill_type,
      score: g.score,
      counterproductive: g.counterproductive,
      highDisagreement: g.highDisagreement,
      rationale: witness?.rationale ?? '',
      quote: witness?.quote ?? '',
    };
  });
  const scores = criteria
    .map((c) => c.score)
    .filter((s): s is PlayScore => s !== null);
  return {
    type: 'ANSWER_GRADED',
    activityKey: answer.activityKey,
    answerId: answer.id,
    followupNo: answer.followupNo,
    score: scores.length > 0 ? (Math.min(...scores) as PlayScore) : null,
    counterproductive: criteria.some((c) => c.counterproductive),
    criteria,
    method: result.method,
    panelSize: result.panelSize,
    costUsd: result.cost.usd,
  };
}
