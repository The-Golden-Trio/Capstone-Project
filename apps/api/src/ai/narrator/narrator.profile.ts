/**
 * Call profile của người dẫn truyện (AI-4): mọi con số quyết định một lượt
 * gọi, ở một chỗ, kèm lý do.
 *
 * Đây là GIÁ TRỊ KHỞI ĐẦU có căn cứ, chưa phải giá trị cuối. Mỗi con số có
 * ghi cách đo để chốt lại ở bộ thử (Chương 7). Đổi con số nào thì tăng
 * `version` — bản ghi mỗi lượt gọi ghi lại version, để biết câu nào sinh ra
 * từ cấu hình nào.
 */
import type { ProviderId } from '../gateway/gateway.types';

export const NARRATOR_PROFILE = {
  version: 'narrator-profile-4',

  /**
   * Temperature theo TỪNG hãng — thang của hai hãng không giống nhau.
   *
   * Qwen 0,7 (trực tiếp hay qua OpenRouter đều là một model): đội Qwen khuyến nghị cho chế độ không thinking "Temperature=0.7,
   * TopP=0.8, TopK=20"; Alibaba cũng đặt mặc định 0,7 cho Qwen3.8-Omni-Flash
   * khi không thinking. Bài toán cần đa dạng vừa phải: chơi lại không gặp đúng
   * câu cũ, nhưng không được bịa (R1).
   *
   * DeepSeek 1,0: bảng khuyến nghị của DeepSeek ghi trò chuyện 1,3, sáng tác
   * 1,5, phân tích dữ liệu 1,0 — nếu thang giống Qwen thì 1,3 cho trò chuyện
   * là quá cao, tức thang khác nhau. Chọn 1,0: mặc định của họ, và là mức thấp
   * hơn trong hai mức gần bài toán nhất, vì giữ đúng sự thật quan trọng hơn
   * văn hay.
   *
   * Đo: chạy bộ thử ở 0,3 / 0,7 / 1,0 (DeepSeek: 0,7 / 1,0 / 1,3), so tỉ lệ
   * R1 hỏng và độ khác nhau giữa các lần sinh; chọn mức thấp nhất vẫn đủ đa dạng.
   */
  temperature: { qwen: 0.7, openrouter: 0.7, deepseek: 1.0 } satisfies Record<ProviderId, number>,

  /**
   * Trần token đầu ra, theo từng hãng.
   *
   * Contract nhịp (D-130) viết tối đa 5 nhịp × 120 ký tự, cộng khung JSON:
   * khoảng 300–450 token tiếng Việt ở lượt dài nhất. Lượt thường 2–4 nhịp.
   * 600 cho mọi hãng (Qwen 600 theo góp ý của cô, từ 500 trở lên); DeepSeek
   * trước đây 300, đủ cho một câu follow-up nhưng cắt ngang lượt 5 nhịp. Bị cắt
   * thì R4 bắt (`finish_reason: length`) và sinh lại. Không đặt trần thì mặc
   * định của DeepSeek là 8K: một lần model "nói dài" là hàng chục giây chờ.
   *
   * Đo: phân bố số token đầu ra thật; hạ xuống khi p99 còn xa trần.
   */
  maxOutputTokens: { qwen: 600, openrouter: 600, deepseek: 600 } satisfies Record<ProviderId, number>,

  /**
   * Chờ tối đa một lượt gọi.
   *
   * NFR-01: follow-up sinh xong trong 5 s ở p95. Phần của nền tảng khoảng
   * 0,4 s (§5.3.1), còn 4,6 s cho model; chừa 0,1 s cho bốn luật kiểm.
   */
  attemptTimeoutMs: 4_500,

  /**
   * Hạn chót của CẢ bậc dự phòng (sinh lại, đổi model).
   *
   * NFR-04: không còn model nào thì báo người chơi trong 10 s. Chừa 1 s cho
   * việc lưu, đẩy thông báo về trình duyệt.
   */
  deadlineMs: 9_000,

  /**
   * Còn ít hơn chừng này thì không gọi thêm nữa.
   *
   * Một lượt gọi bị cắt vì hết giờ vẫn tính tiền phần đầu vào mà không cho ra
   * gì. Dưới 1,5 s thì khả năng xong kịp quá thấp — chưa đo, chỉnh sau.
   */
  minAttemptMs: 1_500,

  /** D-108: sinh lại tối đa 2 lần trên một model, rồi đổi model. */
  maxRegenerations: 2,
} as const;
