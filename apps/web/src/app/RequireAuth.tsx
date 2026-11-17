import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingBlock } from '@datn/ui';
import { useMe } from '../api/hooks';
import { refreshAccess } from '../api/live/http';
import { useSession } from '../api/session';
import { sourceOf } from '../api';

/**
 * Cổng của mọi màn cần đăng nhập. Mở lại tab chỉ còn refresh token thì làm
 * mới access token trước, rồi mới hỏi `me`.
 */
export function RequireAuth() {
  const location = useLocation();
  const { accessToken, refreshToken } = useSession();
  const me = useMe();

  useEffect(() => {
    if (!accessToken && refreshToken && sourceOf('auth') === 'live') {
      void refreshAccess();
    }
  }, [accessToken, refreshToken]);

  if (!accessToken && !refreshToken) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  if (me.isError) {
    return (
      <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
    );
  }
  if (!me.data)
    return <LoadingBlock text="Đang mở phiên của bạn…" className="min-h-dvh" />;
  return <Outlet />;
}

/** Đã đăng nhập thì không ở lại trang đăng nhập, đăng ký. */
export function RedirectIfSignedIn() {
  const me = useMe();
  if (me.data) return <Navigate to="/galaxy" replace />;
  return <Outlet />;
}
