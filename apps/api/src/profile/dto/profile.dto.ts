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

/**
 * Trả lời một nhiệm vụ phụ, theo đúng kiểu mà nhiệm vụ ấy hỏi.
 *
 * Câu tự luận gửi `answer` và máy chủ đọc để quy về một hướng; câu chọn hoặc
 * xếp thứ tự gửi `choiceIndex`. Gửi cả hai hay không gửi gì đều bị chặn ở
 * đây, còn việc "câu này được phép gửi dạng nào" thì tầng dịch vụ quyết định
 * — nó mới biết nhiệm vụ đang hỏi theo kiểu gì.
 */
export const AnswerEventSchema = z
  .object({
    roleCode: z.string().min(1).max(64),
    band: z.string().min(1).max(8),
    answer: z.string().min(1).max(2000).optional(),
    choiceIndex: z.number().int().min(0).max(9).optional(),
  })
  .refine(
    (v) => (v.answer === undefined) !== (v.choiceIndex === undefined),
    { message: 'Gửi đúng một trong hai: answer hoặc choiceIndex' },
  );
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

export const EnrollSchema = z.object({
  band: z.string().min(1).max(8),
});
export type EnrollDto = z.infer<typeof EnrollSchema>;
