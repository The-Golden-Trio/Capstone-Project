import type { PortraitView } from '../../api/schemas';
import { useT } from '../../i18n/useT';
import { Pill } from '../ui/Pill';

/**
 * Chỉ số xã hội: thước ngang Hệ thống ◀─●─▶ Con người, 0–100.
 *
 * Không có bên "tốt hơn", nên hai đầu cùng một màu; chỉ có chấm là nổi.
 */
export function SocialIndex({
  index,
}: {
  index: PortraitView['socialIndex'];
}) {
  const t = useT();

  if (!index) {
    return <p className="m-0 text-[13px] text-muted">{t('social.none')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-display text-[28px] font-semibold tabular-nums leading-none">
          {index.value}
        </span>
        <Pill tone="gold">{t(`social.label.${index.label}`)}</Pill>
      </div>

      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={index.value}
        aria-label={t('social.title')}
        className="relative h-[7px] rounded-sm bg-inset"
      >
        <i
          className="absolute top-1/2 block h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surf bg-gold"
          style={{ left: `${index.value}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[10px] text-muted">
        <span>◀ {t('social.things')}</span>
        <span>{t('social.people')} ▶</span>
      </div>

      <p className="m-0 text-[12.5px] text-ink-2">{t('social.explain')}</p>
      <p className="m-0 font-mono text-[10px] text-muted">
        {t('social.basis', {
          quiz: index.basis.quizItems,
          play: index.basis.playChoices,
        })}
      </p>
    </div>
  );
}
