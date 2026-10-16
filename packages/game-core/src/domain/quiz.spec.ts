/**
 * Get to Know Me: phần câu chọn, top 5 và vị trí trên World-of-Work Map.
 *
 * Chạy trên bộ câu hỏi thật, vì điều đáng kiểm là tính chất của chính bộ
 * câu hỏi: mỗi chiều được chạm đủ số lần, và bài làm hết thì ra đúng năm nghề.
 */
import { describe, expect, it } from 'vitest';
import { fixtureIndex } from '../testing/fixture.js';
import { DIMENSIONS, blankFit, topMatches } from './fit.js';
import {
  QuizAnswerError,
  checkQuizTexts,
  questionsOfKind,
  scoreQuizChoices,
  type QuizChoice,
} from './quiz.js';
import {
  PRIOR_WEIGHT,
  WORKSTYLE_AXES,
  blankTallies,
  playAxes,
  workstyle,
  workstyleRegion,
  type AxisTallies,
} from './workstyle.js';
import { acceptTextReading } from './textSignal.js';

const game = fixtureIndex();
const quiz = game.data.quiz;
const pairs = questionsOfKind(quiz, 'pair');

const allFirst = (strength = 1): QuizChoice[] =>
  pairs.map((q) => ({
    questionId: q.question_id,
    optionId: q.options[0].option_id,
    strength,
  }));

describe('bộ câu hỏi', () => {
  it('mỗi chiều được ít nhất ba câu chọn chạm tới', () => {
    for (const d of DIMENSIONS) {
      const touched = pairs.filter((q) =>
        q.options.some((o) => (o.signal[d] ?? 0) !== 0),
      );
      expect(touched.length, d).toBeGreaterThanOrEqual(3);
    }
  });

  it('có câu tự luận, và câu nào cũng có giới hạn độ dài', () => {
    const texts = questionsOfKind(quiz, 'text');
    expect(texts.length).toBeGreaterThanOrEqual(3);
    for (const q of texts) {
      expect(q.min_length).toBeGreaterThan(0);
      expect(q.max_length).toBeGreaterThan(q.min_length ?? 0);
    }
  });
});

describe('chấm câu chọn', () => {
  it('"hơi đúng" cho đúng một nửa tín hiệu của "rất đúng"', () => {
    const strong = scoreQuizChoices(allFirst(1), quiz);
    const lean = scoreQuizChoices(allFirst(0.5), quiz);
    for (const d of DIMENSIONS)
      expect(lean.fit[d]).toBeCloseTo(strong.fit[d] / 2);
    for (const axis of WORKSTYLE_AXES) {
      expect(lean.axes[axis].sum).toBeCloseTo(strong.axes[axis].sum / 2);
      expect(lean.axes[axis].n).toBe(strong.axes[axis].n);
    }
  });

  it('câu giai đoạn không cộng gì vào chân dung', () => {
    const stage = questionsOfKind(quiz, 'stage')[0];
    const score = scoreQuizChoices(
      [{ questionId: stage.question_id, optionId: stage.options[0].option_id }],
      quiz,
    );
    expect(score.fit).toEqual(blankFit());
    expect(score.stage).toBe(stage.options[0].option_id);
  });

  it('từ chối lựa chọn lạ và mức lạ', () => {
    expect(() =>
      scoreQuizChoices([{ questionId: 'q1', optionId: 'nope' }], quiz),
    ).toThrow(QuizAnswerError);
    expect(() =>
      scoreQuizChoices(
        [{ questionId: 'q1', optionId: 'q1a', strength: 3 }],
        quiz,
      ),
    ).toThrow(QuizAnswerError);
  });

  it('câu tự luận ngắn quá hoặc dài quá thì bị từ chối', () => {
    const t = questionsOfKind(quiz, 'text')[0];
    expect(() =>
      checkQuizTexts([{ questionId: t.question_id, text: 'ngắn' }], quiz),
    ).toThrow(QuizAnswerError);
    expect(() =>
      checkQuizTexts(
        [
          {
            questionId: t.question_id,
            text: 'x'.repeat((t.max_length ?? 0) + 1),
          },
        ],
        quiz,
      ),
    ).toThrow(QuizAnswerError);
    const ok = checkQuizTexts(
      [
        {
          questionId: t.question_id,
          text: '  Làm đồ án game suốt đêm với hai bạn  ',
        },
      ],
      quiz,
    );
    expect(ok[0].text).toBe('Làm đồ án game suốt đêm với hai bạn');
  });
});

describe('top 5', () => {
  it('làm hết bài thì ra đúng năm nghề, xếp giảm dần, có lý do', () => {
    const { fit } = scoreQuizChoices(allFirst(), quiz);
    const top = topMatches(fit, game);
    expect(top).toHaveLength(5);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].score).toBeGreaterThanOrEqual(top[i].score);
    }
    for (const match of top) {
      expect(match.reasons.length).toBeLessThanOrEqual(2);
      for (const d of match.reasons) {
        expect(
          (fit[d] ?? 0) * (match.role.fit_profile[d] ?? 0),
        ).toBeGreaterThan(0);
      }
    }
  });

  it('chưa có hồ sơ thì không xếp hạng', () => {
    expect(topMatches(blankFit(), game)).toEqual([]);
  });
});

const tallies = (pt: [number, number], di: [number, number]): AxisTallies => ({
  peopleThings: { sum: pt[0], n: pt[1] },
  dataIdeas: { sum: di[0], n: di[1] },
});

describe('World-of-Work', () => {
  it('mỗi trục có đúng sáu câu chọn trong bài', () => {
    const count = (key: 'people_things' | 'data_ideas') =>
      pairs.filter((q) => q.options.some((o) => o[key] !== undefined)).length;
    expect(count('people_things')).toBe(6);
    expect(count('data_ideas')).toBe(6);
  });

  it('chưa có gì thì không có vị trí', () => {
    expect(
      workstyle({ quiz: blankTallies(), play: blankTallies() }),
    ).toBeNull();
  });

  it('chỉ có bài tự vấn thì theo đúng dấu của bài, hai trục độc lập', () => {
    const w = workstyle({
      quiz: tallies([6, 6], [-6, 6]),
      play: blankTallies(),
    });
    expect(w?.peopleThings).toBeGreaterThan(50);
    expect(w?.dataIdeas).toBeLessThan(50);
    // People + Ideas là vùng Arts (A) theo lục giác của Holland.
    expect(w?.region).toBe('A');
  });

  it('chơi càng nhiều thì lựa chọn thật càng lấn bài tự vấn', () => {
    const values = [0, PRIOR_WEIGHT, PRIOR_WEIGHT * 4].map(
      (n) =>
        workstyle({
          quiz: tallies([-6, 6], [0, 0]),
          play: tallies([2 * n, n], [0, 0]),
        })?.peopleThings ?? 0,
    );
    expect(values[0]).toBeLessThan(values[1]);
    expect(values[1]).toBeLessThan(values[2]);
    expect(values[2]).toBeGreaterThan(50);
  });

  it('luôn nằm trong 0–100', () => {
    for (const sum of [-1000, -3, 0, 3, 1000]) {
      const w = workstyle({
        quiz: tallies([sum, 1], [-sum, 1]),
        play: blankTallies(),
      });
      for (const v of [w?.peopleThings, w?.dataIdeas]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it('sáu vùng theo đúng góc của lục giác, gần tâm thì chưa có vùng', () => {
    expect(workstyleRegion(1, 0)).toBe('S');
    expect(workstyleRegion(0.5, 0.87)).toBe('E');
    expect(workstyleRegion(-0.5, 0.87)).toBe('C');
    expect(workstyleRegion(-1, 0)).toBe('R');
    expect(workstyleRegion(-0.5, -0.87)).toBe('I');
    expect(workstyleRegion(0.5, -0.87)).toBe('A');
    expect(workstyleRegion(0.1, -0.1)).toBe('center');
  });

  it('lựa chọn khi chơi quy ra hai trục, kẹp về ±2', () => {
    expect(playAxes({ PEOPLE: 3, DETAIL: 2, AMBIGUITY: 1 })).toEqual({
      peopleThings: 2,
      dataIdeas: 1,
    });
    expect(playAxes({ AMBIGUITY: 2 })).toEqual({
      peopleThings: 0,
      dataIdeas: -2,
    });
  });
});

describe('đọc câu tự luận', () => {
  const answer =
    'Mình từng ngồi cả đêm một mình sửa lỗi cho đồ án, quên cả ăn.';

  it('giữ giá trị có trích dẫn thật, bỏ trích dẫn bịa và chiều lạ', () => {
    const accepted = acceptTextReading(
      answer,
      {
        signals: [
          { dimension: 'DEEP_WORK', value: 2, quote: 'cả đêm một mình' },
          { dimension: 'PEOPLE', value: 2, quote: 'thích làm việc nhóm' },
          { dimension: 'NOPE', value: 2, quote: 'quên cả ăn' },
        ],
        people_things: { value: -1, quote: 'một mình' },
        data_ideas: { value: 1, quote: 'sửa lỗi cho đồ án' },
      },
      DIMENSIONS,
    );
    expect(accepted.signal).toEqual({ DEEP_WORK: 2 });
    expect(accepted.axes.peopleThings?.value).toBe(-1);
    expect(accepted.axes.dataIdeas?.value).toBe(1);
    expect(accepted.evidence).toHaveLength(1);
  });

  it('kẹp mỗi chiều về ±2 dù AI cho nhiều hơn', () => {
    const accepted = acceptTextReading(
      answer,
      {
        signals: [
          { dimension: 'DEEP_WORK', value: 5, quote: 'cả đêm' },
          { dimension: 'DEEP_WORK', value: 2, quote: 'MỘT MÌNH' },
        ],
        people_things: { value: -9, quote: 'không có trong câu' },
        data_ideas: { value: 9, quote: 'quên cả ăn' },
      },
      DIMENSIONS,
    );
    expect(accepted.signal['DEEP_WORK']).toBe(2);
    expect(accepted.axes.peopleThings).toBeNull();
    expect(accepted.axes.dataIdeas?.value).toBe(2);
  });
});
