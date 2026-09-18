import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  UNLOCK_AT,
  findScenarioByKey,
  pointsByType,
  type SkillType,
} from '@datn/game-core';
import { RoleTheme } from '../../components/game/RoleTheme';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { cx } from '../../lib/cx';
import type { EvidenceView } from '../../api/schemas';
import { useCountUp } from '../../hooks/useCountUp';
import { useProgressStore } from '../../store/progressStore';
import { useRunStore } from '../../store/runStore';

/** Kết cục nói bằng lời người chơi hiểu, thay cho GOOD / BAD / SECRET. */
const ENDING: Record<string, { label: string; frame: string; tone: string }> = {
  GOOD: { label: 'Xong việc', frame: 'border-good bg-good-soft', tone: 'text-good' },
  BAD: { label: 'Hỏng việc', frame: 'border-signal bg-signal-soft', tone: 'text-signal' },
  PARTIAL: { label: 'Tạm ổn', frame: 'border-blue bg-panel', tone: 'text-blue' },
  SECRET: { label: 'Nhìn ra điều ít ai thấy', frame: 'border-gold bg-gold-soft', tone: 'text-gold-2' },
};

const ANCHOR_TONE: Record<string, string> = {
  '+2': 'text-good',
  '0': 'text-muted',
  '-1': 'text-signal',
};

/** Cùng bộ màu với `SkillChips` lúc đang chơi — nhìn là biết cứng hay mềm. */
const SKILL_TONE: Record<SkillType, string> = {
  hard: 'text-skill-hard',
  soft: 'text-skill-soft',
};

function EvidenceRow({
  evidence,
  delayMs,
}: {
  evidence: EvidenceView;
  delayMs: number;
}) {
  return (
    <div className="reveal mb-3" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="mb-0.5 flex flex-wrap items-baseline gap-2">
        <span
          className={cx(
            'font-mono text-[11px] font-bold',
            ANCHOR_TONE[evidence.anchor],
          )}
        >
          {evidence.anchor}
        </span>
        <span className={cx('font-mono text-[10.5px]', SKILL_TONE[evidence.skillType])}>
          {evidence.skill}
        </span>
      </div>
      <div className="text-[13.5px] leading-relaxed text-ink-2">{evidence.why}.</div>
      {evidence.quote && (
        <div className="mt-[5px] border-l-2 border-line pl-[11px] text-[12.5px] italic leading-relaxed text-muted [overflow-wrap:anywhere]">
          “{evidence.quote.slice(0, 130)}
          {evidence.quote.length > 130 ? '…' : ''}”
        </div>
      )}
    </div>
  );
}

/**
 * Màn tổng kết — phần thưởng của cả lượt chơi.
 *
 * Số liệu vẫn lấy từ kết quả MÁY CHỦ chấm (`result`), không phải từ lượt chơi
 * trong bộ nhớ. Thay đổi ở đây là cách bày: bằng chứng hiện lần lượt để đọc
 * kịp, điểm đếm lên thay vì nhảy thẳng, và mở cấp bậc là một khoảnh khắc
 * riêng chứ không còn là một câu nằm lẫn trong khối ghi chú.
 */
export function EndingPage() {
  const { scenarioKey = '' } = useParams();
  const navigate = useNavigate();

  const { result, submitting, error, rating, setRating, start } = useRunStore();
  const loadProgress = useProgressStore((s) => s.load);

  // Máy chủ vừa chấm xong: hỏi lại tiến trình để thanh kinh nghiệm dưới đáy
  // nhích lên đúng lúc người chơi đang nhìn vào điểm mình vừa được.
  const scored = result?.runId ?? null;
  useEffect(() => {
    if (scored) void loadProgress();
  }, [scored, loadProgress]);
  const entry = findScenarioByKey(scenarioKey);
  const points = useCountUp(result?.pointsAwarded ?? 0);

  if (!entry) return <Navigate to="/jobs" replace />;

  if (submitting || (!result && !error)) {
    return (
      <Card className="mx-auto max-w-[720px]">
        <CardBody>
          <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Đang chấm ở máy chủ…
          </p>
        </CardBody>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="mx-auto max-w-[720px]">
        <CardBody>
          <Note tone="warn" className="mb-4">
            {error ?? 'Không nhận được kết quả từ máy chủ.'}
          </Note>
          <Button variant="primary" onClick={() => navigate('/jobs')}>
            Về bản đồ
          </Button>
        </CardBody>
      </Card>
    );
  }

  const ending = entry.scenario.endings.find((e) => e.ending_id === result.endingId);
  const { role_code, band } = entry.scenario.job;
  const style = ENDING[result.endingType] ?? ENDING.GOOD;

  const good = result.evidence.filter((e) => e.anchor === '+2');
  const bad = result.evidence.filter((e) => e.anchor !== '+2').slice(0, 2);
  // Điểm lượt này tách cứng / mềm. Lượt chơi lại không cộng gì nên không tách.
  const byType = result.alreadyScored ? null : pointsByType(result.evidence);

  return (
    <RoleTheme roleCode={role_code}>
      <div className="mx-auto max-w-[720px]">
        {/* ── Kết cục ── */}
        <div className={cx('reveal mb-4 rounded-[12px] border-[1.5px] p-5', style.frame)}>
          <p
            className={cx(
              'm-0 mb-2 font-mono text-[10px] uppercase tracking-[0.11em]',
              style.tone,
            )}
          >
            {style.label}
          </p>
          <p className="m-0 font-display text-[16.5px] leading-relaxed text-ink-2">
            {ending?.text ?? 'Màn chơi kết thúc.'}
          </p>
          {ending?.reveals && (
            <p className="mt-3.5 border-t border-white/15 pt-3.5 text-[13px] italic leading-relaxed text-ink-2">
              {ending.reveals}
            </p>
          )}
        </div>

        {/* ── Phần thưởng ── */}
        <div
          className={cx(
            'mb-4 flex flex-wrap items-center gap-4 rounded-[12px] border p-5',
            result.unlockedBand
              ? 'level-up border-good bg-good-soft'
              : 'border-line bg-[var(--accent-soft)]',
          )}
        >
          <div>
            <span className="block font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
              Điểm kỹ năng
            </span>
            <span className="block font-display text-[34px] font-bold leading-none tabular-nums text-[var(--accent)]">
              {result.alreadyScored ? '0' : `+${points}`}
            </span>
            {byType && (
              <span className="mt-1.5 block font-mono text-[10.5px] tabular-nums">
                <span className={SKILL_TONE.hard}>+{byType.hard} cứng</span>
                <span className="text-muted"> · </span>
                <span className={SKILL_TONE.soft}>+{byType.soft} mềm</span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink-2">
            {result.alreadyScored ? (
              <>
                Lượt chơi lại nên không cộng điểm. Tổng ở {band} vẫn là{' '}
                <b>{result.bandPoints}</b>.
              </>
            ) : result.unlockedBand ? (
              <>
                <b className="text-good">Mở được {result.unlockedBand}.</b> Tổng ở{' '}
                {band}: <b>{result.bandPoints}</b> điểm.
              </>
            ) : (
              <>
                Tổng ở {band}: <b>{result.bandPoints}</b> điểm. Cần{' '}
                <b>{UNLOCK_AT}</b> để mở cấp bậc kế.
              </>
            )}
          </div>
        </div>

        <Card className="mb-4">
          <CardBody>
            {good.length > 0 && (
              <div className="mb-5">
                <p className="m-0 mb-2.5 font-mono text-[10px] uppercase tracking-[0.09em] text-good">
                  Bạn đã làm tốt
                </p>
                {good.map((e, i) => (
                  <EvidenceRow
                    key={`${e.activityId}-${e.skill}-${i}`}
                    evidence={e}
                    delayMs={i * 110}
                  />
                ))}
              </div>
            )}

            {bad.length > 0 && (
              <div>
                <p className="m-0 mb-2.5 font-mono text-[10px] uppercase tracking-[0.09em] text-signal">
                  Lần sau chú ý
                </p>
                {bad.map((e, i) => (
                  <EvidenceRow
                    key={`${e.activityId}-${e.skill}-${i}`}
                    evidence={e}
                    delayMs={(good.length + i) * 110}
                  />
                ))}
              </div>
            )}

            <div className="mt-5 border-t border-line-2 pt-[18px]">
              <p className="m-0 mb-2.5 text-[13.5px] font-medium">
                Tình huống này có giống thực tế không?
              </p>
              <div className="flex gap-[5px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} sao`}
                    aria-pressed={star <= rating}
                    className={cx(
                      'border-none bg-transparent px-0.5 text-[24px] leading-none transition-transform hover:scale-110',
                      star <= rating ? 'text-gold' : 'text-line',
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="m-0 mt-2.5 text-[12.5px] text-muted">
                  Cảm ơn bạn. Đánh giá này dùng để lọc tình huống dở, không ảnh
                  hưởng tới kết quả của bạn.
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={() => navigate('/profile')}>
            Xem hành trang
          </Button>
          <Button onClick={() => navigate(`/jobs/${role_code}/${band}`)}>
            Nhiệm vụ khác
          </Button>
          <Button
            onClick={() => {
              void start(scenarioKey).then((okToPlay) => {
                if (okToPlay) navigate(`/play/${scenarioKey}`);
              });
            }}
          >
            Chơi lại
          </Button>
        </div>
      </div>
    </RoleTheme>
  );
}
