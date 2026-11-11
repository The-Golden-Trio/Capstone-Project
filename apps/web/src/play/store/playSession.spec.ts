import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setPlayApi } from '../api/playApi';
import { DEMO_SCENARIO_KEY } from '../api/mock/demoScenario';
import { createMockPlayApi } from '../api/mock/mockPlayApi';
import { usePlaySession } from './playSession';

const state = () => usePlaySession.getState();

describe('playSession', () => {
  let close: () => void;

  beforeEach(async () => {
    vi.useFakeTimers();
    sessionStorage.clear();
    const api = createMockPlayApi({
      networkMs: 0,
      gradingMs: 500,
      summaryMs: 500,
    });
    setPlayApi(api);
    state().reset();
    close = api.openEventStream((e) => state().handleEvent(e));
    const run = await api.startRun({
      enrolmentId: 'demo',
      taskId: DEMO_SCENARIO_KEY,
    });
    await state().open(run.id ?? '');
  });

  afterEach(() => {
    close();
    setPlayApi(null);
    vi.useRealTimers();
  });

  it('mở hoạt động đầu tiên', () => {
    expect(state().stage).toBe('answering');
    expect(state().activity?.activityKey).toBe('a1');
  });

  it('chọn quá số lượng thì không nhận thêm', () => {
    state().toggle('i1');
    state().toggle('i2');
    state().toggle('i3');
    expect(state().picked).toEqual(['i1', 'i2']);
  });

  it('câu sai luật: quay lại chờ, hiện lý do, gỡ câu khỏi hội thoại', async () => {
    state().toggle('i2');
    await state().submitPrioritizing();
    expect(state().stage).toBe('answering');
    expect(state().invalid[0]).toMatch(/đúng 2/);
    expect(state().log).toHaveLength(0);
  });

  it('gợi ý hiện lời NPC, không chặn câu trả lời', async () => {
    await state().viewHint();
    expect(state().hint?.text).toMatch(/ghi chú/);
    state().toggle('i2');
    state().toggle('i3');
    await state().submitPrioritizing();
    expect(state().stage).toBe('closing');
  });

  it('đi trọn màn qua sự kiện, tới tổng kết', async () => {
    state().toggle('i2');
    state().toggle('i3');
    await state().submitPrioritizing();
    await state().next();
    await state().submitChoice('0');
    await state().next();
    expect(state().activity?.taskType).toBe('ORDERING');
    // Thứ tự đề đã xáo; sắp lại cho đúng.
    const target = ['s1', 's2', 's3', 's4', 's5'];
    for (let i = 0; i < target.length; i++) {
      const from = state().order.indexOf(target[i]);
      for (let j = from; j > i; j--) state().move(j, -1);
    }
    expect(state().order).toEqual(target);
    await state().submitOrdering();
    await state().next();

    await state().submitText('Em xong rồi ạ');
    expect(state().stage).toBe('grading');
    await vi.advanceTimersByTimeAsync(1500);
    expect(state().stage).toBe('followup');
    expect(state().followup?.no).toBe(1);

    await state().submitText(
      'Em sửa bug 500 ở profile bằng LEFT JOIN, có test. Có chỗ em chưa chắc ạ.',
    );
    await vi.advanceTimersByTimeAsync(1500);
    expect(state().stage).toBe('closing');
    expect(state().closing?.next).toBeNull();

    await state().next();
    expect(state().stage).toBe('finishing');
    await vi.advanceTimersByTimeAsync(1000);
    expect(state().stage).toBe('finished');
  });
});
