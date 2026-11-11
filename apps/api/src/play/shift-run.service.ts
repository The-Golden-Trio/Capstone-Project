/**
 * Luồng chơi ca làm (Game Design W45) trong PlayModule (CL-03), song song với
 * luồng activity của `RunService`. Máy chủ là nguồn chân lý: mọi lượt chạy
 * qua engine `shift` của game-core ở đây; máy khách chỉ hiển thị.
 *
 * Lượt không cần AI xong ngay trong request (200). Lượt cần AI được ghi rồi
 * đẩy job, trả 202; phần còn lại về qua `/api/v1/stream` (SD-01). Không gọi
 * model trong request.
 */
import { Injectable } from '@nestjs/common';
import { shift } from '@datn/game-core';
import { ContentService } from '../content/content.service';
import { Problem } from '../core/problem';
import { QueueService } from '../core/queues';
import {
  SHIFT_FLOW,
  ShiftLogService,
  pendingTurn,
  presentLines,
  turnRange,
  type LoadedShift,
  type ShiftRecord,
} from '../core/shift-log.service';
import { PrismaService } from '../prisma/prisma.service';
import type { StartShiftDto, TurnDto } from './shift.dto';

export const SHIFT_JOB_KIND = 'SHIFT_TURN';

export interface ShiftRunView {
  id: string;
  status: string;
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

export interface ShiftTask {
  taskId: string;
  title: string;
  situation: string;
  goal: string;
  /** Độ dài ca trong truyện (phút), không phải thời gian chơi. */
  minutes: number;
}

export type ShiftScene = shift.SceneView & {
  paused: boolean;
  pendingTurnId: string | null;
  notes: Array<{ text: string; at: string }>;
};

export type TurnResponse =
  | {
      status: 200;
      body: {
        turnId: string;
        lines: shift.TranscriptLine[];
        scene: ShiftScene;
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
    case 'hint':
      return { type: 'HINT' };
  }
}

type TurnOutcome =
  | { kind: 'replay'; loaded: LoadedShift; range: { from: number; to: number } }
  | {
      kind: 'new';
      loaded: LoadedShift;
      next: shift.ShiftState;
      needsAi: boolean;
    };

function ruleProblem(err: unknown): never {
  if (err instanceof shift.ShiftRuleError) {
    if (err.code === 'TURN_IN_PROGRESS')
      throw new Problem(409, 'TURN_IN_PROGRESS', 'Lượt trước còn đang xử lý');
    if (err.code === 'RUN_ENDED')
      throw new Problem(409, 'RUN_ENDED', 'Ca đã kết thúc');
    throw new Problem(422, 'TURN_INVALID', 'Thao tác không hợp luật lúc này', [
      { reason: err.message },
    ]);
  }
  throw err;
}

@Injectable()
export class ShiftRunService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
    private readonly log: ShiftLogService,
    private readonly queues: QueueService,
  ) {}

  /* ── Mở lượt ── */

  /**
   * Mở lượt mới, hoặc trả lại lượt đang dở của cùng nhiệm vụ (NFR-03).
   * Chưa xét mở khoá cấp: luật mới (D-114) chưa có, và ca làm chưa chấm.
   */
  async start(
    userId: string,
    dto: StartShiftDto,
  ): Promise<{ created: boolean; run: ShiftRunView }> {
    const version = await this.content.activeVersion();
    const ctx = await this.content.shiftContextAt(version, dto.taskId);
    if (!ctx)
      throw new Problem(
        409,
        'SCENARIO_UNAVAILABLE',
        'Nhiệm vụ này đang tạm đóng',
      );

    const existing = await this.prisma.scenarioRun.findFirst({
      where: {
        userId,
        flow: SHIFT_FLOW,
        scenarioKey: dto.taskId,
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
    });
    if (existing)
      return { created: false, run: await this.get(userId, existing.id) };

    const [roleCode, band] = ctx.seed.id.split('.');
    const run = await this.prisma.$transaction(async (tx) => {
      const created = await tx.scenarioRun.create({
        data: {
          userId,
          scenarioKey: ctx.seed.id,
          roleCode,
          band,
          seed: 0n,
          contentVersion: version,
          flow: SHIFT_FLOW,
        },
      });
      await this.log.begin(tx, created, ctx, {
        type: 'PLAYER_INPUT',
        input: { type: 'START' },
        lineFrom: 0,
      });
      return created;
    });
    return { created: true, run: await this.get(userId, run.id) };
  }

  /* ── Đọc ── */

  /** Các ca làm của một cấp ở phiên bản nội dung đang phục vụ (để bản đồ nghề mở được). */
  async tasks(roleCode: string, band: string): Promise<ShiftTask[]> {
    const version = await this.content.activeVersion();
    const docs = await this.prisma.shiftSeedDoc.findMany({
      where: { version, levelRef: `${roleCode}.${band}` },
      orderBy: { seedId: 'asc' },
      select: { seedId: true },
    });
    const out: ShiftTask[] = [];
    for (const doc of docs) {
      const ctx = await this.content.shiftContextAt(version, doc.seedId);
      if (ctx)
        out.push({
          taskId: ctx.seed.id,
          title: ctx.seed.title,
          situation: ctx.seed.situation,
          goal: ctx.seed.goal,
          minutes: ctx.seed.clock.budget * ctx.pack.minutes_per_point,
        });
    }
    return out;
  }

  async get(userId: string, runId: string): Promise<ShiftRunView> {
    const { run, ctx, records, state } = await this.log.load(runId, userId);
    const pending = pendingTurn(records, state);
    return {
      id: run.id,
      status: run.status,
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
      paused: pending?.paused ?? false,
      pendingTurnId: pending?.turnId ?? null,
    };
  }

  private sceneOf(
    loaded: Pick<LoadedShift, 'records' | 'ctx' | 'state'>,
  ): ShiftScene {
    const pending = pendingTurn(loaded.records, loaded.state);
    return {
      ...shift.sceneView(loaded.state, loaded.ctx),
      paused: pending?.paused ?? false,
      pendingTurnId: pending?.turnId ?? null,
      notes: loaded.records
        .filter((r) => r.type === 'NOTE_ADDED')
        .map((r) => ({
          text: String(r.data?.text ?? ''),
          at: String(r.data?.at ?? ''),
        })),
    };
  }

  async scene(userId: string, runId: string): Promise<ShiftScene> {
    return this.sceneOf(await this.log.load(runId, userId));
  }

  async transcript(
    userId: string,
    runId: string,
    after = -1,
  ): Promise<shift.TranscriptLine[]> {
    const loaded = await this.log.load(runId, userId);
    const { displayName } = await this.log.identity(userId);
    return presentLines(
      loaded.state.transcript.filter((l) => l.seq > after),
      displayName,
    );
  }

  /** Tổng kết theo truyện, chưa chấm điểm. Tính lại từ chuỗi sự kiện mỗi lần đọc. */
  async summary(userId: string, runId: string): Promise<shift.ShiftSummary> {
    const { state, ctx } = await this.log.load(runId, userId);
    if (!state.ended)
      throw new Problem(404, 'SUMMARY_NOT_READY', 'Ca chưa kết thúc');
    return shift.shiftSummary(state, ctx);
  }

  /* ── Lượt ── */

  async submitTurn(
    userId: string,
    runId: string,
    dto: TurnDto,
  ): Promise<TurnResponse> {
    const input = toPlayerInput(dto);
    const outcome = await this.log.update<TurnOutcome>(
      runId,
      (loaded) => {
        // Gửi lại cùng turnId: trả đúng kết quả cũ (NFR-04).
        const range = turnRange(loaded.records, loaded.state, dto.turnId);
        if (range)
          return { result: { kind: 'replay' as const, loaded, range } };

        if (pendingTurn(loaded.records, loaded.state)?.paused)
          throw new Problem(
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
        const record: ShiftRecord = {
          type: 'PLAYER_INPUT',
          turnId: dto.turnId,
          input,
          lineFrom: loaded.state.transcript.length,
        };
        return {
          append: [record],
          result: {
            kind: 'new' as const,
            loaded,
            next,
            needsAi: next.pending !== null,
          },
        };
      },
      userId,
    );

    const { displayName } = await this.log.identity(userId);
    if (outcome.kind === 'replay') {
      const { loaded, range } = outcome;
      const lines = presentLines(
        loaded.state.transcript.slice(range.from, range.to),
        displayName,
      );
      const pending = pendingTurn(loaded.records, loaded.state);
      if (pending?.turnId === dto.turnId)
        return {
          status: 202,
          body: {
            jobId: dto.turnId,
            turnId: dto.turnId,
            streamEvent: 'turn.done',
            lines,
          },
        };
      return {
        status: 200,
        body: { turnId: dto.turnId, lines, scene: this.sceneOf(loaded) },
      };
    }

    const { loaded, next, needsAi } = outcome;
    const lines = presentLines(
      next.transcript.slice(loaded.state.transcript.length),
      displayName,
    );
    if (needsAi) {
      await this.enqueue(runId, dto.turnId, dto.turnId);
      return {
        status: 202,
        body: {
          jobId: dto.turnId,
          turnId: dto.turnId,
          streamEvent: 'turn.done',
          lines,
        },
      };
    }
    const records = [
      ...loaded.records,
      { type: 'PLAYER_INPUT' as const, turnId: dto.turnId },
    ];
    return {
      status: 200,
      body: {
        turnId: dto.turnId,
        lines,
        scene: this.sceneOf({ records, ctx: loaded.ctx, state: next }),
      },
    };
  }

  /** `ai_job` cho việc AI của một lượt, rồi đẩy vào queue (sau khi đã ghi sự kiện). */
  private async enqueue(
    runId: string,
    turnId: string,
    aiJobId: string,
  ): Promise<void> {
    await this.prisma.aiJob.create({
      data: { id: aiJobId, kind: SHIFT_JOB_KIND, runId },
    });
    await this.queues.enqueueShiftTurn({ aiJobId, runId, turnId });
  }

  /** Tiếp tục phiên đã tạm dừng vì hết model (D-92): đẩy lại việc AI của lượt đang dừng. */
  async resume(
    userId: string,
    runId: string,
  ): Promise<{ jobId: string; turnId: string }> {
    const turnId = await this.log.update(
      runId,
      (loaded) => {
        const pending = pendingTurn(loaded.records, loaded.state);
        if (!pending?.paused)
          throw new Problem(409, 'NOT_PAUSED', 'Phiên không tạm dừng');
        return {
          append: [{ type: 'RUN_RESUMED', turnId: pending.turnId }],
          result: pending.turnId,
        };
      },
      userId,
    );
    const jobId = `${turnId}-r${Date.now()}`;
    await this.enqueue(runId, turnId, jobId);
    return { jobId, turnId };
  }

  /* ── Sổ tay, báo lỗi ── */

  async addNote(userId: string, runId: string, text: string) {
    const at = new Date().toISOString();
    await this.log.update(
      runId,
      () => ({
        append: [{ type: 'NOTE_ADDED', data: { text, at } }],
        result: null,
      }),
      userId,
    );
    return { text, at };
  }

  async flag(
    userId: string,
    runId: string,
    dto: { activityKey: string; reason: string },
  ): Promise<void> {
    await this.log.update(
      runId,
      () => ({
        append: [{ type: 'CONTENT_FLAGGED', data: { ...dto } }],
        result: null,
      }),
      userId,
    );
  }
}
