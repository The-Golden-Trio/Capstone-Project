import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Số nổi bật thì tô vàng. */
  gold?: boolean;
}

export function Stat({ label, value, hint, gold }: StatProps) {
  return (
    <div className="rounded-xl border border-line-2 border-t-2 border-t-gold/55 bg-line/30 px-4 py-[15px]">
      <span className="kicker mb-2 block text-[9.5px] text-muted">{label}</span>
      <span
        className={cx(
          'block font-display text-[27px] leading-none font-semibold tabular-nums',
          gold && 'text-gold-2',
        )}
      >
        {value}
      </span>
      {hint != null && (
        <span className="mt-1.5 block text-[11.5px] leading-snug text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}

/** Lưới ô số liệu — tự xuống dòng ở màn hẹp. */
export function StatGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(158px,1fr))]',
        className,
      )}
    >
      {children}
    </div>
  );
}
