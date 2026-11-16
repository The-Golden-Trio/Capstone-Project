/**
 * Sổ tay (seed khối M): dữ kiện đã mở tự vào sổ, lời hứa như dòng tự ghi,
 * tài liệu đã xem, ghi chú riêng (không gửi AI, không chấm), thuật ngữ,
 * người trong ca. Chỉ ghi dữ kiện; suy luận để người chơi tự ghép.
 */
import { useId, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import {
  Badge,
  Button,
  Input,
  Portrait,
  TabPanel,
  Tabs,
  Textarea,
  cn,
} from '@datn/ui';
import { errorText } from '../../api/hooks';
import { api } from '../../api';
import { keys } from '../../api/hooks';
import type { SceneView, ShiftRun, TranscriptLine } from '../../api/types';
import { foldVi } from '../galaxy/layout';

type Tab = 'facts' | 'promises' | 'docs' | 'notes' | 'terms' | 'people';

const PROMISE_TONE: Record<
  string,
  { label: string; tone: 'gold' | 'success' | 'danger' | 'muted' }
> = {
  open: { label: 'Đang hẹn', tone: 'gold' },
  kept: { label: 'Đã giữ', tone: 'success' },
  late: { label: 'Trễ hẹn', tone: 'danger' },
  carried: { label: 'Để lại cuối ca', tone: 'muted' },
};

export function Notebook({
  run,
  scene,
  lines,
  className,
}: {
  run: ShiftRun;
  scene: SceneView;
  lines: TranscriptLine[];
  className?: string;
}) {
  const [tab, setTab] = useState<Tab>('facts');
  const idBase = useId();
  const [query, setQuery] = useState('');
  const nb = scene.notebook;

  // Tìm xuyên lời thoại (tìm kiếm kiểu Her Story, khối M).
  const hits = useMemo(() => {
    const q = foldVi(query.trim());
    if (q.length < 2) return [];
    return lines.filter((l) => foldVi(l.text).includes(q)).slice(-20);
  }, [query, lines]);

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="px-4 pt-4">
        <Input
          leftIcon={<Search size={15} />}
          placeholder="Tìm trong lời thoại…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 text-sm"
          aria-label="Tìm trong lời thoại"
        />
      </div>
      {hits.length > 0 ? (
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 text-sm">
          {hits.map((l) => (
            <li key={l.seq} className="rounded-md bg-night-950/40 p-2.5">
              <span className="text-xs font-semibold text-night-300">
                {l.kind === 'player'
                  ? 'Bạn'
                  : (run.cast.find((c) => c.slot === l.speaker)?.name ??
                    'Cảnh')}
              </span>
              <p className="text-ink-muted">{l.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <Tabs
            label="Sổ tay"
            idBase={idBase}
            variant="pill"
            value={tab}
            onChange={setTab}
            className="mx-3 mt-3 flex-wrap justify-start rounded-xl"
            items={[
              { key: 'facts', label: 'Dữ kiện', count: nb.facts.length },
              { key: 'promises', label: 'Lời hứa', count: nb.promises.length },
              { key: 'docs', label: 'Tài liệu', count: scene.documents.length },
              { key: 'notes', label: 'Ghi chú' },
              { key: 'terms', label: 'Thuật ngữ' },
              { key: 'people', label: 'Người' },
            ]}
          />
          <TabPanel
            idBase={idBase}
            tabKey={tab}
            active
            className="min-h-0 flex-1 overflow-y-auto p-4 text-sm break-words"
          >
            {tab === 'facts' &&
              (nb.facts.length ? (
                <ol className="space-y-2.5">
                  {nb.facts.map((f) => (
                    <li key={f.id} className="flex gap-3">
                      <time className="tabular w-11 shrink-0 text-xs text-gold-300">
                        {f.time}
                      </time>
                      <span className="text-ink-muted">{f.text}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty text="Dữ kiện bạn tìm ra (hỏi người, mở tài liệu) tự ghi vào đây." />
              ))}
            {tab === 'promises' &&
              (nb.promises.length ? (
                <ul className="space-y-2">
                  {nb.promises.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-md bg-night-950/40 p-2.5"
                    >
                      <span className="text-ink">{p.label}</span>
                      <Badge tone={PROMISE_TONE[p.status]?.tone ?? 'muted'}>
                        {PROMISE_TONE[p.status]?.label ?? p.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="Bạn hẹn ai một giờ hay một tin, game ghi lại ở đây như người thật ghi sổ." />
              ))}
            {tab === 'docs' &&
              (scene.documents.length ? (
                <div className="space-y-3">
                  {scene.documents.map((d) => (
                    <article key={d.id} className="paper rounded-md p-3.5">
                      <h4 className="font-sans text-sm font-bold text-paper-ink first-letter:uppercase">
                        {d.title}
                      </h4>
                      {d.body && (
                        <div className="mt-2 space-y-1 font-mono text-[12px] leading-relaxed text-paper-ink/85">
                          {d.body.map((b, i) => (
                            <p key={i}>{b}</p>
                          ))}
                        </div>
                      )}
                      {d.lines && (
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-night-900 p-2 font-mono text-[11px] text-success">
                          {d.lines.join('\n')}
                        </pre>
                      )}
                      {d.saved && (
                        <div className="mt-2 space-y-1 text-[12px] text-paper-ink/85">
                          {Object.entries(d.saved.fields).map(([k, v]) => (
                            <p key={k}>{v}</p>
                          ))}
                          <p className="text-[11px] uppercase tracking-wide text-paper-ink/50">
                            {d.saved.status === 'draft' ? 'Bản nháp' : 'Đã lưu'}
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <Empty text="Tài liệu đã mở sẽ nằm ở đây, xem lại không tốn thời gian." />
              ))}
            {tab === 'notes' && <Notes runId={run.runId} />}
            {tab === 'terms' &&
              (scene.glossary.length ? (
                <dl className="space-y-3">
                  {scene.glossary.map((g) => (
                    <div key={g.term}>
                      <dt className="font-semibold text-gold-200">{g.term}</dt>
                      <dd className="text-ink-muted">{g.plain}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <Empty text="Ca này không có thuật ngữ cần giải thích." />
              ))}
            {tab === 'people' && (
              <ul className="space-y-2.5">
                {run.cast.map((c) => (
                  <li key={c.slot} className="flex items-center gap-3">
                    <Portrait seed={c.slot} size={40} framed />
                    <span>
                      <span className="block font-semibold capitalize text-ink">
                        {c.name}
                      </span>
                      <span className="block text-xs text-ink-faint">
                        {c.relation}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>
        </>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-night-300">{text}</p>;
}

function Notes({ runId }: { runId: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const notes = useQuery({
    queryKey: keys.notes(runId),
    queryFn: () => api.play.notes(runId),
  });
  const add = useMutation({
    mutationFn: (t: string) => api.play.addNote(runId, t),
    onSuccess: () => {
      setText('');
      void qc.invalidateQueries({ queryKey: keys.notes(runId) });
    },
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) add.mutate(text.trim());
  };
  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ghi nhanh điều bạn đang nghĩ…"
          aria-label="Ghi chú riêng"
          className="min-h-16 text-sm"
          maxLength={4000}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-night-300">
            Chỉ bạn thấy. Không gửi cho AI, không chấm.
          </span>
          <Button
            size="sm"
            type="submit"
            variant="secondary"
            loading={add.isPending}
            disabled={!text.trim()}
          >
            Ghi
          </Button>
        </div>
      </form>
      {add.isError && (
        <p role="alert" className="text-xs text-danger">
          {errorText(add.error)} Ghi chú vẫn còn trong ô, bạn bấm Ghi lại nhé.
        </p>
      )}
      {notes.isLoading && (
        <p className="text-xs text-night-300">Đang mở ghi chú…</p>
      )}
      {notes.isError && (
        <p className="text-xs text-danger">
          Chưa tải được ghi chú.{' '}
          <button
            type="button"
            className="underline"
            onClick={() => void notes.refetch()}
          >
            Thử lại
          </button>
        </p>
      )}
      {notes.data && notes.data.length === 0 && (
        <p className="text-xs text-night-300">
          Chưa có ghi chú nào. Ghi lại giả thuyết, việc cần hỏi, giờ đã hẹn…
        </p>
      )}
      <ul className="space-y-2">
        {(notes.data ?? []).map((n, i) => (
          <li
            key={i}
            className="rounded-md border-l-2 border-gold-500/60 bg-night-950/40 px-3 py-2 text-ink-muted"
          >
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
