export type SkillType = 'hard' | 'soft';
export type HardSkillCategory = 'language' | 'framework' | 'tool';

/** 1 dòng trong skills_taxonomy.json — nguồn thật duy nhất cho skillId. */
export interface Skill {
  skillId: string;
  nameVn: string;
  type: SkillType;
  category: HardSkillCategory | null;
  aliases: string[];
}
