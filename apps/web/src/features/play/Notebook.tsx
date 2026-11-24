/**
 * Sổ tay (seed khối M): dữ kiện đã mở tự vào sổ, lời hứa như dòng tự ghi,
 * tài liệu đã xem, ghi chú riêng (không gửi AI, không chấm), thuật ngữ,
 * người trong ca. Chỉ ghi dữ kiện; suy luận để người chơi tự ghép.
 */
import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, Search } from 'lucide-react';
import {
  ToonBadge,
  ToonButton,
  ToonInput,
  ToonTabPanel,
  ToonTabs,
  ToonTextarea,
  cn,
} from '@datn/ui';
import { errorText } from '../../api/hooks';
import { api } from '../../api';
import { keys } from '../../api/hooks';
import type { SceneView, ShiftRun, TranscriptLine } from '../../api/types';
import { foldVi } from '../galaxy/layout';
import { castCharacters } from '../../lib/toon';
import { Avatar } from './Stage';

type Tab = 'facts' | 'docs' | 'notes' | 'more';

const PROMISE_TONE: Record<
  string,
  { label: string; tone: 'mustard' | 'mint' | 'coral' | 'paper' }
> = {
  open: { label: 'Đang hẹn', tone: 'mustard' },
  kept: { label: 'Đã giữ', tone: 'mint' },
  late: { label: 'Trễ hẹn', tone: 'coral' },
  carried: { label: 'Để lại cuối ca', tone: 'paper' },
};

export function Notebook({
  run,
  scene,
  lines,
  onOpenDocument,
  className,
}: {
  run: ShiftRun;
  scene: SceneView;
  lines: TranscriptLine[];
  onOpenDocument: (id: string) => void;
  className?: string;
}) {
  const [tab, setTab] = useState<Tab>('facts');
  const idBase = useId();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const searchButton = useRef<HTMLButtonElement>(null);
  const searchingText = foldVi(query.trim());
  const showingResults = searching && searchingText.length >= 2;
  const nb = scene.notebook;
  const looks = useMemo(() => castCharacters(run.cast), [run.cast]);

  // Tìm xuyên lời thoại (tìm kiếm kiểu Her Story, khối M).
  const hits = useMemo(() => {
    const q = foldVi(query.trim());
    if (q.length < 2) return [];
    return lines.filter((l) => foldVi(l.text).includes(q)).slice(-20);
  }, [query, lines]);

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      {/* Ô tìm chỉ hiện khi cần, để chỗ cho dữ kiện. */}
      {searching ? (
        <div className="flex items-center gap-2 px-4 pt-4">
          <div className="min-w-0 flex-1">
            <ToonInput
              leftIcon={<Search size={16} strokeWidth={2.6} />}
              placeholder="Tìm trong lời thoại…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              compact
              autoFocus
              aria-label="Tìm trong lời thoại"
            />
          </div>
          <ToonButton
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearching(false);
              setQuery('');
              requestAnimationFrame(() => searchButton.current?.focus());
            }}
          >
            Đóng tìm kiếm
          </ToonButton>
        </div>
      ) : (
        <div className="flex justify-end px-4 pt-3">
          <ToonButton
            ref={searchButton}
            size="sm"
            variant="secondary"
            leftIcon={<Search size={15} strokeWidth={2.6} />}
            onClick={() => setSearching(true)}
          >
            Tìm lời thoại
          </ToonButton>
        </div>
      )}
      {searching && !showingResults && (
        <p
          role="status"
          className="px-4 pt-2 text-xs font-semibold text-toon-ink-faint"
        >
          Nhập ít nhất 2 ký tự để tìm lời thoại.
        </p>
      )}
      {showingResults ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">
          <p role="status" className="mb-3 font-bold text-toon-ink-soft">
            {hits.length
              ? `${hits.length} lời thoại khớp${hits.length === 20 ? ' gần nhất' : ''}.`
              : 'Không tìm thấy lời thoại. Thử từ khác hoặc bỏ dấu.'}
          </p>
          <ul className="space-y-2">
            {hits.map((l) => {
              const speaker =
                l.kind === 'player'
                  ? 'Bạn'
                  : run.cast.find((c) => c.slot === l.speaker)?.name;
              return (
                <li
                  key={l.seq}
                  className="rounded-xl border-2 border-toon-ink bg-toon-paper p-2.5"
                >
                  {speaker && (
                    <span className="font-toon text-xs font-extrabold text-toon-ink-soft">
                      {speaker}
                    </span>
                  )}
                  <p className="font-semibold text-toon-ink">{l.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <>
          <ToonTabs
            label="Sổ tay"
            idBase={idBase}
            value={tab}
            onChange={setTab}
            className="mx-4 mt-3"
            variant="quiet"
            items={[
              { key: 'facts', label: 'Dữ kiện', count: nb.facts.length },
              { key: 'docs', label: 'Tài liệu', count: scene.documents.length },
              { key: 'notes', label: 'Ghi chú' },
              {
                key: 'more',
                label: 'Lời hứa & tra cứu',
                count: nb.promises.length || undefined,
              },
            ]}
          />
          <ToonTabPanel
            idBase={idBase}
            tabKey={tab}
            active
            className="toon-ruled min-h-0 flex-1 overflow-y-auto p-4 text-sm font-semibold break-words text-toon-ink"
          >
            {tab === 'facts' &&
              (nb.facts.length ? (
                <ol className="space-y-2.5">
                  {nb.facts.map((f) => (
                    <li key={f.id} className="flex gap-3">
                      <time className="tabular h-fit w-12 shrink-0 rounded-md border-2 border-toon-ink bg-toon-sky px-1 text-center font-toon text-xs font-extrabold">
                        {f.time}
                      </time>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty text="Dữ kiện bạn tìm ra (hỏi người, mở tài liệu) tự ghi vào đây." />
              ))}
            {tab === 'more' && <MoreHeading>Lời hứa</MoreHeading>}
            {tab === 'more' &&
              (nb.promises.length ? (
                <ul className="space-y-2">
                  {nb.promises.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-toon-ink bg-toon-paper p-2.5"
                    >
                      <span>{p.label}</span>
                      <ToonBadge tone={PROMISE_TONE[p.status]?.tone ?? 'paper'}>
                        {PROMISE_TONE[p.status]?.label ?? p.status}
                      </ToonBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="Bạn hẹn ai một giờ hay một tin, game ghi lại ở đây như người thật ghi sổ." />
              ))}
            {tab === 'docs' &&
              (scene.documents.length ? (
                <ul className="space-y-2">
                  {scene.documents.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => onOpenDocument(doc.id)}
                        className="flex w-full items-center gap-2 rounded-xl border-2 border-toon-ink bg-toon-paper p-3 text-left font-toon font-extrabold text-toon-ink shadow-toon-sm hover:bg-toon-cream focus-visible:outline-none focus-visible:shadow-toon-focus"
                      >
                        <FileText size={17} className="shrink-0" aria-hidden />
                        <span className="flex-1">{doc.title}</span>
                        <ExternalLink
                          size={15}
                          className="shrink-0"
                          aria-hidden
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="Tài liệu đã mở sẽ nằm ở đây, xem lại không tốn thời gian." />
              ))}
            {tab === 'notes' && <Notes runId={run.runId} />}
            {tab === 'more' && <MoreHeading>Thuật ngữ</MoreHeading>}
            {tab === 'more' &&
              (scene.glossary.length ? (
                <dl className="space-y-3">
                  {scene.glossary.map((g) => (
                    <div key={g.term}>
                      <dt className="font-toon text-base font-extrabold text-toon-maroon">
                        {g.term}
                      </dt>
                      <dd className="text-toon-ink-soft">{g.plain}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <Empty text="Ca này không có thuật ngữ cần giải thích." />
              ))}
            {tab === 'more' && <MoreHeading>Người trong ca</MoreHeading>}
            {tab === 'more' && (
              <ul className="space-y-2.5">
                {scene.cast.map((c) => (
                  <li key={c.slot} className="flex items-center gap-3">
                    {looks.get(c.slot) && (
                      <Avatar
                        src={looks.get(c.slot)?.src ?? ''}
                        color={looks.get(c.slot)?.color ?? '#fffaf0'}
                        size={48}
                      />
                    )}
                    <span>
                      <span className="block font-toon text-base font-extrabold capitalize text-toon-ink">
                        {c.name}
                        {c.status && (
                          <span className="ml-1 rounded-full bg-[#ffe4a3] px-2 py-0.5 text-xs normal-case">
                            {c.status}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-toon-ink-soft">
                        {c.relation}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </ToonTabPanel>
        </>
      )}
    </div>
  );
}

function MoreHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-4 font-toon text-base font-extrabold text-toon-ink first:mt-0">
      {children}
    </h3>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="py-6 text-center text-sm font-semibold text-toon-ink-faint">
      {text}
    </p>
  );
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
    if (text.trim() && !add.isPending) add.mutate(text.trim());
  };
  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-2">
        <ToonTextarea
          readOnly={add.isPending}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ghi nhanh điều bạn đang nghĩ…"
          aria-label="Ghi chú riêng"
          size="sm"
          className="text-sm"
          maxLength={4000}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-toon-ink-faint">
            Chỉ bạn thấy. Không gửi cho AI, không chấm.
          </span>
          <ToonButton
            size="sm"
            type="submit"
            variant="secondary"
            loading={add.isPending}
            disabled={!text.trim()}
          >
            Ghi
          </ToonButton>
        </div>
      </form>
      {add.isSuccess && !text && (
        <p role="status" className="text-xs font-bold text-toon-mint-deep">
          Đã lưu ghi chú.
        </p>
      )}
      {add.isError && (
        <p role="alert" className="text-xs font-bold text-toon-maroon">
          {errorText(add.error)} Ghi chú vẫn còn trong ô, bạn bấm Ghi lại nhé.
        </p>
      )}
      {notes.isLoading && (
        <p className="text-xs text-toon-ink-faint">Đang mở ghi chú…</p>
      )}
      {notes.isError && (
        <p className="text-xs font-bold text-toon-maroon">
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
        <p className="text-xs text-toon-ink-faint">
          Chưa có ghi chú nào. Ghi lại giả thuyết, việc cần hỏi, giờ đã hẹn…
        </p>
      )}
      <ul className="space-y-2">
        {(notes.data ?? []).map((n, i) => (
          <li
            key={i}
            className="-rotate-[0.4deg] rounded-md border-2 border-toon-ink bg-[#fff1a8] px-3 py-2 shadow-toon-sm"
          >
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
