/**
 * Sân khấu ca làm theo theme "Cartoon viền đen": bối cảnh nơi làm việc phủ
 * nền, nhân vật đang nói đứng bên trái (emote theo biểu cảm của nhịp), nhật
 * ký thoại dạng bong bóng bên phải, hộp thoại có bảng tên ở dưới. Bấm hộp
 * thoại (hay Space/Enter) để qua nhịp (seed khối C3).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  History,
  MessageCircle,
  Phone,
  Users,
  UserRound,
} from 'lucide-react';
import {
  CaptionStrip,
  Character,
  DialogueBox,
  EXPRESSION_MOTION,
  Emote,
  NameTag,
  SceneBackdrop,
  Sheet,
  SpeechBubble,
  ToonBadge,
  cn,
  type Expression,
} from '@datn/ui';
import type { SceneView, ShiftRun, TranscriptLine } from '../../api/types';
import {
  castCharacters,
  characterArt,
  type ToonCharacter,
} from '../../lib/toon';
import { botArt, sceneBackdrop } from '../../lib/presentation';
import { Avatar, BotAvatar } from './stage/Avatar';
import { BotNotice } from './stage/BotNotice';
import { CallCard } from './stage/CallCard';
import { ChatThread } from './stage/ChatThread';
import {
  conversationBeat,
  isBotLine,
  stageForm,
  threadLines,
} from './stage/form';
import { GlossaryText } from './stage/GlossaryText';

export { Avatar };

const CHANNEL = {
  chat: { label: 'Tin nhắn', icon: MessageCircle },
  call: { label: 'Cuộc gọi', icon: Phone },
  meet: { label: 'Gặp trực tiếp', icon: UserRound },
  group: { label: 'Nhóm chat', icon: Users },
} as const;

/** Chữ hiện dần như đang nói; giảm chuyển động thì hiện ngay. */
function useTypewriter(text: string, key: number) {
  const [n, setN] = useState(text.length);
  useEffect(() => {
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 2;
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [text, key]);
  return {
    visible: text.slice(0, n),
    done: n >= text.length,
    finish: () => setN(text.length),
  };
}

export function Stage({
  run,
  lines,
  current,
  queued,
  waitingLabel,
  conversationChannel,
  talking,
  quiet = false,
  inactive = false,
  bots = [],
  castStatus = [],
  glossary = [],
  onAdvance,
}: {
  run: ShiftRun;
  lines: TranscriptLine[];
  current: TranscriptLine | null;
  queued: number;
  waitingLabel: string | null;
  /** Kênh của cuộc trò chuyện đang mở (đổi bối cảnh khi gặp, họp). */
  conversationChannel?: TranscriptLine['channel'] | null;
  /** Ai đang nói với người chơi, để chọn bối cảnh riêng của seed. */
  talking?: { channel: 'chat' | 'call' | 'meet' | 'group'; slots: string[] };
  /** Đang chọn phương án có đếm giờ: cất các câu cũ để chỉ còn câu hỏi. */
  quiet?: boolean;
  inactive?: boolean;
  bots?: SceneView['bots'];
  castStatus?: SceneView['cast'];
  glossary?: SceneView['glossary'];
  onAdvance: () => void;
}) {
  const cast = useMemo(() => castCharacters(run.cast), [run.cast]);
  const nameOf = useMemo(() => {
    const m = new Map(run.cast.map((c) => [c.slot, c.name]));
    return (slot: string) => m.get(slot) ?? slot;
  }, [run.cast]);

  // Người đứng trên sân khấu: người đang nói, hoặc người nói gần nhất.
  const botNames = useMemo(
    () => new Map(bots.map(({ id, name }) => [id, name])),
    [bots],
  );
  const statuses = useMemo(
    () => new Map(castStatus.map(({ slot, status }) => [slot, status])),
    [castStatus],
  );
  // Chỉ người gặp trực tiếp mới đứng trên sân khấu; chat và gọi điện có khung riêng.
  const onStage = useMemo(() => {
    for (let i = lines.length - 1; i >= 0; i--)
      if (lines[i].kind === 'npc')
        return !lines[i].channel || lines[i].channel === 'meet'
          ? lines[i]
          : null;
    return null;
  }, [lines]);
  const botIds = useMemo(() => new Set(bots.map(({ id }) => id)), [bots]);
  // Tin bot hiện thành thẻ thông báo; hộp thoại giữ nhịp trò chuyện trước nó.
  const notice = current && isBotLine(current, botIds) ? current : null;
  const beat = conversationBeat(lines, current, botIds);
  const form = stageForm(beat);
  const speaking = beat?.kind === 'npc' ? beat : null;
  const currentName = beat?.kind === 'scene' ? '' : nameOf(beat?.speaker ?? '');
  const actor = onStage ? cast.get(onStage.speaker) : undefined;
  const speakerLook = beat ? cast.get(beat.speaker) : undefined;
  const expression = (speaking?.expression ?? 'binh_thuong') as Expression;

  const tw = useTypewriter(beat?.text ?? '', beat?.seq ?? -1);
  // Khung tin nhắn hiện nguyên tin, không chạy chữ.
  const done = form === 'thread' || tw.done;
  const ch = beat?.channel ? CHANNEL[beat.channel] : null;
  const backdrop = sceneBackdrop({
    seedId: run.taskId,
    channel: conversationChannel,
    talking,
    lines,
  });

  // Bàn phím: Space/Enter qua nhịp, trừ khi đang gõ trong ô nhập.
  useEffect(() => {
    if (inactive) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest(
          'input, textarea, select, button, [contenteditable], dialog, [role="dialog"]',
        )
      )
        return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!done) tw.finish();
        else if (queued > 0) onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tw, done, queued, onAdvance, inactive]);

  const tap = () => {
    if (!done) tw.finish();
    else if (queued > 0) onAdvance();
  };

  const thread = form === 'thread';
  const call = form === 'call';
  // Cuộc gọi chỉ coi là xong khi không còn cuộc trò chuyện qua điện thoại và hết nhịp chờ đọc.
  const callLive = talking?.channel === 'call' || queued > 0;
  const group = beat?.channel === 'group';
  const dialogueTag =
    beat?.kind === 'scene' ? undefined : (
      <span className="flex items-end gap-2">
        {/* Điện thoại không có nhân vật đứng: mặt và emote đi cùng bảng tên. */}
        {speakerLook && !call && (
          <span className="relative -translate-y-3 md:hidden">
            <Avatar
              src={characterArt(speakerLook, speaking?.expression)}
              color={speakerLook.color}
              size={48}
              className={cn(
                speaking &&
                  EXPRESSION_MOTION[expression] === 'hop' &&
                  'animate-toon-hop',
                speaking &&
                  EXPRESSION_MOTION[expression] === 'shake' &&
                  'animate-toon-shake',
              )}
            />
            {speaking && expression !== 'binh_thuong' && (
              <span key={speaking.seq} className="absolute -left-4 -top-10">
                <Emote expression={expression} size={40} />
              </span>
            )}
          </span>
        )}
        <NameTag name={currentName} color={speakerLook?.color} />
        <Presence text={statuses.get(beat?.speaker ?? '')} />
      </span>
    );

  return (
    <section
      aria-label="Diễn biến ca làm"
      className="relative flex min-h-0 flex-1 flex-col"
    >
      <SceneBackdrop
        src={backdrop}
        dim={0.6}
        className="flex min-h-0 flex-1 flex-col"
      >
        {notice && (
          <BotNotice
            key={notice.seq}
            name={botNames.get(notice.speaker) ?? notice.speaker}
            text={notice.text}
            art={botArt(notice.speaker)}
          />
        )}
        {/* Đọc trọn câu một lần cho trình đọc màn hình, không theo từng chữ đang gõ. */}
        <p className="sr-only" aria-live="polite">
          {beat
            ? beat.kind === 'scene'
              ? beat.text
              : `${currentName}: ${beat.text}`
            : ''}
        </p>
        {thread ? (
          <div
            className={cn(
              'relative flex min-h-0 flex-1 justify-center px-3 pb-3 sm:px-5',
              notice ? 'pt-3' : 'pt-14',
            )}
          >
            <ChatThread
              lines={threadLines(lines, botIds, notice)}
              group={group}
              partner={beat?.speaker ?? ''}
              members={(talking?.slots ?? []).map(nameOf)}
              nameOf={nameOf}
              cast={cast}
              botNames={botNames}
              glossary={glossary}
              more={queued > 0}
              waiting={queued ? null : waitingLabel}
              quiet={quiet}
              onTap={tap}
            />
            <Backlog
              recent={false}
              quiet={quiet}
              lines={lines}
              current={beat}
              notice={notice}
              nameOf={nameOf}
              cast={cast}
              botNames={botNames}
              statuses={statuses}
              glossary={glossary}
            />
          </div>
        ) : (
          <>
            <div
              className={cn(
                'relative flex min-h-0 flex-1',
                call && 'max-md:flex-col',
              )}
            >
              {call && beat && (
                <CallCard
                  look={speakerLook}
                  name={currentName}
                  callKey={beat.context}
                  live={callLive}
                  expression={speaking?.expression}
                  className={cn(
                    'max-md:mx-3 md:absolute md:left-[4%] md:top-1/2 md:-translate-y-1/2',
                    notice ? 'max-md:mt-3' : 'max-md:mt-14',
                  )}
                />
              )}
              {/* Nhân vật: lớn trên màn rộng, ẩn trên điện thoại để nhường chỗ chữ. */}
              {!call && actor && onStage && (
                <div className="pointer-events-none absolute -bottom-14 left-[2%] z-10 hidden h-[min(88%,560px)] md:block">
                  <Character
                    src={characterArt(actor, speaking?.expression)}
                    name={nameOf(onStage.speaker)}
                    height="100%"
                    dimmed={!speaking}
                    flip={actor.facing === 'left'}
                    motion={speaking ? EXPRESSION_MOTION[expression] : 'none'}
                    beat={speaking?.seq}
                    emote={
                      speaking && expression !== 'binh_thuong' ? (
                        <Emote expression={expression} size={64} />
                      ) : null
                    }
                  />
                </div>
              )}
              <Backlog
                recent
                tightTop={call}
                quiet={quiet}
                lines={lines}
                current={beat}
                notice={notice}
                nameOf={nameOf}
                cast={cast}
                botNames={botNames}
                statuses={statuses}
                glossary={glossary}
              />
            </div>

            {/* Hộp thoại */}
            <div className="relative z-20 px-3 pb-3 pt-5 sm:px-5 sm:pb-4">
              <div className="relative">
                <button
                  id="stage-dialog"
                  type="button"
                  onClick={tap}
                  aria-label={done ? 'Nghe nhịp tiếp theo' : 'Hiện trọn câu'}
                  className="absolute inset-0 z-[1] rounded-[22px] focus-visible:outline-none focus-visible:shadow-toon-focus"
                />
                {beat ? (
                  <DialogueBox
                    narration={beat.kind === 'scene'}
                    more={done && queued > 0}
                    tag={dialogueTag}
                    meta={
                      ch && (
                        <ToonBadge tone="paper" icon={<ch.icon size={12} />}>
                          {ch.label}
                        </ToonBadge>
                      )
                    }
                    className="min-h-20 sm:min-h-28"
                  >
                    <p className="stage-dialogue-text max-h-[26dvh] overflow-y-auto break-words pr-6">
                      {speaking ? (
                        <GlossaryText
                          text={speaking.text}
                          visible={tw.visible.length}
                          glossary={glossary}
                        />
                      ) : (
                        tw.visible
                      )}
                      {!tw.done && (
                        <span
                          aria-hidden
                          className="ml-0.5 inline-block w-2 animate-pulse bg-toon-ink/70"
                        >
                          &nbsp;
                        </span>
                      )}
                    </p>
                    {waitingLabel && !queued && (
                      <WaitingNote label={waitingLabel} />
                    )}
                  </DialogueBox>
                ) : (
                  <DialogueBox narration more={queued > 0}>
                    {notice ? 'Có thông báo mới.' : 'Ca làm sắp bắt đầu.'}
                    {waitingLabel && <WaitingNote label={waitingLabel} />}
                  </DialogueBox>
                )}
              </div>
            </div>
          </>
        )}
      </SceneBackdrop>
    </section>
  );
}

function WaitingNote({ label }: { label: string }) {
  return (
    <span
      role="status"
      className="mt-2 flex items-center gap-2 text-sm font-semibold not-italic text-toon-ink-soft"
    >
      <TypingDots /> {label}
    </span>
  );
}

function TypingDots() {
  return (
    <span aria-hidden className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-bounce rounded-full border-2 border-toon-ink bg-toon-mustard"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  );
}

/**
 * Nhật ký thoại: cuộn được, dòng mới nhất ở dưới; dòng đang ở hộp thoại
 * không lặp lại. Trên màn rộng nằm bên phải nhân vật.
 */
/** Số câu đã qua để lại trên sân khấu; phần còn lại xem trong nhật ký. */
const BACKLOG_VISIBLE = 2;
/** Lời người chơi cũ hơn số câu này thì không còn giữ trên điện thoại. */
const MOBILE_PLAYER_WINDOW = 4;

/**
 * Nhật ký thoại trên sân khấu: chỉ hai câu gần nhất (mờ dần) để người chơi
 * không bị một mớ chữ đập vào mắt; toàn bộ hội thoại mở trong tấm "Xem lại".
 */
function Backlog({
  lines,
  current,
  notice,
  nameOf,
  cast,
  quiet,
  recent: showRecent,
  tightTop = false,
  botNames,
  statuses,
  glossary,
}: {
  quiet: boolean;
  /** Tắt khi khung tin nhắn đã hiện hội thoại: chỉ còn nút và tấm "Xem lại". */
  recent: boolean;
  /** Phía trên đã có thẻ cuộc gọi, không cần chừa chỗ cho nút lịch sử. */
  tightTop?: boolean;
  lines: TranscriptLine[];
  /** Nhịp đang ở hộp thoại, không lặp lại ở nhật ký. */
  current: TranscriptLine | null;
  /** Tin bot đang hiện thành thẻ thông báo. */
  notice: TranscriptLine | null;
  nameOf: (slot: string) => string;
  cast: Map<string, ToonCharacter>;
  botNames: Map<string, string>;
  statuses: Map<string, string | undefined>;
  glossary: SceneView['glossary'];
}) {
  const [open, setOpen] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const past = lines.filter((l) => l !== current && l !== notice);
  const latest = past.slice(-BACKLOG_VISIBLE);
  // Trên điện thoại chỉ có chỗ cho câu mới nhất, nhưng lời người chơi vừa gửi
  // phải còn đó tới lần gửi sau, nếu chưa quá xa.
  const lastPlayer = past
    .slice(-MOBILE_PLAYER_WINDOW)
    .filter((line) => line.kind === 'player')
    .pop();
  const visible =
    lastPlayer && !latest.includes(lastPlayer)
      ? [lastPlayer, ...latest]
      : latest;
  const recent = quiet
    ? visible.filter(
        (line) => line.kind === 'system' && botNames.has(line.speaker),
      )
    : visible;
  useEffect(() => {
    if (!open) return;
    end.current?.scrollIntoView({ block: 'end' });
  }, [open, lines.length]);
  const render = (l: TranscriptLine) => (
    <Line
      line={l}
      name={l.kind === 'npc' ? nameOf(l.speaker) : ''}
      look={l.kind === 'npc' ? cast.get(l.speaker) : undefined}
      bot={l.kind === 'system' ? botNames.get(l.speaker) : undefined}
      status={statuses.get(l.speaker)}
      glossary={glossary}
    />
  );
  return (
    <>
      {showRecent && (
        <div
          className={cn(
            'relative z-0 ml-auto flex min-h-0 w-full flex-col justify-end px-3 pb-16 sm:px-5 md:w-[min(58%,600px)] md:pb-8 md:pt-14 md:pr-6',
            // Màn gọi đã có thẻ cuộc gọi chừa chỗ cho nút lịch sử ở trên.
            tightTop ? 'pt-2 max-md:pb-8' : 'pt-14',
          )}
          aria-label="Lời thoại gần nhất"
        >
          <ol className="flex flex-col gap-4">
            {recent.map((l, i) => (
              <li
                key={l.seq}
                className={cn(
                  'animate-toon-slide transition-opacity',
                  // Màn gọi trên điện thoại chỉ đủ chỗ cho lời người chơi vừa gửi.
                  tightTop &&
                    lastPlayer &&
                    i === recent.length - 1 &&
                    l !== lastPlayer &&
                    'max-md:hidden',
                  i < recent.length - 1 &&
                    (l === lastPlayer
                      ? latest.includes(l)
                        ? 'opacity-60'
                        : 'opacity-60 md:hidden'
                      : 'opacity-60 max-md:hidden'),
                )}
              >
                {render(l)}
              </li>
            ))}
          </ol>
        </div>
      )}
      {past.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-toon-ink bg-toon-paper px-3 py-1 font-toon text-sm font-bold text-toon-ink shadow-toon-sm transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:shadow-toon-focus sm:right-5"
        >
          <History size={15} strokeWidth={2.6} aria-hidden />
          <span className="sr-only sm:not-sr-only">Xem lại hội thoại</span>
          <span className="tabular rounded-full bg-toon-cream px-1.5 text-xs">
            {past.length}
          </span>
        </button>
      )}
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        theme="toon"
        title="Hội thoại trong ca"
      >
        <ol className="flex flex-col gap-4" aria-label="Lịch sử hội thoại">
          {past.map((l) => (
            <li key={l.seq}>{render(l)}</li>
          ))}
        </ol>
        <div ref={end} />
      </Sheet>
    </>
  );
}

function Line({
  line,
  name,
  look,
  bot,
  status,
  glossary,
}: {
  line: TranscriptLine;
  name: string;
  look?: ToonCharacter;
  bot?: string;
  status?: string;
  glossary: SceneView['glossary'];
}) {
  if (line.kind === 'player') {
    return (
      <div className="ml-auto flex max-w-[85%] flex-col items-end">
        <span className="mb-1 mr-2 rounded-full border-2 border-toon-ink bg-toon-paper px-2 font-toon text-xs font-extrabold leading-5 text-toon-ink">
          Bạn
        </span>
        <SpeechBubble side="right" tone="mustard" className="break-words">
          {line.text}
        </SpeechBubble>
      </div>
    );
  }
  if (line.kind === 'scene') {
    return <CaptionStrip>{line.text}</CaptionStrip>;
  }
  if (line.kind === 'system' && bot) {
    return (
      <div className="flex items-start gap-2 rounded-xl border-2 border-toon-ink bg-[#e2eeef] px-3 py-2 text-toon-ink shadow-toon-sm">
        {botArt(line.speaker) ? (
          <BotAvatar src={botArt(line.speaker) ?? ''} size={32} />
        ) : (
          <Bot
            size={20}
            className="mt-0.5 shrink-0 text-[#28596a]"
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <p className="font-toon text-sm font-extrabold">{bot}</p>
          <p className="break-words text-sm font-semibold">{line.text}</p>
        </div>
      </div>
    );
  }
  if (line.kind === 'system') {
    return (
      <p className="text-center">
        <span className="inline-block rounded-full border-2 border-toon-ink bg-toon-sand px-3 py-0.5 text-xs font-bold text-toon-ink-soft">
          {line.text}
        </span>
      </p>
    );
  }
  return (
    <div className="flex max-w-[88%] items-end gap-2">
      {look && (
        <Avatar src={characterArt(look, line.expression)} color={look.color} />
      )}
      <div className="min-w-0">
        <span
          className="mb-1 ml-2 inline-block rounded-full border-2 border-toon-ink px-2 font-toon text-xs font-extrabold leading-5 text-toon-ink first-letter:uppercase"
          style={{ backgroundColor: look?.color ?? '#fffaf0' }}
        >
          {name}
        </span>
        <Presence text={status} />
        <SpeechBubble tone={look?.bubble ?? 'paper'} className="break-words">
          <GlossaryText text={line.text} glossary={glossary} />
        </SpeechBubble>
      </div>
    </div>
  );
}

function Presence({ text }: { text?: string }) {
  return text ? (
    <span className="inline-block rounded-full border border-toon-ink bg-[#ffe4a3] px-2 py-0.5 text-xs font-bold leading-tight text-toon-ink">
      {text}
    </span>
  ) : null;
}
