/**
 * Bố cục bản đồ ngân hà: 6 vùng nghề xếp trên một hình elip, nhóm nghề là
 * các chòm sao quanh tâm vùng, nghề là hành tinh trên các vòng quanh tâm
 * nhóm. Tính tất định từ danh mục, nên cùng danh mục thì cùng bản đồ.
 *
 * Toạ độ là "đơn vị thế giới"; màn hình tự co giãn bằng pan/zoom.
 */
import type { Catalogue, CatalogueOccupation, RegionId } from '../../api/types';

export interface PlacedOccupation {
  occupation: CatalogueOccupation;
  x: number;
  y: number;
  r: number;
}

export interface PlacedGroup {
  name: string;
  regionId: RegionId;
  x: number;
  y: number;
  /** Bán kính bao quanh các hành tinh của nhóm. */
  radius: number;
  members: PlacedOccupation[];
}

export interface PlacedRegion {
  id: RegionId;
  name: string;
  x: number;
  y: number;
  radius: number;
}

export interface GalaxyLayout {
  regions: PlacedRegion[];
  groups: PlacedGroup[];
  occupations: PlacedOccupation[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

/** Thứ tự vùng quanh vòng, để vùng gần nhau về tính chất nằm cạnh nhau. */
const REGION_ORDER: RegionId[] = [
  'cong_nghe',
  'ky_thuat',
  'dich_vu',
  'suc_khoe',
  'sang_tao',
  'kinh_doanh',
];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Hành tinh to theo số cấp của nghề: nghề dài đường hơn thì to hơn chút. */
export const planetRadius = (levels: number) => 7 + Math.min(levels, 9) * 0.9;

/** Đặt `n` hành tinh trên các vòng đồng tâm quanh (0,0); trả cả bán kính bao. */
function ringPositions(n: number): {
  points: Array<{ x: number; y: number }>;
  radius: number;
} {
  const points: Array<{ x: number; y: number }> = [];
  if (n === 1) return { points: [{ x: 0, y: 0 }], radius: 26 };
  let ring = 0;
  let placed = 0;
  let radius = 0;
  while (placed < n) {
    radius = 34 + ring * 40;
    const capacity = Math.max(5, Math.floor((2 * Math.PI * radius) / 40));
    const count = Math.min(capacity, n - placed);
    const offset = ring * 0.7;
    for (let i = 0; i < count; i++) {
      const a = offset + (i / count) * Math.PI * 2;
      points.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
    }
    placed += count;
    ring++;
  }
  return { points, radius: radius + 22 };
}

export function layoutGalaxy(catalogue: Catalogue): GalaxyLayout {
  const byGroup = new Map<string, CatalogueOccupation[]>();
  for (const o of catalogue.occupations) {
    const list = byGroup.get(o.group) ?? [];
    list.push(o);
    byGroup.set(o.group, list);
  }
  for (const list of byGroup.values())
    list.sort((a, b) => a.code.localeCompare(b.code));

  const order = [
    ...REGION_ORDER.filter((id) => catalogue.regions.some((r) => r.id === id)),
    ...catalogue.regions
      .map((r) => r.id)
      .filter((id) => !REGION_ORDER.includes(id)),
  ];

  const regions: PlacedRegion[] = [];
  const groups: PlacedGroup[] = [];
  const occupations: PlacedOccupation[] = [];

  order.forEach((regionId, ri) => {
    const region = catalogue.regions.find((r) => r.id === regionId);
    if (!region) return;
    const angle = -Math.PI / 2 + (ri / order.length) * Math.PI * 2;
    const cx = Math.cos(angle) * 820;
    const cy = Math.sin(angle) * 560;

    const regionGroups = catalogue.groups
      .filter((g) => g.regionId === regionId && byGroup.has(g.name))
      .sort(
        (a, b) =>
          (byGroup.get(b.name)?.length ?? 0) -
          (byGroup.get(a.name)?.length ?? 0),
      );

    // Nhóm lớn nhất ở tâm vùng, các nhóm sau xoắn ốc ra ngoài.
    let extent = 0;
    regionGroups.forEach((g, gi) => {
      const members = byGroup.get(g.name) ?? [];
      const { points, radius } = ringPositions(members.length);
      const dist = gi === 0 ? 0 : 120 + Math.sqrt(gi) * 150;
      const ga = angle + gi * GOLDEN_ANGLE * 1.6;
      const gx = cx + Math.cos(ga) * dist;
      const gy = cy + Math.sin(ga) * dist;
      const placed = members.map((occupation, i) => ({
        occupation,
        x: gx + points[i].x,
        y: gy + points[i].y,
        r: planetRadius(occupation.levelCount),
      }));
      groups.push({
        name: g.name,
        regionId,
        x: gx,
        y: gy,
        radius,
        members: placed,
      });
      occupations.push(...placed);
      extent = Math.max(extent, dist + radius);
    });
    regions.push({
      id: regionId,
      name: region.name,
      x: cx,
      y: cy,
      radius: extent + 40,
    });
  });

  relax(groups);

  // Tính lại vị trí hành tinh và vùng sau khi đẩy nhóm ra cho khỏi chồng.
  occupations.length = 0;
  for (const g of groups) occupations.push(...g.members);
  for (const r of regions) {
    const own = groups.filter((g) => g.regionId === r.id);
    const mx = own.reduce((s, g) => s + g.x, 0) / own.length;
    const my = own.reduce((s, g) => s + g.y, 0) / own.length;
    r.x = mx;
    r.y = my;
    r.radius =
      Math.max(...own.map((g) => Math.hypot(g.x - mx, g.y - my) + g.radius)) +
      30;
  }

  const xs = occupations.map((o) => o.x);
  const ys = occupations.map((o) => o.y);
  return {
    regions,
    groups,
    occupations,
    bounds: {
      minX: Math.min(...xs) - 80,
      minY: Math.min(...ys) - 80,
      maxX: Math.max(...xs) + 80,
      maxY: Math.max(...ys) + 80,
    },
  };
}

/** Đẩy các nhóm chồng nhau ra xa, vài vòng lặp là đủ cho 23 nhóm. */
function relax(groups: PlacedGroup[]) {
  for (let iter = 0; iter < 80; iter++) {
    let moved = false;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i];
        const b = groups[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = a.radius + b.radius + 24;
        if (d < min) {
          const push = (min - d) / 2;
          const ux = dx / d;
          const uy = dy / d;
          shift(a, -ux * push, -uy * push);
          shift(b, ux * push, uy * push);
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function shift(g: PlacedGroup, dx: number, dy: number) {
  g.x += dx;
  g.y += dy;
  for (const m of g.members) {
    m.x += dx;
    m.y += dy;
  }
}

/** Bỏ dấu, hạ chữ thường để tìm nghề không cần gõ dấu. */
export function foldVi(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}
