import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeOff, LogOut, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ToonButton,
  ToonBadge,
  ConfirmDialog,
  ToonField,
  ToonInput,
  LoadingBlock,
  useToast,
} from '@datn/ui';
import {
  Notice,
  Foldout,
  EmptyMessage,
  FormHeading,
  PaperCard,
  CardHeading,
  ToonPassword,
  ToonSelect,
  ReadMore,
} from '../profile/ProfileKit';
import { ProfileCanvas } from '../profile/ProfileKit';

import { api } from '../../api';
import { errorText, keys, useMe, useSignOut } from '../../api/hooks';
import { useSession } from '../../api/session';
import type { Me } from '../../api/types';

export default function SettingsPage() {
  const me = useMe();
  if (me.isError)
    return (
      <EmptyMessage
        title="Chưa tải được tài khoản"
        description={errorText(me.error)}
        action={
          <ToonButton onClick={() => void me.refetch()}>Thử lại</ToonButton>
        }
      />
    );
  if (!me.data) return <LoadingBlock text="Đang mở cài đặt…" />;
  return <SettingsForm key={me.data.id} me={me.data} />;
}
function SettingsForm({ me }: { me: Me }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const signOut = useSignOut();
  const [displayName, setDisplayName] = useState(me.displayName);
  const [stage, setStage] = useState<Me['stage']>(me.stage);
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const save = useMutation({
    mutationFn: () =>
      api.account.updateMe({ displayName: displayName.trim(), stage }),
    onSuccess: (data) => {
      qc.setQueryData(keys.me, data);
      toast({ tone: 'success', title: 'Đã lưu hồ sơ' });
    },
  });
  const change = useMutation({
    mutationFn: () =>
      api.account.changePassword(
        passwords.current || undefined,
        passwords.next,
      ),
    onSuccess: () => {
      setPasswords({ current: '', next: '', confirm: '' });
      toast({ tone: 'success', title: 'Đã đổi mật khẩu' });
    },
  });
  const remove = useMutation({
    mutationFn: () => api.account.deleteAccount(),
    onSuccess: () => {
      useSession.getState().clear();
      qc.clear();
      navigate('/', { replace: true });
    },
  });
  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    if (
      (!me.hasGoogle && !passwords.current) ||
      passwords.next.length < 8 ||
      passwords.next !== passwords.confirm
    ) {
      setPasswordError(
        'Nhập mật khẩu hiện tại và mật khẩu mới ít nhất 8 ký tự; hai ô mật khẩu mới phải giống nhau.',
      );
      return;
    }
    setPasswordError('');
    change.mutate();
  };
  return (
    <ProfileCanvas narrow>
      <FormHeading
        eyebrow="Góc riêng của bạn"
        title="Cài đặt tài khoản"
        description="Bạn quản lý tài khoản."
      />
      <PaperCard>
        <CardHeading title="Hồ sơ" />
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (displayName.trim()) save.mutate();
          }}
        >
          <ToonField label="Tên hiển thị">
            <ToonInput
              required
              maxLength={80}
              autoComplete="nickname"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </ToonField>
          <ToonField label="Giai đoạn đang ở">
            <ToonSelect
              value={stage ?? ''}
              onChange={(event) =>
                setStage((event.target.value || null) as Me['stage'])
              }
            >
              <option value="">Chưa chọn</option>
              <option value="hoc_sinh">Học sinh</option>
              <option value="sinh_vien">Sinh viên</option>
              <option value="moi_di_lam">Mới đi làm</option>
              <option value="chuyen_nghe">Đang chuyển nghề</option>
            </ToonSelect>
          </ToonField>
          {save.isError && (
            <Notice tone="danger">{errorText(save.error)}</Notice>
          )}
          <ToonButton
            type="submit"
            loading={save.isPending}
            disabled={!displayName.trim()}
          >
            Lưu hồ sơ
          </ToonButton>
        </form>
      </PaperCard>
      {/* Bốn phần còn lại là bốn dòng gập trong một thẻ, mỗi dòng một ký hiệu. */}
      <PaperCard className="px-4 py-2 sm:px-6">
        <div className="toon-rows">
          <Foldout title="Bảo mật" icon={<ShieldCheck size={18} />}>
            <p className="mb-5 text-sm text-toon-ink-soft">
              Google{' '}
              <ToonBadge tone={me.hasGoogle ? 'mint' : 'paper'}>
                {me.hasGoogle ? 'Đã liên kết' : 'Chưa liên kết'}
              </ToonBadge>
            </p>
            <form className="space-y-4" onSubmit={changePassword}>
              <ToonField
                label="Mật khẩu hiện tại"
                hint={
                  me.hasGoogle
                    ? 'Nếu chỉ đăng nhập bằng Google, có thể để trống.'
                    : undefined
                }
              >
                <ToonPassword
                  autoComplete="current-password"
                  value={passwords.current}
                  onChange={(event) =>
                    setPasswords({ ...passwords, current: event.target.value })
                  }
                />
              </ToonField>
              <ToonField label="Mật khẩu mới" hint="Ít nhất 8 ký tự.">
                <ToonPassword
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwords.next}
                  onChange={(event) =>
                    setPasswords({ ...passwords, next: event.target.value })
                  }
                />
              </ToonField>
              <ToonField label="Nhập lại mật khẩu mới">
                <ToonPassword
                  required
                  autoComplete="new-password"
                  value={passwords.confirm}
                  onChange={(event) =>
                    setPasswords({ ...passwords, confirm: event.target.value })
                  }
                />
              </ToonField>
              {passwordError && <Notice tone="danger">{passwordError}</Notice>}
              {change.isError && (
                <Notice tone="danger">{errorText(change.error)}</Notice>
              )}
              <ToonButton
                type="submit"
                variant="secondary"
                loading={change.isPending}
              >
                Đổi mật khẩu
              </ToonButton>
            </form>
          </Foldout>
          <Foldout title="Quyền riêng tư" icon={<EyeOff size={18} />}>
            <p className="mb-4 text-sm text-toon-ink-soft">
              Hành trang chỉ dành cho bạn xem.
            </p>
            <ul className="mb-4 space-y-3 text-sm text-toon-ink-soft">
              <li>
                Thông tin tài khoản để đăng nhập; ngày sinh để xác định chòm sao
                và xử lý đồng ý theo độ tuổi.
              </li>
              <li>
                Lựa chọn và lịch sử ca làm để lưu tiến độ, điểm kỹ năng và giúp
                bạn xem lại điều đã làm.
              </li>
              <li>
                <ReadMore text="18 thẻ Get to know me để phác điểm xuất phát và vùng nghề có thể thử. Mục tiêu, sở thích và phần kể thêm chỉ để bạn tự nhìn lại và để nhân vật động viên khi chơi, không dùng để gợi ý nghề. Bạn có thể xoá phần kể về bạn." />
              </li>
            </ul>
            <Link
              to="/profile?tab=nhat-ky#quyen-rieng-tu"
              className="text-sm underline underline-offset-4"
            >
              Xoá phần kể về bạn
            </Link>
            <Notice tone="ai" className="mt-5">
              <ReadMore text="AI dẫn chuyện và chấm câu trả lời trong ca làm. Chữ tự do và mục tiêu có thể được gửi tới nhà cung cấp model để tạo nhận xét. Kết quả chỉ là thông tin tham khảo từ việc chơi." />
            </Notice>
          </Foldout>
          <Foldout
            title="Vùng nguy hiểm"
            defaultOpen={false}
            icon={<TriangleAlert size={18} className="text-toon-coral" />}
          >
            <p className="mb-4 text-sm text-toon-ink-soft">
              Xoá tài khoản là thao tác không thể hoàn tác.
            </p>
            <ToonButton
              variant="danger"
              onClick={() => {
                setDeleting(true);
                setConfirmation('');
                setDeleteError('');
              }}
            >
              Xoá tài khoản
            </ToonButton>
          </Foldout>
          <Foldout
            title="Đăng xuất"
            defaultOpen={false}
            icon={<LogOut size={18} />}
          >
            <p className="mb-4 text-sm text-toon-ink-soft">
              Bạn có thể quay lại để tiếp tục hành trình.
            </p>
            {signOut.isError && (
              <Notice tone="danger">{errorText(signOut.error)}</Notice>
            )}
            <ToonButton
              variant="ghost"
              loading={signOut.isPending}
              onClick={() =>
                signOut.mutate(undefined, { onSettled: () => navigate('/') })
              }
            >
              Đăng xuất
            </ToonButton>
          </Foldout>
        </div>
      </PaperCard>
      <ConfirmDialog
        theme="toon"
        open={deleting}
        onClose={() => {
          if (!remove.isPending) setDeleting(false);
        }}
        title="Xoá tài khoản?"
        tone="danger"
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        description="Tài khoản và dữ liệu gắn với tài khoản sẽ bị xoá. Gõ XOÁ để xác nhận."
        onConfirm={() => {
          if (confirmation !== 'XOÁ') {
            setDeleteError('Bạn cần gõ chính xác XOÁ.');
            return;
          }
          remove.mutate();
        }}
      >
        <ToonField label="Gõ XOÁ" error={deleteError}>
          <ToonInput
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </ToonField>
        {remove.isError && (
          <Notice tone="danger" className="mt-4">
            {errorText(remove.error)}
          </Notice>
        )}
      </ConfirmDialog>
    </ProfileCanvas>
  );
}
