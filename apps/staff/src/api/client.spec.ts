import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiProblem, isProblem, messageOf } from './client';
import { clearSession } from './session';

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSession();
  });

  it('đọc lỗi Problem thành ApiProblem có code và errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              type: 'about:blank',
              title: 'Người duyệt không được là tác giả',
              status: 422,
              code: 'REVIEWER_IS_AUTHOR',
              errors: [{ field: 'reviewerId', reason: 'trùng tác giả' }],
            }),
            { status: 422 },
          ),
      ),
    );
    const err = await api('/staff/x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiProblem);
    expect(isProblem(err, 'REVIEWER_IS_AUTHOR')).toBe(true);
    expect((err as ApiProblem).errors).toEqual([
      { field: 'reviewerId', reason: 'trùng tác giả' },
    ]);
    expect(messageOf(err)).toBe('Người duyệt không được là tác giả');
  });

  it('gửi JSON và If-Match, trả undefined với 204', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init });
        return new Response(null, { status: 204 });
      }),
    );
    const out = await api('/staff/scenarios/s1/content', {
      method: 'PUT',
      body: { a: 1 },
      headers: { 'If-Match': '"3"' },
    });
    expect(out).toBeUndefined();
    const headers = new Headers(calls[0].init?.headers);
    expect(calls[0].url).toBe('/api/v1/staff/scenarios/s1/content');
    expect(headers.get('If-Match')).toBe('"3"');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(calls[0].init?.body).toBe('{"a":1}');
  });

  it('lỗi mạng thành Problem NETWORK', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('offline');
      }),
    );
    const err = await api('/me').catch((e: unknown) => e);
    expect(isProblem(err, 'NETWORK')).toBe(true);
  });
});
