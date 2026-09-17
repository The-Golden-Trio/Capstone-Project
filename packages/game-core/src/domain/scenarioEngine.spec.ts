/**
 * Máy chạy màn chơi là nơi điểm kỹ năng sinh ra, mà điểm kỹ năng quyết định
 * cấp bậc nào mở — nên đây là phần phải đúng.
 *
 * Hai nhóm kiểm tra:
 *   1. Luật chơi cho đúng kết cục và đúng điểm.
 *   2. Tính tất định — cùng hạt giống và cùng chuỗi hành động thì cho cùng
 *      kết quả. Đây là điều kiện để máy chủ chạy lại lượt chơi của máy khách
 *      rồi chấm, thay vì tin vào điểm máy khách gửi lên.
 */
import { describe, expect, it } from 'vitest';
import { findScenario } from '../data/indexes.js';
import { keywordGrader } from './grading/keywordGrader.js';
import {
  gradeOrdering,
  gradePrioritizing,
} from './grading/structuredGrading.js';
import { mulberry32 } from './rng.js';
import {
  currentActivity,
  pointsEarned,
  runReducer,
  startRun,
  type EngineDeps,
  type RunAction,
  type RunState,
} from './scenarioEngine.js';

const depsWith = (seed: number): EngineDeps => ({
  grader: keywordGrader,
  rng: mulberry32(seed),
  now: () => 1_000_000,
});

/** Chạy một chuỗi hành động từ đầu, đúng như máy chủ sẽ làm khi chấm. */
function replay(
  scenarioKey: string,
  actions: RunAction[],
  seed: number,
): RunState {
  const deps = depsWith(seed);
  let state = startRun(scenarioKey, deps);
  for (const action of actions) state = runReducer(state, action, deps);
  return state;
}

const L1 = 'SWE_BACKEND_L1_S_EXEC';
const L3 = 'SWE_BACKEND_L3_S_INCIDENT';

describe('chấm các hoạt động có đáp án cấu trúc', () => {
  const entry = findScenario('SWE_BACKEND', 'L1');
  const ordering = entry?.scenario.activities.find((a) => a.type === 'ORDERING');
  const prioritizing = entry?.scenario.activities.find(
    (a) => a.type === 'PRIORITIZING',
  );

  it('ORDERING: đúng thứ tự là +2, đảo ngược là -1', () => {
    if (!ordering?.correct_order) throw new Error('thiếu hoạt động ORDERING');
    expect(gradeOrdering(ordering, ordering.correct_order).anchor).toBe('+2');
    expect(
      gradeOrdering(ordering, [...ordering.correct_order].reverse()).anchor,
    ).toBe('-1');
  });

  it('PRIORITIZING: bắt buộc, nên chọn, và cấm chọn', () => {
    if (!prioritizing) throw new Error('thiếu hoạt động PRIORITIZING');
    expect(gradePrioritizing(prioritizing, ['i2', 'i3']).anchor).toBe('+2');
    expect(gradePrioritizing(prioritizing, ['i2', 'i1']).anchor).toBe('0');
    expect(gradePrioritizing(prioritizing, ['i2', 'i5']).anchor).toBe('-1');
    expect(gradePrioritizing(prioritizing, ['i1', 'i3']).anchor).toBe('-1');
  });
});

describe('một lượt chơi trọn vẹn', () => {
  /** Lượt chơi tốt ở L1: chọn đúng, sắp đúng, và tự nêu ra "bí mật". */
  const goodRun: RunAction[] = [
    { type: 'TOGGLE_PICK', itemId: 'i2' },
    { type: 'TOGGLE_PICK', itemId: 'i3' },
    { type: 'ANSWER_PRIORITIZING' },
    { type: 'CONTINUE' },
    { type: 'ANSWER_CHOICE', optionIndex: 0 },
    { type: 'CONTINUE' },
  ];

  it('chọn quá số lượng cho phép thì bị bỏ qua', () => {
    const deps = depsWith(1);
    let s = startRun(L1, deps);
    s = runReducer(s, { type: 'TOGGLE_PICK', itemId: 'i2' }, deps);
    s = runReducer(s, { type: 'TOGGLE_PICK', itemId: 'i3' }, deps);
    s = runReducer(s, { type: 'TOGGLE_PICK', itemId: 'i1' }, deps);
    expect(s.picked).toEqual(['i2', 'i3']);
  });

  it('xem gợi ý thì hạ trần +2 xuống 0', () => {
    const deps = depsWith(1);
    let s = startRun(L1, deps);
    s = runReducer(s, { type: 'USE_HINT' }, deps);
    s = runReducer(s, { type: 'TOGGLE_PICK', itemId: 'i2' }, deps);
    s = runReducer(s, { type: 'TOGGLE_PICK', itemId: 'i3' }, deps);
    s = runReducer(s, { type: 'ANSWER_PRIORITIZING' }, deps);
    expect(s.evidence[0].anchor).toBe('0');
    expect(s.evidence[0].capped).toBe(true);
  });

  it('chạm được "bí mật" thì mở kết cục SECRET', () => {
    const actions: RunAction[] = [
      ...goodRun,
      // đưa ORDERING về đúng thứ tự
      { type: 'MOVE_ITEM', index: 1, direction: -1 },
      { type: 'MOVE_ITEM', index: 3, direction: -1 },
      { type: 'MOVE_ITEM', index: 2, direction: -1 },
      { type: 'MOVE_ITEM', index: 4, direction: -1 },
      { type: 'MOVE_ITEM', index: 3, direction: -1 },
      { type: 'ANSWER_ORDERING' },
      { type: 'CONTINUE' },
      {
        type: 'ANSWER_TEXT',
        text: 'Lỗi 500 ở API profile khi avatar rỗng, em sửa câu join và viết test, mở PR cho anh xem. Em chưa chắc còn chỗ khác có lỗi này không, có nên rà thêm các endpoint tương tự không ạ?',
      },
      { type: 'CONTINUE' },
      { type: 'CONTINUE' },
    ];
    const state = replay(L1, actions, 42);
    expect(state.secret).toBe(true);
    expect(state.phase).toBe('ended');
    expect(state.ending?.type).toBe('SECRET');
    expect(pointsEarned(state)).toBeGreaterThan(0);
  });

  it('hết giờ ở hoạt động có đếm ngược thì ghi -1', () => {
    const deps = depsWith(1);
    let s = startRun(L3, deps);
    const activity = currentActivity(s);
    if (activity.quick_action) {
      expect(s.deadline).toBe(
        1_000_000 + (activity.time_limit_seconds ?? 0) * 1000,
      );
    }
    s = runReducer(s, { type: 'TIMEOUT' }, deps);
    expect(s.minus1).toBe(1);
    expect(s.evidence[0].timeout).toBe(true);
    expect(s.phase).toBe('closing');
  });

  it('trả lời tệ thì ra kết cục xấu, không chạm bí mật', () => {
    const deps = depsWith(7);
    let s = startRun(L3, deps);
    let guard = 0;
    while (s.phase !== 'ended' && guard++ < 40) {
      const a = currentActivity(s);
      if (s.phase === 'main' && a.type === 'CHOICE')
        s = runReducer(
          s,
          { type: 'ANSWER_CHOICE', optionIndex: (a.options?.length ?? 1) - 1 },
          deps,
        );
      else if (s.phase === 'main' || s.phase === 'followup')
        s = runReducer(s, { type: 'ANSWER_TEXT', text: 'tăng ram là xong' }, deps);
      else s = runReducer(s, { type: 'CONTINUE' }, deps);
    }
    expect(s.phase).toBe('ended');
    expect(s.secret).toBe(false);
    expect(s.ending?.type).toBe('BAD');
  });
});

describe('tính tất định — nền tảng của việc máy chủ chấm lại', () => {
  const actions: RunAction[] = [
    { type: 'TOGGLE_PICK', itemId: 'i2' },
    { type: 'TOGGLE_PICK', itemId: 'i3' },
    { type: 'ANSWER_PRIORITIZING' },
    { type: 'CONTINUE' },
    { type: 'ANSWER_CHOICE', optionIndex: 0 },
    { type: 'CONTINUE' },
    { type: 'ANSWER_ORDERING' },
    { type: 'CONTINUE' },
    { type: 'ANSWER_TEXT', text: 'em sửa câu join rồi mở PR' },
    { type: 'CONTINUE' },
    { type: 'CONTINUE' },
  ];

  it('cùng hạt giống cho cùng kết quả, từng mẩu bằng chứng một', () => {
    const a = replay(L1, actions, 12345);
    const b = replay(L1, actions, 12345);
    expect(b.evidence).toEqual(a.evidence);
    expect(b.ending?.ending_id).toBe(a.ending?.ending_id);
    expect(pointsEarned(b)).toBe(pointsEarned(a));
  });

  it('mulberry32 cho cùng chuỗi số với cùng hạt giống', () => {
    const draw = (seed: number) => {
      const rng = mulberry32(seed);
      return [rng(), rng(), rng(), rng()];
    };
    expect(draw(99)).toEqual(draw(99));
    expect(draw(99)).not.toEqual(draw(100));
    for (const value of draw(1)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('hạt giống khác nhau gieo sự kiện xen ngang khác nhau', () => {
    // Chạy L3 với nhiều hạt giống; sự kiện có xác suất nên phải có lượt gặp,
    // có lượt không — nếu mọi hạt giống cho cùng kết quả thì rng không được dùng.
    const sawEvent = (seed: number) => {
      const deps = depsWith(seed);
      let s = startRun(L3, deps);
      let seen = false;
      let guard = 0;
      while (s.phase !== 'ended' && guard++ < 40) {
        if (s.phase === 'event') seen = true;
        const a = currentActivity(s);
        if (s.phase === 'main' && a.type === 'CHOICE')
          s = runReducer(s, { type: 'ANSWER_CHOICE', optionIndex: 0 }, deps);
        else if (s.phase === 'main' || s.phase === 'followup')
          s = runReducer(s, { type: 'ANSWER_TEXT', text: 'n+1 query, gộp lại bằng join' }, deps);
        else s = runReducer(s, { type: 'CONTINUE' }, deps);
      }
      return seen;
    };

    const results = [1, 2, 3, 4, 5, 6, 7, 8].map(sawEvent);
    expect(results).toContain(true);
    expect(results).toContain(false);
  });
});
