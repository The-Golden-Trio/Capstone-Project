import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findRole, findScenarioByKey } from '../../data/indexes';
import { isBandOpen, nextBand, UNLOCK_AT } from '../../domain/bands';
import { pointsEarned, type Evidence } from '../../domain/scenarioEngine';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { cx } from '../../lib/cx';
import { skillPointsAt, useProfileStore } from '../../store/profileStore';
import { useRunStore } from '../../store/runStore';

const ENDING_STYLE: Record<string, string> = {
  GOOD: 'border-good bg-good-soft',
  BAD: 'border-signal bg-signal-soft',
  PARTIAL: 'border-blue bg-panel',
  SECRET: 'border-gold bg-gold-soft',
};

function EvidenceRow({ evidence }: { evidence: Evidence }) {
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

/** Tổng kết màn chơi: kết cục, bằng chứng, điểm, và một câu hỏi ngược lại. */
export function EndingPage() {
  const { scenarioKey = '' } = useParams();
  const navigate = useNavigate();

  const run = useRunStore((s) => s.run);
  const rating = useRunStore((s) => s.rating);
  const setRating = useRunStore((s) => s.setRating);
  const start = useRunStore((s) => s.start);

  const profile = useProfileStore();
  const entry = findScenarioByKey(scenarioKey);

  if (!entry) return <Navigate to="/jobs" replace />;
  // Không có lượt chơi trong bộ nhớ (ví dụ mở thẳng URL) thì quay về nhiệm vụ.
  if (!run || run.scenarioKey !== scenarioKey || !run.ending)
    return <Navigate to={`/play/${scenarioKey}`} replace />;

  const { role_code, band } = entry.scenario.job;
  const role = findRole(role_code);
  const ending = run.ending;

  const good = run.evidence.filter((e) => e.anchor === '+2');
  const bad = run.evidence.filter((e) => e.anchor !== '+2').slice(0, 2);
  const gained = pointsEarned(run);
  const points = skillPointsAt(profile, role_code, band);
  const next = role ? nextBand(role, band) : undefined;
  const unlocked =
    role && next
      ? isBandOpen(role, next, (b) => skillPointsAt(profile, role_code, b))
      : false;

  return (
    <Card className="max-w-[640px]">
      <CardBody>
        <div
          className={cx(
            'mb-[18px] rounded-[11px] border-[1.5px] p-[18px]',
            ENDING_STYLE[ending.type] ?? ENDING_STYLE.GOOD,
          )}
        >
          <p className="m-0 font-display text-[16.5px] leading-relaxed text-ink-2">
            {ending.text}
          </p>
          {ending.reveals && (
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
          <b>+{gained} điểm kỹ năng</b> ở {band}. Tổng đang có: <b>{points}</b>.
          {next &&
            (unlocked ? (
              <>
                {' '}
                Đủ để mở <b className="text-good">{next}</b>.
              </>
            ) : (
              <>
                {' '}
                Cần <b>{UNLOCK_AT}</b> để mở {next}.
              </>
            ))}
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
              Cảm ơn bạn. Đánh giá này dùng để lọc tình huống dở, không ảnh hưởng
              tới kết quả của bạn.
            </p>
          )}
        </div>

        <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={() => navigate('/profile')}>
            Xem hành trang
          </Button>
          <Button
            onClick={() =>
              navigate(
                role ? `/jobs/${role_code}/${band}/tasks` : '/jobs',
              )
            }
          >
            Nhiệm vụ khác
          </Button>
          <Button
            onClick={() => {
              start(scenarioKey);
              navigate(`/play/${scenarioKey}`);
            }}
          >
            Chơi lại
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
