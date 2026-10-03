import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { AuthShell, Field } from '../../components/auth/AuthShell';
import {
  GoogleButton,
  OrDivider,
} from '../../components/auth/GoogleButton';
import { Button } from '../../components/ui/Button';
import { Note } from '../../components/ui/Note';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../i18n/useT';

export function LoginPage() {
  const location = useLocation();
  const t = useT();
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Nơi người dùng định tới trước khi bị chặn lại — RequireAuth đã gài sẵn.
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
    '/jobs';

  if (status === 'authed') return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      setUser(await authApi.login({ identifier, password }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t('auth.login')} subtitle="Vào Nghề">
      {error && (
        <Note tone="warn" className="mb-4">
          {error}
        </Note>
      )}

      <form onSubmit={submit}>
        <Field
          label={t('auth.identifier')}
          name="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          autoFocus
        />
        <Field
          label={t('auth.password')}
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={busy || !identifier || !password}
        >
          {busy ? t('auth.loggingIn') : t('auth.loginCta')}
        </Button>
      </form>

      <OrDivider />
      <GoogleButton onError={setError} />

      <p className="mt-5 text-center text-[13px] text-muted">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-gold-2 hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </AuthShell>
  );
}
