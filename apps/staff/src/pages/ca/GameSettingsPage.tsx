import { useState } from 'react';
import {
  Badge,
  Button,
  Callout,
  Field,
  Input,
  Panel,
  Textarea,
} from '@datn/ui';
import { caDemo } from '../../api/ca-extra.demo';
import { CaWorkspace } from '../../features/catalogue/CaWorkspace';
import { formatDate } from '../../features/catalogue/format';
import {
  parameters,
  validateSettings,
  type SettingsValues,
} from '../../features/settings/gameSettings';
import { messageOf } from '../../api/client';

export function GameSettingsPage() {
  const [versions, setVersions] = useState(caDemo.settingsVersions);
  const [values, setValues] = useState<SettingsValues>(() => ({
    ...versions[0].values,
  }));
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const groups = [...new Set(parameters.map((p) => p.group))];
  return (
    <CaWorkspace
      code="C11 · ĐỀ XUẤT"
      title="Cài đặt game"
      description="Đề xuất — chờ nhóm duyệt. C11 chưa có trong SITE-02 và chưa có API lưu cấu hình game."
      demo
    >
      <Callout
        tone="warning"
        title="Chỉ áp dụng cho lượt chơi mới — quy tắc đề xuất"
      >
        Cấu hình được lưu thành phiên bản mới, không ghi đè phiên bản cũ. Màn
        này chỉ mô phỏng việc quản lý cấu hình; chưa thay đổi engine hay lượt
        chơi thực tế.
      </Callout>
      <Callout title="Giá trị đang xem là bản chụp nguồn">
        Các tham số có thể còn tạm theo tài liệu. Mặc định trong code không xác
        nhận cấu hình môi trường đang chạy. Dùng dấu chấm cho số thập phân và
        dấu phẩy để ngăn các giá trị.
      </Callout>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(false);
          setMessage('');
          const validation = validateSettings(values);
          setErrors(validation);
          if (Object.keys(validation).length) {
            setMessage('Kiểm tra các tham số được đánh dấu bên dưới.');
            return;
          }
          try {
            const next = caDemo.saveSettingsVersion(
              values,
              reason,
              versions[0].version,
            );
            setVersions(caDemo.settingsVersions());
            setValues({ ...next.values });
            setReason('');
            setSaved(true);
            setMessage(
              `Đã lưu phiên bản mẫu v${next.version}. Chưa áp dụng vào runtime.`,
            );
          } catch (error) {
            setMessage(messageOf(error));
          }
        }}
      >
        <Panel
          variant="solid"
          className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3"
          padding="sm"
        >
          <div className="flex items-center gap-3">
            <Badge>Đang soạn từ v{versions[0].version}</Badge>
            <span className="text-xs text-ink-muted">
              {parameters.length} tham số · lưu theo phiên bản
            </span>
          </div>
          <Button type="submit">Lưu thành phiên bản mới</Button>
        </Panel>
        {message && (
          <div role={saved ? 'status' : 'alert'}>
            <Callout tone={saved ? 'success' : 'danger'}>{message}</Callout>
          </div>
        )}
        {groups.map((group) => (
          <Panel key={group} variant="solid">
            <h2 className="mb-5 font-display text-2xl">{group}</h2>
            <div className="divide-y divide-line">
              {parameters
                .filter((parameter) => parameter.group === group)
                .map((parameter) => (
                  <div
                    key={parameter.id}
                    className="grid gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_260px]"
                  >
                    <div>
                      <h3 className="font-sans text-sm font-semibold">
                        {parameter.label}
                      </h3>
                      <p className="mt-2 text-sm text-ink-muted">
                        {parameter.explanation}
                      </p>
                      <p className="mt-2 text-xs text-info">
                        Nguồn: {parameter.source}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        Giá trị tại nguồn: {parameter.initial || 'Chưa chốt'} ·
                        Phiên bản hiện tại:{' '}
                        {versions[0].values[parameter.id] || 'Chưa chốt'}
                      </p>
                    </div>
                    <Field
                      label={`Giá trị · ${parameter.unit}`}
                      error={errors[parameter.id]}
                    >
                      <Input
                        inputMode={parameter.count ? 'text' : 'decimal'}
                        value={values[parameter.id]}
                        placeholder={parameter.initial || 'Chưa chốt'}
                        onChange={(e) =>
                          setValues((previous) => ({
                            ...previous,
                            [parameter.id]: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                ))}
            </div>
          </Panel>
        ))}
        <Panel variant="solid">
          <Field
            label="Lý do thay đổi"
            required
            hint="Ghi căn cứ hoặc kết quả chơi thử, không ghi phê duyệt chưa có."
          >
            <Textarea
              required
              maxLength={2000}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        </Panel>
      </form>
      <Panel variant="solid">
        <h2 className="mb-4 font-display text-2xl">
          Lịch sử cấu hình · chỉ thêm phiên bản
        </h2>
        <ol className="space-y-3">
          {versions.map((version) => (
            <li
              key={version.version}
              className="rounded-md border border-line p-4"
            >
              <div className="flex items-center gap-3">
                <Badge>v{version.version}</Badge>
                <span className="text-xs text-ink-muted">
                  {version.createdAt
                    ? formatDate(version.createdAt)
                    : 'Bản chụp ban đầu'}
                </span>
              </div>
              <p className="my-2 text-sm">{version.reason}</p>
              {version.changes.length ? (
                <ul className="space-y-1 text-xs text-ink-muted">
                  {version.changes.map((change) => (
                    <li key={change.id}>
                      {parameters.find((p) => p.id === change.id)?.label}:{' '}
                      {change.before || 'Chưa chốt'} →{' '}
                      {change.after || 'Chưa chốt'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-ink-muted">
                  Giá trị ban đầu được ghi trong từng tham số ở trên.
                </p>
              )}
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-info">
                  Xem bản chụp đầy đủ v{version.version}
                </summary>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {parameters.map((parameter) => (
                    <div key={parameter.id}>
                      <dt className="text-ink-muted">{parameter.label}</dt>
                      <dd>
                        {version.values[parameter.id] || 'Chưa chốt'}{' '}
                        {parameter.unit}
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            </li>
          ))}
        </ol>
      </Panel>
    </CaWorkspace>
  );
}
