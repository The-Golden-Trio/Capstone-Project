/**
 * Phiên đăng nhập.
 *
 * Token nằm ở `api/session` (access trong bộ nhớ, refresh ở localStorage).
 * Thông tin người dùng KHÔNG lưu xuống: mỗi lần mở app hỏi lại `/auth/me`,
 * để giao diện không tưởng còn đăng nhập trong khi phiên đã hết.
 */
import { create } from 'zustand';
import { authApi } from '../api/endpoints';
import { hasSession } from '../api/session';
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
    if (!hasSession()) {
      set({ user: null, status: 'anon' });
      return;
    }
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
