import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

/** Nhãn nhỏ in hoa đứng trên một ô nhập. */
const LABEL = 'kicker mb-1.5 block text-[10px] text-ink-2';

/** Ô nhập một dòng, có nhãn và dòng báo lỗi. */
export function Field({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  const id = props.id ?? `field-${props.name ?? label}`;
  return (
    <label htmlFor={id} className="mb-3.5 block">
      <span className={LABEL}>{label}</span>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cx('field-input', className)}
      />
      {error && (
        <span className="mt-1 block text-[12px] text-signal">{error}</span>
      )}
    </label>
  );
}

/** Ô nhập nhiều dòng, cùng kiểu với `Field`. */
export function TextArea({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  const id = props.id ?? `field-${props.name ?? label}`;
  return (
    <label htmlFor={id} className="mb-3.5 block">
      <span className={LABEL}>{label}</span>
      <textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cx('field-input resize-y leading-relaxed', className)}
      />
      {error && (
        <span className="mt-1 block text-[12px] text-signal">{error}</span>
      )}
    </label>
  );
}
