import { UNLOCK_AT } from '@datn/game-core';
import type { RoleProgress } from '../../api/schemas';
import { cx } from '../../lib/cx';
import { SourceNote } from '../ui/Note';

/**
 * Hành trình cấp bậc của một nghề.
 *
 * Trạng thái mở/khoá lấy nguyên từ máy chủ (`unlocked`), không tự tính lại ở
 * đây — nếu hai bên tính khác nhau thì thứ người dùng thấy sẽ khác thứ máy
 * chủ cho phép, và đó là kiểu lỗi khó chịu nhất để dò.
 */
export function BandRoadmap({
  role,
  currentBand,
}: {
  role: RoleProgress;
  currentBand?: string | null;
}) {
  return (
    <>
      <div className="roadmap">
        {role.bands.map((band) => (
          <div
            key={band.band}
            className={cx(
              'roadmap-stop relative mb-2.5 grid items-center gap-3 rounded-[10px] border px-[15px] py-[11px] [grid-template-columns:1fr_auto]',
              band.unlocked
                ? 'open border-gold bg-gold-soft'
                : 'border-line-2 bg-panel',
              band.band === currentBand && 'current',
            )}
          >
            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span
                  className={cx(
                    'font-mono text-[13px] font-bold',
                    band.unlocked ? 'text-gold-2' : 'text-muted',
                  )}
                >
                  {band.band}
                </span>
                <span className="text-[12.5px] text-ink-2">{band.label}</span>
              </div>
              {!band.hasScenario && (
                <div className="mt-[3px] font-mono text-[10.5px] text-muted">
                  chưa dựng nhiệm vụ
                </div>
              )}
            </div>

            <span className="whitespace-nowrap font-mono text-[10.5px] text-muted">
              {band.unlocked
                ? band.points > 0
                  ? `${band.points} điểm`
                  : 'đã mở'
                : `còn thiếu ${band.pointsToUnlock} điểm`}
            </span>
          </div>
        ))}
      </div>

      <SourceNote className="mt-2">
        Mỗi cấp bậc mở ra khi cấp ngay trước đạt {UNLOCK_AT} điểm kỹ năng. Máy
        chủ là nơi quyết định điều đó, nên sửa gì trong trình duyệt cũng không
        mở được cấp bậc.
      </SourceNote>
    </>
  );
}
