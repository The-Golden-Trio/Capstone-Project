import { Link } from 'react-router-dom';
import { staffApi } from '../../api/endpoints';
import {
  Card,
  EmptyState,
  Loading,
  PageHeader,
  ProblemAlert,
} from '../../components/ui';
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
  const authored = scenarios.data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Việc của tôi"
        subtitle={
          mine.length
            ? `Nghề được giao: ${mine.map((o) => o.name).join(', ')}`
            : undefined
        }
      />
      <ProblemAlert
        error={occupations.error ?? scenarios.error ?? queue.error}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Chờ tôi duyệt">
          {queue.loading ? (
            <Loading />
          ) : (queue.data ?? []).length === 0 ? (
            <EmptyState>Không có scenario nào chờ bạn duyệt.</EmptyState>
          ) : (
            <ul className="divide-y divide-line-2">
              {(queue.data ?? []).map((q) => {
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
                        className="font-medium text-brand hover:underline"
                      >
                        {q.title}
                      </Link>
                      <p
                        className={
                          late
                            ? 'text-[12px] text-bad'
                            : 'text-[12px] text-muted'
                        }
                      >
                        Hạn: {formatDateTime(q.deadlineAt)}
                        {late && ' · quá hạn'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title="Scenario tôi viết">
          {scenarios.loading ? (
            <Loading />
          ) : authored.length === 0 ? (
            <EmptyState>Chưa có scenario nào giao cho bạn viết.</EmptyState>
          ) : (
            <ul className="divide-y divide-line-2">
              {authored.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div>
                    <Link
                      to={`/de/scenarios/${s.id}/author`}
                      className="font-medium text-brand hover:underline"
                    >
                      {s.taskTitle}
                    </Link>
                    <p className="text-[12px] text-muted">
                      L{s.levelNo} · cập nhật {formatDateTime(s.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
