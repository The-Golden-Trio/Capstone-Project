/**
 * Kịch bản người chơi: danh sách từng việc người chơi làm trong một ca, theo
 * đúng các loại lượt của API ca làm (chỉ bỏ `turnId`). Dùng chung cho `ai-lab`
 * (chạy engine không UI) và chế độ xem lượt chơi mẫu ở web. Mọi câu trong kịch
 * bản là câu giả do nhóm viết, không phải lời của người chơi thật.
 */
import { z } from 'zod';

const id = z.string().min(1).max(80);
const text = z.string().trim().min(1).max(4000);
const fields = z.record(id, z.string().max(4000));

const awaitKind = z.enum([
  'start',
  'phase',
  'conversation',
  'node_reply',
  'node_choice',
  'node_artefact',
  'probe_answer',
  'confirm_end',
  'last_word',
  'ai',
  'ended',
]);

/**
 * Chỉ làm bước này khi engine đang chờ đúng loại này (hoặc một trong các
 * loại). Nhánh của engine đổi theo câu trả lời của bộ phán, nên bước như "trả
 * lời câu hỏi thêm" chỉ nên chạy nếu câu hỏi ấy có xuất hiện; không khớp thì
 * bỏ qua, không phải lỗi kịch bản.
 */
const when = {
  ifAwait: z.union([awaitKind, z.array(awaitKind).min(1)]).optional(),
};

/** Một việc người chơi làm. `do` trùng với `kind` của `TurnDto`, cộng `start`. */
export const StepSchema = z.discriminatedUnion('do', [
  z.object({ do: z.literal('start'), ...when }),
  z.object({
    do: z.literal('action'),
    key: id,
    fields: fields.optional(),
    ticks: z.array(id).max(20).optional(),
    ...when,
  }),
  z.object({ do: z.literal('say'), text, ...when }),
  z.object({ do: z.literal('end_conversation'), ...when }),
  z.object({
    do: z.literal('choose'),
    option: id,
    elapsedMs: z.number().int().nonnegative().optional(),
    ...when,
  }),
  z.object({ do: z.literal('timeout'), ...when }),
  z.object({
    do: z.literal('save_artefact'),
    artefact: id,
    fields,
    ticks: z.array(id).max(20).optional(),
    ...when,
  }),
  z.object({ do: z.literal('confirm_end'), ...when }),
  z.object({ do: z.literal('cancel_end'), ...when }),
  z.object({ do: z.literal('hint'), ...when }),
]);
export type Step = z.infer<typeof StepSchema>;

export const PlaythroughSchema = z.object({
  /** Dòng nhắc: đây là câu giả, không phải người chơi thật. */
  _note: z.string().optional(),
  name: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'chỉ chữ thường, số và dấu gạch ngang'),
  /** Mã seed, ví dụ `SWE_BACKEND.L3.m2`. */
  seed: id,
  title: z.string(),
  /** Điều kịch bản này muốn thử, để người đọc nhật ký biết cần nhìn gì. */
  intent: z.string(),
  steps: z.array(StepSchema).min(1),
});
export type Playthrough = z.infer<typeof PlaythroughSchema>;

/** Bước có đang đúng chỗ không: không có `ifAwait` thì luôn đúng. */
export function stepApplies(step: Step, awaiting: string): boolean {
  if (step.ifAwait === undefined) return true;
  const kinds = Array.isArray(step.ifAwait) ? step.ifAwait : [step.ifAwait];
  return kinds.includes(awaiting as (typeof kinds)[number]);
}
