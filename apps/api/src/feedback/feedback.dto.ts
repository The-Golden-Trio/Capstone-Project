import { z } from 'zod';

/** openapi `RatingInput`: năm tiêu chí (DR-08), mỗi tiêu chí 1–5. */
export const RatingInputSchema = z.object({
  scores: z.record(z.string(), z.number().int().min(1).max(5)),
  comment: z.string().trim().max(2000).optional(),
});
export type RatingInput = z.infer<typeof RatingInputSchema>;

/** openapi `SendAppFeedbackInput`. */
export const SendAppFeedbackSchema = z.object({
  text: z.string().trim().min(1, 'cần nội dung góp ý').max(4000),
  appVersion: z.string().trim().min(1).max(20),
});
export type SendAppFeedbackInput = z.infer<typeof SendAppFeedbackSchema>;

/** openapi `RatingSummary`. */
export interface RatingSummary {
  responseCount: number;
  /** Dưới ngưỡng `RATING_MIN_RESPONSES` (NFR-06): không công bố điểm. */
  withheld: boolean;
  averages: Record<string, number>;
}

export type RatingLockedReason = 'LEVELS_NOT_COMPLETED' | 'ALREADY_RATED';

/** openapi `RatingForm`. */
export interface RatingForm {
  occupationId: string;
  eligible: boolean;
  lockedReason: RatingLockedReason | null;
  attributes: Array<{ code: string; label: string; sortOrder: number }>;
}
