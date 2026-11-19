/**
 * Trần chi phí (NFR-11) của một job chấm, kiểm TRƯỚC mỗi lượt gọi model.
 *
 * Chặn một lần ở đầu job không đủ: mỗi ghế có thể gọi tới
 * `(maxRetries + 1)` lần trên mỗi model trong chuỗi, và lượt thử lại còn gửi
 * kèm câu trả lời cũ nên đắt hơn lượt đầu. Ba ghế lại chạy song song, nên phần
 * còn lại phải trừ cả những lượt đang bay: mỗi lượt giữ chỗ cận trên của nó
 * lúc bắt đầu, rồi đổi sang chi phí thật khi có `usage`.
 */
export class CallBudget {
  private spentUsd = 0;
  private reservedUsd = 0;

  /** `undefined`: không đặt trần, mọi lượt đều qua. */
  constructor(private readonly limitUsd: number | undefined) {}

  /** Giữ chỗ cho một lượt sắp gọi; `false` nếu cận trên của nó không còn vừa. */
  reserve(upperBoundUsd: number): boolean {
    if (this.limitUsd === undefined) return true;
    if (this.spentUsd + this.reservedUsd + upperBoundUsd > this.limitUsd)
      return false;
    this.reservedUsd += upperBoundUsd;
    return true;
  }

  /** Lượt đã xong (kể cả lỗi): trả chỗ đã giữ, ghi chi phí thật nếu biết. */
  settle(upperBoundUsd: number, actualUsd: number): void {
    if (this.limitUsd === undefined) return;
    this.reservedUsd -= upperBoundUsd;
    this.spentUsd += actualUsd;
  }
}
