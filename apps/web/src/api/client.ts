/**
 * Cầu nối duy nhất sang API.
 *
 * Phiên đăng nhập nằm trong cookie httpOnly nên ở đây không có token nào để
 * cầm — chỉ cần `credentials: 'include'` là trình duyệt tự gửi kèm.
 *
 * Lúc dev, `vite.config.mts` proxy `/api` sang cổng 3000, nên base URL rỗng
 * và trình duyệt coi như cùng một origin: không CORS, không preflight, cookie
 * chạy thẳng.
 */
import type { ZodType } from 'zod';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly issues?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Bỏ qua bước tự làm mới phiên — dùng cho chính lời gọi refresh. */
  skipRefresh?: boolean;
}

/**
 * Chỉ cho phép một lần làm mới tại một thời điểm.
 *
 * Mở một trang gọi ba API cùng lúc thì cả ba cùng nhận 401; không có chốt này
 * thì cả ba cùng gọi refresh, mà refresh xoay vòng token nên hai lời gọi sau
 * sẽ mang token đã bị thu hồi — và cơ chế phát hiện dùng lại sẽ đá người dùng
 * ra ngoài. Đây chính là chỗ dễ tự bắn vào chân mình nhất của refresh rotation.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      // Nhả chốt ở vòng tick sau để các lời gọi đang chờ dùng chung kết quả này.
      setTimeout(() => {
        refreshInFlight = null;
      }, 0);
    }
  })();
  return refreshInFlight;
}

async function rawRequest(
  path: string,
  { method = 'GET', body }: RequestOptions,
): Promise<Response> {
  return fetch(`${BASE_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function toError(response: Response): Promise<ApiError> {
  let message = `Lỗi ${response.status}`;
  let issues: Array<{ path: string; message: string }> | undefined;
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') message = data.message;
    if (Array.isArray(data?.issues)) issues = data.issues;
  } catch {
    // Phản hồi không phải JSON — giữ nguyên thông báo mặc định.
  }
  return new ApiError(response.status, message, issues);
}

/**
 * Gọi API và kiểm phản hồi bằng Zod.
 *
 * Kiểm cả chiều về, giống như dataset được kiểm ở `@datn/game-core`: API đổi
 * hình dạng thì lỗi hiện ra ngay tại ranh giới, kèm tên field, thay vì thành
 * một `undefined` ở tầng giao diện.
 */
export async function api<T>(
  path: string,
  schema: ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  let response = await rawRequest(path, options);

  if (response.status === 401 && !options.skipRefresh) {
    const refreshed = await refreshSession();
    if (refreshed) response = await rawRequest(path, options);
  }

  if (!response.ok) throw await toError(response);

  const data = response.status === 204 ? null : await response.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      `Phản hồi từ ${path} không đúng hình dạng mong đợi: ` +
        parsed.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join('.')} ${i.message}`)
          .join('; '),
    );
  }
  return parsed.data;
}
