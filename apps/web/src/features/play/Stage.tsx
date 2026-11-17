/**
 * Sân khấu ca làm theo theme "Cartoon viền đen": bối cảnh nơi làm việc phủ
 * nền, nhân vật đang nói đứng bên trái (emote theo biểu cảm của nhịp), nhật
 * ký thoại dạng bong bóng bên phải, hộp thoại có bảng tên ở dưới. Bấm hộp
 * thoại (hay Space/Enter) để qua nhịp (seed khối C3).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Phone, Users, UserRound } from 'lucide-react';
import {
  CaptionStrip,
  Character,
  DialogueBox,
  EXPRESSION_MOTION,
  Emote,
  NameTag,
  SceneBackdrop,
  SpeechBubble,
  ToonBadge,
  cn,
  type Expression,
} from '@datn/ui';
import type { ShiftRun, TranscriptLine } from '../../api/types';
import {
  TOON_BACKDROPS,
  backdropFor,
  castCharacters,
  type ToonCharacter,
} from '../../lib/toon';

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
  onAdvance,
  onRevealAll,
}: {
  run: ShiftRun;
  lines: TranscriptLine[];
  current: TranscriptLine | null;
  queued: number;
  waitingLabel: string | null;
  /** Kênh của cuộc trò chuyện đang mở (đổi bối cảnh khi gặp, họp). */
  conversationChannel?: TranscriptLine['channel'] | null;
  onAdvance: () => void;
  onRevealAll: () => void;
}) {
  const cast = useMemo(() => castCharacters(run.cast), [run.cast]);
  const nameOf = useMemo(() => {
    const m = new Map(run.cast.map((c) => [c.slot, c.name]));
    return (slot: string) => m.get(slot) ?? slot;
  }, [run.cast]);
  const relationOf = (slot: string) =>
    run.cast.find((c) => c.slot === slot)?.relation;

  // Người đứng trên sân khấu: người đang nói, hoặc người nói gần nhất.
  const onStage = useMemo(() => {
    for (let i = lines.length - 1; i >= 0; i--)
      if (lines[i].kind === 'npc') return lines[i];
    return null;
  }, [lines]);
  const speaking = current?.kind === 'npc' ? current : null;
  const actor = onStage ? cast.get(onStage.speaker) : undefined;
  const expression = (speaking?.expression ?? 'binh_thuong') as Expression;

  const tw = useTypewriter(current?.text ?? '', current?.seq ?? -1);
  const ch = current?.channel ? CHANNEL[current.channel] : null;
  const backdrop = TOON_BACKDROPS[backdropFor(conversationChannel ?? null)];

  // Bàn phím: Space/Enter qua nhịp, trừ khi đang gõ trong ô nhập.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest('input, textarea, select, button, [contenteditable], dialog')
      )
        return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!tw.done) tw.finish();
        else if (queued > 0) onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tw, queued, onAdvance]);

  const tap = () => {
    if (!tw.done) tw.finish();
    else if (queued > 0) onAdvance();
  };

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
        <div className="relative flex min-h-0 flex-1">
          {/* Nhân vật: lớn trên màn rộng, ẩn trên điện thoại để nhường chỗ chữ. */}
          {actor && onStage && (
            <div className="pointer-events-none absolute -bottom-14 left-[2%] z-10 hidden h-[min(88%,560px)] md:block">
              <Character
                src={actor.src}
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
            lines={lines}
            current={current}
            nameOf={nameOf}
            cast={cast}
          />
        </div>

        {/* Hộp thoại */}
        <div className="relative z-20 px-3 pb-3 pt-5 sm:px-5 sm:pb-4">
          {queued > 1 && (
            <button
              type="button"
              onClick={onRevealAll}
              className="absolute -top-3 right-6 z-10 rounded-full border-[2.5px] border-toon-ink bg-toon-paper px-3 py-0.5 font-toon text-sm font-bold text-toon-ink shadow-toon-sm hover:-translate-y-px"
            >
              Hiện hết ({queued})
            </button>
          )}
          <button
            type="button"
            onClick={tap}
            aria-live="polite"
            className="block w-full rounded-[22px] text-left focus-visible:outline-none focus-visible:shadow-toon-focus"
          >
            {current ? (
              <DialogueBox
                narration={current.kind === 'scene'}
                more={tw.done && queued > 0}
                tag={
                  current.kind === 'scene' ? (
                    <NameTag name="Cảnh" color="#fff1c9" />
                  ) : (
                    <NameTag
                      name={nameOf(current.speaker)}
                      role={relationOf(current.speaker)}
                      color={cast.get(current.speaker)?.color}
                    />
                  )
                }
                meta={
                  ch && (
                    <ToonBadge tone="paper" icon={<ch.icon size={12} />}>
                      {ch.label}
                    </ToonBadge>
                  )
                }
                className="min-h-28 sm:min-h-32"
              >
                <p className="max-h-[26dvh] overflow-y-auto break-words pr-6">
                  {tw.visible}
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
              <DialogueBox narration>
                Ca làm sắp bắt đầu.
                {waitingLabel && <WaitingNote label={waitingLabel} />}
              </DialogueBox>
            )}
          </button>
        </div>
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
function Backlog({
  lines,
  current,
  nameOf,
  cast,
}: {
  lines: TranscriptLine[];
  current: TranscriptLine | null;
  nameOf: (slot: string) => string;
  cast: Map<string, ToonCharacter>;
}) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lines.length]);
  const past = lines.filter((l) => l !== current);
  return (
    <div
      className="relative z-0 ml-auto flex min-h-0 w-full flex-col overflow-y-auto px-3 pb-8 pt-14 [mask-image:linear-gradient(to_bottom,transparent_8px,black_64px)] sm:px-5 md:w-[min(60%,640px)] md:pr-6"
      aria-label="Lịch sử hội thoại"
    >
      <ol className="mt-auto flex flex-col gap-4">
        {past.map((l) => (
          <li key={l.seq} className="animate-toon-slide">
            <Line
              line={l}
              name={l.kind === 'npc' ? nameOf(l.speaker) : ''}
              look={l.kind === 'npc' ? cast.get(l.speaker) : undefined}
            />
          </li>
        ))}
      </ol>
      <div ref={end} />
    </div>
  );
}

function Line({
  line,
  name,
  look,
}: {
  line: TranscriptLine;
  name: string;
  look?: ToonCharacter;
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
      {look && <Avatar src={look.src} color={look.color} />}
      <div className="min-w-0">
        <span
          className="mb-1 ml-2 inline-block rounded-full border-2 border-toon-ink px-2 font-toon text-xs font-extrabold leading-5 text-toon-ink first-letter:uppercase"
          style={{ backgroundColor: look?.color ?? '#fffaf0' }}
        >
          {name}
        </span>
        <SpeechBubble tone={look?.bubble ?? 'paper'} className="break-words">
          {line.text}
        </SpeechBubble>
      </div>
    </div>
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
