// ĐỀ XUẤT C11: toàn bộ schema/version store chỉ phục vụ duyệt thiết kế, chưa nối runtime.
export interface Parameter {
  id: string;
  group: string;
  label: string;
  initial: string;
  unit: string;
  source: string;
  explanation: string;
  count?: number;
  min: number;
  max?: number;
  integer?: boolean;
  increasing?: boolean;
}
const profile = 'Hồ sơ JobQuest cơ chế game.md';
export const parameters: Parameter[] = [
  {
    id: 'tiers',
    group: 'Kỹ năng & hồ sơ',
    label: 'Ngưỡng bậc soft skill',
    initial: '0,500,1500,3000,6000,10000',
    unit: 'điểm',
    source: `${profile} · D1`,
    explanation: 'Ngưỡng lên các bậc 0–5; giữ tạm để kiểm qua chơi thử.',
    count: 6,
    min: 0,
    integer: true,
    increasing: true,
  },
  {
    id: 'zodiac',
    group: 'Kỹ năng & hồ sơ',
    label: 'Buff hoàng đạo',
    initial: '12',
    unit: '% điểm cộng',
    source: `${profile} · F / F1`,
    explanation: 'Chỉ nhân phần điểm cộng của hai nhóm được buff.',
    min: 0,
    max: 100,
  },
  {
    id: 'strengths',
    group: 'Kỹ năng & hồ sơ',
    label: 'Bằng chứng trước nhận xét điểm mạnh',
    initial: '3',
    unit: 'scenario',
    source: `${profile} · B5`,
    explanation: 'Chỉ nhận xét khi nhóm kỹ năng đã được chấm đủ scenario.',
    min: 1,
    integer: true,
  },
  {
    id: 'flat',
    group: 'Kỹ năng & hồ sơ',
    label: 'Ngưỡng hồ sơ phẳng',
    initial: '0.15',
    unit: 'độ lệch chuẩn',
    source: `${profile} · E2`,
    explanation: 'Dưới ngưỡng thì không xếp hạng sở thích.',
    min: 0,
    max: 1,
  },
  {
    id: 'selfReport',
    group: 'Kỹ năng & hồ sơ',
    label: 'Trọng số tự kể',
    initial: '2',
    unit: 'hệ số',
    source: `${profile} · E1`,
    explanation: 'Sức nặng bằng chứng tự khai trong hồ sơ sở thích.',
    min: 0,
  },
  {
    id: 'penalty',
    group: 'Tiến trình & keyword',
    label: 'Hệ số phạt theo band',
    initial: '0.25,0.35,0.5',
    unit: 'hệ số · 3 nhóm band',
    source: `${profile} · G2`,
    explanation:
      'Hệ số phạt tăng theo nhóm cấp; thứ tự theo tài liệu thiết kế.',
    count: 3,
    min: 0,
    max: 1,
  },
  {
    id: 'entry',
    group: 'Tiến trình & keyword',
    label: 'Điểm vào cấp',
    initial: '60',
    unit: '%',
    source: `${profile} · G2`,
    explanation: 'Mức điểm khởi đầu khi đủ điều kiện bước vào cấp.',
    min: 0,
    max: 100,
  },
  {
    id: 'coverage',
    group: 'Tiến trình & keyword',
    label: 'Độ phủ keyword',
    initial: '50',
    unit: '%',
    source: `${profile} · G2 / D-122`,
    explanation: 'Ngưỡng phủ keyword khi đi sang nghề liên quan.',
    min: 0,
    max: 100,
  },
  {
    id: 'similarCoverage',
    group: 'Tiến trình & keyword',
    label: 'Độ phủ cho nghề rất giống',
    initial: '30',
    unit: '%',
    source: `${profile} · G2 / D-122`,
    explanation: 'Ngưỡng giảm cho cặp nghề rất giống theo Sim.',
    min: 0,
    max: 100,
  },
  {
    id: 'exponent',
    group: 'Tiến trình & keyword',
    label: 'Số mũ k',
    initial: '1.4',
    unit: 'k^x',
    source: `${profile} · G2`,
    explanation: 'Đường cong độ khó tích luỹ keyword.',
    min: 0.01,
  },
  {
    id: 'keywords',
    group: 'Tiến trình & keyword',
    label: 'Trần keyword mỗi cấp',
    initial: '5',
    unit: 'keyword',
    source: `${profile} · G2`,
    explanation: 'Giới hạn số keyword được chọn cho mỗi cấp.',
    min: 1,
    integer: true,
  },
  {
    id: 'officeMinutes',
    group: 'Thời gian & AI',
    label: 'Thời gian một điểm · văn phòng IT',
    initial: '5',
    unit: 'phút / điểm',
    source: 'Luật dẫn truyện JobQuest.md · A1',
    explanation: 'Quy đổi điểm thời gian của ca văn phòng.',
    min: 0.01,
  },
  {
    id: 'restaurantMinutes',
    group: 'Thời gian & AI',
    label: 'Thời gian một điểm · nhà hàng',
    initial: '2',
    unit: 'phút / điểm',
    source: 'Luật dẫn truyện JobQuest.md · A1',
    explanation: 'Quy đổi điểm thời gian của ca nhà hàng.',
    min: 0.01,
  },
  {
    id: 'followups',
    group: 'Thời gian & AI',
    label: 'Trần follow-up theo band L1–L7',
    initial: '2,2,3,3,3,4,4',
    unit: 'lượt',
    source:
      'packages/game-core/src/domain/followups.ts · followupCap (prototype)',
    explanation:
      'Giá trị prototype, chưa là cấu hình contract nhịp D-130. Thiết kế mới để trần trong gói cấp (Seed scenario JobQuest.md).',
    count: 7,
    min: 0,
    integer: true,
  },
  {
    id: 'ratingMin',
    group: 'Thời gian & AI',
    label: 'Số người tối thiểu để công bố đánh giá',
    initial: '5',
    unit: 'người',
    source: 'NFR-06 · apps/api/src/config/env.ts · RATING_MIN_RESPONSES',
    explanation:
      '5 là mặc định trong code, không xác nhận biến môi trường đang chạy.',
    min: 1,
    integer: true,
  },
  {
    id: 'costCap',
    group: 'Thời gian & AI',
    label: 'Trần chi phí model mỗi phiên',
    initial: '',
    unit: 'USD / phiên (đề xuất)',
    source: 'docs/project-hub/03-san-pham.md · DC-04 (lịch sử)',
    explanation:
      'Chưa có giá trị thống nhất trong các nguồn đã đọc. Để trống nghĩa là chưa chốt, không phải không giới hạn. Đơn vị USD là đề xuất.',
    min: 0.000001,
  },
];
export type SettingsValues = Record<string, string>;
export interface SettingsVersion {
  version: number;
  createdAt: string | null;
  reason: string;
  values: SettingsValues;
  changes: Array<{ id: string; before: string; after: string }>;
}
const versions: SettingsVersion[] = [
  {
    version: 1,
    createdAt: null,
    reason:
      'Bản chụp giá trị tài liệu / code để nhóm duyệt; chưa áp dụng runtime',
    values: Object.fromEntries(parameters.map((p) => [p.id, p.initial])),
    changes: [],
  },
];
export function validateSettings(
  values: SettingsValues,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const parameter of parameters) {
    const text = values[parameter.id]?.trim() ?? '';
    if (!text && parameter.id === 'costCap') continue;
    const parts = text.split(',').map((s) => s.trim());
    const numbers = parts.map(Number);
    if (parts.some((p) => !p) || numbers.some((v) => !Number.isFinite(v)))
      errors[parameter.id] =
        'Nhập số hợp lệ; dùng dấu chấm cho thập phân, dấu phẩy để ngăn các giá trị.';
    else if (numbers.length !== (parameter.count ?? 1))
      errors[parameter.id] = `Cần đúng ${parameter.count ?? 1} giá trị.`;
    else if (
      numbers.some(
        (v) =>
          v < parameter.min ||
          (parameter.max !== undefined && v > parameter.max) ||
          (parameter.integer && !Number.isInteger(v)),
      )
    )
      errors[parameter.id] =
        `Giá trị ${parameter.integer ? 'nguyên ' : ''}từ ${parameter.min}${parameter.max !== undefined ? ` đến ${parameter.max}` : ' trở lên'}.`;
    else if (
      parameter.increasing &&
      (numbers[0] !== 0 || numbers.some((v, i) => i > 0 && v <= numbers[i - 1]))
    )
      errors[parameter.id] = 'Ngưỡng phải bắt đầu từ 0 và tăng nghiêm ngặt.';
  }
  if (
    !errors.coverage &&
    !errors.similarCoverage &&
    Number(values.similarCoverage) > Number(values.coverage)
  )
    errors.similarCoverage =
      'Ngưỡng cho nghề rất giống không được cao hơn ngưỡng thông thường.';
  return errors;
}
export function getSettingsVersions(): SettingsVersion[] {
  return structuredClone(versions);
}
export function saveSettingsVersion(
  values: SettingsValues,
  reason: string,
  baseVersion: number,
): SettingsVersion {
  if (baseVersion !== versions[0].version)
    throw new Error('Đã có phiên bản mới. Tải lại màn hình trước khi lưu.');
  if (!reason.trim()) throw new Error('Nhập lý do thay đổi');
  if (Object.keys(validateSettings(values)).length)
    throw new Error('Cấu hình chưa hợp lệ');
  const normalized = Object.fromEntries(
    parameters.map((p) => [
      p.id,
      values[p.id].trim()
        ? values[p.id]
            .split(',')
            .map((s) => String(Number(s.trim())))
            .join(',')
        : '',
    ]),
  );
  const changes = parameters
    .filter((p) => normalized[p.id] !== versions[0].values[p.id])
    .map((p) => ({
      id: p.id,
      before: versions[0].values[p.id],
      after: normalized[p.id],
    }));
  if (!changes.length) throw new Error('Chưa có thay đổi để tạo phiên bản');
  const next = {
    version: versions[0].version + 1,
    createdAt: new Date().toISOString(),
    reason: reason.trim(),
    values: { ...normalized },
    changes,
  };
  versions.unshift(next);
  return structuredClone(next);
}
