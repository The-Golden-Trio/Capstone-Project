import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cx('rounded-[11px] border border-line bg-surf', className)}
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
        'flex flex-wrap items-center gap-2.5 border-b border-line-2 px-[18px] py-3.5',
        className,
      )}
    >
      {title != null && (
        <h2 className="min-w-0 flex-1 font-display text-[15px] font-semibold">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cx('p-[18px]', className)}>{children}</div>;
}
