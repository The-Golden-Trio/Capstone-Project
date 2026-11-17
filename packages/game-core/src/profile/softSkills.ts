/**
 * Soft skill bảy nhóm, bậc 0–5 (Hồ sơ JobQuest cơ chế game, khối B, D, G).
 *
 * Mã nhóm trùng khoá trong `occupation-data/generated/point_budgets.json`.
 * Ngưỡng bậc là số tạm của D1, chỉnh sau khi chơi thử; mọi nơi đọc ngưỡng
 * từ đây để chỉnh một chỗ.
 */

export const SOFT_SKILL_IDS = [
  'giao_tiep_hop_tac',
  'tri_tue_cam_xuc',
  'lanh_dao_kinh_doanh',
  'tu_duy_giai_quyet_van_de',
  'tu_quan_ly_ap_luc',
  'thich_ung_hoc_hoi',
  'dao_duc_chuyen_nghiep',
] as const;

export type SoftSkillId = (typeof SOFT_SKILL_IDS)[number];

export interface SoftSkillGroup {
  id: SoftSkillId;
  /** Tên đầy đủ trên hồ sơ. */
  name: string;
  /** Tên ngắn cho nhãn trục biểu đồ và chip. */
  short: string;
  /** Mục con: bấm vào nhóm thì thấy, không có điểm riêng (khối B). */
  items: string[];
}

export const SOFT_SKILL_GROUPS: readonly SoftSkillGroup[] = [
  {
    id: 'giao_tiep_hop_tac',
    name: 'Giao tiếp & Hợp tác',
    short: 'Giao tiếp',
    items: [
      'Viết rõ ràng, ngắn gọn (email, báo cáo, tin nhắn)',
      'Trình bày, giải thích điều phức tạp cho người không chuyên',
      'Lắng nghe chủ động, đặt câu hỏi làm rõ',
      'Phối hợp với đồng đội, liên phòng ban',
      'Chia sẻ thông tin, cập nhật tiến độ đúng lúc',
      'Hỗ trợ đồng nghiệp, làm việc nhóm/từ xa',
    ],
  },
  {
    id: 'tri_tue_cam_xuc',
    name: 'Trí tuệ cảm xúc & Xử lý xung đột',
    short: 'Cảm xúc',
    items: [
      'Đồng cảm, hiểu góc nhìn người khác',
      'Kiểm soát cảm xúc khi bị căng thẳng hoặc bị chỉ trích',
      'Xử lý bất đồng, hoà giải',
      'Cho và nhận feedback mang tính xây dựng',
      'Nhạy cảm với khác biệt (văn hoá, tính cách, vai trò)',
      'Xây dựng và giữ quan hệ làm việc',
    ],
  },
  {
    id: 'lanh_dao_kinh_doanh',
    name: 'Lãnh đạo & Tư duy kinh doanh',
    short: 'Lãnh đạo',
    items: [
      'Ra quyết định và chịu trách nhiệm về hệ quả',
      'Giao việc, dẫn dắt, mentor/coach người khác',
      'Thuyết phục, đàm phán, quản lý stakeholder',
      'Cân nhắc chi phí – lợi ích – rủi ro',
      'Hiểu khách hàng và giá trị kinh doanh',
      'Tư duy chiến lược, định hướng mục tiêu dài hạn',
    ],
  },
  {
    id: 'tu_duy_giai_quyet_van_de',
    name: 'Tư duy & Giải quyết vấn đề',
    short: 'Tư duy',
    items: [
      'Tư duy phản biện, đặt câu hỏi cho giả định',
      'Phân tích, tìm nguyên nhân gốc',
      'Đề xuất và so sánh nhiều giải pháp',
      'Sáng tạo, nghĩ cách làm mới',
      'Tư duy hệ thống (thấy tác động lan toả)',
      'Thu thập, kiểm chứng thông tin và sử dụng thành thạo công cụ số',
      'Hiểu và ứng dụng AI hiệu quả, có trách nhiệm',
    ],
  },
  {
    id: 'tu_quan_ly_ap_luc',
    name: 'Tự quản lý & Chịu áp lực',
    short: 'Tự quản lý',
    items: [
      'Quản lý thời gian, xếp thứ tự ưu tiên',
      'Tổ chức công việc, lập kế hoạch cá nhân',
      'Chủ động, tự giác, không chờ giao',
      'Cẩn thận, chú ý chi tiết',
      'Làm việc dưới deadline và áp lực',
      'Tự chịu trách nhiệm với việc của mình',
    ],
  },
  {
    id: 'thich_ung_hoc_hoi',
    name: 'Thích ứng & Học hỏi',
    short: 'Thích ứng',
    items: [
      'Linh hoạt khi kế hoạch hoặc yêu cầu thay đổi',
      'Xử lý tình huống mơ hồ, thiếu thông tin',
      'Học nhanh, tự học kiến thức/công cụ mới',
      'Cởi mở với phản hồi, sẵn sàng sửa sai',
      'Phục hồi sau thất bại hoặc sai sót',
    ],
  },
  {
    id: 'dao_duc_chuyen_nghiep',
    name: 'Đạo đức & Chuyên nghiệp',
    short: 'Chuyên nghiệp',
    items: [
      'Trung thực, dám nhận lỗi và báo sớm',
      'Giữ bí mật, bảo mật thông tin',
      'Tuân thủ quy trình, quy định, chuẩn mực',
      'Đáng tin cậy, giữ lời hứa, đúng hẹn',
      'Giữ ranh giới nghề nghiệp, ứng xử đúng mực',
      'Cân nhắc tác động đạo đức của quyết định',
    ],
  },
];

export const softSkillGroup = (id: SoftSkillId): SoftSkillGroup => {
  const group = SOFT_SKILL_GROUPS.find((g) => g.id === id);
  if (!group) throw new Error(`Không có nhóm soft skill ${id}`);
  return group;
};

/** Điểm tối đa mỗi nhóm (khối D). */
export const SOFT_SKILL_MAX = 10_000;

/** Ngưỡng bậc 0…5 (khối D, D1 tạm). */
export const TIER_THRESHOLDS = [0, 500, 1_500, 3_000, 6_000, 10_000] as const;

export const MAX_TIER = TIER_THRESHOLDS.length - 1;

/** Bậc ứng với số điểm, không tính luật "bậc không tụt". */
export function tierOf(points: number): number {
  let tier = 0;
  for (let i = 1; i < TIER_THRESHOLDS.length; i++) {
    if (points >= TIER_THRESHOLDS[i]) tier = i;
  }
  return tier;
}

/**
 * Bậc không tụt (khối D): điểm trong một bậc vẫn lên xuống, nhưng đã lên bậc
 * thì giữ bậc. `reached` là bậc cao nhất từng đạt.
 */
export const keptTier = (points: number, reached: number): number =>
  Math.max(tierOf(points), reached);

export interface TierProgress {
  tier: number;
  /** Ngưỡng của bậc kế; `null` khi đã ở bậc 5. */
  nextAt: number | null;
  /** Phần đã đi trong bậc hiện tại, 0…1. */
  ratio: number;
}

export function tierProgress(points: number, reached = 0): TierProgress {
  const tier = keptTier(points, reached);
  if (tier >= MAX_TIER) return { tier, nextAt: null, ratio: 1 };
  const from = TIER_THRESHOLDS[tier];
  const nextAt = TIER_THRESHOLDS[tier + 1];
  const ratio = Math.min(1, Math.max(0, (points - from) / (nextAt - from)));
  return { tier, nextAt, ratio };
}

/** Ngưỡng nhận xét điểm mạnh, cần luyện (B5, tạm 3 scenario). */
export const STRENGTH_MIN_SCENARIOS = 3;
