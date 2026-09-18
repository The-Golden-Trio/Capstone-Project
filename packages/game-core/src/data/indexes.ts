/**
 * Các bảng tra suy ra từ một bộ dữ liệu, tính một lần.
 *
 * Bản prototype tính lại những thứ này trong mỗi lần render (`ROLE()` quét
 * mảng, `EDGES` dựng lại IIFE). Ở đây tính một lần rồi tra bằng Map.
 *
 * Trước đây các hàm ở file này đóng kín quanh một `GAME` duy nhất nạp lúc khởi
 * động. Giờ dữ liệu về database nên mỗi bộ dữ liệu cần một bảng tra riêng:
 * máy chủ dựng từ hàng trong DB, máy khách dựng từ thứ API trả về, và test
 * dựng từ một bộ mẫu. `createGameIndex` là chỗ duy nhất biết cách dựng.
 */
import type {
  GameData,
  GameEvent,
  Role,
  Scenario,
  SkillType,
} from './schema.js';

export interface ScenarioEntry {
  key: string;
  scenario: Scenario;
}

export type EdgeKind = 'sim' | 'up';

export interface ConstellationEdge {
  a: string;
  b: string;
  kind: EdgeKind;
}

export interface GameIndex {
  /** Bộ dữ liệu đã dựng nên bảng tra này. */
  readonly data: GameData;
  /** Khoá của các chiều fit, theo đúng thứ tự trong dữ liệu. */
  readonly dimensions: readonly string[];
  /** Cạnh nối giữa các hành tinh trong chòm sao. */
  readonly constellationEdges: readonly ConstellationEdge[];

  /** Nghề chơi được (trong nhóm đang mở). `undefined` nếu ngoài vùng bản đồ. */
  findRole(roleCode: string | null | undefined): Role | undefined;
  /** Tên tiếng Việt của bất kỳ nghề nào, kể cả nghề chưa chơi được. */
  roleName(roleCode: string): string;
  /** Kịch bản sâu ("nhiệm vụ chính") của một (nghề, cấp bậc), nếu đã dựng. */
  findScenario(roleCode: string, band: string): ScenarioEntry | undefined;
  hasScenario(roleCode: string, band: string): boolean;
  findScenarioByKey(key: string): ScenarioEntry | undefined;
  /** Sự kiện phụ khả dụng tại một nghề: riêng của nghề + dùng chung. */
  eventsForRole(role: Role): GameEvent[];
  findEvent(role: Role, eventId: string): GameEvent | undefined;
  /** Kỹ năng này cứng hay mềm. Tên lạ (dữ liệu đã đổi tên) coi là mềm. */
  skillTypeOf(skill: string): SkillType;
}

export function createGameIndex(data: GameData): GameIndex {
  const roleMap = new Map<string, Role>(
    data.roles.map((r) => [r.role_code, r]),
  );

  const scenarioByRoleBand = new Map<string, ScenarioEntry>(
    Object.entries(data.scenarios).map(([key, scenario]) => [
      `${scenario.job.role_code}:${scenario.job.band}`,
      { key, scenario },
    ]),
  );

  const eventsByRole = new Map<string, GameEvent[]>();
  const eventsForRole = (role: Role): GameEvent[] => {
    const cached = eventsByRole.get(role.role_code);
    if (cached) return cached;
    const list = [...role.events, ...data.shared_events];
    eventsByRole.set(role.role_code, list);
    return list;
  };

  /**
   * Tên kỹ năng -> loại, gom từ mọi mốc quan sát trong mọi kịch bản.
   *
   * Bằng chứng đã lưu chỉ mang tên kỹ năng; loại của nó tra ở đây thay vì lưu
   * kèm — bộ dữ liệu là nguồn duy nhất nói "Git là kỹ năng cứng", nên hồ sơ cũ
   * không bao giờ lệch với bộ dữ liệu mới.
   */
  const skillTypeMap = new Map<string, SkillType>();
  for (const scenario of Object.values(data.scenarios)) {
    for (const activity of scenario.activities) {
      for (const observe of activity.observes) {
        skillTypeMap.set(observe.skill, observe.skill_type);
      }
    }
  }

  return {
    data,
    dimensions: Object.keys(data.fit_dimensions),
    constellationEdges: buildEdges(data, roleMap),

    findRole: (roleCode) => (roleCode ? roleMap.get(roleCode) : undefined),

    roleName: (roleCode) =>
      roleMap.get(roleCode)?.role_name_vn ??
      data.all_roles[roleCode]?.name_vn ??
      roleCode,

    findScenario: (roleCode, band) =>
      scenarioByRoleBand.get(`${roleCode}:${band}`),

    hasScenario: (roleCode, band) =>
      scenarioByRoleBand.has(`${roleCode}:${band}`),

    findScenarioByKey: (key) => {
      const scenario = data.scenarios[key];
      return scenario ? { key, scenario } : undefined;
    },

    eventsForRole,

    findEvent: (role, eventId) =>
      eventsForRole(role).find((e) => e.event_id === eventId),

    skillTypeOf: (skill) => skillTypeMap.get(skill) ?? 'soft',
  };
}

/**
 * Chỉ giữ cạnh có cả hai đầu nằm trong nhóm đang mở.
 * `progresses_to` (đi lên thành) mạnh hơn `similar` nên thắng khi trùng cặp.
 */
function buildEdges(
  data: GameData,
  roleMap: Map<string, Role>,
): ConstellationEdge[] {
  const edges = new Map<string, ConstellationEdge>();

  const put = (from: string, to: string, kind: EdgeKind) => {
    if (from === to || !roleMap.has(to)) return;
    const [a, b] = [from, to].sort();
    const key = `${a}|${b}`;
    if (!edges.has(key) || kind === 'up') edges.set(key, { a, b, kind });
  };

  for (const role of data.roles) {
    for (const similar of role.similar_ranked)
      put(role.role_code, similar.role_code, 'sim');
    for (const next of role.progresses_to) put(role.role_code, next, 'up');
  }

  return [...edges.values()];
}
