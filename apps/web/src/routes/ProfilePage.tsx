import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasFit } from '@datn/game-core';
import { FitRadar } from '../components/game/FitRadar';
import { PageHeader } from '../components/layout/PageHeader';
import { BandRoadmap } from '../components/profile/BandRoadmap';
import { CharacterCard } from '../components/profile/CharacterCard';
import { LegacyImportBanner } from '../components/profile/LegacyImportBanner';
import { ProgressChart } from '../components/profile/ProgressChart';
import { RunHistory } from '../components/profile/RunHistory';
import { SkillBreakdown } from '../components/profile/SkillBreakdown';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Pill } from '../components/ui/Pill';
import { useJourneyStore } from '../store/journeyStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

/**
 * "Hành trang" — tất cả xoay quanh điểm kỹ năng, vì đó là thứ vận hành cả hệ
 * thống: nó quyết định cấp bậc nào mở ra.
 *
 * Thứ tự từ trên xuống đi từ tổng quát tới chi tiết:
 *   thẻ nhân vật — bạn là ai, bao nhiêu điểm, điểm từ đâu, còn bao xa
 *   kỹ năng      — giỏi cái gì (tách cứng / mềm)   ·   theo ngày — tiến bộ ra sao
 *   cấp bậc      — đi được tới đâu, bày ngang như bản đồ màn chơi
 *   lịch sử      — vì sao lại được chừng đó điểm   ·   chân dung — hợp nơi nào
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
    <div className="mx-auto max-w-[1180px]">
      <PageHeader title="Hành trang">
        Hai loại điểm, đo hai chuyện khác nhau: kỹ năng mở cấp bậc kế, tính cách
        chỉ hướng hành tinh nên ghé.
      </PageHeader>

      <LegacyImportBanner />

      <div className="mb-4">
        <CharacterCard
          summary={summary}
          quizDone={profile.quizDone}
          eventsPlayed={profile.eventsPlayed}
        />
      </div>

      <div className="mb-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
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

      <Card className="mb-4">
        <CardHeader title="Lộ trình cấp bậc">
          {summary && summary.roles.length > 0 && (
            <Pill tone="gold">
              {`${summary.roles.reduce((sum, r) => sum + r.totalPoints, 0)} điểm`}
            </Pill>
          )}
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          {summary && summary.roles.length > 0 ? (
            summary.roles.map((role) => (
              <section key={role.roleCode}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="m-0 text-[14px] font-semibold text-ink">
                    {role.roleName}
                  </h3>
                  <span className="text-[10.5px] text-muted">
                    {`${role.totalPoints} điểm`}
                  </span>
                </div>
                <BandRoadmap role={role} currentBand={currentBand} />
              </section>
            ))
          ) : (
            <EmptyState
              action={
                <Button variant="primary" onClick={() => navigate('/jobs')}>
                  Mở bản đồ
                </Button>
              }
            >
              Chưa có điểm kỹ năng ở hành tinh nào. Điểm kỹ năng đến từ{' '}
              <b>nhiệm vụ chính</b> và <b>nhiệm vụ phụ</b> trên bản đồ nghề.
            </EmptyState>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:[grid-template-columns:minmax(0,3fr)_minmax(300px,2fr)]">
        <Card>
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
                  <Button onClick={() => navigate('/quiz')}>
                    Trả lời 6 câu
                  </Button>
                }
              >
                Chưa có nét nào. Làm vài nhiệm vụ phụ hoặc trả lời 6 câu tự vấn.
              </EmptyState>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
