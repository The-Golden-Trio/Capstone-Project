import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { bandLabel, bandsOf, findRole, shortRoleName } from '@datn/game-core';
import { Planet } from '../../components/game/Planet';
import { RoleTheme } from '../../components/game/RoleTheme';
import { Pill } from '../../components/ui/Pill';
import { cx } from '../../lib/cx';
import { useJourneyStore } from '../../store/journeyStore';
import { ContextTab } from './ContextTab';
import { TasksTab } from './TasksTab';
import { PayTab } from './PayTab';
import { NearbyTab } from './NearbyTab';

const TABS = [
  { key: 'ctx', label: 'Nơi này' },
  { key: 'tasks', label: 'Nhiệm vụ' },
  { key: 'pay', label: 'Thu nhập' },
  { key: 'near', label: 'Hành tinh lân cận' },
] as const;

export type JobTab = (typeof TABS)[number]['key'];

const isTab = (value: string | undefined): value is JobTab =>
  TABS.some((t) => t.key === value);

export function JobPage() {
  const { roleCode = '', band = '', tab } = useParams();
  const navigate = useNavigate();
  const setLocation = useJourneyStore((s) => s.setLocation);

  const role = findRole(roleCode);
  const bandValid = role ? bandsOf(role).includes(band) : false;

  // Nhớ chỗ đang đứng để sidebar và trang tổng quan dẫn về được.
  useEffect(() => {
    if (role && bandValid) setLocation(role.role_code, band);
  }, [role, band, bandValid, setLocation]);

  if (!role) return <Navigate to="/jobs" replace />;
  if (!bandValid)
    return <Navigate to={`/jobs/${role.role_code}/${role.band_start}`} replace />;
  if (!isTab(tab))
    return <Navigate to={`/jobs/${role.role_code}/${band}/ctx`} replace />;

  const goToTab = (next: JobTab) =>
    navigate(`/jobs/${role.role_code}/${band}/${next}`);

  return (
    <RoleTheme roleCode={role.role_code}>
      <div className="mb-6 flex flex-wrap items-center gap-[22px]">
        <Planet roleCode={role.role_code} size={118} />
        <div className="min-w-[230px] flex-1">
          <h1 className="mb-2 font-display text-[clamp(23px,3.2vw,31px)] font-semibold leading-tight">
            {shortRoleName(role)}
          </h1>
          <p className="m-0 mb-2.5 max-w-[52ch] text-[14px] leading-relaxed text-ink-2">
            {role.experience}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-[3px] font-mono text-[9.5px] tracking-[0.05em] text-[var(--accent)]">
              {band} · {bandLabel(band)}
            </span>
            <Pill>thang {role.bands}</Pill>
          </div>
        </div>
      </div>

      <div
        className="mb-5 flex gap-0.5 overflow-x-auto border-b border-line-2"
        role="tablist"
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => goToTab(key)}
            className={cx(
              '-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13.5px] transition-colors',
              tab === key
                ? 'border-[var(--accent)] font-semibold text-[var(--accent)]'
                : 'border-transparent text-muted hover:text-ink-2',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ctx' && <ContextTab role={role} band={band} onGoToTasks={() => goToTab('tasks')} />}
      {tab === 'tasks' && <TasksTab role={role} band={band} />}
      {tab === 'pay' && <PayTab role={role} band={band} />}
      {tab === 'near' && <NearbyTab role={role} />}
    </RoleTheme>
  );
}
