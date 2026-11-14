import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { stripNpcPrefix } from '@datn/game-core';
import { cx } from '../../lib/cx';
import { allImages, type Expression, type SceneArt } from './sceneArt';

/** Pha của màn chơi mà cảnh cần biết — do máy chủ quyết. */
export type ScenePhase = 'answering' | 'busy' | 'followup' | 'closing';

interface Speaker {
  npcKey: string;
  name: string;
}

interface Line {
  /** `null`: lời dẫn truyện. */
  speaker: Speaker | null;
  text: string;
  expression: Expression;
}

interface Dialogue {
  lines: Line[];
  index: number;
  /** Đọc xong thì làm gì: mở thẻ trả lời, hay sang hoạt động kế. */
  after: 'activity' | 'continue';
}

interface VisualNovelRunProps {
  art: SceneArt;
  activityKey: string;
  step: { current: number; total: number };
  setup: string;
  npc: (Speaker & { line: string }) | null;
  phase: ScenePhase;
  followup: (Speaker & { no: number; question: string }) | null;
  closingLine: string | null;
  /** Gợi ý vừa xem: NPC nói ra trong cảnh rồi trả lượt cho người chơi. */
  hint: { npcKey: string; text: string } | null;
  /** Tên NPC theo khoá, để đọc người nói của lời kết ("An: '…'"). */
  names: Record<string, string>;
  onContinue: () => void;
  /** Thẻ trả lời, hiện dưới cảnh khi tới lượt người chơi. */
  children: ReactNode;
}

/**
 * Cảnh kiểu visual novel cho màn chơi (E11, D-05): nền theo hoạt động, nhân
 * vật đứng trong cảnh, khung thoại có chân dung đổi biểu cảm. Diễn tiến do
 * máy chủ quyết: hoạt động từ `ActivityView`, hỏi vặn và lời kết từ luồng sự
 * kiện. Lượt trả lời hiện ngay dưới cảnh để cảnh không bị che.
 */
export function VisualNovelRun({
  art,
  activityKey,
  step,
  setup,
  npc,
  phase,
  followup,
  closingLine,
  hint,
  names,
  onContinue,
  children,
}: VisualNovelRunProps) {
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [onStage, setOnStage] = useState<string | null>(null);
  const [mood, setMood] = useState<Expression>('neutral');

  // Tải trước mọi tranh của cảnh, đổi nền không bị nháy.
  useEffect(() => {
    for (const src of allImages(art)) new Image().src = src;
  }, [art]);

  const play = useCallback((lines: Line[], after: Dialogue['after']) => {
    setDialogue({ lines, index: 0, after });
  }, []);

  /* ── Hoạt động mới: dẫn truyện rồi NPC nói ── */
  useEffect(() => {
    const lines: Line[] = [
      { speaker: null, text: setup, expression: 'neutral' },
    ];
    if (npc)
      lines.push({ speaker: npc, text: npc.line, expression: 'neutral' });
    setOnStage(npc && art.characters[npc.npcKey] ? npc.npcKey : null);
    setMood('neutral');
    play(lines, 'activity');
    // Chỉ chạy lại khi sang hoạt động khác.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityKey]);

  /* ── Máy chủ đổi pha: hỏi vặn, chờ chấm, lời kết ── */
  useEffect(() => {
    if (phase === 'followup' && followup) {
      if (art.characters[followup.npcKey]) setOnStage(followup.npcKey);
      play(
        [
          {
            speaker: followup,
            text: followup.question,
            expression: 'skeptical',
          },
        ],
        'activity',
      );
    } else if (phase === 'closing' && closingLine) {
      const name = closingLine.match(/^([^:]{1,14}):/)?.[1].trim();
      const key = name
        ? (Object.keys(names).find((k) => names[k] === name) ?? null)
        : null;
      play(
        [
          {
            speaker: key && name ? { npcKey: key, name } : null,
            text: stripNpcPrefix(closingLine),
            expression: 'smile',
          },
        ],
        'continue',
      );
    } else if (phase === 'busy') {
      setMood('skeptical');
    }
  }, [phase, followup, closingLine, names, art, play]);

  /* ── Xem gợi ý: NPC nói gợi ý, vẻ mặt vui vẻ ── */
  const hintText = hint?.text ?? null;
  // Gợi ý đã xem từ trước khi tải lại trang thì không đọc lại.
  const lastHint = useRef(hintText);
  useEffect(() => {
    if (hintText === lastHint.current) return;
    lastHint.current = hintText;
    if (!hint || !hintText) return;
    play(
      [
        {
          speaker: {
            npcKey: hint.npcKey,
            name: names[hint.npcKey] ?? hint.npcKey,
          },
          text: hintText,
          expression: 'smile',
        },
      ],
      'activity',
    );
    // Chỉ chạy khi có gợi ý mới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintText]);

  const line = dialogue?.lines[dialogue.index] ?? null;

  useEffect(() => {
    if (!line) return;
    if (line.speaker && art.characters[line.speaker.npcKey])
      setOnStage(line.speaker.npcKey);
    setMood(line.expression);
  }, [line, art]);

  const reading = dialogue !== null;

  const advance = useCallback(() => {
    if (!dialogue) return;
    if (dialogue.index + 1 < dialogue.lines.length) {
      setDialogue({ ...dialogue, index: dialogue.index + 1 });
      return;
    }
    // Giữ câu cuối trên khung thoại làm đề trong lúc người chơi trả lời.
    setDialogue(null);
    if (dialogue.after === 'continue') onContinue();
  }, [dialogue, onContinue]);

  // Câu đang ghim khi đã tới lượt người chơi.
  const [pinned, setPinned] = useState<Line | null>(null);
  useEffect(() => {
    if (line) setPinned(line);
  }, [line]);

  const background = art.backgrounds[activityKey] ?? art.defaultBackground;
  const character = onStage ? art.characters[onStage] : undefined;
  const shown = line ?? pinned;
  const speakerArt = shown?.speaker
    ? art.characters[shown.speaker.npcKey]
    : undefined;
  const portrait =
    speakerArt?.faces[shown?.speaker ? mood : 'neutral'] ??
    speakerArt?.faces.neutral;

  return (
    <div>
      {/* Màn hẹp: khung thoại nằm dưới cảnh để không che nhân vật. */}
      <div className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-line bg-[#e9e2d6] shadow-[0_18px_50px_-24px_rgba(0,0,0,.7)] sm:aspect-[16/9]">
          {/* Nền */}
          <img
            key={background}
            src={background}
            alt=""
            className="vn-fade absolute inset-0 h-full w-full object-cover"
          />

          {/* Nhân vật */}
          {character && (
            <img
              key={onStage}
              src={character.standing}
              alt={names[onStage ?? ''] ?? ''}
              className={cx(
                'vn-enter absolute bottom-0 right-[7%] h-[94%] w-auto select-none drop-shadow-[0_10px_18px_rgba(0,0,0,.25)] transition-[filter] duration-300',
                shown?.speaker?.npcKey !== onStage &&
                  'brightness-[.82] saturate-[.85]',
              )}
              draggable={false}
            />
          )}

          {/* Tiến độ */}
          <div className="absolute left-3 top-3 rounded-full bg-[#142B52]/80 px-3 py-1 text-[10px] tracking-[0.08em] text-[#F8F6EE] backdrop-blur-sm">
            Bước {step.current}/{step.total}
          </div>
        </div>

        {/* Khung thoại */}
        {shown && (
          <DialogueBox
            line={shown}
            portrait={portrait}
            active={reading}
            isLast={!dialogue || dialogue.index + 1 >= dialogue.lines.length}
            continueLabel={
              dialogue?.after === 'continue' ? 'tiếp tục' : 'tới lượt bạn'
            }
            onAdvance={advance}
          />
        )}
      </div>

      {/* Lượt trả lời */}
      {!reading && phase !== 'closing' && (
        <div className="reveal mt-4 rounded-[14px] border border-line bg-panel p-4 sm:p-5">
          {children}
        </div>
      )}
    </div>
  );
}

function useTypewriter(text: string, charsPerSecond = 45) {
  const [shown, setShown] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    setShown(0);
    const start = performance.now();
    const tick = (now: number) => {
      const n = Math.min(
        text.length,
        Math.floor(((now - start) / 1000) * charsPerSecond),
      );
      setShown(n);
      if (n < text.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, charsPerSecond]);
  return {
    visible: text.slice(0, shown),
    done: shown >= text.length,
    finish: () => {
      cancelAnimationFrame(raf.current);
      setShown(text.length);
    },
  };
}

function DialogueBox({
  line,
  portrait,
  active,
  isLast,
  continueLabel,
  onAdvance,
}: {
  line: Line;
  portrait: string | undefined;
  /** `false`: câu đã ghim làm đề, không bấm được nữa. */
  active: boolean;
  isLast: boolean;
  continueLabel: string;
  onAdvance: () => void;
}) {
  const typed = useTypewriter(active ? line.text : '');
  const text = active ? typed.visible : line.text;
  const done = !active || typed.done;

  const click = useCallback(() => {
    if (!active) return;
    if (!typed.done) typed.finish();
    else onAdvance();
  }, [active, typed, onAdvance]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select|button/i.test(target.tagName))
        return;
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'e' ||
        e.key === 'E'
      ) {
        e.preventDefault();
        click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, click]);

  const narration = line.speaker === null;

  const className = cx(
    'relative mt-10 flex min-h-[120px] sm:absolute sm:inset-x-[3%] sm:bottom-[4%] sm:mt-0 sm:min-h-[26%] items-stretch gap-3 rounded-[12px] border-2 border-[#142B52]/85 bg-[#F8F6EE]/95 p-3 text-left shadow-[0_8px_30px_-10px_rgba(10,16,38,.6)] backdrop-blur-[2px] sm:gap-4 sm:p-4',
    active && 'cursor-pointer',
  );
  // Đang đọc: cả khung là nút bấm để đọc tiếp. Đã ghim làm đề: chỉ là chữ.
  const Box = active ? 'button' : 'div';

  return (
    <Box
      {...(active ? { type: 'button' as const, onClick: click } : {})}
      aria-live="polite"
      data-vn-dialogue
      className={className}
    >
      {portrait && (
        <img
          src={portrait}
          alt=""
          className="hidden aspect-square h-auto w-[15%] shrink-0 self-center rounded-xl border-2 border-[#D4B06A] bg-[#efe9dc] object-cover object-top sm:block"
        />
      )}
      <span className="relative flex min-w-0 flex-1 flex-col">
        {!narration && (
          <span className="absolute -top-[30px] left-0 rounded-t-[8px] bg-[#142B52] px-3 py-1 font-display text-[13px] font-semibold text-[#F0D79A] sm:-top-[34px] sm:text-[14px]">
            {line.speaker?.name}
          </span>
        )}
        <span
          className={cx(
            'whitespace-pre-line text-[13.5px] leading-relaxed text-[#142B52] sm:text-[15.5px]',
            narration && 'italic text-[#254A7A]',
          )}
        >
          {text}
        </span>
        <span className="mt-auto self-end pt-1 font-label text-[10px] uppercase tracking-[0.1em] text-[#5D7EA8]">
          {active && done ? (isLast ? `${continueLabel} ▸` : '▸') : ' '}
        </span>
      </span>
    </Box>
  );
}
