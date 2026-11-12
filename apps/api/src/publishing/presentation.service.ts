import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { Problem } from '../core/problem';
import type { AssetKind } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { PresentationInput } from './publishing.dto';

/** openapi `Presentation`. */
export interface PresentationView {
  backgroundAssetId: string | null;
  activities: Array<{
    activityKey: string;
    taskType: string;
    sceneAssetId: string | null;
  }>;
  npcs: Array<{ npcKey: string; avatarAssetId: string }>;
}

/**
 * CL-06 `PresentationService` (C06, FR-35, SD-07): CA chọn dạng task trong
 * tập DE cho phép, cảnh, nền, avatar NPC. Nội dung chỉ đọc. Chỉ sửa khi
 * scenario đã APPROVED (sau khi duyệt, trước khi dựng bản nháp).
 */
@Injectable()
export class PresentationService {
  constructor(private readonly prisma: PrismaService) {}

  async get(scenarioId: string): Promise<PresentationView> {
    const p = await this.prisma.presentation.findUnique({
      where: { scenarioId },
      include: {
        activities: {
          include: { activity: { select: { activityKey: true } } },
        },
        npcs: { include: { castMember: { select: { npcKey: true } } } },
      },
    });
    if (!p) return { backgroundAssetId: null, activities: [], npcs: [] };
    return {
      backgroundAssetId: p.backgroundAssetId,
      activities: p.activities.map((a) => ({
        activityKey: a.activity.activityKey,
        taskType: a.taskType,
        sceneAssetId: a.sceneAssetId,
      })),
      npcs: p.npcs.map((n) => ({
        npcKey: n.castMember.npcKey,
        avatarAssetId: n.avatarAssetId,
      })),
    };
  }

  async save(
    user: AuthUser,
    scenarioId: string,
    dto: PresentationInput,
  ): Promise<PresentationView> {
    const scenario = await this.prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: {
        activities: { include: { allowedTypes: true } },
        cast: true,
      },
    });
    if (!scenario)
      throw new Problem(404, 'NOT_FOUND', 'Không tìm thấy scenario');
    if (scenario.status !== 'APPROVED')
      throw new Problem(
        409,
        'INVALID_TRANSITION',
        'Chỉ thiết kế trình bày khi scenario đã được duyệt (Approved)',
      );

    const activityByKey = new Map(
      scenario.activities.map((a) => [a.activityKey, a]),
    );
    const castByKey = new Map(scenario.cast.map((c) => [c.npcKey, c]));
    const errors: Array<{ field: string; reason: string }> = [];
    const notAllowed: Array<{ field: string; reason: string }> = [];
    dto.activities.forEach((a, i) => {
      const activity = activityByKey.get(a.activityKey);
      if (!activity)
        errors.push({
          field: `activities[${i}].activityKey`,
          reason: 'không tồn tại',
        });
      else if (!activity.allowedTypes.some((t) => t.taskType === a.taskType))
        notAllowed.push({
          field: `activities[${i}].taskType`,
          reason: `${a.taskType} không nằm trong các dạng DE cho phép`,
        });
    });
    dto.npcs.forEach((n, i) => {
      if (!castByKey.has(n.npcKey))
        errors.push({ field: `npcs[${i}].npcKey`, reason: 'không tồn tại' });
    });
    if (notAllowed.length)
      throw new Problem(
        422,
        'TASK_TYPE_NOT_ALLOWED',
        'Dạng task không nằm trong tập Domain Expert cho phép (FR-35)',
        notAllowed,
      );

    // Asset phải đúng loại và đã qua kiểm thiên kiến.
    const wanted: Array<[string | null | undefined, AssetKind, string]> = [
      [dto.backgroundAssetId, 'BACKGROUND', 'backgroundAssetId'],
      ...dto.activities.map(
        (a, i) =>
          [a.sceneAssetId, 'SCENE', `activities[${i}].sceneAssetId`] as [
            string | null | undefined,
            AssetKind,
            string,
          ],
      ),
      ...dto.npcs.map(
        (n, i) =>
          [n.avatarAssetId, 'NPC', `npcs[${i}].avatarAssetId`] as [
            string,
            AssetKind,
            string,
          ],
      ),
    ];
    const ids = [
      ...new Set(
        wanted.map(([id]) => id).filter((id): id is string => Boolean(id)),
      ),
    ];
    const assets = new Map(
      (await this.prisma.asset.findMany({ where: { id: { in: ids } } })).map(
        (a) => [a.id, a],
      ),
    );
    for (const [id, kind, field] of wanted) {
      if (!id) continue;
      const asset = assets.get(id);
      if (!asset) errors.push({ field, reason: 'asset không tồn tại' });
      else if (asset.kind !== kind)
        errors.push({ field, reason: `cần asset loại ${kind}` });
      else if (asset.biasCheck !== 'PASSED')
        errors.push({ field, reason: 'asset chưa qua kiểm thiên kiến' });
    }
    if (errors.length)
      throw new Problem(
        422,
        'VALIDATION_FAILED',
        'Lựa chọn trình bày không hợp lệ',
        errors,
      );

    await this.prisma.$transaction(async (tx) => {
      const p = await tx.presentation.upsert({
        where: { scenarioId },
        create: {
          scenarioId,
          designedBy: user.id,
          backgroundAssetId: dto.backgroundAssetId ?? null,
        },
        update: {
          designedBy: user.id,
          backgroundAssetId: dto.backgroundAssetId ?? null,
        },
      });
      await tx.presentationActivity.deleteMany({
        where: { presentationId: p.id },
      });
      await tx.presentationActivity.createMany({
        data: dto.activities.map((a) => ({
          presentationId: p.id,
          activityId: (activityByKey.get(a.activityKey) as { id: string }).id,
          taskType: a.taskType,
          sceneAssetId: a.sceneAssetId ?? null,
        })),
      });
      await tx.presentationNpc.deleteMany({ where: { presentationId: p.id } });
      await tx.presentationNpc.createMany({
        data: dto.npcs.map((n) => ({
          presentationId: p.id,
          castMemberId: (castByKey.get(n.npcKey) as { id: string }).id,
          avatarAssetId: n.avatarAssetId,
        })),
      });
    });
    return this.get(scenarioId);
  }
}
