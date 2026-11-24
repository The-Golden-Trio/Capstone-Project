import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SceneView } from '../../api/types';
import { Composer } from './Composer';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const scene = {
  mode: 'node',
  await: { kind: 'node_choice' },
  node: {
    id: 'timer',
    prompt: 'Chọn cách trả lời',
    timeLimitSeconds: 10,
    options: [{ key: 'a', text: 'Phương án A' }],
  },
} as SceneView;

function setup(clockHeld: boolean) {
  const send = vi.fn().mockResolvedValue(true);
  const props = {
    scene,
    busy: false,
    locked: false,
    onSend: send,
    onOpenNode: vi.fn(),
  };
  const view = render(<Composer {...props} clockHeld={clockHeld} />);
  const rerender = (held: boolean) =>
    view.rerender(<Composer {...props} clockHeld={held} />);
  return { send, rerender };
}

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const remaining = () =>
  Number(
    screen.getByRole('timer').getAttribute('aria-label')?.match(/\d+/)?.[0],
  );

it('đồng hồ chạy và hết giờ gửi timeout khi không có lượt mẫu', async () => {
  const { send } = setup(false);
  await advance(4000);
  expect(remaining()).toBe(6);
  await advance(7000);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith({ kind: 'timeout' });
});

it('đồng hồ đứng yên khi lượt mẫu đang chờ, không hết giờ', async () => {
  const { send } = setup(true);
  await advance(60_000);
  expect(remaining()).toBe(10);
  expect(send).not.toHaveBeenCalled();
});

it('thả đồng hồ thì chạy tiếp từ chỗ đã dừng, thời gian dừng không tính vào elapsedMs', async () => {
  const { send, rerender } = setup(false);
  await advance(3000);
  rerender(true);
  await advance(45_000);
  expect(remaining()).toBe(7);
  expect(send).not.toHaveBeenCalled();

  rerender(false);
  await advance(2000);
  expect(remaining()).toBe(5);
  await act(async () => {
    screen.getByRole('button', { name: /Phương án A/ }).click();
  });
  const call = send.mock.calls[0][0];
  expect(call.kind).toBe('choose');
  expect(call.elapsedMs).toBeGreaterThanOrEqual(5000);
  expect(call.elapsedMs).toBeLessThan(5500);
});
