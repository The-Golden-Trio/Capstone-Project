/**
 * DTO của `ScenarioModule`. Khuôn `ScenarioContent` dùng chung nằm ở
 * `@datn/game-core` (`authoring`).
 */
import { z } from 'zod';
import { authoring } from '@datn/game-core';

export const {
  TASK_TYPES,
  TaskTypeSchema,
  ScenarioContentSchema,
  ActivitySchema,
} = authoring;
export type TaskTypeValue = authoring.TaskTypeValue;
export type ScenarioContent = authoring.ScenarioContent;
export type ActivityContent = authoring.ActivityContent;

const Key = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^[A-Za-z0-9_-]+$/, 'chỉ dùng chữ, số, "_" và "-"');
const Text = z.string().trim().min(1);
const Score = z.union([z.literal(0), z.literal(1), z.literal(2)]);
const Uuid = z.uuid();

/** openapi `GenerationInput`. */
export const GenerationInputSchema = z.object({
  context: z.string().trim().min(1).max(4000),
  archetype: z.enum([
    'S_EXEC',
    'S_AMBIG',
    'S_INCIDENT',
    'S_CONFLICT',
    'S_REVIEW',
    'S_DECISION',
  ]),
  companyType: z.enum([
    'OUTSOURCING',
    'PRODUCT_LOCAL',
    'ENTERPRISE_BANK',
    'BIGTECH_FDI',
  ]),
  competencyIds: z.array(Uuid).min(1),
});
export type GenerationInput = z.infer<typeof GenerationInputSchema>;

/** openapi `RequestRevisionInput`. */
export const RequestRevisionSchema = z.object({
  part: z.string().trim().min(1).max(200),
  request: z.string().trim().min(1).max(2000),
});
export type RequestRevisionInput = z.infer<typeof RequestRevisionSchema>;

/** openapi `OpenScenarioInput`. */
export const OpenScenarioSchema = z.object({ taskId: Uuid });

/** openapi `AssignmentInput`. */
export const AssignmentSchema = z.object({
  authorId: Uuid,
  reviewerId: Uuid,
  deadlineAt: z.iso.datetime({ offset: true }),
});
export type AssignmentInput = z.infer<typeof AssignmentSchema>;

/** openapi `ReferenceAnswer` (đầu vào của `addReferenceAnswer`). */
export const ReferenceAnswerInputSchema = z.object({
  activityKey: Key,
  answerText: Text,
  stratum: z.enum(['EASY', 'MEDIUM', 'HARD']),
  scores: z
    .array(
      z.object({
        criterionId: Uuid,
        score: Score.nullable(),
        counterproductive: z.boolean().default(false),
      }),
    )
    .min(1),
});
export type ReferenceAnswerInput = z.infer<typeof ReferenceAnswerInputSchema>;
