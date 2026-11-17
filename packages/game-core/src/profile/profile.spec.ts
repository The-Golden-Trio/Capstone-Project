import {
  SOFT_SKILL_GROUPS,
  SOFT_SKILL_IDS,
  keptTier,
  tierOf,
  tierProgress,
} from './softSkills.js';
import { ZODIAC_SIGNS, withZodiacBuff, zodiacOf } from './zodiac.js';
import {
  axisMean,
  combinedAxis,
  isFlatProfile,
  isStraightLined,
} from './riasec.js';

describe('soft skill', () => {
  it('có đúng bảy nhóm theo thứ tự khối B', () => {
    expect(SOFT_SKILL_GROUPS.map((g) => g.id)).toEqual([...SOFT_SKILL_IDS]);
  });

  it('tính bậc theo ngưỡng 0 · 500 · 1.500 · 3.000 · 6.000 · 10.000', () => {
    expect(tierOf(0)).toBe(0);
    expect(tierOf(499)).toBe(0);
    expect(tierOf(500)).toBe(1);
    expect(tierOf(3_400)).toBe(3);
    expect(tierOf(6_000)).toBe(4);
    expect(tierOf(10_000)).toBe(5);
  });

  it('bậc không tụt khi điểm giảm', () => {
    expect(keptTier(1_400, 2)).toBe(2);
    expect(tierProgress(1_400, 2).tier).toBe(2);
  });

  it('tiến độ trong bậc đúng như ví dụ "3.400 / Bậc 4 ở 6.000"', () => {
    const p = tierProgress(3_400);
    expect(p.tier).toBe(3);
    expect(p.nextAt).toBe(6_000);
    expect(p.ratio).toBeCloseTo(400 / 3_000);
    expect(tierProgress(10_000)).toEqual({ tier: 5, nextAt: null, ratio: 1 });
  });
});

describe('chòm sao', () => {
  it('mỗi nhóm được 3–4 cung buff (khối F)', () => {
    const count = new Map<string, number>();
    for (const sign of ZODIAC_SIGNS)
      for (const b of sign.buffs) count.set(b, (count.get(b) ?? 0) + 1);
    expect([...count.values()].every((n) => n >= 3 && n <= 4)).toBe(true);
    expect(count.size).toBe(7);
  });

  it('tính đúng cung ở mốc ngày, kể cả Ma Kết vắt qua năm', () => {
    expect(zodiacOf('2008-05-21')?.name).toBe('Song Tử');
    expect(zodiacOf('2008-06-20')?.name).toBe('Song Tử');
    expect(zodiacOf('2008-12-31')?.name).toBe('Ma Kết');
    expect(zodiacOf('2009-01-19')?.name).toBe('Ma Kết');
    expect(zodiacOf('2009-01-20')?.name).toBe('Bảo Bình');
    expect(zodiacOf('2009-03-20')?.name).toBe('Song Ngư');
    expect(zodiacOf('không phải ngày')).toBeNull();
  });

  it('buff chỉ nhân phần dương của nhóm được buff', () => {
    const songTu = zodiacOf('2008-06-01');
    expect(withZodiacBuff(357, 'thich_ung_hoc_hoi', songTu)).toEqual({
      total: 400,
      bonus: 40,
    });
    expect(withZodiacBuff(-300, 'thich_ung_hoc_hoi', songTu)).toEqual({
      total: -300,
      bonus: 0,
    });
    expect(withZodiacBuff(300, 'lanh_dao_kinh_doanh', songTu).bonus).toBe(0);
  });
});

describe('RIASEC', () => {
  it('trung bình các lần chạm, chưa chạm thì null', () => {
    expect(axisMean([3, 2])).toBe(2.5);
    expect(axisMean([])).toBeNull();
  });

  it('gộp tự kể và sau khi thử như ví dụ của khối E', () => {
    // Tìm tòi: S 3,0; T 2,7; n 6 → P 2,78
    expect(combinedAxis(3, 2.7, 6)).toBeCloseTo(2.775, 3);
    // Bỏ qua Get to know me thì S = 2.
    expect(combinedAxis(null, null, 0)).toBe(2);
  });

  it('nhận ra hồ sơ phẳng và trả lời một mức cho mọi việc', () => {
    expect(isFlatProfile([2, 2, 2, 2, 2.1, 2])).toBe(true);
    expect(isFlatProfile([1.8, 2.78, 2.68, 1.86, 1.9, 2.3])).toBe(false);
    expect(isStraightLined([3, 3, 3])).toBe(true);
    expect(isStraightLined([3])).toBe(false);
  });
});
