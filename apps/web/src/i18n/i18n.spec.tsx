/**
 * Đổi ngôn ngữ và bước "Get to Know Me" lần đầu.
 *
 * Hai điều dễ hỏng nhất ở đây:
 *   • chuỗi chưa dịch phải rơi về tiếng Việt chứ không để lại ô trống — đây là
 *     điều kiện để dịch dần từng màn mà không làm vỡ những màn chưa đụng tới;
 *   • "bỏ qua" ở bài tự vấn cũng phải đặt xong cờ, nếu không cửa lần đầu sẽ
 *     thành một vòng lặp không thoát ra được.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageToggle } from '../components/layout/LanguageToggle';
import { MESSAGES, translate, type MessageKey } from './messages';
import { useLanguageStore } from './useT';
import { DIMENSION_EN, QUIZ_OPTION_EN, QUIZ_PROMPT_EN } from './gameContent';
import { fixtureIndex } from '@datn/game-core/testing';

const game = fixtureIndex();

beforeEach(() => {
  useLanguageStore.setState({ language: 'vi' });
});

describe('từ điển', () => {
  it('mọi khoá đều có tiếng Việt', () => {
    const missing = Object.entries(MESSAGES).filter(([, m]) => !m.vi);
    expect(missing).toEqual([]);
  });

  it('chuỗi chưa dịch thì rơi về tiếng Việt, không để trống', () => {
    for (const key of Object.keys(MESSAGES) as MessageKey[]) {
      const en = translate(key, 'en');
      expect(en.length).toBeGreaterThan(0);
    }
  });

  it('thay được biến trong chuỗi', () => {
    expect(translate('here.left', 'vi', { count: 3 })).toContain('3');
    expect(translate('here.left', 'en', { count: 3 })).toContain('3');
    // biến thiếu thì giữ nguyên chỗ trống, không in "undefined"
    expect(translate('here.left', 'vi')).not.toContain('undefined');
  });
});

describe('nội dung lấy từ bộ dữ liệu', () => {
  it('có bản tiếng Anh cho cả 8 chiều tính cách', () => {
    for (const key of Object.keys(game.data.fit_dimensions)) {
      expect(DIMENSION_EN[key], `thiếu bản dịch chiều ${key}`).toBeTruthy();
    }
  });

  it('có bản tiếng Anh cho mọi câu hỏi và mọi lựa chọn', () => {
    for (const question of game.data.quiz.questions) {
      expect(
        QUIZ_PROMPT_EN[question.question_id],
        `thiếu câu ${question.question_id}`,
      ).toBeTruthy();
      for (const option of question.options) {
        expect(
          QUIZ_OPTION_EN[option.option_id],
          `thiếu lựa chọn ${option.option_id}`,
        ).toBeTruthy();
      }
    }
  });
});

describe('nút đổi ngôn ngữ', () => {
  it('mở ra hai lựa chọn và đổi được', () => {
    render(<LanguageToggle />);
    expect(screen.getByRole('button').textContent).toContain('VI');

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('Tiếng Việt')).toBeTruthy();

    fireEvent.click(screen.getByText('English'));
    expect(useLanguageStore.getState().language).toBe('en');
    expect(screen.getByRole('button').textContent).toContain('EN');
  });

  it('đóng lại sau khi chọn', () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('English'));
    expect(screen.queryByText('Tiếng Việt')).toBeNull();
  });
});
