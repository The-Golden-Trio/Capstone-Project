import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { StarField } from '../components/layout/StarField';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useContentStore } from '../store/contentStore';
import { useProgressStore } from '../store/progressStore';
import { translate } from '../i18n/messages';
import { useLanguage } from '../i18n/useT';
import { decideGate } from './gate';

/**
 * Cổng vào của toàn bộ app.
 *
 * Không còn bắt đăng nhập (xem `decideGate`): khách vào được mọi màn. Cổng
 * chỉ còn chờ nội dung game về, và với người đã đăng nhập thì giữ cửa đồng ý
 * của người giám hộ cùng lời mời tự vấn lần đầu.
 */
export function RequireAuth() {
  const { status, user } = useAuthStore();
  const location = useLocation();
  const language = useLanguage();

  const loadProfile = useProfileStore((s) => s.load);
  const quizDone = useProfileStore((s) => s.quizDone);
  const profileLoaded = useProfileStore((s) => s.loaded);
  const loadProgress = useProgressStore((s) => s.load);

  const loadContent = useContentStore((s) => s.load);
  const contentIndex = useContentStore((s) => s.index);
  const contentError = useContentStore((s) => s.error);

  useEffect(() => {
    // Còn đang hỏi phiên đăng nhập thì chưa nạp: lúc đó chưa biết lấy nội
    // dung từ máy chủ hay từ bản đóng gói.
    if (status === 'loading') return;
    void loadContent();
    if (status !== 'authed') return;
    if (!profileLoaded) void loadProfile().catch(() => undefined);
    void loadProgress();
  }, [status, profileLoaded, loadProfile, loadProgress, loadContent]);

  const decision = decideGate({
    status,
    consentStatus: user?.consentStatus ?? null,
    profileLoaded,
    contentLoaded: contentIndex !== null,
    quizDone,
    pathname: location.pathname,
  });

  // Nội dung không về thì không vào được app — nói rõ và cho thử lại, chứ
  // đừng để người chơi ngồi trước một màn hình trắng không giải thích gì.
  if (contentError) {
    return (
      <>
        <StarField />
        <div className="relative z-1 grid min-h-screen place-items-center px-6">
          <div className="max-w-[420px] text-center">
            <p className="m-0 mb-3 text-[14px] leading-relaxed text-ink-2">
              {contentError}
            </p>
            <button
              type="button"
              onClick={() => {
                useContentStore.getState().reset();
                void useContentStore.getState().load();
              }}
              className="rounded-[9px] border border-line bg-surf px-4 py-2 text-[13px] text-ink transition-colors hover:border-[var(--color-gold)]"
            >
              Thử lại
            </button>
          </div>
        </div>
      </>
    );
  }

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
    return <Navigate to={decision.to} replace />;
  }

  return <AppShell />;
}
