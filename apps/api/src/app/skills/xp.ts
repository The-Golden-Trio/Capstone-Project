import { PROGRESSION } from '../config/progression.config';
import type { AnchorHit } from '../shared/domain';

export interface XpInput {
  anchorHit: AnchorHit;
  hintUsed: boolean;
  timeout: boolean;
}

export interface XpOutcome {
  /** Mốc thật sự được tính sau khi áp luật (A9 hint, A11 timeout). */
  effectiveAnchor: AnchorHit;
  xpDelta: number;
  /** Cảnh báo integrity khi nhãn client gửi lên mâu thuẫn với spec. */
  warnings: string[];
}

/**
 * Bảng cộng XP (plan 1.3):
 *   +2 & !hint   → BASE_XP
 *   +2 & hint    → KHÔNG hợp lệ theo A9 → ép về "0" + cảnh báo integrity
 *   0            → BASE_XP * ZERO_ANCHOR_RATIO
 *   -1           → 0
 *   timeout      → 0 (đã là -1 theo A11)
 */
export function computeXp(input: XpInput): XpOutcome {
  const warnings: string[] = [];
  let anchor: AnchorHit = input.anchorHit;

  if (input.timeout) {
    if (anchor !== '-1') {
      warnings.push(`timeout=true nhưng anchor_hit="${anchor}" — A11 quy định hết giờ là "-1"; ép về "-1"`);
    }
    anchor = '-1';
  } else if (input.hintUsed && anchor === '+2') {
    warnings.push('hint_used=true nhưng anchor_hit="+2" — A9 cấm phát +2 khi đã xem hint; ép về "0"');
    anchor = '0';
  }

  const xpDelta =
    anchor === '+2'
      ? PROGRESSION.BASE_XP
      : anchor === '0'
        ? PROGRESSION.BASE_XP * PROGRESSION.ZERO_ANCHOR_RATIO
        : 0;

  return { effectiveAnchor: anchor, xpDelta, warnings };
}

/** level = floor(sqrt(xp / LEVEL_K)). */
export function levelFromXp(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 0;
  return Math.floor(Math.sqrt(xp / PROGRESSION.LEVEL_K));
}

export interface LevelProgress {
  level: number;
  /** XP tại đáy level hiện tại = LEVEL_K * level². */
  levelFloorXp: number;
  /** XP cần để lên level kế = LEVEL_K * (level+1)². */
  nextLevelXp: number;
  /** 0..1 — phần đã đi được trong level hiện tại. */
  progress: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const levelFloorXp = PROGRESSION.LEVEL_K * level * level;
  const nextLevelXp = PROGRESSION.LEVEL_K * (level + 1) * (level + 1);
  const span = nextLevelXp - levelFloorXp;
  const progress = span > 0 ? Math.min(1, Math.max(0, (xp - levelFloorXp) / span)) : 0;
  return { level, levelFloorXp, nextLevelXp, progress };
}
