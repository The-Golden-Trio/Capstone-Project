import { z } from 'zod';

/** openapi `CreateReviewCriteriaVersionInput`. */
export const CreateReviewCriteriaVersionSchema = z.object({
  criteria: z
    .array(z.object({ text: z.string().trim().min(1).max(500) }))
    .min(1, 'cần ít nhất một tiêu chí'),
});
export type CreateReviewCriteriaVersionInput = z.infer<
  typeof CreateReviewCriteriaVersionSchema
>;

/** openapi `ReviewCriteria`. */
export interface ReviewCriteria {
  versionNo: number;
  criteria: Array<{ criterionId: string; text: string }>;
}

/** openapi `StaffOccupation`. */
export interface StaffOccupation {
  id: string;
  domainId: string;
  code: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
  myRole: 'CONTENT_ADMIN' | 'DOMAIN_EXPERT';
}

/** openapi `ProfileEdit` (phần đọc). */
export interface ProfileEdit {
  levels: Array<{
    levelNo: number;
    band: string;
    creditThreshold: number;
    salaryMin?: number;
    salaryMax?: number;
    title: string;
    futureRole?: string;
    competencies: Array<{ competencyId: string; proficiency: string }>;
    tasks: Array<{ taskId: string; text: string }>;
  }>;
  downsides: string[];
  generationRules: string[];
  adjacency: Array<{
    occupationId: string;
    overlap: number;
    maxStartLevelNo: number;
    isVisible: boolean;
  }>;
}
