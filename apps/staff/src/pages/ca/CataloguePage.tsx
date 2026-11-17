import {
  Badge,
  Button,
  Callout,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Panel,
  Select,
  buttonClasses,
} from '@datn/ui';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { caExtra, type CatalogueOccupation } from '../../api/ca-extra';
import {
  CaWorkspace,
  ResourceState,
  useCaMutation,
  useCaResource,
} from '../../features/catalogue/CaWorkspace';
import { foldVietnamese, formatDate } from '../../features/catalogue/format';
import { DomainManager } from '../../features/catalogue/DomainManager';
import { OccupationEditor } from '../../features/catalogue/OccupationEditor';

export function CataloguePage() {
  const [forceDemo, setForceDemo] = useState<boolean>();
  const loader = useCallback(() => caExtra.catalogue(forceDemo), [forceDemo]);
  const resource = useCaResource(loader);
  const mutation = useCaMutation();
  const [query, setQuery] = useState('');
  const [manageDomains, setManageDomains] = useState(false);
  const [domainId, setDomainId] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');
  const [editor, setEditor] = useState<CatalogueOccupation | 'new'>();
  const [confirmation, setConfirmation] = useState<{
    item: CatalogueOccupation;
    action: 'publish' | 'retire';
  }>();
  const data = resource.result?.data;
  const demo = resource.result?.demo ?? false;
  const visible =
    data?.occupations.filter(
      (o) =>
        (!domainId || o.domainId === domainId) &&
        (!status || o.status === status) &&
        (!region || o.region === region) &&
        foldVietnamese(`${o.name} ${o.code}`).includes(foldVietnamese(query)),
    ) ?? [];
  return (
    <CaWorkspace
      code="C02"
      title="Danh mục nghề"
      description="Tổ chức nhóm nghề, theo dõi nội dung theo cấp và quản lý vòng đời xuất bản."
      demo={demo}
      action={
        <div className="flex gap-2">
          <Link
            className={buttonClasses({ variant: 'subtle' })}
            to="/ca/catalogue/imports"
          >
            Nhập O*NET / ESCO
          </Link>
          <Button
            disabled={!data?.domains.length}
            onClick={() => setEditor('new')}
          >
            Tạo nghề
          </Button>
        </div>
      }
    >
      <ResourceState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      {mutation.error && <Callout tone="danger">{mutation.error}</Callout>}
      {data && (
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <Panel
            variant="solid"
            as="aside"
            className="self-start lg:sticky lg:top-24"
            padding="sm"
          >
            <h2 className="p-2 font-display text-lg">Nhóm nghề</h2>
            <Button
              variant="subtle"
              size="sm"
              className="mb-3 w-full"
              onClick={() => setManageDomains(true)}
            >
              Quản lý nhóm
            </Button>
            <nav
              aria-label="Lọc nhóm nghề"
              className="max-h-48 space-y-1 overflow-auto lg:max-h-[65vh]"
            >
              <Button
                variant={domainId === '' ? 'subtle' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setDomainId('')}
              >
                Tất cả ({data.occupations.length})
              </Button>
              {data.domains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={domainId === d.id}
                  onClick={() => setDomainId(d.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs ${domainId === d.id ? 'bg-night-700 text-ink' : 'text-ink-muted hover:bg-night-800'}`}
                >
                  <span>{d.name}</span>
                  <span className="tabular">{d.occupationCount}</span>
                </button>
              ))}
            </nav>
          </Panel>
          <div className="min-w-0 space-y-4">
            <Panel
              variant="solid"
              className="sticky top-20 z-10 grid gap-3 md:grid-cols-[2fr_1fr_1fr]"
              padding="sm"
            >
              <Field label="Tìm nghề">
                <Input
                  type="search"
                  placeholder="Tên hoặc mã nghề…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Field>
              <Field label="Vòng đời">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="DRAFT">DRAFT · Bản nháp</option>
                  <option value="PUBLISHED">PUBLISHED · Đã xuất bản</option>
                  <option value="RETIRED">RETIRED · Ngừng phục vụ</option>
                </Select>
              </Field>
              <Field label="Vùng nghề">
                <Select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">Tất cả vùng</option>
                  {[
                    ...new Set(
                      data.occupations
                        .map((o) => o.region)
                        .filter((r): r is string => !!r),
                    ),
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
            </Panel>
            <p className="text-xs text-ink-muted">
              {visible.length} nghề · Độ phủ: số scenario đã xuất bản ở từng
              cấp. Dấu “—” nghĩa là API chưa cung cấp.
            </p>
            <Panel padding="none" variant="solid" className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Danh mục nghề và độ phủ nội dung theo cấp
                </caption>
                <thead className="bg-night-800 text-xs text-ink-muted">
                  <tr>
                    {[
                      'Nghề / nhóm / vùng',
                      'Cấp & độ phủ',
                      'Trạng thái',
                      'Kiểm chứng gần nhất',
                      'Thao tác',
                    ].map((label) => (
                      <th scope="col" key={label} className="p-3 font-semibold">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-line align-top hover:bg-night-800/30"
                    >
                      <td className="min-w-52 p-3">
                        <button
                          type="button"
                          className="text-left font-semibold text-ink hover:underline"
                          onClick={() => setEditor(o)}
                        >
                          {o.name}
                        </button>
                        <p className="mt-1 font-mono text-xs text-ink-muted">
                          {o.code}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {data.domains.find((d) => d.id === o.domainId)
                            ?.name ?? '—'}{' '}
                          · {o.region ?? '—'}
                        </p>
                      </td>
                      <td className="p-3">
                        {o.levels ? (
                          <div className="flex gap-1">
                            {o.levels.map((level) => (
                              <span
                                key={level.level}
                                title={`L${level.level}: ${level.published} scenario đã xuất bản`}
                                className={`flex h-9 w-6 items-center justify-center rounded-sm text-xs ${level.published > 0 ? 'bg-success-deep text-success' : 'bg-night-700 text-ink-muted'}`}
                              >
                                L{level.level}
                                <span className="sr-only">
                                  : {level.published} scenario
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          tone={
                            o.status === 'PUBLISHED'
                              ? 'success'
                              : o.status === 'RETIRED'
                                ? 'muted'
                                : 'neutral'
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">
                        {formatDate(o.lastValidatedAt)}
                      </td>
                      <td className="min-w-44 space-y-2 p-3">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          {[
                            ['review-criteria', 'Tiêu chí C04'],
                            ['scenarios', 'Scenario C05'],
                            ['monitor', 'Giám sát C09'],
                            ['prompts', 'Prompt C10'],
                          ].map(([path, label]) => (
                            <Link
                              key={path}
                              className="text-info hover:underline"
                              to={`/ca/occupations/${o.id}/${path}`}
                            >
                              {label}
                            </Link>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant={
                            o.status === 'PUBLISHED' ? 'danger' : 'subtle'
                          }
                          disabled={mutation.busy || o.status === 'RETIRED'}
                          onClick={() =>
                            setConfirmation({
                              item: o,
                              action:
                                o.status === 'PUBLISHED' ? 'retire' : 'publish',
                            })
                          }
                        >
                          {o.status === 'PUBLISHED'
                            ? 'Ngừng phục vụ'
                            : o.status === 'RETIRED'
                              ? 'Đã ngừng'
                              : 'Xuất bản'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visible.length && (
                <EmptyState
                  title="Không có nghề phù hợp"
                  description="Thử đổi nhóm nghề, bộ lọc hoặc từ khoá tìm kiếm."
                />
              )}
            </Panel>
          </div>
        </div>
      )}
      {manageDomains && data && (
        <DomainManager
          domains={data.domains}
          demo={demo}
          onClose={() => setManageDomains(false)}
          onSaved={(isDemo) => {
            setDomainId('');
            if (isDemo && !demo) setForceDemo(true);
            else resource.reload();
          }}
        />
      )}
      {editor && data && (
        <OccupationEditor
          occupation={editor === 'new' ? undefined : editor}
          domains={data.domains}
          demo={demo}
          onClose={() => setEditor(undefined)}
          onSaved={(isDemo) => {
            if (isDemo && !demo) setForceDemo(true);
            else resource.reload();
          }}
        />
      )}
      <ConfirmDialog
        open={!!confirmation}
        title={
          confirmation?.action === 'publish'
            ? 'Xuất bản nghề lên bản đồ?'
            : 'Ngừng phục vụ nghề?'
        }
        description={confirmation?.item.name}
        onClose={() => setConfirmation(undefined)}
        loading={mutation.busy}
        tone={confirmation?.action === 'retire' ? 'danger' : 'default'}
        onConfirm={() =>
          void mutation.run(async () => {
            if (!confirmation) return;
            const response = await caExtra.occupationLifecycle(
              confirmation.item.id,
              confirmation.action,
              demo,
            );
            setConfirmation(undefined);
            if (response.demo && !demo) setForceDemo(true);
            else resource.reload();
          })
        }
      >
        <p>
          {confirmation?.action === 'publish'
            ? 'Mọi cấp phải có mô tả và nghề phải có ít nhất một scenario đã xuất bản. Máy chủ kiểm tra điều kiện trước khi chuyển trạng thái.'
            : 'Nghề sẽ ngừng phục vụ; lịch sử lượt chơi được giữ nguyên.'}
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
