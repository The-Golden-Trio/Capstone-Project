/**
 * "Dải ngân hà nghề nghiệp" — dữ liệu và các bảng tra cho bản đồ 3D.
 *
 * Mỗi nghề là một hành tinh, mỗi nhóm nghề là một hệ sao có mặt trời riêng.
 * Hành tinh càng gần nhau thì nghề càng giống nhau (SIMILAR) hoặc là bước
 * thăng tiến của nhau (PROGRESSES_TO) — vị trí đã tính sẵn ở
 * `docs/data/build-galaxy.mjs`, ở đây chỉ đọc.
 *
 * Kiểm ở biên bằng Zod như `gameData.ts`: dữ liệu sinh tự động đổi hình thì
 * biết ngay lúc khởi động, không phải `undefined` nổ trong shader.
 */
import { z } from 'zod';
import { findRole } from '@datn/game-core';
import { RAW_GALAXY_DATA } from './galaxy-data';

const Vec3Schema = z.tuple([z.number(), z.number(), z.number()]);

export const PlanetKindSchema = z.enum([
  'terra',
  'ice',
  'desert',
  'lava',
  'cloud',
  'gas',
  'pastel',
]);

const GroupSchema = z.object({
  name: z.string(),
  short: z.string(),
  label: z.string(),
  color: z.string(),
  /** Tâm hệ mặt trời — mặt trời đặt ở đây. */
  sun: Vec3Schema,
  /** Mặt phẳng quỹ đạo nghiêng: [quanh trục X, quanh trục Z], radian. */
  tilt: z.tuple([z.number(), z.number()]),
  /** Bán kính các vòng quỹ đạo có hành tinh, tính từ mặt trời. */
  orbits: z.array(z.number()),
});

const EntryEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  setup: z.string(),
  choices: z.array(z.object({ text: z.string(), outcome: z.string() })).min(2),
});

const NodeSchema = z.object({
  roleCode: z.string(),
  nameVn: z.string(),
  nameEn: z.string().nullable(),
  group: z.string(),
  bands: z.string(),
  bandStart: z.string(),
  bandEnd: z.string(),
  experience: z.string().nullable(),
  hardSkills: z.array(z.string()),
  hardSkillSource: z.enum(['dataset_merged', 'itviec_report']).nullable(),
  softSkills: z.array(z.string()),
  events: z.array(EntryEventSchema),
  position: Vec3Schema,
  /** Vòng quỹ đạo (0 = sát mặt trời = nghề vào từ L1–L2; xa hơn = senior hơn). */
  orbit: z.number().int().min(0),
  look: z.object({
    kind: PlanetKindSchema,
    seed: z.number(),
    radius: z.number(),
    ring: z.boolean(),
    moons: z.number().int().min(0).max(2),
    tilt: z.number(),
    spin: z.number(),
  }),
});

export const EdgeTypeSchema = z.enum(['SIMILAR', 'PROGRESSES_TO']);

const EdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: EdgeTypeSchema,
  /** 0 = giống hệt … 1 = khác hẳn. Quyết định độ dài cạnh và "nhiên liệu". */
  distance: z.number().min(0).max(1),
  why: z.string().nullable(),
  sharedSkills: z.array(z.string()),
});

const GalaxySchema = z.object({
  groups: z.array(GroupSchema).min(1),
  nodes: z.array(NodeSchema).min(1),
  edges: z.array(EdgeSchema),
});

export type PlanetKind = z.infer<typeof PlanetKindSchema>;
export type GalaxyGroup = z.infer<typeof GroupSchema>;
export type GalaxyNode = z.infer<typeof NodeSchema>;
export type GalaxyEdge = z.infer<typeof EdgeSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;
export type EntryEvent = z.infer<typeof EntryEventSchema>;

export const GALAXY = GalaxySchema.parse(RAW_GALAXY_DATA);

/* ── Hệ mặt trời ──────────────────────────────────────────────────────── */

/**
 * Toạ độ cục bộ trong mặt phẳng quỹ đạo của một hệ → toạ độ thế giới.
 * Xoay quanh Z rồi quanh X, cộng tâm hệ — PHẢI trùng với `rotX(rotZ(...))`
 * trong `docs/data/build-galaxy.mjs`, vì vị trí hành tinh đã tính sẵn ở đó
 * còn vòng quỹ đạo thì vẽ lúc chạy; lệch nhau là hành tinh trượt khỏi vòng.
 */
export function systemToWorld(group: GalaxyGroup, local: [number, number, number]): [number, number, number] {
  const [rx, rz] = group.tilt;
  const [x0, y0, z0] = local;
  const x1 = x0 * Math.cos(rz) - y0 * Math.sin(rz);
  const y1 = x0 * Math.sin(rz) + y0 * Math.cos(rz);
  const z1 = z0;
  const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
  return [group.sun[0] + x1, group.sun[1] + y2, group.sun[2] + z2];
}

/** Điểm trên vòng quỹ đạo bán kính `radius` của một hệ, để vẽ vòng. */
export function orbitPoints(group: GalaxyGroup, radius: number, segments = 128): [number, number, number][] {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return systemToWorld(group, [Math.cos(a) * radius, 0, Math.sin(a) * radius]);
  });
}

/* ── Bảng tra ─────────────────────────────────────────────────────────── */

const nodeMap = new Map(GALAXY.nodes.map((n) => [n.roleCode, n]));
const groupMap = new Map(GALAXY.groups.map((g) => [g.short, g]));

export const findPlanet = (roleCode: string | null | undefined): GalaxyNode | undefined =>
  roleCode ? nodeMap.get(roleCode) : undefined;

export const groupOf = (node: GalaxyNode): GalaxyGroup => {
  const group = groupMap.get(node.group);
  if (!group) throw new Error(`Hành tinh ${node.roleCode} thuộc hệ sao lạ: ${node.group}`);
  return group;
};

export const colorOf = (node: GalaxyNode): string => groupOf(node).color;

/** Cạnh chạm một hành tinh, bất kể chiều. */
const edgesByNode = new Map<string, GalaxyEdge[]>();
for (const edge of GALAXY.edges) {
  for (const end of [edge.from, edge.to]) {
    const list = edgesByNode.get(end) ?? [];
    list.push(edge);
    edgesByNode.set(end, list);
  }
}
export const edgesOf = (roleCode: string): GalaxyEdge[] => edgesByNode.get(roleCode) ?? [];

/** Đầu kia của cạnh nhìn từ `roleCode`. */
export const otherEnd = (edge: GalaxyEdge, roleCode: string): string =>
  edge.from === roleCode ? edge.to : edge.from;

/**
 * Cạnh nối hai hành tinh, nếu có. Hai nghề có thể vừa SIMILAR vừa PROGRESSES_TO
 * (UI/UX ↔ Quản lý sản phẩm) — lấy cạnh ngắn hơn làm đại diện, cùng luật với
 * `neighborsOf` để panel và dock không nói hai khoảng cách khác nhau.
 *
 * SIMILAR không có chiều; PROGRESSES_TO có chiều nhưng ở bản đồ vẫn bay được
 * cả hai chiều — đi "xuống" một bậc là chuyện bình thường khi thử nghề.
 */
export const edgeBetween = (a: string, b: string): GalaxyEdge | undefined =>
  edgesOf(a)
    .filter((e) => otherEnd(e, a) === b)
    .sort((x, y) => x.distance - y.distance)[0];

export interface Neighbor {
  node: GalaxyNode;
  edge: GalaxyEdge;
  /** Nghề này là bậc tiếp theo của nghề hiện tại (không phải chiều ngược lại). */
  isPromotion: boolean;
}

/** Hành tinh kề (1 bước bay), mỗi hành tinh một dòng, gần trước xa sau. */
export function neighborsOf(roleCode: string): Neighbor[] {
  const byCode = new Map<string, Neighbor>();
  for (const edge of edgesOf(roleCode)) {
    const code = otherEnd(edge, roleCode);
    const node = nodeMap.get(code);
    if (!node) continue;
    const promotion = edge.type === 'PROGRESSES_TO' && edge.from === roleCode;
    const seen = byCode.get(code);
    if (!seen) byCode.set(code, { node, edge, isPromotion: promotion });
    else {
      if (edge.distance < seen.edge.distance) seen.edge = edge;
      seen.isPromotion = seen.isPromotion || promotion;
    }
  }
  return [...byCode.values()].sort((x, y) => x.edge.distance - y.edge.distance);
}

/* ── Chơi được không ──────────────────────────────────────────────────── */

/** Nghề đã dựng trong `@datn/game-core` thì bấm "Trải nghiệm" là vào chơi được. */
export const isPlayable = (roleCode: string): boolean => findRole(roleCode) !== undefined;

/** Đường vào màn chơi của một hành tinh, hoặc `null` nếu chưa dựng. */
export const playPath = (node: GalaxyNode): string | null => {
  const role = findRole(node.roleCode);
  return role ? `/jobs/${role.role_code}/${role.band_start}` : null;
};

/**
 * "Lập trình viên Back-end / Kỹ sư Back-end" → "Lập trình viên Back-end".
 * Chỉ cắt ở " / " có khoảng trắng — "UI/UX" là một chữ, không phải hai tên.
 */
export const shortPlanetName = (node: GalaxyNode): string => node.nameVn.split(' / ')[0].trim();

/**
 * Khoảng cách hiển thị, tính bằng "năm ánh sáng" — thuần trang trí, tỉ lệ
 * thuận với `distance` để người chơi cảm được xa/gần thay vì đọc số 0.385.
 */
export const lightYears = (distance: number): string => (distance * 12).toFixed(1);

/** Hành tinh mặc định khi chưa từng bay đâu — nghề dễ hình dung nhất với học sinh. */
export const HOME_PLANET = 'SWE_FRONTEND';

/* ── Lộ trình ─────────────────────────────────────────────────────────── */

/**
 * Chuỗi hành tinh ngắn nhất (tính theo số chặng) từ `from` tới `to`, kể cả
 * hai đầu. Rỗng nếu không tới được. Dùng để gợi ý "bay qua đâu trước" khi
 * người chơi chọn một hành tinh không kề.
 */
export function shortestPath(from: string, to: string): string[] {
  if (from === to) return [from];
  const prev = new Map<string, string | null>([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const here = queue.shift() as string;
    for (const edge of edgesOf(here)) {
      const next = otherEnd(edge, here);
      if (prev.has(next)) continue;
      prev.set(next, here);
      if (next === to) {
        const path = [to];
        let cursor: string | null = here;
        while (cursor) {
          path.unshift(cursor);
          cursor = prev.get(cursor) ?? null;
        }
        return path;
      }
      queue.push(next);
    }
  }
  return [];
}
