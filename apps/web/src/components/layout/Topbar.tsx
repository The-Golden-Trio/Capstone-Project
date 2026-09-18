import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';
import { useProgressStore } from '../../store/progressStore';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { CurrentPlaceToggle } from './CurrentPlaceToggle';
import { LanguageToggle } from './LanguageToggle';
import { useT } from '../../i18n/useT';

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const profile = useProfileStore();
  const summary = useProgressStore((s) => s.summary);
  const crumbs = useBreadcrumbs();
  const t = useT();

  return (
    <header className="sticky top-0 z-30 flex min-h-[57px] items-center gap-3.5 border-b border-line-2 bg-bg/90 px-[26px] py-3 backdrop-blur-[8px]">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label={t('nav.openMenu')}
        className="h-[34px] w-[34px] rounded-[7px] border border-line bg-inset text-[15px] text-ink-2 max-[900px]:block min-[900px]:hidden"
      >
        ☰
      </button>

      <div className="flex min-w-0 items-center gap-[7px] overflow-hidden whitespace-nowrap text-[12.5px] text-muted">
        {crumbs.map((crumb, i) => (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 && <span className="opacity-50">/</span>}
            {crumb.to ? (
              <Link to={crumb.to} className="text-muted hover:text-gold-2 hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <b className="font-semibold text-ink">{crumb.label}</b>
            )}
          </Fragment>
        ))}
      </div>

      <span className="flex-1" />

      <CurrentPlaceToggle />
      <LanguageToggle />

      {/* Một chỉ báo gọn thay cho hai ô số liệu rời: điểm kỹ năng là thứ
          vận hành cả hệ thống, nên nó đứng trước và được tô màu. */}
      <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line-2 bg-inset px-3 py-[5px] font-mono text-[11px] text-muted max-[900px]:hidden">
        <span className="text-gold" aria-hidden="true">
          ◆
        </span>
        <b className="font-semibold tabular-nums text-gold-2">
          {summary?.totalPoints ?? 0}
        </b>
        {t('top.skillPoints')}
        <span className="text-line">·</span>
        <b className="font-semibold tabular-nums text-ink-2">
          {profile.eventsPlayed}
        </b>
        {t('top.sideQuests')}
      </span>
    </header>
  );
}
