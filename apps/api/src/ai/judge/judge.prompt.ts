/**
 * Ghép prompt của một lượt chấm.
 *
 * Thứ tự theo D-109: system prompt (vai, luật, khuôn json) → phần tĩnh của
 * tình huống (tình huống, câu hỏi, rubric) và điểm cache ngay sau đó → câu
 * người chơi ở cuối, trong dấu phân cách không đóng được. Không bao giờ đặt
 * điểm cache sau câu người chơi.
 *
 * Chỉ gửi đúng phần việc cần (DC-03, §5.3.10): nội dung kịch bản do chuyên gia
 * soạn và câu trả lời đã khử định danh. Không gửi tên, mã người chơi.
 */
import type { ChatMessage } from '../gateway/gateway.types';
import type { RubricCriterion } from './judge.types';
import { ANSWER_TAG, LEVELS, judgeSystemPrompt } from './prompts/judge.v1';

export interface JudgeTurn {
  criteria: readonly RubricCriterion[];
  /** Đã khử định danh. */
  answer: string;
  /** Tình huống người chơi đang gặp (nội dung kịch bản). */
  situation?: string;
  /** Câu hỏi người chơi trả lời — câu của kịch bản, hoặc câu đào sâu của AI-4. */
  question?: string;
}

/** Đổi `<` `>` thành `‹` `›`: gõ `</cau_tra_loi>` cũng không thoát được thẻ. */
export function asAnswerData(text: string): string {
  const safe = text.replace(/</g, '‹').replace(/>/g, '›');
  return `<${ANSWER_TAG}>\n${safe}\n</${ANSWER_TAG}>`;
}

export function rubricText(turn: Omit<JudgeTurn, 'answer'>): string {
  const lines: string[] = [];
  if (turn.situation) lines.push('# TÌNH HUỐNG', turn.situation, '');
  if (turn.question)
    lines.push('# CÂU HỎI NGƯỜI CHƠI ĐƯỢC HỎI', turn.question, '');
  lines.push('# TIÊU CHÍ (do chuyên gia nghề soạn)');
  for (const c of turn.criteria) {
    lines.push(
      '',
      `## criterion_id: ${c.id} — ${c.name}`,
      `- Mức 2 (làm tốt): ${c.anchor2}`,
      `- Mức 1 (đạt): ${c.anchor1}`,
      `- Mức 0 (chưa đạt): ${c.anchor0}`,
    );
    if (c.counterproductiveSigns)
      lines.push(`- Dấu hiệu phản tác dụng: ${c.counterproductiveSigns}`);
  }
  return lines.join('\n');
}

export function buildJudgeMessages(turn: JudgeTurn): ChatMessage[] {
  return [
    { role: 'system', parts: [{ text: judgeSystemPrompt() }] },
    {
      role: 'user',
      parts: [
        { text: `${rubricText(turn)}\n\n`, cacheBreakpoint: true },
        { text: `# CÂU TRẢ LỜI CẦN CHẤM\n${asAnswerData(turn.answer)}` },
      ],
    },
  ];
}

/**
 * Khuôn json cho chế độ schema strict của nhà cung cấp: mọi khoá bắt buộc,
 * không khoá lạ, mã tiêu chí và mức là enum. Thứ tự khoá trích → lý do → mức.
 */
export function judgeJsonSchema(
  criterionIds: readonly string[],
): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      criteria: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            criterion_id: { type: 'string', enum: [...criterionIds] },
            quote: { type: 'string' },
            rationale: { type: 'string' },
            level: { type: 'string', enum: [...LEVELS] },
            counterproductive: { type: 'boolean' },
          },
          required: [
            'criterion_id',
            'quote',
            'rationale',
            'level',
            'counterproductive',
          ],
          additionalProperties: false,
        },
      },
    },
    required: ['criteria'],
    additionalProperties: false,
  };
}

/** Lời nhắc khi chấm lại: nói rõ sai ở đâu, không gợi ý mức nào. */
export function retryMessages(
  previous: string,
  problems: readonly string[],
): ChatMessage[] {
  return [
    { role: 'assistant', parts: [{ text: previous }] },
    {
      role: 'user',
      parts: [
        {
          text:
            'Kết quả trên không dùng được vì:\n' +
            problems.map((p) => `- ${p}`).join('\n') +
            '\nChấm lại toàn bộ, trả về đúng một đối tượng json theo khuôn đã cho.',
        },
      ],
    },
  ];
}
