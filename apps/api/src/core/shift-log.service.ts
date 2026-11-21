/**
 * Sổ sự kiện của lượt ca làm (`ScenarioRun.flow = 'shift'`, Game Design W45).
 *
 * Cùng cách với `RunLogService` của luồng activity: mọi thay đổi đi qua
 * `update`, khoá dòng `ScenarioRun` (SELECT … FOR UPDATE), đọc chuỗi
 * `run_event`, fold ra trạng thái bằng engine `shift` của game-core, để bên
 * gọi quyết định ghi thêm gì, rồi ghi — trong một transaction. API và worker
 * cùng ghi vào một lượt mà không chen thứ tự của nhau.
 *
 * Mỗi `run_event.payload` là một `ShiftRecord`. Chỉ bản ghi có `input` là
 * đầu vào của engine; ghi chú, báo lỗi, tạm dừng nằm cùng chuỗi nhưng không
 * đổi trạng thái. Output của model nằm trong `input` kèm provenance, nên fold
 * không bao giờ gọi lại model.
 */
import { Injectable, Logger } from '@nestjs/common';
import { shift, type KnownIdentity } from '@datn/game-core';
import { ContentService } from '../content/content.service';
import { Prisma, type ScenarioRun } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Problem } from './problem';
import { QueueService, type ShiftGradeJob } from './queues';

export type Tx = Prisma.TransactionClient;

export const SHIFT_FLOW = 'shift';

export type ShiftRecordType =
  | 'PLAYER_INPUT'
  | 'AI_NARRATION'
  | 'AI_CHECKS'
  | 'RUN_PAUSED'
  | 'RUN_RESUMED'
  | 'NOTE_ADDED'
  | 'CONTENT_FLAGGED'
  /** Một đoạn bằng chứng đã đóng và được xếp hàng chấm (`data.segment`, `data.aiJobId`). */
  | 'GRADING_REQUESTED'
  /** Kết quả chấm một đoạn (`data`: xem `ShiftSegmentGrader`). Không đổi trạng thái engine. */
  | 'SEGMENT_GRADED';

/** Bản ghi nằm cạnh luồng chơi nhưng không do người chơi hay model dẫn truyện sinh ra. */
export const SIDE_RECORDS: readonly ShiftRecordType[] = [
  'NOTE_ADDED',
  'CONTENT_FLAGGED',
  'GRADING_REQUESTED',
  'SEGMENT_GRADED',
];

/** `ai_job.id` của việc chấm một đoạn. Không dùng ':' vì BullMQ cấm trong jobId. */
export const gradingJobId = (runId: string, segment: string): string =>
  `${runId}-${segment}`;

export interface ShiftRecord {
  type: ShiftRecordType;
  /** Lượt người chơi sinh ra bản ghi này (NFR-04: gửi lại cùng id thì nhận lại kết quả cũ). */
  turnId?: string;
  /** Đầu vào của engine: thao tác người chơi, hoặc kết quả AI kèm provenance. */
  input?: shift.ShiftInput;
  /** Với `PLAYER_INPUT`: số dòng transcript trước lượt này. */
  lineFrom?: number;
  /** Ghi chú, báo lỗi, lý do tạm dừng. */
  data?: Record<string, unknown>;
}

export interface LoadedShift {
  run: ScenarioRun;
  ctx: shift.ShiftContext;
  records: ShiftRecord[];
  state: shift.ShiftState;
  /** Chi phí AI đã tiêu trong lượt (NFR-11). */
  costUsd: number;
}

export interface ShiftChange<T> {
  append?: ShiftRecord[];
  result: T;
}

export const inputsOf = (records: readonly ShiftRecord[]): shift.ShiftInput[] =>
  records.flatMap((r) => (r.input ? [r.input] : []));

/** Lượt người chơi gần nhất có `turnId` này, và khoảng dòng thoại nó sinh ra. */
export function turnRange(
  records: readonly ShiftRecord[],
  state: shift.ShiftState,
  turnId: string,
): { from: number; to: number } | null {
  const players = records.filter((r) => r.type === 'PLAYER_INPUT');
  const i = players.findIndex((r) => r.turnId === turnId);
  if (i < 0) return null;
  const from = players[i].lineFrom ?? 0;
  const to = players[i + 1]?.lineFrom ?? state.transcript.length;
  return { from, to };
}

/** Lượt đang chờ AI (nếu có), và nó có đang tạm dừng vì hết model không (D-92). */
export function pendingTurn(
  records: readonly ShiftRecord[],
  state: shift.ShiftState,
): { turnId: string; paused: boolean } | null {
  if (!state.pending) return null;
  const flow = records.filter((r) => !SIDE_RECORDS.includes(r.type));
  const turnId = [...flow]
    .reverse()
    .find((r) => r.type === 'PLAYER_INPUT')?.turnId;
  if (!turnId) return null;
  return { turnId, paused: flow.at(-1)?.type === 'RUN_PAUSED' };
}

/** Thay chỗ giữ tên `{ten}` mà AI-4 viết bằng tên người chơi (Seed khối A2). */
export function presentLines(
  lines: readonly shift.TranscriptLine[],
  displayName: string,
): shift.TranscriptLine[] {
  return lines.map((l) =>
    l.text.includes('{ten}')
      ? { ...l, text: l.text.replace(/\{ten\}/g, displayName) }
      : l,
  );
}

@Injectable()
export class ShiftLogService {
  private readonly logger = new Logger(ShiftLogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
    private readonly queues: QueueService,
  ) {}

  async contextOf(
    run: Pick<ScenarioRun, 'scenarioKey' | 'contentVersion'>,
  ): Promise<shift.ShiftContext> {
    const ctx = await this.content.shiftContextAt(
      run.contentVersion,
      run.scenarioKey,
    );
    if (!ctx)
      throw new Problem(
        409,
        'SCENARIO_UNAVAILABLE',
        'Nội dung của lượt chơi này không còn',
      );
    return ctx;
  }

  private async read(
    db: Tx | PrismaService,
    run: ScenarioRun,
  ): Promise<LoadedShift> {
    const rows = await db.runEvent.findMany({
      where: { runId: run.id },
      orderBy: { seq: 'asc' },
      select: { payload: true },
    });
    const records = rows.map((r) => r.payload as unknown as ShiftRecord);
    const ctx = await this.contextOf(run);
    let costUsd = 0;
    for (const r of records) {
      if (
        r.input &&
        (r.input.type === 'NARRATION' || r.input.type === 'CHECKS')
      )
        costUsd += r.input.provenance?.costUsd ?? 0;
      else if (r.type === 'SEGMENT_GRADED')
        costUsd += Number(r.data?.costUsd ?? 0);
    }
    return {
      run,
      ctx,
      records,
      state: shift.fold(ctx, inputsOf(records)),
      costUsd,
    };
  }

  private check(run: ScenarioRun | null, userId?: string): ScenarioRun {
    if (
      !run ||
      run.flow !== SHIFT_FLOW ||
      (userId !== undefined && run.userId !== userId)
    )
      throw new Problem(404, 'NOT_FOUND', 'Không tìm thấy lượt chơi');
    return run;
  }

  /** Đọc không khoá — cho các đường chỉ xem. Có `userId` thì chỉ chủ lượt đọc được. */
  async load(runId: string, userId?: string): Promise<LoadedShift> {
    const run = await this.prisma.scenarioRun.findUnique({
      where: { id: runId },
    });
    return this.read(this.prisma, this.check(run, userId));
  }

  /**
   * Đọc, quyết, ghi — nguyên tử. `decide` nhận trạng thái mới nhất (đã khoá)
   * và trả về bản ghi cần nối thêm; ném lỗi thì không có gì được ghi.
   */
  update<T>(
    runId: string,
    decide: (
      loaded: LoadedShift,
      tx: Tx,
    ) => Promise<ShiftChange<T>> | ShiftChange<T>,
    userId?: string,
  ): Promise<T> {
    let jobs: ShiftGradeJob[] = [];
    return this.prisma
      .$transaction(async (tx) => {
        jobs = [];
        await tx.$queryRaw`SELECT id FROM "ScenarioRun" WHERE id = ${runId} FOR UPDATE`;
        const run = this.check(
          await tx.scenarioRun.findUnique({ where: { id: runId } }),
          userId,
        );
        const loaded = await this.read(tx, run);
        const { append = [], result } = await decide(loaded, tx);
        if (append.length > 0) {
          const written = await this.write(tx, loaded, append);
          jobs = written.jobs;
        }
        return result;
      })
      .then(async (result) => {
        // Sau khi đã ghi: worker đọc được mọi thứ nó cần (§5.3.1). Đẩy hụt thì
        // `ShiftRunService.summary` đẩy lại, BullMQ bỏ bản trùng theo jobId.
        for (const job of jobs)
          await this.queues.enqueueShiftGrading(job).catch((e: unknown) => {
            this.logger.warn(
              `Chưa đẩy được job chấm ${job.aiJobId}: ${String(e)}`,
            );
          });
        return result;
      });
  }

  /** Tên hiển thị và những gì cần khử trước khi gửi model (DC-03). */
  async identity(
    userId: string,
  ): Promise<{ identity: KnownIdentity; displayName: string }> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true, email: true },
    });
    return {
      displayName: user?.displayName ?? 'bạn',
      identity: {
        names: user?.displayName ? [user.displayName] : [],
        usernames: user?.username ? [user.username] : [],
        emails: user?.email ? [user.email] : [],
      },
    };
  }

  /** Ghi bản ghi đầu tiên của một lượt vừa tạo (trong cùng transaction tạo lượt). */
  async begin(
    tx: Tx,
    run: ScenarioRun,
    ctx: shift.ShiftContext,
    first: ShiftRecord,
  ): Promise<shift.ShiftState> {
    return (
      await this.write(
        tx,
        { run, ctx, records: [], state: shift.initialState(ctx), costUsd: 0 },
        [first],
      )
    ).state;
  }

  /**
   * Đoạn bằng chứng vừa đóng mà chưa xếp hàng chấm (D-91, CL-06
   * `requestGrading`: "when a node closes or a phase ends"). Chỉ khi seed có
   * `observes`; không có thì ca không được chấm.
   */
  private dueSegments(
    ctx: shift.ShiftContext,
    state: shift.ShiftState,
    records: readonly ShiftRecord[],
  ): string[] {
    const observes = ctx.seed.observes ?? [];
    if (observes.length === 0) return [];
    const requested = new Set(
      records
        .filter((r) => r.type === 'GRADING_REQUESTED')
        .map((r) => String(r.data?.segment)),
    );
    return shift
      .closedSegments(state, ctx, observes)
      .filter((seg) => seg.subs.length > 0 && !requested.has(seg.id))
      .map((seg) => seg.id);
  }

  private async write(
    tx: Tx,
    loaded: LoadedShift,
    append: ShiftRecord[],
  ): Promise<{ state: shift.ShiftState; jobs: ShiftGradeJob[] }> {
    const runId = loaded.run.id;
    const state = shift.fold(
      loaded.ctx,
      inputsOf([...loaded.records, ...append]),
    );
    // Việc chấm đi cùng transaction với lượt làm đóng đoạn: ghi yêu cầu và
    // `ai_job` trước, đẩy queue sau khi commit.
    const due = this.dueSegments(loaded.ctx, state, [
      ...loaded.records,
      ...append,
    ]);
    const jobs = due.map((segment) => ({
      aiJobId: gradingJobId(runId, segment),
      runId,
      segment,
    }));
    for (const job of jobs)
      await tx.aiJob.create({
        data: { id: job.aiJobId, kind: 'SHIFT_GRADING', runId },
      });
    const all: ShiftRecord[] = [
      ...append,
      ...jobs.map((job): ShiftRecord => ({
        type: 'GRADING_REQUESTED',
        data: { segment: job.segment, aiJobId: job.aiJobId },
      })),
    ];
    const seq = loaded.records.length;
    await tx.runEvent.createMany({
      data: all.map((record, i) => ({
        runId,
        seq: seq + i + 1,
        type: record.type,
        activityKey: state.activeNode,
        payload: record as unknown as Prisma.InputJsonValue,
      })),
    });
    const ended = state.ended && loaded.run.status !== 'FINISHED';
    // Chỉ đổi `status`, KHÔNG ghi `completedAt`: tiến độ, mở cấp và lịch sử
    // của luồng prototype/activity coi `completedAt` là "đã chấm xong nhiệm
    // vụ chính". Ca làm chưa chấm điểm nên không được tính vào đó.
    await tx.scenarioRun.update({
      where: { id: runId },
      data: {
        currentActivityKey: state.activeNode,
        ...(ended ? { status: 'FINISHED' } : {}),
      },
    });
    return { state, jobs };
  }
}
