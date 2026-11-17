import { EmptyState, Timeline, LoadingBlock as Loading } from '@datn/ui';
import { staffApi } from '../../api/endpoints';
import type { LifecycleAction } from '../../api/types';
import { ProblemAlert } from '../../components/ui';
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
  if (!history.data?.length)
    return <EmptyState title="Chưa có lịch sử thay đổi." />;
  return (
    <Timeline
      items={history.data.map((h) => ({
        title: `${ACTION_LABEL[h.action as LifecycleAction] ?? h.action} → ${STATUS_LABEL[h.toStatus]}`,
        time: `${h.actor} · ${formatDateTime(h.at)}`,
        body: h.note,
        tone: 'info',
      }))}
    />
  );
}
