import { useNavigate } from 'react-router-dom';
import { findRole, rankRoles } from '@datn/game-core';
import { FitRadar } from '../components/game/FitRadar';
import { StarMap } from '../components/game/StarMap';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Note } from '../components/ui/Note';
import { Pill } from '../components/ui/Pill';
import { useProfileStore } from '../store/profileStore';
import { useT } from '../i18n/useT';

export function QuizResultPage() {
  const navigate = useNavigate();
  const t = useT();
  const fit = useProfileStore((s) => s.fit);
  const top = rankRoles(fit).slice(0, 3);

  const goToRole = (code: string) => {
    const role = findRole(code);
    if (role) navigate(`/jobs/${code}/${role.band_start}`);
  };

  return (
    <>
      <PageHeader title={t('quiz.resultTitle')}>{t('quiz.resultLead')}</PageHeader>

      <StarMap roles={top} size={86} onSelect={goToRole} className="mb-[18px]" />

      <Card className="mb-4">
        <CardHeader title={t('quiz.portrait')}>
          <Pill>{t('quiz.dimensions')}</Pill>
        </CardHeader>
        <CardBody>
          <FitRadar fit={fit} />
        </CardBody>
      </Card>

      <Note tone="warn">
        Sáu câu thì chưa đủ để kết luận về tính cách. Đây là gợi ý hướng khám
        phá, không phải kết quả đo. Bộ câu hỏi tự soạn, chưa kiểm định — ghi rõ
        trong <code className="font-mono text-[11px]">shared/fit_quiz.json</code>.
      </Note>

      <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
        <Button variant="primary" onClick={() => navigate('/jobs')}>
          {t('quiz.openMap')}
        </Button>
      </div>
    </>
  );
}
