import { useId, type ReactNode } from 'react';
import { palette } from '../tokens';
import { FrameCorners } from '../components/Panel';
import { cn } from '../lib/cn';
import { SPARKLE_PATH } from '../motifs/Sparkle';
export function TarotCardBack({
  size = 200,
  label = 'Nhân vật chưa gặp',
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 200 320"
      width={size}
      height={size * 1.6}
      className={cn('rounded-xl shadow-panel', className)}
    >
      <defs>
        <linearGradient id={`${id}-night`} x2="1" y2="1">
          <stop stopColor={palette.midnight} />
          <stop offset="1" stopColor={palette.deepSpace} />
        </linearGradient>
        <mask id={`${id}-moon`}>
          <rect width="200" height="320" fill="white" />
          <circle cx="116" cy="143" r="30" fill="black" />
        </mask>
      </defs>
      <rect
        x="1"
        y="1"
        width="198"
        height="318"
        rx="12"
        fill={`url(#${id}-night)`}
        stroke={palette.starlight}
        strokeWidth="1"
      />
      <rect
        x="9"
        y="9"
        width="182"
        height="302"
        rx="8"
        fill="none"
        stroke={palette.starlight}
        strokeOpacity=".4"
      />
      <path
        d="M100 21 178 160 100 299 22 160Z"
        fill="none"
        stroke={palette.starlight}
        strokeOpacity=".35"
      />
      <ellipse
        cx="100"
        cy="160"
        rx="62"
        ry="107"
        fill="none"
        stroke={palette.starlight}
        strokeOpacity=".3"
      />
      <circle cx="100" cy="160" r="48" fill="none" stroke={palette.starlight} />
      <circle
        cx="100"
        cy="160"
        r="35"
        fill={palette.starlight}
        mask={`url(#${id}-moon)`}
      />
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * Math.PI) / 8;
        return (
          <line
            key={i}
            x1={100 + Math.cos(angle) * 53}
            y1={160 + Math.sin(angle) * 53}
            x2={100 + Math.cos(angle) * (i % 2 ? 58 : 65)}
            y2={160 + Math.sin(angle) * (i % 2 ? 58 : 65)}
            stroke={palette.starlight}
            strokeOpacity=".7"
          />
        );
      })}
      {[
        [100, 50, 12],
        [100, 270, 12],
        [35, 35, 7],
        [165, 35, 7],
        [35, 285, 7],
        [165, 285, 7],
        [100, 88, 5],
        [100, 230, 5],
      ].map(([x, y, s], i) => (
        <path
          key={i}
          d={SPARKLE_PATH}
          transform={`translate(${x - s / 2} ${y - s / 2}) scale(${s / 24})`}
          fill={palette.softGold}
        />
      ))}
      <path
        d="M20 52V20h32m96 0h32v32M20 268v32h32m96 0h32v-32"
        fill="none"
        stroke={palette.starlight}
        strokeOpacity=".8"
      />
    </svg>
  );
}
export function TarotCardFrame({
  numeral = 'I',
  name,
  children,
  className,
  size = 240,
}: {
  numeral?: string;
  name: string;
  children: ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <figure
      className={cn(
        'relative m-0 flex aspect-[5/8] max-w-full flex-col overflow-hidden rounded-xl border border-line-gold bg-night-900 p-3 shadow-panel',
        className,
      )}
      style={{ width: size }}
    >
      <FrameCorners />
      <div className="py-2 text-center font-wordmark text-sm tracking-widest text-gold-300">
        {numeral}
      </div>
      <div className="relative flex min-h-0 flex-1 items-end justify-center overflow-hidden rounded-t-full border border-line bg-[radial-gradient(ellipse_at_center,#254a7a,transparent)] [&>svg]:h-full [&>svg]:w-full">
        {children}
      </div>
      <div className="hairline-gold mt-3" />
      <figcaption className="px-1 py-3 text-center font-display text-lg text-gold-100">
        {name}
      </figcaption>
    </figure>
  );
}
