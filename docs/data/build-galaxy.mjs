// Sinh apps/web/src/galaxy/galaxy-data.ts — du lieu cho "Dai ngan ha nghe nghiep" (ban do 3D).
// Chay:  node docs/data/build-galaxy.mjs
//
// Nguon:
//   occupation-data/output/role_graph.json                 — 22 hanh tinh + 64 canh (distance da tinh)
//   occupation-data/dataset_22_roles_enriched_v3.json      — ten, nhom, bands, hard skill (bao cao ITviec), su kien
//   occupation-data/output/dataset_final_merged.json       — hard/soft skill theo cap bac (chi co o 8/22 nghe)
//
// Ngoai du lieu, script nay con TINH SAN VI TRI 3D cua tung hanh tinh (force layout co seed).
// Tinh o build-time chu khong phai runtime vi:
//   - bo cuc on dinh: mo lai trang van thay dung vi tri cu, khong "nhay" moi lan
//   - khong can keo d3-force vao bundle, khong ton CPU luc mo trang
//   - co the nhin/kiem tra ket qua ngay o day (in ra ban kinh, cap gan nhat)

import fs from 'fs';

const GRAPH   = 'occupation-data/output/role_graph.json';
const DATASET = 'occupation-data/dataset_22_roles_enriched_v3.json';
const MERGED  = 'occupation-data/output/dataset_final_merged.json';
const TS_OUT  = 'apps/web/src/galaxy/galaxy-data.ts';

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const graph  = read(GRAPH);
const ds     = read(DATASET);
const merged = read(MERGED);

/* ── nhom nghe = mot "he sao" ──────────────────────────────────────────
   Thu tu tren vong tron KHONG tuy tien: nhom nao hay co canh noi sang nhau
   thi dat ke nhau (SWE-QA, SWE-PROD, DATA-PROD, CLOUD-SEC, INFRA-SEC) de
   canh xuyen nhom khong phai bang qua tam ngan ha. */
const GROUPS = [
  { name: 'Software Engineering & Architecture', short: 'SWE',   label: 'Kỹ thuật phần mềm',   color: '#5b9cf5' },
  { name: 'Quality Assurance & Testing',         short: 'QA',    label: 'Kiểm thử',            color: '#f2c94c' },
  { name: 'IT Infrastructure & Enterprise Systems', short: 'INFRA', label: 'Hạ tầng & Hệ thống', color: '#f0925a' },
  { name: 'Cyber Security',                      short: 'SEC',   label: 'An ninh mạng',        color: '#ef6b6b' },
  { name: 'Cloud, DevOps & SRE',                 short: 'CLOUD', label: 'Cloud & DevOps',      color: '#3dd9c1' },
  { name: 'Data, AI & Machine Learning',         short: 'DATA',  label: 'Dữ liệu & AI',        color: '#a97cff' },
  { name: 'Product & Project Management',        short: 'PROD',  label: 'Sản phẩm & Dự án',    color: '#f27bb5' },
];
const groupIndex = new Map(GROUPS.map((g, i) => [g.name, i]));
for (const n of graph.nodes) if (!groupIndex.has(n.roleGroup)) throw new Error(`role_group la: ${n.roleGroup}`);

/* ── PRNG co seed (mulberry32): cung input -> cung bo cuc ─────────────── */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

/* ── ky nang ──────────────────────────────────────────────────────────── */
const dsRole = new Map(ds.roles.map(r => [r.role_code, r]));
const mergedRole = new Map(merged.map(r => [r.role_code, r]));

const uniq = arr => [...new Set(arr.map(s => String(s).trim()).filter(Boolean))];
const skillName = s => (typeof s === 'string' ? s : s?.skill ?? s?.name ?? null);

/* Hard skill: uu tien dataset merged (ky nang dung cua nghe, theo cap bac thap -> cao),
   thieu thi lay bao cao ITviec — nhung bao cao do chi hoi ngon ngu/framework nen voi
   nghe it code (BA, PM, Helpdesk) no ra toan Java/.NET, chi dung lam phuong an cuoi. */
const JUNK = new Set(['not using', 'khong dung', 'other', 'khac']);
function hardSkills(code) {
  const m = mergedRole.get(code);
  const fromLevels = (Array.isArray(m?.levels) ? m.levels : []).flatMap(l => (l.skills_hard ?? []).map(skillName));
  if (fromLevels.length) return { list: uniq(fromLevels).slice(0, 8), source: 'dataset_merged' };

  const r = dsRole.get(code);
  const fromReport = [
    ...(r?.skills_status?.hard_skills_languages ?? []),
    ...(r?.skills_status?.hard_skills_frameworks ?? []),
  ].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).map(x => x.skill)
    .filter(x => !JUNK.has(String(x).trim().toLowerCase()));
  if (fromReport.length) return { list: uniq(fromReport).slice(0, 8), source: 'itviec_report' };
  return { list: [], source: null };
}

/* Soft skill: chi co o dataset merged. Bao cao ITviec KHONG liet ke soft skill —
   nghe nao thieu thi de rong, UI phai noi ro "chua co du lieu" chu khong bia. */
function softSkills(code) {
  const m = mergedRole.get(code);
  const list = (Array.isArray(m?.levels) ? m.levels : []).flatMap(l => (l.skills_soft ?? []).map(skillName));
  return uniq(list).slice(0, 6);
}

/* Su kien ngan cua nghe — dung lam "bai kiem tra nhap canh" 3 cau. */
function entryEvents(code) {
  const r = dsRole.get(code);
  return (r?.roleplay_events?.role_specific ?? []).slice(0, 3).map(e => ({
    id: e.event_id,
    title: e.title,
    setup: e.setup,
    choices: e.choices.map(c => ({ text: c.text, outcome: c.outcome })),
  }));
}

/* ── hinh dang hanh tinh: suy tu nhom + seed, moi nghe mot kieu ────────── */
const KIND_BY_GROUP = {
  SWE: 'terra',    // dai duong + luc dia, den thanh pho ban dem
  QA: 'ice',       // bang, sang, it chi tiet
  INFRA: 'desert', // da, sa mac, vach nui
  SEC: 'lava',     // toi, nut dung nham phat sang
  CLOUD: 'cloud',  // khi quyen day, dai may cuon
  DATA: 'gas',     // khi khong lo, dai ngang
  PROD: 'pastel',  // khi nhe, mau diu
};
function look(code, short) {
  const r = rng(hash(code));
  return {
    kind: KIND_BY_GROUP[short],
    seed: +(r() * 100).toFixed(2),
    radius: +(6.2 + r() * 2.2).toFixed(2),
    ring: r() < 0.38,
    moons: r() < 0.55 ? 1 + (r() < 0.3 ? 1 : 0) : 0,
    tilt: +((r() - 0.5) * 0.8).toFixed(3),
    spin: +(0.05 + r() * 0.12).toFixed(3),
  };
}

/* ── bo cuc 3D: force layout co seed, ep thanh dia det ─────────────────── */
const R_RING = 170;          // ban kinh vong tron dat tam cac he sao
const REST_BASE = 42;        // canh ngan nhat (distance=0)
const REST_SCALE = 105;      // canh dai nhat = REST_BASE + REST_SCALE
const MIN_GAP = 40;          // hai hanh tinh khong duoc gan hon the nay
const SUN_GAP = 38;          // mat troi cach hanh tinh gan nhat it nhat the nay

const groupCenters = GROUPS.map((g, i) => {
  const a = (i / GROUPS.length) * Math.PI * 2 - Math.PI / 2;
  // xen ke len/xuong mot chut de ngan ha co be day, khong phang li nhu ban ve
  return { x: Math.cos(a) * R_RING, y: (i % 2 ? 1 : -1) * 14, z: Math.sin(a) * R_RING };
});

const nodes = graph.nodes.map(n => {
  const gi = groupIndex.get(n.roleGroup);
  const r = rng(hash(n.roleCode + ':pos'));
  const c = groupCenters[gi];
  return {
    code: n.roleCode, gi,
    x: c.x + (r() - 0.5) * 60, y: c.y + (r() - 0.5) * 10, z: c.z + (r() - 0.5) * 60,
    vx: 0, vy: 0, vz: 0,
  };
});
const byCode = new Map(nodes.map(n => [n.code, n]));
const springs = graph.edges.map(e => ({
  a: byCode.get(e.from), b: byCode.get(e.to),
  rest: REST_BASE + e.distance * REST_SCALE,
  k: e.type === 'SIMILAR' ? 0.05 : 0.035,
}));

for (let iter = 0; iter < 900; iter++) {
  const cool = 1 - iter / 900;
  // day nhau ra (moi cap)
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    let dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    let d = Math.hypot(dx, dy, dz) || 0.01;
    const f = 2600 / (d * d);
    dx /= d; dy /= d; dz /= d;
    a.vx -= dx * f; a.vy -= dy * f; a.vz -= dz * f;
    b.vx += dx * f; b.vy += dy * f; b.vz += dz * f;
    // va cham cung: khong cho chong len nhau
    if (d < MIN_GAP) {
      const push = (MIN_GAP - d) * 0.5;
      a.x -= dx * push; a.y -= dy * push; a.z -= dz * push;
      b.x += dx * push; b.y += dy * push; b.z += dz * push;
    }
  }
  // lo xo theo canh: cang giong nhau cang gan
  for (const s of springs) {
    let dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, dz = s.b.z - s.a.z;
    const d = Math.hypot(dx, dy, dz) || 0.01;
    const f = (d - s.rest) * s.k;
    dx /= d; dy /= d; dz /= d;
    s.a.vx += dx * f; s.a.vy += dy * f; s.a.vz += dz * f;
    s.b.vx -= dx * f; s.b.vy -= dy * f; s.b.vz -= dz * f;
  }
  for (const n of nodes) {
    const c = groupCenters[n.gi];
    // keo ve he sao cua minh (yeu) + ve tam ngan ha (rat yeu)
    n.vx += (c.x - n.x) * 0.012 - n.x * 0.0015;
    n.vz += (c.z - n.z) * 0.012 - n.z * 0.0015;
    // ep det: y bam theo he sao, chi de lai chut be day
    n.vy += (c.y - n.y) * 0.1;
    n.vx *= 0.82; n.vy *= 0.82; n.vz *= 0.82;
    const step = Math.min(1, 0.35 + cool);
    n.x += n.vx * step; n.y += n.vy * step; n.z += n.vz * step;
  }
}

// dua tam khoi ve goc toa do
const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
const cz = nodes.reduce((s, n) => s + n.z, 0) / nodes.length;
for (const n of nodes) { n.x -= cx; n.z -= cz; }

// tam moi he sao = trung binh hanh tinh trong he (sau layout), mat troi dat o day
const groups = GROUPS.map((g, i) => {
  const members = nodes.filter(n => n.gi === i);
  const cxg = members.reduce((s, n) => s + n.x, 0) / members.length;
  const cyg = members.reduce((s, n) => s + n.y, 0) / members.length;
  const czg = members.reduce((s, n) => s + n.z, 0) / members.length;
  // mat troi lech khoi tam mot chut de khong nam giua hai hanh tinh,
  // roi nang len cho toi khi cach moi hanh tinh trong he it nhat SUN_GAP
  const r = rng(hash(g.short + ':sun'));
  const sx = cxg + (r() - 0.5) * 30, sz = czg + (r() - 0.5) * 30;
  let sy = cyg + 14;
  for (const n of members) {
    const dxz = Math.hypot(n.x - sx, n.z - sz);
    if (dxz < SUN_GAP) sy = Math.max(sy, n.y + Math.sqrt(SUN_GAP * SUN_GAP - dxz * dxz));
  }
  return { ...g, sun: [+sx.toFixed(1), +sy.toFixed(1), +sz.toFixed(1)] };
});

/* ── ghep lai ─────────────────────────────────────────────────────────── */
const outNodes = graph.nodes.map(n => {
  const p = byCode.get(n.roleCode);
  const g = GROUPS[p.gi];
  const r = dsRole.get(n.roleCode);
  const hard = hardSkills(n.roleCode);
  const [bandStart, bandEnd] = String(n.bands).split('-');
  return {
    roleCode: n.roleCode,
    nameVn: n.nameVn,
    nameEn: n.nameEn,
    group: g.short,
    bands: n.bands,
    bandStart,
    bandEnd,
    experience: r?.roleplay_experience ?? null,
    hardSkills: hard.list,
    hardSkillSource: hard.source,
    softSkills: softSkills(n.roleCode),
    events: entryEvents(n.roleCode),
    position: [+p.x.toFixed(1), +p.y.toFixed(1), +p.z.toFixed(1)],
    look: look(n.roleCode, g.short),
  };
});

const outEdges = graph.edges.map(e => {
  const from = dsRole.get(e.from);
  const sim = from?.graph_edges?.similar_ranked?.find(s => s.role_code === e.to);
  return {
    id: e.id,
    from: e.from,
    to: e.to,
    type: e.type,
    distance: e.distance,
    why: sim?.why ?? null,
    sharedSkills: sim?.shared_skills_top ?? [],
  };
});

const out = {
  _meta: {
    generated_at: new Date().toISOString().slice(0, 10),
    sources: [GRAPH, DATASET, MERGED],
    note: 'SINH TU DONG. Sinh lai: node docs/data/build-galaxy.mjs',
  },
  groups,
  nodes: outNodes,
  edges: outEdges,
};

fs.mkdirSync('apps/web/src/galaxy', { recursive: true });
fs.writeFileSync(TS_OUT,
  `/* SINH TU DONG — dung sua tay. Sinh lai: node docs/data/build-galaxy.mjs */\n\n` +
  `export const RAW_GALAXY_DATA: unknown = ${JSON.stringify(out, null, 2)};\n`);

/* ── kiem ngay luc sinh ───────────────────────────────────────────────── */
let minPair = Infinity, minNames = '';
for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
  const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y, nodes[i].z - nodes[j].z);
  if (d < minPair) { minPair = d; minNames = `${nodes[i].code} – ${nodes[j].code}`; }
}
const radius = Math.max(...nodes.map(n => Math.hypot(n.x, n.z)));
const noHard = outNodes.filter(n => !n.hardSkills.length).map(n => n.roleCode);
const noSoft = outNodes.filter(n => !n.softSkills.length).map(n => n.roleCode);
console.log(`${TS_OUT} da sinh:`);
console.log(`  ${outNodes.length} hanh tinh | ${outEdges.length} canh | ${groups.length} he sao`);
console.log(`  ban kinh ngan ha ~${radius.toFixed(0)} | cap gan nhat ${minPair.toFixed(1)} (${minNames})`);
console.log(`  chua co hard skill: ${noHard.join(', ') || 'khong'}`);
console.log(`  chua co soft skill: ${noSoft.join(', ') || 'khong'}`);
if (minPair < MIN_GAP * 0.8) console.log(`  ⚠ co cap hanh tinh gan hon MIN_GAP`);
