import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authoring } from '@datn/game-core';
import { ActivityLogService } from '../auth/activity-log.service';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import type { Env } from '../config/env';
import { Problem } from '../core/problem';
import type { Prisma } from '../generated/prisma/client';
import { readContent } from '../lifecycle/content-store';
import {
  ScenarioStateMachine,
  type Tx,
} from '../lifecycle/scenario-state-machine';
import { NotificationService } from '../notification/notification.service';
import { StreamService } from '../notification/stream.service';
import { PrismaService } from '../prisma/prisma.service';

/** openapi `Build`. */
export interface BuildView {
  id: string;
  scenarioId: string;
  contentHash: string;
  builtAt: string;
  content: authoring.BuildContent;
}

/**
 * CL-06 `BuildSnapshotter`: chụp nội dung đã duyệt + trình bày thành một
 * khối bất biến, hash bằng SHA-256 trên JSON chuẩn hoá.
 */
export async function snapshot(
  tx: Tx,
  scenarioId: string,
): Promise<authoring.BuildContent> {
  const s = await tx.scenario.findUniqueOrThrow({
    where: { id: scenarioId },
    include: {
      skills: { include: { competency: true } },
      task: { include: { level: { include: { occupation: true } } } },
      presentation: {
        include: {
          background: true,
          activities: { include: { activity: true, scene: true } },
          npcs: { include: { castMember: true, avatar: true } },
        },
      },
      cast: true,
      activities: true,
    },
  });
  const content = await readContent(tx, scenarioId);
  if (!content)
    throw new Problem(422, 'VALIDATION_FAILED', 'Scenario chưa có nội dung');
  const p = s.presentation;
  const missing: Array<{ field: string; reason: string }> = [];
  const byActivity = new Map(
    (p?.activities ?? []).map((a) => [a.activity.activityKey, a]),
  );
  const byNpc = new Map((p?.npcs ?? []).map((n) => [n.castMember.npcKey, n]));
  for (const a of s.activities)
    if (!byActivity.has(a.activityKey))
      missing.push({
        field: `activities.${a.activityKey}`,
        reason: 'chưa chọn dạng task',
      });
  for (const c of s.cast)
    if (!byNpc.has(c.npcKey))
      missing.push({ field: `npcs.${c.npcKey}`, reason: 'chưa chọn avatar' });
  if (missing.length)
    throw new Problem(
      422,
      'VALIDATION_FAILED',
      'Trình bày chưa đủ để dựng bản nháp',
      missing,
    );

  const build: authoring.BuildContent = {
    schemaVersion: authoring.BUILD_SCHEMA_VERSION,
    scenario: {
      id: s.id,
      occupationCode: s.task.level.occupation.code,
      occupationName: s.task.level.occupation.name,
      levelNo: s.task.level.levelNo,
      band: s.task.level.band,
      taskText: s.task.text,
      archetype: s.archetype,
      companyType: s.companyType,
      skills: s.skills.map((k) => ({
        competencyId: k.competencyId,
        code: k.competency.code,
        name: k.competency.name,
        kind: k.competency.kind,
      })),
    },
    content,
    presentation: {
      background: p?.background
        ? { assetId: p.background.id, storageKey: p.background.storageKey }
        : null,
      activities: content.activities.flatMap((a) => {
        const chosen = byActivity.get(a.key);
        if (!chosen) return [];
        return {
          activityKey: a.key,
          taskType: chosen.taskType,
          scene: chosen.scene
            ? { assetId: chosen.scene.id, storageKey: chosen.scene.storageKey }
            : null,
        };
      }),
      npcs: (content.cast ?? []).flatMap((m) => {
        const n = byNpc.get(m.npcKey);
        if (!n) return [];
        return {
          npcKey: m.npcKey,
          avatar: { assetId: n.avatar.id, storageKey: n.avatar.storageKey },
        };
      }),
    },
  };
  return authoring.BuildContentSchema.parse(build);
}

export const hashOf = (content: authoring.BuildContent): string =>
  createHash('sha256').update(authoring.canonicalJson(content)).digest('hex');

/** CL-06 `BuildController` phần dựng bản nháp (SD-07 nửa đầu). Play-test (D05) thuộc P5. */
@Injectable()
export class BuildService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly machine: ScenarioStateMachine,
    private readonly notifications: NotificationService,
    private readonly stream: StreamService,
    private readonly activity: ActivityLogService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async build(user: AuthUser, scenarioId: string): Promise<BuildView> {
    const scenario = await this.prisma.scenario.findUnique({
      where: { id: scenarioId },
      select: {
        status: true,
        authorId: true,
        task: { select: { text: true } },
      },
    });
    if (!scenario)
      throw new Problem(404, 'NOT_FOUND', 'Không tìm thấy scenario');
    if (scenario.status !== 'APPROVED')
      throw new Problem(
        409,
        'INVALID_TRANSITION',
        'Chỉ dựng bản nháp khi scenario đã được duyệt',
      );
    const row = await this.prisma.$transaction(async (tx) => {
      const content = await snapshot(tx, scenarioId);
      const created = await tx.scenarioBuild.create({
        data: {
          scenarioId,
          content: content as unknown as Prisma.InputJsonValue,
          contentHash: hashOf(content),
          builtBy: user.id,
        },
      });
      await this.machine.apply(tx, scenarioId, 'BUILD_DRAFT', user);
      return created;
    });
    await this.activity.log(user.id, 'DRAFT_BUILT', {
      type: 'scenario',
      id: scenarioId,
      detail: { buildId: row.id },
    });
    if (scenario.authorId) {
      await this.stream.publish(scenario.authorId, {
        type: 'draft.ready',
        scenarioId,
        payload: { buildId: row.id },
      });
      await this.notifications.notify(scenario.authorId, 'DRAFT_READY', {
        scenarioId,
        buildId: row.id,
        taskText: scenario.task.text,
        link: `${this.config.get('STAFF_ORIGIN', { infer: true })}/staff/de`,
      });
    }
    return this.view(row);
  }

  private view(row: {
    id: string;
    scenarioId: string;
    contentHash: string;
    builtAt: Date;
    content: unknown;
  }): BuildView {
    return {
      id: row.id,
      scenarioId: row.scenarioId,
      contentHash: row.contentHash,
      builtAt: row.builtAt.toISOString(),
      content: row.content as authoring.BuildContent,
    };
  }

  async get(buildId: string): Promise<BuildView> {
    const row = await this.prisma.scenarioBuild.findUnique({
      where: { id: buildId },
    });
    if (!row) throw new Problem(404, 'NOT_FOUND', 'Không tìm thấy bản build');
    return this.view(row);
  }
}
