/**
 * Màn chơi đang diễn ra.
 *
 * Luồng mới, và lý do của nó: điểm kỹ năng mở cấp bậc, nên máy khách không
 * được phép tự cộng. Cách giữ cho màn chơi vẫn mượt mà điểm vẫn đáng tin:
 *
 *   1. `start()` — máy chủ kiểm cấp bậc rồi phát một hạt giống.
 *   2. Chơi tại chỗ bằng đúng hạt giống đó: phản hồi tức thì như cũ, đồng
 *      thời ghi lại từng hành động đã bấm.
 *   3. Hết màn — gửi chuỗi hành động lên; máy chủ chạy lại qua đúng máy chạy
 *      màn chơi ấy và tự chấm.
 *
 * Kết cục máy chủ trả về mới là kết cục thật; màn tổng kết đọc từ `result`.
 */
import { create } from 'zustand';
import {
  defaultTextGrader,
  mulberry32,
  runReducer,
  startRun,
  type EngineDeps,
  type RunAction,
  type RunState,
} from '@datn/game-core';
import { runsApi } from '../api/endpoints';
import type { CompletedRun } from '../api/schemas';
import { useProgressStore } from './progressStore';

/**
 * Dựng lại phụ thuộc cho mỗi lần dispatch.
 *
 * Dựng mới mỗi lần chứ không giữ một `rng` sống: máy chủ chạy lại từ hành
 * động đầu tiên nên chuỗi số ngẫu nhiên của nó bắt đầu lại từ đầu. Giữ một
 * `rng` có trạng thái ở máy khách sẽ làm hai bên lệch nhau ngay khi có sự
 * kiện xen ngang.
 */
const buildDeps = (seed: number): EngineDeps => ({
  grader: defaultTextGrader,
  rng: mulberry32(seed),
  now: Date.now,
});

interface RunStore {
  run: RunState | null;
  runId: string | null;
  seed: number | null;
  /** Mọi hành động đã bấm, theo thứ tự — đây là thứ gửi lên để chấm. */
  actions: RunAction[];
  /** Kết quả do máy chủ chấm. */
  result: CompletedRun | null;
  rating: number;
  starting: boolean;
  submitting: boolean;
  error: string | null;

  start: (scenarioKey: string) => Promise<boolean>;
  dispatch: (action: RunAction) => void;
  setRating: (rating: number) => void;
  clear: () => void;
}

const blank = {
  run: null,
  runId: null,
  seed: null,
  actions: [] as RunAction[],
  result: null,
  rating: 0,
  starting: false,
  submitting: false,
  error: null,
};

export const useRunStore = create<RunStore>()((set, get) => ({
  ...blank,

  start: async (scenarioKey) => {
    set({ ...blank, starting: true });
    try {
      const started = await runsApi.start(scenarioKey);
      set({
        run: startRun(scenarioKey, buildDeps(started.seed)),
        runId: started.runId,
        seed: started.seed,
        actions: [],
        starting: false,
      });
      return true;
    } catch (error) {
      set({
        starting: false,
        error:
          error instanceof Error ? error.message : 'Không mở được màn chơi này',
      });
      return false;
    }
  },

  dispatch: (action) => {
    const { run, seed, actions, runId } = get();
    if (!run || seed === null || run.phase === 'ended') return;

    const next = runReducer(run, action, buildDeps(seed));
    // Hành động không đổi được gì (bấm quá số mục cho phép chẳng hạn) thì
    // không ghi vào nhật ký — lượt chạy lại ở máy chủ phải khớp từng bước.
    if (next === run) return;

    const log = [...actions, action];
    set({ run: next, actions: log });

    if (next.phase === 'ended' && runId) {
      set({ submitting: true });
      void runsApi
        .complete(runId, log, get().rating || undefined)
        .then((result) => {
          set({ result, submitting: false });
          // Điểm vừa đổi nên bảng tiến trình đang hiển thị đã cũ.
          void useProgressStore.getState().load();
        })
        .catch((error: unknown) => {
          set({
            submitting: false,
            error:
              error instanceof Error
                ? error.message
                : 'Không gửi được kết quả lên máy chủ',
          });
        });
    }
  },

  setRating: (rating) => set({ rating }),

  clear: () => set(blank),
}));
