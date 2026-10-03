import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../i18n/useT';

/**
 * Nút đăng nhập Google.
 *
 * Google trả về một ID token ngay trong trang (không chuyển hướng). Máy khách
 * không tự tin vào token đó — nó chỉ chuyển tiếp lên `/api/auth/google`, nơi
 * máy chủ kiểm chữ ký và `aud` bằng `google-auth-library` rồi mới lập phiên.
 */
export function GoogleButton({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const t = useT();

  return (
    <div className="flex justify-center [color-scheme:light]">
      <GoogleLogin
        theme="filled_black"
        shape="pill"
        text="continue_with"
        onSuccess={(response) => {
          if (!response.credential) {
            onError(t('auth.googleNoCredential'));
            return;
          }
          void authApi
            .google({ credential: response.credential })
            .then(setUser)
            .catch((error: unknown) =>
              onError(
                error instanceof Error
                  ? error.message
                  : t('auth.googleFailed'),
              ),
            );
        }}
        onError={() => onError(t('auth.googleFailed'))}
      />
    </div>
  );
}

/** Vạch ngăn "hoặc" giữa hai cách đăng nhập. */
export function OrDivider() {
  const t = useT();
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-line-2" />
      <span className="font-mono text-[10px] uppercase tracking-[0.11em] text-muted">
        {t('auth.or')}
      </span>
      <span className="h-px flex-1 bg-line-2" />
    </div>
  );
}
