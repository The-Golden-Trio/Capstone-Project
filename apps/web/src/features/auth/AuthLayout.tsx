import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo, Moon, Mountains, Sparkle, StarField } from '@datn/ui';

/**
 * Khung màn đăng nhập, đăng ký: bên trái là bầu trời có câu dẫn (ẩn trên
 * điện thoại), bên phải là form trên mặt kính.
 */
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
    <div className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <StarField fixed seed="auth" />
      <aside className="relative hidden overflow-hidden border-r border-line/60 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link
          to="/"
          className="w-fit rounded-md"
          aria-label="Về trang giới thiệu JobQuest"
        >
          <Logo size="md" />
        </Link>
        <Moon size={84} className="absolute right-16 top-24 animate-float" />
        <figure className="relative z-10 max-w-md pb-40">
          <Sparkle size={22} className="mb-5 text-gold-300" />
          <blockquote className="font-display text-3xl leading-snug text-ink">
            Làm thử một ca, rồi tự cảm nhận nghề đó có phải của mình không.
          </blockquote>
          <figcaption className="mt-4 text-sm text-ink-faint">
            Không trắc nghiệm tính cách, không ai chấm bạn là người thế nào. Chỉ
            có việc thật của nghề.
          </figcaption>
        </figure>
        <Mountains className="absolute inset-x-0 bottom-0 h-56" />
      </aside>

      <main className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-rise">
          <Link
            to="/"
            className="mb-8 inline-flex rounded-md lg:hidden"
            aria-label="Về trang giới thiệu JobQuest"
          >
            <Logo size="sm" />
          </Link>
          <h1 className="text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && (
            <div className="mt-8 text-center text-sm text-ink-muted">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
