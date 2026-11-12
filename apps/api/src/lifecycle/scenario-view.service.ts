import { Injectable } from '@nestjs/common';
import { Problem } from '../core/problem';
import type {
  AssignmentStatus,
  ScenarioStatus,
  UserRoleKind,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { ScenarioContent } from '../scenario/dto/scenario-content.schema';
import { readContent } from './content-store';
import {
  nameOf,
  scenarioListInclude,
  type ScenarioRow,
} from './scenario.queries';
import { ScenarioStateMachine } from './scenario-state-machine';
import { TRANSITIONS, type LifecycleAction } from './transitions';

/** openapi `ScenarioListItem`. */
export interface ScenarioListItem {
  id: string;
  taskTitle: string;
  occupationId: string;
  levelNo: number;
  status: ScenarioStatus;
  authorName: string | null;
  reviewerName: string | null;
  reviewDeadline: string | null;
  updatedAt: string;
}

/** openapi `Assignment`. */
export interface AssignmentView {
  assignmentId: string;
  scenarioId: string;
  authorId: string | null;
  reviewerId: string;
  deadlineAt: string;
  status: AssignmentStatus;
  overdue: boolean;
}

/**
 * openapi `ScenarioDetail`. Thêm ba trường chỉ đọc ngoài hợp đồng (07 A22+):
 * `archetype`, `companyType`, `skillIds` — lựa chọn tình huống tác giả đã
 * lưu, để màn soạn mở lại đúng trạng thái.
 */
export interface ScenarioDetail extends ScenarioListItem {
  version: string;
  allowedActions: LifecycleAction[];
  authorContext?: string;
  archetype?: string;
  companyType?: string;
  skillIds: string[];
  content?: ScenarioContent;
  assignment?: AssignmentView;
  eligibleExperts: Array<{ userId: string; displayName: string }>;
}

export function toAssignmentView(
  row: {
    id: string;
    scenarioId: string;
    reviewerId: string;
    deadlineAt: Date;
    status: AssignmentStatus;
  },
  scenario: { authorId: string | null; status: ScenarioStatus },
  now = new Date(),
): AssignmentView {
  return {
    assignmentId: row.id,
    scenarioId: row.scenarioId,
    authorId: scenario.authorId,
    reviewerId: row.reviewerId,
    deadlineAt: row.deadlineAt.toISOString(),
    status: row.status,
    overdue:
      row.status === 'ACTIVE' &&
      row.deadlineAt.getTime() < now.getTime() &&
      ['SUBMITTED', 'IN_REVIEW'].includes(scenario.status),
  };
}

const AUTHOR_ACTIONS: LifecycleAction[] = [
  'SUBMIT',
  'REPORT_DISPLAY_ISSUE',
  'REPORT_CONTENT_ISSUE',
  'PASS_PLAYTEST',
];
const REVIEWER_ACTIONS: LifecycleAction[] = [
  'START_REVIEW',
  'REQUEST_CHANGES',
  'REJECT',
  'APPROVE',
];

/**
 * Cách đọc một scenario dùng chung cho `ScenarioModule` và `ReviewModule`
 * (cả hai import `LifecycleModule` theo CL-00, không import lẫn nhau theo
 * chiều Review → Scenario). Chỉ đọc.
 */
@Injectable()
export class ScenarioViewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly machine: ScenarioStateMachine,
  ) {}

  async load(scenarioId: string): Promise<ScenarioRow> {
    const row = await this.prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: scenarioListInclude,
    });
    if (!row) throw new Problem(404, 'NOT_FOUND', 'Không tìm thấy scenario');
    return row;
  }

  toListItem(row: ScenarioRow): ScenarioListItem {
    const active = row.reviewAssignments[0];
    return {
      id: row.id,
      taskTitle: row.task.text,
      occupationId: row.task.level.occupationId,
      levelNo: row.task.level.levelNo,
      status: row.status,
      authorName: nameOf(row.author),
      reviewerName: nameOf(active?.reviewer),
      reviewDeadline: active?.deadlineAt.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /** DE đang được giao nghề — chỉ họ được làm tác giả hoặc người duyệt. */
  async expertsOf(occupationId: string) {
    const rows = await this.prisma.staffAssignment.findMany({
      where: { occupationId, role: 'DOMAIN_EXPERT', endedAt: null },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
      orderBy: { assignedAt: 'asc' },
    });
    return rows.map((r) => ({
      userId: r.user.id,
      displayName: r.user.displayName ?? r.user.email ?? '',
    }));
  }

  async detail(
    user: { id: string; roles: readonly UserRoleKind[] },
    scenarioId: string,
  ): Promise<ScenarioDetail> {
    const row = await this.load(scenarioId);
    const occupationId = row.task.level.occupationId;
    const active = row.reviewAssignments[0];
    const isCa = Boolean(
      await this.prisma.staffAssignment.findFirst({
        where: {
          userId: user.id,
          occupationId,
          role: 'CONTENT_ADMIN',
          endedAt: null,
        },
        select: { id: true },
      }),
    );
    const isAuthor = row.authorId === user.id;
    const isReviewer = active?.reviewerId === user.id;
    const allowedActions = this.machine
      .allowedActions(row.status, user.roles)
      .filter((a) =>
        TRANSITIONS[a].role === 'CONTENT_ADMIN'
          ? isCa
          : AUTHOR_ACTIONS.includes(a)
            ? isAuthor
            : REVIEWER_ACTIONS.includes(a)
              ? isReviewer && !isAuthor
              : false,
      );
    const content = await readContent(this.prisma, scenarioId);
    return {
      ...this.toListItem(row),
      version: String(row.rowVersion),
      allowedActions,
      ...(row.authorContext ? { authorContext: row.authorContext } : {}),
      ...(row.archetype ? { archetype: row.archetype } : {}),
      ...(row.companyType ? { companyType: row.companyType } : {}),
      skillIds: row.skills.map((s) => s.competencyId),
      ...(content ? { content } : {}),
      ...(active
        ? {
            assignment: toAssignmentView(active, {
              authorId: row.authorId,
              status: row.status,
            }),
          }
        : {}),
      eligibleExperts: await this.expertsOf(occupationId),
    };
  }
}
