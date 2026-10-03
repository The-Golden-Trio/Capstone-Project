import { StrictMode, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { useAuthStore } from './store/authStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

/**
 * Hỏi máy chủ một lần xem còn phiên đăng nhập không.
 *
 * Phải hỏi vì cookie là httpOnly — JavaScript không đọc được, nên không có
 * cách nào biết trước ngoài việc gọi `/auth/me`.
 */
function AuthBoundary() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return <RouterProvider router={router} />;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthBoundary />
    </GoogleOAuthProvider>
  </StrictMode>,
);
