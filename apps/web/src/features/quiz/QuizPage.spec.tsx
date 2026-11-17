import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizPage from './QuizPage';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('../../api/hooks', () => ({
  errorText: () => 'Lỗi mẫu',
  useMe: () => ({ data: { id: 'test-player' } }),
  useQuizForm: () => ({
    data: {
      cards: [
        { id: 'one', cluster: 1, text: 'Lắp chiếc kệ sách' },
        { id: 'two', cluster: 2, text: 'Vẽ một bức tranh' },
      ],
      interests: ['Đọc'],
      goals: [
        {
          id: 'goal',
          question: 'Ước mơ của bạn?',
          label: 'Đích xa',
          options: ['Giúp đỡ'],
        },
      ],
    },
  }),
  useSubmitQuiz: () => ({ mutate, isPending: false, isError: false }),
}));
function openQuiz() {
  return render(
    <MemoryRouter>
      <QuizPage />
    </MemoryRouter>,
  );
}

describe('Luồng thẻ Get to know me', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mutate.mockReset();
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });
  it('chuyển sau 250 ms, chặn nhấn lặp và khôi phục câu trả lời sau khi mở lại', () => {
    const view = openQuiz();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu 18 thẻ' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Thích' }));
    fireEvent.keyDown(
      screen.getByRole('heading', { name: 'Lắp chiếc kệ sách' }),
      { key: '1' },
    );
    expect(
      screen.queryByRole('heading', { name: 'Vẽ một bức tranh' }),
    ).toBeNull();
    act(() => vi.advanceTimersByTime(250));
    expect(
      screen.getByRole('heading', { name: 'Vẽ một bức tranh' }),
    ).toBeTruthy();
    view.unmount();
    openQuiz();
    expect(
      screen.getByRole('heading', { name: 'Vẽ một bức tranh' }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '← Thẻ trước' }));
    expect(
      screen.getByRole('radio', { name: 'Thích' }).getAttribute('aria-checked'),
    ).toBe('true');
  });
  it('trả lời bằng phím và bỏ phần kể thêm khi gửi', () => {
    sessionStorage.setItem(
      'jobquest:quiz:v1:test-player',
      JSON.stringify({
        phase: 'cards',
        index: 1,
        answers: {
          cards: { one: 1 },
          interests: ['Đọc'],
          goals: { goal: { picked: ['Giúp đỡ'], note: 'Ghi chú' } },
        },
      }),
    );
    openQuiz();
    fireEvent.keyDown(
      screen.getByRole('heading', { name: 'Vẽ một bức tranh' }),
      { key: '3' },
    );
    act(() => vi.advanceTimersByTime(250));
    expect(
      screen.getByRole('heading', { name: 'Kể một chút về bạn' }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Bỏ qua, xem kết quả luôn' }),
    );
    expect(mutate).toHaveBeenCalledWith(
      { cards: { one: 1, two: 3 }, interests: [], goals: {} },
      expect.any(Object),
    );
  });
});
