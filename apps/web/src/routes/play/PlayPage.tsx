import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findScenarioByKey } from '../../data/indexes';
import { findFollowupLine } from '../../domain/followups';
import { stripNpcPrefix } from '../../domain/format';
import {
  activityIndex,
  currentActivity,
  npcShortName,
  scenarioOf,
} from '../../domain/scenarioEngine';
import { ChatLog, NpcBubble } from '../../components/play/ChatLog';
import { CountdownBar } from '../../components/play/CountdownBar';
import { ChoiceActivity } from '../../components/play/activities/ChoiceActivity';
import { FreetextActivity } from '../../components/play/activities/FreetextActivity';
import { OrderingActivity } from '../../components/play/activities/OrderingActivity';
import { PrioritizingActivity } from '../../components/play/activities/PrioritizingActivity';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { ProgressDots } from '../../components/ui/Progress';
import { useCountdown } from '../../hooks/useCountdown';
import { useRunStore } from '../../store/runStore';

export function PlayPage() {
  const { scenarioKey = '' } = useParams();
  const navigate = useNavigate();

  const run = useRunStore((s) => s.run);
  const start = useRunStore((s) => s.start);
  const dispatch = useRunStore((s) => s.dispatch);

  const entry = findScenarioByKey(scenarioKey);

  // Vào thẳng URL này (hoặc bấm "chơi lại") thì mở màn mới.
  useEffect(() => {
    if (entry && run?.scenarioKey !== scenarioKey) start(scenarioKey);
  }, [entry, run?.scenarioKey, scenarioKey, start]);

  const deadline = run?.phase === 'main' ? (run.deadline ?? null) : null;
  const secondsLeft = useCountdown(deadline, () => dispatch({ type: 'TIMEOUT' }));

  if (!entry) return <Navigate to="/jobs" replace />;
  if (!run || run.scenarioKey !== scenarioKey) return null;
  if (run.phase === 'ended') return <Navigate to={`/play/${scenarioKey}/end`} replace />;

  const scenario = scenarioOf(run);
  const activity = currentActivity(run);
  const index = activityIndex(run);
  const isFollowup = run.phase === 'followup';
  const hintUsed = run.hintsUsed.includes(run.activityId);

  /* ── Chuyện xen ngang ── */
  if (run.phase === 'event' && run.pendingEvent) {
    const event = run.pendingEvent;
    return (
      <Card className="max-w-[640px]">
        <CardBody>
          <div className="mb-3.5 rounded-[10px] border-[1.5px] border-signal bg-signal-soft p-[15px]">
            <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.11em] text-signal">
              Có chuyện xen vào
            </p>
            <p className="m-0 text-[14px] leading-relaxed text-ink-2">{event.text}</p>
          </div>
          {event.divert_note && (
            <NpcBubble
              name={npcShortName(scenario, 'an')}
              text={event.divert_note.split('Kéo người chơi')[0]}
            />
          )}
          <Button variant="primary" onClick={() => dispatch({ type: 'CONTINUE' })}>
            {event.outcome === 'EARLY_END' ? 'Xem kết cục' : 'Tiếp tục'}
          </Button>
        </CardBody>
      </Card>
    );
  }

  const followupLine = findFollowupLine(scenarioKey, activity.activity_id);

  return (
    <Card className="max-w-[640px]">
      <CardHeader title={scenario.scenario_title}>
        <Pill>{activity.type.toLowerCase()}</Pill>
        <span className="font-mono text-[10.5px] text-muted">
          {index + 1}/{scenario.activities.length}
        </span>
      </CardHeader>

      <CardBody>
        <ProgressDots total={scenario.activities.length} current={index} />

        {run.phase === 'main' &&
          activity.quick_action &&
          secondsLeft !== null && (
            <CountdownBar
              secondsLeft={secondsLeft}
              totalSeconds={activity.time_limit_seconds ?? 0}
            />
          )}

        {isFollowup && (
          <p className="m-0 mb-[11px] font-mono text-[10.5px] text-gold-2">
            đào sâu {run.followupUsed}/{activity.limitFollowup}
          </p>
        )}

        {run.phase === 'main' && (
          <p className="m-0 mb-[15px] text-[14px] leading-relaxed text-ink-2">
            {activity.setup}
          </p>
        )}

        <ChatLog lines={run.log} />

        {run.phase === 'main' && activity.npc_line && (
          <NpcBubble
            name={
              activity.npc_line.match(/^([^:]{1,14}):/)?.[1].trim().slice(0, 4) ??
              '?'
            }
            text={activity.npc_line}
          />
        )}

        {run.phase === 'main' &&
          activity.input_prompt &&
          activity.type !== 'FREETEXT' && (
            <p className="m-0 mb-[15px] text-[14px] font-medium leading-relaxed text-ink">
              {activity.input_prompt}
            </p>
          )}

        {isFollowup && followupLine && (
          <NpcBubble
            name={npcShortName(scenario, followupLine.who)}
            text={followupLine.text}
          />
        )}

        {/* ── Thân hoạt động ── */}
        {run.phase === 'closing' ? (
          <>
            <p className="m-0 mb-[15px] text-[14px] leading-relaxed text-muted">
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
            onPick={(optionIndex) =>
              dispatch({ type: 'ANSWER_CHOICE', optionIndex })
            }
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

      <div className="border-t border-line-2 px-[18px] py-3">
        <Button size="sm" onClick={() => navigate(-1)}>
          Rời màn chơi
        </Button>
      </div>
    </Card>
  );
}
