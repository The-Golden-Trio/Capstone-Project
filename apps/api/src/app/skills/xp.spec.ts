import { PROGRESSION } from '../config/progression.config';
import { computeXp, levelFromXp, levelProgress } from './xp';

describe('computeXp — bảng 1.3', () => {
  it('+2 không hint → BASE_XP', () => {
    const r = computeXp({ anchorHit: '+2', hintUsed: false, timeout: false });
    expect(r.xpDelta).toBe(PROGRESSION.BASE_XP);
    expect(r.effectiveAnchor).toBe('+2');
    expect(r.warnings).toEqual([]);
  });

  it('+2 có hint → ép về "0" (A9) + cảnh báo integrity', () => {
    const r = computeXp({ anchorHit: '+2', hintUsed: true, timeout: false });
    expect(r.effectiveAnchor).toBe('0');
    expect(r.xpDelta).toBe(PROGRESSION.BASE_XP * PROGRESSION.ZERO_ANCHOR_RATIO);
    expect(r.warnings).toHaveLength(1);
  });

  it.each([false, true])('"0" (hint=%s) → BASE_XP * ZERO_ANCHOR_RATIO', (hint) => {
    const r = computeXp({ anchorHit: '0', hintUsed: hint, timeout: false });
    expect(r.xpDelta).toBe(3);
    expect(r.effectiveAnchor).toBe('0');
  });

  it.each([false, true])('"-1" (hint=%s) → 0', (hint) => {
    expect(computeXp({ anchorHit: '-1', hintUsed: hint, timeout: false }).xpDelta).toBe(0);
  });

  it('timeout → 0, ép anchor về "-1" (A11)', () => {
    const r = computeXp({ anchorHit: '+2', hintUsed: false, timeout: true });
    expect(r.xpDelta).toBe(0);
    expect(r.effectiveAnchor).toBe('-1');
    expect(r.warnings).toHaveLength(1);
    expect(computeXp({ anchorHit: '-1', hintUsed: false, timeout: true }).warnings).toEqual([]);
  });
});

describe('level = floor(sqrt(xp / LEVEL_K))', () => {
  it.each([
    [0, 0],
    [24, 0],
    [25, 1],
    [99, 1],
    [100, 2],
    [225, 3],
  ])('xp=%i → level %i', (xp, level) => {
    expect(levelFromXp(xp)).toBe(level);
  });

  it('progress bar trong level', () => {
    // level 1: floor 25, next 100 → xp 40 = 15/75 = 0.2
    expect(levelProgress(40)).toEqual({ level: 1, levelFloorXp: 25, nextLevelXp: 100, progress: 0.2 });
    expect(levelProgress(0)).toEqual({ level: 0, levelFloorXp: 0, nextLevelXp: 25, progress: 0 });
  });
});
