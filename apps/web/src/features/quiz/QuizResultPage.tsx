import { Link } from 'react-router-dom';
import { profile } from '@datn/game-core';
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Flag,
  HeartHandshake,
  Microscope,
  Palette,
  Wrench,
} from 'lucide-react';
import {
  CartoonPlanet,
  NightCard,
  ToonButton,
  ToonDisclosure,
  ToonStatus,
  ToonStatusGlyph,
  toonButtonClasses,
} from '@datn/ui';
import { RegionGlyph } from '../galaxy/regions';
import { QuizNotice, QuizMessage } from './QuizDecor';
import {
  errorText,
  useCatalogue,
  useOccupation,
  useQuizForm,
  useQuizResult,
} from '../../api/hooks';
import type { CareerSuggestion } from '../../api/types';

export default function QuizResultPage() {
  const result = useQuizResult();
  const form = useQuizForm();
  const catalogue = useCatalogue();
  if (result.isError)
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <QuizNotice
          title="Chưa tải được bản nháp"
          retry={() => void result.refetch()}
        >
          {errorText(result.error)}
        </QuizNotice>
      </div>
    );
  if (result.isPending)
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <QuizNotice title="Đang mở bản nháp" loading />
      </div>
    );
  if (!result.data)
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <QuizNotice title="Hành trình này chưa có bản nháp">
          18 thẻ về những việc bạn thích làm sẽ cho bạn vài điểm xuất phát.
        </QuizNotice>
        <Link to="/quiz" className={toonButtonClasses({ className: 'mt-6' })}>
          Làm Get to know me
        </Link>
      </div>
    );
  const data = result.data;
  const top = [...profile.RIASEC_AXES]
    .sort((a, b) => data.selfReported[b] - data.selfReported[a])
    .slice(0, 2);
  const meanings = top.map((axis) =>
    profile.RIASEC_INFO[axis].meaning.replace(/^Thích (việc )?/, ''),
  );
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <NightCard
        stars
        tape
        ribbon={
          <h1 className="font-toon text-3xl font-extrabold">Bản nháp về bạn</h1>
        }
      >
        <p className="max-w-xl text-sm font-bold">
          Bản nháp từ thẻ chưa kiểm định, không phải chẩn đoán; có thể đổi sau
          khi bạn thử nghề.
        </p>
        <p className="mt-2 text-sm text-toon-ink-soft">
          Chỉ để tham khảo, không gửi cho trường hay nhà tuyển dụng.
        </p>
        <Link
          to="/galaxy"
          style={{ backgroundColor: 'var(--color-toon-star)' }}
          className={toonButtonClasses({ className: 'mt-5' })}
        >
          Khám phá bản đồ <ArrowRight size={17} aria-hidden />
        </Link>
      </NightCard>
      <NightCard>
        <h2 className="font-toon text-2xl font-extrabold">
          Những việc bạn thích
        </h2>
        <p className="mt-2 text-sm text-toon-ink-soft">
          Thang 1–3: Không thích · Bình thường · Thích.
        </p>
        <ul
          aria-label="Sở thích tự kể, thang 1 đến 3"
          className="mt-6 space-y-4"
        >
          {profile.RIASEC_AXES.map((axis, i) => {
            const value = data.selfReported[axis];
            return (
              <li
                key={axis}
                className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.5rem] items-center gap-x-3 gap-y-1 sm:grid-cols-[2.25rem_7rem_minmax(0,1fr)_2.5rem]"
              >
                <span
                  aria-hidden
                  className="row-span-2 grid size-9 place-items-center rounded-full bg-toon-sand/60 sm:row-span-1"
                >
                  <RiasecIcon axis={axis} />
                </span>
                <span className="col-span-2 font-toon font-bold sm:col-span-1">
                  {profile.RIASEC_INFO[axis].name}
                </span>
                <div
                  role="meter"
                  aria-label={profile.RIASEC_INFO[axis].name}
                  aria-valuemin={1}
                  aria-valuemax={3}
                  aria-valuenow={value}
                  className="h-4 overflow-hidden rounded-full border-2 border-toon-ink bg-toon-sand/60"
                >
                  <div
                    className={
                      [
                        'bg-toon-sky',
                        'bg-toon-mint',
                        'bg-toon-rose',
                        'bg-toon-star',
                        'bg-toon-lilac',
                        'bg-toon-coral-light',
                      ][i]
                    }
                    style={{
                      height: '100%',
                      width: `${(Math.max(0, Math.min(3, value)) / 3) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-right font-toon font-bold tabular-nums">
                  {value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-toon-ink-soft">
          {data.flat
            ? 'Bạn chưa nghiêng rõ về hướng nào, thử vài kiểu khác nhau nhé'
            : `Bạn thích những việc như ${meanings.join('; và ')}.`}
        </p>
      </NightCard>
      <section aria-labelledby="regions-title">
        <h2
          id="regions-title"
          className="mb-4 font-toon text-2xl font-extrabold"
        >
          Vùng có thể thử trước
        </h2>
        {catalogue.isError ? (
          <QuizMessage tone="warning">
            {errorText(catalogue.error)}{' '}
            <ToonButton
              variant="ghost"
              size="sm"
              onClick={() => void catalogue.refetch()}
            >
              Tải lại vùng
            </ToonButton>
          </QuizMessage>
        ) : !catalogue.data ? (
          <p role="status">Đang mở vùng…</p>
        ) : data.regions.length === 0 ? (
          <p className="text-sm text-toon-star-soft">
            Chưa có vùng gợi ý. Bạn có thể chọn bất kỳ vùng nào trên bản đồ.
          </p>
        ) : (
          <ul className="toon-card toon-rows overflow-hidden p-0 text-toon-ink">
            {data.regions.slice(0, 3).map((id) => {
              const region = catalogue.data.regions.find((r) => r.id === id);
              return region ? (
                <li key={id}>
                  <Link
                    to={`/galaxy?vung=${id}`}
                    className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-toon-cream focus-visible:bg-toon-cream focus-visible:outline-none sm:px-5"
                  >
                    <CartoonPlanet seed={id} region={id} size={48} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-toon text-lg font-bold">
                        <RegionGlyph id={id} size={16} />
                        {region.name}
                      </span>
                      <span className="mt-0.5 block text-sm text-toon-ink-soft">
                        {region.card}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-sm font-bold sm:inline">
                      Khám phá vùng
                    </span>
                    <ChevronRight
                      size={18}
                      aria-hidden
                      className="shrink-0 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        )}
      </section>
      <section aria-labelledby="suggestions-title">
        <h2
          id="suggestions-title"
          className="mb-2 font-toon text-2xl font-extrabold"
        >
          Một vài nghề để bắt đầu
        </h2>
        <p className="mb-4 text-sm text-toon-star-soft">
          Đọc cả mặt khó của nghề, rồi tự chọn điều bạn muốn thử.
        </p>
        {data.suggestions.length > 0 && (
          <ol className="toon-card toon-rows overflow-hidden p-0 text-toon-ink">
            {data.suggestions.slice(0, 3).map((suggestion, i) => (
              <li key={suggestion.code}>
                <Suggestion suggestion={suggestion} rank={i + 1} />
              </li>
            ))}
          </ol>
        )}
        {data.suggestions.length === 0 && (
          <p className="text-sm text-toon-star-soft">
            Chưa có gợi ý nghề. Bản đồ vẫn mở để bạn tự khám phá.
          </p>
        )}
      </section>
      <NightCard className="px-4 py-1 sm:px-6">
        <ToonDisclosure
          summary="Mục tiêu của bạn"
          className="[&>summary]:min-h-14 [&>summary]:text-lg"
        >
          <div>
            {form.isError ? (
              <QuizMessage tone="warning">
                {errorText(form.error)}{' '}
                <ToonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => void form.refetch()}
                >
                  Tải lại mục tiêu
                </ToonButton>
              </QuizMessage>
            ) : !form.data ? (
              <p role="status">Đang mở mục tiêu…</p>
            ) : (
              <dl className="space-y-4">
                {form.data.goals.map((goal) => {
                  const value = data.goals[goal.id];
                  return (
                    <div
                      key={goal.id}
                      className="grid gap-1 border-b border-toon-ink/30 pb-3 sm:grid-cols-[8rem_1fr]"
                    >
                      <dt className="font-semibold">{goal.label}</dt>
                      <dd className="min-w-0 whitespace-pre-wrap break-words text-sm text-toon-ink-soft">
                        {value?.picked.length
                          ? value.picked.join(' · ')
                          : 'Chưa kể'}
                        {value?.note && <p className="mt-1">“{value.note}”</p>}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
            {data.interests.length > 0 && (
              <p className="mt-4 text-sm text-toon-ink-soft">
                Sở thích: {data.interests.join(' · ')}
              </p>
            )}
            <p className="mt-5 text-sm text-toon-ink-faint">
              Chỉ để bạn tự nhìn lại, không chấm điểm và không dùng để gợi ý
              nghề.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                to="/profile?tab=tong-quan"
                className="rounded-lg underline underline-offset-4 focus-visible:shadow-toon-focus"
              >
                Sửa mục tiêu trong hành trang
              </Link>
              <Link
                to="/quiz"
                className="rounded-lg underline underline-offset-4 focus-visible:shadow-toon-focus"
              >
                Làm lại Get to know me
              </Link>
            </div>
          </div>
        </ToonDisclosure>
      </NightCard>
    </div>
  );
}

function Suggestion({
  suggestion: s,
  rank,
}: {
  suggestion: CareerSuggestion;
  rank: number;
}) {
  const occupation = useOccupation(s.code);
  return (
    <article className="flex min-w-0 gap-4 px-4 py-4 sm:px-5">
      <span
        aria-hidden
        className="mt-1 hidden font-toon text-sm font-bold tabular-nums text-toon-ink-faint sm:block"
      >
        {String(rank).padStart(2, '0')}
      </span>
      <CartoonPlanet seed={s.code} region={s.regionId} size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-toon text-lg font-bold leading-snug">{s.name}</h3>
          {!s.playable && <ToonStatus kind="soon" compact />}
        </div>
        <p className="text-xs text-toon-ink-faint">{s.group}</p>
        <p className="mt-2 text-sm text-toon-ink-soft">{s.reason}</p>
        {/* Mặt khó luôn đi cùng gợi ý (BR-07): hiện dòng đầu, phần còn lại gập. */}
        <div className="mt-3 border-l-[3px] border-toon-coral/70 pl-3 text-sm">
          <p className="flex items-center gap-2 font-toon font-bold">
            <ToonStatusGlyph kind="warning" size={14} /> Mặt khó của nghề
          </p>
          {occupation.isError ? (
            <p className="mt-1 text-toon-ink-soft">
              {errorText(occupation.error)}{' '}
              <button
                className="underline"
                onClick={() => void occupation.refetch()}
              >
                Thử lại
              </button>
            </p>
          ) : !occupation.data ? (
            <p role="status" className="mt-1">
              Đang mở mặt khó của nghề…
            </p>
          ) : occupation.data.downsides.length ? (
            <ul className="mt-1 list-disc space-y-1 pl-4 text-toon-ink-soft">
              {occupation.data.downsides.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-toon-ink-faint">
              Chưa có thông tin mặt khó; hồ sơ nghề đang được bổ sung.
            </p>
          )}
        </div>
      </div>
      <Link
        to={`/occupations/${s.code}`}
        aria-label={`Xem hồ sơ nghề ${s.name}`}
        title="Xem hồ sơ nghề"
        className="mt-1 grid size-10 shrink-0 place-items-center self-start rounded-full border-2 border-toon-ink/25 transition-colors hover:border-toon-ink hover:bg-toon-star focus-visible:shadow-toon-focus"
      >
        <ArrowRight size={18} aria-hidden />
      </Link>
    </article>
  );
}

const RIASEC_ICONS = {
  R: Wrench,
  I: Microscope,
  A: Palette,
  S: HeartHandshake,
  E: Flag,
  C: ClipboardList,
} as const;

/** Mỗi kiểu việc một ký hiệu, để sáu thanh không chỉ phân biệt bằng chữ. */
function RiasecIcon({ axis }: { axis: string }) {
  const Icon = RIASEC_ICONS[axis as keyof typeof RIASEC_ICONS] ?? Wrench;
  return <Icon size={17} strokeWidth={2.4} aria-hidden />;
}
