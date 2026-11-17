import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Sparkle } from '../motifs/Sparkle';

export type PanelVariant = 'glass' | 'solid' | 'outline' | 'paper' | 'sunken';

const variants: Record<PanelVariant, string> = {
  glass: 'glass shadow-panel',
  solid: 'bg-night-850 border border-line shadow-panel',
  outline: 'border border-line bg-transparent',
  paper: 'paper shadow-lift',
  sunken: 'bg-surface-sunken border border-line/60',
};

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  variant?: PanelVariant;
  /** Khung chòm sao: viền vàng mảnh và sao ở bốn góc, cho thẻ cần nhấn. */
  frame?: boolean;
  /** Toả sáng nhẹ, cho thẻ đang được chọn hay phần thưởng. */
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'section' | 'div' | 'article' | 'aside' | 'li';
}

const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6 sm:p-8' };

export function Panel({
  variant = 'glass',
  frame = false,
  glow = false,
  padding = 'md',
  as: Tag = 'section',
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <Tag
      className={cn(
        'relative rounded-lg',
        variants[variant],
        paddings[padding],
        frame && 'border-line-gold',
        glow && 'shadow-glow',
        className,
      )}
      {...rest}
    >
      {frame && <FrameCorners />}
      {children}
    </Tag>
  );
}

/** Bốn góc khung: nét vàng chữ L và sao bốn cánh, không bắt sự kiện chuột. */
export function FrameCorners({ className }: { className?: string }) {
  const corner = 'pointer-events-none absolute size-4 border-gold-400/70';
  return (
    <span aria-hidden className={cn('pointer-events-none', className)}>
      <span
        className={cn(
          corner,
          'left-1.5 top-1.5 border-l border-t rounded-tl-sm',
        )}
      />
      <span
        className={cn(
          corner,
          'right-1.5 top-1.5 border-r border-t rounded-tr-sm',
        )}
      />
      <span
        className={cn(
          corner,
          'bottom-1.5 left-1.5 border-b border-l rounded-bl-sm',
        )}
      />
      <span
        className={cn(
          corner,
          'bottom-1.5 right-1.5 border-b border-r rounded-br-sm',
        )}
      />
      <Sparkle size={10} className="absolute -right-1 -top-1 text-gold-300" />
      <Sparkle
        size={7}
        className="absolute -bottom-0.5 -left-0.5 text-gold-400/80"
      />
    </span>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  level = 2,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  level?: 2 | 3 | 4;
}) {
  const H = `h${level}` as 'h2' | 'h3' | 'h4';
  return (
    <header
      className={cn(
        'mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <H
          className={cn(
            'text-ink',
            level === 2 && 'text-xl sm:text-2xl',
            level === 3 && 'text-lg',
            level === 4 && 'text-base',
          )}
        >
          {title}
        </H>
        {description && (
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
