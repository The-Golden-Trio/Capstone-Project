import { useId } from 'react';
import { palette } from '../tokens';

export interface RadarAxis {
  key: string;
  label: string;
  starred?: boolean;
}
export interface RadarChartProps {
  axes: RadarAxis[];
  values: Record<string, number>;
  overlay?: Record<string, number>;
  highlight?: string;
  rings?: number;
  size?: number;
  label?: string;
}
export function RadarChart({
  axes,
  values,
  overlay,
  highlight,
  rings = 5,
  size = 420,
  label = 'Nhóm kỹ năng mềm',
}: RadarChartProps) {
  const id = useId();
  const tiers = Math.max(1, Math.floor(rings));
  const radius = 112;
  const point = (i: number, r: number) => {
    const angle = (i * 2 * Math.PI) / axes.length - Math.PI / 2;
    return [240 + Math.cos(angle) * r, 220 + Math.sin(angle) * r];
  };
  const value = (input: Record<string, number>, key: string) =>
    Number.isFinite(input[key]) ? Math.max(0, Math.min(tiers, input[key])) : 0;
  const polygon = (input: Record<string, number>) =>
    axes
      .map((axis, i) =>
        point(i, (radius * value(input, axis.key)) / tiers).join(','),
      )
      .join(' ');
  return (
    <figure className="m-0 inline-block max-w-full" style={{ width: size }}>
      <svg
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        viewBox="0 0 480 440"
        className="block h-auto w-full overflow-visible font-sans"
      >
        <title id={`${id}-title`}>{label}</title>
        <desc id={`${id}-desc`}>
          Thang kỹ năng từ 0 đến {tiers}. Vùng vàng là tiến độ của bạn.
          {overlay ? ' Nét đứt là yêu cầu của cấp đang khoá.' : ''} Ngôi sao
          đánh dấu nhóm có lợi thế cung hoàng đạo.
        </desc>
        <defs>
          <radialGradient id={`${id}-fill`}>
            <stop stopColor={palette.softGold} stopOpacity=".35" />
            <stop offset="1" stopColor={palette.starlight} stopOpacity=".12" />
          </radialGradient>
        </defs>
        {Array.from({ length: tiers }, (_, ring) => (
          <polygon
            key={ring}
            points={axes
              .map((_, i) => point(i, (radius * (ring + 1)) / tiers).join(','))
              .join(' ')}
            fill="none"
            stroke={palette.moonlight}
            strokeOpacity={ring === tiers - 1 ? 0.6 : 0.25}
            strokeWidth=".8"
          />
        ))}
        {axes.map((axis, i) => (
          <g
            key={axis.key}
            opacity={highlight && highlight !== axis.key ? 0.3 : 1}
          >
            <line
              x1="240"
              y1="220"
              x2={point(i, radius)[0]}
              y2={point(i, radius)[1]}
              stroke={palette.moonlight}
              strokeOpacity=".4"
            />
            {Array.from({ length: tiers }, (_, r) => (
              <circle
                key={r}
                cx={point(i, (radius * (r + 1)) / tiers)[0]}
                cy={point(i, (radius * (r + 1)) / tiers)[1]}
                r="1.3"
                fill={palette.moonlight}
              />
            ))}
          </g>
        ))}
        {overlay && (
          <polygon
            points={polygon(overlay)}
            fill="none"
            stroke={palette.mist}
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
        )}
        <polygon
          points={polygon(values)}
          fill={`url(#${id}-fill)`}
          stroke={palette.starlight}
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 5px #d4b06a55)' }}
          opacity={highlight ? 0.45 : 1}
        />
        {axes.map((axis, i) => {
          const [x, y] = point(i, radius + 55);
          const [vx, vy] = point(i, (radius * value(values, axis.key)) / tiers);
          return (
            <g
              key={axis.key}
              opacity={highlight && highlight !== axis.key ? 0.3 : 1}
            >
              <circle
                cx={vx}
                cy={vy}
                r="3.5"
                fill={palette.softGold}
                stroke={palette.deepSpace}
              />
              <foreignObject x={x - 60} y={y - 32} width="120" height="64">
                <div
                  className="flex h-full items-center justify-center text-center text-[12px] leading-snug text-ink-muted"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {axis.label}
                  {axis.starred && (
                    <span className="ml-1 text-gold-300">★</span>
                  )}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      <table className="visually-hidden">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Nhóm</th>
            <th scope="col">Tiến độ</th>
            {overlay && <th scope="col">Yêu cầu</th>}
          </tr>
        </thead>
        <tbody>
          {axes.map((axis) => (
            <tr key={axis.key}>
              <th scope="row">
                {axis.label}
                {axis.starred ? ' (lợi thế cung hoàng đạo)' : ''}
              </th>
              <td>
                {value(values, axis.key)}/{tiers}
              </td>
              {overlay && (
                <td>
                  {value(overlay, axis.key)}/{tiers}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
