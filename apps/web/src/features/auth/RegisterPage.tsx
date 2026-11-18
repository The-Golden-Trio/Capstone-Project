import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Sparkles, UserRound } from 'lucide-react';
import { profile } from '@datn/game-core';
import { ToonButton, ToonCheckbox, ToonField, ToonInput } from '@datn/ui';
import { errorText, useRegister } from '../../api/hooks';
import { ApiError } from '../../api';
import { AuthLayout, AuthNotice, AuthPassword } from './AuthLayout';

const today = new Date().toISOString().slice(0, 10);

export default function RegisterPage() {
  const register = useRegister();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof typeof form | 'agree', string>> = {};
    if (!form.displayName.trim())
      e.displayName = 'Đặt một biệt danh để đồng nghiệp trong game gọi bạn.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = 'Email chưa đúng dạng.';
    if (form.password.length < 8) e.password = 'Mật khẩu cần ít nhất 8 ký tự.';
    if (!form.dateOfBirth) e.dateOfBirth = 'Bạn nhập ngày sinh nhé.';
    else if (form.dateOfBirth > today || form.dateOfBirth < '1900-01-01')
      e.dateOfBirth = 'Ngày sinh chưa hợp lệ.';
    if (!agree) e.agree = 'Bạn cần đồng ý để tạo tài khoản.';
    return e;
  }, [form, agree]);

  const server =
    register.error instanceof ApiError ? (register.error.fields ?? {}) : {};
  const show = (k: keyof typeof errors) =>
    (touched ? errors[k] : undefined) ?? server[k];
  const sign = profile.zodiacOf(form.dateOfBirth);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length) return;
    register.mutate(
      {
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
        dateOfBirth: form.dateOfBirth,
      },
      { onSuccess: () => navigate('/welcome', { replace: true }) },
    );
  };

  return (
    <AuthLayout
      title="Bắt đầu hành trình"
      subtitle="Lưu tiến độ và nhật ký ca làm."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link
            to="/sign-in"
            className="font-semibold text-toon-ink underline decoration-2 underline-offset-4 hover:text-toon-maroon"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {register.isError && !Object.keys(server).length && (
          <AuthNotice tone="danger">{errorText(register.error)}</AuthNotice>
        )}
        <ToonField
          label="Biệt danh"
          hint="Tên hiển thị trong game. Không cần tên thật."
          error={show('displayName')}
        >
          <ToonInput
            autoComplete="nickname"
            leftIcon={<UserRound size={16} />}
            value={form.displayName}
            onChange={set('displayName')}
            maxLength={80}
          />
        </ToonField>
        <ToonField label="Email" error={show('email')}>
          <ToonInput
            type="email"
            autoComplete="email"
            leftIcon={<Mail size={16} />}
            value={form.email}
            onChange={set('email')}
          />
        </ToonField>
        <ToonField
          label="Mật khẩu"
          hint="Ít nhất 8 ký tự. Một câu dài dễ nhớ an toàn hơn ký tự lạ."
          error={show('password')}
        >
          <AuthPassword
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
          />
        </ToonField>
        <ToonField
          label="Ngày sinh"
          hint={
            sign ? (
              <span className="inline-flex items-center gap-1 text-toon-ink-soft">
                <Sparkles size={12} aria-hidden /> Chòm sao của bạn: {sign.name}
              </span>
            ) : (
              'Dùng để tính chòm sao của bạn trong game và xét cần phụ huynh đồng ý không.'
            )
          }
          error={show('dateOfBirth')}
        >
          <ToonInput
            type="date"
            max={today}
            min="1900-01-01"
            value={form.dateOfBirth}
            onChange={set('dateOfBirth')}
          />
        </ToonField>
        <div>
          <ToonCheckbox
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            label="Mình hiểu màn chơi do AI dẫn dắt và chấm"
            description={
              <>
                <span className="block">
                  Câu bạn gõ được khử thông tin cá nhân trước khi gửi tới nhà
                  cung cấp mô hình.
                </span>
                <span className="mt-2 block">
                  Kết quả chỉ để tham khảo, không gửi cho trường hay nhà tuyển
                  dụng.
                </span>
              </>
            }
          />
          {show('agree') && (
            <p className="mt-1.5 text-xs text-toon-maroon" role="alert">
              {show('agree')}
            </p>
          )}
        </div>
        <ToonButton
          type="submit"
          size="lg"
          block
          loading={register.isPending}
          loadingText="Đang tạo tài khoản…"
        >
          Tạo tài khoản
        </ToonButton>
      </form>
    </AuthLayout>
  );
}
