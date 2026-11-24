import { shift } from '@datn/game-core';
import { BellRing } from 'lucide-react';
import { ToonBadge } from '@datn/ui';
import type { SceneView } from '../../../api/types';

type PromiseState = 'open' | 'due' | 'late';

const PROMISE_STYLE: Record<PromiseState, string> = {
  open: 'bg-toon-sky',
  due: 'bg-toon-mustard',
  late: 'bg-toon-coral',
};

/** Promise labels from the engine read "Gọi chị Linh lúc 11:30"; event promises have no time. */
export function promiseChip(label: string): { time?: string; what: string } {
  const timed = label.match(/^(.*) lúc (\d{1,2}:\d{2})$/);
  const text = timed ? timed[1] : label;
  return {
    time: timed?.[2],
    what: text.charAt(0).toLowerCase() + text.slice(1),
  };
}

export function promiseState(
  status: string,
  time: string | undefined,
  clock: SceneView['clock'],
): { state: PromiseState; note?: string } {
  if (status === 'late') return { state: 'late', note: 'trễ hẹn' };
  if (!time) return { state: 'open' };
  const now = shift.toMinutes(clock.time);
  const due = shift.toMinutes(time);
  if (now >= due) return { state: 'due', note: 'tới giờ' };
  if (now >= due - shift.PROMISE_WINDOW.before * clock.minutesPerPoint)
    return { state: 'due', note: 'sắp tới giờ' };
  return { state: 'open' };
}

export const openPromises = (scene: SceneView) =>
  scene.notebook.promises.filter(
    (p) => p.status === 'open' || p.status === 'late',
  );

/** Hẹn chưa giữ, sắp hoặc tới giờ: dùng để báo trên tab Việc. */
export const urgentPromises = (scene: SceneView) =>
  openPromises(scene).filter(
    (p) =>
      promiseState(p.status, promiseChip(p.label).time, scene.clock).state !==
      'open',
  ).length;

const FINAL_STATUS: Record<
  string,
  { label: string; tone: 'mint' | 'coral' | 'paper' }
> = {
  kept: { label: 'Đã giữ', tone: 'mint' },
  late: { label: 'Trễ hẹn', tone: 'coral' },
  carried: { label: 'Để lại cuối ca', tone: 'paper' },
};

/** Mọi lời hứa của ca đã khép, mỗi lời kèm kết cục cuối cùng. */
export function FinalPromiseList({ scene }: { scene: SceneView }) {
  const { promises } = scene.notebook;
  if (!promises.length) return null;
  return (
    <ul aria-label="Lời đã hứa trong ca" className="flex flex-col gap-1.5">
      {promises.map((p) => {
        const { time, what } = promiseChip(p.label);
        const status = FINAL_STATUS[p.status];
        return (
          <li
            key={p.id}
            title={p.label}
            data-promise-status={p.status}
            className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border-2 border-toon-ink bg-toon-paper px-2.5 py-1.5 text-sm font-bold text-toon-ink"
          >
            <span className="min-w-0 flex-1">
              Hẹn{time ? ` ${time}` : ''} · {what}
            </span>
            <ToonBadge tone={status?.tone ?? 'paper'}>
              {status?.label ?? p.status}
            </ToonBadge>
          </li>
        );
      })}
    </ul>
  );
}

/** Lời đã hứa mà chưa giữ, kèm trạng thái theo giờ trong ca. */
export function PromiseList({ scene }: { scene: SceneView }) {
  const open = openPromises(scene);
  if (!open.length) return null;
  return (
    <ul aria-label="Lời đã hứa, chưa giữ" className="flex flex-col gap-1.5">
      {open.map((p) => {
        const { time, what } = promiseChip(p.label);
        const { state, note } = promiseState(p.status, time, scene.clock);
        return (
          <li
            key={p.id}
            title={p.label}
            data-promise-state={state}
            className={`flex min-w-0 items-center gap-2 rounded-xl border-2 border-toon-ink px-2.5 py-1.5 text-sm font-bold text-toon-ink ${PROMISE_STYLE[state]}`}
          >
            <BellRing
              size={14}
              strokeWidth={2.6}
              aria-hidden
              className="shrink-0"
            />
            <span className="min-w-0 flex-1">
              Hẹn{time ? ` ${time}` : ''} · {what}
            </span>
            {note && <span className="shrink-0 font-extrabold">· {note}</span>}
          </li>
        );
      })}
    </ul>
  );
}
