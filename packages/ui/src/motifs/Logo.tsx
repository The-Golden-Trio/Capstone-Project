import { useId } from 'react';
import { cn } from '../lib/cn';
import { SPARKLE_PATH } from './Sparkle';

/**
 * Dấu JobQuest: sao bốn cánh nằm trong quỹ đạo nghiêng — "ngôi sao dẫn
 * đường" giữa các hành tinh nghề.
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf3de" />
          <stop offset="0.5" stopColor="#f0d79a" />
          <stop offset="1" stopColor="#d4b06a" />
        </linearGradient>
      </defs>
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7.5"
        fill="none"
        stroke="#d4b06a"
        strokeOpacity="0.75"
        strokeWidth="1.1"
        transform="rotate(-24 20 20)"
      />
      <g transform="translate(8 8)">
        <path d={SPARKLE_PATH} fill={`url(#${id}-g)`} />
      </g>
      <circle cx="35" cy="13.4" r="1.6" fill="#f8f6ee" />
    </svg>
  );
}

/** Logo đầy đủ: dấu và chữ JOBQUEST (Cinzel, chỉ chữ Latin). */
export function Logo({
  size = 'md',
  className,
  tagline = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Hiện câu "Try the job before you pick the career." dưới chữ. */
  tagline?: boolean;
}) {
  const mark = { sm: 24, md: 30, lg: 44 }[size];
  const text = { sm: 'text-[15px]', md: 'text-lg', lg: 'text-3xl' }[size];
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={mark} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-wordmark font-bold tracking-[0.16em] text-gilded',
            text,
          )}
        >
          JOBQUEST
        </span>
        {tagline && (
          <span className="mt-1.5 font-wordmark text-[10px] tracking-[0.22em] text-night-300">
            TRY THE JOB BEFORE YOU PICK THE CAREER
          </span>
        )}
      </span>
    </span>
  );
}
