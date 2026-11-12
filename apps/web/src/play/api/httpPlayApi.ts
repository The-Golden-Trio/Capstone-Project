/**
 * `PlayApi` gọi máy chủ thật theo `reports/master/api/openapi.yaml`
 * (`apps/api/src/play`, SD-01, SD-02).
 *
 * Phiên là Bearer token: mọi lời gọi đi qua `authFetch` (`api/session`), tự
 * gắn header và làm mới phiên. `getToken` chỉ để test đè token.
 */
import { ScenarioSchema } from '@datn/game-core';
import { authFetch } from '../../api/session';
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
  /**
   * Nơi đặt tệp phát hành. Thiết kế đặt trên CDN (§5.3.1); khi chưa có CDN,
   * API phục vụ thay ở `/api/v1/releases/<releaseVersion>`.
   */
  releaseBaseUrl?: string;
  /** Chờ bao lâu rồi nối lại luồng sự kiện khi bị rớt. */
  reconnectMs?: number;
}

export function createHttpPlayApi(options: HttpPlayApiOptions = {}): PlayApi {
  const getToken = options.getToken ?? (() => null);
  const releaseBaseUrl = options.releaseBaseUrl ?? `${BASE_URL}/releases`;
  const reconnectMs = options.reconnectMs ?? 2000;

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
    const response = await authFetch(`${BASE_URL}${path}`, {
      method: init.method ?? 'GET',
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
      // Nối lại với `Last-Event-ID` thì máy chủ gửi bù những gì đã lỡ (hợp
      // đồng `/stream`), nên rớt mạng giữa lúc chờ chấm không làm kẹt màn.
      let lastEventId: string | null = null;

      const connect = async (): Promise<void> => {
        const response = await authFetch(`${BASE_URL}/stream`, {
          headers: {
            ...headers(false),
            Accept: 'text/event-stream',
            ...(lastEventId ? { 'Last-Event-ID': lastEventId } : {}),
          },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          // 401: phiên hết hạn — nối lại cũng vô ích, để màn hình xử lý.
          if (response.status === 401) {
            controller.abort();
            return;
          }
          throw new Error(`stream HTTP ${response.status}`);
        }
        await readSse(response.body, (message) => {
          if (message.id) lastEventId = message.id;
          try {
            onEvent(JSON.parse(message.data) as PlayStreamEvent);
          } catch {
            // Tin không đọc được thì bỏ qua.
          }
        });
      };

      void (async () => {
        while (!controller.signal.aborted) {
          await connect().catch(() => undefined);
          if (controller.signal.aborted) return;
          await new Promise((r) => setTimeout(r, reconnectMs));
        }
      })();
      return () => controller.abort();
    },

    loadRelease: async (run) => {
      // §5.3.1 / SD-08: ứng dụng lấy bản phát hành theo version qua CDN. Đường
      // dẫn và hình dạng tệp chưa được chốt; tạm coi tệp là một `Scenario` của
      // game-core đặt ở `<releaseBaseUrl>/<releaseVersion>`. Cần chốt cùng
      // phía Content lifecycle khi làm SD-08.
      const response = await authFetch(
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
