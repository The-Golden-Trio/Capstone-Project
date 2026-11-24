import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock3, Lightbulb, Sparkles } from 'lucide-react';
import { ToonIconButton, ToonTurnsBar, Tooltip } from '@datn/ui';
import type { SceneView } from '../../api/types';

/**
 * Thanh trạng thái một hàng của ca: thoát, tên ca, nhãn AI thường trực
 * (NFR-07), lượt còn lại kèm giờ trong truyện, gợi ý, và nút chốt (`actions`).
 * Mục tiêu và lời hứa ở tab Việc của bàn làm việc.
 */
export function Hud({
  title,
  scene,
  backTo,
  onHint,
  hintDisabled,
  aiLabel,
  actions,
}: {
  title: string;
  scene: SceneView | null;
  backTo: string;
  onHint: () => void;
  hintDisabled: boolean;
  /** Nhãn thường trực: lời nhân vật do AI viết (NFR-07). */
  aiLabel: string;
  actions?: ReactNode;
}) {
  const shortAi = aiLabel.startsWith('AI giả') ? 'AI giả' : 'AI';
  return (
    <header className="relative z-30 shrink-0 border-b-[3px] border-toon-ink bg-toon-paper">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-2 sm:gap-3 sm:px-4">
        <Tooltip content="Thoát. Tiến độ được lưu, quay lại chơi tiếp lúc nào cũng được.">
          <Link
            to={backTo}
            aria-label="Thoát ca làm, tiến độ được lưu"
            className="grid size-11 shrink-0 place-items-center rounded-full border-[2.5px] border-toon-ink bg-toon-cream text-toon-ink shadow-toon-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-toon-focus"
          >
            <ArrowLeft size={19} strokeWidth={2.8} />
          </Link>
        </Tooltip>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1
            title={title}
            className="line-clamp-2 min-w-0 font-toon text-sm font-extrabold leading-tight text-toon-ink sm:truncate sm:text-lg"
          >
            {title}
          </h1>
          <span
            title={aiLabel}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-toon-ink bg-toon-lilac px-2 py-0.5 text-[11px] font-extrabold text-toon-ink"
          >
            <Sparkles size={11} strokeWidth={2.6} aria-hidden />
            <span aria-hidden className="xl:hidden">
              {shortAi}
            </span>
            <span className="max-xl:sr-only">{aiLabel}</span>
          </span>
        </div>
        {scene && (
          <div
            role="group"
            aria-label={`Bây giờ ${scene.clock.time}, hạn ${scene.clock.deadline}`}
            className="flex shrink-0 items-center gap-2 sm:gap-3"
          >
            <p className="text-xs font-extrabold tabular-nums text-toon-ink sm:hidden">
              <span className="sr-only">còn </span>
              {scene.clock.remaining}/{scene.clock.budget}
              <span className="sr-only"> lượt</span>
              <span className="font-bold text-toon-ink-soft">
                {' '}
                · {scene.clock.time}
              </span>
            </p>
            <ToonTurnsBar
              remaining={scene.clock.remaining}
              budget={scene.clock.budget}
              minutesPerPoint={scene.clock.minutesPerPoint}
              className="max-sm:hidden"
            />
            <p className="flex items-center gap-1 text-xs font-bold tabular-nums text-toon-ink-soft max-sm:hidden">
              <Clock3 size={12} strokeWidth={2.6} aria-hidden />
              {scene.clock.time}
              <span className="max-md:hidden">
                {' '}
                · hạn {scene.clock.deadline}
              </span>
            </p>
          </div>
        )}
        <ToonIconButton
          label={`Gợi ý (không tốn thời gian, đã dùng ${scene?.hintsUsed ?? 0})`}
          icon={<Lightbulb size={19} strokeWidth={2.6} />}
          onClick={onHint}
          disabled={hintDisabled}
          variant="secondary"
        />
        {actions}
      </div>
    </header>
  );
}
