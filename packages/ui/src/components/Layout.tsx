import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { palette, status } from '../tokens';
import { Sparkle } from '../motifs/Sparkle';

export interface TimelineItem {
  time?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'gold';
  icon?: ReactNode;
}
export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <ol className={cn('space-y-0', className)}>
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-4 pb-7 last:pb-0">
          {i < items.length - 1 && (
            <span
              aria-hidden
              className="absolute bottom-0 left-4 top-8 w-px bg-line"
            />
          )}
          <span
            aria-hidden
            className="relative grid size-8 shrink-0 place-items-center rounded-full border border-current bg-night-900"
            style={{
              color:
                item.tone === 'gold'
                  ? palette.starlight
                  : status[item.tone ?? 'info'],
            }}
          >
            {item.icon ?? <Sparkle size={12} />}
          </span>
          <div className="min-w-0 pt-0.5">
            {item.time && (
              <div className="mb-1 text-xs text-ink-faint">{item.time}</div>
            )}
            <h3 className="font-sans text-sm font-semibold text-ink">
              {item.title}
            </h3>
            {item.body && (
              <div className="mt-1 text-sm text-ink-muted">{item.body}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
export interface StepperItem {
  key: string;
  label: ReactNode;
  done?: boolean;
}
/** current là chỉ số bước, bắt đầu từ 0. */
export function Stepper({
  items,
  current,
  className,
}: {
  items: StepperItem[];
  current: number;
  className?: string;
}) {
  return (
    <ol aria-label="Các bước" className={cn('flex w-full', className)}>
      {items.map((item, i) => {
        const done = item.done ?? i < current;
        return (
          <li
            key={item.key}
            aria-current={i === current ? 'step' : undefined}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-2 px-1 text-center"
          >
            {i < items.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-1/2 right-[-50%] top-4 h-px',
                  done ? 'bg-gold-500/60' : 'bg-line',
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                'relative grid size-8 place-items-center rounded-full border text-xs',
                done
                  ? 'border-gold-400 bg-gold-500 text-night-900'
                  : i === current
                    ? 'border-gold-300 bg-night-800 text-gold-200 shadow-glow'
                    : 'border-line bg-night-900 text-ink-faint',
              )}
            >
              {done ? <Check size={15} /> : i + 1}
            </span>
            <span
              className={cn(
                'text-xs',
                i === current || done ? 'text-gold-200' : 'text-ink-faint',
              )}
            >
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}
export function Breadcrumbs({
  items,
  renderLink = (href, children) => <a href={href}>{children}</a>,
}: {
  items: BreadcrumbItem[];
  renderLink?: (href: string, children: ReactNode) => ReactNode;
}) {
  return (
    <nav aria-label="Đường dẫn">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronRight aria-hidden size={12} className="text-ink-faint" />
            )}
            <span
              aria-current={i === items.length - 1 ? 'page' : undefined}
              className={
                i === items.length - 1 ? 'text-ink' : 'hover:text-gold-200'
              }
            >
              {item.href && i !== items.length - 1
                ? renderLink(item.href, item.label)
                : item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
export interface AccordionProps extends Omit<
  ComponentPropsWithRef<'details'>,
  'title'
> {
  title: ReactNode;
  icon?: ReactNode;
}
export function Accordion({
  title,
  icon,
  children,
  className,
  ...props
}: AccordionProps) {
  return (
    <details
      {...props}
      className={cn(
        'group rounded-lg border border-line bg-night-800/30 open:border-line-gold',
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {icon && (
          <span aria-hidden className="text-gold-300">
            {icon}
          </span>
        )}
        <span className="flex-1">{title}</span>
        <ChevronDown
          aria-hidden
          size={16}
          className="text-gold-300 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-line px-4 py-4 text-sm text-ink-muted">
        {children}
      </div>
    </details>
  );
}
export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => Array.from(word)[0])
    .join('')
    .toLocaleUpperCase('vi');
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'relative inline-grid shrink-0 place-items-center rounded-full border border-line-gold bg-night-800 font-semibold text-gold-200',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {initials}
      <svg
        aria-hidden
        className="absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)]"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke={palette.starlight}
          strokeWidth=".5"
          strokeDasharray="25 6 3 7"
        />
        <circle cx="40" cy="9" r="1.5" fill={palette.softGold} />
        <circle cx="7" cy="39" r="1" fill={palette.softGold} />
      </svg>
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-8', className)}>
      {back && <div className="mb-5">{back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0 max-w-2xl">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            {title}
          </h1>
          {description && (
            <div className="mt-3 text-sm leading-relaxed text-ink-muted">
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
      <div className="hairline-gold mt-6 opacity-60" />
    </header>
  );
}
