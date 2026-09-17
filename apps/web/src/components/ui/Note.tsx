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
        'rounded-r-lg border-l-[3px] bg-panel px-[15px] py-[13px] text-[13px] leading-relaxed text-ink-2',
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
    <p className={cx('font-mono text-[10px] leading-relaxed text-muted', className)}>
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
        'mb-2.5 font-mono text-[10px] uppercase tracking-[0.11em] text-muted',
        className,
      )}
    >
      {children}
    </p>
  );
}
