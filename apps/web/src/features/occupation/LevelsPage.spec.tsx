import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import LevelsPage from './LevelsPage';

it('chọn đảo chuyển focus và cuộn tới chi tiết cấp vừa chọn', async () => {
  await signInDemo();
  const scroll = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
  renderWithProviders(
    <Routes>
      <Route path="/occupations/:code/levels" element={<LevelsPage />} />
    </Routes>,
    '/occupations/SWE_BACKEND/levels',
  );
  const map = await screen.findByRole('region', {
    name: /^Các đảo trong lộ trình$/,
  });
  fireEvent.click(within(map).getByRole('button', { name: /Cấp 2/ }));
  const details = await screen.findByRole('article', {
    name: /^Chi tiết cấp 2$/,
  });
  await waitFor(() => expect(document.activeElement).toBe(details));
  expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
  expect(screen.getByLabelText('Đường dẫn').textContent).toContain('level=2');
});
