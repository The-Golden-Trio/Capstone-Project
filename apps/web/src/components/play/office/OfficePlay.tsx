import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  activityIndex,
  currentActivity,
  stripNpcPrefix,
  type RunAction,
  type RunState,
  type Scenario,
} from '@datn/game-core';
import { cx } from '../../../lib/cx';
import { getFollowupLine } from '../../../store/contentStore';
import { Button } from '../../ui/Button';
import { NpcBubble } from '../ChatLog';
import { CountdownBar } from '../CountdownBar';
import { ObjectiveStrip } from '../ObjectiveStrip';
import { SceneHeader } from '../SceneHeader';
import { SkillChips } from '../SkillChips';
import { ChoiceActivity } from '../activities/ChoiceActivity';
import { FreetextActivity } from '../activities/FreetextActivity';
import { OrderingActivity } from '../activities/OrderingActivity';
import { PrioritizingActivity } from '../activities/PrioritizingActivity';
import { DPad } from './DPad';
import { OfficeCanvas, type OfficeHandle, type Target } from './OfficeCanvas';
import { CHARACTERS } from './sprites';
import type { NpcId, Stage } from './stage';
import { parseWorld } from './world';

/* ── Hội thoại ─────────────────────────────────────────────────────── */

interface Line {
  /** `null` là lời dẫn truyện — in nghiêng, không có tên. */
  npc: NpcId | null;
  text: string;
}

type Mode =
  | { kind: 'explore' }
  | { kind: 'dialogue'; lines: Line[]; index: number; after: 'activity' | 'continue' }
  | { kind: 'activity' };

/** "An: 'câu nói'" → NPC nào đang nói, nếu nhận ra được. */
function speakerOf(line: string): NpcId | null {
  const name = line.match(/^([^:]{1,14}):/)?.[1].trim().toLowerCase();
  if (name === 'an') return 'an';
  if (name === 'hà' || name === 'ha') return 'ha';
  return null;
}

/** Lời thoại mở đầu một hoạt động: lời dẫn rồi tới câu của NPC (nếu có). */
function openingLines(
  setup: string,
  npcLine: string | null,
  fallbackNpc: NpcId | null,
): Line[] {
  const lines: Line[] = [{ npc: null, text: setup }];
  if (npcLine) {
    lines.push({ npc: speakerOf(npcLine) ?? fallbackNpc, text: stripNpcPrefix(npcLine) });
  }
  return lines;
}

/** Gõ chữ dần — bấm tiếp khi đang gõ thì hiện hết ngay. */
function useTypewriter(text: string, charsPerSecond = 40) {
  const [shown, setShown] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    setShown(0);
    const start = performance.now();
    const tick = (now: number) => {
      const n = Math.min(text.length, Math.floor(((now - start) / 1000) * charsPerSecond));
      setShown(n);
      if (n < text.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, charsPerSecond]);
  return {
    visible: text.slice(0, shown),
    done: shown >= text.length,
    // Phải dừng vòng gõ, không thì khung sau lại ghi đè số chữ đã hiện.
    finish: () => {
      cancelAnimationFrame(raf.current);
      setShown(text.length);
    },
  };
}

function DialogueBox({
  line,
  isLast,
  onAdvance,
}: {
  line: Line;
  isLast: boolean;
  onAdvance: () => void;
}) {
  const { visible, done, finish } = useTypewriter(line.text);
  const character = line.npc ? CHARACTERS[line.npc] : null;
  const advance = () => (done ? onAdvance() : finish());

  return (
    <button
      id="office-dialogue"
      type="button"
      onClick={advance}
      // Neo góc dưới-phải, chừa nửa trái: bàn người chơi và bàn An đều ở bên trái.
      className="reveal absolute bottom-3 right-3 block w-[calc(100%-1.5rem)] cursor-pointer rounded-[10px] border border-line bg-bg/92 p-4 text-left backdrop-blur-sm sm:w-[54%] sm:max-w-[460px]"
    >
      <span
        className={cx(
          'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.11em]',
          character ? 'text-gold-2' : 'text-muted',
        )}
      >
        {character ? character.label : '◆ dẫn truyện'}
      </span>
      <span
        className={cx(
          'block min-h-[42px] text-[14px] leading-relaxed text-ink-2',
          !character && 'italic',
        )}
      >
        {visible}
        {!done && <span className="animate-pulse">▌</span>}
      </span>
      <span className="mt-2 block text-right font-mono text-[10px] text-muted">
        {done ? (isLast ? 'E · tiếp tục ▸' : 'E · tiếp ▸') : 'E · hiện hết'}
      </span>
    </button>
  );
}

/* ── Màn chơi trong văn phòng ──────────────────────────────────────── */

interface OfficePlayProps {
  scenarioKey: string;
  stage: Stage;
  run: RunState;
  scenario: Scenario;
  dispatch: (action: RunAction) => void;
  secondsLeft: number | null;
  onLeave: () => void;
}

/**
 * Cùng một màn chơi với `PlayPage`, nhưng bày ra thành văn phòng đi lại được.
 *
 * Engine không đổi một dòng: mọi hành động vẫn là `dispatch` y hệt khung chat,
 * máy chủ vẫn chạy lại và chấm. Thứ khác đi là *khi nào* hoạt động hiện ra —
 * không phải ngay khi engine bước vào nó, mà khi người chơi đã đi tới đúng
 * người và bấm nói chuyện. Sân khấu (`stage`) quyết định chuyện đó.
 */
export function OfficePlay({
  scenarioKey,
  stage,
  run,
  scenario,
  dispatch,
  secondsLeft,
  onLeave,
}: OfficePlayProps) {
  const world = useMemo(() => parseWorld(stage.map), [stage]);
  const office = useRef<OfficeHandle>(null);

  const [mode, setMode] = useState<Mode>({ kind: 'explore' });
  const [objective, setObjective] = useState('');
  /** NPC nào đang đứng yên — chỉ bắt chuyện được với người đã tới nơi. */
  const [idle, setIdle] = useState<Record<NpcId, boolean>>({ an: true, ha: true });
  /** Với trigger `reach`: đã chạm điểm chưa, NPC đã tới chưa. */
  const [reach, setReach] = useState<'pending' | 'walking' | 'done'>('pending');

  const activity = currentActivity(run, scenario);
  const step = stage.steps[run.activityId];
  const trigger = step?.trigger ?? null;
  const isFollowup = run.phase === 'followup';
  const hintUsed = run.hintsUsed.includes(run.activityId);
  const followupLine = getFollowupLine(scenarioKey, activity.activity_id);

  /* ── Bắt đầu một bước: NPC vào vị trí, người chơi đi tìm ── */
  useEffect(() => {
    if (!step) return;
    for (const [id, placement] of Object.entries(step.moves) as Array<
      [NpcId, NonNullable<typeof step.moves.an>]
    >) {
      office.current?.moveNpc(id, placement);
      setIdle((s) => ({ ...s, [id]: false }));
    }
    setObjective(step.objective);
    setReach('pending');
    setMode({ kind: 'explore' });
  }, [step, run.activityId]);

  /* ── Engine đổi pha: lời kết, chuyện xen ngang, hỏi vặn ── */
  useEffect(() => {
    if (run.phase === 'closing') {
      setMode({
        kind: 'dialogue',
        lines: [
          {
            npc: speakerOf(activity.closing_prompt),
            text: stripNpcPrefix(activity.closing_prompt),
          },
        ],
        index: 0,
        after: 'continue',
      });
      return;
    }
    if (run.phase === 'event' && run.pendingEvent) {
      const event = run.pendingEvent;
      const lines: Line[] = [
        { npc: stage.eventSpeaker[event.event_id] ?? null, text: event.text },
      ];
      if (event.divert_note) {
        // Phần sau "Kéo người chơi…" là ghi chú thiết kế, không phải lời thoại.
        lines.push({ npc: 'an', text: event.divert_note.split('Kéo người chơi')[0].trim() });
      }
      setMode({ kind: 'dialogue', lines, index: 0, after: 'continue' });
      return;
    }
    if (run.phase === 'followup' && followupLine) {
      office.current?.faceNpcToPlayer(followupLine.who as NpcId);
      setMode({
        kind: 'dialogue',
        lines: [{ npc: followupLine.who as NpcId, text: followupLine.text }],
        index: 0,
        after: 'activity',
      });
    }
    // 'main' do hiệu ứng bắt đầu bước lo; 'ended' do PlayPage điều hướng.
  }, [run.phase, run.pendingEvent, run.followupUsed, activity.closing_prompt, followupLine, stage.eventSpeaker]);

  /* ── Bắt chuyện: mở lời dẫn + câu của NPC, rồi tới hoạt động ── */
  const startActivity = useCallback(
    (npc: NpcId | null) => {
      if (npc) office.current?.faceNpcToPlayer(npc);
      setMode({
        kind: 'dialogue',
        lines: openingLines(activity.setup, activity.npc_line, npc),
        index: 0,
        after: 'activity',
      });
    },
    [activity],
  );

  const onTrigger = useCallback(() => {
    if (!trigger) return;
    if (trigger.kind === 'talk') startActivity(trigger.npc);
    else if (trigger.kind === 'use') startActivity(null);
    else if (trigger.kind === 'reach' && reach === 'pending') {
      office.current?.moveNpc(trigger.then.npc, trigger.then.to);
      setIdle((s) => ({ ...s, [trigger.then.npc]: false }));
      setObjective(trigger.then.objective);
      setReach('walking');
    }
  }, [trigger, reach, startActivity]);

  const onNpcArrive = useCallback(
    (id: NpcId) => {
      setIdle((s) => ({ ...s, [id]: true }));
      if (trigger?.kind === 'reach' && reach === 'walking' && trigger.then.npc === id) {
        setReach('done');
        startActivity(id);
      }
    },
    [trigger, reach, startActivity],
  );

  /* ── Thứ có thể tương tác lúc này ── */
  const target: Target = useMemo(() => {
    if (mode.kind !== 'explore' || !trigger) return null;
    if (trigger.kind === 'talk') {
      return idle[trigger.npc]
        ? { kind: 'npc', id: trigger.npc, prompt: `Nói chuyện với ${CHARACTERS[trigger.npc].label}` }
        : null;
    }
    if (trigger.kind === 'use') {
      return { kind: 'spot', id: trigger.spot, prompt: stage.spots[trigger.spot]?.prompt ?? '' };
    }
    return reach === 'pending' ? { kind: 'spot', id: trigger.spot, prompt: '' } : null;
  }, [mode.kind, trigger, idle, reach, stage.spots]);

  const targetMode = trigger?.kind === 'reach' ? 'reach' : 'press';

  /* ── Hội thoại: bấm để qua dòng ── */
  const advanceDialogue = useCallback(() => {
    if (mode.kind !== 'dialogue') return;
    if (mode.index + 1 < mode.lines.length) {
      setMode({ ...mode, index: mode.index + 1 });
      return;
    }
    if (mode.after === 'activity') {
      setMode({ kind: 'activity' });
      return;
    }
    // 'continue': engine đi tiếp; pha mới sẽ đặt lại mode qua hiệu ứng.
    setMode({ kind: 'explore' });
    dispatch({ type: 'CONTINUE' });
  }, [mode, dispatch]);

  useEffect(() => {
    if (mode.kind !== 'dialogue') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Đi qua click để DialogueBox tự xử "đang gõ thì hiện hết trước".
        document.getElementById('office-dialogue')?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode.kind]);

  const index = activityIndex(run, scenario);
  const hint = activity.hints[0];

  return (
    <div className="mx-auto max-w-[900px]">
      <SceneHeader scenario={scenario} />

      <div className="relative overflow-hidden rounded-[12px] border border-line bg-bg">
        <OfficeCanvas
          ref={office}
          world={world}
          stage={stage}
          active={mode.kind === 'explore'}
          target={target}
          targetMode={targetMode}
          onTrigger={onTrigger}
          onNpcArrive={onNpcArrive}
        />

        {/* ── HUD ── */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
          <div className="max-w-[62%] rounded-[8px] border border-line bg-bg/85 px-3 py-2 backdrop-blur-sm">
            <span className="block font-mono text-[9px] uppercase tracking-[0.11em] text-gold-2">
              Việc cần làm
            </span>
            <span className="block text-[12.5px] leading-snug text-ink-2">{objective}</span>
            {target?.prompt && (
              <span className="mt-1 block font-mono text-[10px] text-muted">
                Lại gần rồi bấm <b className="text-ink">E</b> — {target.prompt}
              </span>
            )}
          </div>
          <div className="rounded-[8px] border border-line bg-bg/85 px-3 py-2 text-right font-mono text-[10px] text-muted backdrop-blur-sm">
            <span className="block">
              bước {index + 1}/{scenario.activities.length}
            </span>
            <span className="hidden sm:block">WASD / ←↑↓→ · E</span>
          </div>
        </div>

        {/* ── Hội thoại ── */}
        {mode.kind === 'dialogue' && (
          <DialogueBox
            key={`${mode.index}:${mode.lines[mode.index].text}`}
            line={mode.lines[mode.index]}
            isLast={mode.index + 1 >= mode.lines.length}
            onAdvance={advanceDialogue}
          />
        )}

        {/* ── Hoạt động ── */}
        {mode.kind === 'activity' && (
          <div className="absolute inset-0 overflow-y-auto bg-bg/78 p-3 backdrop-blur-[2px] sm:p-5">
            <div className="reveal mx-auto max-w-[620px] rounded-[12px] border border-line bg-panel p-4 sm:p-5">
              <ObjectiveStrip
                type={activity.type}
                total={scenario.activities.length}
                current={index}
                followup={
                  isFollowup ? { used: run.followupUsed, limit: activity.limitFollowup } : null
                }
              />

              {run.phase === 'main' && activity.quick_action && secondsLeft !== null && (
                <CountdownBar
                  secondsLeft={secondsLeft}
                  totalSeconds={activity.time_limit_seconds ?? 0}
                />
              )}

              {hintUsed && hint && (
                <NpcBubble
                  seed={speakerOf(hint.text) ?? 'an'}
                  name={CHARACTERS[speakerOf(hint.text) ?? 'an'].label}
                  text={stripNpcPrefix(hint.text)}
                />
              )}

              {run.phase === 'main' && activity.input_prompt && activity.type !== 'FREETEXT' && (
                <p className="m-0 mb-4 text-[14px] font-medium leading-relaxed text-ink">
                  {activity.input_prompt}
                </p>
              )}

              {isFollowup ? (
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
                  onMove={(i, direction) => dispatch({ type: 'MOVE_ITEM', index: i, direction })}
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
            </div>
          </div>
        )}

        {/* ── Phím ảo (chỉ màn cảm ứng) ── */}
        {mode.kind === 'explore' && (
          <DPad
            className="absolute inset-x-3 bottom-3 hidden [@media(pointer:coarse)]:flex"
            onPress={(dir) => office.current?.press(dir)}
            onRelease={(dir) => office.current?.release(dir)}
            onInteract={() => office.current?.interact()}
            canInteract={Boolean(target?.prompt)}
          />
        )}
      </div>

      <SkillChips scenario={scenario} />

      <div className="mt-2">
        <Button size="sm" onClick={onLeave}>
          Rời màn chơi
        </Button>
      </div>
    </div>
  );
}
