/**
 * Ghép prompt của một lượt chấm theo checklist (prompt `judge-v2`).
 *
 * Thứ tự theo D-109: system prompt → phần tĩnh theo màn (mô tả màn, rubric các
 * mục con kèm signs, 13 cờ) và điểm cache ngay sau đó → phần thay đổi theo lần
 * chơi (cặp cần chấm, các đoạn bằng chứng) ở cuối. Lời người chơi nằm trong
 * thẻ không đóng được: `<` `>` trong mọi chữ chèn vào đổi thành `‹` `›`.
 *
 * Chỉ gửi đúng phần việc cần (DC-03, §5.3.10): nội dung màn do chuyên gia
 * soạn và chữ người chơi đã khử định danh. Không gửi tên hay mã người chơi.
 */
import { shift } from '@datn/game-core';
import type { ChatMessage } from '../gateway/gateway.types';
import {
  ACTION_TAG,
  TURN_TAG,
  checklistSystemPrompt,
} from './prompts/judge.v2';

/** Chữ chèn vào prompt: không đóng được thẻ dù người chơi gõ `</loi_nguoi_choi>`. */
export const safeText = (text: string): string =>
  text.replace(/</g, '‹').replace(/>/g, '›');

const attr = (text: string): string => safeText(text).replace(/"/g, "'");

/* ── Phần tĩnh theo màn ──────────────────────────────────────────────── */

export function rubricText(
  brief: string,
  observes: readonly shift.ObserveItem[],
): string {
  const lines: string[] = ['# MÀN CHƠI', safeText(brief), ''];
  lines.push('# RUBRIC (thư viện câu hỏi có/không; "có" luôn là tốt)');
  for (const o of observes) {
    const item = shift.checklistItem(o.sub);
    if (!item) throw new Error(`Mục con ${o.sub} không có trong thư viện`);
    lines.push(
      '',
      `## ${item.sub} — ${item.name}`,
      `Xét khi: ${item.when}`,
      `- A (hành vi lõi): ${item.A}`,
      `- B: ${item.B}`,
      `- C: ${item.C}`,
    );
    if (item.flags.length > 0)
      lines.push(`Cờ hay gặp ở mục này: ${item.flags.join(', ')}`);
    const signs = o.signs;
    if (signs && (signs.A || signs.B || signs.C || signs.not?.length)) {
      lines.push(
        'Gợi ý riêng cho màn này (ví dụ minh hoạ, KHÔNG phải danh sách đáp án):',
      );
      if (signs.A) lines.push(`- A có thể trông như: ${safeText(signs.A)}`);
      if (signs.B) lines.push(`- B có thể trông như: ${safeText(signs.B)}`);
      if (signs.C) lines.push(`- C có thể trông như: ${safeText(signs.C)}`);
      for (const n of signs.not ?? [])
        lines.push(`- KHÔNG tính: ${safeText(n)}`);
    }
  }
  lines.push('', '# CÁC CỜ CHUNG (xét ở cấp cả màn, trên mọi đoạn)');
  for (const f of shift.CHECKLIST_FLAGS)
    lines.push(`- ${f.code}: ${f.behaviour}. Không tính khi: ${f.except}`);
  return lines.join('\n');
}

/* ── Phần thay đổi theo lần chơi ─────────────────────────────────────── */

function turnText(turn: shift.EvidenceTurn): string {
  const meta = `turn="${attr(turn.code)}" gio="${attr(turn.time)}"`;
  if (turn.kind === 'action')
    return `<${ACTION_TAG} ${meta}>${safeText(turn.text)}</${ACTION_TAG}>`;
  const body = turn.parts
    ? turn.parts
        .map((p) => `[ô "${attr(p.label)}"] ${safeText(p.text)}`)
        .join('\n')
    : safeText(turn.text);
  return `<${TURN_TAG} ${meta}>\n${body}\n</${TURN_TAG}>`;
}

function segmentText(segment: shift.EvidenceSegment): string {
  const lines = [`## đoạn ${attr(segment.id)} — ${safeText(segment.label)}`];
  if (segment.facts.length > 0) {
    lines.push('Dữ kiện người chơi đã mở tới cuối đoạn:');
    for (const f of segment.facts)
      lines.push(`- ${f.id} (${f.time}): ${safeText(f.text)}`);
  }
  if (segment.rulesHeard.length > 0) {
    lines.push('Quy định người chơi đã được nghe:');
    for (const r of segment.rulesHeard)
      lines.push(`- ${r.id}: ${safeText(r.text)}`);
  }
  if (segment.promises.length > 0) {
    lines.push('Lời hứa người chơi đã đưa ra (trạng thái do engine ghi):');
    for (const p of segment.promises)
      lines.push(`- ${safeText(p.label)} — ${p.status}`);
  }
  lines.push('Diễn biến:');
  for (const e of segment.entries) {
    if (e.role === 'player') lines.push(turnText(e.turn));
    else
      lines.push(
        `[${e.role === 'npc' ? 'lời nhân vật' : 'kết quả'} · ${safeText(e.speaker)} · ${e.time}] ${safeText(e.text)}`,
      );
  }
  return lines.join('\n');
}

export function evidenceText(
  segments: readonly shift.EvidenceSegment[],
  pairs: ReadonlyArray<{ sub: string; segment: string }>,
): string {
  return [
    '# CẦN CHẤM (mỗi cặp đúng một phần tử trong "items")',
    ...pairs.map((p) => `- ${p.sub} @ ${p.segment}`),
    '',
    '# CÁC ĐOẠN BẰNG CHỨNG',
    ...segments.map(segmentText),
  ].join('\n');
}

export interface ChecklistTurn {
  segments: readonly shift.EvidenceSegment[];
  observes: readonly shift.ObserveItem[];
}

export function buildChecklistMessages(turn: ChecklistTurn): ChatMessage[] {
  const pairs = shift.expectedPairs(turn.segments);
  const brief = turn.segments[0]?.brief ?? '';
  return [
    { role: 'system', parts: [{ text: checklistSystemPrompt() }] },
    {
      role: 'user',
      parts: [
        {
          text: `${rubricText(brief, turn.observes)}\n\n`,
          cacheBreakpoint: true,
        },
        { text: evidenceText(turn.segments, pairs) },
      ],
    },
  ];
}

/**
 * Khuôn json cho chế độ schema strict của nhà cung cấp: mọi khoá bắt buộc,
 * không khoá lạ; mã mục con, đoạn, lượt và cờ là enum. Trong mỗi câu trả lời
 * thứ tự khoá là trích → lượt → kết luận, để model nêu bằng chứng trước.
 */
export function checklistJsonSchema(
  segments: readonly shift.EvidenceSegment[],
): Record<string, unknown> {
  const pairs = shift.expectedPairs(segments);
  const subs = [...new Set(pairs.map((p) => p.sub))];
  const segmentIds = [...new Set(pairs.map((p) => p.segment))];
  const turns = shift.allTurns(segments).map((t) => t.code);
  const answer = {
    type: 'object',
    properties: {
      quote: { type: 'string' },
      turn: { type: 'string', enum: ['', ...turns] },
      yes: { type: 'boolean' },
    },
    required: ['quote', 'turn', 'yes'],
    additionalProperties: false,
  };
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sub: { type: 'string', enum: subs },
            segment: { type: 'string', enum: segmentIds },
            applicable: { type: 'boolean' },
            A: answer,
            B: answer,
            C: answer,
          },
          required: ['sub', 'segment', 'applicable', 'A', 'B', 'C'],
          additionalProperties: false,
        },
      },
      flags: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            code: { type: 'string', enum: [...shift.FLAG_CODES] },
            quote: { type: 'string' },
            turn: { type: 'string', enum: turns },
          },
          required: ['code', 'quote', 'turn'],
          additionalProperties: false,
        },
      },
    },
    required: ['items', 'flags'],
    additionalProperties: false,
  };
}
