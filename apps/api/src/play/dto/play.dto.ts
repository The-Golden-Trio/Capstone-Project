/**
 * Đầu vào của API ca làm. Đề xuất ngoài `openapi.yaml`, xem
 * `docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`.
 */
import { z } from 'zod';

const id = z.string().min(1).max(80);
const text = z.string().trim().min(1).max(4000);

export const StartRunSchema = z.object({
  /** Mã seed ca làm, ví dụ `SWE_BACKEND.L3.m2` (Catalogue chưa có `taskId` uuid). */
  taskId: id,
  enrolmentId: id.optional(),
});
export type StartRunDto = z.infer<typeof StartRunSchema>;

/** Một lượt của người chơi. `turnId` do máy khách tạo, gửi lại cùng id thì nhận lại kết quả cũ (NFR-04). */
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
]);
export type TurnDto = z.infer<typeof TurnSchema>;

export const NoteSchema = z.object({ text });
export const FlagSchema = z.object({
  activityKey: id,
  reason: z.string().trim().min(1).max(1000),
});
export const HintSchema = z.object({ turnId: z.uuid() });
