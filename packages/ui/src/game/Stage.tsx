/**
 * Sân khấu kiểu visual novel cho theme "Cartoon viền đen": bối cảnh, nhân
 * vật đứng, hộp thoại có bảng tên, bong bóng thoại và khung lời dẫn. Ảnh
 * nhân vật, bối cảnh do app truyền vào (asset nội dung), component chỉ lo
 * trình bày.
 */
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Bối cảnh phủ kín khung, giữ tâm ảnh; `dim` làm tối nhẹ để chữ nổi. */
export function SceneBackdrop({
  src,
  alt = '',
  dim = 0,
  focus = 'center',
  overlay = false,
  className,
  children,
}: {
  src: string;
  alt?: string;
  /** 0–1: độ phủ tối phía dưới để hộp thoại và nhân vật nổi lên. */
  dim?: number;
  /** `object-position` của ảnh. */
  focus?: string;
  /** Phủ kín khung cha (absolute inset-0) thay vì nằm trong dòng chảy. */
  overlay?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        overlay ? 'absolute inset-0' : 'relative',
        'isolate overflow-hidden',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 -z-10 size-full select-none object-cover"
        style={{ objectPosition: focus }}
      />
      {dim > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(180deg, rgb(30 27 24 / ${dim * 0.15}) 0%, rgb(30 27 24 / ${dim * 0.05}) 45%, rgb(30 27 24 / ${dim * 0.55}) 100%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

export type CharacterMotion = 'none' | 'hop' | 'shake' | 'bob';

/**
 * Nhân vật đứng trên sân khấu. Tranh cắt ngang thân, nên đặt sao cho mép
 * dưới khuất sau hộp thoại. `motion` chạy lại mỗi khi `beat` đổi.
 */
export function Character({
  src,
  name,
  height = 420,
  dimmed = false,
  flip = false,
  motion = 'bob',
  beat,
  emote,
  className,
  style,
}: {
  src: string;
  name: string;
  height?: number | string;
  /** Nhân vật không nói: lùi lại, xám nhẹ. */
  dimmed?: boolean;
  flip?: boolean;
  motion?: CharacterMotion;
  /** Khoá để chạy lại chuyển động khi sang nhịp thoại mới. */
  beat?: string | number;
  /** Emote bật cạnh đầu (thường là `<Emote />`). */
  emote?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const once = motion === 'hop' || motion === 'shake';
  return (
    <figure
      className={cn(
        'pointer-events-none relative m-0 select-none transition-[filter,transform,opacity] duration-300',
        dimmed && 'brightness-[0.8] saturate-[0.75]',
        className,
      )}
      style={{ height, ...style }}
      aria-label={name}
    >
      <div
        key={once ? `${beat}-${motion}` : 'idle'}
        className={cn(
          'relative h-full origin-bottom',
          !dimmed && motion === 'bob' && 'animate-toon-bob',
          !dimmed && motion === 'hop' && 'animate-toon-hop',
          !dimmed && motion === 'shake' && 'animate-toon-shake',
        )}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="h-full w-auto max-w-none object-contain"
          style={{
            transform: flip ? 'scaleX(-1)' : undefined,
            // Viền giấy trắng mảnh quanh tranh: tách nhân vật khỏi bối cảnh.
            filter:
              'drop-shadow(0 0 0 #fffaf0) drop-shadow(2px 0 0 #fffaf0) drop-shadow(-2px 0 0 #fffaf0) drop-shadow(0 -2px 0 #fffaf0) drop-shadow(5px 6px 0 rgb(30 27 24 / 0.35))',
          }}
        />
        {emote && (
          <div
            key={`emote-${beat}`}
            className={cn(
              'absolute top-[3%]',
              flip ? 'left-[12%]' : 'right-[12%]',
            )}
          >
            {emote}
          </div>
        )}
      </div>
    </figure>
  );
}

/** Bảng tên trên hộp thoại: màu theo nhân vật, nghiêng nhẹ như nhãn dán. */
export function NameTag({
  name,
  role,
  color = '#f0b63c',
  className,
}: {
  name: ReactNode;
  role?: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex max-w-full -rotate-2 items-baseline gap-2 rounded-xl border-[3px] border-toon-ink px-3.5 py-1 shadow-toon-sm',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <span className="truncate font-toon text-lg font-extrabold leading-tight text-toon-ink first-letter:uppercase">
        {name}
      </span>
      {role && (
        <span className="hidden truncate text-xs font-semibold text-toon-ink/75 sm:inline">
          {role}
        </span>
      )}
    </div>
  );
}

/**
 * Hộp thoại chính. Bấm để qua nhịp do app xử lý (bọc trong button); hộp chỉ
 * lo hình: bảng tên đè lên mép trên, mũi tên "tiếp" nhấp nháy góc phải.
 */
export function DialogueBox({
  tag,
  meta,
  children,
  more = false,
  narration = false,
  className,
}: {
  tag?: ReactNode;
  /** Góc phải trên: kênh liên lạc (tin nhắn, cuộc gọi…). */
  meta?: ReactNode;
  children: ReactNode;
  /** Còn nhịp chưa đọc: hiện mũi tên tiếp. */
  more?: boolean;
  /** Lời dẫn cảnh: nền vàng nhạt kiểu khung chú thích truyện tranh. */
  narration?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative rounded-[22px] border-[3px] border-toon-ink px-5 pb-5 pt-6 shadow-toon-lg sm:px-7',
        narration ? 'bg-[#fff1c9]' : 'bg-toon-paper',
        className,
      )}
    >
      {tag && <div className="absolute -top-5 left-4 sm:left-6">{tag}</div>}
      {meta && <div className="absolute -top-4 right-4 sm:right-6">{meta}</div>}
      <div
        className={cn(
          'font-toon-body text-[17px] font-semibold leading-relaxed text-toon-ink sm:text-lg',
          narration && 'italic',
        )}
      >
        {children}
      </div>
      {more && (
        <span
          aria-hidden
          className="absolute bottom-2.5 right-4 animate-bounce text-toon-ink"
        >
          <svg width="22" height="16" viewBox="0 0 22 16">
            <path
              d="M2 2h18L11 14Z"
              fill="#f0b63c"
              stroke="#1e1b18"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

/** Bong bóng thoại trong nhật ký hội thoại. */
export function SpeechBubble({
  side = 'left',
  tone = 'paper',
  children,
  className,
}: {
  side?: 'left' | 'right';
  tone?: 'paper' | 'mustard' | 'sky' | 'mint' | 'rose';
  children: ReactNode;
  className?: string;
}) {
  const fill = {
    paper: '#fffaf0',
    mustard: '#ffd977',
    sky: '#d6ecf7',
    mint: '#d4f0dd',
    rose: '#fbdde3',
  }[tone];
  return (
    <div
      className={cn(
        'relative rounded-2xl border-[2.5px] border-toon-ink px-3.5 py-2 text-[15px] font-semibold leading-snug text-toon-ink shadow-toon-sm',
        side === 'left' ? 'rounded-bl-md' : 'rounded-br-md',
        className,
      )}
      style={{ backgroundColor: fill }}
    >
      {children}
      <svg
        aria-hidden
        width="16"
        height="12"
        viewBox="0 0 16 12"
        className={cn(
          'absolute -bottom-[10px]',
          side === 'left' ? 'left-3' : 'right-3 -scale-x-100',
        )}
      >
        <path
          d="M1 0 L4 11 L14 0"
          fill={fill}
          stroke="#1e1b18"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M0 0 H15" stroke={fill} strokeWidth="3" />
      </svg>
    </div>
  );
}

/** Khung lời dẫn cảnh trong nhật ký: chữ nghiêng trên băng giấy vàng. */
export function CaptionStrip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'mx-auto w-fit max-w-[92%] -rotate-[0.6deg] rounded-md border-[2.5px] border-toon-ink bg-[#fff1c9] px-3 py-1.5 text-center text-sm font-semibold italic text-toon-ink-soft shadow-toon-sm',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Thẻ giấy viền đen dùng chung cho bảng việc, sổ tay, hộp thoại phụ. */
export function ToonPanel({
  as: Tag = 'div',
  title,
  icon,
  action,
  children,
  className,
  bodyClassName,
  ...rest
}: {
  as?: 'div' | 'section' | 'aside' | 'article';
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  'aria-label'?: string;
  id?: string;
}) {
  return (
    <Tag className={cn('toon-card flex flex-col', className)} {...rest}>
      {title && (
        <header className="flex items-center gap-2 border-b-[3px] border-toon-ink px-4 py-2.5">
          {icon && <span className="text-toon-ink">{icon}</span>}
          <h2 className="flex-1 font-toon text-lg font-extrabold leading-tight text-toon-ink">
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </Tag>
  );
}
