import catalogue from '../../api/demo/fixtures/catalogue.json';
import type { Catalogue } from '../../api/types';
import { foldVi, layoutGalaxy } from './layout';

const data = catalogue as unknown as Catalogue;

describe('bố cục bản đồ ngân hà', () => {
  const layout = layoutGalaxy(data);

  it('đặt đủ mọi nghề, mỗi nghề một lần', () => {
    expect(layout.occupations).toHaveLength(data.occupations.length);
    const codes = new Set(layout.occupations.map((o) => o.occupation.code));
    expect(codes.size).toBe(data.occupations.length);
  });

  it('có đủ 6 vùng và mọi nhóm nghề', () => {
    expect(layout.regions).toHaveLength(6);
    expect(layout.groups).toHaveLength(
      new Set(data.occupations.map((o) => o.group)).size,
    );
  });

  it('tất định: cùng danh mục thì cùng toạ độ', () => {
    const again = layoutGalaxy(data);
    expect(again.occupations.map((o) => [o.x, o.y])).toEqual(
      layout.occupations.map((o) => [o.x, o.y]),
    );
  });

  it('các nhóm không chồng lên nhau', () => {
    const g = layout.groups;
    for (let i = 0; i < g.length; i++)
      for (let j = i + 1; j < g.length; j++) {
        const d = Math.hypot(g[i].x - g[j].x, g[i].y - g[j].y);
        expect(d).toBeGreaterThan(g[i].radius + g[j].radius);
      }
  });

  it('tìm nghề không cần gõ dấu', () => {
    expect(foldVi('Điều dưỡng')).toBe('dieu duong');
    expect(foldVi('Lập trình viên Back-end')).toContain('lap trinh');
  });
});
