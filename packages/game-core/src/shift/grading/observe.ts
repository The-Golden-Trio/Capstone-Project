/**
 * `observes` của một màn (Seed scenario JobQuest, khối E1): 3–6 mục con cần
 * chấm, mỗi mục ghi bằng chứng lấy ở đâu (`from`) và, tuỳ chọn, `signs` minh
 * hoạ cho đúng tình huống này.
 *
 * Câu hỏi A/B/C và "Xét khi" KHÔNG nằm trong seed: lấy từ thư viện
 * (`library.ts`) theo mã `sub`. `signs` chỉ là ví dụ, không phải đáp án
 * (E1, "Signs là ví dụ minh hoạ").
 *
 * Seed mẫu bản 4 chưa có `observes` (schema.ts giữ chỗ bằng `z.unknown()`),
 * nên kiểu này đứng riêng, chưa gắn vào `ShiftSeedSchema`.
 */
import { z } from 'zod';
import type { ShiftSeed } from '../schema.js';
import { checklistItem, OVERLAP_GROUPS } from './library.js';

/** Đoạn bằng chứng là cả pha xử lý (chat, mở tài liệu, tự mô tả hành động). */
export const PHA = 'pha';

export const ObserveSignsSchema = z.object({
  A: z.string().optional(),
  B: z.string().optional(),
  C: z.string().optional(),
  /** Ví dụ KHÔNG tính, để tránh chấm nhầm "có". */
  not: z.array(z.string()).optional(),
});
export type ObserveSigns = z.infer<typeof ObserveSignsSchema>;

export const ObserveItemSchema = z.object({
  /** Mã mục con trong thư viện, ví dụ "7.1". */
  sub: z.string(),
  /** Id nút hoặc "pha". */
  from: z.array(z.string()).min(1),
  signs: ObserveSignsSchema.optional(),
});
export type ObserveItem = z.infer<typeof ObserveItemSchema>;

export const MIN_OBSERVES = 3;
export const MAX_OBSERVES = 6;

/**
 * Kiểm một danh sách `observes` theo E1 và luật trùng. Trả về danh sách lỗi
 * (rỗng là sạch). Có `seed` thì kiểm thêm `from` trỏ tới nút có thật.
 */
export function lintObserves(
  observes: readonly ObserveItem[],
  seed?: Pick<ShiftSeed, 'nodes'>,
): string[] {
  const problems: string[] = [];
  if (observes.length < MIN_OBSERVES || observes.length > MAX_OBSERVES)
    problems.push(
      `Mỗi màn khai ${MIN_OBSERVES}–${MAX_OBSERVES} mục con, đang có ${observes.length}`,
    );

  const seen = new Set<string>();
  for (const o of observes) {
    if (!checklistItem(o.sub))
      problems.push(`Mục con ${o.sub} không có trong thư viện`);
    if (seen.has(o.sub)) problems.push(`Mục con ${o.sub} khai hai lần`);
    seen.add(o.sub);
    if (seed)
      for (const from of o.from)
        if (from !== PHA && !seed.nodes.some((n) => n.id === from))
          problems.push(`${o.sub}: from "${from}" không phải nút của seed`);
  }

  for (const group of OVERLAP_GROUPS) {
    const picked = group.filter((sub) => seen.has(sub));
    if (picked.length > 1)
      problems.push(`Luật trùng: chỉ chọn một trong ${picked.join(', ')}`);
  }
  return problems;
}
