/**
 * Nghe `GET /api/v1/stream` (SSE) bằng `fetch` để gửi được Bearer, nối lại
 * với `Last-Event-ID` để nhận bù tin đã lỡ. Chỉ mở ở màn cần (D03, C06…), và
 * đóng khi rời màn.
 */
import { useEffect, useRef } from 'react';
import { authFetch } from '../api/session';
import { readSse } from '../api/sse';
import type { StreamEvent } from '../api/types';

const URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1/stream`;

export interface StreamFilter {
  types: string[];
  scenarioId?: string;
}

export function openStream(
  filter: StreamFilter,
  onEvent: (event: StreamEvent) => void,
  reconnectMs = 2000,
): () => void {
  const controller = new AbortController();
  let lastEventId: string | null = null;
  const backoff = { ms: reconnectMs };

  const connect = async (): Promise<void> => {
    const response = await authFetch(URL, {
      headers: {
        Accept: 'text/event-stream',
        ...(lastEventId ? { 'Last-Event-ID': lastEventId } : {}),
      },
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      if (response.status === 401) controller.abort();
      return;
    }
    backoff.ms = reconnectMs;
    await readSse(response.body, (message) => {
      if (message.id) lastEventId = message.id;
      try {
        const event = JSON.parse(message.data) as StreamEvent;
        if (!filter.types.includes(event.type)) return;
        if (filter.scenarioId && event.scenarioId !== filter.scenarioId) return;
        onEvent(event);
      } catch {
        // Tin không đọc được thì bỏ qua.
      }
    });
  };

  void (async () => {
    while (!controller.signal.aborted) {
      await connect().catch(() => undefined);
      if (controller.signal.aborted) return;
      await new Promise((r) => setTimeout(r, backoff.ms));
      backoff.ms = Math.min(backoff.ms * 2, 30_000);
    }
  })();
  return () => controller.abort();
}

export function useEventStream(
  filter: StreamFilter | null,
  onEvent: (event: StreamEvent) => void,
): void {
  const handler = useRef(onEvent);
  handler.current = onEvent;
  const key = filter
    ? `${filter.types.join(',')}|${filter.scenarioId ?? ''}`
    : '';
  useEffect(() => {
    if (!filter) return;
    return openStream(filter, (e) => handler.current(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
