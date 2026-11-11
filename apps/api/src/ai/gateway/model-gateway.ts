/**
 * Cửa duy nhất để gọi model ra ngoài.
 *
 * Mỏng có chủ đích: gửi một request, đo thời gian, đọc kết quả, phân loại lỗi.
 * Không tự thử lại, không tự đổi model — những quyết định đó cần biết ngân
 * sách thời gian của người chơi và luật R1–R4, nên nằm ở tầng gọi
 * (`NarratorService`), không giấu trong gateway.
 */
import { ADAPTERS } from './adapters';
import {
  GatewayError,
  systemClock,
  type ChatRequest,
  type ChatResult,
  type Clock,
  type ProviderId,
  type Transport,
} from './gateway.types';

export const fetchTransport: Transport = async (url, init) => {
  const response = await fetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
    signal: init.signal,
  });
  return { status: response.status, text: () => response.text() };
};

/**
 * Lỗi hết giờ của `fetch` là `DOMException`. Xét theo tên, không dùng
 * `instanceof Error`: kiểu này khác nhau giữa các realm, như trong jest.
 */
const errorName = (err: unknown): unknown => (err as { name?: unknown } | null)?.name;
const isAbort = (err: unknown): boolean =>
  errorName(err) === 'TimeoutError' || errorName(err) === 'AbortError';

/**
 * `fetch` chỉ báo "fetch failed", nguyên nhân thật (sai tên miền, từ chối kết
 * nối, lỗi TLS) nằm trong `cause`. Không có nó thì không biết phải sửa gì.
 */
function networkMessage(err: unknown): string {
  const { message, cause } = (err ?? {}) as { message?: unknown; cause?: { code?: unknown; message?: unknown } };
  const reason = cause?.code ?? cause?.message;
  return [message ?? String(err), reason].filter(Boolean).join(': ');
}

export class ModelGateway {
  constructor(
    private readonly keys: Partial<Record<ProviderId, string>>,
    private readonly transport: Transport = fetchTransport,
    private readonly clock: Clock = systemClock,
  ) {}

  /** Body sẽ gửi đi — để chế độ chạy thử in ra đúng thứ được gửi, không đoán. */
  preview(request: ChatRequest): { url: string; body: Record<string, unknown> } {
    const adapter = ADAPTERS[request.model.provider];
    return { url: adapter.endpoint(request.model), body: adapter.body(request) };
  }

  async complete(request: ChatRequest): Promise<ChatResult> {
    const { provider } = request.model;
    const adapter = ADAPTERS[provider];
    const key = this.keys[provider];
    if (!key) throw new GatewayError('auth', `Chưa có API key cho ${provider}`, provider);

    const { url, body } = this.preview(request);
    const started = this.clock.now();

    let status: number;
    let raw: string;
    try {
      // Một tín hiệu hết giờ cho cả lúc chờ header lẫn lúc đọc body. DeepSeek
      // giữ kết nối bằng dòng trống khi đang tải nặng — vẫn tính vào giờ này.
      const response = await this.transport(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(request.timeoutMs),
        timeoutMs: request.timeoutMs,
      });
      status = response.status;
      raw = await response.text();
    } catch (err) {
      if (isAbort(err))
        throw new GatewayError('timeout', `${provider}: quá ${request.timeoutMs} ms`, provider);
      throw new GatewayError('network', `${provider}: ${networkMessage(err)}`, provider);
    }

    // JSON.parse bỏ qua khoảng trắng đầu, nên các dòng keep-alive của
    // DeepSeek không làm hỏng việc đọc.
    let json: unknown = null;
    try {
      json = raw.trim() ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }

    if (status < 200 || status >= 300) throw adapter.error(status, json);
    if (json === null)
      throw new GatewayError('server', `${provider}: body không phải JSON (HTTP ${status})`, provider, status);

    return { ...adapter.read(json), latencyMs: this.clock.now() - started };
  }
}
