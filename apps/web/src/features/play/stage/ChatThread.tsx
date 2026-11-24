/**
 * Khung tin nhắn cho kênh chat và nhóm chat: bong bóng trái (người khác) và
 * phải (bạn), mặt nhỏ bên cạnh, nhóm chat có tên người gửi. Mỗi nhịp là một
 * tin hiện ra khi người chơi bấm (seed C3: "chat hiện từng bong bóng"), nên
 * không có chữ chạy dần. Chân khung là nút qua nhịp `#stage-dialog`.
 */
import { useEffect, useRef } from 'react';
import { Bot, ChevronsDown, MessageCircle, Users } from 'lucide-react';
import { SpeechBubble, cn } from '@datn/ui';
import type { SceneView, TranscriptLine } from '../../../api/types';
import { botArt } from '../../../lib/presentation';
import { characterArt, type ToonCharacter } from '../../../lib/toon';
import { Avatar, BotAvatar } from './Avatar';
import { GlossaryText } from './GlossaryText';

export function ChatThread({
  lines,
  group,
  partner,
  members,
  nameOf,
  cast,
  botNames,
  glossary,
  more,
  waiting,
  quiet,
  joined = false,
  onTap,
}: {
  lines: TranscriptLine[];
  group: boolean;
  /** Người đang nhắn (chat 1-1), để làm tiêu đề khung. */
  partner: string;
  /** Tên các thành viên của nhóm chat. */
  members: string[];
  nameOf: (slot: string) => string;
  cast: Map<string, ToonCharacter>;
  botNames: Map<string, string>;
  glossary: SceneView['glossary'];
  more: boolean;
  /** Đang chờ người kia gõ tiếp: hiện ba chấm như đang soạn tin. */
  waiting: string | null;
  quiet: boolean;
  /** Khung trả lời nằm ngay dưới: bỏ bo góc dưới để hai phần thành một khối. */
  joined?: boolean;
  onTap: () => void;
}) {
  const list = useRef<HTMLOListElement>(null);
  const shown = quiet ? lines.slice(-1) : lines;
  const partnerLook = cast.get(partner);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown.length, waiting]);

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[22px] border-[3px] border-toon-ink bg-toon-paper',
        joined && 'rounded-b-none',
      )}
    >
      <header
        className="flex items-center gap-3 border-b-[3px] border-toon-ink px-4 py-2.5"
        style={{ backgroundColor: group ? '#d6ecf7' : partnerLook?.color }}
      >
        {group ? (
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full border-[2.5px] border-toon-ink bg-toon-paper shadow-toon-sm"
          >
            <Users size={20} strokeWidth={2.6} />
          </span>
        ) : (
          partnerLook && (
            <Avatar
              src={characterArt(partnerLook)}
              color={partnerLook.color}
              size={40}
            />
          )
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-toon text-lg font-extrabold leading-tight text-toon-ink first-letter:uppercase">
            {group ? 'Nhóm chat' : nameOf(partner)}
          </p>
          <p className="truncate text-xs font-semibold text-toon-ink/75">
            {group ? members.join(', ') : 'Đang nhắn tin'}
          </p>
        </div>
        <MessageCircle
          size={20}
          strokeWidth={2.6}
          className="shrink-0 text-toon-ink/70"
          aria-hidden
        />
      </header>

      <ol
        ref={list}
        aria-label={group ? 'Tin nhắn nhóm chat' : 'Tin nhắn'}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-4 pt-4 @md:px-4"
      >
        {shown.map((line, i) => (
          <li key={line.seq} className="animate-toon-slide">
            <Message
              line={line}
              previous={shown[i - 1]}
              group={group}
              nameOf={nameOf}
              cast={cast}
              botNames={botNames}
              glossary={glossary}
            />
          </li>
        ))}
        {waiting && (
          <li role="status" className="flex items-end gap-2">
            {partnerLook && !group ? (
              <Avatar
                src={characterArt(partnerLook)}
                color={partnerLook.color}
                size={32}
              />
            ) : (
              <span aria-hidden className="size-8 shrink-0" />
            )}
            <SpeechBubble className="flex items-center gap-2 py-2.5">
              <span aria-hidden className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-2 animate-bounce rounded-full border-2 border-toon-ink bg-toon-mustard"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </span>
              <span className="sr-only">{waiting}</span>
            </SpeechBubble>
          </li>
        )}
      </ol>

      <button
        id="stage-dialog"
        type="button"
        onClick={onTap}
        aria-label="Nghe nhịp tiếp theo"
        className={cn(
          'flex w-full items-center justify-center gap-2 border-t-[3px] border-toon-ink px-4 py-2.5 font-toon text-sm font-extrabold focus-visible:outline-none focus-visible:shadow-toon-focus',
          more
            ? 'bg-toon-mustard text-toon-ink'
            : 'bg-toon-cream text-toon-ink-soft',
        )}
      >
        {more ? (
          <>
            Đọc tin tiếp
            <ChevronsDown
              size={16}
              strokeWidth={3}
              className="animate-bounce"
              aria-hidden
            />
          </>
        ) : (
          'Hết tin mới'
        )}
      </button>
    </div>
  );
}

function Message({
  line,
  previous,
  group,
  nameOf,
  cast,
  botNames,
  glossary,
}: {
  line: TranscriptLine;
  previous?: TranscriptLine;
  group: boolean;
  nameOf: (slot: string) => string;
  cast: Map<string, ToonCharacter>;
  botNames: Map<string, string>;
  glossary: SceneView['glossary'];
}) {
  if (line.kind === 'player') {
    return (
      <div className="ml-auto flex max-w-[85%] flex-col items-end">
        <SpeechBubble side="right" tone="mustard" className="break-words">
          {line.text}
        </SpeechBubble>
        <span className="mr-2 mt-2 text-[11px] font-bold text-toon-ink-soft">
          Bạn
        </span>
      </div>
    );
  }
  if (line.kind === 'system') {
    const name = botNames.get(line.speaker) ?? line.speaker;
    const art = botArt(line.speaker);
    return (
      <div className="flex items-start gap-2 rounded-xl border-2 border-toon-ink bg-[#e2eeef] px-3 py-2 text-toon-ink shadow-toon-sm">
        {art ? (
          <BotAvatar src={art} size={28} />
        ) : (
          <Bot
            size={20}
            className="mt-0.5 shrink-0 text-[#28596a]"
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <p className="font-toon text-sm font-extrabold">{name}</p>
          <p className="break-words text-sm font-semibold">{line.text}</p>
        </div>
      </div>
    );
  }
  const look = cast.get(line.speaker);
  const sameSender =
    previous?.kind === 'npc' && previous.speaker === line.speaker;
  return (
    <div className="flex max-w-[88%] items-end gap-2">
      {look && !sameSender ? (
        <Avatar
          src={characterArt(look, line.expression)}
          color={look.color}
          size={32}
        />
      ) : (
        <span aria-hidden className="size-8 shrink-0" />
      )}
      <div className="min-w-0">
        {group && !sameSender && (
          <span
            className="mb-1 ml-2 inline-block rounded-full border-2 border-toon-ink px-2 font-toon text-xs font-extrabold leading-5 text-toon-ink first-letter:uppercase"
            style={{ backgroundColor: look?.color ?? '#fffaf0' }}
          >
            {nameOf(line.speaker)}
          </span>
        )}
        <SpeechBubble tone={look?.bubble ?? 'paper'} className="break-words">
          <GlossaryText text={line.text} glossary={glossary} />
        </SpeechBubble>
      </div>
    </div>
  );
}
