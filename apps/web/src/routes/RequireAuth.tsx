import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { StarField } from '../components/layout/StarField';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

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

  const loadProfile = useProfileStore((s) => s.load);
  const profileLoaded = useProfileStore((s) => s.loaded);
  const loadProgress = useProgressStore((s) => s.load);

  useEffect(() => {
    if (status !== 'authed') return;
    if (!profileLoaded) void loadProfile();
    void loadProgress();
  }, [status, profileLoaded, loadProfile, loadProgress]);

  if (status === 'loading') {
    return (
      <>
        <StarField />
        <div className="relative z-1 grid min-h-screen place-items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Đang mở cổng…
          </p>
        </div>
      </>
    );
  }

  if (status === 'anon' || !user) {
    // Nhớ chỗ định tới để đăng nhập xong quay lại đúng đó.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Dưới 16 tuổi mà chưa có người giám hộ đồng ý thì mọi đường đều dẫn về đây.
  if (user.consentStatus === 'pending' && location.pathname !== '/consent') {
    return <Navigate to="/consent" replace />;
  }

  return <AppShell />;
}
