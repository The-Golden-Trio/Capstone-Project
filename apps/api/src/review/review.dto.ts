import { z } from 'zod';

/** openapi `ReviewDecisionInput`. */
export const ReviewDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REQUEST_CHANGES', 'REJECT']),
  comment: z.string().trim().max(4000).optional(),
  answers: z.array(
    z.object({
      criterionId: z.uuid(),
      verdict: z.enum(['MET', 'NOT_MET']),
      comment: z.string().trim().max(2000).optional(),
    }),
  ),
});
export type ReviewDecisionInput = z.infer<typeof ReviewDecisionSchema>;

/** openapi `ReassignReviewInput`. */
export const ReassignReviewSchema = z.object({
  reviewerId: z.uuid(),
  deadlineAt: z.iso.datetime({ offset: true }),
});
export type ReassignReviewInput = z.infer<typeof ReassignReviewSchema>;

export const ListAssignmentsQuerySchema = z.object({
  overdue: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  occupationId: z.uuid().optional(),
});
