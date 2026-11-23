import { cn } from '../lib/cn';

export interface ToonClockProps {
  time: string;
  deadline: string;
  remaining: number;
  budget: number;
  minutesPerPoint: number;
  className?: string;
  compact?: boolean;
}

function minutesOf(time: string) {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(time);
  return match ? (Number(match[1]) % 24) * 60 + Number(match[2]) : 0;
}

function pointAt(angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [32 + 27 * Math.cos(radians), 32 + 27 * Math.sin(radians)];
}

/** Đồng hồ treo tường và pin điểm thời gian của ca làm. */
export function ToonClock({
  time,
  deadline,
  remaining,
  budget,
  minutesPerPoint,
  className,
  compact = false,
}: ToonClockProps) {
  const total = Number.isFinite(budget) ? Math.max(0, Math.floor(budget)) : 0;
  const left = Number.isFinite(remaining)
    ? Math.max(0, Math.min(total, Math.floor(remaining)))
    : 0;
  const late = total > 0 && left / total <= 0.2;
  const current = minutesOf(time);
  const hourAngle = (current % 720) / 2;
  const minuteAngle = (current % 60) * 6;
  // Qua nửa đêm vẫn đi theo chiều kim đồng hồ; mặt số chỉ chứa 12 giờ.
  const untilDeadline = (minutesOf(deadline) - current + 1440) % 1440;
  const sweep = Math.min(720, untilDeadline) / 2;
  const [startX, startY] = pointAt(hourAngle);
  const [endX, endY] = pointAt(hourAngle + sweep);
  const arc = `M ${startX} ${startY} A 27 27 0 ${sweep > 180 ? 1 : 0} 1 ${endX} ${endY}`;
  const tone = late ? 'text-toon-coral' : 'text-toon-mustard';
  const fill = late ? 'bg-toon-coral' : 'bg-toon-mustard';
  const size = compact ? 40 : 56;

  return (
    <div
      role="group"
      aria-label={`Bây giờ ${time}, hạn ${deadline}, còn ${left} điểm thời gian`}
      data-state={late ? 'late' : 'normal'}
      className={cn(
        'inline-flex max-w-full items-center gap-3 font-toon-body text-toon-ink',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={cn('shrink-0 overflow-visible', tone)}
      >
        <circle cx="34" cy="35" r="29" className="fill-toon-ink" />
        <circle
          cx="32"
          cy="32"
          r="29"
          className="fill-toon-cream stroke-toon-ink"
          strokeWidth="3"
        />
        {sweep >= 360 ? (
          <circle
            cx="32"
            cy="32"
            r="27"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
        ) : sweep > 0 ? (
          <path
            d={arc}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ) : null}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            data-clock-tick=""
            x1="32"
            y1="9"
            x2="32"
            y2={i % 3 === 0 ? 14 : 12}
            transform={`rotate(${i * 30} 32 32)`}
            className="stroke-toon-ink"
            strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
            strokeLinecap="round"
          />
        ))}
        <line
          data-clock-hand="hour"
          x1="32"
          y1="33"
          x2="32"
          y2="19"
          className="origin-center stroke-toon-ink transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `rotate(${hourAngle}deg)` }}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          data-clock-hand="minute"
          x1="32"
          y1="35"
          x2="32"
          y2="13"
          className="origin-center stroke-toon-ink transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `rotate(${minuteAngle}deg)` }}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="32" r="3.2" className="fill-toon-ink" />
      </svg>

      {compact && (
        <span className="flex flex-col items-start leading-none">
          <span className="font-toon text-base font-extrabold tabular-nums">
            {time}
          </span>
          <span className="mt-0.5 text-[11px] font-bold text-toon-ink-soft">
            hạn {deadline}
          </span>
        </span>
      )}
      {!compact && (
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-toon text-3xl font-extrabold leading-none tabular-nums">
              {time}
            </span>
            <span className="text-xs font-bold text-toon-ink-soft">
              hạn {deadline}
            </span>
          </div>
          <div
            key={late ? 'late' : 'normal'}
            role="progressbar"
            aria-label="Điểm thời gian còn lại"
            aria-valuemin={0}
            aria-valuemax={Math.max(1, total)}
            aria-valuenow={left}
            aria-valuetext={`còn ${left}/${total} điểm · 1 điểm = ${minutesPerPoint} phút`}
            className={cn(
              'mt-1.5 flex flex-wrap gap-0.5',
              late && 'animate-toon-wiggle motion-reduce:animate-none',
            )}
            style={
              late
                ? { animationIterationCount: 1, animationDuration: '600ms' }
                : undefined
            }
          >
            {total > 30 ? (
              <div
                aria-hidden="true"
                data-clock-battery="continuous"
                className="relative h-3 w-40 max-w-full overflow-hidden rounded-sm border-2 border-toon-ink bg-toon-sand shadow-toon-sm"
              >
                <div
                  className={cn('absolute inset-y-0 right-0', fill)}
                  style={{ width: `${(left / total) * 100}%` }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to right, transparent 0, transparent calc(100% - 1px), var(--color-toon-ink) calc(100% - 1px), var(--color-toon-ink) 100%)',
                    backgroundSize: `${100 / total}% 100%`,
                  }}
                />
              </div>
            ) : (
              Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  data-clock-cell={i < total - left ? 'used' : 'remaining'}
                  className={cn(
                    'size-2.5 shrink-0 rounded-[2px] border-2 border-toon-ink',
                    i < total - left ? 'bg-toon-sand' : fill,
                  )}
                />
              ))
            )}
          </div>
          <p className="mt-1 text-[11px] font-bold leading-snug text-toon-ink-soft">
            còn {left}/{total} điểm · 1 điểm = {minutesPerPoint} phút
          </p>
        </div>
      )}
    </div>
  );
}
