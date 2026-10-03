/**
 * Trạng thái của bản đồ ngân hà.
 *
 * Hai store, hai vòng đời:
 *   - `useGalaxyStore`   — đang đứng ở hành tinh nào, đã ghé đâu, đã qua bài
 *                          kiểm tra nào. Lưu localStorage, mở lại vẫn đúng chỗ.
 *   - `useGalaxyUiStore` — đang chọn/rê/bay. Tạm thời, mất khi rời trang.
 *
 * Dùng zustand thay cho React context vì cảnh 3D (`<Canvas>`) là một React
 * root riêng: context của trang KHÔNG tự chảy vào trong cảnh, còn store thì
 * đọc được ở cả hai phía.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HOME_PLANET, findPlanet } from './galaxy';

interface GalaxyStore {
  currentRoleCode: string;
  visited: string[];
  /** Kỹ năng đã được cấp qua bài kiểm tra nhập cảnh (bản mẫu, xem `EntryTest`). */
  passport: string[];
  /** Hành tinh đã qua bài kiểm tra — không bắt làm lại. */
  passedTests: string[];

  land: (roleCode: string) => void;
  grantSkills: (roleCode: string, skills: string[]) => void;
  reset: () => void;
}

export const useGalaxyStore = create<GalaxyStore>()(
  persist(
    (set) => ({
      currentRoleCode: HOME_PLANET,
      visited: [HOME_PLANET],
      passport: [],
      passedTests: [],

      land: (roleCode) =>
        set((s) => ({
          currentRoleCode: roleCode,
          visited: s.visited.includes(roleCode) ? s.visited : [...s.visited, roleCode],
        })),

      grantSkills: (roleCode, skills) =>
        set((s) => ({
          passport: [...new Set([...s.passport, ...skills])],
          passedTests: s.passedTests.includes(roleCode)
            ? s.passedTests
            : [...s.passedTests, roleCode],
        })),

      reset: () =>
        set({ currentRoleCode: HOME_PLANET, visited: [HOME_PLANET], passport: [], passedTests: [] }),
    }),
    {
      name: 'vaonghe.galaxy.v1',
      // Dữ liệu đổi mà bản lưu cũ trỏ tới hành tinh không còn → về nhà, đừng crash.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<GalaxyStore>;
        const currentRoleCode = findPlanet(saved.currentRoleCode)?.roleCode ?? HOME_PLANET;
        return { ...current, ...saved, currentRoleCode };
      },
    },
  ),
);

/* ── Trạng thái tạm ───────────────────────────────────────────────────── */

export interface Flight {
  from: string;
  to: string;
  /** `performance.now()` lúc cất cánh. */
  startedAt: number;
  durationMs: number;
}

interface GalaxyUiStore {
  selected: string | null;
  hovered: string | null;
  flight: Flight | null;
  /** Tăng mỗi lần muốn camera quay về hành tinh hiện tại (nút "Về vị trí"). */
  homeRequest: number;
  /** Tăng mỗi lần muốn nhìn cả ngân hà (nút "Toàn cảnh"). */
  overviewRequest: number;

  select: (roleCode: string | null) => void;
  hover: (roleCode: string | null) => void;
  takeOff: (from: string, to: string) => void;
  /** Cảnh 3D gọi khi tàu đã tới nơi — chính nó ghi vị trí mới vào store lâu dài. */
  arrive: () => void;
  goHome: () => void;
  goOverview: () => void;
}

export const FLIGHT_MS = 3200;

export const useGalaxyUiStore = create<GalaxyUiStore>()((set, get) => ({
  selected: null,
  hovered: null,
  flight: null,
  homeRequest: 0,
  overviewRequest: 0,

  select: (selected) => set({ selected }),
  hover: (hovered) => set({ hovered }),

  takeOff: (from, to) => {
    if (get().flight) return; // đang bay thì không nhận lệnh mới
    set({ flight: { from, to, startedAt: performance.now(), durationMs: FLIGHT_MS }, selected: null });
  },

  arrive: () => {
    const { flight } = get();
    if (!flight) return;
    useGalaxyStore.getState().land(flight.to);
    set({ flight: null });
  },

  goHome: () => set((s) => ({ homeRequest: s.homeRequest + 1, selected: null })),
  goOverview: () => set((s) => ({ overviewRequest: s.overviewRequest + 1, selected: null })),
}));
