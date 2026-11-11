/**
 * Kiểu dữ liệu của AI-5 (panel ba judge).
 *
 * Theo thiết kế ngày 11/11/2026: ERD-03 `rubric_criterion` (anchor_2,
 * anchor_1, anchor_0, counterproductive_signs), ERD-06 `judge_score` và
 * `criterion_grade`, `openapi.yaml` schema `Score` / `ScoreOrNotApplicable`
 * (D-116): mức 0 chưa đạt · 1 đạt · 2 làm tốt, hoặc `null` khi câu trả lời
 * không cho cơ hội thể hiện tiêu chí ("không xét", bỏ khỏi trung bình). Cờ
 * phản tác dụng ghi riêng, không trộn vào mức.
 */
import type { Activity } from '@datn/game-core';

export type JudgeScore = 0 | 1 | 2;

/** Một tiêu chí của rubric, do chuyên gia nghề viết (ERD-03 `rubric_criterion`). */
export interface RubricCriterion {
  id: string;
  /** Năng lực được quan sát, ví dụ "Giải quyết vấn đề". */
  name: string;
  anchor2: string;
  anchor1: string;
  anchor0: string;
  /** Hành vi bật cờ phản tác dụng, ví dụ đổ lỗi, xúc phạm. Không có thì judge vẫn có thể bật cờ theo nghĩa chung. */
  counterproductiveSigns?: string | null;
}

/** Một judge chấm một tiêu chí (ERD-06 `judge_score`). */
export interface Judgment {
  criterionId: string;
  /** `null` = không xét. */
  score: JudgeScore | null;
  counterproductive: boolean;
  /** Trích nguyên văn từ câu người chơi (đã khử định danh); rỗng khi không xét. */
  quote: string;
  rationale: string;
}

/**
 * Rubric của kịch bản prototype: `observes[]` có ba mốc `+2 / 0 / -1`. Ánh xạ
 * sang thang 0/1/2 của thiết kế theo thứ tự: +2 → 2, 0 → 1, −1 → 0. Prototype
 * chưa có `counterproductive_signs`.
 */
export function criteriaFromActivity(activity: Activity): RubricCriterion[] {
  return activity.observes.map((observe, i) => ({
    id: `${activity.activity_id}-k${i + 1}`,
    name: observe.skill,
    anchor2: observe.anchors['+2'],
    anchor1: observe.anchors['0'],
    anchor0: observe.anchors['-1'],
    counterproductiveSigns: null,
  }));
}
