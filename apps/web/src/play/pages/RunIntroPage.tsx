import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RoleTheme } from '../../components/game/RoleTheme';
import { CastRail } from '../../components/play/CastRail';
import { SceneHeader } from '../../components/play/SceneHeader';
import { SkillChips } from '../../components/play/SkillChips';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Note } from '../../components/ui/Note';
import { PLAY_HOME } from '../api/playApi';
import { usePlaySession, useReleaseStore } from '../store/playSession';
import { useRunScreen } from './useRunScreen';

/**
 * E10 — Giới thiệu kịch bản (FR-09): bạn là ai, chuyện gì đang xảy ra. Bối
 * cảnh chi tiết (vai, đội, tình huống, cái giá) chỉ mở khi người chơi muốn.
 */
export function RunIntroPage() {
  const { runId = '' } = useParams();
  const navigate = useNavigate();
  const { run, scenario } = useRunScreen(runId, { listen: false });
  const error = usePlaySession((s) => s.error);
  const releaseError = useReleaseStore((s) => s.error);
  const [showContext, setShowContext] = useState(false);

  if (error || releaseError) {
    return (
      <Card className="mx-auto max-w-[720px]">
        <CardBody>
          <Note tone="warn">{error ?? releaseError}</Note>
        </CardBody>
      </Card>
    );
  }

  if (!run || !scenario) {
    return (
      <p className="text-center font-label text-[11px] uppercase tracking-[0.16em] text-muted">
        Đang mở kịch bản…
      </p>
    );
  }

  const finished = run.status === 'FINISHED';
  const firstKey = scenario.activities[0]?.activity_id;
  const resumed = !finished && run.currentActivityKey !== firstKey;

  return (
    <RoleTheme roleCode={scenario.job.role_code}>
      <div className="mx-auto max-w-[760px]">
        <SceneHeader scenario={scenario} />

        <Card className="mb-4">
          <CardBody>
            <p className="m-0 mb-2 font-label text-[10px] uppercase tracking-[0.16em] text-gold-2">
              Bạn là ai
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-relaxed text-ink-2">
              {run.intro}
            </p>

            {showContext ? (
              <dl className="reveal m-0 mb-4 grid gap-3 text-[13px] leading-relaxed">
                {(
                  [
                    ['Vai trò', run.context?.role],
                    ['Ở đây có', run.context?.team],
                    ['Tình huống', run.context?.situation],
                    ['Được mất', run.context?.stakes],
                  ] as const
                ).map(
                  ([label, value]) =>
                    value && (
                      <div key={label}>
                        <dt className="mb-0.5 font-label text-[10px] uppercase tracking-[0.1em] text-muted">
                          {label}
                        </dt>
                        <dd className="m-0 whitespace-pre-line text-ink-2">
                          {value}
                        </dd>
                      </div>
                    ),
                )}
              </dl>
            ) : (
              <button
                type="button"
                onClick={() => setShowContext(true)}
                className="mb-4 text-[12.5px] text-[var(--accent)] underline decoration-dotted underline-offset-2"
              >
                Xem bối cảnh chi tiết
              </button>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              {finished ? (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/run/${runId}/summary`)}
                >
                  Xem kết quả
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/run/${runId}/play`)}
                >
                  {resumed ? 'Chơi tiếp chỗ đang dở' : 'Vào việc'}
                </Button>
              )}
              <span className="text-[12px] text-muted">
                Khoảng {scenario.context.estimated_minutes} phút · không đếm giờ
              </span>
            </div>
          </CardBody>
        </Card>

        <CastRail scenario={scenario} />
        <SkillChips scenario={scenario} />

        <p className="mt-4 text-[12px] text-muted">
          <Link
            to={PLAY_HOME}
            className="underline decoration-dotted underline-offset-2"
          >
            Rời nhiệm vụ
          </Link>{' '}
          — tiến độ được giữ lại, lần sau mở lại sẽ chơi tiếp.
        </p>
      </div>
    </RoleTheme>
  );
}
