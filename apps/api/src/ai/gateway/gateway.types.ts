/**
 * Hợp đồng chung của model gateway.
 *
 * D-100: adapter tự viết, lấy Chat Completions kiểu OpenAI làm định dạng
 * chung, adapter riêng cho từng hãng. Code nghiệp vụ chỉ nói "gọi model này
 * với những message này"; tên tham số riêng của từng hãng — `enable_thinking`
 * của Qwen, `thinking` của DeepSeek, `max_completion_tokens` hay `max_tokens`
 * — chỉ tồn tại trong adapter.
 */

export type ProviderId = 'qwen' | 'deepseek';

/** Một đoạn chữ trong message. Tách đoạn để đặt được điểm cache ở giữa. */
export interface ChatPart {
  text: string;
  /**
   * Đặt điểm cache explicit ngay sau đoạn này. Hãng nào không có cache
   * explicit thì bỏ qua — prefix vẫn y hệt, cache tự động vẫn trúng.
   */
  cacheBreakpoint?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  parts: ChatPart[];
}

export interface JsonOutput {
  /** Tên schema — Alibaba bắt buộc có khi dùng `json_schema`. */
  name: string;
  schema: Record<string, unknown>;
}

export type CacheMode = 'implicit' | 'explicit';

/** Bảng giá, kèm nguồn — để biết con số nào đã kiểm, con số nào chưa. */
export interface Price {
  /** USD cho 1 triệu token đầu vào không trúng cache. */
  inputPerMTok: number;
  /** USD cho 1 triệu token đầu ra. */
  outputPerMTok: number;
  /** Token trúng cache tính bằng bao nhiêu phần giá đầu vào. `null` = chưa biết. */
  cachedInputRatio: number | null;
  /** Token tạo cache explicit tính bằng bao nhiêu phần giá đầu vào. */
  cacheWriteRatio: number | null;
  source: string;
  verified: boolean;
}

/** Nhà cung cấp có cam kết không huấn luyện trên dữ liệu gửi lên không (phần 7). */
export interface DataPolicy {
  noTraining: 'confirmed' | 'not_found';
  source: string;
  checkedAt: string;
  note: string;
}

export interface ModelSpec {
  /** Khoá duy nhất, ghi vào bản ghi: `qwen3.8-flash@eu-central-1`. */
  key: string;
  provider: ProviderId;
  /** Tên model gửi cho API. */
  model: string;
  /** Họ model — DC-01: ba judge và model sinh thuộc bốn họ khác nhau. */
  family: string;
  region: string;
  baseUrl: string;
  supports: { jsonSchema: boolean; explicitCache: boolean };
  cacheMode: CacheMode;
  price: Price;
  dataPolicy: DataPolicy;
}

export interface ChatRequest {
  model: ModelSpec;
  messages: ChatMessage[];
  temperature: number;
  maxOutputTokens: number;
  json: JsonOutput;
  /** Thời gian chờ của RIÊNG lượt gọi này, đã trừ phần ngân sách đã tiêu. */
  timeoutMs: number;
}

/** Số token đã chuẩn hoá — mỗi hãng đặt tên trường một kiểu. */
export interface TokenUsage {
  /** Tổng token đầu vào, gồm cả phần trúng cache và phần tạo cache. */
  input: number;
  cachedInput: number;
  cacheWrite: number;
  output: number;
  /** Token suy nghĩ. Thinking đã tắt nên phải bằng 0 — khác 0 là cấu hình sai. */
  reasoning: number;
}

export interface ChatResult {
  text: string;
  finishReason: string;
  usage: TokenUsage;
  requestId: string | null;
  latencyMs: number;
}

/**
 * Các kiểu lỗi, phân theo việc phải LÀM gì chứ không theo mã HTTP.
 *
 *   timeout, network, overloaded, server, rate_limited → chuyển model khác
 *   auth, quota          → chuyển model khác, ngắt hãng này lâu, báo quản trị
 *   bad_request          → lỗi của chính mình (body sai); chuyển model khác
 *   content_filtered     → DỪNG: không thử lại, không đẩy nội dung bị chặn
 *                          sang hãng khác
 */
export type GatewayErrorKind =
  | 'timeout'
  | 'network'
  | 'rate_limited'
  | 'overloaded'
  | 'server'
  | 'auth'
  | 'quota'
  | 'bad_request'
  | 'content_filtered';

export class GatewayError extends Error {
  constructor(
    readonly kind: GatewayErrorKind,
    message: string,
    readonly provider: ProviderId,
    readonly status: number | null = null,
    readonly code: string | null = null,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

/** Đọc thời gian. Tiêm vào để test đi nhanh hơn đồng hồ thật. */
export interface Clock {
  now(): number;
}

export const systemClock: Clock = { now: () => Date.now() };

/**
 * Phần `fetch` mà gateway cần. Tiêm vào để test và chế độ chạy thử dùng được
 * cùng một đường đi qua adapter, chỉ khác chỗ trả lời.
 */
export type Transport = (
  url: string,
  init: {
    method: 'POST';
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
    /** Để transport giả biết khi nào phải giả lập hết giờ. */
    timeoutMs: number;
  },
) => Promise<{ status: number; text(): Promise<string> }>;
