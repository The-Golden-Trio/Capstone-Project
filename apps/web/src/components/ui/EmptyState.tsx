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
        'rounded-[14px] border border-dashed border-blue/45 bg-bg/35 px-5 py-[34px] text-center',
        className,
      )}
    >
      <div
        className="mb-2.5 text-[22px] text-gold opacity-70"
        aria-hidden="true"
      >
        {icon}
      </div>
      <p className="mx-auto mb-3.5 max-w-[44ch] text-[13.5px] leading-relaxed text-muted">
        {children}
      </p>
      {action}
    </div>
  );
}
