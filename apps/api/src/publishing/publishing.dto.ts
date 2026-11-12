import { z } from 'zod';
import { authoring } from '@datn/game-core';

/** openapi `Presentation` (đầu vào của `savePresentation`). */
export const PresentationSchema = z.object({
  backgroundAssetId: z.uuid().nullable().optional(),
  activities: z
    .array(
      z.object({
        activityKey: z.string().min(1),
        taskType: authoring.TaskTypeSchema,
        sceneAssetId: z.uuid().nullable().optional(),
      }),
    )
    .default([]),
  npcs: z
    .array(z.object({ npcKey: z.string().min(1), avatarAssetId: z.uuid() }))
    .default([]),
});
export type PresentationInput = z.infer<typeof PresentationSchema>;

export const ASSET_KINDS = ['NPC', 'BACKGROUND', 'SCENE', 'ICON'] as const;

/**
 * openapi `UploadAssetInput` (multipart). Thêm `biasChecked` ngoài hợp đồng
 * (07 A22+, Q9): AI kiểm thiên kiến còn hoãn (D-104), nên CA tự xác nhận.
 */
export const UploadAssetSchema = z.object({
  kind: z.enum(ASSET_KINDS),
  sourceNote: z.string().trim().min(1, 'ghi nguồn hoặc giấy phép').max(500),
  biasChecked: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .refine((v) => v, 'cần xác nhận đã kiểm thiên kiến'),
});
