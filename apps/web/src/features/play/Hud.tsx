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
  onHint,
  hintDisabled,
  aiLabel,
}: {
  title: string;
  goal: string;
  scene: SceneView | null;
  backTo: string;
  onNotebook: () => void;
  onHint: () => void;
  hintDisabled: boolean;
  /** Nhãn thường trực: lời nhân vật do AI viết (NFR-07). */
  aiLabel: string;
}) {
  return (
    <header className="relative z-30 border-b-[3px] border-toon-ink bg-toon-paper">
      <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center gap-3 px-3 py-2 sm:px-5">
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
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5">
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border-2 border-toon-ink bg-[#ffe4a3] px-2.5 py-0.5 text-xs font-bold text-toon-ink">
              <Target
                size={13}
                strokeWidth={2.6}
                aria-hidden
                className="shrink-0"
              />
              <span className="truncate">{goal}</span>
            </span>
            <span className="hidden shrink-0 items-center gap-1 rounded-full border-2 border-toon-ink bg-toon-lilac px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-toon-ink md:inline-flex">
              <Sparkles size={11} strokeWidth={2.6} aria-hidden />
              {aiLabel}
            </span>
          </p>
        </div>
        {scene && (
          <>
            {/* Bọc ngoài để ẩn/hiện: `cn` không trộn class nên không truyền `hidden` vào gốc flex. */}
            <div className="hidden sm:block">
              <ToonClock
                time={scene.clock.time}
                deadline={scene.clock.deadline}
                remaining={scene.clock.remaining}
                budget={scene.clock.budget}
                minutesPerPoint={scene.clock.minutesPerPoint}
              />
            </div>
            <div className="sm:hidden">
              <ToonClock
                time={scene.clock.time}
                deadline={scene.clock.deadline}
                remaining={scene.clock.remaining}
                budget={scene.clock.budget}
                minutesPerPoint={scene.clock.minutesPerPoint}
                compact
              />
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <ToonIconButton
            label={`Gợi ý (không tốn thời gian, đã dùng ${scene?.hintsUsed ?? 0})`}
            icon={<Lightbulb size={19} strokeWidth={2.6} />}
            onClick={onHint}
            disabled={hintDisabled}
            variant="primary"
          />
          <ToonIconButton
            label="Mở sổ tay"
            icon={<BookOpen size={19} strokeWidth={2.6} />}
            onClick={onNotebook}
            variant="secondary"
            className="xl:hidden"
          />
        </div>
      </div>
    </header>
  );
}
