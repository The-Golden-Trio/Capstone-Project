# Báo cáo: Skill Progression + Career Graph 3D ("Planet Universe") — MVP

*Bản để trình bày cho leader. Phần in nghiêng là gợi ý lời nói; phần bảng là bằng chứng để chiếu/đối chiếu.*

---

## 0. Tóm tắt 30 giây

> *"Requirement có 3 ý: (1) tích luỹ hard/soft skill cho user, (2) graph 3D hành tinh nghề nghiệp, (3) random bối cảnh công ty/OT/WFH. Em đã implement xong **ý 1 và ý 2** end-to-end — từ data pipeline, backend, tới màn 3D — có test tự động và đã chạy thử toàn bộ luồng thật. Ý 3 tách ra task riêng theo đúng thống nhất trước. Trong lúc làm em phát hiện 3 chỗ dữ liệu thật khác với giả định ban đầu và đã xử lý, em sẽ nói rõ ở cuối."*

Số liệu chốt:

| Hạng mục | Kết quả |
|---|---|
| Skill taxonomy | **227** skill (169 hard · 58 soft), 31 nhóm alias được gộp tay, quét đủ 4 nguồn dữ liệu |
| Role graph | **22** node · **64** cạnh (36 SIMILAR + 28 PROGRESSES_TO) · 39 alias ABSORBED |
| Backend | 5 endpoint NestJS, repository pattern (stack-agnostic), persistence in-memory + snapshot JSON |
| Frontend | 3 route (`/graph`, `/skills`, `/dev/simulate`), 3D bằng `3d-force-graph` + `three`, **0 file asset** |
| Kiểm chứng | **41 unit test** (32 API + 9 web) · typecheck/lint/build xanh · E2E thật qua API + browser |

---

## 1. Cách em hiểu requirement → quyết định thiết kế

*(Phần này thể hiện là làm có suy nghĩ, không chỉ code theo mô tả.)*

### Ý 1 — Tích luỹ skill

| Em hiểu là… | Nên em làm… |
|---|---|
| Skill string trong dataset viết không thống nhất (`Javascript`/`JavaScript`, `React.js`/`ReactJS`/`React`) → nếu không chuẩn hoá, XP kiếm được khi chơi sẽ **không bao giờ khớp** với skill yêu cầu để mở khoá node | Xây **1 taxonomy duy nhất** (`skills_taxonomy.json`) làm nguồn thật cho `skill_id`, quét cả dataset gameplay (78/9 role) lẫn dataset graph (22 role) lẫn scenario golden; alias map gộp tay các biến thể rõ ràng, còn lại giữ nguyên để người review quyết |
| Evidence phải đúng shape `evidence_emitted[]` của spec B3 để runtime AI sau này pass thẳng | API `POST /skill-progress/ingest` nhận **đúng snake_case của spec** (`activity_id`, `skill`, `anchor_hit`, `quote`, `hint_used`, `timeout`); server tự resolve skill string → `skill_id` |
| Spec A9: dùng hint thì trần tụt về `0`; A11: hết giờ = `-1` | Công thức XP ép luật ở **server**, không tin nhãn client: `+2`+hint → tính như `0` và ghi cảnh báo integrity; `timeout` → 0 XP |
| Client có thể gọi lại API cho cùng 1 activity (retry, double-submit) | `SkillEvidenceLog` append-only với khoá unique `(sessionId, activity_id, skillId)` → **idempotent**, không cộng XP 2 lần |
| Chưa chốt DB | **Repository port** (interface) + adapter in-memory/snapshot JSON; chọn DB xong chỉ viết adapter mới, service/controller không đổi |

Hằng số tunable gom 1 chỗ: `BASE_XP=10`, `ZERO_ANCHOR_RATIO=0.3`, `LEVEL_K=25` (level = ⌊√(xp/25)⌋), `FUEL_SCALE=100`, `REQUIRED_SKILL_MIN_LEVEL=1`.

### Ý 2 — Graph 3D hành tinh

| Em hiểu là… | Nên em làm… |
|---|---|
| Ẩn dụ "rocket bay từ hành tinh này sang hành tinh khác" cần **vị trí xuất phát** — không thể warp tới bất kỳ node nào chỉ vì đủ XP | Thêm `UserGraphPosition`; chỉ cạnh **kề 1-hop** với node hiện tại mới actionable; node xa vẫn hiện (thấy cả vũ trụ) nhưng chỉ xem được |
| "Nhiên liệu tích luỹ" nghe như bị trừ khi bay — nhưng XP đại diện **năng lực đã có**, trừ đi là sai sư phạm và tạo rủi ro kẹt cứng | Fuel là **ngưỡng**, không tiêu hao: `unlock = totalXp ≥ distance×100 AND mọi requiredSkill có level ≥ 1`. XP không bao giờ giảm (có test khẳng định) |
| Server không được tin client | `POST /career-graph/fly` tự kiểm lại: node tồn tại → có cạnh 1-hop → `unlock()` đạt → mới ghi. Đây là chỗ **duy nhất** ghi ở phần graph, và chỉ ghi vị trí |
| Yêu cầu "prefer HTML cho dễ", không muốn quản lý asset | `3d-force-graph` bản vanilla (1 `<div>` + JS thuần), **toàn bộ hình khối sinh bằng code** lúc runtime: sphere + khí quyển, texture bề mặt vẽ bằng canvas noise, starfield `Points`, tinh vân sprite gradient, tàu = `CanvasTexture` tam giác — repo không có file ảnh/model nào |

---

## 2. Kịch bản demo (≈ 5 phút)

Chuẩn bị: `pnpm exec nx serve api` + `pnpm exec nx serve web`, xoá `apps/api/.data/` để về trạng thái sạch (SWE_FRONTEND, 0 XP).

| # | Làm gì | Nói gì |
|---|---|---|
| 1 | Mở `/graph` | *"22 hành tinh = 22 role, màu theo 7 nhóm nghề thật trong dataset (legend góc trái). Cạnh liền = role tương tự, cạnh có mũi tên = lộ trình đi lên. Hành tinh có vòng sáng + tàu là vị trí hiện tại — mặc định Front-end. HUD góc phải: tổng XP = nhiên liệu, và mục tiêu gần nhất."* |
| 2 | Click hành tinh **Mobile** (kề) | *"Panel hiện fuel cần 62, checklist skill yêu cầu Dart + React Native — đang L0/L1 nên tô đỏ, nút bay disable. Dữ liệu này server tính, FE chỉ hiển thị."* |
| 3 | Click 1 hành tinh **xa** (VD Data Analyst) | *"Không kề → chỉ có thông tin + ghi chú 'cần bay qua hành tinh liền kề trước', cố tình không hiện checklist để không gây hiểu lầm là mở được ngay."* |
| 4 | Sang `/dev/simulate` → bấm **"Nạp skill yêu cầu của cạnh kề"** → Submit | *"Đây là dev harness thay cho AI runtime chưa có: nó gửi đúng `evidence_emitted[]` theo spec B3. Server resolve alias, áp công thức XP, trả về từng dòng applied/duplicate/unknown. Thử tick 'hint used' ở 1 dòng +2 → server ép về 0 và báo cảnh báo A9."* |
| 5 | Bấm Submit **lần 2** cùng session | *"Duplicates = n, XP không đổi — idempotent."* |
| 6 | Sang `/skills` | *"XP + level + progress bar theo từng skill, tách hard/soft."* |
| 7 | Về `/graph` | *"Cạnh tới Mobile đã đổi xanh và có particle chạy = unlocked. Click → checklist xanh, nút 'Bay tới đây' enable."* |
| 8 | Bấm **Bay** | *"Server xác nhận, camera lướt sang, tàu đổi vị trí, các cạnh actionable đổi theo node mới. XP vẫn nguyên."* |
| 9 | **Reload trang** | *"Vị trí vẫn là Mobile — persist qua backend (snapshot JSON), không phải state tạm trên FE. Restart API cũng giữ."* |
| 10 | (Tuỳ) bật "Hiện vệ tinh role đã gộp" | *"39 alias ABSORBED hiện thành vệ tinh nét đứt — đây là phát hiện dữ liệu em sẽ nói ở phần 4."* |

---

## 3. Bảng đối chiếu requirement ↔ bằng chứng

### 3.1 Ý 1 — Skill progression

| Requirement (plan) | Trạng thái | Bằng chứng |
|---|---|---|
| 1.1 Script taxonomy quét 4 nguồn, alias map, category language/framework/tool | ✅ | `occupation-data/build_skill_taxonomy.py` → `output/skills_taxonomy.json` (227) |
| 1.2 Domain model `Skill`, `UserSkillProgress`, `SkillEvidenceLog` (unique key), `User` | ✅ | `apps/api/src/app/shared/domain/*` |
| 1.3 Công thức XP + level, hằng số 1 file | ✅ | `config/progression.config.ts`, `skills/xp.ts`, test `xp.spec.ts` (bảng đủ 5 case) |
| 1.4 `POST /skill-progress/ingest` (resolve alias, unknown không crash) · `GET /skill-progress/me` (group hard/soft + level) | ✅ | `skills/skills.controller.ts`, `skills.service.ts`, test `skills.service.spec.ts` |
| 1.5 Repository interface + adapter in-memory/snapshot JSON, sống qua restart | ✅ | `shared/repositories/*`, `persistence/*`; đã restart API kiểm thực tế |

### 3.2 Ý 2 — Graph 3D

| Requirement (plan) | Trạng thái | Bằng chứng |
|---|---|---|
| 2.1 Script graph: SIMILAR `1-weight`, PROGRESSES_TO Jaccard clamp 0.05, requiredSkills top-2 | ✅ | `occupation-data/build_role_graph.py` → `output/role_graph.json` |
| 2.2 `UserGraphPosition` seed SWE_FRONTEND, unlock 1-hop, fuel là ngưỡng | ✅ | `career-graph/unlock.ts`, test `unlock.spec.ts`, `career-graph.service.spec.ts` (khẳng định XP không giảm sau bay) |
| 2.3 `GET /career-graph` (unlock cho cạnh kề) · `POST /career-graph/fly` server tự kiểm | ✅ | `career-graph.controller.ts`; 400 nếu không kề, 409 kèm chi tiết nếu chưa đủ |
| 2.4 `3d-force-graph` vanilla, wrapper mỏng, không asset ngoài | ✅ | `apps/web/src/graph/PlanetGraph.tsx`, `planet-objects.ts` |
| 2.5 Màu theo role_group + legend · SIMILAR liền / PROGRESSES_TO mũi tên / ABSORBED đứt · linkDistance theo distance · current có viền + tàu · particle cạnh unlocked · node xa mờ | ✅ | `palette.ts` (test khoá 7 nhóm đúng dữ liệu), `PlanetGraph.tsx` |
| 2.5 Tương tác 1–5: hover tooltip · click kề → panel fuel + checklist + nút · bay → camera animate + refetch · click xa → ghi chú · không hành động nào trừ XP | ✅ | `GraphPage.tsx`, `RolePanel.tsx` (test 4 trạng thái panel) |
| 2.5 Bố cục: canvas full-bleed, legend trái, panel phải, HUD tổng XP | ✅ | `styles.css` |
| 2.6 `react-router-dom`, `lib/api.ts`, `@tanstack/react-query`, 3 route | ✅ | `main.tsx`, `app.tsx`, `lib/queries.ts` |

### 3.3 AC checklist của plan (mục 2.5)

| AC | Kết quả |
|---|---|
| 22 node hiện đủ, không chồng nhau ở trạng thái nghỉ | ✅ thêm collision force (`d3-force-3d`) sau khi thấy chồng ở bản đầu |
| Không file asset ảnh/model nào trong repo | ✅ |
| Legend khớp màu thật trên node | ✅ có unit test đối chiếu `role_graph.json` |
| Node hiện tại có sprite tàu + viền, đổi đúng sau khi bay | ✅ |
| Cạnh actionable đủ điều kiện có particle; còn lại tĩnh | ✅ |
| Click node kề → checklist đúng level có/cần, nút disable đúng | ✅ |
| Bay thành công → server đổi vị trí, reload vẫn giữ | ✅ |
| Click node xa → không nút bay, có ghi chú | ✅ |

### 3.4 Ràng buộc từ spec-scenario (KHỐI B) đã tuân thủ

| Spec | Áp dụng |
|---|---|
| B3 shape `evidence_emitted[]` | Nhận nguyên snake_case; `beat_id` cũ nhận như alias |
| A9 hint → trần `0` | Server ép về `0`, ghi cảnh báo |
| A11 timeout → `-1`, `quote` được null | 0 XP; quote null hợp lệ chỉ khi timeout |
| B3 `quote` bắt buộc | Thiếu quote (không timeout) → cảnh báo integrity, vẫn ghi để không mất dữ liệu |

---

## 4. Ba phát hiện khi đối chiếu dữ liệu thật (điểm cộng khi báo cáo)

> *"Plan viết trước khi đọc kỹ dữ liệu; khi implement em đối chiếu lại và thấy 3 chỗ lệch. Em không code theo giả định mà sửa theo dữ liệu và ghi rõ."*

1. **`beat_id` → `activity_id`.** Spec v2.1 đã đổi `beats[]` thành `activities[]`, plan vẫn ghi `beat_id`. Em theo spec (nguồn thật) và giữ `beat_id` làm alias để không gãy.
2. **39 cạnh ABSORBED đều trỏ tới role ngoài 22 node** (SWE_WEB, QA_AUTO, DATA_ML…). Chúng là alias tìm kiếm ("gõ Data Scientist vẫn ra AI Engineer"), không phải node, và không có skill để tính khoảng cách. Vì vậy graph hiển thị **22 node + 64 cạnh** (không phải 103 như plan ước tính); 39 alias vẫn giữ trong data, hiện ở panel role và có toggle vẽ thành vệ tinh nét đứt.
3. **`role_group` thật có 7 nhóm, không có EXEC** như bảng màu minh hoạ. Bảng màu chốt theo dữ liệu và có test tự động khoá cứng — thêm/bớt nhóm là test fail.

Ngoài ra: 7/22 role không có hồ sơ skill trong báo cáo ITviec (UI/UX, AI, DevOps, Cloud, Security, Pentest, Network) → cạnh PROGRESSES_TO tới các role này có `distance = 1.0` (fuel 100) và không có skill yêu cầu — là giới hạn dữ liệu, được ghi trong `distanceMethod` của từng cạnh chứ không bịa.

---

## 5. Kiểm chứng đã làm

| Loại | Chi tiết |
|---|---|
| Unit test API (32) | bảng XP đủ 5 case · level/progress · unlock (fuel thiếu / skill thiếu / cạnh không skill / adjacency 2 chiều) · ingest (404 user, resolve golden fixture, idempotent, unknown skill, alias casing, timeout/quote) · fly (từ chối không kề / không tồn tại / chính node, 409 kèm chi tiết, XP không đổi sau bay) |
| Unit test web (9) | RolePanel 4 trạng thái · palette ↔ `role_graph.json` · router smoke |
| Static | `typecheck` + `lint` + `build` cả 2 project xanh |
| E2E thật | Từ trạng thái sạch: ingest 60 XP → cạnh Mobile vẫn khoá (cần 62) → +10 XP → unlocked → fly → restart API → vị trí giữ nguyên → fly node xa → 400 → fly node kề thiếu skill → 409 |
| Browser | Chụp headless Chrome 3 trang, không lỗi console |

Lệnh: `pnpm exec nx run-many -t typecheck test lint build -p @datn/api @datn/web`

---

## 6. Chưa làm / bước tiếp theo (nói thẳng, không giấu)

| Hạng mục | Lý do | Đề xuất |
|---|---|---|
| Ý 3 — random `job_context` (company_type/OT/WFH) | Ngoài scope plan này (đã thống nhất) | Task riêng, cắm vào lúc sinh scenario |
| DB/ORM thật | Chưa chốt stack | Viết adapter mới cho 5 interface đã có; ước 0.5–1 ngày |
| Auth thật | Dev user hardcode | Thay `DEV_USER` bằng user từ JWT |
| AI runtime (KHỐI B) | Chưa code hoá | `/dev/simulate` đứng thế chỗ; khi có runtime, gọi thẳng `/ingest` với `evidence_emitted[]` |
| Spec A6: server kiểm evidence skill ∈ `context.skills_*` của scenario | Chưa có kho scenario ở backend | Khi lưu scenario skeleton, thêm 1 check trong `ingest` |
| Soft skill trong điều kiện mở khoá | Dataset 22-role không có soft skill | Chờ dữ liệu; taxonomy đã có sẵn 58 soft skill |

---

## 7. Câu hỏi có thể bị hỏi & cách trả lời

- **"Sao không trừ nhiên liệu khi bay?"** — XP là năng lực đã tích luỹ; trừ đi là nói người chơi mất kỹ năng vì đã dùng 1 lần. Ngoài ra trừ sẽ tạo trạng thái kẹt (hết fuel không đi được nữa). Đã ghi rõ trong plan 2.2 để anh/chị duyệt; đổi sang tiêu hao chỉ là 1 dòng ở `fly()`.
- **"Đủ XP có warp tới node xa được không?"** — Không, cố ý. Chỉ 1-hop từ vị trí hiện tại, giữ đúng ẩn dụ và tránh nhảy cóc lộ trình.
- **"Đổi DB có phải sửa nhiều không?"** — Không: 5 interface ở `shared/repositories`, 1 file adapter mới, đổi `useFactory` trong `persistence.module.ts`. Service/controller/test không đổi.
- **"Client gian lận gửi +2 kèm hint thì sao?"** — Server ép về 0 và log cảnh báo; nhãn client không bao giờ được tin tuyệt đối. Tương tự `fly` tự kiểm lại điều kiện.
- **"Tại sao 64 cạnh chứ không phải 103?"** — 39 cạnh ABSORBED trỏ tới role không tồn tại trong 22 node; chúng là alias tìm kiếm. Vẫn giữ data, hiển thị dạng vệ tinh/toggle.
- **"Bao nhiêu XP thì mở được node đầu tiên?"** — Cạnh rẻ nhất từ Front-end là UI/UX (fuel 45, không skill yêu cầu). Với `BASE_XP=10`, khoảng 1–2 scenario chơi tốt. Tất cả là hằng số tunable.

---

## Phụ lục — Ảnh

- `docs/report/images/planet-universe.png` — toàn cảnh vũ trụ (trạng thái sạch, đang ở Front-end)
- `docs/report/images/planet-panel.png` — panel role Mobile với checklist skill thiếu
