import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface EmptyStateProps {
  icon?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = '◆',
  children,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        'rounded-[10px] border border-dashed border-line bg-panel px-5 py-[34px] text-center',
        className,
      )}
    >
      <div className="mb-2.5 text-[26px] opacity-50" aria-hidden="true">
        {icon}
      </div>
      <p className="mx-auto mb-3.5 max-w-[44ch] text-[13.5px] leading-relaxed text-muted">
        {children}
      </p>
      {action}
    </div>
  );
}
