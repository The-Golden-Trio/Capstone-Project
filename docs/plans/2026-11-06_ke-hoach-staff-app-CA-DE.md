# Kế hoạch hiện thực Staff app: Content Admin và Domain Expert

> Lập 6/11/2026, cập nhật 11/11/2026 trên `main` @ `64b366d`. Phạm vi: các màn của Content Admin (SITE-02: C01–C10) và Domain Expert (SITE-03: D01–D08), cộng phần dùng chung T00, T01, và toàn bộ backend mà các màn đó gọi.
> Nguồn: `reports/master/plantuml/` (sitemap, AD-02*, AD-03*, AD-04, SD-05…SD-09, SM-01, CL-00…CL-07, **ERD-00…ERD-07 bản 11/11**), `reports/master/report.md` (§4.3, §5.3.1, §5.3.2), `docs/project-hub/02-quyet-dinh.md` (D-104, D-116), và trong Project ĐACN: `api/openapi.yaml` (28/10), `sitemap/screens.yaml` (29/10), `nest/nest-modules.yaml` (31/10).
> ERD bản 11/11 khác bản trong repo đúng hai cột: `cast_member.name` (ERD-03) và `notification.created_at` (ERD-07). Hai cột này đã chép vào working tree, chưa commit.

---

## 1. Hiện trạng repo

> **Cập nhật 12/11/2026** (nhánh `feat/staff-app-ca-de`): đã làm **P0, P2, P3, P4** (trừ phần AI của P4 theo D-104), kiểm đầu cuối trên Postgres local với `AI_MODE=fake`. Chưa làm: P1 (C02, D02), P1b, P5, P6, C10/D08. Bảng dưới là ảnh chụp 6/11, giữ để đối chiếu. Chỗ lệch thiết kế khi code: [07 A22, A23](../project-hub/07-van-de-mo.md). Q6 (app riêng `apps/staff`, base `/staff/`, cổng 4300) đã chốt 12/11; Q7 làm khác đề xuất: worker vẫn là `main.js --worker`, processor mới đăng ký ở `WorkerModule`.

| Phần                 | Có gì                                                                                                             | Thiếu so với thiết kế                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/web`           | Explorer app prototype (React 19, Vite, Tailwind 4)                                                               | Không liên quan trực tiếp; chỉ tái dùng mẫu `api/client.ts`            |
| Staff app            | **Chưa có**                                                                                                       | Toàn bộ (DR-7: app riêng, cùng origin, chỉ staff tải)                  |
| `apps/api`           | NestJS 11 + Prisma 7: `auth` (cookie httpOnly), `content`, `profile`, `runs`; `ai/gateway` + `ai/narrator` (AI-4) | 18 module của CL-00, worker, BullMQ, SSE, scheduler, storage, importer |
| Prisma               | 19 model prototype, 3 role (`USER`, `CONTRIBUTOR`, `ADMIN`), id `cuid`                                            | Toàn bộ ERD-01…07 (snake_case, id `uuid`, 4 role, `staff_assignment`)  |
| `packages/game-core` | Engine, chấm closed format, luật dẫn truyện AI-4                                                                  | Dùng lại cho play-test (D05)                                           |
| `infra/local`        | Chỉ có Overleaf                                                                                                   | Postgres, Redis, MinIO cho dev                                         |

Kết luận: phần CA/DE gần như phải **xây mới toàn bộ**, cả backend lẫn frontend. Dùng lại được Prisma và model gateway sẵn có.

---

## 2. Quyết định

### Đã chốt (11/11)

| #   | Chốt                                                                                                                   | Hệ quả cho kế hoạch                                                                                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | `openapi.yaml` là hợp đồng API                                                                                         | Bước đầu P0: đưa `openapi.yaml` + `screens.yaml` vào repo (đề xuất `reports/master/api/`). Endpoint đặt đúng `operationId`                                                                                                                                                                                                                                       |
| Q2  | **Bearer token** (theo `openapi`: `Session` trả `accessToken` + `refreshToken`)                                        | Đổi `AuthModule` từ cookie sang bearer. Lệch `report.md` §5.3.1 (đang ghi giữ cookie): cần sửa câu đó. Xem các điểm kỹ thuật ở §2.3                                                                                                                                                                                                                              |
| Q3  | Đổi bảng tài khoản ở P0                                                                                                | Theo **ERD-01**, vì ERD còn hiệu lực: tạo `user_account` (uuid), `user_role`, `google_identity`, `staff_assignment`, `auth_session`, `password_reset_token`, `activity_log`; chuyển dữ liệu `User` cũ sang; trỏ FK các bảng prototype explorer sang `user_account.id`. Cách này thay cho phương án "mở rộng `User`" ở bản trước, vốn chỉ dành cho lúc tạm bỏ ERD |
| Q4  | **Chỉ DE soạn nội dung**                                                                                               | Giữ luồng AD-04 / SD-05: CA mở ô scenario, giao tác giả và người duyệt, rồi chọn cách trình bày; chỉ DE tác giả (cùng AI) viết nội dung. Không dùng AI-1/AI-2 của D-99. Cần ghi vào 07 A20                                                                                                                                                                       |
| Q5  | Thang **0 / 1 / 2** + cờ phản tác dụng; **phạt chỉ áp cho câu tự luận do judge chấm**; **dùng hint không bị trừ điểm** | ERD (`schema.yaml`) và `openapi.yaml` đã sửa ngày 11/11 (§2.2)                                                                                                                                                                                                                                                                                                   |

### 2.2 Q5: đã sửa ERD và `openapi` (11/11)

- **ERD-03, 05, 06** (sinh lại từ `db/schema.yaml`): mọi cột điểm nhận 0/1/2, `NULL` = "không xét" ở các bảng của judge; rubric và sự kiện ngẫu nhiên đổi sang `anchor_2/1/0` + `counterproductive_signs`; thêm cờ `counterproductive` ở `judge_score`, `criterion_grade`, `reference_answer_score`, `blind_rating`, `reference_regrade`; `activity_result` thêm `counterproductive_count` và bỏ ràng buộc trần điểm khi dùng hint. 44 kiểm tra trong `test_rules.sql` đều PASS trên PostgreSQL 16.
- **`openapi.yaml`** (nay ở `reports/master/api/`): `Score` = 0/1/2, thêm `ScoreOrNotApplicable`; `anchor2/1/0` + `counterproductiveSigns`; cờ phạt ở câu mẫu, chấm mù và báo cáo đồng thuận; `viewHint` không trừ điểm; thêm `cast[].name`. Validate OK: 108 operation, 106 schema.
- Cờ gộp của 3 judge: đa số (2/3, hoặc cả 2 khi còn 2 judge). Hệ số phạt theo band (0,25 · 0,35 · 0,5, D-116) là hằng số trong `game-core`.
- Còn lệch, chưa sửa: FR-13 trong `report.md` (vẫn ghi dùng hint mất mức +2) và `RuleEngine.applyHintCap` trong CL-07.

### 2.3 Q2 kéo theo: điểm kỹ thuật

- **SSE với bearer:** `EventSource` của trình duyệt không gửi được header `Authorization`. Đề xuất mở `/stream` bằng `fetch` + đọc stream (ví dụ `@microsoft/fetch-event-source`), vẫn giữ `Last-Event-ID`.
- **Lưu token:** access token giữ trong bộ nhớ, refresh token trong `localStorage`, xoay vòng mỗi lần refresh (`auth_session.refresh_token_hash`). Hết thời gian rảnh (NFR-17) tính bằng `auth_session.last_seen_at`.
- **Explorer app cũng phải đổi** (`apps/web/src/api/client.ts` + route `auth` của API), vì hai app dùng chung `AuthModule`. Gộp vào cùng PR P0 để không có lúc hai bên lệch nhau.

### 2.4 Chưa chốt nhưng không chặn (làm theo đề xuất nếu không có ý kiến)

| #   | Câu hỏi                                                             | Đề xuất                                                                              |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Q6  | Vị trí, route staff app                                             | `apps/staff` (`@datn/staff`), base `/staff/`, dev cổng 4300 proxy `/api`; route ở §5 |
| Q7  | Worker chạy ở đâu                                                   | Cùng project `apps/api`, entry `src/worker.ts`, target `serve-worker`                |
| Q8  | Prefix API                                                          | Route mới dưới `/api/v1`; route prototype giữ `/api` tới khi thay                    |
| Q9  | Ai đặt `bias_check = PASSED` cho asset tải lên (`asset.checked_by`) | Tạm cho CA tự xác nhận khi tải lên                                                   |
| Q10 | FR-44 (system prompt) chưa có trong bảng FR §4.3                    | Làm theo CL-04, ERD-07, sitemap; nhắc người viết §4.3                                |

D-104 (✅) để **sau** gợi ý trình bày bằng AI (FR-35) và sinh hình (FR-36). Vì vậy ở P4, chọn trình bày thủ công làm trước, nút AI làm cuối nếu còn thời gian.

---

## 3. Kiến trúc đích cho phần này

```
apps/staff          React 19 + Vite + Tailwind 4 + react-router + zustand + zod, base /staff/, tiếng Việt (không i18n)
apps/api            NestJS: API process (main.ts) + worker process (worker.ts), cùng codebase
  CoreModule        Prisma, BullMQ (QUEUES), StorageService (S3/MinIO), SettingsService
  NotificationModule StreamService (Redis pub/sub → SSE GET /stream), NotificationService, EmailProcessor, ReminderScheduler
  AuthModule        bearer + refresh xoay vòng, 4 role, AccessPolicyService, OccupationAccessGuard, ActivityLogService
  CatalogueModule · ImportModule · LifecycleModule · ScenarioModule · ReviewModule · PublishingModule · QualityModule · AiModule · MonitoringModule(StatisticsService)
packages/game-core  chạy bản game nháp trong staff app (D05); hằng số thang 0/1/2 và hệ số phạt
infra/local         dev-stack: postgres, redis, minio, mailpit
```

Ràng buộc giữ nguyên (CLAUDE.md §1): chỉ `LifecycleModule` đổi trạng thái scenario và ghi `lifecycle_log` trong cùng transaction; không gọi model trong request (lưu → queue → 202 → SSE); release bất biến; module chỉ import theo CL-00.

---

## 4. Lộ trình

Thứ tự P0 → P6. P1b chạy song song P2. Phần runtime của explorer (PlayModule, AssessmentModule mới) cần bắt đầu song song từ P2 để kịp P5.

### P0 · Nền tảng (chặn mọi giai đoạn sau)

Nguồn: CL-00, CL-01, CL-07 · ERD-01, ERD-07 · SD-04 · FR-01, FR-40, FR-41 · Q1, Q2, Q3.

Backend

- Đưa `openapi.yaml`, `screens.yaml` vào repo (Q1).
- `infra/local/dev-stack.yml`: postgres, redis, minio, mailpit; cập nhật `.env.example`.
- Prisma: ERD-01 đủ bảng; phần ERD-07 cần ngay (`notification`, `ai_job`, `model_config`, `model_slot`, `usage_cost`, `prompt_template`); migration chuyển `User` → `user_account` và trỏ lại FK prototype (Q3). Luật cần partial unique index hoặc trigger (một CA mỗi nghề, FR-40) viết vào migration SQL.
- `CoreModule`, `NotificationModule` (`openEventStream`, `listNotifications`), `AuthModule` chuyển sang bearer (`signIn`, `refreshSession`, `signOut`, `getMe` trả `roles`, `requestPasswordReset`, `confirmPasswordReset`; `OccupationAccessGuard` trên mọi route `/staff`).
- Filter lỗi Problem Details (RFC 9457) có `code` ổn định (`INVALID_TRANSITION`, `NOT_ASSIGNED`…).
- Entry `worker.ts`; seed dev: 1 System Admin, 1 Content Admin, 3 Domain Expert, 1 domain, 1 occupation, `staff_assignment` (màn A03 của SA nằm ngoài phạm vi, nên dev cần seed).
- Sửa `apps/web` sang bearer trong cùng PR (§2.3).

Frontend `apps/staff` (dùng skill `nx-generate` để scaffold)

- T01 Staff sign in, T00 shell (refresh token, chuông thông báo), tự mở portal theo role, đổi portal nếu một người giữ nhiều vai.
- Thư viện chung: API client bearer (khoá refresh một lần), hook `useEventStream` dựa trên fetch (chỉ mở ở C03, C06, C07, D03, D05, D07), hiển thị lỗi Problem, primitive form có hỗ trợ bàn phím và screen reader (NFR-19).

Xong khi: CA và DE đăng nhập vào đúng portal; explorer vẫn đăng nhập được; route `/staff` từ chối occupation không được giao (403 `NOT_ASSIGNED`); `/stream` nhận được event thử.

### P1 · Danh mục nghề, tiêu chí duyệt, hồ sơ nghề

Nguồn: FR-21, FR-30, FR-32 · AD-02a, AD-02b, AD-03a, AD-03d · CL-02 · ERD-02, ERD-04 (`review_criteria_version`, `review_criterion`).

- Backend `CatalogueModule`: `listDomains`, `createDomain`, `updateDomain`, `deleteDomain`, `listMyOccupations`, `createOccupation`, `updateOccupation`, `publishOccupation`, `retireOccupation`, `getReviewCriteria`, `createReviewCriteriaVersion`, `getOccupationProfileForEdit`, `saveOccupationProfile` (+ `AdjacencyService.recompute`).
- Frontend: C01 portal CA, C02 danh mục nghề, C04 tiêu chí duyệt, D01 (phần nghề được giao), D02 quản lý hồ sơ nghề (cấp, mô tả, vai trò tương lai, mặt trái, lương, luật sinh, năng lực, task; nghề liên quan chỉ đọc).
- Lưu ý: `publishOccupation` đòi ít nhất một scenario đã publish, nên chỉ kiểm hết được sau P5. Danh sách `competency` lấy từ import (P1b) hoặc seed.

### P1b · Nhập dữ liệu O\*NET / ESCO (song song P2)

Nguồn: FR-31 · AD-02c · SD-09 · CL-02 `ImportModule` · ERD-02 (`import_job`, `reference_record`).

- Backend: `startImport` (multipart → MinIO, 202), `ImportProcessor` ở worker (đẩy `import.finished`), `getImport`, `fixImportRecord`, `completeImport` (lưu, ghi log, báo DE).
- Frontend: C03 (tải file, tiến độ, bản ghi chưa khớp lên trước, sửa / bỏ qua / điều chỉnh cho Việt Nam, tóm tắt).
- Rủi ro: `ReferenceSourceClient` cần mạng tới O\*NET, ESCO; dev dùng file mẫu trong `occupation-data/`.

### P2 · Mở scenario, giao việc, soạn nội dung với AI

Nguồn: FR-22, FR-23, FR-24, FR-33, FR-34 (giao), FR-44 · AD-04 · SD-05 · SM-01 · CL-04 (`AiModule`), CL-05 · ERD-03, ERD-04 (`review_assignment`, `lifecycle_log`), ERD-07 (`prompt_template`) · Q4, Q5.

Backend

- `LifecycleModule`: `ScenarioStateMachine` với bảng TRANSITIONS đúng SM-01, `allowedActions` theo role, ghi log cùng transaction. Test đủ mọi cạnh của SM-01, kể cả cạnh bị cấm.
- `ScenarioModule`: `listScenarios`, `openScenario` (409 `ACTIVE_SCENARIO_EXISTS`), `getScenario`, `assignScenarioStaff` (qua `AssignmentService`, 422 `REVIEWER_IS_AUTHOR`), `getScenarioHistory`, `getSituationOptions`, `requestGeneration`, `requestRevision`, `listGenerations`, `saveScenarioContent` (`If-Match` = `row_version`, 412 khi lệch), `listReferenceAnswers`, `addReferenceAnswer`, `runContentChecks`, `submitScenario`; `GenerationProcessor` ở worker.
- `ContentValidator`: luật của `occupation-data/specs/` (một activity gốc, con trỏ hợp lệ, kỹ năng trong phạm vi, trần follow-up, 10–15 phút, kết cục).
- `AiModule`: `ModelGatewayService` dựng trên `apps/api/src/ai/gateway` đã có; `ModelConfigService` (đọc `AI_MODELS` từ env, kiểm 4 họ khác nhau); `PromptBuilder.generation/revision`; `CostLedgerService`; `PromptTemplateService` + `listSystemPrompts`, `listSystemPromptVersions`, `saveSystemPrompt` (409 khi `baseVersionNo` cũ).

Frontend

- C05 Ô scenario: cây cấp → task → trạng thái scenario; mở scenario; giao tác giả, người duyệt, hạn duyệt; lịch sử vòng đời.
- D01 đủ phần "scenario tôi viết".
- D03 Soạn scenario (màn lớn nhất, chia 3–4 PR): context + lựa chọn tình huống → sinh (chờ `generation.ready`) → editor theo `ScenarioContent` (3–4 activity, item kèm điểm 0/1/2, rubric 3 mức + dấu hiệu phản tác dụng, hint, sự kiện ngẫu nhiên, kết cục, nhiệm vụ phụ) → sửa từng phần với AI → câu mẫu → kiểm tự động → nộp. Xử lý xung đột 412.
- C10 và D08 System prompts: một component dùng chung cho hai portal.

Xong khi: CA mở và giao một scenario; DE sinh, sửa, nộp được; scenario chuyển Draft → Submitted, có log.

### P3 · Duyệt scenario, giao lại khi quá hạn

Nguồn: FR-25, FR-32 (áp dụng), FR-34 (giao lại) · AD-02f · SD-06 · CL-05 `ReviewModule` · ERD-04 (`review`, `review_answer`).

- Backend: `listMyReviewQueue`, `openScenarioForReview` (Submitted → In review; 403 nếu là tác giả hoặc không được giao), `decideReview` (422 `CRITERIA_MISSING`; duyệt → Approved, yêu cầu sửa → Draft, từ chối → Retired), `listReviewAssignments`, `reassignReview`; `ReminderScheduler` (nhắc trước hạn, báo quá hạn) + email.
- Frontend: D04 (nội dung chỉ đọc + từng tiêu chí MET/NOT_MET + quyết định), D01 hàng đợi duyệt có hạn, C05 danh sách quá hạn và giao lại.

### P4 · Gamify, thư viện asset, bản game nháp

Nguồn: FR-26 (dựng bản nháp), FR-35, FR-36 · SD-07 (nửa đầu) · CL-06 · ERD-04 (`asset`, `presentation*`, `scenario_build`).

- Backend: `getPresentation`, `savePresentation` (422 `TASK_TYPE_NOT_ALLOWED`, khoá ghép với `activity_allowed_type`), `listAssets`, `uploadAsset`, `buildDraftGame` (Approved → In playtest, `BuildSnapshotter` + hash, báo tác giả), `getBuild`.
- AI để cuối giai đoạn (D-104): `requestPresentationSuggestions` + `SuggestionProcessor`, `generateAsset` + `AssetProcessor` + kiểm thiên kiến.
- Frontend: C06 Gamify (nội dung chỉ đọc; mỗi activity chọn task type trong tập DE cho phép, cảnh; avatar NPC; nền; xem trước bản nháp), C07 thư viện asset.

### P5 · Chơi thử và xuất bản

Nguồn: FR-26, FR-37, FR-38 · SD-07 (nửa sau), SD-08, AD-02d · CL-03 (`PlayModule`), CL-06 · ERD-04 (`scenario_release`, `playtest_finding`), ERD-05, ERD-06.

- **Phụ thuộc:** `PlayModule` và `AssessmentModule` mới (run append-only, luồng trả lời SD-01, panel 3 judge chấm 0/1/2 + cờ phạt). Đây là runtime của explorer, không thuộc phạm vi CA/DE nhưng D05 dùng chung.
- Backend: `startPlaytestRun` (run gắn cờ play-test, loại khỏi thống kê), các route `/runs/*` cho DE, `reportPlaytestFindings` (DISPLAY → Approved, CONTENT → Draft), `passPlaytest` (→ Ready), `publishScenario` (chỉ Ready, so hash, lưu theo version vào storage, `ReleaseScheduler` cho ngày hiệu lực sau), `deleteScenario` (→ Retired, giữ lịch sử, giải phóng ô).
- Frontend: D05 Play-test (staff app nhúng `game-core`; cần quyết định tách UI màn chơi thành package dùng chung với `apps/web` hay viết bản gọn), C08 Xuất bản, nút xoá ở C05.

Xong khi: một scenario đi hết SM-01 tới Published và explorer chơi được release đó.

### P6 · Chất lượng và giám sát

Nguồn: FR-14 (cờ nội dung), FR-27, FR-28, FR-29, FR-39 · AD-02e, AD-03b, AD-03c · CL-04 `QualityModule`, CL-05 `RevalidationService`, CL-07 `StatisticsService` · ERD-04 (`revalidation_request`), ERD-05 (`content_flag`), ERD-06 (`blind_rating`, `reference_regrade`).

- Backend: `listContentFlags`, `handleContentFlag`, `requestRevalidation`, `recordRevalidation`, `getBlindSamples`, `submitBlindRatings` (+ `RegradeProcessor` dùng `JudgePanelService`), `getAgreementReport` (kappa theo tầng; với thang 0/1/2 nên dùng kappa có trọng số), `requestReplacement`, `getOccupationStatistics` (bỏ run play-test, giấu rating dưới ngưỡng).
- Frontend: D06 Kiểm định lại, D07 Độ tin cậy chấm, C09 Theo dõi nghề.
- Cần dữ liệu thật từ explorer (cờ, lượt chơi) và panel judge của P5.

---

## 5. Màn hình → route đề xuất → giai đoạn

Route là **đề xuất** (Q6); sơ đồ chỉ có tên màn. Cột "API" là số operation màn đó gọi theo `screens.yaml`.

| Màn | Tên                        | Route đề xuất                                         | API | Giai đoạn  |
| --- | -------------------------- | ----------------------------------------------------- | --- | ---------- |
| T01 | Staff sign in              | `/staff/login`                                        | 4   | P0         |
| T00 | Shell                      | (mọi màn)                                             | 2   | P0         |
| C01 | Content Admin portal       | `/staff/ca`                                           | 1   | P1         |
| C02 | Occupation catalogue       | `/staff/ca/catalogue`                                 | 8   | P1         |
| C03 | Reference data import      | `/staff/ca/catalogue/imports/:importId?`              | 5   | P1b        |
| C04 | Review criteria            | `/staff/ca/occupations/:occupationId/review-criteria` | 2   | P1         |
| C05 | Scenario slots             | `/staff/ca/occupations/:occupationId/scenarios`       | 9   | P2, P3, P5 |
| C06 | Gamify workspace           | `/staff/ca/scenarios/:scenarioId/gamify`              | 7   | P4         |
| C07 | Asset library              | `/staff/ca/assets`                                    | 4   | P4         |
| C08 | Publish scenario           | `/staff/ca/scenarios/:scenarioId/publish`             | 2   | P5         |
| C09 | Occupation monitor         | `/staff/ca/occupations/:occupationId/monitor`         | 3   | P6         |
| C10 | System prompts             | `/staff/ca/occupations/:occupationId/prompts`         | 3   | P2         |
| D01 | Domain Expert portal       | `/staff/de`                                           | 3   | P1, P2, P3 |
| D02 | Occupation profile manager | `/staff/de/occupations/:occupationId/profile`         | 2   | P1         |
| D03 | Scenario authoring         | `/staff/de/scenarios/:scenarioId/author`              | 12  | P2         |
| D04 | Review scenario            | `/staff/de/scenarios/:scenarioId/review`              | 2   | P3         |
| D05 | Play-test                  | `/staff/de/builds/:buildId/playtest`                  | 11  | P5         |
| D06 | Revalidation               | `/staff/de/revalidation`                              | 5   | P6         |
| D07 | Grading reliability        | `/staff/de/occupations/:occupationId/reliability`     | 5   | P6         |
| D08 | System prompts             | `/staff/de/occupations/:occupationId/prompts`         | 3   | P2         |

Liên kết chéo theo sitemap: C05 → C06 khi Approved; C06 → C07 chọn asset; C06 → C08 khi qua play-test; D04 → D03 khi yêu cầu sửa; D05 → D03 khi có lỗi nội dung; D07 → D08 chỉnh prompt chấm.

---

## 6. Rủi ro

- **Đổi bảng tài khoản và cách đăng nhập ở P0** đụng code explorer prototype (auth, profile, runs, `apps/web` client). Giữ phạm vi ở danh tính và phiên; phần còn lại báo riêng (CLAUDE.md: không sửa lan).
- **Luật kiểm nội dung** dựa trên spec scenario, mà game design còn chờ (D-95). Viết `ContentValidator` theo từng luật có tên để dễ đổi.
- **D05 phụ thuộc runtime explorer mới.** Nếu phần đó chưa xong, P5 trễ theo; P6 cũng cần dữ liệu thật.
- **Chi phí gọi model** khi thử P2: đặt hạn mức theo D-102, dùng `ai/testing/fake-model.ts` cho test tự động.

---

## 7. Mỗi PR

1. Tìm FR, use case → đọc AD, SD → module trong CL → bảng trong ERD → schema trong `openapi` → quyết định ✅ liên quan.
2. Endpoint đúng `operationId` của `openapi.yaml`; tên controller, service đúng CL; bảng, cột đúng ERD.
3. Test: state machine, guard phân quyền, luật 409/412/422 trong mô tả endpoint.
4. `pnpm nx format:check` và `pnpm check` trước khi báo xong.
5. Commit qua skill `capstone-commit-helper`; người dùng tự chạy `git commit -F` (khoá SSH có passphrase). Mô tả PR ghi ID: FR, UC, SD, CL, ERD, D.
