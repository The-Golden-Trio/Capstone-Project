import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Lightbulb, Sparkles, Target } from 'lucide-react';
import { IconButton, Tooltip, cn } from '@datn/ui';
import type { SceneView } from '../../api/types';

/**
 * Đồng hồ ca làm: giờ trong truyện là chính, ngân sách điểm là phụ. Khi
 * còn khoảng 20% thì đổi màu (truyện cũng có nhịp báo, A1b).
 */
export function ShiftClock({ clock }: { clock: SceneView['clock'] }) {
  const used = Math.min(clock.budget, clock.pointsUsed);
  const ratio = clock.budget ? used / clock.budget : 0;
  const late = clock.remaining <= Math.ceil(clock.budget * 0.2);
  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label={`Bây giờ ${clock.time}, hạn ${clock.deadline}, còn ${clock.remaining} điểm thời gian`}
    >
      <div className="text-right leading-none">
        <time
          className={cn(
            'block font-display text-2xl font-semibold',
            late ? 'text-warning' : 'text-gold-200',
          )}
        >
          {clock.time}
        </time>
        <span className="mt-1 block text-[11px] text-ink-faint">
          hạn {clock.deadline}
        </span>
      </div>
      <div className="hidden w-36 sm:block">
        <div className="relative h-2 overflow-hidden rounded-full bg-night-950/70 ring-1 ring-inset ring-line">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${ratio * 100}%`,
              background: late
                ? 'linear-gradient(90deg,#b08f4c,#f2a65a)'
                : 'linear-gradient(90deg,#8f7235,#e2c47e)',
            }}
          />
          <span
            aria-hidden
            className="absolute inset-y-0 left-[80%] w-px bg-night-50/30"
          />
        </div>
        <p className="tabular mt-1 text-[11px] text-ink-faint">
          còn{' '}
          <b className={late ? 'text-warning' : 'text-ink'}>
            {clock.remaining}
          </b>
          /{clock.budget} điểm · 1 điểm = {clock.minutesPerPoint} phút
        </p>
      </div>
    </div>
  );
}

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
    <header className="relative z-20 border-b border-line/70 bg-night-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-3 sm:px-5">
        <Tooltip content="Thoát. Tiến độ được lưu, quay lại chơi tiếp lúc nào cũng được.">
          <Link
            to={backTo}
            aria-label="Thoát ca làm, tiến độ được lưu"
            className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-night-800 hover:text-ink"
          >
            <ArrowLeft size={20} />
          </Link>
        </Tooltip>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-sans text-sm font-bold text-ink sm:text-base">
            {title}
          </h1>
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-gold-200/90">
            <Target size={12} aria-hidden className="shrink-0" />
            <span className="truncate">{goal}</span>
          </p>
          <p className="mt-0.5 hidden text-[10px] uppercase tracking-wider text-night-300 md:block">
            <Sparkles size={10} aria-hidden className="mr-1 inline" />
            {aiLabel}
          </p>
        </div>
        {scene && <ShiftClock clock={scene.clock} />}
        <div className="flex items-center gap-1">
          <IconButton
            label={`Gợi ý (không tốn thời gian, đã dùng ${scene?.hintsUsed ?? 0})`}
            icon={<Lightbulb size={18} />}
            onClick={onHint}
            disabled={hintDisabled}
          />
          <IconButton
            label="Mở sổ tay"
            icon={<BookOpen size={18} />}
            onClick={onNotebook}
            className="xl:hidden"
          />
        </div>
      </div>
    </header>
  );
}
