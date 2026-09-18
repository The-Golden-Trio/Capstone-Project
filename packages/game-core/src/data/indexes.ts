/**
 * Các bảng tra suy ra từ dataset, tính một lần.
 *
 * Bản prototype tính lại những thứ này trong mỗi lần render (`ROLE()` quét
 * mảng, `EDGES` dựng lại IIFE). Ở đây tính một lần rồi tra bằng Map.
 */
import { GAME } from './gameData.js';
import type { GameEvent, Role, Scenario, SkillType } from './schema.js';

const roleMap = new Map<string, Role>(GAME.roles.map((r) => [r.role_code, r]));

/** Nghề chơi được (trong nhóm đang mở). `undefined` nếu ngoài vùng bản đồ. */
export const findRole = (roleCode: string | null | undefined): Role | undefined =>
  roleCode ? roleMap.get(roleCode) : undefined;

/** Tên tiếng Việt của bất kỳ nghề nào, kể cả nghề chưa chơi được. */
export const roleName = (roleCode: string): string =>
  roleMap.get(roleCode)?.role_name_vn ??
  GAME.all_roles[roleCode]?.name_vn ??
  roleCode;

export interface ScenarioEntry {
  key: string;
  scenario: Scenario;
}

const scenarioByRoleBand = new Map<string, ScenarioEntry>(
  Object.entries(GAME.scenarios).map(([key, scenario]) => [
    `${scenario.job.role_code}:${scenario.job.band}`,
    { key, scenario },
  ]),
);

/** Kịch bản sâu ("nhiệm vụ chính") của một (nghề, cấp bậc), nếu đã dựng. */
export const findScenario = (
  roleCode: string,
  band: string,
): ScenarioEntry | undefined => scenarioByRoleBand.get(`${roleCode}:${band}`);

export const hasScenario = (roleCode: string, band: string): boolean =>
  scenarioByRoleBand.has(`${roleCode}:${band}`);

export const findScenarioByKey = (key: string): ScenarioEntry | undefined => {
  const scenario = GAME.scenarios[key];
  return scenario ? { key, scenario } : undefined;
};

/** Sự kiện phụ khả dụng tại một nghề: riêng của nghề + dùng chung. */
export const eventsForRole = (role: Role): GameEvent[] => [
  ...role.events,
  ...GAME.shared_events,
];

export const findEvent = (
  role: Role,
  eventId: string,
): GameEvent | undefined =>
  eventsForRole(role).find((e) => e.event_id === eventId);

/* ── Kỹ năng cứng / mềm ────────────────────────────────────────────── */

/**
 * Tên kỹ năng -> loại, gom từ mọi mốc quan sát trong mọi kịch bản.
 *
 * Bằng chứng đã lưu chỉ mang tên kỹ năng; loại của nó tra ở đây thay vì lưu
 * kèm — dataset là nguồn duy nhất nói "Git là kỹ năng cứng", nên hồ sơ cũ
 * không bao giờ lệch với dataset mới.
 */
const skillTypeMap = new Map<string, SkillType>();
for (const scenario of Object.values(GAME.scenarios)) {
  for (const activity of scenario.activities) {
    for (const observe of activity.observes) {
      skillTypeMap.set(observe.skill, observe.skill_type);
    }
  }
}

/** Kỹ năng này cứng hay mềm. Tên lạ (dataset đã đổi tên) coi là mềm. */
export const skillTypeOf = (skill: string): SkillType =>
  skillTypeMap.get(skill) ?? 'soft';

/* ── Chòm sao: cạnh nối giữa các hành tinh ─────────────────────────── */

export type EdgeKind = 'sim' | 'up';

export interface ConstellationEdge {
  a: string;
  b: string;
  kind: EdgeKind;
}

/**
 * Chỉ giữ cạnh có cả hai đầu nằm trong nhóm đang mở.
 * `progresses_to` (đi lên thành) mạnh hơn `similar` nên thắng khi trùng cặp.
 */
export const CONSTELLATION_EDGES: ConstellationEdge[] = (() => {
  const edges = new Map<string, ConstellationEdge>();

  const put = (from: string, to: string, kind: EdgeKind) => {
    if (from === to || !roleMap.has(to)) return;
    const [a, b] = [from, to].sort();
    const key = `${a}|${b}`;
    if (!edges.has(key) || kind === 'up') edges.set(key, { a, b, kind });
  };

  for (const role of GAME.roles) {
    for (const similar of role.similar_ranked)
      put(role.role_code, similar.role_code, 'sim');
    for (const next of role.progresses_to) put(role.role_code, next, 'up');
  }

  return [...edges.values()];
})();
