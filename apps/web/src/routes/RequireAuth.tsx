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

  const loadContent = useContentStore((s) => s.load);
  const contentIndex = useContentStore((s) => s.index);
  const contentError = useContentStore((s) => s.error);

  useEffect(() => {
    if (status !== 'authed') return;
    if (!profileLoaded) void loadProfile();
    void loadProgress();
    void loadContent();
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
  if (status === 'authed' && contentError) {
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
    // Nhớ chỗ định tới để đăng nhập xong quay lại đúng đó.
    const state = decision.to === '/login' ? { from: location } : undefined;
    return <Navigate to={decision.to} replace state={state} />;
  }

  return <AppShell />;
}
