/**
 * Màn chơi phía máy chủ (CL-03 `RunService`, SD-01): mỗi câu trả lời gửi lên
 * ngay, máy chủ là nguồn chân lý của điểm (§5.3.1).
 *
 * - Câu đóng (CHOICE, ORDERING, PRIORITIZING): kiểm rồi chấm ngay bằng khoá
 *   của chuyên gia qua game-core → 200.
 * - Câu tự luận: ghi câu trả lời và việc chấm vào PostgreSQL, đẩy job vào
 *   queue, trả 202. Panel ba judge (AI-5) chấm ở worker; nếu engine cho hỏi
 *   vặn thì AI-4 cũng chạy ở worker. Kết quả về qua `/v1/stream`.
 *   Không gọi model trong request này.
 */
import { Injectable } from '@nestjs/common';
import {
  findActivity,
  followUpAllowed,
  nextActivityKey,
  orderingShuffle,
  scoreClosed,
  speakerOf,
  stripNpcPrefix,
  type Activity,
  type PlayEvent,
  type PlayState,
  type Scenario,
} from '@datn/game-core';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import {
  AssessmentService,
  type GradingRequest,
} from '../assessment/assessment.service';
import { ContentService } from '../content/content.service';
import { Problem } from '../core/problem';
import { RunLogService, type LoadedRun } from '../core/run-log.service';
import { StreamService } from '../core/stream.service';
import type { ScenarioRun } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import type { AnswerDto, FlagDto, HintDto, StartRunDto } from './play.dto';

/* ── Hình dạng trả về theo openapi.yaml ────────────────────────────── */

export interface RunView {
  id: string;
  status: 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';
  isPlaytest: boolean;
  releaseVersion: string;
  intro: string;
  context: { role: string; team: string; situation: string; stakes: string };
  currentActivityKey: string | null;
  startedAt: string;
}

export interface ActivityView {
  activityKey: string;
  taskType: 'CHOICE' | 'ORDERING' | 'PRIORITIZING' | 'FREE_TEXT';
  setup: string;
  npc?: { npcKey: string; name: string; line: string };
  inputPrompt?: string;
  items?: Array<{ key: string; text: string; note?: string }>;
  pickCount?: number;
  hintAvailable: boolean;
  randomEvent: null;
  /**
   * Ngoài hợp đồng (đề xuất): câu hỏi vặn đang chờ trả lời, để màn chơi mở lại
   * đúng chỗ khi trình duyệt mất trạng thái (tab mới, xoá sessionStorage).
   */
  followup: {
    followupNo: number;
    npcKey: string;
    name: string;
    question: string;
  } | null;
}

export interface AnswerResult {
  answerId: string;
  score: 0 | 1 | 2;
  hintUsed: boolean;
  closingLine?: string;
  nextActivityKey?: string | null;
}

export interface JobAccepted {
  jobId: string;
  answerId: string;
  streamEvent: string;
}

export type Accepted<T> =
  { status: 200 | 201; body: T } | { status: 202; body: JobAccepted };

const TASK_TYPE: Record<Activity['type'], ActivityView['taskType']> = {
  CHOICE: 'CHOICE',
  ORDERING: 'ORDERING',
  PRIORITIZING: 'PRIORITIZING',
  FREETEXT: 'FREE_TEXT',
};

const TEXT_MIN = 2;
const TEXT_MAX = 4000;

const releaseVersionOf = (
  run: Pick<ScenarioRun, 'scenarioKey' | 'contentVersion'>,
) => `${run.scenarioKey}@${run.contentVersion}`;

export function parseReleaseVersion(
  version: string,
): { scenarioKey: string; contentVersion: number } | null {
  const match = /^([A-Za-z0-9_]+)@(\d+)$/.exec(version);
  return match
    ? { scenarioKey: match[1], contentVersion: Number(match[2]) }
    : null;
}

const conflict = (title: string) =>
  new Problem(409, 'INVALID_TRANSITION', title);
const invalid = (field: string, reason: string) =>
  new Problem(422, 'ANSWER_INVALID', 'Answer breaks the activity rules', [
    { field, reason },
  ]);

@Injectable()
export class RunService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
    private readonly progress: ProgressService,
    private readonly runLog: RunLogService,
    private readonly assessment: AssessmentService,
    private readonly stream: StreamService,
  ) {}

  /* ── Mở / lấy lại lượt chơi ──────────────────────────────────────── */

  async start(
    user: AuthUser,
    dto: StartRunDto,
  ): Promise<{ status: 200 | 201; body: RunView }> {
    const contentVersion = await this.content.activeVersion();
    const index = await this.content.indexAt(contentVersion);
    const entry = index.findScenarioByKey(dto.taskId);
    if (!entry)
      throw new Problem(
        409,
        'SCENARIO_UNAVAILABLE',
        'Scenario is not available',
      );
    const { scenario } = entry;
    const role = index.findRole(scenario.job.role_code);
    if (!role)
      throw new Problem(
        409,
        'SCENARIO_UNAVAILABLE',
        'Occupation is not available',
      );

    // NFR-03: còn lượt dở của cùng nhiệm vụ thì trả lại lượt đó.
    const existing = await this.prisma.scenarioRun.findFirst({
      where: {
        userId: user.id,
        scenarioKey: dto.taskId,
        flow: 'events',
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
    });
    if (existing) return { status: 200, body: await this.view(existing) };

    if (!(await this.progress.isUnlocked(user.id, role, scenario.job.band)))
      throw new Problem(
        403,
        'LEVEL_LOCKED',
        `Level ${scenario.job.band} is locked`,
      );

    const run = await this.prisma.$transaction(async (tx) => {
      const created = await tx.scenarioRun.create({
        data: {
          userId: user.id,
          scenarioKey: dto.taskId,
          roleCode: scenario.job.role_code,
          band: scenario.job.band,
          // Luồng này không chạy lại bằng hạt giống: mọi quyết định đã nằm trong sự kiện.
          seed: BigInt(0),
          contentVersion,
          flow: 'events',
        },
      });
      await this.runLog.begin(tx, created, scenario, {
        type: 'RUN_STARTED',
        scenarioKey: dto.taskId,
        contentVersion,
        band: scenario.job.band,
      });
      return tx.scenarioRun.findUniqueOrThrow({ where: { id: created.id } });
    });
    return { status: 201, body: this.toRunView(run, scenario) };
  }

  async get(user: AuthUser, runId: string): Promise<RunView> {
    return this.view(await this.owned(user, runId));
  }

  async currentActivity(user: AuthUser, runId: string): Promise<ActivityView> {
    await this.owned(user, runId);
    const { state, scenario } = await this.runLog.load(runId);
    if (!state.activityKey) throw conflict('Run has no activity left');
    return this.toActivityView(
      findActivity(scenario, state.activityKey),
      state,
      scenario,
    );
  }

  /* ── Nộp câu trả lời ─────────────────────────────────────────────── */

  async submitAnswer(
    user: AuthUser,
    runId: string,
    dto: AnswerDto,
  ): Promise<Accepted<AnswerResult>> {
    await this.owned(user, runId);

    // NFR-04: gửi lại cùng `answerId` thì nhận lại đúng kết quả cũ.
    const replay = await this.replay(runId, dto.answerId);
    if (replay) return replay;

    let grading: GradingRequest | null = null;
    let closedNow: { activity: Activity; next: string | null } | null = null;

    const outcome = await this.runLog.update<Accepted<AnswerResult>>(
      runId,
      async (loaded, tx) => {
        const { state, scenario, run } = loaded;
        if (run.status !== 'IN_PROGRESS' || !state.activityKey)
          throw conflict('Run is not open');
        if (dto.activityKey !== state.activityKey)
          throw conflict('Not the current activity');
        if (state.stage === 'awaiting')
          throw conflict('Previous answer is still being processed');
        const expectedNo = state.stage === 'followup' ? state.followupNo : 0;
        if (dto.followupNo !== expectedNo)
          throw conflict('Not the current follow-up');

        const activity = findActivity(scenario, state.activityKey);
        const hintUsed = state.hints.includes(activity.activity_id);
        const next = nextActivityKey(activity);

        if (activity.type !== 'FREETEXT' && state.stage === 'answering') {
          const check = scoreClosed(activity, dto.selection);
          if (!check.ok) throw invalid('selection', check.reason);
          await tx.answer.create({
            data: {
              id: dto.answerId,
              runId,
              activityKey: activity.activity_id,
              followupNo: 0,
              taskType: TASK_TYPE[activity.type],
              selection: dto.selection ?? undefined,
              systemScore: check.score,
            },
          });
          const result: Accepted<AnswerResult> = {
            status: 200,
            body: {
              answerId: dto.answerId,
              score: check.score,
              hintUsed,
              closingLine: activity.closing_prompt,
              nextActivityKey: next,
            },
          };
          return {
            append: [
              {
                type: 'CLOSED_ANSWERED',
                activityKey: activity.activity_id,
                answerId: dto.answerId,
                score: check.score,
                why: check.why,
                quote: check.quote,
              },
              {
                type: 'ACTIVITY_CLOSED',
                activityKey: activity.activity_id,
                nextActivityKey: next,
              },
            ],
            result,
          };
        }

        const text = (dto.text ?? '').trim();
        if (text.length < TEXT_MIN || text.length > TEXT_MAX)
          throw invalid(
            'text',
            `Câu trả lời phải dài từ ${TEXT_MIN} tới ${TEXT_MAX} ký tự.`,
          );

        await tx.answer.create({
          data: {
            id: dto.answerId,
            runId,
            activityKey: activity.activity_id,
            followupNo: dto.followupNo,
            followupQuestion:
              state.stage === 'followup'
                ? (state.pendingFollowup?.question ?? null)
                : null,
            taskType: 'FREE_TEXT',
            text,
          },
        });
        grading = await this.assessment.requestGrading(tx, runId, dto.answerId);

        // Engine quyết hỏi vặn ngay bây giờ, không chờ điểm (① 30/10).
        const allowed = followUpAllowed(activity, state, dto.followupNo);
        const append: PlayEvent[] = [
          {
            type: 'TEXT_SUBMITTED',
            activityKey: activity.activity_id,
            answerId: dto.answerId,
            followupNo: dto.followupNo,
            followUpAllowed: allowed,
          },
        ];
        if (!allowed) {
          append.push({
            type: 'ACTIVITY_CLOSED',
            activityKey: activity.activity_id,
            nextActivityKey: next,
          });
          closedNow = { activity, next };
        }
        const result: Accepted<AnswerResult> = {
          status: 202,
          body: {
            jobId: grading.aiJobId,
            answerId: dto.answerId,
            streamEvent: 'answer.graded',
          },
        };
        return { append, result };
      },
    );

    // Sau khi transaction đã ghi: worker đọc được, màn hình nhận được.
    const job = grading as GradingRequest | null;
    if (job) await this.assessment.enqueue(job);
    const closed = closedNow as {
      activity: Activity;
      next: string | null;
    } | null;
    if (closed)
      await this.stream.publish(user.id, {
        type: 'activity.closed',
        runId,
        payload: {
          activityKey: closed.activity.activity_id,
          closingLine: closed.activity.closing_prompt,
          nextActivityKey: closed.next,
        },
      });
    return outcome;
  }

  private async replay(
    runId: string,
    answerId: string,
  ): Promise<Accepted<AnswerResult> | null> {
    const stored = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: { assessment: true },
    });
    if (!stored) return null;
    if (stored.runId !== runId)
      throw conflict('Answer id belongs to another run');
    if (stored.assessment)
      return {
        status: 202,
        body: {
          jobId: stored.assessment.aiJobId,
          answerId,
          streamEvent: 'answer.graded',
        },
      };
    const { scenario, state } = await this.runLog.load(runId);
    const activity = findActivity(scenario, stored.activityKey);
    return {
      status: 200,
      body: {
        answerId,
        score: (stored.systemScore ?? 0) as 0 | 1 | 2,
        hintUsed: state.hints.includes(stored.activityKey),
        closingLine: activity.closing_prompt,
        nextActivityKey: nextActivityKey(activity),
      },
    };
  }

  /* ── Gợi ý, báo nội dung sai ─────────────────────────────────────── */

  /** Gợi ý chỉ được ghi nhận, không bao giờ hạ điểm (FR-13, quyết định Q5 11/11). */
  async viewHint(user: AuthUser, runId: string, dto: HintDto) {
    await this.owned(user, runId);
    return this.runLog.update(runId, ({ state, scenario }) => {
      if (dto.activityKey !== state.activityKey)
        throw conflict('Not the current activity');
      const hint = findActivity(scenario, dto.activityKey).hints[0];
      if (!hint)
        throw new Problem(404, 'NOT_FOUND', 'This activity has no hint');
      const speaker = speakerOf(scenario, hint.text);
      return {
        append: state.hints.includes(dto.activityKey)
          ? []
          : [
              {
                type: 'HINT_VIEWED',
                activityKey: dto.activityKey,
              } as PlayEvent,
            ],
        result: {
          npcKey: speaker?.npcKey ?? '',
          text: stripNpcPrefix(hint.text),
          hintUsed: true as const,
        },
      };
    });
  }

  async flag(user: AuthUser, runId: string, dto: FlagDto): Promise<void> {
    await this.owned(user, runId);
    await this.runLog.update(runId, () => ({
      append: [
        {
          type: 'CONTENT_FLAGGED',
          activityKey: dto.activityKey,
          reason: dto.reason,
        },
      ],
      result: undefined,
    }));
  }

  /* ── Bản phát hành (thay cho CDN khi chạy local) ─────────────────── */

  async release(version: string): Promise<Scenario> {
    const parsed = parseReleaseVersion(version);
    if (!parsed) throw new Problem(404, 'NOT_FOUND', 'Unknown release version');
    const index = await this.content
      .indexAt(parsed.contentVersion)
      .catch(() => null);
    const entry = index?.findScenarioByKey(parsed.scenarioKey);
    if (!entry) throw new Problem(404, 'NOT_FOUND', 'Unknown release version');
    return entry.scenario;
  }

  /* ── Phụ trợ ─────────────────────────────────────────────────────── */

  async owned(user: AuthUser, runId: string): Promise<ScenarioRun> {
    const run = await this.prisma.scenarioRun.findUnique({
      where: { id: runId },
    });
    if (!run || run.userId !== user.id || run.flow !== 'events')
      throw new Problem(404, 'NOT_FOUND', 'Run not found');
    return run;
  }

  private async view(run: ScenarioRun): Promise<RunView> {
    return this.toRunView(run, await this.runLog.scenarioOf(run));
  }

  private toRunView(run: ScenarioRun, scenario: Scenario): RunView {
    const { job, context, cast } = scenario;
    return {
      id: run.id,
      status: run.status,
      isPlaytest: false,
      releaseVersion: releaseVersionOf(run),
      intro: job.user_context ?? '',
      context: {
        role: [job.title_vn, job.role_name_vn].filter(Boolean).join(' · '),
        team: cast.map((c) => c.role_in_scene).join('\n'),
        situation: context.situation ?? '',
        stakes: context.stakes ?? '',
      },
      currentActivityKey:
        run.status === 'FINISHED' ? null : run.currentActivityKey,
      startedAt: run.startedAt.toISOString(),
    };
  }

  private toActivityView(
    activity: Activity,
    state: PlayState,
    scenario: Scenario,
  ): ActivityView {
    const npc = activity.npc_line
      ? speakerOf(scenario, activity.npc_line)
      : null;

    let items: ActivityView['items'];
    if (activity.type === 'CHOICE')
      items = (activity.options ?? []).map((text, i) => ({
        key: String(i),
        text,
      }));
    else if (activity.type === 'ORDERING')
      items = orderingShuffle(activity).map((id) => ({
        key: id,
        text: activity.items?.find((x) => x.item_id === id)?.text ?? id,
      }));
    else if (activity.type === 'PRIORITIZING')
      items = (activity.items ?? []).map((item) => ({
        key: item.item_id,
        text: item.text,
        ...(item.note ? { note: item.note } : {}),
      }));

    const pending = state.stage === 'followup' ? state.pendingFollowup : null;
    return {
      activityKey: activity.activity_id,
      taskType: TASK_TYPE[activity.type],
      setup: activity.setup,
      ...(npc && activity.npc_line
        ? {
            npc: {
              npcKey: npc.npcKey,
              name: npc.name,
              line: stripNpcPrefix(activity.npc_line),
            },
          }
        : {}),
      ...(activity.input_prompt ? { inputPrompt: activity.input_prompt } : {}),
      ...(items ? { items } : {}),
      ...(activity.type === 'PRIORITIZING'
        ? { pickCount: activity.pick_count ?? 0 }
        : {}),
      hintAvailable: activity.hints.length > 0,
      randomEvent: null,
      followup: pending
        ? {
            followupNo: pending.followupNo,
            npcKey: pending.npcKey,
            name: pending.name,
            question: pending.question,
          }
        : null,
    };
  }
}

export type { LoadedRun };
