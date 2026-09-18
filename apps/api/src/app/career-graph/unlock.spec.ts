import { PROGRESSION } from '../config/progression.config';
import type { RoleEdge } from '../shared/domain';
import { checkUnlock, fuelCost, isTraversableFrom, otherEnd } from './unlock';

const edge: RoleEdge = {
  id: 'SIMILAR:SWE_FRONTEND->SWE_MOBILE',
  from: 'SWE_FRONTEND',
  to: 'SWE_MOBILE',
  type: 'SIMILAR',
  distance: 0.615,
  distanceMethod: 'test',
  requiredSkills: ['hard_dart', 'hard_react_native'],
  sharedSkillCount: 2,
  note: null,
};

const src = (levels: Record<string, number>) => ({
  levelOf: (id: string) => levels[id] ?? 0,
  nameOf: (id: string) => id,
});

describe('unlock()', () => {
  it('fuelCost = ceil(distance * FUEL_SCALE)', () => {
    expect(fuelCost(edge)).toBe(Math.ceil(0.615 * PROGRESSION.FUEL_SCALE)); // 62
  });

  it('mở khoá khi đủ fuel và mọi required skill >= REQUIRED_SKILL_MIN_LEVEL', () => {
    const r = checkUnlock(edge, 62, src({ hard_dart: 1, hard_react_native: 2 }));
    expect(r.unlocked).toBe(true);
    expect(r.fuelOk).toBe(true);
    expect(r.skills.every((s) => s.ok)).toBe(true);
  });

  it('thiếu fuel → không mở dù skill đủ', () => {
    const r = checkUnlock(edge, 61, src({ hard_dart: 1, hard_react_native: 1 }));
    expect(r.unlocked).toBe(false);
    expect(r.fuelOk).toBe(false);
  });

  it('thiếu 1 skill → không mở dù fuel dư, báo đúng skill thiếu', () => {
    const r = checkUnlock(edge, 999, src({ hard_dart: 1 }));
    expect(r.unlocked).toBe(false);
    expect(r.fuelOk).toBe(true);
    expect(r.skills.find((s) => s.skillId === 'hard_react_native')).toMatchObject({ haveLevel: 0, needLevel: 1, ok: false });
  });

  it('cạnh không có requiredSkills → chỉ xét fuel', () => {
    const r = checkUnlock({ ...edge, requiredSkills: [] }, 62, src({}));
    expect(r.unlocked).toBe(true);
    expect(r.skills).toEqual([]);
  });

  it('adjacency 1-hop: SIMILAR đi được 2 chiều, cạnh không chạm thì không', () => {
    expect(isTraversableFrom(edge, 'SWE_FRONTEND')).toBe(true);
    expect(isTraversableFrom(edge, 'SWE_MOBILE')).toBe(true);
    expect(isTraversableFrom(edge, 'DATA_DA')).toBe(false);
    expect(otherEnd(edge, 'SWE_FRONTEND')).toBe('SWE_MOBILE');
  });
});
