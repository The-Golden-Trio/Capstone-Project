import type { Activity } from '@datn/game-core';

const KEYCAPS = 'ABCDE';

/**
 * Các hướng xử lý, bày ra như thẻ hành động.
 *
 * Bản cũ là những dòng chữ có viền, xếp dọc — đúng hình dáng của một câu hỏi
 * trắc nghiệm. Ở đây mỗi lựa chọn là một việc sắp làm: nhấc lên khi rê chuột,
 * lún xuống khi bấm, và có vệt màu của nghề chạy dọc bên trái.
 */
export function ChoiceActivity({
  activity,
  onPick,
}: {
  activity: Activity;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {(activity.options ?? []).map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => onPick(index)}
          className="action-card flex w-full items-start gap-3 rounded-[10px] border border-line bg-surf py-3.5 pl-4 pr-4 text-left text-[13.5px] leading-normal text-ink"
        >
          <span className="keycap mt-px font-mono text-[10px] text-muted">
            {KEYCAPS[index]}
          </span>
          <span className="flex-1">{option}</span>
        </button>
      ))}
    </div>
  );
}
