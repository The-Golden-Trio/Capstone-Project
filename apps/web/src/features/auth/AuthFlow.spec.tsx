import { renderWithProviders } from '../../test/renderWithProviders';
import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RegisterPage from './RegisterPage';
import SignInPage from './SignInPage';
import { RequireAuth } from '../../app/RequireAuth';
import { db } from '../../api/demo/store';

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
}
describe('Tài khoản explorer qua API demo', () => {
  it('kiểm các trường bắt buộc, email, mật khẩu, ngày sinh và đồng ý trước khi đăng ký', () => {
    renderWithProviders(<RegisterPage />);
    submit();
    expect(screen.getAllByRole('alert')).toHaveLength(5);
    expect(db.players).toHaveLength(0);
    fireEvent.change(screen.getByLabelText('Biệt danh'), {
      target: { value: 'Lan' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'khong-phai-email' },
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText('Ngày sinh'), {
      target: { value: '2099-01-01' },
    });
    submit();
    expect(screen.getByText('Email chưa đúng dạng.')).toBeTruthy();
    expect(screen.getByText('Mật khẩu cần ít nhất 8 ký tự.')).toBeTruthy();
    expect(screen.getByText('Ngày sinh chưa hợp lệ.')).toBeTruthy();
    expect(db.players).toHaveLength(0);
  });
  it('tạo tài khoản hợp lệ rồi chuyển đến /welcome', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/welcome" element={<h1>Chào mừng</h1>} />
      </Routes>,
      '/register',
    );
    for (const [label, value] of [
      ['Biệt danh', 'Lan'],
      ['Email', 'lan@example.test'],
      ['Mật khẩu', 'mat-khau-123'],
      ['Ngày sinh', '2004-06-12'],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole('checkbox'));
    submit();
    expect(
      await screen.findByRole('heading', { name: 'Chào mừng' }),
    ).toBeTruthy();
    expect(screen.getByLabelText('Đường dẫn').textContent).toBe('/welcome');
    expect(db.players[0].me.displayName).toBe('Lan');
  });
  it('hiện lỗi đăng nhập từ API khi sai thông tin', async () => {
    renderWithProviders(<SignInPage />);
    fireEvent.change(screen.getByLabelText('Email hoặc tên đăng nhập'), {
      target: { value: 'nobody@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(
      await screen.findByText('Email hoặc mật khẩu chưa đúng.'),
    ).toBeTruthy();
  });
  it('RequireAuth chuyển khách về đăng nhập và giữ cả đường dẫn lẫn query', async () => {
    function Destination() {
      const location = useLocation();
      return <p>{(location.state as { from: string }).from}</p>;
    }
    renderWithProviders(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<h1>Riêng tư</h1>} />
        </Route>
        <Route path="/sign-in" element={<Destination />} />
      </Routes>,
      '/profile?tab=nhat-ky',
    );
    expect(await screen.findByText('/profile?tab=nhat-ky')).toBeTruthy();
    expect(screen.getByLabelText('Đường dẫn').textContent).toBe('/sign-in');
    expect(screen.queryByRole('heading', { name: 'Riêng tư' })).toBeNull();
  });
});

it('giữ nhãn và giá trị khi hiện/ẩn mật khẩu cartoon', () => {
  renderWithProviders(<SignInPage />);
  const input = screen.getByLabelText('Mật khẩu');
  fireEvent.change(input, { target: { value: 'mat-khau-123' } });
  expect(input.getAttribute('type')).toBe('password');
  fireEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
  expect(input.getAttribute('type')).toBe('text');
  expect((input as HTMLInputElement).value).toBe('mat-khau-123');
  fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
  expect(input.getAttribute('type')).toBe('password');
});
