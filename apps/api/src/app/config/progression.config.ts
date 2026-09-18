/**
 * Hằng số tunable của hệ thống tích luỹ skill + graph nghề nghiệp.
 * Toàn bộ "magic number" của plan (mục 1.3 và 2.2) nằm ở đây — không rải ra service.
 */
export const PROGRESSION = {
  /** XP cho 1 evidence đạt mốc "+2" (không dùng hint). */
  BASE_XP: 10,
  /** Mốc "0" vẫn được thưởng 1 phần vì có thử: xp = BASE_XP * ZERO_ANCHOR_RATIO. */
  ZERO_ANCHOR_RATIO: 0.3,
  /** level = floor(sqrt(xp / LEVEL_K)) — đường cong tăng dần đều. */
  LEVEL_K: 25,

  /** fuel cần để bay 1 cạnh = edge.distance * FUEL_SCALE (so với TỔNG XP mọi skill). */
  FUEL_SCALE: 100,
  /** Mọi skill trong edge.requiredSkills phải có level >= ngưỡng này mới mở khoá. */
  REQUIRED_SKILL_MIN_LEVEL: 1,
  /**
   * PROGRESSES_TO là cạnh có hướng về mặt ngữ nghĩa. false = vẫn cho bay 2 chiều
   * (adjacency thuần "cạnh chạm current node" như plan 2.2); true = chỉ bay theo chiều mũi tên.
   */
  PROGRESSES_TO_DIRECTED: false,
} as const;

/** Dev user tạm — thay bằng auth thật sau (plan: hardcode 1 user). */
export const DEV_USER = {
  userId: 'dev-user-1',
  displayName: 'Dev User',
  /** Node xuất phát mặc định trên graph (role có nhiều dữ liệu nhất, ví dụ xuyên suốt spec). */
  startRoleCode: 'SWE_FRONTEND',
} as const;
