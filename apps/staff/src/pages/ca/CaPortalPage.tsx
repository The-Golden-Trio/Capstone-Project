import { Badge, EmptyState, LoadingBlock, PageHeader, Stat } from '@datn/ui';
import { Link } from 'react-router-dom';

import { staffApi } from '../../api/endpoints';
import type { ScenarioListItem, ScenarioStatus } from '../../api/types';
import { Card, LinkButton, ProblemAlert } from '../../components/ui';
import { useLoad } from '../../hooks/useLoad';
import { byDeadline } from '../../lib/deadlines';
import { STATUS_LABEL, formatDateTime } from '../../lib/labels';

/** Nhóm trạng thái hiện trên thẻ nghề, theo thứ tự vòng đời (SM-01). */
const STAGES: Array<{
  label: string;
  statuses: ScenarioStatus[];
  /** Chặng CA phải ra tay. */
  mine?: boolean;
}> = [
  { label: 'Đang soạn', statuses: ['DRAFT'] },
  { label: 'Chờ / đang duyệt', statuses: ['SUBMITTED', 'IN_REVIEW'] },
  { label: 'Cần trình bày', statuses: ['APPROVED'], mine: true },
  {
    label: 'Chơi thử trở đi',
    statuses: ['IN_PLAYTEST', 'READY', 'PUBLISHED'],
  },
];

/**
 * C01 Content Admin portal (`listMyOccupations`). Thống kê từ dữ liệu đã tải; mỗi nghề có số scenario theo
 * chặng của vòng đời và số lượt duyệt quá hạn của riêng nghề đó.
 */
export function CaPortalPage() {
  const occupations = useLoad(() => staffApi.listMyOccupations(), []);
  const scenarios = useLoad(() => staffApi.listScenarios({ limit: 100 }), []);
  const overdue = useLoad(
    () => staffApi.listReviewAssignments({ overdue: true }),
    [],
  );
  const mine = (occupations.data ?? []).filter(
    (o) => o.myRole === 'CONTENT_ADMIN',
  );
  const queue = byDeadline(overdue.data ?? [], (a) => a.deadlineAt);
  const count = (value: number) =>
    occupations.loading || occupations.error ? '—' : value;
  const items = scenarios.data?.items ?? [];
  const occupationOf = new Map(items.map((s) => [s.id, s.occupationId]));
  const lateIds = new Set(
    (overdue.data ?? [])
      .filter((a) => a.status === 'ACTIVE')
      .map((a) => a.scenarioId),
  );

  return (
    <>
      <PageHeader
        eyebrow="C01 · Quản trị nội dung"
        title="Tổng quan"
        description="Theo dõi nghề được giao và ưu tiên các lượt duyệt cần xử lý."
        actions={<LinkButton to="/ca/assets">Mở thư viện asset</LinkButton>}
      />
      <ProblemAlert error={occupations.error} />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Nghề được giao"
          value={count(mine.length)}
          hint="Phạm vi bạn quản lý"
        />
        <Stat
          label="Nghề đã xuất bản"
          value={count(mine.filter((o) => o.status === 'PUBLISHED').length)}
          hint="Trạng thái danh mục nghề"
        />
        <Stat
          label="Lượt duyệt quá hạn"
          value={overdue.loading || overdue.error ? '—' : queue.length}
          hint="Ưu tiên hạn cũ nhất"
          className="[&_p.tabular]:text-danger"
        />
      </div>
      <div className="mb-6" id="todo">
        <Card
          title="Việc cần làm"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="warning">Duyệt quá hạn</Badge>
              <LinkButton to="#catalogue" size="sm">
                Mở ô scenario theo nghề ↓
              </LinkButton>
            </div>
          }
        >
          <ProblemAlert error={overdue.error} />
          {overdue.loading ? (
            <LoadingBlock />
          ) : (
            !overdue.error &&
            (queue.length ? (
              <ul className="divide-y divide-line">
                {queue.map((a) => (
                  <li
                    key={a.assignmentId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        Lượt duyệt cần giao lại
                      </p>
                      <p className="mt-1 text-xs text-danger">
                        Hạn: {formatDateTime(a.deadlineAt)}
                      </p>
                    </div>
                    <span
                      className="max-w-full truncate font-mono text-xs text-ink-faint"
                      title={a.scenarioId}
                    >
                      {a.scenarioId}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Không có lượt duyệt quá hạn"
                description="Mở ô scenario của nghề để theo dõi và giao việc."
              />
            ))
          )}
        </Card>
      </div>
      <section id="catalogue" className="scroll-mt-20">
        <Card
          title="Danh mục nghề được giao"
          actions={<Badge>{mine.length} nghề</Badge>}
        >
          {occupations.loading ? (
            <LoadingBlock />
          ) : (
            !occupations.error &&
            (mine.length === 0 ? (
              <EmptyState title="Bạn chưa được giao quản lý nghề nào." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <caption className="sr-only">
                    Nghề được giao và các công cụ quản trị
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Nghề</th>
                      <th scope="col">Trạng thái</th>
                      <th scope="col">Scenario theo chặng</th>
                      <th scope="col" className="text-right">
                        Công cụ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mine.map((o) => {
                      const own = items.filter(
                        (s) =>
                          s.occupationId === o.id && s.status !== 'RETIRED',
                      );
                      const late = [...lateIds].filter(
                        (id) => occupationOf.get(id) === o.id,
                      ).length;
                      const needsGamify = own.filter(
                        (s) => s.status === 'APPROVED',
                      ).length;
                      return (
                        <tr key={o.id}>
                          <td>
                            <Link
                              to={`/ca/occupations/${o.id}/scenarios`}
                              className="font-semibold hover:underline"
                            >
                              {o.name}
                            </Link>
                            <p className="mt-1 font-mono text-xs text-ink-faint">
                              {o.code}
                            </p>
                          </td>
                          <td>
                            <Badge
                              tone={
                                o.status === 'PUBLISHED' ? 'success' : 'neutral'
                              }
                            >
                              {o.status === 'PUBLISHED'
                                ? 'Đã xuất bản'
                                : o.status === 'RETIRED'
                                  ? 'Đã gỡ'
                                  : 'Bản nháp'}
                            </Badge>
                            {late > 0 && (
                              <p className="mt-1 text-[12px] font-medium text-danger">
                                {late} lượt duyệt quá hạn: mở Ô scenario để giao
                                lại.
                              </p>
                            )}
                          </td>
                          <td>
                            <StageCounts items={own} />
                            {needsGamify > 0 && (
                              <p className="mt-1 text-[12px] text-warning">
                                {needsGamify} scenario đã duyệt đang chờ bạn
                                thiết kế trình bày.
                              </p>
                            )}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <LinkButton
                                to={`/ca/occupations/${o.id}/scenarios`}
                                size="sm"
                              >
                                Ô scenario
                              </LinkButton>
                              <LinkButton
                                to={`/ca/occupations/${o.id}/review-criteria`}
                                size="sm"
                              >
                                Tiêu chí duyệt
                              </LinkButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </Card>
      </section>
    </>
  );
}

function StageCounts({ items }: { items: ScenarioListItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {STAGES.map((st) => {
        const n = items.filter((s) => st.statuses.includes(s.status)).length;
        return (
          <li
            key={st.label}
            title={st.statuses.map((x) => STATUS_LABEL[x]).join(', ')}
            className="rounded-lg border border-line bg-night-900/30 px-2.5 py-1.5"
          >
            <span
              className={
                n > 0 && st.mine
                  ? 'block font-mono text-[18px] text-warning'
                  : 'block font-mono text-[18px] text-ink'
              }
            >
              {n}
            </span>
            <span className="text-[11px] text-ink-faint">{st.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
