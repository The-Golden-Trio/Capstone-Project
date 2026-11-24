/**
 * Màn cuộc gọi: thay cho nhân vật đứng toàn thân khi trò chuyện qua điện
 * thoại. Ảnh tròn, tên, biểu tượng điện thoại, "Đang gọi" kèm thời lượng, và
 * trạng thái "Đã kết thúc" khi cuộc gọi xong. Thời lượng tính theo đồng hồ
 * thật từ lúc cuộc gọi mở (như đồng hồ trên máy), nên người chơi nghĩ lâu
 * thì số chạy lâu; cuộc gọi xong thì đứng yên ở thời lượng cuối.
 */
import { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { cn } from '@datn/ui';
import { characterArt, type ToonCharacter } from '../../../lib/toon';
import { Avatar } from './Avatar';

const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}`;

function useCallSeconds(callKey: string, live: boolean) {
  const startedAt = useRef(Date.now());
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    startedAt.current = Date.now();
    setSeconds(0);
  }, [callKey]);
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [callKey, live]);
  return seconds;
}

export function CallCard({
  look,
  name,
  callKey,
  live,
  expression,
  className,
}: {
  look?: ToonCharacter;
  name: string;
  /** Đổi giá trị này là một cuộc gọi mới: đồng hồ về 0. */
  callKey: string;
  live: boolean;
  expression?: string | null;
  className?: string;
}) {
  const seconds = useCallSeconds(callKey, live);
  const Icon = live ? Phone : PhoneOff;
  return (
    <div
      className={cn(
        'z-10 flex items-center gap-3 rounded-[22px] border-[3px] border-toon-ink bg-toon-paper px-3 py-2.5 shadow-toon-lg md:w-64 md:flex-col md:gap-2.5 md:px-5 md:py-6',
        className,
      )}
    >
      <div className="relative size-12 shrink-0 md:size-28">
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
      <div className="min-w-0 md:text-center">
        <p className="truncate font-toon text-lg font-extrabold leading-tight text-toon-ink first-letter:uppercase md:text-2xl">
          {name}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-toon-ink-soft md:justify-center">
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
