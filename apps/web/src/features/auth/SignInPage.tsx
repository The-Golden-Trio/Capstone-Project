import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';
import { Button, Callout, Field, Input, PasswordInput } from '@datn/ui';
import { errorText, useSignIn } from '../../api/hooks';
import { AuthLayout } from './AuthLayout';
import { GoogleButton } from './GoogleButton';

export default function SignInPage() {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/galaxy';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const idError =
    touched && !identifier.trim()
      ? 'Bạn nhập email hoặc tên đăng nhập nhé.'
      : undefined;
  const pwError = touched && !password ? 'Bạn chưa nhập mật khẩu.' : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!identifier.trim() || !password) return;
    signIn.mutate(
      { identifier: identifier.trim(), password },
      { onSuccess: () => navigate(from, { replace: true }) },
    );
  };

  return (
    <AuthLayout
      title="Chào bạn quay lại"
      subtitle="Ngân hà vẫn giữ nguyên chỗ bạn dừng."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold text-gold-300 hover:text-gold-200"
          >
            Tạo tài khoản mới
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {signIn.isError && (
          <Callout tone="danger">{errorText(signIn.error)}</Callout>
        )}
        <Field label="Email hoặc tên đăng nhập" error={idError}>
          <Input
            autoComplete="username"
            leftIcon={<Mail size={16} />}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ban@vidu.com"
          />
        </Field>
        <Field label="Mật khẩu" error={pwError}>
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="-mt-2 text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-ink-faint hover:text-gold-200"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <Button
          type="submit"
          size="lg"
          block
          loading={signIn.isPending}
          loadingText="Đang đăng nhập…"
          leftIcon={<LogIn size={18} />}
        >
          Đăng nhập
        </Button>
        <GoogleButton onDone={() => navigate(from, { replace: true })} />
      </form>
    </AuthLayout>
  );
}
