import {
  getSettingsVersions,
  saveSettingsVersion,
} from '../features/settings/gameSettings';
import catalogue from './ca-extra.catalogue.json';
import type {
  AgreementReport,
  CatalogueOccupation,
  Domain,
  DomainInput,
  ContentFlag,
  FixRecordInput,
  ImportJob,
  ImportSummary,
  OccupationInput,
  OccupationStatistics,
  PromptKind,
  PublishInput,
  PublishPreview,
  ReferenceSource,
  Release,
  SystemPromptVersion,
} from './ca-extra.types';

// Bản chụp catalogue.json của explorer; lifecycle/coverage bên dưới là dữ liệu mô phỏng.
const domains: Domain[] = catalogue.groups.map((group, index) => ({
  id: `demo-domain-${index}`,
  code: `GROUP_${index}`,
  name: group.name,
  occupationCount: catalogue.occupations.filter((o) => o.group === group.name)
    .length,
}));
const occupations: CatalogueOccupation[] = catalogue.occupations.map((o) => ({
  id: o.code,
  code: o.code,
  name: o.name,
  domainId: domains.find((d) => d.name === o.group)?.id ?? '',
  status: 'DRAFT',
  myRole: 'CONTENT_ADMIN',
  summary: o.summary,
  riasecCode: o.interestCode,
  region: catalogue.regions.find((r) => r.id === o.regionId)?.name,
  levels: Array.from({ length: o.levelCount }, (_, i) => ({
    level: i + 1,
    description: `Cấp ${i + 1}`,
    published: 0,
  })),
  lastValidatedAt: null,
}));
const imports = new Map<string, ImportJob>();
const releaseHistory = new Map<string, Release[]>();
const clone = <T>(data: T): T => structuredClone(data);
const requiredOccupation = (id: string) => {
  const item = occupations.find((o) => o.id === id);
  if (!item) throw new Error('Không tìm thấy nghề trong dữ liệu mẫu');
  return item;
};
export const caDemo = {
  settingsVersions: getSettingsVersions,
  saveSettingsVersion,
  domains: () =>
    clone(
      domains.map((d) => ({
        ...d,
        occupationCount: occupations.filter((o) => o.domainId === d.id).length,
      })),
    ),
  occupations: () => clone(occupations),
  createDomain(input: DomainInput): Domain {
    if (domains.some((d) => d.code === input.code))
      throw new Error('Mã nhóm đã tồn tại');
    const item = {
      ...input,
      id: `demo-domain-${crypto.randomUUID()}`,
      occupationCount: 0,
    };
    domains.push(item);
    return clone(item);
  },
  updateDomain(id: string, input: DomainInput): Domain {
    const item = domains.find((d) => d.id === id);
    if (!item) throw new Error('Không tìm thấy nhóm');
    if (domains.some((d) => d.id !== id && d.code === input.code))
      throw new Error('Mã nhóm đã tồn tại');
    Object.assign(item, input);
    return clone(item);
  },
  deleteDomain(id: string): void {
    if (occupations.some((o) => o.domainId === id))
      throw new Error('Chỉ được xoá nhóm chưa có nghề');
    const index = domains.findIndex((d) => d.id === id);
    if (index < 0) throw new Error('Không tìm thấy nhóm');
    domains.splice(index, 1);
  },
  flags(): ContentFlag[] {
    return [
      {
        id: 'demo-flag-1',
        scenarioId: 'demo-backend-l1',
        activityKey: 'a1',
        reason: 'Ví dụ yêu cầu API cần làm rõ bối cảnh sử dụng.',
        status: 'OPEN',
        createdAt: '2026-11-12T08:00:00Z',
      },
    ];
  },
  createOccupation(input: OccupationInput) {
    if (occupations.some((o) => o.code === input.code))
      throw new Error('Mã nghề đã tồn tại');
    if (!domains.some((d) => d.id === input.domainId))
      throw new Error('Nhóm nghề không tồn tại trong dữ liệu mẫu');
    const item: CatalogueOccupation = {
      ...input,
      id: `demo-${crypto.randomUUID()}`,
      status: 'DRAFT',
      myRole: 'CONTENT_ADMIN',
    };
    occupations.push(item);
    return clone(item);
  },
  updateOccupation(id: string, input: OccupationInput) {
    const item = requiredOccupation(id);
    if (!domains.some((d) => d.id === input.domainId))
      throw new Error('Nhóm nghề không tồn tại trong dữ liệu mẫu');
    Object.assign(item, input);
    return clone(item);
  },
  lifecycle(id: string, action: 'publish' | 'retire') {
    const item = requiredOccupation(id);
    if (
      action === 'publish' &&
      (!item.levels?.length ||
        item.levels.some((l) => !l.description) ||
        !item.levels.some((l) => l.published > 0))
    )
      throw new Error('Cần mô tả mọi cấp và ít nhất một scenario đã xuất bản');
    item.status = action === 'publish' ? 'PUBLISHED' : 'RETIRED';
    return clone(item);
  },
  startImport(source: ReferenceSource) {
    const id = crypto.randomUUID();
    imports.set(id, {
      id,
      source,
      status: 'SUCCEEDED',
      unresolvedCount: 2,
      completedAt: null,
      records: [0, 1, 2].map((i) => ({
        recordId: `${id}-${i}`,
        kind: 'OCCUPATION',
        sourceCode: `15-125${i}`,
        payload: {
          name: ['Lập trình viên', 'Chuyên viên dữ liệu', 'Kiểm thử viên'][i],
        },
        isResolved: i === 2,
        isSkipped: false,
        adjustedAt: null,
      })),
    });
    return { jobId: id, streamEvent: 'import.finished' };
  },
  getImport(id: string) {
    const job = imports.get(id);
    if (!job)
      throw new Error('Không tìm thấy phiên nhập mẫu. Hãy tải tệp để bắt đầu.');
    return clone(job);
  },
  fixRecord(id: string, recordId: string, input: FixRecordInput) {
    const job = imports.get(id);
    const record = job?.records.find((r) => r.recordId === recordId);
    if (!job || !record || job.completedAt)
      throw new Error('Không thể sửa bản ghi này');
    Object.assign(record, {
      payload: input.payload ?? record.payload,
      isResolved: input.action !== 'SKIP',
      isSkipped: input.action === 'SKIP',
      adjustedAt: new Date().toISOString(),
    });
    job.unresolvedCount = job.records.filter(
      (r) => !r.isResolved && !r.isSkipped,
    ).length;
    return clone(record);
  },
  completeImport(id: string): ImportSummary {
    const job = imports.get(id);
    if (
      !job ||
      job.status !== 'SUCCEEDED' ||
      job.unresolvedCount ||
      job.completedAt
    )
      throw new Error('Phiên nhập chưa sẵn sàng hoặc đã hoàn tất');
    job.completedAt = new Date().toISOString();
    return {
      importId: id,
      occupationsUpdated: job.records.filter((r) => !r.isSkipped).length,
      tasksAdded: 0,
      competenciesAdded: 0,
      skippedRecords: job.records.filter((r) => r.isSkipped).length,
      expertsNotified: 2,
      completedAt: job.completedAt,
    };
  },
  publishPreview(id: string): PublishPreview {
    return {
      title: 'Xử lý sự cố dịch vụ Back-end · mẫu',
      version: '1.0.0',
      approved: true,
      buildReady: true,
      playtestDone: true,
      checksPassed: true,
      releases: clone(releaseHistory.get(id) ?? []),
    };
  },
  publish(id: string, input: PublishInput): Release {
    const history = releaseHistory.get(id) ?? [];
    if (history.length)
      throw new Error(
        'Bản dựng mẫu này đã được phát hành; release là bất biến',
      );
    const release: Release = {
      id: crypto.randomUUID(),
      scenarioId: id,
      buildId: 'demo-build',
      version: '1.0.0',
      effectiveFrom: input.effectiveFrom,
      releaseNote: input.releaseNote ?? '',
      status:
        new Date(input.effectiveFrom).getTime() > Date.now()
          ? 'READY'
          : 'PUBLISHED',
    };
    releaseHistory.set(id, [...history, clone(release)]);
    return release;
  },
  statistics(): OccupationStatistics {
    return {
      plays: 148,
      completionRate: 0.76,
      averageScoreByScenario: [
        {
          scenarioId: 'demo-backend-l1',
          title: 'Xử lý yêu cầu API',
          average: 68,
          flags: 1,
        },
        {
          scenarioId: 'demo-backend-l3',
          title: 'Điều tra sự cố',
          average: 74,
          flags: 0,
        },
      ],
      ratings: { responseCount: 3, withheld: true, averages: {} },
      coverage: {
        tasksWithPublishedScenario: 2,
        tasksTotal: 18,
        referenceSamples: 12,
      },
      gradingAgreement: 0.72,
    };
  },
  agreement(): AgreementReport {
    return {
      modelConfigVersion: 1,
      byStratum: [
        {
          stratum: 'EASY',
          samples: 12,
          aiExpertKappa: 0.72,
          interExpertKappa: 0.81,
        },
      ],
      disagreements: [
        {
          scenarioId: 'demo-backend-l3',
          activityKey: 'a2',
          referenceAnswerId: 'demo-answer-1',
          criterionId: 'demo-criterion-1',
          expertScore: 2,
          aiScore: 1,
          expertCounterproductive: false,
          aiCounterproductive: false,
        },
      ],
    };
  },
  promptVersions(kind: PromptKind): SystemPromptVersion[] {
    return [2, 1].map((versionNo) => ({
      kind,
      versionNo,
      text:
        kind === 'GRADING'
          ? `Chấm theo rubric chuyên gia.\nKhông suy luận về con người.${versionNo === 2 ? '\nĐọc đủ bằng chứng trước khi chấm.' : ''}`
          : `Giữ nguyên canon đã duyệt.\nKhông tiết lộ rubric.${versionNo === 2 ? '\nChỉ hỏi khi engine cho phép.' : ''}`,
      changeNote: versionNo === 2 ? 'Làm rõ giới hạn của vai AI' : 'Bản đầu',
      restoredFromVersionNo: null,
      changedBy: null,
      changedAt: '2026-11-12T08:00:00Z',
    }));
  },
  prompts(): SystemPromptVersion[] {
    return [
      this.promptVersions('FOLLOW_UP')[0],
      this.promptVersions('GRADING')[0],
    ];
  },
};
