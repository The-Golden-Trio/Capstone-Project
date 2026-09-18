import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { AuthShell, Field } from '../../components/auth/AuthShell';
import { GoogleButton, OrDivider } from '../../components/auth/GoogleButton';
import { Button } from '../../components/ui/Button';
import { Note, SourceNote } from '../../components/ui/Note';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../i18n/useT';

export function RegisterPage() {
  const t = useT();
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (status === 'authed') return <Navigate to="/" replace />;

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setBusy(true);
    try {
      setUser(await authApi.register(form));
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(
          Object.fromEntries(err.issues.map((i) => [i.path, i.message])),
        );
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : t('auth.registerFailed'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t('auth.register')} subtitle="Vào Nghề">
      {error && (
        <Note tone="warn" className="mb-4">
          {error}
        </Note>
      )}

      <form onSubmit={submit}>
        <Field
          label={t('auth.displayName')}
          name="displayName"
          value={form.displayName}
          onChange={(e) => update('displayName')(e.target.value)}
          error={fieldErrors.displayName}
          maxLength={48}
          autoFocus
        />
        <Field
          label={t('auth.username')}
          name="username"
          value={form.username}
          onChange={(e) => update('username')(e.target.value)}
          error={fieldErrors.username}
          autoComplete="username"
          maxLength={24}
        />
        <Field
          label={t('auth.email')}
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => update('email')(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <Field
          label={t('auth.password')}
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => update('password')(e.target.value)}
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        <Field
          label={t('auth.dateOfBirth')}
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => update('dateOfBirth')(e.target.value)}
          error={fieldErrors.dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
        />

        <SourceNote className="mb-4">
          {t('auth.dobWhy')}
        </SourceNote>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={busy || Object.values(form).some((v) => !v)}
        >
          {busy ? t('auth.registering') : t('auth.registerCta')}
        </Button>
      </form>

      <OrDivider />
      <GoogleButton onError={setError} />

      <p className="mt-5 text-center text-[13px] text-muted">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-gold-2 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </AuthShell>
  );
}
