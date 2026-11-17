import { useCallback, useState } from 'react';
import { Badge, Field, Panel, Select } from '@datn/ui';
import { caExtra, type PromptKind } from '../../api/ca-extra';
import { ResourceState, useCaResource } from '../catalogue/CaWorkspace';
import { formatDate, lineDiff } from '../catalogue/format';

export function PromptVersions({
  occupationId,
  kind,
  demo,
}: {
  occupationId: string;
  kind: PromptKind;
  demo: boolean;
}) {
  const loader = useCallback(
    () => caExtra.promptVersions(occupationId, kind, demo),
    [occupationId, kind, demo],
  );
  const resource = useCaResource(loader);
  const [selected, setSelected] = useState<number>();
  const [baseline, setBaseline] = useState<number>();
  const versions = resource.result?.data ?? [];
  const current = versions.find((v) => v.versionNo === selected) ?? versions[0];
  const previous =
    versions.find((v) => v.versionNo === baseline) ??
    versions.find((v) => v.versionNo !== current?.versionNo);
  return (
    <div className="space-y-4">
      <ResourceState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      {current && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phiên bản đang xem">
              <Select
                value={current.versionNo}
                onChange={(e) => setSelected(Number(e.target.value))}
              >
                {versions.map((v) => (
                  <option key={v.versionNo} value={v.versionNo}>
                    v{v.versionNo} · {formatDate(v.changedAt)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="So sánh với">
              <Select
                disabled={versions.length < 2}
                value={previous?.versionNo ?? ''}
                onChange={(e) => setBaseline(Number(e.target.value))}
              >
                <option value="" disabled>
                  Chưa có phiên bản khác
                </option>
                {versions
                  .filter((v) => v.versionNo !== current.versionNo)
                  .map((v) => (
                    <option key={v.versionNo} value={v.versionNo}>
                      v{v.versionNo}
                    </option>
                  ))}
              </Select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge>{kind}</Badge>
            {resource.result?.demo && <Badge tone="info">Dữ liệu mẫu</Badge>}
            <span>
              {current.changedBy?.displayName ??
                'Mặc định hệ thống / chưa ghi tác giả'}{' '}
              · {current.changeNote ?? 'Chưa có ghi chú'}
            </span>
          </div>
          <Panel variant="paper">
            <h3 className="mb-3 font-display text-lg">
              Nội dung prompt · chỉ đọc
            </h3>
            <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7">
              {current.text}
            </pre>
          </Panel>
          {previous && (
            <Panel variant="solid">
              <h3 className="mb-3 font-display text-lg">
                Thay đổi v{previous.versionNo} → v{current.versionNo}
              </h3>
              <p className="mb-3 text-xs text-ink-muted">
                + Thêm · − Bỏ · dòng không có dấu được giữ nguyên.
              </p>
              <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6">
                {lineDiff(previous.text, current.text).map((line, index) => (
                  <span
                    key={index}
                    className={`block ${line.type === 'added' ? 'bg-success-deep/40 text-success' : line.type === 'removed' ? 'bg-danger-deep/40 text-danger' : 'text-ink-muted'}`}
                  >
                    {line.type === 'added'
                      ? '+ '
                      : line.type === 'removed'
                        ? '− '
                        : '  '}
                    {line.text}
                  </span>
                ))}
              </pre>
            </Panel>
          )}
        </>
      )}
      {!resource.loading && !resource.error && !current && (
        <p>Chưa có phiên bản prompt cho vai này.</p>
      )}
    </div>
  );
}
export function hasFamilyConflict(
  narrator: string | null,
  judges: readonly string[],
): boolean {
  if (!narrator) return false;
  return judges.some(
    (family) => family.trim().toLowerCase() === narrator.trim().toLowerCase(),
  );
}
