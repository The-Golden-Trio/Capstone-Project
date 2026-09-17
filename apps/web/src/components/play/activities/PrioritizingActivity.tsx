import type { Activity } from '@datn/game-core';
import { cx } from '../../../lib/cx';
import { Button } from '../../ui/Button';

interface PrioritizingActivityProps {
  activity: Activity;
  picked: string[];
  hintUsed: boolean;
  onToggle: (itemId: string) => void;
  onHint: () => void;
  onSubmit: () => void;
}

/** Chọn đúng `pick_count` việc làm trước. Ghi chú của từng việc là manh mối. */
export function PrioritizingActivity({
  activity,
  picked,
  hintUsed,
  onToggle,
  onHint,
  onSubmit,
}: PrioritizingActivityProps) {
  const limit = activity.pick_count ?? 0;
  const full = picked.length >= limit;
  const canHint = activity.hints.length > 0 && !hintUsed;

  return (
    <>
      <div className="flex flex-col gap-2">
        {(activity.items ?? []).map((item) => {
          const on = picked.includes(item.item_id);
          return (
            <button
              key={item.item_id}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => onToggle(item.item_id)}
              className={cx(
                'flex w-full items-start gap-3 rounded-[9px] border bg-surf px-[15px] py-[13px] text-left text-ink transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                on ? 'border-gold bg-gold-soft' : 'border-line hover:not-disabled:border-gold',
              )}
            >
              <span
                className={cx(
                  'mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] text-[11px] text-bg',
                  on ? 'border-gold bg-gold' : 'border-line',
                )}
                aria-hidden="true"
              >
                {on ? '✓' : ''}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[13.5px] font-medium leading-snug">
                  {item.text}
                </span>
                {item.note && (
                  <span className="mt-1 block text-[12.5px] leading-snug text-muted">
                    {item.note}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-[11.5px] text-muted">
          đã chọn {picked.length}/{limit}
        </span>
        {canHint && (
          <Button variant="highlight" onClick={onHint}>
            Xem gợi ý
          </Button>
        )}
        <span className="flex-1" />
        <Button variant="primary" onClick={onSubmit} disabled={!full}>
          Xong
        </Button>
      </div>

      {canHint && (
        <p className="mt-2.5 text-[11.5px] leading-snug text-gold">
          Xem gợi ý thì câu này chỉ đạt được mức trung bình.
        </p>
      )}
    </>
  );
}
