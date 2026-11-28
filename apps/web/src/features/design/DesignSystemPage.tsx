import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Eye, Layers, MousePointer2, Sun } from 'lucide-react';
import {
  CartoonPlanet,
  InkStar,
  Logo,
  LogoMark,
  NightCard,
  NightSky,
  toonButtonClasses,
} from '@datn/ui';
import { CelestialShowcase, DayArtExamples } from './GameKit';
import {
  DirectionColors,
  DirectionType,
  LogoGuide,
} from './DirectionFoundations';
import { DirectionComponents } from './DirectionComponents';
import { DirectionRules } from './DirectionRules';

export const DIRECTION_SECTIONS = [
  { id: 'nguyen-tac', title: 'Nguyên tắc' },
  { id: 'luat', title: 'Luật dùng' },
  { id: 'logo', title: 'Logo & cách dùng' },
  { id: 'mau', title: 'Màu & tương phản' },
  { id: 'chu', title: 'Chữ' },
  { id: 'motif-dem', title: 'Motif đêm' },
  { id: 'tranh-ngay', title: 'Nhân vật & bối cảnh' },
  { id: 'thanh-phan', title: 'Thành phần' },
  { id: 'mau-man', title: 'Mẫu màn' },
] as const;
const PRINCIPLES = [
  {
    icon: MousePointer2,
    title: 'Một thông điệp, một hành động',
    body: 'Mỗi khung nhìn có một ý chính và một nút nổi bật. Những lựa chọn khác nhẹ hơn.',
  },
  {
    icon: Eye,
    title: 'Bớt chữ, thêm khoảng thở',
    body: 'Khoảng 35 từ mỗi khối. Giải thích dài đặt trong Xem thêm, tab hoặc bước kế tiếp.',
  },
  {
    icon: Layers,
    title: 'Nét mực, màu phẳng',
    body: 'Nét mực theo tầng: 3px cho vật đứng trên nền, 2px cho điều khiển trong thẻ, 1,5px cho đường chia. Màu tô phẳng; mờ biên chỉ dành cho tinh vân trên bản đồ.',
  },
  {
    icon: Sun,
    title: 'Ngày trong ca, đêm ngoài ca',
    body: 'Ca làm là nơi làm việc sáng và ấm. Khám phá nghề nằm giữa trời đêm navy, cùng ngôn ngữ nét mực.',
  },
];

/** Art direction dùng component thật. Ví dụ chỉ đổi trạng thái tại chỗ. */
export default function DesignSystemPage() {
  const [active, setActive] = useState<string>('nguyen-tac');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -65% 0px' },
    );
    DIRECTION_SECTIONS.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <div className="theme-toon-night min-h-dvh">
      <header className="relative isolate overflow-hidden border-b-[3px] border-toon-night-deep">
        <NightSky scene="home" horizon="city" seed="art-direction" />
        <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-7 sm:px-8">
          <div className="flex items-center justify-between gap-4 rounded-2xl border-[3px] border-toon-night-deep bg-toon-night-deep px-4 py-3">
            <Link
              to="/"
              aria-label="JobQuest, trang chủ"
              className="rounded-lg"
            >
              <Logo size="md" />
            </Link>
            <Link
              to="/galaxy"
              className="rounded-lg py-2 text-sm font-bold text-toon-star underline underline-offset-4"
            >
              Về bản đồ
            </Link>
          </div>
          <div className="mt-14 grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-4 inline-block -rotate-2 rounded-lg border-[3px] border-toon-ink bg-toon-star px-4 py-1 font-toon font-bold text-toon-ink shadow-toon">
                Cartoon viền mực · Golden Trio
              </p>
              <h1 className="max-w-3xl font-toon text-4xl leading-tight font-extrabold sm:text-6xl">
                Art direction JobQuest
              </h1>
              <p className="mt-4 max-w-lg text-base text-toon-paper">
                Một ngôn ngữ hình ảnh cho cả hành trình: trời đêm khi khám phá,
                giấy kem khi bước vào ca làm.
              </p>
              <Link
                to="#nguyen-tac"
                className={toonButtonClasses({ className: 'mt-7' })}
              >
                Khám phá bộ thiết kế
                <ArrowDown size={18} aria-hidden />
              </Link>
            </div>
            <div className="hidden -rotate-6 md:block">
              <LogoMark size={180} title="La bàn Golden Trio" />
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav
          aria-label="Mục lục art direction"
          className="sticky top-0 z-30 min-w-0 rounded-2xl border-[3px] border-toon-night-deep bg-toon-night-deep p-2 lg:top-6"
        >
          <ol className="flex gap-2 overflow-x-auto px-1 py-2 lg:flex-col lg:overflow-visible">
            {DIRECTION_SECTIONS.map((item, i) => (
              <li key={item.id} className="shrink-0">
                <Link
                  to={`#${item.id}`}
                  aria-current={active === item.id ? 'location' : undefined}
                  onClick={() => setActive(item.id)}
                  className={`flex min-h-11 items-center gap-2 rounded-xl border-2 border-toon-night-deep px-3 py-2 font-toon text-sm font-bold whitespace-nowrap lg:whitespace-normal lg:text-left focus-visible:outline-none focus-visible:shadow-toon-focus ${active === item.id ? 'bg-toon-star text-toon-ink shadow-toon-sm' : 'bg-toon-night-soft text-toon-paper'}`}
                >
                  <span className="text-xs tabular-nums">0{i + 1}</span>
                  {item.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <main className="min-w-0 space-y-12">
          <DirectionSection id="nguyen-tac" title="Nguyên tắc" number={1}>
            <div className="grid gap-5 sm:grid-cols-2">
              {PRINCIPLES.map(({ icon: Icon, title, body }) => (
                <NightCard key={title}>
                  <Icon size={28} strokeWidth={2.5} aria-hidden />
                  <h3 className="mt-4 font-toon text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm text-toon-ink-soft">{body}</p>
                </NightCard>
              ))}
            </div>
          </DirectionSection>
          <DirectionSection id="luat" title="Luật dùng" number={2}>
            <DirectionRules />
          </DirectionSection>
          <DirectionSection id="logo" title="Logo & cách dùng" number={3}>
            <LogoGuide />
          </DirectionSection>
          <DirectionSection id="mau" title="Màu & tương phản" number={4}>
            <DirectionColors />
          </DirectionSection>
          <DirectionSection id="chu" title="Chữ" number={5}>
            <DirectionType />
          </DirectionSection>
          <DirectionSection id="motif-dem" title="Motif đêm" number={6}>
            <CelestialShowcase />
          </DirectionSection>
          <DirectionSection
            id="tranh-ngay"
            title="Nhân vật & bối cảnh ngày"
            number={7}
          >
            <div className="theme-toon toon-dots space-y-6 rounded-2xl border-[3px] border-toon-ink p-4 sm:p-6">
              <DayArtExamples />
            </div>
          </DirectionSection>
          <DirectionSection id="thanh-phan" title="Thành phần" number={8}>
            <DirectionComponents />
          </DirectionSection>
          <DirectionSection id="mau-man" title="Mẫu màn" number={9}>
            <ScreenSamples />
          </DirectionSection>
        </main>
      </div>
      <footer className="border-t-[3px] border-toon-ink bg-toon-night-deep px-5 py-8 text-center text-xs text-toon-paper">
        JobQuest · Golden Trio · Các trạng thái và con số trong trang là ví dụ
        giao diện.
      </footer>
    </div>
  );
}

function DirectionSection({
  id,
  title,
  number,
  children,
}: {
  id: string;
  title: string;
  number: number;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="min-w-0 scroll-mt-28 lg:scroll-mt-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-toon-night-deep bg-toon-star font-toon text-lg font-extrabold text-toon-ink shadow-toon-sm">
          {number}
        </span>
        <h2 id={`${id}-title`} className="font-toon text-3xl font-extrabold">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ScreenSamples() {
  const screens = [
    { to: '/', title: 'Trang chủ', kind: 'night' },
    { to: '/galaxy', title: 'Bản đồ ngân hà', kind: 'map' },
    { to: '/occupations/SWE_BACKEND', title: 'Hồ sơ nghề', kind: 'paper' },
    { to: '/welcome', title: 'Chào mừng', kind: 'stars' },
    { to: '/quiz', title: 'Get to know me', kind: 'quiz' },
    { to: '/profile', title: 'Hành trang', kind: 'paper' },
  ];
  return (
    <>
      <p className="mb-5 text-sm text-toon-star-soft">
        Bản thu nhỏ bằng component, không phải ảnh chụp. Bấm để mở màn thật; các
        màn riêng tư cần đăng nhập.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {screens.map((screen) => (
          <Link
            key={screen.to}
            to={screen.to}
            className="min-w-0 overflow-hidden rounded-2xl border-[3px] border-toon-ink bg-toon-paper text-toon-ink shadow-toon focus-visible:shadow-toon-focus"
          >
            <div
              aria-hidden
              className="relative isolate h-40 overflow-hidden border-b-[3px] border-toon-ink bg-toon-night"
            >
              <NightSky
                scene={screen.kind === 'map' ? 'map' : 'plain'}
                seed={screen.to}
              />
              <div className="relative flex h-full items-center justify-center gap-3 p-5">
                {screen.kind === 'map' ? (
                  <CartoonPlanet size={70} seed="SWE_BACKEND" />
                ) : screen.kind === 'stars' ? (
                  <>
                    <InkStar size={36} />
                    <InkStar size={60} />
                    <InkStar size={36} />
                  </>
                ) : (
                  <div className="w-full max-w-40 rounded-lg border-[3px] border-toon-ink bg-toon-paper p-3 shadow-toon-sm">
                    <div className="mb-3 h-3 w-2/3 rounded bg-toon-ink" />
                    <div className="h-2 w-full rounded bg-toon-sand" />
                    <div className="mt-2 h-2 w-3/4 rounded bg-toon-sand" />
                    <div className="mt-3 h-5 w-1/2 rounded-lg border-2 border-toon-ink bg-toon-star" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-toon text-lg font-bold">{screen.title}</h3>
              <span className="mt-1 block text-xs text-toon-ink-soft">
                {screen.to} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
