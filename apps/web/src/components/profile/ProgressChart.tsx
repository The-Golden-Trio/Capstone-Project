import { useRef, useState } from 'react';
import type { TimelinePoint } from '../../api/schemas';
import { EmptyState } from '../ui/EmptyState';

const WIDTH = 640;
const HEIGHT = 180;
const PAD = { top: 14, right: 14, bottom: 26, left: 34 };

const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

const formatDate = (iso: string) => {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
};

/**
 * Điểm kỹ năng cộng dồn theo thời gian.
 *
 * Một chuỗi duy nhất nên không cần chú giải — tiêu đề đã nói nó là gì. Màu
 * vàng đạt tỉ lệ tương phản trên nền thẻ, và mọi con số đều đọc được ở bảng
 * bên dưới, nên thông tin không nằm ở riêng màu sắc.
 */
export function ProgressChart({ timeline }: { timeline: TimelinePoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (timeline.length === 0) {
    return (
      <EmptyState icon="◷">
        Chưa có mốc nào. Hoàn thành một nhiệm vụ chính để bắt đầu vẽ đường này.
      </EmptyState>
    );
  }

  const maxY = Math.max(...timeline.map((p) => p.cumulative), 1);
  const lastIndex = timeline.length - 1;

  const x = (i: number) =>
    PAD.left + (lastIndex === 0 ? PLOT_W / 2 : (i / lastIndex) * PLOT_W);
  const y = (value: number) => PAD.top + PLOT_H - (value / maxY) * PLOT_H;

  const points = timeline.map((p, i) => ({ ...p, cx: x(i), cy: y(p.cumulative) }));
  const line = points.map((p) => `${p.cx},${p.cy}`).join(' ');
  const area =
    `${PAD.left},${PAD.top + PLOT_H} ` +
    line +
    ` ${points[points.length - 1].cx},${PAD.top + PLOT_H}`;

  // Ba mốc trục dọc là đủ cho một biểu đồ nhỏ: 0, giữa, và đỉnh.
  const ticks = [0, Math.round(maxY / 2), maxY].filter(
    (value, index, all) => all.indexOf(value) === index,
  );

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Toạ độ màn hình -> toạ độ viewBox.
    const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let best = Infinity;
    points.forEach((p, i) => {
      const distance = Math.abs(p.cx - svgX);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    setHover(nearest);
  };

  const active = hover === null ? null : points[hover];

  return (
    <figure className="m-0">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label={`Điểm kỹ năng cộng dồn, từ ${formatDate(timeline[0].date)} đến ${formatDate(timeline[lastIndex].date)}, hiện ${timeline[lastIndex].cumulative} điểm`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {/* lưới mờ, lùi ra sau dữ liệu */}
        {ticks.map((value) => (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--color-line-2)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(value) + 3.5}
              textAnchor="end"
              className="fill-muted font-mono text-[9px]"
            >
              {value}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {points.length > 1 && (
          <>
            <polygon points={area} fill="url(#progress-fill)" />
            <polyline
              points={line}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={p.cx}
            cy={p.cy}
            r={hover === i ? 5 : 4}
            fill="var(--color-gold)"
            stroke="var(--color-surf)"
            strokeWidth={2}
          />
        ))}

        {/* nhãn ngày: chỉ hai đầu, để không chồng chữ lên nhau */}
        <text
          x={PAD.left}
          y={HEIGHT - 8}
          textAnchor="start"
          className="fill-muted font-mono text-[9px]"
        >
          {formatDate(timeline[0].date)}
        </text>
        {timeline.length > 1 && (
          <text
            x={WIDTH - PAD.right}
            y={HEIGHT - 8}
            textAnchor="end"
            className="fill-muted font-mono text-[9px]"
          >
            {formatDate(timeline[lastIndex].date)}
          </text>
        )}

        {active && (
          <line
            x1={active.cx}
            x2={active.cx}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="var(--color-gold)"
            strokeWidth={1}
            strokeDasharray="3 4"
            opacity={0.6}
          />
        )}
      </svg>

      <figcaption className="mt-2 min-h-[20px] text-center font-mono text-[11px] text-muted">
        {active ? (
          <>
            <b className="text-gold-2">{active.cumulative} điểm</b> tính tới{' '}
            {formatDate(active.date)}
            {active.points > 0 && ` · +${active.points} hôm đó`}
          </>
        ) : (
          `Tổng ${timeline[lastIndex].cumulative} điểm qua ${timeline.length} mốc`
        )}
      </figcaption>
    </figure>
  );
}
