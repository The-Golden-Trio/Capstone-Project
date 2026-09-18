import { cx } from '../../../lib/cx';
import type { Dir } from './OfficeCanvas';

interface DPadProps {
  onPress: (dir: Dir) => void;
  onRelease: (dir: Dir) => void;
  onInteract: () => void;
  /** Có gì để tương tác lúc này không — nút E sáng lên khi có. */
  canInteract: boolean;
  className?: string;
}

const ARROW: Record<Dir, string> = { up: '▲', down: '▼', left: '◀', right: '▶' };

/**
 * Phím ảo cho màn hình cảm ứng. Bàn phím thật vẫn là cách chính; cái này chỉ
 * để điện thoại không bị khoá ngoài cửa.
 */
export function DPad({ onPress, onRelease, onInteract, canInteract, className }: DPadProps) {
  const key = (dir: Dir, extra: string) => (
    <button
      type="button"
      aria-label={dir}
      className={cx(
        'grid h-11 w-11 place-items-center rounded-[8px] border border-line bg-panel/80 text-[13px] text-ink-2 backdrop-blur-sm select-none active:bg-surf',
        extra,
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onPress(dir);
      }}
      onPointerUp={() => onRelease(dir)}
      onPointerCancel={() => onRelease(dir)}
      onPointerLeave={() => onRelease(dir)}
    >
      {ARROW[dir]}
    </button>
  );

  return (
    <div className={cx('flex items-end justify-between gap-4', className)}>
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        {key('up', 'col-start-2 row-start-1')}
        {key('left', 'col-start-1 row-start-2')}
        {key('right', 'col-start-3 row-start-2')}
        {key('down', 'col-start-2 row-start-3')}
      </div>
      <button
        type="button"
        onClick={onInteract}
        className={cx(
          'grid h-14 w-14 place-items-center rounded-full border font-mono text-[15px] font-bold select-none',
          canInteract
            ? 'border-gold bg-gold text-bg'
            : 'border-line bg-panel/80 text-muted backdrop-blur-sm',
        )}
        aria-label="Tương tác"
      >
        E
      </button>
    </div>
  );
}
