import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SceneView } from '../../api/types';
import { ActionTray, TAP_GUARD_MS } from './ActionPanel';

const actions = [
  {
    key: 'open_log',
    label: 'Mở log API',
    kind: 'open',
    points: 1,
    enabled: true,
    target: 'log',
  },
] as unknown as SceneView['actions'];

function tray(disabled: boolean, onPick = vi.fn()) {
  const ui = (off: boolean) => (
    <ActionTray
      actions={actions}
      minutesPerPoint={5}
      disabled={off}
      onPick={onPick}
      cast={[]}
    />
  );
  const view = render(ui(disabled));
  return { onPick, rerender: (off: boolean) => view.rerender(ui(off)) };
}

function touchTap(button: HTMLElement) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: 'touch' });
  fireEvent(button, event);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('bỏ qua cú chạm rơi vào khay việc ngay khi hộp thoại vừa khép, rồi nhận lại', () => {
  const { onPick, rerender } = tray(true);
  rerender(false);
  const button = screen.getByRole('button', { name: /Mở log API/ });
  expect(button.hasAttribute('data-tap-guard')).toBe(true);

  touchTap(button);
  expect(onPick).not.toHaveBeenCalled();

  act(() => {
    vi.advanceTimersByTime(TAP_GUARD_MS + 50);
  });
  expect(button.hasAttribute('data-tap-guard')).toBe(false);
  touchTap(button);
  expect(onPick).toHaveBeenCalledTimes(1);
});

it('chuột và bàn phím không bị chặn', () => {
  const { onPick, rerender } = tray(true);
  rerender(false);
  fireEvent.click(screen.getByRole('button', { name: /Mở log API/ }));
  expect(onPick).toHaveBeenCalledTimes(1);
});

it('ghi chi phí của việc bằng lượt, giữ chú thích số phút trong ca', () => {
  tray(false);
  const cost = screen.getByText('1 lượt');
  expect(cost.getAttribute('title')).toBe('Mất khoảng 5 phút trong ca');
});

it('việc đang dở đếm bằng lượt', () => {
  render(
    <ActionTray
      actions={actions}
      minutesPerPoint={5}
      disabled={false}
      onPick={vi.fn()}
      suspended={{ label: 'Sửa lại bản vá', remaining: 2 }}
      cast={[]}
    />,
  );
  expect(screen.getByText('Đang dở: Sửa lại bản vá (còn 2 lượt)')).toBeTruthy();
});
