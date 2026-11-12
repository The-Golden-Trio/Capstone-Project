import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isProblem } from '../../api/client';
import { staffApi } from '../../api/endpoints';
import type { ScenarioDetail, ScenarioListItem } from '../../api/types';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Loading,
  PageHeader,
  ProblemAlert,
  SelectField,
  Tabs,
  TextField,
} from '../../components/ui';
import { HistoryTimeline } from '../../features/shared/HistoryTimeline';
import { StatusBadge } from '../../features/shared/StatusBadge';
import { useLoad } from '../../hooks/useLoad';
import { formatDateTime } from '../../lib/labels';

/** `datetime-local` cần giờ địa phương không có múi giờ. */
const toLocalInput = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

/**
 * C05 Scenario slots (AD-04, SD-05, FR-33, FR-34): cây cấp → task → scenario;
 * mở scenario, giao tác giả và người duyệt, xem lịch sử; lượt duyệt quá hạn
 * và giao lại (AD-02f).
 */
export function ScenarioSlotsPage() {
  const { occupationId = '' } = useParams();
  const [tab, setTab] = useState<'slots' | 'overdue'>('slots');
  const profile = useLoad(
    () => staffApi.getOccupationProfileForEdit(occupationId),
    [occupationId],
  );
  const scenarios = useLoad(
    () => staffApi.listScenarios({ occupationId, limit: 100 }),
    [occupationId],
  );
  const overdue = useLoad(
    () => staffApi.listReviewAssignments({ occupationId, overdue: true }),
    [occupationId],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [openError, setOpenError] = useState<unknown>();
  const [opening, setOpening] = useState<string | null>(null);

  /** Scenario chưa gỡ của từng task (khớp theo cấp + tên task). */
  const activeByTask = useMemo(() => {
    const map = new Map<string, ScenarioListItem>();
    for (const s of scenarios.data?.items ?? [])
      if (s.status !== 'RETIRED') map.set(`${s.levelNo}|${s.taskTitle}`, s);
    return map;
  }, [scenarios.data]);

  const open = async (taskId: string) => {
    setOpening(taskId);
    setOpenError(undefined);
    try {
      const detail = await staffApi.openScenario(taskId);
      await scenarios.reload();
      setSelected(detail.id);
    } catch (e) {
      setOpenError(
        isProblem(e, 'ACTIVE_SCENARIO_EXISTS')
          ? new Error(
              'Task này đã có scenario đang hoạt động (FR-33). Tải lại để thấy.',
            )
          : e,
      );
    } finally {
      setOpening(null);
    }
  };

  const titleOf = (scenarioId: string) =>
    scenarios.data?.items.find((s) => s.id === scenarioId)?.taskTitle ??
    scenarioId;

  return (
    <>
      <PageHeader
        title="Ô scenario"
        subtitle="Mỗi task của một cấp có tối đa một scenario đang hoạt động."
        actions={
          <Link
            to={`/ca/occupations/${occupationId}/review-criteria`}
            className="rounded-md border border-line px-3 py-1.5 hover:bg-inset"
          >
            Tiêu chí duyệt
          </Link>
        }
      />
      <Tabs
        label="Chế độ xem"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'slots', label: 'Theo cấp và task' },
          {
            id: 'overdue',
            label: `Duyệt quá hạn${overdue.data?.length ? ` (${overdue.data.length})` : ''}`,
          },
        ]}
      />
      <ProblemAlert error={profile.error ?? scenarios.error ?? openError} />
      {tab === 'slots' ? (
        profile.loading || scenarios.loading ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {(profile.data?.levels ?? []).map((level) => (
              <Card
                key={level.levelNo}
                title={`L${level.levelNo} · ${level.title}`}
              >
                {level.tasks.length === 0 ? (
                  <EmptyState>Cấp này chưa có task.</EmptyState>
                ) : (
                  <table className="w-full text-left">
                    <thead className="text-[12px] text-muted">
                      <tr>
                        <th className="py-1 font-medium">Task</th>
                        <th className="py-1 font-medium">Trạng thái</th>
                        <th className="py-1 font-medium">
                          Tác giả · Người duyệt
                        </th>
                        <th className="py-1" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-2">
                      {level.tasks.map((t) => {
                        const s = activeByTask.get(
                          `${level.levelNo}|${t.text}`,
                        );
                        return (
                          <tr key={t.taskId}>
                            <td className="py-2 pr-3">{t.text}</td>
                            <td className="py-2 pr-3">
                              {s ? (
                                <StatusBadge status={s.status} />
                              ) : (
                                <Badge>Chưa mở</Badge>
                              )}
                            </td>
                            <td className="py-2 pr-3 text-[13px] text-ink-2">
                              {s
                                ? `${s.authorName ?? '—'} · ${s.reviewerName ?? '—'}`
                                : ''}
                            </td>
                            <td className="py-2 text-right">
                              {s ? (
                                <Button
                                  size="sm"
                                  onClick={() => setSelected(s.id)}
                                >
                                  Chi tiết
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  busy={opening === t.taskId}
                                  onClick={() => open(t.taskId)}
                                >
                                  Mở scenario
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card title="Lượt duyệt quá hạn">
          <ProblemAlert error={overdue.error} />
          {overdue.loading ? (
            <Loading />
          ) : (overdue.data ?? []).length === 0 ? (
            <EmptyState>Không có lượt duyệt nào quá hạn.</EmptyState>
          ) : (
            <ul className="divide-y divide-line-2">
              {(overdue.data ?? []).map((a) => (
                <li
                  key={a.assignmentId}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div>
                    <p className="font-medium">{titleOf(a.scenarioId)}</p>
                    <p className="text-[12px] text-bad">
                      Hạn: {formatDateTime(a.deadlineAt)}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setSelected(a.scenarioId)}>
                    Giao lại
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
      {selected && (
        <ScenarioDrawer
          scenarioId={selected}
          onClose={() => setSelected(null)}
          onChanged={() => {
            void scenarios.reload();
            void overdue.reload();
          }}
        />
      )}
    </>
  );
}

function ScenarioDrawer({
  scenarioId,
  onClose,
  onChanged,
}: {
  scenarioId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const detail = useLoad(() => staffApi.getScenario(scenarioId), [scenarioId]);
  const [tick, setTick] = useState(0);
  const d = detail.data;
  const refresh = async () => {
    await detail.reload();
    setTick((t) => t + 1);
    onChanged();
  };
  return (
    <Dialog
      open
      onClose={onClose}
      title={d ? d.taskTitle : 'Scenario'}
      footer={<Button onClick={onClose}>Đóng</Button>}
    >
      {detail.loading && !d ? (
        <Loading />
      ) : d ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={d.status} />
            <span className="text-[13px] text-muted">
              L{d.levelNo} · cập nhật {formatDateTime(d.updatedAt)}
            </span>
          </div>
          {(d.status === 'APPROVED' || d.status === 'IN_PLAYTEST') && (
            <Link
              to={`/ca/scenarios/${d.id}/gamify`}
              className="inline-block rounded-md bg-brand px-3 py-1.5 text-white hover:bg-brand-2"
            >
              Thiết kế trình bày
            </Link>
          )}
          {d.status === 'DRAFT' ? (
            <AssignmentForm detail={d} onSaved={refresh} />
          ) : d.assignment?.status === 'ACTIVE' &&
            (d.status === 'SUBMITTED' || d.status === 'IN_REVIEW') ? (
            <ReassignForm detail={d} onSaved={refresh} />
          ) : (
            <p className="text-[13px] text-ink-2">
              Tác giả: {d.authorName ?? '—'} · Người duyệt:{' '}
              {d.reviewerName ?? '—'}
            </p>
          )}
          <section>
            <h3 className="mb-2 font-semibold">Lịch sử</h3>
            <HistoryTimeline scenarioId={d.id} refreshKey={tick} />
          </section>
        </div>
      ) : (
        <ProblemAlert error={detail.error} />
      )}
    </Dialog>
  );
}

function AssignmentForm({
  detail,
  onSaved,
}: {
  detail: ScenarioDetail;
  onSaved: () => Promise<void>;
}) {
  const defaultDeadline = toLocalInput(new Date(Date.now() + 7 * 86400_000));
  const [authorId, setAuthorId] = useState(detail.assignment?.authorId ?? '');
  const [reviewerId, setReviewerId] = useState(
    detail.assignment?.reviewerId ?? '',
  );
  const [deadline, setDeadline] = useState(
    detail.assignment
      ? toLocalInput(new Date(detail.assignment.deadlineAt))
      : defaultDeadline,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);
  const options = detail.eligibleExperts.map((e) => ({
    value: e.userId,
    label: e.displayName,
  }));

  const save = async () => {
    setBusy(true);
    setError(undefined);
    setSaved(false);
    try {
      await staffApi.assignScenarioStaff(detail.id, {
        authorId,
        reviewerId,
        deadlineAt: new Date(deadline).toISOString(),
      });
      setSaved(true);
      await onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h3 className="mb-2 font-semibold">Giao việc</h3>
      <ProblemAlert error={error} />
      {saved && (
        <p role="status" className="mb-2 text-[13px] text-good">
          Đã giao và gửi thông báo.
        </p>
      )}
      <SelectField
        label="Tác giả (Domain Expert)"
        value={authorId}
        onChange={(e) => setAuthorId(e.target.value)}
        options={options}
        placeholder="— Chọn —"
      />
      <SelectField
        label="Người duyệt"
        hint="Không được trùng tác giả (FR-25)."
        value={reviewerId}
        onChange={(e) => setReviewerId(e.target.value)}
        options={options.filter((o) => o.value !== authorId)}
        placeholder="— Chọn —"
      />
      <TextField
        label="Hạn duyệt"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <Button
        variant="primary"
        busy={busy}
        disabled={!authorId || !reviewerId}
        onClick={save}
      >
        Lưu giao việc
      </Button>
    </section>
  );
}

function ReassignForm({
  detail,
  onSaved,
}: {
  detail: ScenarioDetail;
  onSaved: () => Promise<void>;
}) {
  const a = detail.assignment;
  const [reviewerId, setReviewerId] = useState('');
  const [deadline, setDeadline] = useState(
    toLocalInput(new Date(Date.now() + 3 * 86400_000)),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  if (!a) return null;
  const options = detail.eligibleExperts
    .filter((e) => e.userId !== a.authorId && e.userId !== a.reviewerId)
    .map((e) => ({ value: e.userId, label: e.displayName }));

  const save = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await staffApi.reassignReview(a.assignmentId, {
        reviewerId,
        deadlineAt: new Date(deadline).toISOString(),
      });
      await onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h3 className="mb-1 font-semibold">Người duyệt</h3>
      <p className="mb-2 text-[13px]">
        {detail.reviewerName} · hạn {formatDateTime(a.deadlineAt)}
        {a.overdue && <span className="font-medium text-bad"> · quá hạn</span>}
      </p>
      <ProblemAlert error={error} />
      <SelectField
        label="Giao lại cho"
        value={reviewerId}
        onChange={(e) => setReviewerId(e.target.value)}
        options={options}
        placeholder="— Chọn —"
      />
      <TextField
        label="Hạn mới"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <Button
        variant="primary"
        busy={busy}
        disabled={!reviewerId}
        onClick={save}
      >
        Giao lại
      </Button>
    </section>
  );
}
