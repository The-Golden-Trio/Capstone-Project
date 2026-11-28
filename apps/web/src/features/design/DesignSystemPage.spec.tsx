import { renderWithProviders } from '../../test/renderWithProviders';
import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DesignSystemPage from './DesignSystemPage';
import { TEXT_PAIRS } from './DirectionFoundations';
import { contrastRatio } from './contrast';

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

describe('Art direction JobQuest', () => {
  it('hiện đủ chín mục, tương phản AA tính toán và dàn tranh thật; không gắn bộ Celestial cũ', () => {
    const { container } = renderWithProviders(<DesignSystemPage />, '/design');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Art direction JobQuest',
    );
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(9);
    const toc = screen.getByRole('navigation', {
      name: 'Mục lục art direction',
    });
    const links = within(toc).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/design#nguyen-tac',
      '/design#luat',
      '/design#logo',
      '/design#mau',
      '/design#chu',
      '/design#motif-dem',
      '/design#tranh-ngay',
      '/design#thanh-phan',
      '/design#mau-man',
    ]);
    links.forEach((link) =>
      expect(
        container
          .querySelector('#' + (link.getAttribute('href')?.split('#')[1] ?? ''))
          ?.getAttribute('aria-labelledby'),
      ).toBeTruthy(),
    );
    expect(TEXT_PAIRS).toHaveLength(8);
    for (const pair of TEXT_PAIRS)
      expect(
        contrastRatio(pair.foreground, pair.background),
      ).toBeGreaterThanOrEqual(4.5);
    expect(
      within(
        screen.getByRole('list', { name: 'Cặp màu chữ đạt AA' }),
      ).getAllByRole('listitem'),
    ).toHaveLength(8);
    expect(screen.getAllByRole('img', { name: /^Chân dung/ })).toHaveLength(6);
    expect(screen.getAllByRole('img', { name: /^Bối cảnh/ })).toHaveLength(5);
    expect(
      screen.getByRole('img', { name: 'La bàn Golden Trio' }),
    ).toBeTruthy();
    expect(screen.getByRole('img', { name: 'La bàn 24px' })).toBeTruthy();
    expect(
      container.querySelectorAll('[data-night-scene]').length,
    ).toBeGreaterThanOrEqual(4);
    expect(screen.queryByText('Celestial Night')).toBeNull();
    const samples = screen.getByRole('region', { name: 'Mẫu màn' });
    expect(
      within(samples)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/',
      '/galaxy',
      '/occupations/SWE_BACKEND',
      '/welcome',
      '/quiz',
      '/profile',
    ]);
  });

  it('mở Dialog, xác nhận, báo toast và trả focus; không gọi API', async () => {
    const network = vi.spyOn(globalThis, 'fetch');
    renderWithProviders(<DesignSystemPage />, '/design');
    const trigger = screen.getByRole('button', { name: 'Mở Dialog' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = within(
      screen.getByRole('dialog', { name: 'Một khoảng dừng' }),
    );
    expect(dialog.getByText(/Đây là hộp thoại minh hoạ/)).toBeTruthy();
    fireEvent.click(dialog.getByRole('button', { name: 'Đã hiểu' }));
    expect(await screen.findByText('Đã xác nhận thao tác mẫu')).toBeTruthy();
    expect(
      screen.queryByRole('dialog', { name: 'Một khoảng dừng' }),
    ).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(network).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo mẫu' }));
    expect(
      screen.queryByRole('status', { name: 'Phản hồi thao tác mẫu' }),
    ).toBeNull();
  });

  it('Sheet xử lý cancel từ Escape và tab quiet đổi nội dung bằng bàn phím', () => {
    renderWithProviders(<DesignSystemPage />, '/design');
    fireEvent.click(screen.getByRole('button', { name: 'Mở Sheet' }));
    const sheet = screen.getByRole('dialog', { name: 'Chi tiết bản mẫu' });
    expect(within(sheet).getByRole('button', { name: 'Đóng' })).toBeTruthy();
    fireEvent(sheet, new Event('cancel', { cancelable: true }));
    expect(
      screen.queryByRole('dialog', { name: 'Chi tiết bản mẫu' }),
    ).toBeNull();
    const quiet = within(
      screen.getByRole('tablist', { name: 'Tab quiet mẫu' }),
    );
    fireEvent.keyDown(quiet.getByRole('tab', { name: 'Nhiệm vụ' }), {
      key: 'ArrowRight',
    });
    expect(
      quiet.getByRole('tab', { name: 'Ghi chú' }).getAttribute('aria-selected'),
    ).toBe('true');
    expect(
      screen.getByText('Ghi lại thời điểm và điều bạn muốn hỏi.'),
    ).toBeTruthy();
  });
});
