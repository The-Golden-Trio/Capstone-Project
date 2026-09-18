import { useMemo } from 'react';
import type { BandProgress } from '../../api/schemas';
import { cx } from '../../lib/cx';
import {
  MAP_H,
  MAP_W,
  focusTransform,
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
  zoom: number;
  onPickIsland: (band: string) => void;
}

/** Ghim giọt nước, chân đúng ngay gốc toạ độ. */
const PIN = 'M0 0c0-13-11-21-11-32a11 11 0 0 1 22 0c0 11-11 19-11 32Z';

/** Nhãn cột A, B, C… và hàng 1, 2, 3… như lưới toạ độ trên hải đồ. */
const COLUMN_LETTERS = 'ABCDEFGHIJKLMNOP';

/**
 * Quần đảo của một nghề.
 *
 * Mỗi cấp bậc là một hòn đảo trên mặt nước, rải so le chứ không xếp thành
 * hàng. Lưới toạ độ có nhưng để rất mờ — đủ để ra chất hải đồ, không tranh
 * chú ý với các đảo.
 *
 * Ghim và nhãn được chống-phóng (`scale(1/zoom)`) nên kích thước không đổi
 * theo mức phóng: nhóm ngoài mang phép zoom, thiếu lớp này thì chữ 13px ở
 * mức 3× hoá 39px và đè lên nhau.
 */
export function IslandsView({
  roleCode,
  bands,
  selectedBand,
  currentBand,
  zoomingBand,
  zoom,
  onPickIsland,
}: IslandsViewProps) {
  const list = useMemo(
    () => buildIslands(roleCode, bands.map((b) => b.band)),
    [roleCode, bands],
  );

  const routes = useMemo(() => seaRoutes(list), [list]);

  const focused = list.find((i) => i.band === zoomingBand) ?? null;
  const view = focusTransform(focused, focused ? 2.4 : zoom);
  const k = 1 / view.scale;

  const gridCols = Math.round(MAP_W / 100);
  const gridRows = Math.round(MAP_H / 100);

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

      <rect width={MAP_W} height={MAP_H} fill="url(#sea-depth)" />

      <g
        className="sea-view"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {/* ── Lưới toạ độ, cố ý để mờ ── */}
        <g className="sea-grid" aria-hidden="true">
          {Array.from({ length: gridCols + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={MAP_H} />
          ))}
          {Array.from({ length: gridRows + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 100} x2={MAP_W} y2={i * 100} />
          ))}
        </g>
        <g className="sea-coord" aria-hidden="true">
          {Array.from({ length: gridCols }, (_, i) => (
            <text key={`c${i}`} x={i * 100 + 50} y={22}>
              {COLUMN_LETTERS[i] ?? ''}
            </text>
          ))}
          {Array.from({ length: gridRows }, (_, i) => (
            <text key={`r${i}`} x={14} y={i * 100 + 56}>
              {i + 1}
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
