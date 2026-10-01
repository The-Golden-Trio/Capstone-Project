/**
 * Get to Know Me: phần câu chọn, top 5 và chỉ số xã hội.
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
import { PRIOR_WEIGHT, socialIndex, socialLabel } from './social.js';
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
    expect(lean.orientation.sum).toBeCloseTo(strong.orientation.sum / 2);
    expect(lean.orientation.n).toBe(strong.orientation.n);
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

describe('chỉ số xã hội', () => {
  it('chưa có gì thì không có chỉ số', () => {
    expect(
      socialIndex({ quiz: { sum: 0, n: 0 }, play: { sum: 0, n: 0 } }),
    ).toBeNull();
  });

  it('chỉ có bài tự vấn thì theo đúng dấu của bài', () => {
    const people = socialIndex({
      quiz: { sum: 6, n: 6 },
      play: { sum: 0, n: 0 },
    });
    const things = socialIndex({
      quiz: { sum: -6, n: 6 },
      play: { sum: 0, n: 0 },
    });
    expect(people?.label).toBe('people');
    expect(things?.label).toBe('things');
    expect(people?.value).toBe(100 - (things?.value ?? 0));
  });

  it('chơi càng nhiều thì lựa chọn thật càng lấn bài tự vấn', () => {
    const quizOnly = { sum: -6, n: 6 };
    const values = [0, PRIOR_WEIGHT, PRIOR_WEIGHT * 4].map(
      (n) =>
        socialIndex({ quiz: quizOnly, play: { sum: 2 * n, n } })?.value ?? 0,
    );
    expect(values[0]).toBeLessThan(values[1]);
    expect(values[1]).toBeLessThan(values[2]);
    expect(values[2]).toBeGreaterThan(50);
  });

  it('luôn nằm trong 0–100', () => {
    for (const sum of [-1000, -3, 0, 3, 1000]) {
      const v = socialIndex({
        quiz: { sum, n: 1 },
        play: { sum: 0, n: 0 },
      })?.value;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(socialLabel(35)).toBe('balanced');
    expect(socialLabel(66)).toBe('people');
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
        orientation: { value: -1, quote: 'một mình' },
      },
      DIMENSIONS,
    );
    expect(accepted.signal).toEqual({ DEEP_WORK: 2 });
    expect(accepted.orientation).toBe(-1);
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
        orientation: { value: -9, quote: 'không có trong câu' },
      },
      DIMENSIONS,
    );
    expect(accepted.signal['DEEP_WORK']).toBe(2);
    expect(accepted.orientation).toBeNull();
  });
});
