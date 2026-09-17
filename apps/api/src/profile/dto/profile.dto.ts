import { z } from 'zod';

export const SubmitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(64),
        optionId: z.string().min(1).max(64),
      }),
    )
    .max(50),
});
export type SubmitQuizDto = z.infer<typeof SubmitQuizSchema>;

export const AnswerEventSchema = z.object({
  roleCode: z.string().min(1).max(64),
  band: z.string().min(1).max(8),
  choiceIndex: z.number().int().min(0).max(9),
});
export type AnswerEventDto = z.infer<typeof AnswerEventSchema>;

/**
 * Bản lưu cũ trong localStorage (khoá `vaonghe.v1`).
 *
 * Cố ý KHÔNG nhận `skill` và `doneTasks`: điểm kỹ năng mở cấp bậc, mà bản lưu
 * này nằm trong trình duyệt nên sửa được tuỳ ý.
 */
export const ImportLegacySchema = z.object({
  fit: z.record(z.string(), z.number()).optional(),
  quizDone: z.boolean().optional(),
  eventsPlayed: z.number().int().min(0).max(10_000).optional(),
});
export type ImportLegacyDto = z.infer<typeof ImportLegacySchema>;
