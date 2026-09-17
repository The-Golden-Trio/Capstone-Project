import { useNavigate } from 'react-router-dom';
import { UNLOCK_AT, eventsForRole, findScenario, nextBand, type Role } from '@datn/game-core';
import { Note, SectionLabel } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { XpBar } from '../../components/ui/Progress';
import { cx } from '../../lib/cx';
import { isEventDone, useProfileStore } from '../../store/profileStore';
import {
  bandPoints,
  isBandUnlocked,
  useProgressStore,
} from '../../store/progressStore';

interface QuestCardProps {
  main?: boolean;
  done: boolean;
  tags: React.ReactNode;
  title: string;
  meta: string;
  onClick: () => void;
}

function QuestCard({ main, done, tags, title, meta, onClick }: QuestCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'action-card mb-2.5 block w-full rounded-[10px] border border-line bg-surf px-4 py-3.5 text-left text-ink',
        main && 'border-[var(--accent)]/40',
        done && 'opacity-50',
      )}
    >
      <div className="mb-[7px] flex flex-wrap items-center gap-[7px]">{tags}</div>
      <p className="m-0 mb-[5px] text-[14.5px] font-semibold leading-snug">
        {title}
      </p>
      <p className="m-0 font-mono text-[10.5px] text-muted">{meta}</p>
    </button>
  );
}

/** "Nhiệm vụ": một nhiệm vụ chính (nếu đã dựng) và các nhiệm vụ phụ. */
/** "Nhiệm vụ": một nhiệm vụ chính (nếu đã dựng) và các nhiệm vụ phụ. */
export function TasksTab({ role, band }: { role: Role; band: string }) {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const { summary, runs } = useProgressStore();

  const entry = findScenario(role.role_code, band);
  const events = eventsForRole(role);
  const points = bandPoints(summary, role.role_code, band);
  const next = nextBand(role, band);

  // Nhiệm vụ chính coi là đã chơi khi máy chủ có lượt chơi hoàn thành cho nó.
  const playedScenario = new Set(runs.map((r) => r.scenarioKey));

  return (
    <>
      {!entry && (
        <Note tone="warn" className="mb-4">
          Hành tinh này <b>chưa có nhiệm vụ chính</b>, nên làm nhiệm vụ phụ vẫn
          vẽ được chân dung nhưng <b>chưa lên cấp bậc được</b>. Trong bản demo
          mới Back-end có nhiệm vụ chính.
        </Note>
      )}

      {next && (
        <div className="mb-[18px]">
          <XpBar
            from={band}
            to={next}
            points={points}
            goal={UNLOCK_AT}
            unlocked={isBandUnlocked(summary, role.role_code, next)}
          />
        </div>
      )}

      {entry && (
        <>
          <SectionLabel>Nhiệm vụ chính — nơi duy nhất có điểm kỹ năng</SectionLabel>
          <QuestCard
            main
            done={playedScenario.has(entry.key)}
            tags={
              <>
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-[3px] font-mono text-[9.5px] tracking-[0.05em] text-[var(--accent)]">NHIỆM VỤ CHÍNH</span>
                <Pill>{entry.scenario.context.scenario_archetype}</Pill>
                {playedScenario.has(entry.key) && (
                  <Pill tone="good">đã chơi</Pill>
                )}
              </>
            }
            title={entry.scenario.scenario_title}
            meta={`≈ ${entry.scenario.context.estimated_minutes} phút · ${
              entry.scenario.activities.length
            } activity · ${entry.scenario.activities
              .map((a) => a.type.toLowerCase())
              .join(' → ')}`}
            onClick={() => navigate(`/play/${entry.key}`)}
          />
        </>
      )}

      <SectionLabel className="mt-5">
        Nhiệm vụ phụ — hé lộ tính cách · {events.length} việc
      </SectionLabel>
      {events.map((event) => (
        <QuestCard
          key={event.event_id}
          done={isEventDone(profile.doneEventIds, event.event_id)}
          tags={
            <>
              {event.measures.map((m) => (
                <Pill key={m}>{m}</Pill>
              ))}
              {!event.role_code && <Pill>mọi nghề</Pill>}
              {isEventDone(profile.doneEventIds, event.event_id) && (
                <Pill tone="good">đã chơi</Pill>
              )}
            </>
          }
          title={event.title}
          meta="≈ 2 phút"
          onClick={() =>
            navigate(`/jobs/${role.role_code}/${band}/events/${event.event_id}`)
          }
        />
      ))}
    </>
  );
}
