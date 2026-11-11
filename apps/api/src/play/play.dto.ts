/**
 * Đầu vào của nhóm Play trong `reports/master/api/openapi.yaml`, kiểm bằng zod.
 *
 * `taskId` hiện là khoá kịch bản (`SWE_BACKEND_L1_S_EXEC`), không phải uuid:
 * nội dung prototype chưa có bảng `task` (ERD-03). `enrolmentId` được nhận
 * nhưng chưa dùng: quyền vào cấp kiểm bằng tiến độ, như luồng cũ.
 */
import { z } from 'zod';

export const StartRunSchema = z.object({
  enrolmentId: z.string().min(1).max(100),
  taskId: z.string().min(1).max(100),
});
export type StartRunDto = z.infer<typeof StartRunSchema>;

export const AnswerSchema = z.object({
  answerId: z.string().uuid(),
  activityKey: z.string().min(1).max(20),
  followupNo: z.number().int().min(0).default(0),
  randomEventId: z.string().optional(),
  text: z.string().max(4000).optional(),
  selection: z.union([z.string(), z.array(z.string())]).optional(),
});
export type AnswerDto = z.infer<typeof AnswerSchema>;

export const HintSchema = z.object({ activityKey: z.string().min(1).max(20) });
export type HintDto = z.infer<typeof HintSchema>;

export const FlagSchema = z.object({
  activityKey: z.string().min(1).max(20),
  reason: z.string().trim().min(1).max(1000),
});
export type FlagDto = z.infer<typeof FlagSchema>;
