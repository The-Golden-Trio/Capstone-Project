import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, LockKeyhole } from 'lucide-react';
import {
  ToonButton,
  ToonProgress,
  ToonField,
  LoadingBlock,
  InkStar,
  ToonTextarea,
  toonButtonClasses,
  cn,
} from '@datn/ui';
import { Notice, EmptyMessage, PaperCard } from '../profile/ProfileKit';
import { ProfileCanvas } from '../profile/ProfileKit';

import { errorText, useRate, useRatingForm } from '../../api/hooks';
import type {
  RatingCriterion,
  RatingForm,
  RatingSummary,
} from '../../api/types';

export default function RatePage() {
  const [submitted, setSubmitted] = useState(false);
  const { code } = useParams();
  const form = useRatingForm(code);
  if (form.isError)
    return <LoadError error={form.error} retry={() => void form.refetch()} />;
  if (!code) return <EmptyMessage title="Chưa chọn nghề" />;
  if (!form.data)
    return (
      <LoadingBlock text="Đang mở phiếu đánh giá…" className="min-h-[60vh]" />
    );
  const data = form.data;
  return (
    <ProfileCanvas narrow>
      <Link
        to={`/occupations/${code}`}
        className="text-sm text-toon-star-soft hover:underline"
      >
        ← Hồ sơ {data.occupationName}
      </Link>
      <header className="my-8">
        <p className="font-toon text-xs font-bold uppercase tracking-wider">
          Sau hành trình khám phá
        </p>
        <h1 className="mt-2 font-toon text-4xl font-extrabold sm:text-5xl">
          Nghề này, bạn thấy sao?
        </h1>
        <p className="mt-4 text-toon-paper">
          Chia sẻ cảm nhận về {data.occupationName} sau những ca làm bạn đã trải
          qua.
        </p>
      </header>
      {data.locked && !submitted ? (
        <PaperCard>
          <LockKeyhole
            size={28}
            className="mb-4 text-toon-ink-soft"
            aria-hidden
          />
          <h2 className="font-toon text-2xl font-extrabold text-toon-ink">
            Đi hết nghề rồi cùng nhìn lại
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-toon-ink-soft">
            {data.lockedReason ??
              'Hoàn thành các cấp nghề để mở phiếu đánh giá.'}
          </p>
          <Link
            to={`/occupations/${code}/levels`}
            className={toonButtonClasses({ className: 'mt-6' })}
          >
            Xem lộ trình
          </Link>
        </PaperCard>
      ) : data.criteria.length ? (
        <RatingEditor
          key={code}
          data={data}
          onSubmitted={() => setSubmitted(true)}
        />
      ) : (
        <EmptyMessage
          title="Phiếu đánh giá đang được chuẩn bị"
          description="Chưa có tiêu chí được công bố."
        />
      )}
    </ProfileCanvas>
  );
}

function RatingEditor({
  data,
  onSubmitted,
}: {
  data: RatingForm;
  onSubmitted: () => void;
}) {
  const rate = useRate(data.occupationCode);
  const refreshed = useRatingForm(data.occupationCode);
  const [scores, setScores] = useState<Record<string, number>>(data.mine ?? {});
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);
  const complete = data.criteria.every(
    (c) =>
      Number.isInteger(scores[c.code]) &&
      scores[c.code] >= 1 &&
      scores[c.code] <= 5,
  );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!complete || comment.length > 2000 || rate.isPending) return;
    rate.mutate(
      {
        scores: Object.fromEntries(
          data.criteria.map((c) => [c.code, scores[c.code]]),
        ),
        comment: comment.trim() || undefined,
      },
      { onSuccess: onSubmitted },
    );
  };
  if (rate.isSuccess)
    return (
      <PaperCard>
        <CheckCircle2 size={32} className="text-toon-mint-deep" aria-hidden />
        <h2 className="mt-4 text-3xl">Cảm ơn bạn đã chia sẻ</h2>
        <p className="mt-3 text-sm leading-relaxed text-toon-ink-soft">
          Đánh giá đã được lưu. Đây là cảm nhận của bạn sau trải nghiệm, chỉ
          công bố ở dạng tổng hợp khi đủ người đánh giá.
        </p>
        <h3 className="mb-4 mt-7 text-lg">
          Góc nhìn từ những người đã đi hết nghề
        </h3>
        {refreshed.isFetching ? (
          <LoadingBlock text="Đang cập nhật tổng hợp…" />
        ) : refreshed.isError ? (
          <LoadError
            error={refreshed.error}
            retry={() => void refreshed.refetch()}
          />
        ) : (
          <Ratings
            summary={refreshed.data?.summary ?? data.summary}
            criteria={data.criteria}
          />
        )}
        <Link
          to={`/occupations/${data.occupationCode}`}
          className={toonButtonClasses({ className: 'mt-6' })}
        >
          Về hồ sơ nghề
        </Link>
      </PaperCard>
    );
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Notice>
        Chọn từ 1 đến 5 cho mỗi tiêu chí. Số tổng hợp chỉ được công bố khi có đủ
        người đánh giá.
      </Notice>
      <fieldset disabled={rate.isPending} className="min-w-0 space-y-5">
        <legend className="sr-only">Các tiêu chí đánh giá nghề</legend>
        {data.criteria.map((criterion, i) => (
          <PaperCard key={criterion.code}>
            <StarSelector
              criterion={criterion}
              index={i + 1}
              value={scores[criterion.code]}
              onChange={(value) =>
                setScores((s) => ({ ...s, [criterion.code]: value }))
              }
              invalid={touched && !scores[criterion.code]}
            />
          </PaperCard>
        ))}
        <PaperCard>
          <ToonField
            label="Điều bạn muốn chia sẻ thêm"
            optional
            counter={`${comment.length}/2000`}
            hint="Kể về công việc bạn đã thử; tránh ghi thông tin cá nhân."
          >
            <ToonTextarea
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ca làm nào khiến bạn nhớ nhất?"
              rows={5}
            />
          </ToonField>
        </PaperCard>
      </fieldset>
      {touched && !complete && (
        <p role="alert" className="text-sm text-toon-maroon">
          Bạn chọn đủ các tiêu chí trước khi gửi nhé.
        </p>
      )}
      {rate.isError && (
        <div role="alert">
          <Notice tone="danger">{errorText(rate.error)}</Notice>
        </div>
      )}
      <ToonButton
        type="submit"
        block
        size="lg"
        loading={rate.isPending}
        loadingText="Đang gửi…"
      >
        {data.mine ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
      </ToonButton>
    </form>
  );
}

/** Radio gốc giữ thao tác bàn phím và trạng thái cho trình đọc màn hình. */
function StarSelector({
  criterion,
  index,
  value,
  onChange,
  invalid,
}: {
  criterion: RatingCriterion;
  index: number;
  value: number | undefined;
  onChange: (value: number) => void;
  invalid: boolean;
}) {
  const id = `rating-${criterion.code}`;
  return (
    <fieldset
      role="radiogroup"
      aria-describedby={`${id}-anchors${invalid ? ` ${id}-error` : ''}`}
      aria-invalid={invalid || undefined}
    >
      <legend className="mb-4 text-base font-semibold">
        {index}. {criterion.name}
      </legend>
      <div className="flex justify-between gap-1 sm:justify-start sm:gap-4">
        {[1, 2, 3, 4, 5].map((score) => (
          <label
            key={score}
            className="relative flex min-h-14 min-w-11 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-toon-ink bg-toon-cream px-1 has-checked:bg-toon-star-soft has-focus-visible:shadow-toon-focus"
          >
            <input
              type="radio"
              name={id}
              value={score}
              checked={value === score}
              onChange={() => onChange(score)}
              aria-label={`${score} trên 5${score === 1 ? `: ${criterion.low}` : score === 5 ? `: ${criterion.high}` : ''}`}
              className="peer sr-only"
              required
            />
            <InkStar
              size={32}
              fill={
                score <= (value ?? 0)
                  ? 'var(--color-toon-star)'
                  : 'var(--color-toon-shade)'
              }
              className={cn(
                'transition-colors',
                score <= (value ?? 0) ? 'text-toon-maroon' : 'text-toon-shade',
              )}
            />
            <span
              aria-hidden
              className={cn(
                'mt-1 text-xs',
                value === score
                  ? 'font-bold text-toon-maroon underline underline-offset-4'
                  : 'text-toon-ink-soft',
              )}
            >
              {score}
            </span>
          </label>
        ))}
      </div>
      <div
        id={`${id}-anchors`}
        className="mt-3 flex justify-between gap-4 text-xs leading-relaxed text-toon-ink-soft"
      >
        <span>1 · {criterion.low}</span>
        <span className="text-right">5 · {criterion.high}</span>
      </div>
      {invalid && (
        <p id={`${id}-error`} className="mt-2 text-xs text-toon-maroon">
          Chọn một mức từ 1 đến 5.
        </p>
      )}
    </fieldset>
  );
}

function LoadError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <EmptyMessage
      title="Chưa tải được dữ liệu"
      description={errorText(error)}
      action={
        <ToonButton variant="secondary" onClick={retry}>
          Thử lại
        </ToonButton>
      }
    />
  );
}
function Ratings({
  summary,
  criteria,
}: {
  summary: RatingSummary;
  criteria: RatingCriterion[];
}) {
  if (summary.withheld)
    return (
      <p className="text-sm text-toon-ink-soft">
        Cần thêm người đánh giá trước khi công bố số.
      </p>
    );
  if (!summary.responseCount || !Object.keys(summary.averages).length)
    return (
      <p className="text-sm text-toon-ink-soft">
        Chưa có đánh giá được công bố.
      </p>
    );
  return (
    <div className="space-y-4">
      <p className="text-xs text-toon-ink-soft">
        Từ {summary.responseCount} người đã đi hết nghề · thang 1–5, điểm cao
        mang nghĩa khác nhau ở từng tiêu chí.
      </p>
      {criteria.map((c) => (
        <div key={c.code}>
          <ToonProgress
            label={c.name}
            value={summary.averages[c.code] ?? 0}
            max={5}
          />
          <p className="mt-1 text-xs">
            {summary.averages[c.code] == null
              ? 'Chưa có số liệu'
              : `${summary.averages[c.code].toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/5`}
          </p>
          <div className="mt-1 flex justify-between gap-4 text-xs text-toon-ink-soft">
            <span>{c.low}</span>
            <span className="text-right">{c.high}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
