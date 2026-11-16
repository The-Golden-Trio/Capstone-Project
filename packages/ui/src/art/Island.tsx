import { useId } from 'react';
import { LockKeyhole } from 'lucide-react';
import { seededRandom, between } from '../lib/seed';
import { palette } from '../tokens';
import { cn } from '../lib/cn';
export interface IslandProps {
  levelNo: number;
  title?: string;
  state: 'locked' | 'open' | 'current' | 'completed';
  size?: number;
  seed: string;
  color?: string;
  className?: string;
}
const stateLabels = {
  locked: 'Chưa mở khoá',
  open: 'Đã mở',
  current: 'Đang khám phá',
  completed: 'Đã hoàn thành',
};
export function Island({
  levelNo,
  title,
  state,
  size = 200,
  seed,
  color = '#74a99b',
  className,
}: IslandProps) {
  const id = useId();
  const random = seededRandom(seed);
  const peak = between(random, 85, 115);
  const trees = Array.from({ length: 3 }, () => ({
    x: between(random, 48, 145),
    y: between(random, 67, 78),
    h: between(random, 15, 25),
  }));
  const locked = state === 'locked';
  return (
    <svg
      role="img"
      aria-label={`Cấp ${levelNo}${title ? `: ${title}` : ''} — ${stateLabels[state]}`}
      viewBox="0 0 200 180"
      width={size}
      height={size * 0.9}
      className={cn(
        'overflow-visible',
        state === 'current' && 'animate-float',
        className,
      )}
    >
      <defs>
        <linearGradient id={`${id}-rock`} x2=".3" y2="1">
          <stop stopColor="#44576d" />
          <stop offset="1" stopColor={palette.deepSpace} />
        </linearGradient>
        <linearGradient id={`${id}-grass`} x2="0" y2="1">
          <stop stopColor={locked ? palette.moonlight : color} />
          <stop offset="1" stopColor={palette.constellation} />
        </linearGradient>
        <linearGradient id={`${id}-water`} x2="0" y2="1">
          <stop stopColor="#b9e3ed" stopOpacity=".8" />
          <stop offset="1" stopColor="#72c5f2" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-fog`}>
          <stop stopColor={palette.mist} stopOpacity=".35" />
          <stop offset="1" stopColor={palette.mist} stopOpacity="0" />
        </radialGradient>
      </defs>
      {state === 'current' && (
        <ellipse
          cx="100"
          cy="100"
          rx="87"
          ry="43"
          fill="none"
          stroke={palette.starlight}
          strokeOpacity=".5"
          style={{ filter: 'drop-shadow(0 0 10px #d4b06a)' }}
        />
      )}
      <g style={{ filter: locked ? 'saturate(0)' : undefined }}>
        <path
          d={`M22 91 45 127 70 131 ${peak} 162 132 136 157 128 179 91Z`}
          fill={`url(#${id}-rock)`}
          stroke={palette.moonlight}
          strokeOpacity=".35"
        />
        <path
          d={`M47 96 70 131 ${peak} 162 88 110M127 104 132 136 157 128 150 99`}
          fill="none"
          stroke={palette.moonlight}
          strokeOpacity=".28"
        />
        <path
          d="M20 85 42 66 78 61 101 65 129 58 161 71 180 87 162 103 126 108 97 104 64 109 34 100Z"
          fill={`url(#${id}-grass)`}
          stroke={locked ? palette.moonlight : color}
          strokeWidth="1.5"
        />
        <path
          d="m27 84 32-11 35 4 30-8 29 7"
          fill="none"
          stroke={palette.ivory}
          strokeOpacity=".14"
          strokeWidth="2"
        />
        <path
          d="M130 79q-17 9-7 22l5 5-3 42h12l-1-43q-16-17 4-24"
          fill={`url(#${id}-water)`}
        />
        {trees.map((tree, i) => (
          <g key={i}>
            <path
              d={`M${tree.x} ${tree.y}v${tree.h * 0.55}`}
              stroke="#899a85"
              strokeWidth="2"
            />
            <path
              d={`m${tree.x} ${tree.y - tree.h} -8 ${tree.h}h16Z`}
              fill={locked ? palette.moonlight : i % 2 ? '#366e67' : '#53887b'}
            />
            <path
              d={`m${tree.x} ${tree.y - tree.h}v${tree.h}`}
              stroke={palette.ivory}
              strokeOpacity=".15"
            />
          </g>
        ))}
      </g>
      <g transform="translate(81 95)">
        <rect
          width="38"
          height="25"
          rx="7"
          fill={palette.deepSpace}
          stroke={
            state === 'current' || state === 'completed'
              ? palette.starlight
              : palette.moonlight
          }
        />
        <text
          x="19"
          y="17"
          textAnchor="middle"
          fill={palette.softGold}
          fontSize="13"
          className="font-wordmark"
        >
          {levelNo}
        </text>
      </g>
      {state === 'completed' && (
        <g>
          <path d="M151 75V37" stroke={palette.softGold} strokeWidth="2" />
          <path d="M152 38h25l-7 8 7 8h-25" fill={palette.starlight} />
          <path
            d="m158 46 3 3 6-6"
            stroke={palette.deepSpace}
            fill="none"
            strokeWidth="1.5"
          />
        </g>
      )}
      {locked && (
        <>
          <ellipse cx="100" cy="88" rx="93" ry="51" fill={`url(#${id}-fog)`} />
          <circle
            cx="100"
            cy="62"
            r="15"
            fill={palette.deepSpace}
            stroke={palette.moonlight}
          />
          <LockKeyhole
            x="92"
            y="54"
            width="16"
            height="16"
            stroke={palette.mist}
          />
        </>
      )}
    </svg>
  );
}
