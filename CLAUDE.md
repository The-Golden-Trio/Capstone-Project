# Context chung của repo

@AGENTS.md

Context sản phẩm, bản đồ code, nguồn tài liệu, lệnh làm việc và trạng thái hiện thực nằm trong `AGENTS.md` ở gốc. Khi làm việc với thiết kế AI/AI-4, đọc thêm `docs/project-hub/assets/ai-design/AGENTS.md`. Cập nhật các file context này khi thông tin thay đổi, tránh duy trì hai bản mô tả dự án lệch nhau.

# Quy tắc cho AI trong repo này

JobQuest: nền tảng web/game cho người dùng **làm thử một nghề** qua các scenario nhập vai, AI dẫn dắt và chấm điểm. Đồ án tốt nghiệp HCMUT của nhóm Golden Trio. ĐATN **hiện thực** những gì ĐACN đã thiết kế (D-103), nên việc code ở đây là **làm đúng thiết kế đã chốt**, không thiết kế lại.

Trả lời người dùng bằng tiếng Việt có dấu. Code, tên biến, comment trong code viết tiếng Anh như code hiện có.

## 1. Code theo thiết kế đã chốt (quy tắc quan trọng nhất)

Mọi tính năng, endpoint, bảng, module đều phải truy được về một tài liệu thiết kế đã chốt. Code hiện tại là **prototype**, không phải chuẩn: báo cáo §5.3.1 ghi rõ _"The architecture is derived from the requirements, not from the prototype"_.

### Nguồn thiết kế, theo thứ tự ưu tiên

| #   | Nguồn                                              | Ở đâu                                                                                                                                                                                                                                                                                                     |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Quyết định đang hiệu lực** (✅)                  | [docs/project-hub/02-quyet-dinh.md](docs/project-hub/02-quyet-dinh.md). Dòng ♻️ đã bị thay, ⚠️ đang mâu thuẫn, 💡 mới là đề xuất: **không** code theo 3 loại này                                                                                                                                          |
| 2   | **Báo cáo master** (yêu cầu + thiết kế)            | [reports/master/report.md](reports/master/report.md). §4.3 yêu cầu (BR, DC, FR, NFR, DR), §5.1 use case + activity, §5.2 công nghệ, §5.3.1 kiến trúc, §5.3.2 sitemap, §5.3.3 sequence, §5.3.6 AI, §5.3.10 chính sách dữ liệu                                                                              |
| 3   | **Sơ đồ PlantUML** (nguồn chính, đọc file `.puml`) | [reports/master/plantuml/](reports/master/plantuml/), xem bảng bên dưới                                                                                                                                                                                                                                   |
| 4   | Sơ đồ chỉ có ảnh                                   | [reports/master/figures/](reports/master/figures/) (PNG, đọc bằng Read): `jobquest_component_diagram`, `jobquest_deployment`, `jobquest_arch_overview`, `jobquest_content_lifecycle`, `jobquest_seq_assessed_turn`. Các PNG khác trong thư mục này là bản xuất từ `.puml`; nếu lệch nhau thì `.puml` đúng |
| 5   | **Thiết kế AI**                                    | [docs/project-hub/assets/ai-design/](docs/project-hub/assets/ai-design/README.md); ví dụ request/response thật của AI-4 ở `ai-4-api/`                                                                                                                                                                     |
| 6   | **Game design**                                    | [research/reports/](research/reports/): `Seed scenario JobQuest.md`, `Hồ sơ JobQuest cơ chế game.md`, `Kinh tế và sức khoẻ JobQuest.md`, `Gợi ý nghề cách tính.md`; luật kịch bản ở [occupation-data/specs/](occupation-data/specs/)                                                                      |
| 7   | **Đặc tả API** (báo cáo §5.3.7)                    | Chưa có trong `report.md` tại 6/11/2026. Danh sách endpoint của prototype ở [04 §4](docs/project-hub/04-hien-trang-code-data.md) chỉ mô tả code cũ, không phải hợp đồng đã chốt                                                                                                                           |

### Sơ đồ PlantUML (`reports/master/plantuml/`)

Đọc thẳng file `.puml` (dạng text), không cần render. Đây là bản thiết kế chi tiết nhất để code theo.

| Thư mục / file                                                   | Sơ đồ                                                                                                                                                          | Dùng khi                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `UC-00_JobQuest.puml`                                            | Use case toàn hệ thống                                                                                                                                         | Xác định actor và use case của tính năng                                                  |
| `explorer/`, `content-admin/`, `domain-expert/`, `system-admin/` | Activity `AD-01*`, `AD-02*`, `AD-03*`, `AD-05*` theo actor; `AD-04_GeneratingScenario.puml` ở gốc                                                              | Luồng nghiệp vụ, nhánh lỗi, điều kiện chặn                                                |
| `sequence/`                                                      | `SD-01`…`SD-09`                                                                                                                                                | Thứ tự gọi giữa app, module, DB, Redis, dịch vụ ngoài: theo đúng thứ tự này khi code      |
| `class/`                                                         | `CL-00_ModuleMap` (module NestJS, module nào chạy ở `api`/`worker`, module nào import module nào) · `CL-01`…`CL-07` (controller, service, DTO của từng module) | Tạo module, controller, service, DTO: dùng đúng tên, vị trí và quan hệ import trong sơ đồ |
| `erd/`                                                           | `ERD-00_Overview` · `ERD-01`…`ERD-07` theo nhóm                                                                                                                | Schema Prisma: tên bảng, cột, kiểu, khoá, ràng buộc                                       |
| `sitemap/`                                                       | `SITE-01` explorer app · `SITE-02`…`SITE-04` staff app theo actor                                                                                              | Route và màn hình frontend                                                                |
| `SM-01_ScenarioLifecycle.puml`                                   | State machine scenario                                                                                                                                         | Mọi chuyển trạng thái của scenario                                                        |

ERD PlantUML (khoá `uuid`, bảng `user_account`…) **thay** bản Mermaid cũ ở `docs/project-hub/assets/jobquest-erd-mermaid.md` (29/9). Chỉ mở bản Mermaid khi người dùng nhắc tới nó.

Khi làm một tính năng: tìm FR và use case tương ứng → đọc activity và sequence diagram của nó → xem module trong `class/` và bảng trong `erd/` → đối chiếu các quyết định ✅ liên quan → rồi mới code. Ghi ID (FR-xx, UC-xx, SD-xx, CL-xx, ERD-xx, D-xx) vào mô tả PR.

### Khi tài liệu thiếu, mâu thuẫn hoặc lệch code

- **Không tự đoán và không tự thiết kế lại.** Không bịa endpoint, field, bảng, trạng thái hay luật chơi không có trong tài liệu.
- Tài liệu **thiếu** (ví dụ chưa có đặc tả API cho endpoint cần làm): suy ra từ sequence diagram + FR, đưa đề xuất (path, method, request/response) cho người dùng duyệt **trước** khi code.
- Hai nguồn **mâu thuẫn** nhau, hoặc thiết kế có vẻ sai: dừng, nêu rõ hai chỗ (file + mục/dòng), hỏi người dùng chọn. Đề xuất ghi vào [07-van-de-mo.md](docs/project-hub/07-van-de-mo.md) nếu người dùng đồng ý.
- Code prototype **lệch** thiết kế: làm theo thiết kế. Nếu sửa cho đúng sẽ lan rộng ngoài phạm vi task, báo lại thay vì sửa lan.
- Không sửa tài liệu thiết kế để khớp với code mình vừa viết. Đổi thiết kế là quyết định của nhóm (thêm dòng vào `02`, không xoá dòng cũ).

### Các ràng buộc kiến trúc phải giữ (tóm tắt §5.3.1, khi nghi ngờ đọc bản gốc)

- **Modular monolith + worker bất đồng bộ.** Một codebase, chạy hai vai: API process và worker process. Danh sách module NestJS, vai chạy và quan hệ import nằm ở `class/CL-00_ModuleMap.puml`. Không thêm module hay import ngoài sơ đồ đó. Module chỉ gọi nhau qua public interface. API và worker không gọi nhau trực tiếp, chỉ qua job queue và pub/sub trên Redis.
- **Không gọi model trong request nộp câu trả lời.** Lưu câu trả lời vào PostgreSQL trước, đẩy job vào queue, trả lời ngay; kết quả về client qua server-sent events (polling chỉ là dự phòng).
- **Server là nguồn chân lý của điểm.** Client chỉ tính điểm tạm bằng cùng luật trong `game-core`.
- **Run là chuỗi sự kiện append-only**, state = fold sự kiện qua `game-core`. Output của model vào run dưới dạng sự kiện có provenance (model, prompt version, cost, latency), không bao giờ tính lại.
- **Nội dung là dữ liệu có vòng đời** (SM-01). Chỉ Content lifecycle được ghi nội dung; mỗi lần chuyển trạng thái ghi kèm log trong cùng transaction; release đã publish là bất biến, có version. Code diễn giải nội dung, không chứa nội dung.
- **`game-core` không phụ thuộc framework, network hay storage**, chạy y hệt ở browser và server.
- **Model qua port/adapter**, chọn bằng cấu hình. Narrator và các judge phải khác họ model (DC-01). Mọi lần gọi đi qua model gateway và được ghi vào sổ chi phí, có trần mỗi phiên.
- **Dữ liệu cá nhân:** khử định danh văn bản của người chơi trước mọi lời gọi model; chỉ gửi đúng phần task cần (DC-03, §5.3.10).
- **Không có đường thay thế không dùng AI** (D-92): model lỗi thì chuyển model cùng vai, hết model thì phiên tạm dừng và giữ tiến độ. Không viết output giả hay chấm bằng script để "chữa cháy".
- Get-to-know-me **không** gọi AI (FR-04).

### Những chỗ prototype đang lệch thiết kế (đừng coi là chuẩn)

- Run gửi một lần khi kết thúc, chấm lại ở server bằng replay; thiết kế là gửi từng lượt.
- Câu tự luận chấm bằng so khớp từ khoá (`keywordGrader.ts`, đồng bộ trong reducer); thiết kế là judge panel bất đồng bộ, kết quả vào run dưới dạng sự kiện.
- Từ 12/11 (nhánh `feat/staff-app-ca-de`): danh tính theo ERD-01 (`user_account`, `user_role` 4 vai, `staff_assignment`, `auth_session`), auth là **Bearer** (Q2), bảng ERD-02 (phần cần), ERD-03, ERD-04 đã có. Các bảng explorer (`GameProfile`, `ScenarioRun`, nội dung `*Doc`…) vẫn là bảng prototype, khác ERD-05/06.
- Module prototype (`content`, `profile`, `runs`, `play`, `assessment`) không khớp `CL-00`. Module theo CL-00 đã có: `AuthModule`, `UserModule` (chỉ `getMe`), `CatalogueModule` (rút gọn), `LifecycleModule`, `ScenarioModule`, `ReviewModule`, `PublishingModule` (asset, trình bày, bản nháp), `NotificationModule`, `FeedbackModule` (đánh giá nghề FR-19, góp ý app FR-20; chưa có phần admin). Chỗ lệch thiết kế khi làm staff app ghi ở [07 A22, A23](docs/project-hub/07-van-de-mo.md).
- Từ 11/11 đã có worker (`main.js --worker`), queue BullMQ, SSE, model gateway và luồng chơi `/api/v1/runs` nối AI-4 + AI-5 ([handoff](docs/project-hub/assets/ai-design/tich-hop-ai-4-ai-5.md)). Luồng ca làm (Game Design W45) chạy song song ở `/api/v1/shift-runs` (đề xuất ngoài `openapi.yaml`: `docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`), engine `packages/game-core/src/shift/`, chưa chấm điểm. Staff app `apps/staff` (CA, DE) làm tới dựng bản nháp (P0, P2, P3, P4); chưa có play-test, xuất bản (P5), import (P1b), giám sát (P6).
- Code chết không được import trong `AppModule`: `apps/api/src/app/skills/*`, `app/career-graph/*`, `app/persistence/*`. Đừng dựa vào hay mở rộng chúng.

## 2. Bản đồ repo và lệnh

| Thư mục                                  | Là gì                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `apps/web` (`@datn/web`)                 | React 19 + Vite + Tailwind 4 + react-three-fiber, zustand, chỉ tiếng Việt (D-96) |
| `apps/staff` (`@datn/staff`)             | Staff app cho CA, DE: React 19 + Vite + Tailwind 4, base `/staff/`, cổng 4300    |
| `apps/api` (`@datn/api`)                 | NestJS 11 + Prisma 7 + PostgreSQL, BullMQ, zod                                   |
| `packages/game-core` (`@datn/game-core`) | Logic game dùng chung: engine, chấm, band, fit, side quest                       |
| `occupation-data/`                       | Dữ liệu nghề, kịch bản, spec (xem `occupation-data/README.md`)                   |
| `docs/project-hub/`                      | **Single source of truth** của đề tài; đọc `00-tong-quan.md` trước               |
| `reports/master/`                        | Báo cáo tổng; sửa ở `report.md`, LaTeX sinh ra từ đó (xem `reports/README.md`)   |

Lệnh hay dùng (chạy qua Nx, tiền tố `pnpm`):

```sh
pnpm start                      # web :4200, api :3000/api
pnpm check                      # lint + typecheck + build + test mọi project
pnpm nx run @datn/api:test      # test một project
pnpm db:migrate                 # Prisma migrate (config: apps/api/prisma.config.ts)
pnpm data:build                 # occupation-data → packages/game-core/data/*.json
pnpm exec nx run @datn/api:seed-content
pnpm exec nx run @datn/staff:serve    # staff app :4300/staff
SEED_STAFF_PASSWORD=... pnpm exec nx run @datn/api:seed-staff   # tài khoản CA/DE, nghề SWE_BACKEND [dev]
```

CI chạy `nx format:check` và `nx run-many -t lint test build typecheck`. Chạy các bước tương ứng trước khi báo xong.

### File sinh tự động: không sửa tay

- `packages/game-core/data/game-data.json`, `galaxy-data.json`: sửa nguồn ở `occupation-data/` rồi `pnpm data:build`.
- `occupation-data/generated/*`: sinh bởi `occupation-data/scripts/`.
- `apps/api/src/generated/*`: Prisma client.
- `reports/master/main.tex`, `chapters/*.tex`, `references.tex`: sinh từ `report.md`.

## 3. Commit và PR

Theo [CONTRIBUTING.md](CONTRIBUTING.md): Conventional Commits, mô tả tiếng Việt có dấu, dòng `Task: T….` khi làm task được giao, PR vào `main` theo template. Dùng skill `/capstone-commit-helper` để viết message và PR. Chỉ commit hoặc push khi người dùng yêu cầu.

## 4. Không đọc `_archive/` trừ khi được yêu cầu

`_archive/` chứa tài liệu và dữ liệu **đã hết hiệu lực** (đề tài v1 tháng 7, dữ liệu nghề pass 0–1, code và docs cũ). Đọc nó chỉ tốn token và dễ lẫn thông tin cũ với thông tin hiện hành.

- **Không** mở, đọc, liệt kê, tìm kiếm hay trích dẫn bất kỳ file nào trong `_archive/`, kể cả `_archive/README.md`, trừ khi người dùng **nhắc rõ** `_archive` hoặc một file trong đó trong yêu cầu hiện tại.
- Khi tìm kiếm cả repo (Grep, Glob, `rg`, `grep -r`, `find`), **luôn loại `_archive/`**, ví dụ `rg … --glob '!_archive/**'`, `grep -r --exclude-dir=_archive`, `find . -path ./_archive -prune -o …`.
- Thông tin hiện hành nằm ở `docs/project-hub/` (single source of truth). Một file trong hub nhắc tới đường dẫn `_archive/...` (ví dụ `08-nguon.md`) chỉ là để ghi nguồn, **không** phải lời mời mở file đó.
- Nếu thấy cần dữ liệu cũ để trả lời, hỏi người dùng trước, nói rõ sẽ đọc file nào và vì sao. Không tự mở.
- Không sửa, di chuyển hay xoá gì trong `_archive/`, trừ khi được yêu cầu.

`.claude/settings.json` đặt `Read` và `Edit` trong `_archive/` ở chế độ **ask**: Claude Code sẽ hỏi trước mỗi lần mở file ở đó.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
