import type { UserSkillProgress } from '../domain';

export interface UserSkillProgressRepository {
  findByUser(userId: string): Promise<UserSkillProgress[]>;
  findOne(userId: string, skillId: string): Promise<UserSkillProgress | null>;
  /** Cộng dồn xp (delta >= 0), tạo mới nếu chưa có. Trả về row sau khi cập nhật. */
  addXp(userId: string, skillId: string, delta: number): Promise<UserSkillProgress>;
}

export const USER_SKILL_PROGRESS_REPOSITORY = Symbol('UserSkillProgressRepository');
