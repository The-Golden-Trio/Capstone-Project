/**
 * Sổ sự kiện của lượt chơi (ERD-05 `run_event`): chỗ duy nhất đọc và ghi.
 *
 * Mọi thay đổi đi qua `update`: khoá dòng `ScenarioRun` (SELECT … FOR UPDATE),
 * đọc chuỗi sự kiện, fold ra trạng thái bằng game-core, để hàm của bên gọi
 * quyết định ghi thêm gì, rồi ghi — trong một transaction. API và worker cùng
 * ghi vào một lượt chơi mà không bao giờ chen thứ tự của nhau, và không bao
 * giờ quyết định trên một trạng thái đã cũ.
 *
 * Sự kiện chỉ ghi thêm, không sửa, không xoá (§5.3.1).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  foldPlay,
  type PlayEvent,
  type PlayState,
  type Scenario,
} from '@datn/game-core';
import { ContentService } from '../content/content.service';
import { Prisma, type ScenarioRun } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type Tx = Prisma.TransactionClient;

export interface LoadedRun {
  run: ScenarioRun;
  scenario: Scenario;
  events: PlayEvent[];
  state: PlayState;
}

export interface Change<T> {
  /** Sự kiện ghi thêm, theo thứ tự. */
  append?: PlayEvent[];
  result: T;
}

@Injectable()
export class RunLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
  ) {}

  /** Kịch bản đúng bản đã ghim cho lượt chơi. */
  async scenarioOf(
    run: Pick<ScenarioRun, 'scenarioKey' | 'contentVersion'>,
  ): Promise<Scenario> {
    const index = await this.content.indexAt(run.contentVersion);
    const entry = index.findScenarioByKey(run.scenarioKey);
    if (!entry)
      throw new NotFoundException(
        `Không có kịch bản ${run.scenarioKey} ở phiên bản ${run.contentVersion}`,
      );
    return entry.scenario;
  }

  private async read(
    db: Tx | PrismaService,
    run: ScenarioRun,
  ): Promise<LoadedRun> {
    const rows = await db.runEvent.findMany({
      where: { runId: run.id },
      orderBy: { seq: 'asc' },
      select: { payload: true },
    });
    const events = rows.map((r) => r.payload as unknown as PlayEvent);
    const scenario = await this.scenarioOf(run);
    return { run, scenario, events, state: foldPlay(events, scenario) };
  }

  /** Đọc không khoá — cho các đường chỉ xem. */
  async load(runId: string): Promise<LoadedRun> {
    const run = await this.prisma.scenarioRun.findUnique({
      where: { id: runId },
    });
    if (!run || run.flow !== 'events')
      throw new NotFoundException('Không tìm thấy lượt chơi');
    return this.read(this.prisma, run);
  }

  /**
   * Đọc, quyết, ghi — nguyên tử. `decide` nhận trạng thái mới nhất (đã khoá)
   * và trả về sự kiện cần ghi; nó có thể ghi thêm bảng khác qua `tx`. Ném lỗi
   * trong `decide` thì không có gì được ghi.
   */
  update<T>(
    runId: string,
    decide: (loaded: LoadedRun, tx: Tx) => Promise<Change<T>> | Change<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "ScenarioRun" WHERE id = ${runId} FOR UPDATE`;
      const run = await tx.scenarioRun.findUnique({ where: { id: runId } });
      if (!run || run.flow !== 'events')
        throw new NotFoundException('Không tìm thấy lượt chơi');

      const loaded = await this.read(tx, run);
      const { append = [], result } = await decide(loaded, tx);
      if (append.length > 0) await this.write(tx, loaded, append);
      return result;
    });
  }

  /** Ghi sự kiện đầu tiên của một lượt chơi vừa tạo (trong cùng transaction tạo lượt). */
  async begin(
    tx: Tx,
    run: ScenarioRun,
    scenario: Scenario,
    first: PlayEvent,
  ): Promise<PlayState> {
    const loaded: LoadedRun = {
      run,
      scenario,
      events: [],
      state: foldPlay([], scenario),
    };
    return this.write(tx, loaded, [first]);
  }

  private async write(
    tx: Tx,
    loaded: LoadedRun,
    append: PlayEvent[],
  ): Promise<PlayState> {
    const seq = loaded.events.length;
    await tx.runEvent.createMany({
      data: append.map((event, i) => ({
        runId: loaded.run.id,
        seq: seq + i + 1,
        type: event.type,
        activityKey: 'activityKey' in event ? event.activityKey : null,
        payload: event as unknown as Prisma.InputJsonValue,
      })),
    });
    const state = foldPlay([...loaded.events, ...append], loaded.scenario);
    await tx.scenarioRun.update({
      where: { id: loaded.run.id },
      data: { currentActivityKey: state.activityKey },
    });
    return state;
  }
}
