/**
 * Hồ sơ 8 chiều và việc ghép nghề.
 *
 * Hai loại điểm, đo hai chuyện khác nhau:
 *   - điểm kỹ năng  -> mở cấp bậc kế (xem `bands.ts`)
 *   - hồ sơ 8 chiều -> chỉ hướng hành tinh nên ghé (file này)
 */
import { DIMENSIONS, GAME } from '../data/gameData';
import { findRole } from '../data/indexes';
import type { Role, Signal } from '../data/schema';

export type FitVector = Record<string, number>;

export const blankFit = (): FitVector =>
  Object.fromEntries(DIMENSIONS.map((d) => [d, 0]));

/** Đã có nét nào chưa — mọi chiều bằng 0 nghĩa là chưa biết gì về người chơi. */
export const hasFit = (fit: FitVector): boolean =>
  DIMENSIONS.some((d) => (fit[d] ?? 0) !== 0);

/** Cộng dồn một tín hiệu vào hồ sơ. Trả vector mới, không sửa đầu vào. */
export function applySignal(fit: FitVector, signal: Signal): FitVector {
  const next = { ...fit };
  for (const [dimension, value] of Object.entries(signal)) {
    if (dimension in next) next[dimension] += value;
  }
  return next;
}

/** Cosine similarity trên 8 chiều. 0 khi một trong hai vector rỗng. */
export function cosine(a: FitVector, b: FitVector): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const d of DIMENSIONS) {
    const x = a[d] ?? 0;
    const y = b[d] ?? 0;
    dot += x * y;
    normA += x ** 2;
    normB += y ** 2;
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

export interface RankedRole {
  role: Role;
  /** `null` khi người chơi chưa có hồ sơ — lúc đó giữ nguyên thứ tự dataset. */
  score: number | null;
}

export function rankRoles(fit: FitVector): RankedRole[] {
  if (!hasFit(fit)) return GAME.roles.map((role) => ({ role, score: null }));
  return GAME.roles
    .map((role) => ({ role, score: cosine(fit, role.fit_profile) }))
    .sort((x, y) => (y.score ?? 0) - (x.score ?? 0));
}

export interface AdjacentRole {
  role_code: string;
  weight: number;
  why: string | null;
  /** Độ khớp với hồ sơ người chơi, `null` khi chưa có hồ sơ. */
  fit: number | null;
  /** Xếp hạng = độ gần trong đồ thị nghề × độ khớp hồ sơ. */
  score: number;
  /** Có nằm trong nhóm đang mở không — nếu không thì chưa du hành tới được. */
  playable: boolean;
}

export function adjacentRoles(
  roleCode: string,
  playerFit: FitVector,
): AdjacentRole[] {
  const role = findRole(roleCode);
  if (!role) return [];
  const known = hasFit(playerFit);

  return role.similar_ranked
    .map((similar) => {
      const target = findRole(similar.role_code);
      const fit = target && known ? cosine(playerFit, target.fit_profile) : null;
      return {
        role_code: similar.role_code,
        weight: similar.weight,
        why: similar.why ?? null,
        fit,
        score: similar.weight * (fit === null ? 1 : 0.5 + fit / 2),
        playable: Boolean(target),
      };
    })
    .sort((a, b) => b.score - a.score);
}
