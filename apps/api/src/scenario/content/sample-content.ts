/**
 * Một `ScenarioContent` hợp lệ theo mọi luật của `ContentValidator` ở cấp
 * L3–L5: 3 activity tự luận, 3 lượt hỏi thêm, 12,5 phút. Dùng cho test và cho
 * bộ sinh giả `AI_MODE=fake` (chỉ dev, D-92). Chữ trong đây là chữ mẫu, không
 * phải nội dung nghề.
 */
import type { ScenarioContent } from '../dto/scenario-content.schema';

export function sampleContent(
  skillIds: string[],
  tag = '[mẫu]',
): ScenarioContent {
  const [s1, s2 = s1, s3 = s2] = skillIds;
  const activity = (
    key: string,
    forwardTo: string | null,
    competencyId: string,
    isOrigin = false,
  ) => ({
    key,
    isOrigin,
    forwardTo,
    setup: `${tag} Bối cảnh của bước ${key}.`,
    npcLine: `${tag} Lời của trưởng nhóm ở bước ${key}.`,
    inputPrompt: `${tag} Bạn sẽ làm gì ở bước ${key}?`,
    jobScope: `${tag} Được tự quyết trong phạm vi việc của mình; không tự quyết thay trưởng nhóm.`,
    closingLine: `${tag} Ừ, vậy làm tiếp đi.`,
    allowedTypes: ['FREE_TEXT' as const],
    followupLimit: 1,
    followupGoal: `${tag} Làm rõ lý do của lựa chọn ở bước ${key}.`,
    defaultFollowup: `${tag} Vì sao bạn chọn cách đó?`,
    hints: [`${tag} Thử nghĩ xem ai bị ảnh hưởng.`],
    rubric: [
      {
        competencyId,
        anchor2: `${tag} Nêu đủ bước, lý do và rủi ro.`,
        anchor1: `${tag} Nêu được bước làm nhưng thiếu lý do.`,
        anchor0: `${tag} Không nêu được bước làm cụ thể.`,
        counterproductiveSigns: `${tag} Đổ lỗi cho người khác.`,
      },
    ],
  });
  return {
    intro: `${tag} Mở đầu tình huống.`,
    situation: `${tag} Tình huống cụ thể.`,
    stakes: `${tag} Điều gì xảy ra nếu làm không tốt.`,
    estimatedMinutes: 12.5,
    cast: [
      {
        npcKey: 'lead',
        name: 'An',
        roleInScene: 'Trưởng nhóm',
        pressure: `${tag} Cần kết quả trước cuối ngày.`,
        voice: `${tag} Ngắn gọn, thẳng.`,
      },
    ],
    activities: [
      activity('a1', 'a2', s1, true),
      activity('a2', 'a3', s2),
      activity('a3', null, s3),
    ],
    randomEvents: [],
    endings: [
      {
        type: 'SECRET',
        priority: 1,
        minTotalScore: null,
        extraBehaviour: `${tag} Hỏi lại người dùng cuối trước khi sửa.`,
        text: `${tag} Bạn phát hiện nguyên nhân sâu hơn.`,
        reveals: `${tag} Nhận ra yêu cầu ban đầu bị hiểu sai.`,
      },
      {
        type: 'GOOD',
        priority: 2,
        minTotalScore: 4,
        extraBehaviour: null,
        text: `${tag} Việc xong, cả nhóm biết bạn làm.`,
        reveals: null,
      },
      {
        type: 'BAD',
        priority: 3,
        minTotalScore: null,
        extraBehaviour: null,
        text: `${tag} Việc chưa xong, người khác phải gánh.`,
        reveals: null,
      },
    ],
    sideQuests: [],
  };
}
