import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/cn';

const control =
  'w-full rounded-md border bg-night-950/55 text-ink placeholder:text-night-300 transition-[border-color,box-shadow,background] duration-150 focus:outline-none focus:border-gold-400/80 focus:shadow-[0_0_0_3px_rgb(212_176_106/0.18)] focus:bg-night-950/80 disabled:cursor-not-allowed disabled:opacity-50';

const states = {
  ok: 'border-line-strong hover:border-night-300/60',
  error: 'border-danger/70',
};

/**
 * Nhãn, gợi ý và lỗi cho một ô nhập. Tự nối `id`, `aria-describedby`,
 * `aria-invalid` vào phần tử con đầu tiên.
 */
export function Field({
  label,
  hint,
  error,
  required,
  optional,
  children,
  className,
  counter,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Ghi "(không bắt buộc)" cạnh nhãn. */
  optional?: boolean;
  children: ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    invalid?: boolean;
  }>;
  className?: string;
  /** Bộ đếm ký tự bên phải gợi ý, ví dụ "120/500". */
  counter?: ReactNode;
}) {
  const autoId = useId();
  const id = children.props.id ?? autoId;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [children.props['aria-describedby'], errorId, hintId]
      .filter(Boolean)
      .join(' ') || undefined;
  const child = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        ...(typeof children.type === 'string'
          ? {}
          : { invalid: Boolean(error) }),
      })
    : children;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-muted">
        {label}
        {required && (
          <span className="ml-0.5 text-gold-400" aria-hidden>
            *
          </span>
        )}
        {optional && (
          <span className="ml-1.5 font-normal text-night-300">
            (không bắt buộc)
          </span>
        )}
      </label>
      {child}
      {(hint || error || counter) && (
        <div className="flex items-start justify-between gap-3 text-xs">
          <div className="min-w-0">
            {error ? (
              <p id={errorId} className="text-danger" role="alert">
                {error}
              </p>
            ) : (
              hint && (
                <p id={hintId} className="text-ink-faint">
                  {hint}
                </p>
              )
            )}
          </div>
          {counter && (
            <span className="tabular shrink-0 text-night-300">{counter}</span>
          )}
        </div>
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  invalid,
  leftIcon,
  className,
  ref,
  ...rest
}: InputProps) {
  if (leftIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-night-300">
          {leftIcon}
        </span>
        <input
          ref={ref}
          className={cn(
            control,
            invalid ? states.error : states.ok,
            'h-11 pl-10 pr-3 text-[15px]',
            className,
          )}
          {...rest}
        />
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(
        control,
        invalid ? states.error : states.ok,
        'h-11 px-3 text-[15px]',
        className,
      )}
      {...rest}
    />
  );
}

/** Ô mật khẩu có nút hiện/ẩn. */
export function PasswordInput(props: Omit<InputProps, 'type'>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={shown ? 'text' : 'password'} className="pr-11" />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded text-night-300 hover:text-ink focus-visible:outline-none focus-visible:shadow-focus"
      >
        {shown ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ invalid, className, ref, ...rest }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        control,
        invalid ? states.error : states.ok,
        'min-h-24 resize-y px-3 py-2.5 text-[15px] leading-relaxed',
        className,
      )}
      {...rest}
    />
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  invalid,
  className,
  children,
  ref,
  ...rest
}: SelectProps) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          control,
          invalid ? states.error : states.ok,
          'h-11 appearance-none pl-3 pr-9 text-[15px]',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-night-300"
      />
    </div>
  );
}

/** Ô đánh dấu có nhãn và mô tả. */
export function Checkbox({
  label,
  description,
  className,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-start gap-3 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer mt-0.5 size-[18px] shrink-0 cursor-pointer appearance-none rounded border border-line-strong bg-night-950/60 transition-colors checked:border-gold-400 checked:bg-gold-500 focus-visible:outline-none focus-visible:shadow-focus"
        {...rest}
      />
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none -ml-[30px] mt-[3px] size-3 shrink-0 translate-x-[3px] text-night-900 opacity-0 peer-checked:opacity-100"
      >
        <path
          d="M3 8.5 6.5 12 13 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="ml-1.5 flex flex-col">
        <span className="text-ink">{label}</span>
        {description && (
          <span className="text-xs text-ink-faint">{description}</span>
        )}
      </span>
    </label>
  );
}

/** Công tắc bật tắt. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="flex flex-col text-sm">
        <span className="text-ink">{label}</span>
        {description && (
          <span className="text-xs text-ink-faint">{description}</span>
        )}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50',
          checked
            ? 'border-gold-400 bg-gold-600'
            : 'border-line-strong bg-night-800',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-0.5 size-[18px] rounded-full bg-night-50 shadow transition-[left] duration-200',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}

/** Nhóm lựa chọn một (radio) dạng thẻ: dùng cho câu hỏi có vài phương án. */
export function RadioCards<K extends string>({
  name,
  options,
  value,
  onChange,
  label,
  columns = 1,
  className,
}: {
  name: string;
  options: Array<{
    key: K;
    label: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
  }>;
  value: K | null;
  onChange: (key: K) => void;
  label: string;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'grid gap-2',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-3',
        className,
      )}
    >
      {options.map((o) => {
        const active = value === o.key;
        return (
          <label
            key={o.key}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors has-focus-visible:shadow-focus',
              active
                ? 'border-gold-400/80 bg-gold-900/35 shadow-[0_0_20px_-8px_rgb(240_215_154/0.6)]'
                : 'border-line bg-night-800/40 hover:border-line-strong hover:bg-night-700/40',
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.key}
              checked={active}
              onChange={() => onChange(o.key)}
              className="sr-only"
            />
            {o.icon && <span className="mt-0.5 text-gold-300">{o.icon}</span>}
            <span className="flex min-w-0 flex-col">
              <span
                className={cn(
                  'text-sm font-semibold',
                  active ? 'text-gold-100' : 'text-ink',
                )}
              >
                {o.label}
              </span>
              {o.description && (
                <span className="mt-0.5 text-xs text-ink-faint">
                  {o.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
