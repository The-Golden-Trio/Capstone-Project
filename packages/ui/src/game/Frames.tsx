import {
  useId,
  useRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import type { TabItem } from '../components/Tabs';
import { cn } from '../lib/cn';

/** Cụm sao là nét trang trí, không được đọc như nội dung của thẻ. */
function CornerStars() {
  return (
    <svg aria-hidden="true" viewBox="0 0 72 64" className="size-16">
      <path
        d="m40 5 5 17 17 6-17 5-5 18-6-18-17-5 17-6Z"
        fill="var(--color-toon-star)"
        stroke="var(--color-toon-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="m13 37 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"
        fill="var(--color-toon-sky)"
        stroke="var(--color-toon-ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="63" cy="48" r="3" fill="var(--color-toon-compass-red)" />
      <path
        d="m17 9 2 4m43-1-3 4"
        stroke="var(--color-toon-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface NightCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'paper' | 'night';
  tape?: boolean;
  /** Nội dung băng rôn; có thể truyền heading phù hợp cấp của trang. */
  ribbon?: ReactNode;
  stars?: boolean;
}

/** Thẻ cắt giấy nổi trên trời đêm; không tự thêm chuyển động hay role. */
export function NightCard({
  tone = 'paper',
  tape = false,
  ribbon,
  stars = false,
  className,
  children,
  ...rest
}: NightCardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'relative min-w-0 rounded-[24px] p-6 font-toon-body shadow-soft',
        tone === 'paper'
          ? 'bg-toon-paper text-toon-ink'
          : 'bg-toon-night-soft text-toon-paper',
        className,
      )}
    >
      {tape && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 left-6 h-6 w-20 -rotate-6 border-2 border-toon-ink bg-toon-star-soft"
          style={{ clipPath: 'polygon(3% 0, 100% 8%, 97% 100%, 0 90%)' }}
        />
      )}
      {stars && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-2"
        >
          <CornerStars />
        </span>
      )}
      <div className={stars && !ribbon ? 'pr-14' : undefined}>
        {ribbon && (
          <div className={stars ? 'pr-14' : undefined}>
            <div className="relative mb-5 inline-block max-w-full -rotate-1 rounded-lg border-[3px] border-toon-ink bg-toon-star px-4 py-1.5 font-toon text-xl font-extrabold break-words text-toon-ink shadow-toon-sm [&_h1]:font-toon [&_h2]:font-toon [&_h3]:font-toon">
              {ribbon}
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-3 size-2 border-b-2 border-r-2 border-toon-ink bg-toon-mustard-deep"
              />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export interface PillTabsProps<K extends string = string> {
  items: readonly TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  /** Ghép với ToonTabPanel có cùng idBase. */
  idBase?: string;
  className?: string;
}

/** Tab hồ sơ: mũi tên/Home/End đổi tab và focus, Tab chỉ dừng ở mục chọn. */
export function PillTabs<K extends string>({
  items,
  value,
  onChange,
  label,
  idBase,
  className,
}: PillTabsProps<K>) {
  const autoId = useId();
  const base = idBase ?? autoId;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = items.some((item) => item.key === value);
  return (
    <div
      role="tablist"
      aria-label={label}
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
            tabIndex={active || (!selected && index === 0) ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => {
              if (event.altKey || event.ctrlKey || event.metaKey) return;
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
              'inline-flex min-h-10 max-w-full items-center gap-2 rounded-full px-4 py-1.5 font-toon text-base font-bold transition-colors focus-visible:outline-none focus-visible:shadow-toon-focus',
              active
                ? 'bg-toon-star text-toon-ink'
                : 'text-toon-night-ink hover:bg-toon-night-soft hover:text-toon-paper',
            )}
          >
            {item.icon && (
              <span aria-hidden="true" className="inline-flex shrink-0">
                {item.icon}
              </span>
            )}
            <span className="min-w-0 break-words">{item.label}</span>
            {item.count !== undefined && (
              <span className="rounded-full border-2 border-toon-ink bg-toon-paper px-1.5 font-toon-body text-xs text-toon-ink tabular-nums">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface CartoonNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href: string;
  active?: boolean;
}

export interface CartoonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/** Adapter phải giữ children, className và aria-current trên phần tử link. */
export type CartoonRenderLink = (
  props: CartoonLinkProps,
  item: CartoonNavItem,
) => ReactNode;

export interface CartoonNavProps {
  items: readonly CartoonNavItem[];
  renderLink?: CartoonRenderLink;
  label?: string;
  className?: string;
}

function NavItems({
  items,
  renderLink = (props) => <a {...props} />,
  compact = false,
}: Pick<CartoonNavProps, 'items' | 'renderLink'> & { compact?: boolean }) {
  return (
    <ul
      className={compact ? 'grid grid-cols-4 gap-1.5' : 'flex flex-wrap gap-2'}
    >
      {items.map((item) => (
        <li key={item.key} className="min-w-0">
          {renderLink(
            {
              href: item.href,
              'aria-current': item.active ? 'page' : undefined,
              className: cn(
                'flex min-h-11 min-w-0 items-center justify-center border-[3px] border-toon-night-deep font-toon font-bold focus-visible:outline-none focus-visible:shadow-toon-focus motion-safe:transition-transform',
                compact
                  ? 'h-full flex-col gap-1 rounded-2xl px-1 py-2 text-xs'
                  : 'gap-2 rounded-full px-4 py-2 text-sm',
                item.active
                  ? 'bg-toon-star text-toon-ink shadow-toon-sm'
                  : 'bg-toon-night-soft text-toon-paper hover:bg-toon-night',
                compact && item.active && 'motion-safe:-translate-y-2',
              ),
              children: (
                <>
                  {item.icon && (
                    <span aria-hidden="true" className="inline-flex shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <span className="min-w-0 break-words text-center">
                    {item.label}
                  </span>
                </>
              ),
            },
            item,
          )}
        </li>
      ))}
    </ul>
  );
}

export interface TopNavProps extends CartoonNavProps {
  logo: ReactNode;
  right?: ReactNode;
}

/** Lên màn nhỏ, logo/tài khoản còn ở header; BottomNav nhận các link. */
export function TopNav({
  logo,
  right,
  items,
  renderLink,
  label = 'Điều hướng chính',
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        'border-b-[3px] border-toon-ink bg-toon-night-deep px-4 py-3 font-toon-body text-toon-paper',
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 max-w-full shrink-0">{logo}</div>
        <nav aria-label={label} className="hidden min-w-0 md:block">
          <NavItems items={items} renderLink={renderLink} />
        </nav>
        {right && (
          <div className="flex min-w-0 max-w-full items-center gap-3">
            {right}
          </div>
        )}
      </div>
    </header>
  );
}

/** Thanh bốn mục. Không tự fixed: AppShell quyết định vị trí và chừa đáy trang. */
export function BottomNav({
  items,
  renderLink,
  label = 'Điều hướng điện thoại',
  className,
}: CartoonNavProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'border-t-[3px] border-toon-ink bg-toon-night-deep px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] font-toon-body text-toon-paper',
        className,
      )}
    >
      <NavItems items={items} renderLink={renderLink} compact />
    </nav>
  );
}

export interface StatTileProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  value: ReactNode;
  label: string;
  icon: ReactNode;
  tone?: 'sky' | 'mint' | 'rose' | 'star';
}

const statTones = {
  sky: 'bg-toon-sky',
  mint: 'bg-toon-mint',
  rose: 'bg-toon-rose',
  star: 'bg-toon-star',
};

export function StatTile({
  value,
  label,
  icon,
  tone = 'sky',
  className,
  ...rest
}: StatTileProps) {
  return (
    <div
      {...rest}
      className={cn(
        'flex min-w-0 items-center gap-4 rounded-[22px] bg-toon-paper p-4 font-toon-body text-toon-ink shadow-soft',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-full',
          statTones[tone],
        )}
      >
        {icon}
      </span>
      <dl className="min-w-0">
        <dt className="text-sm font-bold text-toon-ink-soft">{label}</dt>
        <dd className="break-words font-toon text-4xl leading-tight font-extrabold tabular-nums">
          {value}
        </dd>
      </dl>
    </div>
  );
}

export interface EmptyHintProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  illustration: ReactNode;
  message: string;
  /** Truyền một ToonButton hoặc Link; không bọc thêm phần tử tương tác. */
  action?: ReactNode;
}

export function EmptyHint({
  illustration,
  message,
  action,
  className,
  ...rest
}: EmptyHintProps) {
  return (
    <div
      {...rest}
      className={cn(
        'flex min-w-0 flex-col items-center gap-4 rounded-[24px] border-[3px] border-dashed border-toon-ink bg-toon-paper p-6 text-center font-toon-body text-toon-ink',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex size-20 items-center justify-center rounded-full border-[3px] border-toon-ink bg-toon-star-soft"
      >
        {illustration}
      </div>
      <p className="max-w-sm text-base font-semibold break-words">{message}</p>
      {action && <div className="max-w-full">{action}</div>}
    </div>
  );
}
