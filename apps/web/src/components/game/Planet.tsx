import type { CSSProperties } from 'react';
import { planetLook } from '../../domain/planet';

interface PlanetProps {
  roleCode: string;
  /** Đường kính, tính bằng px. */
  size: number;
}

/**
 * Một hành tinh. Hình dáng hoàn toàn do `planetLook(roleCode)` quyết định,
 * component chỉ vẽ lại — nên cùng một nghề luôn ra cùng một hành tinh.
 */
export function Planet({ roleCode, size }: PlanetProps) {
  const look = planetLook(roleCode);
  const ringSize = Math.round(size * 1.78);
  const moonSize = Math.round(size * 0.15);

  const vars = {
    '--p1': look.core,
    '--p2': look.glow,
    '--pa': `${look.bandAngle}deg`,
  } as CSSProperties;

  return (
    <span
      className="planet-wrap"
      style={{
        width: Math.max(size, look.hasRing ? ringSize : size),
        height: size,
        ...vars,
      }}
      aria-hidden="true"
    >
      {look.hasRing && (
        <span
          className="planet-ring"
          style={{ width: ringSize, height: ringSize }}
        />
      )}
      <span className="planet" style={{ width: size, height: size }} />
      {look.hasMoon && (
        <span
          className="planet-moon"
          style={{
            width: moonSize,
            height: moonSize,
            left: Math.round(size * 0.06),
            top: Math.round(size * 0.16),
          }}
        />
      )}
    </span>
  );
}
