import { PROGRESSION } from '../config/progression.config';
import type { RoleEdge } from '../shared/domain';

export interface RequiredSkillCheck {
  skillId: string;
  nameVn: string;
  haveLevel: number;
  needLevel: number;
  ok: boolean;
}

export interface UnlockCheck {
  unlocked: boolean;
  fuelHave: number;
  fuelNeed: number;
  fuelOk: boolean;
  skills: RequiredSkillCheck[];
}

export interface SkillLevelSource {
  levelOf(skillId: string): number;
  nameOf(skillId: string): string;
}

/** fuel cần để bay 1 cạnh — làm tròn lên để không mở khoá "hụt" vì số thập phân. */
export function fuelCost(edge: Pick<RoleEdge, 'distance'>): number {
  return Math.ceil(edge.distance * PROGRESSION.FUEL_SCALE);
}

/**
 * unlock(edge) = totalXp >= distance * FUEL_SCALE
 *              AND mọi skillId trong requiredSkills có level >= REQUIRED_SKILL_MIN_LEVEL
 * Fuel là NGƯỠNG, không tiêu hao — XP không bao giờ giảm khi bay.
 */
export function checkUnlock(edge: RoleEdge, totalXp: number, src: SkillLevelSource): UnlockCheck {
  const fuelNeed = fuelCost(edge);
  const fuelOk = totalXp >= fuelNeed;
  const skills = edge.requiredSkills.map((skillId) => {
    const haveLevel = src.levelOf(skillId);
    return {
      skillId,
      nameVn: src.nameOf(skillId),
      haveLevel,
      needLevel: PROGRESSION.REQUIRED_SKILL_MIN_LEVEL,
      ok: haveLevel >= PROGRESSION.REQUIRED_SKILL_MIN_LEVEL,
    };
  });
  return { unlocked: fuelOk && skills.every((s) => s.ok), fuelHave: totalXp, fuelNeed, fuelOk, skills };
}

/** Cạnh có "chạm" node hiện tại không (adjacency 1-hop). */
export function touchesNode(edge: Pick<RoleEdge, 'from' | 'to'>, roleCode: string): boolean {
  return edge.from === roleCode || edge.to === roleCode;
}

/**
 * Cạnh có bay được từ `fromRole` không. SIMILAR luôn 2 chiều; PROGRESSES_TO 2 chiều trừ khi
 * bật PROGRESSES_TO_DIRECTED (chỉ đi theo chiều mũi tên).
 */
export function isTraversableFrom(edge: Pick<RoleEdge, 'from' | 'to' | 'type'>, fromRole: string): boolean {
  if (!touchesNode(edge, fromRole)) return false;
  if (edge.type === 'PROGRESSES_TO' && PROGRESSION.PROGRESSES_TO_DIRECTED) return edge.from === fromRole;
  return true;
}

export function otherEnd(edge: Pick<RoleEdge, 'from' | 'to'>, roleCode: string): string {
  return edge.from === roleCode ? edge.to : edge.from;
}
