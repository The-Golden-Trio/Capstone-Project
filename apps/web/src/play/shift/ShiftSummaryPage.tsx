/**
 * Tổng kết cuối ca, kể theo truyện. CHƯA CHẤM ĐIỂM: seed mẫu chưa có
 * `observes`, kết cục chưa chốt, AI-5 chưa chấm ca làm.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note, SectionLabel } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { getShiftApi, type ShiftSummary } from './shiftApi';

const NODE_LABEL: Record<string, string> = {
  open: 'Mở đầu',
  mid: 'Giữa ca',
  end: 'Kết ca',
};
const PROMISE_LABEL: Record<string, string> = {
  kept: 'đã giữ lời',
  late: 'trễ hẹn',
  carried: 'còn treo khi hết ca',
  open: 'đang hẹn',
};

export function ShiftSummaryPage() {
  const { runId = '' } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getShiftApi()
      .summary(runId)
      .then(setSummary)
      .catch(() => setError('Chưa có tổng kết: ca có thể chưa kết thúc.'));
  }, [runId]);

  if (error)
    return (
      <Card className="mx-auto max-w-[760px]">
        <CardBody>
          <Note tone="warn" className="mb-3">
            {error}
          </Note>
          <Button onClick={() => navigate(`/shift-run/${runId}`)}>
            Về màn chơi
          </Button>
        </CardBody>
      </Card>
    );
  if (!summary) return <p className="text-muted">Đang tải tổng kết…</p>;

  return (
    <Card className="mx-auto max-w-[760px]">
      <CardBody>
        <h1 className="m-0 font-display text-[22px] font-bold text-ink">
          {summary.title}
        </h1>
        <p className="m-0 mt-1 text-[13px] text-ink-2">
          Hết ca lúc {summary.endedAt} · {summary.goal}
        </p>
        <Note tone="info" className="my-4">
          Đây là bản kể lại ca làm, chưa có điểm: phần chấm sẽ có sau.
        </Note>

        <SectionLabel>Các mốc trong ca</SectionLabel>
        <ul className="m-0 mb-4 mt-1.5 flex list-none flex-col gap-1.5 p-0 text-[14px] text-ink-2">
          {summary.nodes.map((n) => (
            <li key={n.id}>
              <span className="mr-2 text-[12px] text-muted">
                {n.time ?? '—'}
              </span>
              {NODE_LABEL[n.kind] ?? n.kind}
              {n.choice && <> · bạn chọn: “{n.choice}”</>}
              {n.timedOut && (
                <Pill tone="signal" className="ml-2">
                  không kịp trả lời
                </Pill>
              )}
              {n.approved === true && (
                <Pill tone="good" className="ml-2">
                  được duyệt
                </Pill>
              )}
              {n.approved === false && (
                <Pill tone="neutral" className="ml-2">
                  chưa được duyệt
                </Pill>
              )}
              {n.status === 'skipped' && (
                <Pill tone="locked" className="ml-2">
                  chưa tới
                </Pill>
              )}
            </li>
          ))}
        </ul>

        <SectionLabel>Bạn đã làm</SectionLabel>
        <ul className="m-0 mb-4 mt-1.5 flex list-none flex-col gap-1 p-0 text-[13px] text-ink-2">
          {summary.actions.map((a, i) => (
            <li key={`${a.time}-${i}`}>
              <span className="mr-2 text-[12px] text-muted">{a.time}</span>
              {a.label}
              {a.cut && <span className="text-muted"> (bị chen ngang)</span>}
            </li>
          ))}
        </ul>

        <SectionLabel>Điều bạn đã tìm ra</SectionLabel>
        <ul className="m-0 mb-1 mt-1.5 flex list-none flex-col gap-1 p-0 text-[13px] text-ink-2">
          {summary.facts.found.map((f, i) => (
            <li key={i}>
              <span className="mr-2 text-[12px] text-muted">{f.time}</span>
              {f.text}
            </li>
          ))}
        </ul>
        {summary.facts.requiredMissed > 0 && (
          <p className="m-0 mb-4 text-[12.5px] text-muted">
            Còn {summary.facts.requiredMissed} điều quan trọng bạn chưa tìm ra.
          </p>
        )}

        {summary.promises.length > 0 && (
          <>
            <SectionLabel>Lời hứa</SectionLabel>
            <ul className="m-0 mb-4 mt-1.5 flex list-none flex-col gap-1 p-0 text-[13px] text-ink-2">
              {summary.promises.map((p, i) => (
                <li key={i}>
                  {p.label} · {PROMISE_LABEL[p.status] ?? p.status}
                </li>
              ))}
            </ul>
          </>
        )}

        <SectionLabel>Những người trong ca</SectionLabel>
        <ul className="m-0 mb-4 mt-1.5 flex list-none flex-col gap-1 p-0 text-[13px] text-ink-2">
          {summary.concerns.map((c, i) => (
            <li key={i}>
              {c.person}: {c.text}{' '}
              <Pill tone={c.resolved ? 'good' : 'neutral'}>
                {c.resolved ? 'đã yên tâm' : 'vẫn còn lo'}
              </Pill>
            </li>
          ))}
        </ul>

        {summary.review.length > 0 && (
          <>
            <SectionLabel>Nhìn lại ca</SectionLabel>
            {summary.review.map((r, i) => (
              <div key={i} className="mb-3 mt-1.5 text-[13px]">
                <p className="m-0 text-ink">
                  {r.person}: {r.question}
                </p>
                <p className="m-0 text-ink-2">Bạn: {r.answer}</p>
              </div>
            ))}
          </>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={() => navigate('/jobs')}>
            Về bản đồ nghề
          </Button>
          <Button onClick={() => navigate(`/shift-run/${runId}`)}>
            Xem lại lời thoại
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
