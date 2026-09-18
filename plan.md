# Plan: Skill Progression System + 3D Career Graph + Job Context (Frontend Prototype)

## Context

Requirement gốc gồm 3 ý: (1) tích lũy hard/soft skill của user, (2) graph 3D hành tinh nghề nghiệp, (3) random company/OT/WFH context. Bản plan này **gộp cả 3 ý**, nhưng đổi hướng triển khai theo yêu cầu mới nhất:

- **Toàn bộ là prototype ở frontend, không đụng `apps/api`.** Không cần chọn DB/ORM, không cần server, không cần auth. Mọi state (skill XP, vị trí trên graph, job context) lưu trong **`localStorage`** của browser.
- **3D universe code bằng React** (đổi so với bản trước — trước đề xuất vanilla-JS imperative, giờ dùng component React thật).
- Cả 3 hàm logic lõi (công thức XP, công thức unlock graph, công thức sinh job context) viết thành **hàm thuần** (pure function, không đụng localStorage/React trực tiếp) trong `apps/web/src/lib/`. Đây là điểm mấu chốt để sau này khi chọn xong stack backend, chỉ cần đổi lớp đọc/ghi (localStorage → gọi API), không phải viết lại logic.

Khảo sát dữ liệu thật (không đổi so với bản trước, vẫn đúng ở bản prototype này):
- Không có skill taxonomy nào tồn tại sẵn — hard/soft skill là chuỗi tự do, trùng lặp cách viết giữa các file dataset.
- `dataset_final_merged.json` (78 role) **không có `graph_edges`**. Chỉ `occupation-data/dataset_22_roles_enriched_v3.json` (22 role) có `graph_edges` thật (103 cạnh: 39 ABSORBED, 36 SIMILAR, 28 PROGRESSES_TO). Chỉ SIMILAR có `weight` sẵn.
- File 22-role này **không có soft skill list** — tự ghi rõ "Báo cáo KHÔNG liệt kê soft skill trực tiếp". Graph distance ở MVP chỉ dựa trên hard skill.
- **OT không có trong bất kỳ dataset nào** — sẽ là placeholder random, ghi rõ trong UI là chưa có dữ liệu thật (giữ đúng văn hoá "unknowns" của spec `spec-pass1-KHOI1-fixed.md`/`spec-scenario-KHOI1.md`, không giả vờ có căn cứ).

Quyết định đã chốt:
- **Không backend** ở bước này — mọi thứ chạy trong `apps/web`, lưu `localStorage`.
- **Graph MVP**: 22 role trong `dataset_22_roles_enriched_v3.json`, node = role (không tính band).
- **3D**: dùng `react-force-graph-3d` (React component, bên dưới vẫn là engine `3d-force-graph`/three.js).
- Auth: không cần khái niệm nhiều user — 1 browser = 1 "user" ngầm định qua localStorage.

---

## Bối cảnh sản phẩm (đây là app gì)

Đây là 1 phần của **DATN — nền tảng định hướng nghề nghiệp bằng AI cho học sinh THPT Việt Nam** (xem `docs/init.vi.md`). Đối tượng dùng: học sinh THPT đang phải chọn tổ hợp môn/ngành/nghề nhưng chưa có hình dung thực tế về công việc thật sự làm gì.

Ý tưởng lõi của cả nền tảng (đọc chi tiết ở `docs/init.vi.md`, Pillar 2 + Pillar 3): cho học sinh **"thử nghề"** qua các scenario mô phỏng tình huống công việc thật (đặc tả ở `occupation-data/spec-scenario-KHOI1.md`), từ đó **tích lũy năng lực thật** (hard/soft skill), rồi dùng chính năng lực đó để **định hướng lộ trình nghề nghiệp tiếp theo** (ngành nào gần, ngành nào cần thêm gì mới tới được).

Plan này build đúng 1 lát cắt prototype của vòng lặp đó, theo thứ tự trải nghiệm dự kiến của học sinh:
1. Vào `/job-context` xem/nhận bối cảnh công ty của 1 nghề (để biết mình "thử nghề" trong hoàn cảnh nào).
2. "Chơi" scenario — hiện tại giả lập qua `/dev/simulate` vì chưa có AI runtime thật.
3. Kết quả chơi cộng vào hồ sơ năng lực ở `/skills`.
4. Năng lực đó quyết định mình đi được tới nghề nào tiếp theo trên `/graph`.

Vì đối tượng là học sinh cấp 3 — không phải nhân sự văn phòng dùng dashboard B2B — giao diện cần vừa dễ hiểu vừa **hấp dẫn/gamified**, không phải dạng bảng biểu khô cứng. Đây là lý do chọn 1 theme thị giác thống nhất bên dưới.

## Theme & Art Direction — "Vũ trụ nghề nghiệp"

**Quan trọng: ẩn dụ vũ trụ không chỉ dành cho `/graph`.** Nó là theme xuyên suốt cả 3 trang prototype (`/graph`, `/skills`, `/job-context`), để trải nghiệm nhất quán — không phải 1 trang "đẹp kiểu vũ trụ" còn 2 trang khác là dashboard trắng mặc định của Nx.

**Từ vựng thống nhất — dùng đúng chữ này trong mọi copy/label, không lẫn 2 cách gọi cho cùng 1 khái niệm:**

| Khái niệm kỹ thuật | Tên hiển thị trong UI |
|---|---|
| User / người chơi | "Phi hành gia" |
| 1 role node trong graph | "Hành tinh nghề nghiệp" |
| Toàn bộ graph | "Dải ngân hà nghề nghiệp" |
| Skill XP tích lũy | "Nhiên liệu" |
| Trang `/skills` | **"Buồng lái"** (cockpit — nơi phi hành gia xem chỉ số của chính mình) |
| Trang `/graph` | **"Bản đồ ngân hà"** |
| Trang `/job-context` | **"Trạm nhiệm sở"** |
| Hành động `fly()` | "Khởi hành" — nút bấm vẫn ghi "Bay tới đây" (giữ nguyên, đã tự nhiên) |
| `/dev/simulate` | **Giữ tên kỹ thuật, KHÔNG gắn theme** — cố tình trông khác biệt (form mộc) để không ai nhầm dev tool với trải nghiệm thật |

**Style token dùng chung** — 1 file `apps/web/src/styles/space-theme.css` (CSS variables), không rải hex code rời ở từng component:
```css
--space-bg: #05070f;              /* nền tối vũ trụ — dùng cho mọi page ngoài phần canvas 3D */
--space-bg-panel: #0d1224cc;      /* nền panel/card, có alpha để thấy sao mờ phía sau */
--space-accent-cyan: #4fd1ff;     /* trạng thái unlocked / hành động chính */
--space-accent-magenta: #c77dff;  /* trạng thái nổi bật / hover */
--space-warn: #ff9f4f;            /* nút dev/test-only, ghi chú "chưa có dữ liệu thật" */
--space-text-dim: #8a94b8;        /* text phụ, ghi chú */
--space-text: #eef1ff;            /* text chính */
```

**1 layout dùng chung** — `apps/web/src/app/layout/SpaceShell.tsx`: nav bar dùng đúng tên ở bảng từ vựng ("Bản đồ ngân hà" / "Buồng lái" / "Trạm nhiệm sở"), nền `--space-bg` + 1 lớp starfield tĩnh nhẹ (vài trăm chấm trắng random vẽ bằng CSS/canvas 2D thuần, KHÔNG ảnh nền tải sẵn — giữ đúng nguyên tắc "không asset ngoài" đã chốt ở Phần 2). Áp dụng `SpaceShell` cho mọi route **trừ** `/dev/simulate`.

Riêng `/graph`: KHÔNG cần lớp starfield CSS của `SpaceShell` chồng lên canvas — trang này đã có starfield riêng dựng bằng `THREE.Points` ngay trong scene 3D (mục 2.4), phong phú hơn. `SpaceShell` ở `/graph` chỉ đóng góp phần nền/nav ngoài canvas (nếu có), tránh 2 lớp starfield đè nhau.

**AC cho phần theme:**
- [ ] Cả 3 trang `/graph`, `/skills`, `/job-context` dùng chung nav + nền tối từ `SpaceShell`, không trang nào còn nền trắng mặc định của Nx scaffold
- [ ] Copy/label trên UI dùng đúng từ vựng ở bảng trên (VD trang `/skills` phải có heading "Buồng lái", không phải "Trang skill" hay "Skill Progress")
- [ ] Màu trạng thái (unlocked/locked/warning) lấy từ đúng biến `--space-accent-cyan`/`--space-text-dim`/`--space-warn`, không hardcode hex rời ở từng component
- [ ] `/dev/simulate` CỐ Ý không theo theme này — nhìn rõ là dev tool, không lẫn với trải nghiệm thật
- [ ] Không thêm file ảnh/font tải ngoài nào cho phần theme — starfield ngoài `/graph` vẽ bằng CSS/canvas thuần

---

## Bước 0 — Đọc context trước khi code (bắt buộc, làm trước Phần 1/2/3)

Agent nhận plan này để implement **chưa có** context của phiên phân tích đã dẫn tới các quyết định ở trên. Đọc đúng thứ tự sau:

| # | File cần đọc | Đọc để làm gì | Phục vụ |
|---|---|---|---|
| 1 | File plan này (toàn bộ) | Nắm quyết định đã chốt: không backend, localStorage, graph chỉ 22 role, fuel không tiêu hao, unlock theo adjacency 1-hop, 3D bằng React, theme vũ trụ xuyên suốt | Tất cả |
| 2 | `docs/init.vi.md` | Hiểu app tổng thể là gì (nền tảng định hướng nghề nghiệp cho học sinh THPT VN), lát cắt này nằm ở đâu trong bức tranh lớn (Pillar 2+3) — tránh code lệch tinh thần sản phẩm | Bối cảnh sản phẩm |
| 4 | `occupation-data/spec-scenario-KHOI1.md` — mục A6, A8 (rubric `observes[]`), KHỐI B mục B1–B3 (shape `evidence_emitted[]`) | Hàm `ingestEvidence` (Phần 1) phải nhận **đúng** shape field đã định nghĩa ở B3 (`beat_id`, `skill`, `anchor_hit`, `quote`, `hint_used`, `timeout`) — không tự đặt tên field khác | 1.3, 1.4 |
| 5 | `occupation-data/scenario-golden/SWE_BACKEND_L3.json` | Ví dụ thật `context.skills_hard`/`skills_soft` và `observes[].skill` — dùng làm fixture test taxonomy + unit test công thức XP | 1.1, 1.3 |
| 6 | `occupation-data/README_DATASET.md` | Nhắc lại đúng nguồn gốc `graph_edges` (78-role KHÔNG có, chỉ 22-role có) | 2.1 |
| 7 | `occupation-data/dataset_22_roles_enriched_v3.json` — đọc **toàn bộ 22 role**, liệt kê hết giá trị `role_group` thật xuất hiện | Bảng màu legend ở mục 2.5 hiện là ví dụ minh hoạ — **phải đối chiếu giá trị `role_group` thật rồi mới chốt bảng màu** | 2.1, 2.5 |
| 8 | `occupation-data/dataset_final_merged.json` + `occupation-data/9_roles_tier1_pass2.json` — xem `levels[].skills_hard[]`/`skills_soft[]`, `company_type_variance`, `work_environment_ids[]` | Nguồn skill string thứ 2 cho taxonomy (Phần 1) + nguồn `company_type`/`work_environment` cho Phần 3 | 1.1, 3.1 |
| 9 | `occupation-data/output/work_environments.json` | Bảng tên/mô tả cho `work_environment_id` — dùng hiển thị ở UI Phần 3, KHÔNG copy mô tả cứng vào code, trỏ bằng id | 3.1, 3.3 |
| 10 | `apps/web/src/main.tsx`, `apps/web/src/app/app.tsx` | Đây là chỗ phải thêm router — đọc để biết đang render gì (`NxWelcome`) trước khi thay | 2.6 |
| 11 | `CLAUDE.md` (root) | Quy tắc repo: luôn chạy task qua `pnpm exec nx …`, dùng skill `nx-generate` khi scaffold, `nx-workspace` khi tra project/target | Toàn bộ |

**Sau khi đọc xong bước 7, nếu `role_group` thật khác ví dụ ở 2.5 — sửa lại bảng màu cho khớp dữ liệu thật trước khi code UI.**

---

## Phần 1 — Skill Taxonomy & User Skill Progression (localStorage)

### 1.1 Xây skill taxonomy (data step, làm trước — không đổi so với bản trước)

Script `occupation-data/build_skill_taxonomy.py`:
- Quét toàn bộ chuỗi skill từ: `dataset_final_merged.json` (`levels[].skills_hard[].skill`, `levels[].skills_soft[]`), `9_roles_tier1_pass2.json` (cùng shape), `dataset_22_roles_enriched_v3.json` (`skills_status.hard_skills_languages[].skill`, `hard_skills_frameworks[].skill`, `graph_edges.similar_ranked[].shared_skills_top[]`), `scenario-golden/*.json` (`context.skills_hard`/`skills_soft`).
- Chuẩn hoá: trim + casefold + alias map tay cho biến thể rõ ràng (`React.js`/`ReactJS`/`React` → 1 canonical; `Javascript`/`JavaScript` → 1).
- Output `occupation-data/output/skills_taxonomy.json`: mảng `{ skill_id, name_vn, type: "hard"|"soft", category, aliases: [] }`.
- **Khác bản trước**: copy file output này vào `apps/web/src/data/skills-taxonomy.json` và import trực tiếp bằng ES import (Vite hỗ trợ import JSON tĩnh) — không cần fetch, không cần server serve file.

### 1.2 Domain model — lưu trong `localStorage`

```
key "datn.skillProgress.v1"
{
  schemaVersion: 1,
  skills: { [skillId]: { xp: number } }
}

key "datn.skillLog.v1"                 // optional, phục vụ UI "lịch sử gần đây" + chống cộng trùng
{
  schemaVersion: 1,
  entries: [
    { id, sessionId, scenarioId, beatId, skillId, anchorHit, quote, hintUsed, createdAt }
  ]
}
```

Không còn khái niệm `User`/bảng DB — chỉ là 2 object JSON trong localStorage của đúng browser đang mở. Trước khi cộng XP cho 1 `(sessionId, beatId, skillId)`, kiểm đã có trong `skillLog.entries` chưa — có rồi thì bỏ qua (chống bấm submit 2 lần ở dev-harness cộng XP 2 lần).

### 1.3 Công thức earn XP — giữ nguyên logic cũ, viết thành hàm thuần

File `apps/web/src/lib/skill-engine.ts` — **không import React, không đụng `localStorage` trực tiếp** — nhận state hiện tại + `evidence[]` làm input, trả state mới làm output. Đây là điểm giữ cho công thức tái dùng được y nguyên khi có backend thật sau này.

Hằng số (đặt cùng file, không rải magic number):
```
BASE_XP = 10
ZERO_ANCHOR_RATIO = 0.3      // "0" vẫn được thưởng 1 phần vì có thử
LEVEL_K = 25                 // level = floor(sqrt(xp / LEVEL_K))
```
Quy tắc cộng XP mỗi item trong `evidence[]` (theo A9 — hint dùng thì trần tụt về `0`):

| `anchor_hit` | `hint_used` | xpDelta |
|---|---|---|
| `+2` | false | `BASE_XP` (10) |
| `+2` | true | không hợp lệ theo spec A9 — ép về case `0` (3), log cảnh báo integrity, không tin nhãn `+2` |
| `0` | bất kỳ | `BASE_XP * ZERO_ANCHOR_RATIO` (3) |
| `-1` | bất kỳ | 0 |
| `timeout: true` | — | 0 |

Level hiển thị = `floor(sqrt(xp / LEVEL_K))`.

### 1.4 Hàm dùng (không qua network)

```ts
ingestEvidence(evidence: EvidenceItem[]): SkillProgressState   // đọc localStorage, áp skill-engine, ghi lại, trả state mới
getSkillProgress(): SkillProgressState                          // đọc localStorage, tính level mỗi skill, group hard/soft
```
Không có HTTP nào ở bản prototype này.

### 1.5 Lớp lưu trữ chung

`apps/web/src/lib/local-store.ts` — 1 helper dùng lại cho cả 3 phần (skill, graph position, job context), không viết `localStorage.getItem` rải rác nhiều nơi:
```ts
readJSON<T>(key: string, fallback: T): T     // try/catch — Safari private mode / quota / user tắt storage có thể throw, fallback im lặng, không crash app
writeJSON<T>(key: string, value: T): void    // try/catch tương tự
```
Mọi object lưu có field `schemaVersion` để sau này đổi shape thì migrate được, không cần xoá sạch data cũ của người test.

### 1.6 UI trang Stat — route `/skills` ("Buồng lái")

- 2 cột: **Hard skill** | **Soft skill**. Mỗi skill hiện tên (VN), progress bar (`xp trong level hiện tại / xp cần cho level kế`), số level to dạng "Lv.3", tooltip hiện XP thô khi hover.
- Skill chưa từng earn XP vẫn hiện trong danh sách ở trạng thái "Lv.0" mờ — thấy toàn cảnh taxonomy, tạo động lực (như achievement chưa mở trong game), không ẩn đi.
- 1 số tổng đầu trang: tổng XP toàn bộ (đúng số "nhiên liệu" dùng ở Phần 2) — số này phải khớp với HUD tổng fuel bên `/graph`.
- Nút "Reset toàn bộ tiến trình (dev)" — xoá key `datn.skillProgress.v1` + `datn.skillLog.v1`, có confirm dialog trước khi xoá.

**AC:**
- [ ] Vào `/skills` lần đầu (localStorage rỗng) → mọi skill hiện Lv.0, tổng XP = 0
- [ ] Sau khi earn XP qua `/dev/simulate` → quay lại `/skills` số liệu cập nhật đúng theo bảng công thức 1.3
- [ ] Reload trang → số liệu giữ nguyên (chứng minh đọc từ localStorage, không phải state tạm trong React)
- [ ] Bấm "Reset" → mọi số về Lv.0, và `/graph` cũng mất hết fuel tương ứng (vì cùng đọc 1 nguồn `getSkillProgress()`)

---

## Phần 2 — Graph 3D "Bản đồ ngân hà" (React, localStorage)

### 2.1 Chuẩn bị dữ liệu graph (data step — không đổi so với bản trước)

Script `occupation-data/build_role_graph.py`, input `dataset_22_roles_enriched_v3.json` + `skills_taxonomy.json`:
- Node = 1 role (không tính band). Skill set mỗi role = union `hard_skills_languages` + `hard_skills_frameworks` (top 10 mỗi loại), resolve qua taxonomy alias.
- Mỗi cạnh trong `graph_edges_full`:
  - `SIMILAR` có `weight` sẵn → `distance = 1 - weight`.
  - `PROGRESSES_TO`/`ABSORBED` (không có weight) → Jaccard trên 2 skill set: `distance = 1 - |A∩B|/|A∪B|`, clamp tối thiểu `0.05`.
  - `requiredSkills`: SIMILAR dùng `shared_skills_top` có sẵn; PROGRESSES_TO/ABSORBED dùng top-2 skill trong phần giao.
- Output `occupation-data/output/role_graph.json`: `{ nodes: [{roleCode, nameVn, roleGroup}], edges: [{from, to, type, distance, requiredSkills: [skillId]}] }`.
- **Khác bản trước**: copy file output vào `apps/web/src/data/role-graph.json`, import trực tiếp bằng ES import.

### 2.2 Domain model & unlock logic — localStorage + hàm thuần

```
key "datn.graphPosition.v1"
{ schemaVersion: 1, currentRoleCode: string }
```
Default khi chưa có key: `currentRoleCode = "SWE_FRONTEND"`.

**Model di chuyển — giữ nguyên quyết định adjacency 1-hop.** Toàn bộ 22 node + 103 cạnh luôn hiển thị (thấy "cả vũ trụ"), nhưng chỉ cạnh chạm `currentRoleCode` là actionable (có nút bay); cạnh/node còn lại chỉ xem thông tin.

Hằng số (cùng file `apps/web/src/lib/graph-engine.ts`):
```
FUEL_SCALE = 100
REQUIRED_SKILL_MIN_LEVEL = 1
```
```ts
// hàm thuần: nhận nodes/edges + skillProgress + currentRoleCode → trả trạng thái unlock từng cạnh kề
computeUnlockState(edges, skillProgress, currentRoleCode)

unlock(edge) = user.totalXp (tổng xp mọi skill) >= edge.distance * FUEL_SCALE
               AND mọi skillId trong edge.requiredSkills có user.level(skillId) >= REQUIRED_SKILL_MIN_LEVEL
```

**Fuel là NGƯỠNG, không bị TIÊU HAO** (giữ nguyên quyết định cũ) — XP không giảm khi bay, "mở khoá" chỉ là điều kiện gate. Lý do: XP đại diện năng lực đã có, trừ đi khi dùng để di chuyển thì sai về sư phạm và tạo rủi ro kẹt cứng không hồi phục được.

### 2.3 Hàm dùng

```ts
getGraphState(): { nodes, edges (kèm unlocked + thiếu skill gì), currentRoleCode }
fly(targetRoleCode: string): void
  // tự gọi lại computeUnlockState() để kiểm tra trước khi ghi localStorage — throw nếu targetRoleCode
  // không phải 1-hop từ currentRoleCode hoặc chưa unlocked. Giữ nguyên tinh thần "không tin thẳng UI",
  // dù giờ không có server riêng — validate vẫn nằm trong hàm logic, không nằm trong code component UI.
```

### 2.4 Frontend — 3D bằng React, nguồn asset 3D

**Đổi theo yêu cầu mới: code bằng React.** Dùng `react-force-graph-3d` (React component wrap quanh đúng engine `3d-force-graph`/three.js — cùng physics, cùng khả năng custom object mỗi node, chỉ khác cách khai báo là props/ref theo React thay vì gọi method imperative lên 1 instance):

```tsx
<ForceGraph3D
  ref={fgRef}
  graphData={{ nodes, links }}
  nodeThreeObject={buildPlanetObject}     // hàm thuần, xem dưới
  linkDirectionalParticles={getParticleCount} // theo unlocked state
  linkColor={getLinkColor}                 // theo edge.type
  onNodeClick={handleNodeClick}
  onNodeHover={handleNodeHover}
/>
```
`fgRef` dùng để gọi `fgRef.current.cameraPosition({...}, targetNode, ms)` khi bay — method này vẫn expose qua ref của `react-force-graph-3d`.

`buildPlanetObject(node)` — hàm thuần trả về 1 `THREE.Object3D`, đặt trong `apps/web/src/lib/planet-builder.ts` (viết bằng three.js thuần, KHÔNG phải JSX — đây là phần "code kiểu html/imperative cho dễ" mà vẫn nằm gọn trong 1 component React ở lớp ngoài):
- Thân hành tinh: `THREE.SphereGeometry` + `THREE.MeshStandardMaterial`, màu solid theo `role_group` (bảng màu, xem 2.5).
- "Khí quyển": 1 sphere lớn hơn ~15%, `transparent: true`, `opacity` thấp, cùng màu.
- Node hiện tại (`currentRoleCode`): thêm viền sáng (emissive tăng) + `THREE.Sprite` hình tam giác nhỏ (texture sinh bằng `CanvasTexture` vẽ code, không phải ảnh).
- Starfield nền: 1 lớp `THREE.Points` random trong hình cầu bán kính lớn, add vào scene qua `fgRef.current.scene()` lúc mount (1 lần, trong `useEffect`).

**Asset 3D — KHÔNG cần asset ngoài nào**, giữ nguyên quyết định cũ: không tải `.glb`/texture ảnh planet có sẵn, mọi hình khối sinh bằng code lúc runtime (tránh vấn đề tìm nguồn free/bản quyền + quản lý file tĩnh, giữ bundle nhẹ).

### 2.5 Đặc tả UI & tương tác (AC)

**Mã hoá thị giác:**

| Thuộc tính | Node | Cạnh |
|---|---|---|
| Màu | Theo `role_group` thật (xem Bước 0 #5) — có **legend** góc màn hình đối chiếu tên nhóm ↔ màu | `SIMILAR` = line liền; `PROGRESSES_TO` = có hướng (particle chạy 1 chiều); `ABSORBED` = đứt nét mờ |
| Độ dài/vị trí | Force simulation tự dàn theo `edge.distance` (`linkDistance`) | — |
| Trạng thái current | Viền sáng + sprite tàu nhỏ | Cạnh chạm current: particle chạy (`linkDirectionalParticles`) nếu `unlocked=true`, tĩnh nếu `false` |
| Trạng thái xa (không kề current) | Opacity thấp hơn (~0.4) | Line tĩnh, mờ, không particle, không click ra nút bay |

**Tương tác:**
1. Hover node → tooltip (dùng prop `nodeLabel` string có sẵn của thư viện).
2. Click node **kề current** → panel HTML overlay bên phải (div thường, absolute-positioned trên canvas, KHÔNG phải object trong scene 3D): tên role, fuel cost (`distance*FUEL_SCALE`), checklist skill yêu cầu (level hiện có/cần, dòng chưa đạt tô đỏ), nút **"Bay tới đây"** chỉ enable khi `unlocked=true`.
3. Bấm "Bay tới đây" → gọi `fly(targetRoleCode)` → ghi `localStorage` → camera animate qua `cameraPosition(...)` → sprite tàu, HUD, panel cập nhật theo state mới.
4. Click node **không kề current** → panel read-only + ghi chú "Cần bay qua các hành tinh liền kề trước" — không có nút bay, không hiện checklist.
5. Không tương tác nào trừ XP — mọi hành động ở màn 3D chỉ đọc `getSkillProgress()`; chỉ `fly()` là ghi, và nó ghi vào `graphPosition`, không đụng XP.

**Bố cục:** canvas full-bleed; legend góc trên-trái; panel role info overlay bên phải (ẩn mặc định); HUD góc trên-phải hiện tổng XP hiện tại ("nhiên liệu" tổng).

**AC:**
- [ ] 22 node hiện đủ, dàn bằng force simulation, không chồng nhau ở trạng thái nghỉ
- [ ] Không có file asset ảnh/model 3D nào thêm vào repo cho phần này — toàn bộ hình khối sinh bằng code lúc runtime
- [ ] Legend khớp đúng màu thật trên node
- [ ] Node hiện tại có sprite tàu + viền sáng, đổi đúng node sau khi bay
- [ ] Cạnh kề + đủ điều kiện có particle chạy; cạnh không đủ điều kiện hoặc không kề thì tĩnh
- [ ] Click node kề current ra đúng checklist skill, nút bay disable đúng khi thiếu điều kiện
- [ ] Bay thành công → `currentRoleCode` đổi trong localStorage, **reload lại trang vẫn giữ đúng vị trí mới** (chứng minh persist qua localStorage, không phải state React tạm)
- [ ] Click node xa → không có nút bay, có ghi chú giải thích vì sao

### 2.6 Route & thư viện thêm vào FE

- Thêm `react-router-dom` (chưa có router nào) + `react-force-graph-3d` (kéo theo three.js). **Không cần** fetch wrapper hay `@tanstack/react-query` — không có network trong bản prototype này, mọi thứ đọc/ghi qua `local-store.ts`.
- `/graph` — màn 3D universe (2.5).
- `/skills` — trang stat (1.6).
- `/job-context` — trang job context (3.3).
- `/dev/simulate` — **dev harness**, không phải sản phẩm cuối: chọn role+band (nên dùng lại đúng danh sách ở `/job-context`), danh sách skill (từ taxonomy) gán anchor `+2/0/-1` + tick "hint used", submit gọi `ingestEvidence()`. Cách kiểm chứng toàn bộ pipeline (kể cả ảnh hưởng lên `/graph`) mà không cần chờ AI runtime thật (KHỐI B) được code hoá.

---

## Phần 3 — Job / Company Context (prototype)

### 3.1 Nguồn dữ liệu

- `company_type_variance` mỗi role — có sẵn trong `dataset_final_merged.json`/`9_roles_tier1_pass2.json`. Lọc bỏ nhóm giá trị `CHUA_CO_DU_LIEU` trước khi random (đúng luật A6 của `spec-scenario-KHOI1.md`).
- `work_environment_ids[]` mỗi role (cùng file) — random 1 id trong danh sách của role đó; tra tên/mô tả hiển thị qua `occupation-data/output/work_environments.json` (trỏ bằng id, không copy mô tả cứng — đúng quy ước A6).
- **OT**: không có trong bất kỳ dataset nào → random 50/50, **ghi rõ trong UI là placeholder chưa có dữ liệu thật**.
- **WFH**: suy diễn đơn giản từ tên/id `work_environment` đã chọn (chứa "HYBRID"/"REMOTE" → `true`, chứa "ONSITE" → `false`, còn lại random) — **ghi rõ trong UI đây là suy diễn, không phải số liệu thật**, giữ đúng văn hoá "unknowns" của spec.

Copy phần dữ liệu cần dùng (`company_type_variance`, `work_environment_ids` theo role, và toàn bộ `work_environments.json`) vào `apps/web/src/data/` như 2 file ở Phần 1/2.

### 3.2 Domain model (localStorage) & hàm thuần

```
key "datn.jobContext.v1"
{
  schemaVersion: 1,
  jobs: {
    "<roleCode>_<band>": { companyType, workEnvironmentId, hasOt, hasWfh, createdAt }
  }
}
```
`apps/web/src/lib/job-context-engine.ts`:
```ts
getOrCreateJobContext(roleCode, band): JobContext
  // có rồi → trả đúng bản cũ, KHÔNG random lại (đúng luật "chốt trước khi gen beat")
  // chưa có → random theo 3.1, ghi vào localStorage, trả về
regenerateJobContext(roleCode, band): JobContext   // random lại có chủ đích — CHỈ dùng cho nút dev/test
```

### 3.3 UI — route `/job-context` ("Trạm nhiệm sở")

- Chọn `roleCode` + `band` — dùng lại đúng danh sách role/band có trong `9_roles_tier1_pass2.json` (cùng nguồn với `/dev/simulate`, để 2 màn nói về cùng 1 "job").
- Job chưa có context → nút **"Nhận nhiệm sở"** → gọi `getOrCreateJobContext`, hiện kết quả.
- Job đã có context → thẻ thông tin: loại công ty (nhãn tiếng Việt dễ hiểu, VD "Công ty outsourcing"), môi trường làm việc (tên từ `work_environments.json`), OT (có/không), WFH (có/không) — kèm 1 dòng ghi chú nhỏ: *"OT là dữ liệu giả định, WFH suy diễn từ môi trường làm việc — chưa có số liệu thật cho 2 chỉ số này."*
- Nút **"Random lại (dev/test only)"** — style cảnh báo (khác màu nút chính), gọi `regenerateJobContext`, để rõ đây không phải hành vi gameplay thật (1 người không đổi công ty giữa chừng).

**AC:**
- [ ] Chọn 1 job chưa có context → sinh đúng 1 lần, `companyType` nằm trong nhóm role đó thật sự có dữ liệu (không rơi vào `CHUA_CO_DU_LIEU`)
- [ ] Rời trang, chọn lại đúng job đó → hiện lại ĐÚNG context cũ, không sinh mới
- [ ] Đổi sang job khác → context độc lập, không lẫn giữa các job
- [ ] Reload trang → context giữ nguyên (localStorage)
- [ ] Ghi chú "chưa có số liệu thật" hiển thị rõ, không để người xem hiểu lầm OT/WFH là dữ liệu đã verify
- [ ] Nút random lại có style cảnh báo riêng, không lẫn với nút "Nhận nhiệm sở"

---

## Việc KHÔNG làm ở plan này (deferred rõ ràng)

- Backend/DB/API thật cho cả 3 phần — toàn bộ đang là `localStorage`. Điểm nối để migrate sau: 3 file hàm thuần (`skill-engine.ts`, `graph-engine.ts`, `job-context-engine.ts`) viết tách khỏi lớp lưu trữ, chỉ cần đổi phần đọc/ghi sang gọi API, không sửa logic.
- Auth thật (login).
- AI runtime chạy scenario thật (turn loop theo KHỐI B của `spec-scenario-KHOI1.md`) — `/dev/simulate` đứng thế chỗ này để test.
- OT/WFH dựa trên dữ liệu thật — hiện là placeholder/suy diễn, đã ghi rõ trong UI ở 3.3.

## Verification

1. **Data script**: chạy `build_skill_taxonomy.py` rồi `build_role_graph.py`, copy output vào `apps/web/src/data/`, kiểm bằng mắt alias gộp đúng (VD "Javascript"/"JavaScript" cùng 1 `skill_id`) và `role_graph.json` có đúng 22 node/103 edge.
2. **Unit test** (Vitest/Jest hiện có trong repo) cho 3 hàm thuần, không cần mock network vì không có network:
   - `skill-engine`: input evidence mẫu → xpDelta đúng theo bảng 1.3.
   - `graph-engine`: edge fixture → `unlock()` đúng/sai theo ngưỡng, đúng adjacency 1-hop.
   - `job-context-engine`: gọi 2 lần liên tiếp cho cùng job → trả về y hệt lần đầu (không random lại).
3. **E2E chạy thật**: chỉ cần `pnpm exec nx serve web` (không cần chạy `api`) →
   - Vào `/job-context`, "Nhận nhiệm sở" cho `SWE_FRONTEND` → thấy context hợp lệ.
   - Vào `/dev/simulate`, giả lập hoàn thành 1 scenario của `SWE_FRONTEND` với vài skill đạt `+2` → `/skills` XP tăng đúng.
   - Vào `/graph`, cạnh tới node kề `SWE_FRONTEND` (VD `SWE_MOBILE`, chia sẻ "react native"/"dart") đổi sang unlocked khi đủ ngưỡng → click, checklist đúng, bấm "Bay tới đây" → sprite tàu di chuyển.
   - Reload lại trang ở mỗi bước trên (`/skills`, `/graph`, `/job-context`) → xác nhận mọi state giữ nguyên (chứng minh persist qua localStorage, không phải state React tạm) — dùng tab **Application → Local Storage** trong DevTools để soi trực tiếp 3 key `datn.skillProgress.v1`/`datn.graphPosition.v1`/`datn.jobContext.v1`.