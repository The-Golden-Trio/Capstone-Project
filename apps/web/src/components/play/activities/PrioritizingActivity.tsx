import type { Activity } from '@datn/game-core';
import { cx } from '../../../lib/cx';
import { Button } from '../../ui/Button';

interface PrioritizingActivityProps {
  activity: Pick<Activity, 'items' | 'pick_count'> &
    Partial<Pick<Activity, 'hints'>>;
  picked: string[];
  hintUsed: boolean;
  /** Có gợi ý không; mặc định đọc từ `activity.hints`. */
  hintAvailable?: boolean;
  /**
   * Xem gợi ý không hạ điểm (Q5, FR-13 mới). Màn chơi cũ vẫn để `false` vì
   * engine của nó còn hạ trần điểm khi xem gợi ý.
   */
  hintFree?: boolean;
  onToggle: (itemId: string) => void;
  onHint: () => void;
  onSubmit: () => void;
}

/** Chọn đúng `pick_count` việc làm trước. Ghi chú của từng việc là manh mối. */
export function PrioritizingActivity({
  activity,
  picked,
  hintUsed,
  hintAvailable,
  hintFree = false,
  onToggle,
  onHint,
  onSubmit,
}: PrioritizingActivityProps) {
  const limit = activity.pick_count ?? 0;
  const full = picked.length >= limit;
  const canHint =
    (hintAvailable ?? (activity.hints?.length ?? 0) > 0) && !hintUsed;

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
                'action-card flex w-full items-start gap-3 rounded-xl border bg-surf px-4 py-3.5 text-left text-ink disabled:cursor-not-allowed disabled:opacity-40',
                on
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-line',
              )}
            >
              <span
                className={cx(
                  'mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] text-[11px] text-bg transition-colors',
                  on
                    ? 'border-[var(--accent)] bg-[var(--accent)]'
                    : 'border-line',
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
        <span className="text-[11.5px] text-muted">
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
          {hintFree
            ? 'Xem gợi ý không trừ điểm.'
            : 'Xem gợi ý thì câu này chỉ đạt được mức trung bình.'}
        </p>
      )}
    </>
  );
}
