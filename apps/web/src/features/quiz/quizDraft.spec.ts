import { describe, expect, it } from 'vitest';
import type { QuizForm } from '../../api/types';
import {
  emptyDraft,
  hasDistressSignal,
  parseDraft,
  toggleChoice,
} from './quizDraft';
const form: QuizForm = {
  cards: [
    { id: 'c1', cluster: 1, text: 'Lắp kệ' },
    { id: 'c2', cluster: 2, text: 'Vẽ' },
  ],
  interests: ['Đọc', 'Vẽ', 'Hát', 'Chạy', 'Nấu', 'Viết'],
  goals: [
    { id: 'g1', label: 'Đích xa', question: 'Ước mơ?', options: ['Giúp đỡ'] },
  ],
};
describe('Khôi phục bản nháp quiz', () => {
  it('chịu được JSON lỗi và dữ liệu không có', () => {
    expect(parseDraft('{', form)).toEqual(emptyDraft());
    expect(parseDraft(null, form)).toEqual(emptyDraft());
  });
  it('loại câu, lựa chọn lạ, điểm sai và giới hạn dữ liệu nhập', () => {
    const result = parseDraft(
      JSON.stringify({
        phase: 'about',
        index: 999,
        answers: {
          cards: { c1: 3, c2: 8, old: 1 },
          interests: form.interests,
          goals: { g1: { picked: ['Giúp đỡ', 'lạ'], note: 'a'.repeat(600) } },
        },
      }),
      form,
    );
    expect(result.phase).toBe('cards');
    expect(result.index).toBe(1);
    expect(result.answers.cards).toEqual({ c1: 3 });
    expect(result.answers.interests).toHaveLength(5);
    expect(result.answers.goals.g1.picked).toEqual(['Giúp đỡ']);
    expect(result.answers.goals.g1.note).toHaveLength(500);
  });
  it('khôi phục phần tùy chọn khi đã đủ câu trả lời', () => {
    expect(
      parseDraft(
        JSON.stringify({
          phase: 'about',
          answers: { cards: { c1: 1, c2: 3 } },
        }),
        form,
      ).phase,
    ).toBe('about');
  });
});
describe('Chọn chip', () => {
  it('không vượt giới hạn và vẫn bỏ chọn được khi đầy', () => {
    expect(toggleChoice(['a', 'b'], 'c', 2)).toEqual(['a', 'b']);
    expect(toggleChoice(['a', 'b'], 'a', 2)).toEqual(['b']);
    expect(toggleChoice(['a'], 'b', 2)).toEqual(['a', 'b']);
  });
});
describe('Dò tín hiệu bản nháp C4', () => {
  it.each([
    'Mình muốn chết',
    'KO MUON SONG',
    'Mình bị bắt nạt',
    'mun chet',
    'Tự làm đau bản thân',
  ])('nhận dấu, không dấu và tiếng lóng: %s', (text) =>
    expect(hasDistressSignal(text)).toBe(true),
  );
  it('không khớp từ con và đoạn bình thường', () => {
    expect(hasDistressSignal('Tự tin làm việc, thích học từng chút')).toBe(
      false,
    );
    expect(hasDistressSignal('Mình muốn đi du lịch')).toBe(false);
  });
});
