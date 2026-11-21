import type { ActivityContent } from '../../../api/types';
import { cx } from '../../../lib/cx';
import { TASK_TYPE_LABEL } from '../../../lib/labels';
import type { Hint } from '../lint';
import { activityIndexOfPath } from '../lint';
import { flowOrder, reachable } from './flow';

/**
 * Sơ đồ luồng màn tuyến tính (Seed §D1): mở đầu → … → kết. Mỗi ô hiện dạng
 * trả lời được phép, số tiêu chí và số gợi ý; bấm để mở activity.
 */
export function FlowStrip({
  activities,
  hints = [],
  selected,
  onSelect,
}: {
  activities: ActivityContent[];
  hints?: Hint[];
  selected?: number;
  onSelect?: (index: number) => void;
}) {
  const order = flowOrder(activities);
  const onPath = reachable(activities);
  return (
    <ol
      aria-label="Luồng màn"
      className="mb-4 flex flex-wrap items-stretch gap-y-2"
    >
      {order.map((i, pos) => {
        const a = activities[i];
        const n = hints.filter((h) => activityIndexOfPath(h.path) === i).length;
        const role = a.isOrigin ? 'Mở đầu' : !a.forwardTo ? 'Kết' : 'Giữa';
        return (
          <li key={a.key} className="flex items-center">
            {pos > 0 && (
              <span aria-hidden="true" className="px-1.5 text-ink-faint">
                →
              </span>
            )}
            <button
              type="button"
              onClick={() => onSelect?.(i)}
              aria-pressed={selected === i}
              className={cx(
                'min-w-36 rounded-xl border px-3 py-2 text-left text-[12px] transition-colors',
                selected === i
                  ? 'border-line-strong/70 bg-surface'
                  : 'border-line bg-night-900/35 hover:border-line-strong',
                !onPath.has(i) && 'border-dashed border-danger/60',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-mono font-semibold text-ink">
                  {a.key}
                </span>
                <span className="eyebrow text-[9px]">{role}</span>
              </span>
              <span className="mt-0.5 block text-ink-faint">
                {a.allowedTypes.map((t) => TASK_TYPE_LABEL[t]).join(' / ')}
              </span>
              <span className="block text-ink-faint">
                {a.rubric.length} tiêu chí
                {n > 0 && <span className="text-warning"> · {n} gợi ý</span>}
                {!onPath.has(i) && (
                  <span className="text-danger"> · không với tới</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
