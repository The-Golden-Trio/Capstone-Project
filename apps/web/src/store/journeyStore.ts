/**
 * "Đang ở đâu" — hành tinh và cấp bậc người chơi vừa ghé.
 *
 * Nguồn sự thật vẫn là URL (`/jobs/:roleCode/:band`); store này chỉ nhớ lại
 * để sidebar và trang tổng quan biết chỗ cũ mà dẫn về.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface JourneyStore {
  roleCode: string | null;
  band: string | null;
  setLocation: (roleCode: string, band: string) => void;
  clear: () => void;
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set) => ({
      roleCode: null,
      band: null,
      setLocation: (roleCode, band) => set({ roleCode, band }),
      clear: () => set({ roleCode: null, band: null }),
    }),
    { name: 'vaonghe.journey.v1' },
  ),
);
