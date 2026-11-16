import type { HTMLAttributes, ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '../lib/cn';
import { Sparkle } from '../motifs/Sparkle';

export type CalloutTone =
  'info' | 'success' | 'warning' | 'danger' | 'gold' | 'ai';
const tones: Record<CalloutTone, string> = {
  info: 'border-info/35 bg-info-deep/30 text-info',
  success: 'border-success/35 bg-success-deep/30 text-success',
  warning: 'border-warning/35 bg-warning-deep/30 text-warning',
  danger: 'border-danger/35 bg-danger-deep/30 text-danger',
  gold: 'border-line-gold bg-gold-900/25 text-gold-300',
  ai: 'border-info/35 bg-info-deep/25 text-info',
};
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center px-6 py-12 text-center',
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 140 90"
        width="140"
        height="90"
        className="mb-4 text-gold-400"
      >
        <ellipse
          cx="70"
          cy="47"
          rx="58"
          ry="30"
          fill="none"
          stroke="currentColor"
          opacity=".15"
          transform="rotate(-16 70 47)"
        />
        <path
          d="m25 62 28-34 32 19 29-26M53 28l7 43 25-24"
          fill="none"
          stroke="currentColor"
          opacity=".4"
        />
        {[
          [25, 62],
          [53, 28],
          [85, 47],
          [114, 21],
          [60, 71],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="currentColor" opacity=".08" />
            <path
              d="M0-4Q1-1 4 0Q1 1 0 4Q-1 1-4 0Q-1-1 0-4"
              transform={`translate(${x} ${y})`}
              fill="currentColor"
            />
          </g>
        ))}
      </svg>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}
export function Skeleton({
  variant = 'text',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      {...props}
      className={cn(
        'shimmer',
        variant === 'text'
          ? 'h-4 w-full rounded'
          : variant === 'circle'
            ? 'size-12 rounded-full'
            : 'h-32 w-full rounded-xl',
        className,
      )}
    />
  );
}
/** Nhãn AI luôn hiển thị; không thay bằng tooltip hoặc biểu tượng riêng. */
export function Callout({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 text-sm',
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="mt-0.5 shrink-0">
        {tone === 'gold' || tone === 'ai' ? (
          <Sparkle size={18} />
        ) : tone === 'success' ? (
          <CheckCircle2 size={18} />
        ) : tone === 'warning' || tone === 'danger' ? (
          <TriangleAlert size={18} />
        ) : (
          <Info size={18} />
        )}
      </span>
      <div className="min-w-0">
        {tone === 'ai' && (
          <p className="font-semibold">Nội dung hoặc đánh giá này do AI tạo.</p>
        )}
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="mt-1 text-ink-muted">{children}</div>}
      </div>
    </aside>
  );
}
export function Stat({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('glass relative rounded-xl p-5 shadow-panel', className)}
    >
      <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
        <span>{label}</span>
        <span aria-hidden className="text-night-300">
          {icon}
        </span>
      </div>
      <p className="tabular mt-3 font-display text-4xl text-gold-200">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
