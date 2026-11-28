import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';
import GalaxyPage from './GalaxyPage';
import { api } from '../../api';

// jsdom không dựng canvas; thao tác chọn vẫn đi qua callback thật của trang.
vi.mock('./GalaxyMap', () => ({
  GalaxyMap: ({ onSelect }: { onSelect: (code: string) => void }) => (
    <button onClick={() => onSelect('SWE_BACKEND')}>
      Chọn hành tinh Back-end
    </button>
  ),
}));
beforeEach(signInDemo);
const occupationLinks = () =>
  Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[href^="/occupations/"]'),
  );
describe('Ngân hà từ danh mục demo', () => {
  it('hiện đủ 221 nghề ở dạng danh sách và tìm điều dưỡng không dấu', async () => {
    renderWithProviders(<GalaxyPage />, '/galaxy?view=list');
    expect(await screen.findByText('221/221 nghề')).toBeTruthy();
    expect(occupationLinks()).toHaveLength(221);
    fireEvent.change(screen.getByLabelText('Tìm nghề'), {
      target: { value: 'dieu duong' },
    });
    await waitFor(() => expect(occupationLinks().length).toBeGreaterThan(0));
    await waitFor(() => expect(occupationLinks().length).toBeLessThan(221));
    expect(
      occupationLinks().every((link) =>
        /điều dưỡng/i.test(link.textContent ?? ''),
      ),
    ).toBe(true);
  });
  it('chip vùng chỉ giữ đúng các nghề trong vùng, bấm Tất cả vùng khôi phục danh sách', async () => {
    const catalogue = await api.catalogue.catalogue();
    const region = catalogue.regions.find((r) => r.id === 'suc_khoe');
    assert(region);
    const expected = catalogue.occupations
      .filter((o) => o.regionId === region.id)
      .map((o) => `/occupations/${o.code}`)
      .sort();
    renderWithProviders(<GalaxyPage />, '/galaxy?view=list');
    await screen.findByText('221/221 nghề');
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(region.name) }),
    );
    await waitFor(() =>
      expect(
        occupationLinks()
          .map((link) => link.getAttribute('href'))
          .sort(),
      ).toEqual(expected),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tất cả vùng' }));
    expect(occupationLinks()).toHaveLength(221);
  });
  it('mở peek từ ?nghe=, đóng và chọn hành tinh cập nhật query', async () => {
    renderWithProviders(<GalaxyPage />, '/galaxy?nghe=SWE_BACKEND');
    expect(
      await screen.findByRole('complementary', { name: /Thông tin nghề/ }),
    ).toBeTruthy();
    expect(screen.getByLabelText('Đường dẫn').textContent).toContain(
      'nghe=SWE_BACKEND',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(
      screen.queryByRole('complementary', { name: /Thông tin nghề/ }),
    ).toBeNull();
    expect(screen.getByLabelText('Đường dẫn').textContent).toBe('/galaxy');
    fireEvent.click(
      screen.getByRole('button', { name: 'Chọn hành tinh Back-end' }),
    );
    expect(
      screen.getByRole('complementary', { name: /Thông tin nghề/ }),
    ).toBeTruthy();
    expect(screen.getByLabelText('Đường dẫn').textContent).toContain(
      'nghe=SWE_BACKEND',
    );
  });
});

it('Enter chọn đúng từ vừa gõ, ẩn kết quả và trả focus khi đóng thông tin nghề', async () => {
  renderWithProviders(<GalaxyPage />, '/galaxy');
  const input = await screen.findByRole('textbox', { name: /^Tìm nghề$/ });
  fireEvent.change(input, { target: { value: 'back' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  const panel = await screen.findByRole('complementary', {
    name: /Thông tin nghề/,
  });
  expect(screen.getByLabelText('Đường dẫn').textContent).toContain(
    'nghe=SWE_BACKEND',
  );
  expect(
    screen.queryByRole('list', { name: /^Nghề khớp với tìm kiếm$/ }),
  ).toBeNull();
  expect(document.activeElement).toBe(panel.querySelector('h2'));
  fireEvent.click(screen.getByRole('button', { name: /^Đóng$/ }));
  expect(document.activeElement).toBe(input);
});

it('nghề đang khám phá mở đúng lộ trình từ thẻ trên bản đồ', async () => {
  const catalogue = await api.catalogue.catalogue();
  vi.spyOn(api.catalogue, 'catalogue').mockResolvedValue({
    ...catalogue,
    occupations: catalogue.occupations.map((o) =>
      o.code === 'SWE_BACKEND'
        ? { ...o, my: { ...o.my, status: 'PLAYING' as const, currentLevel: 3 } }
        : o,
    ),
  });
  renderWithProviders(<GalaxyPage />, '/galaxy?nghe=SWE_BACKEND');
  expect(
    (
      await screen.findByRole('link', { name: /^Mở lộ trình nghề$/ })
    ).getAttribute('href'),
  ).toBe('/occupations/SWE_BACKEND/levels');
  expect(
    screen.getByRole('link', { name: /^Xem hồ sơ nghề$/ }).getAttribute('href'),
  ).toBe('/occupations/SWE_BACKEND');
});

it('chuyển cách xem bằng phím mũi tên và chỉ một lựa chọn nằm trong thứ tự Tab', async () => {
  renderWithProviders(<GalaxyPage />, '/galaxy');
  const map = await screen.findByRole('radio', { name: /^Bản đồ$/ });
  const list = screen.getByRole('radio', { name: /^Danh sách$/ });
  expect(map.tabIndex).toBe(0);
  expect(list.tabIndex).toBe(-1);
  map.focus();
  fireEvent.keyDown(map, { key: 'ArrowRight' });
  expect(list.getAttribute('aria-checked')).toBe('true');
  expect(document.activeElement).toBe(list);
  expect(list.tabIndex).toBe(0);
  expect(map.tabIndex).toBe(-1);
  fireEvent.keyDown(list, { key: 'Home' });
  expect(map.getAttribute('aria-checked')).toBe('true');
  expect(document.activeElement).toBe(map);
});
