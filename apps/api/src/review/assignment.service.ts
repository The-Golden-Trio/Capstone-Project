import { Injectable } from '@nestjs/common';
import { Problem } from '../core/problem';
import type { Tx } from '../lifecycle/scenario-state-machine';
import { PrismaService } from '../prisma/prisma.service';
import {
  toAssignmentView,
  type AssignmentView,
} from '../lifecycle/scenario-view.service';

export type { AssignmentView };

/**
 * CL-05 `AssignmentService`: giao người duyệt (FR-34). Người duyệt không bao
 * giờ là tác giả (FR-25, D-62); mỗi scenario một lượt duyệt ACTIVE.
 */
@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Đặt người duyệt và hạn. Cùng người thì chỉ đổi hạn; người khác thì lượt
   * cũ thành REASSIGNED và lượt mới trỏ `replaces_id` về lượt cũ.
   */
  async assign(
    tx: Tx,
    input: {
      scenarioId: string;
      authorId: string | null;
      reviewerId: string;
      deadlineAt: Date;
      assignedBy: string;
    },
  ): Promise<{ id: string; reviewerChanged: boolean }> {
    if (input.authorId && input.authorId === input.reviewerId)
      throw new Problem(
        422,
        'REVIEWER_IS_AUTHOR',
        'Người duyệt không được là tác giả',
        [{ field: 'reviewerId', reason: 'trùng tác giả' }],
      );
    const active = await tx.reviewAssignment.findFirst({
      where: { scenarioId: input.scenarioId, status: 'ACTIVE' },
    });
    if (active && active.reviewerId === input.reviewerId) {
      await tx.reviewAssignment.update({
        where: { id: active.id },
        data: { deadlineAt: input.deadlineAt, remindedAt: null },
      });
      return { id: active.id, reviewerChanged: false };
    }
    if (active)
      await tx.reviewAssignment.update({
        where: { id: active.id },
        data: { status: 'REASSIGNED' },
      });
    const created = await tx.reviewAssignment.create({
      data: {
        scenarioId: input.scenarioId,
        reviewerId: input.reviewerId,
        assignedBy: input.assignedBy,
        deadlineAt: input.deadlineAt,
        replacesId: active?.id ?? null,
      },
    });
    return { id: created.id, reviewerChanged: true };
  }

  /** openapi `listReviewAssignments` (CA): lượt duyệt ACTIVE ở các nghề tôi quản lý. */
  async list(
    userId: string,
    query: { overdue?: boolean; occupationId?: string },
  ): Promise<AssignmentView[]> {
    const mine = await this.prisma.staffAssignment.findMany({
      where: { userId, role: 'CONTENT_ADMIN', endedAt: null },
      select: { occupationId: true },
    });
    const occupations = mine
      .map((m) => m.occupationId)
      .filter((o) => !query.occupationId || o === query.occupationId);
    const rows = await this.prisma.reviewAssignment.findMany({
      where: {
        status: 'ACTIVE',
        scenario: { task: { level: { occupationId: { in: occupations } } } },
      },
      include: { scenario: { select: { authorId: true, status: true } } },
      orderBy: { deadlineAt: 'asc' },
    });
    const views = rows.map((r) => toAssignmentView(r, r.scenario));
    return query.overdue ? views.filter((v) => v.overdue) : views;
  }

  /** openapi `reassignReview` (AD-02f): lượt cũ REASSIGNED, lượt mới trỏ về lượt cũ. */
  async reassign(
    assignmentId: string,
    input: { reviewerId: string; deadlineAt: Date; assignedBy: string },
    experts: Set<string>,
  ): Promise<string> {
    const current = await this.prisma.reviewAssignment.findUnique({
      where: { id: assignmentId },
      include: { scenario: { select: { authorId: true } } },
    });
    if (!current || current.status !== 'ACTIVE')
      throw new Problem(409, 'CONFLICT', 'Lượt duyệt này không còn hiệu lực');
    if (!experts.has(input.reviewerId))
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Người duyệt mới không phải DE của nghề',
        [{ field: 'reviewerId', reason: 'không phải DE của nghề này' }],
      );
    if (input.deadlineAt.getTime() <= Date.now())
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Hạn duyệt phải ở tương lai',
        [{ field: 'deadlineAt', reason: 'đã qua' }],
      );
    const created = await this.prisma.$transaction((tx) =>
      this.assign(tx, {
        scenarioId: current.scenarioId,
        authorId: current.scenario.authorId,
        reviewerId: input.reviewerId,
        deadlineAt: input.deadlineAt,
        assignedBy: input.assignedBy,
      }),
    );
    return created.id;
  }

  async view(id: string): Promise<AssignmentView> {
    const row = await this.prisma.reviewAssignment.findUniqueOrThrow({
      where: { id },
      include: { scenario: { select: { authorId: true, status: true } } },
    });
    return toAssignmentView(row, row.scenario);
  }
}
