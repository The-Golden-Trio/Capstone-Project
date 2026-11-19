import { fireEvent, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { api } from '../../api';
import { JournalTab } from './JournalTab';

it('giữ điểm ca và đường tổng kết, hiện thẳng điểm cộng trừ từng nhóm', async () => {
  await signInDemo();
  const record = await api.progress.record();
  record.journal = [
    {
      runId: 'shift-1',
      date: '2026-11-17',
      path: 'Back-end · Cấp 3',
      index: 1,
      title: 'Ca sự cố',
      score: 80,
      deltas: [{ id: 'giao_tiep_hop_tac', delta: -20 }],
    },
  ];
  renderWithProviders(<JournalTab record={record} />, '/profile?tab=nhat-ky');
  expect(screen.getByText('Điểm ca: 80/100')).toBeTruthy();
  expect(
    screen.getByRole('link', { name: '#1 · Ca sự cố' }).getAttribute('href'),
  ).toBe('/play/shift-1/summary');
  expect(screen.getByText(/Giao tiếp −20/)).toBeTruthy();
  expect(screen.getByText(/Giao tiếp −20/).closest('details')).toBeNull();
  expect(
    screen
      .getByText('Quản lý tự kể', { selector: 'summary' })
      .closest('details')?.open,
  ).toBe(false);
  fireEvent.click(screen.getByText('Quản lý tự kể', { selector: 'summary' }));
  expect(
    screen.getByRole('button', { name: 'Xoá phần kể về bạn' }),
  ).toBeTruthy();
});

it('link quyền riêng tư mở sẵn mục xoá phần tự kể', async () => {
  await signInDemo();
  const record = await api.progress.record();
  renderWithProviders(
    <JournalTab record={record} />,
    '/profile?tab=nhat-ky#quyen-rieng-tu',
  );
  expect(
    screen
      .getByText('Quản lý tự kể', { selector: 'summary' })
      .closest('details')?.open,
  ).toBe(true);
  expect(
    screen.getByRole('button', { name: 'Xoá phần kể về bạn' }),
  ).toBeTruthy();
});
