import { useId, type ReactNode } from 'react';
import {
  ACHIEVEMENT_KINDS,
  MEDAL,
  palette,
  type AchievementKind,
  type MedalLevel,
} from '../tokens';
import { seededRandom } from '../lib/seed';
import { SPARKLE_PATH } from '../motifs/Sparkle';
export interface HexBadgeProps {
  kind: AchievementKind;
  icon?: ReactNode;
  locked?: boolean;
  size?: number;
  label?: string;
}
export function HexBadge({
  kind,
  icon,
  locked,
  size = 80,
  label,
}: HexBadgeProps) {
  const color = locked ? palette.moonlight : ACHIEVEMENT_KINDS[kind].color;
  return (
    <span
      role="img"
      aria-label={
        label ??
        `${ACHIEVEMENT_KINDS[kind].name}${locked ? ' — Chưa mở khoá' : ''}`
      }
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size, color }}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="m50 4 40 23v46L50 96 10 73V27Z"
          fill={palette.deepSpace}
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="m50 11 34 20v38L50 89 16 69V31Z"
          fill={color}
          fillOpacity={locked ? 0 : 0.13}
          stroke={color}
          strokeOpacity=".35"
        />
        {!locked && (
          <path
            d={SPARKLE_PATH}
            transform="translate(45 14) scale(.4)"
            fill={color}
          />
        )}
      </svg>
      <span
        aria-hidden
        className="relative grid place-items-center text-2xl"
        style={{ width: size * 0.4, height: size * 0.4 }}
      >
        {locked
          ? '?'
          : (icon ?? (
              <svg viewBox="0 0 24 24">
                <path d={SPARKLE_PATH} fill="currentColor" />
              </svg>
            ))}
      </span>
    </span>
  );
}
export function Medal({
  level,
  size = 72,
  label,
}: {
  level: MedalLevel;
  size?: number;
  label?: string;
}) {
  const medal = MEDAL[level];
  const id = useId();
  return (
    <svg
      role="img"
      aria-label={label ?? medal.name}
      viewBox="0 0 80 96"
      width={size}
      height={size * 1.2}
    >
      <defs>
        <linearGradient id={`${id}-disc`} x2=".7" y2="1">
          <stop stopColor={palette.ivory} />
          <stop offset=".35" stopColor={medal.color} />
          <stop offset="1" stopColor={medal.deep} />
        </linearGradient>
      </defs>
      <path d="m16 4 24 7L64 4l-4 40-20 14-20-14Z" fill={medal.deep} />
      <path
        d="m24 6 3 32 13 11 13-11 3-32-16 5Z"
        fill={medal.color}
        opacity=".6"
      />
      <path
        d="m22 65-5 29 14-8 11 6 1-26m14-2 7 30-14-8-10 6-3-26"
        fill={medal.deep}
        stroke={medal.color}
        strokeWidth=".7"
      />
      <circle
        cx="40"
        cy="55"
        r="29"
        fill={`url(#${id}-disc)`}
        stroke={medal.color}
      />
      <circle
        cx="40"
        cy="55"
        r="23"
        fill="none"
        stroke={medal.deep}
        strokeWidth=".8"
      />
      <path
        d="M22 43q18-18 36 0"
        stroke={palette.ivory}
        strokeOpacity=".55"
        fill="none"
      />
      {Array.from({ length: level }, (_, i) => (
        <text
          key={i}
          x={40 + (i - (level - 1) / 2) * 14}
          y="61"
          textAnchor="middle"
          fontSize="16"
          fill={medal.deep}
        >
          ★
        </text>
      ))}
    </svg>
  );
}
export function PlayerEmblem({
  seed,
  size = 72,
  label = 'Huy hiệu người chơi',
  shape = 'shield',
}: {
  seed: string;
  size?: number;
  label?: string;
  shape?: 'shield' | 'circle';
}) {
  const id = useId();
  const random = seededRandom(seed);
  const points = Array.from({ length: 5 }, () => [
    27 + random() * 46,
    25 + random() * 43,
  ]);
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2=".7" y2="1">
          <stop stopColor={palette.constellation} />
          <stop offset="1" stopColor={palette.deepSpace} />
        </linearGradient>
      </defs>
      {shape === 'shield' ? (
        <>
          <path
            d="m50 5 37 13v36q-4 28-37 41Q17 82 13 54V18Z"
            fill={`url(#${id}-sky)`}
            stroke={palette.starlight}
          />
          <path
            d="m50 12 30 11v31q-3 22-30 33Q23 76 20 54V23Z"
            fill="none"
            stroke={palette.starlight}
            strokeOpacity=".3"
          />
        </>
      ) : (
        <>
          <circle
            cx="50"
            cy="50"
            r="44"
            fill={`url(#${id}-sky)`}
            stroke={palette.starlight}
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={palette.starlight}
            strokeOpacity=".3"
          />
        </>
      )}
      <polyline
        points={points.map((point) => point.join(',')).join(' ')}
        fill="none"
        stroke={palette.starlight}
        strokeOpacity=".65"
        strokeWidth=".8"
      />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill={palette.softGold} opacity=".08" />
          <path
            d={SPARKLE_PATH}
            transform={`translate(${x - 3} ${y - 3}) scale(.25)`}
            fill={palette.softGold}
          />
        </g>
      ))}
      <path d="M36 77h28" stroke={palette.starlight} strokeOpacity=".5" />
    </svg>
  );
}
