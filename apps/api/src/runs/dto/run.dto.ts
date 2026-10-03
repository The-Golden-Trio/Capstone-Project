import { z } from 'zod';

/**
 * Chuỗi hành động máy khách gửi lên để máy chủ chấm lại.
 *
 * Phải khớp `RunAction` trong `@datn/game-core`. Kiểm ở đây là lớp chắn đầu
 * tiên: dữ liệu rác bị chặn trước khi chạm vào máy chạy màn chơi.
 */
export const RunActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ANSWER_CHOICE'), optionIndex: z.number().int().min(0).max(9) }),
  z.object({ type: z.literal('ANSWER_TEXT'), text: z.string().max(4000) }),
  z.object({ type: z.literal('ANSWER_ORDERING') }),
  z.object({ type: z.literal('ANSWER_PRIORITIZING') }),
  z.object({
    type: z.literal('MOVE_ITEM'),
    index: z.number().int().min(0).max(50),
    direction: z.union([z.literal(-1), z.literal(1)]),
  }),
  z.object({ type: z.literal('TOGGLE_PICK'), itemId: z.string().max(64) }),
  z.object({ type: z.literal('USE_HINT') }),
  z.object({ type: z.literal('TIMEOUT') }),
  z.object({ type: z.literal('CONTINUE') }),
]);

/**
 * Trần số hành động. Một màn chơi thật dùng khoảng vài chục; đặt trần để một
 * yêu cầu dị dạng không bắt máy chủ chạy vòng lặp vô tận.
 */
export const MAX_ACTIONS = 400;

export const StartRunSchema = z.object({
  scenarioKey: z.string().min(1).max(128),
});
export type StartRunDto = z.infer<typeof StartRunSchema>;

export const CompleteRunSchema = z.object({
  actions: z.array(RunActionSchema).max(MAX_ACTIONS),
  /** Người chơi chấm tình huống có giống thực tế không. */
  rating: z.number().int().min(1).max(5).optional(),
});
export type CompleteRunDto = z.infer<typeof CompleteRunSchema>;
