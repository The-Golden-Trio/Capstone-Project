import {
  cloneElement,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import type { Field, InputProps, TextareaProps } from '../components/Field';
import type { TabItem } from '../components/Tabs';
import { cn } from '../lib/cn';

export type ToonButtonVariant =
  'primary' | 'secondary' | 'danger' | 'ghost' | 'mint';
export type ToonButtonSize = 'sm' | 'md' | 'lg';
export type ToonTone =
  'paper' | 'mustard' | 'mint' | 'coral' | 'sky' | 'maroon' | 'olive';

const buttonBase =
  'relative inline-flex select-none items-center justify-center gap-2 font-toon font-bold leading-tight transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus disabled:pointer-events-none disabled:translate-y-0 disabled:bg-toon-shade disabled:text-toon-ink-faint disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:translate-y-0 disabled:active:shadow-none disabled:hover:no-underline motion-reduce:transform-none motion-reduce:transition-none';
const buttonVariants: Record<ToonButtonVariant, string> = {
  primary: 'bg-toon-mustard text-toon-ink',
  secondary: 'bg-toon-paper text-toon-ink',
  danger: 'bg-toon-coral text-toon-ink',
  mint: 'bg-toon-mint text-toon-ink',
  ghost:
    'border-0 bg-transparent text-toon-ink shadow-none hover:underline underline-offset-4',
};
const buttonFrame =
  'border-[3px] border-toon-ink shadow-toon motion-safe:hover:-translate-y-px hover:shadow-toon-lg motion-safe:active:translate-y-[3px] active:shadow-toon-press';
const buttonSizes: Record<ToonButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1 text-sm',
  md: 'min-h-11 px-4 py-2 text-base',
  lg: 'min-h-13 px-6 py-2.5 text-lg',
};

/** Dùng cùng kiểu nút cho Link mà không cần bọc thêm button. */
export function toonButtonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: {
  variant?: ToonButtonVariant;
  size?: ToonButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return cn(
    buttonBase,
    'rounded-[14px] whitespace-nowrap',
    variant !== 'ghost' && buttonFrame,
    buttonVariants[variant],
    buttonSizes[size],
    block && 'w-full',
    className,
  );
}

export interface ToonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ToonButtonVariant;
  size?: ToonButtonSize;
  block?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function ToonButton({
  variant,
  size,
  block,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  type = 'button',
  ref,
  ...rest
}: ToonButtonProps) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={toonButtonClasses({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || rest['aria-busy']}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 shrink-0 animate-spin rounded-full border-[3px] border-toon-ink border-t-transparent motion-reduce:animate-none"
        />
      ) : leftIcon ? (
        <span aria-hidden className="inline-flex shrink-0">
          {leftIcon}
        </span>
      ) : null}
      <span>{loading && loadingText ? loadingText : children}</span>
      {!loading && rightIcon && (
        <span aria-hidden className="inline-flex shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
}

export interface ToonIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  label: string;
  icon: ReactNode;
  variant?: ToonButtonVariant;
  size?: ToonButtonSize;
  ref?: Ref<HTMLButtonElement>;
}

export function ToonIconButton({
  label,
  icon,
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ref,
  ...rest
}: ToonIconButtonProps) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        buttonBase,
        'shrink-0 rounded-[14px]',
        variant !== 'ghost' && buttonFrame,
        buttonVariants[variant],
        { sm: 'size-9', md: 'size-11', lg: 'size-13' }[size],
        className,
      )}
    >
      <span aria-hidden className="inline-flex">
        {icon}
      </span>
    </button>
  );
}

const inputBase =
  'w-full rounded-[12px] border-[3px] bg-toon-paper font-toon-body text-[15px] text-toon-ink placeholder:text-toon-ink-faint focus:outline-none focus-visible:shadow-toon-focus disabled:cursor-not-allowed disabled:bg-toon-shade disabled:text-toon-ink-faint';

export function ToonInput({
  invalid,
  leftIcon,
  compact = false,
  className,
  ref,
  ...rest
}: InputProps & {
  /** Cao 40px thay vì 44px (ô tìm trong cột hẹp). */
  compact?: boolean;
}) {
  const input = (
    <input
      {...rest}
      ref={ref}
      aria-invalid={invalid || rest['aria-invalid']}
      className={cn(
        inputBase,
        compact ? 'h-10 py-1.5 pr-3 text-sm' : 'h-11 py-2 pr-3',
        leftIcon ? 'pl-10' : 'pl-3',
        invalid ? 'border-toon-coral' : 'border-toon-ink',
        className,
      )}
    />
  );
  return leftIcon ? (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 inline-flex -translate-y-1/2 text-toon-ink-soft"
      >
        {leftIcon}
      </span>
      {input}
    </div>
  ) : (
    input
  );
}

export function ToonTextarea({
  invalid,
  size = 'md',
  resizable = true,
  className,
  ref,
  ...rest
}: TextareaProps & {
  /** Chiều cao tối thiểu: `sm` ~2 dòng (ô trả lời), `md` ~3 dòng. */
  size?: 'sm' | 'md';
  resizable?: boolean;
}) {
  return (
    <textarea
      {...rest}
      ref={ref}
      aria-invalid={invalid || rest['aria-invalid']}
      className={cn(
        inputBase,
        size === 'sm' ? 'min-h-14' : 'min-h-24',
        resizable ? 'resize-y' : 'resize-none',
        'px-3 py-2.5 leading-relaxed',
        invalid ? 'border-toon-coral' : 'border-toon-ink',
        className,
      )}
    />
  );
}

export type ToonFieldProps = Parameters<typeof Field>[0];

/** Nối nhãn và mô tả, giữ nguyên các định danh caller đã cung cấp. */
export function ToonField({
  label,
  hint,
  error,
  required,
  optional,
  counter,
  children,
  className,
}: ToonFieldProps) {
  const autoId = useId();
  const id = children.props.id ?? autoId;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [children.props['aria-describedby'], errorId, hintId]
      .filter(Boolean)
      .join(' ') || undefined;
  const child = cloneElement(children, {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : children.props['aria-invalid'],
    ...(typeof children.type === 'string'
      ? {}
      : { invalid: Boolean(error) || children.props.invalid }),
  });
  return (
    <div
      className={cn('flex min-w-0 flex-col gap-1.5 font-toon-body', className)}
    >
      <label
        htmlFor={id}
        className="font-toon text-base font-bold text-toon-ink"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-toon-coral">
            *
          </span>
        )}
        {optional && (
          <span className="ml-1.5 font-toon-body text-xs font-normal text-toon-ink-soft">
            (không bắt buộc)
          </span>
        )}
      </label>
      {child}
      {(hint || error || counter) && (
        <div className="flex items-start justify-between gap-3 text-xs">
          <div className="min-w-0">
            {error ? (
              <p
                id={errorId}
                role="alert"
                className="font-bold text-toon-maroon"
              >
                {error}
              </p>
            ) : hint ? (
              <p id={hintId} className="text-toon-ink-soft">
                {hint}
              </p>
            ) : null}
          </div>
          {counter && (
            <span className="shrink-0 tabular-nums text-toon-ink-soft">
              {counter}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export interface ToonCheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: ReactNode;
  description?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function ToonCheckbox({
  label,
  description,
  className,
  ref,
  ...rest
}: ToonCheckboxProps) {
  const id = useId();
  const describedBy =
    [rest['aria-describedby'], description ? `${id}-description` : undefined]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <label
      className={cn(
        'flex min-h-11 cursor-pointer items-start gap-3 py-2 font-toon-body text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <span className="relative mt-0.5 size-[22px] shrink-0">
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          aria-labelledby={
            rest['aria-labelledby'] ??
            (rest['aria-label'] ? undefined : `${id}-label`)
          }
          aria-describedby={describedBy}
          className="peer block size-full cursor-pointer appearance-none rounded-[6px] border-[3px] border-toon-ink bg-toon-paper checked:bg-toon-mustard focus-visible:outline-none focus-visible:shadow-toon-focus disabled:cursor-not-allowed disabled:bg-toon-shade"
        />
        <svg
          aria-hidden
          viewBox="0 0 22 22"
          className="pointer-events-none absolute inset-0 size-full text-toon-ink opacity-0 peer-checked:opacity-100"
        >
          <path
            d="m5 11 4 4.5L17 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col">
        <span id={`${id}-label`} className="font-bold text-toon-ink">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="text-xs text-toon-ink-soft">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

const tones: Record<ToonTone, string> = {
  paper: 'bg-toon-paper text-toon-ink',
  mustard: 'bg-toon-mustard text-toon-ink',
  mint: 'bg-toon-mint text-toon-ink',
  coral: 'bg-toon-coral text-toon-ink',
  sky: 'bg-toon-sky text-toon-ink',
  maroon: 'bg-toon-maroon text-toon-paper',
  olive: 'bg-toon-olive-deep text-toon-paper',
};

export function ToonBadge({
  tone = 'paper',
  icon,
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: ToonTone; icon?: ReactNode }) {
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex min-h-6 items-center gap-1 rounded-full border-2 border-toon-ink px-2.5 py-0.5 font-toon-body text-xs font-bold shadow-toon-sm',
        tones[tone],
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="inline-flex shrink-0">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

export interface ToonTabsProps<K extends string = string> {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  idBase?: string;
  /** `quiet`: tab không chọn không viền, không nền — chỉ tab đang chọn nổi. */
  variant?: 'underline' | 'pill' | 'quiet';
  className?: string;
}

/** Thẻ giấy xuống dòng được; bàn phím vẫn đi theo thứ tự tab trong DOM. */
export function ToonTabs<K extends string>({
  items,
  value,
  onChange,
  label,
  idBase,
  variant = 'pill',
  className,
}: ToonTabsProps<K>) {
  const quiet = variant === 'quiet';
  const autoId = useId();
  const base = idBase ?? autoId;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <div
      role="tablist"
      aria-label={label}
      data-variant={variant}
      className={cn('flex flex-wrap gap-3 p-1', className)}
    >
      {items.map((item, index) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${item.key}`}
            aria-controls={`${base}-panel-${item.key}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => {
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % items.length
                  : event.key === 'ArrowLeft'
                    ? (index - 1 + items.length) % items.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? items.length - 1
                        : null;
              if (next === null) return;
              event.preventDefault();
              onChange(items[next].key);
              refs.current[next]?.focus();
            }}
            className={cn(
              'inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-full border-[3px] px-4 py-1.5 font-toon text-base font-bold focus-visible:outline-none focus-visible:shadow-toon-focus',
              active
                ? 'border-toon-ink bg-toon-mustard text-toon-ink shadow-toon'
                : quiet
                  ? 'border-transparent bg-transparent text-toon-ink-soft hover:bg-toon-sand/70 hover:text-toon-ink'
                  : 'border-toon-ink bg-toon-paper text-toon-ink hover:bg-toon-sand',
            )}
          >
            {item.icon && (
              <span aria-hidden className="inline-flex shrink-0">
                {item.icon}
              </span>
            )}
            <span className="min-w-0 break-words">{item.label}</span>
            {item.count !== undefined &&
              (quiet && !active ? (
                <span className="font-toon-body text-xs tabular-nums">
                  {item.count}
                </span>
              ) : (
                <span className="inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full border-2 border-toon-ink bg-toon-paper px-1 font-toon-body text-xs tabular-nums">
                  {item.count}
                </span>
              ))}
          </button>
        );
      })}
    </div>
  );
}

export function ToonTabPanel({
  idBase,
  tabKey,
  active,
  children,
  className,
}: {
  idBase: string;
  tabKey: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${tabKey}`}
      aria-labelledby={`${idBase}-tab-${tabKey}`}
      tabIndex={0}
      className={cn(
        'font-toon-body text-toon-ink focus-visible:outline-none focus-visible:shadow-toon-focus',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Giá trị ngoài khoảng và số không hữu hạn không được làm hỏng thanh tiến độ. */
export function ToonProgress({
  value,
  max = 100,
  tone = 'mustard',
  label,
  labelHidden = false,
  showValue = false,
  valueText,
  className,
}: {
  value: number;
  max?: number;
  tone?: ToonTone;
  label?: string;
  /** Nhãn chỉ dành cho trình đọc màn hình (khi tiêu đề đã nằm ngay trên). */
  labelHidden?: boolean;
  showValue?: boolean;
  /** Chữ thay cho "giá trị/tối đa" (vd "40%" tỷ trọng, "3 bậc"); cũng là aria-valuetext. */
  valueText?: string;
  className?: string;
}) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const current = Number.isFinite(value)
    ? Math.max(0, Math.min(limit, value))
    : 0;
  return (
    <div
      className={cn('min-w-0 font-toon-body text-sm text-toon-ink', className)}
    >
      {((label && !labelHidden) || showValue) && (
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 font-bold">
          {label && !labelHidden && <span>{label}</span>}
          {showValue && (
            <span className="tabular-nums">
              {valueText ??
                `${current.toLocaleString('vi-VN')}/${limit.toLocaleString('vi-VN')}`}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label ?? 'Tiến độ'}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={current}
        aria-valuetext={valueText}
        className="h-5 overflow-hidden rounded-full border-[3px] border-toon-ink bg-toon-sand"
      >
        <div
          className={cn('h-full rounded-full', tones[tone])}
          style={{
            width: `${(current / limit) * 100}%`,
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent 0, transparent 7px, rgb(30 27 24 / 0.09) 7px, rgb(30 27 24 / 0.09) 11px)',
          }}
        />
      </div>
    </div>
  );
}
