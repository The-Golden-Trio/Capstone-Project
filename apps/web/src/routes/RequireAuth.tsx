import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { StarField } from '../components/layout/StarField';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';
import { translate } from '../i18n/messages';
import { useLanguage } from '../i18n/useT';
import { decideGate } from './gate';

/**
 * Cổng vào của toàn bộ phần đã đăng nhập.
 *
 * Ba trạng thái, không phải hai: trong lúc còn đang hỏi máy chủ thì chưa được
 * kết luận gì. Nhảy thẳng sang `/login` khi `status === 'loading'` sẽ đá văng
 * người đang có phiên hợp lệ mỗi lần họ tải lại trang.
 */
export function RequireAuth() {
  const { status, user } = useAuthStore();
  const location = useLocation();
  const language = useLanguage();

  const loadProfile = useProfileStore((s) => s.load);
  const quizDone = useProfileStore((s) => s.quizDone);
  const profileLoaded = useProfileStore((s) => s.loaded);
  const loadProgress = useProgressStore((s) => s.load);

  useEffect(() => {
    if (status !== 'authed') return;
    if (!profileLoaded) void loadProfile();
    void loadProgress();
  }, [status, profileLoaded, loadProfile, loadProgress]);

  const decision = decideGate({
    status,
    consentStatus: user?.consentStatus ?? null,
    profileLoaded,
    quizDone,
    pathname: location.pathname,
  });

  if (decision.kind === 'wait' || (status === 'authed' && !user)) {
    return (
      <>
        <StarField />
        <div className="relative z-1 grid min-h-screen place-items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {translate('auth.opening', language)}
          </p>
        </div>
      </>
    );
  }

  if (decision.kind === 'redirect') {
    // Nhớ chỗ định tới để đăng nhập xong quay lại đúng đó.
    const state = decision.to === '/login' ? { from: location } : undefined;
    return <Navigate to={decision.to} replace state={state} />;
  }

  return <AppShell />;
}
