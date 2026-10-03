import { cx } from '../../lib/cx';

/** Dãy vạch tiến trình: xong / đang ở / chưa tới. */
export function ProgressDots({
  total,
  current,
  className,
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div className={cx('mb-[18px] flex gap-1', className)} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={cx(
            'h-[3px] flex-1 rounded-sm',
            i < current && 'bg-gold',
            i === current && 'bg-gold opacity-40',
            i > current && 'bg-line',
          )}
        />
      ))}
    </div>
  );
}

/** Thanh điểm kỹ năng của một cấp bậc. */
export function XpBar({
  from,
  to,
  points,
  goal,
  unlocked,
}: {
  from: string;
  to: string;
  points: number;
  goal: number;
  unlocked: boolean;
}) {
  const pct = Math.min(100, (points / goal) * 100);
  return (
    <div className="flex items-center gap-3 rounded-[11px] border border-line-2 bg-panel px-4 py-[13px]">
      <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.09em] text-gold-2">
        {from} → {to}
      </span>
      <span className="h-[9px] flex-1 overflow-hidden rounded-[5px] border border-line-2 bg-inset">
        <i
          className={cx(
            'block h-full rounded-[5px]',
            points >= goal
              ? 'bg-linear-to-r from-good to-[#9ADFC0]'
              : 'bg-linear-to-r from-gold to-gold-2',
          )}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="whitespace-nowrap font-mono text-[11.5px] tabular-nums text-muted">
        {points}/{goal}
        {unlocked ? ' ✓' : ''}
      </span>
    </div>
  );
}
