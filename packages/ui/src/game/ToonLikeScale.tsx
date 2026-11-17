import { useRef } from 'react';
import { cn } from '../lib/cn';
import type { LikeValue } from '../components/LikeScale';

const OPTIONS: Array<{ value: LikeValue; label: string; fill: string }> = [
  { value: 1, label: 'Không thích', fill: '#ead8b8' },
  { value: 2, label: 'Bình thường', fill: '#a6d2ea' },
  { value: 3, label: 'Thích', fill: '#f0b63c' },
];

/**
 * Mặt vẽ tay cho ba mức. Không dùng xanh/đỏ, vì không có đáp án đúng sai
 * (khối C): màu chỉ đậm dần theo mức thích.
 */
function Face({ value, size }: { value: LikeValue; size: number }) {
  const mouth =
    value === 1
      ? 'M15 31 Q24 26 33 31'
      : value === 2
        ? 'M16 30 H32'
        : 'M14 27 Q24 37 34 27';
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 48 48">
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="#fffaf0"
        stroke="#1e1b18"
        strokeWidth="3"
      />
      {value === 3 ? (
        <>
          <path
            d="M14 20 Q17 16 20 20"
            fill="none"
            stroke="#1e1b18"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M28 20 Q31 16 34 20"
            fill="none"
            stroke="#1e1b18"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="13" cy="27" r="3" fill="#eea7b4" />
          <circle cx="35" cy="27" r="3" fill="#eea7b4" />
        </>
      ) : (
        <>
          <circle cx="17" cy="20" r="2.6" fill="#1e1b18" />
          <circle cx="31" cy="20" r="2.6" fill="#1e1b18" />
        </>
      )}
      <path
        d={mouth}
        fill={value === 3 ? '#e2703f' : 'none'}
        stroke="#1e1b18"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Thang ba mức "thích tới đâu" cho màn trong ca làm. Cùng hành vi với
 * `LikeScale` (radiogroup, phím mũi tên), khác hình.
 */
export function ToonLikeScale({
  value,
  onChange,
  label,
  className,
}: {
  value: LikeValue | null;
  onChange: (value: LikeValue) => void;
  label: string;
  className?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid grid-cols-3 gap-2.5', className)}
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
              'flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-[3px] border-toon-ink px-2 py-3 font-toon text-sm font-extrabold text-toon-ink transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus',
              active
                ? '-translate-y-1 shadow-toon'
                : 'bg-toon-paper shadow-toon-sm hover:-translate-y-0.5',
            )}
            style={active ? { backgroundColor: o.fill } : undefined}
          >
            <span className={cn(active && 'animate-toon-pop')}>
              <Face value={o.value} size={40} />
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
