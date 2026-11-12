import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessPolicyService } from '../auth/access-policy.service';
import { ActivityLogService } from '../auth/activity-log.service';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import type { Env } from '../config/env';
import { Problem } from '../core/problem';
import type { ScenarioStatus } from '../generated/prisma/enums';
import { ScenarioStateMachine } from '../lifecycle/scenario-state-machine';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentService } from '../review/assignment.service';
import { readContent } from '../lifecycle/content-store';
import {
  ScenarioViewService,
  type AssignmentView,
  type ScenarioDetail,
  type ScenarioListItem,
} from '../lifecycle/scenario-view.service';
import {
  scenarioListInclude,
  type ScenarioRow,
} from '../lifecycle/scenario.queries';
import { validateContent } from './content/content-validator';
import type { AssignmentInput } from './dto/scenario-content.schema';

export type { ScenarioDetail, ScenarioListItem };

/** CL-05 `ScenarioService` (SD-05): mở, giao, xem, nộp scenario. */
@Injectable()
export class ScenarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly machine: ScenarioStateMachine,
    private readonly access: AccessPolicyService,
    private readonly assignments: AssignmentService,
    private readonly notifications: NotificationService,
    private readonly activity: ActivityLogService,
    private readonly config: ConfigService<Env, true>,
    private readonly view: ScenarioViewService,
  ) {}

  link(path: string): string {
    return `${this.config.get('STAFF_ORIGIN', { infer: true })}/staff${path}`;
  }

  load(scenarioId: string): Promise<ScenarioRow> {
    return this.view.load(scenarioId);
  }

  toListItem(row: ScenarioRow): ScenarioListItem {
    return this.view.toListItem(row);
  }

  /** Tác giả của scenario, ở DRAFT — điều kiện của mọi thao tác soạn (vòng Draft → Draft của SM-01). */
  requireAuthorInDraft(user: AuthUser, row: ScenarioRow): void {
    if (row.authorId !== user.id)
      throw new Problem(
        403,
        'NOT_ASSIGNED',
        'Bạn không phải tác giả của scenario này',
      );
    if (row.status !== 'DRAFT')
      throw new Problem(
        409,
        'INVALID_TRANSITION',
        'Chỉ soạn được khi scenario ở trạng thái Draft',
      );
  }

  /* ── Danh sách ─────────────────────────────────────────────────── */

  async list(
    user: AuthUser,
    query: {
      occupationId?: string;
      status?: ScenarioStatus;
      mine?: boolean;
      cursor?: string;
      limit?: number;
    },
  ): Promise<{ items: ScenarioListItem[]; nextCursor: string | null }> {
    const occupations = await this.access.occupationsOf(user.id);
    const allowed = query.occupationId
      ? occupations.filter((o) => o === query.occupationId)
      : occupations;
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
    const offset = Number(query.cursor) || 0;
    const rows = await this.prisma.scenario.findMany({
      where: {
        task: { level: { occupationId: { in: allowed } } },
        ...(query.status ? { status: query.status } : {}),
        // `mine`: scenario tôi là tác giả (D01). Hàng đợi duyệt có `listMyReviewQueue` riêng.
        ...(query.mine ? { authorId: user.id } : {}),
      },
      include: scenarioListInclude,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      skip: offset,
      take: limit + 1,
    });
    return {
      items: rows.slice(0, limit).map((r) => this.toListItem(r)),
      nextCursor: rows.length > limit ? String(offset + limit) : null,
    };
  }

  /* ── Mở scenario (SD-05 bước 1, FR-33) ─────────────────────────── */

  async open(user: AuthUser, taskId: string): Promise<ScenarioDetail> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { level: { select: { occupationId: true } } },
    });
    if (!task)
      throw new Problem(422, 'VALIDATION_FAILED', 'Không có task này', [
        { field: 'taskId', reason: 'không tồn tại' },
      ]);
    if (
      !(await this.access.isAssigned(user.id, task.level.occupationId, [
        'CONTENT_ADMIN',
      ]))
    )
      throw new Problem(403, 'NOT_ASSIGNED', 'Bạn không quản lý nghề này');

    const active = await this.prisma.scenario.findFirst({
      where: { taskId, status: { not: 'RETIRED' } },
      select: { id: true },
    });
    if (active)
      throw new Problem(
        409,
        'ACTIVE_SCENARIO_EXISTS',
        'Task này đã có một scenario đang hoạt động',
      );

    let id: string;
    try {
      ({ id } = await this.prisma.$transaction((tx) =>
        this.machine.open(tx, { taskId }, user),
      ));
    } catch (err) {
      // Partial unique `scenario_one_active_per_task`: hai CA mở cùng lúc.
      if ((err as { code?: string }).code === 'P2002')
        throw new Problem(
          409,
          'ACTIVE_SCENARIO_EXISTS',
          'Task này đã có một scenario đang hoạt động',
        );
      throw err;
    }
    await this.activity.log(user.id, 'SCENARIO_OPENED', {
      type: 'scenario',
      id,
    });
    return this.detail(user, id);
  }

  /* ── Chi tiết ──────────────────────────────────────────────────── */

  detail(user: AuthUser, scenarioId: string): Promise<ScenarioDetail> {
    return this.view.detail(user, scenarioId);
  }

  /* ── Giao tác giả, người duyệt (FR-34) ────────────────────────── */

  async assign(
    user: AuthUser,
    scenarioId: string,
    dto: AssignmentInput,
  ): Promise<AssignmentView> {
    const row = await this.load(scenarioId);
    if (row.status !== 'DRAFT')
      throw new Problem(
        409,
        'INVALID_TRANSITION',
        'Chỉ giao tác giả và người duyệt khi scenario ở Draft; quá hạn thì dùng giao lại',
      );
    const occupationId = row.task.level.occupationId;
    const experts = new Set(
      (await this.view.expertsOf(occupationId)).map((e) => e.userId),
    );
    const errors = [
      ...(experts.has(dto.authorId)
        ? []
        : [{ field: 'authorId', reason: 'không phải DE của nghề này' }]),
      ...(experts.has(dto.reviewerId)
        ? []
        : [{ field: 'reviewerId', reason: 'không phải DE của nghề này' }]),
    ];
    if (errors.length)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Người được giao không hợp lệ',
        errors,
      );
    const deadlineAt = new Date(dto.deadlineAt);
    if (deadlineAt.getTime() <= Date.now())
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Hạn duyệt phải ở tương lai',
        [{ field: 'deadlineAt', reason: 'đã qua' }],
      );

    const authorChanged = row.authorId !== dto.authorId;
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.scenario.update({
        where: { id: scenarioId },
        data: { authorId: dto.authorId },
      });
      return this.assignments.assign(tx, {
        scenarioId,
        authorId: dto.authorId,
        reviewerId: dto.reviewerId,
        deadlineAt,
        assignedBy: user.id,
      });
    });

    const payload = {
      scenarioId,
      taskText: row.task.text,
      occupationName: row.task.level.occupation.name,
      deadlineAt: deadlineAt.toISOString(),
    };
    if (authorChanged)
      await this.notifications.notify(dto.authorId, 'SCENARIO_ASSIGNED', {
        ...payload,
        link: this.link(`/de/scenarios/${scenarioId}/author`),
      });
    if (result.reviewerChanged)
      await this.notifications.notify(dto.reviewerId, 'REVIEW_ASSIGNED', {
        ...payload,
        link: this.link('/de'),
      });
    await this.activity.log(user.id, 'SCENARIO_ASSIGNED', {
      type: 'scenario',
      id: scenarioId,
      detail: { authorId: dto.authorId, reviewerId: dto.reviewerId },
    });
    return this.assignments.view(result.id);
  }

  /* ── Nộp (SD-05 bước 3) ────────────────────────────────────────── */

  async submit(user: AuthUser, scenarioId: string): Promise<ScenarioDetail> {
    const row = await this.load(scenarioId);
    this.requireAuthorInDraft(user, row);
    const reviewer = row.reviewAssignments[0];
    if (!reviewer)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Scenario chưa có người duyệt; nhờ Content Admin giao trước khi nộp',
      );
    const content = await readContent(this.prisma, scenarioId);
    const report = content
      ? validateContent(content, {
          levelNo: row.task.level.levelNo,
          skillIds: row.skills.map((s) => s.competencyId),
        })
      : {
          passed: false,
          failedRules: [
            {
              rule: 'CONTENT_MISSING',
              path: 'content',
              message: 'Chưa có nội dung',
            },
          ],
        };
    if (!report.passed)
      throw new Problem(
        422,
        'CHECKS_FAILED',
        'Nội dung chưa qua kiểm tra tự động',
        report.failedRules.map((f) => ({
          field: f.path,
          reason: `${f.rule}: ${f.message}`,
        })),
      );

    await this.prisma.$transaction((tx) =>
      this.machine.apply(tx, scenarioId, 'SUBMIT', user),
    );
    await this.notifications.notify(reviewer.reviewerId, 'SCENARIO_SUBMITTED', {
      scenarioId,
      taskText: row.task.text,
      deadlineAt: reviewer.deadlineAt.toISOString(),
      link: this.link(`/de/scenarios/${scenarioId}/review`),
    });
    return this.detail(user, scenarioId);
  }

  history(scenarioId: string) {
    return this.machine.history(scenarioId);
  }
}
