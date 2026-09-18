import { NavLink, useLocation } from 'react-router-dom';
import { eventsForRole, findRole, findScenario, shortRoleName } from '@datn/game-core';
import { GALAXY } from '../../galaxy/galaxy';
import { useJourneyStore } from '../../store/journeyStore';
import { useProfileStore } from '../../store/profileStore';
import { useT } from '../../i18n/useT';
import { useProgressStore } from '../../store/progressStore';
import { cx } from '../../lib/cx';
import { CharacterPanel } from './CharacterPanel';
import { Icon, type IconName } from './icons';
import { Logo } from './Logo';

interface NavItemProps {
  to: string;
  icon: IconName;
  label: string;
  count?: string | number | null;
  /** Mục còn đang mở khi ở các route con. */
  matchPrefix?: string;
  onNavigate: () => void;
}

function NavItem({
  to,
  icon,
  label,
  count,
  matchPrefix,
  onNavigate,
}: NavItemProps) {
  const { pathname } = useLocation();
  const active = matchPrefix
    ? pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`)
    : undefined;

  return (
    <NavLink
      to={to}
      end={!matchPrefix}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          'mb-0.5 flex w-full items-center gap-2.5 rounded-[7px] px-[11px] py-[9px] text-left text-[13.5px] transition-colors',
          (active ?? isActive)
            ? 'bg-gold-soft font-semibold text-gold-2'
            : 'text-ink-2 hover:bg-panel hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {count != null && (
            <span
              className={cx(
                'rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                (active ?? isActive)
                  ? 'bg-gold text-rail'
                  : 'bg-chip text-ink-2',
              )}
            >
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="px-2.5 pb-[7px] pt-4 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted opacity-75">
      {children}
    </p>
  );
}

export function Rail({ onNavigate }: { onNavigate: () => void }) {
  const t = useT();
  const summary = useProgressStore((s) => s.summary);
  const quizDone = useProfileStore((s) => s.quizDone);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-[11px] px-[18px] pb-[18px] pt-5">
        <Logo className="h-[34px] w-[34px] shrink-0 drop-shadow-[0_2px_8px_rgba(212,176,106,.3)]" />
        <div className="font-display text-[19px] font-bold leading-none">
          Vào <span className="text-gold">Nghề</span>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-1" aria-label={t('nav.mainNav')}>
        <SectionTitle>{t('nav.explore')}</SectionTitle>
        <NavItem to="/" icon="home" label={t('nav.overview')} onNavigate={onNavigate} />
        <NavItem
          to="/jobs"
          icon="grid"
          label="Bản đồ nghề"
          count={GALAXY.nodes.length}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/quiz"
          icon="user"
          label={t('nav.quiz')}
          count={quizDone ? '✓' : null}
          matchPrefix="/quiz"
          onNavigate={onNavigate}
        />


        <SectionTitle>{t('nav.mine')}</SectionTitle>
        <NavItem
          to="/profile"
          icon="chart"
          label={t('nav.profile')}
          count={summary?.totalPoints || null}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/account"
          icon="user"
          label={t('nav.account')}
          onNavigate={onNavigate}
        />
      </nav>

      <CharacterPanel onNavigate={onNavigate} />
    </div>
  );
}
