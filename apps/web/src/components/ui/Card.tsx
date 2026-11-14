import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cx(
        'rounded-[14px] border border-line-gold bg-linear-to-b from-glass to-panel/70 shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function CardHeader({ title, children, className }: CardHeaderProps) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-center gap-2.5 border-b border-line-gold px-5 py-3.5',
        className,
      )}
    >
      {title != null && (
        <h2 className="min-w-0 flex-1 font-display text-[16px] font-semibold tracking-[0.01em]">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cx('p-5', className)}>{children}</div>;
}
