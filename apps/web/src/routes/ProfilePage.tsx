import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasFit } from '@datn/game-core';
import { FitRadar } from '../components/game/FitRadar';
import { PageHeader } from '../components/layout/PageHeader';
import { BandRoadmap } from '../components/profile/BandRoadmap';
import { LegacyImportBanner } from '../components/profile/LegacyImportBanner';
import { ProgressChart } from '../components/profile/ProgressChart';
import { RunHistory } from '../components/profile/RunHistory';
import { SkillBreakdown } from '../components/profile/SkillBreakdown';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Pill } from '../components/ui/Pill';
import { Stat, StatGrid } from '../components/ui/Stat';
import { useJourneyStore } from '../store/journeyStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

/**
 * "Hành trang" — tất cả xoay quanh điểm kỹ năng, vì đó là thứ vận hành cả hệ
 * thống: nó quyết định cấp bậc nào mở ra.
 *
 * Bốn cách nhìn cùng một con số, mỗi cách trả lời một câu khác nhau:
 *   cấp bậc     — đi được tới đâu
 *   kỹ năng     — giỏi cái gì
 *   theo ngày   — tiến bộ ra sao
 *   lịch sử     — vì sao lại được chừng đó điểm
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const { summary, runs, load } = useProgressStore();
  const currentBand = useJourneyStore((s) => s.band);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader title="Hành trang">
        Hai loại điểm, đo hai chuyện khác nhau: kỹ năng mở cấp bậc kế, tính cách
        chỉ hướng hành tinh nên ghé.
      </PageHeader>

      <LegacyImportBanner />

      <StatGrid className="mb-[22px]">
        <Stat
          label="Điểm kỹ năng"
          value={summary?.totalPoints ?? 0}
          hint="do máy chủ chấm"
          gold
        />
        <Stat
          label="Nhiệm vụ chính"
          value={summary?.runsCompleted ?? 0}
          hint="đã hoàn thành"
        />
        <Stat
          label="Nhiệm vụ phụ"
          value={profile.eventsPlayed}
          hint="vẽ nên chân dung"
        />
        <Stat
          label="Đã tự vấn"
          value={profile.quizDone ? '✓' : '—'}
          hint={profile.quizDone ? 'đã làm' : 'chưa làm'}
        />
      </StatGrid>

      <div className="mb-4 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <Card>
          <CardHeader title="Mạnh ở đâu">
            <Pill tone="gold">theo kỹ năng</Pill>
          </CardHeader>
          <CardBody>
            <SkillBreakdown skills={summary?.skills ?? []} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Tiến bộ theo thời gian">
            <Pill>cộng dồn</Pill>
          </CardHeader>
          <CardBody>
            <ProgressChart timeline={summary?.timeline ?? []} />
          </CardBody>
        </Card>
      </div>

      {summary && summary.roles.length > 0 ? (
        summary.roles.map((role) => (
          <Card key={role.roleCode} className="mb-4">
            <CardHeader title={role.roleName}>
              <Pill tone="gold">{role.totalPoints} điểm</Pill>
            </CardHeader>
            <CardBody>
              <BandRoadmap role={role} currentBand={currentBand} />
            </CardBody>
          </Card>
        ))
      ) : (
        <EmptyState
          className="mb-4"
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

      <Card className="mb-4">
        <CardHeader title="Những lượt đã chơi">
          <Pill>{runs.length}</Pill>
        </CardHeader>
        <CardBody>
          <RunHistory runs={runs} />
        </CardBody>
      </Card>

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
              action={
                <Button onClick={() => navigate('/quiz')}>Trả lời 6 câu</Button>
              }
            >
              Chưa có nét nào. Làm vài nhiệm vụ phụ hoặc trả lời 6 câu tự vấn.
            </EmptyState>
          )}
        </CardBody>
      </Card>
    </>
  );
}
