/**
 * Phiên đăng nhập.
 *
 * KHÔNG lưu xuống localStorage: cookie httpOnly mới là nguồn sự thật, và một
 * bản sao trong localStorage chỉ tạo ra cảnh "giao diện tưởng còn đăng nhập
 * trong khi phiên đã hết". Mỗi lần mở app thì hỏi lại `/auth/me` một lần.
 */
import { create } from 'zustand';
import { authApi } from '../api/endpoints';
import type { SessionUser } from '../api/schemas';

export type AuthStatus = 'loading' | 'authed' | 'anon';

interface AuthStore {
  status: AuthStatus;
  user: SessionUser | null;
  /** Hỏi máy chủ xem còn phiên không. Gọi một lần lúc khởi động. */
  hydrate: () => Promise<void>;
  setUser: (user: SessionUser) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  status: 'loading',
  user: null,

  hydrate: async () => {
    try {
      const user = await authApi.me();
      set({ user, status: 'authed' });
    } catch {
      set({ user: null, status: 'anon' });
    }
  },

  setUser: (user) => set({ user, status: 'authed' }),

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      // Kể cả khi gọi hỏng thì phía giao diện vẫn phải coi như đã đăng xuất.
      set({ user: null, status: 'anon' });
    }
  },
}));
