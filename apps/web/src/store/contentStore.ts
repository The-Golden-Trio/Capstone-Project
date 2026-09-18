/**
 * Nội dung game, lấy từ máy chủ.
 *
 * Trước đây bộ dữ liệu nằm trong mã (`packages/game-core/src/data`) nên lúc
 * nào cũng có sẵn, đồng bộ, ngay khi nạp module. Giờ nó ở trong database và
 * tới sau một vòng mạng — nên phải có một chỗ giữ nó, và một cái cổng chờ nó
 * về trước khi vẽ (`RequireAuth`).
 *
 * Store này chỉ đọc. Không có action nào sửa nội dung, vì API cũng không có
 * đường ghi: nội dung vào database bằng script seed và chỉ bằng script ấy.
 */
import { create } from 'zustand';
import {
  createGameIndex,
  type FollowupLine,
  type GameIndex,
} from '@datn/game-core';
import { contentApi } from '../api/endpoints';
import { initGalaxy } from '../galaxy/galaxy';

interface ContentStore {
  index: GameIndex | null;
  /** Lời đào sâu, khoá `"<scenarioKey>:<activityId>"`. */
  followups: Record<string, FollowupLine>;
  /** Phiên bản nội dung máy chủ đang phục vụ. */
  version: number | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;

  /** Bản đồ ngân hà: nặng 100 KB và chỉ một trang cần, nên tải riêng. */
  galaxyReady: boolean;
  galaxyError: string | null;
  loadGalaxy: () => Promise<void>;

  reset: () => void;
}

export const useContentStore = create<ContentStore>()((set, get) => ({
  index: null,
  followups: {},
  version: null,
  loading: false,
  error: null,

  load: async () => {
    // Nạp một lần là đủ: nội dung của một phiên bản là bất biến.
    if (get().index || get().loading) return;

    set({ loading: true, error: null });
    try {
      const payload = await contentApi.bootstrap();
      set({
        index: createGameIndex(payload.data),
        followups: payload.followups,
        version: payload.version,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof Error ? err.message : 'Không tải được nội dung game',
      });
    }
  },

  galaxyReady: false,
  galaxyError: null,

  loadGalaxy: async () => {
    if (get().galaxyReady) return;
    try {
      const payload = await contentApi.galaxy();
      // `initGalaxy` dựng các bảng tra của module `galaxy`; mọi hàm ở đó đọc
      // qua `galaxyData()` nên phải gọi trước khi trang bản đồ vẽ.
      initGalaxy({
        groups: payload.groups,
        nodes: payload.nodes,
        edges: payload.edges,
      });
      set({ galaxyReady: true, galaxyError: null });
    } catch (err) {
      set({
        galaxyError:
          err instanceof Error ? err.message : 'Không tải được bản đồ ngân hà',
      });
    }
  },

  reset: () =>
    set({
      index: null,
      followups: {},
      version: null,
      loading: false,
      error: null,
      galaxyReady: false,
      galaxyError: null,
    }),
}));

/**
 * Bảng tra cho mã chạy ngoài React.
 *
 * `router.tsx` dựng mẩu bánh mì trong các callback `crumbs` — không phải hook,
 * nên không gọi được `useContentStore()`. Những chỗ ấy gọi hàm này.
 *
 * Trả `null` khi nội dung chưa về. Với các callback nói trên thì điều đó không
 * xảy ra trong thực tế (cổng `RequireAuth` đã chờ xong mới vẽ), nhưng vẫn phải
 * khai ra để không ai lỡ tay giả định là luôn có.
 */
export const getContentIndex = (): GameIndex | null =>
  useContentStore.getState().index;

/**
 * Bảng tra bên trong một component.
 *
 * Ném lỗi khi chưa có nội dung thay vì trả `null`: mọi màn dùng hàm này đều
 * nằm sau cổng `RequireAuth`, vốn đã chờ nội dung về mới vẽ. Nếu điều đó vỡ
 * thì đó là lỗi lập trình, và một lỗi nổ to dễ sửa hơn nhiều so với `undefined`
 * lặng lẽ trôi vào giữa màn chơi.
 */
export function useGameIndex(): GameIndex {
  const index = useContentStore((s) => s.index);
  if (!index) {
    throw new Error(
      'Chưa nạp nội dung game. Component này phải nằm trong RequireAuth.',
    );
  }
  return index;
}

/**
 * Lời NPC cho lượt đào sâu, ở phiên bản nội dung đang chơi.
 *
 * Máy khách PHẢI dùng đúng bản này chứ không giữ một bản riêng trong mã: sự
 * tồn tại của lời thoại chính là điều kiện mở lượt đào sâu, nên hai bên lệch
 * nhau là lượt chơi rẽ nhánh khác lượt chạy lại ở máy chủ, và điểm ra khác.
 */
export const getFollowupLine = (
  scenarioKey: string,
  activityId: string,
): FollowupLine | undefined =>
  useContentStore.getState().followups[`${scenarioKey}:${activityId}`];
