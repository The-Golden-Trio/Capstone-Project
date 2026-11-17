import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Lightbulb, Sparkles, Target } from 'lucide-react';
import { ToonClock, ToonIconButton, Tooltip } from '@datn/ui';
import type { SceneView } from '../../api/types';

/**
 * Dải HUD trên cùng: thoát, tên ca và mục tiêu, nhãn AI thường trực
 * (NFR-07), đồng hồ ca làm (giờ trong truyện là chính, điểm là phụ), gợi ý.
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
  return (
    <header className="relative z-30 border-b-[3px] border-toon-ink bg-toon-paper">
      <div className="mx-auto flex min-h-16 max-w-[1600px] sm:min-h-[72px] items-center gap-3 px-3 py-2 sm:px-5">
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
          <h1 className="truncate font-toon text-lg font-extrabold leading-tight text-toon-ink sm:text-xl">
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
          <ToonClock
            time={scene.clock.time}
            deadline={scene.clock.deadline}
            remaining={scene.clock.remaining}
            budget={scene.clock.budget}
            minutesPerPoint={scene.clock.minutesPerPoint}
            compact
          />
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
      {/* Điện thoại: mục tiêu và nhãn AI xuống dòng riêng để không bị cắt mất. */}
      <p className="flex min-w-0 items-center gap-1.5 px-3 pb-2 sm:hidden">
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border-2 border-toon-ink bg-[#ffe4a3] px-2.5 py-0.5 text-xs font-bold text-toon-ink">
          <Target
            size={13}
            strokeWidth={2.6}
            aria-hidden
            className="shrink-0"
          />
          <span className="truncate">{goal}</span>
        </span>
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
      </p>
    </header>
  );
}
