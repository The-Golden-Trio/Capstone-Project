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
import { Link, type LinkProps } from 'react-router-dom';
import { ApiProblem, messageOf } from '../api/client';
import { cx } from '../lib/cx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/** Lớp của nút, dùng chung cho `Button` và `LinkButton`. */
function buttonClass(variant: ButtonVariant, size: 'sm' | 'md') {
  return cx(
    // Nút viên thuốc như landing page: vàng đặc cho việc chính, viền cho việc phụ.
    'inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed',
    size === 'sm' ? 'h-8 px-3.5 text-[12.5px]' : 'h-9 px-5 text-[13px]',
    variant === 'primary' &&
      'border-brand bg-brand font-bold text-bg hover:border-brand-2 hover:bg-brand-2 disabled:border-brand/35 disabled:bg-brand/20 disabled:text-brand-2/60',
    variant === 'secondary' &&
      'border-ink/35 bg-bg/30 text-ink hover:border-brand hover:text-brand-2 disabled:opacity-45',
    variant === 'danger' &&
      'border-bad/70 bg-transparent text-bad hover:bg-bad-soft disabled:opacity-45',
    variant === 'ghost' &&
      'border-transparent bg-transparent text-ink-2 hover:bg-brand-soft hover:text-brand-2 disabled:opacity-45',
  );
}

/** Đường dẫn trông như nút (dẫn sang trang khác, không phải hành động tại chỗ). */
export function LinkButton({
  variant = 'secondary',
  size = 'md',
  className,
  ...rest
}: LinkProps & { variant?: ButtonVariant; size?: 'sm' | 'md' }) {
  return (
    <Link className={cx(buttonClass(variant, size), className)} {...rest} />
  );
}

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
      className={cx(buttonClass(variant, size), className)}
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
        'rounded-[14px] border border-line-gold bg-linear-to-b from-glass to-panel/70 shadow-lift',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line-gold px-5 py-3">
          {title && (
            <h2 className="text-[16px] font-semibold tracking-[0.01em]">
              {title}
            </h2>
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const TONES = {
  neutral: 'bg-line/45 text-ink-2 border-blue/40',
  brand: 'bg-brand-soft text-brand-2 border-brand/35',
  warn: 'bg-warn-soft text-warn border-warn/35',
  good: 'bg-good-soft text-good border-good/35',
  bad: 'bg-bad-soft text-bad border-bad/35',
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
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold tracking-[0.02em] whitespace-nowrap',
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
        className="mb-1.5 block text-[12.5px] font-semibold tracking-[0.02em] text-ink-2"
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

export const inputClass =
  'w-full rounded-[10px] border border-blue/45 bg-inset/85 px-3 py-2 text-ink transition-colors placeholder:text-blue hover:border-blue focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 aria-[invalid=true]:border-bad';

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
      className="mb-3 rounded-xl border border-bad/35 bg-bad-soft px-4 py-2.5 text-[13px] text-bad"
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
        'mb-3 rounded-xl border px-4 py-2.5 text-[13px]',
        TONES[tone],
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[14px] border border-dashed border-blue/45 bg-bg/35 px-4 py-7 text-center text-muted">
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
      className="m-auto w-[min(560px,92vw)] rounded-2xl border border-line-gold bg-surf p-0 text-ink shadow-lift backdrop:bg-bg/75 backdrop:backdrop-blur-[3px]"
    >
      {open && (
        <>
          <header className="border-b border-line-gold px-5 py-3.5">
            <h2 id={titleId} className="text-[17px] font-semibold">
              {title}
            </h2>
          </header>
          <div className="max-h-[70vh] overflow-auto p-5">{children}</div>
          {footer && (
            <footer className="flex justify-end gap-2 border-t border-line-gold px-5 py-3">
              {footer}
            </footer>
          )}
        </>
      )}
    </dialog>
  );
}

/** Khung màn đăng nhập, quên mật khẩu: cùng bầu trời sao với app người chơi. */
export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <div className="starfield" aria-hidden="true" />
      <div className="relative z-1 w-full max-w-[420px] rounded-[14px] border border-line-gold bg-bg/60 px-8 py-9 shadow-lift backdrop-blur-[6px] max-[480px]:px-5">
        <div className="mb-6 text-center">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt=""
            width={72}
            height={72}
            className="mx-auto mb-4 size-[72px] drop-shadow-[0_6px_22px_rgba(212,176,106,.3)]"
          />
          <p className="kicker mb-2">JobQuest · Staff</p>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.01em]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}

export function PageHeader({
  title,
  kicker,
  subtitle,
  actions,
}: {
  title: ReactNode;
  /** Dòng nhãn nhỏ in hoa đứng trên tiêu đề. */
  kicker?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {kicker && <p className="kicker mb-1.5">{kicker}</p>}
        <h1 className="text-[clamp(22px,2.6vw,28px)] leading-tight font-medium tracking-[-0.01em] text-balance">
          {title}
        </h1>
        {/* Đường kẻ có ngôi sao: dấu ngắt của bảng Celestial Night. */}
        <div
          className="my-2.5 flex items-center gap-2 text-brand"
          aria-hidden="true"
        >
          <span className="h-px w-9 bg-brand/60" />
          <span className="text-[9px] leading-none">✦</span>
          <span className="h-px w-28 bg-linear-to-r from-brand/60 to-transparent" />
        </div>
        {subtitle && <p className="max-w-[70ch] text-muted">{subtitle}</p>}
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
      className="mb-5 flex flex-wrap gap-2 border-b border-line-gold"
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
            '-mb-px border-b-2 px-2.5 py-2.5 text-[11.5px] font-semibold tracking-[0.1em] uppercase transition-colors',
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
