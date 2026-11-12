/** Mọi operation staff mà màn hình gọi, đặt theo `operationId` của openapi. */
import { api } from './client';
import { clearSession, getRefreshToken, setSession } from './session';
import type {
  Asset,
  AssetKind,
  Assignment,
  Build,
  CheckReport,
  GenerationInput,
  GenerationRun,
  JobAccepted,
  LifecycleEntry,
  Me,
  Notification,
  Page,
  Presentation,
  ProfileEdit,
  ReferenceAnswer,
  ReviewCriteria,
  ReviewDecisionInput,
  ReviewQueueItem,
  ReviewView,
  ScenarioContent,
  ScenarioDetail,
  ScenarioListItem,
  ScenarioStatus,
  Session,
  SituationOptions,
  StaffOccupation,
} from './types';

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== '') s.set(k, String(v));
  const out = s.toString();
  return out ? `?${out}` : '';
};

export const authApi = {
  async signIn(email: string, password: string): Promise<Me> {
    const session = await api<Session>('/auth/sign-in', {
      method: 'POST',
      body: { email, password },
    });
    setSession(session);
    return session.user;
  },
  getMe: () => api<Me>('/me'),
  async signOut(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      await api<void>('/auth/sign-out', {
        method: 'POST',
        body: refreshToken ? { refreshToken } : {},
      });
    } finally {
      clearSession();
    }
  },
  requestPasswordReset: (email: string) =>
    api<void>('/auth/password-reset', { method: 'POST', body: { email } }),
  confirmPasswordReset: (token: string, newPassword: string) =>
    api<void>('/auth/password-reset/confirm', {
      method: 'POST',
      body: { token, newPassword },
    }),
};

export const staffApi = {
  listNotifications: () => api<Page<Notification>>('/staff/notifications'),
  listMyOccupations: () => api<StaffOccupation[]>('/staff/occupations'),
  getOccupationProfileForEdit: (occupationId: string) =>
    api<ProfileEdit>(`/staff/occupations/${occupationId}/profile`),
  getReviewCriteria: (occupationId: string) =>
    api<ReviewCriteria>(`/staff/occupations/${occupationId}/review-criteria`),
  createReviewCriteriaVersion: (occupationId: string, texts: string[]) =>
    api<ReviewCriteria>(`/staff/occupations/${occupationId}/review-criteria`, {
      method: 'POST',
      body: { criteria: texts.map((text) => ({ text })) },
    }),

  listScenarios: (query: {
    occupationId?: string;
    status?: ScenarioStatus;
    mine?: boolean;
    limit?: number;
  }) => api<Page<ScenarioListItem>>(`/staff/scenarios${qs(query)}`),
  openScenario: (taskId: string) =>
    api<ScenarioDetail>('/staff/scenarios', {
      method: 'POST',
      body: { taskId },
    }),
  getScenario: (id: string) => api<ScenarioDetail>(`/staff/scenarios/${id}`),
  assignScenarioStaff: (
    id: string,
    body: { authorId: string; reviewerId: string; deadlineAt: string },
  ) =>
    api<Assignment>(`/staff/scenarios/${id}/assignment`, {
      method: 'PUT',
      body,
    }),
  getScenarioHistory: (id: string) =>
    api<LifecycleEntry[]>(`/staff/scenarios/${id}/history`),

  getSituationOptions: (id: string) =>
    api<SituationOptions>(`/staff/scenarios/${id}/situation-options`),
  listGenerations: (id: string) =>
    api<GenerationRun[]>(`/staff/scenarios/${id}/generations`),
  requestGeneration: (id: string, body: GenerationInput) =>
    api<JobAccepted>(`/staff/scenarios/${id}/generations`, {
      method: 'POST',
      body,
    }),
  requestRevision: (id: string, part: string, request: string) =>
    api<JobAccepted>(`/staff/scenarios/${id}/revisions`, {
      method: 'POST',
      body: { part, request },
    }),
  saveScenarioContent: (
    id: string,
    version: string,
    content: ScenarioContent,
  ) =>
    api<ScenarioDetail>(`/staff/scenarios/${id}/content`, {
      method: 'PUT',
      body: content,
      headers: { 'If-Match': `"${version}"` },
    }),
  runContentChecks: (id: string) =>
    api<CheckReport>(`/staff/scenarios/${id}/checks`, { method: 'POST' }),
  listReferenceAnswers: (id: string) =>
    api<ReferenceAnswer[]>(`/staff/scenarios/${id}/reference-answers`),
  addReferenceAnswer: (id: string, body: ReferenceAnswer) =>
    api<ReferenceAnswer>(`/staff/scenarios/${id}/reference-answers`, {
      method: 'POST',
      body,
    }),
  submitScenario: (id: string) =>
    api<ScenarioDetail>(`/staff/scenarios/${id}/submit`, { method: 'POST' }),

  listMyReviewQueue: () => api<ReviewQueueItem[]>('/staff/reviews'),
  openScenarioForReview: (id: string) =>
    api<ReviewView>(`/staff/scenarios/${id}/review`),
  decideReview: (id: string, body: ReviewDecisionInput) =>
    api<ScenarioDetail>(`/staff/scenarios/${id}/review`, {
      method: 'POST',
      body,
    }),
  listReviewAssignments: (query: {
    overdue?: boolean;
    occupationId?: string;
  }) => api<Assignment[]>(`/staff/review-assignments${qs(query)}`),
  reassignReview: (
    assignmentId: string,
    body: { reviewerId: string; deadlineAt: string },
  ) =>
    api<Assignment>(`/staff/review-assignments/${assignmentId}/reassign`, {
      method: 'POST',
      body,
    }),

  listAssets: (kind?: AssetKind) =>
    api<Asset[]>(`/staff/assets${qs({ kind })}`),
  uploadAsset: (input: {
    kind: AssetKind;
    sourceNote: string;
    biasChecked: boolean;
    file: File;
  }) => {
    const form = new FormData();
    form.set('kind', input.kind);
    form.set('sourceNote', input.sourceNote);
    form.set('biasChecked', String(input.biasChecked));
    form.set('file', input.file);
    return api<Asset>('/staff/assets', { method: 'POST', form });
  },
  getPresentation: (id: string) =>
    api<Presentation>(`/staff/scenarios/${id}/presentation`),
  savePresentation: (id: string, body: Presentation) =>
    api<Presentation>(`/staff/scenarios/${id}/presentation`, {
      method: 'PUT',
      body,
    }),
  buildDraftGame: (id: string) =>
    api<Build>(`/staff/scenarios/${id}/builds`, { method: 'POST' }),
  getBuild: (buildId: string) => api<Build>(`/staff/builds/${buildId}`),
};
