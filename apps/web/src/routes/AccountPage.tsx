import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Note, SourceNote } from '../components/ui/Note';
import { Pill } from '../components/ui/Pill';
import { Field } from '../components/auth/AuthShell';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

const ROLE_LABEL: Record<string, string> = {
  USER: 'Học sinh / Phụ huynh',
  CONTRIBUTOR: 'Cố vấn / Cựu sinh viên',
  ADMIN: 'Quản trị viên',
};

const CONSENT_LABEL: Record<string, string> = {
  not_required: 'Không cần (từ 16 tuổi trở lên)',
  pending: 'Đang chờ người giám hộ',
  granted: 'Đã có người giám hộ đồng ý',
};

/** "Tài khoản" — danh tính. Tiến trình chơi nằm ở trang Hành trang. */
export function AccountPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const resetProfile = useProfileStore((s) => s.reset);
  const resetProgress = useProgressStore((s) => s.reset);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const run = async (action: () => Promise<void>) => {
    setMessage(null);
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thực hiện được');
    } finally {
      setBusy(false);
    }
  };

  const saveDetails = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      setUser(await authApi.updateAccount({ displayName, email }));
      setMessage('Đã lưu thông tin tài khoản');
    });
  };

  const savePassword = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await authApi.changePassword({
        currentPassword: user.hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      // Đổi mật khẩu thu hồi mọi phiên, kể cả phiên đang mở.
      setMessage('Đã đổi mật khẩu. Hãy đăng nhập lại.');
      await logout();
      navigate('/login');
    });
  };

  const signOut = () =>
    run(async () => {
      await logout();
      resetProfile();
      resetProgress();
      navigate('/login');
    });

  const removeAccount = () =>
    run(async () => {
      if (
        !window.confirm(
          'Xoá tài khoản sẽ xoá luôn toàn bộ điểm kỹ năng và lịch sử chơi. Không khôi phục được. Tiếp tục?',
        )
      ) {
        return;
      }
      await authApi.deleteAccount();
      resetProfile();
      resetProgress();
      await logout();
      navigate('/register');
    });

  const googleLinked = user.linkedProviders.includes('google');

  return (
    <>
      <PageHeader title="Tài khoản">
        Thông tin đăng nhập và quyền riêng tư. Tiến trình chơi nằm ở trang Hành
        trang.
      </PageHeader>

      {message && (
        <Note tone="ok" className="mb-4">
          {message}
        </Note>
      )}
      {error && (
        <Note tone="warn" className="mb-4">
          {error}
        </Note>
      )}

      <Card className="mb-4">
        <CardHeader title="Hồ sơ">
          <Pill tone="gold">{ROLE_LABEL[user.role] ?? user.role}</Pill>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveDetails}>
            <Field
              label="Tên hiển thị"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={48}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.11em] text-muted">
              Tên đăng nhập: <span className="text-ink-2">{user.username}</span>{' '}
              · không đổi được
            </div>
            <Button type="submit" variant="primary" disabled={busy}>
              Lưu thay đổi
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Mật khẩu" />
        <CardBody>
          <form onSubmit={savePassword}>
            {user.hasPassword ? (
              <Field
                label="Mật khẩu hiện tại"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            ) : (
              <Note className="mb-3">
                Tài khoản này đang đăng nhập bằng Google. Đặt thêm mật khẩu thì
                bạn có hai cách vào.
              </Note>
            )}
            <Field
              label="Mật khẩu mới"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <SourceNote className="mb-3">
              Đổi mật khẩu sẽ thoát mọi thiết bị đang đăng nhập, kể cả thiết bị
              này.
            </SourceNote>
            <Button
              type="submit"
              variant="primary"
              disabled={busy || newPassword.length < 8}
            >
              {user.hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Đăng nhập bằng Google">
          <Pill tone={googleLinked ? 'good' : 'neutral'}>
            {googleLinked ? 'đã liên kết' : 'chưa liên kết'}
          </Pill>
        </CardHeader>
        <CardBody>
          {googleLinked ? (
            <>
              <p className="m-0 mb-3 text-[13px] text-ink-2">
                Bạn có thể đăng nhập bằng tài khoản Google này.
              </p>
              <Button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    setUser(await authApi.unlinkProvider('google'));
                    setMessage('Đã gỡ liên kết Google');
                  })
                }
              >
                Gỡ liên kết
              </Button>
              {!user.hasPassword && (
                <SourceNote className="mt-2.5">
                  Đây là cách đăng nhập duy nhất của bạn — hãy đặt mật khẩu
                  trước khi gỡ.
                </SourceNote>
              )}
            </>
          ) : (
            <p className="m-0 text-[13px] text-muted">
              Đăng xuất rồi đăng nhập bằng Google với cùng email sẽ tự liên kết
              vào tài khoản này.
            </p>
          )}
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Quyền riêng tư">
          <Pill
            tone={user.consentStatus === 'pending' ? 'signal' : 'neutral'}
          >
            {CONSENT_LABEL[user.consentStatus]}
          </Pill>
        </CardHeader>
        <CardBody>
          <SourceNote>
            Ngày sinh: {user.dateOfBirth ?? 'chưa khai'}. Dữ liệu cá nhân của
            người dưới 16 tuổi được xử lý theo Nghị định 13/2023/NĐ-CP; bản demo
            này ghi nhận sự đồng ý của người giám hộ chứ chưa xác minh.
          </SourceNote>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Kết thúc phiên" />
        <CardBody>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" onClick={signOut} disabled={busy}>
              Đăng xuất
            </Button>
            <Button onClick={removeAccount} disabled={busy}>
              Xoá tài khoản
            </Button>
          </div>
          <SourceNote className="mt-2.5">
            Xoá tài khoản là xoá hẳn: điểm kỹ năng, lịch sử chơi và chân dung
            đều mất, không khôi phục được.
          </SourceNote>
        </CardBody>
      </Card>
    </>
  );
}
