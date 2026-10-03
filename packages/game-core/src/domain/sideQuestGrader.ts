/**
 * Chấm câu trả lời tự luận của một nhiệm vụ phụ.
 *
 * Nhiệm vụ phụ không có đáp án đúng — nó hỏi bạn sẽ xử lý thế nào, và mỗi
 * cách xử lý nói một điều khác nhau về bạn. Dữ liệu cho sẵn vài hướng kèm
 * diễn biến và tín hiệu tính cách; việc của hàm này là đọc câu người chơi tự
 * viết rồi xem nó gần hướng nào nhất.
 *
 * Cách làm: rút từ khoá từ chính lời mô tả của từng hướng, rồi đếm xem câu
 * trả lời chạm vào bao nhiêu từ khoá của mỗi hướng. Thô, nhưng thô một cách
 * thành thật — và cùng cơ chế với `keywordGrader` của kịch bản chính, nên
 * ngày nào thay bằng AI đọc thì thay cả hai chỗ bằng cùng một cách.
 *
 * Không đoán bừa: câu nào không chạm vào hướng nào thì trả về `null`, và
 * người chơi được mời viết rõ hơn. Đoán bừa tức là chấm một người theo hướng
 * họ không hề chọn.
 */
import { normalizeVi } from './format.js';
import type { GameEvent } from '../data/schema.js';

/** Câu trả lời ngắn hơn ngần này thì chưa đủ để đọc ra ý định. */
export const MIN_ANSWER_LENGTH = 15;

/**
 * Hư từ và những từ có mặt ở mọi hướng nên không phân biệt được gì.
 *
 * Giữ danh sách ngắn có chủ ý: càng lọc nhiều thì càng dễ vứt mất đúng cái từ
 * mang nghĩa. Gặp từ nhiễu mới thì thêm vào đây.
 */
const STOPWORDS = new Set([
  'nhung',
  'nhieu',
  'viec',
  'nguoi',
  'minh',
  'ban',
  'cua',
  'cho',
  'voi',
  'trong',
  'ngoai',
  'duoc',
  'khong',
  'cung',
  'lam',
  'thi',
  'la',
  'va',
  'de',
  'den',
  'tren',
  'sau',
  'truoc',
  'mot',
  'cac',
  'nay',
  'do',
  'ra',
  'vao',
  'roi',
  'hon',
  'rat',
  'se',
  'da',
  'dang',
  'con',
  'ma',
  'neu',
  'khi',
  'theo',
  've',
]);

/** Các từ đáng kể trong một đoạn: bỏ dấu, bỏ hư từ, bỏ từ quá ngắn. */
export function keywords(text: string): string[] {
  return normalizeVi(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

export interface QuestMatch {
  choiceIndex: number;
  /** Số từ khoá của hướng ấy mà câu trả lời chạm tới. */
  hits: number;
}

/**
 * Hướng xử lý gần nhất với câu người chơi viết.
 *
 * `null` nghĩa là không đọc ra được — câu quá ngắn, hoặc không chạm vào hướng
 * nào. Hoà nhau thì lấy hướng đứng trước, để cùng một câu luôn ra cùng một
 * kết quả dù chạy ở máy khách hay máy chủ.
 */
export function matchChoice(event: GameEvent, answer: string): QuestMatch | null {
  if (answer.trim().length < MIN_ANSWER_LENGTH) return null;

  const said = new Set(keywords(answer));
  if (said.size === 0) return null;

  const scored = event.choices.map((choice, choiceIndex) => {
    const words = new Set(keywords(choice.text));
    let hits = 0;
    for (const word of words) if (said.has(word)) hits += 1;
    return { choiceIndex, hits };
  });

  // Hoà nhau thì lấy hướng đứng trước — `reduce` giữ phần tử đầu khi bằng
  // điểm, nên cùng một câu luôn ra cùng kết quả ở cả hai phía.
  const best = scored.reduce((a, b) => (b.hits > a.hits ? b : a));
  return best.hits > 0 ? best : null;
}
