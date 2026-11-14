import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type ButtonVariant = 'default' | 'primary' | 'highlight';
export type ButtonSize = 'md' | 'sm';

const VARIANT: Record<ButtonVariant, string> = {
  default:
    'border-ink/35 bg-bg/30 text-ink hover:not-disabled:border-gold hover:not-disabled:text-gold-2 disabled:opacity-45',
  primary:
    'border-gold bg-gold font-bold text-bg hover:not-disabled:border-gold-2 hover:not-disabled:bg-gold-2 disabled:border-gold/35 disabled:bg-gold/20 disabled:text-gold-2/60',
  highlight:
    'border-transparent bg-gold/15 text-gold-2 hover:not-disabled:bg-gold/25 disabled:opacity-45',
};

const SIZE: Record<ButtonSize, string> = {
  md: 'px-5 py-[9px] text-[13px]',
  sm: 'px-3.5 py-[6px] text-[11.5px]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        // Nút viên thuốc như landing page: vàng đặc cho việc chính, viền cho việc phụ.
        'rounded-full border-[1.5px] font-semibold tracking-[0.02em] transition-[color,background-color,border-color,transform] hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
