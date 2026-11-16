/**
 * Chọn nguồn dữ liệu cho từng dịch vụ.
 *
 * - `live`: mọi dịch vụ gọi API thật (khi backend đủ endpoint).
 * - `hybrid` (mặc định tới khi backend đủ): dịch vụ đã có endpoint gọi thật,
 *   phần còn lại dùng dữ liệu mẫu và có nhãn "dữ liệu mẫu" trên giao diện.
 * - `demo`: chạy hoàn toàn trong trình duyệt, không cần máy chủ.
 *
 * Khi Kỳ Nam xong một nhóm endpoint, chuyển dịch vụ đó sang `live` trong
 * `HYBRID_SOURCES` là đủ: màn hình không phải sửa.
 */
import type { ExplorerApi } from './port';
import type { Session } from './types';
import { useSession } from './session';
import { bindExternalUser, createDemoApi, unbindExternalUser } from './demo';
import { liveAccount, liveAuth, liveFeedback, livePlay } from './live';

export type ApiMode = 'live' | 'hybrid' | 'demo';
export type Source = 'live' | 'demo';
type ServiceKey = keyof ExplorerApi;

const envMode = import.meta.env.VITE_API_MODE as ApiMode | undefined;
export const apiMode: ApiMode =
  envMode === 'live' || envMode === 'demo' || envMode === 'hybrid'
    ? envMode
    : 'hybrid';

/** Dịch vụ nào đã có endpoint thật (16/11/2026). */
export const HYBRID_SOURCES: Record<ServiceKey, Source> = {
  auth: 'live',
  account: 'live',
  catalogue: 'demo',
  quiz: 'demo',
  progress: 'demo',
  // Ca làm có endpoint thật nhưng cần worker + Redis + model; mở lượt cần
  // bản đồ đảo (đang là dữ liệu mẫu), nên tạm chạy engine trong trình duyệt.
  play: 'demo',
  feedback: 'live',
};

export function sourceOf(service: ServiceKey): Source {
  if (apiMode === 'live') return 'live';
  if (apiMode === 'demo') return 'demo';
  return HYBRID_SOURCES[service];
}

const demo = createDemoApi();

const live: Partial<ExplorerApi> = {
  auth: liveAuth,
  account: liveAccount,
  play: livePlay,
  feedback: liveFeedback,
};

function pick<K extends ServiceKey>(key: K): ExplorerApi[K] {
  const chosen = sourceOf(key) === 'live' ? live[key] : undefined;
  return (chosen ?? demo[key]) as ExplorerApi[K];
}

/** Mọi nguồn auth đều ghi token vào cùng một kho phiên. */
function withSessionStore(auth: ExplorerApi['auth']): ExplorerApi['auth'] {
  const keep = async (p: Promise<Session>) => {
    const s = await p;
    useSession.getState().setTokens(s.accessToken, s.refreshToken);
    return s;
  };
  return {
    ...auth,
    register: (i) => keep(auth.register(i)),
    signIn: (a, b) => keep(auth.signIn(a, b)),
    signInWithGoogle: (c) => keep(auth.signInWithGoogle(c)),
    refresh: (t) => keep(auth.refresh(t)),
    signOut: async (t) => {
      try {
        await auth.signOut(t);
      } finally {
        useSession.getState().clear();
      }
    },
  };
}

/**
 * Hybrid: tài khoản thật, dữ liệu mẫu gắn theo id tài khoản đó. Mỗi lần hỏi
 * `me` từ API thật thì gắn lại, đăng xuất thì gỡ.
 */
function bindShadow(account: ExplorerApi['account']): ExplorerApi['account'] {
  if (apiMode !== 'hybrid' || sourceOf('account') !== 'live') return account;
  return {
    ...account,
    me: async () => {
      const me = await account.me();
      bindExternalUser(me);
      return me;
    },
  };
}

const auth = withSessionStore(pick('auth'));
export const api: ExplorerApi = {
  auth: {
    ...auth,
    signOut: async (t) => {
      try {
        await auth.signOut(t);
      } finally {
        if (apiMode === 'hybrid') unbindExternalUser();
      }
    },
  },
  account: bindShadow(pick('account')),
  catalogue: pick('catalogue'),
  quiz: pick('quiz'),
  progress: pick('progress'),
  play: pick('play'),
  feedback: pick('feedback'),
};

/** Có phần nào đang là dữ liệu mẫu không, để hiện nhãn trung thực. */
export const usesSampleData = (Object.keys(api) as ServiceKey[]).some(
  (k) => sourceOf(k) === 'demo' && k !== 'auth' && k !== 'account',
);

export { ApiError } from './port';
export type * from './types';
