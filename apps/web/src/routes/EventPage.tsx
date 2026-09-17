import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findEvent, findRole } from '../data/indexes';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/Note';
import { useProfileStore } from '../store/profileStore';

const OPTION_KEYS = 'ABCDE';

/** Nhiệm vụ phụ: một tình huống ngắn, ba lựa chọn, không chấm điểm kỹ năng. */
export function EventPage() {
  const { roleCode = '', band = '', eventId = '' } = useParams();
  const navigate = useNavigate();
  const applyFit = useProfileStore((s) => s.applyFit);
  const completeTask = useProfileStore((s) => s.completeTask);

  const role = findRole(roleCode);
  const event = role ? findEvent(role, eventId) : undefined;

  if (!role) return <Navigate to="/jobs" replace />;
  if (!event) return <Navigate to={`/jobs/${roleCode}/${band}/tasks`} replace />;

  const choose = (index: number) => {
    applyFit(event.choices[index].signal);
    completeTask(role.role_code, band, event.event_id, { countsAsEvent: true });
    navigate(
      `/jobs/${role.role_code}/${band}/events/${event.event_id}/result?choice=${index}`,
    );
  };

  return (
    <Card className="max-w-[640px]">
      <CardHeader title={event.title}>
        {event.measures.map((m) => (
          <Pill key={m}>{m}</Pill>
        ))}
      </CardHeader>
      <CardBody>
        <div className="mb-3.5 rounded-[9px] bg-panel p-[15px] text-[14px] leading-relaxed text-ink-2">
          {event.setup}
        </div>

        <SectionLabel>Bạn sẽ làm gì</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {event.choices.map((choice, index) => (
            <button
              key={choice.text}
              type="button"
              onClick={() => choose(index)}
              className="flex w-full gap-[11px] rounded-[9px] border border-line bg-surf px-[15px] py-[13px] text-left text-[13.5px] leading-normal text-ink transition-colors hover:border-gold"
            >
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {OPTION_KEYS[index]}
              </span>
              <span>{choice.text}</span>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
