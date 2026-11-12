/**
 * Phiên đăng nhập Bearer của staff app (Q2, openapi `Session`). Khoá
 * localStorage riêng với explorer app để hai app không đá phiên của nhau.
 *
 * - Access token chỉ giữ trong bộ nhớ: tải lại trang là mất, lấy lại bằng
 *   refresh token.
 * - Refresh token giữ ở localStorage để còn phiên sau khi đóng tab. Máy chủ
 *   xoay vòng nó mỗi lần dùng (`auth_session`), nên một token bị lộ chỉ dùng
 *   được tới lần refresh kế tiếp của chủ thật.
 * - Nhiều tab: tab nào refresh xong thì ghi token mới vào localStorage; tab
 *   khác đọc lại trước khi tự refresh, nên không tab nào cầm token đã chết.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const REFRESH_KEY = 'jq.staff.refresh';

let accessToken: string | null = null;

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function readRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function writeRefresh(token: string | null): void {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Trình duyệt chặn bộ nhớ: phiên chỉ sống tới khi tải lại trang.
  }
}

export function setSession(tokens: SessionTokens): void {
  accessToken = tokens.accessToken;
  writeRefresh(tokens.refreshToken);
}

export function clearSession(): void {
  accessToken = null;
  writeRefresh(null);
}

export const getAccessToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => readRefresh();
export const hasSession = (): boolean => Boolean(accessToken || readRefresh());

/**
 * Chỉ một lần làm mới tại một thời điểm: mở trang gọi ba API cùng lúc thì cả
 * ba cùng nhận 401; không có chốt này cả ba cùng gửi một refresh token, mà
 * token xoay vòng nên hai lời gọi sau mang token đã chết.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(retried: boolean): Promise<boolean> {
  const presented = readRefresh();
  if (!presented) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: presented }),
    });
    if (response.ok) {
      setSession((await response.json()) as SessionTokens);
      return true;
    }
    // Tab khác có thể vừa xoay token: localStorage đã đổi thì thử lại một lần.
    const latest = readRefresh();
    if (!retried && latest && latest !== presented) return doRefresh(true);
    if (response.status === 401) clearSession();
    return false;
  } catch {
    return false;
  }
}

export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= doRefresh(false).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/**
 * `fetch` kèm `Authorization: Bearer`. Chưa có access token mà còn refresh
 * token thì làm mới trước; gặp 401 thì làm mới rồi thử lại đúng một lần.
 */
export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!accessToken && readRefresh()) await refreshSession();
  const send = () => {
    const headers = new Headers(init.headers);
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  };
  let response = await send();
  if (response.status === 401 && readRefresh() && (await refreshSession()))
    response = await send();
  return response;
}

// Tab khác đăng xuất: bỏ luôn access token trong bộ nhớ của tab này.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === REFRESH_KEY && !event.newValue) accessToken = null;
  });
}
