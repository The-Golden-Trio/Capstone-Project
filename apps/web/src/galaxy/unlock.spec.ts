import { describe, expect, it } from 'vitest';
import { galaxyData, findPlanet, edgeBetween } from './galaxy';
import { computeUnlock, hasSkill, normalizeSkill, ownedSkillSet } from './unlock';
import { loadGalaxyFixture } from './galaxy.fixture';

loadGalaxyFixture();

describe('normalizeSkill', () => {
  it('bỏ dấu, hạ chữ, bỏ phần trong ngoặc', () => {
    expect(normalizeSkill('SQL (MySQL/PostgreSQL)')).toBe('sql');
    expect(normalizeSkill('Giao tiếp rõ ràng')).toBe('giao tiep ro rang');
    expect(normalizeSkill('  HTML/CSS ')).toBe('html/css');
  });
});

describe('hasSkill', () => {
  const owned = ownedSkillSet(['React', 'Giao tiếp rõ ràng', 'SQL', 'C#']);

  it('khớp chính xác sau chuẩn hoá', () => {
    expect(hasSkill(owned, 'giao tiep ro rang')).toBe(true);
    expect(hasSkill(owned, 'SQL (Basic)')).toBe(true);
  });

  it('một trong các lựa chọn ghép là đủ', () => {
    expect(hasSkill(owned, 'ReactJS hoặc Vue.js')).toBe(true);
    expect(hasSkill(owned, 'Swift/Kotlin')).toBe(false);
  });

  it('không khớp bừa theo tiền tố ngắn', () => {
    // có "C#" không có nghĩa là có "CSS" hay "C++"
    expect(hasSkill(owned, 'CSS')).toBe(false);
    expect(hasSkill(owned, 'C++')).toBe(false);
  });
});

describe('computeUnlock', () => {
  const frontend = findPlanet('SWE_FRONTEND')!;
  const mobile = findPlanet('SWE_MOBILE')!;
  const edge = edgeBetween('SWE_FRONTEND', 'SWE_MOBILE');

  it('thiếu kỹ năng thì khoá, liệt kê đúng thứ thiếu', () => {
    const state = computeUnlock(mobile, ownedSkillSet([]), edge);
    expect(state.unlocked).toBe(false);
    expect(state.noData).toBe(false);
    expect(state.missing.length).toBe(mobile.hardSkills.length + mobile.softSkills.length);
  });

  it('có đủ mọi kỹ năng cứng + mềm thì mở', () => {
    const state = computeUnlock(mobile, ownedSkillSet([...mobile.hardSkills, ...mobile.softSkills]), edge);
    expect(state.unlocked).toBe(true);
    expect(state.missing).toEqual([]);
  });

  it('nghề không có dữ liệu kỹ năng thì mở sẵn và báo noData', () => {
    const uiux = findPlanet('SWE_UIUX')!;
    const state = computeUnlock(uiux, ownedSkillSet([]), edgeBetween('SWE_FRONTEND', 'SWE_UIUX'));
    expect(state.noData).toBe(true);
    expect(state.unlocked).toBe(true);
  });

  it('nhiên liệu cần tỉ lệ với khoảng cách cạnh', () => {
    const state = computeUnlock(frontend, ownedSkillSet([]), edge);
    expect(state.fuelNeeded).toBe(Math.round(edge!.distance * 100));
  });
});

describe('dữ liệu ngân hà', () => {
  it('có đủ 22 hành tinh, cạnh nào cũng nối hai hành tinh có thật', () => {
    expect(galaxyData().nodes).toHaveLength(22);
    const codes = new Set(galaxyData().nodes.map((n) => n.roleCode));
    for (const e of galaxyData().edges) {
      expect(codes.has(e.from)).toBe(true);
      expect(codes.has(e.to)).toBe(true);
    }
  });

  it('không hành tinh nào chồng lên nhau', () => {
    for (let i = 0; i < galaxyData().nodes.length; i++)
      for (let j = i + 1; j < galaxyData().nodes.length; j++) {
        const a = galaxyData().nodes[i];
        const b = galaxyData().nodes[j];
        const d = Math.hypot(
          a.position[0] - b.position[0],
          a.position[1] - b.position[1],
          a.position[2] - b.position[2],
        );
        expect(d).toBeGreaterThan(a.look.radius + b.look.radius + 10);
      }
  });
});
