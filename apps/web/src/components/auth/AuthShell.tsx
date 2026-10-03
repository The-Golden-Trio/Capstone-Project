import type { ReactNode } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Logo } from '../layout/Logo';
import { StarField } from '../layout/StarField';
import { SectionLabel } from '../ui/Note';
import { LanguageToggle } from '../layout/LanguageToggle';

/** Khung chung của các màn đăng nhập, đăng ký, đồng ý — cùng một bầu trời sao. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <StarField />
      <div className="absolute right-5 top-5 z-2">
        <LanguageToggle />
      </div>
      <div className="relative z-1 grid min-h-screen place-items-center p-6">
        <Card className="w-full max-w-[420px]">
          <CardBody className="p-[30px]">
            <div className="mb-[22px] text-center">
              <Logo className="mx-auto mb-3.5 h-[72px] w-[72px] drop-shadow-[0_6px_22px_rgba(212,176,106,.3)]" />
              <SectionLabel className="text-center">
                {subtitle ?? 'Mô phỏng nghề IT'}
              </SectionLabel>
              <h1 className="font-display text-[26px] font-semibold">{title}</h1>
            </div>
            {children}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

/** Ô nhập dùng chung cho các biểu mẫu xác thực. */
export function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  const id = `field-${props.name ?? label}`;
  return (
    <label htmlFor={id} className="mb-3 block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.11em] text-muted">
        {label}
      </span>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className="w-full rounded-lg border-[1.5px] border-line bg-inset px-3.5 py-3 text-[14px] text-ink focus:border-gold focus:outline-none aria-invalid:border-signal"
        {...props}
      />
      {error && (
        <span className="mt-1 block text-[12px] text-signal">{error}</span>
      )}
    </label>
  );
}
