/**
 * Đọc và kiểm kết quả của một judge — bằng luật, không bằng model khác (D-108:
 * không dùng model thứ hai để sửa, vì có thể đổi mức điểm).
 *
 *   J1  Câu trích phải có nguyên văn trong câu trả lời (FR-11, NFR-17).
 *   J2  Đủ mọi tiêu chí được hỏi, mỗi tiêu chí một lần, không tiêu chí lạ.
 *   J3  Đúng khuôn json; mức nằm trong thang 0/1/2 hoặc "không xét".
 *
 * "Nguyên văn" so sau khi chuẩn hoá Unicode NFC và gộp khoảng trắng: tiếng
 * Việt gõ từ hai bộ gõ khác nhau có thể ra hai chuỗi byte khác nhau cho cùng
 * một chữ có dấu, và model hay đổi xuống dòng thành dấu cách. Ngoài hai điều
 * đó thì phải khớp từng ký tự, kể cả hoa thường.
 */
import { z } from 'zod';
import type { JudgeScore, Judgment } from './judge.types';
import { LEVELS } from './prompts/judge.v1';

export type JudgeRuleId = 'J1' | 'J2' | 'J3';

export interface JudgeProblem {
  rule: JudgeRuleId;
  detail: string;
}

const OutputSchema = z.object({
  criteria: z.array(
    z.object({
      criterion_id: z.string(),
      quote: z.string(),
      rationale: z.string(),
      level: z.enum(LEVELS),
      counterproductive: z.boolean(),
    }),
  ),
});

const normalize = (text: string): string =>
  text.normalize('NFC').replace(/\s+/g, ' ').trim();

export const quoteFound = (quote: string, answer: string): boolean => {
  const q = normalize(quote);
  return q.length > 0 && normalize(answer).includes(q);
};

/** Bỏ rào ```json … ``` nếu model lỡ bọc — chế độ schema thường không bọc, chế độ json_object thì có lúc. */
function parseJson(raw: string): unknown {
  const fenced = raw.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return JSON.parse(fenced ? fenced[1] : raw);
}

export type JudgeCheck =
  { ok: true; judgments: Judgment[] } | { ok: false; problems: JudgeProblem[] };

export function checkJudgeOutput(
  raw: string,
  ctx: {
    criterionIds: readonly string[];
    answer: string;
    finishReason?: string | null;
  },
): JudgeCheck {
  if (ctx.finishReason === 'length')
    return {
      ok: false,
      problems: [
        { rule: 'J3', detail: 'bị cắt vì chạm trần token, json không trọn' },
      ],
    };

  let json: unknown;
  try {
    json = parseJson(raw);
  } catch {
    return {
      ok: false,
      problems: [{ rule: 'J3', detail: 'không phải json hợp lệ' }],
    };
  }
  const parsed = OutputSchema.safeParse(json);
  if (!parsed.success)
    return {
      ok: false,
      problems: parsed.error.issues.map((i) => ({
        rule: 'J3' as const,
        detail: `${i.path.join('.') || '(gốc)'}: ${i.message}`,
      })),
    };

  const problems: JudgeProblem[] = [];
  const byId = new Map<string, (typeof parsed.data.criteria)[number]>();
  for (const item of parsed.data.criteria) {
    if (!ctx.criterionIds.includes(item.criterion_id))
      problems.push({
        rule: 'J2',
        detail: `tiêu chí lạ "${item.criterion_id}"`,
      });
    else if (byId.has(item.criterion_id))
      problems.push({
        rule: 'J2',
        detail: `tiêu chí "${item.criterion_id}" chấm hai lần`,
      });
    else byId.set(item.criterion_id, item);
  }
  for (const id of ctx.criterionIds)
    if (!byId.has(id))
      problems.push({ rule: 'J2', detail: `thiếu tiêu chí "${id}"` });

  const judgments: Judgment[] = [];
  for (const id of ctx.criterionIds) {
    const item = byId.get(id);
    if (!item) continue;
    const score: JudgeScore | null =
      item.level === 'khong_xet' ? null : (Number(item.level) as JudgeScore);
    const needsQuote = score !== null || item.counterproductive;
    const hasQuote = item.quote.trim().length > 0;

    if (needsQuote && !hasQuote)
      problems.push({
        rule: 'J1',
        detail: `"${id}": mức ${item.level}${item.counterproductive ? ', có cờ phản tác dụng' : ''} mà không có câu trích`,
      });
    else if (hasQuote && !quoteFound(item.quote, ctx.answer))
      problems.push({
        rule: 'J1',
        detail: `"${id}": câu trích "${item.quote}" không có nguyên văn trong câu trả lời`,
      });

    judgments.push({
      criterionId: id,
      score,
      counterproductive: item.counterproductive,
      quote: item.quote,
      rationale: item.rationale,
    });
  }

  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, judgments };
}
