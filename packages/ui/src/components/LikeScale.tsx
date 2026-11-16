import { useId, useRef } from 'react';
import { cn } from '../lib/cn';

export type LikeValue = 1 | 2 | 3;

const OPTIONS: Array<{ value: LikeValue; label: string }> = [
  { value: 1, label: 'Không thích' },
  { value: 2, label: 'Bình thường' },
  { value: 3, label: 'Thích' },
];

/**
 * Pha trăng làm biểu tượng ba mức: trăng non (không thích), bán nguyệt
 * (bình thường), trăng tròn (thích). Không dùng xanh/đỏ, vì không có đáp án
 * đúng sai (khối C).
 */
export function MoonPhase({
  value,
  size = 22,
  className,
}: {
  value: LikeValue;
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
    >
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx="12" cy="12" r="9" />
        </clipPath>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="rgb(10 16 38 / 0.6)"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {value === 2 && (
        <rect
          x="12"
          y="0"
          width="12"
          height="24"
          fill="currentColor"
          clipPath={`url(#${id}-c)`}
        />
      )}
      {value === 3 && <circle cx="12" cy="12" r="9" fill="currentColor" />}
    </svg>
  );
}

/**
 * Thang ba mức của 18 thẻ Get to know me và câu "thích tới đâu" sau mỗi
 * scenario. Là một radiogroup: phím mũi tên chọn mức.
 */
export function LikeScale({
  value,
  onChange,
  label,
  size = 'md',
  className,
}: {
  value: LikeValue | null;
  onChange: (value: LikeValue) => void;
  /** Câu hỏi hay nội dung thẻ, đọc cho trình đọc màn hình. */
  label: string;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid grid-cols-3 gap-2', className)}
    >
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            ref={(node) => {
              refs.current[o.value - 1] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active || (value === null && o.value === 2) ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const next =
                e.key === 'ArrowRight' || e.key === 'ArrowDown'
                  ? (((o.value % 3) + 1) as LikeValue)
                  : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
                    ? ((((o.value + 1) % 3) + 1) as LikeValue)
                    : e.key === 'Home'
                      ? 1
                      : e.key === 'End'
                        ? 3
                        : null;
              if (next !== null) {
                e.preventDefault();
                onChange(next);
                refs.current[next - 1]?.focus();
              }
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 rounded-lg border font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:shadow-focus',
              size === 'lg'
                ? 'min-h-20 px-2 py-3 text-sm'
                : 'min-h-16 px-2 py-2 text-[13px]',
              active
                ? 'border-gold-400/80 bg-gold-900/40 text-gold-100 shadow-[0_0_22px_-6px_rgb(240_215_154/0.6)]'
                : 'border-line bg-night-800/45 text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            <MoonPhase
              value={o.value}
              size={size === 'lg' ? 26 : 22}
              className={active ? 'text-gold-300' : 'text-night-300'}
            />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
