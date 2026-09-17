import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type ButtonVariant = 'default' | 'primary' | 'highlight';
export type ButtonSize = 'md' | 'sm';

const VARIANT: Record<ButtonVariant, string> = {
  default:
    'border-line bg-inset text-ink-2 hover:not-disabled:border-gold hover:not-disabled:text-ink',
  primary:
    'border-gold bg-gold text-bg font-semibold hover:not-disabled:brightness-110',
  highlight: 'border-gold bg-gold-soft text-gold-2',
};

const SIZE: Record<ButtonSize, string> = {
  md: 'px-[15px] py-[9px] text-[13px]',
  sm: 'px-[11px] py-[6px] text-[11.5px]',
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
        'rounded-[7px] border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
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
