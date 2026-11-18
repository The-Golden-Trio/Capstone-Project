import {
  useState,
  type ComponentProps,
  type DetailsHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import {
  InkStar,
  NightSky,
  StatTile,
  ToonInput,
  ToonIconButton,
  cn,
} from '@datn/ui';

export { NightCard as PaperCard } from '@datn/ui';

/** Khung dùng chung cho các màn riêng tư, không đổi nguồn dữ liệu hay route. */
export function ProfileCanvas({
  children,
  narrow = false,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="theme-toon-night relative isolate min-w-0 overflow-hidden">
      <NightSky scene="profile" seed="player-record" />
      <div
        className={cn(
          'relative mx-auto space-y-6 px-4 py-8 sm:px-6 sm:py-12',
          narrow ? 'max-w-3xl' : 'max-w-6xl',
        )}
      >
        {children}
      </div>
    </div>
  );
}
export function CardHeading({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-toon text-2xl font-extrabold leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-toon-ink-soft">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
export function FormHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="max-w-xl">
      <p className="font-toon text-sm font-bold uppercase tracking-wider text-toon-star">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-toon text-4xl font-extrabold leading-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-toon-paper">{description}</p>
    </header>
  );
}
export function Notice({
  tone = 'info',
  className,
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'gold' | 'ai';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-2 rounded-xl border-2 border-toon-ink p-3 text-sm text-toon-ink',
        tone === 'danger'
          ? 'bg-toon-coral-light'
          : tone === 'warning' || tone === 'gold'
            ? 'bg-toon-star-soft'
            : tone === 'success'
              ? 'bg-toon-mint'
              : 'bg-toon-sky',
        className,
      )}
    >
      <Info
        size={17}
        strokeWidth={2.5}
        className="mt-0.5 shrink-0"
        aria-hidden
      />
      <div className="min-w-0">
        {tone === 'ai' && (
          <span className="mb-1 block font-toon text-xs font-extrabold">
            AI
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
export function EmptyMessage({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-toon-ink bg-toon-paper px-4 py-6 text-center text-toon-ink',
        className,
      )}
    >
      <InkStar size={42} />
      <h3 className="font-toon text-xl font-bold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-toon-ink-soft">{description}</p>
      )}
      {action && <div className="mt-2 max-w-full">{action}</div>}
    </div>
  );
}
export function Foldout({
  title,
  children,
  ...rest
}: DetailsHTMLAttributes<HTMLDetailsElement> & { title: string }) {
  return (
    <details
      {...rest}
      className={cn(
        'rounded-xl border-2 border-toon-ink bg-toon-cream p-3 open:pb-4',
        rest.className,
      )}
    >
      <summary className="cursor-pointer font-toon font-bold text-toon-ink focus-visible:shadow-toon-focus">
        {title}
      </summary>
      <div className="mt-3 min-w-0 text-toon-ink">{children}</div>
    </details>
  );
}
export function ReadMore({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  return words.length <= 35 ? (
    <p>{text}</p>
  ) : (
    <div>
      <p>{words.slice(0, 35).join(' ')}…</p>
      <details className="mt-2">
        <summary className="cursor-pointer font-bold underline underline-offset-4">
          Xem thêm
        </summary>
        <p className="mt-2">{words.slice(35).join(' ')}</p>
      </details>
    </div>
  );
}
export function ToonSelect({
  invalid,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...props}
      aria-invalid={invalid || props['aria-invalid']}
      className={cn(
        'min-h-11 w-full rounded-xl border-[3px] border-toon-ink bg-toon-paper px-3 py-2 font-toon-body text-sm text-toon-ink focus-visible:shadow-toon-focus',
        className,
      )}
    />
  );
}
export function ToonPassword(
  props: Omit<ComponentProps<typeof ToonInput>, 'type'>,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <ToonInput
        {...props}
        type={visible ? 'text' : 'password'}
        style={{ ...props.style, paddingRight: '3.5rem' }}
      />
      <div className="absolute right-1.5 top-1.5">
        <ToonIconButton
          size="sm"
          variant="ghost"
          label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          icon={visible ? <EyeOff size={18} /> : <Eye size={18} />}
          onClick={() => setVisible((v) => !v)}
        />
      </div>
    </div>
  );
}
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <StatTile
        label={label}
        value={value}
        icon={<InkStar size={30} />}
        className="[&>span]:hidden [&_dd]:text-3xl sm:[&>span]:flex"
      />
      {hint && <p className="mt-2 text-xs text-toon-star-soft">{hint}</p>}
    </div>
  );
}
export function RecordTimeline({
  items,
}: {
  items: Array<{ time: ReactNode; title: ReactNode; body: ReactNode }>;
}) {
  return (
    <ol className="space-y-6 border-l-[3px] border-toon-ink pl-5">
      {items.map((item, index) => (
        <li key={index} className="relative">
          <span
            aria-hidden
            className="absolute -left-[29px] top-1 size-3 rounded-full border-2 border-toon-ink bg-toon-star"
          />
          <div className="text-xs text-toon-ink-soft">{item.time}</div>
          <h3 className="my-2 font-toon text-lg font-bold">{item.title}</h3>
          <div className="text-sm">{item.body}</div>
        </li>
      ))}
    </ol>
  );
}
