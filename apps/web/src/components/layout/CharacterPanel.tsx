import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { UNLOCK_AT, bandLabel } from '@datn/game-core';
import { Crest } from '../game/Crest';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import { DEFAULT_THEME, roleTheme, themeVars } from '../../domain/roleTheme';

/**
 * Bảng nhân vật, luôn ở chân thanh bên.
 *
 * Trước đây chỗ này là một vòng tròn vàng có chữ cái đầu và một dòng chữ.
 * RPG nào cũng cho người chơi thấy mình là ai và còn bao xa tới mốc kế — số
 * liệu thì `progressStore` đã có sẵn, chỉ là chưa ai bày ra.
 */
export function CharacterPanel({ onNavigate }: { onNavigate: () => void }) {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const summary = useProgressStore((s) => s.summary);
  const { roleCode, band } = useJourneyStore();

  // Cấp bậc đang đứng, và còn thiếu bao nhiêu điểm để mở cấp kế.
  const roleProgress = summary?.roles.find((r) => r.roleCode === roleCode);
  const bands = roleProgress?.bands ?? [];
  const currentIndex = bands.findIndex((b) => b.band === band);
  const current = currentIndex >= 0 ? bands[currentIndex] : null;
  const next = currentIndex >= 0 ? bands[currentIndex + 1] : null;

  const theme = roleCode ? roleTheme(roleCode) : DEFAULT_THEME;
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
            {user?.displayName ?? t('hud.guest')}
          </div>
          <div className="truncate font-mono text-[10px] text-muted">
            {current
              ? `${current.band} · ${bandLabel(current.band)}`
              : t('hud.skillPoints', { count: summary?.totalPoints ?? 0 })}
          </div>
        </div>
      </NavLink>

      {/* Thanh tiến tới cấp bậc kế — chỉ hiện khi đang đứng ở một nghề.
          Lấy màu của chính nghề đó, nên thanh này đổi màu theo nơi bạn đang ở. */}
      {current && next && (
        <div className="mt-2.5 px-0.5" style={themeVars(theme) as CSSProperties}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
              {t('hud.toward')}{' '}
              <b className="font-semibold text-[var(--accent)]">{next.band}</b>
            </span>
            <span className="font-mono text-[10px] font-semibold tabular-nums text-ink-2">
              {points}
              <span className="text-muted">/{UNLOCK_AT}</span>
            </span>
          </div>

          <div className="xp-track">
            <i className="xp-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
