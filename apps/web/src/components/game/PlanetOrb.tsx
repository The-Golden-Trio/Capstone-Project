import { formatVnd, roleHasAnyScenario, shortRoleName, type Role } from '@datn/game-core';
import { cx } from '../../lib/cx';
import { useGameIndex } from '../../store/contentStore';
import { Planet } from './Planet';

interface PlanetOrbProps {
  role: Role;
  /** Độ khớp 0–1, `null` khi chưa có hồ sơ người chơi. */
  score?: number | null;
  size?: number;
  onSelect: (roleCode: string) => void;
}

/** Nút hành tinh trên bản đồ. Hành tinh mờ = chưa dựng nhiệm vụ chính. */
export function PlanetOrb({
  role,
  score = null,
  size = 96,
  onSelect,
}: PlanetOrbProps) {
  const content = useGameIndex();
  const startSalary = role.salary_by_band.find(
    (b) => b.band === role.band_start,
  )?.salary_avg;
  const explored = roleHasAnyScenario(role, content);

  return (
    <button
      type="button"
      data-role={role.role_code}
      onClick={() => onSelect(role.role_code)}
      className={cx(
        'orb flex w-[158px] flex-col items-center gap-[11px] rounded-2xl border-none bg-transparent px-1.5 py-2.5 text-ink',
        !explored && 'dim',
      )}
    >
      <Planet roleCode={role.role_code} size={size} />
      <span className="text-balance text-center font-display text-[14.5px] font-semibold leading-snug">
        {shortRoleName(role)}
      </span>
      <span className="flex flex-wrap justify-center gap-[7px] font-mono text-[10px] text-muted">
        {score != null && (
          <b className="font-medium text-gold-2">{Math.round(score * 100)}% hợp</b>
        )}
        <span>vào từ {role.band_start}</span>
        {startSalary ? <span>{formatVnd(startSalary)}</span> : null}
      </span>
    </button>
  );
}
