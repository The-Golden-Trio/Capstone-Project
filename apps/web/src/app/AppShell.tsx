import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Backpack,
  LogOut,
  MessageSquareHeart,
  Orbit,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';
import {
  Logo,
  Menu,
  NightSky,
  TopNav,
  BottomNav,
  ToonBadge,
  Tooltip,
} from '@datn/ui';
import { apiMode, usesSampleData, HYBRID_SOURCES, sourceOf } from '../api';
import { useMe, useSignOut } from '../api/hooks';

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

  const items = NAV.map(({ to, label, icon: Icon }) => ({
    key: to,
    href: to,
    label,
    icon: <Icon size={19} />,
    active: pathname === to || pathname.startsWith(`${to}/`),
  }));
  return (
    <div className="theme-toon-night relative isolate flex min-h-dvh flex-col">
      <NightSky scene="plain" seed="shell" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-toon-star focus:px-4 focus:py-3 focus:text-toon-ink"
      >
        Bỏ qua thanh điều hướng
      </a>
      <TopNav
        className="sticky top-0 z-30"
        logo={
          <Link
            to="/galaxy"
            aria-label="JobQuest, về bản đồ ngân hà"
            className="rounded-lg focus-visible:shadow-toon-focus"
          >
            <Logo size="md" />
          </Link>
        }
        items={items}
        renderLink={({ href, ...props }) => <Link {...props} to={href} />}
        right={
          <>
            <SampleLabel />
            <div className="[&_[role=menu]]:rounded-2xl [&_[role=menu]]:border-[3px] [&_[role=menu]]:border-toon-ink [&_[role=menu]]:bg-toon-paper [&_[role=menu]]:shadow-toon-lg [&_[role=menuitem]]:font-semibold [&_[role=menuitem]]:text-toon-ink [&_[role=menuitem]:focus]:bg-toon-sand [&_[role=menuitem]:hover]:bg-toon-sand">
              <Menu
                label="Tài khoản"
                trigger={(props) => (
                  <button
                    type="button"
                    aria-label={`Tài khoản ${name}`}
                    {...props}
                    className="flex min-h-11 items-center gap-2 rounded-full border-[3px] border-toon-night-deep bg-toon-night-soft p-1 sm:pr-3 text-toon-paper focus-visible:outline-none focus-visible:shadow-toon-focus"
                  >
                    <span
                      aria-hidden
                      className="grid size-8 place-items-center rounded-full border-2 border-toon-ink bg-toon-mint font-toon font-extrabold text-toon-ink"
                    >
                      {name.slice(0, 1) || <UserRound size={18} />}
                    </span>
                    <span className="hidden max-w-32 truncate text-sm font-semibold text-toon-paper sm:inline">
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
          </>
        }
      />
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="relative flex-1 pb-[calc(7rem+env(safe-area-inset-bottom))] focus:outline-none md:pb-10"
      >
        {children}
      </main>
      <footer className="relative hidden border-t-[3px] border-toon-night-deep bg-toon-night-deep px-4 py-5 text-center text-xs text-toon-paper md:block">
        AI dẫn dắt và chấm ca làm. Kết quả để tham khảo, không gửi trường hay
        nhà tuyển dụng.{' · '}
        <Link to="/feedback" className="underline underline-offset-4">
          Góp ý
        </Link>
      </footer>
      <BottomNav
        className="fixed inset-x-0 bottom-0 z-30 md:hidden"
        label="Điều hướng chính"
        items={[
          ...items.map((item, i) => ({ ...item, label: NAV[i].short })),
          {
            key: 'settings',
            href: '/settings',
            label: 'Tài khoản',
            icon: <Settings size={20} />,
            active: pathname === '/settings',
          },
        ]}
        renderLink={({ href, ...props }) => <Link {...props} to={href} />}
      />
    </div>
  );
}

/** Giữ nhãn mẫu rõ cả trên điện thoại, chi tiết nguồn ở tooltip. */
function SampleLabel() {
  if (!usesSampleData && apiMode !== 'demo') return null;
  const names: Record<keyof typeof HYBRID_SOURCES, string> = {
    auth: 'Đăng nhập',
    account: 'Tài khoản',
    catalogue: 'Danh mục nghề',
    quiz: 'Get to know me',
    progress: 'Tiến độ, hồ sơ',
    play: 'Ca làm (AI giả)',
    feedback: 'Đánh giá, góp ý',
  };
  const sources = (Object.keys(names) as Array<keyof typeof names>)
    .filter((key) => sourceOf(key) === 'demo')
    .map((key) => names[key]);
  return (
    <Tooltip content={`Đang dùng dữ liệu mẫu: ${sources.join(', ')}.`}>
      <span
        tabIndex={0}
        className="rounded-full focus-visible:shadow-toon-focus"
      >
        <ToonBadge tone="mustard">Dữ liệu mẫu</ToonBadge>
      </span>
    </Tooltip>
  );
}
