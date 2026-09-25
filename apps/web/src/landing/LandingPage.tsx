import { useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_COLUMNS } from './content';
import { Hero } from './Hero';
import {
  CatalogSection,
  ClassroomSection,
  ContrastSection,
  CosmicSection,
  FeaturesSection,
  LoopSection,
  PreviewSection,
} from './sections';
import { useRiseReveal, useScrollScenes } from './useLandingEffects';
import './landing.css';

const STAR_COUNT = 70;

/** Nền sao cố định, mỗi ngôi nhấp nháy theo nhịp riêng. Rải ngẫu nhiên một lần khi vào trang. */
function StarField() {
  const [stars] = useState(() =>
    Array.from({ length: STAR_COUNT }, () => {
      const size = Math.random() * 2.5 + 0.5;
      return {
        width: `${size}px`,
        height: `${size}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        '--jq-star-dur': `${2 + Math.random() * 4}s`,
        '--jq-star-delay': `${-Math.random() * 4}s`,
      } as CSSProperties;
    }),
  );
  return (
    <div aria-hidden="true" className="jq-star-field">
      {stars.map((style, index) => (
        <span key={index} className="jq-star" style={style} />
      ))}
    </div>
  );
}

function Logo() {
  return (
    <a aria-label="JobQuest home" className="jq-logo" href="#hero">
      <span>Job</span>
      <span className="jq-logo-accent">Quest</span>
      <span aria-hidden="true" className="jq-logo-mark">
        <span className="jq-logo-star">✦</span>
      </span>
    </a>
  );
}

function Nav() {
  return (
    <nav aria-label="Main navigation" className="jq-nav">
      <Logo />
      <ul className="jq-nav-links">
        <li>
          <a href="#why">Why JobQuest</a>
        </li>
        <li>
          <a href="#loop">How it works</a>
        </li>
        <li>
          <a href="#catalog">The galaxy</a>
        </li>
        <li>
          <a href="#features">Features</a>
        </li>
      </ul>
      <Link className="jq-nav-cta" to="/jobs">
        Launch your journey
      </Link>
    </nav>
  );
}

function Newsletter() {
  return (
    <section aria-label="Newsletter signup" className="jq-newsletter-section">
      <h2 className="jq-newsletter-heading jq-rise">Never miss a new world.</h2>
      <p className="jq-newsletter-sub jq-rise" style={{ transitionDelay: '100ms' }}>
        New planets, features, and cosmic surprises — delivered to your inbox.
        Be first aboard when we launch.
      </p>
      {/* chưa có backend nhận email — giữ như bản gốc, chỉ chặn submit */}
      <form
        className="jq-newsletter-form jq-rise"
        onSubmit={(event) => event.preventDefault()}
        style={{ transitionDelay: '200ms' }}
      >
        <input
          aria-label="Email address"
          className="jq-newsletter-input"
          placeholder="Email address"
          type="email"
        />
        <button className="jq-newsletter-btn" type="submit">
          Join the waitlist
        </button>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="jq-footer" id="footer">
      <div className="jq-footer-grid">
        <div className="jq-footer-brand jq-rise">
          <div className="jq-footer-logo">
            <Logo />
          </div>
          <p className="jq-footer-tagline">Life is more than work.</p>
          <p className="jq-footer-brandline">
            JobQuest — a low-stakes way to try real careers, one planet at a
            time.
          </p>
          <p className="jq-footer-closing">Put on your pajamas. Pick a planet. Go.</p>
          <p className="jq-footer-closing-sub">
            Stop guessing which career fits from the ground. Fly out and find
            out.
          </p>
          <div className="jq-footer-actions">
            <Link className="jq-btn-primary" to="/jobs">
              Launch your journey
            </Link>
            <a className="jq-btn-outline" href="#catalog">
              Browse the galaxy
            </a>
          </div>
        </div>
        {FOOTER_COLUMNS.map((column, index) => (
          <div
            key={column.title}
            className="jq-footer-col jq-rise"
            style={{ transitionDelay: `${(index + 1) * 80}ms` }}
          >
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="jq-footer-bottom">
        <span className="jq-footer-copy">A Specialized Project (ĐACN) · HCMUT</span>
        <span className="jq-footer-copy">© 2026 JobQuest</span>
      </div>
    </footer>
  );
}

/**
 * Trang giới thiệu JobQuest ở `/`, ngoài cổng đăng nhập.
 *
 * Chuyển từ bản HTML tĩnh `JobQuest/index.html`: cùng CSS (landing.css), cùng
 * hiệu ứng. Hiệu ứng chạy theo cuộn nằm trong `useScrollScenes`, hiện dần khi
 * cuộn tới nằm trong `useRiseReveal` / `useInViewOnce`. Bản gốc có kéo GSAP
 * nhưng chỉ dùng cho ba việc đã làm được bằng CSS + IntersectionObserver, nên
 * ở đây không cần thêm thư viện.
 */
export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  useScrollScenes(pageRef);
  useRiseReveal(pageRef);

  return (
    <div className="jq-page" ref={pageRef}>
      <StarField />
      <Nav />
      <Hero />
      <ContrastSection />
      <CatalogSection />
      <PreviewSection />
      <LoopSection />
      <ClassroomSection />
      <FeaturesSection />
      <CosmicSection />
      <Newsletter />
      <Footer />
    </div>
  );
}
