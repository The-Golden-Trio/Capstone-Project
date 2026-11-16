import { useId } from 'react';
import { cn } from '../lib/cn';

/**
 * Dãy núi màu nước ở chân màn hình, như bức tranh trong bảng màu gốc:
 * bốn lớp núi đậm dần về phía trước, mép hơi loang nhờ bộ lọc nhiễu.
 */
export function Mountains({
  className,
  tone = 'night',
}: {
  className?: string;
  /** `dawn` ấm hơn cho màn kết quả; `night` cho nền chung. */
  tone?: 'night' | 'dawn';
}) {
  const id = useId().replace(/:/g, '');
  const layers =
    tone === 'dawn'
      ? ['#3a6292', '#254a7a', '#1c3866', '#0f1a38']
      : ['#2b4f80', '#1f3d6a', '#152d55', '#0b1530'];
  return (
    <svg
      aria-hidden
      className={cn('pointer-events-none block w-full', className)}
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <filter id={`${id}-wash`} x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.03"
            numOctaves="3"
            seed="7"
          />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
        <linearGradient id={`${id}-mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ea5c3" stopOpacity="0" />
          <stop offset="1" stopColor="#8ea5c3" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-wash)`}>
        <path
          fill={layers[0]}
          opacity="0.55"
          d="M0 180 L90 132 L170 160 L260 104 L350 150 L430 118 L520 168 L610 96 L700 146 L790 120 L880 158 L980 92 L1070 140 L1160 110 L1260 154 L1350 116 L1440 146 L1440 320 L0 320 Z"
        />
        <path
          fill={layers[1]}
          opacity="0.75"
          d="M0 214 L110 170 L200 196 L300 150 L400 198 L500 160 L600 206 L720 150 L820 196 L930 164 L1030 204 L1130 156 L1230 198 L1340 166 L1440 196 L1440 320 L0 320 Z"
        />
        <path
          fill={layers[2]}
          opacity="0.9"
          d="M0 250 L140 210 L260 238 L380 200 L520 246 L640 214 L780 252 L900 216 L1040 250 L1170 212 L1300 244 L1440 222 L1440 320 L0 320 Z"
        />
      </g>
      <rect x="0" y="150" width="1440" height="170" fill={`url(#${id}-mist)`} />
      <path
        fill={layers[3]}
        d="M0 282 L160 254 L320 278 L480 250 L660 284 L820 258 L980 286 L1150 260 L1300 282 L1440 266 L1440 320 L0 320 Z"
      />
    </svg>
  );
}

/** Trăng lưỡi liềm vàng. */
export function Moon({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn('shrink-0 overflow-visible', className)}
      style={{ filter: 'drop-shadow(0 0 10px rgb(240 215 154 / 0.55))' }}
    >
      <defs>
        <radialGradient id={`${id}-g`} cx="35%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fbf3de" />
          <stop offset="1" stopColor="#d4b06a" />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width="48" height="48" fill="white" />
          <circle cx="31" cy="18" r="16" fill="black" />
        </mask>
      </defs>
      <circle
        cx="22"
        cy="24"
        r="18"
        fill={`url(#${id}-g)`}
        mask={`url(#${id}-m)`}
      />
    </svg>
  );
}

/** Vầng tinh vân mờ phía sau nội dung chính, theo màu tuỳ chọn. */
export function Nebula({
  color = '#254a7a',
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl',
        className,
      )}
      style={{
        background: `radial-gradient(closest-side, ${color}66, ${color}22 55%, transparent)`,
      }}
    />
  );
}
