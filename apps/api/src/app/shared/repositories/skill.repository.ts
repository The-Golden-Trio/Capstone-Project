import type { Skill } from '../domain';

/**
 * Port đọc taxonomy. Adapter hiện tại load từ skills_taxonomy.json vào memory;
 * khi chọn DB xong chỉ cần viết adapter mới implement interface này.
 */
export interface SkillRepository {
  findAll(): Promise<Skill[]>;
  findById(skillId: string): Promise<Skill | null>;
  /** Resolve chuỗi skill tự do (nameVn hoặc alias, không phân biệt hoa/thường) → Skill. */
  resolveByName(raw: string): Promise<Skill | null>;
}

export const SKILL_REPOSITORY = Symbol('SkillRepository');
