import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { totalSkillPoints, useProfileStore } from '../../store/profileStore';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const profile = useProfileStore();
  const crumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex min-h-[57px] items-center gap-3.5 border-b border-line-2 bg-bg/90 px-[26px] py-3 backdrop-blur-[8px]">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Mở menu"
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

      <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line-2 bg-inset px-2.5 py-[5px] font-mono text-[11px] text-muted max-[900px]:hidden">
        điểm kỹ năng <b className="font-semibold text-gold-2">{totalSkillPoints(profile)}</b>
      </span>
      <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line-2 bg-inset px-2.5 py-[5px] font-mono text-[11px] text-muted max-[900px]:hidden">
        nhiệm vụ <b className="font-semibold text-gold-2">{profile.eventsPlayed}</b>
      </span>
    </header>
  );
}
