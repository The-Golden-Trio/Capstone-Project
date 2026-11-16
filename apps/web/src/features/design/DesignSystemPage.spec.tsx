import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import DesignSystemPage from './DesignSystemPage';

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {
        /* jsdom không tính giao nhau của vùng nhìn. */
      }
      disconnect() {
        /* Không có observer trình duyệt cần dọn trong jsdom. */
      }
    },
  );
});

describe('bộ thiết kế Celestial Night', () => {
  it('hiện đủ 16 phần, bảng màu có tương phản tính toán và bộ tranh đầy đủ', () => {
    renderWithProviders(<DesignSystemPage />, '/design');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'Celestial Night',
    );
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(16);
    expect(
      screen.getByRole<HTMLSelectElement>('combobox', {
        name: 'Đến phần trong bộ thiết kế',
      }).options,
    ).toHaveLength(16);
    expect(screen.getAllByText(/:1/).length).toBeGreaterThan(50);
    expect(
      screen.getAllByRole('img', { name: /Chòm sao/ }).length,
    ).toBeGreaterThanOrEqual(12);
    expect(screen.getByRole('img', { name: 'Huy hiệu ha' })).toBeTruthy();
  });

  it('mở hộp thoại, xác nhận mẫu và báo toast, không gọi API', async () => {
    renderWithProviders(<DesignSystemPage />, '/design');
    fireEvent.click(screen.getByRole('button', { name: 'Mở Dialog' }));
    const dialog = within(
      screen.getByRole('dialog', { name: 'Một khoảng dừng' }),
    );
    expect(dialog.getByText(/Đây là hộp thoại minh hoạ/)).toBeTruthy();
    fireEvent.click(dialog.getByRole('button', { name: 'Đã hiểu' }));
    expect(await screen.findByText('Đã xác nhận thao tác mẫu')).toBeTruthy();
    expect(
      screen.queryByRole('dialog', { name: 'Một khoảng dừng' }),
    ).toBeNull();
  });
});
