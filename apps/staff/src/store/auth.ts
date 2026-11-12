/**
 * Phiên staff. Token ở `api/session`; thông tin người dùng hỏi lại `/me` mỗi
 * lần mở app. Một người có thể giữ cả hai vai: `portal` là cổng đang xem.
 */
import { create } from 'zustand';
import { authApi } from '../api/endpoints';
import { hasSession } from '../api/session';
import type { Me } from '../api/types';

export type Portal = 'ca' | 'de';

export const portalsOf = (me: Me | null): Portal[] => [
  ...(me?.roles.includes('CONTENT_ADMIN') ? (['ca'] as const) : []),
  ...(me?.roles.includes('DOMAIN_EXPERT') ? (['de'] as const) : []),
];

interface AuthStore {
  status: 'loading' | 'authed' | 'anon';
  me: Me | null;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<Me>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthStore>()((set) => ({
  status: 'loading',
  me: null,
  hydrate: async () => {
    if (!hasSession()) {
      set({ status: 'anon', me: null });
      return;
    }
    try {
      set({ status: 'authed', me: await authApi.getMe() });
    } catch {
      set({ status: 'anon', me: null });
    }
  },
  signIn: async (email, password) => {
    const me = await authApi.signIn(email, password);
    set({ status: 'authed', me });
    return me;
  },
  signOut: async () => {
    try {
      await authApi.signOut();
    } finally {
      set({ status: 'anon', me: null });
    }
  },
}));
