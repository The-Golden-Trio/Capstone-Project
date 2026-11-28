/**
 * Bộ phận dùng chung theo nguyên tắc giao diện 25/11/2026: mỗi loại phần tử
 * có một hình dáng riêng để người chơi nhận ra mà không cần đọc chữ.
 *
 *   Nút (ToonButton)      khối bo 14px, viền 3px, bóng cứng; nhún khi bấm.
 *   Chip lọc (ToonChip)   viên thuốc viền 2px, không bóng; chọn thì tô vàng + dấu ✓.
 *   Nhãn (ToonBadge)      phẳng, bo 7px, không viền mực, không bóng: chỉ để đọc.
 *   Trạng thái (ToonStatus) ký hiệu cố định cho từng trạng thái, chữ là phụ.
 *   Mở thêm (ToonDisclosure) dòng chữ có mũi tên xoay, không đóng khung.
 *   Ghi chú (ToonCallout) ô tô nhạt có biểu tượng, không viền mực.
 *   Chuỗi (ToonSteps, ToonDots) dữ liệu có thứ tự đi theo một đường, không lưới thẻ.
 */
import {
  useId,
  type ButtonHTMLAttributes,
  type DetailsHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

/* ── Chip lọc ─────────────────────────────────────────────────────────── */

export interface ToonChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color'
> {
  selected?: boolean;
  icon?: ReactNode;
  count?: number;
  /** Nền đêm (bản đồ) hay nền giấy. */
  surface?: 'paper' | 'night';
  /** Chỉ hiện biểu tượng; nhãn chữ vào aria-label và tooltip. */
  iconOnly?: boolean;
  label?: string;
}

export function ToonChip({
  selected = false,
  icon,
  count,
  surface = 'paper',
  iconOnly = false,
  label,
  children,
  className,
  type = 'button',
  ...rest
}: ToonChipProps) {
  const night = surface === 'night';
  return (
    <button
      {...rest}
      type={type}
      aria-pressed={selected}
      aria-label={iconOnly ? label : rest['aria-label']}
      title={iconOnly ? label : rest.title}
      className={cn(
        'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border-2 font-toon text-[13px] font-bold transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:shadow-toon-focus',
        iconOnly ? 'min-w-9 justify-center px-2' : 'px-3',
        selected
          ? 'border-toon-ink bg-toon-star text-toon-ink'
          : night
            ? 'border-toon-night-line bg-toon-night-deep/40 text-toon-paper hover:border-toon-star-soft hover:bg-toon-night-soft'
            : 'border-toon-ink/35 bg-toon-paper text-toon-ink hover:border-toon-ink',
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="inline-flex shrink-0">
          {icon}
        </span>
      )}
      {!iconOnly && children}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 font-toon-body text-[11px] tabular-nums leading-5',
            // Trên điện thoại chip chỉ còn ký hiệu để cả bộ lọc vừa một hàng.
            iconOnly && 'max-sm:hidden',
            selected
              ? 'bg-toon-ink/12'
              : night
                ? 'bg-toon-paper/12'
                : 'bg-toon-ink/8',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Trạng thái ──────────────────────────────────────────────────────── */

export type ToonStatusKind =
  'done' | 'playing' | 'open' | 'locked' | 'soon' | 'suggested' | 'warning';

/**
 * Bảng ký hiệu trạng thái: cùng một trạng thái thì cùng ký hiệu, cùng màu ở
 * mọi màn (bản đồ, danh sách, hồ sơ, lộ trình cấp).
 */
export const TOON_STATUS: Record<
  ToonStatusKind,
  { label: string; dot: string; tint: string; text: string }
> = {
  done: {
    label: 'Đã xong',
    dot: 'bg-toon-mint-deep',
    tint: 'bg-toon-mint/60',
    text: 'text-toon-ink',
  },
  playing: {
    label: 'Đang chơi',
    dot: 'bg-toon-mustard',
    tint: 'bg-toon-mustard/35',
    text: 'text-toon-ink',
  },
  open: {
    label: 'Có màn chơi',
    dot: 'bg-toon-sky-deep',
    tint: 'bg-toon-sky/60',
    text: 'text-toon-ink',
  },
  locked: {
    label: 'Đang khoá',
    dot: 'bg-toon-ink-faint',
    tint: 'bg-toon-shade/70',
    text: 'text-toon-ink-soft',
  },
  soon: {
    label: 'Chưa có màn chơi',
    dot: 'bg-toon-shade',
    tint: 'bg-toon-ink/6',
    text: 'text-toon-ink-soft',
  },
  suggested: {
    label: 'Gợi ý cho bạn',
    dot: 'bg-toon-star',
    tint: 'bg-toon-star-soft',
    text: 'text-toon-ink',
  },
  warning: {
    label: 'Lưu ý',
    dot: 'bg-toon-coral',
    tint: 'bg-toon-coral-light/70',
    text: 'text-toon-ink',
  },
};

/** Ký hiệu SVG riêng cho từng trạng thái (đọc được cả khi không có chữ). */
export function ToonStatusGlyph({
  kind,
  size = 14,
  className,
}: {
  kind: ToonStatusKind;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    'aria-hidden': true,
    className: cn('shrink-0', className),
  } as const;
  switch (kind) {
    case 'done':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="7" fill="#3f8a5c" />
          <path
            d="m4.6 8.2 2.3 2.3 4.5-4.8"
            fill="none"
            stroke="#fffaf0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'playing':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="7" fill="#f0b63c" />
          <path d="M6.3 4.8v6.4L11.2 8z" fill="#1e1b18" />
        </svg>
      );
    case 'open':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="4.6" fill="#4f8db3" />
          <ellipse
            cx="8"
            cy="8"
            rx="7.4"
            ry="2.6"
            transform="rotate(-24 8 8)"
            fill="none"
            stroke="#4f8db3"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'locked':
      return (
        <svg {...common}>
          <path
            d="M5.2 7V5.4a2.8 2.8 0 0 1 5.6 0V7"
            fill="none"
            stroke="#665c52"
            strokeWidth="1.8"
          />
          <rect x="3.6" y="7" width="8.8" height="7" rx="1.8" fill="#665c52" />
        </svg>
      );
    case 'soon':
      return (
        <svg {...common}>
          <circle
            cx="8"
            cy="8"
            r="6.2"
            fill="none"
            stroke="#665c52"
            strokeWidth="1.5"
            strokeDasharray="2.4 2.2"
          />
        </svg>
      );
    case 'suggested':
      return (
        <svg {...common}>
          <path
            d="M8 1.2 9.6 6.4 14.8 8 9.6 9.6 8 14.8 6.4 9.6 1.2 8l5.2-1.6z"
            fill="#f6cf5e"
            stroke="#1e1b18"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg {...common}>
          <path d="M8 1.6 15 14H1z" fill="#e2703f" strokeLinejoin="round" />
          <path
            d="M8 6v3.6"
            stroke="#fffaf0"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11.8" r="1" fill="#fffaf0" />
        </svg>
      );
  }
}

/**
 * Trạng thái = ký hiệu + chữ ngắn. `compact` chỉ còn ký hiệu, chữ vào
 * aria-label và tooltip (dùng ở hàng dày, bản đồ, chuỗi cấp).
 */
export function ToonStatus({
  kind,
  label,
  compact = false,
  className,
}: {
  kind: ToonStatusKind;
  /** Chữ thay cho nhãn mặc định, vd "Cấp 3" cho đang chơi. */
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const s = TOON_STATUS[kind];
  const text = label ?? s.label;
  if (compact) {
    return (
      <span
        role="img"
        aria-label={text}
        title={text}
        className={cn('inline-flex', className)}
      >
        <ToonStatusGlyph kind={kind} size={16} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1.5 rounded-[7px] py-0.5 pl-1 pr-2 font-toon-body text-xs font-bold leading-none',
        s.tint,
        s.text,
        className,
      )}
    >
      <ToonStatusGlyph kind={kind} />
      {text}
    </span>
  );
}

/* ── Mở thêm ─────────────────────────────────────────────────────────── */

/**
 * Phần gập lại: một dòng chữ đậm có mũi tên xoay, không đóng khung. Khác
 * hẳn nút (không bóng, không nền) và khác thẻ (không viền).
 */
export function ToonDisclosure({
  summary,
  meta,
  icon,
  children,
  className,
  tone = 'paper',
  defaultOpen = true,
  ...rest
}: Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'children' | 'open'> & {
  /**
   * Mở sẵn theo mặc định: người chơi không phải bấm từng dòng để đọc. Chỉ
   * đóng sẵn cho phần hiếm dùng hoặc nguy hiểm (xoá tài khoản, đăng xuất).
   */
  defaultOpen?: boolean;
  summary: ReactNode;
  /** Chữ nhỏ bên phải, vd số mục. */
  meta?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  tone?: 'paper' | 'night';
}) {
  return (
    <details
      {...rest}
      open={defaultOpen || undefined}
      className={cn('group/disc', className)}
    >
      <summary
        className={cn(
          'flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-[10px] py-2 font-toon text-[15px] font-bold focus-visible:outline-none focus-visible:shadow-toon-focus [&::-webkit-details-marker]:hidden',
          // Giấy: kế thừa màu chữ của nơi đặt (dùng được cả trên nền đêm).
          tone === 'night'
            ? 'text-toon-paper hover:text-toon-star-soft'
            : 'text-current hover:opacity-75',
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="size-4 shrink-0 transition-transform duration-200 group-open/disc:rotate-90 motion-reduce:transition-none"
        >
          <path
            d="m6 3.5 4.5 4.5L6 12.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {icon && (
          <span aria-hidden className="inline-flex shrink-0 opacity-80">
            {icon}
          </span>
        )}
        {summary}
        {meta !== undefined && (
          <span
            className={cn(
              'ml-auto shrink-0 pl-2 font-toon-body text-xs font-semibold tabular-nums',
              tone === 'night' ? 'text-toon-night-ink' : 'text-toon-ink-soft',
            )}
          >
            {meta}
          </span>
        )}
      </summary>
      <div className="pb-2 pl-[26px] pt-1">{children}</div>
    </details>
  );
}

/* ── Ghi chú ─────────────────────────────────────────────────────────── */

export type ToonCalloutTone = 'warning' | 'info' | 'tip' | 'ai';

const calloutTones: Record<ToonCalloutTone, string> = {
  warning: 'bg-toon-coral-light/45',
  info: 'bg-toon-sky/40',
  tip: 'bg-toon-star-soft/70',
  ai: 'bg-toon-lilac/35',
};

/** Ô ghi chú trong thẻ: tô nhạt, có biểu tượng, không viền mực (tầng 2). */
export function ToonCallout({
  tone = 'info',
  icon,
  title,
  children,
  className,
}: {
  tone?: ToonCalloutTone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-[14px] p-3.5 font-toon-body text-sm text-toon-ink',
        calloutTones[tone],
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="mt-0.5 inline-flex shrink-0">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title && (
          <p className="font-toon text-[15px] font-bold leading-snug">
            {title}
          </p>
        )}
        {children && (
          <div className={cn('text-toon-ink-soft', Boolean(title) && 'mt-0.5')}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Chuỗi ───────────────────────────────────────────────────────────── */

export type ToonStepState = 'done' | 'current' | 'next' | 'locked';

export interface ToonStep {
  key: string;
  title: ReactNode;
  meta?: ReactNode;
  state: ToonStepState;
  /** Ký hiệu trong nút tròn (mặc định là số thứ tự). */
  marker?: ReactNode;
  children?: ReactNode;
}

const stepNode: Record<ToonStepState, string> = {
  done: 'border-toon-ink bg-toon-mint text-toon-ink',
  current: 'border-toon-ink bg-toon-star text-toon-ink',
  next: 'border-toon-ink bg-toon-paper text-toon-ink',
  locked: 'border-toon-ink/30 bg-toon-sand text-toon-ink-faint',
};

/**
 * Dữ liệu có thứ tự (cấp, bước, lịch sử) đi trên một đường dọc. Đoạn đường
 * đã qua tô liền, đoạn chưa tới là nét đứt: nhìn là biết mình đang ở đâu.
 */
export function ToonSteps({
  steps,
  label,
  className,
}: {
  steps: ToonStep[];
  label: string;
  className?: string;
}) {
  return (
    <ol aria-label={label} className={cn('font-toon-body', className)}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const reached = step.state === 'done';
        return (
          <li
            key={step.key}
            aria-current={step.state === 'current' ? 'step' : undefined}
            className="relative flex gap-3.5 pb-5 last:pb-0"
          >
            {!last && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[15px] top-8 bottom-0 w-0',
                  reached
                    ? 'border-l-[3px] border-toon-ink'
                    : 'border-l-2 border-dashed border-toon-ink/30',
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                'relative z-[1] grid size-8 shrink-0 place-items-center rounded-full border-2 font-toon text-sm font-extrabold tabular-nums',
                stepNode[step.state],
                step.state === 'current' && 'motion-safe:animate-pulse-glow',
              )}
            >
              {step.marker ??
                (step.state === 'done' ? (
                  <svg viewBox="0 0 16 16" className="size-4">
                    <path
                      d="m3.8 8.3 2.7 2.7 5.6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : step.state === 'locked' ? (
                  <svg viewBox="0 0 16 16" className="size-3.5">
                    <path
                      d="M5.2 7V5.4a2.8 2.8 0 0 1 5.6 0V7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <rect
                      x="3.6"
                      y="7"
                      width="8.8"
                      height="7"
                      rx="1.8"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  i + 1
                ))}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div
                className={cn(
                  'font-toon text-[15px] font-bold leading-snug',
                  step.state === 'locked'
                    ? 'text-toon-ink-soft'
                    : 'text-toon-ink',
                )}
              >
                {step.title}
              </div>
              {step.meta && (
                <div className="mt-0.5 text-xs text-toon-ink-soft">
                  {step.meta}
                </div>
              )}
              {step.children && <div className="mt-2">{step.children}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Chuỗi ngắn trên một hàng (cấp 1…n của một nghề): mỗi chấm một cấp, nối
 * bằng đoạn thẳng. Đủ để đọc tiến độ trong một dòng, không cần thẻ.
 */
export function ToonDots({
  total,
  done,
  current,
  label,
  size = 'md',
  surface = 'paper',
  className,
}: {
  total: number;
  /** Số cấp đã xong (tính từ 1). */
  done: number;
  /** Cấp đang chơi (1-based), nếu có. */
  current?: number | null;
  label: string;
  size?: 'sm' | 'md';
  surface?: 'paper' | 'night';
  className?: string;
}) {
  const id = useId();
  const n = Math.max(0, Math.min(total, 12));
  const dot = size === 'sm' ? 'size-2.5' : 'size-3.5';
  const gap = size === 'sm' ? 'w-1.5' : 'w-2.5';
  const ink =
    surface === 'night' ? 'border-toon-night-deep' : 'border-toon-ink';
  return (
    <span
      role="img"
      aria-labelledby={id}
      className={cn('inline-flex items-center', className)}
    >
      <span id={id} className="sr-only">
        {label}
      </span>
      {Array.from({ length: n }, (_, i) => {
        const level = i + 1;
        const isDone = level <= done;
        const isCurrent = !isDone && current === level;
        return (
          <span key={level} className="inline-flex items-center">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  'h-0.5',
                  gap,
                  level <= done
                    ? surface === 'night'
                      ? 'bg-toon-star'
                      : 'bg-toon-ink'
                    : surface === 'night'
                      ? 'bg-toon-night-line'
                      : 'bg-toon-ink/20',
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                'rounded-full border-[1.5px]',
                dot,
                isDone
                  ? cn(ink, 'bg-toon-mint')
                  : isCurrent
                    ? cn(ink, 'bg-toon-star ring-2 ring-toon-star/40')
                    : surface === 'night'
                      ? 'border-toon-night-line bg-transparent'
                      : 'border-toon-ink/30 bg-transparent',
              )}
            />
          </span>
        );
      })}
    </span>
  );
}
