/**
 * Màn chơi một ca làm (Luật dẫn truyện bản 3, seed v2). Bố cục:
 * trái là việc làm được (pha xử lý), giữa là sân khấu hội thoại và khung
 * trả lời, phải là sổ tay. Trên điện thoại, việc và sổ tay mở thành tấm
 * kéo lên từ dưới.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CirclePause, Flag, MoonStar, Users } from 'lucide-react';
import {
  Button,
  Callout,
  Dialog,
  EmptyState,
  LoadingBlock,
  Portrait,
  Sheet,
  StarField,
  Textarea,
  buttonClasses,
  useToast,
} from '@datn/ui';
import { api, sourceOf } from '../../api';
import { keys, useRun } from '../../api/hooks';
import type { SceneView } from '../../api/types';
import { ActionPanel } from './ActionPanel';
import { ArtefactForm } from './ArtefactForm';
import { Composer } from './Composer';
import { Hud } from './Hud';
import { Notebook } from './Notebook';
import { Stage } from './Stage';
import { usePlaySession } from './usePlaySession';

type Action = SceneView['actions'][number];

export default function PlayPage() {
  const { runId = '' } = useParams();
  const run = useRun(runId);
  const s = usePlaySession(runId);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [intro, setIntro] = useState(true);
  const [sheet, setSheet] = useState<'actions' | 'notebook' | null>(null);
  const [writing, setWriting] = useState<Action | null>(null);
  const [flagOpen, setFlagOpen] = useState(false);

  // Ca đã có diễn biến thì không hiện lại màn giới thiệu.
  useEffect(() => {
    if (s.ready && !s.fresh) setIntro(false);
  }, [s.ready, s.fresh]);

  useEffect(() => {
    if (s.scene?.ended) {
      void qc.invalidateQueries({ queryKey: keys.record });
      void qc.invalidateQueries({ queryKey: ['island'] });
    }
  }, [s.scene?.ended, qc]);

  if (run.isError) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <EmptyState
          title="Không mở được ca làm này"
          description="Lượt chơi không tồn tại hoặc không phải của bạn."
          action={
            <Link to="/galaxy" className={buttonClasses()}>
              Về bản đồ
            </Link>
          }
        />
      </div>
    );
  }
  if (s.loadError) {
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <EmptyState
          title="Chưa mở được ca làm"
          description={`${s.loadError} Tiến độ đã lưu của bạn không mất.`}
          action={
            <div className="flex gap-2">
              <Button onClick={s.reload}>Thử lại</Button>
              <Link
                to="/galaxy"
                className={buttonClasses({ variant: 'secondary' })}
              >
                Về bản đồ
              </Link>
            </div>
          }
        />
      </div>
    );
  }
  if (!run.data || !s.ready || !s.scene) {
    return <LoadingBlock text="Đang vào ca…" className="min-h-dvh" />;
  }

  const r = run.data;
  const scene = s.scene;
  const backTo = r.enrolmentId
    ? `/islands/${r.enrolmentId}`
    : r.occupationCode
      ? `/occupations/${r.occupationCode}`
      : '/galaxy';
  const locked = s.queued > 0 || s.waiting;
  const waitingLabel = s.waiting
    ? s.slow
      ? 'Mô hình trả lời chậm hơn thường lệ, bạn chờ chút nhé. Tiến độ đã được lưu.'
      : 'Đang soạn lời…'
    : null;

  const pick = (a: Action) => {
    setSheet(null);
    if (a.form) setWriting(a);
    else void s.send({ kind: 'action', key: a.key });
  };

  const actionPanel = (
    <ActionPanel
      actions={scene.actions}
      minutesPerPoint={scene.clock.minutesPerPoint}
      disabled={locked || s.sending || scene.mode !== 'phase'}
      onPick={pick}
    />
  );

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-night-950">
      <StarField seed={r.taskId} density={0.5} glints={4} />
      <div className="contents" inert={intro || undefined}>
        <Hud
          title={r.title}
          goal={r.goal}
          scene={scene}
          backTo={backTo}
          onNotebook={() => setSheet('notebook')}
          onHint={() => void s.send({ kind: 'hint' })}
          hintDisabled={locked || s.sending || scene.ended}
          aiLabel={
            sourceOf('play') === 'demo'
              ? 'AI giả (bản xem thử)'
              : 'Lời nhân vật do AI dẫn dắt'
          }
        />
      </div>

      <div
        className="relative mx-auto flex min-h-0 w-full max-w-[1500px] flex-1"
        inert={intro || undefined}
      >
        <aside
          className="hidden w-72 shrink-0 overflow-y-auto border-r border-line/60 p-4 xl:block"
          aria-label="Việc có thể làm"
        >
          <h2 className="mb-3 font-sans text-sm font-bold text-ink">
            Việc có thể làm
          </h2>
          {scene.suspended && (
            <p className="mb-3 rounded-md border border-line-gold bg-gold-900/30 p-2.5 text-xs text-gold-100">
              Đang dở: {scene.suspended.label} (còn {scene.suspended.remaining}{' '}
              điểm)
            </p>
          )}
          {actionPanel}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {scene.conversation && (
            <div className="flex items-center justify-center gap-2 border-b border-line/50 bg-night-900/50 py-2 text-xs text-ink-muted">
              <Users size={14} aria-hidden /> Đang trò chuyện với{' '}
              {scene.conversation.people.map((p) => p.name).join(', ')}
            </div>
          )}
          <Stage
            run={r}
            lines={s.shown}
            current={s.current}
            queued={s.queued}
            waitingLabel={waitingLabel}
            onAdvance={s.advance}
            onRevealAll={s.revealAll}
          />
          <div className="border-t border-line/60 bg-night-900/70 px-3 py-3 backdrop-blur sm:px-5">
            <div className="mx-auto max-w-3xl">
              {s.error && (
                <Callout tone="danger" className="mb-3">
                  {s.error}
                </Callout>
              )}
              {s.paused ? (
                <Callout tone="warning" title="Ca làm tạm dừng">
                  <p>
                    Chưa gọi được mô hình dẫn truyện. Tiến độ của bạn vẫn được
                    giữ nguyên, không mất gì.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    leftIcon={<CirclePause size={15} />}
                    onClick={() => void s.resume()}
                  >
                    Thử tiếp tục
                  </Button>
                </Callout>
              ) : scene.ended ? (
                <EndCard onNext={() => navigate(`/play/${runId}/reflect`)} />
              ) : (
                <Composer
                  scene={scene}
                  busy={s.sending}
                  locked={locked}
                  onSend={s.send}
                  onShowActions={() => setSheet('actions')}
                />
              )}
              {s.queued > 0 && !s.paused && (
                <p className="text-center text-xs text-ink-faint">
                  Bấm vào hộp thoại hoặc nhấn Space để nghe tiếp.
                </p>
              )}
            </div>
          </div>
        </main>

        <aside
          className="hidden w-80 shrink-0 border-l border-line/60 xl:flex xl:flex-col"
          aria-label="Sổ tay"
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="font-sans text-sm font-bold text-ink">Sổ tay</h2>
            <button
              type="button"
              onClick={() => setFlagOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-night-300 hover:text-ink"
            >
              <Flag size={12} aria-hidden /> Báo nội dung sai
            </button>
          </div>
          <Notebook
            run={r}
            scene={scene}
            lines={s.shown}
            className="min-h-0 flex-1"
          />
        </aside>
      </div>

      <Sheet
        open={sheet === 'actions'}
        onClose={() => setSheet(null)}
        side="bottom"
        title="Việc có thể làm"
      >
        {actionPanel}
      </Sheet>
      <Sheet
        open={sheet === 'notebook'}
        onClose={() => setSheet(null)}
        side="right"
        title="Sổ tay"
      >
        <Notebook
          run={r}
          scene={scene}
          lines={s.shown}
          className="-mx-4 h-[70dvh]"
        />
        <button
          type="button"
          onClick={() => setFlagOpen(true)}
          className="mt-3 inline-flex items-center gap-1 text-xs text-night-300"
        >
          <Flag size={12} aria-hidden /> Báo nội dung sai
        </button>
      </Sheet>

      <Dialog
        open={writing !== null}
        onClose={() => setWriting(null)}
        title={writing?.label ?? ''}
        size="lg"
        description={
          writing
            ? `Tốn ${writing.points} điểm thời gian (${writing.points * scene.clock.minutesPerPoint} phút).`
            : undefined
        }
      >
        {writing?.form && (
          <ArtefactForm
            form={writing.form}
            submitLabel="Xong"
            busy={s.sending}
            onCancel={() => setWriting(null)}
            onSubmit={async (fields, ticks) => {
              // Chỉ đóng khi lượt đã được nhận, để lỗi mạng không làm mất bài viết.
              if (
                await s.send({
                  kind: 'action',
                  key: writing.key,
                  fields,
                  ticks,
                })
              )
                setWriting(null);
            }}
          />
        )}
      </Dialog>

      <FlagDialog
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        onSend={async (reason) => {
          await api.play.flag(runId, scene.node?.id ?? scene.mode, reason);
          setFlagOpen(false);
          toast({
            title: 'Đã gửi báo cáo',
            description: 'Cảm ơn bạn, người duyệt nội dung sẽ xem lại.',
            tone: 'success',
          });
        }}
      />

      {intro && (
        <IntroOverlay run={r} scene={scene} onStart={() => setIntro(false)} />
      )}
    </div>
  );
}

/** Giới thiệu trước khi vào ca (FR-03): vai, bối cảnh, người sẽ gặp. */
function IntroOverlay({
  run,
  scene,
  onStart,
}: {
  run: NonNullable<ReturnType<typeof useRun>['data']>;
  scene: SceneView;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center overflow-y-auto bg-night-950/85 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
        className="glass w-full max-w-xl animate-rise rounded-2xl p-6 shadow-lift sm:p-8"
      >
        <p className="eyebrow flex items-center gap-2">
          <MoonStar size={14} aria-hidden /> Ca làm · {scene.clock.start}–
          {scene.clock.deadline}
        </p>
        <h2 id="intro-title" className="mt-2 text-2xl sm:text-3xl">
          {run.title}
        </h2>
        {run.scene && <p className="mt-3 text-ink-muted">{run.scene}</p>}
        <div className="mt-5 rounded-lg border border-line bg-night-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-night-300">
            Vai của bạn
          </p>
          <p className="mt-1 text-sm text-ink">{run.role}</p>
        </div>
        <ul className="mt-5 flex flex-wrap gap-3">
          {run.cast.map((c) => (
            <li
              key={c.slot}
              className="flex items-center gap-2.5 rounded-full border border-line bg-night-800/50 py-1 pl-1 pr-3"
            >
              <Portrait seed={c.slot} size={34} framed />
              <span className="text-xs">
                <span className="block font-semibold capitalize text-ink">
                  {c.name}
                </span>
                <span className="block text-ink-faint">{c.relation}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-ink-faint">
          Đồng hồ chạy theo việc bạn làm: mỗi việc ghi rõ tốn mấy điểm. Hết giờ
          không phải thua, bạn vẫn nộp với những gì đã có. Lời nhân vật do AI
          dẫn dắt theo kịch bản chuyên gia duyệt.
        </p>
        <Button size="lg" block className="mt-6" onClick={onStart} autoFocus>
          Vào ca
        </Button>
      </div>
    </div>
  );
}

function EndCard({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center sm:flex-row sm:text-left">
      <MoonStar size={28} className="shrink-0 text-gold-300" aria-hidden />
      <div className="flex-1">
        <p className="font-semibold text-gold-100">Ca làm đã khép lại</p>
        <p className="text-sm text-ink-muted">
          Trước khi xem kết quả, cho game hỏi bạn một câu ngắn.
        </p>
      </div>
      <Button onClick={onNext}>Tiếp tục</Button>
    </div>
  );
}

function FlagDialog({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Báo nội dung sai"
      description="Ví dụ: số liệu không khớp, nhân vật nói sai vai, lời lẽ không phù hợp."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            loading={busy}
            disabled={!reason.trim()}
            onClick={async () => {
              setBusy(true);
              setFailed(null);
              try {
                await onSend(reason.trim());
                setReason('');
              } catch (e) {
                setFailed(
                  e instanceof Error
                    ? e.message
                    : 'Chưa gửi được, bạn thử lại nhé.',
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Gửi
          </Button>
        </>
      }
    >
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={1000}
        aria-label="Điều gì chưa đúng"
      />
      {failed && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {failed}
        </p>
      )}
    </Dialog>
  );
}
