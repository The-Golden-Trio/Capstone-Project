import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, ProblemAlert, TextField } from '../../components/ui';
import { portalsOf, useAuth } from '../../store/auth';

/** T01 Staff sign in (`signIn`, `getMe`). */
export function SignInPage() {
  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  if (status === 'authed') return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const me = await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? `/${portalsOf(me)[0] ?? 'ca'}`, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-line bg-surf p-6 shadow-sm"
      >
        <h1 className="mb-1 text-lg font-semibold">JobQuest · Staff</h1>
        <p className="mb-5 text-muted">
          Dành cho Content Admin và Domain Expert.
        </p>
        <ProblemAlert error={error} />
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          busy={busy}
          className="mt-1 w-full"
        >
          Đăng nhập
        </Button>
        <p className="mt-4 text-center text-[13px]">
          <Link to="/reset-password" className="text-brand hover:underline">
            Quên mật khẩu?
          </Link>
        </p>
      </form>
    </main>
  );
}
