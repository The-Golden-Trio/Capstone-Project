/**
 * Các mảnh của màn ca làm (Game Design W45). Chỉ hiển thị những gì máy chủ
 * gửi trong `SceneView`: không có câu kiểm, khúc mắc hay dữ kiện chưa lộ.
 */
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Note, SectionLabel } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { cx } from '../../lib/cx';
import type { Line, ShiftScene, TurnBody } from './shiftApi';

type Form = NonNullable<ShiftScene['node']>['form'];
type ActionView = ShiftScene['actions'][number];

/** Bộ 8 biểu cảm (Seed C3, A5) hiện bằng một ký hiệu nhỏ cạnh tên. */
export const EXPRESSION_ICON: Record<string, string> = {
  binh_thuong: '🙂',
  vui: '😄',
  cuoi_lon: '😆',
  ngac_nhien: '😮',
  suy_nghi: '🤔',
  lo_lang: '😟',
  kho_chiu: '😣',
  buon: '😔',
};

const CHANNEL_LABEL: Record<string, string> = {
  chat: 'nhắn',
  call: 'gọi điện',
  meet: 'gặp',
  group: 'kênh chung',
};

/* ── Đồng hồ ── */

export function ClockBar({ scene }: { scene: ShiftScene }) {
  const { clock } = scene;
  const used = Math.min(1, clock.pointsUsed / clock.budget);
  const low = clock.remaining <= 6;
  return (
    <div className="mb-4 rounded-lg border border-line bg-panel px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="m-0 font-display text-[18px] font-bold text-ink">
          {scene.title}
        </h1>
        <span className="font-mono text-[22px] font-semibold text-gold-2">
          {clock.time}
        </span>
        <span className="text-[12px] text-muted">
          hạn chót {clock.deadline} · còn {clock.remaining} điểm (
          {clock.remaining * clock.minutesPerPoint} phút)
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-inset"
        aria-hidden
      >
        <div
          className={cx('h-full rounded-full', low ? 'bg-signal' : 'bg-gold')}
          style={{ width: `${used * 100}%` }}
        />
      </div>
      <p className="m-0 mt-2 text-[13px] text-ink-2">
        <span className="text-muted">Mục tiêu: </span>
        {scene.goal}
      </p>
    </div>
  );
}

/* ── Lời thoại ── */

function nameOf(scene: ShiftScene, speaker: string): string {
  return scene.cast.find((c) => c.slot === speaker)?.name ?? speaker;
}

export function TranscriptView({
  lines,
  scene,
}: {
  lines: Line[];
  scene: ShiftScene;
}) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [lines.length]);

  return (
    <div className="flex max-h-[56vh] min-h-[280px] flex-col gap-2 overflow-y-auto rounded-lg border border-line bg-inset p-3">
      {lines.map((line) => {
        if (line.kind === 'scene')
          return (
            <p
              key={line.seq}
              className="m-0 px-6 text-center text-[13px] italic text-muted"
            >
              {line.text}
            </p>
          );
        if (line.kind === 'system')
          return (
            <pre
              key={line.seq}
              className={cx(
                'm-0 whitespace-pre-wrap rounded border px-2 py-1 font-mono text-[11.5px]',
                line.speaker === 'hint'
                  ? 'border-gold/40 bg-gold-soft text-gold-2'
                  : 'border-line bg-panel text-ink-2',
              )}
            >
              {line.speaker === 'hint' ? `Gợi ý: ${line.text}` : line.text}
            </pre>
          );
        const mine = line.kind === 'player';
        return (
          <div
            key={line.seq}
            className={cx('flex', mine ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cx(
                'max-w-[80%] rounded-lg px-3 py-2 text-[14px] leading-relaxed',
                mine ? 'bg-gold-soft text-ink' : 'bg-panel text-ink',
              )}
            >
              {!mine && (
                <div className="mb-0.5 text-[11.5px] font-semibold text-gold-2">
                  {nameOf(scene, line.speaker)}{' '}
                  {EXPRESSION_ICON[line.expression ?? 'binh_thuong'] ?? ''}
                  {line.channel && (
                    <span className="ml-1.5 font-normal text-muted">
                      · {CHANNEL_LABEL[line.channel] ?? line.channel}
                    </span>
                  )}
                </div>
              )}
              {line.text}
            </div>
          </div>
        );
      })}
      <div ref={end} />
    </div>
  );
}

/* ── Form artefact ── */

export function ArtefactFormView({
  form,
  submitLabel,
  disabled,
  onSubmit,
  onCancel,
}: {
  form: NonNullable<Form>;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (fields: Record<string, string>, ticks: string[]) => void;
  onCancel?: () => void;
}) {
  const [fields, setFields] = useState<Record<string, string>>(
    form.prefill?.fields ?? {},
  );
  const [ticks, setTicks] = useState<string[]>(form.prefill?.ticks ?? []);
  const empty = form.fields.every((f) => !(fields[f.id] ?? '').trim());

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!empty) onSubmit(fields, ticks);
      }}
    >
      <SectionLabel>{form.title}</SectionLabel>
      {form.fields.map((f) => (
        <label
          key={f.id}
          className="flex flex-col gap-1 text-[12.5px] text-ink-2"
        >
          {f.label}
          <textarea
            rows={3}
            className="rounded border border-line bg-inset px-2 py-1.5 text-[14px] text-ink"
            value={fields[f.id] ?? ''}
            onChange={(e) => setFields({ ...fields, [f.id]: e.target.value })}
          />
        </label>
      ))}
      {form.ticks.length > 0 && (
        <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
          <legend className="mb-1 text-[12.5px] text-ink-2">Đánh dấu</legend>
          {form.ticks.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-2 text-[13px] text-ink"
            >
              <input
                type="checkbox"
                checked={ticks.includes(t.id)}
                onChange={(e) =>
                  setTicks(
                    e.target.checked
                      ? [...ticks, t.id]
                      : ticks.filter((x) => x !== t.id),
                  )
                }
              />
              {t.label}
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={disabled || empty}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel}>
            Huỷ
          </Button>
        )}
      </div>
    </form>
  );
}

/* ── Hành động ── */

const GROUPS: Array<{ title: string; kinds: string[] }> = [
  { title: 'Trò chuyện', kinds: ['talk', 'meeting'] },
  { title: 'Tài liệu', kinds: ['open'] },
  {
    title: 'Việc',
    kinds: ['write', 'rewrite', 'run', 'message', 'wait', 'trigger'],
  },
];

export function ActionsPanel({
  scene,
  locked,
  onAction,
  onOpenDocument,
}: {
  scene: ShiftScene;
  locked: boolean;
  onAction: (action: ActionView) => void;
  onOpenDocument: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {GROUPS.map((group) => {
        const actions = scene.actions.filter((a) =>
          group.kinds.includes(a.kind),
        );
        if (actions.length === 0) return null;
        return (
          <section key={group.title}>
            <SectionLabel>{group.title}</SectionLabel>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {actions.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  disabled={locked || !a.enabled}
                  title={a.reason}
                  onClick={() => onAction(a)}
                  className={cx(
                    'flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-left text-[13px]',
                    'border-line bg-inset text-ink-2 enabled:hover:border-gold enabled:hover:text-ink',
                    'disabled:cursor-not-allowed disabled:opacity-45',
                  )}
                >
                  <span>{a.label}</span>
                  {a.points > 0 && (
                    <span className="font-mono text-[11px] text-muted">
                      {a.points} đ
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })}
      {scene.documents.length > 0 && (
        <section>
          <SectionLabel>Đã mở</SectionLabel>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {scene.documents.map((d) => (
              <Button key={d.id} size="sm" onClick={() => onOpenDocument(d.id)}>
                {d.title}
              </Button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function DocumentView({
  scene,
  id,
  onClose,
}: {
  scene: ShiftScene;
  id: string;
  onClose: () => void;
}) {
  const doc = scene.documents.find((d) => d.id === id);
  if (!doc) return null;
  const body = doc.body ?? doc.lines ?? [];
  return (
    <div className="mb-3 rounded-lg border border-gold/40 bg-panel p-3">
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>{doc.title}</SectionLabel>
        <Button size="sm" onClick={onClose}>
          Đóng
        </Button>
      </div>
      {body.length > 0 && (
        <pre className="m-0 max-h-64 overflow-auto whitespace-pre font-mono text-[12px] text-ink-2">
          {body.join('\n')}
        </pre>
      )}
      {doc.saved && (
        <dl className="m-0 flex flex-col gap-1 text-[13px]">
          {Object.entries(doc.saved.fields).map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted">{k}</dt>
              <dd className="m-0 text-ink">{v}</dd>
            </div>
          ))}
          {doc.saved.status === 'draft' && (
            <Pill tone="signal">nháp, chưa lưu</Pill>
          )}
        </dl>
      )}
    </div>
  );
}

/* ── Sổ tay (khối M) ── */

const PROMISE_TONE: Record<string, 'gold' | 'good' | 'signal' | 'neutral'> = {
  open: 'gold',
  kept: 'good',
  late: 'signal',
  carried: 'neutral',
};
const PROMISE_LABEL: Record<string, string> = {
  open: 'đang hẹn',
  kept: 'đã giữ lời',
  late: 'trễ hẹn',
  carried: 'còn treo',
};

export function NotebookPanel({
  scene,
  busy,
  onNote,
  onHint,
}: {
  scene: ShiftScene;
  busy: boolean;
  onNote: (text: string) => void;
  onHint: () => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <section>
        <SectionLabel>Sổ tay · đã biết</SectionLabel>
        <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0 text-[13px] text-ink-2">
          {scene.notebook.facts.map((f) => (
            <li key={f.id}>
              <span className="mr-1.5 font-mono text-[11px] text-muted">
                {f.time}
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </section>
      {scene.notebook.promises.length > 0 && (
        <section>
          <SectionLabel>Lời hứa</SectionLabel>
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0 text-[13px] text-ink-2">
            {scene.notebook.promises.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2"
              >
                {p.label}
                <Pill tone={PROMISE_TONE[p.status] ?? 'neutral'}>
                  {PROMISE_LABEL[p.status] ?? p.status}
                </Pill>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <SectionLabel>Ghi chú của bạn</SectionLabel>
        <ul className="m-0 mt-1.5 flex list-none flex-col gap-1 p-0 text-[13px] text-ink-2">
          {scene.notes.map((n, i) => (
            <li key={`${n.at}-${i}`}>{n.text}</li>
          ))}
        </ul>
        <form
          className="mt-2 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            onNote(draft.trim());
            setDraft('');
          }}
        >
          <input
            className="min-w-0 flex-1 rounded border border-line bg-inset px-2 py-1 text-[13px] text-ink"
            placeholder="Ghi riêng, không ai chấm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button size="sm" type="submit">
            Ghi
          </Button>
        </form>
      </section>
      {scene.glossary.length > 0 && (
        <section>
          <SectionLabel>Thuật ngữ</SectionLabel>
          <dl className="m-0 mt-1.5 flex flex-col gap-1 text-[12.5px]">
            {scene.glossary.map((g) => (
              <div key={g.term}>
                <dt className="inline font-semibold text-ink">{g.term}: </dt>
                <dd className="inline m-0 text-ink-2">{g.plain}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <Button size="sm" disabled={busy} onClick={onHint}>
        Xin gợi ý ({scene.hintsUsed} đã dùng)
      </Button>
    </div>
  );
}

/* ── Khung trả lời theo chế độ của cảnh ── */

function SayBox({
  placeholder,
  disabled,
  onSay,
  extra,
}: {
  placeholder: string;
  disabled: boolean;
  onSay: (text: string) => Promise<boolean>;
  extra?: React.ReactNode;
}) {
  const [text, setText] = useState('');
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        if (await onSay(text.trim())) setText('');
      }}
    >
      <textarea
        rows={3}
        className="rounded border border-line bg-inset px-2 py-1.5 text-[14px] text-ink"
        placeholder={placeholder}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
            e.currentTarget.form?.requestSubmit();
        }}
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || !text.trim()}
        >
          Gửi
        </Button>
        {extra}
      </div>
    </form>
  );
}

/** Câu chọn có đếm giờ (D-83: đo trên thiết bị; hết giờ là không trả lời, D-86). */
function ChoiceBox({
  node,
  disabled,
  onChoose,
}: {
  node: NonNullable<ShiftScene['node']>;
  disabled: boolean;
  onChoose: (body: TurnBody) => void;
}) {
  // Mỗi nút một `key`, nên mốc bắt đầu đếm giờ chỉ cần lấy lúc dựng.
  const [shownAt] = useState(() => Date.now());
  const limit = node.timeLimitSeconds ?? null;
  const [left, setLeft] = useState(limit ?? 0);
  const sent = useRef(false);
  // Giữ hàm mới nhất trong ref: bộ đếm chỉ chạy lại khi sang nút khác.
  const choose = useRef(onChoose);
  choose.current = onChoose;

  useEffect(() => {
    sent.current = false;
    if (!limit) return;
    const timer = setInterval(() => {
      const remain = Math.max(
        0,
        limit - Math.floor((Date.now() - shownAt) / 1000),
      );
      setLeft(remain);
      if (remain === 0 && !sent.current) {
        sent.current = true;
        choose.current({ kind: 'timeout' });
      }
    }, 250);
    return () => clearInterval(timer);
  }, [limit, shownAt]);

  return (
    <div className="flex flex-col gap-2">
      {node.prompt && (
        <p className="m-0 text-[14px] font-semibold text-ink">{node.prompt}</p>
      )}
      {limit && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-inset"
          aria-label={`Còn ${left} giây`}
        >
          <div
            className="h-full bg-stakes"
            style={{ width: `${(left / limit) * 100}%` }}
          />
        </div>
      )}
      {node.options.map((o) => (
        <Button
          key={o.key}
          className="text-left"
          disabled={disabled || sent.current}
          onClick={() => {
            sent.current = true;
            onChoose({
              kind: 'choose',
              option: o.key,
              elapsedMs: Date.now() - shownAt,
            });
          }}
        >
          {o.text}
        </Button>
      ))}
    </div>
  );
}

export function TurnPanel({
  scene,
  waiting,
  delayed,
  busy,
  invalid,
  onSend,
  onResume,
  onSummary,
}: {
  scene: ShiftScene;
  waiting: boolean;
  delayed: boolean;
  busy: boolean;
  invalid: string | null;
  onSend: (body: TurnBody) => Promise<boolean>;
  onResume: () => void;
  onSummary: () => void;
}) {
  const kind = scene.await.kind;
  const say = (text: string) => onSend({ kind: 'say', text });

  let body: React.ReactNode;
  if (scene.paused)
    body = (
      <Note tone="warn">
        Chưa gọi được model AI nên ca tạm dừng; tiến độ vẫn giữ.{' '}
        <Button size="sm" onClick={onResume}>
          Tiếp tục
        </Button>
      </Note>
    );
  else if (waiting || kind === 'ai')
    body = (
      <p className="m-0 text-[13px] text-muted">
        {delayed
          ? 'Nhà cung cấp model đang chậm, chờ thêm chút nhé…'
          : 'Đang chờ…'}
      </p>
    );
  else if (kind === 'ended')
    body = (
      <Button variant="primary" onClick={onSummary}>
        Xem tổng kết ca
      </Button>
    );
  else if (kind === 'confirm_end')
    body = (
      <Note tone="info">
        Gửi bây giờ thì ca này kết thúc, dù chưa tới hạn chót. Gửi luôn?
        <div className="mt-2 flex gap-2">
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => void onSend({ kind: 'confirm_end' })}
          >
            Gửi
          </Button>
          <Button
            disabled={busy}
            onClick={() => void onSend({ kind: 'cancel_end' })}
          >
            Chưa, làm tiếp
          </Button>
        </div>
      </Note>
    );
  else if (kind === 'conversation' && scene.conversation)
    body = (
      <>
        <p className="m-0 mb-2 text-[12px] text-muted">
          Đang nói với {scene.conversation.people.map((p) => p.name).join(', ')}{' '}
          · còn {scene.conversation.turnsLeftInPoint} lượt trong điểm này
        </p>
        <SayBox
          placeholder="Bạn nói gì?"
          disabled={busy}
          onSay={say}
          extra={
            <Button
              type="button"
              disabled={busy}
              onClick={() => void onSend({ kind: 'end_conversation' })}
            >
              Kết thúc trò chuyện
            </Button>
          }
        />
      </>
    );
  else if (kind === 'node_choice' && scene.node)
    body = (
      <ChoiceBox
        key={scene.node.id}
        node={scene.node}
        disabled={busy}
        onChoose={(b) => void onSend(b)}
      />
    );
  else if (kind === 'node_artefact' && scene.node?.form) {
    const form = scene.node.form;
    body = (
      <ArtefactFormView
        key={scene.node.id}
        form={form}
        submitLabel="Gửi"
        disabled={busy}
        onSubmit={(fields, ticks) =>
          void onSend({
            kind: 'save_artefact',
            artefact: form.id,
            fields,
            ticks,
          })
        }
      />
    );
  } else if (kind === 'node_reply' || kind === 'probe_answer')
    body = (
      <SayBox placeholder="Bạn trả lời thế nào?" disabled={busy} onSay={say} />
    );
  else
    body = (
      <p className="m-0 text-[13px] text-muted">
        Chọn một việc ở cột bên trái: hỏi người, mở tài liệu, hay bắt tay vào
        làm.
      </p>
    );

  return (
    <div className="mt-3 rounded-lg border border-line bg-panel p-3">
      {invalid && (
        <Note tone="warn" className="mb-2">
          {invalid}
        </Note>
      )}
      {body}
    </div>
  );
}
