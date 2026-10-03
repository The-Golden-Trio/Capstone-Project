/**
 * Điểm kỹ năng và cấp bậc đã mở — do máy chủ quyết định.
 *
 * Store này chỉ chứa bản sao để hiển thị; không có action nào ghi điểm, vì
 * không có cách nào ghi điểm từ phía máy khách. Điểm chỉ đổi khi máy chủ chấm
 * xong một lượt chơi, và cách duy nhất để thấy con số mới là hỏi lại.
 */
import { create } from 'zustand';
import { profileApi } from '../api/endpoints';
import type { ProgressSummary, RunHistoryItem } from '../api/schemas';

interface ProgressStore {
  summary: ProgressSummary | null;
  runs: RunHistoryItem[];
  loading: boolean;
  load: () => Promise<void>;
  reset: () => void;
}

export const useProgressStore = create<ProgressStore>()((set) => ({
  summary: null,
  runs: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const [summary, runs] = await Promise.all([
        profileApi.progress(),
        profileApi.runs(),
      ]);
      set({ summary, runs, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  reset: () => set({ summary: null, runs: [], loading: false }),
}));

/** Điểm tại một (nghề, cấp bậc) theo số máy chủ trả về. */
export const bandPoints = (
  summary: ProgressSummary | null,
  roleCode: string,
  band: string,
): number =>
  summary?.roles
    .find((r) => r.roleCode === roleCode)
    ?.bands.find((b) => b.band === band)?.points ?? 0;

/** Cấp bậc này đã mở chưa, theo máy chủ. Giao diện chỉ hiển thị lại. */
export const isBandUnlocked = (
  summary: ProgressSummary | null,
  roleCode: string,
  band: string,
): boolean => {
  const role = summary?.roles.find((r) => r.roleCode === roleCode);
  // Nghề chưa từng chạm tới thì chỉ cấp bậc mở đầu là vào được; máy chủ sẽ
  // nói lời cuối khi bấm chơi.
  if (!role) return true;
  return role.bands.find((b) => b.band === band)?.unlocked ?? false;
};
