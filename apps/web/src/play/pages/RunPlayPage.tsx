import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RoleTheme } from '../../components/game/RoleTheme';
import { CastRail } from '../../components/play/CastRail';
import { SceneHeader } from '../../components/play/SceneHeader';
import { SkillChips } from '../../components/play/SkillChips';
import { StakesBar } from '../../components/play/StakesBar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { getPlayApi, PLAY_HOME } from '../api/playApi';
import { ActivityPanel } from '../components/ActivityPanel';
import { usePlaySession, useReleaseStore } from '../store/playSession';
import { sceneArtFor } from '../vn/sceneArt';
import { type ScenePhase, VisualNovelRun } from '../vn/VisualNovelRun';
import { scenarioKeyOf, useRunScreen } from './useRunScreen';

/** Không có sự kiện `summary.ready` sau chừng này thì hỏi thẳng (polling dự phòng). */
const SUMMARY_POLL_MS = 4000;

/**
 * E11 — Màn chơi (SD-01). Mỗi câu trả lời gửi lên máy chủ ngay; câu tự luận
 * chờ kết quả qua `/stream`. Không đếm giờ.
 *
 * Mặc định bày thành cảnh visual novel (D-05); người chơi chuyển được sang
 * khung chat bất cứ lúc nào.
 */
export function RunPlayPage() {
  const { runId = '' } = useParams();
  const navigate = useNavigate();
  const { run, scenario } = useRunScreen(runId, { listen: true });
  const s = usePlaySession();
  const releaseError = useReleaseStore((r) => r.error);
  const [view, setView] = useState<'scene' | 'chat'>('scene');

  // Xong màn thì sang tổng kết.
  useEffect(() => {
    if (s.runId === runId && s.stage === 'finished')
      navigate(`/run/${runId}/summary`, { replace: true });
  }, [s.runId, s.stage, runId, navigate]);

  // Luồng sự kiện có thể rớt: hỏi thẳng tổng kết nếu chờ quá lâu.
  useEffect(() => {
    if (s.stage !== 'finishing') return;
    const timer = setInterval(() => {
      getPlayApi()
        .getRunSummary(runId)
        .then(() => usePlaySession.setState({ stage: 'finished' }))
        .catch(() => undefined);
    }, SUMMARY_POLL_MS);
    return () => clearInterval(timer);
  }, [s.stage, runId]);

  if (s.error && !s.activity) {
    return (
      <Card className="mx-auto max-w-[720px]">
        <CardBody>
          <Note tone="warn" className="mb-4">
            {s.error}
          </Note>
          <Button variant="primary" onClick={() => navigate(PLAY_HOME)}>
            Về bản đồ
          </Button>
        </CardBody>
      </Card>
    );
  }
  if (releaseError) {
    return (
      <Card className="mx-auto max-w-[720px]">
        <CardBody>
          <Note tone="warn">{releaseError}</Note>
        </CardBody>
      </Card>
    );
  }

  if (!run || !scenario || !s.activity || s.stage === 'loading') {
    return (
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {s.stage === 'finishing' ? 'Đang soạn nhận xét…' : 'Đang mở màn chơi…'}
      </p>
    );
  }

  const playerSeed = 'nguoi-choi';
  const art = sceneArtFor(scenarioKeyOf(scenario));
  const index = scenario.activities.findIndex(
    (a) => a.activity_id === s.activity?.activityKey,
  );

  const switcher = (
    <div
      className="mb-3 flex items-center gap-1.5"
      role="group"
      aria-label="Cách hiển thị"
    >
      {(['scene', 'chat'] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => setView(v)}
          className={
            view === v
              ? 'rounded-[7px] bg-gold-soft px-2.5 py-1 text-[12px] font-semibold text-gold-2'
              : 'rounded-[7px] px-2.5 py-1 text-[12px] text-muted hover:text-ink-2'
          }
        >
          {v === 'scene' ? 'Cảnh truyện' : 'Khung chat'}
        </button>
      ))}
    </div>
  );

  const leave = (
    <Button size="sm" onClick={() => navigate(PLAY_HOME)}>
      Rời màn chơi
    </Button>
  );

  /* ── Cảnh visual novel (D-05) ── */
  if (view === 'scene') {
    const phase: ScenePhase =
      s.stage === 'closing'
        ? 'closing'
        : s.stage === 'followup'
          ? 'followup'
          : s.stage === 'answering'
            ? 'answering'
            : 'busy';

    return (
      <RoleTheme roleCode={scenario.job.role_code}>
        <div className="mx-auto max-w-[1040px]">
          <SceneHeader scenario={scenario} />
          {switcher}
          {s.stage === 'finishing' ? (
            <Card>
              <CardBody>
                <ActivityPanel
                  scenario={scenario}
                  playerSeed={playerSeed}
                  showOpening={false}
                  showClosing={false}
                />
              </CardBody>
            </Card>
          ) : (
            <VisualNovelRun
              art={art}
              activityKey={s.activity.activityKey ?? ''}
              step={{
                current: Math.max(0, index) + 1,
                total: scenario.activities.length,
              }}
              setup={s.activity.setup ?? ''}
              npc={
                s.activity.npc?.line
                  ? {
                      npcKey: s.activity.npc.npcKey ?? '',
                      name: s.activity.npc.name ?? '',
                      line: s.activity.npc.line,
                    }
                  : null
              }
              phase={phase}
              followup={s.followup}
              closingLine={s.closing?.line ?? null}
              hint={s.hint}
              names={s.npcNames}
              onContinue={() => void s.next()}
            >
              <ActivityPanel
                scenario={scenario}
                playerSeed={playerSeed}
                showOpening={false}
                showClosing={false}
              />
            </VisualNovelRun>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {leave}
            <span className="font-mono text-[10px] text-muted">
              Bấm vào khung thoại hoặc Enter để đọc tiếp
            </span>
          </div>
          <SkillChips scenario={scenario} />
        </div>
      </RoleTheme>
    );
  }

  /* ── Khung chat ── */
  return (
    <RoleTheme roleCode={scenario.job.role_code}>
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-5 min-[1100px]:grid-cols-[minmax(300px,360px)_1fr]">
        <aside className="flex flex-col gap-0 min-[1100px]:sticky min-[1100px]:top-5">
          <SceneHeader scenario={scenario} />
          <StakesBar scenario={scenario} />
          <CastRail
            scenario={scenario}
            speakingNpcId={s.followup?.npcKey ?? s.activity.npc?.npcKey ?? null}
          />
          <SkillChips scenario={scenario} />
          <div className="mt-2">{leave}</div>
        </aside>

        <div>
          {switcher}
          <Card>
            <CardBody>
              <ActivityPanel
                scenario={scenario}
                playerSeed={playerSeed}
                showOpening
                showClosing
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleTheme>
  );
}
