import { useState, type ComponentProps, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo, NightCard, NightSky, ToonInput } from '@datn/ui';

/** Thẻ giấy giữa trời đêm, cùng một form cho mọi khổ màn hình. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="theme-toon-night relative isolate grid min-h-dvh place-items-center px-4 py-10 sm:px-8">
      <NightSky scene="plain" seed="auth" />
      <main className="relative w-full max-w-md">
        <Link
          to="/"
          className="mx-auto mb-8 flex w-fit rounded-lg"
          aria-label="Về trang giới thiệu JobQuest"
        >
          <Logo size="lg" />
        </Link>
        <NightCard tape>
          <h1 className="font-toon text-3xl font-extrabold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-toon-ink-soft">{subtitle}</p>
          )}
          <div className="mt-7">{children}</div>
          {footer && (
            <div className="mt-7 border-t-2 border-dashed border-toon-ink/30 pt-5 text-center text-sm text-toon-ink-soft">
              {footer}
            </div>
          )}
        </NightCard>
      </main>
    </div>
  );
}

/** Giữ khả năng hiện/ẩn mật khẩu và định danh Field khi thay giao diện. */
export function AuthPassword({
  id,
  ...props
}: Omit<ComponentProps<typeof ToonInput>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1">
      <ToonInput {...props} id={id} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        aria-controls={id}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
        className="ml-auto flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-toon-ink-soft focus-visible:shadow-toon-focus"
      >
        {visible ? (
          <EyeOff size={15} aria-hidden />
        ) : (
          <Eye size={15} aria-hidden />
        )}
        {visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      </button>
    </div>
  );
}

export function AuthNotice({
  tone = 'success',
  title,
  children,
}: {
  tone?: 'danger' | 'warning' | 'success';
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`rounded-xl border-[3px] border-toon-ink p-4 text-sm text-toon-ink ${tone === 'danger' ? 'bg-toon-coral-light' : tone === 'warning' ? 'bg-toon-star-soft' : 'bg-toon-mint'}`}
    >
      {title && <p className="font-toon text-lg font-bold">{title}</p>}
      {children && <div className={title ? 'mt-1' : undefined}>{children}</div>}
    </div>
  );
}
