import { useRef } from 'react';
import type { RankedRole } from '@datn/game-core';
import { useConstellationLines } from '../../hooks/useConstellationLines';
import { cx } from '../../lib/cx';
import { PlanetOrb } from './PlanetOrb';

interface StarMapProps {
  roles: RankedRole[];
  /** Hành tinh đang ghé — các cạnh chạm nó sẽ sáng lên. */
  activeRoleCode?: string | null;
  size?: number;
  /** Vẽ đường nối chòm sao. Tắt ở các bản đồ nhỏ nhúng trong thẻ. */
  withLinks?: boolean;
  onSelect: (roleCode: string) => void;
  className?: string;
}

export function StarMap({
  roles,
  activeRoleCode = null,
  size = 96,
  withLinks = false,
  onSelect,
  className,
}: StarMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { width, height, lines } = useConstellationLines(
    wrapRef,
    withLinks ? activeRoleCode : null,
  );

  return (
    <div ref={wrapRef} className="relative">
      {withLinks && (
        <svg
          className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          aria-hidden="true"
        >
          {lines.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={cx(
                'constellation-line',
                line.kind,
                line.hot && 'hot',
              )}
            />
          ))}
        </svg>
      )}
      <div
        className={cx(
          'starmap relative z-1 flex flex-wrap justify-center gap-x-2 gap-y-3.5 pb-1.5 pt-[18px]',
          className,
        )}
      >
        {roles.map(({ role, score }) => (
          <PlanetOrb
            key={role.role_code}
            role={role}
            score={score}
            size={size}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
