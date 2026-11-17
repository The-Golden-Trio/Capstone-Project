import { useId } from 'react';
import { palette } from '../tokens';
export interface DualBarItem {
  key: string;
  label: string;
  self: number | null;
  after: number | null;
  count: number;
}
const decimal = (value: number) =>
  value.toLocaleString('vi-VN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
export function DualBars({
  items,
  label = 'Sở thích RIASEC',
}: {
  items: DualBarItem[];
  label?: string;
}) {
  const id = useId();
  const hasSelf = items.some((i) => i.self !== null);
  const hasAfter = items.some((i) => i.after !== null);
  const height = (value: number | null) =>
    value === null || !Number.isFinite(value)
      ? 0
      : (Math.min(3, Math.max(1, value)) - 1) * 75;
  return (
    <figure className="m-0 w-full">
      <svg
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        viewBox={`0 0 ${Math.max(items.length, 1) * 100 + 50} 290`}
        className="block w-full font-sans"
      >
        <title id={`${id}-title`}>{label}</title>
        <desc id={`${id}-desc`}>
          So sánh sở thích tự kể và sau khi thử, thang 1 đến 3. Cột nét gạch là
          sau khi thử; số phía trên là độ thay đổi.
        </desc>
        <defs>
          <pattern
            id={`${id}-hatch`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <rect
              width="6"
              height="6"
              fill={palette.deepSpace}
              fillOpacity=".75"
            />
            <line
              x1="0"
              x2="0"
              y2="6"
              stroke={palette.softGold}
              strokeWidth="2"
            />
          </pattern>
        </defs>
        {[1, 2, 3].map((tier) => (
          <g key={tier}>
            <text
              x="12"
              y={224 - (tier - 1) * 75}
              fill={palette.mist}
              fontSize="11"
            >
              {tier}
            </text>
            <line
              x1="35"
              x2={items.length * 100 + 35}
              y1={220 - (tier - 1) * 75}
              y2={220 - (tier - 1) * 75}
              stroke={palette.moonlight}
              strokeOpacity=".25"
              strokeDasharray="3 5"
            />
          </g>
        ))}
        {items.map((item, i) => {
          const x = 65 + i * 100;
          const complete = item.self !== null && item.after !== null;
          // Chỉ có một nguồn cho cả biểu đồ: không vẽ chênh lệch, không báo thiếu.
          const single = !hasAfter || !hasSelf;
          const delta = complete
            ? (item.after as number) - (item.self as number)
            : 0;
          return (
            <g key={item.key}>
              <rect
                x={x}
                y="70"
                width="42"
                height="150"
                rx="5"
                fill={palette.moonlight}
                fillOpacity=".1"
              />
              {item.self !== null && (
                <rect
                  x={x}
                  y={220 - height(item.self)}
                  width="42"
                  height={Math.max(2, height(item.self))}
                  rx="4"
                  fill={palette.starlight}
                  fillOpacity=".65"
                />
              )}
              {item.after !== null && (
                <rect
                  x={x + 9}
                  y={220 - height(item.after)}
                  width="24"
                  height={Math.max(2, height(item.after))}
                  rx="3"
                  fill={`url(#${id}-hatch)`}
                  stroke={palette.softGold}
                />
              )}
              <text
                x={x + 21}
                y={
                  Math.min(220 - height(item.self), 220 - height(item.after)) -
                  12
                }
                textAnchor="middle"
                fill={complete ? palette.softGold : palette.mist}
                fontSize="12"
              >
                {single
                  ? ''
                  : complete
                    ? `${delta < 0 ? '−' : '+'}${decimal(Math.abs(delta))}`
                    : '—'}
              </text>
              <foreignObject x={x - 24} y="233" width="90" height="55">
                <div className="text-center text-[11px] leading-tight text-ink-muted">
                  <div>{item.label}</div>
                  <div className="mt-1 text-[9px] text-ink-faint">
                    {single
                      ? hasAfter
                        ? `${item.count} lượt thử`
                        : ''
                      : !complete
                        ? 'chưa đủ dữ liệu'
                        : `${item.count} lượt thử`}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap justify-center gap-5 text-xs text-ink-muted">
        {hasSelf && (
          <span>
            <span
              aria-hidden
              className="mr-2 inline-block h-2.5 w-4 rounded-sm bg-gold-500/65"
            />
            Tự kể
          </span>
        )}
        {hasAfter && (
          <span>
            <svg
              aria-hidden
              width="16"
              height="10"
              className="mr-2 inline-block"
            >
              <rect
                width="16"
                height="10"
                fill={`url(#${id}-hatch)`}
                stroke={palette.softGold}
              />
            </svg>
            Sau khi thử
          </span>
        )}
      </figcaption>
      <table className="visually-hidden">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Nhóm</th>
            <th>Tự kể</th>
            <th>Sau khi thử</th>
            <th>Số lượt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.key}>
              <th scope="row">{item.label}</th>
              <td>
                {item.self === null ? 'chưa đủ dữ liệu' : decimal(item.self)}
              </td>
              <td>
                {item.after === null ? 'chưa đủ dữ liệu' : decimal(item.after)}
              </td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
