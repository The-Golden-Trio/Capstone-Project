import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StreamEvent } from '../api/types';
import { openStream } from './useEventStream';

const sseBody = (events: Array<{ id: string; data: StreamEvent }>) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      for (const e of events)
        controller.enqueue(
          enc.encode(
            `id: ${e.id}\nevent: ${e.data.type}\ndata: ${JSON.stringify(e.data)}\n\n`,
          ),
        );
      controller.close();
    },
  });

describe('openStream', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('chỉ giao sự kiện đúng loại và đúng scenario, nối lại kèm Last-Event-ID', async () => {
    const seen: StreamEvent[] = [];
    const lastIds: Array<string | null> = [];
    let call = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        lastIds.push(new Headers(init?.headers).get('Last-Event-ID'));
        call += 1;
        return new Response(
          call === 1
            ? sseBody([
                {
                  id: '1-0',
                  data: {
                    type: 'generation.ready',
                    scenarioId: 's1',
                    payload: {},
                  },
                },
                {
                  id: '2-0',
                  data: {
                    type: 'generation.ready',
                    scenarioId: 's2',
                    payload: {},
                  },
                },
                {
                  id: '3-0',
                  data: { type: 'draft.ready', scenarioId: 's1', payload: {} },
                },
              ])
            : sseBody([]),
          { status: 200 },
        );
      }),
    );
    const stop = openStream(
      { types: ['generation.ready'], scenarioId: 's1' },
      (e) => seen.push(e),
      5,
    );
    await vi.waitFor(() => expect(call).toBeGreaterThanOrEqual(2));
    stop();
    expect(seen).toEqual([
      { type: 'generation.ready', scenarioId: 's1', payload: {} },
    ]);
    expect(lastIds[0]).toBeNull();
    expect(lastIds[1]).toBe('3-0');
  });
});
