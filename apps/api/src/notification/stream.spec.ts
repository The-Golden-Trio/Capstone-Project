import { sseFrame, StreamController } from './stream.controller';

describe('luồng SSE', () => {
  it('tin có id thì ghi dòng id để nối lại bằng Last-Event-ID', () => {
    expect(
      sseFrame({
        id: '42',
        message: { type: 'scene.changed', runId: 'r', payload: {} },
      }),
    ).toBe(
      'id: 42\ndata: {"type":"scene.changed","runId":"r","payload":{}}\n\n',
    );
    expect(
      sseFrame({
        message: {
          type: 'provider.delay',
          runId: 'r',
          turnId: 't',
          payload: { waitingFor: 'checks' },
        },
      }),
    ).not.toContain('id:');
  });

  it('nối lại: mỗi lượt có sự kiện bị lỡ nhận một scene.changed mang id mới nhất', async () => {
    const prisma = {
      runEvent: {
        groupBy: async () => [
          { runId: 'b', _max: { id: 9n } },
          { runId: 'a', _max: { id: 5n } },
        ],
      },
    };
    const controller = new StreamController({} as never, prisma as never);
    const missed = await controller.missed('u1', 3n);
    expect(missed).toEqual([
      { id: '5', message: { type: 'scene.changed', runId: 'a', payload: {} } },
      { id: '9', message: { type: 'scene.changed', runId: 'b', payload: {} } },
    ]);
  });
});
