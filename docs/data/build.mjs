// Sinh docs/data/game-data.js cho prototype.
// Chay:  node docs/data/build.mjs
//
// Nguon:
//   occupation-data/datasets/final_22_roles.json  — 22 role, su kien, luong, graph
//   occupation-data/datasets/DRAFT_fit_quiz.json               — 6 cau hoi buoc 2
//   occupation-data/scenarios/**.json                  — kich ban sau
//
// Vi sao xuat .js chu khong de prototype fetch() cac file .json:
// trinh duyet chan fetch() tren file:// vi CORS, ma prototype phai mo duoc
// bang cach double-click. The <script> khong bi chan.

import fs from 'fs';

const DATASET  = 'occupation-data/datasets/final_22_roles.json';
const QUIZ     = 'occupation-data/datasets/DRAFT_fit_quiz.json';
const GROUP    = 'Software Engineering & Architecture';

const SCENARIOS = [
  ['SWE_BACKEND_L1_S_EXEC',     'occupation-data/scenarios/SWE_BACKEND/L1_S_EXEC.json'],
  ['SWE_BACKEND_L3_S_INCIDENT', 'occupation-data/scenarios/SWE_BACKEND/L3_S_INCIDENT.json'],
];

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const ds   = read(DATASET);
const quiz = read(QUIZ);
const DIMS = Object.keys(ds.fit_dimensions);

/* ── ho so hop nghe: SUY RA tu chinh su kien cua nghe do ───────────────
   Cong moi signal duong tren cac lua chon, chuan hoa ve 0-1.
   Y nghia: "nghe nay thuong cho tinh cach nao".
   KHONG phai so do that — danh dau _derived de khong ai nham.          */
function fitProfile(role) {
  const raw = Object.fromEntries(DIMS.map(d => [d, 0]));
  for (const ev of role.roleplay_events.role_specific)
    for (const ch of ev.choices)
      for (const [d, v] of Object.entries(ch.signal || {}))
        if (v > 0 && d in raw) raw[d] += v;
  const max = Math.max(...Object.values(raw), 1);
  return Object.fromEntries(DIMS.map(d => [d, +(raw[d] / max).toFixed(3)]));
}

const roles = ds.roles.filter(r => r.role_group === GROUP).map(r => {
  const byBand = (r.compensation?.by_band || []).map(b => ({
    band: b.band, label: b.label, salary_avg: b.salary_avg, evidence_level: b.evidence_level,
  }));
  const bands = String(r.bands).split('-');                    // "L1-L7" -> ["L1","L7"]
  return {
    role_code: r.role_code,
    role_name: r.role_name,
    role_name_vn: r.role_name_vn,
    role_group: r.role_group,
    experience: r.roleplay_experience,
    archetype: r.archetype,
    bands: r.bands,
    band_start: bands[0],
    band_end: bands[bands.length - 1],
    salary_by_band: byBand,
    salary_note: r.compensation?.role_level_salary?.note || null,
    // chi lay top_reasons_to_leave: top_reasons_to_apply bi hong nhan trong dataset
    // (cac muc co dang {label:"55.6%", pct:36.6}) — da ghi vao ke hoach de sua sau
    reasons_to_leave: (r.work_life?.top_reasons_to_leave || []).slice(0, 4),
    work_life_evidence: r.work_life?.evidence_level || null,
    similar_ranked: (r.graph_edges?.similar_ranked || []).slice(0, 4),
    progresses_to: r.graph_edges?.progresses_to || [],
    events: r.roleplay_events.role_specific,
    fit_profile: { _derived: true, ...fitProfile(r) },
  };
});

const out = {
  _meta: {
    generated_at: new Date().toISOString().slice(0, 10),
    source_dataset: DATASET,
    group: GROUP,
    note: 'SINH TU DONG. Sinh lai: node docs/data/build.mjs',
  },
  fit_dimensions: ds.fit_dimensions,
  // ten cua ca 22 nghe: goi y chuyen ngang thuong tro ra ngoai nhom,
  // can ten de hien du chua choi duoc
  all_roles: Object.fromEntries(ds.roles.map(r =>
    [r.role_code, { name_vn: r.role_name_vn, group: r.role_group, bands: r.bands }])),
  quiz,
  roles,
  shared_events: ds.shared_events,
  scenarios: Object.fromEntries(SCENARIOS.map(([k, p]) => [k, read(p)])),
};

const json = JSON.stringify(out, null, 2);

// Mot nguon, hai dau ra:
//   .json — packages/game-core/data, de script seed do vao database. Day moi
//           la duong di that cua du lieu: web va api lay qua API chu khong
//           nhap tu ma nguon nua.
//   .js   — docs/prototype.html mo bang file://, khong fetch() duoc vi CORS
fs.mkdirSync('packages/game-core/data', { recursive: true });
fs.writeFileSync('packages/game-core/data/game-data.json', `${json}\n`);
fs.writeFileSync('docs/data/game-data.js',
  `/* SINH TU DONG — dung sua tay. Sinh lai: node docs/data/build.mjs */\n\n` +
  `window.GAME = ${json};\n`);

/* ── kiem ngay luc sinh ─────────────────────────────────────────────── */
const codes = new Set(roles.map(r => r.role_code));
const prob = [];
for (const r of roles) {
  const nz = DIMS.filter(d => r.fit_profile[d] > 0).length;
  if (nz < 3) prob.push(`${r.role_code}: ho so hop nghe chi co ${nz} chieu khac 0`);
  if (!r.events.length) prob.push(`${r.role_code}: khong co su kien nao`);
  if (!r.band_start) prob.push(`${r.role_code}: khong doc duoc cap bac mo dau`);
}
for (const [k, s] of Object.entries(out.scenarios))
  if (!codes.has(s.job.role_code)) prob.push(`${k}: role_code ngoai nhom ${GROUP}`);

const evCount = roles.reduce((n, r) => n + r.events.length, 0);
console.log(`packages/game-core/data/game-data.json + docs/data/game-data.js da sinh:`);
console.log(`  ${roles.length} nghe | ${evCount} su kien rieng + ${out.shared_events.length} dung chung`);
console.log(`  ${Object.keys(out.scenarios).length} kich ban | ${quiz.questions.length} cau hoi`);
console.log(`  cap bac mo dau: ${roles.map(r => r.role_code + '=' + r.band_start).join(', ')}`);
// similar_ranked co the tro ra ngoai nhom — do la dung, vi doi nghe la doi ca nhom
const outside = new Set();
for (const r of roles) for (const s of r.similar_ranked) if (!codes.has(s.role_code)) outside.add(s.role_code);
console.log(`  nghe ben canh tro ra ngoai nhom: ${[...outside].join(', ') || 'khong co'}`);
console.log(prob.length ? `\n  ⚠ ${prob.length} van de:\n   - ${prob.join('\n   - ')}` : `\n  khong van de nao`);
