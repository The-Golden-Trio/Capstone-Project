/* Sinh file .excalidraw: sơ đồ màn hình của apps/web */
import { writeFileSync } from 'node:fs';

let n = 0;
const uid = () => `el${(++n).toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const rnd = () => Math.floor(Math.random() * 2 ** 31);
const NOW = Date.now();

const base = () => ({
  angle: 0, strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100,
  groupIds: [], frameId: null, roundness: null, seed: rnd(), version: 1,
  versionNonce: rnd(), isDeleted: false, boundElements: null, updated: NOW,
  link: null, locked: false,
});

const els = [];

const rect = (o) => {
  const el = { ...base(), id: o.id ?? uid(), type: 'rectangle', x: o.x, y: o.y,
    width: o.w, height: o.h, strokeColor: o.stroke ?? '#1e1e1e',
    backgroundColor: o.bg ?? 'transparent', fillStyle: 'solid',
    strokeStyle: o.dashed ? 'dashed' : 'solid', strokeWidth: o.sw ?? 2,
    roundness: { type: 3 }, roughness: 1, groupIds: o.group ? [o.group] : [] };
  els.push(el); return el;
};

/** fontFamily: 1 = viết tay, 2 = Helvetica (đủ dấu tiếng Việt), 3 = mono */
const text = (o) => {
  const size = o.size ?? 13, fam = o.fam ?? 2;
  const lines = o.text.split('\n');
  const per = fam === 3 ? 0.6 : 0.54;
  const el = { ...base(), id: uid(), type: 'text', x: o.x, y: o.y,
    width: o.w ?? Math.max(...lines.map((l) => l.length)) * size * per,
    height: lines.length * size * 1.25, strokeColor: o.color ?? '#1e1e1e',
    backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1,
    roughness: 1, fontSize: size, fontFamily: fam, text: o.text,
    originalText: o.text, textAlign: o.align ?? 'left', verticalAlign: 'top',
    containerId: null, lineHeight: 1.25, autoResize: true,
    groupIds: o.group ? [o.group] : [] };
  els.push(el); return el;
};

const arrow = (o) => {
  const [sx, sy] = o.points[0];
  const el = { ...base(), id: uid(), type: 'arrow', x: sx, y: sy,
    width: Math.max(...o.points.map((p) => p[0])) - Math.min(...o.points.map((p) => p[0])),
    height: Math.max(...o.points.map((p) => p[1])) - Math.min(...o.points.map((p) => p[1])),
    strokeColor: o.color ?? '#1e1e1e', backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: o.sw ?? 2, strokeStyle: o.style ?? 'solid',
    points: o.points.map(([x, y]) => [x - sx, y - sy]), lastCommittedPoint: null,
    startBinding: o.from ? { elementId: o.from, focus: 0, gap: 4 } : null,
    endBinding: o.to ? { elementId: o.to, focus: 0, gap: 4 } : null,
    startArrowhead: null, endArrowhead: 'arrow', elbowed: false };
  els.push(el); return el;
};

/* ── ngắt dòng theo số ký tự ── */
const wrap = (s, max) => {
  const out = [];
  for (const para of s.split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; }
      else line += ' ' + w;
    }
    out.push(line.trim());
  }
  return out;
};

/* ── Bảng màu theo tầng ── */
const C = {
  auth:  { stroke: '#1971c2', bg: '#e7f5ff' },
  gate:  { stroke: '#e03131', bg: '#fff5f5', dashed: true },
  shell: { stroke: '#343a40', bg: '#f1f3f5' },
  quiz:  { stroke: '#6741d9', bg: '#f3f0ff' },
  galaxy:{ stroke: '#0c8599', bg: '#e3fafc' },
  career:{ stroke: '#e8590c', bg: '#fff4e6' },
  play:  { stroke: '#2f9e44', bg: '#ebfbee' },
  me:    { stroke: '#343a40', bg: '#f8f9fa' },
};

const TIERS = [
  '0 · NGOÀI CỔNG',
  '1 · CỔNG + KHUNG APP',
  '2 · TỰ VẤN',
  '3 · CHỌN NGHỀ',
  '4 · TRONG MỘT NGHỀ',
  '5 · CHƠI + TỔNG KẾT',
  '6 · HỒ SƠ / TÀI KHOẢN',
];

const SCREENS = [
{ id:'login', tier:0, c:'auth', route:'/login', name:'Đăng nhập',
  show:['Ô email / mật khẩu','Nút Google','Đổi ngôn ngữ VI/EN'],
  exits:[['gate','main','đăng nhập xong'],['register','side','chưa có tài khoản']] },

{ id:'register', tier:0, c:'auth', route:'/register', name:'Tạo tài khoản',
  show:['Tên · username · email','Mật khẩu · NGÀY SINH','Nút Google'],
  exits:[['gate','main','tạo xong'],['login','side','đã có tài khoản']] },

{ id:'gate', tier:1, c:'gate', route:'RequireAuth · decideGate()', name:'CỔNG (không phải màn)',
  show:['chưa đăng nhập → /login','<16t chưa đồng ý → /consent','chưa tự vấn → /quiz','qua hết → AppShell'],
  exits:[['consent','guard','consent pending'],['quiz','guard','chưa tự vấn'],['galaxy','main','qua cổng']] },

{ id:'shell', tier:1, c:'shell', route:'AppShell', name:'Khung chung',
  show:['Topbar: logo · điểm ◆ · huy hiệu','Chip "Đang ở" (nghề + cấp)','XpBar đáy màn'],
  exits:[['galaxy','main','logo / Bản đồ nghề'],['profile','side','huy hiệu'],['band','side','Đang ở → Tiếp tục']] },

{ id:'consent', tier:2, c:'quiz', route:'/consent', name:'Người lớn đồng ý',
  show:['Tên + email người giám hộ','Ghi rõ: chỉ ghi nhận'],
  exits:[['gate','back','ghi nhận xong']] },

{ id:'quiz', tier:2, c:'quiz', route:'/quiz', name:'Get to Know Me',
  show:['6 câu, mỗi màn 1 câu','3-4 thẻ lựa chọn','Nút bỏ qua'],
  exits:[['quizresult','main','hết 6 câu'],['galaxy','side','bỏ qua']] },

{ id:'quizresult', tier:2, c:'quiz', route:'/quiz/result', name:'Chân dung',
  show:['StarMap: 3 nghề hợp nhất','FitRadar 8 chiều','Cảnh báo: chưa kiểm định'],
  exits:[['galaxy','main','mở toàn bản đồ'],['sea','side','bấm ngôi sao']] },

{ id:'galaxy', tier:3, c:'galaxy', route:'/jobs', name:'BẢN ĐỒ NGÂN HÀ (3D)',
  show:['Hành tinh = nghề, đường bay','Buồng lái: đang ở · điểm · đã ghé','Dock hành tinh lân cận','PlanetPanel: điều kiện nhập cảnh','Modal kiểm tra nhập cảnh → visa'],
  exits:[['sea','main','Trải nghiệm nghề này'],['galaxy','self','bay sang hành tinh kề']] },

{ id:'sea', tier:4, c:'career', route:'/jobs/:roleCode', name:'Quần đảo của nghề',
  show:['Mỗi cấp bậc L1…L10 = 1 đảo','LevelPanel: lương · điểm · nhân vật','Nút Vào học / Tiếp tục học'],
  exits:[['band','main','ghi danh'],['galaxy','back','về bản đồ nghề']] },

{ id:'band', tier:4, c:'career', route:'/jobs/:role/:band', name:'Bản đồ giấy của đảo',
  show:['Ngọc = nhiệm vụ chính (1)','Núi/rừng = nhiệm vụ phụ','QuestBox cạnh ký hiệu:','· phụ: hỏi-đáp tại chỗ, +điểm','· chính: mở màn chơi'],
  exits:[['play','main','bắt đầu nhiệm vụ chính'],['sea','guard','chưa ghi danh'],['sea','back','ra khơi lại']] },

{ id:'play', tier:5, c:'play', route:'/play/:scenarioKey', name:'MÀN CHƠI',
  show:['Trái: bối cảnh · nhân vật · kỹ năng','Phải: hội thoại + hoạt động','4 kiểu: chọn / xếp / ưu tiên / viết','Sự kiện xen ngang · hỏi vặn','Hoặc: văn phòng 2D đi bằng D-pad'],
  exits:[['end','main','hết hoạt động'],['band','back','rời màn chơi'],['galaxy','guard','server từ chối']] },

{ id:'end', tier:5, c:'play', route:'/play/:key/end', name:'Tổng kết',
  show:['Kết cục + điểm (cứng / mềm)','Mở cấp bậc mới','Bằng chứng: làm tốt / chú ý','Chấm sao độ thực tế'],
  exits:[['profile','main','xem hành trang'],['band','side','nhiệm vụ khác'],['play','back','chơi lại']] },

{ id:'profile', tier:6, c:'me', route:'/profile', name:'Hành trang',
  show:['Thẻ nhân vật: điểm + cơ cấu','Kỹ năng · tiến bộ theo ngày','Lộ trình cấp bậc L1→L10','Lịch sử lượt chơi · FitRadar'],
  exits:[['quiz','side','làm lại tự vấn'],['account','side','⚙ Tài khoản'],['galaxy','back','mở bản đồ']] },

{ id:'account', tier:6, c:'me', route:'/account', name:'Tài khoản',
  show:['Tên hiển thị · email','Mật khẩu · liên kết Google','Quyền riêng tư · xoá tài khoản'],
  exits:[['login','back','đăng xuất'],['register','back','xoá tài khoản']] },

{ id:'error', tier:6, c:'me', route:'*', name:'Lỗi / không có trang',
  show:['Mã lỗi + chi tiết','Nút về đầu · tải lại'],
  exits:[['gate','back','về "/"']] },
];

/* ── Bố cục rắn bò ─────────────────────────────────────────────────────
   Màn kế tiếp luôn nằm ngay cạnh màn trước: hàng 1 chạy sang phải, hàng 2
   chạy ngược về trái, hàng 3 lại sang phải. Nhờ vậy mũi tên của luồng
   chính chỉ dài đúng một khoảng ô, không phải kéo dọc cả sơ đồ.
   [cột, hàng] — cột 0 ở trái ngoài cùng. */
const LAYOUT = {
  register:[0,0], consent:[1,0], shell:[3,0],
  login:[0,1], gate:[1,1], quiz:[2,1], quizresult:[3,1],
  play:[0,2], band:[1,2], sea:[2,2], galaxy:[3,2],
  end:[0,3], profile:[1,3], account:[2,3], error:[3,3],
};
const FLOW = ['login','gate','quiz','quizresult','galaxy','sea','band','play','end','profile'];

const CARD_W = 360, COLW = 460, ROW_GAP = 150, WRAP = 40;
const CHIP_MAX = 900;              // xa hơn chừng này thì thay mũi tên bằng thẻ nhảy
const STYLE = {
  main:  { color: '#1e1e1e', style: 'solid',  sw: 2.5 },
  side:  { color: '#1971c2', style: 'dashed', sw: 1.5 },
  guard: { color: '#e03131', style: 'dotted', sw: 1.5 },
  back:  { color: '#868e96', style: 'dashed', sw: 1.5 },
};

const byId = new Map(SCREENS.map((s) => [s.id, s]));
for (const s of SCREENS) {
  [s.col, s.row] = LAYOUT[s.id];
  s.showLines = s.show.flatMap((l) => wrap(l, WRAP)).map((l) => '· ' + l);
  s.chips = [];
  s.h = 70 + s.showLines.length * 18 + 16;
}

/* xếp chỗ: hàng nào cao nhất quyết định khoảng cách xuống hàng kế */
const rows = [...new Set(SCREENS.map((s) => s.row))].sort((a, b) => a - b);
const place = () => {
  let y = 0;
  for (const r of rows) {
    const row = SCREENS.filter((s) => s.row === r);
    for (const s of row) { s.x = s.col * COLW; s.y = y; }
    y += Math.max(...row.map((s) => s.h)) + ROW_GAP;
  }
};
place();

/* Liên kết nào quá xa, hoặc phải xuyên qua một thẻ khác mới tới nơi, thì
   không kéo dây nữa — ghi thành một viên "thẻ nhảy" ngay trong thẻ nguồn.
   Đó chính là chỗ đẻ ra những mũi tên dài, khó dò nhất khi đọc. */
const dist = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.9);
const blocked = (a, b) => {
  const x1 = a.x + CARD_W / 2, y1 = a.y + a.h / 2, x2 = b.x + CARD_W / 2, y2 = b.y + b.h / 2;
  return SCREENS.some((o) => {
    if (o === a || o === b) return false;
    for (let k = 0.05; k <= 0.95; k += 0.05) {
      const X = x1 + (x2 - x1) * k, Y = y1 + (y2 - y1) * k;
      if (X > o.x - 10 && X < o.x + CARD_W + 10 && Y > o.y - 10 && Y < o.y + o.h + 10) return true;
    }
    return false;
  });
};

const links = [];
for (const s of SCREENS) {
  for (const [toId, type, lab] of s.exits) {
    if (type === 'self' || toId === s.id) continue;
    const t = byId.get(toId);
    if (dist(s, t) > CHIP_MAX || blocked(s, t)) s.chips.push({ t, type, lab });
    else links.push({ s, t, type, lab });
  }
}
for (const s of SCREENS) if (s.chips.length) s.h += 10 + s.chips.length * 26;
place();

/* ── vẽ thẻ ────────────────────────────────────────────────────────── */
for (const s of SCREENS) {
  const c = C[s.c];
  s.rectId = uid();
  const g = uid();
  rect({ id: s.rectId, group: g, x: s.x, y: s.y, w: CARD_W, h: s.h, stroke: c.stroke, bg: c.bg, dashed: c.dashed });
  text({ group: g, x: s.x + 16, y: s.y + 13, text: s.name, size: 20, color: c.stroke });
  text({ group: g, x: s.x + 16, y: s.y + 42, text: s.route, size: 12, fam: 3, color: '#868e96' });
  text({ group: g, x: s.x + 16, y: s.y + 68, text: s.showLines.join('\n'), size: 14, color: '#212529' });

  s.chips.forEach((ch, i) => {
    const st = STYLE[ch.type] ?? STYLE.main;
    const t = `↪ ${ch.t.name} · ${ch.lab}`;
    const short = t.length > 40 ? t.slice(0, 39) + '…' : t;
    const cy = s.y + s.h - 10 - (s.chips.length - i) * 26;
    rect({ group: g, x: s.x + 16, y: cy, w: Math.min(CARD_W - 32, short.length * 11 * 0.55 + 20), h: 22,
      stroke: st.color, bg: '#ffffff', dashed: ch.type !== 'main', sw: 1.2 });
    text({ group: g, x: s.x + 26, y: cy + 4, text: short, size: 11, color: st.color });
  });
}

/* ── tiêu đề + cách đọc: nhét vào ô trống của hàng đầu ─────────────── */
text({ x: 0, y: -132, text: 'VÀO NGHỀ — sơ đồ màn hình (apps/web)', size: 28, color: '#1e1e1e' });
text({ x: 0, y: -94, text: 'Đi theo số 1 → 10 là đường của người chơi. Mỗi thẻ: màn hình hiện gì + đi tới đâu.', size: 14, color: '#495057' });

const lg = [
  'Số 1→10 = luồng chính. Hàng trên chạy sang phải, hàng',
  'dưới vòng ngược về trái, nên màn kế tiếp luôn nằm ngay',
  'cạnh màn trước — mũi tên không phải kéo dài.',
  '',
  '───   luồng chính (đen)',
  '╌╌╌   lối phụ / tắt ngang (xanh)',
  '·····   cổng chặn & chuyển hướng (đỏ)',
  '╌╌╌   quay lại (xám)',
  '',
  '↪ thẻ nhảy: đường quá xa hoặc phải xuyên qua thẻ khác',
  'thì ghi thẳng tên màn đích trong thẻ nguồn.',
  '',
  'Màu thẻ: xanh dương ngoài cổng · đỏ cổng · tím tự vấn',
  'xanh ngọc ngân hà · cam trong nghề · xanh lá màn chơi',
];
rect({ x: 2 * COLW, y: 0, w: CARD_W + 20, h: 270, stroke: '#adb5bd', bg: '#ffffff' });
text({ x: 2 * COLW + 18, y: 14, text: 'CÁCH ĐỌC', size: 11, fam: 3, color: '#adb5bd' });
text({ x: 2 * COLW + 18, y: 38, text: lg.join('\n'), size: 12, color: '#343a40' });

/* số thứ tự luồng chính, đọc theo là ra đường đi */
FLOW.forEach((id, i) => {
  const s = byId.get(id);
  rect({ x: s.x - 15, y: s.y - 15, w: 30, h: 30, stroke: '#1e1e1e', bg: '#ffec99', sw: 1.5 });
  text({ x: s.x - (i + 1 > 9 ? 9 : 5), y: s.y - 9, text: String(i + 1), size: 16, color: '#1e1e1e' });
});

/* ── mũi tên: cong nhẹ, nối hai cạnh gần nhau nhất ─────────────────── */
const slot = new Map();
const LADDER = [0, -1, 1, -2, 2];
const pick = (key) => { const i = slot.get(key) ?? 0; slot.set(key, i + 1); return LADDER[i % LADDER.length]; };

/** điểm cắm trên cạnh quay về phía thẻ kia */
const anchor = (a, b, spread) => {
  const dx = (b.x + CARD_W / 2) - (a.x + CARD_W / 2), dy = (b.y + b.h / 2) - (a.y + a.h / 2);
  if (Math.abs(dx) > Math.abs(dy) * 1.1) {
    const k = pick(`${a.id}:${dx > 0 ? 'R' : 'L'}`) * Math.min(spread, a.h / 3);
    return [dx > 0 ? a.x + CARD_W : a.x, a.y + a.h / 2 + k];
  }
  const k = pick(`${a.id}:${dy > 0 ? 'B' : 'T'}`) * spread;
  return [a.x + CARD_W / 2 + k, dy > 0 ? a.y + a.h : a.y];
};

const placed = [];
const hits = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const walls = els.filter((e) => e.type === 'rectangle').map((e) => ({ x: e.x - 6, y: e.y - 6, w: e.width + 12, h: e.height + 12 }));
const label = (t, x, ym, color) => {
  const short = t.length > 26 ? t.slice(0, 25) + '…' : t;
  const w = short.length * 12 * 0.54, h = 17;
  let box = { x: x - w / 2, y: ym - 8, w, h };
  outer: for (const dy of [0, -20, 20, -40, 40, -62, 62, -84, 84]) {
    for (const dx of [0, -70, 70, -140, 140]) {
      const b = { x: x - w / 2 + dx, y: ym - 8 + dy, w, h };
      if (![...walls, ...placed].some((o) => hits(b, o))) { box = b; break outer; }
    }
  }
  placed.push(box);
  text({ x: box.x, y: box.y, text: short, size: 12, color });
};

const bowSeen = new Map();
for (const { s, t, type, lab } of links) {
  const st = STYLE[type] ?? STYLE.main;
  const key = [s.id, t.id].sort().join('~');
  const nth = bowSeen.get(key) ?? 0; bowSeen.set(key, nth + 1);
  const [x1, y1] = anchor(s, t, 46), [x2, y2] = anchor(t, s, 46);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const bow = (nth % 2 ? -1 : 1) * (22 + nth * 12) * (s.row > t.row || s.col > t.col ? -1 : 1);
  const mx = (x1 + x2) / 2 - ((y2 - y1) / len) * bow;
  const my = (y1 + y2) / 2 + ((x2 - x1) / len) * bow;
  const a = arrow({ points: [[x1, y1], [mx, my], [x2, y2]], color: st.color, style: st.style, sw: st.sw, from: s.rectId, to: t.rectId });
  a.roundness = { type: 2 };            // nối mềm thay vì gấp khúc vuông
  for (const id of [s.rectId, t.rectId]) {
    const el = els.find((e) => e.id === id);
    el.boundElements = [...(el.boundElements ?? []), { id: a.id, type: 'arrow' }];
  }
  label(lab, mx, my, st.color);
}

writeFileSync(process.argv[2], JSON.stringify({
  type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
  elements: els,
  appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
  files: {},
}, null, 1));
console.log('elements:', els.length, '→', process.argv[2]);
