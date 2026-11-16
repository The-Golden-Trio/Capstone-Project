import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';

/** Đường của sao bốn cánh trong hộp 24×24, cánh dài dọc, eo thắt. */
export const SPARKLE_PATH =
  'M12 0 C12.9 7.2 14.2 9.8 24 12 C14.2 14.2 12.9 16.8 12 24 C11.1 16.8 9.8 14.2 0 12 C9.8 9.8 11.1 7.2 12 0 Z';

/** Sao bốn cánh: dấu nhận diện của JobQuest, dùng làm điểm nhấn nhỏ. */
export function Sparkle({
  size = 16,
  className,
  style,
  twinkle = false,
  delay = 0,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  twinkle?: boolean;
  /** Giây trễ của nhịp lấp lánh, để các sao không nháy cùng lúc. */
  delay?: number;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('shrink-0', twinkle && 'animate-twinkle', className)}
      style={{ animationDelay: `${delay}s`, ...style }}
    >
      <path d={SPARKLE_PATH} fill="currentColor" />
    </svg>
  );
}

/** Đường chia có ngôi sao ở giữa, thay cho `<hr>` giữa hai phần lớn. */
export function StarDivider({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn('flex items-center gap-3 text-gold-400', className)}
    >
      <span className="hairline-gold flex-1" />
      <Sparkle size={12} />
      <span className="hairline-gold flex-1" />
    </div>
  );
}
