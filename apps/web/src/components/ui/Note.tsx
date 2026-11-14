import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type NoteTone = 'info' | 'warn' | 'ok';

const BORDER: Record<NoteTone, string> = {
  info: 'border-l-gold',
  warn: 'border-l-signal',
  ok: 'border-l-good',
};

/** Khối ghi chú có vạch màu bên trái. */
export function Note({
  tone = 'info',
  children,
  className,
}: {
  tone?: NoteTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'rounded-r-xl border-l-2 bg-line/35 px-4 py-[13px] text-[13px] leading-relaxed text-ink-2',
        BORDER[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Dòng ghi nguồn dữ liệu, cỡ chữ nhỏ. */
export function SourceNote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx('text-[11px] leading-relaxed text-muted', className)}>
      {children}
    </p>
  );
}

/** Nhãn nhỏ in hoa đứng trên một khối nội dung. */
export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        'kicker mb-2.5',
        className,
      )}
    >
      {children}
    </p>
  );
}
