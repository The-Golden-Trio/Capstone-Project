import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CataloguePage } from './CataloguePage';
import { ReferenceImportPage } from './ReferenceImportPage';
import { PublishScenarioPage } from './PublishScenarioPage';
import { OccupationMonitorPage } from './OccupationMonitorPage';
import { SystemPromptsPage } from './SystemPromptsPage';
import { GameSettingsPage } from './GameSettingsPage';

beforeEach(() => {
  vi.stubEnv('VITE_STAFF_DEMO', '1');
  // jsdom không hiện thực top layer của dialog; chỉ mô phỏng thuộc tính open.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false;
      },
    },
  });
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
function openPage(page: ReactNode, path = '/test', pattern = '/test') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={page} />
      </Routes>
    </MemoryRouter>,
  );
}
describe('các màn CA mới trong chế độ mẫu', () => {
  it('C02 tìm nghề không dấu và có các liên kết theo nghề', async () => {
    openPage(<CataloguePage />);
    await screen.findByText(
      '221 nghề · Độ phủ: số scenario đã xuất bản ở từng cấp. Dấu “—” nghĩa là API chưa cung cấp.',
    );
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm nghề' }), {
      target: { value: 'SWE_BACKEND' },
    });
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(
      screen.getByRole('link', { name: 'Giám sát C09' }).getAttribute('href'),
    ).toBe('/ca/occupations/SWE_BACKEND/monitor');
    expect(screen.getByText('Dữ liệu mẫu')).toBeTruthy();
  });
  it('C02 paginates locally and resets the page when filtering', async () => {
    openPage(<CataloguePage />);
    const next = await screen.findByRole('button', { name: 'Trang sau' });
    expect(screen.getAllByRole('row')).toHaveLength(26);
    fireEvent.click(next);
    expect(screen.getByText(/Trang 2\/9/)).toBeTruthy();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm nghề' }), {
      target: { value: 'SWE_BACKEND' },
    });
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText(/Trang 1\/1/)).toBeTruthy();
    expect(next.hasAttribute('disabled')).toBe(true);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm nghề' }), {
      target: { value: 'nghe-khong-ton-tai' },
    });
    expect(screen.getByText('Không tìm thấy nghề')).toBeTruthy();
    expect(
      screen.queryByRole('navigation', { name: 'Phân trang danh mục nghề' }),
    ).toBeNull();
  });
  it('C03 không cho hoàn tất trước khi tải tệp và mô tả rõ tệp mẫu không được phân tích', () => {
    openPage(<ReferenceImportPage />);
    expect(
      screen.getByRole('button', { name: 'Tải lên và đối chiếu' }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Hoàn tất & thông báo DE' }),
    ).toBeNull();
    expect(screen.getByText(/tệp không được phân tích/)).toBeTruthy();
  });
  it('C08 yêu cầu xác nhận và sau phát hành khóa bản dựng mẫu', async () => {
    openPage(
      <PublishScenarioPage />,
      '/ca/scenarios/ui-demo/publish',
      '/ca/scenarios/:scenarioId/publish',
    );
    const publish = await screen.findByRole('button', {
      name: 'Xuất bản phiên bản mới',
    });
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Ghi chú phát hành' }),
      { target: { value: 'Thử luồng phát hành' } },
    );
    fireEvent.click(publish);
    const dialog = screen.getByRole('dialog', {
      name: 'Xác nhận phát hành scenario?',
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xuất bản' }));
    await screen.findByText('PUBLISHED');
    await waitFor(() =>
      expect((publish as HTMLButtonElement).disabled).toBe(true),
    );
  });
  it('C09 ẩn cả số lượng và điểm khi ratings.withheld=true', async () => {
    openPage(
      <OccupationMonitorPage />,
      '/ca/occupations/SWE_BACKEND/monitor',
      '/ca/occupations/:occupationId/monitor',
    );
    await screen.findByText('Ẩn thống kê · NFR-06');
    expect(screen.queryByText('3 người đánh giá')).toBeNull();
    expect(screen.getByText('Ca cần chuyên gia kiểm tra lại')).toBeTruthy();
  });
  it('C10 hiển thị phiên bản prompt và giới hạn ánh xạ narrator', async () => {
    openPage(
      <SystemPromptsPage />,
      '/ca/occupations/SWE_BACKEND/prompts',
      '/ca/occupations/:occupationId/prompts',
    );
    await screen.findByText('Nội dung prompt · chỉ đọc');
    expect(screen.getByText(/chưa có kind NARRATOR/)).toBeTruthy();
    expect(screen.getByText('Thay đổi v1 → v2')).toBeTruthy();
  });
  it('C11 luôn mang nhãn đề xuất và không tự điền trần chi phí chưa chốt', () => {
    openPage(<GameSettingsPage />);
    expect(screen.getByText(/Đề xuất — chờ nhóm duyệt/)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Lưu thành phiên bản mới' }),
    ).toBeTruthy();
    expect(
      (
        screen.getByRole('textbox', {
          name: 'Giá trị · USD / phiên (đề xuất)',
        }) as HTMLInputElement
      ).value,
    ).toBe('');
  });
});
