import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ToonField } from '@datn/ui';
import { ReadMore, ToonPassword } from './ProfileKit';
afterEach(cleanup);
describe('thành phần form trên giấy', () => {
  it('giữ nhãn, giá trị và mô tả lỗi khi hiện/ẩn mật khẩu', () => {
    render(
      <ToonField label="Mật khẩu mới" error="Cần ít nhất 8 ký tự">
        <ToonPassword defaultValue="van-phong" />
      </ToonField>,
    );
    const input = screen.getByLabelText<HTMLInputElement>('Mật khẩu mới');
    expect(input.type).toBe('password');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(
      screen.getByText('Cần ít nhất 8 ký tự').id,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(input.type).toBe('text');
    expect(input.value).toBe('van-phong');
    fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(input.type).toBe('password');
  });
  it('giữ nguyên phần kể dài trong vùng Xem thêm, không mất nội dung', () => {
    const words = Array.from({ length: 42 }, (_, i) => `từ${i}`);
    const { container } = render(<ReadMore text={words.join(' ')} />);
    expect(container.querySelector('details')?.open).toBe(false);
    expect(screen.getByText(words.slice(35).join(' '))).toBeTruthy();
    expect(container.querySelector('summary')?.textContent).toBe('Xem thêm');
  });
});
