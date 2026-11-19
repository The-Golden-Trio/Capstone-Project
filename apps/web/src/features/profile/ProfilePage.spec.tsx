import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { api } from '../../api';
import { db } from '../../api/demo/store';
import type { Achievement } from '../../api/types';
import ProfilePage from './ProfilePage';
import { AchievementsTab } from './AchievementsTab';
import { SkillHistory } from './SkillHistory';

beforeEach(signInDemo);

describe('hành trang riêng tư', () => {
  it('điền năm câu mục tiêu tại chỗ, chuyển tab bằng query và xoá phần tự kể', async () => {
    const { client } = renderWithProviders(<ProfilePage />, '/profile');
    expect(
      await screen.findByRole('heading', { name: 'Người khám phá' }),
    ).toBeTruthy();
    expect(screen.getByText(/Song Tử · \+12%/)).toBeTruthy();
    expect(screen.queryByText('Ước mơ của bạn là gì?')).toBeNull();
    fireEvent.click(
      screen.getByText('Mục tiêu của bạn', { selector: 'summary' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
    await screen.findByText('Ước mơ của bạn là gì?');
    expect(
      screen
        .getAllByRole('group')
        .filter((node) => node.tagName === 'FIELDSET'),
    ).toHaveLength(5);
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Làm ra thứ được nhiều người dùng',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lưu mục tiêu' }));
    await waitFor(() =>
      expect(db.players[0].goals?.g1.picked).toEqual([
        'Làm ra thứ được nhiều người dùng',
      ]),
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Nhật ký' }));
    expect(screen.getByLabelText('Đường dẫn').textContent).toBe(
      '/profile?tab=nhat-ky',
    );
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    fireEvent.click(screen.getByText('Quản lý tự kể', { selector: 'summary' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xoá phần kể về bạn' }));
    const dialog = within(
      screen.getByRole('dialog', { name: 'Xoá phần kể về bạn?' }),
    );
    fireEvent.click(dialog.getByRole('button', { name: 'Xoá phần kể về bạn' }));
    await waitFor(() => expect(db.players[0].goals).toBeNull());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['record'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['quiz', 'result'] });
    expect(db.players).toHaveLength(1);
  });

  it('reports a record failure and allows retry without losing the requested tab', async () => {
    const record = await api.progress.record();
    const request = vi
      .spyOn(api.progress, 'record')
      .mockRejectedValueOnce(new Error('Không tải được hồ sơ'))
      .mockResolvedValue(record);
    renderWithProviders(<ProfilePage />, '/profile?tab=thanh-tuu');
    expect(screen.getByText('Đang gom những dấu chân của bạn…')).toBeTruthy();
    await screen.findByRole('heading', { name: 'Chưa mở được hành trang' });
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    await screen.findByRole('heading', { name: 'Người khám phá' });
    expect(request).toHaveBeenCalledTimes(2);
    expect(
      screen
        .getByRole('tab', { name: 'Thành tựu' })
        .getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('hiện đủ 221 sao nghề chia vùng và các trạng thái chưa có dữ liệu', async () => {
    renderWithProviders(<ProfilePage />, '/profile?tab=thong-ke');
    const stars = await screen.findByText('Những vì sao đã ghé', {
      selector: 'summary',
    });
    expect(stars.closest('details')?.open).toBe(false);
    fireEvent.click(stars);
    await waitFor(() =>
      expect(screen.getAllByRole('img', { name: /Cụm sao/ })).toHaveLength(6),
    );
    expect(
      screen
        .getAllByRole('link', { hidden: true })
        .filter((link) =>
          link.getAttribute('href')?.startsWith('/occupations/'),
        ),
    ).toHaveLength(221);
    expect(screen.getByText('0/221')).toBeTruthy();
    expect(screen.getByText(/Vùng còn tối: chơi thêm để mở/)).toBeTruthy();
  });

  it('giới hạn ghim ba huy hiệu và gửi đúng danh sách khi bỏ ghim', async () => {
    const achievements: Achievement[] = Array.from(
      { length: 5 },
      (_, index) => ({
        code: `a${index}`,
        name: `Dấu mốc ${index}`,
        description: 'Một lần thử nghề.',
        kind: 'kham_pha',
        earnedAt: index === 4 ? null : '2026-11-16',
        pinned: index < 3,
      }),
    );
    const pin = vi.spyOn(api.progress, 'pinAchievements');
    renderWithProviders(<AchievementsTab achievements={achievements} />);
    expect(
      // Tên dạng chuỗi được so khớp nguyên văn nên không lẫn với "Bỏ ghim".
      screen.getByRole<HTMLButtonElement>('button', { name: 'Ghim' }).disabled,
    ).toBe(true);
    expect(screen.queryByText('Chưa mở khoá')).toBeNull();
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Xem cả huy hiệu chưa mở' }),
    );
    expect(screen.getByText('Chưa mở khoá')).toBeTruthy();
    expect(screen.getByText(/Đã ghim đủ 3 huy hiệu/).getAttribute('role')).toBe(
      'status',
    );
    expect(
      screen.getByRole('heading', { name: 'Bộ sưu tập dấu mốc · 4/5' }),
    ).toBeTruthy();
    expect(screen.getAllByText('GHIM')).toHaveLength(3);
    fireEvent.click(
      screen.getByRole('button', { name: 'Bỏ ghim huy hiệu: Dấu mốc 0' }),
    );
    await waitFor(() => expect(pin).toHaveBeenCalledWith(['a1', 'a2']));
    expect(db.players[0].pinned).toEqual(['a1', 'a2']);
  });

  it('chạm chấm bị trừ để xem đúng ca, ngày, điểm và phần cộng chòm sao', () => {
    renderWithProviders(
      <SkillHistory
        history={[
          {
            runId: 'a',
            title: 'Làm rõ yêu cầu',
            path: 'Công nghệ › Back-end › Cấp 1',
            date: '2026-11-15',
            delta: 100,
            zodiacBonus: 10,
            total: 100,
          },
          {
            runId: 'b',
            title: 'Yêu cầu đổi giữa ca',
            path: 'Công nghệ › Back-end › Cấp 1',
            date: '2026-11-16',
            delta: -20,
            zodiacBonus: 0,
            total: 80,
          },
        ]}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Ca 1: Làm rõ yêu cầu/ }),
    );
    expect(
      screen.getByRole('link', { name: 'Làm rõ yêu cầu' }).getAttribute('href'),
    ).toBe('/play/a/summary');
    expect(
      screen.getByText(/gồm \+10 từ chòm sao/, { selector: 'figcaption p' }),
    ).toBeTruthy();
    fireEvent.keyDown(
      screen.getByRole('button', { name: /Ca 2: Yêu cầu đổi giữa ca/ }),
      { key: 'Enter' },
    );
    expect(
      screen
        .getByRole('link', { name: 'Yêu cầu đổi giữa ca' })
        .getAttribute('href'),
    ).toBe('/play/b/summary');
    expect(
      screen.getByText(/−20 điểm · gồm \+0 từ chòm sao · tổng 80/),
    ).toBeTruthy();
  });
});
