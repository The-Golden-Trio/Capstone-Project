/**
 * openapi `ScenarioContent` (nội dung DE soạn, ERD-03) dưới dạng Zod. Dùng
 * chung cho API (`saveScenarioContent`, đầu ra AI sinh nội dung), staff app
 * (form soạn) và bản build. Ràng buộc chép từ openapi; luật nghiệp vụ nằm ở
 * `ContentValidator` của API.
 */
import { z } from 'zod';

export const TASK_TYPES = [
  'FREE_TEXT',
  'CHOICE',
  'ORDERING',
  'PRIORITIZING',
] as const;
export const TaskTypeSchema = z.enum(TASK_TYPES);
export type TaskTypeValue = z.infer<typeof TaskTypeSchema>;

const Key = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^[A-Za-z0-9_-]+$/, 'chỉ dùng chữ, số, "_" và "-"');
const Text = z.string().trim().min(1);
const Score = z.union([z.literal(0), z.literal(1), z.literal(2)]);
const Uuid = z.uuid();

export const CastMemberSchema = z.object({
  npcKey: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'chỉ dùng chữ, số, "_" và "-"'),
  name: z.string().trim().max(80).optional(),
  roleInScene: z.string().trim().min(1).max(120),
  pressure: z.string().optional(),
  voice: z.string().optional(),
});

export const ActivityItemSchema = z.object({
  key: Key,
  text: Text,
  score: Score.optional(),
  why: z.string().optional(),
  correctPosition: z.number().int().min(1).optional(),
  pickRule: z.enum(['MUST', 'SHOULD', 'MUST_NOT', 'NEUTRAL']).optional(),
  note: z.string().optional(),
});

export const RubricItemSchema = z.object({
  /** Chỉ đọc: id của `rubric_criterion`, cần cho điểm của câu mẫu (07 A22+). */
  id: Uuid.optional(),
  competencyId: Uuid,
  anchor2: Text,
  anchor1: Text,
  anchor0: Text,
  counterproductiveSigns: z.string().optional(),
});

export const ActivitySchema = z.object({
  key: Key,
  isOrigin: z.boolean().optional(),
  /** Khoá activity kế tiếp; `null` = kết thúc. */
  forwardTo: Key.nullable().optional(),
  setup: z.string().optional(),
  npcLine: z.string().optional(),
  inputPrompt: Text,
  jobScope: Text,
  closingLine: Text,
  allowedTypes: z.array(TaskTypeSchema).min(1),
  items: z.array(ActivityItemSchema).optional(),
  followupLimit: z.number().int().min(0).max(4).optional(),
  followupGoal: z.string().optional(),
  defaultFollowup: z.string().optional(),
  hints: z.array(z.string().trim().min(1)).optional(),
  rubric: z.array(RubricItemSchema).min(1),
});

export const RandomEventSchema = z.object({
  activityKey: Key,
  chance: z.number().min(0.1).max(0.4),
  text: Text,
  prompt: Text,
  targetCompetencyId: Uuid,
  anchor2: Text,
  anchor1: Text,
  anchor0: Text,
  counterproductiveSigns: z.string().optional(),
});

export const EndingSchema = z.object({
  type: z.enum(['GOOD', 'PARTIAL', 'BAD', 'SECRET']),
  priority: z.number().int().min(1),
  minTotalScore: z.number().int().nullable().optional(),
  extraBehaviour: z.string().nullable().optional(),
  text: Text,
  reveals: z.string().nullable().optional(),
});

export const SideQuestSchema = z.object({
  prompt: Text,
  taskType: TaskTypeSchema,
  points: z.number().int().min(1),
  answerKey: z.unknown().optional(),
});

export const ScenarioContentSchema = z.object({
  intro: z.string().optional(),
  situation: z.string().optional(),
  stakes: z.string().optional(),
  estimatedMinutes: z.number().min(10).max(15).optional(),
  cast: z.array(CastMemberSchema).optional(),
  activities: z.array(ActivitySchema).min(3).max(4),
  randomEvents: z.array(RandomEventSchema).max(2).optional(),
  endings: z.array(EndingSchema).min(2).max(5),
  sideQuests: z.array(SideQuestSchema).optional(),
});

export type ScenarioContent = z.infer<typeof ScenarioContentSchema>;
export type ActivityContent = z.infer<typeof ActivitySchema>;
