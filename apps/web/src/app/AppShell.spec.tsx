import { renderWithProviders, signInDemo } from '../test/renderWithProviders';
import { fireEvent, screen, within } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { AppShell } from './AppShell';

it('giữ link, trạng thái trang, focus nội dung và đủ menu tài khoản', async () => {
  await signInDemo();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  renderWithProviders(
    <AppShell>
      <h1>Nội dung trang</h1>
    </AppShell>,
    '/galaxy',
  );
  const trigger = await screen.findByRole('button', { name: /^Tài khoản / });
  expect(
    screen
      .getByRole('link', { name: 'Bỏ qua thanh điều hướng' })
      .getAttribute('href'),
  ).toBe('#main');
  const navs = screen.getAllByRole('navigation', { name: 'Điều hướng chính' });
  expect(navs).toHaveLength(2);
  navs.forEach((nav) =>
    expect(
      within(nav)
        .getAllByRole('link')
        .filter((link) => link.getAttribute('aria-current') === 'page'),
    ).toHaveLength(1),
  );
  fireEvent.click(trigger);
  const menu = screen.getByRole('menu', { name: 'Tài khoản' });
  expect(
    within(menu)
      .getAllByRole('menuitem')
      .map((item) => item.textContent),
  ).toEqual([
    'Hành trang của bạn',
    'Cài đặt tài khoản',
    'Góp ý cho JobQuest',
    'Đăng xuất',
  ]);
  fireEvent.keyDown(menu, { key: 'Escape' });
  expect(document.activeElement).toBe(trigger);
  fireEvent.click(within(navs[0]).getByRole('link', { name: 'Hành trang' }));
  expect(document.activeElement).toBe(screen.getByRole('main'));
  expect(screen.getByLabelText('Đường dẫn').textContent).toBe('/profile');
});
