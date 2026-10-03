import type { ActivityType } from '@datn/game-core';
import { cx } from '../../lib/cx';

/**
 * Tên loại hoạt động, nói theo cách người chơi hiểu.
 *
 * "PRIORITIZING" là từ của người dựng dữ liệu, không phải của người chơi.
 * Trong màn chơi, việc phải làm mới là thứ đáng hiện ra.
 */
const OBJECTIVE: Record<ActivityType, string> = {
  CHOICE: 'Chọn hướng xử lý',
  ORDERING: 'Sắp đúng thứ tự',
  PRIORITIZING: 'Chọn việc làm trước',
  FREETEXT: 'Trả lời bằng lời của bạn',
};

/**
 * Việc phải làm ở cảnh này, cộng một thanh cho biết đi được tới đâu.
 *
 * Thay cho dòng "3/4 · prioritizing" ở bản cũ — thông tin thì có, nhưng nói
 * bằng giọng của một bài trắc nghiệm.
 */
export function ObjectiveStrip({
  type,
  total,
  current,
  followup,
}: {
  type: ActivityType;
  total: number;
  current: number;
  /** Đang ở lượt NPC hỏi vặn, không phải câu chính. */
  followup?: { used: number; limit: number } | null;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <i
            key={i}
            className={cx(
              'scene-step',
              i < current && 'done',
              i === current && 'now',
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
          Cảnh {current + 1}/{total}
        </span>
        <span className="text-[13px] font-semibold text-[var(--accent)]">
          {followup ? 'Họ hỏi thêm một câu' : OBJECTIVE[type]}
        </span>
        {followup && (
          <span className="font-mono text-[10px] text-muted">
            đào sâu {followup.used}/{followup.limit}
          </span>
        )}
      </div>
    </div>
  );
}
