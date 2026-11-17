import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { AuthNotice } from './AuthLayout';
import { errorText, useGoogleSignIn } from '../../api/hooks';
import { sourceOf } from '../../api';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Đăng nhập Google bằng Google Identity Services (ID token, 07 A24).
 * Chưa cấu hình client ID, hoặc đang chạy dữ liệu mẫu, thì không hiện.
 */
export function GoogleButton({ onDone }: { onDone: () => void }) {
  const google = useGoogleSignIn();
  if (!clientId || sourceOf('auth') !== 'live') return null;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3 text-xs text-toon-ink-soft">
        <span className="h-0.5 flex-1 bg-toon-sand" />
        hoặc
        <span className="h-0.5 flex-1 bg-toon-sand" />
      </div>
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin
          theme="outline"
          shape="pill"
          text="continue_with"
          onSuccess={(r) => {
            if (r.credential)
              google.mutate(r.credential, { onSuccess: onDone });
          }}
        />
      </GoogleOAuthProvider>
      {google.isError && (
        <AuthNotice tone="danger">{errorText(google.error)}</AuthNotice>
      )}
    </div>
  );
}
