import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { StaffShell } from './StaffShell';
vi.hoisted(() => vi.stubEnv('VITE_STAFF_DEMO', '1'));
vi.mock('../store/auth', () => ({
  useAuth: () => ({
    me: { id: 'demo', displayName: 'Minh Demo' },
    signOut: vi.fn(),
  }),
  portalsOf: () => ['ca', 'de'],
}));
vi.mock('./NotificationBell', () => ({
  NotificationBell: () => <button type="button">Thông báo mẫu</button>,
}));
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => undefined,
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function Probe() {
  const loc = useLocation();
  return <p aria-label="Route">{loc.pathname + loc.hash}</p>;
}
it('names the account trigger, identifies exactly one DE anchor and keeps skip/focus local', () => {
  render(
    <MemoryRouter initialEntries={['/de#review-queue']}>
      <Routes>
        <Route element={<StaffShell />}>
          <Route path="de" element={<Probe />} />
          <Route path="ca" element={<Probe />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  const nav = screen.getByRole('navigation', { name: 'Chuyên gia nghề' });
  expect(
    within(nav)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')
      .map((link) => link.textContent),
  ).toEqual(['✓Hàng duyệt']);
  const account = screen.getByRole('button', { name: 'Tài khoản Minh Demo' });
  expect(screen.getByText('Dữ liệu mẫu')).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: 'Bỏ qua tới nội dung' }));
  expect(document.activeElement).toBe(screen.getByRole('main'));
  expect(screen.getByLabelText('Route').textContent).toBe('/de#review-queue');
  account.focus();
  fireEvent.click(account);
  fireEvent.click(
    screen.getByRole('menuitem', { name: 'Chuyển sang Quản trị nội dung' }),
  );
  expect(screen.getByLabelText('Route').textContent).toBe('/ca');
  expect(document.activeElement).toBe(screen.getByRole('main'));
});
