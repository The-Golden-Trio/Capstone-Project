/**
 * Hook dữ liệu cho màn hình. Khoá cache đặt một chỗ để huỷ đúng phần khi
 * dữ liệu đổi (ví dụ chơi xong một ca thì hồ sơ và bản đồ đảo đổi).
 */
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from './index';
import { ApiError } from './port';
import type { LikeLevel, QuizAnswers, RegisterInput } from './types';
import { useSession } from './session';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && count < 2,
    },
  },
});

export const keys = {
  me: ['me'] as const,
  catalogue: ['catalogue'] as const,
  occupation: (code: string) => ['occupation', code] as const,
  quizForm: ['quiz', 'form'] as const,
  quizResult: ['quiz', 'result'] as const,
  island: (id: string) => ['island', id] as const,
  record: ['record'] as const,
  run: (id: string) => ['run', id] as const,
  scene: (id: string) => ['run', id, 'scene'] as const,
  transcript: (id: string) => ['run', id, 'transcript'] as const,
  notes: (id: string) => ['run', id, 'notes'] as const,
  summary: (id: string) => ['run', id, 'summary'] as const,
  ratingForm: (code: string) => ['rating', code] as const,
};

/* ── Phiên ─────────────────────────────────────────────────────────── */

/** Có phiên (access hoặc refresh token) thì mới hỏi `me`. */
export function useMe() {
  const hasSession = useSession((s) =>
    Boolean(s.accessToken || s.refreshToken),
  );
  return useQuery({
    queryKey: keys.me,
    queryFn: () => api.account.me(),
    enabled: hasSession,
    staleTime: 5 * 60_000,
  });
}

function useAfterSignIn() {
  const qc = useQueryClient();
  return async () => {
    qc.clear();
    await qc.prefetchQuery({
      queryKey: keys.me,
      queryFn: () => api.account.me(),
    });
  };
}

export function useSignIn() {
  const after = useAfterSignIn();
  return useMutation({
    mutationFn: async (v: { identifier: string; password: string }) => {
      await api.auth.signIn(v.identifier, v.password);
      await after();
    },
  });
}

export function useRegister() {
  const after = useAfterSignIn();
  return useMutation({
    mutationFn: async (v: RegisterInput) => {
      await api.auth.register(v);
      await after();
    },
  });
}

export function useGoogleSignIn() {
  const after = useAfterSignIn();
  return useMutation({
    mutationFn: async (credential: string) => {
      await api.auth.signInWithGoogle(credential);
      await after();
    },
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.auth.signOut(useSession.getState().refreshToken),
    onSettled: () => {
      useSession.getState().clear();
      qc.clear();
    },
  });
}

/* ── Danh mục nghề ─────────────────────────────────────────────────── */

export const useCatalogue = () =>
  useQuery({
    queryKey: keys.catalogue,
    queryFn: () => api.catalogue.catalogue(),
  });

export const useOccupation = (code: string | undefined) =>
  useQuery({
    queryKey: keys.occupation(code ?? ''),
    queryFn: () => api.catalogue.occupation(code as string),
    enabled: Boolean(code),
  });

/* ── Get to know me ────────────────────────────────────────────────── */

export const useQuizForm = () =>
  useQuery({
    queryKey: keys.quizForm,
    queryFn: () => api.quiz.form(),
    staleTime: Infinity,
  });

export const useQuizResult = () =>
  useQuery({ queryKey: keys.quizResult, queryFn: () => api.quiz.current() });

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: QuizAnswers) => api.quiz.submit(answers),
    onSuccess: (result) => {
      qc.setQueryData(keys.quizResult, result);
      void qc.invalidateQueries({ queryKey: keys.me });
      void qc.invalidateQueries({ queryKey: keys.record });
    },
  });
}

/* ── Tiến độ ───────────────────────────────────────────────────────── */

export function useEnrol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { code: string; levelNo: number }) =>
      api.progress.enrol(v.code, v.levelNo),
    onSuccess: (island, v) => {
      qc.setQueryData(keys.island(island.enrolmentId), island);
      void qc.invalidateQueries({ queryKey: keys.occupation(v.code) });
      void qc.invalidateQueries({ queryKey: keys.catalogue });
      void qc.invalidateQueries({ queryKey: keys.record });
    },
  });
}

export const useIsland = (id: string | undefined) =>
  useQuery({
    queryKey: keys.island(id ?? ''),
    queryFn: () => api.progress.island(id as string),
    enabled: Boolean(id),
  });

export const useRecord = () =>
  useQuery({ queryKey: keys.record, queryFn: () => api.progress.record() });

/* ── Ca làm ────────────────────────────────────────────────────────── */

export function useStartRun() {
  return useMutation({
    mutationFn: (v: { taskId: string; enrolmentId: string | null }) =>
      api.play.start(v.taskId, v.enrolmentId),
  });
}

export const useRun = (id: string | undefined) =>
  useQuery({
    queryKey: keys.run(id ?? ''),
    queryFn: () => api.play.run(id as string),
    enabled: Boolean(id),
  });

export function useReflect(runId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      answers: Record<string, LikeLevel>;
      realism: number | null;
    }) => api.play.reflect(runId, v.answers, v.realism),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.summary(runId) });
      void qc.invalidateQueries({ queryKey: keys.record });
    },
  });
}

export const useRunSummary = (id: string | undefined) =>
  useQuery({
    queryKey: keys.summary(id ?? ''),
    queryFn: () => api.play.summary(id as string),
    enabled: Boolean(id),
    // Chấm ở worker: còn PENDING thì hỏi lại (SSE là đường chính khi có).
    refetchInterval: (q) =>
      q.state.data?.grade.status === 'PENDING' ? 4_000 : false,
  });

/* ── Đánh giá nghề ─────────────────────────────────────────────────── */

export const useRatingForm = (code: string | undefined) =>
  useQuery({
    queryKey: keys.ratingForm(code ?? ''),
    queryFn: () => api.feedback.ratingForm(code as string),
    enabled: Boolean(code),
  });

export function useRate(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { scores: Record<string, number>; comment?: string }) =>
      api.feedback.rate(code, v.scores, v.comment),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.ratingForm(code) });
      void qc.invalidateQueries({ queryKey: keys.occupation(code) });
    },
  });
}

export const errorText = (error: unknown): string =>
  error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : 'Có lỗi xảy ra.';
