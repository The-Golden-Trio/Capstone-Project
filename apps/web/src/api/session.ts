/**
 * Phiên đăng nhập Bearer (Q2): access token chỉ giữ trong bộ nhớ, refresh
 * token ở localStorage để mở lại tab vẫn còn phiên.
 */
import { create } from 'zustand';

const REFRESH_KEY = 'jq:refresh';

function readRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function writeRefresh(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* Trình duyệt chặn bộ nhớ: phiên chỉ sống tới khi đóng tab. */
  }
}

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clear: () => void;
}

export const useSession = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: readRefresh(),
  setTokens: (accessToken, refreshToken) => {
    writeRefresh(refreshToken);
    set({ accessToken, refreshToken });
  },
  clear: () => {
    writeRefresh(null);
    set({ accessToken: null, refreshToken: null });
  },
}));
