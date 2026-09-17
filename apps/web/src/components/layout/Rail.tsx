import { NavLink, useLocation } from 'react-router-dom';
import { eventsForRole, findRole, findScenario } from '../../data/indexes';
import { shortRoleName } from '../../domain/format';
import { useJourneyStore } from '../../store/journeyStore';
import {
  totalSkillPoints,
  useProfileStore,
  type ProfileState,
} from '../../store/profileStore';
import { cx } from '../../lib/cx';
import { GAME } from '../../data/gameData';
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

/** Số việc còn lại ở nơi người chơi đang đứng. */
function remainingTasks(
  profile: ProfileState,
  roleCode: string,
  band: string,
): number {
  const role = findRole(roleCode);
  if (!role) return 0;
  const total = (findScenario(roleCode, band) ? 1 : 0) + eventsForRole(role).length;
  const done = profile.doneTasks.filter((k) =>
    k.startsWith(`${roleCode}:${band}:`),
  ).length;
  return total - done;
}

export function Rail({ onNavigate }: { onNavigate: () => void }) {
  const profile = useProfileStore();
  const { roleCode, band } = useJourneyStore();
  const role = findRole(roleCode);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-[11px] px-[18px] pb-[18px] pt-5">
        <Logo className="h-[34px] w-[34px] shrink-0 drop-shadow-[0_2px_8px_rgba(212,176,106,.3)]" />
        <div className="font-display text-[19px] font-bold leading-none">
          Vào <span className="text-gold">Nghề</span>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-1" aria-label="Điều hướng chính">
        <SectionTitle>Khám phá</SectionTitle>
        <NavItem to="/" icon="home" label="Tổng quan" onNavigate={onNavigate} />
        <NavItem
          to="/jobs"
          icon="grid"
          label="Bản đồ nghề"
          count={GAME.roles.length}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/quiz"
          icon="user"
          label="Tự vấn"
          count={profile.quizDone ? '✓' : null}
          matchPrefix="/quiz"
          onNavigate={onNavigate}
        />

        {role && band && (
          <>
            <SectionTitle>Đang ở</SectionTitle>
            <NavItem
              to={`/jobs/${role.role_code}/${band}`}
              icon="book"
              label={shortRoleName(role)}
              count={remainingTasks(profile, role.role_code, band) || null}
              matchPrefix={`/jobs/${role.role_code}/${band}`}
              onNavigate={onNavigate}
            />
          </>
        )}

        <SectionTitle>Của tôi</SectionTitle>
        <NavItem
          to="/profile"
          icon="chart"
          label="Hành trang"
          onNavigate={onNavigate}
        />
      </nav>

      <div className="border-t border-line-2 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-[13px] font-bold text-rail">
            {(profile.name ?? '?')[0].toUpperCase()}
          </span>
          <div>
            <div className="text-[13px] font-semibold leading-tight">
              {profile.name ?? 'Khách'}
            </div>
            <div className="font-mono text-[10px] text-muted">
              {totalSkillPoints(profile)} điểm · {profile.eventsPlayed} nhiệm vụ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
