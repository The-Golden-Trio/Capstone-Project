import { useMemo } from 'react';
import { cx } from '../../lib/cx';
import {
  GRID_STEP,
  OVERSCAN,
  PAPER_H,
  PAPER_W,
  gridTicks,
  paperContours,
  paperCoast,
  paperPoints,
  type Anchor,
  type PaperPoint,
  type PaperSymbol,
} from './mapGeometry';

export interface MapPointInput {
  id: string;
  label: string;
  /** Tên gọn do dữ liệu đặt; thiếu thì giao diện tự rút gọn nhan đề. */
  short?: string;
  kind: 'main' | 'side';
  done: boolean;
}

interface PaperMapProps {
  roleCode: string;
  band: string;
  bandLabel: string;
  points: MapPointInput[];
  /** Địa điểm đang mở hộp câu hỏi. */
  openId: string | null;
  onPick: (id: string, at: Anchor) => void;
}

/**
 * Ký hiệu địa điểm.
 *
 * Nét thẳng, độ dày đều nhau, vẽ quanh gốc toạ độ — cùng ngôn ngữ với phần
 * còn lại của giao diện chứ không phải nét vẽ tay. Viên ngọc dành riêng cho
 * nhiệm vụ chính: trên một tấm bản đồ, thứ đáng đi tìm chỉ có một. Nhiệm vụ
 * phụ mỗi nơi một dáng nên nhìn lướt cũng phân biệt được, không phải đọc chữ.
 */
const SYMBOLS: Record<PaperSymbol, { body: string; lines?: string }> = {
  gem: {
    body: 'M0-15 15-4 0 16-15-4Z',
    lines: 'M-15-4H15M0-15-7-4 0 16M0-15 7-4 0 16',
  },
  mountain: {
    body: 'M-18 9-6-11 1-1 8-8 18 9Z',
    lines: 'M-6-11-1-4M8-8 12-3',
  },
  palm: {
    body: 'M1 12c-2-8-2-13 0-18',
    lines:
      'M1-6c-5-5-11-5-15-2M1-6c5-5 11-5 15-2M1-6c-2-6 1-11 4-13M1-6c4-3 9-3 12-1',
  },
  ship: {
    body: 'M-14 5h28l-5 8h-18Z',
    lines: 'M0 5V-13M0-12c7 3 10 8 10 12H0M0-12c-6 3-9 8-9 12H0',
  },
  tower: {
    body: 'M-7 13-4-5h8l3 18Z',
    lines: 'M-4-5h8M-4-5v-6h8v6M-6-11h12M7-14l5-3M-7-14l-5-3',
  },
  balloon: {
    body: 'M0-16c7 0 11 5 11 10 0 6-7 10-11 15-4-5-11-9-11-15 0-5 4-10 11-10Z',
    lines: 'M-4 13h8l-1 4h-6ZM0-16v25',
  },
};

/**
 * Tấm bản đồ của một hòn đảo.
 *
 * Vẫn đúng bố cục bản đồ kho báu — bờ biển, địa hình, hoa gió, ký hiệu địa
 * điểm — nhưng vẽ bằng nét thẳng và màu của nghề thay vì nét mực trên giấy ố:
 * cả ứng dụng là một bảng điều khiển trên nền trời đêm, tấm bản đồ phải nói
 * cùng thứ tiếng ấy.
 */
export function PaperMap({
  roleCode,
  band,
  bandLabel,
  points,
  openId,
  onPick,
}: PaperMapProps) {
  const coast = useMemo(() => paperCoast(roleCode, band), [roleCode, band]);
  const contours = useMemo(() => paperContours(coast), [coast]);

  const cols = gridTicks(PAPER_W);
  const rows = gridTicks(PAPER_H);
  const first = -Math.ceil(OVERSCAN / GRID_STEP) * GRID_STEP;

  const marks: PaperPoint[] = useMemo(() => {
    const main = points.find((p) => p.kind === 'main');
    const sides = points.filter((p) => p.kind === 'side');
    return paperPoints(roleCode, band, main ?? null, sides);
  }, [roleCode, band, points]);

  const doneById = new Map(points.map((p) => [p.id, p.done]));
  const poly = (list: { x: number; y: number }[]) =>
    list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  /**
   * Đo ngay trên vòng halo chứ không trên cả nhóm: nhóm còn ôm cả dòng nhãn
   * bên dưới, rộng hơn ký hiệu nhiều, nên hộp câu hỏi sẽ dạt ra xa.
   */
  const pickAt = (id: string, group: SVGGElement) => {
    const halo = group.querySelector('.paper-mark-halo') ?? group;
    const box = halo.getBoundingClientRect();
    onPick(id, {
      left: box.left,
      right: box.right,
      y: box.top + box.height / 2,
    });
  };

  return (
    <svg
      viewBox={`0 0 ${PAPER_W} ${PAPER_H}`}
      className="paper-map"
      role="group"
      aria-label={`Bản đồ ${band} · ${bandLabel}`}
    >
      <defs>
        <linearGradient id="paper-tint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="paper-tint-in" />
          <stop offset="100%" className="paper-tint-out" />
        </linearGradient>
      </defs>

      <g>
        {/* Nền và lưới kéo ra ngoài khung để lấp hai dải thừa hai bên trên
            màn hình rộng — xem OVERSCAN. */}
        <rect
          x={first}
          y={first}
          width={PAPER_W - first * 2}
          height={PAPER_H - first * 2}
          fill="url(#paper-tint)"
        />
        <g className="paper-grid" aria-hidden="true">
          {cols.map((x) => (
            <line key={`v${x}`} x1={x} y1={rows[0]} x2={x} y2={rows[rows.length - 1]} />
          ))}
          {rows.map((y) => (
            <line key={`h${y}`} x1={cols[0]} y1={y} x2={cols[cols.length - 1]} y2={y} />
          ))}
        </g>

        {/* ── Đảo: một nét bờ, bên trong là đường bình độ ── */}
        <g className="paper-land" aria-hidden="true">
          <polygon points={poly(coast)} className="paper-sand" />
          {contours.map((ring, i) => (
            <polygon key={i} points={poly(ring)} className="paper-contour" />
          ))}
          <polygon points={poly(coast)} className="paper-coast" />
        </g>

        {/* ── Hoa gió, rút về một vòng ngắm ── */}
        <g
          className="paper-compass"
          aria-hidden="true"
          transform={`translate(${PAPER_W - 84} ${PAPER_H - 80})`}
        >
          <circle r={30} className="paper-compass-ring" />
          <circle r={3} className="paper-compass-hub" />
          <path d="M0-30V-18M0 30V18M-30 0h12M30 0h-12" className="paper-compass-tick" />
          <path d="M0-24 5-6 0-10-5-6Z" className="paper-compass-needle" />
          <text y={-36} className="paper-compass-text">
            N
          </text>
        </g>

        {/* ── Ký hiệu địa điểm ── */}
        {marks.map((mark) => {
          const isOpen = openId === mark.id;
          const art = SYMBOLS[mark.symbol];

          return (
            <g
              key={mark.id}
              className={cx(
                'paper-mark',
                mark.kind === 'main' && 'is-main',
                doneById.get(mark.id) && 'is-done',
                isOpen && 'is-open',
              )}
              transform={`translate(${mark.x} ${mark.y})`}
              onClick={(e) => pickAt(mark.id, e.currentTarget)}
              role="button"
              tabIndex={0}
              aria-label={mark.label}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pickAt(mark.id, e.currentTarget);
                }
              }}
            >
              {/* Tên đầy đủ hiện khi rê chuột — nhãn in ra chỉ là tên ngắn. */}
              <title>{mark.label}</title>

              <circle r={mark.kind === 'main' ? 28 : 23} className="paper-mark-halo" />
              <path d={art.body} className="paper-mark-body" />
              {art.lines && <path d={art.lines} className="paper-mark-line" />}

              <text y={mark.kind === 'main' ? 46 : 41} className="paper-mark-label">
                {mark.short}
              </text>
            </g>
          );
        })}
      </g>

    </svg>
  );
}
