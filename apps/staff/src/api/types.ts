/**
 * Kiểu dữ liệu của các operation staff (`reports/master/api/openapi.yaml`,
 * tag Staff). Viết tay vì máy chủ có vài trường cộng thêm đã ghi ở
 * `docs/project-hub/07-van-de-mo.md` (A22+). Khuôn `ScenarioContent` lấy thẳng
 * từ `@datn/game-core` để form và máy chủ kiểm cùng một schema.
 */
import type { authoring } from '@datn/game-core';

export type Role =
  'EXPLORER' | 'DOMAIN_EXPERT' | 'CONTENT_ADMIN' | 'SYSTEM_ADMIN';

export interface Me {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string;
  roles: Role[];
  hasGoogle: boolean;
  quizDone: boolean;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Me;
}

export type ScenarioStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'IN_PLAYTEST'
  | 'READY'
  | 'PUBLISHED'
  | 'RETIRED';

export type LifecycleAction =
  | 'OPEN'
  | 'SUBMIT'
  | 'START_REVIEW'
  | 'REQUEST_CHANGES'
  | 'REJECT'
  | 'APPROVE'
  | 'BUILD_DRAFT'
  | 'REPORT_DISPLAY_ISSUE'
  | 'REPORT_CONTENT_ISSUE'
  | 'PASS_PLAYTEST'
  | 'PUBLISH'
  | 'DELETE';

export type TaskType = authoring.TaskTypeValue;
export type ScenarioContent = authoring.ScenarioContent;
export type ActivityContent = authoring.ActivityContent;

export interface StaffOccupation {
  id: string;
  domainId: string;
  code: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
  myRole: 'CONTENT_ADMIN' | 'DOMAIN_EXPERT';
}

export interface ProfileEdit {
  levels: Array<{
    levelNo: number;
    band: string;
    title: string;
    creditThreshold: number;
    competencies: Array<{ competencyId: string; proficiency: string }>;
    tasks: Array<{ taskId: string; text: string }>;
  }>;
  downsides: string[];
  generationRules: string[];
}

export interface ScenarioListItem {
  id: string;
  taskTitle: string;
  occupationId: string;
  levelNo: number;
  status: ScenarioStatus;
  authorName: string | null;
  reviewerName: string | null;
  reviewDeadline: string | null;
  updatedAt: string;
}

export interface Assignment {
  assignmentId: string;
  scenarioId: string;
  authorId: string | null;
  reviewerId: string;
  deadlineAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'REASSIGNED';
  overdue: boolean;
}

export interface ScenarioDetail extends ScenarioListItem {
  version: string;
  allowedActions: LifecycleAction[];
  authorContext?: string;
  archetype?: string;
  companyType?: string;
  skillIds: string[];
  content?: ScenarioContent;
  assignment?: Assignment;
  eligibleExperts: Array<{ userId: string; displayName: string }>;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface LifecycleEntry {
  at: string;
  actor: string;
  action: string;
  fromStatus: ScenarioStatus | null;
  toStatus: ScenarioStatus;
  note: string | null;
}

export interface SituationOptions {
  band: string;
  archetypes: string[];
  companyTypes: string[];
  skills: Array<{
    competencyId: string;
    name: string;
    kind: 'EXPERTISE' | 'SOFT_SKILL';
  }>;
}

export interface GenerationInput {
  context: string;
  archetype: string;
  companyType: string;
  competencyIds: string[];
}

export interface JobAccepted {
  jobId: string;
  streamEvent: string;
}

export interface GenerationRun {
  id: string;
  kind: 'GENERATE' | 'REVISE' | 'SUGGEST_PRESENTATION' | 'GENERATE_ASSET';
  status?: string;
  model: string;
  costUsd: number;
  checkPassed: boolean | null;
  createdAt: string;
  requestedBy: string;
}

export interface FailedRule {
  rule: string;
  path: string;
  message: string;
}

export interface CheckReport {
  passed: boolean;
  failedRules: FailedRule[];
}

export interface ReferenceAnswer {
  id?: string;
  activityKey: string;
  answerText: string;
  stratum: 'EASY' | 'MEDIUM' | 'HARD';
  scores: Array<{
    criterionId: string;
    score: 0 | 1 | 2 | null;
    counterproductive?: boolean;
  }>;
}

export interface ReviewCriteria {
  versionNo: number;
  criteria: Array<{ criterionId: string; text: string }>;
}

export interface ReviewView {
  scenario: ScenarioDetail;
  criteria: ReviewCriteria;
  previousReviews: Array<{
    decision: string;
    comment: string;
    decidedAt: string;
  }>;
}

export interface ReviewQueueItem {
  kind: 'REVIEW' | 'REVALIDATION';
  scenarioId: string;
  title: string;
  deadlineAt: string | null;
}

export interface ReviewDecisionInput {
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
  comment?: string;
  answers: Array<{
    criterionId: string;
    verdict: 'MET' | 'NOT_MET';
    comment?: string;
  }>;
}

export type AssetKind = 'NPC' | 'BACKGROUND' | 'SCENE' | 'ICON';

export interface Asset {
  id: string;
  kind: AssetKind;
  url: string;
  source: 'LIBRARY' | 'LICENSED' | 'AI_GENERATED';
  sourceNote: string;
  biasCheck: 'PENDING' | 'PASSED' | 'FAILED';
}

export interface Presentation {
  backgroundAssetId: string | null;
  activities: Array<{
    activityKey: string;
    taskType: TaskType;
    sceneAssetId: string | null;
  }>;
  npcs: Array<{ npcKey: string; avatarAssetId: string }>;
}

export interface Build {
  id: string;
  scenarioId: string;
  contentHash: string;
  builtAt: string;
  content: unknown;
}

export interface Notification {
  id: string;
  template: string;
  payload: Record<string, unknown>;
  createdAt: string;
  readAt: string | null;
}

/** openapi `StreamEvent`. */
export interface StreamEvent {
  type: string;
  scenarioId?: string;
  jobId?: string;
  payload: Record<string, unknown>;
}
