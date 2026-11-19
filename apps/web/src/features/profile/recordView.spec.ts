import { describe, expect, it } from 'vitest';
import {
  chronological,
  skillTimeline,
  historySummary,
  keywordDepth,
  riasecDifference,
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

describe('shared profile charts', () => {
  it('aligns by run ID, carries observed totals, and leaves unknown beginnings empty', () => {
    const first: SoftSkillState = {
      id: 'giao_tiep_hop_tac',
      points: 100,
      reachedTier: 0,
      scenarios: 1,
      history: [event('2026-11-15', 100)],
    };
    const second: SoftSkillState = {
      ...first,
      id: 'thich_ung_hoc_hoi',
      history: [event('2026-11-16', -20)],
    };
    const result = skillTimeline(
      [second, first],
      [{ runId: '2026-11-15', index: 7 }],
    );
    expect(result.runs.map((run) => run.index)).toEqual([7, 2]);
    expect(
      result.series.find((group) => group.id === first.id)?.points,
    ).toEqual([100, 100]);
    expect(
      result.series.find((group) => group.id === second.id)?.points,
    ).toEqual([null, 100]);
    expect(result.series).toHaveLength(7);
    expect(second.history).toHaveLength(1);
  });
  it('summarizes observed positive and negative runs only after three observations', () => {
    const skill: SoftSkillState = {
      id: 'giao_tiep_hop_tac',
      points: 100,
      reachedTier: 0,
      scenarios: 3,
      history: [
        event('2026-11-15', 100),
        event('2026-11-16', -20),
        event('2026-11-17', 40),
      ],
    };
    expect(historySummary([skill])).toEqual({
      count: 3,
      positive: { id: skill.id, count: 2 },
      negative: { id: skill.id, runIds: ['2026-11-16'] },
    });
    expect(
      historySummary([{ ...skill, history: skill.history.slice(0, 2) }])
        .positive,
    ).toBeUndefined();
    expect(historySummary([]).count).toBe(0);
  });
  it('keeps missing RIASEC values distinct from zero change', () => {
    expect(riasecDifference(2, 2.3)).toBe(0.3);
    expect(riasecDifference(2, 1.8)).toBe(-0.2);
    expect(riasecDifference(2, 2)).toBe(0);
    expect(riasecDifference(null, 2)).toBeNull();
    expect(riasecDifference(2, NaN)).toBeNull();
  });
  it('counts keyword levels separately within each recorded group', () => {
    expect(
      keywordDepth([
        { group: 'A', level: 1 },
        { group: 'B', level: 3 },
        { group: 'A', level: 2 },
        { group: 'A', level: 2 },
      ]),
    ).toEqual([
      { group: 'A', counts: [1, 2, 0] },
      { group: 'B', counts: [0, 0, 1] },
    ]);
    expect(keywordDepth([])).toEqual([]);
  });
});
