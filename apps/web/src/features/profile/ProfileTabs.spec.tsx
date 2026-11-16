import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import ProfilePage from './ProfilePage';

// Tên file riêng để không đè bộ test ProfilePage đang được agent khác bổ sung.
it('mở tab từ query và đổi tab đồng bộ URL cùng nội dung hành trang', async () => {
  await signInDemo();
  renderWithProviders(<ProfilePage />, '/profile?tab=nhat-ky&giu=1');
  const journal = await screen.findByRole('tab', { name: 'Nhật ký' });
  expect(journal.getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(
    journal.id,
  );
  for (const [key, label] of [
    ['thong-ke', 'Thống kê'],
    ['thanh-tuu', 'Thành tựu'],
    ['tong-quan', 'Tổng quan'],
    ['nhat-ky', 'Nhật ký'],
  ]) {
    const tab = screen.getByRole('tab', { name: label });
    fireEvent.click(tab);
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(
      tab.id,
    );
    expect(
      within(screen.getByRole('tabpanel')).getAllByRole('heading').length,
    ).toBeGreaterThan(0);
    const path = screen.getByLabelText('Đường dẫn').textContent ?? '';
    expect(new URL(path, 'http://localhost').searchParams.get('tab')).toBe(key);
    expect(new URL(path, 'http://localhost').searchParams.get('giu')).toBe('1');
  }
});
