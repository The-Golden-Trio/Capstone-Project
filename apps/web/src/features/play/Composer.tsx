/**
 * Khung trả lời đổi theo việc engine đang chờ (`scene.await`): nói trong
 * cuộc trò chuyện, trả lời nút, chọn phương án (có đếm giờ), soạn tài liệu,
 * xác nhận nộp sớm. Pha xử lý chọn việc ở bàn làm việc, không ở đây.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { DoorClosed, FilePenLine, Send, Timer } from 'lucide-react';
import { ConfirmDialog, ToonButton, ToonTextarea, cn } from '@datn/ui';
import type { SceneView, TurnInput } from '../../api/types';

export function Composer({
  scene,
  busy,
  locked,
  onSend,
  onOpenNode,
  spoken,
  clockHeld = false,
}: {
  scene: SceneView;
  busy: boolean;
  /** Còn nhịp chưa đọc hoặc đang chờ AI: chưa cho trả lời. */
  locked: boolean;
  onSend: (input: TurnInput) => Promise<boolean>;
  onOpenNode: (node: NonNullable<SceneView['node']>) => void;
  /** Câu nhân vật vừa nói: câu hỏi trùng nguyên văn thì không lặp lại. */
  spoken?: string | null;
  /** Lượt mẫu đang chờ người trình bày: đồng hồ chọn phương án đứng yên. */
  clockHeld?: boolean;
}) {
  const norm = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();
  const fresh = (prompt?: string) =>
    prompt && (!spoken || norm(prompt) !== norm(spoken)) ? prompt : undefined;
  const w = scene.await;
  const node = scene.node;

  if (scene.mode === 'confirm_end') {
    return (
      <ConfirmDialog
        open
        title="Nộp trước hạn?"
        description="Gửi xong thì ca này kết thúc."
        confirmLabel="Gửi"
        cancelLabel="Làm thêm"
        loading={busy || locked}
        theme="toon"
        onConfirm={() => {
          if (!busy && !locked) void onSend({ kind: 'confirm_end' });
        }}
        onClose={() => {
          if (!busy && !locked) void onSend({ kind: 'cancel_end' });
        }}
      />
    );
  }

  if (locked) return null;

  if (scene.mode === 'conversation' && scene.conversation) {
    const c = scene.conversation;
    return (
      <TextReply
        key={`conv-${c.id}`}
        placeholder={`Nói với ${c.people.map((p) => p.name).join(', ')}…`}
        busy={busy}
        note={`Còn ${c.turnsLeftInPoint} câu nói trước khi tốn thêm 1 lượt.`}
        onSend={(text) => onSend({ kind: 'say', text })}
        extra={
          <ToonButton
            variant="secondary"
            size="sm"
            leftIcon={<DoorClosed size={15} strokeWidth={2.6} />}
            onClick={() => onSend({ kind: 'end_conversation' })}
            disabled={busy}
          >
            Kết thúc trò chuyện
          </ToonButton>
        }
      />
    );
  }

  if (node && w.kind === 'node_choice') {
    return (
      <Choices
        key={node.id}
        node={node}
        prompt={fresh(node.prompt)}
        busy={busy}
        clockHeld={clockHeld}
        onSend={onSend}
      />
    );
  }

  if (node && w.kind === 'node_artefact' && node.form) {
    const form = node.form;
    return (
      <div className="max-h-[55dvh] overflow-y-auto p-1">
        {fresh(node.prompt) && <Prompt>{node.prompt}</Prompt>}
        <ToonButton
          className="mt-1"
          size="sm"
          leftIcon={<FilePenLine size={16} />}
          disabled={busy}
          data-autoplay="open-node"
          onClick={() => onOpenNode(node)}
        >
          Mở {form.title}
        </ToonButton>
      </div>
    );
  }

  if (w.kind === 'last_word') {
    return (
      <TextReply
        key={`last-word-${w.to}`}
        label={w.prompt}
        placeholder="Viết lời nhắn…"
        busy={busy}
        onSend={(text) => onSend({ kind: 'say', text })}
        extra={
          <ToonButton
            variant="secondary"
            size="sm"
            onClick={() => onSend({ kind: 'end_conversation' })}
            disabled={busy}
          >
            Bỏ qua
          </ToonButton>
        }
      />
    );
  }

  if (w.kind === 'node_reply' || w.kind === 'probe_answer') {
    const review = scene.mode === 'review';
    // Nút chọn đã hỏi bằng chính câu `prompt` rồi (kể cả khi hết giờ); lượt nói
    // thêm là đáp lời nhân vật vừa phản ứng, không phải câu hỏi đó.
    const answeredChoice =
      node?.format === 'timed_choice' || node?.format === 'choice';
    return (
      <TextReply
        key={`${w.kind}-${node?.id ?? 'review'}`}
        label={
          review
            ? 'Nhìn lại ca'
            : answeredChoice
              ? undefined
              : fresh(node?.prompt)
        }
        placeholder={review ? 'Trả lời người hỏi…' : 'Bạn trả lời thế nào?'}
        busy={busy}
        onSend={(text) => onSend({ kind: 'say', text })}
      />
    );
  }

  return null;
}

function TextReply({
  label,
  placeholder,
  note,
  busy,
  onSend,
  extra,
}: {
  label?: string;
  placeholder: string;
  note?: string;
  busy: boolean;
  onSend: (text: string) => Promise<boolean>;
  extra?: React.ReactNode;
}) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || busy) return;
    // Chỉ xoá ô nhập khi lượt đã được nhận; lỗi thì giữ để gửi lại.
    void onSend(text.trim()).then((ok) => ok && setText(''));
  };
  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 [@media(max-height:760px)]:gap-1"
    >
      {label && <Prompt>{label}</Prompt>}
      <div className="flex items-end gap-3">
        <label className="visually-hidden" htmlFor="composer">
          {label ?? 'Câu trả lời'}
        </label>
        <span id="composer-keys" className="sr-only">
          Enter để gửi, Shift + Enter để xuống dòng.
        </span>
        <ToonTextarea
          readOnly={busy}
          id="composer"
          aria-describedby="composer-keys"
          ref={ref}
          value={text}
          maxLength={4000}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          size="sm"
          resizable={false}
          className="flex-1 py-3 [@media(max-height:760px)]:py-1.5"
          rows={2}
        />
        <ToonButton
          type="submit"
          size="lg"
          loading={busy}
          disabled={!text.trim()}
          aria-label="Gửi"
          rightIcon={<Send size={18} strokeWidth={2.6} />}
        >
          <span className="hidden @md:inline">Gửi</span>
        </ToonButton>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-toon-ink-faint">
        {note ? <span>{note}</span> : <span />}
        {extra}
      </div>
    </form>
  );
}

/** Chọn phương án; có `timeLimitSeconds` thì đếm ngược, đo thời gian trên máy (D-83). */
function Choices({
  node,
  prompt,
  busy,
  clockHeld,
  onSend,
}: {
  node: NonNullable<SceneView['node']>;
  prompt?: string;
  busy: boolean;
  clockHeld: boolean;
  onSend: (input: TurnInput) => Promise<boolean>;
}) {
  const limit = node.timeLimitSeconds ?? null;
  const [left, setLeft] = useState(limit ?? 0);
  const sent = useRef(false);
  const [timeoutFailed, setTimeoutFailed] = useState(false);

  // Thời gian đã trôi, không tính lúc người trình bày giữ đồng hồ.
  const held = useRef(clockHeld);
  const lapse = useRef({ ms: 0, at: performance.now() });
  const elapsed = useCallback(() => {
    const now = performance.now();
    if (!held.current) lapse.current.ms += now - lapse.current.at;
    lapse.current.at = now;
    return lapse.current.ms;
  }, []);
  useEffect(() => {
    elapsed();
    held.current = clockHeld;
  }, [clockHeld, elapsed]);

  useEffect(() => {
    if (!limit) return;
    const id = window.setInterval(() => {
      const remain = Math.max(0, limit - elapsed() / 1000);
      setLeft(remain);
      if (remain <= 0 && !sent.current) {
        sent.current = true;
        window.clearInterval(id);
        // Hết giờ là không trả lời: mức 0, không trừ (D-86).
        void onSend({ kind: 'timeout' }).then((ok) => {
          if (!ok) setTimeoutFailed(true);
        });
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [limit, onSend, elapsed]);

  const choose = (key: string) => {
    if (sent.current) return;
    sent.current = true;
    // Thời gian đo lúc bấm (D-83); gửi lỗi thì mở lại để chọn lần nữa.
    void onSend({
      kind: 'choose',
      option: key,
      elapsedMs: Math.round(elapsed()),
    }).then((ok) => {
      if (!ok) sent.current = false;
    });
  };

  const urgent = limit !== null && left < 8;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        {prompt ? (
          <Prompt className="flex-1">{prompt}</Prompt>
        ) : (
          <span className="flex-1 font-toon text-base font-extrabold text-toon-ink-soft">
            Chọn một cách trả lời
          </span>
        )}
        {limit && (
          <span
            role="timer"
            aria-label={`Còn ${Math.ceil(left)} giây`}
            className={cn(
              'tabular inline-flex shrink-0 items-center gap-1.5 rounded-full border-[3px] border-toon-ink px-3 py-1 font-toon text-lg font-extrabold text-toon-ink shadow-toon-sm',
              urgent ? 'animate-toon-shake bg-toon-coral' : 'bg-toon-paper',
            )}
          >
            <Timer size={17} strokeWidth={2.8} aria-hidden /> {Math.ceil(left)}s
          </span>
        )}
      </div>
      {limit && (
        <div className="h-3.5 overflow-hidden rounded-full border-[2.5px] border-toon-ink bg-toon-sand">
          <div
            className={cn(
              'h-full border-r-[2.5px] border-toon-ink transition-[width] duration-100 ease-linear',
              urgent ? 'bg-toon-coral' : 'bg-toon-mustard',
            )}
            style={{ width: `${(left / limit) * 100}%` }}
          />
        </div>
      )}
      {timeoutFailed && (
        <div className="rounded-xl border-2 border-toon-ink bg-toon-paper p-3">
          <p role="alert" className="mb-2 text-sm font-bold text-toon-maroon">
            Chưa ghi nhận được lượt hết giờ. Bạn thử gửi lại nhé.
          </p>
          <ToonButton
            size="sm"
            loading={busy}
            onClick={() => {
              setTimeoutFailed(false);
              void onSend({ kind: 'timeout' }).then((ok) =>
                setTimeoutFailed(!ok),
              );
            }}
          >
            Gửi lại lượt hết giờ
          </ToonButton>
        </div>
      )}
      <ul className="grid gap-2.5 @xl:grid-cols-2">
        {node.options.map((o, i) => (
          <li
            key={o.key}
            className={cn(
              node.options.length % 2 === 1 &&
                i === node.options.length - 1 &&
                '@xl:col-span-2',
            )}
          >
            <button
              type="button"
              disabled={busy || (limit !== null && left <= 0)}
              data-option-key={o.key}
              onClick={() => choose(o.key)}
              className="group flex size-full items-start gap-3 rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-3 text-left font-toon-body text-[15px] font-bold leading-snug text-toon-ink shadow-toon transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-[#fff1c9] hover:shadow-toon-lg active:translate-y-0.5 active:shadow-toon-press focus-visible:outline-none focus-visible:shadow-toon-focus disabled:opacity-60"
            >
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-xl border-[2.5px] border-toon-ink font-toon text-lg font-extrabold"
                style={{
                  backgroundColor: OPTION_COLORS[i % OPTION_COLORS.length],
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="pt-1">{o.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const OPTION_COLORS = ['#a6d2ea', '#a8dbb9', '#eea7b4', '#f6b496'];

/** Câu hỏi của nút tình huống, kiểu băng giấy dán trên khung trả lời. */
function Prompt({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'w-fit max-w-full rounded-xl border-[2.5px] border-toon-ink bg-[#ffe4a3] px-3 py-1.5 font-toon text-base font-bold leading-snug text-toon-ink shadow-toon-sm',
        className,
      )}
    >
      {children}
    </p>
  );
}
