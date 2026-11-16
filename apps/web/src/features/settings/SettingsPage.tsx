import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Badge,
  Callout,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  PageHeader,
  Panel,
  PanelHeader,
  PasswordInput,
  Select,
  useToast,
} from '@datn/ui';
import { api } from '../../api';
import { errorText, keys, useMe, useSignOut } from '../../api/hooks';
import { useSession } from '../../api/session';
import type { Me } from '../../api/types';

export default function SettingsPage() {
  const me = useMe();
  if (me.isError)
    return (
      <EmptyState
        title="Chưa tải được tài khoản"
        description={errorText(me.error)}
        action={<Button onClick={() => void me.refetch()}>Thử lại</Button>}
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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      <PageHeader
        eyebrow="Góc riêng của bạn"
        title="Cài đặt tài khoản"
        description="Bạn quyết định cách mình xuất hiện và những điều muốn giữ lại."
      />
      <Panel padding="lg">
        <PanelHeader title="Hồ sơ" />
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (displayName.trim()) save.mutate();
          }}
        >
          <Field label="Tên hiển thị">
            <Input
              required
              maxLength={80}
              autoComplete="nickname"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </Field>
          <Field label="Giai đoạn đang ở">
            <Select
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
            </Select>
          </Field>
          {save.isError && (
            <Callout tone="danger">{errorText(save.error)}</Callout>
          )}
          <Button
            type="submit"
            loading={save.isPending}
            disabled={!displayName.trim()}
          >
            Lưu hồ sơ
          </Button>
        </form>
      </Panel>
      <Panel padding="lg">
        <PanelHeader title="Bảo mật" />
        <p className="mb-5 text-sm text-ink-muted">
          Google{' '}
          <Badge tone={me.hasGoogle ? 'success' : 'muted'}>
            {me.hasGoogle ? 'Đã liên kết' : 'Chưa liên kết'}
          </Badge>
        </p>
        <form className="space-y-4" onSubmit={changePassword}>
          <Field
            label="Mật khẩu hiện tại"
            hint={
              me.hasGoogle
                ? 'Nếu chỉ đăng nhập bằng Google, có thể để trống.'
                : undefined
            }
          >
            <PasswordInput
              autoComplete="current-password"
              value={passwords.current}
              onChange={(event) =>
                setPasswords({ ...passwords, current: event.target.value })
              }
            />
          </Field>
          <Field label="Mật khẩu mới" hint="Ít nhất 8 ký tự.">
            <PasswordInput
              required
              minLength={8}
              autoComplete="new-password"
              value={passwords.next}
              onChange={(event) =>
                setPasswords({ ...passwords, next: event.target.value })
              }
            />
          </Field>
          <Field label="Nhập lại mật khẩu mới">
            <PasswordInput
              required
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(event) =>
                setPasswords({ ...passwords, confirm: event.target.value })
              }
            />
          </Field>
          {passwordError && <Callout tone="danger">{passwordError}</Callout>}
          {change.isError && (
            <Callout tone="danger">{errorText(change.error)}</Callout>
          )}
          <Button type="submit" variant="secondary" loading={change.isPending}>
            Đổi mật khẩu
          </Button>
        </form>
      </Panel>
      <Panel padding="lg">
        <PanelHeader
          title="Quyền riêng tư"
          description="Hành trang chỉ dành cho bạn xem."
        />
        <ul className="mb-4 space-y-3 text-sm text-ink-muted">
          <li>
            Thông tin tài khoản để đăng nhập; ngày sinh để xác định chòm sao và
            xử lý đồng ý theo độ tuổi.
          </li>
          <li>
            Lựa chọn và lịch sử ca làm để lưu tiến độ, điểm kỹ năng và giúp bạn
            xem lại điều đã làm.
          </li>
          <li>
            18 thẻ Get to know me để phác điểm xuất phát và vùng nghề nên thử.
            Mục tiêu, sở thích và phần kể thêm chỉ để bạn tự nhìn lại và để nhân
            vật động viên khi chơi, không dùng để gợi ý nghề. Bạn có thể xoá
            phần kể về bạn.
          </li>
        </ul>
        <Link
          to="/profile?tab=nhat-ky#quyen-rieng-tu"
          className="text-sm underline underline-offset-4"
        >
          Xoá phần kể về bạn
        </Link>
        <Callout tone="ai" className="mt-5">
          AI dẫn chuyện và chấm câu trả lời trong ca làm. Chữ tự do và mục tiêu
          có thể được gửi tới nhà cung cấp model để tạo nhận xét. Kết quả chỉ là
          thông tin tham khảo từ việc chơi.
        </Callout>
      </Panel>
      <Panel padding="lg">
        <PanelHeader
          title="Vùng nguy hiểm"
          description="Xoá tài khoản là thao tác không thể hoàn tác."
        />
        <Button
          variant="danger"
          onClick={() => {
            setDeleting(true);
            setConfirmation('');
            setDeleteError('');
          }}
        >
          Xoá tài khoản
        </Button>
      </Panel>
      <Panel>
        <PanelHeader
          title="Đăng xuất"
          description="Bạn có thể quay lại để tiếp tục hành trình."
        />
        {signOut.isError && (
          <Callout tone="danger">{errorText(signOut.error)}</Callout>
        )}
        <Button
          variant="ghost"
          loading={signOut.isPending}
          onClick={() =>
            signOut.mutate(undefined, { onSettled: () => navigate('/') })
          }
        >
          Đăng xuất
        </Button>
      </Panel>
      <ConfirmDialog
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
        <Field label="Gõ XOÁ" error={deleteError}>
          <Input
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </Field>
        {remove.isError && (
          <Callout tone="danger" className="mt-4">
            {errorText(remove.error)}
          </Callout>
        )}
      </ConfirmDialog>
    </div>
  );
}
