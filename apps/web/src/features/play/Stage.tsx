/**
 * Sân khấu: chân dung người đang nói, hộp thoại nhịp mới nhất, và dòng
 * hội thoại đã qua. Bấm (hay Space/Enter) để qua nhịp (seed khối C3).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronsRight,
  MessageCircle,
  Phone,
  Users,
  UserRound,
} from 'lucide-react';
import { Portrait, Sparkle, cn, type Expression } from '@datn/ui';
import type { ShiftRun, TranscriptLine } from '../../api/types';

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
  onAdvance,
  onRevealAll,
}: {
  run: ShiftRun;
  lines: TranscriptLine[];
  current: TranscriptLine | null;
  queued: number;
  waitingLabel: string | null;
  onAdvance: () => void;
  onRevealAll: () => void;
}) {
  const nameOf = useMemo(() => {
    const m = new Map(run.cast.map((c) => [c.slot, c.name]));
    return (slot: string) => m.get(slot) ?? slot;
  }, [run.cast]);
  const relationOf = (slot: string) =>
    run.cast.find((c) => c.slot === slot)?.relation;

  const isNpc = current?.kind === 'npc';
  const speaker = isNpc ? current.speaker : null;
  const tw = useTypewriter(current?.text ?? '', current?.seq ?? -1);
  const ch = current?.channel ? CHANNEL[current.channel] : null;

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
      className="flex min-h-0 flex-1 flex-col"
    >
      <History
        lines={lines}
        current={current}
        nameOf={nameOf}
        reserve={Boolean(speaker)}
      />

      {/* Hộp thoại */}
      <div className="relative px-3 pb-3 sm:px-5">
        {speaker && (
          <div className="pointer-events-none absolute -top-[150px] left-4 z-10 hidden sm:block">
            <Portrait
              seed={speaker}
              name={nameOf(speaker)}
              expression={current?.expression as Expression | undefined}
              size={168}
            />
          </div>
        )}
        <button
          type="button"
          onClick={tap}
          aria-live="polite"
          className={cn(
            'glass relative w-full rounded-xl p-4 text-left shadow-lift transition-colors focus-visible:outline-none focus-visible:shadow-focus sm:min-h-32 sm:p-5',
            speaker && 'sm:pl-[184px]',
            queued > 0 && 'border-line-gold',
          )}
        >
          {current ? (
            <>
              <div className="mb-1.5 flex items-center gap-2">
                {speaker && (
                  <span className="sm:hidden">
                    <Portrait
                      seed={speaker}
                      expression={current.expression as Expression | undefined}
                      size={36}
                      framed
                    />
                  </span>
                )}
                <span className="font-semibold text-gold-200">
                  {current.kind === 'scene' ? 'Cảnh' : nameOf(current.speaker)}
                </span>
                {speaker && relationOf(speaker) && (
                  <span className="hidden truncate text-xs text-ink-faint md:inline">
                    · {relationOf(speaker)}
                  </span>
                )}
                {ch && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-night-950/60 px-2 py-0.5 text-[11px] text-ink-faint">
                    <ch.icon size={12} aria-hidden /> {ch.label}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  'max-h-[30dvh] overflow-y-auto break-words text-[15px] leading-relaxed sm:text-base',
                  current.kind === 'scene'
                    ? 'italic text-ink-muted'
                    : 'text-ink',
                )}
              >
                {tw.visible}
                {!tw.done && (
                  <span className="ml-0.5 inline-block w-1.5 animate-pulse bg-gold-300/80">
                    &nbsp;
                  </span>
                )}
              </p>
              {tw.done && queued > 0 && (
                <span className="absolute bottom-3 right-4 inline-flex items-center gap-1 text-xs font-semibold text-gold-300">
                  Tiếp <ChevronsRight size={14} className="animate-pulse" />
                </span>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-faint">Ca làm sắp bắt đầu.</p>
          )}
          {waitingLabel && !queued && (
            <p
              className="mt-2 inline-flex items-center gap-2 text-xs text-ink-faint"
              role="status"
            >
              <TypingDots /> {waitingLabel}
            </p>
          )}
        </button>
        {queued > 1 && (
          <button
            type="button"
            onClick={onRevealAll}
            className="absolute -top-8 right-6 rounded-full bg-night-900/80 px-3 py-1 text-xs text-ink-muted hover:text-ink"
          >
            Hiện hết ({queued})
          </button>
        )}
      </div>
    </section>
  );
}

function TypingDots() {
  return (
    <span aria-hidden className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full bg-gold-300"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Lịch sử thoại: cuộn được, dòng mới nhất ở dưới; dòng đang ở hộp thoại không lặp lại. */
function History({
  lines,
  current,
  nameOf,
  reserve,
}: {
  lines: TranscriptLine[];
  current: TranscriptLine | null;
  nameOf: (slot: string) => string;
  /** Chừa chỗ phía dưới cho chân dung lớn đang đứng trên hộp thoại. */
  reserve: boolean;
}) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lines.length]);
  const past = lines.filter((l) => l !== current);
  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-4 sm:px-5',
        reserve && 'sm:pb-40',
      )}
      aria-label="Lịch sử hội thoại"
    >
      <ol className="mx-auto flex max-w-2xl flex-col gap-3">
        {past.map((l) => (
          <li key={l.seq} className="animate-fade">
            <Line line={l} name={l.kind === 'npc' ? nameOf(l.speaker) : ''} />
          </li>
        ))}
      </ol>
      <div ref={end} />
    </div>
  );
}

function Line({ line, name }: { line: TranscriptLine; name: string }) {
  if (line.kind === 'player') {
    return (
      <div className="ml-auto max-w-[85%] break-words rounded-lg rounded-br-sm border border-gold-500/35 bg-gold-900/35 px-3.5 py-2 text-sm text-gold-100">
        {line.text}
      </div>
    );
  }
  if (line.kind === 'scene') {
    return (
      <p className="mx-auto flex max-w-[90%] items-start justify-center gap-2 text-center text-sm italic text-ink-faint">
        <Sparkle size={10} className="mt-1.5 text-gold-400/70" /> {line.text}
      </p>
    );
  }
  if (line.kind === 'system') {
    return (
      <p className="text-center">
        <span className="inline-block rounded-full border border-line bg-night-900/70 px-3 py-1 text-[11px] text-ink-faint">
          {line.text}
        </span>
      </p>
    );
  }
  return (
    <div className="flex max-w-[88%] items-end gap-2">
      <Portrait
        seed={line.speaker}
        expression={line.expression as Expression | undefined}
        size={32}
        framed
      />
      <div>
        <p className="mb-0.5 text-[11px] font-semibold text-night-300">
          {name}
        </p>
        <p className="rounded-lg rounded-bl-sm border border-line bg-night-800/80 px-3.5 py-2 text-sm break-words text-ink">
          {line.text}
        </p>
      </div>
    </div>
  );
}
