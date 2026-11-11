/**
 * Gộp kết quả ba judge thành điểm của từng tiêu chí (ERD-06 `criterion_grade`).
 * Hàm thuần, không gọi mạng — test được hết các ca mà không tốn tiền.
 *
 * Theo thiết kế:
 *   - Ba judge: mức là trung vị (§5.3.6, CL-04 "median of 3").
 *   - Lệch hơn `disagreementThreshold` mức → `highDisagreement`, AI-3 đưa ca
 *     này cho chuyên gia.
 *   - Một ghế hỏng: theo `whenOneJudgeDown` (xem judge.profile.ts — D-108 và
 *     SD-01 đang mâu thuẫn).
 *
 * TẠM, thiết kế chưa nói, chốt cùng nhóm:
 *   - "Không xét" (`null`): tiêu chí là không xét khi ít nhất nửa số judge nói
 *     không xét; còn lại lấy trung vị của các mức có số (hai mức thì lấy mức
 *     thấp hơn, như cách nhóm gộp hai người chấm ở §7.3). Judge bất đồng về
 *     việc có xét hay không cũng tính là lệch, để chuyên gia xem.
 *   - Cờ phản tác dụng: theo đa số (trung vị của có/không) — hai judge thì phải
 *     cả hai cùng bật.
 */
import type { OneJudgeDownPolicy } from './judge.profile';
import type { JudgeScore, Judgment } from './judge.types';

export type CombineMethod = 'median_of_3' | 'lower_of_2';

export interface CriterionGrade {
  criterionId: string;
  score: JudgeScore | null;
  counterproductive: boolean;
  method: CombineMethod;
  highDisagreement: boolean;
  /** Mức của từng judge đã chấm được, theo thứ tự ghế — để chuyên gia xem. */
  judgeScores: Array<JudgeScore | null>;
}

export type PanelVerdict =
  | {
      status: 'graded';
      method: CombineMethod;
      panelSize: number;
      grades: CriterionGrade[];
    }
  /** Không đủ judge để chấm theo chính sách; câu trả lời được giữ, chấm lại sau (NFR-04). */
  | {
      status: 'pending';
      panelSize: number;
      reason: 'one_judge_down' | 'too_few_judges';
    };

export interface CombineOptions {
  disagreementThreshold: number;
  whenOneJudgeDown: OneJudgeDownPolicy;
}

/** Trung vị; số phần tử chẵn thì lấy phần tử thấp hơn ở giữa (có lợi cho sự thận trọng). */
function lowerMedian(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

export function combineJudgments(
  criterionIds: readonly string[],
  /** Mỗi phần tử là kết quả của một ghế chấm được; ghế hỏng không có mặt. */
  panel: ReadonlyArray<readonly Judgment[]>,
  options: CombineOptions,
): PanelVerdict {
  const panelSize = panel.length;
  if (panelSize < 2)
    return { status: 'pending', panelSize, reason: 'too_few_judges' };
  if (panelSize === 2 && options.whenOneJudgeDown === 'pending')
    return { status: 'pending', panelSize, reason: 'one_judge_down' };
  const method: CombineMethod = panelSize >= 3 ? 'median_of_3' : 'lower_of_2';

  const grades = criterionIds.map((criterionId): CriterionGrade => {
    const own = panel.map((judgments) => {
      const found = judgments.find((j) => j.criterionId === criterionId);
      if (!found)
        throw new Error(
          `Judge thiếu tiêu chí ${criterionId} — kết quả chưa qua checkJudgeOutput`,
        );
      return found;
    });
    const judgeScores = own.map((j) => j.score);
    const numeric = judgeScores.filter((s): s is JudgeScore => s !== null);
    const notApplicable = judgeScores.length - numeric.length;

    const score: JudgeScore | null =
      notApplicable * 2 >= judgeScores.length
        ? null
        : (lowerMedian(numeric) as JudgeScore);
    const spread =
      numeric.length > 0 ? Math.max(...numeric) - Math.min(...numeric) : 0;
    const split = notApplicable > 0 && numeric.length > 0;

    return {
      criterionId,
      score,
      counterproductive:
        own.filter((j) => j.counterproductive).length * 2 > own.length,
      method,
      highDisagreement: spread > options.disagreementThreshold || split,
      judgeScores,
    };
  });

  return { status: 'graded', method, panelSize, grades };
}
