import { useNavigate } from 'react-router-dom';
import { GAME } from '../data/gameData';
import { hasScenario } from '../data/indexes';
import {
  bandLabel,
  bandsOf,
  isBandOpen,
  previousBand,
  UNLOCK_AT,
} from '../domain/bands';
import { hasFit } from '../domain/fit';
import { shortRoleName } from '../domain/format';
import { FitRadar } from '../components/game/FitRadar';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Pill } from '../components/ui/Pill';
import { Stat, StatGrid } from '../components/ui/Stat';
import { cx } from '../lib/cx';
import { useJourneyStore } from '../store/journeyStore';
import {
  skillPointsAt,
  totalSkillPoints,
  useProfileStore,
} from '../store/profileStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const currentBand = useJourneyStore((s) => s.band);

  const rolesWithSkill = GAME.roles.filter((r) => profile.skill[r.role_code]);

  return (
    <>
      <PageHeader title="Hành trang">
        Hai loại điểm, đo hai chuyện khác nhau: kỹ năng mở cấp bậc kế, tính cách
        chỉ hướng hành tinh nên ghé.
      </PageHeader>

      <StatGrid className="mb-[22px]">
        <Stat
          label="Điểm kỹ năng"
          value={totalSkillPoints(profile)}
          hint="từ kịch bản sâu"
          gold
        />
        <Stat
          label="Sự kiện"
          value={profile.eventsPlayed}
          hint="vẽ nên chân dung"
        />
        <Stat
          label="Đã hoàn thành"
          value={profile.doneTasks.length}
          hint="chính và phụ"
        />
        <Stat
          label="Đã tự vấn"
          value={profile.quizDone ? '✓' : '—'}
          hint={profile.quizDone ? 'đã làm' : 'chưa làm'}
        />
      </StatGrid>

      {rolesWithSkill.length > 0 ? (
        rolesWithSkill.map((role) => (
          <Card key={role.role_code} className="mb-4">
            <CardHeader title={shortRoleName(role)}>
              <Pill tone="gold">hành trình</Pill>
            </CardHeader>
            <CardBody>
              <div className="roadmap">
                {bandsOf(role).map((band) => {
                  const open = isBandOpen(role, band, (b) =>
                    skillPointsAt(profile, role.role_code, b),
                  );
                  const points = skillPointsAt(profile, role.role_code, band);
                  const built = hasScenario(role.role_code, band);
                  const previous = previousBand(role, band);

                  return (
                    <div
                      key={band}
                      className={cx(
                        'roadmap-stop relative mb-2.5 grid items-center gap-3 rounded-[10px] border px-[15px] py-[11px] [grid-template-columns:1fr_auto]',
                        open
                          ? 'open border-gold bg-gold-soft'
                          : 'border-line-2 bg-panel',
                        band === currentBand && 'current',
                      )}
                    >
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2.5">
                          <span
                            className={cx(
                              'font-mono text-[13px] font-bold',
                              open ? 'text-gold-2' : 'text-muted',
                            )}
                          >
                            {band}
                          </span>
                          <span className="text-[12.5px] text-ink-2">
                            {bandLabel(band)}
                          </span>
                        </div>
                        {!built && (
                          <div className="mt-[3px] font-mono text-[10.5px] text-muted">
                            chưa dựng nhiệm vụ
                          </div>
                        )}
                      </div>
                      <span className="whitespace-nowrap font-mono text-[10.5px] text-muted">
                        {open
                          ? points
                            ? `${points} điểm`
                            : 'đã tới'
                          : `cần ${UNLOCK_AT} điểm ở ${previous}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        ))
      ) : (
        <EmptyState
          className="mb-[22px]"
          action={
            <Button variant="primary" onClick={() => navigate('/jobs')}>
              Mở bản đồ
            </Button>
          }
        >
          Chưa có điểm kỹ năng ở hành tinh nào. Điểm kỹ năng chỉ đến từ{' '}
          <b>nhiệm vụ chính</b>, hiện mới có ở Back-end.
        </EmptyState>
      )}

      <Card>
        <CardHeader title="Chân dung của bạn">
          <Pill>cộng dồn từ mọi lựa chọn</Pill>
        </CardHeader>
        <CardBody>
          {hasFit(profile.fit) ? (
            <FitRadar fit={profile.fit} />
          ) : (
            <EmptyState
              icon="?"
              action={<Button onClick={() => navigate('/quiz')}>Trả lời 6 câu</Button>}
            >
              Chưa có nét nào. Làm vài nhiệm vụ phụ hoặc trả lời 6 câu tự vấn.
            </EmptyState>
          )}
        </CardBody>
      </Card>
    </>
  );
}
