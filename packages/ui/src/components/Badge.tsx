import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

export type Tone =
  'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const tones: Record<Tone, string> = {
  neutral: 'text-ink-muted border-line-strong bg-night-700/50',
  gold: 'text-gold-200 border-gold-500/45 bg-gold-900/45',
  success: 'text-success border-success/40 bg-success-deep/45',
  warning: 'text-warning border-warning/40 bg-warning-deep/45',
  danger: 'text-danger border-danger/40 bg-danger-deep/45',
  info: 'text-info border-info/40 bg-info-deep/50',
  muted: 'text-night-300 border-line bg-transparent',
};

/** Nhãn trạng thái nhỏ: "Đang chơi", "Chưa có màn chơi", "Bậc 3". */
export function Badge({
  tone = 'neutral',
  icon,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; icon?: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}

/** Chấm màu của vùng nghề hay nhóm, kèm chữ nếu có. */
export function ColorDot({
  color,
  size = 8,
  className,
  glow = false,
}: {
  color: string;
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: glow ? `0 0 8px ${color}` : undefined,
      }}
    />
  );
}

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: ReactNode;
  /** Màu riêng của chip (ví dụ màu vùng nghề) khi được chọn. */
  color?: string;
  count?: number;
}

/** Chip lọc chọn được: bấm để bật tắt, có `aria-pressed`. */
export function Chip({
  selected = false,
  icon,
  color,
  count,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:shadow-focus',
        selected
          ? 'border-gold-400/70 bg-gold-900/55 text-gold-100'
          : 'border-line bg-night-800/45 text-ink-muted hover:border-line-strong hover:text-ink',
        className,
      )}
      style={
        selected && color
          ? { borderColor: color, boxShadow: `inset 0 0 0 1px ${color}55` }
          : undefined
      }
      {...rest}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span className="tabular text-xs text-night-300">{count}</span>
      )}
    </button>
  );
}

/** Thẻ đã chọn, có nút gỡ (ví dụ sở thích đã chọn). */
export function Tag({
  children,
  onRemove,
  removeLabel = 'Bỏ',
  className,
}: {
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-md border border-line bg-night-700/55 pl-2.5 pr-1 text-[13px] text-ink',
        !onRemove && 'pr-2.5',
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${removeLabel} ${typeof children === 'string' ? children : ''}`.trim()}
          className="grid size-5 place-items-center rounded text-night-300 hover:bg-night-600 hover:text-ink"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

/** Phím tắt bàn phím. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-night-800 px-1 font-mono text-[11px] text-ink-muted">
      {children}
    </kbd>
  );
}
