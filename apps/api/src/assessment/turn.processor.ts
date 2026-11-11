/**
 * CL-04 GradingProcessor cho ca làm (chỉ chạy ở worker): xử lý phần AI của
 * một lượt.
 *
 * Mỗi vòng: fold lượt chơi → engine đang chờ AI việc gì → gọi cổng AI →
 * ghi kết quả thành một sự kiện có provenance → đẩy các dòng mới lên SSE.
 * Lặp tới khi engine chờ người chơi. Vì yêu cầu đang chờ dựng lại được từ
 * chuỗi sự kiện (`pendingRequest`), job chết giữa chừng chạy lại vẫn tiếp
 * đúng chỗ, không gọi lại bước đã xong.
 *
 * Hết model dùng được: ghi `RUN_PAUSED`, phiên tạm dừng, giữ tiến độ (D-92).
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { shift } from '@datn/game-core';
import {
  SHIFT_CHECKER,
  SHIFT_NARRATOR,
  type ShiftChecker,
  type ShiftNarrator,
} from '../ai/shift/types';
import type { TurnJob } from '../core/queues';
import { RunEventType, TurnStatus } from '../generated/prisma/enums';
import { StreamService } from '../notification/stream.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  RunStore,
  RUN_BUDGET_USD,
  inputEvent,
  isUniqueViolation,
  presentLines,
} from './run-store.service';

/** Model chạy quá lâu thì báo màn hình đang chờ nhà cung cấp. */
export const DELAY_NOTICE_MS = 4_000;
const MAX_STEPS = 40;

@Injectable()
export class TurnProcessor {
  private readonly logger = new Logger(TurnProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly store: RunStore,
    private readonly stream: StreamService,
    @Inject(SHIFT_NARRATOR) private readonly narrator: ShiftNarrator,
    @Inject(SHIFT_CHECKER) private readonly checker: ShiftChecker,
  ) {}

  async run({ runId, turnId }: TurnJob): Promise<void> {
    for (let i = 0; i < MAX_STEPS; i++) {
      const answer = await this.prisma.answer.findUnique({
        where: { id: turnId },
      });
      if (!answer || answer.status === TurnStatus.DONE) return;

      const loaded = await this.store.load(runId);
      const { state, ctx, run } = loaded;
      const { identity, displayName } = await this.store.identity(run.userId);
      const pending = shift.pendingRequest(state, ctx);

      if (!pending) {
        // Engine chờ người chơi: lượt xong.
        await this.prisma.$transaction(async (tx) => {
          await tx.answer.update({
            where: { id: turnId },
            data: {
              status: TurnStatus.DONE,
              lineTo: state.transcript.length,
              completedAt: new Date(),
            },
          });
          await this.store.sync(tx, loaded, state);
        });
        await this.stream.publish(run.userId, {
          ...(loaded.lastEventId !== null
            ? { id: String(loaded.lastEventId) }
            : {}),
          message: {
            type: 'turn.done',
            runId,
            turnId,
            payload: { scene: shift.sceneView(state, ctx), ended: state.ended },
          },
        });
        return;
      }

      const opts = {
        identity,
        budgetUsd: Math.max(0, RUN_BUDGET_USD - loaded.costUsd),
        castNames: ctx.seed.cast.map((c) => c.name),
      };
      const waitingFor =
        pending.type === 'narrate'
          ? ('narration' as const)
          : ('checks' as const);
      const notice = setTimeout(() => {
        void this.stream.publish(run.userId, {
          message: {
            type: 'provider.delay',
            runId,
            turnId,
            payload: { waitingFor },
          },
        });
      }, DELAY_NOTICE_MS);

      let input: shift.AiInput | null = null;
      let reason = '';
      try {
        if (pending.type === 'narrate') {
          const out = await this.narrator.narrate(pending.request, opts);
          if (out.status === 'ok')
            input = {
              type: 'NARRATION',
              requestId: pending.request.requestId,
              beats: out.value,
              provenance: out.provenance,
            };
          else reason = out.reason;
        } else {
          const out = await this.checker.check(pending.request, opts);
          if (out.status === 'ok')
            input = {
              type: 'CHECKS',
              requestId: pending.request.requestId,
              answers: out.value,
              provenance: out.provenance,
            };
          else reason = out.reason;
        }
      } finally {
        clearTimeout(notice);
      }

      if (!input) {
        await this.pause(loaded, turnId, pending.request.requestId, reason);
        return;
      }

      // Kiểm kết quả bằng chính engine trước khi ghi.
      const next = shift.step(state, input, ctx).state;
      let eventId: bigint;
      try {
        eventId = await this.prisma.$transaction((tx) =>
          this.store.append(tx, runId, loaded.lastSeq, [
            inputEvent(input, turnId),
          ]),
        );
      } catch (err) {
        if (isUniqueViolation(err)) continue; // có bên khác vừa ghi: đọc lại rồi làm tiếp
        throw err;
      }
      const lines = next.transcript.slice(state.transcript.length);
      if (lines.length > 0)
        await this.stream.publish(run.userId, {
          id: String(eventId),
          message: {
            type: 'turn.lines',
            runId,
            turnId,
            payload: { lines: presentLines(lines, displayName) },
          },
        });
    }
    this.logger.error(`Lượt ${turnId} vượt quá ${MAX_STEPS} bước AI`);
  }

  private async pause(
    loaded: Awaited<ReturnType<RunStore['load']>>,
    turnId: string,
    requestId: string,
    reason: string,
  ): Promise<void> {
    const { run } = loaded;
    this.logger.warn(`Tạm dừng lượt ${run.id}: ${reason}`);
    const eventId = await this.prisma.$transaction(async (tx) => {
      const id = await this.store.append(tx, run.id, loaded.lastSeq, [
        {
          type: RunEventType.RUN_PAUSED,
          turnId,
          payload: { requestId, reason },
        },
      ]);
      await tx.answer.update({
        where: { id: turnId },
        data: { status: TurnStatus.PAUSED },
      });
      await tx.scenarioRun.update({
        where: { id: run.id },
        data: { pausedAt: new Date() },
      });
      return id;
    });
    await this.stream.publish(run.userId, {
      id: String(eventId),
      message: {
        type: 'run.paused',
        runId: run.id,
        turnId,
        payload: { reason },
      },
    });
  }
}
