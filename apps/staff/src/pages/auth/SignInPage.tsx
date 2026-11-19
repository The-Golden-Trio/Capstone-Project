import { Button } from '@datn/ui';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthFrame, ProblemAlert, TextField } from '../../components/ui';
import { portalsOf, useAuth } from '../../store/auth';
import { DEMO_ACCOUNTS, STAFF_DEMO } from '../../api/demo-server';

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
    <AuthFrame
      title="Đăng nhập"
      description="Dành cho Content Admin và Domain Expert."
    >
      <form onSubmit={submit}>
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
          loading={busy}
          className="mt-2 w-full"
        >
          Đăng nhập
        </Button>
        {STAFF_DEMO && (
          <div className="mt-5 rounded-lg border border-line p-3">
            <p className="text-[13px] font-semibold text-ink">
              Bản demo: chọn một tài khoản mẫu
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Dữ liệu giả, không cần máy chủ. Mật khẩu nào cũng được.
            </p>
            <ul className="mt-2 grid gap-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-line px-3 py-2 text-left text-[13px] hover:border-gold-300 focus-visible:outline-2 focus-visible:outline-gold-300"
                    onClick={() => {
                      setEmail(a.email ?? '');
                      setPassword('demo');
                    }}
                  >
                    <span className="font-semibold text-ink">{a.email}</span>
                    <span className="block text-xs text-ink-muted">
                      {a.displayName} · {a.hint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-center text-[13px]">
          <Link to="/reset-password" className="text-info hover:underline">
            Quên mật khẩu?
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
