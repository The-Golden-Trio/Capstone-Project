import { renderWithProviders } from '../../test/renderWithProviders';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameKit } from './GameKit';

describe('Game kit cartoon', () => {
  it('có sáu avatar, năm bối cảnh và tên token để đối chiếu', () => {
    renderWithProviders(<GameKit />);
    expect(screen.getAllByRole('img', { name: /^Chân dung/ })).toHaveLength(6);
    expect(screen.getAllByRole('img', { name: /^Bối cảnh/ })).toHaveLength(5);
    expect(screen.getByText('toon-paper')).toBeTruthy();
    expect(screen.getByText('#fffaf0')).toBeTruthy();
    expect(screen.getByText('Baloo 2 · tiêu đề và nút')).toBeTruthy();
    expect(screen.getByText('Nunito · nội dung')).toBeTruthy();
    expect(
      screen
        .getByRole('group', {
          name: 'Bây giờ 11:30, hạn 12:00, còn 6 điểm thời gian',
        })
        .getAttribute('data-state'),
    ).toBe('late');
  });

  it('đổi emote và chuyển động nhân vật, cho phép trở về bình thường', () => {
    renderWithProviders(<GameKit />);
    const chooser = within(
      screen.getByRole('group', { name: 'Đổi biểu cảm nhân vật' }),
    );
    expect(chooser.getAllByRole('button')).toHaveLength(8);
    fireEvent.click(chooser.getByRole('button', { name: 'Khó chịu' }));
    expect(screen.getByText('Anh Hải · Khó chịu')).toBeTruthy();
    expect(
      screen
        .getByRole('figure', { name: 'Nhân vật mẫu · Anh Hải' })
        .firstElementChild?.classList.contains('animate-toon-shake'),
    ).toBe(true);
    fireEvent.click(chooser.getByRole('button', { name: 'Bình thường' }));
    expect(screen.getByText('Anh Hải · Bình thường')).toBeTruthy();
    expect(
      within(
        screen.getByRole('figure', { name: 'Nhân vật mẫu · Anh Hải' }),
      ).queryByRole('img'),
    ).toBeNull();
  });

  it('ô nhập nối lỗi với trường; gõ tên và lưu chỉ cập nhật bản mẫu', () => {
    renderWithProviders(<GameKit />);
    const recipient = screen.getByRole('textbox', {
      name: 'Người nhận ghi chú',
    });
    expect(recipient.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe(
      'Điền tên đồng nghiệp nhận ghi chú.',
    );
    fireEvent.change(recipient, { target: { value: 'Chị Vy' } });
    expect(screen.queryByRole('alert')).toBeNull();
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'Đã đối chiếu số liệu trong log',
    });
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu ghi chú mẫu' }));
    expect(
      screen.getByRole('status', { name: 'Phản hồi form mẫu' }).textContent,
    ).toBe('Đã lưu ghi chú mẫu gửi Chị Vy.');
  });

  it('chuyển tab bằng bàn phím, tăng tiến độ có chặn trần và chọn mức thích', () => {
    renderWithProviders(<GameKit />);
    const tabs = within(
      screen.getByRole('tablist', { name: 'Sổ công việc mẫu' }),
    );
    fireEvent.keyDown(tabs.getByRole('tab', { name: 'Ca hôm nay' }), {
      key: 'ArrowRight',
    });
    expect(screen.getByRole('tabpanel').textContent).toContain(
      'thời gian trả lời tăng từ 0,2 giây lên 4 giây',
    );
    const progress = screen.getByRole('progressbar', {
      name: 'Việc đã hoàn tất',
    });
    const increment = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Đánh dấu thêm một việc',
    });
    fireEvent.click(increment);
    fireEvent.click(increment);
    fireEvent.click(increment);
    expect(progress.getAttribute('aria-valuenow')).toBe('5');
    expect(increment.disabled).toBe(true);
    const likes = within(
      screen.getByRole('radiogroup', { name: 'Cảm nhận về việc đọc log' }),
    );
    fireEvent.click(likes.getByRole('radio', { name: 'Thích' }));
    expect(
      likes.getByRole('radio', { name: 'Thích' }).getAttribute('aria-checked'),
    ).toBe('true');
  });

  it('mở và đóng Dialog theme toon bằng hành động trong hộp thoại', () => {
    renderWithProviders(<GameKit />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Mở hộp thoại cartoon' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Tạm dừng để kiểm tra' });
    expect(dialog.classList.contains('theme-toon')).toBe(true);
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Tiếp tục ca mẫu' }),
    );
    expect(
      screen.queryByRole('dialog', { name: 'Tạm dừng để kiểm tra' }),
    ).toBeNull();
  });
});
