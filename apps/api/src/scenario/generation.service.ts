import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { Problem } from '../core/problem';
import { QueueService } from '../core/queues';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { pathGet, readContent } from '../lifecycle/content-store';
import type {
  GenerationInput,
  RequestRevisionInput,
} from './dto/scenario-content.schema';
import { ScenarioService } from './scenario.service';
import { archetypesFor, COMPANY_TYPES } from './situation';

/** openapi `JobAccepted`. */
export interface JobAccepted {
  jobId: string;
  streamEvent: 'generation.ready' | 'revision.ready';
}

/**
 * CL-05 `GenerationService` (SD-05 bước 2): lưu ngữ cảnh và yêu cầu sinh,
 * đẩy job vào queue `generation` rồi trả 202 ngay. Model chạy ở worker
 * (`GenerationProcessor`); kết quả về staff app qua SSE.
 */
@Injectable()
export class GenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scenarios: ScenarioService,
    private readonly queues: QueueService,
  ) {}

  async situationOptions(scenarioId: string) {
    const row = await this.scenarios.load(scenarioId);
    const competencies = await this.prisma.levelCompetency.findMany({
      where: { levelId: row.task.level.id },
      include: { competency: true },
      orderBy: { competency: { kind: 'asc' } },
    });
    return {
      band: row.task.level.band,
      archetypes: archetypesFor(row.task.level.levelNo),
      companyTypes: [...COMPANY_TYPES],
      skills: competencies.map((c) => ({
        competencyId: c.competencyId,
        name: c.competency.name,
        kind: c.competency.kind,
      })),
    };
  }

  async requestGeneration(
    user: AuthUser,
    scenarioId: string,
    dto: GenerationInput,
  ): Promise<JobAccepted> {
    const row = await this.scenarios.load(scenarioId);
    this.scenarios.requireAuthorInDraft(user, row);
    if (!archetypesFor(row.task.level.levelNo).includes(dto.archetype))
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Archetype chưa mở ở cấp này',
        [
          {
            field: 'archetype',
            reason: `chưa mở ở L${row.task.level.levelNo}`,
          },
        ],
      );
    const levelSkills = new Set(
      (
        await this.prisma.levelCompetency.findMany({
          where: { levelId: row.task.level.id },
          select: { competencyId: true },
        })
      ).map((c) => c.competencyId),
    );
    const outside = dto.competencyIds.filter((id) => !levelSkills.has(id));
    if (outside.length)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Năng lực không thuộc cấp này',
        outside.map((id) => ({ field: 'competencyIds', reason: id })),
      );

    const aiJobId = randomUUID();
    await this.prisma.$transaction(async (tx) => {
      await tx.scenario.update({
        where: { id: scenarioId },
        data: {
          authorContext: dto.context,
          archetype: dto.archetype,
          companyType: dto.companyType,
        },
      });
      await tx.scenarioSkill.deleteMany({ where: { scenarioId } });
      await tx.scenarioSkill.createMany({
        data: [...new Set(dto.competencyIds)].map((competencyId) => ({
          scenarioId,
          competencyId,
        })),
      });
      await tx.aiJob.create({ data: { id: aiJobId, kind: 'GENERATE' } });
      await tx.generationRun.create({
        data: {
          scenarioId,
          kind: 'GENERATE',
          requestedBy: user.id,
          aiJobId,
          input: dto as unknown as Prisma.InputJsonValue,
        },
      });
    });
    await this.enqueue(aiJobId);
    return { jobId: aiJobId, streamEvent: 'generation.ready' };
  }

  async requestRevision(
    user: AuthUser,
    scenarioId: string,
    dto: RequestRevisionInput,
  ): Promise<JobAccepted> {
    const row = await this.scenarios.load(scenarioId);
    this.scenarios.requireAuthorInDraft(user, row);
    const content = await readContent(this.prisma, scenarioId);
    if (!content || pathGet(content, dto.part) === undefined)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Không tìm thấy phần cần sửa trong nội dung đã lưu',
        [{ field: 'part', reason: dto.part }],
      );
    const aiJobId = randomUUID();
    await this.prisma.$transaction(async (tx) => {
      await tx.aiJob.create({ data: { id: aiJobId, kind: 'REVISE' } });
      await tx.generationRun.create({
        data: {
          scenarioId,
          kind: 'REVISE',
          requestedBy: user.id,
          aiJobId,
          input: dto as unknown as Prisma.InputJsonValue,
        },
      });
    });
    await this.enqueue(aiJobId);
    return { jobId: aiJobId, streamEvent: 'revision.ready' };
  }

  private async enqueue(aiJobId: string): Promise<void> {
    const run = await this.prisma.generationRun.findUniqueOrThrow({
      where: { aiJobId },
      select: { id: true },
    });
    try {
      await this.queues.enqueueGeneration({ aiJobId, generationRunId: run.id });
    } catch {
      await this.prisma.aiJob.update({
        where: { id: aiJobId },
        data: {
          status: 'FAILED',
          lastError: 'Không đẩy được việc vào hàng đợi',
          finishedAt: new Date(),
        },
      });
      throw new Problem(
        503,
        'UNAVAILABLE',
        'Hàng đợi tạm thời không dùng được',
      );
    }
  }

  /** openapi `listGenerations` (GenerationRun). */
  async list(scenarioId: string) {
    const rows = await this.prisma.generationRun.findMany({
      where: { scenarioId },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { displayName: true, email: true } },
        aiJob: { include: { costs: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      status: r.aiJob.status,
      model: r.aiJob.costs.find((c) => c.succeeded)?.modelId ?? '',
      costUsd: r.aiJob.costs.reduce((s, c) => s + Number(c.costUsd), 0),
      checkPassed: r.checkPassed,
      createdAt: r.createdAt.toISOString(),
      requestedBy: r.requester.displayName ?? r.requester.email ?? '',
    }));
  }
}
