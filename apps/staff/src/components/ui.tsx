/**
 * Khối giao diện dùng chung của staff app. Ưu tiên phần tử HTML gốc
 * (button, label, dialog) để bàn phím và trình đọc màn hình chạy đúng
 * (NFR-19).
 */
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { ApiProblem, messageOf } from '../api/client';
import { cx } from '../lib/cx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: 'sm' | 'md';
    busy?: boolean;
  }
>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    busy,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-9 px-3.5',
        variant === 'primary' &&
          'border-brand bg-brand text-white hover:bg-brand-2',
        variant === 'secondary' &&
          'border-line bg-surf text-ink hover:bg-inset',
        variant === 'danger' && 'border-bad bg-surf text-bad hover:bg-bad-soft',
        variant === 'ghost' &&
          'border-transparent bg-transparent text-ink-2 hover:bg-inset',
        className,
      )}
      {...rest}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
});

export function Spinner({ label }: { label?: string }) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function Card({
  title,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        'rounded-lg border border-line bg-surf shadow-sm',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line-2 px-4 py-3">
          {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const TONES = {
  neutral: 'bg-inset text-ink-2 border-line',
  brand: 'bg-brand-soft text-brand-2 border-brand-soft',
  warn: 'bg-warn-soft text-warn border-warn-soft',
  good: 'bg-good-soft text-good border-good-soft',
  bad: 'bg-bad-soft text-bad border-bad-soft',
} as const;

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium whitespace-nowrap',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

interface FieldShell {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}

function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
}: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label
        htmlFor={id}
        className="mb-1 block text-[13px] font-medium text-ink-2"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-[12px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[12px] text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-line bg-surf px-2.5 py-1.5 text-ink placeholder:text-muted focus:border-brand aria-[invalid=true]:border-bad';

export function TextField({
  label,
  hint,
  error,
  ...rest
}: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={inputClass}
        {...rest}
      />
    </FieldFrame>
  );
}

export function TextArea({
  label,
  hint,
  error,
  rows = 3,
  ...rest
}: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={cx(inputClass, 'resize-y')}
        {...rest}
      />
    </FieldFrame>
  );
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  ...rest
}: FieldShell &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={Boolean(error) || undefined}
        className={inputClass}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

export function Checkbox({
  label,
  ...rest
}: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[13px]">
      <input type="checkbox" className="size-4 accent-brand" {...rest} />
      {label}
    </label>
  );
}

/** Thông báo lỗi Problem: tiêu đề + danh sách `errors[]`. */
export function ProblemAlert({ error }: { error: unknown }) {
  if (!error) return null;
  const errors = error instanceof ApiProblem ? error.errors : [];
  return (
    <div
      role="alert"
      className="mb-3 rounded-md border border-bad-soft bg-bad-soft px-3 py-2 text-[13px] text-bad"
    >
      <p className="font-medium">{messageOf(error)}</p>
      {errors.length > 0 && (
        <ul className="mt-1 list-disc pl-5">
          {errors.map((e, i) => (
            <li key={i}>
              {e.field && (
                <code className="font-mono text-[12px]">{e.field}</code>
              )}{' '}
              {e.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Notice({
  tone = 'brand',
  children,
}: {
  tone?: 'brand' | 'good' | 'warn';
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cx(
        'mb-3 rounded-md border px-3 py-2 text-[13px]',
        TONES[tone],
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-muted">
      {children}
    </p>
  );
}

export function Loading({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <p className="flex items-center gap-2 py-6 text-muted">
      <Spinner label={label} /> {label}
    </p>
  );
}

/** Hộp thoại dùng `<dialog>` gốc: khoá focus và Esc do trình duyệt lo. */
export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal?.();
    if (!open && el.open) el.close?.();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[min(560px,92vw)] rounded-lg border border-line bg-surf p-0 text-ink shadow-xl backdrop:bg-black/30"
    >
      {open && (
        <>
          <header className="border-b border-line-2 px-4 py-3">
            <h2 id={titleId} className="text-[15px] font-semibold">
              {title}
            </h2>
          </header>
          <div className="max-h-[70vh] overflow-auto p-4">{children}</div>
          {footer && (
            <footer className="flex justify-end gap-2 border-t border-line-2 px-4 py-3">
              {footer}
            </footer>
          )}
        </>
      )}
    </dialog>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-0.5 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Thanh tab có vai trò ARIA đúng, đổi bằng phím mũi tên. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: Array<{ id: T; label: ReactNode }>;
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="mb-4 flex flex-wrap gap-1 border-b border-line"
      onKeyDown={(e) => {
        const i = tabs.findIndex((t) => t.id === value);
        if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length].id);
        if (e.key === 'ArrowLeft')
          onChange(tabs[(i - 1 + tabs.length) % tabs.length].id);
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          onClick={() => onChange(t.id)}
          className={cx(
            '-mb-px border-b-2 px-3 py-2 text-[13px] font-medium',
            t.id === value
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-ink',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
