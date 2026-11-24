import { cn } from '@datn/ui';

/** Ảnh tròn của bot có ảnh riêng. */
export function BotAvatar({
  src,
  size,
  className,
}: {
  src: string;
  size: number;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      width={size}
      height={size}
      className={cn(
        'shrink-0 select-none rounded-full border-[2.5px] border-toon-ink bg-toon-paper object-cover shadow-toon-sm',
        className,
      )}
    />
  );
}

/** Mặt nhân vật cắt tròn từ tranh đứng. */
export function Avatar({
  src,
  color,
  size = 40,
  className,
}: {
  src: string;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative block shrink-0 overflow-hidden rounded-full border-[2.5px] border-toon-ink shadow-toon-sm',
        className,
      )}
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute left-1/2 top-[2%] h-[260%] w-auto max-w-none -translate-x-1/2 select-none"
      />
    </span>
  );
}
