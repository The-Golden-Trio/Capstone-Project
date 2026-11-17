// Run with: node apps/web/scripts/build-demo-fixtures.mjs
// Chỉ rút gọn dữ liệu nguồn cho demo; không tạo kết quả nghiên cứu hoặc seed mới.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = async (p) => JSON.parse(await readFile(resolve(root, p), 'utf8'));
const output = resolve(root, 'apps/web/src/api/demo/fixtures');
const write = async (p, data) =>
  writeFile(resolve(output, p), JSON.stringify(data, null, 2) + '\n');
const [source, budgets, keywords, regionsSource, shifts] = await Promise.all([
  read('occupation-data/generated/occupation_profiles.json'),
  read('occupation-data/generated/point_budgets.json'),
  read('occupation-data/generated/keyword_map.json'),
  read('occupation-data/decisions/interest_regions.json'),
  read('packages/game-core/data/shift-seeds.json'),
]);
// CSV RFC 4180: có dấu phẩy và dấu nháy trong tên nghề/lý do.
function csv(text) {
  const rows = [];
  let row = [],
    value = '',
    quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (c === ',' || c === '\n')) {
      row.push(value.replace(/\r$/, ''));
      value = '';
      if (c === '\n') {
        rows.push(row);
        row = [];
      }
    } else value += c;
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows
    .slice(1)
    .filter((r) => r[0])
    .map((r) => Object.fromEntries(rows[0].map((h, i) => [h, r[i]])));
}
const gates = csv(
  await readFile(
    resolve(root, 'research/research_notes/Thang cấp nghề/nghe_di_truoc.csv'),
    'utf8',
  ),
);
const byCode = Object.fromEntries(source.profiles.map((p) => [p.role_code, p]));
const budgetMap = Object.fromEntries(
  budgets.roles.map((p) => [p.role_code, p]),
);
const keywordMap = Object.fromEntries(
  keywords.careers.map((p) => [p.role_code, p]),
);
const groups = regionsSource.regions.flatMap((r) =>
  r.groups.map((name) => ({ name, regionId: r.id })),
);
const regionOf = (group) => {
  const r = groups.find((g) => g.name === group);
  if (!r) throw new Error(`Thiếu vùng: ${group}`);
  return r.regionId;
};
const gateOf = (code) => {
  const g = gates.find((g) => g.role_code === code);
  return g
    ? {
        kind: 'PREREQUISITE',
        band: g.band_can,
        roles: g.nghe_di_truoc
          .split(';')
          .map((code) => ({ code, name: byCode[code].role_name_vn })),
      }
    : { kind: 'OPEN' };
};
const seeds = Object.values(shifts.seeds);
const seedCount = (code, band) =>
  seeds.filter((s) => s.level_ref === `${code}.${band}`).length;
const basisLabels = {
  itviec: 'Lương theo ITviec',
  job_postings: 'Lương rao trên tin tuyển dụng',
  reference: 'Lương tham khảo',
  public_scale: 'Lương theo thang nhà nước',
  group_average: 'Thu nhập bình quân nhóm nghề',
};
const payOf = (p) =>
  p
    ? {
        basisLabel: basisLabels[p.basis],
        low: p.monthly_vnd?.low ?? null,
        median: p.monthly_vnd?.median ?? null,
        high: p.monthly_vnd?.high ?? null,
        byYears: p.by_years ?? [],
        source: p.source,
        dataYear: p.data_year ?? '',
        note:
          [
            p.note,
            p.monthly_vnd?.average != null
              ? `Số bình quân tham khảo: ${p.monthly_vnd.average.toLocaleString('vi-VN')} đồng/tháng (không phải trung vị).`
              : null,
          ]
            .filter(Boolean)
            .join(' ') || null,
        publicSector: p.public_sector
          ? {
              label: p.public_sector.label_vn,
              low: p.public_sector.monthly_vnd.low,
              high: p.public_sector.monthly_vnd.high,
              source: p.public_sector.source,
            }
          : null,
      }
    : null;
await mkdir(resolve(output, 'profiles'), { recursive: true });
const catalogue = {
  regions: regionsSource.regions.map((r) => ({
    id: r.id,
    name: r.name_vn,
    card: r.card,
  })),
  groups,
  occupations: [],
};
const riasec = {};
for (const p of source.profiles) {
  const code = p.role_code,
    k = keywordMap[code],
    gate = gateOf(code),
    regionId = regionOf(p.role_group_vn);
  const refs = (values) =>
    Object.entries(values ?? {}).map(([id, level]) => ({
      id,
      name: k.keywords.find((x) => x.element === id)?.ten_vi ?? id,
      level,
    }));
  const levels = budgetMap[code].levels.map((l, i) => {
    const career = p.career?.levels?.find((x) => x.band === l.band),
      kw = k.levels.find((x) => x.band === l.band);
    return {
      levelNo: i + 1,
      band: l.band,
      bandEquivalent: l.band_equivalent,
      title: l.title_vn,
      years: l.years_experience ?? '',
      coreOutput: career?.core_output ?? null,
      tasks:
        p.daily_work?.by_level?.find((x) => x.band === l.band)?.tasks ??
        p.daily_work?.tasks ??
        [],
      focus: l.focus,
      requirement: l.requirement,
      entryKeywords: refs(kw?.entry),
      outputKeywords: refs(kw?.output),
      access: i === 0 && gate.kind === 'OPEN' ? 'OPEN' : 'LOCKED',
      lockedReason:
        i > 0
          ? 'Cần xong cấp trước'
          : gate.kind === 'PREREQUISITE'
            ? `Cần xong cấp ${gate.band} ở một nghề đi trước: ${gate.roles.map((r) => r.name).join(', ')}`
            : null,
      enrolmentId: null,
      questCount: seedCount(code, l.band),
    };
  });
  const playable = levels.some((l) => l.questCount > 0);
  catalogue.occupations.push({
    code,
    name: p.role_name_vn,
    shortName: p.role_name_vn.split(' / ')[0],
    group: p.role_group_vn,
    regionId,
    isIt: p.is_it,
    interestCode: p.interests?.interest_code ?? null,
    summary: p.overview.summary,
    levelCount: levels.length,
    playable,
    gate,
    my: { status: 'NEW', currentLevel: null, highestCompleted: null },
  });
  const e = p.education ?? {};
  const result = {
    code,
    name: p.role_name_vn,
    nameEn: p.role_name ?? null,
    group: p.role_group_vn,
    regionId,
    isIt: p.is_it,
    summary: p.overview.summary,
    fitSummary: p.overview.fit_summary ?? null,
    downsides: p.overview.downsides ?? [],
    workFacts: p.work_environment?.facts ?? [],
    settings: (p.work_environment?.settings ?? []).map(
      (id) => source._meta.work_settings[id] ?? id,
    ),
    environments: (p.work_environment?.environments ?? []).map((x) => ({
      name: source._meta.work_environments[x.id] ?? x.id,
      weight: x.weight,
    })),
    education: {
      preparation: e.preparation?.label_vn ?? null,
      note:
        [e.preparation?.education_vn, e.preparation?.note]
          .filter(Boolean)
          .join(' ') || null,
      university: (e.majors_university ?? []).map((x) => x.name),
      vocational: (e.majors_vocational ?? []).map((x) => x.name),
      licence: e.licence
        ? [e.licence.name, e.licence.law].filter(Boolean).join(' — ')
        : null,
    },
    levels,
    path: (p.career?.path ?? []).map((x) => ({
      stage: x.stage,
      label: x.label_vn,
      roles: x.roles.map((r) => ({ code: r.role_code, name: r.role_name_vn })),
    })),
    similar: (p.career?.similar ?? []).map((x) => ({
      code: x.role_code,
      name: x.role_name_vn,
      why: x.why,
    })),
    pay: payOf(p.pay),
    outlook: p.outlook
      ? {
          level: p.outlook.level,
          openPostings: p.outlook.open_postings ?? p.outlook.postings ?? 0,
          source: [
            p.outlook.source,
            p.outlook.open_postings == null ? p.outlook.note : null,
          ]
            .filter(Boolean)
            .join(' — '),
        }
      : null,
    keywords: k.keywords.map((x) => ({
      id: x.element,
      name: x.ten_vi,
      level: x.max_level,
    })),
    softEmphasis: Object.entries(p.skills?.soft ?? {})
      .map(([id, z]) => ({ id, z }))
      .sort((a, b) => b.z - a.z || a.id.localeCompare(b.id)),
    ratings: { responseCount: 0, withheld: true, averages: {} },
    gate,
    playable,
    attribution: source._meta.attribution,
  };
  await write(`profiles/${code}.json`, result);
  riasec[code] = Object.fromEntries(
    ['R', 'I', 'A', 'S', 'E', 'C'].map((a, i) => [
      a,
      p.interests?.riasec?.[
        [
          'Realistic',
          'Investigative',
          'Artistic',
          'Social',
          'Enterprising',
          'Conventional',
        ][i]
      ] ?? 0,
    ]),
  );
}
await write('catalogue.json', catalogue);
await write('riasec.json', riasec);
// Bản sao seed chỉ nằm trong demo; UI/live không nhập dataset nghề gốc.
await write('shift-seeds.json', shifts);
console.log(
  `${catalogue.occupations.length} nghề, ${groups.length} nhóm, ${catalogue.regions.length} vùng, ${seeds.length} shift seed.`,
);
