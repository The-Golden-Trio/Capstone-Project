import { describe, expect, it } from 'vitest';
import {
  chronological,
  constellationPoints,
  radarValue,
  skillEvidence,
  timeCells,
} from './recordView';
import type { SoftSkillState } from '../../api/types';
const event = (date: string, delta: number) => ({
  runId: date,
  title: 'Ca làm',
  path: 'Nghề › Cấp 1',
  date,
  delta,
  zodiacBonus: 0,
  total: 100,
});
describe('trình bày hồ sơ', () => {
  it('sắp lịch sử mà không sửa nguồn', () => {
    const input = [event('2026-11-16', -20), event('2026-11-15', 100)];
    expect(chronological(input)[0].delta).toBe(100);
    expect(input[0].delta).toBe(-20);
  });
  it('chỉ nhận xét nhóm đủ ba ca và có bằng chứng đúng dấu', () => {
    const skill: SoftSkillState = {
      id: 'giao_tiep_hop_tac',
      points: 100,
      reachedTier: 0,
      scenarios: 2,
      history: [event('2026-11-16', -20)],
    };
    expect(skillEvidence([skill], 'negative')).toEqual([]);
    expect(
      skillEvidence([{ ...skill, scenarios: 3 }], 'negative'),
    ).toHaveLength(1);
    expect(skillEvidence([{ ...skill, scenarios: 3 }], 'positive')).toEqual([]);
  });
  it('giữ phút lẻ và xử lý thời lượng rỗng', () => {
    expect(timeCells(61)).toEqual([30, 30, 1]);
    expect(timeCells(0)).toEqual([]);
    expect(timeCells(-1)).toEqual([]);
  });
});

describe('giá trị trục radar', () => {
  it('đổi tiến độ trong bậc thành phần lẻ', () => {
    expect(radarValue({ points: 3400, reachedTier: 3 })).toBeCloseTo(
      3 + 400 / 3000,
    );
  });
  it('không tụt bậc và không vượt bậc tối đa', () => {
    expect(radarValue({ points: 1400, reachedTier: 2 })).toBe(2);
    expect(radarValue({ points: 10000, reachedTier: 5 })).toBe(5);
    expect(radarValue({ points: 0, reachedTier: 0 })).toBe(0);
  });
});

describe('cụm sao nghề', () => {
  it('mỗi nghề có một điểm nằm trong vùng vẽ', () => {
    const points = constellationPoints(50);
    expect(points).toHaveLength(50);
    expect(new Set(points.map((point) => point.join(','))).size).toBe(50);
    expect(
      points.every(([x, y]) => x >= 20 && x <= 200 && y >= 24 && y <= 136),
    ).toBe(true);
    expect(constellationPoints(50)).toEqual(points);
    expect(constellationPoints(0)).toEqual([]);
  });
});
