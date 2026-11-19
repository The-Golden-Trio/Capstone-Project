import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { api } from '../../api';
import RatePage from './RatePage';
beforeEach(signInDemo);
const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/occupations/:code/rate" element={<RatePage />} />
    </Routes>,
    '/occupations/SWE_BACKEND/rate',
  );
it('nghề chưa đi hết vẫn khoá phiếu và giữ đường dẫn lộ trình', async () => {
  renderPage();
  expect(
    await screen.findByRole('heading', {
      name: 'Đi hết nghề rồi cùng nhìn lại',
    }),
  ).toBeTruthy();
  expect(
    screen.getByRole('link', { name: 'Xem lộ trình' }).getAttribute('href'),
  ).toBe('/occupations/SWE_BACKEND/levels');
  expect(screen.queryByRole('button', { name: 'Gửi đánh giá' })).toBeNull();
});
it('đòi đủ năm tiêu chí, gửi đúng điểm và giữ số tổng hợp chưa công bố', async () => {
  const data = await api.feedback.ratingForm('SWE_BACKEND');
  vi.spyOn(api.feedback, 'ratingForm').mockResolvedValue({
    ...data,
    locked: false,
    lockedReason: null,
  });
  const send = vi.spyOn(api.feedback, 'rate').mockResolvedValue(undefined);
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: 'Gửi đánh giá' }));
  expect(send).not.toHaveBeenCalled();
  expect(
    screen.getByText('Bạn chọn đủ các tiêu chí trước khi gửi nhé.'),
  ).toBeTruthy();
  const groups = screen.getAllByRole('radiogroup');
  expect(groups).toHaveLength(5);
  expect(document.activeElement).toBe(
    within(groups[0]).getAllByRole('radio')[0],
  );
  for (const group of groups)
    fireEvent.click(within(group).getByRole('radio', { name: '3 trên 5' }));
  fireEvent.change(screen.getByLabelText(/Điều bạn muốn chia sẻ thêm/), {
    target: { value: '  Mình nhớ ca xử lý sự cố.  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi đánh giá' }));
  await waitFor(() =>
    expect(send).toHaveBeenCalledWith(
      'SWE_BACKEND',
      Object.fromEntries(data.criteria.map((c) => [c.code, 3])),
      'Mình nhớ ca xử lý sự cố.',
    ),
  );
  expect(
    await screen.findByRole('heading', { name: 'Cảm ơn bạn đã chia sẻ' }),
  ).toBeTruthy();
  expect(
    await screen.findByText('Cần thêm người đánh giá trước khi công bố số.'),
  ).toBeTruthy();
});
