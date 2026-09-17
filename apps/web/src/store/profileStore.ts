/**
 * Hồ sơ người chơi — lưu trên máy, không gửi đi đâu cả.
 *
 * Giữ nguyên khoá `vaonghe.v1` và hình dạng của prototype, nên bản lưu cũ
 * mở bằng app này vẫn đọc được. Persist tự động: không còn `save()` rải rác
 * để quên như ở prototype.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Signal } from '../data/schema';
import { applySignal, blankFit, type FitVector } from '../domain/fit';
import { taskKey } from '../domain/format';

export const PROFILE_STORAGE_KEY = 'vaonghe.v1';

export interface ProfileState {
  name: string | null;
  fit: FitVector;
  quizDone: boolean;
  /** role_code -> band -> điểm kỹ năng. */
  skill: Record<string, Record<string, number>>;
  /** Khoá "role:band:taskId" của những việc đã hoàn thành. */
  doneTasks: string[];
  eventsPlayed: number;
}

export interface ProfileActions {
  signUp: (name: string) => void;
  reset: () => void;
  applyFit: (signal: Signal) => void;
  setQuizDone: () => void;
  addSkill: (roleCode: string, band: string, points: number) => void;
  /** Đánh dấu đã xong; trả `true` nếu đây là lần đầu. */
  completeTask: (
    roleCode: string,
    band: string,
    taskId: string,
    options?: { countsAsEvent?: boolean },
  ) => boolean;
}

const blankProfile = (): ProfileState => ({
  name: null,
  fit: blankFit(),
  quizDone: false,
  skill: {},
  doneTasks: [],
  eventsPlayed: 0,
});

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set, get) => ({
      ...blankProfile(),

      signUp: (name) => set({ name: name.trim().slice(0, 24) }),

      reset: () => set(blankProfile()),

      applyFit: (signal) => set((s) => ({ fit: applySignal(s.fit, signal) })),

      setQuizDone: () => set({ quizDone: true }),

      addSkill: (roleCode, band, points) =>
        set((s) => ({
          skill: {
            ...s.skill,
            [roleCode]: {
              ...s.skill[roleCode],
              [band]: (s.skill[roleCode]?.[band] ?? 0) + points,
            },
          },
        })),

      completeTask: (roleCode, band, taskId, options) => {
        const key = taskKey(roleCode, band, taskId);
        if (get().doneTasks.includes(key)) return false;
        set((s) => ({
          doneTasks: [...s.doneTasks, key],
          eventsPlayed: s.eventsPlayed + (options?.countsAsEvent ? 1 : 0),
        }));
        return true;
      },
    }),
    {
      name: PROFILE_STORAGE_KEY,
      // Chỉ lưu dữ liệu, không lưu hàm.
      partialize: ({ name, fit, quizDone, skill, doneTasks, eventsPlayed }) => ({
        name,
        fit,
        quizDone,
        skill,
        doneTasks,
        eventsPlayed,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ProfileState>),
        // Bản lưu cũ có thể thiếu chiều mới thêm vào dataset.
        fit: {
          ...blankFit(),
          ...((persisted as Partial<ProfileState>)?.fit ?? {}),
        },
      }),
    },
  ),
);

/* ── Selector ──────────────────────────────────────────────────────── */

export const skillPointsAt = (
  profile: Pick<ProfileState, 'skill'>,
  roleCode: string,
  band: string,
): number => profile.skill[roleCode]?.[band] ?? 0;

export const totalSkillPoints = (profile: Pick<ProfileState, 'skill'>): number =>
  Object.values(profile.skill).reduce(
    (sum, bands) => sum + Object.values(bands).reduce((n, v) => n + v, 0),
    0,
  );

export const isTaskDone = (
  profile: Pick<ProfileState, 'doneTasks'>,
  roleCode: string,
  band: string,
  taskId: string,
): boolean => profile.doneTasks.includes(taskKey(roleCode, band, taskId));

/** Số hành tinh đã đặt chân tới. */
export const visitedRoleCount = (
  profile: Pick<ProfileState, 'skill' | 'doneTasks'>,
): number =>
  new Set([
    ...Object.keys(profile.skill),
    ...profile.doneTasks.map((k) => k.split(':')[0]),
  ]).size;
