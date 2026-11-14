import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { shortRoleName } from '@datn/game-core';
import { ApiError } from '../../api/client';
import { feedbackApi } from '../../api/endpoints';
import type { RatingForm, RatingSummary } from '../../api/schemas';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Note, SourceNote } from '../../components/ui/Note';
import { cx } from '../../lib/cx';
import { useGameIndex } from '../../store/contentStore';

const SCALE = [1, 2, 3, 4, 5] as const;

/**
 * E13 "Rate occupation" (FR-19, AD-01e): đánh giá nghề theo năm tiêu chí của
 * D-27 sau khi xong mọi cấp. Chỉ công bố số tổng hợp, dưới ngưỡng thì giấu.
 */
export function RateOccupationPage() {
  const { roleCode = '' } = useParams();
  const role = useGameIndex().findRole(roleCode);
  const roleName = role ? shortRoleName(role) : roleCode;

  const [form, setForm] = useState<RatingForm | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    feedbackApi
      .ratingForm(roleCode)
      .then(setForm)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError && err.status === 404
            ? 'Nghề này chưa nhận đánh giá.'
            : err instanceof Error
              ? err.message
              : 'Không tải được form đánh giá',
        ),
      );
  }, [roleCode]);

  const complete =
    !!form && form.attributes.every((a) => scores[a.code] !== undefined);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!complete) return;
    setBusy(true);
    setError(null);
    feedbackApi
      .rate(roleCode, { scores, comment: comment.trim() || undefined })
      .then(setSummary)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Không gửi được'),
      )
      .finally(() => setBusy(false));
  };

  const back = (
    <Link to={`/jobs/${roleCode}`} className="text-gold-2 underline">
      Về bản đồ nghề {roleName}
    </Link>
  );

  return (
    <>
      <PageHeader title={`Đánh giá nghề ${roleName}`}>
        Đi hết các cấp của nghề thì bạn chấm nghề từ 1 đến 5 ở năm tiêu chí. Hệ
        thống chỉ công bố điểm trung bình khi đủ số lượt đánh giá, không ai thấy
        đánh giá riêng của bạn.
      </PageHeader>

      {error && (
        <Note tone="warn" className="mb-4">
          {error} {back}
        </Note>
      )}

      {!form && !error && <SourceNote>Đang tải…</SourceNote>}

      {form && !form.eligible && !summary && (
        <Note className="mb-4">
          {form.lockedReason === 'ALREADY_RATED'
            ? 'Bạn đã đánh giá nghề này rồi. Mỗi người đánh giá một nghề một lần.'
            : 'Đánh giá nghề mở khi bạn đã hoàn thành mọi cấp của nghề. Hãy đi tiếp các chặng còn lại.'}{' '}
          {back}
        </Note>
      )}

      {summary && (
        <Card className="mb-4">
          <CardHeader title="Cảm ơn bạn đã đánh giá" />
          <CardBody>
            {summary.withheld ? (
              <p className="m-0 text-[13px] text-ink-2">
                Nghề này mới có {summary.responseCount} lượt đánh giá. Điểm
                trung bình sẽ công bố khi đủ số lượt tối thiểu, để không ai đoán
                ra đánh giá của từng người.
              </p>
            ) : (
              <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-[13px]">
                {form?.attributes.map((a) => (
                  <div key={a.code} className="contents">
                    <dt className="text-ink-2">{a.label}</dt>
                    <dd className="m-0 text-ink">
                      {summary.averages[a.code]?.toFixed(1) ?? '—'} / 5
                    </dd>
                  </div>
                ))}
                <dt className="text-muted">Số lượt đánh giá</dt>
                <dd className="m-0 text-muted">
                  {summary.responseCount}
                </dd>
              </dl>
            )}
            <p className="m-0 mt-3 text-[13px]">{back}</p>
          </CardBody>
        </Card>
      )}

      {form?.eligible && !summary && (
        <Card>
          <CardBody>
            <form onSubmit={submit}>
              {form.attributes.map((attribute) => (
                <fieldset key={attribute.code} className="mb-4 border-0 p-0">
                  <legend className="mb-1.5 font-label text-[10px] uppercase tracking-[0.16em] text-muted">
                    {attribute.label}
                  </legend>
                  <div className="flex flex-wrap gap-1.5">
                    {SCALE.map((value) => {
                      const picked = scores[attribute.code] === value;
                      return (
                        <label
                          key={value}
                          className={cx(
                            'grid h-10 w-10 cursor-pointer place-items-center rounded-lg border-[1.5px] text-[14px] transition-colors',
                            picked
                              ? 'border-gold bg-gold font-semibold text-bg'
                              : 'border-line bg-inset text-ink-2 hover:border-gold',
                          )}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            name={attribute.code}
                            value={value}
                            checked={picked}
                            onChange={() =>
                              setScores((prev) => ({
                                ...prev,
                                [attribute.code]: value,
                              }))
                            }
                          />
                          {value}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <label htmlFor="rating-comment" className="mb-4 block">
                <span className="mb-1.5 block font-label text-[10px] uppercase tracking-[0.16em] text-muted">
                  Nhận xét thêm (không bắt buộc)
                </span>
                <textarea
                  id="rating-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="field-input"
                />
              </label>

              <Button
                type="submit"
                variant="primary"
                disabled={busy || !complete}
              >
                Gửi đánh giá
              </Button>
              {!complete && (
                <SourceNote className="mt-2.5">
                  Chấm đủ năm tiêu chí để gửi.
                </SourceNote>
              )}
            </form>
          </CardBody>
        </Card>
      )}
    </>
  );
}
