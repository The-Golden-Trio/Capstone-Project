import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Callout, Field, PasswordInput, buttonClasses } from '@datn/ui';
import { api } from '../../api';
import { errorText } from '../../api/hooks';
import { AuthLayout } from './AuthLayout';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [touched, setTouched] = useState(false);
  const reset = useMutation({
    mutationFn: () => api.auth.confirmPasswordReset(token, password),
  });

  const mismatch =
    touched && again !== password ? 'Hai mật khẩu chưa khớp.' : undefined;
  const short =
    touched && password.length < 8
      ? 'Mật khẩu cần ít nhất 8 ký tự.'
      : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (password.length >= 8 && password === again) reset.mutate();
  };

  return (
    <AuthLayout title="Đặt mật khẩu mới">
      {!token ? (
        <Callout tone="warning" title="Đường dẫn thiếu mã">
          Bạn mở lại đường dẫn trong thư, hoặc xin một đường dẫn mới.
        </Callout>
      ) : reset.isSuccess ? (
        <div className="flex flex-col gap-5">
          <Callout tone="success" title="Đã đổi mật khẩu">
            Các phiên đăng nhập cũ đã đóng. Bạn đăng nhập lại bằng mật khẩu mới
            nhé.
          </Callout>
          <Link
            to="/sign-in"
            className={buttonClasses({ size: 'lg', block: true })}
          >
            Đăng nhập
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {reset.isError && (
            <Callout tone="danger">
              {errorText(reset.error)}{' '}
              <Link to="/forgot-password" className="underline">
                Xin đường dẫn mới
              </Link>
            </Callout>
          )}
          <Field label="Mật khẩu mới" error={short}>
            <PasswordInput
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Nhập lại" error={mismatch}>
            <PasswordInput
              autoComplete="new-password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" block loading={reset.isPending}>
            Lưu mật khẩu
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
