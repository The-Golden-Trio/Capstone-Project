// Sinh packages/game-core/data/galaxy-data.json — du lieu cho "Dai ngan ha nghe nghiep" (ban do 3D).
// Chay:  node docs/data/build-galaxy.mjs
//
// Nguon:
//   occupation-data/generated/role_graph.json                 — 22 hanh tinh + 64 canh (distance da tinh)
//   occupation-data/datasets/dataset_22_roles_enriched_v3.json      — ten, nhom, bands, hard skill (bao cao ITviec), su kien
//   occupation-data/datasets/dataset_final_merged.json       — hard/soft skill theo cap bac (chi co o 8/22 nghe)
//
// Ngoai du lieu, script nay con TINH SAN VI TRI 3D cua tung hanh tinh (force layout co seed).
// Tinh o build-time chu khong phai runtime vi:
//   - bo cuc on dinh: mo lai trang van thay dung vi tri cu, khong "nhay" moi lan
//   - khong can keo d3-force vao bundle, khong ton CPU luc mo trang
//   - co the nhin/kiem tra ket qua ngay o day (in ra ban kinh, cap gan nhat)

import fs from 'fs';

const GRAPH   = 'occupation-data/generated/role_graph.json';
const DATASET = 'occupation-data/datasets/dataset_22_roles_enriched_v3.json';
const MERGED  = 'occupation-data/datasets/dataset_final_merged.json';

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
// Moi he co mot "khi hau" chu dao (60%) va vai bien the, de hanh tinh cung he
// cung tong mau (mau he pha vao shader) nhung khong phai 9 qua giong het nhau.
const KINDS_BY_GROUP = {
  SWE: ['terra', 'cloud', 'ice'],     // dai duong + luc dia, den thanh pho ban dem
  QA: ['ice', 'cloud'],               // bang, sang, it chi tiet
  INFRA: ['desert', 'terra'],         // da, sa mac, vach nui
  SEC: ['lava', 'desert'],            // toi, nut dung nham phat sang
  CLOUD: ['cloud', 'terra'],          // khi quyen day, dai may cuon
  DATA: ['gas', 'pastel'],            // khi khong lo, dai ngang
  PROD: ['pastel', 'gas'],            // khi nhe, mau diu
};
function look(code, short) {
  const r = rng(hash(code));
  const kinds = KINDS_BY_GROUP[short];
  const kind = r() < 0.6 ? kinds[0] : kinds[1 + Math.floor(r() * (kinds.length - 1))];
  return {
    kind,
    seed: +(r() * 100).toFixed(2),
    radius: +(6.2 + r() * 2.2).toFixed(2),
    ring: r() < 0.38,
    moons: r() < 0.55 ? 1 + (r() < 0.3 ? 1 : 0) : 0,
    tilt: +((r() - 0.5) * 0.8).toFixed(3),
    spin: +(0.05 + r() * 0.12).toFixed(3),
  };
}

/* ── bo cuc 3D: moi nhom nghe la MOT HE MAT TROI ───────────────────────────
   Mat troi o tam he, hanh tinh nam tren cac quy dao tron dong tam. Quy dao co
   nghia: vong trong = nghe vao tu L1-L2, vong giua = L3-L5, vong ngoai = L6+
   (thang tien = di ra xa mat troi). 7 he xep tren mot vong quanh tam thien ha,
   he nao nhieu hanh tinh thi duoc chia goc rong hon. Moi he nghieng nhe mot
   goc khac nhau cho tu nhien.

   Truoc day dung force layout: gon nhung nhin nhu dam may diem, khong doc
   duoc "he nao / vong nao". */

const ORBIT_RADII = [46, 74, 102];   // vong 0 / 1 / 2, tinh tu mat troi
const ORBIT_MIN_SPACING = 44;        // hai hanh tinh cung vong cach nhau it nhat the nay (day cung)
const SYSTEM_MARGIN = 70;            // khoang trong giua hai he ke nhau tren vong thien ha
const GALAXY_RING = 270;             // ban kinh vong dat tam cac he

const bandNum = b => Number(String(b).replace(/\D/g, '')) || 1;
const orbitIndexOf = bandStart => (bandNum(bandStart) <= 2 ? 0 : bandNum(bandStart) <= 5 ? 1 : 2);

// xoay quanh Z roi quanh X — runtime (galaxy.ts: systemToWorld) phai dung dung
// thu tu nay de ve vong quy dao trung voi vi tri hanh tinh
const rotZ = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
const rotX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const angDist = (a, b) => { const d = Math.abs(a - b) % (Math.PI * 2); return Math.min(d, Math.PI * 2 - d); };

/* 1. Moi he: chia hanh tinh vao vong theo cap bac mo dau. He nao thieu hang
      giua (SWE chi co L1 va L6+) thi don vong lai cho khoi trong — nghia
      "cang xa mat troi cang senior" van giu nguyen. Vong nao dong qua thi
      day bot ra vong ngoai. */
const nodeInfo = new Map(graph.nodes.map(n => [n.roleCode, { code: n.roleCode, gi: groupIndex.get(n.roleGroup), bandStart: String(n.bands).split('-')[0] }]));
const systems = GROUPS.map((g, gi) => {
  const members = [...nodeInfo.values()].filter(n => n.gi === gi).sort((a, b) => bandNum(a.bandStart) - bandNum(b.bandStart));
  const tiers = [...new Set(members.map(m => orbitIndexOf(m.bandStart)))].sort((a, b) => a - b);
  const orbits = ORBIT_RADII.map(() => []);
  for (const m of members) {
    let oi = tiers.indexOf(orbitIndexOf(m.bandStart));
    while (oi < ORBIT_RADII.length - 1 && orbits[oi].length >= Math.floor((2 * Math.PI * ORBIT_RADII[oi]) / ORBIT_MIN_SPACING)) oi++;
    orbits[oi].push(m);
  }
  const extent = ORBIT_RADII[Math.max(0, ...orbits.map((o, i) => (o.length ? i : 0)))] + 18;
  return { gi, members, orbits, extent };
});

/* 2. Thu tu 7 he tren vong thien ha: thu het moi hoan vi vong (360 cai),
      chon cai lam tong "khoang cach vong" cua cac canh xuyen he nho nhat —
      he nao hay noi voi nhau thi dung canh nhau. */
const crossEdges = graph.edges
  .map(e => [nodeInfo.get(e.from).gi, nodeInfo.get(e.to).gi])
  .filter(([a, b]) => a !== b);
const permutations = arr => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));
let bestOrder = null, bestCost = Infinity;
for (const rest of permutations(GROUPS.map((_, i) => i).slice(1))) {
  const order = [0, ...rest];                       // co dinh he 0 o dau, tranh dem trung cac phep xoay
  const pos = new Map(order.map((gi, i) => [gi, i]));
  const n = order.length;
  let cost = 0;
  for (const [a, b] of crossEdges) { const d = Math.abs(pos.get(a) - pos.get(b)); cost += Math.min(d, n - d); }
  if (cost < bestCost) { bestCost = cost; bestOrder = order; }
}

/* 3. Chia goc tren vong thien ha theo be rong moi he, dat tam he. */
const arcOf = sys => 2 * sys.extent + SYSTEM_MARGIN;
const totalArc = bestOrder.reduce((s, gi) => s + arcOf(systems[gi]), 0);
const ringRadius = Math.max(GALAXY_RING, totalArc / (2 * Math.PI));
// he dau tien trong thu tu (SWE, noi nguoi choi bat dau) dat chinh giua phia +z —
// la phia gan camera trong goc nhin toan canh, de he lon nhat khong bi day ra xa
let cursor = Math.PI / 2 - ((arcOf(systems[bestOrder[0]]) / totalArc) * 2 * Math.PI) / 2;
const systemCenter = new Map();
for (const [i, gi] of bestOrder.entries()) {
  const span = (arcOf(systems[gi]) / totalArc) * 2 * Math.PI;
  const a = cursor + span / 2;
  cursor += span;
  const r = rng(hash(GROUPS[gi].short + ':tilt'));
  systemCenter.set(gi, {
    center: [Math.cos(a) * ringRadius, (i % 2 ? 1 : -1) * 16 + (r() - 0.5) * 10, Math.sin(a) * ringRadius],
    tilt: [(r() - 0.5) * 0.22, (r() - 0.5) * 0.22],   // [quanh X, quanh Z], radian
    phase: r() * Math.PI * 2,
  });
}

/* 4. Trong moi vong: xep hanh tinh vao cac o cach deu. Thu het hoan vi (toi da
      6! = 720), chon cach lam (a) hanh tinh co canh noi nhau dung gan nhau va
      (b) hanh tinh co canh xuyen he thi quay ve phia he do. */
const worldOf = new Map();  // code -> {position, orbit, angle}
const neighborsOf = code => graph.edges.filter(e => e.from === code || e.to === code).map(e => (e.from === code ? e.to : e.from));
for (const sys of systems) {
  const { center, tilt, phase } = systemCenter.get(sys.gi);
  const innerAngles = [];   // goc cua cac hanh tinh da dat o vong trong hon
  sys.orbits.forEach((planets, oi) => {
    if (!planets.length) return;
    const radius = ORBIT_RADII[oi];
    const n = planets.length;
    // vong ngoai lech NUA BUOC CUA VONG TRONG de khong co hanh tinh nao thang hang
    // theo ban kinh voi vong ke trong (khoang cach giua hai vong chi ~28)
    // Chon goc lech cho vong nay sao cho o gan nhat toi hanh tinh vong trong xa nhat co the.
    let offset = 0;
    if (innerAngles.length) {
      let bestGap = -1;
      for (let c = 0; c < 72; c++) {
        const cand = (c / 72) * Math.PI * 2;
        const gap = Math.min(...planets.map((_, k) => Math.min(...innerAngles.map(a => angDist(phase + cand + (k / n) * Math.PI * 2, a)))));
        if (gap > bestGap) { bestGap = gap; offset = cand; }
      }
    }
    const slots = planets.map((_, k) => phase + offset + (k / n) * Math.PI * 2);
    innerAngles.push(...slots);
    const prefAngle = new Map();
    for (const pl of planets) {
      let vx = 0, vz = 0;
      for (const nb of neighborsOf(pl.code)) {
        const info = nodeInfo.get(nb);
        if (info.gi !== sys.gi) {
          const c = systemCenter.get(info.gi).center;
          const dx = c[0] - center[0], dz = c[2] - center[2];
          const len = Math.hypot(dx, dz) || 1;
          vx += dx / len; vz += dz / len;
        }
      }
      if (vx || vz) prefAngle.set(pl.code, Math.atan2(vz, vx));
    }
    let best = null, bestCost = Infinity;
    for (const perm of permutations(planets)) {
      const angleOf = new Map(perm.map((pl, k) => [pl.code, slots[k]]));
      let cost = 0;
      for (const pl of perm) {
        for (const nb of neighborsOf(pl.code)) if (angleOf.has(nb)) cost += angDist(angleOf.get(pl.code), angleOf.get(nb)) * 0.5;
        if (prefAngle.has(pl.code)) cost += angDist(angleOf.get(pl.code), prefAngle.get(pl.code));
      }
      if (cost < bestCost) { bestCost = cost; best = perm; }
    }
    best.forEach((pl, k) => {
      const a = slots[k];
      const local = [Math.cos(a) * radius, 0, Math.sin(a) * radius];
      const w = rotX(rotZ(local, tilt[1]), tilt[0]);
      worldOf.set(pl.code, { position: [center[0] + w[0], center[1] + w[1], center[2] + w[2]], orbit: oi, angle: a });
    });
  });
}

const groups = GROUPS.map((g, gi) => {
  const { center, tilt } = systemCenter.get(gi);
  return {
    ...g,
    sun: center.map(v => +v.toFixed(1)),
    tilt: tilt.map(v => +v.toFixed(3)),
    orbits: systems[gi].orbits.map((o, i) => (o.length ? ORBIT_RADII[i] : null)).filter(v => v !== null),
  };
});

/* ── ghep lai ─────────────────────────────────────────────────────────── */
const outNodes = graph.nodes.map(n => {
  const w = worldOf.get(n.roleCode);
  const g = GROUPS[nodeInfo.get(n.roleCode).gi];
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
    position: w.position.map(v => +v.toFixed(1)),
    orbit: w.orbit,
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

// Du lieu vao database qua script seed; web lay qua API.
fs.mkdirSync('packages/game-core/data', { recursive: true });
fs.writeFileSync('packages/game-core/data/galaxy-data.json',
  `${JSON.stringify(out, null, 2)}\n`);

/* ── kiem ngay luc sinh ───────────────────────────────────────────────── */
let minPair = Infinity, minNames = '';
for (let i = 0; i < outNodes.length; i++) for (let j = i + 1; j < outNodes.length; j++) {
  const [a, b] = [outNodes[i].position, outNodes[j].position];
  const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  if (d < minPair) { minPair = d; minNames = `${outNodes[i].roleCode} – ${outNodes[j].roleCode}`; }
}
const radius = Math.max(...outNodes.map(n => Math.hypot(n.position[0], n.position[2])));
const noHard = outNodes.filter(n => !n.hardSkills.length).map(n => n.roleCode);
const noSoft = outNodes.filter(n => !n.softSkills.length).map(n => n.roleCode);
console.log(`packages/game-core/data/galaxy-data.json da sinh:`);
console.log(`  ${outNodes.length} hanh tinh | ${outEdges.length} canh | ${groups.length} he mat troi (vong thien ha r=${ringRadius.toFixed(0)}, thu tu: ${bestOrder.map(gi => GROUPS[gi].short).join(' → ')})`);
for (const sys of systems) console.log(`    ${GROUPS[sys.gi].short.padEnd(6)} ${sys.orbits.map((o, i) => o.length ? `vong${i}[${o.map(m => m.code).join(',')}]` : '').filter(Boolean).join(' ')}`);
console.log(`  ban kinh thien ha ~${radius.toFixed(0)} | cap gan nhat ${minPair.toFixed(1)} (${minNames})`);
console.log(`  chua co hard skill: ${noHard.join(', ') || 'khong'}`);
console.log(`  chua co soft skill: ${noSoft.join(', ') || 'khong'}`);
if (minPair < ORBIT_MIN_SPACING * 0.8) console.log(`  ⚠ co cap hanh tinh gan hon ORBIT_MIN_SPACING`);
