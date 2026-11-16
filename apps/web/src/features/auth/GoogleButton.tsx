import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Callout } from '@datn/ui';
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
      <div className="flex w-full items-center gap-3 text-xs text-night-300">
        <span className="hairline flex-1" />
        hoặc
        <span className="hairline flex-1" />
      </div>
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin
          theme="filled_black"
          shape="pill"
          text="continue_with"
          onSuccess={(r) => {
            if (r.credential)
              google.mutate(r.credential, { onSuccess: onDone });
          }}
        />
      </GoogleOAuthProvider>
      {google.isError && (
        <Callout tone="danger">{errorText(google.error)}</Callout>
      )}
    </div>
  );
}
