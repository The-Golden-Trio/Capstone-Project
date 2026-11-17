/** Các composition riêng của staff; primitive từ @datn/ui. */
import {
  Callout,
  Field,
  Input,
  Textarea,
  Select,
  Panel,
  PanelHeader,
  LogoMark,
  buttonClasses,
  type ButtonVariant,
  type ButtonSize,
} from '@datn/ui';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { Link, type LinkProps } from 'react-router-dom';

import { ApiProblem, messageOf } from '../api/client';

/** Đường dẫn của router dùng lớp nút chia sẻ. */
export function LinkButton({
  variant = 'subtle',
  size = 'md',
  className,
  ...rest
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...rest} />
  );
}

/** Khung dữ liệu staff có tiêu đề và nhóm thao tác. */
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
    <Panel variant="solid" className={className}>
      {(title || actions) && (
        <PanelHeader
          title={title}
          action={actions}
          className="border-b border-line pb-3 [&_h2]:font-sans [&_h2]:text-base"
        />
      )}
      {children}
    </Panel>
  );
}

type FieldShell = { label: ReactNode; hint?: ReactNode; error?: string };
export function TextField({
  label,
  hint,
  error,
  ...props
}: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} error={error} className="mb-3">
      <Input {...props} />
    </Field>
  );
}
export function TextArea({
  label,
  hint,
  error,
  rows = 3,
  ...props
}: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} error={error} className="mb-3">
      <Textarea rows={rows} {...props} />
    </Field>
  );
}
export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  ...props
}: FieldShell &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) {
  return (
    <Field label={label} hint={hint} error={error} className="mb-3">
      <Select {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/** Chi tiết lỗi từ backend, giữ nguyên field và reason của hợp đồng. */
export function ProblemAlert({ error }: { error: unknown }) {
  if (!error) return null;
  const errors = error instanceof ApiProblem ? error.errors : [];
  return (
    <div role="alert" className="mb-3">
      <Callout tone="danger" title={messageOf(error)}>
        {errors.length > 0 && (
          <ul className="list-disc pl-5">
            {errors.map((e, i) => (
              <li key={i}>
                {e.field && <code>{e.field}</code>} {e.reason}
              </li>
            ))}
          </ul>
        )}
      </Callout>
    </div>
  );
}
export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'warning';
  children: ReactNode;
}) {
  return (
    <div role="status" className="mb-3">
      <Callout tone={tone}>{children}</Callout>
    </div>
  );
}

export function AuthFrame({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <div className="relative z-1 w-full max-w-[420px] rounded-[14px] border border-line-gold bg-night-900/60 px-8 py-9 shadow-lift backdrop-blur-[6px] max-[480px]:px-5">
        <div className="mb-6 text-center">
          <LogoMark size={64} className="mx-auto mb-4" />
          <p className="eyebrow mb-2">JobQuest · Staff</p>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.01em]">
            {title}
          </h1>
          {description && <p className="mt-2 text-ink-faint">{description}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
