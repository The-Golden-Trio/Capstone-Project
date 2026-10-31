/**
 * Ghép message cho một lượt gọi AI-4.
 *
 * Thứ tự là tất cả, vì prompt cache của cả hai hãng khớp theo PHẦN ĐẦU:
 *
 *   [system]  luật cho AI-4                ← giống nhau cho mọi người chơi
 *   [user]    kịch bản + các hoạt động tới giờ
 *             ─── điểm cache ───           ← giống nhau cho mọi người ở cùng hoạt động
 *             diễn biến lượt chơi này       ← riêng từng người
 *             câu người chơi vừa viết
 *
 * Không dùng session phía nhà cung cấp: mỗi lượt gửi lại đủ ngữ cảnh. Đổi
 * sang model dự phòng giữa chừng vẫn chạy, câu bị luật loại không lọt vào
 * "lịch sử" của model, và không có lịch sử chơi nào nằm lại ở nước ngoài.
 */
import type { NarratorView, RuleViolation } from '@datn/game-core';
import type { ChatMessage } from '../gateway/gateway.types';
import { NARRATOR_SYSTEM_PROMPT, PLAYER_TAG } from './prompts/narrator.v1';

/** Một dòng đã diễn ra và đã được người chơi thấy. */
export interface TranscriptLine {
  /** `canon`: nội dung kịch bản đã hiện. `player`: người chơi gõ. `npc`: lời AI-4 đã qua kiểm. */
  kind: 'canon' | 'player' | 'npc';
  /** `npc_id` của nhân vật nói, với `npc`. */
  speaker?: string;
  text: string;
}

export interface PromptTurn {
  view: NarratorView;
  activityId: string;
  /** Đã khử định danh. Chỉ gồm những câu ĐÃ qua kiểm — câu bị loại không bao giờ vào đây. */
  transcript: readonly TranscriptLine[];
  /** Đã khử định danh. */
  answer: string;
  followUpAllowed: boolean;
}

/**
 * Bọc câu người chơi thành dữ liệu.
 *
 * Đổi `<` `>` thành `‹` `›`: người chơi gõ `</cau_nguoi_choi>` cũng không
 * đóng được thẻ để chèn lệnh ra ngoài — dấu phân cách "không đóng được".
 */
export function asPlayerData(text: string): string {
  const safe = text.replace(/</g, '‹').replace(/>/g, '›');
  return `<${PLAYER_TAG}>\n${safe}\n</${PLAYER_TAG}>`;
}

/**
 * Phần kịch bản. Mỗi hoạt động một dòng JSON, nối thêm ở cuối — nên chuỗi
 * của hoạt động a2 là phần đầu của chuỗi a3, và cache trúng nối dài qua từng
 * bước. Một khối JSON lồng nhau thì không được như vậy: dấu đóng `]}` ở cuối
 * làm chuỗi a2 không còn là phần đầu của a3.
 */
export function seedText(view: NarratorView): string {
  const { activities, ...header } = view;
  return [
    '# KỊCH BẢN (do chuyên gia nghề soạn)',
    JSON.stringify(header),
    '',
    '# CÁC HOẠT ĐỘNG TỚI LÚC NÀY (theo thứ tự)',
    ...activities.map((a) => JSON.stringify(a)),
  ].join('\n');
}

function transcriptText(lines: readonly TranscriptLine[]): string {
  if (lines.length === 0) return '(chưa có gì)';
  return lines
    .map((line) => {
      if (line.kind === 'player') return `[người chơi]\n${asPlayerData(line.text)}`;
      if (line.kind === 'npc') return `[${line.speaker ?? 'nhân vật'}] ${line.text}`;
      return `[kịch bản] ${line.text}`;
    })
    .join('\n');
}

export function turnText(turn: PromptTurn): string {
  return [
    '',
    '',
    '# DIỄN BIẾN LƯỢT CHƠI NÀY',
    transcriptText(turn.transcript),
    '',
    '# LƯỢT NÀY',
    `Hoạt động hiện tại: ${turn.activityId}`,
    `Được hỏi đào sâu: ${turn.followUpAllowed ? 'có' : 'không'}`,
    'Câu người chơi vừa viết:',
    asPlayerData(turn.answer),
    '',
    'Trả về đúng một đối tượng json.',
  ].join('\n');
}

export function buildNarratorMessages(turn: PromptTurn): ChatMessage[] {
  return [
    { role: 'system', parts: [{ text: NARRATOR_SYSTEM_PROMPT }] },
    {
      role: 'user',
      parts: [
        { text: seedText(turn.view), cacheBreakpoint: true },
        { text: turnText(turn) },
      ],
    },
  ];
}

/**
 * Hai message nối thêm khi bắt viết lại: câu bị loại, rồi lý do.
 *
 * Nối vào CUỐI, nên toàn bộ phần đầu — gồm phần đã cache — giữ nguyên. Lý do
 * dùng `feedback` của từng vi phạm, không dùng `detail`: với R3, `detail` chứa
 * chính cụm rubric bị lộ, đưa nó vào prompt là dạy model rubric.
 */
export function regenerationMessages(
  rejected: string,
  violations: readonly RuleViolation[],
): ChatMessage[] {
  const reasons = violations.map((v) => `- ${v.rule}: ${v.feedback}`).join('\n');
  return [
    { role: 'assistant', parts: [{ text: rejected.trim() || '(rỗng)' }] },
    {
      role: 'user',
      parts: [
        {
          text:
            `Câu vừa rồi bị hệ thống loại:\n${reasons}\n\n` +
            'Vẫn là lượt này, vẫn câu người chơi ấy. Viết lại toàn bộ đối tượng json cho đúng luật.',
        },
      ],
    },
  ];
}
