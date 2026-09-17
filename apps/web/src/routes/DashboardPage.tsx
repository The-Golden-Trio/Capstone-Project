import { useNavigate } from 'react-router-dom';
import { GAME, bandLabel, findRole, hasFit, rankRoles, shortRoleName } from '@datn/game-core';
import { Planet } from '../components/game/Planet';
import { StarMap } from '../components/game/StarMap';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Pill } from '../components/ui/Pill';
import { Stat, StatGrid } from '../components/ui/Stat';
import { useAuthStore } from '../store/authStore';
import { useJourneyStore } from '../store/journeyStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore();
  const summary = useProgressStore((s) => s.summary);
  const { roleCode, band } = useJourneyStore();
  const role = findRole(roleCode);

  const known = hasFit(profile.fit);
  const topRoles = known ? rankRoles(profile.fit).slice(0, 3) : [];

  // Cấp bậc cao nhất đã chạm tới, đo bằng điểm kỹ năng chứ không phải thứ tự.
  const best = (summary?.roles ?? [])
    .flatMap((r) =>
      r.bands.map((b) => ({ roleName: r.roleName, band: b.band, points: b.points })),
    )
    .sort((a, b) => b.points - a.points)[0];

  const goToRole = (code: string) => {
    const target = findRole(code);
    if (target) navigate(`/jobs/${code}/${target.band_start}`);
  };

  return (
    <>
      <PageHeader title={`Chào ${user?.displayName ?? 'bạn'}`}>
        Chọn một hành tinh, làm vài nhiệm vụ, rồi xem chân dung của bạn dần hiện
        ra.
      </PageHeader>

      <StatGrid className="mb-[22px]">
        <Stat
          label="Đã ghé"
          value={summary?.roles.length ?? 0}
          hint={`trên ${GAME.roles.length} hành tinh`}
        />
        <Stat
          label="Điểm kỹ năng"
          value={summary?.totalPoints ?? 0}
          hint="từ nhiệm vụ chính"
          gold
        />
        <Stat
          label="Nhiệm vụ phụ"
          value={profile.eventsPlayed}
          hint={
            profile.eventsPlayed >= 5
              ? 'đủ để chỉ hướng lân cận'
              : `cần ${5 - profile.eventsPlayed} nữa để chỉ hướng`
          }
        />
        <Stat
          label="Cấp bậc cao nhất"
          value={best?.band ?? '—'}
          hint={best?.roleName ?? 'chưa có'}
        />
      </StatGrid>

      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
        <Card>
          <CardHeader title={role ? 'Đang ở' : 'Khởi hành từ đâu'} />
          <CardBody>
            {role && band ? (
              <>
                <div className="mb-3.5 flex items-center gap-4">
                  <Planet roleCode={role.role_code} size={72} />
                  <div>
                    <div className="font-display text-[17px] font-semibold">
                      {shortRoleName(role)}
                    </div>
                    <div className="mt-[3px] text-[12.5px] text-muted">
                      {band} · {bandLabel(band)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/jobs/${role.role_code}/${band}`)}
                >
                  Tiếp tục hành trình
                </Button>
              </>
            ) : (
              <EmptyState
                action={
                  <Button
                    variant="primary"
                    onClick={() => navigate(profile.quizDone ? '/jobs' : '/quiz')}
                  >
                    {profile.quizDone ? 'Mở bản đồ' : 'Bắt đầu'}
                  </Button>
                }
              >
                Chưa đặt chân tới hành tinh nào.{' '}
                {profile.quizDone
                  ? `Mở bản đồ xem ${GAME.roles.length} nơi đang tới được.`
                  : 'Trả lời 6 câu để bản đồ chỉ hướng cho bạn.'}
              </EmptyState>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Hành tinh hợp với bạn">
            {known && <Pill tone="gold">theo hồ sơ</Pill>}
          </CardHeader>
          <CardBody>
            {topRoles.length > 0 ? (
              <StarMap
                roles={topRoles}
                size={72}
                onSelect={goToRole}
                className="pt-0"
              />
            ) : (
              <EmptyState
                icon="?"
                action={<Button onClick={() => navigate('/quiz')}>Trả lời 6 câu</Button>}
              >
                Chưa có hồ sơ tính cách. Làm 6 câu hoặc chơi vài sự kiện để hệ
                thống hiểu bạn.
              </EmptyState>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
