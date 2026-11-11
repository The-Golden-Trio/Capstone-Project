/**
 * Kết thúc màn (CL-03 `SummaryService`, SD-02).
 *
 * `finish`: hết hoạt động mà còn câu chờ panel chấm thì ghi `FINISH_REQUESTED`
 * và trả 202; worker báo `summary.ready` khi câu cuối chấm xong. Không còn câu
 * chờ thì chốt luôn và trả 200.
 *
 * Chốt (một lần, trong một transaction): chọn kết cục, ghi bằng chứng và điểm
 * vào `ScenarioRun` / `RunEvidence` / `UserBandSkill` như luồng prototype — để
 * hồ sơ, bản đồ và việc mở cấp đọc được lượt chơi này — rồi ghi `RUN_FINISHED`.
 *
 * Nhận xét viết từ lý do và câu trích của judge (đầu ra AI-5) và mốc rubric
 * của chuyên gia. Ghi chú phản hồi ẩn do model viết (SD-01 bước cuối) chưa
 * làm: việc giao nó cho AI-4 hay bỏ đang mở (thiết kế AI-4, câu ③).
 */
import { Injectable } from '@nestjs/common';
import {
  ANCHOR_OF_SCORE,
  activityResults,
  findActivity,
  pickPlayEnding,
  type ActivityResult,
  type Ending,
  type PlayState,
  type Scenario,
} from '@datn/game-core';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { Problem } from '../core/problem';
import {
  RunLogService,
  type LoadedRun,
  type Tx,
} from '../core/run-log.service';
import type { ScenarioRun } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { RunService, type Accepted } from './run.service';

export interface ScenarioSummary {
  runId: string;
  scenarioTitle: string;
  ending: { type: Ending['type']; text: string; reveals: string | null };
  result: string;
  feedback: string;
  guidance: string;
  pointsEarned: { expertise: number; softSkill: number };
  hintsUsed: number;
  levelUnlocked: boolean;
  suggestedTasks: string[];
  finishedAt: string;
}

@Injectable()
export class SummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly runLog: RunLogService,
    private readonly runs: RunService,
    private readonly progress: ProgressService,
  ) {}

  async finish(
    user: AuthUser,
    runId: string,
  ): Promise<Accepted<ScenarioSummary>> {
    await this.runs.owned(user, runId);
    type Outcome = { done: true } | { done: false; jobId: string };
    const outcome = await this.runLog.update<Outcome>(
      runId,
      async (loaded, tx) => {
        const { state } = loaded;
        if (state.ending) return { result: { done: true as const } };
        if (state.stage !== 'ended')
          throw new Problem(409, 'INVALID_TRANSITION', 'Run is not over yet');

        const waiting = await this.waitingJob(tx, runId);
        if (waiting)
          return {
            append: state.finishRequested
              ? []
              : [{ type: 'FINISH_REQUESTED' as const }],
            result: { done: false as const, jobId: waiting },
          };
        return {
          append: [
            ...(state.finishRequested
              ? []
              : [{ type: 'FINISH_REQUESTED' as const }]),
            ...(await this.finalize(loaded, tx)),
          ],
          result: { done: true as const },
        };
      },
    );

    if (!outcome.done)
      return {
        status: 202,
        body: {
          jobId: outcome.jobId,
          answerId: '',
          streamEvent: 'summary.ready',
        },
      };
    return { status: 200, body: await this.build(runId) };
  }

  /** `GET /runs/{id}/summary`: đã chốt thì trả; đủ điều kiện mà chưa chốt (worker vừa báo) thì chốt rồi trả. */
  async get(user: AuthUser, runId: string): Promise<ScenarioSummary> {
    await this.runs.owned(user, runId);
    const ready = await this.runLog.update<boolean>(
      runId,
      async (loaded, tx) => {
        const { state } = loaded;
        if (state.ending) return { result: true };
        if (
          state.stage !== 'ended' ||
          !state.finishRequested ||
          (await this.waitingJob(tx, runId))
        )
          return { result: false };
        return { append: await this.finalize(loaded, tx), result: true };
      },
    );
    if (!ready) throw new Problem(404, 'NOT_FOUND', 'Summary not ready');
    return this.build(runId);
  }

  /* ── Chốt ────────────────────────────────────────────────────────── */

  /** Còn câu tự luận nào đang chờ chấm (QUEUED / PENDING) thì trả id việc của nó. */
  private async waitingJob(tx: Tx, runId: string): Promise<string | null> {
    const row = await tx.assessment.findFirst({
      where: { answer: { runId }, status: { in: ['QUEUED', 'PENDING'] } },
      select: { aiJobId: true },
    });
    return row?.aiJobId ?? null;
  }

  private async finalize({ run, scenario, state }: LoadedRun, tx: Tx) {
    const results = activityResults(state, scenario);
    const ending = pickPlayEnding(scenario, results);
    const evidence = results.flatMap((r) => r.evidence);
    const points = evidence.reduce((sum, e) => sum + e.score, 0);

    // Như luồng prototype: chỉ lần chơi xong đầu tiên của mỗi kịch bản được cộng điểm.
    const previouslyScored = await tx.scenarioRun.findFirst({
      where: {
        userId: run.userId,
        scenarioKey: run.scenarioKey,
        NOT: { completedAt: null },
        id: { not: run.id },
      },
      select: { id: true },
    });
    const awards = previouslyScored ? 0 : points;

    await tx.scenarioRun.update({
      where: { id: run.id },
      data: {
        status: 'FINISHED',
        completedAt: new Date(),
        endingId: ending.ending_id,
        endingType: ending.type,
        pointsAwarded: awards,
        evidence: {
          createMany: {
            data: evidence.map((e) => ({
              activityId: e.activityKey,
              skill: e.skill,
              anchor: ANCHOR_OF_SCORE[e.score],
              capped: false,
              why: e.why,
              quote: e.quote,
              timeout: false,
            })),
          },
        },
      },
    });
    await tx.userBandSkill.upsert({
      where: {
        userId_roleCode_band: {
          userId: run.userId,
          roleCode: run.roleCode,
          band: run.band,
        },
      },
      create: {
        userId: run.userId,
        roleCode: run.roleCode,
        band: run.band,
        points: awards,
      },
      update: { points: { increment: awards } },
    });
    return [
      {
        type: 'RUN_FINISHED' as const,
        endingId: ending.ending_id,
        endingType: ending.type,
      },
    ];
  }

  /* ── Dựng tổng kết từ sổ sự kiện ─────────────────────────────────── */

  private async build(runId: string): Promise<ScenarioSummary> {
    const { run, scenario, state } = await this.runLog.load(runId);
    const results = activityResults(state, scenario);
    const ending =
      scenario.endings.find((e) => e.ending_id === state.ending?.endingId) ??
      pickPlayEnding(scenario, results);
    const failed = await this.prisma.assessment.count({
      where: { answer: { runId }, status: 'FAILED' },
    });
    const unlocked = await this.progress.unlockedAfter(
      run.userId,
      run.roleCode,
      run.band,
    );
    return summaryOf(run, scenario, state, results, ending, {
      failed,
      levelUnlocked: unlocked !== null,
    });
  }
}

export function summaryOf(
  run: Pick<ScenarioRun, 'id' | 'completedAt'>,
  scenario: Scenario,
  state: PlayState,
  results: readonly ActivityResult[],
  ending: Ending,
  extra: { failed: number; levelUnlocked: boolean },
): ScenarioSummary {
  const count = (level: 0 | 1 | 2) =>
    results.filter((r) => r.score === level).length;
  const counterproductive = results.reduce(
    (n, r) => n + r.counterproductiveCount,
    0,
  );
  const notes = [
    `Hoàn thành ${results.length} hoạt động: ${count(2)} làm tốt (mức 2), ${count(1)} đạt (mức 1), ${count(0)} chưa đạt (mức 0).`,
  ];
  if (counterproductive > 0)
    notes.push(
      `Có ${counterproductive} dấu hiệu phản tác dụng trong câu tự viết.`,
    );
  if (extra.failed > 0)
    notes.push(
      `${extra.failed} câu tự viết chưa chấm được vì nhà cung cấp model lỗi; câu trả lời vẫn được giữ.`,
    );

  const label = (key: string) => findActivity(scenario, key).summary ?? key;
  const feedback = results
    .flatMap((r) =>
      r.evidence.map((e) => {
        const quote = e.quote && e.quote.length <= 160 ? ` — “${e.quote}”` : '';
        return `${label(r.activityKey)}: ${e.why}${quote}`;
      }),
    )
    .join('\n');

  const guidance = results
    .flatMap((r) =>
      r.evidence
        .filter((e) => e.score < 2)
        .map((e) => {
          const observe = findActivity(scenario, r.activityKey).observes.find(
            (o) => o.skill === e.skill,
          );
          return `${e.skill}: ${observe?.anchors['+2'] ?? ''}`;
        }),
    )
    .join('\n');

  const points = { expertise: 0, softSkill: 0 };
  for (const e of results.flatMap((r) => r.evidence)) {
    if (e.skillType === 'hard') points.expertise += e.score;
    else points.softSkill += e.score;
  }

  return {
    runId: run.id,
    scenarioTitle: scenario.scenario_title,
    ending: {
      type: ending.type,
      text: ending.text,
      reveals: ending.reveals ?? null,
    },
    result: notes.join(' '),
    feedback,
    guidance:
      guidance ||
      'Bạn đã làm tốt mọi hoạt động. Thử một nhiệm vụ khác ở cấp này để mở cấp kế tiếp.',
    pointsEarned: points,
    hintsUsed: state.hints.length,
    levelUnlocked: extra.levelUnlocked,
    suggestedTasks: [],
    finishedAt: (run.completedAt ?? new Date()).toISOString(),
  };
}
