import { DIMENSIONS, GAME } from '../../data/gameData';
import type { FitVector } from '../../domain/fit';
import { cx } from '../../lib/cx';

interface FitRadarProps {
  fit: FitVector;
  /** Hiện mô tả chiều thay cho thanh — dùng khi giải thích một lựa chọn. */
  describe?: boolean;
}

/**
 * Chân dung 8 chiều. Thanh vẽ theo tỉ lệ với chiều mạnh nhất, nên đọc được
 * hình dáng tương đối ngay cả khi tổng điểm còn nhỏ.
 */
export function FitRadar({ fit, describe = false }: FitRadarProps) {
  const max = Math.max(1, ...DIMENSIONS.map((d) => Math.abs(fit[d] ?? 0)));

  return (
    <div className="flex flex-col gap-[7px]">
      {DIMENSIONS.map((dimension) => {
        const value = fit[dimension] ?? 0;
        const pct = Math.round((Math.abs(value) / max) * 100);
        return (
          <div
            key={dimension}
            className="grid items-center gap-[11px] [grid-template-columns:104px_1fr_40px]"
          >
            <span className="font-mono text-[10px] tracking-[0.04em] text-muted">
              {dimension}
            </span>
            {describe ? (
              <span className="text-[12.5px] text-ink-2">
                {GAME.fit_dimensions[dimension]}
              </span>
            ) : (
              <span className="h-[7px] overflow-hidden rounded-sm bg-inset">
                <i
                  className={cx(
                    'block h-full rounded-sm',
                    value < 0 ? 'ml-auto bg-signal' : 'bg-gold',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </span>
            )}
            <span className="text-right font-mono text-[10.5px] tabular-nums text-ink-2">
              {value > 0 ? '+' : ''}
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Danh sách tín hiệu của một lựa chọn: chiều nào tăng, chiều nào giảm. */
export function SignalList({ signal }: { signal: Record<string, number> }) {
  const entries = Object.entries(signal);
  if (entries.length === 0) {
    return (
      <p className="text-[13px] text-muted">
        Lựa chọn này không nghiêng về chiều nào.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[7px]">
      {entries.map(([dimension, value]) => (
        <div
          key={dimension}
          className="grid items-center gap-[11px] [grid-template-columns:104px_1fr_40px]"
        >
          <span className="font-mono text-[10px] tracking-[0.04em] text-muted">
            {dimension}
          </span>
          <span className="text-[12.5px] text-ink-2">
            {GAME.fit_dimensions[dimension] ?? ''}
          </span>
          <span
            className={cx(
              'text-right font-mono text-[10.5px] tabular-nums',
              value > 0 ? 'text-good' : 'text-signal',
            )}
          >
            {value > 0 ? '+' : ''}
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
