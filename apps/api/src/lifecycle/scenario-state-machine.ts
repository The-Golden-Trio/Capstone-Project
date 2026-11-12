import { Injectable } from '@nestjs/common';
import { Problem } from '../core/problem';
import type { Prisma } from '../generated/prisma/client';
import type { ScenarioStatus, UserRoleKind } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import {
  allowedActions,
  TRANSITIONS,
  type LifecycleAction,
} from './transitions';

export type Tx = Prisma.TransactionClient;

export interface Actor {
  id: string;
  roles: readonly UserRoleKind[];
}

/** openapi `LifecycleEntry`. */
export interface LifecycleEntry {
  at: string;
  actor: string;
  action: string;
  fromStatus: ScenarioStatus | null;
  toStatus: ScenarioStatus;
  note: string | null;
}

/**
 * CL-05 `ScenarioStateMachine`: nơi DUY NHẤT đổi `scenario.status` (§5.3.1).
 * Mỗi lần chuyển ghi một dòng `lifecycle_log` trong cùng transaction (NFR-16).
 * Quan hệ (tác giả, người duyệt, CA của nghề) do service gọi kiểm trước.
 */
@Injectable()
export class ScenarioStateMachine {
  constructor(private readonly prisma: PrismaService) {}

  private requireRole(action: LifecycleAction, actor: Actor): void {
    if (!actor.roles.includes(TRANSITIONS[action].role))
      throw new Problem(
        403,
        'FORBIDDEN',
        'Vai của bạn không làm được việc này',
      );
  }

  /** OPEN: tạo scenario rỗng ở DRAFT và ghi log. */
  async open(
    tx: Tx,
    data: { taskId: string },
    actor: Actor,
  ): Promise<{ id: string }> {
    this.requireRole('OPEN', actor);
    const scenario = await tx.scenario.create({
      data: { taskId: data.taskId, openedBy: actor.id, status: 'DRAFT' },
      select: { id: true },
    });
    await tx.lifecycleLog.create({
      data: {
        scenarioId: scenario.id,
        fromStatus: null,
        toStatus: 'DRAFT',
        action: 'OPEN',
        actorId: actor.id,
      },
    });
    return scenario;
  }

  /**
   * Chuyển trạng thái theo SM-01. Điều kiện `status = from` nằm ngay trong
   * câu UPDATE, nên hai thao tác chạy đua thì chỉ một thắng; bên thua nhận 409
   * `INVALID_TRANSITION`.
   */
  async apply(
    tx: Tx,
    scenarioId: string,
    action: Exclude<LifecycleAction, 'OPEN'>,
    actor: Actor,
    note?: string,
  ): Promise<ScenarioStatus> {
    this.requireRole(action, actor);
    const { from, to } = TRANSITIONS[action];
    if (!from) throw new Error(`${action} không có trạng thái nguồn`);
    const updated = await tx.scenario.updateMany({
      where: { id: scenarioId, status: from },
      data: { status: to },
    });
    if (updated.count !== 1)
      throw new Problem(
        409,
        'INVALID_TRANSITION',
        `Không thể ${action} khi scenario không ở trạng thái ${from}`,
      );
    await tx.lifecycleLog.create({
      data: {
        scenarioId,
        fromStatus: from,
        toStatus: to,
        action,
        actorId: actor.id,
        note: note ?? null,
      },
    });
    return to;
  }

  allowedActions(
    status: ScenarioStatus,
    roles: readonly UserRoleKind[],
  ): LifecycleAction[] {
    return allowedActions(status, roles);
  }

  async history(scenarioId: string): Promise<LifecycleEntry[]> {
    const rows = await this.prisma.lifecycleLog.findMany({
      where: { scenarioId },
      orderBy: { id: 'asc' },
      include: { actor: { select: { displayName: true, email: true } } },
    });
    return rows.map((r) => ({
      at: r.createdAt.toISOString(),
      actor: r.actor.displayName ?? r.actor.email ?? '',
      action: r.action,
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      note: r.note,
    }));
  }
}
