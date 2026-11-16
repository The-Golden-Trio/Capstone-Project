import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  Eye,
  MousePointer2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Logo,
  Moon,
  Mountains,
  Nebula,
  Panel,
  PlayerEmblem,
  Select,
  Sparkle,
  StarDivider,
  StarField,
  ZodiacConstellation,
  buttonClasses,
  cn,
} from '@datn/ui';
import { ArtGallery } from './ArtGallery';
import {
  ButtonExamples,
  FormExamples,
  LabelExamples,
  NavigationExamples,
  OverlayExamples,
} from './InteractiveExamples';
import {
  ColorExamples,
  ShapeExamples,
  TypographyExamples,
} from './Foundations';
import {
  ChartExamples,
  CompositionExamples,
  FeedbackExamples,
  MotionExamples,
  ProgressExamples,
} from './VisualExamples';

const sections = [
  {
    id: 'nguyen-tac',
    title: 'Nguyên tắc',
    note: 'Thiết kế để người chơi hiểu việc tiếp theo, cảm nhận nghề và giữ quyền tự quyết.',
  },
  {
    id: 'mau',
    title: 'Màu',
    note: 'Nền đêm giữ sự tập trung. Màu vùng nghề cố định; vàng dành cho hành động chính và tiến độ của người chơi.',
  },
  {
    id: 'chu',
    title: 'Chữ',
    note: 'Tiêu đề kể chuyện, nội dung dễ đọc. Mọi dòng tiếng Việt dùng font có đủ dấu.',
  },
  {
    id: 'hinh-khoi',
    title: 'Hình khối',
    note: 'Thẻ kính nhóm thông tin; giấy ngà dành cho tài liệu trong ca; ánh sáng chỉ dành cho điểm cần nhấn.',
  },
  {
    id: 'nut',
    title: 'Nút',
    note: 'Một hành động chính mỗi màn. Các nút còn lại dùng secondary, subtle hoặc ghost; danger cho thao tác xoá.',
  },
  {
    id: 'form',
    title: 'Form',
    note: 'Nhãn luôn ở trên ô nhập. Gợi ý nói rõ cần gì; lỗi nằm cạnh nơi cần sửa.',
  },
  {
    id: 'nhan',
    title: 'Nhãn',
    note: 'Badge tả trạng thái, Chip để lọc, Tag ghi lựa chọn và Kbd chỉ phím tắt. Luôn có chữ đi cùng màu.',
  },
  {
    id: 'tien-do',
    title: 'Tiến độ',
    note: 'Thanh liên tục cho điểm, thanh chia ô cho số màn, vòng tròn cho kết quả một ca. Số luôn có đơn vị.',
  },
  {
    id: 'dieu-huong',
    title: 'Điều hướng',
    note: 'Tabs chuyển nội dung cùng cấp, Breadcrumbs chỉ nơi đang đứng, Stepper giúp theo dõi một hành trình.',
  },
  {
    id: 'lop-phu',
    title: 'Lớp phủ',
    note: 'Dialog cho quyết định cần tập trung, Sheet cho chi tiết mở nhanh, Toast báo kết quả mà không cắt ngang.',
  },
  {
    id: 'phan-hoi',
    title: 'Phản hồi',
    note: 'Loading, lỗi và trạng thái trống đều giải thích điều đang xảy ra. Nội dung AI luôn có nhãn công khai.',
  },
  {
    id: 'bieu-do',
    title: 'Biểu đồ',
    note: 'Mỗi biểu đồ trả lời một câu hỏi. Luôn kèm chữ, không so với người khác, chưa đủ dữ liệu thì để xám.',
  },
  {
    id: 'tranh',
    title: 'Tranh',
    note: 'Hành tinh là nghề, đảo là cấp, chân dung là đồng nghiệp. Seed giúp hình ảnh nhất quán qua các màn.',
  },
  {
    id: 'motif',
    title: 'Motif',
    note: 'Sao, trăng và dãy núi tạo bối cảnh. Dùng nhẹ ở nền để nội dung và hành động vẫn rõ nhất.',
  },
  {
    id: 'chuyen-dong',
    title: 'Chuyển động',
    note: 'Chuyển động giải thích thay đổi hoặc tạo nhịp thở. Luôn tôn trọng tuỳ chọn giảm chuyển động của thiết bị.',
  },
  {
    id: 'vi-du',
    title: 'Ví dụ ghép',
    note: 'Đặt các thành phần cạnh nhau để kiểm tra phân cấp: chuyện gì đang xảy ra, người chơi có thể làm gì tiếp?',
  },
] as const;

export default function DesignSystemPage() {
  const [active, setActive] = useState<string>(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-12% 0px -65% 0px', threshold: 0 },
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-night-900">
      <StarField fixed seed="celestial-design" density={0.6} glints={5} />
      <a
        href="#design-content"
        className="visually-hidden focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-night-900 focus:p-3"
      >
        Đến nội dung bộ thiết kế
      </a>
      <header className="relative z-10 border-b border-line/60">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <Link to="/" aria-label="JobQuest, về trang chủ">
            <Logo />
          </Link>
          <span className="hidden text-xs tracking-widest text-ink-faint sm:inline">
            EXPLORER · UI FOUNDATION
          </span>
          <Link
            to="/galaxy"
            className={buttonClasses({ variant: 'ghost', size: 'sm' })}
          >
            Vào ứng dụng <ArrowUpRight size={15} aria-hidden />
          </Link>
        </div>
      </header>

      <DesignHero />

      <div className="sticky top-0 z-30 border-y border-line bg-night-900/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <label htmlFor="design-section" className="visually-hidden">
          Đến phần trong bộ thiết kế
        </label>
        <Select
          id="design-section"
          value={active}
          onChange={(event) => jump(event.target.value)}
        >
          {sections.map((section, index) => (
            <option key={section.id} value={section.id}>
              {String(index + 1).padStart(2, '0')} · {section.title}
            </option>
          ))}
        </Select>
      </div>

      <div className="relative mx-auto grid max-w-[1440px] items-start gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12 lg:py-16">
        <aside className="sticky top-6 hidden max-h-[calc(100dvh-3rem)] overflow-y-auto lg:block">
          <p className="mb-5 text-[10px] font-semibold tracking-[0.2em] text-ink-faint">
            BẢN ĐỒ THIẾT KẾ
          </p>
          <nav aria-label="Các phần design system" className="space-y-1">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={active === section.id ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  jump(section.id);
                }}
                className={cn(
                  'flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-[13px] transition-colors focus-visible:shadow-focus',
                  active === section.id
                    ? 'border-gold-400 bg-night-800/70 text-gold-100'
                    : 'border-transparent text-ink-faint hover:bg-night-800/40 hover:text-ink',
                )}
              >
                <span className="font-mono text-[10px] opacity-50">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.title}
              </a>
            ))}
          </nav>
          <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
            Mẫu có thể tương tác.
            <br />
            Dữ liệu chỉ để minh hoạ.
          </p>
        </aside>

        <main id="design-content" className="min-w-0 space-y-16 sm:space-y-20">
          <ShowcaseSection index={0}>
            <Principles />
          </ShowcaseSection>
          <ShowcaseSection index={1}>
            <ColorExamples />
          </ShowcaseSection>
          <ShowcaseSection index={2}>
            <TypographyExamples />
          </ShowcaseSection>
          <ShowcaseSection index={3}>
            <ShapeExamples />
          </ShowcaseSection>
          <ShowcaseSection index={4}>
            <ButtonExamples />
          </ShowcaseSection>
          <ShowcaseSection index={5}>
            <FormExamples />
          </ShowcaseSection>
          <ShowcaseSection index={6}>
            <LabelExamples />
          </ShowcaseSection>
          <ShowcaseSection index={7}>
            <ProgressExamples />
          </ShowcaseSection>
          <ShowcaseSection index={8}>
            <NavigationExamples />
          </ShowcaseSection>
          <ShowcaseSection index={9}>
            <OverlayExamples />
          </ShowcaseSection>
          <ShowcaseSection index={10}>
            <FeedbackExamples />
          </ShowcaseSection>
          <ShowcaseSection index={11}>
            <ChartExamples />
          </ShowcaseSection>
          <ShowcaseSection index={12}>
            <ArtGallery />
          </ShowcaseSection>
          <ShowcaseSection index={13}>
            <MotifExamples />
          </ShowcaseSection>
          <ShowcaseSection index={14}>
            <MotionExamples />
          </ShowcaseSection>
          <ShowcaseSection index={15}>
            <CompositionExamples />
          </ShowcaseSection>
        </main>
      </div>
      <footer className="relative mt-8 border-t border-line px-4 py-12 text-center">
        <StarDivider className="mx-auto mb-8 max-w-xs" />
        <Logo size="sm" />
        <p className="mt-3 text-xs text-ink-faint">
          Một ngân hà để thử. Một hành trình do bạn chọn.
        </p>
        <a
          href="#top"
          className="mt-5 inline-block text-xs underline underline-offset-4"
        >
          Về đầu trang
        </a>
      </footer>
    </div>
  );
}

function DesignHero() {
  return (
    <section
      id="top"
      className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-12 sm:px-8 sm:py-20 lg:py-24"
    >
      <Nebula className="-right-20 top-0 h-96 w-96" color="#254a7a" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="max-w-3xl">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            <Sparkle size={12} /> JobQuest · Bộ thiết kế giao diện
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-6xl lg:text-7xl">
            <span className="text-gilded">Celestial Night</span>
            <span className="mt-3 block text-2xl leading-snug text-ink sm:text-4xl">
              · Design system JobQuest
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Một bầu trời yên, những dấu chân rõ. Giao diện giúp bạn thử làm một
            nghề trước khi chọn nghề.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#nguyen-tac" className={buttonClasses({ size: 'lg' })}>
              Khám phá bộ thiết kế <ArrowDown size={16} aria-hidden />
            </a>
            <span className="text-xs text-ink-faint">
              16 phần · tương tác trực tiếp
            </span>
          </div>
        </div>
        <div
          className="relative mx-auto hidden aspect-square w-full max-w-80 items-center justify-center sm:flex"
          aria-hidden
        >
          <div className="absolute inset-2 rotate-[-25deg] rounded-full border border-line-gold/50" />
          <div className="absolute inset-10 rounded-full border border-line" />
          <div className="absolute inset-16 rounded-full bg-night-800/50 shadow-glow-cool" />
          <ZodiacConstellation sign="nhan_ma" size={200} className="relative" />
          <Moon size={44} className="absolute right-3 top-4" />
          <span className="absolute -bottom-2 right-12">
            <PlayerEmblem seed="celestial-night" size={66} />
          </span>
          <Sparkle
            size={16}
            className="absolute bottom-9 left-5 text-gold-300"
          />
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const section = sections[index];
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-24 lg:scroll-mt-8"
    >
      <header className="mb-6 border-t border-line pt-6 sm:mb-8">
        <p className="mb-3 font-mono text-xs tracking-[0.18em] text-ink-faint">
          {String(index + 1).padStart(2, '0')} / CELESTIAL NIGHT
        </p>
        <h2
          id={`${section.id}-title`}
          className="font-display text-3xl sm:text-4xl"
        >
          {section.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          {section.note}
        </p>
      </header>
      <Panel as="div" padding="lg" className="min-w-0">
        {children}
      </Panel>
    </section>
  );
}

function Principles() {
  const principles = [
    {
      icon: MousePointer2,
      title: 'Một việc tiếp theo',
      text: 'Mỗi màn có một hành động chính. Vàng chỉ nhấn hành động đó và tiến độ của người chơi.',
    },
    {
      icon: Compass,
      title: 'Màu là một địa chỉ',
      text: 'Sáu vùng nghề có sáu màu cố định ở bản đồ, biểu đồ và chú giải. Luôn kèm tên vùng.',
    },
    {
      icon: Moon,
      title: 'Một bầu trời đêm',
      text: 'Chỉ giao diện tối. Navy làm nền, ngà cho chữ và kính nhẹ cho từng lớp thông tin.',
    },
    {
      icon: Eye,
      title: 'Đọc được ở 360 px',
      text: 'Lề 16 px, thẻ xếp một cột, câu ngắn. Playfair Display và Montserrat có đủ dấu tiếng Việt.',
    },
    {
      icon: Sparkles,
      title: 'Chuyển động có chừng mực',
      text: 'Chậm ở nền, nhanh ở phản hồi. Tuỳ chọn giảm chuyển động của thiết bị luôn được tôn trọng.',
    },
    {
      icon: ShieldCheck,
      title: 'Quyền chọn ở người chơi',
      text: 'Nói điều người chơi đã làm, có cả mặt khó của nghề. Hồ sơ riêng tư và đánh giá AI luôn có nhãn.',
    },
  ];
  return (
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {principles.map(({ icon: Icon, title, text }) => (
        <article key={title} className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-night-950/50 text-info">
            <Icon size={18} aria-hidden />
          </span>
          <div>
            <h3 className="font-sans text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {text}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function MotifExamples() {
  return (
    <div className="space-y-8">
      <div className="relative isolate overflow-hidden rounded-xl border border-line bg-night-950 p-6 sm:p-10">
        <StarField
          seed="motif-sample"
          density={1.4}
          glints={8}
          className="absolute inset-0"
        />
        <Nebula color="#b9a1f2" className="right-0 top-0 h-56 w-56" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-faint">
              StarField + Nebula
            </p>
            <h3 className="mt-3 text-2xl">Một khoảng trời để bắt đầu</h3>
          </div>
          <Moon size={56} />
        </div>
        <div className="relative mt-8 flex items-center gap-5 text-gold-300">
          <Sparkle size={12} />
          <Sparkle size={24} />
          <Sparkle size={36} />
          <span className="text-xs text-ink-muted">
            Sparkle · 12 / 24 / 36 px
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['night', 'dawn'] as const).map((tone) => (
          <figure
            key={tone}
            className="overflow-hidden rounded-xl border border-line bg-night-900"
          >
            <figcaption className="p-4 text-xs text-ink-faint">
              Mountains · {tone === 'night' ? 'Đêm' : 'Bình minh'}
            </figcaption>
            <Mountains tone={tone} />
          </figure>
        ))}
      </div>
      <StarDivider />
      <div className="flex flex-wrap items-center gap-8">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Logo key={size} size={size} />
        ))}
      </div>
      <div className="overflow-x-auto">
        <Logo size="lg" tagline />
      </div>
      <p className="text-xs text-ink-faint">
        Cinzel dành riêng cho wordmark Latin; slogan thương hiệu giữ nguyên
        tiếng Anh.
      </p>
    </div>
  );
}
