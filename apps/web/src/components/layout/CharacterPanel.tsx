import { NavLink } from 'react-router-dom';
import { UNLOCK_AT, bandLabel } from '@datn/game-core';
import { Crest } from '../game/Crest';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';
import { useProgressStore } from '../../store/progressStore';

/**
 * Bảng nhân vật, luôn ở chân thanh bên.
 *
 * Trước đây chỗ này là một vòng tròn vàng có chữ cái đầu và một dòng chữ.
 * RPG nào cũng cho người chơi thấy mình là ai và còn bao xa tới mốc kế — số
 * liệu thì `progressStore` đã có sẵn, chỉ là chưa ai bày ra.
 */
export function CharacterPanel({ onNavigate }: { onNavigate: () => void }) {
  const user = useAuthStore((s) => s.user);
  const summary = useProgressStore((s) => s.summary);
  const { roleCode, band } = useJourneyStore();

  // Cấp bậc đang đứng, và còn thiếu bao nhiêu điểm để mở cấp kế.
  const roleProgress = summary?.roles.find((r) => r.roleCode === roleCode);
  const bands = roleProgress?.bands ?? [];
  const currentIndex = bands.findIndex((b) => b.band === band);
  const current = currentIndex >= 0 ? bands[currentIndex] : null;
  const next = currentIndex >= 0 ? bands[currentIndex + 1] : null;

  const points = current?.points ?? 0;
  const pct = Math.min(100, (points / UNLOCK_AT) * 100);

  return (
    <div className="border-t border-line-2 px-3 py-3">
      <NavLink
        to="/account"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-[9px] border border-line-2 bg-panel p-2.5 transition-colors hover:border-line"
      >
        <Crest seed={user?.id ?? 'khach'} size={38} />

        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold leading-tight text-ink">
            {user?.displayName ?? 'Khách'}
          </div>
          <div className="truncate font-mono text-[10px] text-muted">
            {current
              ? `${current.band} · ${bandLabel(current.band)}`
              : `${summary?.totalPoints ?? 0} điểm kỹ năng`}
          </div>
        </div>
      </NavLink>

      {/* Thanh tiến tới cấp bậc kế — chỉ hiện khi đang đứng ở một nghề. */}
      {current && next && (
        <div className="mt-2 px-0.5">
          <div className="mb-1 flex items-baseline justify-between font-mono text-[9.5px] text-muted">
            <span>tới {next.band}</span>
            <span className="tabular-nums">
              {points}/{UNLOCK_AT}
            </span>
          </div>
          <div className="h-[6px] overflow-hidden rounded-[3px] border border-line-2 bg-inset">
            <i
              className="block h-full rounded-[3px] bg-linear-to-r from-gold to-gold-2 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
