# 04 · Hiện trạng repo: code và dữ liệu

> Chụp tại commit `19a9e93` (18/9, "integrate with database") trên `main`, cộng thay đổi chưa commit ngày 20/9.
> Repo: `github.com/The-Golden-Trio/Capstone-Project`

## 1. Bản đồ repo

```
Capstone-Project/
├─ apps/
│  ├─ web/                 React 19 + Vite + Tailwind 4 + react-three-fiber (bản đồ 3D) + i18n VI/EN
│  └─ api/                 NestJS + Prisma 7 + PostgreSQL · auth (email + Google, JWT cookie) · content · profile · runs
├─ packages/
│  └─ game-core/           Logic game dùng chung: scenarioEngine, chấm điểm, band, fit, side quest
│     └─ data/             game-data.json · galaxy-data.json (SINH TỰ ĐỘNG, đừng sửa tay)
├─ occupation-data/        Dữ liệu nghề IT: JD thô, pass 0/1/2, dataset 78 → 22 → 18 role, spec kịch bản, script Python
├─ docs/
│  ├─ project-hub/         ◄ SINGLE SOURCE OF TRUTH (thư mục này)
│  ├─ data/build*.mjs      Script build game-data / galaxy-data từ occupation-data
│  ├─ vao-nghe-flow.*      Sơ đồ màn hình (20/9)
│  └─ (các file tháng 7)   Tài liệu đề tài v1, chỉ còn giá trị lịch sử — xem docs/README.md
├─ infra/local/            docker-compose chạy Overleaf (LaTeX) ở máy
└─ _archive/               Tài liệu và dữ liệu cũ đã chuyển ra (21–23/9), giữ nguyên cấu trúc thư mục
```

## 2. Chạy thử

```sh
pnpm install
cp apps/api/.env.example apps/api/.env      # điền DATABASE_URL, DIRECT_URL, JWT_*, GOOGLE_*
pnpm db:migrate                             # tạo bảng
pnpm data:build                             # occupation-data → packages/game-core/data/*.json
pnpm exec nx run @datn/api:seed-content   # đẩy nội dung game vào DB
pnpm start                                  # web :4200, api :3000/api
```

## 3. Luồng màn hình đã code

| Route | Màn | Có gì |
|---|---|---|
| `/login`, `/register` | Đăng nhập / tạo tài khoản | Email + mật khẩu, nút Google, ngày sinh, đổi ngôn ngữ VI/EN |
| (cổng) | `RequireAuth` + `decideGate()` | Chưa đăng nhập → `/login`. Dưới 16 tuổi chưa có đồng ý → `/consent`. Chưa tự vấn → `/quiz`. Qua hết → `/jobs` |
| `/consent` | Người lớn đồng ý | Tên + email người giám hộ (chỉ ghi nhận) |
| `/quiz` → `/quiz/result` | Get to Know Me → Chân dung | 6 câu, mỗi màn 1 câu, có nút bỏ qua. StarMap gợi ý 3 nghề, FitRadar 8 chiều, cảnh báo "chưa kiểm định" |
| `/jobs` | **Bản đồ ngân hà 3D** | 22 hành tinh, đường bay, buồng lái (vị trí, điểm, nghề đã ghé), dock hành tinh lân cận, PlanetPanel (điều kiện nhập cảnh), bài kiểm tra nhập cảnh |
| `/jobs/:role` | Quần đảo của nghề | Mỗi cấp L1…L10 là một đảo. LevelPanel: lương, điểm, nhân vật. Nút "Vào học / Tiếp tục học" (ghi danh) |
| `/jobs/:role/:band` | Bản đồ giấy của đảo | Ngọc = nhiệm vụ chính, núi/rừng = nhiệm vụ phụ (hỏi nhanh tại chỗ, cộng điểm) |
| `/play/:key` | **Màn chơi** | Trái: bối cảnh, nhân vật, kỹ năng. Phải: hội thoại + hoạt động (4 loại). Sự kiện chen ngang, hỏi vặn. Kịch bản L1 có thêm **văn phòng 2D đi bằng D-pad** |
| `/play/:key/end` | Tổng kết | Kết cục, điểm cứng/mềm, cấp mới, bằng chứng làm tốt / chưa tốt, chấm sao độ thực tế |
| `/profile` | Hành trang | Thẻ nhân vật, kỹ năng theo ngày, lộ trình L1→L10, lịch sử lượt chơi, FitRadar |
| `/account` | Tài khoản | Tên, email, mật khẩu, liên kết Google, xoá tài khoản |

Sơ đồ đầy đủ: [`assets/vao-nghe-flow.png`](assets/vao-nghe-flow.png).

## 4. Backend

- **API** (prefix `/api`): `auth/*` (register, login, google, refresh, logout, me, account, consent) · `content/bootstrap`, `content/galaxy`, `content/scenarios/:key` · `profile`, `profile/progress`, `profile/roles/:role(/enroll)`, `profile/runs`, `profile/quiz`, `profile/events/:id`, `profile/import` · `runs`, `runs/:id/complete`
- **DB (Prisma, 19 model):** User, OAuthAccount, RefreshToken, ParentalConsent, GameProfile, ScenarioRun, RunEvidence, UserBandSkill, EventAnswer, EventAward, Enrollment, cùng các bảng nội dung ContentRelease, RoleDoc, ScenarioDoc, SharedEventDoc, QuizQuestionDoc, FollowupDoc, GalaxyDoc, MetaDoc
- **Test:** 19 file spec (game-core: engine, band, fit, side quest · web: gate, galaxy, unlock, layout, i18n, office, map geometry · api: xp, skills, career-graph)

## 5. Dữ liệu

### Pipeline

```
jd_raw/*.txt (JD thật, đã archive) ──┐
ITviec report 2025–26 ───┼─► pass0 (78 role, archetype, đã archive) ─► pass1/*.json (76, đã archive) ─► pass2 (9 role tier-1 A_VERIFIED)
                         │         └─► output/dataset_final_merged.json (78 role master)
                         └─► dataset_22_roles_enriched_v3.json (22 role: skill, lương, graph, 97 sự kiện)
                                   └─► roles_18_playable.csv/json (18 role chơi được)

build_skill_taxonomy.py ─► output/skills_taxonomy.json (227 skill: 169 hard, 58 soft)
build_role_graph.py     ─► output/role_graph.json      (22 node, 64 cạnh, 39 alias gộp)

docs/data/build.mjs        ─► packages/game-core/data/game-data.json   (9 role nhóm Software, 2 scenario, 43 sự kiện, quiz)
docs/data/build-galaxy.mjs ─► packages/game-core/data/galaxy-data.json (22 hành tinh, 7 nhóm)
apps/api/src/scripts/seed-content.ts ─► PostgreSQL (bảng *Doc)
```

### File nào là bản chính?

| Dùng | Bỏ qua (bản cũ / trung gian) |
|---|---|
| `output/dataset_final_merged.json` (78 role) | `dataset_v1.json`, `pass1/` (đã archive) |
| `dataset_22_roles_enriched_v3.json` (22 role) | `dataset_22_roles_enriched.json`, `output/G1_22_roles.json` (đã archive) · `_v2.json` (còn giữ vì `patch_entry.py` đọc) |
| `roles_18_playable.*` | `_to_delete/pass1_new_62roles.zip` (đã archive) |
| `spec-scenario-KHOI1.md` **v2.2**, `HUONG-DAN-SINH-SCENARIO.md` | `docs/data/scenarios.js` (đã xoá ở `86878a2`) |
| `scenario-golden/SWE_BACKEND_L3.json`, `scenarios/SWE_BACKEND/L1_S_EXEC.json` | |

## 6. Cái gì là thật, cái gì là giả lập

| Hạng mục | Tình trạng |
|---|---|
| Đăng ký / đăng nhập / Google / đồng ý giám hộ / lưu tiến trình vào DB | ✅ **Chạy thật** |
| Bản đồ 3D, quần đảo, bản đồ đảo, màn chơi, tổng kết, hành trang | ✅ **Chạy thật** với nội dung có sẵn |
| Nội dung chơi được | ⚠️ **Rất ít:** 2 kịch bản viết tay (SWE_BACKEND L1 "Tham gia fix các bug mức độ ưu tiên thấp", L3 "Tối ưu hóa các API bị chậm"). 9 nghề có hồ sơ, 22 hành tinh trên bản đồ |
| **AI sinh kịch bản** | ❌ **Chưa có.** Kịch bản do người viết sẵn |
| **AI chấm tự luận** | ❌ **Chưa có.** Chấm bằng so khớp từ khoá (`keywordGrader.ts`). Sẵn interface để thay bằng `aiGrader.ts` |
| AI sinh follow-up | ❌ Chưa có (follow-up lấy từ dữ liệu có sẵn) |
| Get-to-know-me | ⚠️ Có, nhưng 6 câu tự soạn, **chưa kiểm định** |
| Đánh giá nghề 5 tiêu chí | ❌ Chưa có |
| Random bối cảnh công ty (OT, WFH…) | ❌ Chưa có (ý 3 trong task 8/9, được tách ra làm task riêng) |
| Công cụ cho chuyên gia / admin (viết seed, duyệt, xuất bản) | ❌ Chưa có |
| Bộ chuẩn đánh giá offline | ❌ Chưa có, chuyên gia chưa xác định |

## 7. Nợ kỹ thuật & dọn dẹp (chưa ai làm)

1. **Repo chưa có `README.md`:** bản cũ (nhắc tới `/graph`, `/skills`, `/dev/simulate` đã không còn) đã chuyển vào `_archive/` ngày 23/9. Cần viết bản mới (cách chạy ở §2).
2. **Code chết:** `apps/api/src/app/skills/*`, `app/career-graph/*`, `app/persistence/*` (persistence in-memory + snapshot JSON, từ commit `83e8966`) **không được import trong `AppModule`**. Chúng đã bị thay bởi `profile`/`progress` dùng Prisma.
3. `docs/prototype.html` đã chuyển vào `_archive/` (23/9), nhưng `docs/data/build.mjs` vẫn ghi ra `docs/data/game-data.js` cho nó.
4. `occupation-data/`: các bản dataset cũ, `pass1/` và file zip đã chuyển vào `_archive/` (23/9). `__pycache__` vẫn bị commit.
5. Nhánh `feat/paper-links` (PR #1, 27/7) **chưa merge**. Có 2 stash cũ trên máy Brian.
6. **Chưa commit:** `docs/vao-nghe-flow.*` và thay đổi ở `docs/data/game-data.js` + `packages/game-core/data/game-data.json`.
7. **Source LaTeX của báo cáo Ch.1–5 không có trong repo.** `_archive/docs/report/main.tex` là báo cáo đề tài v1 (tháng 7).
