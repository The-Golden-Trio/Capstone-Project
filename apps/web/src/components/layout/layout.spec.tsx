/**
 * Hai chỗ vừa đổi ở khung ứng dụng, và những gì dễ vỡ ở đó:
 *
 *   • "Đang ở" đã rời thanh bên sang thanh đầu trang — nó phải mở/đóng được,
 *     đếm đúng số việc còn dở, và chỉ nhấp nháy khi thật sự còn việc;
 *   • thanh kinh nghiệm phải viết hoa "Tới" và đổi màu theo nghề đang chơi.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { eventsForRole, findRole } from '@datn/game-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { CharacterPanel } from './CharacterPanel';
import { CurrentPlaceToggle } from './CurrentPlaceToggle';
import { roleTheme } from '../../domain/roleTheme';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';
import { useProfileStore } from '../../store/profileStore';
import { useProgressStore } from '../../store/progressStore';

const ROLE = 'SWE_BACKEND';
const BAND = 'L1';

/** Dựng sẵn trạng thái "đang đứng ở Back-end L1, có 4 điểm kỹ năng". */
function seed({ doneEventIds = [] as string[], playedScenario = false } = {}) {
  useJourneyStore.getState().setLocation(ROLE, BAND);
  useProfileStore.setState({ doneEventIds, quizDone: true, loaded: true });
  useAuthStore.setState({
    status: 'authed',
    user: {
      id: 'u1',
      username: 'nam',
      email: null,
      displayName: 'Nam',
      role: 'USER',
      dateOfBirth: null,
      consentStatus: 'not_required',
      hasPassword: true,
      linkedProviders: [],
    },
  });
  useProgressStore.setState({
    summary: {
      totalPoints: 4,
      hardPoints: 2,
      softPoints: 2,
      runsCompleted: playedScenario ? 1 : 0,
      eventsPlayed: doneEventIds.length,
      quizDone: true,
      skills: [],
      timeline: [],
      roles: [
        {
          roleCode: ROLE,
          roleName: 'Lập trình viên Back-end',
          totalPoints: 4,
          bands: [
            { band: 'L1', label: 'Thực tập sinh', points: 4, unlocked: true, hasScenario: true, pointsToUnlock: 0, enrolled: true, completed: false },
            { band: 'L2', label: 'Mới ra trường', points: 0, unlocked: false, hasScenario: false, pointsToUnlock: 2, enrolled: false, completed: false },
          ],
        },
      ],
    },
    runs: playedScenario
      ? [
          {
            id: 'r1',
            scenarioKey: 'SWE_BACKEND_L1_S_EXEC',
            scenarioTitle: 'x',
            roleCode: ROLE,
            band: BAND,
            completedAt: '2026-01-01T00:00:00.000Z',
            endingId: 'e',
            endingType: 'GOOD',
            pointsAwarded: 4,
            rating: null,
            evidence: [],
          },
        ]
      : [],
    loading: false,
  });
}

const renderIn = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  useJourneyStore.getState().clear();
  useProfileStore.getState().reset();
  useProgressStore.getState().reset();
});

describe('"Đang ở" trên thanh đầu trang', () => {
  it('không hiện gì khi chưa ghé nghề nào', () => {
    const { container } = renderIn(<CurrentPlaceToggle />);
    expect(container.firstChild).toBeNull();
  });

  it('hiện cấp bậc và số việc còn dở', () => {
    seed();
    renderIn(<CurrentPlaceToggle />);
    expect(screen.getByText(BAND)).toBeTruthy();
    // một nhiệm vụ chính chưa chơi + các nhiệm vụ phụ chưa làm
    const badge = screen.getByRole('button').textContent ?? '';
    expect(/\d/.test(badge)).toBe(true);
  });

  it('bấm thì mở bảng, bấm lần nữa thì đóng', () => {
    seed();
    renderIn(<CurrentPlaceToggle />);
    const button = screen.getByRole('button');

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Đổi nơi')).toBeNull();

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Tiếp tục')).toBeTruthy();
    expect(screen.getByText('Đổi nơi')).toBeTruthy();

    fireEvent.click(button);
    expect(screen.queryByText('Đổi nơi')).toBeNull();
  });

  it('phím Esc cũng đóng được', () => {
    seed();
    renderIn(<CurrentPlaceToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Đổi nơi')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Đổi nơi')).toBeNull();
  });

  it('chỉ nhấp nháy khi còn việc chưa làm', () => {
    // còn việc → có nhịp gọi
    seed();
    const { unmount } = renderIn(<CurrentPlaceToggle />);
    expect(screen.getByRole('button').className).toContain('here-chip-calling');
    unmount();

    // Lấy đúng danh sách sự kiện của nghề này từ bộ dữ liệu, thay vì đoán mã.
    const role = findRole(ROLE);
    if (!role) throw new Error('thiếu nghề để kiểm');
    const allEvents = eventsForRole(role).map((e) => e.event_id);

    // đã làm hết mọi việc → thôi nhấp nháy, và không còn phù hiệu đếm
    seed({ doneEventIds: allEvents, playedScenario: true });
    renderIn(<CurrentPlaceToggle />);
    expect(screen.getByRole('button').className).not.toContain(
      'here-chip-calling',
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Đã làm hết việc ở đây')).toBeTruthy();
  });
});

describe('thanh kinh nghiệm', () => {
  it('viết hoa "Tới" và nêu cấp bậc kế', () => {
    seed();
    renderIn(<CharacterPanel onNavigate={() => undefined} />);
    expect(screen.getByText(/Tới/)).toBeTruthy();
    expect(screen.getByText('L2')).toBeTruthy();
  });

  it('dùng màu của nghề đang chơi', () => {
    seed();
    const { container } = renderIn(<CharacterPanel onNavigate={() => undefined} />);
    const themed = container.querySelector('[style*="--accent"]') as HTMLElement;
    expect(themed.style.getPropertyValue('--accent')).toBe(roleTheme(ROLE).accent);
  });

  it('vẽ rãnh và phần đã đầy theo đúng tỉ lệ', () => {
    seed();
    const { container } = renderIn(<CharacterPanel onNavigate={() => undefined} />);
    expect(container.querySelector('.xp-track')).toBeTruthy();
    const fill = container.querySelector('.xp-fill') as HTMLElement;
    // 4 điểm trên ngưỡng 6
    expect(fill.style.width).toBe(`${(4 / 6) * 100}%`);
  });
});
