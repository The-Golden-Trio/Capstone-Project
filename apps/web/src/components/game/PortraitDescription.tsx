import type { PortraitView } from '../../api/schemas';
import { useT } from '../../i18n/useT';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Note } from '../ui/Note';
import { Pill } from '../ui/Pill';
import { SocialIndex } from './SocialIndex';

/**
 * "Về bạn" và chỉ số xã hội, đặt cạnh nhau (FR-13). Dùng ở cả màn chân dung
 * lẫn Hành trang — ở Hành trang thì thấy được hai thứ này đổi theo lượt chơi.
 */
export function PortraitDescription({ portrait }: { portrait: PortraitView }) {
  const t = useT();
  const { description } = portrait;

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
      <Card>
        <CardHeader title={t('quiz.aboutYou')}>
          {description && (
            <Pill tone={description.source === 'llm' ? 'gold' : 'neutral'}>
              {description.source === 'llm'
                ? t('quiz.aiWritten')
                : t('quiz.templateWritten')}
            </Pill>
          )}
        </CardHeader>
        <CardBody>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink">
            {description?.text ?? t('quiz.empty')}
          </p>
          {portrait.textsPending && (
            <Note tone="warn" className="mt-3">
              {t('quiz.textsPending')}
            </Note>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t('social.title')} />
        <CardBody>
          <SocialIndex index={portrait.socialIndex} />
        </CardBody>
      </Card>
    </div>
  );
}
