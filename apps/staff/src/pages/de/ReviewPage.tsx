import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isProblem } from '../../api/client';
import { staffApi } from '../../api/endpoints';
import type { ReviewDecisionInput } from '../../api/types';
import {
  Button,
  Card,
  Dialog,
  Loading,
  Notice,
  PageHeader,
  ProblemAlert,
  TextArea,
  inputClass,
} from '../../components/ui';
import { cx } from '../../lib/cx';
import { ContentReadOnly } from '../../features/shared/ContentReadOnly';
import { StatusBadge } from '../../features/shared/StatusBadge';
import { useSkillNames } from '../../features/shared/useSkillNames';
import { useLoad } from '../../hooks/useLoad';
import { formatDateTime } from '../../lib/labels';

type Verdict = 'MET' | 'NOT_MET';
const DECISIONS: Record<
  ReviewDecisionInput['decision'],
  {
    label: string;
    confirm: string;
    variant: 'primary' | 'secondary' | 'danger';
  }
> = {
  APPROVE: {
    label: 'Duyệt',
    confirm: 'Duyệt scenario này? Sau đó CA sẽ thiết kế trình bày.',
    variant: 'primary',
  },
  REQUEST_CHANGES: {
    label: 'Yêu cầu sửa',
    confirm: 'Gửi scenario về cho tác giả sửa?',
    variant: 'secondary',
  },
  REJECT: {
    label: 'Từ chối',
    confirm: 'Từ chối scenario? Scenario bị gỡ và KHÔNG mở lại được (FR-25).',
    variant: 'danger',
  },
};

/**
 * D04 Review scenario (UC-D02, SD-06, FR-25, FR-32): nội dung chỉ đọc, trả
 * lời từng tiêu chí, rồi duyệt / yêu cầu sửa / từ chối. Lần mở đầu chuyển
 * scenario sang In review.
 */
export function ReviewPage() {
  const { scenarioId = '' } = useParams();
  const view = useLoad(
    () => staffApi.openScenarioForReview(scenarioId),
    [scenarioId],
  );
  const skillName = useSkillNames(scenarioId, true);
  const [answers, setAnswers] = useState<
    Record<string, { verdict?: Verdict; comment: string }>
  >({});
  const [comment, setComment] = useState('');
  const [confirming, setConfirming] = useState<
    ReviewDecisionInput['decision'] | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [done, setDone] = useState<string | null>(null);

  if (view.loading && !view.data) return <Loading />;
  if (!view.data) {
    const e = view.error;
    return (
      <>
        <PageHeader title="Duyệt scenario" />
        <ProblemAlert
          error={
            isProblem(e, 'REVIEWER_IS_AUTHOR')
              ? new Error(
                  'Bạn là tác giả nên không duyệt được scenario này (FR-25).',
                )
              : isProblem(e, 'CRITERIA_MISSING')
                ? new Error(
                    'Nghề này chưa có tiêu chí duyệt. Nhờ Content Admin tạo trước (FR-32).',
                  )
                : e
          }
        />
        <Link to="/de" className="text-brand hover:underline">
          ← Về việc của tôi
        </Link>
      </>
    );
  }
  const { scenario: s, criteria, previousReviews } = view.data;
  const missing = criteria.criteria.filter(
    (c) => !answers[c.criterionId]?.verdict,
  );
  const canDecide = s.status === 'IN_REVIEW' && !done;

  const decide = async (decision: ReviewDecisionInput['decision']) => {
    setBusy(true);
    setError(undefined);
    try {
      const next = await staffApi.decideReview(scenarioId, {
        decision,
        comment: comment.trim() || undefined,
        answers: criteria.criteria.map((c) => ({
          criterionId: c.criterionId,
          verdict: answers[c.criterionId]?.verdict as Verdict,
          comment: answers[c.criterionId]?.comment.trim() || undefined,
        })),
      });
      setDone(
        `${DECISIONS[decision].label} xong. Tác giả và Content Admin đã được báo.`,
      );
      if (view.data) view.setData({ ...view.data, scenario: next });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  return (
    <>
      <PageHeader
        title={`Duyệt: ${s.taskTitle}`}
        subtitle={
          <span className="flex items-center gap-2">
            <StatusBadge status={s.status} /> L{s.levelNo} · tác giả{' '}
            {s.authorName ?? '—'}
            {s.assignment && (
              <> · hạn {formatDateTime(s.assignment.deadlineAt)}</>
            )}
          </span>
        }
      />
      {done && <Notice tone="good">{done}</Notice>}
      <ProblemAlert error={error} />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div>
          {s.content ? (
            <ContentReadOnly content={s.content} skillName={skillName} />
          ) : (
            <Notice>Scenario chưa có nội dung.</Notice>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:self-start lg:overflow-y-auto">
          {previousReviews.length > 0 && (
            <Card title="Các lần duyệt trước">
              <ul className="space-y-2 text-[13px]">
                {previousReviews.map((r, i) => (
                  <li key={i}>
                    <span className="font-medium">{r.decision}</span> ·{' '}
                    {formatDateTime(r.decidedAt)}
                    {r.comment && <p className="text-ink-2">“{r.comment}”</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title={`Tiêu chí duyệt (v${criteria.versionNo})`}>
            <ol className="space-y-3">
              {criteria.criteria.map((c, i) => {
                const a = answers[c.criterionId] ?? { comment: '' };
                const set = (patch: Partial<typeof a>) =>
                  setAnswers((all) => ({
                    ...all,
                    [c.criterionId]: { ...a, ...patch },
                  }));
                return (
                  <li key={c.criterionId}>
                    <fieldset disabled={!canDecide}>
                      <legend className="mb-1 font-medium">
                        {i + 1}. {c.text}
                      </legend>
                      <div className="mb-1 flex gap-4">
                        {(['MET', 'NOT_MET'] as const).map((v) => (
                          <label
                            key={v}
                            className="flex items-center gap-1.5 text-[13px]"
                          >
                            <input
                              type="radio"
                              name={c.criterionId}
                              checked={a.verdict === v}
                              onChange={() => set({ verdict: v })}
                              className="accent-brand"
                            />
                            {v === 'MET' ? 'Đạt' : 'Chưa đạt'}
                          </label>
                        ))}
                      </div>
                      <input
                        aria-label={`Nhận xét tiêu chí ${i + 1}`}
                        placeholder="Nhận xét (tuỳ chọn)"
                        className={cx(inputClass, 'text-[13px]')}
                        value={a.comment}
                        onChange={(e) => set({ comment: e.target.value })}
                      />
                    </fieldset>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4">
              <TextArea
                label="Nhận xét chung"
                hint="Khi yêu cầu sửa, ghi rõ tác giả cần sửa gì."
                value={comment}
                disabled={!canDecide}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            {canDecide && missing.length > 0 && (
              <p className="mb-2 text-[13px] text-warn">
                Còn {missing.length} tiêu chí chưa trả lời — chưa ra quyết định
                được.
              </p>
            )}
            {canDecide && (
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(DECISIONS) as Array<
                    ReviewDecisionInput['decision']
                  >
                ).map((k) => (
                  <Button
                    key={k}
                    variant={DECISIONS[k].variant}
                    disabled={missing.length > 0}
                    onClick={() => setConfirming(k)}
                  >
                    {DECISIONS[k].label}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
      <Dialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title="Xác nhận quyết định"
        footer={
          confirming && (
            <>
              <Button onClick={() => setConfirming(null)}>Huỷ</Button>
              <Button
                variant={DECISIONS[confirming].variant}
                busy={busy}
                onClick={() => decide(confirming)}
              >
                {DECISIONS[confirming].label}
              </Button>
            </>
          )
        }
      >
        <p>{confirming && DECISIONS[confirming].confirm}</p>
      </Dialog>
    </>
  );
}
