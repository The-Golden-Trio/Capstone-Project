import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToonTurnsBar } from './ToonTurnsBar';

const props = { budget: 28, minutesPerPoint: 5 };
const fill = () =>
  screen.getByRole('progressbar').firstElementChild as HTMLElement;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ToonTurnsBar', () => {
  it('đọc được số lượt còn lại qua progressbar và nhãn ngắn', () => {
    render(<ToonTurnsBar {...props} remaining={17} />);
    const bar = screen.getByRole('progressbar', { name: 'Lượt còn lại' });
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('28');
    expect(bar.getAttribute('aria-valuenow')).toBe('17');
    expect(bar.getAttribute('aria-valuetext')).toBe(
      'còn 17/28 lượt · 1 lượt khoảng 5 phút trong ca',
    );
    expect(screen.getByText('còn 17/28 lượt')).toBeTruthy();
    expect(fill().style.width).toBe(`${(17 / 28) * 100}%`);
  });

  it.each([
    [28, 'ok', 'bg-toon-mint'],
    [15, 'ok', 'bg-toon-mint'],
    [14, 'warn', 'bg-toon-mustard'],
    [7, 'warn', 'bg-toon-mustard'],
    [6, 'low', 'bg-toon-coral'],
    [0, 'low', 'bg-toon-coral'],
  ])('còn %i/28: trạng thái %s', (remaining, state, color) => {
    render(<ToonTurnsBar {...props} remaining={remaining} />);
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe(
      state,
    );
    expect(fill().className).toContain(color);
  });

  it('kẹp giá trị sai và không sinh NaN', () => {
    render(
      <ToonTurnsBar budget={Number.NaN} remaining={5} minutesPerPoint={5} />,
    );
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '0',
    );
    expect(fill().style.width).toBe('0%');
  });

  it('hiện chi phí vừa tiêu một lúc rồi tự mất', () => {
    const { rerender, container } = render(
      <ToonTurnsBar {...props} remaining={22} />,
    );
    expect(container.querySelector('[data-turns-spent]')).toBeNull();

    rerender(<ToonTurnsBar {...props} remaining={17} />);
    expect(container.querySelector('[data-turns-spent]')?.textContent).toBe(
      '−5',
    );

    act(() => {
      vi.advanceTimersByTime(1700);
    });
    expect(container.querySelector('[data-turns-spent]')).toBeNull();
  });

  it('không hiện chi phí khi lượt không giảm', () => {
    const { rerender, container } = render(
      <ToonTurnsBar {...props} remaining={17} />,
    );
    rerender(<ToonTurnsBar {...props} remaining={17} />);
    expect(container.querySelector('[data-turns-spent]')).toBeNull();
  });
});
