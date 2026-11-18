import {
  TabPanel,
  Badge,
  Button,
  Sheet,
  EmptyState,
  LoadingBlock as Loading,
  PageHeader,
  Tabs,
} from '@datn/ui';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isProblem } from '../../api/client';
import { staffApi } from '../../api/endpoints';
import type { ScenarioDetail, ScenarioListItem } from '../../api/types';
import {
  Card,
  LinkButton,
  ProblemAlert,
  SelectField,
  TextField,
} from '../../components/ui';
import { HistoryTimeline } from '../../features/shared/HistoryTimeline';
import { StatusBadge } from '../../features/shared/StatusBadge';
import { useLoad } from '../../hooks/useLoad';
import {
  ARCHETYPE_LABEL,
  COMPANY_LABEL,
  formatDateTime,
} from '../../lib/labels';
import { SourceTag } from '../../features/shared/Guidance';

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

  const overdueIds = new Set((overdue.data ?? []).map((a) => a.scenarioId));

  const titleOf = (scenarioId: string) =>
    scenarios.data?.items.find((s) => s.id === scenarioId)?.taskTitle ??
    scenarioId;

  return (
    <>
      <PageHeader
        title="Ô scenario"
        description="Mỗi task của một cấp có tối đa một scenario đang hoạt động."
        actions={
          <LinkButton
            to={`/ca/occupations/${occupationId}/review-criteria`}
            variant="subtle"
            size="sm"
          >
            Tiêu chí duyệt
          </LinkButton>
        }
      />
      <Tabs
        idBase="slots"
        label="Chế độ xem"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'slots', label: 'Theo cấp và task' },
          {
            key: 'overdue',
            label: `Duyệt quá hạn${overdue.data?.length ? ` (${overdue.data.length})` : ''}`,
          },
        ]}
      />
      <TabPanel active idBase="slots" tabKey={tab}>
        <ProblemAlert error={profile.error ?? scenarios.error ?? openError} />
        {tab === 'slots' ? (
          profile.loading || scenarios.loading ? (
            <Loading />
          ) : profile.error || scenarios.error ? null : (
            <div className="space-y-4">
              {profile.data?.levels.length === 0 && (
                <EmptyState title="Nghề chưa có cấp và task." />
              )}
              {(profile.data?.levels ?? []).map((level) => (
                <Card
                  key={level.levelNo}
                  title={`L${level.levelNo} · ${level.title}`}
                  actions={
                    <span className="text-[12px] text-ink-faint">
                      {
                        level.tasks.filter((t) =>
                          activeByTask.has(`${level.levelNo}|${t.text}`),
                        ).length
                      }
                      /{level.tasks.length} task đã mở
                    </span>
                  }
                >
                  {level.tasks.length === 0 ? (
                    <EmptyState title={<>Cấp này chưa có task.</>} />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left">
                        <thead className="text-[12px] text-ink-faint">
                          <tr>
                            <th className="py-1 font-medium">Task</th>
                            <th className="py-1 font-medium">Trạng thái</th>
                            <th className="py-1 font-medium">
                              Tác giả · Người duyệt
                            </th>
                            <th className="py-1 font-medium">Hạn duyệt</th>
                            <th className="py-1" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
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
                                <td className="py-2 pr-3 text-[13px] text-ink-muted">
                                  {s
                                    ? `${s.authorName ?? '—'} · ${s.reviewerName ?? '—'}`
                                    : ''}
                                </td>
                                <td className="py-2 pr-3 text-[13px]">
                                  {s?.reviewDeadline ? (
                                    overdueIds.has(s.id) ? (
                                      <Badge tone="danger">
                                        Quá hạn ·{' '}
                                        {formatDateTime(s.reviewDeadline)}
                                      </Badge>
                                    ) : (
                                      <span className="text-ink-muted">
                                        {formatDateTime(s.reviewDeadline)}
                                      </span>
                                    )
                                  ) : (
                                    ''
                                  )}
                                </td>
                                <td className="py-2 text-right">
                                  {s ? (
                                    <Button
                                      variant="subtle"
                                      size="sm"
                                      onClick={() => setSelected(s.id)}
                                    >
                                      Chi tiết
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      loading={opening === t.taskId}
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
                    </div>
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
            ) : overdue.error ? null : (overdue.data ?? []).length === 0 ? (
              <EmptyState title={<>Không có lượt duyệt nào quá hạn.</>} />
            ) : (
              <ul className="divide-y divide-line">
                {(overdue.data ?? []).map((a) => (
                  <li
                    key={a.assignmentId}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{titleOf(a.scenarioId)}</p>
                      <p className="text-[12px] text-danger">
                        Hạn: {formatDateTime(a.deadlineAt)}
                      </p>
                    </div>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => setSelected(a.scenarioId)}
                    >
                      Giao lại
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </TabPanel>
      {selected && (
        <ScenarioDrawer
          scenarioId={selected}
          siblings={(scenarios.data?.items ?? []).filter((x) => {
            const me = scenarios.data?.items.find((y) => y.id === selected);
            return (
              me &&
              x.id !== me.id &&
              x.levelNo === me.levelNo &&
              x.status !== 'RETIRED'
            );
          })}
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
  siblings,
  onClose,
  onChanged,
}: {
  scenarioId: string;
  /** Scenario khác cùng cấp, để nhắc luật kiểm trùng (Seed §1). */
  siblings: ScenarioListItem[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const detail = useLoad(() => staffApi.getScenario(scenarioId), [scenarioId]);
  const siblingKey = siblings.map((x) => x.id).join(',');
  const others = useLoad(
    () => Promise.all(siblings.map((x) => staffApi.getScenario(x.id))),
    [siblingKey],
  );
  const [tick, setTick] = useState(0);
  const d = detail.data;
  const refresh = async () => {
    await detail.reload();
    setTick((t) => t + 1);
    onChanged();
  };
  return (
    <Sheet
      open
      onClose={onClose}
      title={d ? d.taskTitle : 'Scenario'}
      footer={
        <Button variant="subtle" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {detail.loading && !d ? (
        <Loading />
      ) : d ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={d.status} />
            <span className="text-[13px] text-ink-faint">
              L{d.levelNo} · cập nhật {formatDateTime(d.updatedAt)}
            </span>
          </div>
          <SituationSummary detail={d} others={others.data ?? []} />
          {(d.status === 'APPROVED' || d.status === 'IN_PLAYTEST') && (
            <LinkButton
              to={`/ca/scenarios/${d.id}/gamify`}
              variant="primary"
              size="sm"
            >
              Thiết kế trình bày
            </LinkButton>
          )}
          {d.status === 'DRAFT' ? (
            <AssignmentForm detail={d} onSaved={refresh} />
          ) : d.assignment?.status === 'ACTIVE' &&
            (d.status === 'SUBMITTED' || d.status === 'IN_REVIEW') ? (
            <ReassignForm detail={d} onSaved={refresh} />
          ) : (
            <p className="text-[13px] text-ink-muted">
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
    </Sheet>
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
        <p role="status" className="mb-2 text-[13px] text-success">
          Đã giao và gửi thông báo.
        </p>
      )}
      <SelectField
        label="Tác giả (Domain Expert)"
        value={authorId}
        onChange={(e) => {
          setAuthorId(e.target.value);
          if (e.target.value === reviewerId) setReviewerId('');
        }}
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
        loading={busy}
        disabled={
          !authorId ||
          !reviewerId ||
          authorId === reviewerId ||
          !deadline ||
          !Number.isFinite(new Date(deadline).getTime())
        }
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
  const [saved, setSaved] = useState(false);
  if (!a) return null;
  const options = detail.eligibleExperts
    .filter((e) => e.userId !== a.authorId && e.userId !== a.reviewerId)
    .map((e) => ({ value: e.userId, label: e.displayName }));

  const save = async () => {
    setBusy(true);
    setError(undefined);
    setSaved(false);
    try {
      await staffApi.reassignReview(a.assignmentId, {
        reviewerId,
        deadlineAt: new Date(deadline).toISOString(),
      });
      await onSaved();
      setReviewerId('');
      setSaved(true);
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
        {a.overdue && (
          <span className="font-medium text-danger"> · quá hạn</span>
        )}
      </p>
      <ProblemAlert error={error} />
      {saved && (
        <p role="status" className="mb-2 text-sm text-success">
          Đã giao lại người duyệt.
        </p>
      )}
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
        loading={busy}
        disabled={
          !reviewerId ||
          !deadline ||
          !Number.isFinite(new Date(deadline).getTime())
        }
        onClick={save}
      >
        Giao lại
      </Button>
    </section>
  );
}

/**
 * Loại tình huống, công ty của scenario và nhắc luật kiểm trùng cùng cấp
 * (Seed §1): không có hai màn trùng cả việc chính lẫn loại tình huống. Mỗi ô
 * là một task riêng nên chỉ cảnh báo khi trùng loại tình huống, để CA xem lại
 * hai việc có thật sự khác nhau không.
 */
function SituationSummary({
  detail: d,
  others,
}: {
  detail: ScenarioDetail;
  others: ScenarioDetail[];
}) {
  if (!d.archetype)
    return (
      <p className="text-[13px] text-ink-faint">
        Tác giả chưa chọn loại tình huống.
      </p>
    );
  const same = others.filter((o) => o.archetype === d.archetype);
  return (
    <div className="rounded-xl border border-line bg-night-900/25 px-3 py-2 text-[13px]">
      <p>
        <span className="text-ink-faint">Loại tình huống:</span>{' '}
        {ARCHETYPE_LABEL[d.archetype] ?? d.archetype}
        {d.companyType && (
          <>
            {' '}
            · <span className="text-ink-faint">công ty:</span>{' '}
            {COMPANY_LABEL[d.companyType] ?? d.companyType}
          </>
        )}
      </p>
      {same.length > 0 && (
        <p className="mt-1 text-warning">
          Cùng loại tình huống với{' '}
          {same.map((o) => `“${o.taskTitle}”`).join(', ')} ở cấp này. Kiểm hai
          màn khác nhau về việc chính và cặp kỹ năng trọng tâm.
          <SourceTag>Seed §1</SourceTag>
        </p>
      )}
    </div>
  );
}
