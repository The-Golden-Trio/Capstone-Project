import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  IconButton,
  Logo,
  Menu,
  Sheet,
  LoadingBlock as Loading,
} from '@datn/ui';
import { useEffect, useRef, useState } from 'react';
import { STAFF_DEMO } from '../api/demo-server';
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { cx } from '../lib/cx';
import { portalsOf, useAuth, type Portal } from '../store/auth';
import { NotificationBell } from './NotificationBell';
import { breadcrumbLabel } from './navigation';

const PORTAL_LABEL: Record<Portal, string> = {
  ca: 'Quản trị nội dung',
  de: 'Chuyên gia nghề',
};

/** Chỉ cho vào khi đã đăng nhập và có ít nhất một vai staff (AD-02a, AD-03a). */
export function RequireStaff() {
  const { status, me } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <Loading />;
  if (status === 'anon')
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    );
  if (portalsOf(me).length === 0)
    return (
      <main className="mx-auto max-w-lg p-8">
        <h1 className="mb-2 text-xl font-semibold">
          Không có quyền vào staff app
        </h1>
        <p className="text-ink-faint">
          Tài khoản này không có vai Content Admin hay Domain Expert. Nhờ quản
          trị hệ thống cấp quyền nếu bạn là chuyên gia hoặc quản trị nội dung.
        </p>
      </main>
    );
  return <StaffShell />;
}

/** T00: điều hướng theo vai, sidebar thu gọn và drawer trên điện thoại. */
export function StaffShell() {
  const { me, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  const portals = portalsOf(me);
  const current: Portal = location.pathname.startsWith('/de') ? 'de' : 'ca';
  const portal = portals.includes(current) ? current : portals[0];
  const occupation = location.pathname.match(/\/occupations\/([^/]+)/)?.[1];
  const links =
    portal === 'ca'
      ? [
          { to: '/ca', label: 'Tổng quan', mark: '◈' },
          { to: '/ca/catalogue', label: 'Danh mục nghề', mark: '▤' },
          { to: '/ca/assets', label: 'Tài nguyên / asset', mark: '▧' },
          { to: '/ca/catalogue/imports', label: 'Nhập dữ liệu', mark: '↓' },
          { to: '/ca/settings', label: 'Cài đặt trò chơi', mark: '⚙' },
          ...(occupation
            ? [
                {
                  to: `/ca/occupations/${occupation}/scenarios`,
                  label: 'Ô scenario',
                  mark: '▦',
                },
                {
                  to: `/ca/occupations/${occupation}/review-criteria`,
                  label: 'Tiêu chí duyệt',
                  mark: '✓',
                },
              ]
            : []),
        ]
      : [
          { to: '/de', label: 'Việc của tôi', mark: '◈' },
          { to: '/de#review-queue', label: 'Hàng duyệt', mark: '✓' },
          { to: '/de#authored', label: 'Scenario tôi viết', mark: '▤' },
        ];
  const navigation = (compact: boolean) => (
    <nav aria-label={PORTAL_LABEL[portal]} className="space-y-1">
      <p
        className={cx(
          'px-3 pb-3 text-xs font-semibold text-ink-faint',
          compact && 'sr-only',
        )}
      >
        {PORTAL_LABEL[portal]}
      </p>
      {links.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end
          aria-current={
            (
              n.to.includes('#')
                ? location.pathname + location.hash === n.to
                : location.pathname === n.to && !location.hash
            )
              ? 'page'
              : false
          }
          onClick={() => setDrawer(false)}
          title={compact ? n.label : undefined}
          className={({ isActive }) =>
            cx(
              'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              (
                n.to.includes('#')
                  ? location.pathname + location.hash === n.to
                  : isActive && !location.hash
              )
                ? 'bg-night-700/60 text-ink'
                : 'text-ink-muted hover:bg-night-800 hover:text-ink',
            )
          }
        >
          <span aria-hidden className="w-5 shrink-0 text-center text-info">
            {n.mark}
          </span>
          <span className={compact ? 'sr-only' : ''}>{n.label}</span>
        </NavLink>
      ))}
      {portal === 'ca' && !occupation && !compact && (
        <p className="px-3 pt-4 text-xs leading-relaxed text-ink-faint">
          Chọn nghề trong danh mục để mở ô scenario và tiêu chí duyệt.
        </p>
      )}
    </nav>
  );
  const portalSwitch = portals.length > 1 && (
    <div
      aria-label="Chuyển vai"
      className="flex flex-wrap gap-1 border-t border-line pt-3"
    >
      {portals.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === portal ? 'subtle' : 'ghost'}
          onClick={() => {
            navigate(`/${p}`);
            setDrawer(false);
          }}
        >
          {PORTAL_LABEL[p]}
        </Button>
      ))}
    </div>
  );
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView({ block: 'start' });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:bg-night-800 focus:p-3"
      >
        Bỏ qua tới nội dung
      </a>
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-night-950 md:flex',
          collapsed ? 'w-20' : 'w-60',
        )}
      >
        <Link
          to="/"
          aria-label="JobQuest Staff, về tổng quan"
          className="flex h-16 items-center justify-center border-b border-line px-3"
        >
          <Logo
            size={collapsed ? 'sm' : 'md'}
            className={collapsed ? '[&>span]:hidden' : ''}
          />
        </Link>
        <div className="flex-1 overflow-auto px-3 py-6">
          {navigation(collapsed)}
        </div>
        <div className="space-y-3 border-t border-line p-3">
          {!collapsed && portalSwitch}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? 'Mở rộng thanh điều hướng'
                : 'Thu gọn thanh điều hướng'
            }
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? '→' : '← Thu gọn'}
          </Button>
        </div>
      </aside>
      <div className={collapsed ? 'md:pl-20' : 'md:pl-60'}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-night-900/95 px-4 backdrop-blur-md sm:px-6">
          <IconButton
            label="Mở điều hướng"
            icon={<span aria-hidden>☰</span>}
            className="md:hidden"
            onClick={() => setDrawer(true)}
          />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-xs text-ink sm:hidden"
              title={breadcrumbLabel(location.pathname, location.hash)}
            >
              {breadcrumbLabel(location.pathname, location.hash)}
            </p>
            <div className="hidden sm:block">
              <Breadcrumbs
                items={[
                  { label: PORTAL_LABEL[portal], href: `/${portal}` },
                  { label: breadcrumbLabel(location.pathname, location.hash) },
                ]}
                renderLink={(href, children) => (
                  <Link to={href}>{children}</Link>
                )}
              />
            </div>
          </div>
          {STAFF_DEMO && (
            <span title="Dữ liệu mô phỏng trong trình duyệt; tải lại trang sẽ khôi phục dữ liệu ban đầu.">
              <Badge tone="info">Dữ liệu mẫu</Badge>
            </span>
          )}
          <NotificationBell />
          <Menu
            label="Tài khoản"
            trigger={(props) => (
              <button
                {...props}
                aria-label={`Tài khoản ${me?.displayName ?? 'Staff'}`}
                className="flex min-h-11 items-center gap-3 rounded-md px-2 py-1.5 hover:bg-night-800"
              >
                <Avatar name={me?.displayName ?? 'Staff'} size={28} />
                <span className="hidden max-w-40 truncate text-sm font-semibold sm:block">
                  {me?.displayName}
                </span>
                <span aria-hidden className="text-ink-faint">
                  ⌄
                </span>
              </button>
            )}
            items={[
              ...portals
                .filter((p) => p !== portal)
                .map((p) => ({
                  key: p,
                  label: `Chuyển sang ${PORTAL_LABEL[p]}`,
                  onSelect: () => navigate(`/${p}`),
                })),
              {
                key: 'sign-out',
                label: 'Đăng xuất',
                danger: true,
                onSelect: () => {
                  void (async () => {
                    await signOut();
                    navigate('/login');
                  })();
                },
              },
            ]}
          />
        </header>
        <main
          id="main"
          ref={main}
          className="staff-workspace mx-auto max-w-[1440px] scroll-mt-20 px-4 py-6 sm:px-6 lg:px-8"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      <Sheet
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Điều hướng staff"
        className="staff-navigation-drawer mr-auto ml-0 max-w-80 rounded-l-none"
      >
        {navigation(false)}
        <div className="mt-6">{portalSwitch}</div>
      </Sheet>
    </div>
  );
}

/**
 * Chỉ cho vào nhánh của một cổng khi có vai tương ứng; sai vai thì về cổng
 * của mình. Máy chủ vẫn chặn theo `@Roles`, đây chỉ để không mở màn vô dụng.
 */
export function RequirePortal({ portal }: { portal: Portal }) {
  const me = useAuth((s) => s.me);
  const portals = portalsOf(me);
  if (!portals.includes(portal))
    return <Navigate to={`/${portals[0] ?? 'ca'}`} replace />;
  return <Outlet />;
}

/** Mở đúng cổng theo vai (AD-02a, AD-03a). */
export function PortalRedirect() {
  const me = useAuth((s) => s.me);
  const portals = portalsOf(me);
  return <Navigate to={`/${portals[0] ?? 'ca'}`} replace />;
}
