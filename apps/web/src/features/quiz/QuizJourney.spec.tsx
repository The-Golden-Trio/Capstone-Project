import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { assert, expect, it, vi } from 'vitest';
import { api } from '../../api';
import QuizPage from './QuizPage';
import QuizResultPage from './QuizResultPage';

it('trả lời 18 thẻ bằng phím 1/2/3, bỏ kể về bạn, xem tối đa ba gợi ý không dán nhãn', async () => {
  await signInDemo();
  const form = await api.quiz.form();
  expect(form.cards).toHaveLength(18);
  const submit = vi.spyOn(api.quiz, 'submit');
  renderWithProviders(
    <Routes>
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/quiz/result" element={<QuizResultPage />} />
    </Routes>,
    '/quiz',
  );
  fireEvent.click(
    await screen.findByRole('button', { name: 'Bắt đầu 18 thẻ' }),
  );
  for (const [i, card] of form.cards.entries()) {
    const heading = await screen.findByRole('heading', { name: card.text });
    fireEvent.keyDown(heading, { key: String((i % 3) + 1) });
  }
  await screen.findByRole('heading', { name: 'Kể một chút về bạn' });
  fireEvent.click(
    screen.getByRole('button', { name: 'Bỏ qua, xem kết quả luôn' }),
  );
  await screen.findByRole('heading', { name: 'Một vài nghề để bắt đầu' });
  const suggestions = screen
    .getByRole('heading', { name: 'Một vài nghề để bắt đầu' })
    .closest('section');
  assert(suggestions);
  const cards = within(suggestions).getAllByRole('article');
  expect(cards.length).toBeGreaterThan(0);
  expect(cards.length).toBeLessThanOrEqual(3);
  expect(submit).toHaveBeenCalledWith({
    cards: Object.fromEntries(
      form.cards.map((card, i) => [card.id, (i % 3) + 1]),
    ),
    interests: [],
    goals: {},
  });
  // Đọc dữ liệu kỳ vọng trong act để các query của màn kết quả kịp cập nhật.
  const saved = await act(async () => api.quiz.current());
  assert(saved);
  for (const [i, suggestion] of saved.suggestions.slice(0, 3).entries()) {
    const occupation = await act(async () =>
      api.catalogue.occupation(suggestion.code),
    );
    for (const downside of occupation.downsides) {
      expect(await within(cards[i]).findByText(downside)).toBeTruthy();
    }
  }
  expect(document.body.textContent).not.toMatch(/phù hợp|hợp nhất|bạn nên|%/i);
  expect(saved?.goals).toEqual({});
  expect(saved?.interests).toEqual([]);
  expect(screen.getByText(/không phải chẩn đoán/)).toBeTruthy();
  expect(
    screen.getByText(
      'Chỉ để tham khảo, không gửi cho trường hay nhà tuyển dụng.',
    ),
  ).toBeTruthy();
  const meters = screen.getAllByRole('meter');
  expect(meters).toHaveLength(6);
  for (const meter of meters) {
    expect(meter.getAttribute('aria-valuemin')).toBe('1');
    expect(meter.getAttribute('aria-valuemax')).toBe('3');
    expect(Number(meter.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(
      1,
    );
  }
  const { player } = await import('../../api/demo/store');
  expect(player().me.quizDone).toBe(true);
}, 12_000);
