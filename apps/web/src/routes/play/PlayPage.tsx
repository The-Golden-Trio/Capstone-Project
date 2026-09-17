import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  activityIndex,
  currentActivity,
  findFollowupLine,
  findScenarioByKey,
  npcShortName,
  scenarioOf,
  stripNpcPrefix,
} from '@datn/game-core';
import { CastRail } from '../../components/play/CastRail';
import { ChatLog, NpcBubble } from '../../components/play/ChatLog';
import { CountdownBar } from '../../components/play/CountdownBar';
import { ObjectiveStrip } from '../../components/play/ObjectiveStrip';
import { SceneHeader } from '../../components/play/SceneHeader';
import { SkillChips } from '../../components/play/SkillChips';
import { StakesBar } from '../../components/play/StakesBar';
import { ChoiceActivity } from '../../components/play/activities/ChoiceActivity';
import { FreetextActivity } from '../../components/play/activities/FreetextActivity';
import { OrderingActivity } from '../../components/play/activities/OrderingActivity';
import { PrioritizingActivity } from '../../components/play/activities/PrioritizingActivity';
import { RoleTheme } from '../../components/game/RoleTheme';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuthStore } from '../../store/authStore';
import { useRunStore } from '../../store/runStore';

/**
 * Một cảnh trong màn chơi.
 *
 * Bố cục cố định, mỗi mảng do một trường dữ liệu nuôi: bạn là ai (SceneHeader),
 * mất gì nếu hỏng (StakesBar), ai đang ở đây và họ cần gì (CastRail), đang đo
 * cái gì (SkillChips), việc phải làm (ObjectiveStrip), rồi mới tới lời thoại
 * và các thẻ hành động.
 *
 * Không đụng gì tới `scenarioEngine` — mọi thứ dưới đây chỉ là cách bày ra.
 */
export function PlayPage() {
  const { scenarioKey = '' } = useParams();
  const navigate = useNavigate();

  const run = useRunStore((s) => s.run);
  const starting = useRunStore((s) => s.starting);
  const error = useRunStore((s) => s.error);
  const start = useRunStore((s) => s.start);
  const dispatch = useRunStore((s) => s.dispatch);
  const playerSeed = useAuthStore((s) => s.user?.id ?? 'khach');

  const entry = findScenarioByKey(scenarioKey);

  // Mở màn qua máy chủ: nó kiểm cấp bậc đã mở chưa rồi mới phát hạt giống.
  useEffect(() => {
    if (entry && run?.scenarioKey !== scenarioKey && !starting && !error) {
      void start(scenarioKey);
    }
  }, [entry, run?.scenarioKey, scenarioKey, start, starting, error]);

  const deadline = run?.phase === 'main' ? (run.deadline ?? null) : null;
  const secondsLeft = useCountdown(deadline, () => dispatch({ type: 'TIMEOUT' }));

  if (!entry) return <Navigate to="/jobs" replace />;

  if (error) {
    return (
      <Card className="max-w-[720px]">
        <CardBody>
          <Note tone="warn" className="mb-4">
            {error}
          </Note>
          <Button variant="primary" onClick={() => navigate('/jobs')}>
            Về bản đồ
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!run || run.scenarioKey !== scenarioKey) {
    return (
      <Card className="max-w-[720px]">
        <CardBody>
          <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Đang mở màn chơi…
          </p>
        </CardBody>
      </Card>
    );
  }

  if (run.phase === 'ended') {
    return <Navigate to={`/play/${scenarioKey}/end`} replace />;
  }

  const scenario = scenarioOf(run);
  const activity = currentActivity(run);
  const index = activityIndex(run);
  const isFollowup = run.phase === 'followup';
  const hintUsed = run.hintsUsed.includes(run.activityId);
  const followupLine = findFollowupLine(scenarioKey, activity.activity_id);

  /* ── Chuyện xen ngang ── */
  if (run.phase === 'event' && run.pendingEvent) {
    const event = run.pendingEvent;
    return (
      <RoleTheme roleCode={scenario.job.role_code}>
        <Card className="max-w-[720px]">
          <CardBody>
            <div className="reveal mb-4 rounded-[10px] border-[1.5px] border-signal bg-signal-soft p-4">
              <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.11em] text-signal">
                Có chuyện xen vào
              </p>
              <p className="m-0 text-[14px] leading-relaxed text-ink-2">
                {event.text}
              </p>
            </div>
            {event.divert_note && (
              <NpcBubble
                seed="an"
                name={npcShortName(scenario, 'an')}
                text={event.divert_note.split('Kéo người chơi')[0]}
              />
            )}
            <Button variant="primary" onClick={() => dispatch({ type: 'CONTINUE' })}>
              {event.outcome === 'EARLY_END' ? 'Xem kết cục' : 'Tiếp tục'}
            </Button>
          </CardBody>
        </Card>
      </RoleTheme>
    );
  }

  const speakingNpcId = isFollowup ? followupLine?.who : null;

  return (
    <RoleTheme roleCode={scenario.job.role_code}>
      <div className="max-w-[720px]">
        <SceneHeader scenario={scenario} />
        <StakesBar scenario={scenario} />
        <CastRail scenario={scenario} speakingNpcId={speakingNpcId} />

        <Card>
          <CardBody>
            <ObjectiveStrip
              type={activity.type}
              total={scenario.activities.length}
              current={index}
              followup={
                isFollowup
                  ? { used: run.followupUsed, limit: activity.limitFollowup }
                  : null
              }
            />

            {run.phase === 'main' && activity.quick_action && secondsLeft !== null && (
              <CountdownBar
                secondsLeft={secondsLeft}
                totalSeconds={activity.time_limit_seconds ?? 0}
              />
            )}

            {run.phase === 'main' && (
              <p className="m-0 mb-4 text-[14px] leading-relaxed text-ink-2">
                {activity.setup}
              </p>
            )}

            <ChatLog lines={run.log} playerSeed={playerSeed} />

            {run.phase === 'main' && activity.npc_line && (
              <NpcBubble
                name={
                  activity.npc_line.match(/^([^:]{1,14}):/)?.[1].trim().slice(0, 4) ??
                  '?'
                }
                text={activity.npc_line}
              />
            )}

            {isFollowup && followupLine && (
              <NpcBubble
                seed={followupLine.who}
                name={npcShortName(scenario, followupLine.who)}
                text={followupLine.text}
              />
            )}

            {run.phase === 'main' &&
              activity.input_prompt &&
              activity.type !== 'FREETEXT' && (
                <p className="m-0 mb-4 text-[14px] font-medium leading-relaxed text-ink">
                  {activity.input_prompt}
                </p>
              )}

            {/* ── Thân hoạt động ── */}
            {run.phase === 'closing' ? (
              <>
                <p className="reveal m-0 mb-4 text-[14px] leading-relaxed text-muted">
                  {stripNpcPrefix(activity.closing_prompt)}
                </p>
                <Button variant="primary" onClick={() => dispatch({ type: 'CONTINUE' })}>
                  Tiếp tục
                </Button>
              </>
            ) : isFollowup ? (
              <FreetextActivity
                resetKey={`${run.activityId}:followup:${run.followupUsed}`}
                placeholder="Trả lời…"
                isFollowup
                hintAvailable={false}
                hintUsed={hintUsed}
                onHint={() => dispatch({ type: 'USE_HINT' })}
                onSubmit={(text) => dispatch({ type: 'ANSWER_TEXT', text })}
              />
            ) : activity.type === 'CHOICE' ? (
              <ChoiceActivity
                activity={activity}
                onPick={(optionIndex) => dispatch({ type: 'ANSWER_CHOICE', optionIndex })}
              />
            ) : activity.type === 'ORDERING' ? (
              <OrderingActivity
                activity={activity}
                order={run.order ?? []}
                onMove={(i, direction) =>
                  dispatch({ type: 'MOVE_ITEM', index: i, direction })
                }
                onSubmit={() => dispatch({ type: 'ANSWER_ORDERING' })}
              />
            ) : activity.type === 'PRIORITIZING' ? (
              <PrioritizingActivity
                activity={activity}
                picked={run.picked ?? []}
                hintUsed={hintUsed}
                onToggle={(itemId) => dispatch({ type: 'TOGGLE_PICK', itemId })}
                onHint={() => dispatch({ type: 'USE_HINT' })}
                onSubmit={() => dispatch({ type: 'ANSWER_PRIORITIZING' })}
              />
            ) : (
              <FreetextActivity
                resetKey={run.activityId}
                placeholder={activity.input_prompt ?? ''}
                isFollowup={false}
                hintAvailable={activity.hints.length > 0}
                hintUsed={hintUsed}
                onHint={() => dispatch({ type: 'USE_HINT' })}
                onSubmit={(text) => dispatch({ type: 'ANSWER_TEXT', text })}
              />
            )}
          </CardBody>
        </Card>

        <SkillChips scenario={scenario} />

        <div className="mt-2">
          <Button size="sm" onClick={() => navigate(-1)}>
            Rời màn chơi
          </Button>
        </div>
      </div>
    </RoleTheme>
  );
}
