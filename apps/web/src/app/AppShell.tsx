import { useEffect, useRef, type ReactNode } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Backpack,
  LogOut,
  MessageSquareHeart,
  Orbit,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Logo, Menu, PlayerEmblem, StarField, cn } from '@datn/ui';
import { useMe, useSignOut } from '../api/hooks';
import { SampleDataPill } from './SampleDataPill';

const NAV = [
  { to: '/galaxy', label: 'Bản đồ ngân hà', short: 'Bản đồ', icon: Orbit },
  { to: '/profile', label: 'Hành trang', short: 'Hành trang', icon: Backpack },
  {
    to: '/quiz/result',
    label: 'Chân dung',
    short: 'Chân dung',
    icon: Sparkles,
  },
] as const;

/** Khung chung của các màn khám phá: thanh trên, nền sao, tab dưới trên điện thoại. */
export function AppShell({ children }: { children: ReactNode }) {
  const me = useMe();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const name = me.data?.displayName ?? '';
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);
  // Đổi trang thì đưa focus về nội dung mới cho người dùng bàn phím và
  // trình đọc màn hình (đổi query trong cùng trang thì không).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <StarField fixed seed="shell" density={0.8} glints={6} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-night-800 focus:px-3 focus:py-2"
      >
        Bỏ qua thanh điều hướng
      </a>

      <header className="sticky top-0 z-30 border-b border-line/70 bg-night-900/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            to="/galaxy"
            aria-label="JobQuest, về bản đồ ngân hà"
            className="rounded-md"
          >
            <Logo size="sm" />
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="ml-4 hidden items-center gap-1 md:flex"
          >
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-night-700/80 text-gold-100 shadow-[inset_0_0_0_1px_rgb(212_176_106/0.4)]'
                      : 'text-ink-faint hover:bg-night-800/70 hover:text-ink',
                  )
                }
              >
                <Icon size={16} aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <SampleDataPill />
            <Menu
              label="Tài khoản"
              trigger={(props) => (
                <button
                  type="button"
                  aria-label={`Tài khoản ${name}`}
                  {...props}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-night-800/70 focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <PlayerEmblem seed={me.data?.id ?? name} size={30} />
                  <span className="hidden max-w-32 truncate text-sm font-semibold text-ink sm:inline">
                    {name}
                  </span>
                </button>
              )}
              items={[
                {
                  key: 'profile',
                  label: 'Hành trang của bạn',
                  icon: <UserRound size={16} />,
                  onSelect: () => navigate('/profile'),
                },
                {
                  key: 'settings',
                  label: 'Cài đặt tài khoản',
                  icon: <Settings size={16} />,
                  onSelect: () => navigate('/settings'),
                },
                {
                  key: 'feedback',
                  label: 'Góp ý cho JobQuest',
                  icon: <MessageSquareHeart size={16} />,
                  onSelect: () => navigate('/feedback'),
                },
                {
                  key: 'sign-out',
                  label: 'Đăng xuất',
                  icon: <LogOut size={16} />,
                  danger: true,
                  onSelect: () =>
                    signOut.mutate(undefined, {
                      onSettled: () => navigate('/'),
                    }),
                },
              ]}
            />
          </div>
        </div>
      </header>

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="relative flex-1 pb-24 focus:outline-none md:pb-10"
      >
        {children}
      </main>

      <footer className="hidden border-t border-line/50 py-5 text-center text-xs text-night-300 md:block">
        Màn chơi do AI dẫn dắt và chấm; kết quả chỉ để bạn tham khảo, không gửi
        cho ai.
        {' · '}
        <Link
          to="/feedback"
          className="underline-offset-2 hover:text-ink hover:underline"
        >
          Góp ý
        </Link>
      </footer>

      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-night-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-4">
          {[
            ...NAV,
            {
              to: '/settings',
              label: 'Tài khoản',
              short: 'Tài khoản',
              icon: Settings,
            },
          ].map(({ to, short, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                    isActive ? 'text-gold-200' : 'text-night-300',
                  )
                }
              >
                <Icon size={20} aria-hidden />
                {short}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
