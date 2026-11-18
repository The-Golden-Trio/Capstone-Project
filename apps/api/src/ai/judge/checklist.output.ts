/**
 * Đọc kết quả của một judge theo checklist (prompt `judge-v2`) — bằng luật,
 * không bằng model khác (D-108: không dùng model thứ hai để sửa).
 *
 *   J2  Đủ mọi cặp (mục con, đoạn) được yêu cầu, mỗi cặp một lần, không cặp lạ;
 *       mã cờ phải có trong thư viện.
 *   J3  Đúng khuôn json.
 *
 * KHÔNG có luật J1 ở đây. Khác `judge.output` của rubric activity: câu trích
 * sai ở checklist không làm kết quả bị bỏ. Theo luật 6 của spec, câu "có" mà
 * câu trích không khớp lượt nói thì chỉ riêng câu đó tính là "không"; việc ấy
 * do `shift.checkOutput` làm, không phải gọi lại model.
 */
import { shift } from '@datn/game-core';
import { z } from 'zod';
import type { JudgeProblem } from './judge.output';

const Answer = z.object({
  quote: z.string(),
  turn: z.string(),
  yes: z.boolean(),
});

const OutputSchema = z.object({
  items: z.array(
    z.object({
      sub: z.string(),
      segment: z.string(),
      applicable: z.boolean(),
      A: Answer,
      B: Answer,
      C: Answer,
    }),
  ),
  flags: z.array(
    z.object({ code: z.string(), quote: z.string(), turn: z.string() }),
  ),
});

/** Bỏ rào ```json … ``` nếu model lỡ bọc. */
function parseJson(raw: string): unknown {
  const fenced = raw.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return JSON.parse(fenced ? fenced[1] : raw);
}

export type ChecklistCheck =
  | { ok: true; output: shift.RawOutput }
  | { ok: false; problems: JudgeProblem[] };

export function checkChecklistOutput(
  raw: string,
  ctx: {
    pairs: ReadonlyArray<{ sub: string; segment: string }>;
    finishReason?: string | null;
  },
): ChecklistCheck {
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
  const key = (p: { sub: string; segment: string }) => `${p.sub}@${p.segment}`;
  const wanted = new Set(ctx.pairs.map(key));
  const seen = new Set<string>();
  for (const item of parsed.data.items) {
    const k = key(item);
    if (!wanted.has(k)) problems.push({ rule: 'J2', detail: `cặp lạ "${k}"` });
    else if (seen.has(k))
      problems.push({ rule: 'J2', detail: `cặp "${k}" trả lời hai lần` });
    seen.add(k);
  }
  for (const k of wanted)
    if (!seen.has(k)) problems.push({ rule: 'J2', detail: `thiếu cặp "${k}"` });
  for (const flag of parsed.data.flags)
    if (!shift.isFlagCode(flag.code))
      problems.push({ rule: 'J2', detail: `mã cờ lạ "${flag.code}"` });

  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, output: parsed.data };
}
