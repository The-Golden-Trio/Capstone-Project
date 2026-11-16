import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { api } from '../../api';
import { db } from '../../api/demo/store';
import { useSession } from '../../api/session';
import SettingsPage from './SettingsPage';

it('chỉ xoá tài khoản sau khi gõ chính xác XOÁ, rồi xoá phiên và về trang đầu', async () => {
  await signInDemo();
  const remove = vi.spyOn(api.account, 'deleteAccount');
  renderWithProviders(
    <Routes>
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/" element={<h1>Trang đầu</h1>} />
    </Routes>,
    '/settings',
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Xoá tài khoản' }));
  const dialog = within(
    await screen.findByRole('dialog', { name: 'Xoá tài khoản?' }),
  );
  const confirm = dialog.getByRole('button', { name: 'Xoá vĩnh viễn' });
  for (const text of ['', 'XOA', 'xoá', 'XOÁ ']) {
    fireEvent.change(dialog.getByLabelText('Gõ XOÁ'), {
      target: { value: text },
    });
    fireEvent.click(confirm);
    expect(dialog.getByText('Bạn cần gõ chính xác XOÁ.')).toBeTruthy();
    expect(remove).not.toHaveBeenCalled();
    expect(db.players).toHaveLength(1);
  }
  fireEvent.click(dialog.getByRole('button', { name: 'Huỷ' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Xoá tài khoản' }));
  const reopened = within(
    screen.getByRole('dialog', { name: 'Xoá tài khoản?' }),
  );
  expect((reopened.getByLabelText('Gõ XOÁ') as HTMLInputElement).value).toBe(
    '',
  );
  fireEvent.change(reopened.getByLabelText('Gõ XOÁ'), {
    target: { value: 'XOÁ' },
  });
  fireEvent.click(reopened.getByRole('button', { name: 'Xoá vĩnh viễn' }));
  expect(
    await screen.findByRole('heading', { name: 'Trang đầu' }),
  ).toBeTruthy();
  expect(remove).toHaveBeenCalledTimes(1);
  expect(db.players).toHaveLength(0);
  expect(useSession.getState().accessToken).toBeNull();
  expect(localStorage.getItem('jq:refresh')).toBeNull();
});
