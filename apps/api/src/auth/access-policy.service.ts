import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { StaffRoleKind } from '../generated/prisma/enums';

/** Tài nguyên mà một route `/staff` trỏ tới. */
export type ResourceRef =
  | { kind: 'occupation'; id: string }
  | { kind: 'scenario'; id: string }
  | { kind: 'build'; id: string }
  | { kind: 'assignment'; id: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * CL-01 `AccessPolicyService`: ai được làm gì ở nghề nào (FR-41), dựa trên
 * `staff_assignment` còn hiệu lực.
 */
@Injectable()
export class AccessPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Nghề chứa tài nguyên; `null` khi tài nguyên không tồn tại. */
  async occupationOf(ref: ResourceRef): Promise<string | null> {
    if (!UUID.test(ref.id)) return null;
    switch (ref.kind) {
      case 'occupation': {
        const row = await this.prisma.occupation.findUnique({
          where: { id: ref.id },
          select: { id: true },
        });
        return row?.id ?? null;
      }
      case 'scenario': {
        const row = await this.prisma.scenario.findUnique({
          where: { id: ref.id },
          select: {
            task: { select: { level: { select: { occupationId: true } } } },
          },
        });
        return row?.task.level.occupationId ?? null;
      }
      case 'build': {
        const row = await this.prisma.scenarioBuild.findUnique({
          where: { id: ref.id },
          select: {
            scenario: {
              select: {
                task: { select: { level: { select: { occupationId: true } } } },
              },
            },
          },
        });
        return row?.scenario.task.level.occupationId ?? null;
      }
      case 'assignment': {
        const row = await this.prisma.reviewAssignment.findUnique({
          where: { id: ref.id },
          select: {
            scenario: {
              select: {
                task: { select: { level: { select: { occupationId: true } } } },
              },
            },
          },
        });
        return row?.scenario.task.level.occupationId ?? null;
      }
    }
  }

  async isAssigned(
    userId: string,
    occupationId: string,
    roles?: StaffRoleKind[],
  ): Promise<boolean> {
    const row = await this.prisma.staffAssignment.findFirst({
      where: {
        userId,
        occupationId,
        endedAt: null,
        ...(roles?.length ? { role: { in: roles } } : {}),
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  /** Nghề mà người này đang giữ một trong các vai. */
  async occupationsOf(
    userId: string,
    roles?: StaffRoleKind[],
  ): Promise<string[]> {
    const rows = await this.prisma.staffAssignment.findMany({
      where: {
        userId,
        endedAt: null,
        ...(roles?.length ? { role: { in: roles } } : {}),
      },
      select: { occupationId: true },
    });
    return [...new Set(rows.map((r) => r.occupationId))];
  }

  async isAuthorOf(userId: string, scenarioId: string): Promise<boolean> {
    const row = await this.prisma.scenario.findUnique({
      where: { id: scenarioId },
      select: { authorId: true },
    });
    return row?.authorId === userId;
  }

  /** Người duyệt đang được giao (assignment ACTIVE) của scenario. */
  async isReviewerOf(userId: string, scenarioId: string): Promise<boolean> {
    const row = await this.prisma.reviewAssignment.findFirst({
      where: { scenarioId, reviewerId: userId, status: 'ACTIVE' },
      select: { id: true },
    });
    return Boolean(row);
  }
}
