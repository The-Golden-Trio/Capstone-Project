import { StrictMode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useLoad } from './useLoad';

afterEach(cleanup);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

it('hides previous-route data and ignores a late response from that route', async () => {
  const stale = deferred<string>();
  const next = deferred<string>();
  const old = vi
    .fn()
    .mockResolvedValueOnce('old')
    .mockReturnValueOnce(stale.promise);
  const { result, rerender } = renderHook(
    ({ id }) => useLoad(() => (id === 'a' ? old() : next.promise), [id]),
    { initialProps: { id: 'a' } },
  );
  await waitFor(() => expect(result.current.data).toBe('old'));
  let pending: Promise<void>;
  act(() => {
    pending = result.current.reload();
  });
  rerender({ id: 'b' });
  expect(result.current.data).toBeUndefined();
  expect(result.current.loading).toBe(true);
  await act(async () => {
    next.resolve('new');
  });
  expect(result.current.data).toBe('new');
  await act(async () => {
    stale.resolve('late-old');
    await pending;
  });
  expect(result.current.data).toBe('new');
  expect(result.current.error).toBeUndefined();
});

it('keeps the newest reload even when the first request fails later', async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const load = vi
    .fn()
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => useLoad(load, []));
  let pending: Promise<void>;
  act(() => {
    pending = result.current.reload();
  });
  await act(async () => {
    second.resolve('latest');
    await pending;
  });
  await act(async () => {
    first.reject(new Error('old error'));
  });
  expect(result.current.data).toBe('latest');
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeUndefined();
});

it('a mutation supersedes an in-flight read, and StrictMode still finishes loading', async () => {
  const first = deferred<string>();
  const { result, unmount } = renderHook(
    () => useLoad(() => first.promise, []),
    { wrapper: StrictMode },
  );
  act(() => result.current.setData('saved'));
  await act(async () => {
    first.resolve('older read');
  });
  expect(result.current.data).toBe('saved');
  expect(result.current.loading).toBe(false);
  unmount();
});
