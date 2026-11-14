import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Loading } from '../components/ui';
import { cx } from '../lib/cx';
import { portalsOf, useAuth, type Portal } from '../store/auth';
import { NotificationBell } from './NotificationBell';

const PORTAL_LABEL: Record<Portal, string> = {
  ca: 'Content Admin',
  de: 'Domain Expert',
};

const NAV: Record<Portal, Array<{ to: string; label: string }>> = {
  ca: [
    { to: '/ca', label: 'Nghề của tôi' },
    { to: '/ca/assets', label: 'Thư viện asset' },
  ],
  de: [{ to: '/de', label: 'Việc của tôi' }],
};

/** Chỉ cho vào khi đã đăng nhập và có ít nhất một vai staff (AD-02a, AD-03a). */
export function RequireStaff() {
  const { status, me } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <Loading />;
  if (status === 'anon')
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (portalsOf(me).length === 0)
    return (
      <main className="mx-auto max-w-lg p-8">
        <h1 className="mb-2 text-xl font-semibold">
          Không có quyền vào staff app
        </h1>
        <p className="text-muted">
          Tài khoản này không có vai Content Admin hay Domain Expert. Nhờ quản
          trị hệ thống cấp quyền nếu bạn là chuyên gia hoặc quản trị nội dung.
        </p>
      </main>
    );
  return <StaffShell />;
}

/** T00: khung chung — đổi cổng, chuông thông báo, đăng xuất. */
export function StaffShell() {
  const { me, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const portals = portalsOf(me);
  const current: Portal = location.pathname.startsWith('/de') ? 'de' : 'ca';
  const portal = portals.includes(current) ? current : portals[0];

  return (
    <div className="relative min-h-screen">
      <div className="starfield" aria-hidden="true" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-surf focus:p-2"
      >
        Bỏ qua tới nội dung
      </a>
      <header className="sticky top-0 z-10 border-b border-line-gold bg-linear-to-b from-bg to-bg/80 backdrop-blur-[8px]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt=""
              width={30}
              height={30}
              className="size-[30px] drop-shadow-[0_2px_8px_rgba(212,176,106,.3)]"
            />
            <span className="font-display text-[19px] leading-none font-semibold tracking-[0.01em]">
              Job<span className="text-brand">Quest</span>
            </span>
            <span className="kicker text-[9px]">Staff</span>
          </Link>
          {portals.length > 1 ? (
            <div
              role="group"
              aria-label="Cổng"
              className="flex rounded-full border border-blue/45 bg-bg/40 p-0.5"
            >
              {portals.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={p === portal}
                  onClick={() => navigate(`/${p}`)}
                  className={cx(
                    'rounded-full px-3 py-1 text-[12px] font-semibold transition-colors',
                    p === portal
                      ? 'bg-brand text-bg'
                      : 'text-ink-2 hover:text-brand-2',
                  )}
                >
                  {PORTAL_LABEL[p]}
                </button>
              ))}
            </div>
          ) : (
            <span className="rounded-full border border-blue/45 px-3 py-1 text-[12px] font-semibold text-ink-2">
              {PORTAL_LABEL[portal]}
            </span>
          )}
          <nav aria-label="Điều hướng" className="flex gap-2">
            {NAV[portal].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) =>
                  cx(
                    'border-b px-2 py-1.5 text-[11.5px] font-semibold tracking-[0.12em] uppercase transition-colors',
                    isActive
                      ? 'border-brand/70 text-brand'
                      : 'border-transparent text-muted hover:text-ink',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <span className="text-[13px] text-ink-2">{me?.displayName}</span>
            <button
              type="button"
              className="rounded-full border border-transparent px-3 py-1 text-[12.5px] font-semibold text-muted transition-colors hover:border-blue/45 hover:text-ink"
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="relative z-1 mx-auto max-w-6xl px-4 py-7">
        <Outlet />
      </main>
    </div>
  );
}

/** Mở đúng cổng theo vai (AD-02a, AD-03a). */
export function PortalRedirect() {
  const me = useAuth((s) => s.me);
  const portals = portalsOf(me);
  return <Navigate to={`/${portals[0] ?? 'ca'}`} replace />;
}
