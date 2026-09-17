import type { Anchor } from '../../data/schema';

export type { Anchor };

/** Thứ hạng của mốc hành vi — dùng để so "lượt đào sâu có khá hơn không". */
export const anchorRank: Record<Anchor, number> = { '-1': 0, '0': 1, '+2': 2 };

export interface GradeTextInput {
  /** Nguyên văn câu người chơi gõ. */
  text: string;
  scenarioKey: string;
  activityId: string;
  /** Tên kỹ năng đang được quan sát, ví dụ "Giải quyết vấn đề". */
  skill: string;
}

/**
 * Chấm một câu gõ tự do.
 *
 * Bản prototype so khớp từ khoá; bản thật sẽ để AI đọc rồi đối chiếu ba mốc
 * hành vi trong `observes[].anchors`. Cùng một cơ chế, khác bộ óc — nên chỗ
 * thay là đúng một interface này, không file nào khác phải đổi.
 */
export interface TextGrader {
  grade(input: GradeTextInput): Anchor;
  /**
   * Câu trả lời có chạm tới "bí mật" của kịch bản không — điều kiện mở
   * kết cục SECRET.
   */
  hitsSecret(input: Omit<GradeTextInput, 'skill'>): boolean;
}
