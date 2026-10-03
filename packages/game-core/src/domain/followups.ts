/**
 * Lời NPC cho lượt đào sâu.
 *
 * Bản thật do AI sinh tại chỗ từ `activity.followup_goal`. Ở prototype là câu
 * viết sẵn — và sự tồn tại của câu chính là điều kiện mở lượt đào sâu, nên
 * engine cũng tra vào đây.
 */
export interface FollowupLine {
  /** `npc_id` trong `scenario.cast`. */
  who: string;
  text: string;
}

/**
 * Khoá là `"<scenarioKey>:<activityId>"`.
 *
 * Xuất ra ngoài để script seed đọc được — đây là nội dung, không phải luật,
 * nên nó đang trên đường chuyển vào database cùng với kịch bản.
 */
export const FOLLOWUP_LINES: Record<string, FollowupLine> = {
  'SWE_BACKEND_L3_S_INCIDENT:a2': {
    who: 'an',
    text: 'Chuẩn. Thế còn cái endpoint này — nó có giới hạn số đơn trả về không? Anh hỏi thật đấy.',
  },
  'SWE_BACKEND_L3_S_INCIDENT:a3': {
    who: 'an',
    text: 'Ừ. Thế nếu khách sỉ đó vẫn đặt thêm đơn mới thì phần cache kia xử lý sao?',
  },
  'SWE_BACKEND_L1_S_EXEC:a4': {
    who: 'an',
    text: 'Ok. Thế em sửa bằng cách nào, và có chỗ nào em thấy chưa chắc không?',
  },
};

export const findFollowupLine = (
  scenarioKey: string,
  activityId: string,
): FollowupLine | undefined => FOLLOWUP_LINES[`${scenarioKey}:${activityId}`];

/** Trần số lượt đào sâu cho cả màn chơi, theo cấp bậc. Cao hơn thì được hỏi kỹ hơn. */
export const followupCap = (band: string): number =>
  ({ L1: 2, L2: 2, L3: 3, L4: 3, L5: 3 })[band] ?? 4;
