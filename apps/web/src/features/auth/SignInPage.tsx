import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';
import { ToonButton, ToonField, ToonInput } from '@datn/ui';
import { errorText, useSignIn } from '../../api/hooks';
import { sourceOf } from '../../api';
import { SHOWCASE_EMAIL, SHOWCASE_PASSWORD } from '../../api/demo';
import { AuthLayout, AuthNotice, AuthPassword } from './AuthLayout';
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
    if (signIn.isPending) return;
    setTouched(true);
    if (!identifier.trim() || !password) {
      e.currentTarget
        .querySelector<HTMLInputElement>(
          !identifier.trim()
            ? 'input[autocomplete="username"]'
            : 'input[autocomplete="current-password"]',
        )
        ?.focus();
      return;
    }
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
            className="font-semibold text-toon-ink underline decoration-2 underline-offset-4 hover:text-toon-maroon"
          >
            Tạo tài khoản mới
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {sourceOf('auth') === 'demo' && (
          <div className="rounded-2xl border-[2.5px] border-dashed border-toon-ink bg-toon-cream p-3 text-sm">
            <p className="font-bold text-toon-ink">
              Bản demo: có sẵn một người chơi đã chơi nhiều
            </p>
            <p className="mt-0.5 text-toon-ink-soft">
              {SHOWCASE_EMAIL} · mật khẩu {SHOWCASE_PASSWORD}
            </p>
            <ToonButton
              type="button"
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => {
                setIdentifier(SHOWCASE_EMAIL);
                setPassword(SHOWCASE_PASSWORD);
              }}
            >
              Điền tài khoản mẫu
            </ToonButton>
          </div>
        )}
        {signIn.isError && (
          <AuthNotice tone="danger">{errorText(signIn.error)}</AuthNotice>
        )}
        <ToonField label="Email hoặc tên đăng nhập" error={idError}>
          <ToonInput
            autoComplete="username"
            leftIcon={<Mail size={16} />}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ban@vidu.com"
          />
        </ToonField>
        <ToonField label="Mật khẩu" error={pwError}>
          <AuthPassword
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ToonField>
        <div className="-mt-2 text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-toon-ink-soft underline underline-offset-4"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <ToonButton
          type="submit"
          size="lg"
          block
          loading={signIn.isPending}
          loadingText="Đang đăng nhập…"
          leftIcon={<LogIn size={18} />}
        >
          Đăng nhập
        </ToonButton>
        <GoogleButton onDone={() => navigate(from, { replace: true })} />
      </form>
    </AuthLayout>
  );
}
