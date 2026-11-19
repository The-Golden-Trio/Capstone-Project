import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { ToonButton, ToonField, ToonInput } from '@datn/ui';
import { api } from '../../api';
import { errorText } from '../../api/hooks';
import { AuthLayout, AuthNotice } from './AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const invalid = !/^\S+@\S+\.\S+$/.test(email.trim());
  const send = useMutation({
    mutationFn: (e: string) => api.auth.requestPasswordReset(e),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (send.isPending) return;
    setTouched(true);
    if (invalid) {
      input.current?.focus();
      return;
    }
    send.mutate(email.trim());
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký, JobQuest gửi bạn một đường dẫn đặt lại mật khẩu, dùng một lần."
      footer={
        <Link
          to="/sign-in"
          className="font-semibold text-toon-ink underline decoration-2 underline-offset-4 hover:text-toon-maroon"
        >
          Quay lại đăng nhập
        </Link>
      }
    >
      {send.isSuccess ? (
        <AuthNotice tone="success" title="Đã gửi, bạn kiểm tra hộp thư nhé">
          Nếu email này có tài khoản, thư sẽ tới trong vài phút. Xem cả mục thư
          rác.
        </AuthNotice>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          {send.isError && (
            <AuthNotice tone="danger">{errorText(send.error)}</AuthNotice>
          )}
          <ToonField
            label="Email"
            error={touched && invalid ? 'Email chưa đúng dạng.' : undefined}
          >
            <ToonInput
              ref={input}
              readOnly={send.isPending}
              type="email"
              autoComplete="email"
              leftIcon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </ToonField>
          <ToonButton
            type="submit"
            size="lg"
            block
            loading={send.isPending}
            disabled={!email.trim()}
          >
            Gửi đường dẫn
          </ToonButton>
        </form>
      )}
    </AuthLayout>
  );
}
