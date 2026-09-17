import { stripNpcPrefix } from '../../domain/format';
import type { ChatLine } from '../../domain/scenarioEngine';

/** Một bong bóng thoại của NPC. */
export function NpcBubble({ name, text }: { name: string; text: string }) {
  return (
    <div className="mb-3.5 flex gap-[11px]">
      <span className="flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full bg-chip text-[12px] font-semibold text-gold-2">
        {name}
      </span>
      <div className="min-w-0 flex-1 rounded-[3px_11px_11px_11px] bg-panel px-3.5 py-3 text-[14px] leading-relaxed [overflow-wrap:anywhere]">
        <b className="mb-[3px] block text-[11.5px] font-semibold text-gold-2">
          {name}
        </b>
        {stripNpcPrefix(text)}
      </div>
    </div>
  );
}

/** Bong bóng của người chơi — đảo chiều, màu khác. */
function PlayerBubble({ text }: { text: string }) {
  return (
    <div className="mb-3.5 flex flex-row-reverse gap-[11px]">
      <span className="flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full bg-inset text-[12px] font-semibold text-muted">
        Bạn
      </span>
      <div className="min-w-0 flex-1 rounded-[11px_3px_11px_11px] bg-chip px-3.5 py-3 text-[14px] leading-relaxed [overflow-wrap:anywhere]">
        {text}
      </div>
    </div>
  );
}

export function ChatLog({ lines }: { lines: ChatLine[] }) {
  return (
    <>
      {lines.map((line, index) =>
        line.from === 'player' ? (
          <PlayerBubble key={index} text={line.text} />
        ) : (
          <NpcBubble key={index} name={line.name ?? '?'} text={line.text} />
        ),
      )}
    </>
  );
}
