/**
 * Trạng thái màn ca làm ở trình duyệt. Máy chủ là nguồn chân lý: store chỉ
 * giữ bản sao của cảnh và lời thoại, gộp tin từ `/api/v1/stream`, và tải lại
 * khi cần. Đang chờ AI thì có polling dự phòng, rớt luồng sự kiện cũng không kẹt.
 */
import { create } from 'zustand';
import { isPlayApiError } from '../api/contract';
import {
  getShiftApi,
  newTurnId,
  type Line,
  type ShiftRunView,
  type ShiftScene,
  type ShiftStreamEvent,
  type TurnBody,
} from './shiftApi';

/** Polling dự phòng khi đang chờ AI. */
export const POLL_MS = 5_000;

export interface ShiftSessionState {
  runId: string | null;
  run: ShiftRunView | null;
  scene: ShiftScene | null;
  lines: Line[];
  /** Lượt đang chờ AI (202). */
  waitingTurn: string | null;
  /** Nhà cung cấp model đang chậm. */
  delayed: boolean;
  busy: boolean;
  error: string | null;
  /** Lý do máy chủ từ chối thao tác (422). */
  invalid: string | null;

  open(runId: string): Promise<void>;
  close(): void;
  send(body: TurnBody): Promise<boolean>;
  resume(): Promise<void>;
  addNote(text: string): Promise<void>;
  flag(activityKey: string, reason: string): Promise<void>;
  refresh(): Promise<void>;
  handle(event: ShiftStreamEvent): void;
}

/** Gộp dòng mới vào danh sách theo `seq`, không trùng, đúng thứ tự. */
export function mergeLines(
  current: readonly Line[],
  incoming: readonly Line[],
): Line[] {
  if (incoming.length === 0) return current as Line[];
  const bySeq = new Map(current.map((l) => [l.seq, l]));
  for (const l of incoming) bySeq.set(l.seq, l);
  return [...bySeq.values()].sort((a, b) => a.seq - b.seq);
}

const messageOf = (err: unknown): string =>
  isPlayApiError(err)
    ? err.message
    : 'Không kết nối được máy chủ. Thử lại sau nhé.';

let stopStream: (() => void) | null = null;
let poller: ReturnType<typeof setInterval> | null = null;

const initial = {
  runId: null,
  run: null,
  scene: null,
  lines: [] as Line[],
  waitingTurn: null,
  delayed: false,
  busy: false,
  error: null,
  invalid: null,
};

export const useShiftSession = create<ShiftSessionState>()((set, get) => {
  const startPolling = () => {
    if (poller) return;
    poller = setInterval(() => {
      if (!get().waitingTurn) {
        if (poller) clearInterval(poller);
        poller = null;
        return;
      }
      void get().refresh();
    }, POLL_MS);
  };

  const wait = (turnId: string | null) => {
    set({ waitingTurn: turnId, delayed: false });
    if (turnId) startPolling();
  };

  return {
    ...initial,

    async open(runId) {
      get().close();
      set({ ...initial, runId, busy: true });
      const api = getShiftApi();
      stopStream = api.openStream((event) => get().handle(event));
      try {
        const [run, scene, lines] = await Promise.all([
          api.get(runId),
          api.scene(runId),
          api.transcript(runId),
        ]);
        set({ run, scene, lines, busy: false });
        wait(scene.paused ? null : scene.pendingTurnId);
      } catch (err) {
        set({ busy: false, error: messageOf(err) });
      }
    },

    close() {
      stopStream?.();
      stopStream = null;
      if (poller) clearInterval(poller);
      poller = null;
    },

    async send(body) {
      const { runId, busy, waitingTurn } = get();
      if (!runId || busy || waitingTurn) return false;
      set({ busy: true, error: null, invalid: null });
      try {
        const res = await getShiftApi().turn(runId, body, newTurnId());
        set({ lines: mergeLines(get().lines, res.lines), busy: false });
        if (res.status === 200) set({ scene: res.scene });
        else wait(res.turnId);
        return true;
      } catch (err) {
        if (isPlayApiError(err) && err.code === 'TURN_INVALID')
          set({ busy: false, invalid: err.errors[0]?.reason ?? err.message });
        else set({ busy: false, error: messageOf(err) });
        return false;
      }
    },

    async resume() {
      const { runId, scene } = get();
      if (!runId) return;
      try {
        await getShiftApi().resume(runId);
        if (scene) set({ scene: { ...scene, paused: false } });
        wait(scene?.pendingTurnId ?? null);
      } catch (err) {
        set({ error: messageOf(err) });
      }
    },

    async addNote(text) {
      const { runId } = get();
      if (!runId) return;
      try {
        await getShiftApi().note(runId, text);
        await get().refresh();
      } catch (err) {
        set({ error: messageOf(err) });
      }
    },

    async flag(activityKey, reason) {
      const { runId } = get();
      if (!runId) return;
      try {
        await getShiftApi().flag(runId, activityKey, reason);
      } catch (err) {
        set({ error: messageOf(err) });
      }
    },

    async refresh() {
      const { runId, lines } = get();
      if (!runId) return;
      try {
        const api = getShiftApi();
        const after = lines[lines.length - 1]?.seq;
        const [scene, more] = await Promise.all([
          api.scene(runId),
          api.transcript(runId, after),
        ]);
        set({ scene, lines: mergeLines(get().lines, more) });
        if (!scene.pendingTurnId || scene.paused)
          set({ waitingTurn: null, delayed: false });
      } catch (err) {
        set({ error: messageOf(err) });
      }
    },

    handle(event) {
      const { runId, scene } = get();
      if (event.runId !== runId) return;
      switch (event.type) {
        case 'turn.lines':
          set({ lines: mergeLines(get().lines, event.payload.lines) });
          return;
        case 'turn.done':
          set({
            scene: scene
              ? {
                  ...scene,
                  ...event.payload.scene,
                  paused: false,
                  pendingTurnId: null,
                }
              : null,
            waitingTurn: null,
            delayed: false,
          });
          // Bù dòng nào lỡ mất trên luồng.
          void get().refresh();
          return;
        case 'provider.delay':
          set({ delayed: true });
          return;
        case 'run.paused':
          set({
            scene: scene ? { ...scene, paused: true } : null,
            waitingTurn: null,
            delayed: false,
          });
          return;
      }
    },
  };
});
