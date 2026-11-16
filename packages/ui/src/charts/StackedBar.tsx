import { palette } from '../tokens';
export interface StackedBarItem {
  key: string;
  label: string;
  value: number;
  color: string;
}
export function StackedBar({
  items,
  label = 'Phân bố',
  height = 12,
}: {
  items: StackedBarItem[];
  label?: string;
  height?: number;
}) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`${label}: ${items.map((item) => `${item.label} ${item.value.toLocaleString('vi-VN')}`).join(', ')}`}
        className="flex overflow-hidden rounded-full bg-night-700 ring-1 ring-line"
        style={{ height }}
      >
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              width: `${total > 0 ? (Math.max(0, item.value) / total) * 100 : 0}%`,
              background: item.color || palette.moonlight,
            }}
          />
        ))}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
        {items.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: item.color }}
            />
            {item.label}
            <span className="tabular text-ink">
              {item.value.toLocaleString('vi-VN')}
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
