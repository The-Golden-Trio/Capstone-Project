import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { api } from '../../api';
import { player } from '../../api/demo/store';
import FeedbackPage from './FeedbackPage';

it('giữ lời nhắn khi API báo lỗi, không gửi dòng trắng và cho thử lại', async () => {
  await signInDemo();
  vi.spyOn(api.feedback, 'sendAppFeedback').mockRejectedValueOnce(
    new Error('Mạng đang gián đoạn.'),
  );
  renderWithProviders(<FeedbackPage />, '/feedback');
  fireEvent.change(screen.getByLabelText(/Lời nhắn của bạn/), {
    target: { value: '   ' },
  });
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Gửi góp ý' })
      .disabled,
  ).toBe(true);
  fireEvent.change(screen.getByLabelText(/Lời nhắn của bạn/), {
    target: { value: 'Thêm gợi ý ở màn đầu.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi góp ý' }));
  expect(await screen.findByText('Mạng đang gián đoạn.')).toBeTruthy();
  expect(
    screen.getByLabelText<HTMLTextAreaElement>(/Lời nhắn của bạn/).value,
  ).toBe('Thêm gợi ý ở màn đầu.');
  fireEvent.click(screen.getByRole('button', { name: 'Gửi góp ý' }));
  await waitFor(() => expect(player().feedback).toHaveLength(1));
});
