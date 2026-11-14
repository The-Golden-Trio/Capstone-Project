import { staffApi } from '../../api/endpoints';
import {
  Badge,
  Card,
  EmptyState,
  LinkButton,
  Loading,
  PageHeader,
  ProblemAlert,
} from '../../components/ui';
import { useLoad } from '../../hooks/useLoad';

/** C01 Content Admin portal (`listMyOccupations`). */
export function CaPortalPage() {
  const occupations = useLoad(() => staffApi.listMyOccupations(), []);
  const overdue = useLoad(
    () => staffApi.listReviewAssignments({ overdue: true }),
    [],
  );
  const mine = (occupations.data ?? []).filter(
    (o) => o.myRole === 'CONTENT_ADMIN',
  );

  return (
    <>
      <PageHeader
        title="Nghề tôi quản lý"
        subtitle="Mở scenario cho từng task, giao chuyên gia viết và duyệt, rồi thiết kế trình bày."
      />
      <ProblemAlert error={occupations.error} />
      {occupations.loading ? (
        <Loading />
      ) : mine.length === 0 ? (
        <EmptyState>Bạn chưa được giao quản lý nghề nào.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((o) => {
            const late = (overdue.data ?? []).length;
            return (
              <Card key={o.id} title={o.name} actions={<Badge>{o.code}</Badge>}>
                <p className="mb-3 text-muted">
                  Trạng thái nghề:{' '}
                  {o.status === 'PUBLISHED'
                    ? 'đã xuất bản'
                    : o.status === 'RETIRED'
                      ? 'đã gỡ'
                      : 'bản nháp'}
                  {late > 0 && (
                    <>
                      {' · '}
                      <span className="font-medium text-bad">
                        {late} lượt duyệt quá hạn
                      </span>
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <LinkButton
                    to={`/ca/occupations/${o.id}/scenarios`}
                    variant="primary"
                    size="sm"
                  >
                    Ô scenario
                  </LinkButton>
                  <LinkButton
                    to={`/ca/occupations/${o.id}/review-criteria`}
                    variant="secondary"
                    size="sm"
                  >
                    Tiêu chí duyệt
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
