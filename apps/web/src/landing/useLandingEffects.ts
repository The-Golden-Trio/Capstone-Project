import { useEffect, useState, type RefObject } from 'react';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Toạ độ đầu trang của một phần tử, tính theo tài liệu chứ không theo khung nhìn. */
const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

/**
 * Bật cờ đúng một lần khi phần tử lọt vào khung nhìn rồi thôi theo dõi — mọi
 * hiệu ứng "hiện dần" trên trang đều chỉ chạy một chiều.
 */
export function useInViewOnce<T extends Element>(
  ref: RefObject<T | null>,
  options: IntersectionObserverInit,
) {
  const [inView, setInView] = useState(false);
  const { threshold, rootMargin } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, inView, threshold, rootMargin]);

  return inView;
}

/**
 * Gắn `revealed` cho mọi `.jq-rise` / `.jq-rise-word` trong trang khi chúng
 * cuộn tới. Các phần tử này tĩnh và rải khắp các section, nên một observer
 * chung rẻ hơn mỗi phần tử một state.
 */
export function useRiseReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );
    root
      .querySelectorAll('.jq-rise, .jq-rise-word')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}

/**
 * Các cảnh chạy theo vị trí cuộn, gom vào một vòng requestAnimationFrame:
 *
 * - video hero trôi chậm hơn trang (parallax);
 * - dải ba panel "A glimpse into the galaxy" trượt ngang trong lúc bị ghim;
 * - trục thời gian Features dài dần và lật từng thẻ;
 * - đường cong "How the journey works" tự vẽ, tên lửa bay dọc theo nó và
 *   các bước sáng lên lần lượt.
 *
 * Đổi thẳng `style`/`classList` trên DOM chứ không qua state: chạy mỗi khung
 * hình, render lại cả trang cho từng pixel cuộn là không đáng. Các phần tử
 * được tìm theo id/class bên trong trang, giống bản HTML gốc.
 */
export function useScrollScenes(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = prefersReducedMotion();

    const $ = <T extends Element>(selector: string) =>
      root.querySelector<T>(selector);
    const hero = $<HTMLElement>('#hero');
    const heroVideo = $<HTMLVideoElement>('.jq-hero-video');
    const previewOuter = $<HTMLElement>('#previewOuter');
    const previewHeading = $<HTMLElement>('.jq-preview-section-heading');
    const previewStrip = $<HTMLElement>('#jqPreviewStrip');
    const eventsOuter = $<HTMLElement>('#features');
    const timelineLine = $<HTMLElement>('#jqTimelineLine');
    const eventCards = root.querySelectorAll<HTMLElement>('.jq-event-card');
    const loopSection = $<HTMLElement>('#loop');
    const loopPath = $<SVGPathElement>('#jqLoopPath');
    const loopPathExtended = $<SVGPathElement>('#jqLoopPathExtended');
    const loopRocket = $<HTMLElement>('#jqLoopRocket');
    const loopWrap = $<HTMLElement>('.jq-loop-path-wrap');
    const loopSteps = root.querySelectorAll<HTMLElement>('.jq-loop-step');

    // Đường cong ẩn sau dash dài bằng chính nó, rồi "vẽ" ra bằng cách giảm offset.
    let pathLength = 0;
    let extendedLength = 0;
    if (loopPath && !reduceMotion) {
      pathLength = loopPath.getTotalLength();
      loopPath.style.strokeDasharray = String(pathLength);
      loopPath.style.strokeDashoffset = String(pathLength);
      extendedLength = loopPathExtended
        ? loopPathExtended.getTotalLength()
        : pathLength;
    }

    const measure = () => ({
      heroHeight: hero?.offsetHeight ?? 0,
      previewTop: previewOuter ? docTop(previewOuter) : 0,
      previewHeight: previewOuter?.offsetHeight ?? 0,
      // Vị trí tự nhiên của khối bị ghim = ngay dưới tiêu đề của nó. Không đọc
      // từ chính khối sticky được vì lúc đang ghim nó báo vị trí đã dính.
      previewStickyTop: previewHeading
        ? previewHeading.getBoundingClientRect().bottom + window.scrollY
        : 0,
      eventsTop: eventsOuter ? docTop(eventsOuter) : 0,
      eventsHeight: eventsOuter?.offsetHeight ?? 0,
      loopTop: loopSection ? docTop(loopSection) : 0,
      loopHeight: loopSection?.offsetHeight ?? 0,
    });
    let o = measure();
    let frame = 0;

    const update = () => {
      frame = 0;
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const wide = window.innerWidth > 768;

      if (heroVideo && sy < o.heroHeight + vh) {
        const progress = clamp01(sy / Math.max(1, o.heroHeight));
        heroVideo.style.transform = `translate3d(0,${progress * 38}px,0) scale(1.04)`;
      }

      if (
        previewStrip &&
        wide &&
        sy > o.previewTop - vh &&
        sy < o.previewTop + o.previewHeight
      ) {
        const pinStart = o.previewStickyTop;
        const pinEnd = o.previewTop + o.previewHeight - vh;
        const progress = clamp01((sy - pinStart) / Math.max(1, pinEnd - pinStart));
        previewStrip.style.transform = `translateX(-${progress * 200}vw)`;
      }

      if (
        timelineLine &&
        wide &&
        sy > o.eventsTop - vh &&
        sy < o.eventsTop + o.eventsHeight
      ) {
        const scrollInto = sy - o.eventsTop + vh * 0.5;
        const progress = clamp01(scrollInto / Math.max(1, o.eventsHeight * 0.8));
        timelineLine.style.transform = `translateX(-50%) scaleY(${progress})`;
        eventCards.forEach((card, index) => {
          if (progress > index / (eventCards.length + 1)) {
            card.classList.add('revealed');
          }
        });
      }

      if (
        loopPath &&
        pathLength &&
        wide &&
        !reduceMotion &&
        sy > o.loopTop - vh &&
        sy < o.loopTop + o.loopHeight + vh
      ) {
        // Chạy hết đường trong đúng một chiều cao màn hình kể từ lúc section ló vào.
        const progress = clamp01((vh - (o.loopTop - sy)) / Math.max(1, vh));
        const lineProgress = Math.min(1, progress * (extendedLength / pathLength));
        loopPath.style.strokeDashoffset = String(pathLength * (1 - lineProgress));

        const rocketPath = loopPathExtended ?? loopPath;
        if (loopRocket && loopWrap) {
          const pt = rocketPath.getPointAtLength(progress * extendedLength);
          // viewBox 1200×100 bị kéo giãn theo khung (preserveAspectRatio="none")
          const px = (pt.x / 1200) * loopWrap.offsetWidth - 13;
          const py = (pt.y / 100) * loopWrap.offsetHeight - 13;
          loopRocket.style.transform = `translate(${px}px,${py}px)`;
        }

        loopSteps.forEach((step, index) => {
          step.classList.toggle('jq-loop-active', progress > index / loopSteps.length);
        });
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    // Ảnh tải lười làm cao trang đổi dần, nên đo lại mỗi khi trang đổi kích thước.
    const remeasure = () => {
      o = measure();
      schedule();
    };

    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(root);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure, { passive: true });
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
    };
  }, [rootRef]);
}
