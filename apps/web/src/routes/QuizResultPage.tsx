import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RankedRole } from '@datn/game-core';
import { FitRadar } from '../components/game/FitRadar';
import { PortraitDescription } from '../components/game/PortraitDescription';
import { StarMap } from '../components/game/StarMap';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Note } from '../components/ui/Note';
import { Pill } from '../components/ui/Pill';
import { usePortrait } from '../hooks/usePortrait';
import { useT } from '../i18n/useT';
import { useGameIndex } from '../store/contentStore';
import { useProfileStore } from '../store/profileStore';

/**
 * "Chân dung" — cuối bài Get to Know Me.
 *
 * Ba phần, theo thứ tự người chơi cần: năm hành tinh nên ghé (FR-10), một
 * đoạn tả cách họ làm việc, và chỉ số xã hội (FR-13). Tám chiều thô gấp lại
 * ở dưới cùng cho ai muốn xem vì sao.
 */
export function QuizResultPage() {
  const navigate = useNavigate();
  const t = useT();
  const fit = useProfileStore((s) => s.fit);
  const content = useGameIndex();
  const { portrait, error, loading } = usePortrait();
  const [showDimensions, setShowDimensions] = useState(false);

  const goToRole = (code: string) => {
    const role = content.findRole(code);
    if (role) navigate(`/jobs/${code}/${role.band_start}`);
  };

  const top = (portrait?.top ?? []).flatMap((match) => {
    const role = content.findRole(match.roleCode);
    if (!role) return [];
    const reasons = match.reasons
      .map((d) => t(`dim.${d}` as Parameters<typeof t>[0]))
      .join(t('quiz.and'));
    return [
      {
        role,
        score: match.score,
        reason: reasons ? t('quiz.because', { reasons }) : undefined,
      } satisfies RankedRole & { reason?: string },
    ];
  });

  return (
    <>
      <PageHeader title={t('quiz.resultTitle')}>{t('quiz.resultLead')}</PageHeader>

      {error && (
        <Note tone="warn" className="mb-4">
          {t('quiz.loadFailed')}: {error}
        </Note>
      )}
      {loading && <p className="text-[13px] text-muted">{t('quiz.loading')}</p>}

      {portrait && (
        <>
          <Card className="mb-4">
            <CardHeader title={t('quiz.topTitle')}>
              <Pill>{t('quiz.topLead')}</Pill>
            </CardHeader>
            <CardBody>
              {top.length > 0 ? (
                <StarMap roles={top} size={86} onSelect={goToRole} />
              ) : (
                <EmptyState icon="?">{t('quiz.empty')}</EmptyState>
              )}
            </CardBody>
          </Card>

          <div className="mb-4">
            <PortraitDescription portrait={portrait} />
          </div>

          <Card className="mb-4">
            <CardHeader title={t('quiz.portrait')}>
              <Pill>{t('quiz.dimensions')}</Pill>
              <Button
                size="sm"
                className="ml-auto"
                aria-expanded={showDimensions}
                onClick={() => setShowDimensions((v) => !v)}
              >
                {t('quiz.showDimensions')}
              </Button>
            </CardHeader>
            {showDimensions && (
              <CardBody>
                <FitRadar fit={fit} />
              </CardBody>
            )}
          </Card>
        </>
      )}

      <Note tone="warn">{t('quiz.caveat')}</Note>

      <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
        <Button variant="primary" onClick={() => navigate('/jobs')}>
          {t('quiz.openMap')}
        </Button>
        <Button onClick={() => navigate('/quiz')}>{t('quiz.retake')}</Button>
      </div>
    </>
  );
}
