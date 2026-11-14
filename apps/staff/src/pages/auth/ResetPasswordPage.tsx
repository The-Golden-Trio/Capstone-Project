import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import {
  AuthFrame,
  Button,
  Notice,
  ProblemAlert,
  TextField,
} from '../../components/ui';

/** T01: `requestPasswordReset` và `confirmPasswordReset`. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      if (token) await authApi.confirmPasswordReset(token, password);
      else await authApi.requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame title={token ? 'Đặt mật khẩu mới' : 'Quên mật khẩu'}>
      <form onSubmit={submit}>
        <ProblemAlert error={error} />
        {done ? (
          <Notice tone="good">
            {token
              ? 'Đã đổi mật khẩu. Đăng nhập lại bằng mật khẩu mới.'
              : 'Nếu email có trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.'}
          </Notice>
        ) : token ? (
          <TextField
            label="Mật khẩu mới"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            hint="Ít nhất 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : (
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
        {!done && (
          <Button
            type="submit"
            variant="primary"
            busy={busy}
            className="mt-2 w-full"
          >
            {token ? 'Đổi mật khẩu' : 'Gửi link đặt lại'}
          </Button>
        )}
        <p className="mt-4 text-center text-[13px]">
          <Link to="/login" className="text-brand hover:underline">
            Về trang đăng nhập
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
