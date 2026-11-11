import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPlayApiError, type PlayApi } from '../contract';
import type { PlayStreamEvent } from '../types';
import { DEMO_SCENARIO_KEY } from './demoScenario';
import { createMockPlayApi } from './mockPlayApi';

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

let seq = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`;

describe('mockPlayApi', () => {
  let api: PlayApi;
  let events: PlayStreamEvent[];
  let close: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    seq = 0;
    api = createMockPlayApi({
      storage: memory(),
      networkMs: 0,
      gradingMs: 1000,
      summaryMs: 1000,
      uuid,
    });
    events = [];
    close = api.openEventStream((e) => events.push(e));
  });

  afterEach(() => {
    close();
    vi.useRealTimers();
  });

  const start = async () => {
    const run = await api.startRun({
      enrolmentId: 'demo',
      taskId: DEMO_SCENARIO_KEY,
    });
    return { ...run, id: run.id ?? '' };
  };

  it('mở lượt rồi trả lại đúng lượt đang dở (NFR-03)', async () => {
    const run = await start();
    expect(run.status).toBe('IN_PROGRESS');
    expect(run.currentActivityKey).toBe('a1');
    expect((await start()).id).toBe(run.id);
  });

  it('từ chối nhiệm vụ không có trong bản demo', async () => {
    await expect(
      api.startRun({ enrolmentId: 'demo', taskId: 'OTHER' }),
    ).rejects.toMatchObject({ status: 409, code: 'SCENARIO_UNAVAILABLE' });
  });

  it('không lộ điểm của lựa chọn trong ActivityView', async () => {
    const run = await start();
    const view = await api.getCurrentActivity(run.id);
    expect(view.taskType).toBe('PRIORITIZING');
    expect(view.pickCount).toBe(2);
    expect(view.npc?.name).toBe('Hà');
    expect(JSON.stringify(view)).not.toMatch(/must_pick|optionGrade|anchors/);
  });

  it('câu đóng: chấm ngay 0/1/2, gợi ý không hạ điểm', async () => {
    const run = await start();
    const hint = await api.viewHint(run.id, 'a1');
    expect(hint.hintUsed).toBe(true);

    const res = await api.submitAnswer(run.id, {
      answerId: uuid(),
      activityKey: 'a1',
      selection: ['i2', 'i3'],
    });
    expect(res.status).toBe(200);
    if (res.status === 202) throw new Error('unreachable');
    expect(res.body.score).toBe(2);
    expect(res.body.hintUsed).toBe(true);
    expect(res.body.nextActivityKey).toBe('a2');
  });

  it('câu sai luật: 422 ANSWER_INVALID, không đổi trạng thái', async () => {
    const run = await start();
    const err = await api
      .submitAnswer(run.id, {
        answerId: uuid(),
        activityKey: 'a1',
        selection: ['i2'],
      })
      .catch((e: unknown) => e);
    expect(isPlayApiError(err) && err.code).toBe('ANSWER_INVALID');
    expect((await api.getRun(run.id)).currentActivityKey).toBe('a1');
  });

  it('gửi lại cùng answerId thì nhận lại kết quả cũ (NFR-04)', async () => {
    const run = await start();
    const input = {
      answerId: uuid(),
      activityKey: 'a1',
      selection: ['i1', 'i4'],
    };
    const first = await api.submitAnswer(run.id, input);
    const again = await api.submitAnswer(run.id, input);
    expect(again).toEqual(first);
    expect(first.status === 200 && first.body.score).toBe(0);
  });

  it('chơi trọn màn: tự luận 202 → sự kiện, rồi tổng kết', async () => {
    const run = await start();
    const id = run.id;
    await api.submitAnswer(id, {
      answerId: uuid(),
      activityKey: 'a1',
      selection: ['i2', 'i3'],
    });
    await api.submitAnswer(id, {
      answerId: uuid(),
      activityKey: 'a2',
      selection: '0',
    });
    await api.submitAnswer(id, {
      answerId: uuid(),
      activityKey: 'a3',
      selection: ['s1', 's2', 's3', 's4', 's5'],
    });

    // Câu yếu → An hỏi vặn một lượt.
    const res = await api.submitAnswer(id, {
      answerId: uuid(),
      activityKey: 'a4',
      text: 'Em xong rồi ạ',
    });
    expect(res.status).toBe(202);
    // Đang chấm thì chưa nhận câu mới.
    await expect(
      api.submitAnswer(id, {
        answerId: uuid(),
        activityKey: 'a4',
        followupNo: 1,
        text: 'abc',
      }),
    ).rejects.toMatchObject({ status: 409 });

    await vi.advanceTimersByTimeAsync(2000);
    expect(events.map((e) => e.type)).toEqual([
      'answer.graded',
      'followup.asked',
    ]);
    const asked = events[1];
    expect(asked.type === 'followup.asked' && asked.payload.name).toBe('An');
    const graded = events[0];
    expect(graded.type === 'answer.graded' && graded.payload.score).toBe(0);

    await api.submitAnswer(id, {
      answerId: uuid(),
      activityKey: 'a4',
      followupNo: 1,
      text: 'Em đã sửa bug 500 ở /profile bằng LEFT JOIN và viết test trước. Có một chỗ em chưa chắc, anh xem giúp em nhé.',
    });
    await vi.advanceTimersByTimeAsync(2000);
    expect(events.slice(2).map((e) => e.type)).toEqual([
      'answer.graded',
      'activity.closed',
    ]);

    expect((await api.getRun(id)).currentActivityKey).toBeNull();
    const finish = await api.finishRun(id);
    expect(finish.status).toBe(202);
    await vi.advanceTimersByTimeAsync(1500);
    expect(events.at(-1)?.type).toBe('summary.ready');

    const summary = await api.getRunSummary(id);
    expect(summary.ending?.type).toBe('GOOD');
    expect(summary.pointsEarned).toEqual({ expertise: 4, softSkill: 4 });
    expect(summary.result).toMatch(/4 làm tốt/);
    expect((await api.getRun(id)).status).toBe('FINISHED');
  });

  it('giữ sự kiện khi chưa ai nghe, giao khi có người nghe lại', async () => {
    close();
    const run = await start();
    for (const [key, selection] of [
      ['a1', ['i2', 'i3']],
      ['a2', '0'],
      ['a3', ['s1', 's2', 's3', 's4', 's5']],
    ] as const)
      await api.submitAnswer(run.id, {
        answerId: uuid(),
        activityKey: key,
        selection: selection as string | string[],
      });
    await api.submitAnswer(run.id, {
      answerId: uuid(),
      activityKey: 'a4',
      text: 'Em xong rồi ạ',
    });
    await vi.advanceTimersByTimeAsync(5000);
    expect(events).toHaveLength(0);

    close = api.openEventStream((e) => events.push(e));
    await vi.advanceTimersByTimeAsync(10);
    expect(events.map((e) => e.type)).toEqual([
      'answer.graded',
      'followup.asked',
    ]);
  });

  it('nhà cung cấp chậm: báo provider.delay trước kết quả', async () => {
    close();
    api = createMockPlayApi({
      storage: memory(),
      networkMs: 0,
      gradingMs: 1000,
      slowProvider: true,
      uuid,
    });
    close = api.openEventStream((e) => events.push(e));
    const run = await start();
    for (const [key, selection] of [
      ['a1', ['i2', 'i3']],
      ['a2', '0'],
      ['a3', ['s1', 's2', 's3', 's4', 's5']],
    ] as const)
      await api.submitAnswer(run.id, {
        answerId: uuid(),
        activityKey: key,
        selection: selection as string | string[],
      });
    await api.submitAnswer(run.id, {
      answerId: uuid(),
      activityKey: 'a4',
      text: 'Em xong rồi ạ',
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(events.map((e) => e.type)).toEqual(['provider.delay']);
    await vi.advanceTimersByTimeAsync(3000);
    expect(events.map((e) => e.type)).toContain('answer.graded');
  });
});
