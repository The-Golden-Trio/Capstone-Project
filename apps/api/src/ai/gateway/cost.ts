/**
 * Chi phí một lượt gọi = token × giá, tách theo phần trúng cache.
 *
 * NFR-11: chi phí mỗi phiên chơi không vượt trần đã đặt. Muốn chặn trần thì
 * phải biết mỗi lượt tốn bao nhiêu — từ số token nhà cung cấp trả về, không
 * từ ước đoán.
 */
import type { GatewayErrorKind, Price, TokenUsage } from './gateway.types';

export interface Cost {
  usd: number;
  /**
   * `list`: tính đủ theo bảng giá. `upper_bound`: con số thật thấp hơn hoặc
   * bằng — có token trúng cache mà chưa biết tỉ lệ giảm giá, hoặc lượt gọi lỗi
   * không trả về số token (`failedCallCost`).
   */
  basis: 'list' | 'upper_bound';
}

export function costOf(usage: TokenUsage, price: Price): Cost {
  const uncached = Math.max(0, usage.input - usage.cachedInput - usage.cacheWrite);
  const hitRatio = price.cachedInputRatio ?? 1;
  const writeRatio = price.cacheWriteRatio ?? 1;

  const usd =
    (uncached * price.inputPerMTok +
      usage.cachedInput * price.inputPerMTok * hitRatio +
      usage.cacheWrite * price.inputPerMTok * writeRatio +
      usage.output * price.outputPerMTok) /
    1_000_000;

  const guessed =
    (usage.cachedInput > 0 && price.cachedInputRatio === null) ||
    (usage.cacheWrite > 0 && price.cacheWriteRatio === null);
  return { usd, basis: guessed ? 'upper_bound' : 'list' };
}

/**
 * Ước số token TRƯỚC khi gửi, để chặn trần chi phí trước khi tiêu.
 *
 * Cố ý ước cao: 2 ký tự một token. Tiếng Việt thường tốn hơn tiếng Anh nhưng
 * ít khi tệ tới mức này, nên chặn theo con số này không bao giờ chặn muộn.
 * Số thật lấy từ `usage` sau khi gọi.
 */
export const estimateTokensHigh = (chars: number): number => Math.ceil(chars / 2);

/**
 * Lỗi mà nhà cung cấp từ chối trước khi model chạy, nên không tính tiền. Các lỗi
 * còn lại (quá giờ, đứt kết nối, lỗi server, bị lọc nội dung) có thể đến sau
 * khi model đã đọc đề và viết, nên phải tính là đã tốn.
 */
const REJECTED_BEFORE_RUN: ReadonlySet<GatewayErrorKind> = new Set([
  'auth',
  'quota',
  'bad_request',
  'rate_limited',
  'overloaded',
]);

/**
 * Chi phí ghi cho một lượt gọi lỗi: không có `usage` nên không biết số thật.
 * Lỗi có thể đã bị tính tiền thì ghi cận trên, để sổ chi phí và trần mỗi phiên
 * (NFR-11) không bỏ sót.
 */
export function failedCallCost(kind: GatewayErrorKind, upperUsd: number): Cost {
  return REJECTED_BEFORE_RUN.has(kind) ? { usd: 0, basis: 'list' } : { usd: upperUsd, basis: 'upper_bound' };
}

/** Lượt gọi này tốn tối đa bao nhiêu, nếu không trúng cache và viết hết `maxOutputTokens`. */
export function upperBoundUsd(inputChars: number, maxOutputTokens: number, price: Price): number {
  return (
    (estimateTokensHigh(inputChars) * price.inputPerMTok +
      maxOutputTokens * price.outputPerMTok) /
    1_000_000
  );
}
