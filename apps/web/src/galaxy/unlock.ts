/**
 * Luật "đủ điều kiện bay" sang một hành tinh. Thuần, không React, không store —
 * để sau này máy chủ chạy lại đúng luật này khi có backend cho bản đồ.
 *
 * Luật: phải có mọi kỹ năng cứng + mềm mà nghề đích yêu cầu. Kỹ năng người
 * chơi "có" là kỹ năng từng được chấm điểm trong một lượt chơi (máy chủ trả
 * về) hoặc đã qua bài kiểm tra nhập cảnh. Điểm kỹ năng ("nhiên liệu") KHÔNG
 * bị trừ khi bay — nó là năng lực đã có, bay đi không làm mất.
 */
import { normalizeVi } from '@datn/game-core';
import type { GalaxyEdge, GalaxyNode } from './galaxy';

/** 1 đơn vị `distance` ≈ chừng này điểm kỹ năng — chỉ để hiện "cần ~N nhiên liệu". */
export const FUEL_SCALE = 100;

export type SkillType = 'hard' | 'soft';

export interface SkillCheck {
  name: string;
  type: SkillType;
  have: boolean;
}

export interface UnlockState {
  hard: SkillCheck[];
  soft: SkillCheck[];
  missing: SkillCheck[];
  /** Đủ điều kiện bay. Nghề không có dữ liệu kỹ năng thì mặc định đủ. */
  unlocked: boolean;
  /** Nghề này chưa có dữ liệu kỹ năng nào — UI phải nói rõ, không giả vờ đã kiểm. */
  noData: boolean;
  fuelNeeded: number;
}

/**
 * Chuẩn hoá tên kỹ năng để so khớp: bỏ dấu, hạ chữ, bỏ phần trong ngoặc
 * ("SQL (MySQL/PostgreSQL)" → "sql"), gộp khoảng trắng.
 */
export const normalizeSkill = (name: string): string =>
  normalizeVi(name)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9+#./ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Tách một yêu cầu ghép thành các lựa chọn: "ReactJS hoặc Vue.js" → ["reactjs", "vue.js"],
 * "Swift/Kotlin" → ["swift", "kotlin"]. Có MỘT trong số đó là đạt.
 */
const alternatives = (name: string): string[] =>
  normalizeSkill(name)
    .split(/\s*(?:\/|,|\bhoac\b|\bor\b)\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);

/** Hai cách viết có cùng một kỹ năng không — "react" đủ cho "reactjs", "sql" đủ cho "sql co ban". */
const sameSkill = (a: string, b: string): boolean => {
  if (a === b) return true;
  // phải là cả từ, để "c" không khớp bừa "c#" hay "css"
  if (a.length < 3 || b.length < 3) return false;
  if (a.split(' ').includes(b) || b.split(' ').includes(a)) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return long.startsWith(short) && long.length - short.length <= 2; // react → reactjs
};

/** Người chơi có kỹ năng này chưa — khớp một trong các cách viết là được. */
export function hasSkill(owned: ReadonlySet<string>, required: string): boolean {
  const whole = normalizeSkill(required);
  if (whole && owned.has(whole)) return true;
  const wanted = alternatives(required);
  if (wanted.length === 0) return false;
  for (const o of owned)
    for (const oa of alternatives(o)) for (const w of wanted) if (sameSkill(oa, w)) return true;
  return false;
}

/** Tập kỹ năng đã chuẩn hoá của người chơi, từ mọi nguồn gộp lại. */
export const ownedSkillSet = (...sources: Iterable<string>[]): Set<string> => {
  const set = new Set<string>();
  for (const source of sources)
    for (const name of source) {
      const n = normalizeSkill(name);
      if (n) set.add(n);
    }
  return set;
};

export function computeUnlock(
  target: GalaxyNode,
  owned: ReadonlySet<string>,
  edge: GalaxyEdge | undefined,
): UnlockState {
  const check = (type: SkillType) => (name: string): SkillCheck => ({
    name,
    type,
    have: hasSkill(owned, name),
  });
  const hard = target.hardSkills.map(check('hard'));
  const soft = target.softSkills.map(check('soft'));
  const missing = [...hard, ...soft].filter((s) => !s.have);
  const noData = hard.length === 0 && soft.length === 0;
  return {
    hard,
    soft,
    missing,
    unlocked: missing.length === 0,
    noData,
    fuelNeeded: Math.round((edge?.distance ?? 1) * FUEL_SCALE),
  };
}
