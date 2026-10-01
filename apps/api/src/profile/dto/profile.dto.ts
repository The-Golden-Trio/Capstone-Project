import { z } from 'zod';

/**
 * Nộp bài Get to Know Me.
 *
 * Câu chọn gửi vế và mức (1 = rất đúng, 0.5 = hơi đúng); câu tự luận gửi
 * chữ. Độ dài từng câu tự luận do tầng dịch vụ kiểm theo bộ câu hỏi — ở đây
 * chỉ chặn trần cho khỏi nhận bài quá khổ. Bỏ ngang giữa chừng thì gửi phần
 * đã làm, nên không bắt đủ mọi câu.
 */
export const SubmitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(64),
        optionId: z.string().min(1).max(64),
        strength: z.union([z.literal(1), z.literal(0.5)]).optional(),
      }),
    )
    .max(50),
  texts: z
    .array(
      z.object({
        questionId: z.string().min(1).max(64),
        text: z.string().max(1000),
      }),
    )
    .max(10)
    .default([]),
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

export const PortraitQuerySchema = z.object({
  locale: z.enum(['vi', 'en']).default('vi'),
});
export type PortraitQueryDto = z.infer<typeof PortraitQuerySchema>;
