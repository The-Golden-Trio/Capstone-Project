/**
 * `PlayApi` gọi máy chủ thật theo `reports/master/api/openapi.yaml`.
 *
 * Chưa chạy được: máy chủ chưa có các endpoint `/api/v1/runs…` (đang làm theo
 * SD-01, SD-02, SD-08). Viết sẵn để khi máy chủ xong chỉ cần đổi
 * `VITE_PLAY_API=http`, không phải sửa màn hình.
 */
import { ScenarioSchema } from '@datn/game-core';
import { PlayApiError, type Accepted, type PlayApi } from './contract';
import { readSse } from './sse';
import type {
  ActivityView,
  AnswerResult,
  JobAccepted,
  PlayStreamEvent,
  Problem,
  Run,
  ScenarioSummary,
  ViewHintResult,
} from './types';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`;

export interface HttpPlayApiOptions {
  /** Bearer token của phiên (Q2). `null` thì không gửi header. */
  getToken?: () => string | null;
  /** Nơi đặt tệp phát hành; mặc định cùng origin. */
  releaseBaseUrl?: string;
}

export function createHttpPlayApi(options: HttpPlayApiOptions = {}): PlayApi {
  const getToken = options.getToken ?? (() => null);
  const releaseBaseUrl = options.releaseBaseUrl ?? '/releases';

  const headers = (json: boolean): HeadersInit => {
    const out: Record<string, string> = {};
    const token = getToken();
    if (token) out['Authorization'] = `Bearer ${token}`;
    if (json) out['Content-Type'] = 'application/json';
    return out;
  };

  async function call(
    path: string,
    init: { method?: 'GET' | 'POST'; body?: unknown } = {},
  ): Promise<Response> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: init.method ?? 'GET',
      credentials: 'include',
      headers: headers(init.body !== undefined),
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!response.ok) throw await toError(response);
    return response;
  }

  const json = async <T>(response: Response): Promise<T> =>
    (await response.json()) as T;

  async function accepted<T>(response: Response): Promise<Accepted<T>> {
    if (response.status === 202)
      return { status: 202, body: await json<JobAccepted>(response) };
    return {
      status: response.status === 201 ? 201 : 200,
      body: await json<T>(response),
    };
  }

  return {
    mode: 'http',

    startRun: async (input) =>
      json<Run>(await call('/runs', { method: 'POST', body: input })),

    getRun: async (runId) => json<Run>(await call(`/runs/${runId}`)),

    getCurrentActivity: async (runId) =>
      json<ActivityView>(await call(`/runs/${runId}/activity`)),

    submitAnswer: async (runId, input) =>
      accepted<AnswerResult>(
        await call(`/runs/${runId}/answers`, { method: 'POST', body: input }),
      ),

    viewHint: async (runId, activityKey) =>
      json<ViewHintResult>(
        await call(`/runs/${runId}/hints`, {
          method: 'POST',
          body: { activityKey },
        }),
      ),

    flagContent: async (runId, input) => {
      await call(`/runs/${runId}/flags`, { method: 'POST', body: input });
    },

    finishRun: async (runId) =>
      accepted<ScenarioSummary>(
        await call(`/runs/${runId}/finish`, { method: 'POST' }),
      ),

    getRunSummary: async (runId) =>
      json<ScenarioSummary>(await call(`/runs/${runId}/summary`)),

    openEventStream: (onEvent) => {
      const controller = new AbortController();
      void (async () => {
        const response = await fetch(`${BASE_URL}/stream`, {
          headers: { ...headers(false), Accept: 'text/event-stream' },
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;
        await readSse(response.body, (message) => {
          try {
            onEvent(JSON.parse(message.data) as PlayStreamEvent);
          } catch {
            // Tin không đọc được thì bỏ qua; màn hình còn polling dự phòng.
          }
        });
      })().catch(() => undefined);
      return () => controller.abort();
    },

    loadRelease: async (run) => {
      // §5.3.1 / SD-08: ứng dụng lấy bản phát hành theo version qua CDN. Đường
      // dẫn và hình dạng tệp chưa được chốt; tạm coi tệp là một `Scenario` của
      // game-core đặt ở `<releaseBaseUrl>/<releaseVersion>`. Cần chốt cùng
      // phía Content lifecycle khi làm SD-08.
      const response = await fetch(
        `${releaseBaseUrl}/${encodeURIComponent(run.releaseVersion ?? '')}`,
      );
      if (!response.ok) throw await toError(response);
      return ScenarioSchema.parse(await response.json());
    },
  };
}

async function toError(response: Response): Promise<PlayApiError> {
  try {
    const problem = (await response.json()) as Problem;
    if (problem && typeof problem.code === 'string')
      return new PlayApiError(problem);
  } catch {
    // Thân không phải Problem.
  }
  return new PlayApiError({
    type: 'about:blank',
    title: `HTTP ${response.status}`,
    status: response.status,
    code: 'HTTP_ERROR',
  });
}
