/**
 * Nộp bài Get to Know Me: câu chọn tra tín hiệu từ bộ câu hỏi, câu tự luận
 * AI đọc nhưng trích dẫn bịa bị bỏ, và AI hỏng thì bài vẫn được lưu.
 */
import { BadRequestException } from '@nestjs/common';
import {
  blankFit,
  createGameIndex,
  questionsOfKind,
  type TextReading,
} from '@datn/game-core';
import { fixtureData } from '@datn/game-core/testing';
import type { PortraitAi } from './ai/portrait-ai';
import { ProfileService } from './profile.service';

const index = createGameIndex(fixtureData());
const quiz = index.data.quiz;
const pairs = questionsOfKind(quiz, 'pair');
const textQ = questionsOfKind(quiz, 'text')[0];
const ANSWER = 'Mình ngồi một mình cả đêm làm đồ án game, quên cả ăn.';

function setup(ai: PortraitAi | null) {
  let row: Record<string, unknown> = { userId: 'u1', quizFit: blankFit() };
  const upsert = jest.fn(async ({ create, update }) => {
    row = { ...row, ...(row.quizDone === undefined ? create : update) };
    return row;
  });
  const prisma = {
    gameProfile: { upsert, update: jest.fn() },
    eventAnswer: { findMany: jest.fn(async () => []) },
  } as never;
  const content = { index: async () => index } as never;
  const service = new ProfileService(prisma, {} as never, content, ai);
  return { service, upsert, saved: () => row };
}

const aiReading = (reading: TextReading): PortraitAi => ({
  read: jest.fn(async () => ({ [textQ.question_id]: reading })),
  write: jest.fn(async () => null),
});

const choices = pairs.map((q) => ({
  questionId: q.question_id,
  optionId: q.options[0].option_id,
  strength: 1 as const,
}));

describe('ProfileService.submitQuiz', () => {
  it('giữ tín hiệu có trích dẫn thật, bỏ trích dẫn bịa', async () => {
    const ai = aiReading({
      signals: [
        { dimension: 'DEEP_WORK', value: 2, quote: 'ngồi một mình cả đêm' },
        { dimension: 'PEOPLE', value: 2, quote: 'rất thích họp nhóm' },
      ],
      orientation: { value: -1, quote: 'một mình' },
    });
    const { service, saved } = setup(ai);
    await service.submitQuiz('u1', {
      answers: choices,
      texts: [{ questionId: textQ.question_id, text: ANSWER }],
    });
    const row = saved();
    expect(row.quizTextFit).toMatchObject({ DEEP_WORK: 2, PEOPLE: 0 });
    expect(row.quizTextReadAt).toBeInstanceOf(Date);
    expect(row.quizTextEvidence).toMatchObject({
      signals: [{ dimension: 'DEEP_WORK' }],
      orientation: [{ value: -1 }],
    });
    expect(row.portraitBasis).toBeNull();
  });

  it('không có AI thì bài vẫn lưu, câu tự luận nằm chờ', async () => {
    const { service, saved } = setup(null);
    const view = await service.submitQuiz('u1', {
      answers: choices,
      texts: [{ questionId: textQ.question_id, text: ANSWER }],
    });
    expect(view.quizDone).toBe(true);
    expect(saved().quizTexts).toEqual({ [textQ.question_id]: ANSWER });
    expect(saved().quizTextReadAt).toBeNull();
    expect(saved().quizOrientationN).toBeGreaterThan(0);
  });

  it('từ chối câu tự luận quá ngắn và lựa chọn lạ', async () => {
    const { service } = setup(null);
    await expect(
      service.submitQuiz('u1', {
        answers: [],
        texts: [{ questionId: textQ.question_id, text: 'ngắn' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.submitQuiz('u1', {
        answers: [{ questionId: 'q1', optionId: 'zzz' }],
        texts: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
