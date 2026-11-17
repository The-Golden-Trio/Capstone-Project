import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { player } from '../../api/demo/store';
import FeedbackPage from './FeedbackPage';

it('gửi góp ý qua demo, hiện thành công và mở lời nhắn mới với form trống', async () => {
  await signInDemo();
  renderWithProviders(<FeedbackPage />, '/feedback');
  expect(
    (screen.getByRole('button', { name: 'Gửi góp ý' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole('radio', { name: 'Lỗi' }));
  fireEvent.change(screen.getByLabelText(/Lời nhắn của bạn/), {
    target: { value: '  Mình chưa thấy chú thích của hành tinh.  ' },
  });
  fireEvent.change(screen.getByLabelText(/Màn nào/), {
    target: { value: '  /galaxy  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi góp ý' }));
  expect(await screen.findByText('Lời nhắn đã đến nơi')).toBeTruthy();
  expect(screen.getByText('Đã nhận góp ý của bạn. Cảm ơn bạn!')).toBeTruthy();
  expect(player().feedback).toEqual([
    {
      category: 'bug',
      message: 'Mình chưa thấy chú thích của hành tinh.',
      page: '/galaxy',
    },
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'Gửi lời nhắn khác' }));
  expect(
    (screen.getByLabelText(/Lời nhắn của bạn/) as HTMLTextAreaElement).value,
  ).toBe('');
  expect((screen.getByLabelText(/Màn nào/) as HTMLInputElement).value).toBe('');
});
