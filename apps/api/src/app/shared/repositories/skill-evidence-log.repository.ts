import type { SkillEvidenceLog } from '../domain';

export interface SkillEvidenceLogRepository {
  /** Khoá chống trùng: (sessionId, activityId, skillId). */
  exists(sessionId: string, activityId: string, skillId: string): Promise<boolean>;
  append(entry: Omit<SkillEvidenceLog, 'id' | 'createdAt'>): Promise<SkillEvidenceLog>;
  findByUser(userId: string): Promise<SkillEvidenceLog[]>;
}

export const SKILL_EVIDENCE_LOG_REPOSITORY = Symbol('SkillEvidenceLogRepository');
