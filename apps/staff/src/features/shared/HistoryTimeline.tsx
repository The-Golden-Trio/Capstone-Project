import { staffApi } from '../../api/endpoints';
import type { LifecycleAction } from '../../api/types';
import { Loading, ProblemAlert } from '../../components/ui';
import { useLoad } from '../../hooks/useLoad';
import { ACTION_LABEL, formatDateTime, STATUS_LABEL } from '../../lib/labels';

/** Lịch sử vòng đời (`getScenarioHistory`, `lifecycle_log`). */
export function HistoryTimeline({
  scenarioId,
  refreshKey,
}: {
  scenarioId: string;
  refreshKey?: unknown;
}) {
  const history = useLoad(
    () => staffApi.getScenarioHistory(scenarioId),
    [scenarioId, refreshKey],
  );
  if (history.loading && !history.data) return <Loading />;
  if (history.error) return <ProblemAlert error={history.error} />;
  return (
    <ol className="space-y-2">
      {(history.data ?? []).map((h, i) => (
        <li key={i} className="border-l-2 border-brand/50 pl-3">
          <p className="font-medium">
            {ACTION_LABEL[h.action as LifecycleAction] ?? h.action}
            <span className="font-normal text-muted">
              {' '}
              → {STATUS_LABEL[h.toStatus]}
            </span>
          </p>
          <p className="text-[12px] text-muted">
            {h.actor} · {formatDateTime(h.at)}
          </p>
          {h.note && (
            <p className="mt-0.5 text-[13px] text-ink-2">“{h.note}”</p>
          )}
        </li>
      ))}
    </ol>
  );
}
