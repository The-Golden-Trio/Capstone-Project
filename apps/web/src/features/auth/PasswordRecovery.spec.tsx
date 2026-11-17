import { renderWithProviders } from '../../test/renderWithProviders';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { api } from '../../api';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';

it('gửi email đặt lại mật khẩu và giữ thông báo không tiết lộ tài khoản', async () => {
  const send = vi
    .spyOn(api.auth, 'requestPasswordReset')
    .mockResolvedValue(undefined);
  renderWithProviders(<ForgotPasswordPage />);
  const submit = screen.getByRole('button', { name: 'Gửi đường dẫn' });
  expect(submit.hasAttribute('disabled')).toBe(true);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'lan@example.test' },
  });
  fireEvent.click(submit);
  expect(
    await screen.findByText('Đã gửi, bạn kiểm tra hộp thư nhé'),
  ).toBeTruthy();
  expect(send).toHaveBeenCalledWith('lan@example.test');
  expect(screen.getByText(/Nếu email này có tài khoản/)).toBeTruthy();
});

it('giữ kiểm tra mã, độ dài và mật khẩu khớp trước khi gửi; thành công có link đăng nhập', async () => {
  const reset = vi
    .spyOn(api.auth, 'confirmPasswordReset')
    .mockResolvedValue(undefined);
  const first = renderWithProviders(<ResetPasswordPage />, '/reset-password');
  expect(screen.getByText('Đường dẫn thiếu mã')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Lưu mật khẩu' })).toBeNull();
  first.unmount();
  renderWithProviders(
    <ResetPasswordPage />,
    '/reset-password?token=reset-test',
  );
  const submit = screen.getByRole('button', { name: 'Lưu mật khẩu' });
  fireEvent.click(submit);
  expect(screen.getByRole('alert').textContent).toContain(
    'Mật khẩu cần ít nhất 8 ký tự.',
  );
  expect(reset).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Mật khẩu mới'), {
    target: { value: 'mat-khau-moi' },
  });
  fireEvent.change(screen.getByLabelText('Nhập lại'), {
    target: { value: 'khac' },
  });
  fireEvent.click(submit);
  expect(screen.getByText('Hai mật khẩu chưa khớp.')).toBeTruthy();
  expect(reset).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Nhập lại'), {
    target: { value: 'mat-khau-moi' },
  });
  fireEvent.click(submit);
  expect(await screen.findByText('Đã đổi mật khẩu')).toBeTruthy();
  expect(reset).toHaveBeenCalledWith('reset-test', 'mat-khau-moi');
  expect(
    screen.getByRole('link', { name: 'Đăng nhập' }).getAttribute('href'),
  ).toBe('/sign-in');
});
