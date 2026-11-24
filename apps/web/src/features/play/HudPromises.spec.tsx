import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import type { SceneView } from '../../api/types';
import { Hud } from './Hud';

afterEach(cleanup);

function scene(
  time: string,
  promises: SceneView['notebook']['promises'],
): SceneView {
  return {
    clock: {
      time,
      start: '09:40',
      deadline: '12:00',
      pointsUsed: 0,
      budget: 28,
      remaining: 28,
      minutesPerPoint: 5,
    },
    hintsUsed: 0,
    notebook: { facts: [], promises },
  } as unknown as SceneView;
}

function renderHud(view: SceneView) {
  render(
    <MemoryRouter>
      <Hud
        title="Ca mẫu"
        goal="Mục tiêu"
        scene={view}
        backTo="/galaxy"
        onNotebook={vi.fn()}
        notebookCount={0}
        onHint={vi.fn()}
        hintDisabled={false}
        aiLabel="AI giả"
      />
    </MemoryRouter>,
  );
}

const promise = (id: string, label: string, status: string) => ({
  id,
  label,
  status,
});

it('hiện lời hẹn đang mở ngoài HUD, giờ trước, việc sau', () => {
  renderHud(scene('10:05', [promise('p1', 'Gọi chị Linh lúc 11:30', 'open')]));
  const chip = screen.getByText('Hẹn 11:30 · gọi chị Linh').closest('li');
  expect(chip?.getAttribute('data-promise-state')).toBe('open');
  expect(chip?.textContent).not.toContain('tới giờ');
});

it('báo sắp tới giờ trong cửa sổ giữ lời, và trễ hẹn bằng chữ chứ không chỉ màu', () => {
  renderHud(
    scene('11:25', [
      promise('p1', 'Gọi chị Linh lúc 11:30', 'open'),
      promise('p2', 'Nhắn anh An lúc 10:00', 'late'),
    ]),
  );
  expect(screen.getByText('· sắp tới giờ')).toBeTruthy();
  expect(screen.getByText('· trễ hẹn')).toBeTruthy();
});

it('hứa theo sự kiện không có giờ; lời đã giữ thì không hiện', () => {
  renderHud(
    scene('10:05', [
      promise('p1', 'Báo chị Linh khi anh An duyệt bản sửa', 'open'),
      promise('p2', 'Gọi chị Linh lúc 10:00', 'kept'),
    ]),
  );
  expect(
    screen.getByText('Hẹn · báo chị Linh khi anh An duyệt bản sửa'),
  ).toBeTruthy();
  expect(screen.queryByText(/10:00/)).toBeNull();
});
