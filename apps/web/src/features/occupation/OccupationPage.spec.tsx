import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { assert, expect, it } from 'vitest';
import { api } from '../../api';
import OccupationPage from './OccupationPage';

it('hồ sơ nghề công khai mặt khó và mỗi đảo dẫn đúng cấp nghề', async () => {
  await signInDemo();
  const occupation = await api.catalogue.occupation('SWE_BACKEND');
  const { container } = renderWithProviders(
    <Routes>
      <Route path="/occupations/:code" element={<OccupationPage />} />
    </Routes>,
    '/occupations/SWE_BACKEND',
  );
  await screen.findByRole('heading', { name: occupation.name, level: 1 });
  const downsides = container.querySelector<HTMLElement>('#mat-kho');
  assert(downsides);
  expect(occupation.downsides.length).toBeGreaterThan(0);
  for (const downside of occupation.downsides)
    expect(within(downsides).getByText(downside)).toBeTruthy();
  const islands = container.querySelector<HTMLElement>('#lo-trinh');
  assert(islands);
  for (const level of occupation.levels) {
    expect(
      within(islands)
        .getByRole('link', { name: new RegExp(level.title) })
        .getAttribute('href'),
    ).toBe(`/occupations/SWE_BACKEND/levels?level=${level.levelNo}`);
  }
});
