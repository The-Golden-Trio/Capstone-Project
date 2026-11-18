import { Link } from 'react-router-dom';
import { profile } from '@datn/game-core';
import {
  CartoonPlanet,
  NightCard,
  ToonBadge,
  ToonButton,
  toonButtonClasses,
} from '@datn/ui';
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
        <Link to="/galaxy" className={toonButtonClasses({ className: 'mt-5' })}>
          Khám phá bản đồ →
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
                className="grid items-center gap-2 sm:grid-cols-[7rem_1fr_3rem]"
              >
                <span className="font-toon font-bold">
                  {profile.RIASEC_INFO[axis].name}
                </span>
                <div
                  role="meter"
                  aria-label={profile.RIASEC_INFO[axis].name}
                  aria-valuemin={1}
                  aria-valuemax={3}
                  aria-valuenow={value}
                  className="h-7 overflow-hidden rounded-full border-[3px] border-toon-ink bg-toon-cream shadow-toon-sm"
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
          <div className="grid gap-3 md:grid-cols-3">
            {data.regions.slice(0, 3).map((id) => {
              const region = catalogue.data.regions.find((r) => r.id === id);
              return region ? (
                <Link
                  key={id}
                  to={`/galaxy?vung=${id}`}
                  className="flex h-full flex-col rounded-2xl border-[3px] border-toon-ink bg-toon-paper p-5 text-toon-ink shadow-toon focus-visible:shadow-toon-focus"
                >
                  <CartoonPlanet seed={id} region={id} size={64} />
                  <h3 className="mt-3 font-toon text-xl font-bold">
                    {region.name}
                  </h3>
                  <p className="mt-3 text-sm text-toon-ink-soft">
                    {region.card}
                  </p>
                  <span className="mt-4 block text-sm">Khám phá vùng →</span>
                </Link>
              ) : null;
            })}
          </div>
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
        <div className="grid gap-4 lg:grid-cols-3">
          {data.suggestions.slice(0, 3).map((suggestion) => (
            <Suggestion key={suggestion.code} suggestion={suggestion} />
          ))}
        </div>
        {data.suggestions.length === 0 && (
          <p className="text-sm text-toon-star-soft">
            Chưa có gợi ý nghề. Bản đồ vẫn mở để bạn tự khám phá.
          </p>
        )}
      </section>
      <NightCard>
        <details>
          <summary className="cursor-pointer font-toon text-2xl font-bold">
            Mục tiêu của bạn
          </summary>
          <div className="mt-5">
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
        </details>
      </NightCard>
    </div>
  );
}

function Suggestion({ suggestion: s }: { suggestion: CareerSuggestion }) {
  const occupation = useOccupation(s.code);
  return (
    <article className="min-w-0">
      <NightCard className="flex h-full flex-col">
        <div className="mb-4 flex items-center gap-3">
          <CartoonPlanet seed={s.code} region={s.regionId} size={60} />
          <div className="min-w-0">
            <h3 className="font-toon text-xl font-bold">{s.name}</h3>
            <p className="mt-1 text-xs text-toon-ink-faint">{s.group}</p>
          </div>
        </div>
        <p className="text-sm text-toon-ink-soft">{s.reason}</p>
        <div className="my-4 text-sm">
          <p className="font-semibold">Mặt khó của nghề</p>
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
            <p role="status" className="mt-2">
              Đang mở mặt khó của nghề…
            </p>
          ) : occupation.data.downsides.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-toon-ink-soft">
              {occupation.data.downsides.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-toon-ink-faint">
              Chưa có thông tin mặt khó; hồ sơ nghề đang được bổ sung.
            </p>
          )}
        </div>
        {!s.playable && (
          <ToonBadge
            className="mb-4 whitespace-normal py-1 leading-relaxed"
            tone="sky"
          >
            Chưa có màn chơi · Xem hồ sơ nghề
          </ToonBadge>
        )}
        <Link
          to={`/occupations/${s.code}`}
          className={toonButtonClasses({
            variant: 'secondary',
            className: 'mt-auto w-full',
          })}
        >
          Xem hồ sơ nghề →
        </Link>
      </NightCard>
    </article>
  );
}
