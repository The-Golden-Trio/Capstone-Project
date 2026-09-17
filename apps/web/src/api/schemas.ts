/** Hình dạng phản hồi của API, kiểm ở ranh giới mạng. */
import { z } from 'zod';

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
