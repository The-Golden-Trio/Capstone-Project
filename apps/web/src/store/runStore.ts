/**
 * Màn chơi đang diễn ra. Không lưu xuống đĩa: rời trang là mất lượt chơi,
 * đúng như prototype.
 *
 * Store chỉ giữ state và chuyển tiếp action sang `runReducer`. Luật chơi
 * nằm hết ở `domain/scenarioEngine.ts`.
 */
import { create } from 'zustand';
import { findScenarioByKey } from '../data/indexes';
import {
  pointsEarned,
  runReducer,
  startRun,
  type RunAction,
  type RunState,
} from '../domain/scenarioEngine';
import { useProfileStore } from './profileStore';

interface RunStore {
  run: RunState | null;
  /** Số sao người chơi chấm cho tình huống ở màn tổng kết. */
  rating: number;
  start: (scenarioKey: string) => void;
  dispatch: (action: RunAction) => void;
  setRating: (rating: number) => void;
  clear: () => void;
}

export const useRunStore = create<RunStore>()((set, get) => ({
  run: null,
  rating: 0,

  start: (scenarioKey) => set({ run: startRun(scenarioKey), rating: 0 }),

  dispatch: (action) => {
    const current = get().run;
    if (!current) return;

    const next = runReducer(current, action);
    if (next === current) return;

    // Chỉ lần chơi đầu mới được tính điểm — chơi lại là để xem lại, không cày.
    if (next.phase === 'ended' && current.phase !== 'ended') {
      const profile = useProfileStore.getState();
      const { role_code, band } = scenarioJob(next.scenarioKey);
      const first = profile.completeTask(role_code, band, next.scenarioKey);
      if (first) profile.addSkill(role_code, band, pointsEarned(next));
    }

    set({ run: next });
  },

  setRating: (rating) => set({ rating }),

  clear: () => set({ run: null, rating: 0 }),
}));

function scenarioJob(scenarioKey: string): { role_code: string; band: string } {
  const entry = findScenarioByKey(scenarioKey);
  if (!entry) throw new Error(`Không có kịch bản "${scenarioKey}"`);
  return { role_code: entry.scenario.job.role_code, band: entry.scenario.job.band };
}
