/**
 * Cầu nối duy nhất sang API.
 *
 * Phiên là Bearer token (`./session`): mọi lời gọi đi qua `authFetch`, tự
 * gắn header và tự làm mới phiên khi gặp 401.
 *
 * Lúc dev, `vite.config.mts` proxy `/api` sang cổng 3000, nên base URL rỗng.
 */
import type { ZodType } from 'zod';
import { authFetch } from './session';

export { refreshSession } from './session';

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
}

async function rawRequest(
  path: string,
  { method = 'GET', body }: RequestOptions,
): Promise<Response> {
  return authFetch(`${BASE_URL}/api${path}`, {
    method,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function toError(response: Response): Promise<ApiError> {
  let message = `Lỗi ${response.status}`;
  let issues: Array<{ path: string; message: string }> | undefined;
  try {
    const data = await response.json();
    // Route prototype trả `{message, issues}`; route v1 trả Problem `{title, errors}`.
    if (typeof data?.message === 'string') message = data.message;
    else if (typeof data?.title === 'string') message = data.title;
    if (Array.isArray(data?.issues)) issues = data.issues;
    else if (Array.isArray(data?.errors))
      issues = data.errors.map((e: { field?: string; reason: string }) => ({
        path: e.field ?? '',
        message: e.reason,
      }));
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
  const response = await rawRequest(path, options);
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
