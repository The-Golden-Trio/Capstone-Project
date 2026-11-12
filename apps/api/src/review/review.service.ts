import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActivityLogService } from '../auth/activity-log.service';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { ReviewCriteriaService } from '../catalogue/review-criteria.service';
import type { Env } from '../config/env';
import { Problem } from '../core/problem';
import { ScenarioStateMachine } from '../lifecycle/scenario-state-machine';
import {
  ScenarioViewService,
  type ScenarioDetail,
} from '../lifecycle/scenario-view.service';
import { NotificationService } from '../notification/notification.service';
import { StreamService } from '../notification/stream.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ReviewDecisionInput } from './review.dto';

const DECISION_TEXT = {
  APPROVE: 'Đã duyệt',
  REQUEST_CHANGES: 'Yêu cầu sửa',
  REJECT: 'Từ chối',
} as const;

/** CL-05 `ReviewService` (SD-06, FR-25, FR-32). */
@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly machine: ScenarioStateMachine,
    private readonly view: ScenarioViewService,
    private readonly criteria: ReviewCriteriaService,
    private readonly notifications: NotificationService,
    private readonly stream: StreamService,
    private readonly activity: ActivityLogService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private link(path: string): string {
    return `${this.config.get('STAFF_ORIGIN', { infer: true })}/staff${path}`;
  }

  /** openapi `listMyReviewQueue`: lượt duyệt ACTIVE của tôi đang chờ. */
  async queue(user: AuthUser) {
    const rows = await this.prisma.reviewAssignment.findMany({
      where: {
        reviewerId: user.id,
        status: 'ACTIVE',
        scenario: { status: { in: ['SUBMITTED', 'IN_REVIEW'] } },
      },
      include: {
        scenario: { select: { id: true, task: { select: { text: true } } } },
      },
      orderBy: { deadlineAt: 'asc' },
    });
    return rows.map((r) => ({
      kind: 'REVIEW' as const,
      scenarioId: r.scenario.id,
      title: r.scenario.task.text,
      deadlineAt: r.deadlineAt.toISOString(),
      revalidationId: null,
    }));
  }

  /** SD-06: kiểm quyền người duyệt; chặn khi là tác giả hoặc không được giao. */
  private async requireReviewer(user: AuthUser, scenarioId: string) {
    const row = await this.view.load(scenarioId);
    if (row.authorId === user.id)
      throw new Problem(
        403,
        'REVIEWER_IS_AUTHOR',
        'Bạn là tác giả nên không duyệt được scenario này (FR-25)',
      );
    const active = row.reviewAssignments[0];
    if (!active || active.reviewerId !== user.id)
      throw new Problem(
        403,
        'NOT_ASSIGNED',
        'Bạn không được giao duyệt scenario này',
      );
    return { row, active };
  }

  /** openapi `openScenarioForReview`: lần mở đầu chuyển SUBMITTED → IN_REVIEW. */
  async open(user: AuthUser, scenarioId: string) {
    const { row } = await this.requireReviewer(user, scenarioId);
    const criteria = await this.criteria.current(row.task.level.occupationId);
    // FR-32: chưa có tiêu chí thì không bắt đầu duyệt (07 A22+: openapi chỉ khai 403).
    if (!criteria)
      throw new Problem(
        422,
        'CRITERIA_MISSING',
        'Nghề này chưa có tiêu chí duyệt; nhờ Content Admin tạo trước',
      );
    if (row.status === 'SUBMITTED')
      await this.prisma.$transaction((tx) =>
        this.machine.apply(tx, scenarioId, 'START_REVIEW', user),
      );
    else if (row.status !== 'IN_REVIEW')
      throw new Problem(
        409,
        'INVALID_TRANSITION',
        'Scenario không ở trạng thái chờ duyệt',
      );
    const previous = await this.prisma.review.findMany({
      where: { assignment: { scenarioId } },
      orderBy: { decidedAt: 'desc' },
    });
    return {
      scenario: await this.view.detail(user, scenarioId),
      criteria: { versionNo: criteria.versionNo, criteria: criteria.criteria },
      previousReviews: previous.map((r) => ({
        decision: r.decision,
        comment: r.comment ?? '',
        decidedAt: r.decidedAt.toISOString(),
      })),
    };
  }

  /** openapi `decideReview`: mọi tiêu chí phải được trả lời (FR-25, 422 `CRITERIA_MISSING`). */
  async decide(
    user: AuthUser,
    scenarioId: string,
    dto: ReviewDecisionInput,
  ): Promise<ScenarioDetail> {
    const { row, active } = await this.requireReviewer(user, scenarioId);
    if (row.status !== 'IN_REVIEW')
      throw new Problem(
        409,
        'INVALID_TRANSITION',
        'Mở scenario để duyệt trước khi ra quyết định',
      );
    const criteria = await this.criteria.current(row.task.level.occupationId);
    if (!criteria)
      throw new Problem(
        422,
        'CRITERIA_MISSING',
        'Nghề này chưa có tiêu chí duyệt',
      );
    const known = new Set(criteria.criteria.map((c) => c.criterionId));
    const answered = new Set(dto.answers.map((a) => a.criterionId));
    const unknown = dto.answers.filter((a) => !known.has(a.criterionId));
    if (unknown.length)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Có tiêu chí không thuộc bộ tiêu chí hiện hành',
        unknown.map((a) => ({
          field: `answers.${a.criterionId}`,
          reason: 'không thuộc bộ tiêu chí',
        })),
      );
    const missing = criteria.criteria.filter(
      (c) => !answered.has(c.criterionId),
    );
    if (missing.length || answered.size !== dto.answers.length)
      throw new Problem(
        422,
        'CRITERIA_MISSING',
        'Chưa trả lời đủ mọi tiêu chí',
        missing.map((c) => ({
          field: `answers.${c.criterionId}`,
          reason: c.text,
        })),
      );

    const action =
      dto.decision === 'APPROVE'
        ? 'APPROVE'
        : dto.decision === 'REJECT'
          ? 'REJECT'
          : 'REQUEST_CHANGES';
    await this.prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          assignmentId: active.id,
          criteriaVersionId: criteria.versionId,
          decision: dto.decision,
          comment: dto.comment ?? null,
          answers: {
            create: dto.answers.map((a) => ({
              criterionId: a.criterionId,
              verdict: a.verdict,
              comment: a.comment ?? null,
            })),
          },
        },
      });
      await this.machine.apply(tx, scenarioId, action, user, dto.comment);
      // Yêu cầu sửa: giữ lượt duyệt (cùng người, cùng hạn) cho lần nộp lại (07 A22+).
      if (dto.decision !== 'REQUEST_CHANGES')
        await tx.reviewAssignment.update({
          where: { id: active.id },
          data: { status: 'COMPLETED' },
        });
    });
    await this.activity.log(user.id, 'REVIEW_DECIDED', {
      type: 'scenario',
      id: scenarioId,
      detail: { decision: dto.decision },
    });

    const payload = {
      scenarioId,
      taskText: row.task.text,
      decision: dto.decision,
      decisionText: DECISION_TEXT[dto.decision],
      comment: dto.comment ?? '',
    };
    if (row.authorId) {
      await this.stream.publish(row.authorId, {
        type: 'review.outcome',
        scenarioId,
        payload: { decision: dto.decision, comment: dto.comment ?? null },
      });
      await this.notifications.notify(row.authorId, 'REVIEW_DECIDED', {
        ...payload,
        link: this.link(`/de/scenarios/${scenarioId}/author`),
      });
    }
    const admins = await this.prisma.staffAssignment.findMany({
      where: {
        occupationId: row.task.level.occupationId,
        role: 'CONTENT_ADMIN',
        endedAt: null,
      },
      select: { userId: true },
    });
    for (const a of admins)
      await this.notifications.notify(a.userId, 'REVIEW_DECIDED', {
        ...payload,
        link: this.link(
          `/ca/occupations/${row.task.level.occupationId}/scenarios`,
        ),
      });
    return this.view.detail(user, scenarioId);
  }
}
