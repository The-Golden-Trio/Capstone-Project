import { Fragment, useRef, useState, type CSSProperties } from 'react';
import { cx } from '../lib/cx';
import {
  CATALOG_FILTERS,
  CATALOG_TILES,
  CLASSROOM_PHOTO,
  CONTRAST_CARDS,
  CONTRAST_PUNCH,
  COSMIC_CHIPS,
  COSMIC_PHOTO,
  FEATURES,
  LOOP_DECO_STARS,
  LOOP_PATH_D,
  LOOP_PATH_EXTENDED_D,
  LOOP_WAYPOINTS,
  PREVIEW_PANELS,
  type CatalogFilter,
} from './content';
import {
  CompassIcon,
  FuelIcon,
  PlanetIcon,
  RocketIcon,
  StarsIcon,
} from './icons';
import { useInViewOnce } from './useLandingEffects';

const delay = (ms: number): CSSProperties => ({ transitionDelay: `${ms}ms` });

/* ===== THE ARGUMENT: WHY A QUIZ ISN'T ENOUGH ===== */
export function ContrastSection() {
  return (
    <section aria-label="Why a quiz isn't enough" className="jq-contrast-section" id="why">
      <div className="jq-contrast-inner">
        <p className="jq-section-kicker">The problem with picking blind</p>
        <h2 className="jq-section-heading">A quiz can't tell you if you'd thrive.</h2>
        <p className="jq-contrast-lede">
          You're asked to commit years to a career while knowing almost nothing
          about the actual day-to-day work. The usual tools ask what you{' '}
          <em>think</em> you'd like — never whether you'd hold up once you're
          actually there, at 2 a.m., with the thing on fire.
        </p>
        <div className="jq-contrast-grid">
          {CONTRAST_CARDS.map((card, index) => (
            <article
              key={card.tag}
              className={cx('jq-contrast-card jq-rise', card.isNew && 'jq-contrast-card-new')}
              style={index ? delay(120) : undefined}
            >
              <img
                alt={card.alt}
                className="jq-contrast-photo"
                decoding="async"
                loading="lazy"
                src={card.photo}
              />
              <span className="jq-contrast-tag">{card.tag}</span>
              <h3 className="jq-contrast-title">{card.title}</h3>
              <ul className="jq-contrast-list">
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        {/* từng chữ nổi lên lần lượt — useRiseReveal gắn `revealed` */}
        <p className="jq-contrast-punch">
          {CONTRAST_PUNCH.split(' ').map((word, index) => (
            <Fragment key={index}>
              {index > 0 && ' '}
              <span className="jq-rise-word" style={delay(index * 45)}>
                {word}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ===== JOB GALAXY / CATALOG ===== */
const CATALOG_HEADING = 'Planets waiting to be explored';

export function CatalogSection() {
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Bản gốc bắt đầu khi đỉnh tiêu đề chạm mốc 82% chiều cao màn hình.
  const headingShown = useInViewOnce(headingRef, {
    threshold: 0,
    rootMargin: '0px 0px -18% 0px',
  });

  return (
    <section aria-label="The job galaxy" className="jq-catalog-section" id="catalog">
      <div className="jq-catalog-header">
        <p className="jq-section-kicker">The job galaxy</p>
        <h2 className="jq-section-heading" ref={headingRef} aria-label={CATALOG_HEADING}>
          {CATALOG_HEADING.split(' ').map((word, index) => (
            <Fragment key={index}>
              {index > 0 && ' '}
              <span
                aria-hidden="true"
                className={cx('jq-word-reveal', headingShown && 'revealed')}
                style={delay(index * 80)}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h2>
        <div aria-label="Filter planets by field" className="jq-filter-pills" role="group">
          {CATALOG_FILTERS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              className={cx('jq-filter-pill', filter === pill.value && 'active')}
              aria-pressed={filter === pill.value}
              onClick={() => setFilter(pill.value)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
      <div className="jq-catalog-grid">
        {CATALOG_TILES.map((tile) => (
          <article
            key={tile.title}
            aria-label={`${tile.title}, ${tile.genre}`}
            className="jq-book-tile"
            style={filter !== 'all' && filter !== tile.field ? { display: 'none' } : undefined}
          >
            <img
              alt={tile.alt}
              className="jq-book-tile-img"
              decoding="async"
              loading="lazy"
              src={tile.photo}
            />
            <div className="jq-book-tile-content">
              <span className="jq-book-genre">{tile.genre}</span>
              <h3 className="jq-book-title">{tile.title}</h3>
              <div className="jq-book-meta">
                <span>5 honest readings</span>
                <span>{tile.landed} have landed here</span>
              </div>
              <p className="jq-book-desc">{tile.desc}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="jq-catalog-footer">
        Every planet shows honest readings from explorers who’ve been there — so
        you know the weather before you land.
      </p>
    </section>
  );
}

/* ===== PINNED THREE-PANEL PREVIEW ===== */
export function PreviewSection() {
  return (
    <div aria-label="JobQuest story previews" className="jq-preview-outer" id="previewOuter">
      <div className="jq-preview-section-heading">
        <p className="jq-section-kicker">A glimpse into the galaxy</p>
      </div>
      <div className="jq-preview-sticky">
        {/* translateX do useScrollScenes điều khiển theo vị trí cuộn */}
        <div className="jq-preview-strip" id="jqPreviewStrip">
          {PREVIEW_PANELS.map((panel) => (
            <section key={panel.source} aria-label={panel.label} className="jq-preview-panel">
              <div className="jq-preview-quote-block">
                <span aria-hidden="true" className="jq-preview-quote-mark">
                  “
                </span>
                <blockquote className="jq-preview-quote">{panel.quote}</blockquote>
                <p className="jq-preview-support">{panel.support}</p>
                <cite className="jq-preview-source">{panel.source}</cite>
              </div>
              <div className="jq-preview-image-wrap">
                <img alt={panel.alt} decoding="async" loading="lazy" src={panel.photo} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== THE CORE LOOP ===== */
const LOOP_STEPS = [
  {
    icon: <CompassIcon />,
    title: 'Chart your course',
    body: (
      <>
        A friendly chat with your co-pilot reads what you're into and what
        you're good at, then reveals planets worth exploring — including ones
        you'd never have found on your own.
      </>
    ),
  },
  {
    icon: <PlanetIcon />,
    title: 'Land on a planet',
    body: (
      <>
        Pick a job and drop into a story-driven mission: do the actual tasks the
        role involves, make the calls, live a day inside the work.
      </>
    ),
  },
  {
    icon: <FuelIcon />,
    title: 'Earn your fuel',
    body: (
      <>
        Every mission pays out in skills — <em>soft and hard</em>. Skills are
        the fuel your rocket burns, so the work you do is what carries you
        onward.
      </>
    ),
  },
  {
    icon: <StarsIcon />,
    title: 'Travel the galaxy',
    body: (
      <>
        Spend that fuel to reach connected jobs, unlock new roles, and watch
        your own route across the map take shape.
      </>
    ),
  },
];

export function LoopSection() {
  return (
    <section aria-label="How JobQuest works" className="jq-loop-section" id="loop">
      <div className="jq-loop-inner">
        <p className="jq-section-kicker">Fly. Try. Fuel up. Go further.</p>
        <h2 className="jq-section-heading">How the journey works</h2>
        <p className="jq-loop-lede">
          Four steps, then the loop repeats — as far out as you want to travel.
          Skills are the fuel, and the galaxy is wide.
        </p>
        <div aria-hidden="true" className="jq-loop-path-wrap">
          <svg className="jq-loop-path-svg" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path className="jq-loop-path-track" d={LOOP_PATH_D} />
            <g>
              <g className="jq-loop-deco-planet-group" transform="translate(260 12)">
                <ellipse className="jq-loop-deco-planet" cx="0" cy="0" rx="17" ry="4.4" transform="rotate(-16)" />
                <circle className="jq-loop-deco-planet-body" cx="0" cy="0" r="7.5" />
              </g>
              <g className="jq-loop-deco-planet-group" transform="translate(960 88)">
                <ellipse className="jq-loop-deco-planet" cx="0" cy="0" rx="13.5" ry="3.5" transform="rotate(12)" />
                <circle className="jq-loop-deco-planet-body" cx="0" cy="0" r="6" />
              </g>
              {LOOP_DECO_STARS.map((star) => (
                <circle
                  key={star.cx}
                  className="jq-loop-deco-star"
                  cx={star.cx}
                  cy={star.cy}
                  r={star.r}
                  style={
                    { '--jq-star-dur': star.dur, '--jq-star-delay': star.delay } as CSSProperties
                  }
                />
              ))}
            </g>
            {/* nét vàng tự vẽ dần — strokeDashoffset do useScrollScenes điều khiển */}
            <path className="jq-loop-path" d={LOOP_PATH_D} id="jqLoopPath" />
            {/* đường vô hình mà tên lửa bay theo, dài hơn để bay ra khỏi bước cuối */}
            <path d={LOOP_PATH_EXTENDED_D} fill="none" id="jqLoopPathExtended" stroke="none" />
            {LOOP_WAYPOINTS.map((point) => (
              <g key={point.x} className="jq-loop-waypoint" transform={`translate(${point.x} ${point.y})`}>
                <ellipse
                  className="jq-loop-waypoint-ring"
                  cx="0"
                  cy="0"
                  rx="11"
                  ry="2.8"
                  transform={`rotate(${point.tilt})`}
                />
                <circle className="jq-loop-waypoint-body" cx="0" cy="0" r="6" />
              </g>
            ))}
          </svg>
          <div className="jq-loop-rocket" id="jqLoopRocket">
            <RocketIcon />
          </div>
        </div>
        <ol className="jq-loop-grid">
          {LOOP_STEPS.map((step, index) => (
            <li key={step.title} className="jq-loop-step jq-rise" style={delay(index * 100)}>
              <span aria-hidden="true" className="jq-loop-icon">
                {step.icon}
              </span>
              <span className="jq-loop-num">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="jq-loop-title">{step.title}</h3>
              <p className="jq-loop-body">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="jq-loop-foot jq-rise" style={delay(380)}>
          Careers aren't a list — they're a galaxy, and the planets are
          connected by shared skills, adjacent roles, and the paths real people
          take between them.
        </p>
      </div>
    </section>
  );
}

/* ===== SCHOOLS / CLASSROOM SPLIT ===== */
export function ClassroomSection() {
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const shown = useInViewOnce(photoWrapRef, { threshold: 0.2 });
  const line = cx('jq-classroom-text-line', shown && 'revealed');

  return (
    <section aria-label="For schools and career centers" className="jq-classroom-section" id="classroom">
      <div className="jq-classroom-photo-wrap" ref={photoWrapRef}>
        <img
          alt="Students learning together in a classroom, Pavel Danilyuk on Pexels"
          className={cx('jq-classroom-photo', shown && 'revealed')}
          decoding="async"
          loading="lazy"
          src={CLASSROOM_PHOTO}
        />
      </div>
      <div className="jq-classroom-text-side">
        <p className={cx('jq-classroom-kicker', line)} style={delay(0)}>
          For schools &amp; career centers
        </p>
        <h2 className={cx('jq-classroom-heading', line)} style={delay(80)}>
          Bring the galaxy to your students.
        </h2>
        <p className={cx('jq-classroom-body', line)} style={delay(160)}>
          Career centers and schools can give students a low-stakes way to try
          real roles before they commit — exploration they’ll actually enjoy,
          with a private logbook of what they’ve learned about themselves.
        </p>
        <div className={cx('jq-classroom-stats', line)} style={delay(240)}>
          <div>
            <span className="jq-classroom-stat-num">10 MIN</span>
            <span className="jq-classroom-stat-label">to try a role</span>
          </div>
          <div>
            <span className="jq-classroom-stat-num">0</span>
            <span className="jq-classroom-stat-label">quizzes required</span>
          </div>
        </div>
        <div className={cx('jq-classroom-ctas', line)} style={delay(320)}>
          <a className="jq-btn-dark" href="#footer">
            Talk to us
          </a>
          <a className="jq-btn-outline-dark" href="#loop">
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

/* ===== FEATURES TIMELINE ===== */
export function FeaturesSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wound = useInViewOnce(headingRef, { threshold: 0.5 });

  return (
    <div aria-label="JobQuest features" className="jq-events-outer" id="features">
      <div className="jq-events-sticky">
        <div className="jq-events-heading-wrap">
          <p className="jq-section-kicker">Everything you need to explore.</p>
          <h2 className={cx('jq-events-heading jq-letter-windup', wound && 'wound')} ref={headingRef}>
            Features
          </h2>
          <p className="jq-star-chart-note">
            Your star chart is a compass, not the destination.
          </p>
        </div>
        <div className="jq-events-timeline">
          <div aria-hidden="true" className="jq-timeline-axis" />
          {/* scaleY và `revealed` của các thẻ do useScrollScenes điều khiển */}
          <div aria-hidden="true" className="jq-timeline-line" id="jqTimelineLine" />
          <div className="jq-events-list">
            {FEATURES.map((feature, index) => {
              // thẻ chẵn nằm trái trục, thẻ lẻ nằm phải
              const left = index % 2 === 0;
              const card = (
                <div
                  className={cx('jq-event-card', left ? 'jq-event-card-left' : 'jq-event-card-right')}
                  data-feature-index={index}
                >
                  <div className={cx('jq-event-date', feature.tone && `date-${feature.tone}`)}>
                    {feature.kicker}
                  </div>
                  <div className="jq-event-name">{feature.name}</div>
                  <p className="jq-event-author">{feature.body}</p>
                </div>
              );
              return (
                <div className="jq-event-row" key={feature.name}>
                  <div>{left && card}</div>
                  <div>
                    <div
                      aria-hidden="true"
                      className={cx('jq-event-dot', feature.tone && `dot-${feature.tone}`)}
                    />
                  </div>
                  <div>{!left && card}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== COSMIC EVENTS / LIFE IS MORE THAN WORK ===== */
const COMETS = ['a', 'b', 'c', 'd', 'e', 'f'];

export function CosmicSection() {
  return (
    <section aria-label="Cosmic events" className="jq-cosmic-section" id="cosmic">
      <img
        alt="The Milky Way band over a starry night sky"
        className="jq-cosmic-photo"
        decoding="async"
        loading="lazy"
        src={COSMIC_PHOTO}
      />
      <div aria-hidden="true" className="jq-cosmic-vignette" />
      {COMETS.map((id) => (
        <div key={id} aria-hidden="true" className={`jq-comet jq-comet-${id}`} />
      ))}
      <div className="jq-cosmic-inner">
        <p className="jq-section-kicker">Cosmic events</p>
        <h2 className="jq-cosmic-heading jq-rise">Life is more than work.</h2>
        <p className="jq-cosmic-body jq-rise" style={delay(80)}>
          Space has weather. Mid-journey, things happen — at work and far
          outside it — and they quietly change which planet actually fits you.
        </p>
        <ul className="jq-cosmic-chips">
          {COSMIC_CHIPS.map((chip, index) => (
            <li key={chip} className="jq-rise" style={delay(120 + index * 60)}>
              {chip}
            </li>
          ))}
        </ul>
        <p className="jq-cosmic-close jq-rise" style={delay(600)}>
          This is the heart of JobQuest. Circumstances shift, the right planet
          shifts with them — which is why no two journeys are alike, and why
          every replay charts a different course.
        </p>
      </div>
    </section>
  );
}
