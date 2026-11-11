/**
 * CL-03 RunService cho ca làm: mở lượt, nhận từng lượt của người chơi, trả
 * cảnh và lời thoại. Máy chủ là nguồn chân lý: mọi lượt chạy qua engine của
 * game-core ở đây, máy khách chỉ hiển thị.
 *
 * Lượt không cần AI xong ngay trong request (200). Lượt cần AI được lưu, đẩy
 * job rồi trả 202; phần còn lại về qua `/api/v1/stream` (SD-01).
 */
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { shift } from '@datn/game-core';
import { AssessmentService } from '../assessment/assessment.service';
import {
  RunStore,
  inputEvent,
  isUniqueViolation,
  presentLines,
  type LoadedRun,
} from '../assessment/run-store.service';
import { ProblemException } from '../common/problem';
import { ContentService } from '../content/content.service';
import type { Answer } from '../generated/prisma/client';
import { TurnStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { FlagService } from '../quality/flag.service';
import type { StartRunDto, TurnDto } from './dto/play.dto';

export interface RunView {
  id: string;
  status: 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';
  isPlaytest: boolean;
  seedId: string;
  releaseVersion: string;
  title: string;
  goal: string;
  playerRole: string;
  situation: string;
  cast: Array<{ slot: string; name: string; relation: string }>;
  glossary: Array<{ term: string; plain: string }>;
  startedAt: string;
  paused: boolean;
  pendingTurnId: string | null;
}

export type SceneResponse = shift.SceneView & {
  paused: boolean;
  pendingTurnId: string | null;
  notes: Array<{ id: string; text: string; createdAt: string }>;
};

export type TurnResponse =
  | {
      status: 200;
      body: {
        turnId: string;
        lines: shift.TranscriptLine[];
        scene: SceneResponse;
      };
    }
  | {
      status: 202;
      body: {
        jobId: string;
        turnId: string;
        streamEvent: 'turn.done';
        lines: shift.TranscriptLine[];
      };
    };

/** Đổi lượt gửi lên thành đầu vào của engine. */
export function toPlayerInput(dto: TurnDto): shift.PlayerInput {
  switch (dto.kind) {
    case 'action':
      return {
        type: 'ACTION',
        key: dto.key,
        fields: dto.fields,
        ticks: dto.ticks,
      };
    case 'say':
      return { type: 'SAY', text: dto.text };
    case 'end_conversation':
      return { type: 'END_CONVERSATION' };
    case 'choose':
      return { type: 'CHOOSE', option: dto.option, elapsedMs: dto.elapsedMs };
    case 'timeout':
      return { type: 'TIMEOUT' };
    case 'save_artefact':
      return {
        type: 'SAVE_ARTEFACT',
        artefact: dto.artefact,
        fields: dto.fields,
        ticks: dto.ticks,
      };
    case 'confirm_end':
      return { type: 'CONFIRM_END' };
    case 'cancel_end':
      return { type: 'CANCEL_END' };
  }
}

function ruleProblem(err: unknown): never {
  if (err instanceof shift.ShiftRuleError) {
    if (err.code === 'TURN_IN_PROGRESS')
      throw new ProblemException(
        409,
        'TURN_IN_PROGRESS',
        'Lượt trước còn đang xử lý',
      );
    if (err.code === 'RUN_ENDED')
      throw new ProblemException(409, 'RUN_ENDED', 'Ca đã kết thúc');
    throw new ProblemException(
      422,
      'TURN_INVALID',
      'Thao tác không hợp luật lúc này',
      [{ reason: err.message }],
    );
  }
  throw err;
}

@Injectable()
export class RunService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
    private readonly store: RunStore,
    private readonly assessment: AssessmentService,
    private readonly flags: FlagService,
  ) {}

  /* ── Mở lượt ── */

  /**
   * Mở lượt mới, hoặc trả lại lượt đang dở của cùng nhiệm vụ (NFR-03).
   *
   * Chưa xét mở khoá cấp: luật mở khoá mới (D-114, bậc soft skill) chưa có,
   * và ca làm chưa chấm nên không cộng điểm cấp kiểu prototype.
   */
  async start(
    userId: string,
    dto: StartRunDto,
  ): Promise<{ created: boolean; run: RunView }> {
    const version = await this.content.activeVersion();
    const ctx = await this.content.shiftContextAt(version, dto.taskId);
    if (!ctx)
      throw new ProblemException(
        409,
        'SCENARIO_UNAVAILABLE',
        'Nhiệm vụ này đang tạm đóng',
      );

    const existing = await this.prisma.scenarioRun.findFirst({
      where: {
        userId,
        seedId: dto.taskId,
        schemaVersion: 2,
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
    });
    if (existing)
      return { created: false, run: await this.get(userId, existing.id) };

    const enrolment = dto.enrolmentId
      ? await this.prisma.enrollment.findFirst({
          where: { id: dto.enrolmentId, userId },
          select: { id: true },
        })
      : null;
    const [roleCode, band] = ctx.seed.id.split('.');
    const runId = randomUUID();
    const started = shift.step(
      shift.initialState(ctx),
      { type: 'START' },
      ctx,
    ).state;

    await this.prisma.$transaction(async (tx) => {
      await tx.scenarioRun.create({
        data: {
          id: runId,
          userId,
          scenarioKey: ctx.seed.id,
          roleCode,
          band,
          seed: 0n,
          contentVersion: version,
          schemaVersion: 2,
          seedId: ctx.seed.id,
          enrolmentId: enrolment?.id ?? null,
          currentNodeId: started.activeNode,
        },
      });
      await this.store.append(tx, runId, 0, [
        inputEvent({ type: 'START' }, null),
      ]);
    });
    return { created: true, run: await this.get(userId, runId) };
  }

  /* ── Đọc ── */

  private async pendingTurn(runId: string): Promise<Answer | null> {
    return this.prisma.answer.findFirst({
      where: { runId, status: { in: [TurnStatus.PENDING, TurnStatus.PAUSED] } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async get(userId: string, runId: string): Promise<RunView> {
    const { run, ctx } = await this.store.load(runId, userId);
    const pending = await this.pendingTurn(runId);
    return {
      id: run.id,
      status: run.status,
      isPlaytest: run.isPlaytest,
      seedId: ctx.seed.id,
      releaseVersion: `${ctx.seed.id}@${run.contentVersion}`,
      title: ctx.seed.title,
      goal: ctx.seed.goal,
      playerRole: ctx.seed.player_role,
      situation: ctx.seed.situation,
      cast: ctx.seed.cast.map((c) => ({
        slot: c.slot,
        name: c.name,
        relation: c.relation,
      })),
      glossary: ctx.seed.glossary,
      startedAt: run.startedAt.toISOString(),
      paused: run.pausedAt !== null,
      pendingTurnId: pending?.id ?? null,
    };
  }

  private async sceneOf(
    loaded: LoadedRun,
    state = loaded.state,
  ): Promise<SceneResponse> {
    const [pending, notes] = await Promise.all([
      this.pendingTurn(loaded.run.id),
      this.prisma.playerNote.findMany({
        where: { runId: loaded.run.id },
        orderBy: { createdAt: 'asc' },
        select: { id: true, text: true, createdAt: true },
      }),
    ]);
    return {
      ...shift.sceneView(state, loaded.ctx),
      paused: loaded.run.pausedAt !== null,
      pendingTurnId: pending?.id ?? null,
      notes: notes.map((n) => ({
        id: n.id,
        text: n.text,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  async scene(userId: string, runId: string): Promise<SceneResponse> {
    return this.sceneOf(await this.store.load(runId, userId));
  }

  async transcript(
    userId: string,
    runId: string,
    after = -1,
  ): Promise<shift.TranscriptLine[]> {
    const loaded = await this.store.load(runId, userId);
    const { displayName } = await this.store.identity(userId);
    return presentLines(
      loaded.state.transcript.filter((l) => l.seq > after),
      displayName,
    );
  }

  async summary(userId: string, runId: string): Promise<shift.ShiftSummary> {
    await this.store.load(runId, userId);
    const feedback = await this.prisma.scenarioFeedback.findUnique({
      where: { runId },
    });
    if (!feedback)
      throw new ProblemException(404, 'SUMMARY_NOT_READY', 'Ca chưa kết thúc');
    return feedback.summary as unknown as shift.ShiftSummary;
  }

  /* ── Lượt ── */

  async submitTurn(
    userId: string,
    runId: string,
    dto: TurnDto,
  ): Promise<TurnResponse> {
    return this.submit(
      userId,
      runId,
      dto.turnId,
      dto.kind,
      toPlayerInput(dto),
      dto.kind === 'say' ? dto.text : null,
    );
  }

  /** Gợi ý (D4): một đầu vào của engine như mọi lượt khác, không tốn điểm. */
  async hint(
    userId: string,
    runId: string,
    turnId: string,
  ): Promise<TurnResponse> {
    return this.submit(userId, runId, turnId, 'hint', { type: 'HINT' }, null);
  }

  private async submit(
    userId: string,
    runId: string,
    turnId: string,
    kind: string,
    input: shift.PlayerInput,
    text: string | null,
  ): Promise<TurnResponse> {
    const repeated = await this.prisma.answer.findUnique({
      where: { id: turnId },
    });
    if (repeated) {
      if (repeated.runId !== runId)
        throw new ProblemException(
          409,
          'CONFLICT',
          'turnId đã dùng cho lượt chơi khác',
        );
      return this.replay(userId, runId, repeated);
    }

    const loaded = await this.store.load(runId, userId);
    if (loaded.run.pausedAt)
      throw new ProblemException(
        409,
        'RUN_PAUSED',
        'Phiên đang tạm dừng, hãy tiếp tục trước',
      );
    let next: shift.ShiftState;
    try {
      next = shift.step(loaded.state, input, loaded.ctx).state;
    } catch (err) {
      ruleProblem(err);
    }

    const needsAi = next.pending !== null;
    const lineFrom = loaded.state.transcript.length;
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.store.append(tx, runId, loaded.lastSeq, [
          inputEvent(input, turnId),
        ]);
        await tx.answer.create({
          data: {
            id: turnId,
            runId,
            kind,
            text,
            payload: JSON.parse(JSON.stringify(input)),
            status: needsAi ? TurnStatus.PENDING : TurnStatus.DONE,
            jobId: needsAi ? turnId : null,
            lineFrom,
            lineTo: needsAi ? null : next.transcript.length,
            completedAt: needsAi ? null : new Date(),
          },
        });
        if (!needsAi) await this.store.sync(tx, loaded, next);
      });
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ProblemException(
          409,
          'TURN_IN_PROGRESS',
          'Có lượt khác vừa được ghi, hãy tải lại',
        );
      throw err;
    }

    const { displayName } = await this.store.identity(userId);
    const lines = presentLines(next.transcript.slice(lineFrom), displayName);
    if (needsAi) {
      const jobId = await this.assessment.requestTurn(runId, turnId);
      return {
        status: 202,
        body: { jobId, turnId, streamEvent: 'turn.done', lines },
      };
    }
    return {
      status: 200,
      body: { turnId, lines, scene: await this.sceneOf(loaded, next) },
    };
  }

  /** Gửi lại cùng `turnId`: trả đúng kết quả cũ (NFR-04). */
  private async replay(
    userId: string,
    runId: string,
    answer: Answer,
  ): Promise<TurnResponse> {
    const loaded = await this.store.load(runId, userId);
    const { displayName } = await this.store.identity(userId);
    const lines = presentLines(
      loaded.state.transcript.slice(
        answer.lineFrom,
        answer.lineTo ?? undefined,
      ),
      displayName,
    );
    if (answer.status !== TurnStatus.DONE)
      return {
        status: 202,
        body: {
          jobId: answer.jobId ?? answer.id,
          turnId: answer.id,
          streamEvent: 'turn.done',
          lines,
        },
      };
    return {
      status: 200,
      body: { turnId: answer.id, lines, scene: await this.sceneOf(loaded) },
    };
  }

  /** Tiếp tục phiên đã tạm dừng vì hết model (D-92): đẩy lại job của lượt đang dừng. */
  async resume(
    userId: string,
    runId: string,
  ): Promise<{ jobId: string; turnId: string }> {
    const loaded = await this.store.load(runId, userId);
    const paused = await this.prisma.answer.findFirst({
      where: { runId, status: TurnStatus.PAUSED },
    });
    if (!loaded.run.pausedAt || !paused)
      throw new ProblemException(409, 'NOT_PAUSED', 'Phiên không tạm dừng');
    await this.prisma.$transaction([
      this.prisma.answer.update({
        where: { id: paused.id },
        data: { status: TurnStatus.PENDING },
      }),
      this.prisma.scenarioRun.update({
        where: { id: runId },
        data: { pausedAt: null },
      }),
    ]);
    const jobId = await this.assessment.requestTurn(
      runId,
      paused.id,
      Date.now(),
    );
    return { jobId, turnId: paused.id };
  }

  /* ── Sổ tay, báo lỗi ── */

  async addNote(userId: string, runId: string, text: string) {
    await this.store.load(runId, userId);
    const note = await this.prisma.playerNote.create({ data: { runId, text } });
    return {
      id: note.id,
      text: note.text,
      createdAt: note.createdAt.toISOString(),
    };
  }

  async flag(
    userId: string,
    runId: string,
    dto: { activityKey: string; reason: string },
  ) {
    await this.store.load(runId, userId);
    await this.flags.create(runId, dto);
  }
}
