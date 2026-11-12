import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { Worker, type Job } from 'bullmq';
import { deidentify } from '@datn/game-core';
import {
  SCENARIO_GENERATOR,
  type GenerationBrief,
  type GeneratorResult,
  type ScenarioGenerator,
} from '../ai/generation/generation.types';
import {
  GENERATION_QUEUE,
  REDIS_URL,
  redisOptions,
  type GenerationJob,
} from '../core/queues';
import type { Prisma } from '../generated/prisma/client';
import type { PromptKind } from '../generated/prisma/enums';
import { StreamService } from '../notification/stream.service';
import { PrismaService } from '../prisma/prisma.service';
import { pathGet, pathSet, readContent } from '../lifecycle/content-store';
import { validateContent, type CheckReport } from './content/content-validator';
import {
  GenerationInputSchema,
  RequestRevisionSchema,
  ScenarioContentSchema,
  type ScenarioContent,
} from './dto/scenario-content.schema';

const ID_FIELDS = new Set(['competencyId', 'targetCompetencyId']);

/** Đổi mọi giá trị ở trường năng lực theo bảng `map` (uuid ↔ k1…). */
function mapIds(value: unknown, map: Map<string, string>): unknown {
  if (Array.isArray(value)) return value.map((v) => mapIds(v, map));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        ID_FIELDS.has(k) && typeof v === 'string'
          ? (map.get(v) ?? v)
          : mapIds(v, map),
      ]),
    );
  return value;
}

function schemaReport(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}): CheckReport {
  return {
    passed: false,
    failedRules: error.issues.slice(0, 20).map((i) => ({
      rule: 'SCHEMA',
      path: i.path.map(String).join('.'),
      message: i.message,
    })),
  };
}

/**
 * CL-05 `GenerationProcessor` (worker, queue `generation`, SD-05): gọi model,
 * kiểm đầu ra bằng schema + `ContentValidator`, lưu `generation_run` và sổ chi
 * phí, rồi đẩy `generation.ready` / `revision.ready` tới tác giả. KHÔNG ghi
 * vào nội dung scenario: tác giả xem rồi tự lưu (Content lifecycle).
 */
@Injectable()
export class GenerationProcessor
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('Worker·generation');
  private worker: Worker<GenerationJob> | null = null;

  constructor(
    @Inject(REDIS_URL) private readonly redisUrl: string,
    private readonly prisma: PrismaService,
    private readonly stream: StreamService,
    @Inject(SCENARIO_GENERATOR) private readonly generator: ScenarioGenerator,
  ) {}

  onApplicationBootstrap(): void {
    this.worker = new Worker<GenerationJob>(
      GENERATION_QUEUE,
      (job) => this.process(job),
      { connection: redisOptions(this.redisUrl), concurrency: 2 },
    );
    this.worker.on('failed', (job, err) =>
      this.logger.warn(`Sinh ${job?.id} lỗi: ${err.message}`),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  async process(job: Job<GenerationJob>): Promise<void> {
    const run = await this.prisma.generationRun.findUnique({
      where: { id: job.data.generationRunId },
      include: {
        aiJob: true,
        requester: {
          select: { displayName: true, username: true, email: true },
        },
        scenario: {
          include: {
            skills: { include: { competency: true } },
            task: {
              include: {
                level: {
                  include: {
                    occupation: {
                      include: {
                        generationRules: { orderBy: { createdAt: 'asc' } },
                        downsides: { orderBy: { sortOrder: 'asc' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!run || run.aiJob.status === 'SUCCEEDED') return;
    await this.prisma.aiJob.update({
      where: { id: run.aiJobId },
      data: { status: 'RUNNING', attempts: { increment: 1 } },
    });

    const { scenario } = run;
    const level = scenario.task.level;
    const toKey = new Map<string, string>();
    const toId = new Map<string, string>();
    scenario.skills.forEach((s, i) => {
      toKey.set(s.competencyId, `k${i + 1}`);
      toId.set(`k${i + 1}`, s.competencyId);
    });

    // DC-03: khử định danh chữ của tác giả trước khi gửi model.
    const known = {
      names: run.requester.displayName ? [run.requester.displayName] : [],
      usernames: run.requester.username ? [run.requester.username] : [],
      emails: run.requester.email ? [run.requester.email] : [],
    };
    const brief: GenerationBrief = {
      occupationName: level.occupation.name,
      levelNo: level.levelNo,
      band: level.band,
      levelTitle: level.title,
      levelDescription: level.description,
      taskText: scenario.task.text,
      archetype: scenario.archetype ?? 'S_EXEC',
      companyType: scenario.companyType ?? 'PRODUCT_LOCAL',
      authorContext: deidentify(scenario.authorContext ?? '', known).text,
      skills: scenario.skills.map((s, i) => ({
        key: `k${i + 1}`,
        name: s.competency.name,
        kind: s.competency.kind,
      })),
      generationRules: level.occupation.generationRules.map(
        (r) => deidentify(r.ruleText, known).text,
      ),
      downsides: level.occupation.downsides.map((d) => d.text),
    };
    const ctx = {
      levelNo: level.levelNo,
      skillIds: scenario.skills.map((s) => s.competencyId),
    };

    const kind: PromptKind = run.kind === 'REVISE' ? 'REVISION' : 'GENERATION';
    const template = await this.prisma.promptTemplate.findFirst({
      where: { occupationId: level.occupationId, kind },
      orderBy: { versionNo: 'desc' },
    });
    if (template)
      await this.prisma.aiJob.update({
        where: { id: run.aiJobId },
        data: { promptTemplateId: template.id },
      });

    let result: GeneratorResult;
    let output: unknown = null;
    let report: CheckReport | null = null;
    let eventPayload: Record<string, unknown>;
    const eventType =
      run.kind === 'REVISE' ? 'revision.ready' : 'generation.ready';

    try {
      if (run.kind === 'REVISE') {
        const input = RequestRevisionSchema.parse(run.input);
        const saved = await readContent(this.prisma, scenario.id);
        result = await this.generator.revise(
          {
            brief,
            part: input.part,
            current: mapIds(pathGet(saved, input.part), toKey),
            request: deidentify(input.request, known).text,
          },
          template?.text,
        );
        if (result.status === 'ok' && saved) {
          const value = mapIds(result.json, toId);
          const merged = ScenarioContentSchema.safeParse(
            pathSet(saved, input.part, value),
          );
          report = merged.success
            ? validateContent(merged.data, ctx)
            : schemaReport(merged.error);
          output = { part: input.part, value };
        }
        eventPayload = {
          generationRunId: run.id,
          part: input.part,
          ...(output ? { value: (output as { value: unknown }).value } : {}),
        };
      } else {
        GenerationInputSchema.parse(run.input);
        result = await this.generator.generate(brief, template?.text);
        if (result.status === 'ok') {
          const parsed = ScenarioContentSchema.safeParse(
            mapIds(result.json, toId),
          );
          output = parsed.success ? parsed.data : mapIds(result.json, toId);
          report = parsed.success
            ? validateContent(parsed.data as ScenarioContent, ctx)
            : schemaReport(parsed.error);
        }
        eventPayload = {
          generationRunId: run.id,
          ...(output ? { content: output } : {}),
        };
      }
    } catch (err) {
      this.logger.error(`Sinh ${run.id} hỏng: ${String(err)}`);
      result = { status: 'failed', reason: 'exhausted', usage: [] };
      eventPayload = { generationRunId: run.id };
    }

    if (result.usage.length)
      await this.prisma.usageCost.createMany({
        data: result.usage.map((u) => ({
          aiJobId: run.aiJobId,
          role: 'generator',
          modelId: u.modelId,
          tokensIn: u.tokensIn,
          tokensOut: u.tokensOut,
          costUsd: u.costUsd.toFixed(8),
          latencyMs: u.latencyMs,
          succeeded: u.succeeded,
        })),
      });

    const ok = result.status === 'ok' && output !== null;
    await this.prisma.$transaction([
      this.prisma.generationRun.update({
        where: { id: run.id },
        data: {
          output:
            output === null ? undefined : (output as Prisma.InputJsonValue),
          checkPassed: report?.passed ?? null,
          checkReport:
            report === null
              ? undefined
              : (report as unknown as Prisma.InputJsonValue),
        },
      }),
      this.prisma.aiJob.update({
        where: { id: run.aiJobId },
        data: {
          status: ok ? 'SUCCEEDED' : 'FAILED',
          lastError: ok
            ? null
            : result.status === 'failed'
              ? result.reason
              : 'output_invalid',
          finishedAt: new Date(),
        },
      }),
    ]);

    await this.stream.publish(run.requestedBy, {
      type: eventType,
      scenarioId: scenario.id,
      jobId: run.aiJobId,
      payload: ok
        ? { ...eventPayload, checkReport: report }
        : {
            ...eventPayload,
            error:
              result.status === 'failed' ? result.reason : 'output_invalid',
          },
    });
  }
}
