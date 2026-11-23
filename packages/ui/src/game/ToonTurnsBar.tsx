import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface ToonTurnsBarProps {
  /** Lượt còn lại (điểm thời gian của ca). */
  remaining: number;
  budget: number;
  minutesPerPoint: number;
  className?: string;
}

/** Thanh lượt của ca làm: cạn dần khi tiêu lượt; xanh trên 50%, vàng từ 25%, đỏ dưới 25%. */
export function ToonTurnsBar({
  remaining,
  budget,
  minutesPerPoint,
  className,
}: ToonTurnsBarProps) {
  const total = Number.isFinite(budget) ? Math.max(0, Math.floor(budget)) : 0;
  const left = Number.isFinite(remaining)
    ? Math.max(0, Math.min(total, Math.floor(remaining)))
    : 0;
  const ratio = total > 0 ? left / total : 0;
  const tone =
    ratio > 0.5
      ? 'bg-toon-mint'
      : ratio >= 0.25
        ? 'bg-toon-mustard'
        : 'bg-toon-coral';

  const previous = useRef(left);
  const [spent, setSpent] = useState(0);
  useEffect(() => {
    const cost = previous.current - left;
    previous.current = left;
    if (cost <= 0) return;
    setSpent(cost);
    const id = window.setTimeout(() => setSpent(0), 1600);
    return () => window.clearTimeout(id);
  }, [left]);

  return (
    <div
      className={cn('flex min-w-0 items-center gap-2 text-toon-ink', className)}
    >
      <div
        role="progressbar"
        aria-label="Lượt còn lại"
        aria-valuemin={0}
        aria-valuemax={Math.max(1, total)}
        aria-valuenow={left}
        aria-valuetext={`còn ${left}/${total} lượt · 1 lượt khoảng ${minutesPerPoint} phút trong ca`}
        data-state={ratio > 0.5 ? 'ok' : ratio >= 0.25 ? 'warn' : 'low'}
        className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full border-[2.5px] border-toon-ink bg-toon-sand sm:min-w-28 sm:max-w-44"
      >
        <div
          className={cn(
            'h-full transition-[width,background-color] duration-500 ease-out motion-reduce:transition-none',
            left > 0 && 'border-r-[2.5px] border-toon-ink',
            tone,
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="relative shrink-0 text-xs font-extrabold tabular-nums">
        còn {left}/{total} lượt
        {spent > 0 && (
          <span
            data-turns-spent=""
            aria-hidden="true"
            className="absolute -top-4 right-0 animate-toon-pop rounded-full border-2 border-toon-ink bg-toon-paper px-1.5 text-[11px] leading-4 motion-reduce:animate-none"
          >
            −{spent}
          </span>
        )}
      </span>
    </div>
  );
}
