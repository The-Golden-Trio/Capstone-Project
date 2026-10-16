/**
 * Chấm phần câu chọn của Get to Know Me.
 *
 * Máy khách chỉ gửi "chọn vế nào, mức nào"; tín hiệu tra từ bộ câu hỏi ở
 * đây. Nhờ vậy chân dung là suy ra được chứ không phải con số khai báo, và cả
 * máy chủ lẫn test dùng chung đúng một luật.
 *
 * Phần tự luận không chấm ở đây: AI đọc nó, rồi `acceptTextReading` lọc lại.
 */
import type { Quiz, QuizQuestion } from '../data/schema.js';
import { applySignal, blankFit, type FitVector } from './fit.js';
import { WORKSTYLE_AXES, blankTallies, type AxisTallies } from './workstyle.js';

/** Hai mức trả lời một câu chọn: "rất đúng" và "hơi đúng". */
export const QUIZ_STRENGTHS = [1, 0.5] as const;
export type QuizStrength = (typeof QUIZ_STRENGTHS)[number];

export interface QuizChoice {
  questionId: string;
  optionId: string;
  /** Mặc định 1 — bộ câu hỏi cũ chưa có mức. */
  strength?: number;
}

export interface QuizTextAnswer {
  questionId: string;
  text: string;
}

export interface QuizChoiceScore {
  fit: FitVector;
  /** Hai trục World-of-Work từ các câu chọn. */
  axes: AxisTallies;
  /** `option_id` của câu giai đoạn, nếu người chơi đã trả lời. */
  stage: string | null;
}

export class QuizAnswerError extends Error {}

export const questionsOfKind = (
  quiz: Quiz,
  kind: QuizQuestion['kind'],
): QuizQuestion[] => quiz.questions.filter((q) => q.kind === kind);

/** Cộng tín hiệu 8 chiều và hai trục World-of-Work. Lựa chọn lạ thì ném lỗi. */
export function scoreQuizChoices(
  choices: readonly QuizChoice[],
  quiz: Quiz,
): QuizChoiceScore {
  let fit = blankFit();
  const axes = blankTallies();
  let stage: string | null = null;

  for (const choice of choices) {
    const question = quiz.questions.find(
      (q) => q.question_id === choice.questionId,
    );
    const option = question?.options.find(
      (o) => o.option_id === choice.optionId,
    );
    if (!question || !option || question.kind === 'text') {
      throw new QuizAnswerError(
        `Câu trả lời không hợp lệ: ${choice.questionId}/${choice.optionId}`,
      );
    }
    if (question.kind === 'stage') {
      stage = option.option_id;
      continue;
    }

    const strength = choice.strength ?? 1;
    if (!(QUIZ_STRENGTHS as readonly number[]).includes(strength)) {
      throw new QuizAnswerError(`Mức trả lời không hợp lệ: ${strength}`);
    }
    fit = applySignal(
      fit,
      Object.fromEntries(
        Object.entries(option.signal).map(([d, v]) => [d, v * strength]),
      ),
    );
    for (const axis of WORKSTYLE_AXES) {
      const value =
        axis === 'peopleThings' ? option.people_things : option.data_ideas;
      if (value === undefined) continue;
      axes[axis].sum += value * strength;
      axes[axis].n += 1;
    }
  }

  return { fit, axes, stage };
}

/** Kiểm độ dài câu tự luận theo giới hạn của từng câu. Trả câu đã cắt khoảng trắng. */
export function checkQuizTexts(
  answers: readonly QuizTextAnswer[],
  quiz: Quiz,
): QuizTextAnswer[] {
  return answers.map((answer) => {
    const question = quiz.questions.find(
      (q) => q.question_id === answer.questionId && q.kind === 'text',
    );
    if (!question) {
      throw new QuizAnswerError(`Không có câu tự luận ${answer.questionId}`);
    }
    const text = answer.text.trim();
    const min = question.min_length ?? 0;
    const max = question.max_length ?? Infinity;
    if (text.length < min || text.length > max) {
      throw new QuizAnswerError(
        `Câu ${answer.questionId} cần từ ${min} đến ${max} ký tự`,
      );
    }
    return { questionId: answer.questionId, text };
  });
}
