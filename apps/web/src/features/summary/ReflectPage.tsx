/**
 * Câu "thích tới đâu" sau ca (khối B): một màn, tối đa 2–3 chạm, mỗi chạm
 * nhắc lại một việc đã làm; hỏi TRƯỚC khi hiện điểm và kết cục để làm tốt
 * hay dở không kéo theo thích hay ghét. Câu "giống thực tế không" tách
 * riêng. Không ghi tên trục, không hiện biểu đồ, bỏ qua được.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import {
  Character,
  SceneBackdrop,
  ToonButton,
  ToonLikeScale,
  toonButtonClasses,
  cn,
  type LikeValue,
} from '@datn/ui';
import { errorText, useReflect, useRunSummary } from '../../api/hooks';
import { TOON_BACKDROPS, TOON_CHARACTERS } from '../../lib/toon';

const REALISM = [
  { key: '1', label: 'Chưa giống lắm' },
  { key: '2', label: 'Khá giống' },
  { key: '3', label: 'Rất giống' },
] as const;

export default function ReflectPage() {
  const { runId = '' } = useParams();
  const summary = useRunSummary(runId);
  const reflect = useReflect(runId);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, LikeValue>>({});
  const [realism, setRealism] = useState<'1' | '2' | '3' | null>(null);
  const toSummary = () => navigate(`/play/${runId}/summary`, { replace: true });

  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusedRun = useRef<string | null>(null);
  const ready = Boolean(
    summary.data &&
    !summary.data.reflection.answered &&
    summary.data.reflection.prompts.length,
  );
  useEffect(() => {
    if (!ready || focusedRun.current === runId || !titleRef.current) return;
    titleRef.current.focus({ preventScroll: true });
    focusedRun.current = runId;
  }, [ready, runId]);

  if (summary.isLoading)
    return (
      <SceneBackdrop
        src={TOON_BACKDROPS.cafe}
        dim={0.9}
        className="theme-toon grid min-h-dvh place-items-center p-4"
      >
        <p
          role="status"
          className="toon-card px-6 py-4 font-toon text-xl font-extrabold"
        >
          Đang khép ca…
        </p>
      </SceneBackdrop>
    );
  if (!summary.data)
    return (
      <SceneBackdrop
        src={TOON_BACKDROPS.cafe}
        dim={0.9}
        className="theme-toon grid min-h-dvh place-items-center p-4"
      >
        <div className="toon-card w-full max-w-md p-6 text-center">
          <h1 className="font-toon text-2xl font-extrabold">
            Chưa tải được phần nhìn lại
          </h1>
          <p role="alert" className="mt-3 text-sm font-semibold">
            {errorText(summary.error)}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ToonButton
              loading={summary.isFetching}
              onClick={() => void summary.refetch()}
            >
              Thử lại
            </ToonButton>
            <Link
              to={`/play/${runId}/summary`}
              className={toonButtonClasses({ variant: 'secondary' })}
            >
              Bỏ qua và xem kết quả
            </Link>
          </div>
        </div>
      </SceneBackdrop>
    );
  const prompts = summary.data?.reflection.prompts ?? [];
  if (summary.data.reflection.answered || prompts.length === 0) {
    return <Navigate to={`/play/${runId}/summary`} replace />;
  }

  return (
    <SceneBackdrop
      src={TOON_BACKDROPS.cafe}
      dim={0.7}
      className="theme-toon min-h-dvh"
    >
      <div className="mx-auto flex min-h-dvh max-w-5xl items-end gap-6 px-4 py-8 sm:px-6">
        <div className="pointer-events-none sticky bottom-0 hidden h-[min(72vh,600px)] shrink-0 lg:block">
          <Character
            src={TOON_CHARACTERS.lead.src}
            name="Người hỏi chuyện sau ca"
            height="100%"
            flip
          />
        </div>
        <div className="w-full max-w-xl self-center">
          <div className="toon-card relative animate-toon-pop p-6 pt-9 shadow-toon-lg sm:p-8 sm:pt-10">
            <span className="absolute -top-5 left-6 inline-flex -rotate-3 items-center gap-2 rounded-xl border-[3px] border-toon-ink bg-toon-mustard px-3.5 py-1 font-toon text-base font-extrabold text-toon-ink shadow-toon-sm">
              <Coffee size={17} strokeWidth={2.6} aria-hidden /> Nghỉ một chút
            </span>
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="font-toon text-3xl font-extrabold leading-tight text-toon-ink focus:outline-none focus-visible:outline-none"
            >
              Trước khi xem kết quả
            </h1>
            <p className="mt-2 font-semibold text-toon-ink-soft">
              Bạn muốn làm việc này hằng ngày? Không đúng sai.
            </p>

            <fieldset
              disabled={reflect.isPending}
              className="mt-6 min-w-0 border-0 p-0"
              aria-busy={reflect.isPending}
            >
              <legend className="sr-only">Cảm nhận sau ca</legend>
              <ol className="flex flex-col gap-5">
                {prompts.map((p, i) => (
                  <li
                    key={p.key}
                    className="rounded-2xl border-[2.5px] border-toon-ink bg-toon-cream p-4"
                  >
                    <p className="mb-3 flex gap-2.5 font-semibold text-toon-ink">
                      <span
                        aria-hidden
                        className="grid size-7 shrink-0 place-items-center rounded-lg border-[2.5px] border-toon-ink bg-toon-sky font-toon text-sm font-extrabold"
                      >
                        {i + 1}
                      </span>
                      {p.recap}
                    </p>
                    <ToonLikeScale
                      label={p.recap}
                      value={answers[p.key] ?? null}
                      onChange={(v) =>
                        setAnswers((a) => ({ ...a, [p.key]: v }))
                      }
                    />
                  </li>
                ))}
              </ol>

              <section className="mt-6" aria-labelledby="realism">
                <h2
                  id="realism"
                  className="font-toon text-lg font-extrabold text-toon-ink"
                >
                  Riêng màn chơi này: có giống công việc thật không?
                </h2>
                <div
                  role="radiogroup"
                  aria-label="Màn chơi có giống thực tế không"
                  className="mt-3 grid gap-2.5 sm:grid-cols-3"
                >
                  {REALISM.map((r) => {
                    const active = realism === r.key;
                    return (
                      <label
                        key={r.key}
                        className={cn(
                          'flex cursor-pointer items-center justify-center rounded-2xl border-[3px] border-toon-ink px-3 py-2.5 text-center font-toon text-base font-extrabold text-toon-ink transition-[transform,box-shadow] has-focus-visible:shadow-toon-focus',
                          active
                            ? '-translate-y-0.5 bg-toon-mint shadow-toon'
                            : 'bg-toon-paper shadow-toon-sm hover:-translate-y-0.5',
                        )}
                      >
                        <input
                          type="radio"
                          name="realism"
                          value={r.key}
                          checked={active}
                          onChange={() => setRealism(r.key)}
                          className="sr-only"
                        />
                        {r.label}
                      </label>
                    );
                  })}
                </div>
              </section>
            </fieldset>

            {reflect.isError && (
              <p
                className="mt-4 rounded-xl border-[2.5px] border-toon-ink bg-toon-coral-light px-3 py-2 text-sm font-bold text-toon-ink"
                role="alert"
              >
                {errorText(reflect.error)}
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ToonButton
                variant="ghost"
                disabled={reflect.isPending}
                onClick={toSummary}
              >
                Bỏ qua
              </ToonButton>
              <ToonButton
                size="lg"
                loading={reflect.isPending}
                disabled={Object.keys(answers).length === 0 && !realism}
                onClick={() =>
                  reflect.mutate(
                    { answers, realism: realism ? Number(realism) : null },
                    { onSuccess: toSummary },
                  )
                }
              >
                Xem kết quả ca làm
              </ToonButton>
            </div>
          </div>
        </div>
      </div>
    </SceneBackdrop>
  );
}
