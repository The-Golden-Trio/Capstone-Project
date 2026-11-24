/**
 * Màn chơi một ca làm (Luật dẫn truyện bản 3, seed v2). Bố cục: thanh trạng
 * thái một hàng; trái là sân khấu (D-05) với khung trả lời ngay dưới lời
 * thoại; phải là bàn làm việc (việc, người, tài liệu, sổ tay). Trên điện
 * thoại, thanh dưới đổi giữa sân khấu và từng tab của bàn làm việc.
 */
import { useEffect, useRef, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  CirclePause,
  Flag,
  PartyPopper,
  Play,
  Users,
} from 'lucide-react';
import {
  Character,
  Dialog,
  SceneBackdrop,
  ToonButton,
  ToonTextarea,
  cn,
  toonButtonClasses,
  useToast,
} from '@datn/ui';
import { api, sourceOf } from '../../api';
import { startFreshRun } from '../../api/demo';
import { keys, useRun } from '../../api/hooks';
import type { SceneView } from '../../api/types';
import { DocumentPane } from './desktop/Desktop';
import { DocumentViewer, InlineMarkdown } from './desktop/DocumentViewer';
import { ArtefactEditor } from './desktop/editors';
import { AutoplayBar } from './autoplay/AutoplayBar';
import { autoplayScript, scriptForTask } from '../../api/demo/playthroughs';
import { useAutoplay } from './autoplay/useAutoplay';
import { ActionButton, TriggerButtons } from './ActionPanel';
import { Composer } from './Composer';
import { Hud } from './Hud';
import { Notebook } from './Notebook';
import { Stage } from './Stage';
import { usePlaySession } from './usePlaySession';
import { usePlayDesktop } from './usePlayDesktop';
import { Avatar } from './Stage';
import { TOON_BACKDROPS, castCharacters } from '../../lib/toon';
import { tabLabel, type WorkbenchTab } from './workbench/model';
import { urgentPromises } from './workbench/promises';
import {
  DocsPanel,
  PeoplePanel,
  WorkPanel,
  blockedReason,
} from './workbench/Panels';
import { Workbench, WorkbenchNav, type TabBadges } from './workbench/Workbench';

export default function PlayPage() {
  const { runId = '' } = useParams();
  return <RunPlayPage key={runId} runId={runId} />;
}

function RunPlayPage({ runId }: { runId: string }) {
  const run = useRun(runId);
  const s = usePlaySession(runId);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [intro, setIntro] = useState(true);
  const desktop = usePlayDesktop(s, intro, runId);
  const viewing = desktop.windows[desktop.windows.length - 1] ?? null;
  const [tab, setTab] = useState<WorkbenchTab>('work');
  const [mobileScene, setMobileScene] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [params, setParams] = useSearchParams();
  const demo = sourceOf('play') === 'demo';
  const autoplayName = demo ? params.get('autoplay') : null;
  const script = autoplayScript(autoplayName, run.data?.taskId);
  const autoplay = useAutoplay({
    script,
    snapshot: {
      scene: s.scene,
      settled: s.ready && !s.sending && !s.waiting && !s.paused,
      queued: s.queued,
      spoken: s.current?.text ?? null,
      intro,
      fresh: s.fresh,
    },
  });
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
    if (!focusKey || intro || viewing) return;
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
  }, [focusKey, intro, hasQueue, viewing]);
  const [flagOpen, setFlagOpen] = useState(false);

  // Điện thoại: hết pha xử lý (vào trò chuyện, tình huống) thì về sân khấu.
  const mode = s.scene?.mode;
  useEffect(() => {
    if (mode && mode !== 'phase') setMobileScene(true);
  }, [mode]);

  useEffect(() => {
    if (!viewing) setExpanded(false);
  }, [viewing]);

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

  const looks = castCharacters(r.cast);

  const blocked = blockedReason(scene, locked);
  const busy = s.sending || !!s.paused;
  const pick = (action: SceneView['actions'][number]) =>
    void desktop.pick(action);
  const badges: TabBadges = {
    work: urgentPromises(scene),
    notebook: scene.notebook.facts.length,
  };
  const showWorkbench = !mobileScene || !!viewing;
  const openTab = (next: WorkbenchTab) => {
    setTab(next);
    setMobileScene(false);
  };
  const viewingDocument =
    viewing?.kind === 'document'
      ? scene.documents.find((item) => item.id === viewing.id)
      : undefined;
  // Việc nhắm thẳng vào tài liệu đang xem (chạy lại, sửa lại) gắn trên tài liệu đó.
  const attached = viewingDocument
    ? scene.actions.filter(
        (a) => a.target === viewingDocument.id && a.kind !== 'open',
      )
    : [];

  const viewer = viewing ? (
    <DocumentPane
      entry={viewing}
      expanded={expanded}
      onToggleExpand={() => setExpanded((value) => !value)}
      onClose={() => desktop.close(viewing.id)}
      backLabel={tabLabel(tab)}
      mobileBackLabel={mobileScene ? 'Cảnh' : tabLabel(tab)}
      toolbar={
        attached.length ? (
          <>
            {attached.map((a) => (
              <ActionButton
                key={a.key}
                action={a}
                compact
                minutesPerPoint={scene.clock.minutesPerPoint}
                disabled={busy || !!blocked}
                onPick={pick}
              />
            ))}
          </>
        ) : undefined
      }
    >
      {viewing.kind === 'document' ? (
        viewingDocument && <DocumentViewer document={viewingDocument} />
      ) : (
        <>
          {(s.error || s.paused) && (
            <p role="alert" className="desktop-error">
              {s.error ?? s.paused} Bản nháp vẫn còn.
              {s.paused && (
                <button
                  type="button"
                  className="ml-2 underline"
                  onClick={() => void s.resume()}
                >
                  Thử tiếp tục
                </button>
              )}
            </p>
          )}
          <ArtefactEditor
            form={desktop.draftFor(viewing.form)}
            onDraftChange={(draft) =>
              desktop.updateDraft(viewing.form.id, draft)
            }
            busy={s.sending || s.waiting || !!s.paused}
            submitLabel={viewing.submitLabel}
            onSubmit={(fields, ticks) => desktop.submit(viewing, fields, ticks)}
            onCancel={() => desktop.close(viewing.id)}
          />
        </>
      )}
    </DocumentPane>
  ) : null;

  const triggers = (className: string) => (
    <TriggerButtons
      actions={scene.actions}
      ended={scene.ended}
      disabled={busy || !!blocked}
      onPick={pick}
      className={className}
    />
  );

  const composer = (
    <Composer
      scene={scene}
      busy={s.sending}
      locked={locked}
      onSend={s.send}
      onOpenNode={desktop.openNode}
      spoken={s.current?.text ?? null}
      clockHeld={autoplay.holdsClock}
    />
  );
  const reply = s.paused ? (
    <div className="rounded-2xl border-[3px] border-toon-ink bg-[#ffe4a3] p-4 shadow-toon-sm">
      <p className="font-toon text-lg font-extrabold text-toon-ink">
        Ca làm tạm dừng
      </p>
      <p className="mt-1 text-sm font-semibold text-toon-ink-soft">
        Chưa gọi được mô hình dẫn truyện. Tiến độ của bạn vẫn được giữ nguyên,
        không mất gì.
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
  ) : locked || scene.mode === 'confirm_end' ? null : scene.ended ? (
    <EndCard onNext={() => navigate(`/play/${runId}/reflect`)} />
  ) : scene.mode === 'phase' ? (
    <PhaseCard onTab={openTab}>{triggers('lg:hidden')}</PhaseCard>
  ) : (
    composer
  );
  const trayOpen = !!s.error || !!reply || (s.queued > 0 && !s.paused);

  return (
    <div
      className="theme-toon toon-dots relative flex h-dvh flex-col overflow-hidden"
      style={
        {
          '--autoplay-bar-h': script ? '2.75rem' : '0px',
        } as React.CSSProperties
      }
    >
      {script && (
        <AutoplayBar
          autoplay={autoplay}
          summaryTo={`/play/${runId}/summary?autoplay=${autoplayName}`}
          onExit={() => setParams({}, { replace: true })}
          onRestart={async () => {
            const fresh = await startFreshRun(r.taskId);
            navigate(`/play/${fresh.runId}?autoplay=${autoplayName}`);
          }}
        />
      )}
      <div className="contents" inert={intro || undefined}>
        <Hud
          title={r.title}
          scene={scene}
          backTo={backTo}
          onHint={() => void s.send({ kind: 'hint' })}
          hintDisabled={locked || s.sending || !!s.paused || scene.ended}
          aiLabel={
            sourceOf('play') === 'demo'
              ? 'AI giả (bản xem thử)'
              : 'Lời nhân vật do AI dẫn dắt'
          }
          actions={triggers('max-lg:hidden')}
        />

        <div className="relative mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 lg:gap-3 lg:p-3">
          <main
            className={cn(
              '@container relative flex min-w-0 flex-1 flex-col overflow-hidden bg-toon-cream lg:rounded-[20px] lg:border-[3px] lg:border-toon-ink lg:shadow-toon',
              showWorkbench && 'max-lg:hidden',
              viewing && expanded && 'lg:hidden',
            )}
          >
            {scene.conversation && (
              <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex px-3 pr-24 @md:px-5 @xl:pr-56">
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
                    {scene.conversation.people
                      .map((person) => {
                        const status = scene.cast.find(
                          (cast) => cast.slot === person.slot,
                        )?.status;
                        return status
                          ? `${person.name} (${status})`
                          : person.name;
                      })
                      .join(', ')}
                  </span>
                </p>
              </div>
            )}
            <Stage
              run={r}
              lines={s.shown}
              bots={scene.bots}
              castStatus={scene.cast}
              glossary={scene.glossary}
              inactive={intro}
              current={s.current}
              queued={s.queued}
              waitingLabel={waitingLabel}
              conversationChannel={scene.conversation?.channel ?? null}
              talking={
                scene.conversation
                  ? {
                      channel: scene.conversation.channel,
                      slots: scene.conversation.people.map((p) => p.slot),
                    }
                  : scene.node
                    ? {
                        channel: scene.node.channel,
                        slots: [scene.node.speaker.slot],
                      }
                    : undefined
              }
              quiet={
                scene.mode === 'phase' || scene.await.kind === 'node_choice'
              }
              onAdvance={s.advance}
              clockHeld={autoplay.holdsClock}
              footer={
                trayOpen && (
                  <div ref={composerRef} className="flex flex-col gap-2.5">
                    {s.error && (
                      <p
                        role="alert"
                        className="rounded-xl border-[2.5px] border-toon-ink bg-toon-coral-light px-3 py-2 text-sm font-bold text-toon-ink"
                      >
                        {s.error}
                      </p>
                    )}
                    {reply}
                    {s.queued > 0 && !s.paused && (
                      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm font-bold text-toon-ink-soft">
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
                )
              }
            />
            {scene.mode === 'confirm_end' && !s.paused && composer}
          </main>

          <Workbench
            tab={tab}
            onTab={setTab}
            badges={badges}
            viewer={viewer}
            className={cn(
              'overflow-hidden bg-toon-cream max-lg:flex-1 lg:shrink-0 lg:rounded-[20px] lg:border-[3px] lg:border-toon-ink lg:shadow-toon',
              !showWorkbench && 'max-lg:hidden',
              viewing
                ? expanded
                  ? 'lg:flex-1'
                  : 'lg:w-[min(58%,880px)]'
                : 'lg:w-[360px] xl:w-[400px]',
            )}
          >
            {tab === 'work' ? (
              <WorkPanel
                scene={scene}
                goal={r.goal}
                blocked={blocked}
                busy={busy}
                onPick={pick}
              />
            ) : tab === 'people' ? (
              <PeoplePanel
                scene={scene}
                blocked={blocked}
                busy={busy}
                onPick={pick}
              />
            ) : tab === 'docs' ? (
              <DocsPanel
                scene={scene}
                blocked={blocked}
                busy={busy}
                onPick={pick}
                onOpen={desktop.openDocument}
              />
            ) : (
              <div className="flex h-full flex-col">
                <Notebook
                  run={r}
                  scene={scene}
                  lines={s.shown}
                  onOpenDocument={desktop.openDocument}
                  className="min-h-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => setFlagOpen(true)}
                  className="mx-3 mb-1 inline-flex min-h-11 items-center gap-1 self-start rounded-lg px-1 text-sm font-bold text-toon-ink-soft hover:text-toon-ink focus-visible:outline-none focus-visible:shadow-toon-focus"
                >
                  <Flag size={13} strokeWidth={2.6} aria-hidden /> Báo nội dung
                  sai
                </button>
              </div>
            )}
          </Workbench>
        </div>

        <WorkbenchNav
          view={showWorkbench ? tab : 'scene'}
          onScene={() => {
            if (viewing) desktop.close(viewing.id);
            setMobileScene(true);
          }}
          onTab={(next) => {
            if (viewing) desktop.close(viewing.id);
            openTab(next);
          }}
          badges={badges}
          className="lg:hidden"
        />
      </div>

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
        <IntroOverlay
          run={r}
          scene={scene}
          onStart={() => setIntro(false)}
          onAutoplay={
            demo && !script && scriptForTask(r.taskId)
              ? () =>
                  setParams(
                    { autoplay: scriptForTask(r.taskId) ?? '' },
                    { replace: true },
                  )
              : undefined
          }
        />
      )}
    </div>
  );
}

/** Pha xử lý: chọn việc ở bàn làm việc; điện thoại có lối tắt tới từng tab. */
function PhaseCard({
  onTab,
  children,
}: {
  onTab: (tab: WorkbenchTab) => void;
  children: React.ReactNode;
}) {
  const shortcuts: WorkbenchTab[] = ['people', 'docs', 'work'];
  return (
    <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center">
      <p className="flex-1 text-sm font-bold text-toon-ink">
        <span className="max-lg:hidden">
          Chọn việc ở bàn làm việc bên phải: hỏi người, mở tài liệu, làm việc.
        </span>
        <span className="lg:hidden">Bạn muốn làm gì tiếp?</span>
        <span className="mt-0.5 block font-semibold text-toon-ink-soft">
          Mỗi việc ghi rõ tốn bao nhiêu lượt.
        </span>
      </p>
      <div className="flex flex-wrap gap-2 lg:hidden">
        {shortcuts.map((key) => (
          <ToonButton
            key={key}
            size="sm"
            variant="secondary"
            onClick={() => onTab(key)}
          >
            {tabLabel(key)}
          </ToonButton>
        ))}
      </div>
      {children}
    </div>
  );
}

/** Giới thiệu trước khi vào ca (FR-03): vai, bối cảnh, người sẽ gặp. */
function IntroOverlay({
  run,
  scene,
  onStart,
  onAutoplay,
}: {
  run: NonNullable<ReturnType<typeof useRun>['data']>;
  scene: SceneView;
  onStart: () => void;
  /** Chỉ có ở demo khi ca có lượt chơi mẫu. */
  onAutoplay?: () => void;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = scene.introSlides ?? [];
  const slide = slides[slideIndex];
  const lastSlide = slideIndex >= slides.length - 1;
  const looks = castCharacters(run.cast);
  const host = run.cast[0];
  const hostLook = host ? looks.get(host.slot) : undefined;
  return (
    <SceneBackdrop
      src={TOON_BACKDROPS.office}
      dim={0.9}
      overlay
      className="top-[var(--autoplay-bar-h)] z-40 overflow-y-auto"
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
          {slide ? (
            <section
              aria-live="polite"
              className="mt-5 min-h-48 rounded-2xl border-[2.5px] border-toon-ink bg-toon-paper p-4 shadow-toon-sm sm:min-h-56 sm:p-5"
            >
              <h3 className="font-toon text-xl font-extrabold leading-tight text-toon-ink sm:text-2xl">
                {slide.title}
              </h3>
              <p className="mt-2 whitespace-pre-line text-base font-semibold leading-relaxed text-toon-ink-soft">
                <InlineMarkdown text={slide.body} />
              </p>
            </section>
          ) : (
            <>
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
                  phút. Hết giờ không phải thua, bạn vẫn nộp với những gì đã có.
                  Lời nhân vật do AI dẫn dắt theo kịch bản chuyên gia duyệt.
                </p>
              </details>
            </>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {slide && (
              <>
                <ToonButton
                  size="sm"
                  variant="secondary"
                  leftIcon={<ArrowLeft size={16} aria-hidden />}
                  onClick={() => setSlideIndex((index) => index - 1)}
                  disabled={slideIndex === 0}
                >
                  Trước
                </ToonButton>
                <p
                  aria-label={`Trang ${slideIndex + 1} trên ${slides.length}`}
                  className="mr-auto px-1 text-sm font-bold tabular-nums text-toon-ink-soft"
                >
                  {slideIndex + 1} / {slides.length}
                </p>
              </>
            )}
            {onAutoplay && (
              <ToonButton
                size="sm"
                variant="secondary"
                leftIcon={<Play size={15} aria-hidden />}
                onClick={onAutoplay}
              >
                Xem lượt chơi mẫu
              </ToonButton>
            )}
            <ToonButton
              size="lg"
              block={!slide}
              rightIcon={
                !lastSlide ? <ArrowRight size={18} aria-hidden /> : undefined
              }
              onClick={
                lastSlide ? onStart : () => setSlideIndex((index) => index + 1)
              }
              data-autoplay="intro-next"
              autoFocus
            >
              {lastSlide ? 'Vào ca' : 'Tiếp theo'}
            </ToonButton>
          </div>
        </div>
      </div>
    </SceneBackdrop>
  );
}

function EndCard({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center @xl:flex-row @xl:text-left">
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
