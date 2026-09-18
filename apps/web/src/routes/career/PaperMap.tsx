import { useMemo } from 'react';
import { cx } from '../../lib/cx';
import {
  PAPER_H,
  PAPER_W,
  paperCoast,
  paperEdge,
  paperPoints,
  paperTerrain,
  type Anchor,
  type PaperPoint,
  type PaperSymbol,
} from './mapGeometry';

interface PaperMapProps {
  roleCode: string;
  band: string;
  bandLabel: string;
  points: Array<{ id: string; label: string; kind: 'main' | 'side'; done: boolean }>;
  /** Địa điểm đang mở hộp câu hỏi — các thứ còn lại mờ đi. */
  openId: string | null;
  onPick: (id: string, at: Anchor) => void;
}

/** Nét vẽ tay cho từng loại địa hình, trong hệ toạ độ quanh gốc. */
const TERRAIN: Record<string, string> = {
  hill: 'M-14 6c4-9 9-12 14-12s10 3 14 12',
  tree: 'M0 8V-2M-7 2c3-6 4-9 7-13 3 4 4 7 7 13Z',
  dune: 'M-15 4c5-4 9-4 14 0s10 4 15 0',
};

/**
 * Ký hiệu địa điểm, vẽ theo lối bản đồ kho báu cổ.
 *
 * Mỗi hình gồm một nét thân và vài nét phụ, vẽ quanh gốc toạ độ. Viên ngọc
 * dành riêng cho nhiệm vụ chính — trên bản đồ kho báu, thứ đáng đi tìm chỉ có
 * một. Nhiệm vụ phụ thì mỗi nơi một dáng (núi, dừa, thuyền, hải đăng, khinh
 * khí cầu) nên nhìn lướt cũng phân biệt được chỗ nào đã ghé, khác màu chứ
 * không chỉ khác chữ.
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
 * Bản đồ giấy bên trong một hòn đảo.
 *
 * Vẽ như một tờ bản đồ kho báu — mép giấy rách, khung kẻ hai nét, bờ biển
 * bằng nét mực, địa hình phác tay — nhưng lấy màu của nghề chứ không lấy màu
 * giấy ố: cả ứng dụng đã là trời đêm, một tờ giấy vàng giữa đó thì đẹp riêng
 * nó mà lạc khỏi phần còn lại.
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
  const terrain = useMemo(() => paperTerrain(roleCode, band), [roleCode, band]);
  const edge = useMemo(() => paperEdge(roleCode, band), [roleCode, band]);

  const marks: PaperPoint[] = useMemo(() => {
    const main = points.find((p) => p.kind === 'main');
    const sides = points.filter((p) => p.kind === 'side');
    return paperPoints(
      roleCode,
      band,
      main ? { id: main.id, label: main.label } : null,
      sides.map((s) => ({ id: s.id, label: s.label })),
    );
  }, [roleCode, band, points]);

  const doneById = new Map(points.map((p) => [p.id, p.done]));
  const coastPath = coast.map((p) => `${p.x},${p.y}`).join(' ');
  const edgePath = edge.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

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
      className={cx('paper-map', openId && 'is-dimmed')}
      role="group"
      aria-label={`Bản đồ ${band} · ${bandLabel}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="paper-grid" width="52" height="52" patternUnits="userSpaceOnUse">
          <path d="M52 0H0V52" fill="none" className="paper-grid-line" />
        </pattern>
        <radialGradient id="paper-tint" cx="50%" cy="45%" r="70%">
          <stop offset="0%" className="paper-tint-in" />
          <stop offset="100%" className="paper-tint-out" />
        </radialGradient>
        {/* Mọi thứ trên tờ giấy phải nằm trong mép rách, kể cả lưới kẻ. */}
        <clipPath id="paper-clip">
          <polygon points={edgePath} />
        </clipPath>
      </defs>

      <g clipPath="url(#paper-clip)">
        <rect width={PAPER_W} height={PAPER_H} fill="url(#paper-tint)" />
        <rect width={PAPER_W} height={PAPER_H} fill="url(#paper-grid)" />

        {/* phần mờ đi khi đang mở một hộp câu hỏi */}
        <g className="paper-body">
          {/* bờ biển: hai nét, một nét mực đậm và một nét nhạt bên ngoài */}
          <polygon points={coastPath} className="paper-sand" />
          <polygon points={coastPath} className="paper-coast-soft" />
          <polygon points={coastPath} className="paper-coast" />

          {/* địa hình phác tay */}
          {terrain.map((item, i) => (
            <path
              key={i}
              d={TERRAIN[item.kind]}
              className="paper-terrain"
              transform={`translate(${item.x} ${item.y}) scale(${item.size / 14})`}
            />
          ))}

          {/* hoa gió */}
          <g className="paper-compass" transform={`translate(${PAPER_W - 92} ${PAPER_H - 84})`}>
            <circle r={34} className="paper-compass-ring" />
            <path d="M0-30 7-6 0 2-7-6Z" className="paper-compass-needle" />
            <path d="M0 30 7 6 0-2-7 6Z" className="paper-compass-tail" />
            <text y={-38} className="paper-compass-text">N</text>
          </g>
        </g>

        {/* khung kẻ hai nét, chạy dọc mép giấy */}
        <g className="paper-frame" aria-hidden="true">
          <rect x={16} y={16} width={PAPER_W - 32} height={PAPER_H - 32} />
          <rect x={23} y={23} width={PAPER_W - 46} height={PAPER_H - 46} />
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
                openId && !isOpen && 'is-faded',
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

              <text y={mark.kind === 'main' ? 44 : 40} className="paper-mark-label">
                {mark.short}
              </text>
            </g>
          );
        })}
      </g>

      {/* mép giấy rách, vẽ sau cùng để nét viền nằm trên mọi thứ */}
      <polygon points={edgePath} className="paper-edge" />
    </svg>
  );
}
