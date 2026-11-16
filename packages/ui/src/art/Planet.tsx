import { useId } from 'react';
import { LockKeyhole } from 'lucide-react';
import { seededRandom, between } from '../lib/seed';
import { cn } from '../lib/cn';
import { palette } from '../tokens';
import { SPARKLE_PATH } from '../motifs/Sparkle';
export interface PlanetProps {
  seed: string;
  color: string;
  size?: number;
  status?: 'new' | 'playing' | 'completed' | 'locked';
  ring?: boolean;
  selected?: boolean;
  label?: string;
  className?: string;
}
const labels = {
  new: 'Chưa khám phá',
  playing: 'Đang chơi',
  completed: 'Đã hoàn thành',
  locked: 'Chưa mở khoá',
};
export function Planet({
  seed,
  color,
  size = 80,
  status = 'new',
  ring,
  selected,
  label,
  className,
}: PlanetProps) {
  const id = useId();
  const random = seededRandom(seed);
  const seededRing = random() > 0.55;
  const hasRing = ring ?? seededRing;
  const craters = random() > 0.5;
  const details = Array.from({ length: 2 + Math.floor(random() * 3) }, () => ({
    x: between(random, 31, 67),
    y: between(random, 32, 68),
    r: between(random, 4, 12),
  }));
  const locked = status === 'locked';
  const tint = locked ? palette.moonlight : color;
  return (
    <svg
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label ? `${label} — ${labels[status]}` : undefined}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn('shrink-0 overflow-visible', className)}
    >
      <defs>
        <radialGradient id={`${id}-sphere`} cx="28%" cy="25%" r="80%">
          <stop stopColor={palette.ivory} stopOpacity=".8" />
          <stop offset=".28" stopColor={tint} />
          <stop offset=".7" stopColor={tint} />
          <stop offset="1" stopColor={palette.deepSpace} />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="20%" cy="25%" r="82%">
          <stop offset=".4" stopColor={palette.deepSpace} stopOpacity="0" />
          <stop offset=".78" stopColor={palette.deepSpace} stopOpacity=".3" />
          <stop offset="1" stopColor={palette.deepSpace} stopOpacity=".85" />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop
            offset=".55"
            stopColor={selected ? palette.softGold : tint}
            stopOpacity="0"
          />
          <stop
            offset=".7"
            stopColor={selected ? palette.softGold : tint}
            stopOpacity={selected ? '.45' : '.18'}
          />
          <stop offset="1" stopColor={tint} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r="28" />
        </clipPath>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={selected ? 44 : 39}
        fill={`url(#${id}-halo)`}
      />
      {selected && (
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke={palette.softGold}
          strokeWidth=".9"
          strokeDasharray="2 3"
        />
      )}
      {hasRing && (
        <path
          d="M7 50 A43 12 0 0 1 93 50"
          transform="rotate(-25 50 50)"
          fill="none"
          stroke={tint}
          strokeWidth={size < 28 ? 5 : 7}
          strokeOpacity=".45"
        />
      )}
      <circle cx="50" cy="50" r="28" fill={`url(#${id}-sphere)`} />
      {size >= 28 && (
        <g
          clipPath={`url(#${id}-clip)`}
          opacity={locked ? 0.25 : 0.5}
          transform="rotate(-20 50 50)"
        >
          {details.map((detail, i) =>
            craters ? (
              <g key={i}>
                <circle
                  cx={detail.x}
                  cy={detail.y}
                  r={detail.r}
                  fill={palette.deepSpace}
                  opacity=".24"
                />
                <path
                  d={`M${detail.x - detail.r} ${detail.y}a${detail.r} ${detail.r} 0 0 1 ${detail.r * 2} 0`}
                  fill="none"
                  stroke={palette.ivory}
                  strokeOpacity=".3"
                  strokeWidth=".8"
                />
              </g>
            ) : (
              <path
                key={i}
                d={`M10 ${27 + i * 15} Q40 ${14 + i * 15} 90 ${31 + i * 15}`}
                fill="none"
                stroke={i % 2 ? palette.ivory : palette.deepSpace}
                strokeOpacity=".3"
                strokeWidth={detail.r}
              />
            ),
          )}
        </g>
      )}
      <circle cx="50" cy="50" r="28" fill={`url(#${id}-shade)`} />
      <circle
        cx="50"
        cy="50"
        r="28.4"
        fill="none"
        stroke={tint}
        strokeOpacity=".5"
        strokeWidth=".8"
      />
      {hasRing && (
        <path
          d="M7 50 A43 12 0 0 0 93 50"
          transform="rotate(-25 50 50)"
          fill="none"
          stroke={tint}
          strokeWidth={size < 28 ? 5 : 7}
          strokeOpacity=".8"
        />
      )}
      {status === 'playing' && (
        <g className="animate-twinkle" style={{ transformOrigin: '50px 50px' }}>
          <ellipse
            cx="50"
            cy="50"
            rx="39"
            ry="33"
            transform="rotate(-25 50 50)"
            fill="none"
            stroke={palette.starlight}
            strokeWidth="1.3"
          />
          <circle cx="83" cy="28" r="2.6" fill={palette.softGold} />
        </g>
      )}
      {status === 'completed' && (
        <g fill={palette.softGold}>
          <path d={SPARKLE_PATH} transform="translate(44 7) scale(.5)" />
          <path d={SPARKLE_PATH} transform="translate(32 15) scale(.25)" />
          <path d={SPARKLE_PATH} transform="translate(62 14) scale(.25)" />
        </g>
      )}
      {locked && (
        <g>
          <circle
            cx="70"
            cy="72"
            r="10"
            fill={palette.deepSpace}
            stroke={palette.moonlight}
          />
          <LockKeyhole
            x="64"
            y="66"
            width="12"
            height="12"
            stroke={palette.mist}
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
  );
}
