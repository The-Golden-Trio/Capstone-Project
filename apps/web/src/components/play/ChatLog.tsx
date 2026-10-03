import { stripNpcPrefix, type ChatLine } from '@datn/game-core';
import { Crest } from '../game/Crest';

/**
 * Lời của NPC.
 *
 * Huy hiệu sinh từ `npc_id` nên mỗi người một mặt, và mặt đó theo họ suốt cả
 * trò chơi. Bản cũ chỉ có bốn chữ cái trong ô tròn xám nên hai NPC trong cùng
 * một cảnh trông y hệt nhau.
 */
export function NpcBubble({
  name,
  text,
  seed,
}: {
  name: string;
  text: string;
  /** Định danh NPC; không có thì lấy tên làm hạt giống. */
  seed?: string;
}) {
  return (
    <div className="reveal mb-3.5 flex gap-2.5">
      <Crest seed={seed ?? name} size={34} active />
      <div className="min-w-0 flex-1 rounded-[3px_11px_11px_11px] border border-line-2 bg-panel px-3.5 py-3 text-[14px] leading-relaxed [overflow-wrap:anywhere]">
        <b className="mb-[3px] block text-[11.5px] font-semibold text-[var(--accent)]">
          {name}
        </b>
        {stripNpcPrefix(text)}
      </div>
    </div>
  );
}

/** Lời của người chơi — đảo chiều, mang huy hiệu của chính họ. */
function PlayerBubble({ text, seed }: { text: string; seed: string }) {
  return (
    <div className="reveal mb-3.5 flex flex-row-reverse gap-2.5">
      <Crest seed={seed} size={34} />
      <div className="min-w-0 flex-1 rounded-[11px_3px_11px_11px] border border-[var(--accent)]/30 bg-chip px-3.5 py-3 text-[14px] leading-relaxed [overflow-wrap:anywhere]">
        {text}
      </div>
    </div>
  );
}

export function ChatLog({
  lines,
  playerSeed,
}: {
  lines: ChatLine[];
  /** Hạt giống huy hiệu người chơi — id tài khoản, để mỗi người một mặt. */
  playerSeed: string;
}) {
  return (
    <>
      {lines.map((line, index) =>
        line.from === 'player' ? (
          <PlayerBubble key={index} text={line.text} seed={playerSeed} />
        ) : (
          <NpcBubble key={index} name={line.name ?? '?'} text={line.text} />
        ),
      )}
    </>
  );
}
