import { useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import {
  HERO_POSTER,
  HERO_STATS,
  HERO_VIDEO,
  SHOWCASE_CAREERS,
  careerIconUrl,
} from './content';
import { prefersReducedMotion } from './useLandingEffects';

const TICK_MS = 1800;
/** Khớp với `transition` 700ms của `.jq-hero-showcase-face` trong CSS. */
const TRANSITION_MS = 700;

type FaceState = 'waiting' | 'active' | 'leaving';

function setFace(face: HTMLElement, state: FaceState) {
  face.style.opacity = state === 'active' ? '1' : '0';
  face.style.transform =
    state === 'waiting'
      ? 'translateY(28px)'
      : state === 'active'
        ? 'translateY(0)'
        : 'translateY(-28px)';
}

function setIcon(icon: HTMLElement, file: string) {
  const url = `url("${careerIconUrl(file)}")`;
  icon.style.webkitMaskImage = url;
  icon.style.maskImage = url;
}

/**
 * Hình nghề đổi liên tục bên phải khối chữ hero, kiểu bảng tin chạy chữ: hai
 * mặt A/B thay phiên, mặt cũ trượt lên biến mất, mặt mới trượt từ dưới lên.
 * Chỉ hiện trên màn rộng hơn 1100px (CSS tự ẩn ở màn nhỏ).
 */
function HeroShowcase({ anchorRef }: { anchorRef: RefObject<HTMLElement | null> }) {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const faceARef = useRef<HTMLDivElement>(null);
  const faceBRef = useRef<HTMLDivElement>(null);
  const iconARef = useRef<HTMLSpanElement>(null);
  const iconBRef = useRef<HTMLSpanElement>(null);

  // Đặt tâm hình vào giữa khoảng trống từ mép phải khối chữ tới mép màn hình.
  useEffect(() => {
    const showcase = showcaseRef.current;
    const anchor = anchorRef.current;
    if (!showcase || !anchor) return;
    const reposition = () => {
      if (window.innerWidth <= 1100) return;
      const right = anchor.getBoundingClientRect().right;
      showcase.style.left = `${(right + window.innerWidth) / 2}px`;
    };
    reposition();
    // Font web tải xong có thể làm khối chữ rộng ra.
    void document.fonts?.ready.then(reposition);
    window.addEventListener('resize', reposition, { passive: true });
    return () => window.removeEventListener('resize', reposition);
  }, [anchorRef]);

  useEffect(() => {
    const faceA = faceARef.current;
    const faceB = faceBRef.current;
    const iconA = iconARef.current;
    const iconB = iconBRef.current;
    if (!faceA || !faceB || !iconA || !iconB) return;

    setIcon(iconA, SHOWCASE_CAREERS[0]);
    if (prefersReducedMotion()) return;

    let index = 1;
    let onA = true;
    const timeouts = new Set<number>();

    const interval = window.setInterval(() => {
      const file = SHOWCASE_CAREERS[index % SHOWCASE_CAREERS.length];
      index += 1;
      const leaving = onA ? faceA : faceB;
      const entering = onA ? faceB : faceA;
      setIcon(onA ? iconB : iconA, file);
      onA = !onA;

      setFace(leaving, 'leaving');
      setFace(entering, 'active');

      // Mặt vừa rời đi được đưa về dưới đáy mà không chạy transition, sẵn
      // sàng cho lượt trượt lên kế tiếp.
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        leaving.style.transition = 'none';
        setFace(leaving, 'waiting');
        void leaving.offsetWidth;
        leaving.style.transition = '';
      }, TRANSITION_MS + 40);
      timeouts.add(id);
    }, TICK_MS);

    return () => {
      window.clearInterval(interval);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div aria-hidden="true" className="jq-hero-showcase" ref={showcaseRef}>
      <div className="jq-hero-showcase-inner">
        <div className="jq-hero-showcase-face jq-hero-showcase-face-a" ref={faceARef}>
          <span className="jq-hero-showcase-icon" ref={iconARef} />
        </div>
        <div className="jq-hero-showcase-face jq-hero-showcase-face-b" ref={faceBRef}>
          <span className="jq-hero-showcase-icon" ref={iconBRef} />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const overlayInnerRef = useRef<HTMLDivElement>(null);

  return (
    <section aria-label="JobQuest introduction" className="jq-hero" id="hero">
      {/* transform (parallax) do useScrollScenes điều khiển */}
      <video
        aria-hidden="true"
        autoPlay
        className="jq-hero-video"
        loop
        muted
        playsInline
        poster={HERO_POSTER}
        preload="metadata"
        src={HERO_VIDEO}
      />
      <p className="jq-sr-only">
        Hero video by Kindel Media on Pexels. Static fallback image by Aron
        Visuals on Unsplash.
      </p>
      <div aria-hidden="true" className="jq-hero-vignette" />
      <HeroShowcase anchorRef={overlayInnerRef} />
      <div className="jq-hero-overlay">
        <div className="jq-hero-overlay-inner" ref={overlayInnerRef}>
          <p className="jq-hero-kicker">A low-stakes flight through real work</p>
          <h1 className="jq-hero-title">Try the job before you pick the career.</h1>
          <p className="jq-hero-tagline">
            Strap in, dreamer. Every planet out there is a real job — and
            JobQuest lets you fly out and do the work before you decide where to
            land.
          </p>
          <div className="jq-hero-ctas">
            <Link className="jq-btn-primary" to="/jobs">
              Launch your journey
            </Link>
            <a className="jq-btn-outline" href="#previewOuter">
              Explore the galaxy
            </a>
          </div>
          <p className="jq-hero-trust">
            No quiz. No sign-up to start. Just the work itself.
          </p>
        </div>
      </div>
      <div aria-label="JobQuest facts" className="jq-hero-stats">
        {HERO_STATS.map((stat) => (
          <div className="jq-hero-stat" key={stat.label}>
            <span className="jq-hero-stat-num">{stat.num}</span>
            <span className="jq-hero-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
