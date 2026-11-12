/**
 * Nội dung một bản build (ERD-04 `scenario_build.content`): ảnh chụp bất biến
 * của nội dung đã duyệt cùng lựa chọn trình bày của CA, để chơi thử (D05) và
 * sau này phát hành (SD-07, SD-08). openapi chỉ ghi "frozen game content read
 * by game-core" nên khuôn này là đề xuất (07 A22+).
 */
import { z } from 'zod';
import { ScenarioContentSchema, TaskTypeSchema } from './scenario-content.js';

export const BUILD_SCHEMA_VERSION = 1;

export const BuildContentSchema = z.object({
  schemaVersion: z.literal(BUILD_SCHEMA_VERSION),
  scenario: z.object({
    id: z.string(),
    occupationCode: z.string(),
    occupationName: z.string(),
    levelNo: z.number().int(),
    band: z.string(),
    taskText: z.string(),
    archetype: z.string().nullable(),
    companyType: z.string().nullable(),
    skills: z.array(
      z.object({
        competencyId: z.string(),
        code: z.string(),
        name: z.string(),
        kind: z.enum(['EXPERTISE', 'SOFT_SKILL']),
      }),
    ),
  }),
  content: ScenarioContentSchema,
  presentation: z.object({
    background: z
      .object({ assetId: z.string(), storageKey: z.string() })
      .nullable(),
    activities: z.array(
      z.object({
        activityKey: z.string(),
        taskType: TaskTypeSchema,
        scene: z
          .object({ assetId: z.string(), storageKey: z.string() })
          .nullable(),
      }),
    ),
    npcs: z.array(
      z.object({
        npcKey: z.string(),
        avatar: z.object({ assetId: z.string(), storageKey: z.string() }),
      }),
    ),
  }),
});
export type BuildContent = z.infer<typeof BuildContentSchema>;

/** JSON có khoá sắp theo thứ tự — cùng nội dung thì cùng chuỗi, cùng hash. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.keys(value as Record<string, unknown>)
      .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
      .sort()
      .map(
        (k) =>
          `${JSON.stringify(k)}:${canonicalJson((value as Record<string, unknown>)[k])}`,
      )
      .join(',')}}`;
  return JSON.stringify(value);
}
