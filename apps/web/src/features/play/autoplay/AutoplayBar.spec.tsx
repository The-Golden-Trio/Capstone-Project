import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoplayBar } from './AutoplayBar';
import type { Autoplay } from './useAutoplay';

afterEach(cleanup);

const base: Autoplay = {
  index: 15,
  total: 30,
  label: '10:50 Chọn phương án C',
  status: 'idle',
  playing: false,
  speed: 1,
  message: null,
  holdsClock: true,
  next: vi.fn(),
  togglePlaying: vi.fn(),
  toggleSpeed: vi.fn(),
};

function renderBar(autoplay: Partial<Autoplay>, onRestart = vi.fn()) {
  const onExit = vi.fn();
  render(
    <MemoryRouter>
      <AutoplayBar
        autoplay={{ ...base, ...autoplay }}
        summaryTo="/play/x/summary"
        onExit={onExit}
        onRestart={onRestart}
      />
    </MemoryRouter>,
  );
  return { onExit, onRestart };
}

describe('AutoplayBar', () => {
  it('lỗi thì báo nguyên nhân và cho bắt đầu lượt mẫu mới, vẫn thoát được', () => {
    const { onExit, onRestart } = renderBar({
      status: 'error',
      message: 'Lượt mẫu bị kẹt khi chờ phương án c.',
    });
    expect(screen.getByRole('alert').textContent).toContain('bị kẹt');
    fireEvent.click(
      screen.getByRole('button', { name: 'Bắt đầu lượt mẫu mới' }),
    );
    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Tiếp/ })).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Thoát lượt chơi mẫu' }),
    );
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('chạy bình thường thì không hiện nút bắt đầu lại', () => {
    renderBar({});
    expect(screen.getByRole('button', { name: /Tiếp/ })).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Bắt đầu lượt mẫu mới' }),
    ).toBeNull();
  });
});
