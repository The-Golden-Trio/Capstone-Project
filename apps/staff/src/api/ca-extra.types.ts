import type { StaffOccupation } from './types';

export interface Sourced<T> {
  data: T;
  demo: boolean;
}
export interface Domain {
  id: string;
  code: string;
  name: string;
  occupationCount: number;
}
export interface OccupationInput {
  domainId: string;
  code: string;
  name: string;
  summary?: string;
  riasecCode?: string;
}
// ĐỀ XUẤT: metadata báo cáo C02 chưa có trong StaffOccupation của OpenAPI.
// Chỉ demo có các trường này; không ép dữ liệu thật thành số liệu mẫu.
export interface CatalogueOccupation extends StaffOccupation {
  summary?: string;
  riasecCode?: string;
  region?: string;
  levels?: Array<{ level: number; description: string; published: number }>;
  lastValidatedAt?: string | null;
}
export type ReferenceSource = 'ONET' | 'ESCO';
export interface ImportRecord {
  recordId: string;
  kind: 'OCCUPATION' | 'TASK' | 'SKILL';
  sourceCode: string;
  payload: Record<string, unknown>;
  isResolved: boolean;
  isSkipped: boolean;
  adjustedAt: string | null;
}
export interface ImportJob {
  id: string;
  source: ReferenceSource;
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  unresolvedCount: number;
  records: ImportRecord[];
  completedAt: string | null;
}
export interface FixRecordInput {
  action: 'FIX' | 'SKIP' | 'ADAPT';
  payload?: Record<string, unknown>;
}
export interface ImportSummary {
  importId: string;
  occupationsUpdated: number;
  tasksAdded: number;
  competenciesAdded: number;
  skippedRecords: number;
  expertsNotified: number;
  completedAt: string;
}
export interface Release {
  id: string;
  scenarioId: string;
  buildId: string;
  version: string;
  effectiveFrom: string;
  releaseNote: string;
  status: 'READY' | 'PUBLISHED';
}
export interface PublishInput {
  effectiveFrom: string;
  releaseNote?: string;
}
// ĐỀ XUẤT: khung tổng hợp checklist và lịch sử release, chỉ dùng trong demo.
export interface PublishPreview {
  title: string;
  version: string;
  approved: boolean;
  buildReady: boolean;
  playtestDone: boolean;
  checksPassed: boolean;
  releases: Release[];
}
export interface OccupationStatistics {
  plays: number;
  completionRate: number;
  averageScoreByScenario: Array<{
    scenarioId: string;
    title: string;
    average: number;
    flags: number;
  }>;
  ratings: {
    responseCount: number;
    withheld: boolean;
    averages: Record<string, number>;
  };
  coverage: {
    tasksWithPublishedScenario: number;
    tasksTotal: number;
    referenceSamples: number;
  };
  gradingAgreement: number | null;
}
export interface AgreementReport {
  modelConfigVersion: number;
  byStratum: Array<{
    stratum: 'EASY' | 'MEDIUM' | 'HARD';
    samples: number;
    aiExpertKappa: number;
    interExpertKappa: number;
  }>;
  disagreements: Array<{
    scenarioId: string;
    activityKey: string;
    referenceAnswerId: string;
    criterionId: string;
    expertScore: number | null;
    aiScore: number | null;
    expertCounterproductive: boolean;
    aiCounterproductive: boolean;
  }>;
}
export interface ContentFlag {
  id: string;
  scenarioId: string;
  activityKey: string;
  reason: string;
  status: 'OPEN' | 'IN_REVALIDATION' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}
export type PromptKind =
  | 'GRADING'
  | 'FOLLOW_UP'
  | 'FEEDBACK_NOTE'
  | 'GENERATION'
  | 'REVISION'
  | 'PRESENTATION_SUGGESTION'
  | 'IMAGE';
export interface SystemPromptVersion {
  kind: PromptKind;
  versionNo: number;
  text: string;
  changeNote: string | null;
  restoredFromVersionNo: number | null;
  changedBy: {
    userId: string;
    displayName: string;
    role: 'CONTENT_ADMIN' | 'DOMAIN_EXPERT';
  } | null;
  changedAt: string | null;
}

export interface DomainInput {
  code: string;
  name: string;
}
