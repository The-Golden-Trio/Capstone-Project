import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@datn/ui';

export interface Chapter {
  id: string;
  label: string;
  icon: ReactNode;
}

/**
 * Mục lục chương của hồ sơ nghề. Trên màn rộng là cột dọc bám theo khi cuộn
 * (một đường nối các chương, chương đang đọc sáng lên); trên điện thoại là
 * một hàng ký hiệu cuộn ngang dính dưới thanh điều hướng.
 */
export function ChapterIndex({ chapters }: { chapters: Chapter[] }) {
  const active = useActiveChapter(chapters.map((c) => c.id));
  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === active),
  );
  return (
    <nav
      aria-label="Các phần của hồ sơ nghề"
      className="sticky top-[4.5rem] z-10 -mx-5 min-w-0 bg-toon-night/85 px-5 py-2 backdrop-blur-md sm:-mx-8 sm:px-8 lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
    >
      <ol className="flex gap-1 overflow-x-auto scroll-x-clean lg:relative lg:flex-col lg:gap-0 lg:overflow-visible">
        {/* Đường nối các chương (chỉ trên màn rộng). */}
        <span
          aria-hidden
          className="absolute bottom-5 left-[19px] top-5 hidden w-0 border-l-2 border-dashed border-toon-night-line lg:block"
        />
        <span
          aria-hidden
          className="absolute left-[18px] top-5 hidden w-[3px] rounded-full bg-toon-star transition-[height] duration-500 lg:block"
          // Mỗi mục cao 42px trên màn rộng (30px nút + 12px đệm).
          style={{ height: `${activeIndex * 42}px` }}
        />
        {chapters.map((c, i) => {
          const on = c.id === active;
          const passed = i < activeIndex;
          return (
            <li key={c.id} className="relative shrink-0">
              <a
                href={`#${c.id}`}
                aria-current={on ? 'location' : undefined}
                title={c.label}
                onClick={(event) => {
                  event.preventDefault();
                  document
                    .getElementById(c.id)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  window.history.replaceState(null, '', `#${c.id}`);
                }}
                className={cn(
                  'group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:shadow-toon-focus lg:py-1.5',
                  on
                    ? 'text-toon-star'
                    : passed
                      ? 'text-toon-paper'
                      : 'text-toon-night-ink hover:text-toon-paper',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'relative grid size-[30px] shrink-0 place-items-center rounded-full border-2 transition-colors',
                    on
                      ? 'border-toon-ink bg-toon-star text-toon-ink'
                      : passed
                        ? 'border-toon-star/70 bg-toon-night-soft text-toon-star-soft'
                        : 'border-toon-night-line bg-toon-night text-toon-night-ink group-hover:border-toon-star-soft',
                  )}
                >
                  {c.icon}
                </span>
                {/* Trên điện thoại chỉ chương đang đọc hiện chữ, còn lại là ký hiệu. */}
                <span className={cn(on ? 'inline' : 'hidden lg:inline')}>
                  {c.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Chương nào đang chiếm phần trên của màn hình. */
function useActiveChapter(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const first = key.split('|').find((id) => seen.get(id));
        if (first) setActive(first);
      },
      { rootMargin: '-20% 0px -55% 0px' },
    );
    for (const id of key.split('|')) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);
  return active;
}

export function QuickFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-full bg-toon-night-soft text-toon-star"
      >
        {icon}
      </span>
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-toon-night-ink">
          {label}
        </dt>
        <dd className="font-toon text-base font-bold leading-tight">{value}</dd>
      </div>
    </div>
  );
}
