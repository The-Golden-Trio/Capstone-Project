/**
 * Lưu và dựng lại lượt ca làm từ chuỗi sự kiện (ERD-05 `run_event`).
 *
 * Trạng thái không lưu riêng: mỗi lần cần thì fold chuỗi đầu vào qua engine
 * của game-core (CLAUDE.md: run là chuỗi sự kiện append-only). Output của
 * model nằm trong chuỗi kèm provenance, nên fold không bao giờ gọi lại model.
 *
 * Dùng chung cho API (nhận lượt) và worker (xử lý phần AI của lượt).
 */
import { Injectable } from '@nestjs/common';
import { shift, type KnownIdentity } from '@datn/game-core';
import { ProblemException } from '../common/problem';
import { ContentService } from '../content/content.service';
import type { Prisma, ScenarioRun } from '../generated/prisma/client';
import { RunEventType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

/** Trần chi phí AI của một lượt chơi (NFR-11). Giá trị khởi đầu, chưa chốt. */
export const RUN_BUDGET_USD = 0.25;

export interface LoadedRun {
  run: ScenarioRun;
  ctx: shift.ShiftContext;
  state: shift.ShiftState;
  lastSeq: number;
  lastEventId: bigint | null;
  costUsd: number;
}

export interface NewEvent {
  type: RunEventType;
  turnId: string | null;
  payload: Prisma.InputJsonValue;
}

const asJson = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

export const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  (err as { code?: string }).code === 'P2002';

export function inputEvent(
  input: shift.ShiftInput,
  turnId: string | null,
): NewEvent {
  const type =
    input.type === 'NARRATION'
      ? RunEventType.AI_NARRATION
      : input.type === 'CHECKS'
        ? RunEventType.AI_CHECKS
        : RunEventType.PLAYER_INPUT;
  return { type, turnId, payload: asJson({ input }) };
}

/** Thay chỗ giữ tên `{ten}` mà AI-4 viết bằng tên người chơi (khối A2). */
export function presentLines(
  lines: readonly shift.TranscriptLine[],
  displayName: string,
) {
  return lines.map((l) =>
    l.text.includes('{ten}')
      ? { ...l, text: l.text.replace(/\{ten\}/g, displayName) }
      : l,
  );
}

@Injectable()
export class RunStore {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
  ) {}

  /** Đọc một lượt ca làm và fold ra trạng thái. Không phải của người chơi thì 404. */
  async load(runId: string, userId?: string): Promise<LoadedRun> {
    const run = await this.prisma.scenarioRun.findUnique({
      where: { id: runId },
    });
    if (
      !run ||
      run.schemaVersion !== 2 ||
      !run.seedId ||
      (userId && run.userId !== userId)
    )
      throw new ProblemException(404, 'NOT_FOUND', 'Không tìm thấy lượt chơi');
    const ctx = await this.content.shiftContextAt(
      run.contentVersion,
      run.seedId,
    );
    if (!ctx)
      throw new ProblemException(
        409,
        'SCENARIO_UNAVAILABLE',
        'Nội dung của lượt chơi này không còn',
      );

    const events = await this.prisma.runEvent.findMany({
      where: { runId },
      orderBy: { seq: 'asc' },
      select: { id: true, seq: true, type: true, payload: true },
    });
    const inputs: shift.ShiftInput[] = [];
    let costUsd = 0;
    for (const e of events) {
      if (e.type === RunEventType.RUN_PAUSED) continue;
      const input = (e.payload as { input: shift.ShiftInput }).input;
      inputs.push(input);
      if (input.type === 'NARRATION' || input.type === 'CHECKS')
        costUsd += input.provenance?.costUsd ?? 0;
    }
    const last = events.at(-1);
    return {
      run,
      ctx,
      state: shift.fold(ctx, inputs),
      lastSeq: last?.seq ?? 0,
      lastEventId: last?.id ?? null,
      costUsd,
    };
  }

  /**
   * Nối sự kiện vào cuối chuỗi. `seq` unique theo lượt: hai bên cùng ghi một
   * chỗ thì bên sau nhận 409, không ai ghi đè ai.
   */
  async append(
    tx: Prisma.TransactionClient,
    runId: string,
    afterSeq: number,
    events: NewEvent[],
  ): Promise<bigint> {
    let lastId = 0n;
    for (const [i, e] of events.entries()) {
      const row = await tx.runEvent.create({
        data: {
          runId,
          seq: afterSeq + i + 1,
          type: e.type,
          turnId: e.turnId,
          payload: e.payload,
        },
        select: { id: true },
      });
      lastId = row.id;
    }
    return lastId;
  }

  /** Cập nhật cột tra cứu của lượt chơi theo trạng thái mới; ca xong thì lưu tổng kết. */
  async sync(
    tx: Prisma.TransactionClient,
    loaded: Pick<LoadedRun, 'run' | 'ctx'>,
    state: shift.ShiftState,
  ) {
    const ended = state.ended && loaded.run.status !== 'FINISHED';
    await tx.scenarioRun.update({
      where: { id: loaded.run.id },
      data: {
        currentNodeId: state.activeNode,
        ...(ended ? { status: 'FINISHED', completedAt: new Date() } : {}),
      },
    });
    if (ended)
      await tx.scenarioFeedback.upsert({
        where: { runId: loaded.run.id },
        create: {
          runId: loaded.run.id,
          summary: asJson(shift.shiftSummary(state, loaded.ctx)),
        },
        update: {},
      });
  }

  async identity(
    userId: string,
  ): Promise<{ identity: KnownIdentity; displayName: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true, email: true },
    });
    return {
      displayName: user?.displayName ?? 'bạn',
      identity: {
        names: user ? [user.displayName] : [],
        usernames: user ? [user.username] : [],
        emails: user?.email ? [user.email] : [],
      },
    };
  }
}
