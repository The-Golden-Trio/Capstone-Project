import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../lib/cn';
import { OrbitSpinner } from './Spinner';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-[0.01em] transition-[background,box-shadow,color,transform,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-45 active:translate-y-px';

const variants: Record<ButtonVariant, string> = {
  // Vàng sao: một hành động chính mỗi màn.
  primary:
    'text-night-900 bg-[linear-gradient(180deg,#f6e6bf_0%,#e2c47e_38%,#d4b06a_62%,#b08f4c_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.55),inset_0_-1px_0_rgb(61_48_20/0.35),0_6px_20px_-8px_rgb(212_176_106/0.7)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.6),inset_0_-1px_0_rgb(61_48_20/0.35),0_0_0_1px_rgb(240_215_154/0.5),0_8px_28px_-6px_rgb(240_215_154/0.75)] hover:brightness-105',
  // Kính đêm viền vàng mảnh.
  secondary:
    'text-gold-200 border border-line-gold bg-night-800/60 hover:bg-night-700/80 hover:border-gold-400/70 hover:text-gold-100 shadow-[inset_0_1px_0_rgb(248_246_238/0.06)]',
  ghost:
    'text-ink-muted hover:text-ink hover:bg-night-700/50 border border-transparent',
  subtle:
    'text-ink border border-line bg-night-800/40 hover:bg-night-700/60 hover:border-line-strong',
  danger:
    'text-danger border border-danger/45 bg-danger-deep/40 hover:bg-danger-deep/70 hover:border-danger/80',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-md px-3 text-[13px]',
  md: 'h-10 rounded-md px-4 text-sm',
  lg: 'h-12 rounded-lg px-6 text-[15px]',
};

/** Class của nút, để dùng cho thẻ khác (ví dụ `<Link>` của router). */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], block && 'w-full', className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  /** Chữ thay cho nhãn khi đang gửi, ví dụ "Đang lưu…". */
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <OrbitSpinner size={size === 'lg' ? 18 : 15} label={null} />
      ) : (
        leftIcon
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
      {!loading && rightIcon}
    </button>
  );
}

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** Bắt buộc: nút chỉ có icon phải có tên đọc được. */
  label: string;
  icon: ReactNode;
  variant?: 'ghost' | 'subtle' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  ref?: Ref<HTMLButtonElement>;
}

const iconSizes = { sm: 'size-8', md: 'size-10', lg: 'size-12' };

export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        base,
        variants[variant],
        iconSizes[size],
        'rounded-full p-0',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
