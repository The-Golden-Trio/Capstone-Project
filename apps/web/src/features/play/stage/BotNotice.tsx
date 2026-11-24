import { Bot } from 'lucide-react';
import { BotAvatar } from './Avatar';

/**
 * Tin của bot hiện như thẻ thông báo ở đầu sân khấu: không chiếm hộp thoại,
 * nên cuộc gọi hay cuộc chat đang diễn ra không bị cắt ngang. Thẻ nằm trong
 * luồng bố cục (không nổi đè) để không che bảng tên hay chữ của hộp thoại.
 */
export function BotNotice({
  name,
  text,
  art,
}: {
  name: string;
  text: string;
  art?: string;
}) {
  return (
    <div className="relative z-30 shrink-0 px-3 pt-14 sm:px-5">
      <div
        role="status"
        className="mx-auto flex max-w-sm animate-toon-slide items-start gap-2.5 rounded-2xl border-[3px] border-toon-ink bg-[#e2eeef] px-3 py-2.5 text-toon-ink shadow-toon-lg"
      >
        {art ? (
          <BotAvatar src={art} size={36} />
        ) : (
          <Bot
            size={22}
            className="mt-0.5 shrink-0 text-[#28596a]"
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-toon text-sm font-extrabold">
            {name}
            <span className="rounded-full border-2 border-toon-ink bg-toon-paper px-1.5 text-[11px] leading-4">
              Thông báo
            </span>
          </p>
          <p className="break-words text-sm font-semibold">{text}</p>
        </div>
      </div>
    </div>
  );
}
