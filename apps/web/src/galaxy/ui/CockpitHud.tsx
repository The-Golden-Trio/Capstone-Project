import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { galaxyData, colorOf, playPath, shortPlanetName, type GalaxyNode } from '../galaxy';
import { useGalaxyStore, useGalaxyUiStore } from '../galaxyStore';

interface CockpitHudProps {
  current: GalaxyNode;
  /** Tổng điểm kỹ năng máy chủ đã chấm — hiện là "nhiên liệu". */
  fuel: number;
  ownedCount: number;
}

/** Góc trên-phải: phi hành gia đang ở đâu, có gì trong tay. */
export function CockpitHud({ current, fuel, ownedCount }: CockpitHudProps) {
  const visited = useGalaxyStore((s) => s.visited);
  const goHome = useGalaxyUiStore((s) => s.goHome);
  const goOverview = useGalaxyUiStore((s) => s.goOverview);
  const select = useGalaxyUiStore((s) => s.select);
  const flying = useGalaxyUiStore((s) => s.flight !== null);
  const play = playPath(current);
  const color = colorOf(current);

  return (
    <div className="galaxy-glass pointer-events-auto w-[300px] rounded-[11px] p-3.5 max-[900px]:w-auto">
      <p className="m-0 mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
        Buồng lái
      </p>

      <button
        type="button"
        onClick={() => select(current.roleCode)}
        className="flex w-full items-center gap-2.5 rounded-[7px] border border-transparent bg-transparent p-1 text-left text-ink hover:border-line"
        title="Xem hành tinh đang đứng"
      >
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span className="block font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
            Đang ở
          </span>
          <span className="block truncate font-display text-[15px] font-semibold leading-tight">
            {shortPlanetName(current)}
          </span>
        </span>
      </button>

      <dl className="m-0 mt-2.5 grid grid-cols-3 gap-1.5 border-t border-line-2 pt-2.5 font-mono text-[10px] text-muted">
        <div>
          <dt className="uppercase tracking-[0.08em]">Nhiên liệu</dt>
          <dd className="m-0 text-[15px] font-semibold tabular-nums text-gold-2">
            <span className="text-gold" aria-hidden="true">◆ </span>
            {fuel}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em]">Kỹ năng</dt>
          <dd className="m-0 text-[15px] font-semibold tabular-nums text-ink">{ownedCount}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em]">Đã ghé</dt>
          <dd className="m-0 text-[15px] font-semibold tabular-nums text-ink">
            {visited.length}
            <span className="text-[11px] font-normal text-muted">/{galaxyData().nodes.length}</span>
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={goHome} disabled={flying} className="flex-1 whitespace-nowrap px-2!">
          Về vị trí
        </Button>
        <Button size="sm" onClick={goOverview} disabled={flying} className="flex-1 whitespace-nowrap px-2!">
          Toàn cảnh
        </Button>
        {play && (
          <Link
            to={play}
            className="flex-1 whitespace-nowrap rounded-[7px] border border-gold bg-gold px-2 py-[6px] text-center text-[11.5px] font-semibold text-bg transition-[filter] hover:brightness-110"
          >
            Trải nghiệm →
          </Link>
        )}
      </div>
    </div>
  );
}
