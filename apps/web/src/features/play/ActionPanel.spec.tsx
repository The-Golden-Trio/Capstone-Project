import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SceneView } from '../../api/types';
import { ActionList, TAP_GUARD_MS, TriggerButtons } from './ActionPanel';
import { WorkPanel } from './workbench/Panels';

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
    <ActionList
      label="Việc"
      actions={actions}
      minutesPerPoint={5}
      disabled={off}
      onPick={onPick}
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

it('bỏ qua cú chạm rơi vào danh sách việc ngay khi hộp thoại vừa khép, rồi nhận lại', () => {
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
    <WorkPanel
      scene={
        {
          actions,
          clock: { minutesPerPoint: 5 },
          notebook: { facts: [], promises: [] },
          suspended: { key: 'rewrite', label: 'Sửa lại bản vá', remaining: 2 },
        } as unknown as SceneView
      }
      goal="Mục tiêu"
      blocked={null}
      busy={false}
      onPick={vi.fn()}
    />,
  );
  expect(screen.getByText('Đang dở: Sửa lại bản vá (còn 2 lượt)')).toBeTruthy();
});

const trigger = (over: Partial<SceneView['actions'][number]>) =>
  ({
    key: 'close_shift',
    label: 'Chốt ca',
    kind: 'trigger',
    points: 0,
    enabled: true,
    ...over,
  }) as SceneView['actions'][number];

it('nút chốt vẫn hiện khi bị khoá vì chưa đủ điều kiện, nhưng biến mất khi ca đã khép', () => {
  const { rerender } = render(
    <TriggerButtons
      actions={[
        trigger({ enabled: false, reason: 'Cần làm trước: “Viết bản vá”' }),
      ]}
      ended={false}
      disabled={false}
      onPick={vi.fn()}
    />,
  );
  expect(
    screen.getByRole('button', { name: /Chốt ca/ }).hasAttribute('disabled'),
  ).toBe(true);
  rerender(
    <TriggerButtons
      actions={[trigger({ enabled: false, reason: 'Ca đã kết thúc' })]}
      ended
      disabled={false}
      onPick={vi.fn()}
    />,
  );
  expect(screen.queryByRole('button')).toBeNull();
});
