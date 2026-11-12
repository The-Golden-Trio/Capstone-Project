/**
 * Client của API ca làm (`/api/v1/shift-runs`, Game Design W45). Đường dẫn
 * và hình dạng là ĐỀ XUẤT ngoài `openapi.yaml`:
 * `docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`.
 *
 * Phiên là Bearer (`api/session`); gặp 401 thì làm mới phiên một lần rồi gọi
 * lại. Tin trên `/api/v1/stream` đọc bằng `fetch` (không dùng EventSource),
 * nối lại với `Last-Event-ID` để nhận bù tin đã lỡ.
 */
import type { shift } from '@datn/game-core';
import { authFetch } from '../../api/session';
import { PlayApiError } from '../api/contract';
import { readSse } from '../api/sse';
import type { Problem } from '../api/types';

const ROOT = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`;
const BASE = `${ROOT}/shift-runs`;

export type Line = shift.TranscriptLine;
export type SceneView = shift.SceneView;
export type ShiftSummary = shift.ShiftSummary;

export interface ShiftTask {
  taskId: string;
  title: string;
  situation: string;
  goal: string;
  minutes: number;
}

export interface ShiftRunView {
  id: string;
  status: string;
  seedId: string;
  releaseVersion: string;
  title: string;
  goal: string;
  playerRole: string;
  situation: string;
  cast: Array<{ slot: string; name: string; relation: string }>;
  glossary: Array<{ term: string; plain: string }>;
  startedAt: string;
  paused: boolean;
  pendingTurnId: string | null;
}

export type ShiftScene = SceneView & {
  paused: boolean;
  pendingTurnId: string | null;
  notes: Array<{ text: string; at: string }>;
};

/** Một lượt của người chơi, chưa có `turnId`. */
export type TurnBody =
  | {
      kind: 'action';
      key: string;
      fields?: Record<string, string>;
      ticks?: string[];
    }
  | { kind: 'say'; text: string }
  | { kind: 'end_conversation' }
  | { kind: 'choose'; option: string; elapsedMs?: number }
  | { kind: 'timeout' }
  | {
      kind: 'save_artefact';
      artefact: string;
      fields: Record<string, string>;
      ticks?: string[];
    }
  | { kind: 'confirm_end' }
  | { kind: 'cancel_end' }
  | { kind: 'hint' };

export type TurnResult =
  | { status: 200; turnId: string; lines: Line[]; scene: ShiftScene }
  | { status: 202; turnId: string; jobId: string; lines: Line[] };

export type ShiftStreamEvent =
  | {
      type: 'turn.lines';
      runId: string;
      payload: { turnId: string; lines: Line[] };
    }
  | {
      type: 'turn.done';
      runId: string;
      payload: { turnId: string; scene: SceneView; ended: boolean };
    }
  | {
      type: 'provider.delay';
      runId: string;
      payload: { turnId: string; waitingFor: 'narration' | 'checks' };
    }
  | {
      type: 'run.paused';
      runId: string;
      payload: { turnId: string; reason: string };
    };

const SHIFT_EVENTS = new Set([
  'turn.lines',
  'turn.done',
  'provider.delay',
  'run.paused',
]);

export interface ShiftApi {
  tasks(roleCode: string, band: string): Promise<ShiftTask[]>;
  start(taskId: string): Promise<ShiftRunView>;
  get(runId: string): Promise<ShiftRunView>;
  scene(runId: string): Promise<ShiftScene>;
  transcript(runId: string, after?: number): Promise<Line[]>;
  turn(runId: string, body: TurnBody, turnId?: string): Promise<TurnResult>;
  resume(runId: string): Promise<void>;
  note(runId: string, text: string): Promise<void>;
  flag(runId: string, activityKey: string, reason: string): Promise<void>;
  summary(runId: string): Promise<ShiftSummary>;
  /** Nghe tin của các lượt ca làm. Trả hàm đóng. */
  openStream(onEvent: (event: ShiftStreamEvent) => void): () => void;
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

async function call(
  url: string,
  init: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<Response> {
  const send = () =>
    authFetch(url, {
      method: init.method ?? 'GET',
      headers:
        init.body === undefined
          ? undefined
          : { 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  const response = await send();
  if (!response.ok) throw await toError(response);
  return response;
}

const json = async <T>(response: Response): Promise<T> =>
  (response.status === 204 ? null : await response.json()) as T;

export const newTurnId = (): string => crypto.randomUUID();

export function createShiftApi(reconnectMs = 2000): ShiftApi {
  return {
    tasks: async (roleCode, band) =>
      json(
        await call(
          `${BASE}/tasks?roleCode=${encodeURIComponent(roleCode)}&band=${encodeURIComponent(band)}`,
        ),
      ),
    start: async (taskId) =>
      json(await call(BASE, { method: 'POST', body: { taskId } })),
    get: async (runId) => json(await call(`${BASE}/${runId}`)),
    scene: async (runId) => json(await call(`${BASE}/${runId}/scene`)),
    transcript: async (runId, after) =>
      json(
        await call(
          `${BASE}/${runId}/transcript${after !== undefined ? `?after=${after}` : ''}`,
        ),
      ),
    turn: async (runId, body, turnId = newTurnId()) => {
      const response = await call(`${BASE}/${runId}/turns`, {
        method: 'POST',
        body: { ...body, turnId },
      });
      const data = await response.json();
      return response.status === 202
        ? { status: 202, turnId, jobId: data.jobId, lines: data.lines ?? [] }
        : { status: 200, turnId, lines: data.lines ?? [], scene: data.scene };
    },
    resume: async (runId) => {
      await call(`${BASE}/${runId}/resume`, { method: 'POST' });
    },
    note: async (runId, text) => {
      await call(`${BASE}/${runId}/notes`, { method: 'POST', body: { text } });
    },
    flag: async (runId, activityKey, reason) => {
      await call(`${BASE}/${runId}/flags`, {
        method: 'POST',
        body: { activityKey, reason },
      });
    },
    summary: async (runId) => json(await call(`${BASE}/${runId}/summary`)),

    openStream: (onEvent) => {
      const controller = new AbortController();
      let lastEventId: string | null = null;
      const connect = async (): Promise<void> => {
        const response = await authFetch(`${ROOT}/stream`, {
          headers: {
            Accept: 'text/event-stream',
            ...(lastEventId ? { 'Last-Event-ID': lastEventId } : {}),
          },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          if (response.status === 401) controller.abort();
          return;
        }
        await readSse(response.body, (message) => {
          if (message.id) lastEventId = message.id;
          try {
            const event = JSON.parse(message.data) as ShiftStreamEvent;
            if (SHIFT_EVENTS.has(event.type)) onEvent(event);
          } catch {
            // Tin không đọc được thì bỏ qua; màn hình còn polling dự phòng.
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
  };
}

let instance: ShiftApi | null = null;

export function getShiftApi(): ShiftApi {
  instance ??= createShiftApi();
  return instance;
}

/** Cho test thay bản hiện thực. */
export function setShiftApi(api: ShiftApi | null): void {
  instance = api;
}
