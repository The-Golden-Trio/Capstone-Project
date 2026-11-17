import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabItem<K extends string = string> {
  key: K;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
}

/**
 * Tab theo mẫu WAI-ARIA: phím mũi tên chuyển tab, Home/End nhảy đầu cuối.
 * Component chỉ vẽ hàng tab; nội dung đặt trong `TabPanel` cùng `idBase`.
 */
export function Tabs<K extends string>({
  items,
  value,
  onChange,
  label,
  idBase,
  variant = 'underline',
  className,
}: {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  /** Gốc id để nối tab với panel; mặc định tự sinh. */
  idBase?: string;
  variant?: 'underline' | 'pill';
  className?: string;
}) {
  const auto = useId();
  const base = idBase ?? auto;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const next =
      e.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : e.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    onChange(items[next].key);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'scroll-x-clean flex',
        variant === 'underline'
          ? 'gap-1 border-b border-line'
          : 'gap-1 rounded-full border border-line bg-night-900/60 p-1',
        className,
      )}
    >
      {items.map((item, i) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${item.key}`}
            aria-selected={active}
            aria-controls={`${base}-panel-${item.key}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-focus',
              variant === 'underline'
                ? cn(
                    'h-11 rounded-t-md px-3.5',
                    active ? 'text-gold-200' : 'text-ink-faint hover:text-ink',
                  )
                : cn(
                    'h-8 rounded-full px-3.5',
                    active
                      ? 'bg-night-700 text-gold-100 shadow-[inset_0_0_0_1px_rgb(212_176_106/0.45)]'
                      : 'text-ink-faint hover:text-ink',
                  ),
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span className="tabular rounded-full bg-night-700 px-1.5 text-[11px] text-ink-muted">
                {item.count}
              </span>
            )}
            {variant === 'underline' && active && (
              <span
                aria-hidden
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold-400 shadow-[0_0_10px_rgb(240_215_154/0.8)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  idBase,
  tabKey,
  active,
  children,
  className,
}: {
  idBase: string;
  tabKey: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${tabKey}`}
      aria-labelledby={`${idBase}-tab-${tabKey}`}
      tabIndex={0}
      className={cn('animate-fade focus-visible:outline-none', className)}
    >
      {children}
    </div>
  );
}

/** Nút chọn một trong vài giá trị (ví dụ "Bản đồ · Danh sách"). */
export function SegmentedControl<K extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = 'md',
}: {
  options: Array<{ key: K; label: ReactNode; icon?: ReactNode }>;
  value: K;
  onChange: (key: K) => void;
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex rounded-full border border-line bg-night-900/70 p-0.5',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-focus',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3.5 text-[13px]',
              active
                ? 'bg-night-700 text-gold-100 shadow-[inset_0_0_0_1px_rgb(212_176_106/0.4)]'
                : 'text-ink-faint hover:text-ink',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
