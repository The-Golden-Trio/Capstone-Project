import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { AuthShell, Field } from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { Note, SourceNote } from '../../components/ui/Note';
import { useAuthStore } from '../../store/authStore';

/**
 * Màn đồng ý của người giám hộ cho tài khoản dưới 16 tuổi.
 *
 * Nói thẳng ra rằng đây là bản ghi nhận, không phải xác minh: bản đồ án chưa
 * có kênh kiểm chứng danh tính người giám hộ, và giấu điều đó đi thì tệ hơn
 * nhiều so với ghi rõ.
 */
export function ConsentPage() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);

  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === 'anon') return <Navigate to="/login" replace />;
  if (user && user.consentStatus !== 'pending') return <Navigate to="/jobs" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      setUser(await authApi.consent({ guardianName, guardianEmail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không ghi nhận được');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Cần người lớn đồng ý" subtitle="Một bước nữa thôi">
      <Note className="mb-4">
        Tài khoản của bạn dưới 16 tuổi, nên cần thông tin của bố mẹ hoặc người
        giám hộ trước khi bắt đầu.
      </Note>

      {error && (
        <Note tone="warn" className="mb-4">
          {error}
        </Note>
      )}

      <form onSubmit={submit}>
        <Field
          label="Tên bố mẹ / người giám hộ"
          name="guardianName"
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          maxLength={64}
          autoFocus
        />
        <Field
          label="Email của người giám hộ"
          name="guardianEmail"
          type="email"
          value={guardianEmail}
          onChange={(e) => setGuardianEmail(e.target.value)}
          autoComplete="email"
        />

        <SourceNote className="mb-4">
          Bản demo này <b>ghi nhận</b> sự đồng ý chứ chưa xác minh được danh
          tính người giám hộ. Một hệ thống chạy thật cần quy trình đồng ý kiểm
          chứng được theo Nghị định 13/2023/NĐ-CP.
        </SourceNote>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={busy || !guardianName || !guardianEmail}
        >
          {busy ? 'Đang ghi nhận…' : 'Xác nhận và bắt đầu'}
        </Button>
      </form>
    </AuthShell>
  );
}
