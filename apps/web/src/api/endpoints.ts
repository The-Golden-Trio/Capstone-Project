/** Mọi lời gọi API của app, gom một chỗ để dễ tra. */
import type { RunAction } from '@datn/game-core';
import { api } from './client';
import {
  CompletedRunSchema,
  EventAnswerResultSchema,
  GameProfileSchema,
  OkSchema,
  ProgressSummarySchema,
  RoleProgressSchema,
  RunHistorySchema,
  SessionUserSchema,
  StartedRunSchema,
  type CompletedRun,
  type EventAnswerResult,
  type GameProfileView,
  type ProgressSummary,
  type RoleProgress,
  type RunHistoryItem,
  type SessionUser,
  type StartedRun,
} from './schemas';

/* ── Xác thực ──────────────────────────────────────────────────────── */

export const authApi = {
  me: (): Promise<SessionUser> =>
    api('/auth/me', SessionUserSchema, { skipRefresh: false }),

  register: (body: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    dateOfBirth: string;
  }): Promise<SessionUser> =>
    api('/auth/register', SessionUserSchema, { method: 'POST', body }),

  login: (body: { identifier: string; password: string }): Promise<SessionUser> =>
    api('/auth/login', SessionUserSchema, { method: 'POST', body }),

  google: (body: {
    credential: string;
    dateOfBirth?: string;
  }): Promise<SessionUser> =>
    api('/auth/google', SessionUserSchema, { method: 'POST', body }),

  logout: (): Promise<{ ok: true }> =>
    api('/auth/logout', OkSchema, { method: 'POST', skipRefresh: true }),

  consent: (body: {
    guardianName: string;
    guardianEmail: string;
  }): Promise<SessionUser> =>
    api('/auth/consent', SessionUserSchema, { method: 'POST', body }),

  updateAccount: (body: {
    displayName?: string;
    email?: string;
  }): Promise<SessionUser> =>
    api('/auth/account', SessionUserSchema, { method: 'PATCH', body }),

  changePassword: (body: {
    currentPassword?: string;
    newPassword: string;
  }): Promise<{ ok: true }> =>
    api('/auth/account/password', OkSchema, { method: 'POST', body }),

  unlinkProvider: (provider: string): Promise<SessionUser> =>
    api(`/auth/account/providers/${provider}`, SessionUserSchema, {
      method: 'DELETE',
    }),

  deleteAccount: (): Promise<{ ok: true }> =>
    api('/auth/account', OkSchema, { method: 'DELETE' }),
};

/* ── Hồ sơ và tiến trình ───────────────────────────────────────────── */

export const profileApi = {
  get: (): Promise<GameProfileView> => api('/profile', GameProfileSchema),

  progress: (): Promise<ProgressSummary> =>
    api('/profile/progress', ProgressSummarySchema),

  runs: (): Promise<RunHistoryItem[]> => api('/profile/runs', RunHistorySchema),

  /** Lộ trình cấp bậc của một nghề — kể cả nghề chưa từng chạm tới. */
  role: (roleCode: string): Promise<RoleProgress> =>
    api(`/profile/roles/${roleCode}`, RoleProgressSchema),

  /** Ghi danh một cấp bậc; trả về lộ trình đã cập nhật. */
  enroll: (roleCode: string, band: string): Promise<RoleProgress> =>
    api(`/profile/roles/${roleCode}/enroll`, RoleProgressSchema, {
      method: 'POST',
      body: { band },
    }),

  submitQuiz: (
    answers: Array<{ questionId: string; optionId: string }>,
  ): Promise<GameProfileView> =>
    api('/profile/quiz', GameProfileSchema, {
      method: 'POST',
      body: { answers },
    }),

  answerEvent: (
    eventId: string,
    body: { roleCode: string; band: string; choiceIndex: number },
  ): Promise<EventAnswerResult> =>
    api(`/profile/events/${eventId}`, EventAnswerResultSchema, {
      method: 'POST',
      body,
    }),

  importLegacy: (body: {
    fit?: Record<string, number>;
    quizDone?: boolean;
    eventsPlayed?: number;
  }): Promise<GameProfileView> =>
    api('/profile/import', GameProfileSchema, { method: 'POST', body }),
};

/* ── Lượt chơi ─────────────────────────────────────────────────────── */

export const runsApi = {
  /** Máy chủ kiểm cấp bậc rồi phát hạt giống. Phải chơi bằng đúng hạt giống đó. */
  start: (scenarioKey: string): Promise<StartedRun> =>
    api('/runs', StartedRunSchema, { method: 'POST', body: { scenarioKey } }),

  /** Nộp chuỗi hành động; máy chủ chạy lại và chấm. */
  complete: (
    runId: string,
    actions: RunAction[],
    rating?: number,
  ): Promise<CompletedRun> =>
    api(`/runs/${runId}/complete`, CompletedRunSchema, {
      method: 'POST',
      body: { actions, rating },
    }),
};
