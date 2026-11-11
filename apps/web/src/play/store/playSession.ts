/**
 * Trạng thái màn chơi phía trình duyệt (E10–E12), lái hoàn toàn bằng máy chủ.
 *
 * Khác `runStore` cũ: không chạy engine ở đây. Mỗi câu trả lời gửi lên ngay
 * (SD-01); câu đóng nhận kết quả trong phản hồi, câu tự luận nhận 202 rồi chờ
 * sự kiện trên `/stream`. Store chỉ nhớ đủ để vẽ lại màn khi tải lại trang.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatLine, Scenario } from '@datn/game-core';
import { getPlayApi, isPlayApiError } from '../api/playApi';
import type { ActivityView, PlayStreamEvent, Run } from '../api/types';

export type PlayStage =
  | 'idle'
  | 'loading'
  /** Hoạt động đang mở, chờ người chơi. */
  | 'answering'
  /** Đang gửi câu trả lời. */
  | 'submitting'
  /** Máy chủ đã nhận câu tự luận (202), chờ kết quả trên luồng sự kiện. */
  | 'grading'
  /** NPC hỏi vặn, chờ người chơi trả lời tiếp. */
  | 'followup'
  /** Đọc lời kết của hoạt động. */
  | 'closing'
  /** Chờ máy chủ soạn tổng kết. */
  | 'finishing'
  | 'finished';

export interface FollowupState {
  no: number;
  npcKey: string;
  name: string;
  question: string;
}

interface PlaySessionState {
  runId: string | null;
  run: Run | null;
  activity: ActivityView | null;
  stage: PlayStage;
  /** Lời trao đổi trong hoạt động hiện tại. */
  log: ChatLine[];
  /** Thứ tự đang sắp (ORDERING) và các mục đang chọn (PRIORITIZING). */
  order: string[];
  picked: string[];
  hint: { npcKey: string; text: string } | null;
  followup: FollowupState | null;
  closing: { line: string; next: string | null } | null;
  /** Nhà cung cấp model đang chậm (`provider.delay`). */
  delayed: boolean;
  /** Lý do câu trả lời bị từ chối (`422 ANSWER_INVALID`). */
  invalid: string[];
  error: string | null;
  /** Tên NPC đã gặp trong lượt chơi, theo `npcKey` — gợi ý chỉ trả về khoá. */
  npcNames: Record<string, string>;
}

interface PlaySessionActions {
  open: (runId: string) => Promise<void>;
  move: (index: number, direction: -1 | 1) => void;
  toggle: (key: string) => void;
  submitChoice: (key: string) => Promise<void>;
  submitOrdering: () => Promise<void>;
  submitPrioritizing: () => Promise<void>;
  submitText: (text: string) => Promise<void>;
  viewHint: () => Promise<void>;
  flag: (reason: string) => Promise<void>;
  /** Sau lời kết: mở hoạt động kế, hoặc kết thúc màn. */
  next: () => Promise<void>;
  handleEvent: (event: PlayStreamEvent) => void;
  reset: () => void;
}

export type PlaySession = PlaySessionState & PlaySessionActions;

const blankActivity = {
  activity: null,
  log: [],
  order: [],
  picked: [],
  hint: null,
  followup: null,
  closing: null,
  delayed: false,
  invalid: [],
} satisfies Partial<PlaySessionState>;

const initial: PlaySessionState = {
  runId: null,
  run: null,
  stage: 'idle',
  error: null,
  npcNames: {},
  ...blankActivity,
};

const messageOf = (err: unknown): string =>
  isPlayApiError(err)
    ? err.code === 'SCENARIO_UNAVAILABLE'
      ? 'Kịch bản này đang tạm đóng. Quay lại bản đồ để chọn nhiệm vụ khác.'
      : err.message
    : 'Không kết nối được. Kiểm tra mạng rồi thử lại.';

const newId = (): string => crypto.randomUUID();

/** Câu người chơi vừa chọn, đọc lại thành lời để đưa vào khung hội thoại. */
function quoteOf(activity: ActivityView, keys: string[]): string {
  const text = (key: string) =>
    activity.items?.find((i) => i.key === key)?.text ?? key;
  if (activity.taskType === 'ORDERING')
    return keys.map((k, i) => `${i + 1}. ${text(k)}`).join(' · ');
  return keys.map(text).join(' · ');
}

export const usePlaySession = create<PlaySession>()(
  persist(
    (set, get) => {
      /** Mở hoạt động hiện tại của lượt chơi. */
      async function loadActivity(runId: string) {
        const activity = await getPlayApi().getCurrentActivity(runId);
        const npc = activity.npc;
        // Máy chủ còn chờ câu trả lời cho một câu hỏi vặn: mở lại đúng lượt đó.
        const pending = activity.followup ?? null;
        set({
          ...blankActivity,
          activity,
          order: (activity.items ?? []).map((i) => i.key ?? ''),
          stage: pending ? 'followup' : 'answering',
          ...(pending
            ? {
                followup: {
                  no: pending.followupNo,
                  npcKey: pending.npcKey,
                  name: pending.name,
                  question: pending.question,
                },
                log: [
                  { from: 'npc', name: pending.name, text: pending.question },
                ],
              }
            : {}),
          npcNames: {
            ...get().npcNames,
            ...(npc?.npcKey && npc.name ? { [npc.npcKey]: npc.name } : {}),
            ...(pending ? { [pending.npcKey]: pending.name } : {}),
          },
        });
      }

      async function finish(runId: string) {
        set({ stage: 'finishing', delayed: false });
        try {
          const res = await getPlayApi().finishRun(runId);
          if (res.status !== 202) set({ stage: 'finished' });
          // 202: chờ `summary.ready`; màn hình có polling dự phòng.
        } catch (err) {
          set({ stage: 'closing', error: messageOf(err) });
        }
      }

      async function submit(
        body: { selection: string | string[] } | { text: string },
        playerLine: string,
      ) {
        const { runId, activity, followup, stage } = get();
        if (!runId || !activity?.activityKey) return;
        if (stage !== 'answering' && stage !== 'followup') return;

        set({
          stage: 'submitting',
          invalid: [],
          error: null,
          log: [...get().log, { from: 'player', text: playerLine }],
        });

        try {
          const res = await getPlayApi().submitAnswer(runId, {
            answerId: newId(),
            activityKey: activity.activityKey,
            followupNo: followup?.no ?? 0,
            ...body,
          });
          if (res.status === 202) {
            // Sự kiện kết quả có thể tới TRƯỚC phản hồi này (máy chủ đóng hoạt
            // động ngay khi không hỏi vặn): đã sang bước sau thì giữ nguyên.
            if (get().stage === 'submitting') set({ stage: 'grading' });
            return;
          }
          set({
            stage: 'closing',
            closing: {
              line: res.body.closingLine ?? '',
              next: res.body.nextActivityKey ?? null,
            },
          });
        } catch (err) {
          // Gỡ câu vừa đưa vào hội thoại: máy chủ chưa nhận nó.
          const log = get().log.slice(0, -1);
          const back = followup ? 'followup' : 'answering';
          if (isPlayApiError(err) && err.code === 'ANSWER_INVALID') {
            set({
              stage: back,
              log,
              invalid: err.errors.map((e) => e.reason ?? '').filter(Boolean),
            });
            return;
          }
          set({ stage: back, log, error: messageOf(err) });
        }
      }

      return {
        ...initial,

        open: async (runId) => {
          const prev = get();
          const sameRun = prev.runId === runId;
          set({
            runId,
            error: null,
            ...(sameRun
              ? {}
              : {
                  ...blankActivity,
                  stage: 'loading',
                  run: null,
                  npcNames: {},
                }),
          });

          try {
            const api = getPlayApi();
            const run = await api.getRun(runId);
            set({ run });

            if (run.status === 'FINISHED') {
              set({ stage: 'finished' });
              return;
            }

            // Tải lại giữa chừng: còn đúng hoạt động cũ thì giữ nguyên màn.
            const key = run.currentActivityKey ?? null;
            const kept = get();
            const resumable =
              sameRun &&
              kept.stage !== 'loading' &&
              kept.stage !== 'idle' &&
              (kept.activity?.activityKey === key ||
                // Máy chủ có thể đã sang hoạt động kế; lời kết còn đang tới.
                ['grading', 'closing', 'finishing'].includes(kept.stage));
            if (resumable) {
              if (kept.stage === 'submitting')
                set({
                  stage: kept.followup ? 'followup' : 'answering',
                  log: kept.log.slice(0, -1),
                });
              return;
            }

            if (key) await loadActivity(runId);
            else await finish(runId);
          } catch (err) {
            set({ stage: 'idle', error: messageOf(err) });
          }
        },

        move: (index, direction) => {
          const order = [...get().order];
          const target = index + direction;
          if (target < 0 || target >= order.length) return;
          [order[index], order[target]] = [order[target], order[index]];
          set({ order });
        },

        toggle: (key) => {
          const { picked, activity } = get();
          if (picked.includes(key)) {
            set({ picked: picked.filter((k) => k !== key) });
            return;
          }
          if (picked.length >= (activity?.pickCount ?? 0)) return;
          set({ picked: [...picked, key] });
        },

        submitChoice: (key) => {
          const activity = get().activity;
          if (!activity) return Promise.resolve();
          return submit({ selection: key }, quoteOf(activity, [key]));
        },

        submitOrdering: () => {
          const { activity, order } = get();
          if (!activity) return Promise.resolve();
          return submit({ selection: order }, quoteOf(activity, order));
        },

        submitPrioritizing: () => {
          const { activity, picked } = get();
          if (!activity) return Promise.resolve();
          return submit({ selection: picked }, quoteOf(activity, picked));
        },

        submitText: (text) => submit({ text }, text),

        viewHint: async () => {
          const { runId, activity, hint } = get();
          if (!runId || !activity?.activityKey || hint) return;
          try {
            const res = await getPlayApi().viewHint(
              runId,
              activity.activityKey,
            );
            set({ hint: { npcKey: res.npcKey ?? '', text: res.text ?? '' } });
          } catch (err) {
            set({ error: messageOf(err) });
          }
        },

        flag: async (reason) => {
          const { runId, activity } = get();
          if (!runId || !activity?.activityKey) return;
          await getPlayApi().flagContent(runId, {
            activityKey: activity.activityKey,
            reason,
          });
        },

        next: async () => {
          const { runId, closing } = get();
          if (!runId) return;
          set({ error: null });
          try {
            if (closing?.next) await loadActivity(runId);
            else await finish(runId);
          } catch (err) {
            set({ error: messageOf(err) });
          }
        },

        handleEvent: (event) => {
          const { runId, activity, stage } = get();
          if (event.runId !== runId) return;
          // Đang chờ kết quả của câu vừa gửi — kể cả khi phản hồi 202 chưa về.
          const waiting = stage === 'grading' || stage === 'submitting';

          switch (event.type) {
            case 'provider.delay':
              set({ delayed: true });
              return;

            case 'answer.graded':
              // Mức chỉ hiện ở màn tổng kết; ở đây chỉ biết là đã chấm xong.
              set({ delayed: false });
              return;

            case 'followup.asked': {
              const p = event.payload;
              if (p.activityKey !== activity?.activityKey || !waiting) return;
              set({
                stage: 'followup',
                delayed: false,
                npcNames: { ...get().npcNames, [p.npcKey]: p.name },
                followup: {
                  no: p.followupNo,
                  npcKey: p.npcKey,
                  name: p.name,
                  question: p.question,
                },
                log: [
                  ...get().log,
                  { from: 'npc', name: p.name, text: p.question },
                ],
              });
              return;
            }

            case 'activity.closed': {
              const p = event.payload;
              if (p.activityKey !== activity?.activityKey || !waiting) return;
              set({
                stage: 'closing',
                delayed: false,
                followup: null,
                closing: { line: p.closingLine, next: p.nextActivityKey },
              });
              return;
            }

            case 'summary.ready':
              if (stage === 'finishing')
                set({ stage: 'finished', delayed: false });
              return;
          }
        },

        reset: () => set(initial),
      };
    },
    {
      name: 'jobquest.play.session.v1',
      storage: createJSONStorage(() => sessionStorage),
      // Hàm và trạng thái mạng tạm thời thì không lưu.
      partialize: ({ error: _error, ...state }) => {
        const out: Partial<PlaySessionState> = {};
        for (const [k, v] of Object.entries(state))
          if (typeof v !== 'function') (out as Record<string, unknown>)[k] = v;
        return out;
      },
    },
  ),
);

/** Kịch bản (bản phát hành) của lượt chơi đang mở — tải một lần cho mỗi lượt. */
export const useReleaseStore = create<{
  runId: string | null;
  scenario: Scenario | null;
  error: string | null;
  load: (run: Run) => Promise<void>;
}>()((set, get) => ({
  runId: null,
  scenario: null,
  error: null,
  load: async (run) => {
    if (!run.id || get().runId === run.id) return;
    set({ runId: run.id, scenario: null, error: null });
    try {
      const scenario = await getPlayApi().loadRelease(run);
      if (get().runId === run.id) set({ scenario });
    } catch {
      if (get().runId === run.id)
        set({ error: 'Không tải được nội dung kịch bản. Thử tải lại trang.' });
    }
  },
}));
