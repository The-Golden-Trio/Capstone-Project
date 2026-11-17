import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { api } from '../../api';
import WelcomePage from './WelcomePage';

it('giữ hai buff và giới hạn của chòm sao, lưu giai đoạn rồi mở hai đường khởi hành', async () => {
  await signInDemo();
  const save = vi.spyOn(api.account, 'updateMe');
  renderWithProviders(<WelcomePage />);
  expect(
    await screen.findByRole('img', { name: 'Chòm sao Song Tử' }),
  ).toBeTruthy();
  expect(
    screen.getAllByRole('img', { name: /\+12% điểm cộng cho/ }),
  ).toHaveLength(2);
  expect(
    screen.getByText(/Chòm sao không được dùng bởi AI hay để gợi ý nghề/),
  ).toBeTruthy();
  expect(
    screen.getByText('Mặt cần để ý · Tìm hiểu thêm').closest('details')?.open,
  ).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
  const submit = screen.getByRole('button', { name: 'Lưu và tiếp tục' });
  expect(submit.hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('radio', { name: 'Sinh viên' }));
  fireEvent.click(submit);
  expect(
    await screen.findByRole('heading', {
      name: 'Bạn đã biết muốn thử nghề nào chưa?',
    }),
  ).toBeTruthy();
  expect(save).toHaveBeenCalledWith({ stage: 'sinh_vien' });
  expect(
    screen
      .getByRole('link', { name: 'Chưa biết, gợi ý giúp mình →' })
      .getAttribute('href'),
  ).toBe('/quiz');
  expect(
    screen
      .getByRole('link', { name: 'Biết rồi, vào bản đồ →' })
      .getAttribute('href'),
  ).toBe('/galaxy');
});

it('thiếu ngày sinh thì bỏ chòm sao; có thể bỏ qua giai đoạn mà không ghi API', async () => {
  await signInDemo();
  const me = await api.account.me();
  vi.spyOn(api.account, 'me').mockResolvedValue({ ...me, dateOfBirth: null });
  const save = vi.spyOn(api.account, 'updateMe');
  renderWithProviders(<WelcomePage />);
  expect(
    await screen.findByRole('heading', { name: 'Bạn đang ở giai đoạn nào?' }),
  ).toBeTruthy();
  expect(screen.queryByRole('img', { name: /Chòm sao/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
  expect(
    screen.getByRole('heading', {
      name: 'Bạn đã biết muốn thử nghề nào chưa?',
    }),
  ).toBeTruthy();
  expect(save).not.toHaveBeenCalled();
});
