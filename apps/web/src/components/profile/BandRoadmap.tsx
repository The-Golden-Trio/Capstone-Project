import { UNLOCK_AT } from '@datn/game-core';
import type { BandProgress, RoleProgress } from '../../api/schemas';
import { useT } from '../../i18n/useT';
import { cx } from '../../lib/cx';
import { SourceNote } from '../ui/Note';

/**
 * Trạng thái một trạm, theo đúng thứ tự ưu tiên khi vẽ: đang đứng > đã mở >
 * còn khoá. `completed`/`enrolled` là chi tiết phụ, chỉ thêm huy hiệu nhỏ.
 */
function stopTone(band: BandProgress, isCurrent: boolean) {
  if (isCurrent) return 'current' as const;
  if (band.unlocked) return 'open' as const;
  return 'locked' as const;
}

function Stop({
  band,
  isCurrent,
  isFirst,
  isLast,
  prevUnlocked,
}: {
  band: BandProgress;
  isCurrent: boolean;
  isFirst: boolean;
  isLast: boolean;
  prevUnlocked: boolean;
}) {
  const t = useT();
  const tone = stopTone(band, isCurrent);

  const status = band.unlocked
    ? band.points > 0
      ? t('profile.points', { count: band.points })
      : t('profile.unlocked')
    : t('profile.missing', { count: band.pointsToUnlock });

  return (
    <li className="relative flex w-[104px] shrink-0 flex-col items-center pt-1 text-center">
      {/* Đoạn nối tới trạm trước / trạm sau. Sáng lên khi cả hai đầu đã mở. */}
      {!isFirst && (
        <i
          aria-hidden="true"
          className={cx(
            'absolute left-0 top-[23px] h-[2px] w-1/2',
            prevUnlocked && band.unlocked ? 'bg-gold/70' : 'bg-line-2',
          )}
        />
      )}
      {!isLast && (
        <i
          aria-hidden="true"
          className={cx(
            'absolute right-0 top-[23px] h-[2px] w-1/2',
            band.unlocked ? 'bg-gold/40' : 'bg-line-2',
          )}
        />
      )}

      <span
        className={cx(
          'relative z-1 grid h-[38px] w-[38px] place-items-center rounded-full border-2 font-mono text-[12px] font-bold transition-shadow',
          tone === 'current' &&
            'border-gold bg-gold text-bg shadow-[0_0_0_4px_var(--color-gold-soft),0_0_22px_-4px_var(--color-gold)]',
          tone === 'open' && 'border-gold bg-gold-soft text-gold-2',
          tone === 'locked' && 'border-line-2 bg-panel text-muted',
        )}
      >
        {band.band}
        {band.completed && (
          <i
            aria-label={t('profile.mainDone')}
            className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-good font-mono text-[9px] not-italic text-bg"
          >
            ✓
          </i>
        )}
      </span>

      <span
        className={cx(
          'mt-2 block max-w-full truncate px-1 text-[11.5px] leading-tight',
          tone === 'locked' ? 'text-muted' : 'text-ink-2',
        )}
      >
        {band.label}
      </span>

      <span
        className={cx(
          'mt-0.5 block font-mono text-[10px] tabular-nums',
          tone === 'locked' ? 'text-muted/80' : 'text-gold-2',
        )}
      >
        {status}
      </span>

      {band.enrolled && !band.completed ? (
        <span className="mt-1 block rounded-full bg-good-soft px-1.5 font-mono text-[9px] text-good">
          {t('profile.inProgress')}
        </span>
      ) : !band.hasScenario ? (
        <span className="mt-1 block font-mono text-[9px] text-muted/70">
          {t('profile.noScenario')}
        </span>
      ) : null}
    </li>
  );
}

/**
 * Hành trình cấp bậc của một nghề, bày ngang như một bản đồ màn chơi.
 *
 * Trạng thái mở/khoá lấy nguyên từ máy chủ (`unlocked`), không tự tính lại ở
 * đây — nếu hai bên tính khác nhau thì thứ người dùng thấy sẽ khác thứ máy
 * chủ cho phép, và đó là kiểu lỗi khó chịu nhất để dò.
 *
 * Bày ngang thay vì dọc vì L1–L10 xếp dọc chiếm gần cả màn hình chỉ để nói
 * "còn thiếu 6 điểm" chín lần; xếp ngang thì cả hành trình nằm trong một
 * tầm mắt, và trạm đang đứng nổi lên như con tốt trên bàn cờ.
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
      <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <ol className="flex min-w-max list-none items-start gap-0 px-1 py-1">
          {role.bands.map((band, i) => (
            <Stop
              key={band.band}
              band={band}
              isCurrent={band.band === currentBand}
              isFirst={i === 0}
              isLast={i === role.bands.length - 1}
              prevUnlocked={i > 0 && role.bands[i - 1].unlocked}
            />
          ))}
        </ol>
      </div>

      <SourceNote className="mt-2">
        Mỗi cấp bậc mở ra khi cấp ngay trước đạt {UNLOCK_AT} điểm kỹ năng. Máy
        chủ là nơi quyết định điều đó, nên sửa gì trong trình duyệt cũng không
        mở được cấp bậc.
      </SourceNote>
    </>
  );
}
