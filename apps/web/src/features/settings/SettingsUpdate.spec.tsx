import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { player } from '../../api/demo/store';
import SettingsPage from './SettingsPage';

it('lưu tên, giai đoạn và kiểm tra xác nhận mật khẩu trước khi gửi', async () => {
  await signInDemo();
  renderWithProviders(<SettingsPage />, '/settings');
  fireEvent.change(await screen.findByLabelText('Tên hiển thị'), {
    target: { value: '  An  ' },
  });
  fireEvent.change(screen.getByLabelText('Giai đoạn đang ở'), {
    target: { value: 'sinh_vien' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu hồ sơ' }));
  await waitFor(() => expect(player().me.displayName).toBe('An'));
  expect(player().me.stage).toBe('sinh_vien');
  const security = screen.getByText('Bảo mật', { selector: 'summary' });
  expect(security.closest('details')?.open).toBe(false);
  fireEvent.click(security);
  fireEvent.change(screen.getByLabelText('Mật khẩu hiện tại'), {
    target: { value: 'mat-khau-123' },
  });
  fireEvent.change(screen.getByLabelText('Mật khẩu mới'), {
    target: { value: 'mat-khau-moi' },
  });
  fireEvent.change(screen.getByLabelText('Nhập lại mật khẩu mới'), {
    target: { value: 'khong-giong' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
  expect(screen.getByText(/hai ô mật khẩu mới phải giống nhau/)).toBeTruthy();
  expect(player().password).toBe('mat-khau-123');
  fireEvent.change(screen.getByLabelText('Nhập lại mật khẩu mới'), {
    target: { value: 'mat-khau-moi' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
  await waitFor(() => expect(player().password).toBe('mat-khau-moi'));
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>('Mật khẩu mới').value).toBe(
      '',
    ),
  );
});
