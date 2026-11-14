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
      // Cùng kiểu với thanh điều hướng của landing page: in hoa, giãn chữ.
      'border-b px-2.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-colors',
      isActive
        ? 'border-gold/70 text-gold'
        : 'border-transparent text-muted hover:text-ink',
    );

  return (
    <header className="sticky top-0 z-30 flex min-h-[57px] flex-wrap items-center gap-3 border-b border-line-gold bg-linear-to-b from-bg to-bg/75 px-6 py-2.5 backdrop-blur-[8px] max-[900px]:px-4">
      <NavLink to="/jobs" className="flex shrink-0 items-center gap-2.5">
        <Logo className="h-[30px] w-[30px] drop-shadow-[0_2px_8px_rgba(212,176,106,.3)]" />
        <span className="font-display text-[19px] font-semibold leading-none tracking-[0.01em] max-[520px]:hidden">
          Job<span className="text-gold">Quest</span>
        </span>
      </NavLink>

      <nav className="ml-3 flex items-center gap-2" aria-label={t('nav.mainNav')}>
        <NavLink to="/jobs" className={link}>
          {t('nav.jobs')}
        </NavLink>
        <NavLink to="/feedback" className={link}>
          {t('nav.feedback')}
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
