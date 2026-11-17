import {
  Stat,
  Badge,
  EmptyState,
  LoadingBlock as Loading,
  PageHeader,
} from '@datn/ui';
import { byDeadline } from '../../lib/deadlines';

import { Link } from 'react-router-dom';
import { staffApi } from '../../api/endpoints';
import { Card, ProblemAlert } from '../../components/ui';
import { StatusBadge } from '../../features/shared/StatusBadge';
import { useLoad } from '../../hooks/useLoad';
import { formatDateTime } from '../../lib/labels';

/** D01 Domain Expert portal (`listMyOccupations`, `listScenarios`, `listMyReviewQueue`). */
export function DePortalPage() {
  const occupations = useLoad(() => staffApi.listMyOccupations(), []);
  const scenarios = useLoad(
    () => staffApi.listScenarios({ mine: true, limit: 100 }),
    [],
  );
  const queue = useLoad(() => staffApi.listMyReviewQueue(), []);
  const mine = (occupations.data ?? []).filter(
    (o) => o.myRole === 'DOMAIN_EXPERT',
  );
  const authored = byDeadline(
    scenarios.data?.items ?? [],
    (s) => s.reviewDeadline,
  );
  const reviewQueue = byDeadline(queue.data ?? [], (q) => q.deadlineAt);

  return (
    <>
      <PageHeader
        eyebrow="D01 · Chuyên gia nghề"
        title="Việc của tôi"
        description={
          mine.length
            ? `Nghề được giao: ${mine.map((o) => o.name).join(', ')}`
            : undefined
        }
      />
      <ProblemAlert
        error={occupations.error ?? scenarios.error ?? queue.error}
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Nghề được giao"
          value={occupations.loading || occupations.error ? '—' : mine.length}
        />
        <Stat
          label="Scenario đang soạn"
          value={
            scenarios.loading || scenarios.error
              ? '—'
              : authored.filter((s) => s.status === 'DRAFT').length
          }
        />
        <Stat
          label="Chờ tôi duyệt"
          value={queue.loading || queue.error ? '—' : reviewQueue.length}
          hint="Sắp theo hạn gần nhất"
        />
      </div>
      <div className="mb-5 flex flex-wrap gap-3 text-sm">
        <Link
          to="#review-queue"
          className="rounded-md border border-line px-3 py-2 hover:bg-night-800"
        >
          Đến hàng duyệt ↓
        </Link>
        <Link
          to="#authored"
          className="rounded-md border border-line px-3 py-2 hover:bg-night-800"
        >
          Đến scenario tôi viết ↓
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div id="review-queue" className="scroll-mt-20">
          <Card title="Chờ tôi duyệt">
            {queue.loading ? (
              <Loading />
            ) : queue.error ? null : (queue.data ?? []).length === 0 ? (
              <EmptyState title={<>Không có scenario nào chờ bạn duyệt.</>} />
            ) : (
              <ul className="divide-y divide-line">
                {reviewQueue.map((q) => {
                  const late =
                    q.deadlineAt && new Date(q.deadlineAt) < new Date();
                  return (
                    <li
                      key={q.scenarioId}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div>
                        <Link
                          to={`/de/scenarios/${q.scenarioId}/review`}
                          className="font-semibold text-ink hover:underline"
                        >
                          {q.title}
                        </Link>
                        <p
                          className={
                            late
                              ? 'text-[12px] text-danger'
                              : 'text-[12px] text-ink-faint'
                          }
                        >
                          Hạn: {formatDateTime(q.deadlineAt)}
                          {late && ' · quá hạn'}
                        </p>
                      </div>
                      <Badge tone="warning">Chờ duyệt</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
        <div id="authored" className="scroll-mt-20">
          <Card title="Scenario tôi viết">
            {scenarios.loading ? (
              <Loading />
            ) : scenarios.error ? null : authored.length === 0 ? (
              <EmptyState
                title={<>Chưa có scenario nào giao cho bạn viết.</>}
              />
            ) : (
              <ul className="divide-y divide-line">
                {authored.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div>
                      <Link
                        to={`/de/scenarios/${s.id}/author`}
                        className="font-semibold text-ink hover:underline"
                      >
                        {s.taskTitle}
                      </Link>
                      <p className="text-[12px] text-ink-faint">
                        L{s.levelNo} · cập nhật {formatDateTime(s.updatedAt)}
                        {s.reviewDeadline && (
                          <> · hạn {formatDateTime(s.reviewDeadline)}</>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
