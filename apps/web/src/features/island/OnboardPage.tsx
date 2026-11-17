/**
 * Ngày đầu nhận việc (6 slide onboard) theo theme "Cartoon viền đen": mỗi
 * slide một góc của nơi làm việc, đồng nghiệp nhân sự đứng cạnh chào và
 * tiễn. Không chấm điểm; chỉ đánh dấu đã xem khi bấm hoàn tất ở slide cuối.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  Character,
  SceneBackdrop,
  SpeechBubble,
  ToonButton,
  cn,
  toonButtonClasses,
} from '@datn/ui';
import { api } from '../../api';
import { errorText, keys, useIsland } from '../../api/hooks';
import {
  TOON_BACKDROPS,
  TOON_CHARACTERS,
  type ToonBackdropId,
} from '../../lib/toon';

/** Chỉ đánh dấu đã xem khi người chơi bấm hoàn tất ở slide cuối. */
function useFinishOnboard(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.progress.markOnboardSeen(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.island(id) }),
  });
}

/** Tên khung onboard (4C) hiển thị bằng tiếng Việt. */
const FRAME_LABEL: Record<string, string> = {
  Culture: 'Văn hoá nơi làm',
  Connection: 'Người bạn sẽ gặp',
  Clarification: 'Vai của bạn',
  Compliance: 'Quy định',
  Confidence: 'Tự tin bắt đầu',
};

/** Mỗi khung một góc của nơi làm việc, để lật slide như đi một vòng công ty. */
const FRAME_BACKDROP: Record<string, ToonBackdropId> = {
  Culture: 'street',
  Connection: 'cafe',
  Clarification: 'office',
  Compliance: 'meeting',
};
const FALLBACK_BACKDROPS: ToonBackdropId[] = [
  'street',
  'office',
  'cafe',
  'office',
  'meeting',
  'home',
];

export default function OnboardPage() {
  const { enrolmentId } = useParams();
  const island = useIsland(enrolmentId);
  const finish = useFinishOnboard(enrolmentId ?? '');
  const navigate = useNavigate();
  if (island.isError)
    return (
      <Notice
        title="Chưa mở được ngày đầu nhận việc"
        text={errorText(island.error)}
        back={enrolmentId ? `/islands/${enrolmentId}` : '/galaxy'}
        retry={() => void island.refetch()}
      />
    );
  if (!enrolmentId) return <Notice title="Chưa chọn đảo" back="/galaxy" />;
  if (!island.data)
    return <Notice title="Đang chuẩn bị ngày đầu nhận việc…" loading />;
  if (!island.data.onboard.slides.length)
    return (
      <Notice
        title="Chưa có nội dung giới thiệu"
        back={`/islands/${enrolmentId}`}
      />
    );
  return (
    <Deck
      key={enrolmentId}
      data={island.data}
      saving={finish.isPending}
      error={finish.isError ? errorText(finish.error) : null}
      onFinish={() =>
        finish.mutate(undefined, {
          onSuccess: () =>
            navigate(`/islands/${enrolmentId}`, { replace: true }),
        })
      }
    />
  );
}

function Deck({
  data,
  saving,
  error,
  onFinish,
}: {
  data: NonNullable<ReturnType<typeof useIsland>['data']>;
  saving: boolean;
  error: string | null;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const slides = data.onboard.slides;
  const slide = slides[index];
  const last = index === slides.length - 1;
  const host = TOON_CHARACTERS.relations;
  const hostLine = index === 0 ? data.onboard.hrOpen : null;
  const backdrop =
    TOON_BACKDROPS[
      FRAME_BACKDROP[slide.frame] ??
        FALLBACK_BACKDROPS[index % FALLBACK_BACKDROPS.length]
    ];
  const change = (next: number) => {
    if (saving) return;
    setIndex(Math.max(0, Math.min(slides.length - 1, next)));
  };
  const moved = useRef(false);
  useEffect(() => {
    // Lần đầu không cướp focus; các lần đổi slide đưa focus tới tiêu đề mới.
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [index]);

  return (
    <SceneBackdrop
      src={backdrop}
      dim={0.75}
      className="theme-toon flex min-h-dvh flex-col"
    >
      <div
        className="flex min-h-dvh flex-col"
        onKeyDown={(e) => {
          if (e.altKey || e.ctrlKey || e.metaKey) return;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            change(index + 1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            change(index - 1);
          }
        }}
      >
        <header className="border-b-[3px] border-toon-ink bg-toon-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <Link
              to={`/islands/${data.enrolmentId}`}
              aria-label="Về đảo"
              className="grid size-11 shrink-0 place-items-center rounded-full border-[3px] border-toon-ink bg-toon-cream shadow-toon-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-toon-focus"
            >
              <ArrowLeft size={20} strokeWidth={2.8} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-toon text-xl font-extrabold leading-tight text-toon-ink sm:text-2xl">
                Ngày đầu nhận việc
              </h1>
              <p className="truncate text-sm font-semibold text-toon-ink-soft">
                {data.company.name} · Cấp {data.level.levelNo} · Không chấm
                điểm, xem lại lúc nào cũng được
              </p>
            </div>
            <Pips
              slides={slides}
              index={index}
              disabled={saving}
              onPick={change}
            />
          </div>
        </header>

        <main className="relative mx-auto flex w-full max-w-6xl flex-1 items-end gap-6 px-4 pb-6 pt-8 sm:px-6">
          <div className="pointer-events-none relative hidden h-[min(70vh,600px)] shrink-0 self-end lg:block">
            <Character
              src={host.src}
              name="Đồng nghiệp nhân sự"
              height="100%"
              motion={hostLine ? 'hop' : 'bob'}
              beat={index}
            />
            {hostLine && (
              <div className="absolute bottom-full left-[12%] mb-3 w-72 animate-toon-pop">
                <SpeechBubble tone="mint">{hostLine}</SpeechBubble>
              </div>
            )}
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col self-center">
            <div aria-live="polite" aria-atomic="true" className="mb-3">
              <span className="inline-flex -rotate-2 items-center gap-2 rounded-xl border-[3px] border-toon-ink bg-toon-mustard px-3 py-1 font-toon text-base font-extrabold text-toon-ink shadow-toon-sm">
                Slide {index + 1}/{slides.length} ·{' '}
                {FRAME_LABEL[slide.frame] ?? slide.frame}
              </span>
            </div>
            <article
              key={index}
              className="toon-card relative min-h-80 animate-toon-slide p-6 shadow-toon-lg sm:p-9"
              style={{ touchAction: 'pan-y' }}
              onTouchStart={(e) => {
                const p = e.touches[0];
                touch.current = { x: p.clientX, y: p.clientY };
              }}
              onTouchEnd={(e) => {
                const origin = touch.current;
                touch.current = null;
                if (!origin) return;
                const p = e.changedTouches[0];
                const dx = p.clientX - origin.x;
                if (
                  Math.abs(dx) > 50 &&
                  Math.abs(dx) > Math.abs(p.clientY - origin.y)
                )
                  change(index + (dx < 0 ? 1 : -1));
              }}
            >
              <h2
                ref={heading}
                tabIndex={-1}
                className="font-toon text-3xl font-extrabold leading-tight text-toon-ink focus:outline-none sm:text-4xl"
              >
                {slide.title}
              </h2>
              <SlideLines key={index} lines={slide.lines} />
              {last && data.onboard.hrClose && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer rounded font-bold focus-visible:shadow-toon-focus">
                    Lời nhắn cuối
                  </summary>
                  <p className="mt-2">{data.onboard.hrClose}</p>
                </details>
              )}
              {/* Trên điện thoại không có nhân vật đứng: lời chào nằm trong thẻ. */}
              {hostLine && (
                <div className="mt-7 flex items-start gap-3 border-t-[3px] border-dashed border-toon-ink/30 pt-5 lg:hidden">
                  <span
                    aria-hidden
                    className="relative block size-14 shrink-0 overflow-hidden rounded-full border-[2.5px] border-toon-ink shadow-toon-sm"
                    style={{ backgroundColor: host.color }}
                  >
                    <img
                      src={host.src}
                      alt=""
                      className="absolute left-1/2 top-[2%] h-[260%] w-auto max-w-none -translate-x-1/2"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="mb-1 font-toon text-sm font-extrabold text-toon-ink">
                      Đồng nghiệp nhân sự
                    </p>
                    <SpeechBubble tone="mint">{hostLine}</SpeechBubble>
                  </div>
                </div>
              )}
            </article>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border-[2.5px] border-toon-ink bg-toon-coral-light px-3 py-2 text-sm font-bold text-toon-ink"
              >
                {error}
              </p>
            )}
            <div className="mt-6 flex items-center justify-between gap-3">
              <ToonButton
                variant="secondary"
                disabled={index === 0 || saving}
                onClick={() => change(index - 1)}
                leftIcon={<ArrowLeft size={17} strokeWidth={2.8} />}
              >
                Trước
              </ToonButton>
              <p className="hidden rounded-full border-2 border-toon-ink bg-toon-paper/90 px-3 py-1 text-xs font-bold text-toon-ink-soft sm:block">
                ← → hoặc vuốt.
              </p>
              {last ? (
                <ToonButton
                  size="lg"
                  onClick={onFinish}
                  loading={saving}
                  loadingText="Đang lưu…"
                  rightIcon={<ArrowRight size={18} strokeWidth={2.8} />}
                >
                  Sẵn sàng nhận ca
                </ToonButton>
              ) : (
                <ToonButton
                  size="lg"
                  onClick={() => change(index + 1)}
                  rightIcon={<ArrowRight size={18} strokeWidth={2.8} />}
                >
                  Tiếp
                </ToonButton>
              )}
            </div>
          </div>
        </main>
      </div>
    </SceneBackdrop>
  );
}

const BULLET_COLORS = ['#a6d2ea', '#a8dbb9', '#eea7b4', '#f6b496', '#f0b63c'];

/** Ba dòng đầu luôn thấy; phần còn lại gập sau "Xem thêm" (giữ nguyên câu seed). */
function SlideLines({ lines }: { lines: string[] }) {
  const head = lines.slice(0, 3);
  const rest = lines.slice(3);
  const item = (line: string, i: number) => (
    <li
      key={i}
      className="flex gap-3 text-base font-semibold leading-relaxed text-toon-ink sm:text-[17px]"
    >
      <span
        aria-hidden
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-[2.5px] border-toon-ink font-toon text-sm font-extrabold"
        style={{ backgroundColor: BULLET_COLORS[i % BULLET_COLORS.length] }}
      >
        {i + 1}
      </span>
      <span>{line}</span>
    </li>
  );
  return (
    <div className="mt-5">
      <ul className="space-y-3.5">{head.map(item)}</ul>
      {rest.length > 0 && (
        <details className="mt-3">
          <summary className="w-fit cursor-pointer rounded-md font-toon text-sm font-extrabold underline decoration-dotted underline-offset-4">
            Xem thêm ({rest.length})
          </summary>
          <ul className="mt-3 space-y-3.5">
            {rest.map((line, i) => item(line, i + 3))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Pips({
  slides,
  index,
  disabled,
  onPick,
}: {
  slides: Array<{ title: string }>;
  index: number;
  disabled: boolean;
  onPick: (i: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label="Chọn slide"
    >
      {slides.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          disabled={disabled}
          aria-label={`Slide ${i + 1}: ${s.title}`}
          aria-current={i === index ? 'step' : undefined}
          className={cn(
            'grid place-items-center rounded-full border-[2.5px] border-toon-ink font-toon text-xs font-extrabold transition-transform focus-visible:outline-none focus-visible:shadow-toon-focus',
            i === index
              ? 'size-9 bg-toon-mustard shadow-toon-sm'
              : i < index
                ? 'size-7 bg-toon-mint'
                : 'size-7 bg-toon-paper hover:-translate-y-0.5',
          )}
        >
          {i < index ? <Check size={14} strokeWidth={3.2} /> : i + 1}
        </button>
      ))}
    </div>
  );
}

function Notice({
  title,
  text,
  back,
  retry,
  loading = false,
}: {
  title: string;
  text?: string;
  back?: string;
  retry?: () => void;
  loading?: boolean;
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
        {(retry || back) && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {retry && <ToonButton onClick={retry}>Thử lại</ToonButton>}
            {back && (
              <Link
                to={back}
                className={toonButtonClasses({ variant: 'secondary' })}
              >
                Quay lại
              </Link>
            )}
          </div>
        )}
      </div>
    </SceneBackdrop>
  );
}
