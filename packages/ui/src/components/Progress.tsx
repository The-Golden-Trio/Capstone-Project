import { useId, type ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Thanh tiến độ: vàng mặc định, có thể đổi màu (ví dụ màu vùng nghề). */
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color,
  size = 'md',
  className,
  valueText,
}: {
  value: number;
  max?: number;
  /** Tên đọc cho trình đọc màn hình và hiện phía trên nếu `showValue`. */
  label: string;
  showValue?: boolean;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  /** Chữ thay cho phần trăm, ví dụ "3.400 / 6.000". */
  valueText?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const height = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5' }[size];
  return (
    <div className={cn('w-full', className)}>
      {showValue && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
          <span className="text-ink-muted">{label}</span>
          <span className="tabular font-semibold text-ink">
            {valueText ?? `${Math.round(ratio * 100)}%`}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        className={cn(
          'relative overflow-hidden rounded-full bg-night-950/70 ring-1 ring-inset ring-line',
          height,
        )}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out-soft"
          style={{
            width: `${ratio * 100}%`,
            background: color
              ? `linear-gradient(90deg, ${color}aa, ${color})`
              : 'linear-gradient(90deg, #b08f4c, #e2c47e 60%, #f6e6bf)',
            boxShadow: `0 0 10px ${color ?? '#f0d79a'}88`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Thanh chia ô: mỗi ô một đơn vị (ví dụ 3/5 màn chính đã xong trong cấp).
 * Ô đã xong vàng đặc, ô đang chơi viền vàng, ô chưa tới mờ.
 */
export function SegmentedProgress({
  total,
  done,
  current,
  label,
  className,
}: {
  total: number;
  done: number;
  /** Chỉ số ô đang chơi (0-based), nếu có. */
  current?: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label}: ${done}/${total}`}
      className={cn('flex w-full gap-1', className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 flex-1 rounded-sm transition-colors',
            i < done
              ? 'bg-gold-400 shadow-[0_0_8px_rgb(240_215_154/0.45)]'
              : i === current
                ? 'bg-gold-900/60 ring-1 ring-inset ring-gold-400/80'
                : 'bg-night-700/70',
          )}
        />
      ))}
    </div>
  );
}

/** Vòng tiến độ cho điểm màn 0–100 hay phần trăm, chữ số ở giữa. */
export function RingProgress({
  value,
  max = 100,
  size = 96,
  stroke = 7,
  label,
  children,
  color,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label: string;
  children?: ReactNode;
  color?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div
      role="img"
      aria-label={`${label}: ${value}/${max}`}
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color ?? '#f6e6bf'} />
            <stop offset="1" stopColor={color ?? '#b08f4c'} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(93 126 168 / 0.22)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id}-g)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          style={{
            transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)',
            filter: 'drop-shadow(0 0 6px rgb(240 215 154 / 0.5))',
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children}
      </div>
    </div>
  );
}
