import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@datn/ui';
import { MemoryRouter } from 'react-router-dom';
import {
  renderWithProviders,
  LocationProbe,
} from '../../test/renderWithProviders';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import ReflectPage from './ReflectPage';

const state = vi.hoisted(() => ({
  summary: {
    data: null as null | {
      reflection: {
        answered: boolean;
        prompts: { key: string; recap: string }[];
      };
    },
    isLoading: false,
    isFetching: false,
    error: new Error('Kết nối bị gián đoạn'),
    refetch: vi.fn(),
  },
  reflect: {
    isPending: false,
    isError: false,
    error: null as Error | null,
    mutate: vi.fn(),
  },
}));
vi.mock('../../api/hooks', async (original) => ({
  ...(await original<typeof import('../../api/hooks')>()),
  useRunSummary: () => state.summary,
  useReflect: () => state.reflect,
}));
const routes = () => (
  <Routes>
    <Route path="/play/:runId/reflect" element={<ReflectPage />} />
    <Route path="/play/:runId/summary" element={<h1>Kết quả</h1>} />
  </Routes>
);
beforeEach(() => {
  state.summary.data = {
    reflection: { answered: false, prompts: [{ key: 'a', recap: 'Đọc log' }] },
  };
  state.summary.isLoading = false;
  state.summary.isFetching = false;
  state.reflect.isPending = false;
  state.reflect.isError = false;
  state.reflect.error = null;
  state.reflect.mutate.mockClear();
  state.summary.refetch.mockClear();
});
it('keeps failed reflection loading on the same route with retry and an explicit skip', () => {
  state.summary.data = null;
  renderWithProviders(routes(), '/play/a/reflect');
  expect(
    screen.getByRole('heading', { name: 'Chưa tải được phần nhìn lại' }),
  ).toBeTruthy();
  expect(screen.getByLabelText('Đường dẫn').textContent).toBe(
    '/play/a/reflect',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
  expect(state.summary.refetch).toHaveBeenCalledTimes(1);
  expect(
    screen
      .getByRole('link', { name: 'Bỏ qua và xem kết quả' })
      .getAttribute('href'),
  ).toBe('/play/a/summary');
});
it('freezes the submitted choices and skip while sending, preserves answers after failure', async () => {
  const { rerender, client } = renderWithProviders(routes(), '/play/a/reflect');
  expect(document.activeElement).toBe(
    screen.getByRole('heading', { name: 'Trước khi xem kết quả' }),
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Thích' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Khá giống' }));
  fireEvent.click(screen.getByRole('button', { name: 'Xem kết quả ca làm' }));
  expect(state.reflect.mutate.mock.calls[0][0]).toEqual({
    answers: { a: 3 },
    realism: 2,
  });
  state.reflect.isPending = true;
  rerender(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/play/a/reflect']}>
          {routes()}
          <LocationProbe />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
  expect(
    screen
      .getByRole('group', { name: 'Cảm nhận sau ca' })
      .hasAttribute('disabled'),
  ).toBe(true);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Bỏ qua' }).disabled,
  ).toBe(true);
  state.reflect.isPending = false;
  state.reflect.isError = true;
  state.reflect.error = new Error('Gửi chưa được');
  rerender(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/play/a/reflect']}>
          {routes()}
          <LocationProbe />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
  expect(screen.getByRole('alert').textContent).toContain('Gửi chưa được');
  expect(
    screen.getByRole('radio', { name: 'Thích' }).getAttribute('aria-checked'),
  ).toBe('true');
  expect(
    screen.getByRole<HTMLInputElement>('radio', { name: 'Khá giống' }).checked,
  ).toBe(true);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Bỏ qua' }).disabled,
  ).toBe(false);
  await waitFor(() =>
    expect(
      screen.getByRole('heading', { name: 'Trước khi xem kết quả' }),
    ).toBeTruthy(),
  );
});
it('redirects only when reflection was answered or there are no prompts', async () => {
  state.summary.data = { reflection: { answered: true, prompts: [] } };
  renderWithProviders(routes(), '/play/a/reflect');
  expect(await screen.findByRole('heading', { name: 'Kết quả' })).toBeTruthy();
});
