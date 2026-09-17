/**
 * Chấm các hoạt động có đáp án cấu trúc — không cần đọc hiểu, chỉ cần so.
 * Thuần: cùng đầu vào luôn cho cùng kết quả, nên dễ dò khi điểm ra sai.
 */
import type { Activity, Anchor } from '../../data/schema';

export interface Grade {
  anchor: Anchor;
  /** Câu giải thích hiện trong phần tổng kết cuối màn. */
  why: string;
}

const anchorsOf = (activity: Activity) => activity.observes[0].anchors;

/** CHOICE: mốc đã ghi sẵn trong `optionGrade`. */
export function gradeChoice(activity: Activity, optionIndex: number): Grade {
  const anchor = activity.optionGrade?.[optionIndex] ?? '0';
  const why = activity.optionWhy?.[optionIndex] ?? anchorsOf(activity)[anchor];
  return { anchor, why };
}

/**
 * ORDERING: đếm số cặp sai thứ tự (inversions) so với `correct_order`.
 * Không cặp nào sai = +2, tối đa hai cặp = 0, nhiều hơn = -1.
 */
export function gradeOrdering(activity: Activity, order: string[]): Grade {
  const correct = activity.correct_order ?? [];
  const positionOf = (id: string) => correct.indexOf(id);

  let inversions = 0;
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      if (positionOf(order[i]) > positionOf(order[j])) inversions++;
    }
  }

  const anchor: Anchor = inversions === 0 ? '+2' : inversions <= 2 ? '0' : '-1';
  return {
    anchor,
    why: `${anchorsOf(activity)[anchor]} (${inversions} cặp sai thứ tự)`,
  };
}

/**
 * PRIORITIZING: chọn nhầm thứ cấm, hoặc bỏ sót thứ bắt buộc, là -1.
 * Đủ bắt buộc mà chạm được thứ "nên chọn" là +2, còn lại là 0.
 */
export function gradePrioritizing(activity: Activity, picked: string[]): Grade {
  const anchors = anchorsOf(activity);

  if ((activity.must_not_pick ?? []).some((id) => picked.includes(id)))
    return { anchor: '-1', why: anchors['-1'] };

  if (!(activity.must_pick ?? []).every((id) => picked.includes(id)))
    return { anchor: '-1', why: anchors['-1'] };

  return (activity.should_pick ?? []).some((id) => picked.includes(id))
    ? { anchor: '+2', why: anchors['+2'] }
    : { anchor: '0', why: anchors['0'] };
}
