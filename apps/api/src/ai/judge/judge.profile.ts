/**
 * Call profile của judge (AI-5): mọi con số quyết định một lượt chấm, ở một
 * chỗ, kèm nguồn. Giá trị khởi đầu (D-109), chỉnh sau phép thử §7.3; đổi số
 * nào thì tăng `version`.
 */
export type OneJudgeDownPolicy = 'pending' | 'lower_of_2';

export const JUDGE_PROFILE = {
  version: 'judge-profile-1',

  /**
   * D-109: judge chạy temperature 0 để ổn định. Từ D-131 không judge nào nhận
   * tham số này (endpoint ZDR trên OpenRouter, thử 12/11/2026), nên cả ba chạy
   * ở mặc định của hãng — độ ổn định phải đo (§7.3.2), không giả định. Giữ số
   * này để model nào nhận được thì vẫn gửi.
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
   * Một ghế hỏng cả hai bậc thì làm gì (D-132, gộp D-108 mục 3 với SD-01):
   *   - các lượt thử đầu: `pending` — điểm chờ, job thử lại sau, vì phần lớn
   *     sự cố của một hãng chỉ kéo dài vài chục giây (D-108);
   *   - từ lượt thử `lowerOf2FromAttempt` của job: `lower_of_2` — gộp hai
   *     judge còn lại theo SD-01/CL-04, lấy mức THẤP hơn (không lấy trung vị
   *     hai judge), ghi `method = lower_of_2` để chuyên gia lọc ra xem lại.
   * Hai judge còn lại vẫn khác họ nhau và khác họ dẫn truyện (DC-01).
   */
  whenOneJudgeDown: 'pending' as OneJudgeDownPolicy,
  lowerOf2FromAttempt: 3,
} as const;

/** Chính sách một ghế hỏng cho lượt thử thứ `attempt` (từ 1) của một job chấm. */
export const oneJudgeDownPolicy = (attempt: number): OneJudgeDownPolicy =>
  attempt >= JUDGE_PROFILE.lowerOf2FromAttempt
    ? 'lower_of_2'
    : JUDGE_PROFILE.whenOneJudgeDown;
