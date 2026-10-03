/** Mốc hành vi theo rubric A8 của spec-scenario-KHOI1. */
export type AnchorHit = '+2' | '0' | '-1';

/** 1 row/skill/user — upsert, XP không bao giờ giảm. */
export interface UserSkillProgress {
  userId: string;
  skillId: string;
  xp: number;
  updatedAt: string;
}

/**
 * Append-only. Khoá unique (sessionId, activityId, skillId) để chống cộng XP 2 lần
 * khi client gọi lại API cho cùng 1 activity.
 */
export interface SkillEvidenceLog {
  id: string;
  userId: string;
  sessionId: string;
  scenarioId: string;
  roleCode: string;
  band: string;
  activityId: string;
  skillId: string;
  anchorHit: AnchorHit;
  quote: string | null;
  hintUsed: boolean;
  timeout: boolean;
  xpDelta: number;
  createdAt: string;
}
