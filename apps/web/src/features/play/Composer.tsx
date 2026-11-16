/**
 * Khung trả lời đổi theo việc engine đang chờ (`scene.await`): nói trong
 * cuộc trò chuyện, trả lời nút, chọn phương án (có đếm giờ), soạn tài liệu,
 * xác nhận nộp sớm.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { DoorClosed, ListChecks, Send, Timer } from 'lucide-react';
import { Button, ConfirmDialog, Textarea, cn } from '@datn/ui';
import type { SceneView, TurnInput } from '../../api/types';
import { ArtefactForm } from './ArtefactForm';

export function Composer({
  scene,
  busy,
  locked,
  onSend,
  onShowActions,
}: {
  scene: SceneView;
  busy: boolean;
  /** Còn nhịp chưa đọc hoặc đang chờ AI: chưa cho trả lời. */
  locked: boolean;
  onSend: (input: TurnInput) => Promise<boolean>;
  onShowActions: () => void;
}) {
  const w = scene.await;
  const node = scene.node;

  if (scene.mode === 'confirm_end') {
    return (
      <ConfirmDialog
        open
        title="Nộp trước hạn?"
        description={`Còn ${scene.clock.remaining} điểm thời gian (tới ${scene.clock.deadline}). Nộp bây giờ thì ca kết thúc, những việc chưa làm sẽ không được xét.`}
        confirmLabel="Nộp luôn"
        cancelLabel="Làm thêm"
        loading={busy}
        onConfirm={() => onSend({ kind: 'confirm_end' })}
        onClose={() => onSend({ kind: 'cancel_end' })}
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
        note={`Cuộc trò chuyện này: còn ${c.turnsLeftInPoint} lượt trước khi tốn thêm 1 điểm.`}
        onSend={(text) => onSend({ kind: 'say', text })}
        extra={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<DoorClosed size={15} />}
            onClick={() => onSend({ kind: 'end_conversation' })}
            disabled={busy}
          >
            Kết thúc trò chuyện
          </Button>
        }
      />
    );
  }

  if (node && w.kind === 'node_choice') {
    return <Choices key={node.id} node={node} busy={busy} onSend={onSend} />;
  }

  if (node && w.kind === 'node_artefact' && node.form) {
    const form = node.form;
    return (
      <div className="max-h-[55dvh] overflow-y-auto">
        {node.prompt && (
          <p className="mb-3 text-sm font-semibold text-gold-100">
            {node.prompt}
          </p>
        )}
        <ArtefactForm
          form={form}
          submitLabel={node.kind === 'end' ? 'Gửi và kết thúc ca' : 'Gửi'}
          busy={busy}
          onSubmit={(fields, ticks) =>
            onSend({ kind: 'save_artefact', artefact: form.id, fields, ticks })
          }
        />
      </div>
    );
  }

  if (w.kind === 'node_reply' || w.kind === 'probe_answer') {
    const review = scene.mode === 'review';
    return (
      <TextReply
        key={`${w.kind}-${node?.id ?? 'review'}`}
        label={review ? 'Nhìn lại ca' : node?.prompt}
        placeholder={review ? 'Trả lời người hỏi…' : 'Bạn trả lời thế nào?'}
        busy={busy}
        onSend={(text) => onSend({ kind: 'say', text })}
      />
    );
  }

  if (scene.mode === 'phase') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong px-4 py-3 text-sm text-ink-muted">
        <ListChecks size={18} className="shrink-0 text-gold-300" aria-hidden />
        <span className="flex-1">
          Bạn tự chọn việc tiếp theo: hỏi ai, mở tài liệu nào, hay chốt khi đã
          đủ dữ kiện.
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="xl:hidden"
          onClick={onShowActions}
        >
          Chọn việc
        </Button>
      </div>
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
    <form onSubmit={submit} className="flex flex-col gap-2">
      {label && <p className="text-sm font-semibold text-gold-100">{label}</p>}
      <div className="flex items-end gap-2">
        <label className="visually-hidden" htmlFor="composer">
          {label ?? 'Câu trả lời'}
        </label>
        <Textarea
          id="composer"
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
          className="min-h-12 flex-1 resize-none py-3"
          rows={2}
        />
        <Button
          type="submit"
          size="lg"
          loading={busy}
          disabled={!text.trim()}
          aria-label="Gửi"
          className="px-4"
        >
          <Send size={18} />
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-night-300">
        <span>{note ?? 'Enter để gửi, Shift + Enter để xuống dòng.'}</span>
        {extra}
      </div>
    </form>
  );
}

/** Chọn phương án; có `timeLimitSeconds` thì đếm ngược, đo thời gian trên máy (D-83). */
function Choices({
  node,
  busy,
  onSend,
}: {
  node: NonNullable<SceneView['node']>;
  busy: boolean;
  onSend: (input: TurnInput) => Promise<boolean>;
}) {
  const limit = node.timeLimitSeconds ?? null;
  const started = useRef(performance.now());
  const [left, setLeft] = useState(limit ?? 0);
  const sent = useRef(false);

  useEffect(() => {
    if (!limit) return;
    const id = window.setInterval(() => {
      const remain = Math.max(
        0,
        limit - (performance.now() - started.current) / 1000,
      );
      setLeft(remain);
      if (remain <= 0 && !sent.current) {
        sent.current = true;
        window.clearInterval(id);
        // Hết giờ là không trả lời: mức 0, không trừ (D-86).
        void onSend({ kind: 'timeout' }).then((ok) => {
          if (!ok) sent.current = false;
        });
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [limit, onSend]);

  const choose = (key: string) => {
    if (sent.current) return;
    sent.current = true;
    // Thời gian đo lúc bấm (D-83); gửi lỗi thì mở lại để chọn lần nữa.
    void onSend({
      kind: 'choose',
      option: key,
      elapsedMs: Math.round(performance.now() - started.current),
    }).then((ok) => {
      if (!ok) sent.current = false;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {node.prompt && (
          <p className="flex-1 text-sm font-semibold text-gold-100">
            {node.prompt}
          </p>
        )}
        {limit && (
          <span
            role="timer"
            aria-label={`Còn ${Math.ceil(left)} giây`}
            className={cn(
              'tabular inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold',
              left < 8
                ? 'bg-warning-deep/60 text-warning'
                : 'bg-night-950/60 text-gold-200',
            )}
          >
            <Timer size={15} aria-hidden /> {Math.ceil(left)}s
          </span>
        )}
      </div>
      {limit && (
        <div className="h-1 overflow-hidden rounded-full bg-night-950/60">
          <div
            className="h-full bg-gold-400 transition-[width] duration-100 ease-linear"
            style={{ width: `${(left / limit) * 100}%` }}
          />
        </div>
      )}
      <ul className="grid gap-2">
        {node.options.map((o, i) => (
          <li key={o.key}>
            <button
              type="button"
              disabled={busy}
              onClick={() => choose(o.key)}
              className="flex w-full items-start gap-3 rounded-lg border border-line bg-night-800/60 p-3.5 text-left text-sm text-ink transition-colors hover:border-gold-400/70 hover:bg-gold-900/30 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-gold font-wordmark text-xs text-gold-300">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="leading-relaxed">{o.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
