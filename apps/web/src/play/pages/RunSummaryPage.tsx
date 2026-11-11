import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { useCountUp } from '../../hooks/useCountUp';
import { useProgressStore } from '../../store/progressStore';
import { cx } from '../../lib/cx';
import { getPlayApi, PLAY_API_MODE, PLAY_HOME } from '../api/playApi';
import type { ScenarioSummary } from '../api/types';
import { usePlaySession } from '../store/playSession';
import { scenarioKeyOf, useRunScreen } from './useRunScreen';

/** Kết cục nói bằng lời người chơi hiểu. Cùng bộ màu với màn kết cũ. */
const ENDING: Record<string, { label: string; frame: string; tone: string }> = {
  GOOD: {
    label: 'Xong việc',
    frame: 'border-good bg-good-soft',
    tone: 'text-good',
  },
  BAD: {
    label: 'Hỏng việc',
    frame: 'border-signal bg-signal-soft',
    tone: 'text-signal',
  },
  PARTIAL: {
    label: 'Tạm ổn',
    frame: 'border-blue bg-panel',
    tone: 'text-blue',
  },
  SECRET: {
    label: 'Nhìn ra điều ít ai thấy',
    frame: 'border-gold bg-gold-soft',
    tone: 'text-gold-2',
  },
};

/** NFR-07: nói rõ nhận xét do ai soạn. */
const DISCLOSURE =
  PLAY_API_MODE === 'mock'
    ? 'Bản demo: nhận xét ghép từ mốc chấm do chuyên gia soạn, chưa qua AI; câu tự luận chấm giả lập bằng từ khoá.'
    : 'Câu tự luận do AI chấm và nhận xét do AI soạn, dựa trên tiêu chí của chuyên gia nghề.';

const lines = (text: string | undefined) =>
  (text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

/**
 * E12 — Tổng kết (FR-14, SD-02). Tách riêng ba phần: Kết quả (đạt tới đâu),
 * Nhận xét (vì sao), Gợi ý (lần sau làm gì).
 */
export function RunSummaryPage() {
  const { runId = '' } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ScenarioSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { scenario } = useRunScreen(runId, { listen: false });

  useEffect(() => {
    getPlayApi()
      .getRunSummary(runId)
      .then((result) => {
        setSummary(result);
        // Máy chủ vừa ghi điểm và có thể đã mở cấp mới: nạp lại tiến độ để
        // thanh điểm và bản đồ thấy ngay, không phải tải lại trang.
        if (PLAY_API_MODE === 'http') void useProgressStore.getState().load();
      })
      .catch(() => setError('Chưa có tổng kết cho lượt chơi này.'));
  }, [runId]);

  const expertise = useCountUp(summary?.pointsEarned?.expertise ?? 0);
  const softSkill = useCountUp(summary?.pointsEarned?.softSkill ?? 0);

  if (error) {
    return (
      <Card className="mx-auto max-w-[720px]">
        <CardBody>
          <Note tone="warn" className="mb-4">
            {error}
          </Note>
          <Button variant="primary" onClick={() => navigate(`/run/${runId}`)}>
            Về màn giới thiệu
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!summary) {
    return (
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Đang mở tổng kết…
      </p>
    );
  }

  const style = ENDING[summary.ending?.type ?? 'GOOD'] ?? ENDING.GOOD;
  const replay = () => {
    usePlaySession.getState().reset();
    navigate(scenario ? `/quest/${scenarioKeyOf(scenario)}` : PLAY_HOME);
  };

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="m-0 mb-3 font-display text-[19px] font-semibold">
        {summary.scenarioTitle}
      </h1>

      {/* ── Kết cục ── */}
      <div
        className={cx(
          'reveal mb-4 rounded-[12px] border-[1.5px] p-5',
          style.frame,
        )}
      >
        <p
          className={cx(
            'm-0 mb-2 font-mono text-[10px] uppercase tracking-[0.11em]',
            style.tone,
          )}
        >
          {style.label}
        </p>
        <p className="m-0 font-display text-[16.5px] leading-relaxed text-ink-2">
          {summary.ending?.text}
        </p>
        {summary.ending?.reveals && (
          <p className="mt-3.5 border-t border-white/15 pt-3.5 text-[13px] italic leading-relaxed text-ink-2">
            {summary.ending.reveals}
          </p>
        )}
      </div>

      {/* ── Kết quả ── */}
      <Section title="Kết quả" tone="text-gold-2">
        <p className="m-0 mb-4 text-[13.5px] leading-relaxed text-ink-2">
          {summary.result}
        </p>
        <div className="flex flex-wrap gap-6">
          <Stat
            label="Chuyên môn"
            value={`+${expertise}`}
            tone="text-skill-hard"
          />
          <Stat
            label="Kỹ năng mềm"
            value={`+${softSkill}`}
            tone="text-skill-soft"
          />
          <Stat
            label="Gợi ý đã xem"
            value={String(summary.hintsUsed ?? 0)}
            tone="text-ink-2"
          />
        </div>
        <p className="m-0 mt-3 text-[11.5px] text-muted">
          Xem gợi ý không trừ điểm; con số này chỉ để bạn tự theo dõi.
        </p>
      </Section>

      {/* ── Nhận xét ── */}
      <Section title="Nhận xét" tone="text-good">
        <ul className="m-0 list-none p-0">
          {lines(summary.feedback).map((line, i) => (
            <li
              key={i}
              className="reveal mb-2.5 border-l-2 border-line pl-3 text-[13.5px] leading-relaxed text-ink-2"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {line}
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Gợi ý ── */}
      <Section title="Gợi ý cho lần sau" tone="text-signal">
        <ul className="m-0 list-none p-0">
          {lines(summary.guidance).map((line, i) => (
            <li
              key={i}
              className="mb-2.5 text-[13.5px] leading-relaxed text-ink-2"
            >
              {line}
            </li>
          ))}
        </ul>
      </Section>

      <p className="mb-4 font-mono text-[10px] leading-snug text-muted">
        {DISCLOSURE}
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="primary" onClick={replay}>
          Chơi lại
        </Button>
        <Button onClick={() => navigate(PLAY_HOME)}>
          {PLAY_API_MODE === 'mock' ? 'Về trang chủ' : 'Nhiệm vụ khác'}
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-4">
      <CardBody>
        <h2
          className={cx(
            'm-0 mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em]',
            tone,
          )}
        >
          {title}
        </h2>
        {children}
      </CardBody>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div>
      <span className="block font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
        {label}
      </span>
      <span
        className={cx(
          'block font-display text-[28px] font-bold leading-none tabular-nums',
          tone,
        )}
      >
        {value}
      </span>
    </div>
  );
}
