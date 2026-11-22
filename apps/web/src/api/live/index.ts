/**
 * Dịch vụ gọi API thật cho phần backend đã có (tới 16/11/2026):
 * auth `/v1/auth/*`, `/v1/me`, tài khoản prototype `/auth/account*` (07 A25),
 * ca làm `/v1/shift-runs/*` + SSE `/v1/stream`, đánh giá nghề và góp ý app.
 */
import type {
  AccountService,
  AuthService,
  FeedbackService,
  PlayEvent,
  PlayService,
} from '../port';
import { ApiError, createTurnId } from '../port';
import type {
  Me,
  RatingForm,
  SceneView,
  Session,
  ShiftRun,
  TranscriptLine,
  TurnResult,
} from '../types';
import { useSession } from '../session';
import { API_BASE, http, refreshAccess } from './http';

/* ── Auth ──────────────────────────────────────────────────────────── */

interface LiveMe {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string;
  roles: Me['roles'];
  hasGoogle: boolean;
  quizDone: boolean;
}

/** `/v1/me` chưa trả ngày sinh; lấy thêm từ route tài khoản prototype. */
async function loadMe(): Promise<Me> {
  const [me, legacy] = await Promise.all([
    http<LiveMe>('/me'),
    fetchLegacyMe().catch(() => null),
  ]);
  return {
    ...me,
    dateOfBirth: legacy?.dateOfBirth ?? null,
    stage: readStage(me.id),
  };
}

/**
 * Giai đoạn đang ở (khối A) chưa có trường trên API (xem
 * docs/plans/2026-11-16_explorer-ui-data-contract.md). Tạm giữ trên thiết bị
 * theo id tài khoản để lựa chọn không bị mất; chuyển sang PATCH /v1/me khi có.
 */
const stageKey = (id: string) => `jq:stage:${id}`;
function readStage(id: string): Me['stage'] {
  try {
    return (localStorage.getItem(stageKey(id)) as Me['stage']) ?? null;
  } catch {
    return null;
  }
}
function writeStage(id: string, stage: Me['stage']) {
  try {
    if (stage) localStorage.setItem(stageKey(id), stage);
    else localStorage.removeItem(stageKey(id));
  } catch {
    throw new ApiError(
      0,
      'STORAGE',
      'Trình duyệt đang chặn lưu dữ liệu, chưa lưu được giai đoạn.',
    );
  }
}

async function fetchLegacyMe(): Promise<{ dateOfBirth: string | null }> {
  // Route prototype ở `/api/auth/me`, ngoài tiền tố v1.
  const token = useSession.getState().accessToken;
  const res = await fetch('/api/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as {
    user?: { dateOfBirth?: string | null };
  } & {
    dateOfBirth?: string | null;
  };
  return { dateOfBirth: body.user?.dateOfBirth ?? body.dateOfBirth ?? null };
}

function remember(session: Session): Session {
  useSession.getState().setTokens(session.accessToken, session.refreshToken);
  return session;
}

export const liveAuth: AuthService = {
  register: async (input) =>
    remember(
      await http<Session>('/auth/register', {
        method: 'POST',
        json: input,
        auth: false,
      }),
    ),
  signIn: async (identifier, password) =>
    remember(
      await http<Session>('/auth/sign-in', {
        method: 'POST',
        json: { email: identifier, password },
        auth: false,
      }),
    ),
  signInWithGoogle: async (credential) =>
    remember(
      await http<Session>('/auth/google', {
        method: 'POST',
        json: { credential },
        auth: false,
      }),
    ),
  refresh: async (refreshToken) =>
    remember(
      await http<Session>('/auth/refresh', {
        method: 'POST',
        json: { refreshToken },
        auth: false,
      }),
    ),
  signOut: async (refreshToken) => {
    try {
      await http<void>('/auth/sign-out', {
        method: 'POST',
        json: refreshToken ? { refreshToken } : {},
      });
    } finally {
      useSession.getState().clear();
    }
  },
  requestPasswordReset: (email) =>
    http<void>('/auth/password-reset', {
      method: 'POST',
      json: { email },
      auth: false,
    }),
  confirmPasswordReset: (token, newPassword) =>
    http<void>('/auth/password-reset/confirm', {
      method: 'POST',
      json: { token, newPassword },
      auth: false,
    }),
};

/* ── Tài khoản ─────────────────────────────────────────────────────── */

async function legacy<T>(
  path: string,
  init: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init;
  const send = () =>
    fetch(`/api/auth${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useSession.getState().accessToken ?? ''}`,
      },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  let res = await send();
  if (res.status === 401 && (await refreshAccess())) res = await send();
  if (!res.ok) {
    const p = (await res.json().catch(() => ({}))) as {
      detail?: string;
      message?: string;
    };
    throw new ApiError(
      res.status,
      `HTTP_${res.status}`,
      p.detail ?? p.message ?? 'Có lỗi xảy ra.',
    );
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const liveAccount: AccountService = {
  me: loadMe,
  updateMe: async (patch) => {
    if (patch.displayName !== undefined)
      await legacy('/account', {
        method: 'PATCH',
        json: { displayName: patch.displayName },
      });
    if (patch.stage !== undefined)
      writeStage((await http<LiveMe>('/me')).id, patch.stage);
    return loadMe();
  },
  changePassword: (currentPassword, newPassword) =>
    legacy('/account/password', {
      method: 'POST',
      json: { currentPassword, newPassword },
    }),
  deleteAccount: async () => {
    await legacy('/account', { method: 'DELETE' });
    useSession.getState().clear();
  },
};

/* ── Ca làm ────────────────────────────────────────────────────────── */

interface LiveRun {
  id: string;
  status: string;
  seedId: string;
  title: string;
  goal: string;
  playerRole: string;
  situation: string;
  cast: ShiftRun['cast'];
  glossary: ShiftRun['glossary'];
  paused: boolean;
}

type LiveScene = SceneView & {
  paused: boolean;
  pendingTurnId: string | null;
  notes: Array<{ text: string; at: string }>;
};

/** `SWE_BACKEND.L3.m2` → nghề và số band, để quay lại bản đồ đảo. */
function seedPath(seedId: string): {
  code: string | null;
  band: number | null;
} {
  const m = /^([A-Z0-9_.-]+?)\.L(\d+)\./.exec(seedId);
  return m ? { code: m[1], band: Number(m[2]) } : { code: null, band: null };
}

function toRun(r: LiveRun, enrolmentId: string | null = null): ShiftRun {
  const { code, band } = seedPath(r.seedId);
  return {
    runId: r.id,
    taskId: r.seedId,
    title: r.title,
    goal: r.goal,
    role: r.playerRole,
    scene: r.situation,
    cast: r.cast,
    glossary: r.glossary,
    paused: r.paused,
    ended: r.status !== 'IN_PROGRESS' && r.status !== 'ACTIVE',
    occupationCode: code,
    levelNo: band,
    enrolmentId,
  };
}

/**
 * SSE có Bearer: EventSource không gửi được header, nên đọc luồng bằng
 * fetch và tự tách sự kiện. Một kết nối chung cho mọi lượt đang mở.
 */
type StreamListener = (event: {
  type: string;
  runId?: string;
  payload?: unknown;
}) => void;
const listeners = new Set<StreamListener>();
let streamAbort: AbortController | null = null;
let lastEventId: string | null = null;

function openStream() {
  if (streamAbort) return;
  const abort = new AbortController();
  streamAbort = abort;
  const connect = async (attempt: number): Promise<void> => {
    if (abort.signal.aborted) return;
    try {
      const token = useSession.getState().accessToken;
      const res = await fetch(`${API_BASE}/stream`, {
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(lastEventId ? { 'Last-Event-ID': lastEventId } : {}),
        },
        signal: abort.signal,
      });
      if (res.status === 401 && (await refreshAccess()))
        return connect(attempt);
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        let cut: number;
        while ((cut = buffer.indexOf('\n\n')) >= 0) {
          const chunk = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          let data = '';
          for (const line of chunk.split('\n')) {
            if (line.startsWith('id:')) lastEventId = line.slice(3).trim();
            else if (line.startsWith('data:')) data += line.slice(5).trim();
          }
          if (data) {
            try {
              const event = JSON.parse(data) as Parameters<StreamListener>[0];
              listeners.forEach((l) => l(event));
            } catch {
              /* Bỏ qua dòng hỏng. */
            }
          }
        }
      }
      attempt = 0;
    } catch {
      if (abort.signal.aborted) return;
    }
    // Mất kết nối: thử lại với độ lùi, tối đa 15 s.
    const wait = Math.min(15_000, 1_000 * 2 ** attempt);
    await new Promise((r) => setTimeout(r, wait));
    return connect(attempt + 1);
  };
  void connect(0);
}

function closeStreamIfIdle() {
  if (listeners.size === 0 && streamAbort) {
    streamAbort.abort();
    streamAbort = null;
  }
}

export const livePlay: PlayService = {
  start: async (taskId, enrolmentId) => {
    const r = await http<LiveRun | { run: LiveRun }>('/shift-runs', {
      method: 'POST',
      json: enrolmentId ? { taskId, enrolmentId } : { taskId },
    });
    return toRun('run' in r ? r.run : r, enrolmentId);
  },
  run: async (runId) => toRun(await http<LiveRun>(`/shift-runs/${runId}`)),
  scene: (runId) => http<LiveScene>(`/shift-runs/${runId}/scene`),
  transcript: (runId, after) =>
    http<TranscriptLine[] | { lines: TranscriptLine[] }>(
      `/shift-runs/${runId}/transcript${after !== undefined ? `?after=${after}` : ''}`,
    ).then((r) => (Array.isArray(r) ? r : r.lines)),
  turn: async (runId, input, turnId = createTurnId()): Promise<TurnResult> => {
    const body = await http<{
      turnId: string;
      lines: TranscriptLine[];
      scene?: LiveScene;
      jobId?: string;
    }>(`/shift-runs/${runId}/turns`, {
      method: 'POST',
      json: { ...input, turnId },
    });
    return {
      turnId: body.turnId,
      lines: body.lines ?? [],
      scene: body.scene ?? null,
      pending: !body.scene,
    };
  },
  resume: (runId) =>
    http<void>(`/shift-runs/${runId}/resume`, { method: 'POST' }),
  addNote: (runId, text) =>
    http<void>(`/shift-runs/${runId}/notes`, {
      method: 'POST',
      json: { text },
    }),
  notes: async (runId) =>
    (await http<LiveScene>(`/shift-runs/${runId}/scene`)).notes ?? [],
  flag: (runId, activityKey, reason) =>
    http<void>(`/shift-runs/${runId}/flags`, {
      method: 'POST',
      json: { activityKey, reason },
    }),
  subscribe: (runId, onEvent) => {
    const listener: StreamListener = (e) => {
      if (e.runId && e.runId !== runId) return;
      const p = (e.payload ?? {}) as Record<string, unknown>;
      const turnId = String(p['turnId'] ?? '');
      const map: Record<string, () => PlayEvent> = {
        'turn.lines': () => ({
          type: 'lines',
          turnId,
          lines: (p['lines'] as TranscriptLine[]) ?? [],
        }),
        'turn.done': () => ({
          type: 'done',
          turnId,
          scene: p['scene'] as SceneView,
          ended: Boolean(p['ended']),
        }),
        'provider.delay': () => ({
          type: 'delay',
          turnId,
          waitingFor:
            (p['waitingFor'] as 'narration' | 'checks') ?? 'narration',
        }),
        'run.paused': () => ({
          type: 'paused',
          turnId,
          reason: String(p['reason'] ?? ''),
        }),
      };
      const make = map[e.type];
      if (make) onEvent(make());
    };
    listeners.add(listener);
    openStream();
    return () => {
      listeners.delete(listener);
      closeStreamIfIdle();
    };
  },
  reflect: async () => {
    // Chưa có endpoint ghi câu "thích tới đâu"; giữ lại khi API có (xem tài liệu hợp đồng).
  },
  summary: async (runId) => {
    const [run, story] = await Promise.all([
      http<LiveRun>(`/shift-runs/${runId}`),
      http<import('@datn/game-core').shift.ShiftSummary>(
        `/shift-runs/${runId}/summary`,
      ),
    ]);
    const { code, band } = seedPath(run.seedId);
    return {
      runId,
      title: run.title,
      occupationCode: code,
      occupationName: null,
      levelNo: band,
      enrolmentId: null,
      story,
      reflection: { prompts: [], answered: true },
      // Luồng ca làm chưa chấm điểm (đề xuất API 11/11, mục "Chưa có").
      grade: {
        status: 'NOT_AVAILABLE',
        score: null,
        ending: null,
        feedback: null,
        softSkills: [],
        keywordsGained: [],
      },
    };
  },
};

/* ── Đánh giá nghề, góp ý ──────────────────────────────────────────── */

const CRITERIA_ANCHORS: Record<string, { low: string; high: string }> = {
  SALARY: { low: 'Thấp so với công sức', high: 'Rất tốt' },
  PRESSURE: { low: 'Nhẹ nhàng', high: 'Rất áp lực' },
  DIFFICULTY: { low: 'Dễ bắt nhịp', high: 'Rất khó' },
  WORK_LIFE_BALANCE: { low: 'Khó cân bằng', high: 'Cân bằng tốt' },
  ENJOYMENT: { low: 'Không thích', high: 'Rất thích' },
};

const LOCKED_TEXT: Record<string, string> = {
  LEVELS_NOT_COMPLETED:
    'Bạn đánh giá được sau khi đi hết mọi cấp của nghề này.',
  ALREADY_RATED: 'Bạn đã đánh giá nghề này rồi.',
};

export const liveFeedback: FeedbackService = {
  ratingForm: async (code): Promise<RatingForm> => {
    const form = await http<{
      occupationId: string;
      eligible: boolean;
      lockedReason: string | null;
      attributes: Array<{ code: string; label: string; sortOrder: number }>;
    }>(`/occupations/${encodeURIComponent(code)}/ratings/form`);
    return {
      occupationCode: code,
      occupationName: '',
      locked: !form.eligible,
      lockedReason: form.lockedReason
        ? (LOCKED_TEXT[form.lockedReason] ?? form.lockedReason)
        : null,
      criteria: [...form.attributes]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((a) => ({
          code: a.code,
          name: a.label,
          ...(CRITERIA_ANCHORS[a.code] ?? { low: 'Thấp', high: 'Cao' }),
        })),
      mine: null,
      summary: { responseCount: 0, withheld: true, averages: {} },
    };
  },
  rate: async (code, scores, comment) => {
    await http(`/occupations/${encodeURIComponent(code)}/ratings`, {
      method: 'POST',
      json: comment ? { scores, comment } : { scores },
    });
  },
  sendAppFeedback: async ({ category, message, page }) => {
    const tag = {
      bug: 'Lỗi',
      idea: 'Ý tưởng',
      content: 'Nội dung',
      other: 'Khác',
    }[category];
    await http('/app-feedback', {
      method: 'POST',
      json: {
        text: `[${tag}]${page ? ` (${page})` : ''} ${message}`.slice(0, 4000),
        appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
      },
    });
  },
};
