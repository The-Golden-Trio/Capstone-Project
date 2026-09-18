/** Hình dạng phản hồi của API, kiểm ở ranh giới mạng. */
import { z } from 'zod';
import { SkillTypeSchema } from '@datn/game-core';
import { GameDataSchema, ScenarioSchema } from '@datn/game-core';

export const ConsentStatusSchema = z.enum([
  'not_required',
  'pending',
  'granted',
]);
export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

export const RoleSchema = z.enum(['USER', 'CONTRIBUTOR', 'ADMIN']);
export type UserRole = z.infer<typeof RoleSchema>;

export const SessionUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  displayName: z.string(),
  role: RoleSchema,
  dateOfBirth: z.string().nullable(),
  consentStatus: ConsentStatusSchema,
  hasPassword: z.boolean(),
  linkedProviders: z.array(z.string()),
});
export type SessionUser = z.infer<typeof SessionUserSchema>;

export const OkSchema = z.object({ ok: z.literal(true) });

/* ── Hồ sơ chơi ────────────────────────────────────────────────────── */

export const GameProfileSchema = z.object({
  fit: z.record(z.string(), z.number()),
  quizDone: z.boolean(),
  eventsPlayed: z.number(),
  doneEventIds: z.array(z.string()),
});
export type GameProfileView = z.infer<typeof GameProfileSchema>;

export const EventAnswerResultSchema = GameProfileSchema.extend({
  outcome: z.string(),
  /** 0 nếu nhiệm vụ này đã tính điểm ở cấp bậc này rồi. */
  pointsAwarded: z.number(),
  bandPoints: z.number(),
  unlockedBand: z.string().nullable(),
  /** Hướng xử lý máy chủ đọc ra từ câu trả lời. */
  readAs: z.string(),
});
export type EventAnswerResult = z.infer<typeof EventAnswerResultSchema>;

/* ── Tiến trình ────────────────────────────────────────────────────── */

export const BandProgressSchema = z.object({
  band: z.string(),
  label: z.string(),
  points: z.number(),
  unlocked: z.boolean(),
  hasScenario: z.boolean(),
  pointsToUnlock: z.number(),
  enrolled: z.boolean(),
  completed: z.boolean(),
});
export type BandProgress = z.infer<typeof BandProgressSchema>;

export const RoleProgressSchema = z.object({
  roleCode: z.string(),
  roleName: z.string(),
  bands: z.array(BandProgressSchema),
  totalPoints: z.number(),
});
export type RoleProgress = z.infer<typeof RoleProgressSchema>;

export const SkillBreakdownSchema = z.object({
  skill: z.string(),
  skillType: SkillTypeSchema,
  points: z.number(),
  plus2: z.number(),
  neutral: z.number(),
  minus1: z.number(),
});
export type SkillBreakdown = z.infer<typeof SkillBreakdownSchema>;

export const TimelinePointSchema = z.object({
  date: z.string(),
  points: z.number(),
  cumulative: z.number(),
});
export type TimelinePoint = z.infer<typeof TimelinePointSchema>;

export const ProgressSummarySchema = z.object({
  totalPoints: z.number(),
  /** Ba phần của `totalPoints`: cứng, mềm (nhiệm vụ chính) và nhiệm vụ phụ. */
  hardPoints: z.number(),
  softPoints: z.number(),
  sideQuestPoints: z.number(),
  runsCompleted: z.number(),
  eventsPlayed: z.number(),
  quizDone: z.boolean(),
  roles: z.array(RoleProgressSchema),
  skills: z.array(SkillBreakdownSchema),
  timeline: z.array(TimelinePointSchema),
});
export type ProgressSummary = z.infer<typeof ProgressSummarySchema>;

/* ── Lượt chơi ─────────────────────────────────────────────────────── */

export const EvidenceSchema = z.object({
  activityId: z.string(),
  skill: z.string(),
  skillType: SkillTypeSchema,
  anchor: z.enum(['+2', '0', '-1']),
  capped: z.boolean(),
  why: z.string(),
  quote: z.string().nullable(),
  timeout: z.boolean(),
});
export type EvidenceView = z.infer<typeof EvidenceSchema>;

export const StartedRunSchema = z.object({
  runId: z.string(),
  scenarioKey: z.string(),
  seed: z.number(),
  roleCode: z.string(),
  band: z.string(),
});
export type StartedRun = z.infer<typeof StartedRunSchema>;

export const CompletedRunSchema = z.object({
  runId: z.string(),
  endingId: z.string(),
  endingType: z.string(),
  pointsAwarded: z.number(),
  bandPoints: z.number(),
  unlockedBand: z.string().nullable(),
  alreadyScored: z.boolean(),
  evidence: z.array(EvidenceSchema),
});
export type CompletedRun = z.infer<typeof CompletedRunSchema>;

export const RunHistoryItemSchema = z.object({
  id: z.string(),
  scenarioKey: z.string(),
  scenarioTitle: z.string(),
  roleCode: z.string(),
  band: z.string(),
  completedAt: z.string().nullable(),
  endingId: z.string().nullable(),
  endingType: z.string().nullable(),
  pointsAwarded: z.number(),
  rating: z.number().nullable(),
  evidence: z.array(EvidenceSchema),
});
export type RunHistoryItem = z.infer<typeof RunHistoryItemSchema>;

export const RunHistorySchema = z.array(RunHistoryItemSchema);

/* ── Nội dung game ─────────────────────────────────────────────────── */

/**
 * Nội dung kiểm lại ở đây, bằng đúng Zod schema mà máy chủ đã kiểm lúc seed.
 *
 * Kiểm hai lần không thừa: máy chủ và máy khách nay là hai tiến trình khác
 * nhau đọc cùng một database, và nếu một ngày nào đó chúng lệch phiên bản
 * schema thì lỗi phải nổ ngay ở ranh giới mạng chứ không phải giữa màn chơi.
 */
export const ContentBootstrapSchema = z.object({
  version: z.number(),
  data: GameDataSchema,
  /** Khoá là `"<scenarioKey>:<activityId>"`. */
  followups: z.record(
    z.string(),
    z.object({ who: z.string(), text: z.string() }),
  ),
});
export type ContentBootstrap = z.infer<typeof ContentBootstrapSchema>;

export const GalaxyContentSchema = z.object({
  version: z.number(),
  groups: z.array(z.unknown()),
  nodes: z.array(z.unknown()),
  edges: z.unknown(),
});
export type GalaxyContent = z.infer<typeof GalaxyContentSchema>;

export const ScenarioContentSchema = z.object({
  version: z.number(),
  key: z.string(),
  scenario: ScenarioSchema,
  /** Khoá là `activity_id`, không phải khoá đầy đủ như trong database. */
  followups: z.record(
    z.string(),
    z.object({ who: z.string(), text: z.string() }),
  ),
});
export type ScenarioContent = z.infer<typeof ScenarioContentSchema>;
