import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { ActivityLogService } from '../auth/activity-log.service';
import { Problem } from '../core/problem';
import { PrismaService } from '../prisma/prisma.service';
import { readContent, writeContent } from '../lifecycle/content-store';
import { validateContent, type CheckReport } from './content/content-validator';
import type {
  ReferenceAnswerInput,
  ScenarioContent,
} from './dto/scenario-content.schema';
import { ScenarioService } from './scenario.service';

/** openapi `ReferenceAnswer`. */
export interface ReferenceAnswerView {
  id: string;
  activityKey: string;
  answerText: string;
  stratum: 'EASY' | 'MEDIUM' | 'HARD';
  scores: Array<{
    criterionId: string;
    score: number | null;
    counterproductive: boolean;
  }>;
}

/** `If-Match` có thể có ngoặc kép hoặc tiền tố W/. */
export const parseIfMatch = (header: string | undefined): number | null => {
  const raw = header?.replace(/^W\//, '').replace(/"/g, '').trim();
  const n = Number(raw);
  return raw && Number.isInteger(n) ? n : null;
};

/** CL-05 `ContentService`: lưu nội dung, kiểm tự động, câu mẫu (FR-22, FR-23, FR-24). */
@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scenarios: ScenarioService,
    private readonly activity: ActivityLogService,
  ) {}

  /** `saveScenarioContent`: ghi đè nội dung, khoá lạc quan bằng `row_version` (412). */
  async save(
    user: AuthUser,
    scenarioId: string,
    ifMatch: string | undefined,
    content: ScenarioContent,
  ) {
    const expected = parseIfMatch(ifMatch);
    if (expected === null)
      throw new Problem(
        412,
        'PRECONDITION_FAILED',
        'Thiếu If-Match: tải lại scenario rồi lưu',
      );
    const row = await this.scenarios.load(scenarioId);
    this.scenarios.requireAuthorInDraft(user, row);
    await this.requireCompetencies(content);

    await this.prisma.$transaction(async (tx) => {
      // Điều kiện trên `row_version` nằm trong câu UPDATE: hai người lưu cùng
      // lúc thì người sau nhận 412 thay vì đè mất bản của người trước.
      const bumped = await tx.scenario.updateMany({
        where: { id: scenarioId, rowVersion: expected, status: 'DRAFT' },
        data: { rowVersion: { increment: 1 } },
      });
      if (bumped.count !== 1)
        throw new Problem(
          412,
          'PRECONDITION_FAILED',
          'Scenario đã được lưu ở nơi khác; tải lại để xem bản mới nhất',
        );
      await writeContent(tx, scenarioId, content);
    });
    await this.activity.log(user.id, 'SCENARIO_CONTENT_SAVED', {
      type: 'scenario',
      id: scenarioId,
    });
    return this.scenarios.detail(user, scenarioId);
  }

  /** Mọi năng lực nhắc tới phải có thật (tránh lỗi khoá ngoại thành 500). */
  private async requireCompetencies(content: ScenarioContent): Promise<void> {
    const ids = new Set([
      ...content.activities.flatMap((a) => a.rubric.map((r) => r.competencyId)),
      ...(content.randomEvents ?? []).map((e) => e.targetCompetencyId),
    ]);
    const found = await this.prisma.competency.count({
      where: { id: { in: [...ids] } },
    });
    if (found !== ids.size)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Nội dung nhắc tới năng lực không có trong danh mục',
      );
  }

  async checks(scenarioId: string): Promise<CheckReport> {
    const row = await this.scenarios.load(scenarioId);
    const content = await readContent(this.prisma, scenarioId);
    if (!content)
      return {
        passed: false,
        failedRules: [
          {
            rule: 'CONTENT_MISSING',
            path: 'content',
            message: 'Chưa có nội dung',
          },
        ],
      };
    return validateContent(content, {
      levelNo: row.task.level.levelNo,
      skillIds: row.skills.map((s) => s.competencyId),
    });
  }

  async referenceAnswers(scenarioId: string): Promise<ReferenceAnswerView[]> {
    const rows = await this.prisma.referenceAnswer.findMany({
      where: { activity: { scenarioId } },
      include: {
        activity: { select: { activityKey: true } },
        scores: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      activityKey: r.activity.activityKey,
      answerText: r.answerText,
      stratum: r.stratum,
      scores: r.scores.map((s) => ({
        criterionId: s.criterionId,
        score: s.score,
        counterproductive: s.counterproductive,
      })),
    }));
  }

  /**
   * FR-24: câu mẫu chỉ được lưu khi qua kiểm — mọi tiêu chí của activity đều
   * có điểm (NULL = không xét), không chấm tiêu chí của activity khác.
   */
  async addReferenceAnswer(
    user: AuthUser,
    scenarioId: string,
    dto: ReferenceAnswerInput,
  ): Promise<ReferenceAnswerView> {
    const row = await this.scenarios.load(scenarioId);
    this.scenarios.requireAuthorInDraft(user, row);
    const activity = await this.prisma.activity.findUnique({
      where: {
        scenarioId_activityKey: { scenarioId, activityKey: dto.activityKey },
      },
      include: { rubric: { select: { id: true } } },
    });
    if (!activity)
      throw new Problem(422, 'VALIDATION_FAILED', 'Không có activity này', [
        { field: 'activityKey', reason: 'không tồn tại' },
      ]);
    const rubricIds = new Set(activity.rubric.map((r) => r.id));
    const scored = new Set(dto.scores.map((s) => s.criterionId));
    const errors = [
      ...dto.scores
        .filter((s) => !rubricIds.has(s.criterionId))
        .map((s) => ({
          field: `scores.${s.criterionId}`,
          reason: 'không phải tiêu chí của activity này',
        })),
      ...[...rubricIds]
        .filter((id) => !scored.has(id))
        .map((id) => ({
          field: `scores.${id}`,
          reason: 'chưa chấm tiêu chí này',
        })),
      ...(scored.size !== dto.scores.length
        ? [{ field: 'scores', reason: 'một tiêu chí được chấm hai lần' }]
        : []),
    ];
    if (errors.length)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Câu mẫu chưa qua kiểm, chưa lưu',
        errors,
      );

    const created = await this.prisma.referenceAnswer.create({
      data: {
        activityId: activity.id,
        authorId: user.id,
        answerText: dto.answerText,
        stratum: dto.stratum,
        validationPassed: true,
        scores: {
          create: dto.scores.map((s) => ({
            criterionId: s.criterionId,
            score: s.score,
            counterproductive: s.counterproductive,
          })),
        },
      },
      include: { scores: true },
    });
    return {
      id: created.id,
      activityKey: dto.activityKey,
      answerText: created.answerText,
      stratum: created.stratum,
      scores: created.scores.map((s) => ({
        criterionId: s.criterionId,
        score: s.score,
        counterproductive: s.counterproductive,
      })),
    };
  }
}
