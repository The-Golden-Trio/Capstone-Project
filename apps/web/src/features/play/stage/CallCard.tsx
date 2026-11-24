/**
 * Màn cuộc gọi: thay cho nhân vật đứng toàn thân khi trò chuyện qua điện
 * thoại. Ảnh tròn, tên, biểu tượng điện thoại, "Đang gọi" kèm thời lượng, và
 * trạng thái "Đã kết thúc" khi cuộc gọi xong. Thời lượng tính theo đồng hồ
 * thật từ lúc cuộc gọi mở (như đồng hồ trên máy), nên người chơi nghĩ lâu
 * thì số chạy lâu; cuộc gọi xong, hay lượt mẫu đang giữ đồng hồ, thì đứng yên.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { cn } from '@datn/ui';
import { characterArt, type ToonCharacter } from '../../../lib/toon';
import { Avatar } from './Avatar';

const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}`;

function useCallSeconds(callKey: string, live: boolean, held: boolean) {
  const timer = useRef({ ms: 0, at: performance.now(), held });
  const [seconds, setSeconds] = useState(0);
  // Thời gian đã trôi, không tính lúc người trình bày giữ đồng hồ.
  const elapsed = useCallback(() => {
    const now = performance.now();
    if (!timer.current.held) timer.current.ms += now - timer.current.at;
    timer.current.at = now;
    return timer.current.ms;
  }, []);
  useEffect(() => {
    timer.current = { ms: 0, at: performance.now(), held: timer.current.held };
    setSeconds(0);
  }, [callKey]);
  useEffect(() => {
    elapsed();
    timer.current.held = held;
  }, [held, elapsed]);
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(
      () => setSeconds(Math.floor(elapsed() / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [callKey, live, elapsed]);
  return seconds;
}

export function CallCard({
  look,
  name,
  callKey,
  live,
  held = false,
  compact = false,
  expression,
  className,
}: {
  look?: ToonCharacter;
  name: string;
  /** Đổi giá trị này là một cuộc gọi mới: đồng hồ về 0. */
  callKey: string;
  live: boolean;
  /** Lượt mẫu đang chờ người trình bày: thời lượng đứng yên như đồng hồ chọn phương án. */
  held?: boolean;
  /** Hẹp chỗ: thu thẻ lại một hàng gọn (đang chọn phương án dưới hộp thoại). */
  compact?: boolean;
  expression?: string | null;
  className?: string;
}) {
  const seconds = useCallSeconds(callKey, live, held);
  const Icon = live ? Phone : PhoneOff;
  return (
    <div
      className={cn(
        'z-10 flex items-center gap-3 rounded-[22px] border-[3px] border-toon-ink bg-toon-paper px-3 shadow-toon-lg @3xl:w-64 @3xl:flex-col @3xl:gap-2.5 @3xl:px-5 @3xl:py-[clamp(0.75rem,3dvh,1.5rem)]',
        compact ? 'py-1.5' : 'py-2.5',
        className,
      )}
    >
      <div
        className={cn(
          'relative shrink-0 @3xl:size-[clamp(4rem,11dvh,7rem)]',
          compact ? 'size-8' : 'size-12',
        )}
      >
        {live && (
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full border-[3px] border-toon-ink/40 motion-safe:animate-pulse"
          />
        )}
        {look && (
          <Avatar
            src={characterArt(look, expression)}
            color={look.color}
            size={112}
            className={cn('size-full!', !live && 'grayscale')}
          />
        )}
      </div>
      <div className="min-w-0 @3xl:text-center">
        <p className="truncate font-toon text-lg font-extrabold leading-tight text-toon-ink first-letter:uppercase @3xl:text-2xl">
          {name}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-toon-ink-soft @3xl:justify-center">
          <span
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-full border-2 border-toon-ink',
              live ? 'bg-[#a8dbb9]' : 'bg-toon-sand',
            )}
          >
            <Icon size={13} strokeWidth={2.8} aria-hidden />
          </span>
          <span>{live ? 'Đang gọi' : 'Cuộc gọi đã kết thúc'}</span>
          <span aria-hidden className="tabular font-extrabold">
            {clock(seconds)}
          </span>
          <span className="sr-only">{`, ${seconds} giây`}</span>
        </p>
      </div>
    </div>
  );
}
