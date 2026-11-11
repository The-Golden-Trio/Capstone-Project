/**
 * Đầu vào của API ca làm (`/api/v1/shift-runs`). ĐỀ XUẤT ngoài `openapi.yaml`:
 * xem `docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`.
 */
import { z } from 'zod';

const id = z.string().min(1).max(80);
const text = z.string().trim().min(1).max(4000);

export const StartShiftSchema = z.object({
  /** Mã seed ca làm, ví dụ `SWE_BACKEND.L3.m2`. */
  taskId: id,
  enrolmentId: id.optional(),
});
export type StartShiftDto = z.infer<typeof StartShiftSchema>;

/** Một lượt của người chơi. `turnId` do máy khách tạo; gửi lại cùng id thì nhận lại kết quả cũ (NFR-04). */
export const TurnSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('action'),
    turnId: z.uuid(),
    key: id,
    fields: z.record(id, z.string().max(4000)).optional(),
    ticks: z.array(id).max(20).optional(),
  }),
  z.object({ kind: z.literal('say'), turnId: z.uuid(), text }),
  z.object({ kind: z.literal('end_conversation'), turnId: z.uuid() }),
  z.object({
    kind: z.literal('choose'),
    turnId: z.uuid(),
    option: id,
    elapsedMs: z.number().int().nonnegative().optional(),
  }),
  z.object({ kind: z.literal('timeout'), turnId: z.uuid() }),
  z.object({
    kind: z.literal('save_artefact'),
    turnId: z.uuid(),
    artefact: id,
    fields: z.record(id, z.string().max(4000)),
    ticks: z.array(id).max(20).optional(),
  }),
  z.object({ kind: z.literal('confirm_end'), turnId: z.uuid() }),
  z.object({ kind: z.literal('cancel_end'), turnId: z.uuid() }),
  z.object({ kind: z.literal('hint'), turnId: z.uuid() }),
]);
export type TurnDto = z.infer<typeof TurnSchema>;

export const NoteSchema = z.object({ text });
export const ShiftFlagSchema = z.object({
  activityKey: id,
  reason: z.string().trim().min(1).max(1000),
});
