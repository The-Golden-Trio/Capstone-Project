import { Badge, Button, Callout, Field, Input, Panel, Select } from '@datn/ui';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  caExtra,
  type ImportRecord,
  type ImportSummary,
  type ReferenceSource,
} from '../../api/ca-extra';
import {
  CaWorkspace,
  ResourceState,
  useCaMutation,
  useCaResource,
} from '../../features/catalogue/CaWorkspace';
import { ImportRecordEditor } from '../../features/catalogue/ImportRecordEditor';
import { useEventStream } from '../../hooks/useEventStream';

export function ReferenceImportPage() {
  const { importId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const demo = (location.state as { demo?: boolean } | null)?.demo;
  const [source, setSource] = useState<ReferenceSource>('ONET');
  const [file, setFile] = useState<File>();
  const [pendingJob, setPendingJob] = useState<string>();
  const [lookupId, setLookupId] = useState('');
  const mutation = useCaMutation();
  useEventStream(
    pendingJob ? { types: ['import.finished'] } : null,
    (event) => {
      if (event.jobId !== pendingJob) return;
      // ĐỀ XUẤT: payload.importId chưa được mô tả cụ thể trong OpenAPI StreamEvent.
      const id = event.payload.importId;
      if (typeof id === 'string') {
        setPendingJob(undefined);
        navigate(`/ca/catalogue/imports/${encodeURIComponent(id)}`);
      }
    },
  );
  if (importId)
    return <ImportReview key={importId} importId={importId} demo={demo} />;
  return (
    <CaWorkspace
      code="C03"
      title="Nhập dữ liệu tham chiếu"
      description="O*NET / ESCO → kiểm tra từng bản ghi → điều chỉnh → hoàn tất và thông báo chuyên gia."
      demo={import.meta.env.VITE_STAFF_DEMO === '1'}
    >
      <ImportSteps step={0} />
      <Panel variant="solid" className="max-w-2xl">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void mutation.run(async () => {
              if (!file || file.size === 0)
                throw new Error('Chọn tệp dữ liệu không rỗng');
              const response = await caExtra.startImport(source, file);
              if (response.demo)
                navigate(`/ca/catalogue/imports/${response.data.jobId}`, {
                  state: { demo: true },
                });
              else setPendingJob(response.data.jobId);
            });
          }}
        >
          <Field label="Nguồn dữ liệu">
            <Select
              value={source}
              onChange={(e) => setSource(e.target.value as ReferenceSource)}
            >
              <option value="ONET">O*NET</option>
              <option value="ESCO">ESCO</option>
            </Select>
          </Field>
          <Field
            label="Tệp nguồn"
            required
            hint="Chọn tệp do nguồn O*NET hoặc ESCO cung cấp. Máy chủ kiểm tra định dạng."
          >
            <Input
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </Field>
          <Callout>
            Trong chế độ mẫu, tệp không được phân tích; danh sách tiếp theo là
            bản ghi minh hoạ.
          </Callout>
          <Button type="submit" loading={mutation.busy} disabled={!!pendingJob}>
            Tải lên và đối chiếu
          </Button>
        </form>
        {mutation.error && (
          <div role="alert" className="mt-4">
            <Callout tone="danger">{mutation.error}</Callout>
          </div>
        )}
        {pendingJob && (
          <Callout title="Đang chờ kết quả nhập">
            Mã job: {pendingJob}. Kết quả đến qua import.finished. Nếu sự kiện
            không cung cấp importId, mở phiên bằng mã do máy chủ cung cấp bên
            dưới.
          </Callout>
        )}
      </Panel>
      <form
        className="flex max-w-2xl items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(
            `/ca/catalogue/imports/${encodeURIComponent(lookupId.trim())}`,
          );
        }}
      >
        <Field label="Mở phiên nhập đã có">
          <Input
            required
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Import ID"
          />
        </Field>
        <Button type="submit" variant="subtle">
          Mở phiên
        </Button>
      </form>
    </CaWorkspace>
  );
}
function ImportSteps({ step }: { step: number }) {
  return (
    <ol aria-label="Tiến trình nhập" className="grid gap-2 sm:grid-cols-3">
      {[
        'Tải tệp nguồn',
        'Kiểm tra & điều chỉnh',
        'Hoàn tất & thông báo DE',
      ].map((label, index) => (
        <li
          key={label}
          aria-current={index === step ? 'step' : undefined}
          className={`rounded-md border p-3 text-sm ${index === step ? 'border-info text-info' : 'border-line text-ink-muted'}`}
        >
          {index < step ? '✓' : index + 1} · {label}
        </li>
      ))}
    </ol>
  );
}
function ImportReview({
  importId,
  demo,
}: {
  importId: string;
  demo?: boolean;
}) {
  const loader = useCallback(
    () => caExtra.getImport(importId, demo),
    [importId, demo],
  );
  const resource = useCaResource(loader);
  const mutation = useCaMutation();
  const [selected, setSelected] = useState<ImportRecord>();
  const [summary, setSummary] = useState<ImportSummary>();
  const job = resource.result?.data;
  const isDemo = resource.result?.demo ?? false;
  // Poll chỉ trong lúc worker đang xử lý; dừng khi thành công, lỗi hoặc rời trang.
  useEffect(() => {
    if (!job || !['QUEUED', 'RUNNING'].includes(job.status)) return;
    const timer = setTimeout(resource.reload, 2500);
    return () => clearTimeout(timer);
  }, [job, resource.reload]);
  const records = [...(job?.records ?? [])].sort(
    (a, b) =>
      Number(!b.isResolved && !b.isSkipped) -
      Number(!a.isResolved && !a.isSkipped),
  );
  const complete = !!job?.completedAt || !!summary;
  return (
    <CaWorkspace
      code="C03"
      title="Kiểm tra dữ liệu nhập"
      description={`Phiên ${importId}. Bản ghi chưa xử lý được ưu tiên hiển thị trước.`}
      demo={isDemo}
    >
      <ImportSteps step={complete ? 2 : 1} />
      <ResourceState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      {job && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{job.status}</Badge>
            <span className="text-sm">
              {job.unresolvedCount} bản ghi chưa xử lý
            </span>
            <Button variant="subtle" onClick={resource.reload}>
              Cập nhật
            </Button>
          </div>
          {job.status === 'FAILED' && (
            <Callout tone="danger">
              Nhập dữ liệu thất bại. Kiểm tra lại tệp nguồn trước khi tạo phiên
              mới.
            </Callout>
          )}
          <Panel variant="solid" padding="none" className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Các bản ghi tham chiếu</caption>
              <thead className="bg-night-800">
                <tr>
                  {['Mã nguồn', 'Loại', 'Nội dung', 'Xử lý'].map((text) => (
                    <th scope="col" key={text} className="p-3">
                      {text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.recordId} className="border-t border-line">
                    <td className="p-3 font-mono">{record.sourceCode}</td>
                    <td className="p-3">{record.kind}</td>
                    <td className="max-w-md truncate p-3">
                      {JSON.stringify(record.payload)}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="subtle"
                        size="sm"
                        disabled={complete || job.status !== 'SUCCEEDED'}
                        onClick={() => setSelected(record)}
                      >
                        {record.isSkipped
                          ? 'Đã bỏ qua'
                          : record.isResolved
                            ? 'Đã xử lý · xem lại'
                            : 'Cần xử lý'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          {!complete && (
            <Button
              disabled={job.status !== 'SUCCEEDED' || job.unresolvedCount > 0}
              loading={mutation.busy}
              onClick={() =>
                void mutation.run(async () => {
                  const response = await caExtra.completeImport(
                    importId,
                    isDemo,
                  );
                  setSummary(response.data);
                })
              }
            >
              Hoàn tất & thông báo DE
            </Button>
          )}
          {complete && (
            <Callout
              tone="success"
              title={isDemo ? 'Hoàn tất mô phỏng' : 'Đã hoàn tất phiên nhập'}
            >
              {summary
                ? `${summary.occupationsUpdated} nghề cập nhật · ${summary.tasksAdded} task · ${summary.competenciesAdded} năng lực · ${summary.skippedRecords} bản ghi bỏ qua · ${summary.expertsNotified} DE nhận thông báo${isDemo ? ' (mô phỏng)' : ''}.`
                : 'Phiên nhập đã được hoàn tất trước đó.'}
            </Callout>
          )}
        </>
      )}
      {mutation.error && (
        <div role="alert">
          <Callout tone="danger">{mutation.error}</Callout>
        </div>
      )}
      {selected && (
        <ImportRecordEditor
          record={selected}
          importId={importId}
          demo={isDemo}
          onClose={() => setSelected(undefined)}
          onSaved={resource.reload}
        />
      )}
    </CaWorkspace>
  );
}
