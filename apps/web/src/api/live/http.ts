/**
 * Gọi API thật: gắn Bearer, tự làm mới access token một lần khi gặp 401,
 * đổi lỗi `Problem` (RFC 9457) thành `ApiError`.
 */
import { ApiError } from '../port';
import { useSession } from '../session';

export const API_BASE = '/api/v1';

interface Problem {
  status?: number;
  code?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string> | Array<{ path?: string; message?: string }>;
}

let refreshing: Promise<boolean> | null = null;

/** Làm mới token; nhiều request cùng gặp 401 thì chỉ gọi refresh một lần. */
export function refreshAccess(): Promise<boolean> {
  if (refreshing) return refreshing;
  const { refreshToken, setTokens, clear } = useSession.getState();
  if (!refreshToken) return Promise.resolve(false);
  refreshing = fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) {
        clear();
        return false;
      }
      const s = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      setTokens(s.accessToken, s.refreshToken);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function toFields(problem: Problem): Record<string, string> | undefined {
  const errors = problem.errors;
  if (!errors) return undefined;
  if (Array.isArray(errors)) {
    const out: Record<string, string> = {};
    for (const e of errors) if (e.path) out[e.path] = e.message ?? '';
    return out;
  }
  return errors;
}

const FALLBACK: Record<number, string> = {
  400: 'Yêu cầu chưa đúng.',
  401: 'Phiên đăng nhập đã hết, bạn đăng nhập lại nhé.',
  403: 'Bạn chưa có quyền làm việc này.',
  404: 'Không tìm thấy nội dung này.',
  409: 'Thao tác đang xung đột với trạng thái hiện tại.',
  422: 'Thông tin chưa hợp lệ.',
  429: 'Bạn thao tác hơi nhanh, chờ một chút rồi thử lại.',
  500: 'Máy chủ đang gặp sự cố. Tiến độ của bạn vẫn được giữ.',
  503: 'Dịch vụ đang tạm dừng. Tiến độ của bạn vẫn được giữ.',
};

export async function http<T>(
  path: string,
  init: RequestInit & { json?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { json, auth = true, headers, ...rest } = init;
  const send = () => {
    const token = useSession.getState().accessToken;
    return fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        Accept: 'application/json, application/problem+json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  };

  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && auth && (await refreshAccess())) {
      res = await send();
    }
  } catch {
    throw new ApiError(
      0,
      'NETWORK',
      'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.',
    );
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : undefined;
  if (!res.ok) {
    const p = (body ?? {}) as Problem;
    throw new ApiError(
      res.status,
      p.code ?? `HTTP_${res.status}`,
      p.detail ?? p.title ?? FALLBACK[res.status] ?? 'Có lỗi xảy ra.',
      toFields(p),
    );
  }
  return body as T;
}
