import { Link } from 'react-router-dom';
import { Pause, Play, StepForward, X } from 'lucide-react';
import { ToonButton } from '@datn/ui';
import type { Autoplay } from './useAutoplay';

/**
 * Thanh điều khiển người trình bày. Nằm trong luồng bố cục, trên HUD, nên
 * không đè lên khung trả lời trên điện thoại; nổi lên trên màn giới thiệu.
 */
export function AutoplayBar({
  autoplay,
  summaryTo,
  onExit,
  onRestart,
}: {
  autoplay: Autoplay;
  summaryTo: string;
  onExit: () => void;
  onRestart: () => void;
}) {
  const { status, playing } = autoplay;
  const stepText =
    status === 'done'
      ? 'Hết lượt chơi mẫu'
      : `Bước ${Math.min(autoplay.index + 1, autoplay.total)}/${autoplay.total} · ${autoplay.label}`;
  return (
    <div
      role="region"
      aria-label="Điều khiển lượt chơi mẫu"
      data-autoplay-status={status}
      className="relative z-50 flex h-11 shrink-0 items-center gap-2 border-b-[3px] border-toon-ink bg-toon-lilac px-2 sm:gap-3 sm:px-3"
    >
      <p
        aria-live="polite"
        title={status === 'idle' || status === 'working' ? stepText : undefined}
        className="min-w-0 flex-1 truncate text-xs font-bold text-toon-ink sm:text-sm"
      >
        {status === 'blocked' ? (
          'Ca này đã chơi dở nên không chạy mẫu được.'
        ) : status === 'error' ? (
          <span role="alert">{autoplay.message}</span>
        ) : (
          stepText
        )}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        {status === 'blocked' && (
          <ToonButton size="sm" onClick={onRestart}>
            Bắt đầu lượt mẫu mới
          </ToonButton>
        )}
        {status === 'done' && (
          <Link
            to={summaryTo}
            className="rounded-full border-[2.5px] border-toon-ink bg-toon-mustard px-3 py-1 font-toon text-sm font-extrabold text-toon-ink shadow-toon-sm"
          >
            Xem tổng kết
          </Link>
        )}
        {status !== 'blocked' && status !== 'done' && (
          <>
            <ToonButton
              size="sm"
              leftIcon={<StepForward size={15} aria-hidden />}
              disabled={playing || status !== 'idle'}
              onClick={autoplay.next}
              aria-keyshortcuts="ArrowRight"
            >
              <span className="max-sm:sr-only">Tiếp</span>
            </ToonButton>
            <ToonButton
              size="sm"
              variant="secondary"
              leftIcon={
                playing ? (
                  <Pause size={15} aria-hidden />
                ) : (
                  <Play size={15} aria-hidden />
                )
              }
              aria-pressed={playing}
              onClick={autoplay.togglePlaying}
            >
              <span className="max-sm:sr-only">
                {playing ? 'Tạm dừng' : 'Tự chạy'}
              </span>
            </ToonButton>
            <ToonButton
              size="sm"
              variant="secondary"
              aria-label={`Tốc độ ${autoplay.speed}x, bấm để đổi`}
              onClick={autoplay.toggleSpeed}
            >
              {autoplay.speed}x
            </ToonButton>
          </>
        )}
        <ToonButton
          size="sm"
          variant="ghost"
          aria-label="Thoát lượt chơi mẫu"
          onClick={onExit}
        >
          <X size={15} aria-hidden />
        </ToonButton>
      </div>
    </div>
  );
}
