import {
  Badge,
  Button,
  Callout,
  ConfirmDialog,
  Field,
  Input,
  Panel,
  Textarea,
} from '@datn/ui';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { caExtra, type Release } from '../../api/ca-extra';
import {
  CaWorkspace,
  ResourceState,
  useCaMutation,
  useCaResource,
} from '../../features/catalogue/CaWorkspace';
import { formatDate } from '../../features/catalogue/format';

export function PublishScenarioPage() {
  const { scenarioId = '' } = useParams();
  return <PublishScenario key={scenarioId} scenarioId={scenarioId} />;
}
function PublishScenario({ scenarioId }: { scenarioId: string }) {
  const loader = useCallback(
    () => caExtra.publishPreview(scenarioId),
    [scenarioId],
  );
  const resource = useCaResource(loader);
  const mutation = useCaMutation();
  const [note, setNote] = useState('');
  const [effective, setEffective] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [release, setRelease] = useState<Release>();
  const [mutationDemo, setMutationDemo] = useState(false);
  const preview = resource.result?.data;
  const demo = mutationDemo || (resource.result?.demo ?? false);
  const gates = preview
    ? [
        {
          label: 'Chuyên gia đã duyệt nội dung · BR-05',
          passed: preview.approved,
        },
        { label: 'Bản dựng đã sẵn sàng', passed: preview.buildReady },
        { label: 'Đã đạt play-test', passed: preview.playtestDone },
        { label: 'Kiểm nội dung đạt', passed: preview.checksPassed },
      ]
    : [];
  const history = [...(release ? [release] : []), ...(preview?.releases ?? [])];
  const ready =
    gates.length === 4 && gates.every((g) => g.passed) && !history.length;
  return (
    <CaWorkspace
      code="C08"
      title="Xuất bản scenario"
      description="Phát hành bản dựng đã qua duyệt và play-test. Mỗi release là một phiên bản bất biến theo SM-01."
      demo={demo}
    >
      <ResourceState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      {preview && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Panel variant="solid" className="space-y-5">
            <h2 className="font-display text-xl">Điều kiện phát hành</h2>
            <p>{preview.title}</p>
            <ul className="divide-y divide-line">
              {gates.map((gate) => (
                <li key={gate.label} className="flex items-center gap-3 py-3">
                  <span
                    aria-hidden
                    className={gate.passed ? 'text-success' : 'text-ink-muted'}
                  >
                    {gate.passed ? '✓' : '○'}
                  </span>
                  <span>{gate.label}</span>
                  <span className="sr-only">
                    {gate.passed ? 'Đạt' : 'Chưa xác nhận'}
                  </span>
                </li>
              ))}
            </ul>
            {!demo && (
              <Callout>
                Checklist được suy từ trạng thái READY của SM-01. API chưa cung
                cấp bằng chứng riêng từng mục hoặc danh sách release; máy chủ
                kiểm tra lại khi phát hành.
              </Callout>
            )}
          </Panel>
          <Panel variant="solid">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setConfirm(true);
              }}
            >
              <h2 className="font-display text-xl">Thông tin phát hành</h2>
              <Badge>Phiên bản nội dung: {preview.version}</Badge>
              <p className="text-xs text-ink-muted">
                Số phiên bản release chính thức do máy chủ cấp.
              </p>
              <Field label="Ghi chú phát hành">
                <Textarea
                  rows={6}
                  maxLength={2000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
              <Field
                label="Thời điểm hiệu lực"
                hint="Để trống để phát hành ngay. Chọn thời điểm tương lai để lên lịch."
              >
                <Input
                  type="datetime-local"
                  value={effective}
                  onChange={(e) => setEffective(e.target.value)}
                />
              </Field>
              <Button type="submit" disabled={!ready || mutation.busy}>
                Xuất bản phiên bản mới
              </Button>
              {!ready && (
                <p className="text-sm text-ink-muted">
                  Chỉ phát hành khi đủ bốn điều kiện và bản dựng chưa có
                  release.
                </p>
              )}
            </form>
          </Panel>
          <Panel variant="paper" className="space-y-3 lg:col-span-2">
            <h2 className="font-display text-xl">Xem trước ghi chú</h2>
            <p className="whitespace-pre-wrap">
              {note || 'Chưa có ghi chú phát hành.'}
            </p>
          </Panel>
          <Panel variant="solid" className="lg:col-span-2">
            <h2 className="mb-4 font-display text-xl">
              Lịch sử release · chỉ đọc
            </h2>
            {!history.length ? (
              <p className="text-sm text-ink-muted">
                {demo
                  ? 'Bản dựng mẫu chưa phát hành.'
                  : 'Chưa có endpoint đọc lịch sử release. Release vừa tạo trong phiên này sẽ xuất hiện tại đây.'}
              </p>
            ) : (
              <ol className="space-y-3">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-line p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <strong>{item.version}</strong>
                      <Badge
                        tone={item.status === 'PUBLISHED' ? 'success' : 'info'}
                      >
                        {item.status}
                      </Badge>
                      <span className="text-xs">
                        Hiệu lực {formatDate(item.effectiveFrom)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {item.releaseNote || 'Không có ghi chú'}
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-ink-muted">
                      Build: {item.buildId} · Release: {item.id}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      )}
      {mutation.error && (
        <div role="alert">
          <Callout tone="danger">{mutation.error}</Callout>
        </div>
      )}
      <ConfirmDialog
        open={confirm}
        title="Xác nhận phát hành scenario?"
        description={preview?.title}
        confirmLabel="Xuất bản"
        loading={mutation.busy}
        onClose={() => setConfirm(false)}
        onConfirm={() =>
          void mutation.run(async () => {
            const effectiveFrom = effective
              ? new Date(effective).toISOString()
              : new Date().toISOString();
            const response = await caExtra.publish(
              scenarioId,
              { effectiveFrom, releaseNote: note },
              demo,
            );
            setRelease(response.data);
            setMutationDemo(response.demo);
            setConfirm(false);
          })
        }
      >
        <p>
          Nội dung release được đóng băng. Thay đổi tiếp theo cần một phiên bản
          mới; lượt chơi đã bắt đầu giữ nội dung phiên bản cũ.
        </p>
        {mutation.error && (
          <div role="alert">
            <Callout tone="danger">{mutation.error}</Callout>
          </div>
        )}
      </ConfirmDialog>
    </CaWorkspace>
  );
}
