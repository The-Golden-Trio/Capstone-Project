import { NavLink } from 'react-router-dom';
import { Crest } from '../game/Crest';
import { LanguageToggle } from './LanguageToggle';
import { Logo } from './Logo';
import { cx } from '../../lib/cx';
import { useT } from '../../i18n/useT';
import { useAuthStore } from '../../store/authStore';

/**
 * Thanh đầu trang — nay là chỗ điều hướng duy nhất.
 *
 * Giữ ít mục nhất có thể: bản đồ nghề là nơi người chơi quay về nhiều nhất,
 * còn tự vấn và tài khoản nằm trong trang Hành trang, vào qua huy hiệu bên
 * phải. Header đông quá thì trên màn hẹp không còn chỗ cho cái gì cả.
 *
 * Điểm kỹ năng từng có một ô ở đây, nhưng thanh kinh nghiệm dưới đáy màn hình
 * đã nói đúng con số ấy ở mọi trang — hai chỗ cùng nói một điều thì chỉ tổ
 * chiếm chỗ và có ngày lệch nhau.
 */
export function Topbar() {
  const t = useT();
  const user = useAuthStore((s) => s.user);

  const link = ({ isActive }: { isActive: boolean }) =>
    cx(
      'rounded-[7px] px-3 py-1.5 text-[13px] transition-colors',
      isActive
        ? 'bg-gold-soft font-semibold text-gold-2'
        : 'text-ink-2 hover:bg-panel hover:text-ink',
    );

  return (
    <header className="sticky top-0 z-30 flex min-h-[57px] flex-wrap items-center gap-3 border-b border-line-2 bg-bg/90 px-5 py-2.5 backdrop-blur-[8px]">
      <NavLink to="/jobs" className="flex shrink-0 items-center gap-2.5">
        <Logo className="h-[30px] w-[30px] drop-shadow-[0_2px_8px_rgba(212,176,106,.3)]" />
        <span className="font-display text-[17px] font-bold leading-none max-[520px]:hidden">
          Vào <span className="text-gold">Nghề</span>
        </span>
      </NavLink>

      <nav className="flex items-center gap-1" aria-label={t('nav.mainNav')}>
        <NavLink to="/jobs" className={link}>
          {t('nav.jobs')}
        </NavLink>
      </nav>

      <span className="flex-1" />

      <LanguageToggle />

      {/* Huy hiệu là cửa vào Hành trang — nơi chứa tự vấn, tiến trình, tài khoản. */}
      <NavLink
        to="/profile"
        title={user?.displayName ?? t('hud.guest')}
        className={({ isActive }) =>
          cx(
            'rounded-full transition-[outline-color] outline-2 outline-offset-2',
            isActive ? 'outline-gold' : 'outline-transparent hover:outline-line',
          )
        }
      >
        <Crest seed={user?.id ?? 'khach'} size={32} />
      </NavLink>
    </header>
  );
}
