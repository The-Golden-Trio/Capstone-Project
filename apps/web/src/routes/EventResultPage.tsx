import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { findEvent, findRole } from '@datn/game-core';
import { SignalList } from '../components/game/FitRadar';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Note, SectionLabel, SourceNote } from '../components/ui/Note';

/**
 * Kết quả một nhiệm vụ phụ. Lựa chọn nằm trong query string nên trang này
 * mở lại được, không phụ thuộc state trong bộ nhớ.
 */
export function EventResultPage() {
  const { roleCode = '', band = '', eventId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const role = findRole(roleCode);
  const event = role ? findEvent(role, eventId) : undefined;
  const choiceIndex = Number(params.get('choice'));
  const choice = event?.choices[choiceIndex];

  if (!role) return <Navigate to="/jobs" replace />;
  if (!event || !choice)
    return <Navigate to={`/jobs/${roleCode}/${band}/tasks`} replace />;

  return (
    <Card className="max-w-[640px]">
      <CardBody>
        <h2 className="mb-3.5 font-display text-[19px] font-semibold">
          {event.title}
        </h2>

        <Note className="mb-4">
          <b>Bạn chọn:</b> {choice.text}
        </Note>

        <div className="rounded-r-[9px] border-l-[3px] border-l-gold bg-panel p-[15px] text-[14px] leading-relaxed text-ink-2">
          {choice.outcome}
        </div>

        <SectionLabel className="mt-5">Lựa chọn này nói lên</SectionLabel>
        <SignalList signal={choice.signal} />

        <SourceNote className="mt-4">
          Nguồn sự kiện: {event.evidence_level ?? 'C_INFERRED'}
          {event.source_note ? ` — ${event.source_note}` : ''}
        </SourceNote>

        <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            onClick={() => navigate(`/jobs/${role.role_code}/${band}/tasks`)}
          >
            Nhiệm vụ khác
          </Button>
          <Button onClick={() => navigate('/profile')}>Hành trang</Button>
        </div>
      </CardBody>
    </Card>
  );
}
