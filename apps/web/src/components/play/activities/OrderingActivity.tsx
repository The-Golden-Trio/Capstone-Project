import type { Activity } from '../../../data/schema';
import { Button } from '../../ui/Button';

interface OrderingActivityProps {
  activity: Activity;
  order: string[];
  onMove: (index: number, direction: -1 | 1) => void;
  onSubmit: () => void;
}

/** Sắp xếp các bước theo đúng thứ tự. Chấm bằng số cặp đảo, không phải đúng/sai. */
export function OrderingActivity({
  activity,
  order,
  onMove,
  onSubmit,
}: OrderingActivityProps) {
  const textOf = (itemId: string) =>
    activity.items?.find((i) => i.item_id === itemId)?.text ?? itemId;

  return (
    <>
      <div className="flex flex-col gap-2">
        {order.map((itemId, index) => (
          <div
            key={itemId}
            className="flex items-stretch gap-[9px] overflow-hidden rounded-[9px] border border-line bg-surf"
          >
            <span className="flex w-8 shrink-0 items-center justify-center bg-chip font-mono text-[12px] font-bold text-gold-2">
              {index + 1}
            </span>
            <span className="flex-1 self-center py-3 pl-0.5 pr-1 text-[13.5px] leading-snug">
              {textOf(itemId)}
            </span>
            <span className="flex flex-col border-l border-line-2">
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-label={`Đưa "${textOf(itemId)}" lên trên`}
                className="w-9 flex-1 border-b border-line-2 text-[12px] text-muted hover:not-disabled:bg-chip hover:not-disabled:text-gold-2 disabled:cursor-not-allowed disabled:opacity-25"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === order.length - 1}
                aria-label={`Đưa "${textOf(itemId)}" xuống dưới`}
                className="w-9 flex-1 text-[12px] text-muted hover:not-disabled:bg-chip hover:not-disabled:text-gold-2 disabled:cursor-not-allowed disabled:opacity-25"
              >
                ▼
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className="flex-1" />
        <Button variant="primary" onClick={onSubmit}>
          Xong
        </Button>
      </div>
    </>
  );
}
