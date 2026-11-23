/**
 * Điều khiển lượt chơi mẫu (chỉ demo): đọc kịch bản của game-core rồi làm lần
 * lượt từng việc trên giao diện thật. Hai chế độ: bấm "Tiếp" để chạy một việc,
 * hoặc tự chạy liên tục (tạm dừng được, 1x hoặc 2x).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shift } from '@datn/game-core';
import type { SceneView } from '../../../api/types';
import { groupOf } from '../ActionPanel';
import {
  AutoplayAbort,
  activeWindow,
  buttonByText,
  click,
  editorForm,
  fillEditor,
  pulse,
  query,
  sleep,
  typeInto,
  waitFor,
  waitForOptional,
  type DriverContext,
} from './driver';

export type PlanStep = { do: 'intro' } | Exclude<shift.Step, { do: 'start' }>;

export interface AutoplaySnapshot {
  scene: SceneView | null;
  /** Đã tải xong, không có lượt đang gửi, chờ AI hay tạm dừng. */
  settled: boolean;
  /** Số nhịp thoại chưa hiện. */
  queued: number;
  /** Câu đang ở hộp thoại, để tính thời gian đọc. */
  spoken: string | null;
  intro: boolean;
  /** Ca chưa có diễn biến nào: chỉ khi đó mới chơi mẫu từ đầu được. */
  fresh: boolean;
}

export type AutoplayStatus = 'idle' | 'working' | 'done' | 'blocked' | 'error';

export interface Autoplay {
  index: number;
  total: number;
  label: string;
  status: AutoplayStatus;
  playing: boolean;
  speed: 1 | 2;
  message: string | null;
  next: () => void;
  togglePlaying: () => void;
  toggleSpeed: () => void;
}

export const planOf = (script: shift.Playthrough): PlanStep[] => [
  { do: 'intro' },
  ...script.steps.filter(
    (step): step is Exclude<shift.Step, { do: 'start' }> => step.do !== 'start',
  ),
];

const quote = (text: string) =>
  text.length > 34 ? `${text.slice(0, 33)}…` : text;

/** Mô tả ngắn việc sắp làm, kèm giờ trong truyện, để người trình bày biết sắp tới gì. */
export function describeStep(step: PlanStep, scene: SceneView | null): string {
  const time = scene?.clock.time;
  const what = (() => {
    switch (step.do) {
      case 'intro':
        return 'Giới thiệu ca';
      case 'action':
        return (
          scene?.actions.find((a) => a.key === step.key)?.label ??
          `Việc ${step.key}`
        );
      case 'say':
        return `Nhắn: “${quote(step.text)}”`;
      case 'choose':
        return `Chọn phương án ${step.option.toUpperCase()}`;
      case 'save_artefact':
        return scene?.node?.form?.title
          ? `Soạn: ${scene.node.form.title}`
          : 'Soạn tài liệu';
      case 'confirm_end':
        return 'Xác nhận nộp ca';
      case 'cancel_end':
        return 'Làm thêm, chưa nộp';
      case 'end_conversation':
        return 'Kết thúc trò chuyện';
      case 'timeout':
        return 'Để hết giờ chọn';
      case 'hint':
        return 'Xin gợi ý';
    }
  })();
  return time ? `${time} ${what}` : what;
}

function applies(step: PlanStep, snap: AutoplaySnapshot) {
  if (step.do === 'intro') return snap.intro;
  return snap.scene ? shift.stepApplies(step, snap.scene.await.kind) : false;
}

/** Thời gian đọc một nhịp thoại trước khi tự qua nhịp. */
const readMs = (text: string | null) => 700 + (text?.length ?? 0) * 30;

export function useAutoplay({
  script,
  snapshot,
  timeScale = 1,
}: {
  /** `null` là tắt: không chạy gì, không chiếm phím. */
  script: shift.Playthrough | null;
  snapshot: AutoplaySnapshot;
  /** Chia mọi thời gian chờ (test dùng số lớn để chạy nhanh). */
  timeScale?: number;
}): Autoplay {
  const plan = useMemo(() => (script ? planOf(script) : []), [script]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<AutoplayStatus>('idle');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [message, setMessage] = useState<string | null>(null);

  const snap = useRef(snapshot);
  snap.current = snapshot;
  const speedRef = useRef<number>(speed);
  speedRef.current = speed * timeScale;
  const indexRef = useRef(0);
  const working = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const startedFresh = useRef<boolean | null>(null);

  useEffect(() => {
    if (!script || !snapshot.scene || startedFresh.current !== null) return;
    startedFresh.current = snapshot.fresh;
    if (!snapshot.fresh) setStatus('blocked');
  }, [script, snapshot.scene, snapshot.fresh]);

  useEffect(() => {
    if (script) return;
    abort.current?.abort();
    indexRef.current = 0;
    startedFresh.current = null;
    setIndex(0);
    setPlaying(false);
    setStatus('idle');
  }, [script]);

  useEffect(
    () => () => {
      abort.current?.abort();
    },
    [],
  );

  const settle = useCallback(async (ctx: DriverContext) => {
    const idle = () =>
      snap.current.scene !== null &&
      snap.current.settled &&
      (snap.current.queued === 0 || snap.current.intro);
    for (;;) {
      const now = snap.current;
      if (now.settled && now.queued > 0 && !now.intro) {
        await sleep(readMs(now.spoken), ctx);
        if (snap.current.queued > 0)
          query<HTMLElement>('#stage-dialog')?.click();
        await sleep(120, ctx);
        continue;
      }
      if (idle()) {
        await sleep(60 * ctx.speed(), ctx);
        if (idle()) return;
        continue;
      }
      await sleep(40, ctx);
    }
  }, []);

  const perform = useCallback(
    async (step: PlanStep, ctx: DriverContext) => {
      const scene = () => snap.current.scene;
      switch (step.do) {
        case 'intro': {
          for (;;) {
            const next = await waitFor(
              'nút giới thiệu ca',
              () => query<HTMLElement>('[data-autoplay="intro-next"]'),
              ctx,
            );
            await sleep(1100, ctx);
            const last = next.textContent?.trim() === 'Vào ca';
            await pulse(next, 450, ctx);
            click(next);
            if (last) return;
            await sleep(200, ctx);
          }
        }
        case 'action': {
          if (scene()?.mode === 'conversation') {
            // Khay việc chỉ hiện khi hết trò chuyện: người chơi phải bấm kết thúc trước.
            const end = await waitFor(
              'nút kết thúc trò chuyện',
              () => buttonByText('form button', 'Kết thúc trò chuyện'),
              ctx,
            );
            await pulse(end, 600, ctx);
            click(end);
            await settle(ctx);
          }
          const action = scene()?.actions.find((a) => a.key === step.key);
          if (!action) throw new Error(`Không thấy việc "${step.key}".`);
          const find = () =>
            query<HTMLButtonElement>(`[data-action-key="${step.key}"]`);
          if (!find()) {
            const group = groupOf(action.kind);
            await waitFor(
              `nhóm việc ${group}`,
              () =>
                Array.from(
                  document.querySelectorAll<HTMLElement>('[role="tab"]'),
                ).find((tab) => tab.textContent?.trim().startsWith(group)),
              ctx,
            ).then(click);
          }
          const button = await waitFor(
            `nút "${action.label}" bấm được`,
            () => {
              const el = find();
              return el &&
                !el.disabled &&
                el.dataset.tapGuard === undefined &&
                !el.closest('[hidden]')
                ? el
                : null;
            },
            ctx,
          );
          await pulse(button, 800, ctx);
          click(button);
          if (action.form) {
            await fillEditor(step.fields ?? {}, step.ticks ?? [], ctx);
            return;
          }
          if (action.target && ['open', 'run'].includes(action.kind)) {
            await sleep(250, ctx);
            await settle(ctx);
            const win = await waitForOptional(activeWindow, ctx, 2500);
            if (win) await readWindow(win, ctx);
          }
          return;
        }
        case 'say': {
          const box = await waitFor(
            'ô nhập lời',
            () => {
              const el = document.getElementById('composer');
              return el instanceof HTMLTextAreaElement &&
                !el.readOnly &&
                !el.disabled
                ? el
                : null;
            },
            ctx,
          );
          await typeInto(box, step.text, ctx);
          await sleep(350, ctx);
          const send = await waitFor(
            'nút gửi',
            () => {
              const el = box.form?.querySelector<HTMLButtonElement>(
                'button[type="submit"]',
              );
              return el && !el.disabled ? el : null;
            },
            ctx,
          );
          await pulse(send, 400, ctx);
          click(send);
          return;
        }
        case 'choose': {
          const option = await waitFor(
            `phương án ${step.option}`,
            () =>
              query<HTMLButtonElement>(`[data-option-key="${step.option}"]`),
            ctx,
          );
          // Để đồng hồ đếm chạy vài giây như người đang cân nhắc.
          await sleep(4000, ctx);
          await pulse(option, 800, ctx);
          click(option);
          return;
        }
        case 'save_artefact': {
          await waitFor(
            'tài liệu cần soạn',
            () =>
              snap.current.settled &&
              snap.current.scene?.await.kind === 'node_artefact',
            ctx,
          );
          const target = await waitForOptional(
            () =>
              editorForm() ??
              query<HTMLButtonElement>('[data-autoplay="open-node"]'),
            ctx,
            3000,
          );
          if (target && !(target instanceof HTMLFormElement)) {
            await pulse(target, 600, ctx);
            click(target);
          }
          await fillEditor(step.fields, step.ticks ?? [], ctx);
          return;
        }
        case 'confirm_end':
        case 'cancel_end': {
          const label = step.do === 'confirm_end' ? 'Gửi' : 'Làm thêm';
          const button = await waitFor(
            `nút "${label}"`,
            () =>
              buttonByText(
                'dialog button, [role="dialog"] button, [role="alertdialog"] button',
                label,
              ),
            ctx,
          );
          await sleep(900, ctx);
          await pulse(button, 600, ctx);
          click(button);
          return;
        }
        case 'end_conversation': {
          const button = await waitFor(
            'nút kết thúc trò chuyện',
            () =>
              buttonByText('form button', 'Kết thúc trò chuyện') ??
              buttonByText('form button', 'Bỏ qua'),
            ctx,
          );
          await pulse(button, 600, ctx);
          click(button);
          return;
        }
        case 'hint': {
          const button = await waitFor(
            'nút gợi ý',
            () => query<HTMLButtonElement>('button[aria-label^="Gợi ý"]'),
            ctx,
          );
          await pulse(button, 600, ctx);
          click(button);
          return;
        }
        case 'timeout': {
          const before = scene()?.await.kind;
          await waitFor(
            'hết giờ chọn',
            () => scene()?.await.kind !== before,
            ctx,
            90_000,
          );
          return;
        }
      }
    },
    [settle],
  );

  const runOne = useCallback(async () => {
    if (working.current || !script || startedFresh.current === false) return;
    working.current = true;
    setStatus('working');
    setMessage(null);
    const controller = new AbortController();
    abort.current = controller;
    const ctx: DriverContext = {
      signal: controller.signal,
      speed: () => speedRef.current,
    };
    try {
      for (;;) {
        await settle(ctx);
        const step = plan[indexRef.current];
        if (!step) break;
        const run = applies(step, snap.current);
        if (run) await perform(step, ctx);
        indexRef.current += 1;
        setIndex(indexRef.current);
        if (run) {
          await settle(ctx);
          break;
        }
      }
      setStatus(indexRef.current >= plan.length ? 'done' : 'idle');
    } catch (error) {
      if (error instanceof AutoplayAbort) return;
      setPlaying(false);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Lượt mẫu bị dừng.');
    } finally {
      working.current = false;
    }
  }, [perform, plan, script, settle]);

  useEffect(() => {
    if (playing && status === 'idle' && snapshot.scene) void runOne();
  }, [playing, status, snapshot.scene, runOne]);

  const next = useCallback(() => {
    if (status === 'idle') void runOne();
  }, [runOne, status]);

  useEffect(() => {
    if (!script) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key !== 'ArrowRight' ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        playing
      )
        return;
      if (status === 'idle') {
        event.preventDefault();
        void runOne();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [script, playing, status, runOne]);

  const upcoming = plan[Math.min(index, plan.length - 1)];
  return {
    index,
    total: plan.length,
    label: upcoming ? describeStep(upcoming, snapshot.scene) : '',
    status,
    playing,
    speed,
    message,
    next,
    togglePlaying: () => setPlaying((value) => !value),
    toggleSpeed: () => setSpeed((value) => (value === 1 ? 2 : 1)),
  };
}

/** Cho người xem đọc tài liệu vừa mở (wiki thì lướt qua từng mục) rồi đóng cửa sổ. */
async function readWindow(win: HTMLElement, ctx: DriverContext) {
  const sections = win.querySelectorAll<HTMLElement>(
    'nav[aria-label="Mục lục wiki"] button',
  );
  if (sections.length) {
    for (const section of sections) {
      await sleep(700, ctx);
      click(section);
    }
    await sleep(1200, ctx);
  } else {
    await sleep(2600, ctx);
  }
  const close = win.querySelector<HTMLElement>('.desktop-close');
  if (close) click(close);
  await waitFor('cửa sổ tài liệu đóng', () => !win.isConnected, ctx);
}
