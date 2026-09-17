import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { UNLOCK_AT, findScenarioByKey } from '@datn/game-core';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { cx } from '../../lib/cx';
import type { EvidenceView } from '../../api/schemas';
import { useRunStore } from '../../store/runStore';

const ENDING_STYLE: Record<string, string> = {
  GOOD: 'border-good bg-good-soft',
  BAD: 'border-signal bg-signal-soft',
  PARTIAL: 'border-blue bg-panel',
  SECRET: 'border-gold bg-gold-soft',
};

function EvidenceRow({ evidence }: { evidence: EvidenceView }) {
  return (
    <div className="mb-3">
      <div className="text-[13.5px] leading-relaxed text-ink-2">
        {evidence.why}.
      </div>
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
 * Tổng kết màn chơi — đọc từ kết quả MÁY CHỦ trả về, không phải từ lượt chơi
 * trong bộ nhớ trình duyệt.
 *
 * Máy khách có bản chấm của riêng nó để phản hồi tức thì lúc chơi, nhưng con
 * số hiện ở đây là con số đã vào cơ sở dữ liệu.
 */
export function EndingPage() {
  const { scenarioKey = '' } = useParams();
  const navigate = useNavigate();

  const { result, submitting, error, rating, setRating, start } = useRunStore();
  const entry = findScenarioByKey(scenarioKey);

  if (!entry) return <Navigate to="/jobs" replace />;

  if (submitting || (!result && !error)) {
    return (
      <Card className="max-w-[640px]">
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
      <Card className="max-w-[640px]">
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

  const ending = entry.scenario.endings.find(
    (e) => e.ending_id === result.endingId,
  );
  const { role_code, band } = entry.scenario.job;

  const good = result.evidence.filter((e) => e.anchor === '+2');
  const bad = result.evidence.filter((e) => e.anchor !== '+2').slice(0, 2);

  return (
    <Card className="max-w-[640px]">
      <CardBody>
        <div
          className={cx(
            'mb-[18px] rounded-[11px] border-[1.5px] p-[18px]',
            ENDING_STYLE[result.endingType] ?? ENDING_STYLE.GOOD,
          )}
        >
          <p className="m-0 font-display text-[16.5px] leading-relaxed text-ink-2">
            {ending?.text ?? 'Màn chơi kết thúc.'}
          </p>
          {ending?.reveals && (
            <p className="mt-[13px] border-t border-white/15 pt-[13px] text-[13px] italic leading-relaxed text-ink-2">
              {ending.reveals}
            </p>
          )}
        </div>

        {good.length > 0 && (
          <div className="mb-5">
            <p className="m-0 mb-2.5 font-mono text-[10px] uppercase tracking-[0.09em] text-good">
              Bạn đã làm tốt
            </p>
            {good.map((e, i) => (
              <EvidenceRow key={`${e.activityId}-${e.skill}-${i}`} evidence={e} />
            ))}
          </div>
        )}

        {bad.length > 0 && (
          <div className="mb-5">
            <p className="m-0 mb-2.5 font-mono text-[10px] uppercase tracking-[0.09em] text-signal">
              Lần sau chú ý
            </p>
            {bad.map((e, i) => (
              <EvidenceRow key={`${e.activityId}-${e.skill}-${i}`} evidence={e} />
            ))}
          </div>
        )}

        <Note className="mb-4">
          {result.alreadyScored ? (
            <>
              Lượt chơi lại nên <b>không cộng điểm</b>. Tổng ở {band} vẫn là{' '}
              <b>{result.bandPoints}</b>.
            </>
          ) : (
            <>
              <b>+{result.pointsAwarded} điểm kỹ năng</b> ở {band}. Tổng đang có:{' '}
              <b>{result.bandPoints}</b>.
              {result.unlockedBand ? (
                <>
                  {' '}
                  Đủ để mở <b className="text-good">{result.unlockedBand}</b>.
                </>
              ) : (
                <> Cần <b>{UNLOCK_AT}</b> để mở cấp bậc kế.</>
              )}
            </>
          )}
        </Note>

        <div className="mt-1 border-t border-line-2 pt-[18px]">
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
                  'border-none bg-transparent px-0.5 text-[24px] leading-none',
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

        <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={() => navigate('/profile')}>
            Xem hành trang
          </Button>
          <Button onClick={() => navigate(`/jobs/${role_code}/${band}/tasks`)}>
            Nhiệm vụ khác
          </Button>
          <Button
            onClick={() => {
              void start(scenarioKey).then((ok) => {
                if (ok) navigate(`/play/${scenarioKey}`);
              });
            }}
          >
            Chơi lại
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
