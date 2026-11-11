/**
 * Call profile của judge (AI-5): mọi con số quyết định một lượt chấm, ở một
 * chỗ, kèm nguồn. Giá trị khởi đầu (D-109), chỉnh sau phép thử §7.3; đổi số
 * nào thì tăng `version`.
 */
export type OneJudgeDownPolicy = 'pending' | 'lower_of_2';

export const JUDGE_PROFILE = {
  version: 'judge-profile-1',

  /**
   * D-109: judge chạy temperature 0 để ổn định. Chỉ gửi được cho Gemini; Claude
   * 5.5 và GPT-6 không nhận tham số này nên chạy ở mặc định của hãng — độ ổn
   * định của hai họ đó phải đo (§7.3.2), không giả định.
   */
  temperature: 0,

  /** D-109: 600 token ra — đủ cho 3 tiêu chí, mỗi tiêu chí một câu trích và một lý do ngắn. */
  maxOutputTokens: 600,

  /** D-109: chờ tối đa 7 s một lượt gọi. Chấm chạy nền, người chơi không đứng chờ. */
  attemptTimeoutMs: 7_000,

  /** SD-01, CL-04: mỗi judge thử lại tối đa 2 lần trên một model, rồi sang bậc dự phòng. */
  maxRetries: 2,

  /** §5.3.6: tối đa 3 tiêu chí một lượt gọi; gộp nhiều hơn thì đổi độ chính xác lấy chi phí. */
  maxCriteriaPerCall: 3,

  /** §5.3.6: các judge lệch nhau hơn 1 mức thì gắn cờ cho chuyên gia (AI-3). */
  disagreementThreshold: 1,

  /**
   * Một ghế hỏng cả hai bậc thì làm gì — hai nguồn thiết kế đang mâu thuẫn:
   *   - `pending`: D-108 mục 3 (✅) và §5.3.6 — điểm chờ, không lấy trung vị
   *     của hai judge.
   *   - `lower_of_2`: SD-01 và CL-04 — gộp hai judge còn lại ("agreed or lower
   *     of 2"), đánh dấu là grade hai judge.
   * Mặc định theo quyết định (ưu tiên cao hơn sơ đồ) cho tới khi nhóm chốt.
   */
  whenOneJudgeDown: 'pending' as OneJudgeDownPolicy,
} as const;
