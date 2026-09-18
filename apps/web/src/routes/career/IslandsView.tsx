import { useMemo } from 'react';
import type { BandProgress } from '../../api/schemas';
import { cx } from '../../lib/cx';
import {
  GRID_STEP,
  MAP_H,
  MAP_W,
  OVERSCAN,
  SAIL_ZOOM,
  columnLabel,
  focusTransform,
  gridTicks,
  islands as buildIslands,
  seaRoutes,
} from './mapGeometry';

interface IslandsViewProps {
  roleCode: string;
  bands: BandProgress[];
  selectedBand: string | null;
  currentBand: string | null;
  /** Đảo đang được phóng vào trước khi mở bản đồ giấy. */
  zoomingBand: string | null;
  onPickIsland: (band: string) => void;
}

/** Ghim giọt nước, chân đúng ngay gốc toạ độ. */
const PIN = 'M0 0c0-13-11-21-11-32a11 11 0 0 1 22 0c0 11-11 19-11 32Z';

/**
 * Quần đảo của một nghề.
 *
 * Mỗi cấp bậc là một hòn đảo trên mặt nước, rải so le chứ không xếp thành
 * hàng. Lưới toạ độ có nhưng để rất mờ — đủ để ra chất hải đồ, không tranh
 * chú ý với các đảo.
 *
 * Ghim và nhãn được chống-phóng (`scale(1/zoom)`) nên kích thước không đổi
 * lúc phóng vào đảo: nhóm ngoài mang phép zoom, thiếu lớp này thì chữ 13px ở
 * mức 2,4× hoá 31px và đè lên nhau.
 */
export function IslandsView({
  roleCode,
  bands,
  selectedBand,
  currentBand,
  zoomingBand,
  onPickIsland,
}: IslandsViewProps) {
  const list = useMemo(
    () => buildIslands(roleCode, bands.map((b) => b.band)),
    [roleCode, bands],
  );

  const routes = useMemo(() => seaRoutes(list), [list]);

  const focused = list.find((i) => i.band === zoomingBand) ?? null;
  const view = focusTransform(focused, focused ? SAIL_ZOOM : 1);
  const k = 1 / view.scale;

  const cols = gridTicks(MAP_W);
  const rows = gridTicks(MAP_H);
  const first = -Math.ceil(OVERSCAN / GRID_STEP) * GRID_STEP;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="sea-map"
      role="group"
      aria-label="Quần đảo của nghề"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="sea-depth" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#123a63" />
          <stop offset="100%" stopColor="#081d35" />
        </radialGradient>
      </defs>

      {/* Nền và lưới kéo ra ngoài khung 1600×900 để lấp hai dải thừa hai
          bên trên màn hình rộng — xem OVERSCAN. */}
      <rect
        x={first}
        y={first}
        width={MAP_W - first * 2}
        height={MAP_H - first * 2}
        fill="url(#sea-depth)"
      />

      <g
        className="sea-view"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {/* ── Lưới toạ độ, cố ý để mờ ── */}
        <g className="sea-grid" aria-hidden="true">
          {cols.map((x, i) => (
            <line
              key={`v${x}`}
              className={i % 5 === 0 ? 'is-major' : undefined}
              x1={x}
              y1={rows[0]}
              x2={x}
              y2={rows[rows.length - 1]}
            />
          ))}
          {rows.map((y, i) => (
            <line
              key={`h${y}`}
              className={i % 5 === 0 ? 'is-major' : undefined}
              x1={cols[0]}
              y1={y}
              x2={cols[cols.length - 1]}
              y2={y}
            />
          ))}
        </g>
        <g className="sea-coord" aria-hidden="true">
          {/* Chỉ đánh toạ độ trong vùng 1600×900 — đó là vùng có đảo. Phần
              lưới lấn ra ngoài chỉ để lấp màn hình, đánh số cả ra đó thì chữ
              trôi ra giữa chỗ trống. */}
          {cols
            .filter((x) => x >= 0 && x < MAP_W)
            .map((x) => (
              <text key={`c${x}`} x={x + GRID_STEP / 2} y={22}>
                {columnLabel(x / GRID_STEP)}
              </text>
            ))}
          {rows
            .filter((y) => y >= 0 && y < MAP_H)
            .map((y) => (
              <text key={`r${y}`} x={14} y={y + 56}>
                {y / GRID_STEP + 1}
              </text>
            ))}
        </g>

        {/* ── Hải trình nối các đảo, vẽ dưới đảo ── */}
        <g className="sea-route" aria-hidden="true">
          {routes.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* ── Các đảo ── */}
        {list.map((island, index) => {
          const band = bands[index];
          if (!band) return null;

          const state = band.completed
            ? 'done'
            : !band.unlocked
              ? 'locked'
              : band.band === currentBand
                ? 'current'
                : 'open';
          const points = island.outline.map((p) => `${p.x},${p.y}`).join(' ');

          return (
            <g
              key={island.band}
              className={cx(
                'isle',
                `is-${state}`,
                selectedBand === band.band && 'is-selected',
                zoomingBand && zoomingBand !== band.band && 'is-dimmed',
              )}
              onClick={() => onPickIsland(band.band)}
              role="button"
              tabIndex={0}
              aria-label={`${band.band} · ${band.label}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPickIsland(band.band);
                }
              }}
            >
              {/* sóng vỗ bờ: một vòng sáng ôm lấy đảo */}
              <polygon points={points} className="isle-surf" />
              <polygon points={points} className="isle-land" />

              {island.rocks.map((rock, r) => (
                <ellipse
                  key={r}
                  cx={rock.x}
                  cy={rock.y}
                  rx={rock.r}
                  ry={rock.r * 0.7}
                  className="isle-rock"
                />
              ))}

              <g transform={`translate(${island.x} ${island.y}) scale(${k})`}>
                <ellipse rx={12} ry={4} className="isle-pin-shadow" />
                <path d={PIN} className="isle-pin" />
                <circle cy={-21} r={4.4} className="isle-pin-dot" />
                <text y={22} className="isle-label">
                  {band.band}
                </text>
                <text y={38} className="isle-sub">
                  {band.label}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
