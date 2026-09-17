/**
 * Hồ sơ người chơi, nay lấy từ máy chủ.
 *
 * Trước đây store này vừa giữ chân dung vừa giữ điểm kỹ năng, và tự lưu tất
 * cả vào localStorage. Điểm kỹ năng đã chuyển sang `progressStore` — máy chủ
 * chấm, máy chủ giữ — vì nó quyết định cấp bậc nào mở được. Còn lại ở đây là
 * chân dung tính cách và các mốc đã qua: không mở khoá gì, nên đọc-ghi thẳng
 * qua API là đủ.
 */
import { create } from 'zustand';
import { blankFit, type FitVector } from '@datn/game-core';
import { profileApi } from '../api/endpoints';

/** Khoá bản lưu cũ của prototype, chỉ còn dùng để nhập một lần rồi xoá. */
export const LEGACY_STORAGE_KEY = 'vaonghe.v1';

interface ProfileStore {
  fit: FitVector;
  quizDone: boolean;
  eventsPlayed: number;
  doneEventIds: string[];
  loaded: boolean;

  load: () => Promise<void>;
  submitQuiz: (
    answers: Array<{ questionId: string; optionId: string }>,
  ) => Promise<void>;
  /** Trả về diễn biến do máy chủ tra từ bộ dữ liệu. */
  answerEvent: (
    eventId: string,
    roleCode: string,
    band: string,
    choiceIndex: number,
  ) => Promise<string>;
  importLegacy: (legacy: {
    fit?: Record<string, number>;
    quizDone?: boolean;
    eventsPlayed?: number;
  }) => Promise<void>;
  reset: () => void;
}

const blank = {
  fit: blankFit(),
  quizDone: false,
  eventsPlayed: 0,
  doneEventIds: [] as string[],
  loaded: false,
};

export const useProfileStore = create<ProfileStore>()((set) => ({
  ...blank,

  load: async () => {
    const profile = await profileApi.get();
    set({ ...profile, loaded: true });
  },

  submitQuiz: async (answers) => {
    const profile = await profileApi.submitQuiz(answers);
    set({ ...profile, loaded: true });
  },

  answerEvent: async (eventId, roleCode, band, choiceIndex) => {
    const result = await profileApi.answerEvent(eventId, {
      roleCode,
      band,
      choiceIndex,
    });
    set({
      fit: result.fit,
      quizDone: result.quizDone,
      eventsPlayed: result.eventsPlayed,
      doneEventIds: result.doneEventIds,
      loaded: true,
    });
    return result.outcome;
  },

  importLegacy: async (legacy) => {
    const profile = await profileApi.importLegacy(legacy);
    set({ ...profile, loaded: true });
  },

  reset: () => set(blank),
}));

/** Sự kiện phụ này đã chơi chưa. */
export const isEventDone = (doneEventIds: string[], eventId: string): boolean =>
  doneEventIds.includes(eventId);
