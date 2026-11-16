import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Callout, Field, Input } from '@datn/ui';
import { api } from '../../api';
import { errorText } from '../../api/hooks';
import { AuthLayout } from './AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const send = useMutation({
    mutationFn: (e: string) => api.auth.requestPasswordReset(e),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) send.mutate(email.trim());
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký, JobQuest gửi bạn một đường dẫn đặt lại mật khẩu, dùng một lần."
      footer={
        <Link
          to="/sign-in"
          className="font-semibold text-gold-300 hover:text-gold-200"
        >
          Quay lại đăng nhập
        </Link>
      }
    >
      {send.isSuccess ? (
        <Callout tone="success" title="Đã gửi, bạn kiểm tra hộp thư nhé">
          Nếu email này có tài khoản, thư sẽ tới trong vài phút. Xem cả mục thư
          rác.
        </Callout>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          {send.isError && (
            <Callout tone="danger">{errorText(send.error)}</Callout>
          )}
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              leftIcon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            block
            loading={send.isPending}
            disabled={!email.trim()}
          >
            Gửi đường dẫn
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
