import { cx } from '../../lib/cx';
import { colorOf, lightYears, shortPlanetName, type Neighbor } from '../galaxy';
import { useGalaxyUiStore } from '../galaxyStore';
import type { UnlockState } from '../unlock';

interface NearbyDockProps {
  neighbors: Neighbor[];
  unlockByCode: ReadonlyMap<string, UnlockState>;
}

/** Dải dưới màn hình: các hành tinh kề, gần trước xa sau — bấm là chọn. */
export function NearbyDock({ neighbors, unlockByCode }: NearbyDockProps) {
  const selected = useGalaxyUiStore((s) => s.selected);
  const select = useGalaxyUiStore((s) => s.select);
  const hover = useGalaxyUiStore((s) => s.hover);

  if (neighbors.length === 0) return null;

  return (
    <div className="pointer-events-auto max-w-full">
      <p className="m-0 mb-1.5 pl-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
        Hành tinh lân cận · {neighbors.length}
      </p>
      <ul className="galaxy-dock m-0 flex list-none gap-2 overflow-x-auto p-0 pb-1">
        {neighbors.map(({ node, edge, isPromotion }) => {
          const unlock = unlockByCode.get(node.roleCode);
          const ok = unlock?.unlocked ?? false;
          const color = colorOf(node);
          const active = selected === node.roleCode;
          return (
            <li key={node.roleCode} className="shrink-0">
              <button
                type="button"
                onClick={() => select(node.roleCode)}
                onMouseEnter={() => hover(node.roleCode)}
                onMouseLeave={() => hover(null)}
                className={cx(
                  'galaxy-glass flex w-[172px] flex-col gap-1 rounded-[10px] px-3 py-2.5 text-left transition-colors',
                  active ? 'border-gold!' : 'hover:border-line',
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-[9px] w-[9px] shrink-0 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-display text-[13px] font-semibold text-ink">
                    {shortPlanetName(node)}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {isPromotion ? '▲ thăng tiến' : edge.type === 'PROGRESSES_TO' ? '▼ bậc trước' : '↔ tương tự'}
                  {' · '}
                  {lightYears(edge.distance)} ly
                </span>
                <span
                  className={cx(
                    'font-mono text-[10px] font-medium',
                    ok ? 'text-good' : 'text-signal',
                  )}
                >
                  {ok ? '● bay được' : `○ thiếu ${unlock?.missing.length ?? '?'} kỹ năng`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
