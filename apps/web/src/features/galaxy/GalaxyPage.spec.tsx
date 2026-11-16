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
