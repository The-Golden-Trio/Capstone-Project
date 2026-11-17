import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ToonButton, ToonField, toonButtonClasses } from '@datn/ui';
import { api } from '../../api';
import { errorText } from '../../api/hooks';
import { AuthLayout, AuthNotice, AuthPassword } from './AuthLayout';

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
        <AuthNotice tone="warning" title="Đường dẫn thiếu mã">
          Bạn mở lại đường dẫn trong thư, hoặc xin một đường dẫn mới.
        </AuthNotice>
      ) : reset.isSuccess ? (
        <div className="flex flex-col gap-5">
          <AuthNotice tone="success" title="Đã đổi mật khẩu">
            Các phiên đăng nhập cũ đã đóng. Bạn đăng nhập lại bằng mật khẩu mới
            nhé.
          </AuthNotice>
          <Link
            to="/sign-in"
            className={toonButtonClasses({ size: 'lg', block: true })}
          >
            Đăng nhập
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {reset.isError && (
            <AuthNotice tone="danger">
              {errorText(reset.error)}{' '}
              <Link to="/forgot-password" className="underline">
                Xin đường dẫn mới
              </Link>
            </AuthNotice>
          )}
          <ToonField label="Mật khẩu mới" error={short}>
            <AuthPassword
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </ToonField>
          <ToonField label="Nhập lại" error={mismatch}>
            <AuthPassword
              autoComplete="new-password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
            />
          </ToonField>
          <ToonButton type="submit" size="lg" block loading={reset.isPending}>
            Lưu mật khẩu
          </ToonButton>
        </form>
      )}
    </AuthLayout>
  );
}
