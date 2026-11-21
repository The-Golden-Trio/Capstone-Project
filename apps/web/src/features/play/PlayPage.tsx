/**
 * Màn chơi một ca làm (Luật dẫn truyện bản 3, seed v2). Bố cục:
 * trái là việc làm được (pha xử lý), giữa là sân khấu hội thoại và khung
 * trả lời, phải là sổ tay. Trên điện thoại, việc và sổ tay mở thành tấm
 * kéo lên từ dưới.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CirclePause, Flag, PartyPopper, Users } from 'lucide-react';
import {
  Character,
  Dialog,
  SceneBackdrop,
  Sheet,
  ToonButton,
  ToonTextarea,
  toonButtonClasses,
  useToast,
} from '@datn/ui';
import { api, sourceOf } from '../../api';
import { keys, useRun } from '../../api/hooks';
import type { SceneView } from '../../api/types';
import { ArtefactForm } from './ArtefactForm';
import { Composer } from './Composer';
import { Hud } from './Hud';
import { Notebook } from './Notebook';
import { Stage } from './Stage';
import { usePlaySession } from './usePlaySession';
import { Avatar } from './Stage';
import { TOON_BACKDROPS, castCharacters } from '../../lib/toon';

type Action = SceneView['actions'][number];

export default function PlayPage() {
  const { runId = '' } = useParams();
  const run = useRun(runId);
  const s = usePlaySession(runId);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [intro, setIntro] = useState(true);
  const composerRef = useRef<HTMLDivElement>(null);

  // Nút hay ô nhập đang focus bị thay khi đổi pha (trả lời xong, kết thúc
  // trò chuyện, kết ca): đưa focus tới hộp thoại hoặc điều khiển mới, để
  // người dùng bàn phím không bị rơi về body. Không giành focus khi người
  // chơi đang ở chỗ khác (sổ tay, nhật ký).
  const hasQueue = s.queued > 0;
  const focusKey = s.scene
    ? [
        s.scene.mode,
        s.scene.await.kind,
        s.scene.node?.id ?? '',
        hasQueue,
        s.scene.ended,
        s.waiting,
      ].join(':')
    : '';
  useEffect(() => {
    if (!focusKey || intro) return;
    const id = requestAnimationFrame(() => {
      const active = document.activeElement;
      const dialogue = document.getElementById('stage-dialog');
      // Hộp thoại hết nhịp để nghe thì nhường focus cho khung trả lời.
      const idleDialogue = active === dialogue && !hasQueue;
      if (active && active !== document.body && !idleDialogue) return;
      if (hasQueue && dialogue) {
        dialogue.focus();
        return;
      }
      const target = composerRef.current?.querySelector<HTMLElement>(
        'textarea, [role="tab"][aria-selected="true"], button:not([disabled])',
      );
      (target ?? dialogue)?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [focusKey, intro, hasQueue]);
  const [notebook, setNotebook] = useState(false);
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
      <ToonScreen
        title="Không mở được ca làm này"
        text="Lượt chơi không tồn tại hoặc không phải của bạn."
      >
        <Link to="/galaxy" className={toonButtonClasses()}>
          Về bản đồ
        </Link>
      </ToonScreen>
    );
  }
  if (s.loadError) {
    return (
      <ToonScreen
        title="Chưa mở được ca làm"
        text={`${s.loadError} Tiến độ đã lưu của bạn không mất.`}
      >
        <ToonButton onClick={s.reload}>Thử lại</ToonButton>
        <Link
          to="/galaxy"
          className={toonButtonClasses({ variant: 'secondary' })}
        >
          Về bản đồ
        </Link>
      </ToonScreen>
    );
  }
  if (!run.data || !s.ready || !s.scene) {
    return (
      <ToonScreen title="Đang vào ca…" loading>
        {null}
      </ToonScreen>
    );
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
    if (a.form) setWriting(a);
    else void s.send({ kind: 'action', key: a.key });
  };

  const looks = castCharacters(r.cast);

  return (
    <div className="theme-toon toon-dots relative flex h-dvh flex-col overflow-hidden">
      <div className="contents" inert={intro || undefined}>
        <Hud
          title={r.title}
          goal={r.goal}
          scene={scene}
          backTo={backTo}
          onNotebook={() => setNotebook(true)}
          notebookCount={scene.notebook.facts.length}
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
        className="relative mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 sm:p-3 lg:p-4"
        inert={intro || undefined}
      >
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-toon-cream sm:rounded-[20px] sm:border-[3px] sm:border-toon-ink sm:shadow-toon">
          {scene.conversation && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex px-3 pr-16 sm:justify-center sm:px-48">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full border-[2.5px] border-toon-ink bg-toon-paper py-1 pl-1.5 pr-3.5 text-sm font-bold text-toon-ink shadow-toon-sm">
                <span className="flex -space-x-2">
                  {scene.conversation.people.map((p) => {
                    const look = looks.get(p.slot);
                    return look ? (
                      <Avatar
                        key={p.slot}
                        src={look.src}
                        color={look.color}
                        size={30}
                      />
                    ) : null;
                  })}
                </span>
                <Users size={15} strokeWidth={2.6} aria-hidden />
                <span className="truncate">
                  Đang trò chuyện với{' '}
                  {scene.conversation.people.map((p) => p.name).join(', ')}
                </span>
              </p>
            </div>
          )}
          <Stage
            run={r}
            lines={s.shown}
            current={s.current}
            queued={s.queued}
            waitingLabel={waitingLabel}
            conversationChannel={scene.conversation?.channel ?? null}
            quiet={scene.mode === 'phase' || scene.await.kind === 'node_choice'}
            onAdvance={s.advance}
          />
          <div
            ref={composerRef}
            className="relative z-20 border-t-[3px] border-toon-ink bg-[#f1dcb6] px-3 py-3 sm:px-5 sm:py-4"
          >
            <div className="mx-auto max-w-3xl">
              {s.error && (
                <p
                  role="alert"
                  className="mb-3 rounded-xl border-[2.5px] border-toon-ink bg-toon-coral-light px-3 py-2 text-sm font-bold text-toon-ink"
                >
                  {s.error}
                </p>
              )}
              {s.paused ? (
                <div className="rounded-2xl border-[3px] border-toon-ink bg-[#ffe4a3] p-4 shadow-toon-sm">
                  <p className="font-toon text-lg font-extrabold text-toon-ink">
                    Ca làm tạm dừng
                  </p>
                  <p className="mt-1 text-sm font-semibold text-toon-ink-soft">
                    Chưa gọi được mô hình dẫn truyện. Tiến độ của bạn vẫn được
                    giữ nguyên, không mất gì.
                  </p>
                  <ToonButton
                    size="sm"
                    className="mt-3"
                    leftIcon={<CirclePause size={15} strokeWidth={2.6} />}
                    onClick={() => void s.resume()}
                  >
                    Thử tiếp tục
                  </ToonButton>
                </div>
              ) : scene.ended ? (
                <EndCard onNext={() => navigate(`/play/${runId}/reflect`)} />
              ) : (
                <Composer
                  scene={scene}
                  busy={s.sending}
                  locked={locked}
                  onSend={s.send}
                  onPickAction={pick}
                  spoken={s.current?.text ?? null}
                />
              )}
              {s.queued > 0 && !s.paused && (
                <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm font-bold text-toon-ink-soft">
                  Bấm vào hộp thoại hoặc nhấn Space để nghe tiếp.
                  {s.queued > 1 && (
                    <button
                      type="button"
                      onClick={s.revealAll}
                      className="rounded-full border-[2.5px] border-toon-ink bg-toon-paper px-3 py-0.5 font-toon text-sm font-bold text-toon-ink shadow-toon-sm hover:-translate-y-px focus-visible:outline-none focus-visible:shadow-toon-focus"
                    >
                      Hiện hết ({s.queued})
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      <Sheet
        open={notebook}
        onClose={() => setNotebook(false)}
        side="right"
        theme="toon"
        title="Sổ tay"
      >
        <Notebook
          run={r}
          scene={scene}
          lines={s.shown}
          className="-mx-6 -mt-2 h-[70dvh]"
        />
        <button
          type="button"
          onClick={() => setFlagOpen(true)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-toon-ink-soft"
        >
          <Flag size={13} strokeWidth={2.6} aria-hidden /> Báo nội dung sai
        </button>
      </Sheet>

      <Dialog
        open={writing !== null}
        onClose={() => {
          if (!s.sending) setWriting(null);
        }}
        title={writing?.label ?? ''}
        size="lg"
        theme="toon"
        description={
          writing
            ? `Mất khoảng ${writing.points * scene.clock.minutesPerPoint} phút trong ca.`
            : undefined
        }
      >
        {writing && s.error && (
          <p
            role="alert"
            className="mb-3 rounded-xl border-2 border-toon-ink bg-toon-coral-light p-3 text-sm font-bold"
          >
            {s.error} Bản nháp vẫn còn; bạn có thể gửi lại.
          </p>
        )}
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
  const looks = castCharacters(run.cast);
  const host = run.cast[0];
  const hostLook = host ? looks.get(host.slot) : undefined;
  return (
    <SceneBackdrop
      src={TOON_BACKDROPS.office}
      dim={0.9}
      overlay
      className="z-40 overflow-y-auto"
    >
      <div className="flex min-h-full items-center justify-center gap-6 p-4 sm:p-8">
        {hostLook && host && (
          <div className="pointer-events-none hidden h-[min(78vh,620px)] shrink-0 self-end lg:block">
            <Character
              src={hostLook.src}
              name={host.name}
              height="100%"
              flip={hostLook.facing === 'left'}
            />
          </div>
        )}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
          className="toon-card relative w-full max-w-xl animate-toon-pop p-6 pt-9 shadow-toon-lg sm:p-8 sm:pt-10"
        >
          <span className="absolute -top-5 left-6 inline-flex -rotate-3 items-center gap-2 rounded-xl border-[3px] border-toon-ink bg-toon-mustard px-3.5 py-1 font-toon text-base font-extrabold text-toon-ink shadow-toon-sm">
            Ca làm · {scene.clock.start}–{scene.clock.deadline}
          </span>
          <h2
            id="intro-title"
            className="font-toon text-3xl font-extrabold leading-tight text-toon-ink sm:text-4xl"
          >
            {run.title}
          </h2>
          {run.scene && (
            <p className="mt-3 text-base font-semibold leading-relaxed text-toon-ink-soft">
              {run.scene}
            </p>
          )}
          <div className="mt-5 rounded-2xl border-[2.5px] border-toon-ink bg-[#d6ecf7] p-4">
            <p className="font-toon text-sm font-extrabold uppercase tracking-wide text-toon-ink-soft">
              Vai của bạn
            </p>
            <p className="mt-1 font-semibold text-toon-ink">{run.role}</p>
          </div>
          <p className="mt-5 font-toon text-sm font-extrabold uppercase tracking-wide text-toon-ink-soft">
            Người bạn sẽ gặp
          </p>
          <ul className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {run.cast.map((c) => {
              const look = looks.get(c.slot);
              return (
                <li
                  key={c.slot}
                  className="flex items-center gap-3 rounded-2xl border-[2.5px] border-toon-ink bg-toon-paper p-2 pr-3 shadow-toon-sm"
                >
                  {look && (
                    <Avatar src={look.src} color={look.color} size={52} />
                  )}
                  <span className="min-w-0 text-sm">
                    <span className="block font-toon text-base font-extrabold capitalize text-toon-ink">
                      {c.name}
                    </span>
                    <span className="block font-semibold text-toon-ink-soft">
                      {c.relation}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <details className="group mt-5 rounded-xl border-2 border-dashed border-toon-ink/50 px-3 py-2 text-sm font-semibold text-toon-ink-soft">
            <summary className="cursor-pointer list-none font-toon font-extrabold text-toon-ink marker:hidden">
              <span className="mr-1 inline-block transition-transform group-open:rotate-90">
                ▸
              </span>
              Cách chơi
            </summary>
            <p className="mt-1.5">
              Đồng hồ chạy theo việc bạn làm: mỗi việc ghi rõ mất bao nhiêu
              phút. Hết giờ không phải thua, bạn vẫn nộp với những gì đã có. Lời
              nhân vật do AI dẫn dắt theo kịch bản chuyên gia duyệt.
            </p>
          </details>
          <ToonButton
            size="lg"
            block
            className="mt-6"
            onClick={onStart}
            autoFocus
          >
            Vào ca
          </ToonButton>
        </div>
      </div>
    </SceneBackdrop>
  );
}

function EndCard({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-4 text-center shadow-toon sm:flex-row sm:text-left">
      <span
        aria-hidden
        className="grid size-14 shrink-0 animate-toon-hop place-items-center rounded-2xl border-[3px] border-toon-ink bg-toon-mustard"
      >
        <PartyPopper size={28} strokeWidth={2.4} />
      </span>
      <div className="flex-1">
        <p className="font-toon text-xl font-extrabold text-toon-ink">
          Ca làm đã khép lại
        </p>
        <p className="text-sm font-semibold text-toon-ink-soft">
          Trước khi xem kết quả, bạn có thể kể vài cảm nhận ngắn.
        </p>
      </div>
      <ToonButton size="lg" onClick={onNext}>
        Tiếp tục
      </ToonButton>
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
      theme="toon"
      title="Báo nội dung sai"
      description="Ví dụ: số liệu không khớp, nhân vật nói sai vai, lời lẽ không phù hợp."
      footer={
        <>
          <ToonButton variant="ghost" onClick={onClose}>
            Huỷ
          </ToonButton>
          <ToonButton
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
          </ToonButton>
        </>
      }
    >
      <ToonTextarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={1000}
        aria-label="Điều gì chưa đúng"
      />
      {failed && (
        <p role="alert" className="mt-2 text-sm font-bold text-toon-maroon">
          {failed}
        </p>
      )}
    </Dialog>
  );
}

/** Màn chờ hoặc báo lỗi của ca làm: thẻ giấy giữa bối cảnh văn phòng. */
function ToonScreen({
  title,
  text,
  loading = false,
  children,
}: {
  title: string;
  text?: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SceneBackdrop
      src={TOON_BACKDROPS.office}
      dim={0.9}
      className="theme-toon grid min-h-dvh place-items-center p-4"
    >
      <div
        role={loading ? 'status' : undefined}
        className="toon-card w-full max-w-md animate-toon-pop p-6 text-center"
      >
        {loading && (
          <span
            aria-hidden
            className="mx-auto mb-3 block size-12 animate-spin rounded-full border-[5px] border-toon-ink border-t-toon-mustard"
          />
        )}
        <p className="font-toon text-2xl font-extrabold text-toon-ink">
          {title}
        </p>
        {text && (
          <p className="mt-2 font-semibold text-toon-ink-soft">{text}</p>
        )}
        {!loading && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {children}
          </div>
        )}
      </div>
    </SceneBackdrop>
  );
}
