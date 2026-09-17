import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findEvent, findRole } from '@datn/game-core';
import { RoleTheme } from '../components/game/RoleTheme';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Note, SectionLabel } from '../components/ui/Note';
import { Pill } from '../components/ui/Pill';
import { useProfileStore } from '../store/profileStore';

const OPTION_KEYS = 'ABCDE';

/**
 * Nhiệm vụ phụ: một tình huống ngắn, vài lựa chọn.
 *
 * Máy khách chỉ gửi lên "đã chọn phương án số mấy"; diễn biến và tín hiệu
 * tính cách do máy chủ tra từ bộ dữ liệu.
 */
export function EventPage() {
  const { roleCode = '', band = '', eventId = '' } = useParams();
  const navigate = useNavigate();
  const answerEvent = useProfileStore((s) => s.answerEvent);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const role = findRole(roleCode);
  const event = role ? findEvent(role, eventId) : undefined;

  if (!role) return <Navigate to="/jobs" replace />;
  if (!event) return <Navigate to={`/jobs/${roleCode}/${band}/tasks`} replace />;

  const choose = async (index: number) => {
    setBusy(true);
    setError(null);
    try {
      await answerEvent(event.event_id, role.role_code, band, index);
      navigate(
        `/jobs/${role.role_code}/${band}/events/${event.event_id}/result?choice=${index}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không ghi nhận được');
    } finally {
      setBusy(false);
    }
  };

  return (
    <RoleTheme roleCode={role.role_code}>
    <Card className="max-w-[640px]">
      <CardHeader title={event.title}>
        {event.measures.map((m) => (
          <Pill key={m}>{m}</Pill>
        ))}
      </CardHeader>
      <CardBody>
        {error && (
          <Note tone="warn" className="mb-3.5">
            {error}
          </Note>
        )}

        <div className="mb-3.5 rounded-[9px] bg-panel p-[15px] text-[14px] leading-relaxed text-ink-2">
          {event.setup}
        </div>

        <SectionLabel>Bạn sẽ làm gì</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {event.choices.map((choice, index) => (
            <button
              key={choice.text}
              type="button"
              disabled={busy}
              onClick={() => void choose(index)}
              className="action-card flex w-full items-start gap-3 rounded-[10px] border border-line bg-surf px-4 py-3.5 text-left text-[13.5px] leading-normal text-ink disabled:opacity-50"
            >
              <span className="keycap mt-px font-mono text-[10px] text-muted">
                {OPTION_KEYS[index]}
              </span>
              <span>{choice.text}</span>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
    </RoleTheme>
  );
}
