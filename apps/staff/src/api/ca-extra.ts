import { api, ApiProblem } from './client';
import { caDemo } from './ca-extra.demo';
import type { ScenarioDetail, JobAccepted } from './types';
import type {
  AgreementReport,
  CatalogueOccupation,
  Domain,
  DomainInput,
  FixRecordInput,
  ImportJob,
  ImportRecord,
  ImportSummary,
  OccupationInput,
  OccupationStatistics,
  PromptKind,
  PublishInput,
  PublishPreview,
  Release,
  Sourced,
  SystemPromptVersion,
} from './ca-extra.types';
export type * from './ca-extra.types';

/** Chỉ 404/501 được chuyển sang mẫu; lỗi quyền, mạng, validation vẫn trả về UI. */
export async function withDemoFallback<T>(
  request: () => Promise<T>,
  demo: () => T | Promise<T>,
  forceDemo = false,
): Promise<Sourced<T>> {
  if (forceDemo || import.meta.env.VITE_STAFF_DEMO === '1')
    return { data: await demo(), demo: true };
  try {
    return { data: await request(), demo: false };
  } catch (error) {
    if (!(error instanceof ApiProblem) || ![404, 501].includes(error.status))
      throw error;
    return { data: await demo(), demo: true };
  }
}
const idPath = (id: string) => `/staff/occupations/${encodeURIComponent(id)}`;
export const caExtra = {
  catalogue: (demo?: boolean) =>
    withDemoFallback(
      async () => {
        const [domains, occupations] = await Promise.all([
          api<Domain[]>('/staff/domains'),
          api<CatalogueOccupation[]>('/staff/occupations'),
        ]);
        return { domains, occupations };
      },
      () => ({ domains: caDemo.domains(), occupations: caDemo.occupations() }),
      demo,
    ),
  createDomain: (body: DomainInput, demo?: boolean) =>
    withDemoFallback(
      () => api<Domain>('/staff/domains', { method: 'POST', body }),
      () => caDemo.createDomain(body),
      demo,
    ),
  updateDomain: (id: string, body: DomainInput, demo?: boolean) =>
    withDemoFallback(
      () =>
        api<Domain>(`/staff/domains/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body,
        }),
      () => caDemo.updateDomain(id, body),
      demo,
    ),
  deleteDomain: (id: string, demo?: boolean) =>
    withDemoFallback(
      () =>
        api<void>(`/staff/domains/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        }),
      () => caDemo.deleteDomain(id),
      demo,
    ),
  createOccupation: (body: OccupationInput, demo?: boolean) =>
    withDemoFallback(
      () =>
        api<CatalogueOccupation>('/staff/occupations', {
          method: 'POST',
          body,
        }),
      () => caDemo.createOccupation(body),
      demo,
    ),
  updateOccupation: (id: string, body: OccupationInput, demo?: boolean) =>
    withDemoFallback(
      () => api<CatalogueOccupation>(idPath(id), { method: 'PATCH', body }),
      () => caDemo.updateOccupation(id, body),
      demo,
    ),
  occupationLifecycle: (
    id: string,
    action: 'publish' | 'retire',
    demo?: boolean,
  ) =>
    withDemoFallback(
      () =>
        api<CatalogueOccupation>(`${idPath(id)}/${action}`, { method: 'POST' }),
      () => caDemo.lifecycle(id, action),
      demo,
    ),
  startImport: (source: ReferenceSourceInput, file: File) =>
    withDemoFallback(
      () => {
        const form = new FormData();
        form.set('source', source);
        form.set('file', file);
        return api<JobAccepted>('/staff/imports', { method: 'POST', form });
      },
      () => caDemo.startImport(source),
    ),
  getImport: (id: string, demo?: boolean) =>
    withDemoFallback(
      () => api<ImportJob>(`/staff/imports/${encodeURIComponent(id)}`),
      () => caDemo.getImport(id),
      demo,
    ),
  fixRecord: (
    id: string,
    recordId: string,
    body: FixRecordInput,
    demo?: boolean,
  ) =>
    withDemoFallback(
      () =>
        api<ImportRecord>(
          `/staff/imports/${encodeURIComponent(id)}/records/${encodeURIComponent(recordId)}`,
          { method: 'PATCH', body },
        ),
      () => caDemo.fixRecord(id, recordId, body),
      demo,
    ),
  completeImport: (id: string, demo?: boolean) =>
    withDemoFallback(
      () =>
        api<ImportSummary>(
          `/staff/imports/${encodeURIComponent(id)}/complete`,
          { method: 'POST' },
        ),
      () => caDemo.completeImport(id),
      demo,
    ),
  publishPreview: (id: string) =>
    withDemoFallback(
      async (): Promise<PublishPreview> => {
        const detail = await api<ScenarioDetail>(
          `/staff/scenarios/${encodeURIComponent(id)}`,
        );
        // READY xác nhận đã đi qua approve → build → play-test trong SM-01.
        // OpenAPI chưa có endpoint riêng để đọc checklist hay release history.
        const ready = detail.status === 'READY';
        return {
          title: detail.taskTitle,
          version: detail.version,
          approved: ready,
          buildReady: ready,
          playtestDone: ready,
          checksPassed: ready,
          releases: [],
        };
      },
      () => caDemo.publishPreview(id),
    ),
  publish: (id: string, body: PublishInput, demo?: boolean) =>
    withDemoFallback(
      () =>
        api<Release>(`/staff/scenarios/${encodeURIComponent(id)}/release`, {
          method: 'POST',
          body,
        }),
      () => caDemo.publish(id, body),
      demo,
    ),
  statistics: (id: string) =>
    withDemoFallback(
      () => api<OccupationStatistics>(`${idPath(id)}/statistics`),
      () => caDemo.statistics(),
    ),
  agreement: (id: string) =>
    withDemoFallback(
      () => api<AgreementReport>(`${idPath(id)}/agreement-report`),
      () => caDemo.agreement(),
    ),
  prompts: (id: string) =>
    withDemoFallback(
      () => api<SystemPromptVersion[]>(`${idPath(id)}/system-prompts`),
      () => caDemo.prompts(),
    ),
  promptVersions: (id: string, kind: PromptKind, demo?: boolean) =>
    withDemoFallback(
      () =>
        api<SystemPromptVersion[]>(
          `${idPath(id)}/system-prompts/${kind}/versions`,
        ),
      () => caDemo.promptVersions(kind),
      demo,
    ),
};
type ReferenceSourceInput = ImportJob['source'];
