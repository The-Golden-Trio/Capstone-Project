import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { api } from '../../api';
import { GoalsCard } from './GoalsCard';

it('locks cancellation during save, retains a failed draft, and clears the error for a new edit', async () => {
  await signInDemo();
  const record = await api.progress.record();
  let reject!: (reason: Error) => void;
  const update = vi.spyOn(api.progress, 'updateGoals').mockImplementationOnce(
    () =>
      new Promise<void>((_, no) => {
        reject = no;
      }),
  );
  renderWithProviders(<GoalsCard record={record} quizDone />);
  await screen.findAllByRole('definition');
  fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
  expect(document.activeElement?.tagName).toBe('INPUT');
  const note = screen.getAllByRole('textbox')[0];
  fireEvent.change(note, { target: { value: 'Thử xây dựng một sản phẩm.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu mục tiêu' }));
  await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Huỷ' }).disabled,
  ).toBe(true);
  await act(async () => reject(new Error('Không lưu được mục tiêu')));
  await screen.findByRole('alert');
  expect((note as HTMLTextAreaElement).value).toBe(
    'Thử xây dựng một sản phẩm.',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Sửa' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
  expect(screen.queryByRole('alert')).toBeNull();
});

it('waits for the refreshed record before closing and restores focus after saving', async () => {
  await signInDemo();
  const record = await api.progress.record();
  const { client } = renderWithProviders(
    <GoalsCard record={record} quizDone />,
  );
  await screen.findAllByRole('definition');
  let finish!: () => void;
  vi.spyOn(client, 'invalidateQueries').mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Lưu mục tiêu' }));
  await waitFor(() =>
    expect(client.invalidateQueries).toHaveBeenCalledTimes(2),
  );
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Huỷ' }).disabled,
  ).toBe(true);
  await act(async () => finish());
  const edit = await screen.findByRole('button', { name: 'Sửa' });
  expect(document.activeElement).toBe(edit);
  expect(screen.getByText('Đã lưu mục tiêu')).toBeTruthy();
});
