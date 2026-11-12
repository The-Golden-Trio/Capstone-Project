/**
 * Gọi API v1 của staff. Mọi lỗi là Problem (RFC 9457, openapi `Problem`) có
 * `code` ổn định để màn hình rẽ nhánh (`ACTIVE_SCENARIO_EXISTS`,
 * `REVIEWER_IS_AUTHOR`, `CHECKS_FAILED`…).
 */
import { authFetch } from './session';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`;

export interface ProblemError {
  field?: string;
  reason: string;
}

export class ApiProblem extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    title: string,
    readonly errors: ProblemError[] = [],
  ) {
    super(title);
    this.name = 'ApiProblem';
  }
}

export const isProblem = (e: unknown, code?: string): e is ApiProblem =>
  e instanceof ApiProblem && (code === undefined || e.code === code);

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Gửi thẳng (multipart) thay vì JSON. */
  form?: FormData;
}

async function toProblem(response: Response): Promise<ApiProblem> {
  try {
    const data = (await response.json()) as {
      code?: string;
      title?: string;
      message?: string;
      errors?: ProblemError[];
    };
    return new ApiProblem(
      response.status,
      data.code ?? 'HTTP_ERROR',
      data.title ?? data.message ?? `Lỗi ${response.status}`,
      data.errors ?? [],
    );
  } catch {
    return new ApiProblem(
      response.status,
      'HTTP_ERROR',
      response.status >= 500
        ? 'Máy chủ đang lỗi, thử lại sau'
        : `Lỗi ${response.status}`,
    );
  }
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  let body: BodyInit | undefined;
  if (options.form) body = options.form;
  else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  let response: Response;
  try {
    response = await authFetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    });
  } catch {
    throw new ApiProblem(0, 'NETWORK', 'Không kết nối được máy chủ');
  }
  if (!response.ok) throw await toProblem(response);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Câu tiếng Việt cho người dùng từ một lỗi bất kỳ. */
export function messageOf(error: unknown): string {
  if (error instanceof ApiProblem) return error.message;
  if (error instanceof Error) return error.message;
  return 'Có lỗi xảy ra';
}
