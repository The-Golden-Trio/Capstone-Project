import { useState } from 'react';
import { Check, MoreHorizontal, Plus } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Callout,
  Checkbox,
  Chip,
  ConfirmDialog,
  Dialog,
  Field,
  IconButton,
  Input,
  Kbd,
  LikeScale,
  Menu,
  MoonPhase,
  PasswordInput,
  RadioCards,
  SegmentedControl,
  Select,
  Sheet,
  Stepper,
  Switch,
  TabPanel,
  Tabs,
  Tag,
  Textarea,
  Tooltip,
  useToast,
  type ToastTone,
} from '@datn/ui';
export function ButtonExamples() {
  return (
    <div className="space-y-8">
      {(['primary', 'secondary', 'ghost', 'subtle', 'danger'] as const).map(
        (variant) => (
          <section key={variant}>
            <h3 className="mb-4 font-mono text-sm text-ink-muted">{variant}</h3>
            <div className="space-y-4">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <div
                  key={size}
                  className="rounded-lg border border-line bg-night-950/25 p-3"
                >
                  <p className="mb-3 font-mono text-[10px] text-ink-faint">
                    {size} · thường / đang gửi / tạm khoá
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant={variant}
                      size={size}
                      leftIcon={<Plus size={15} />}
                    >
                      Thêm ghi chú
                    </Button>
                    <Button
                      variant={variant}
                      size={size}
                      loading
                      loadingText="Đang lưu…"
                    >
                      Lưu
                    </Button>
                    <Button variant={variant} size={size} disabled>
                      Chưa thể chọn
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ),
      )}
      <section>
        <h3 className="mb-4 text-lg">Nút biểu tượng</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {(['ghost', 'subtle', 'secondary'] as const).map((variant) => (
            <div key={variant} className="rounded-lg border border-line p-3">
              <p className="mb-3 font-mono text-[10px] text-ink-faint">
                {variant} · sm / md / lg
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <IconButton
                    key={size}
                    label={`Thêm · ${variant} · ${size}`}
                    icon={<Plus size={18} />}
                    size={size}
                    variant={variant}
                  />
                ))}
                <IconButton
                  label={`Tạm khoá · ${variant}`}
                  icon={<Plus size={18} />}
                  variant={variant}
                  disabled
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <p className="text-xs text-ink-faint">
        Rê chuột để xem hover; nhấn giữ để xem pressed; Tab để thấy vòng focus.
        Nhiều nút vàng ở đây chỉ để so mẫu.
      </p>
    </div>
  );
}

export function FormExamples() {
  const [checked, setChecked] = useState(true);
  const [note, setNote] = useState('');
  const [on, setOn] = useState(true);
  const [choice, setChoice] = useState('thu');
  const [like, setLike] = useState<1 | 2 | 3 | null>(2);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Field label="Biệt danh" hint="Tên bạn muốn đồng nghiệp gọi.">
          <Input placeholder="Ví dụ: An" />
        </Field>
        <Field label="Mật khẩu">
          <PasswordInput
            autoComplete="new-password"
            placeholder="Ít nhất 8 ký tự"
          />
        </Field>
        <Field label="Có lỗi cần sửa" error="Bạn chưa điền tên hiển thị.">
          <Input placeholder="Ô có lỗi" />
        </Field>
        <Field label="Ô tạm khoá">
          <Input disabled value="Chưa thể sửa" readOnly />
        </Field>
        <Field label="Lời nhắn" optional counter={`${note.length}/500`}>
          <Textarea
            placeholder="Kể một chút…"
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        <Field label="Giai đoạn">
          <Select defaultValue="sinh_vien">
            <option value="hoc_sinh">Học sinh</option>
            <option value="sinh_vien">Sinh viên</option>
          </Select>
        </Field>
      </div>
      <div className="space-y-6">
        <Checkbox
          label="Lưu lựa chọn của tôi"
          description="Có thể đổi bất cứ lúc nào."
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
        <Checkbox label="Lựa chọn tạm khoá" disabled />
        <Switch
          label="Hiện gợi ý"
          checked={on}
          onChange={setOn}
          description="Ví dụ tương tác, không lưu vào tài khoản."
        />
        <Switch
          label="Công tắc tạm khoá"
          checked={false}
          disabled
          onChange={() => undefined}
        />
        <RadioCards
          name="design-choice"
          label="Bạn muốn bắt đầu thế nào?"
          value={choice}
          onChange={setChoice}
          options={[
            {
              key: 'thu',
              label: 'Thử một nghề',
              description: 'Đi thẳng tới ngân hà.',
            },
            {
              key: 'ke',
              label: 'Kể về mình',
              description: 'Một bản nháp trước khi thử.',
            },
          ]}
        />
        <LikeScale
          value={like}
          onChange={setLike}
          label="Bạn thấy việc dò log thế nào?"
        />
        <div className="flex gap-5 text-gold-300">
          {([1, 2, 3] as const).map((value) => (
            <MoonPhase key={value} value={value} size={32} />
          ))}
        </div>
      </div>
    </div>
  );
}
export function LabelExamples() {
  const [selected, setSelected] = useState(true);
  const [tag, setTag] = useState(true);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            'neutral',
            'gold',
            'success',
            'warning',
            'danger',
            'info',
            'muted',
          ] as const
        ).map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Chip
          selected={selected}
          count={12}
          onClick={() => setSelected(!selected)}
        >
          Có màn chơi
        </Chip>
        {tag ? (
          <Tag onRemove={() => setTag(false)}>Đọc sách</Tag>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setTag(true)}>
            Thêm lại thẻ
          </Button>
        )}
        <Tag>Back-end</Tag>
        <Kbd>Esc</Kbd>
        <Kbd>⌘ K</Kbd>
      </div>
    </div>
  );
}
export function NavigationExamples() {
  const [tab, setTab] = useState('tong');
  const [view, setView] = useState('map');
  const items = [
    { key: 'tong', label: 'Tổng quan' },
    { key: 'ky', label: 'Nhật ký', count: 4 },
  ];
  return (
    <div className="space-y-7">
      <Breadcrumbs
        items={[
          { label: 'Ngân hà', href: '#vi-du' },
          { label: 'Back-end', href: '#vi-du' },
          { label: 'Cấp 1' },
        ]}
      />
      {(['underline', 'pill'] as const).map((variant) => (
        <div key={variant}>
          <Tabs
            idBase={`design-${variant}`}
            label={`Ví dụ tab ${variant}`}
            variant={variant}
            items={items}
            value={tab}
            onChange={setTab}
          />
          <TabPanel
            idBase={`design-${variant}`}
            tabKey={tab}
            active
            className="mt-3 text-sm text-ink-muted"
          >
            {tab === 'tong'
              ? 'Nội dung tổng quan mẫu.'
              : 'Bốn lần thử, bốn câu chuyện.'}
          </TabPanel>
        </div>
      ))}
      <SegmentedControl
        label="Cách xem mẫu"
        value={view}
        onChange={setView}
        options={[
          { key: 'map', label: 'Bản đồ' },
          { key: 'list', label: 'Danh sách' },
        ]}
      />
      <Stepper
        current={1}
        items={[
          { key: 'chon', label: 'Chọn nghề' },
          { key: 'thu', label: 'Thử ca' },
          { key: 'nhin', label: 'Nhìn lại' },
        ]}
      />
    </div>
  );
}
export function OverlayExamples() {
  const [open, setOpen] = useState<
    'dialog' | 'confirm' | 'right' | 'bottom' | null
  >(null);
  const { toast } = useToast();
  const done = () => {
    setOpen(null);
    toast({ tone: 'success', title: 'Đã xác nhận thao tác mẫu' });
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setOpen('dialog')}>
          Mở Dialog
        </Button>
        <Button variant="danger" onClick={() => setOpen('confirm')}>
          Mở ConfirmDialog
        </Button>
        <Button variant="subtle" onClick={() => setOpen('right')}>
          Sheet phải
        </Button>
        <Button variant="subtle" onClick={() => setOpen('bottom')}>
          Sheet dưới
        </Button>
        <Tooltip content="Thông tin bổ sung, có thể đóng bằng Esc">
          <Button variant="ghost">Rê hoặc focus vào đây</Button>
        </Tooltip>
        <Menu
          label="Menu mẫu"
          trigger={(props) => (
            <IconButton
              {...props}
              label="Mở tuỳ chọn"
              icon={<MoreHorizontal size={20} />}
            />
          )}
          items={[
            {
              key: 'save',
              label: 'Lưu mẫu',
              icon: <Check size={15} />,
              onSelect: done,
            },
            {
              key: 'delete',
              label: 'Xoá mẫu',
              danger: true,
              onSelect: () => setOpen('confirm'),
            },
          ]}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {(['info', 'success', 'warning', 'danger', 'gold'] as ToastTone[]).map(
          (tone) => (
            <Button
              key={tone}
              variant="ghost"
              size="sm"
              onClick={() =>
                toast({
                  tone,
                  title: `Thông báo · ${tone}`,
                  description: 'Một lời nhắn ngắn, không cắt ngang ca làm.',
                })
              }
            >
              Toast {tone}
            </Button>
          ),
        )}
      </div>
      <Dialog
        open={open === 'dialog'}
        onClose={() => setOpen(null)}
        title="Một khoảng dừng"
        description="Dùng khi cần tập trung vào một thao tác."
        footer={<Button onClick={done}>Đã hiểu</Button>}
      >
        <p className="text-sm text-ink-muted">
          Đây là hộp thoại minh hoạ. Escape hoặc nút đóng đưa bạn trở lại đúng
          chỗ.
        </p>
      </Dialog>
      <ConfirmDialog
        open={open === 'confirm'}
        onClose={() => setOpen(null)}
        title="Xoá bản nháp mẫu?"
        tone="danger"
        description="Ví dụ này chỉ thay đổi trạng thái giao diện."
        confirmLabel="Xoá mẫu"
        onConfirm={done}
      />
      <Sheet
        side={open === 'bottom' ? 'bottom' : 'right'}
        open={open === 'right' || open === 'bottom'}
        onClose={() => setOpen(null)}
        title="Thông tin bên cạnh"
      >
        <Callout tone="info">
          Dùng Sheet cho chi tiết cần mở nhanh rồi trở về màn chính.
        </Callout>
      </Sheet>
    </div>
  );
}
