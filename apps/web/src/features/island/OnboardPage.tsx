import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Button,
  Callout,
  EmptyState,
  LoadingBlock,
  Portrait,
  cn,
} from '@datn/ui';
import { api } from '../../api';
import { errorText, keys, useIsland } from '../../api/hooks';
import { LoadError } from '../occupation/Parts';

/** Chỉ đánh dấu đã xem khi người chơi bấm hoàn tất ở slide cuối. */
function useFinishOnboard(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.progress.markOnboardSeen(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.island(id) }),
  });
}

export default function OnboardPage() {
  const { enrolmentId } = useParams();
  const island = useIsland(enrolmentId);
  const finish = useFinishOnboard(enrolmentId ?? '');
  const navigate = useNavigate();
  if (island.isError)
    return (
      <LoadError error={island.error} retry={() => void island.refetch()} />
    );
  if (!enrolmentId) return <EmptyState title="Chưa chọn đảo" />;
  if (!island.data)
    return (
      <LoadingBlock
        text="Đang chuẩn bị ngày đầu nhận việc…"
        className="min-h-[60vh]"
      />
    );
  if (!island.data.onboard.slides.length)
    return (
      <EmptyState
        title="Chưa có nội dung giới thiệu"
        action={
          <Link to={`/islands/${enrolmentId}`} className="underline">
            Về đảo
          </Link>
        }
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
    <div
      className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10"
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
      <Link
        to={`/islands/${data.enrolmentId}`}
        className="text-sm text-ink-faint hover:text-ink"
      >
        ← Về đảo
      </Link>
      <header className="my-7">
        <p className="eyebrow">
          {data.company.name} · Cấp {data.level.levelNo}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Ngày đầu nhận việc</h1>
        <p className="mt-3 text-sm text-ink-muted">
          {slides.length} slide để làm quen với nơi làm mới. Không chấm điểm; có
          thể xem lại bất cứ lúc nào.
        </p>
      </header>
      <div aria-live="polite" aria-atomic="true">
        <p className="mb-3 text-sm text-ink-faint">
          Slide {index + 1}/{slides.length} · {slide.frame}
        </p>
      </div>
      <article
        className="paper relative min-h-80 rounded-xl p-6 shadow-lift sm:p-10"
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
        <span className="text-xs font-semibold uppercase tracking-widest opacity-60">
          {slide.frame}
        </span>
        <h2
          ref={heading}
          tabIndex={-1}
          className="mt-3 text-3xl leading-tight focus:outline-none"
        >
          {slide.title}
        </h2>
        <ul className="mt-6 space-y-4 text-base leading-relaxed">
          {slide.lines.map((line, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-50"
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {(index === 0 || last) && (
          <div className="mt-8 flex items-center gap-4 border-t border-current/15 pt-5">
            <Portrait
              seed={`${data.enrolmentId}-hr`}
              name="Đồng nghiệp nhân sự"
              expression="vui"
              size={64}
              framed
            />
            <div>
              <p className="mb-1 text-xs font-semibold">Đồng nghiệp nhân sự</p>
              <p className="text-sm leading-relaxed">
                {index === 0 ? data.onboard.hrOpen : data.onboard.hrClose}
              </p>
            </div>
          </div>
        )}
      </article>
      <div
        className="my-5 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Chọn slide"
      >
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => change(i)}
            disabled={saving}
            aria-label={`Slide ${i + 1}: ${s.title}`}
            aria-current={i === index ? 'step' : undefined}
            className="grid size-9 place-items-center rounded-full focus-visible:shadow-focus"
          >
            <span
              className={cn(
                'size-2.5 rounded-full',
                i === index
                  ? 'bg-gold-300 ring-4 ring-gold-300/15'
                  : 'bg-night-500',
              )}
            />
          </button>
        ))}
      </div>
      {error && (
        <Callout tone="danger" className="mb-4">
          {error}
        </Callout>
      )}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="subtle"
          disabled={index === 0 || saving}
          onClick={() => change(index - 1)}
          leftIcon={<ArrowLeft size={16} />}
        >
          Trước
        </Button>
        {last ? (
          <Button
            onClick={onFinish}
            loading={saving}
            loadingText="Đang lưu…"
            rightIcon={<ArrowRight size={16} />}
          >
            Sẵn sàng nhận ca
          </Button>
        ) : (
          <Button
            onClick={() => change(index + 1)}
            rightIcon={<ArrowRight size={16} />}
          >
            Tiếp
          </Button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-ink-faint">
        Dùng phím ← → hoặc vuốt ngang để lật slide.
      </p>
    </div>
  );
}
