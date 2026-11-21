/**
 * Hướng dẫn soạn theo research (`research/reports/Seed scenario JobQuest.md`,
 * `Luật dẫn truyện JobQuest.md`) và quyết định D-22, D-81, D-90. Chỉ là lời
 * dẫn trên giao diện, không thêm trường và không chặn nộp: cổng nộp vẫn là
 * `ContentValidator` ở máy chủ. Mỗi mục ghi nguồn để người soạn tra lại.
 */

export interface Guide {
  text: string;
  source: string;
}

/** Lời dẫn cạnh từng trường của `ScenarioContent`. */
export const FIELD_GUIDE = {
  intro: {
    text: 'Người chơi đọc đầu tiên: họ là ai, ở đâu, đang làm việc gì. Không nhắc lại tình huống.',
    source: 'Seed §A2',
  },
  situation: {
    text: '2–4 câu, lời thường. Thuật ngữ kèm lời giải thích, con số kèm mức so sánh ("thường 0,2 giây, sáng nay 4 giây"). Không nêu tên công ty.',
    source: 'Seed §1, §B1',
  },
  setup: {
    text: 'Bối cảnh ngay trước câu hỏi. Màn phải tự mang theo mọi dữ kiện cần để trả lời.',
    source: 'Seed §1',
  },
  npcLine: {
    text: 'Chia thành nhịp: mỗi nhịp một ý, 1–2 câu. Câu hỏi cho người chơi luôn là câu cuối. NPC chỉ nói điều vai của mình biết.',
    source: 'Seed §C2, §C3 · Luật A3',
  },
  inputPrompt: {
    text: 'Hỏi cách xử lý ("bạn làm gì tiếp?"), không hỏi kiến thức có sẵn ("lỗi này tên là gì?").',
    source: 'Seed §1, §D3',
  },
  jobScope: {
    text: 'Ghi ba vế: được tự quyết gì · cần xin duyệt ai · không được làm gì. Điều cấm hay cần duyệt phải được nói ra trong lời dặn, không để người chơi tự đoán.',
    source: 'Seed §A2 (limits)',
  },
  closingLine: {
    text: 'Phản ứng theo vai và cảm xúc của NPC, không chấm đúng sai, không giảng bài.',
    source: 'Luật A6, R3',
  },
  castRole: {
    text: 'Seed khai vai, không khai người: ghi quan hệ với người chơi (trưởng nhóm, khách hàng…). Tên và giọng chỉ là gợi ý cho AI.',
    source: 'Seed §C1',
  },
  castPressure: {
    text: 'NPC muốn gì và đang chịu áp lực gì. Các NPC nên kéo về các hướng khác nhau; NPC nào cũng rảnh thì tình huống mất sức nặng.',
    source: 'Seed §C1 · điểm kiểm 6',
  },
  item: {
    text: 'Mỗi phương án phải hợp lý với một người làm thật, có lý do và phản ứng riêng. Không có phương án "ngớ ngẩn hiển nhiên".',
    source: 'D-81 · Luật A6 · điểm kiểm 2',
  },
  choiceScore: {
    text: 'Điểm là hiệu quả của phương án trong đúng tình huống này: 2 tốt, 1 chấp nhận được, 0 kém. Khoá chấm do chuyên gia đặt, AI không sửa.',
    source: 'Seed §E1 · D-81, D-90',
  },
  hint: {
    text: 'Chỉ hướng nhìn ("Em xem log DB chưa?"), không đưa đáp án ("Đây là N+1 query").',
    source: 'điểm kiểm 5',
  },
  anchor: {
    text: 'Viết bằng hành vi quan sát được trong câu trả lời, không bằng tính từ ("giao tiếp tốt").',
    source: 'Seed §E1 · điểm kiểm 4',
  },
  counterproductive: {
    text: 'Chỉ ghi hành vi gây hại ở bất kỳ đâu, hoặc phá một luật đã được nói ra trong màn.',
    source: 'Seed §E1',
  },
  randomEvent: {
    text: 'Sự kiện đổi đường đi, không đổi đề bài. Một sự cố khác hẳn ập tới là đã nhét scenario thứ hai vào.',
    source: 'điểm kiểm 8',
  },
  secretEnding: {
    text: 'Kết cục bí mật phải có ít nhất một activity cho người chơi làm được điều đó.',
    source: 'điểm kiểm 9',
  },
  sideQuest: {
    text: 'Nhiệm vụ phụ không chấm soft skill; làm xong được thưởng cố định.',
    source: 'Kinh tế và sức khoẻ · D-119',
  },
} satisfies Record<string, Guide>;

/** Phạm vi hậu quả của `stakes` theo cấp (Seed §B1). */
export function stakesGuide(levelNo: number): Guide {
  const scope =
    levelNo <= 2
      ? 'L1–L2: hậu quả nằm trong việc của chính người chơi.'
      : levelNo <= 5
        ? 'L3–L5: hậu quả chạm tới một tính năng hoặc một nhóm khách hàng.'
        : 'L6 trở lên: hậu quả chạm tới cả team hoặc doanh thu.';
  return {
    text: `Làm không tốt thì mất gì. ${scope}`,
    source: 'Seed §B1',
  };
}

/** Cấp mở của từng loại tình huống (D-22). */
export const ARCHETYPE_UNLOCK: Record<string, string> = {
  S_EXEC: 'mở từ L1',
  S_AMBIG: 'mở từ L2',
  S_INCIDENT: 'mở từ L3',
  S_CONFLICT: 'mở từ L4',
  S_REVIEW: 'mở từ L4',
  S_DECISION: 'mở từ L6',
};

export const COMPANY_NOTE: Guide = {
  text: 'Loại công ty đổi lời thoại, nhịp và văn hoá, không đổi thế nào là làm tốt. Lời canon không nêu tên công ty cụ thể.',
  source: 'Seed §G',
};

/** Câu dẫn cho ô ngữ cảnh: kể một lần thật (critical incident, AI-1). */
export const CONTEXT_PROMPTS: string[] = [
  'Chuyện gì đã xảy ra, lúc nào, gấp tới đâu?',
  'Những ai liên quan, mỗi người muốn gì?',
  'Bạn (hoặc người giỏi) đã làm gì, theo thứ tự nào?',
  'Làm tốt trông ra sao, làm kém trông ra sao?',
  'Ở cấp này người làm được tự quyết gì, phải xin ai duyệt?',
];

/** Một màn là gì (Seed khối 1), hiện ở D01 và D03. */
export const SCENE_PRINCIPLES: string[] = [
  'Một việc chính của cấp, dài 10–15 phút, cho trải nghiệm 1–2 kỹ năng chuyên môn trọng tâm.',
  'Màn tự đủ kiến thức: chấm cách xử lý, không chấm kiến thức có sẵn.',
  'Diễn giải bằng lời thường: thuật ngữ kèm giải thích, số kèm mức so sánh, mục tiêu nói thẳng ra.',
  'Cùng cấp không có hai màn trùng cả việc chính lẫn loại tình huống.',
];

export interface ChecklistItem {
  id: string;
  text: string;
  source: string;
}

/**
 * Điểm kiểm bằng mắt khi tự rà và khi duyệt: 9 câu của hướng dẫn sinh
 * scenario (`occupation-data/specs/HUONG-DAN-SINH-SCENARIO.md` mục 7), thêm
 * Luật A3 và Seed khối 1. Không thay tiêu chí duyệt của CA (FR-32).
 */
export const REVIEW_CHECKLIST: ChecklistItem[] = [
  {
    id: 'level-specific',
    text: 'Che tên nghề và cấp đi, màn này có dán được sang cấp khác không? Dán được là hỏng.',
    source: 'điểm kiểm 1',
  },
  {
    id: 'no-silly-option',
    text: 'Các phương án đóng: có cái nào loại được ngay trong nửa giây không?',
    source: 'điểm kiểm 2',
  },
  {
    id: 'closed-justified',
    text: 'Mỗi activity dạng đóng có lý do thuyết phục? Tình huống vẫn gõ tự do được thì nên để tự luận.',
    source: 'điểm kiểm 3',
  },
  {
    id: 'behaviour-anchors',
    text: 'Mốc chấm viết bằng hành vi quan sát được, không bằng tính từ.',
    source: 'điểm kiểm 4',
  },
  {
    id: 'hint-no-answer',
    text: 'Gợi ý chỉ hướng nhìn, không đưa thẳng đáp án.',
    source: 'điểm kiểm 5',
  },
  {
    id: 'npc-pressure',
    text: 'NPC có áp lực thật, kéo về các hướng khác nhau.',
    source: 'điểm kiểm 6',
  },
  {
    id: 'fictional',
    text: 'Không có tên công ty, sản phẩm thật hay số liệu trông như thật.',
    source: 'điểm kiểm 7',
  },
  {
    id: 'event-path',
    text: 'Sự kiện ngẫu nhiên đổi đường đi, không mở tình huống mới.',
    source: 'điểm kiểm 8',
  },
  {
    id: 'secret-reachable',
    text: 'Kết cục bí mật (nếu có) có activity cho người chơi làm được.',
    source: 'điểm kiểm 9',
  },
  {
    id: 'npc-knows',
    text: 'NPC chỉ nói điều vai của mình biết hoặc đã được nói trước mặt họ.',
    source: 'Luật A3',
  },
  {
    id: 'self-contained',
    text: 'Màn tự đủ kiến thức; thuật ngữ có lời giải thích, con số có mức so sánh.',
    source: 'Seed §1',
  },
];
