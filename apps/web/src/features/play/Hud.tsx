import { useState } from 'react';
import { Link } from 'react-router-dom';
import { shift } from '@datn/game-core';
import {
  ArrowLeft,
  BellRing,
  BookOpen,
  ChevronDown,
  Clock3,
  Lightbulb,
  Sparkles,
  Target,
} from 'lucide-react';
import { ToonIconButton, ToonTurnsBar, Tooltip } from '@datn/ui';
import type { SceneView } from '../../api/types';

/**
 * Dải HUD trên cùng: thoát, tên ca và mục tiêu, nhãn AI thường trực
 * (NFR-07), thanh lượt của ca làm (chính) kèm giờ trong truyện (phụ), gợi ý.
 */
export function Hud({
  title,
  goal,
  scene,
  backTo,
  onNotebook,
  notebookCount,
  onHint,
  hintDisabled,
  aiLabel,
}: {
  title: string;
  goal: string;
  scene: SceneView | null;
  backTo: string;
  onNotebook: () => void;
  /** Số dữ kiện trong sổ tay, hiện trên nút để người chơi biết có gì mới. */
  notebookCount: number;
  onHint: () => void;
  hintDisabled: boolean;
  /** Nhãn thường trực: lời nhân vật do AI viết (NFR-07). */
  aiLabel: string;
}) {
  const [titleOpen, setTitleOpen] = useState(false);
  return (
    <header className="relative z-30 border-b-[3px] border-toon-ink bg-toon-paper">
      <div className="mx-auto grid min-h-16 max-w-[1600px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 px-3 py-2 sm:min-h-[72px] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-3 sm:px-5">
        <Tooltip content="Thoát. Tiến độ được lưu, quay lại chơi tiếp lúc nào cũng được.">
          <Link
            to={backTo}
            aria-label="Thoát ca làm, tiến độ được lưu"
            className="grid size-11 shrink-0 place-items-center rounded-full border-[3px] border-toon-ink bg-toon-cream text-toon-ink shadow-toon-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-toon-focus"
          >
            <ArrowLeft size={20} strokeWidth={2.8} />
          </Link>
        </Tooltip>
        <div className="min-w-0 flex-1">
          {/* Chạm vào tên ca trên điện thoại để đọc trọn; đọc màn hình vốn đọc đủ chữ. */}
          <h1
            onClick={() => setTitleOpen((open) => !open)}
            className={`break-words font-toon text-sm font-extrabold leading-tight text-toon-ink sm:truncate sm:text-xl ${titleOpen ? '' : 'max-sm:line-clamp-2'}`}
          >
            {title}
          </h1>
          <p className="mt-0.5 hidden min-w-0 items-center gap-1.5 sm:flex">
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border-2 border-toon-ink bg-[#ffe4a3] px-2.5 py-0.5 text-xs font-bold text-toon-ink">
              <Target
                size={13}
                strokeWidth={2.6}
                aria-hidden
                className="shrink-0"
              />
              <span className="truncate">{goal}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-toon-ink bg-toon-lilac px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-toon-ink">
              <Sparkles size={11} strokeWidth={2.6} aria-hidden />
              {aiLabel}
            </span>
          </p>
        </div>
        {scene && (
          <div className="order-last col-span-full flex min-w-0 items-center gap-x-3 sm:order-none sm:col-span-1 sm:flex-col sm:items-end sm:gap-y-0.5">
            <ToonTurnsBar
              remaining={scene.clock.remaining}
              budget={scene.clock.budget}
              minutesPerPoint={scene.clock.minutesPerPoint}
              className="max-sm:flex-1"
            />
            <p
              role="group"
              aria-label={`Bây giờ ${scene.clock.time}, hạn ${scene.clock.deadline}, còn ${scene.clock.remaining} điểm thời gian`}
              className="flex shrink-0 items-center gap-1 text-[11px] font-bold tabular-nums text-toon-ink-soft"
            >
              <Clock3 size={11} strokeWidth={2.6} aria-hidden />
              {scene.clock.time} · hạn {scene.clock.deadline}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ToonIconButton
            label={`Gợi ý (không tốn thời gian, đã dùng ${scene?.hintsUsed ?? 0})`}
            icon={<Lightbulb size={19} strokeWidth={2.6} />}
            onClick={onHint}
            disabled={hintDisabled}
            variant="primary"
          />
          <span className="relative">
            <ToonIconButton
              label={`Mở sổ tay (${notebookCount} dữ kiện)`}
              icon={<BookOpen size={19} strokeWidth={2.6} />}
              onClick={onNotebook}
              variant="secondary"
            />
            {notebookCount > 0 && (
              <span
                aria-hidden
                className="tabular pointer-events-none absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-toon-ink bg-toon-coral px-1 font-toon text-[11px] font-extrabold leading-4 text-toon-ink"
              >
                {notebookCount}
              </span>
            )}
          </span>
        </div>
      </div>
      {scene && <PromiseChips scene={scene} />}
      {/* Keep the full objective reachable after the intro is dismissed. */}
      <div className="flex min-w-0 items-start gap-1.5 px-3 pb-2 sm:hidden">
        <details className="min-w-0 flex-1">
          <summary
            aria-label="Mục tiêu ca làm"
            className="flex cursor-pointer list-none items-center gap-1.5 rounded-xl border-2 border-toon-ink bg-[#ffe4a3] px-2.5 py-0.5 text-xs font-bold text-toon-ink focus-visible:shadow-toon-focus [&::-webkit-details-marker]:hidden"
          >
            <Target
              size={13}
              strokeWidth={2.6}
              aria-hidden
              className="shrink-0"
            />
            <span className="min-w-0 flex-1 truncate">{goal}</span>
            <ChevronDown size={13} aria-hidden className="shrink-0" />
          </summary>
          <p className="mt-2 rounded-xl border-2 border-toon-ink bg-toon-cream px-3 py-2 text-sm font-semibold leading-relaxed text-toon-ink">
            {goal}
          </p>
        </details>
        <span
          title={aiLabel}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-toon-ink bg-toon-lilac px-2 py-0.5 text-[11px] font-extrabold text-toon-ink"
        >
          <Sparkles size={11} strokeWidth={2.6} aria-hidden />
          <span aria-hidden>
            {aiLabel.startsWith('AI giả') ? 'AI giả' : 'AI'}
          </span>
          <span className="sr-only">{aiLabel}</span>
        </span>
      </div>
    </header>
  );
}

type PromiseState = 'open' | 'due' | 'late';

const PROMISE_STYLE: Record<PromiseState, string> = {
  open: 'bg-toon-sky',
  due: 'bg-toon-mustard',
  late: 'bg-toon-coral',
};

/** Promise labels from the engine read "Gọi chị Linh lúc 11:30"; event promises have no time. */
function promiseChip(label: string): { time?: string; what: string } {
  const timed = label.match(/^(.*) lúc (\d{1,2}:\d{2})$/);
  const text = timed ? timed[1] : label;
  return {
    time: timed?.[2],
    what: text.charAt(0).toLowerCase() + text.slice(1),
  };
}

function promiseState(
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

/** Open promises stay visible during play, not only in the notebook. */
function PromiseChips({ scene }: { scene: SceneView }) {
  const open = scene.notebook.promises.filter(
    (p) => p.status === 'open' || p.status === 'late',
  );
  if (!open.length) return null;
  return (
    <ul
      aria-label="Lời đã hứa, chưa giữ"
      className="mx-auto flex max-w-[1600px] flex-wrap gap-1.5 px-3 pb-2 sm:px-5"
    >
      {open.map((p) => {
        const { time, what } = promiseChip(p.label);
        const { state, note } = promiseState(p.status, time, scene.clock);
        return (
          <li
            key={p.id}
            title={p.label}
            data-promise-state={state}
            className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border-2 border-toon-ink px-2.5 py-0.5 text-xs font-bold text-toon-ink ${PROMISE_STYLE[state]}`}
          >
            <BellRing
              size={13}
              strokeWidth={2.6}
              aria-hidden
              className="shrink-0"
            />
            <span className="min-w-0 truncate">
              Hẹn{time ? ` ${time}` : ''} · {what}
            </span>
            {note && <span className="shrink-0 font-extrabold">· {note}</span>}
          </li>
        );
      })}
    </ul>
  );
}
