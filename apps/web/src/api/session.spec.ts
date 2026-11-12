import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authFetch,
  clearSession,
  getAccessToken,
  getRefreshToken,
  refreshSession,
  setSession,
} from './session';

const okSession = (n: number) =>
  new Response(
    JSON.stringify({
      accessToken: `a${n}`,
      refreshToken: `r${n}`,
      expiresIn: 900,
    }),
    { status: 200 },
  );

describe('session Bearer', () => {
  beforeEach(() => {
    clearSession();
    vi.useRealTimers();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('chỉ gửi một refresh khi nhiều lời gọi cùng cần làm mới', async () => {
    setSession({ accessToken: 'a0', refreshToken: 'r0', expiresIn: 900 });
    let calls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls += 1;
        return okSession(1);
      }),
    );
    const results = await Promise.all([
      refreshSession(),
      refreshSession(),
      refreshSession(),
    ]);
    expect(results).toEqual([true, true, true]);
    expect(calls).toBe(1);
    expect(getAccessToken()).toBe('a1');
    expect(getRefreshToken()).toBe('r1');
  });

  it('gặp 401 thì làm mới rồi thử lại đúng một lần, kèm Bearer mới', async () => {
    setSession({ accessToken: 'old', refreshToken: 'r0', expiresIn: 900 });
    const seen: Array<string | null> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith('/v1/auth/refresh')) return okSession(2);
        const auth = new Headers(init?.headers).get('Authorization');
        seen.push(auth);
        return new Response('{}', { status: auth === 'Bearer a2' ? 200 : 401 });
      }),
    );
    const response = await authFetch('/api/v1/me');
    expect(response.status).toBe(200);
    expect(seen).toEqual(['Bearer old', 'Bearer a2']);
  });

  it('refresh bị từ chối thì xoá phiên', async () => {
    setSession({ accessToken: 'a0', refreshToken: 'r0', expiresIn: 900 });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    );
    expect(await refreshSession()).toBe(false);
    expect(getRefreshToken()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});
