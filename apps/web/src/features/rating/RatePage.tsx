import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, LockKeyhole } from 'lucide-react';
import {
  Button,
  Callout,
  EmptyState,
  Field,
  LoadingBlock,
  Panel,
  Sparkle,
  Textarea,
  buttonClasses,
  cn,
} from '@datn/ui';
import { errorText, useRate, useRatingForm } from '../../api/hooks';
import type { RatingCriterion, RatingForm } from '../../api/types';
import { LoadError, Ratings } from '../occupation/Parts';

export default function RatePage() {
  const [submitted, setSubmitted] = useState(false);
  const { code } = useParams();
  const form = useRatingForm(code);
  if (form.isError)
    return <LoadError error={form.error} retry={() => void form.refetch()} />;
  if (!code) return <EmptyState title="Chưa chọn nghề" />;
  if (!form.data)
    return (
      <LoadingBlock text="Đang mở phiếu đánh giá…" className="min-h-[60vh]" />
    );
  const data = form.data;
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to={`/occupations/${code}`}
        className="text-sm text-ink-faint hover:text-ink"
      >
        ← Hồ sơ {data.occupationName}
      </Link>
      <header className="my-8">
        <p className="eyebrow">Sau hành trình khám phá</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Nghề này, bạn thấy sao?</h1>
        <p className="mt-4 text-ink-muted">
          Chia sẻ cảm nhận về {data.occupationName} sau những ca làm bạn đã trải
          qua.
        </p>
      </header>
      {data.locked && !submitted ? (
        <Panel>
          <LockKeyhole size={28} className="mb-4 text-ink-faint" aria-hidden />
          <h2 className="text-2xl">Đi hết nghề rồi cùng nhìn lại</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {data.lockedReason ??
              'Hoàn thành các cấp nghề để mở phiếu đánh giá.'}
          </p>
          <Link
            to={`/occupations/${code}/levels`}
            className={buttonClasses({ className: 'mt-6' })}
          >
            Xem lộ trình
          </Link>
        </Panel>
      ) : data.criteria.length ? (
        <RatingEditor
          key={code}
          data={data}
          onSubmitted={() => setSubmitted(true)}
        />
      ) : (
        <EmptyState
          title="Phiếu đánh giá đang được chuẩn bị"
          description="Chưa có tiêu chí được công bố."
        />
      )}
    </div>
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
      <Panel padding="lg">
        <CheckCircle2 size={32} className="text-success" aria-hidden />
        <h2 className="mt-4 text-3xl">Cảm ơn bạn đã chia sẻ</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
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
          className={buttonClasses({ className: 'mt-6' })}
        >
          Về hồ sơ nghề
        </Link>
      </Panel>
    );
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Callout>
        Chọn từ 1 đến 5 cho mỗi tiêu chí. Số tổng hợp chỉ được công bố khi có đủ
        người đánh giá.
      </Callout>
      <fieldset disabled={rate.isPending} className="min-w-0 space-y-5">
        <legend className="sr-only">Các tiêu chí đánh giá nghề</legend>
        {data.criteria.map((criterion, i) => (
          <Panel key={criterion.code}>
            <StarSelector
              criterion={criterion}
              index={i + 1}
              value={scores[criterion.code]}
              onChange={(value) =>
                setScores((s) => ({ ...s, [criterion.code]: value }))
              }
              invalid={touched && !scores[criterion.code]}
            />
          </Panel>
        ))}
        <Field
          label="Điều bạn muốn chia sẻ thêm"
          optional
          counter={`${comment.length}/2000`}
          hint="Kể về công việc bạn đã thử; tránh ghi thông tin cá nhân."
        >
          <Textarea
            maxLength={2000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ca làm nào khiến bạn nhớ nhất?"
            rows={5}
          />
        </Field>
      </fieldset>
      {touched && !complete && (
        <p role="alert" className="text-sm text-danger">
          Bạn chọn đủ các tiêu chí trước khi gửi nhé.
        </p>
      )}
      {rate.isError && (
        <div role="alert">
          <Callout tone="danger">{errorText(rate.error)}</Callout>
        </div>
      )}
      <Button
        type="submit"
        block
        size="lg"
        loading={rate.isPending}
        loadingText="Đang gửi…"
      >
        {data.mine ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
      </Button>
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
            className="relative flex min-h-14 min-w-11 cursor-pointer flex-col items-center justify-center rounded-md px-1 has-focus-visible:shadow-focus"
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
            <Sparkle
              size={26}
              className={cn(
                'transition-colors',
                score <= (value ?? 0) ? 'text-gold-300' : 'text-night-400',
              )}
            />
            <span
              aria-hidden
              className={cn(
                'mt-1 text-xs',
                value === score
                  ? 'font-bold text-gold-200 underline underline-offset-4'
                  : 'text-ink-faint',
              )}
            >
              {score}
            </span>
          </label>
        ))}
      </div>
      <div
        id={`${id}-anchors`}
        className="mt-3 flex justify-between gap-4 text-xs leading-relaxed text-ink-faint"
      >
        <span>1 · {criterion.low}</span>
        <span className="text-right">5 · {criterion.high}</span>
      </div>
      {invalid && (
        <p id={`${id}-error`} className="mt-2 text-xs text-danger">
          Chọn một mức từ 1 đến 5.
        </p>
      )}
    </fieldset>
  );
}
