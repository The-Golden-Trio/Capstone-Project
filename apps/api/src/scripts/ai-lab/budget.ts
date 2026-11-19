/** Trần chi phí AI mỗi kịch bản khi không có `--budget` (NFR-11). */
export const DEFAULT_BUDGET_USD = 0.25;

/**
 * Đọc `--budget`. Trả `null` khi giá trị không phải số hữu hạn lớn hơn 0:
 * `NaN` làm mọi phép so sánh trần đều sai, tức là âm thầm tắt trần, nên không
 * được để lọt xuống runner. `--budget` không kèm giá trị tới đây là `"true"`.
 */
export function parseBudgetUsd(raw: string | undefined): number | null {
  if (raw === undefined) return DEFAULT_BUDGET_USD;
  const usd = Number(raw);
  return Number.isFinite(usd) && usd > 0 ? usd : null;
}
