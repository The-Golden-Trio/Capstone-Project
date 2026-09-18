/**
 * Chọn nhiệm vụ phụ cho một hòn đảo.
 *
 * Trước đây mọi đảo đều bày ra đúng một danh sách: cả 11 nhiệm vụ phụ của
 * nghề, không lọc gì. Nhìn đảo nào cũng như đảo nào, mà đi vào chặng L7 vẫn
 * gặp "công ty cắt giảm nhân sự" y như hồi mới ra trường.
 *
 * Bộ dữ liệu vốn đã gắn `band_range` cho từng nhiệm vụ — chỗ này chỉ là đem
 * ra dùng. Nơi nào dữ liệu không đủ (L1 không có nhiệm vụ nào, L7 chỉ có một)
 * thì mượn thêm từ cấp bậc gần nhất, vì thà lệch bối cảnh một chút còn hơn để
 * người chơi tắc đường.
 *
 * Thuần hàm và có hạt giống cố định: cùng một hòn đảo thì lần nào mở cũng ra
 * đúng những nhiệm vụ ấy.
 */
import type { GameEvent, Role } from '../data/schema.js';
import type { GameIndex } from '../data/indexes.js';
import { BANDS, UNLOCK_AT, SIDE_QUEST_POINTS } from './bands.js';

/** Mỗi đảo bày ra từng này nhiệm vụ phụ. */
export const SIDE_QUESTS_MIN = 3;
export const SIDE_QUESTS_MAX = 4;

/**
 * Các kiểu hỏi.
 *
 *   • `WRITE`  — tự viết cách xử lý, máy chủ đọc rồi quy về một hướng.
 *   • `ORDER`  — xếp các hướng theo thứ tự sẽ làm; cái trên cùng là câu trả lời.
 *   • `CHOICE` — chọn thẳng một hướng.
 *
 * Ba kiểu cùng quy về "cuối cùng là một hướng", vì dữ liệu chỉ có bấy nhiêu:
 * vài hướng kèm diễn biến và tín hiệu tính cách. Khác nhau ở đường đi tới đó,
 * và đường đi mới là thứ người chơi cảm thấy — bấm một cái, hay phải tự viết
 * ra, hay phải cân cả ba rồi xếp thứ tự.
 */
export type QuestKind = 'WRITE' | 'ORDER' | 'CHOICE';

const KINDS: readonly QuestKind[] = ['WRITE', 'ORDER', 'CHOICE'];

/** Hash ổn định trên chuỗi — cùng chuỗi luôn cho cùng số. */
function hash(text: string): number {
  let out = 0;
  for (const char of text) out = (out * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(out);
}

/** Khoảng cách từ một nhiệm vụ tới cấp bậc đang xét, theo bậc thang L1–L10. */
function bandDistance(event: GameEvent, band: string): number {
  const at = BANDS.indexOf(band as (typeof BANDS)[number]);
  if (at < 0 || event.band_range.length === 0) return Number.MAX_SAFE_INTEGER;

  return Math.min(
    ...event.band_range.map((b) => {
      const other = BANDS.indexOf(b as (typeof BANDS)[number]);
      return other < 0 ? Number.MAX_SAFE_INTEGER : Math.abs(other - at);
    }),
  );
}

/** Số nhiệm vụ phụ bày ra ở một hòn đảo: 3 hoặc 4, cố định theo đảo. */
export function sideQuestCount(roleCode: string, band: string): number {
  const span = SIDE_QUESTS_MAX - SIDE_QUESTS_MIN + 1;
  return SIDE_QUESTS_MIN + (hash(`${roleCode}:${band}:count`) % span);
}

/**
 * Nhiệm vụ phụ của một hòn đảo.
 *
 * Ưu tiên những nhiệm vụ có cấp bậc này trong `band_range`; thiếu thì lấy
 * thêm theo thứ tự gần nhất. Trộn có hạt giống để hai chặng liền nhau không
 * ra cùng một danh sách dù cùng đủ điều kiện.
 */
export function sideQuestsFor(
  role: Role,
  band: string,
  index: GameIndex,
): GameEvent[] {
  const all = index.eventsForRole(role);
  const want = sideQuestCount(role.role_code, band);

  const ranked = [...all].sort((a, b) => {
    const byBand = bandDistance(a, band) - bandDistance(b, band);
    if (byBand !== 0) return byBand;
    // Cùng khoảng cách thì xếp theo hạt giống của đảo, không theo thứ tự
    // trong tệp dữ liệu — nếu không, đảo nào cũng mở đầu bằng cùng một cái.
    return (
      (hash(`${role.role_code}:${band}:${a.event_id}`) % 1000) -
      (hash(`${role.role_code}:${band}:${b.event_id}`) % 1000)
    );
  });

  return ranked.slice(0, Math.min(want, all.length));
}

/**
 * Kiểu hỏi của một nhiệm vụ phụ tại một hòn đảo.
 *
 * Xoay vòng theo vị trí trong đảo chứ không băm riêng từng nhiệm vụ: băm
 * riêng thì có đảo rút trúng ba lần cùng một kiểu, và người chơi ghé đúng đảo
 * ấy lại thấy toàn một loại. Xoay vòng thì mỗi đảo chắc chắn đủ ba kiểu, còn
 * điểm khởi đầu của vòng vẫn do đảo quyết định nên hai đảo cạnh nhau không
 * hỏi giống nhau.
 *
 * Máy chủ cũng gọi hàm này để biết một nhiệm vụ đang hỏi theo kiểu nào — nhờ
 * vậy không ai gửi thẳng số thứ tự phương án cho một câu lẽ ra phải tự viết.
 */
export function questKind(
  role: Role,
  band: string,
  eventId: string,
  index: GameIndex,
): QuestKind {
  const at = sideQuestsFor(role, band, index).findIndex(
    (e) => e.event_id === eventId,
  );
  if (at < 0) return 'CHOICE';

  const start = hash(`${role.role_code}:${band}:kind`);
  return KINDS[(start + at) % KINDS.length];
}

/**
 * Số nhiệm vụ phụ phải làm để mở cấp bậc kế.
 *
 * Suy ra chứ không viết cứng: `SIDE_QUEST_POINTS` mà đổi thì con số này phải
 * đổi theo, và `SIDE_QUESTS_MIN` phải đủ lớn để hòn đảo ít nhiệm vụ nhất vẫn
 * đi qua được — có test giữ điều đó.
 */
export const questsToUnlock = (): number =>
  Math.ceil(UNLOCK_AT / SIDE_QUEST_POINTS);
