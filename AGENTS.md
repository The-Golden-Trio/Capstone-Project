# Context làm việc với JobQuest

Đây là context chung cho AI làm việc trong repo. Đọc file này trước, sau đó chỉ mở tài liệu liên quan đến yêu cầu. Không cần người dùng mô tả lại dự án mỗi phiên. Các `AGENTS.md` trong thư mục con bổ sung quy ước cho phạm vi đó.

## Cách làm việc mặc định

- Trao đổi bằng tiếng Việt có dấu; giữ nguyên tên code, mã nghề, ID và thuật ngữ khi cần chính xác. Báo cáo học thuật hiện viết bằng tiếng Anh; giữ ngôn ngữ của tài liệu đang sửa.
- Với yêu cầu ngắn, tự tìm file và đọc phần liên quan trước khi hỏi lại. Nếu có thể suy ra từ repo, nêu giả định ngắn và tiếp tục; chỉ hỏi khi thiếu thông tin làm thay đổi đáng kể kết quả hoặc cần một quyết định nghiệp vụ chưa chốt.
- Sửa đúng phạm vi yêu cầu, giữ các thay đổi đang có của người dùng. Không tự commit, push, xuất bản hay sửa lịch sử Git khi chưa được yêu cầu.
- Phân biệt rõ **đã hiện thực**, **đã chốt thiết kế**, **đề xuất/bản nháp**, **chưa đo/chưa kiểm chứng**. Không biến ý tưởng thành quyết định, số liệu giả thành kết quả thực nghiệm, hay dependency đã khai báo thành tính năng đã chạy.
- Khi xong, nói ngắn gọn đã sửa gì, ở đâu, đã kiểm tra gì và còn giới hạn nào liên quan.

## Dự án là gì

- **JobQuest — An AI-Native Experiential Career-Exploration Platform**. Slogan: _Try the job before you pick the career._
- Đề tài của nhóm **Golden Trio**, HCMUT; GVHD **PGS. TS. Võ Thị Ngọc Châu**. ĐACN đề xuất và thiết kế; ĐATN/capstone tiếp tục hiện thực trên cùng đề tài.
- Trải nghiệm lõi: người chơi nhận vai trong một nghề, xử lý tình huống công việc dạng visual novel, nhận phản hồi và tích luỹ kỹ năng để khám phá cấp/nghề tiếp theo trên bản đồ ngân hà.
- Mục tiêu là giúp người chơi **tự cảm nhận nghề qua trải nghiệm**. Tránh viết nội dung khẳng định hệ thống chẩn đoán con người hoặc quyết định người dùng phải chọn nghề nào.
- Thuật ngữ: **DE** = domain expert/chuyên gia nghề; **CA** = content administrator/quản trị nội dung; **seed** = nội dung và ràng buộc chuyên gia duyệt; **canon** = sự kiện đã duyệt, engine hiển thị nguyên văn; **band/Ln** = cấp trong nghề; **scenario** = một tình huống chơi.
- Phạm vi triển khai ban đầu là IT. Dữ liệu và game design đã mở rộng tới **221 nghề (22 IT + 199 ngoài IT)**; điều này không có nghĩa tất cả nghề đã chơi được.

## Đọc nguồn nào và xử lý mâu thuẫn

`docs/project-hub/` là đầu mối tri thức của đề tài. Không coi một trang tổng quan là ảnh chụp mới nhất của mọi mảng.

| Cần biết                           | Nguồn cần đọc                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tổng quan, cách tìm tài liệu       | `docs/project-hub/00-tong-quan.md`                                                                                                                           |
| Quyết định, thay thế quyết định cũ | `docs/project-hub/02-quyet-dinh.md` — đọc các D-ID liên quan và ngày/trạng thái                                                                              |
| Sản phẩm, luật, thuật ngữ          | `docs/project-hub/03-san-pham.md`                                                                                                                            |
| Bản đồ code/data, hướng dẫn cũ     | `docs/project-hub/04-hien-trang-code-data.md` — đối chiếu code vì nhiều mục chụp từ tháng 9                                                                  |
| Vấn đề chưa chốt                   | `docs/project-hub/07-van-de-mo.md` và ghi chú mới của mảng đang sửa                                                                                          |
| Task, họp, tiến độ                 | `docs/project-hub/tuan/README.md`, rồi tuần/minutes liên quan; giữ nguyên ID `T…`                                                                            |
| Báo cáo đang phát triển            | `reports/master/report.md`, quy ước tại `reports/README.md`                                                                                                  |
| Yêu cầu và sơ đồ                   | `docs/project-hub/assets/jobquest-requirements-report.md`, `jobquest-usecase-diagram.md`, `jobquest-user-journey.md`, `jobquest-erd-mermaid.md` cùng thư mục |
| Thiết kế AI, AI-4, request mẫu     | `docs/project-hub/assets/ai-design/AGENTS.md`, rồi tài liệu được chỉ ở đó                                                                                    |
| Dữ liệu nghề, schema, pipeline     | `occupation-data/README.md`, `occupation-data/JSON_SCHEMA.md`                                                                                                |
| Nghiên cứu và căn cứ game design   | `research/reports/`, rồi ghi chú tương ứng trong `research/research_notes/`                                                                                  |
| Commit, PR                         | `CONTRIBUTING.md`, `.github/pull_request_template.md`, `tools/git/commit-rules.mjs`                                                                          |

- **Hệ thống hiện đang làm gì:** kiểm code, cấu hình, import/call site và test hiện hành. **Dự định làm gì:** kiểm quyết định đã chốt và thiết kế liên quan. Hai loại nguồn trả lời hai câu hỏi khác nhau.
- Quyết định mới đã xác nhận thay thế quyết định cũ trong cùng phạm vi; một bản nháp mới hơn không tự động thay thế quyết định đã chốt. Báo cáo đã nộp là bằng chứng của thời điểm nộp.
- Nếu nguồn lệch nhau, chỉ rõ chỗ lệch và dùng nguồn phù hợp với yêu cầu; không âm thầm hợp nhất hoặc tự chốt thay nhóm. Ví dụ: thời điểm follow-up trong AI-4 cuối tháng 10 khác mô tả ở một số đoạn của report master.
- Không đọc cả report, toàn bộ research hoặc các JSON lớn để làm một sửa đổi nhỏ. Dùng `rg` tìm heading, ID và symbol, rồi đọc đoạn cần thiết.
- **Không mở, liệt kê, tìm kiếm, trích dẫn hoặc sửa `_archive/`** trừ khi người dùng nhắc rõ thư mục/file đó trong yêu cầu. Tìm kiếm toàn repo luôn thêm `-g '!_archive/**'`; tránh `node_modules`, `occupation-data/venv`, output build và dữ liệu lớn khi không liên quan. Link tới archive trong tài liệu không phải yêu cầu mở archive.

## Bản đồ code và ranh giới trách nhiệm

| Đường dẫn                        | Vai trò                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/web/`                      | React 19, Vite, Tailwind CSS, React Three Fiber/Three.js, Zustand; giao diện chỉ tiếng Việt (D-96) |
| `apps/staff/`                    | Staff app cho Content Admin, Domain Expert (SITE-02, SITE-03), chỉ tiếng Việt                 |
| `apps/web/src/api/`              | Client API và schema phía web; chuỗi giao diện viết thẳng tiếng Việt, không i18n |
| `apps/api/`                      | NestJS, Prisma 7, PostgreSQL; auth, content, profile, runs và module AI                       |
| `apps/api/src/app/app.module.ts` | Điểm kiểm tra các module thực sự được đăng ký                                                 |
| `apps/api/src/ai/`               | Gateway, adapter nhà cung cấp, chi phí, circuit breaker, narrator AI-4 và prompt              |
| `apps/api/prisma/`               | Schema và migrations; cấu hình CLI ở `apps/api/prisma.config.ts`                              |
| `packages/game-core/src/`        | Logic dùng chung: engine, grading, band, fit, narration, schema; import qua `@datn/game-core` |
| `occupation-data/`               | Nguồn dữ liệu nghề, scenario, quyết định ánh xạ và script sinh dữ liệu                        |
| `docs/data/`                     | Build dữ liệu game/galaxy phục vụ seed vào DB                                                 |
| `docs/project-hub/slides/`       | Deck HTML; tài nguyên thiết kế AI ở `assets/ai-design/`                                       |
| `tools/`                         | `git/` kiểm commit/PR, `hub/` quản lý tuần/task, `report/` sinh LaTeX                         |

- Logic game và luật kiểm dùng chung đặt ở `game-core`; gọi model, key và truy cập DB ở API. Web lấy nội dung qua API, không tự đọc dataset nghề hoặc chứa key nhà cung cấp.
- Dùng các pattern có sẵn: schema Zod, module/DI của NestJS, API client hiện hành; kiểm export của `game-core` khi thêm API dùng chung.
- Các module cũ `apps/api/src/app/{skills,career-graph,persistence}/` còn tồn tại nhưng không được đăng ký trong `AppModule` tại lần rà 31/10/2026. Kiểm đường gọi trước khi sửa, tránh sửa nhầm code không chạy.

## Hiện trạng đã đối chiếu ngày 31/10/2026

Đây là mốc định hướng, không thay cho việc kiểm code khi thực hiện task:

- Prototype có auth, nội dung từ DB, bản đồ 3D, màn chơi, profile và lưu lượt chơi. `docs/data/build.mjs` hiện đóng gói **2 scenario Backend L1/L3**; dữ liệu nghề nhiều hơn nội dung chơi.
- Chấm tự luận của luồng chơi cũ (`/play/...`, gửi cả lượt một lần) còn dùng keyword (`keywordGrader.ts`); luồng mới (`/quest` → `/run`, mặc định từ 11/11) chấm bằng panel ba judge (AI-5) ở worker.
- **AI-4 đã có code**: `AiModule`, gateway, `NarratorService`, prompt, luật R1–R4, khử định danh và script `narrator-try`. Từ 11/11 theo contract nhịp D-130 (`narrateScene`, prompt `narrator.v3`), đã gọi Qwen thật trên cảnh mẫu của seed Back-end L3 m2. **Từ 11/11 AI-4 và AI-5 đã nối vào màn chơi mới** (`/api/v1/runs…`, worker BullMQ + Redis, SSE `/api/v1/stream`, sổ sự kiện `run_event`); AI-4 trong luồng này dùng contract activity (`narrate`), AI-5 là panel ba judge qua OpenRouter. Cách chạy, luồng, chỗ lệch thiết kế: [`tich-hop-ai-4-ai-5.md`](docs/project-hub/assets/ai-design/tich-hop-ai-4-ai-5.md).
- **Luồng ca làm (Game Design W45), cập nhật 12/11/2026:** chạy song song luồng activity, dùng chung hạ tầng ở trên.
  - Engine ở `packages/game-core/src/shift/`; seed mẫu ở `occupation-data/seeds/SWE_BACKEND/` (phần `_draft` chờ DE duyệt).
  - API `/api/v1/shift-runs` là đề xuất ngoài `openapi.yaml`, xem `docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`.
  - Lượt chơi là `ScenarioRun.flow = 'shift'` cùng `run_event` và `ai_job`; worker xử lý queue `shift-turn`.
  - AI: AI-4 dùng `narrateScene`; bộ phán có/không dùng ghế judge của AI-5.
  - Chưa chấm điểm. `AI_MODE=fake` chỉ dùng khi dev.
- **Staff app CA/DE, cập nhật 12/11/2026** (nhánh `feat/staff-app-ca-de`, theo `docs/plans/2026-11-06_ke-hoach-staff-app-CA-DE.md`):
  - Auth là Bearer (access token trong bộ nhớ, refresh ở localStorage); danh tính theo ERD-01, `apps/web` đã đổi theo.
  - `apps/staff` có T01, T00, C01, C04, C05, C06, C07, D01, D03, D04. Luồng: CA mở scenario và giao tác giả, người duyệt → DE viết ngữ cảnh, AI sinh bản nháp (queue `generation` ở worker, SSE) → sửa, câu mẫu, kiểm (`ContentValidator`) → nộp → DE khác duyệt → CA chọn dạng task, asset → dựng bản nháp (`scenario_build`).
  - Chưa có: play-test (D05), xuất bản (C08), import, giám sát, prompt hệ thống (C10/D08), gợi ý trình bày và sinh ảnh bằng AI (D-104).
  - Chỗ lệch openapi/ERD và luật đang theo đề xuất: [07 A22, A23](docs/project-hub/07-van-de-mo.md).
- **Explorer, cập nhật 14/11/2026:** có đánh giá nghề năm tiêu chí (FR-19, `/api/v1/occupations/{mã nghề hoặc uuid}/ratings`, màn `/jobs/:roleCode/rate`) và góp ý app (FR-20, `/api/v1/app-feedback`, màn `/feedback`), bảng `occupation_rating`, `rating_score`, `rating_attribute`, `app_feedback`. FR-07 (vào nghề kề ở cấp cao hơn) **hoãn**, chờ nhóm chốt [07 A27](docs/project-hub/07-van-de-mo.md); chỗ lệch thiết kế của FR-19/20 ở A26.
- `ai-4-api/response.json` là **model giả**, không phải kết quả gọi API thật hay benchmark. Request mẫu được sinh từ code.
- Game design mới gồm RIASEC, 7 nhóm soft skill, keyword ESCO và hồ sơ nghề O*NET; nhiều phần vẫn là thiết kế/dữ liệu chưa nối vào runtime. Tra trạng thái từng phần trước khi triển khai.

## Lệnh làm việc

Chạy từ gốc repo. Workspace dùng **pnpm** (`packageManager` trong `package.json`) và **Nx**; CI dùng Node.js 22. Project Nx: `@datn/web`, `@datn/staff`, `@datn/api`, **`game-core`** (tên package là `@datn/game-core`). Ưu tiên script có sẵn hoặc `pnpm exec nx`; kiểm cấu hình/`--help` khi chưa rõ target hay flag.

```sh
pnpm install --frozen-lockfile
pnpm start                         # web :4200; API :3000/api theo cấu hình dev
pnpm exec nx run @datn/staff:serve # staff app :4300/staff
docker compose -f infra/local/dev-stack.yml up -d   # redis, postgres :5433, mailpit, rustfs (S3)
pnpm start:web
pnpm start:api
pnpm exec nx run game-core:test
pnpm exec nx run @datn/api:test
pnpm exec nx run @datn/web:test
pnpm check                         # lint + typecheck + build + test toàn workspace
```

- Để chạy API, tạo `.env` từ `apps/api/.env.example` nếu chưa có; điền biến theo `apps/api/src/config/env.ts`. Web có `apps/web/.env.example`. Không ghi đè `.env` hiện có, đọc/in secret ra output hoặc đưa secret vào docs/request/commit.
- Prisma runtime dùng `DATABASE_URL`; CLI/migration dùng `DIRECT_URL`. `pnpm db:generate` sinh client. Chỉ chạy `pnpm db:migrate` hoặc seed khi task cần và đã xác định DB đích; không mặc định đó là DB local có thể ghi tuỳ ý.
- Nội dung: `pnpm data:build` sinh game data; `node docs/data/build-galaxy.mjs` sinh galaxy data; `pnpm exec nx run @datn/api:seed-content` ghi nội dung vào DB.
- AI-4 thử offline: `pnpm exec nx run @datn/api:narrator-try -- --mode=fake`. Sau khi gắn key: `--mode=check`, xem `docs/project-hub/assets/ai-design/ai-4-api/README.md`. Export request mẫu: thay bằng `--mode=export`; chế độ này ghi lại artifact tài liệu. Không gọi `--mode=live` chỉ để kiểm sửa tài liệu.
- Chạy kiểm tra phù hợp phạm vi; sửa docs không cần build/test toàn app. Không báo pass cho lệnh chưa chạy; nếu bị chặn, nói rõ lệnh và nguyên nhân.

## Quy tắc sửa tài liệu và dữ liệu

- **Không sửa tay output sinh tự động:** `occupation-data/generated/`, `packages/game-core/data/*.json`, `docs/data/game-data.js`, Prisma client trong `apps/api/src/generated/`. Sửa nguồn/script rồi sinh lại phần cần thiết; xem diff để tránh kéo vào output không liên quan.
- Report: sửa `reports/master/report.md`. Đọc `reports/README.md` trước khi build; `tools/report/md2tex.py` sinh LaTeX. Không sửa tay `main.tex`, `chapters/*.tex`, `references.tex` do script sinh; không sửa bản báo cáo theo ngày đã nộp khi chưa được yêu cầu rõ.
- Quyết định mới đã được nhóm xác nhận: thêm vào `02-quyet-dinh.md`, giữ lịch sử và đánh dấu quyết định bị thay. Ý tưởng chưa duyệt giữ nhãn nháp/chờ chốt. Đồng bộ các tài liệu trực tiếp liên quan trong phạm vi task; không tự viết lại toàn hub.
- Giữ FR/NFR/DR/BR/DC, D-ID, task ID, mã nghề và scenario key khi biên tập. Không tự tạo kết quả đánh giá, nguồn trích dẫn, quyết định hoặc phê duyệt của cô/chuyên gia.
- Repo có workflow tại `.claude/skills/` cho slide, sync report, họp, tiến độ và commit. Khi task phù hợp, đọc `SKILL.md` tương ứng trước khi áp dụng; không mặc định skill/plugin/MCP đó có sẵn trong mọi công cụ AI.
- Khi được yêu cầu commit/PR: theo `CONTRIBUTING.md`; mô tả tiếng Việt có dấu theo `type(scope): mô tả`, thêm `Task: T…` nếu task đã có ID. Không tự bịa ID.

## Giữ context dùng được về sau

Khi task làm đổi kiến trúc, cách chạy, nguồn chính hoặc trạng thái hiện thực nêu ở đây, cập nhật đúng phần context bị ảnh hưởng. Chi tiết thay đổi thường xuyên để trong hub/tài liệu chuyên biệt và dẫn đường tới đó; không chép nguyên nội dung sang nhiều file. Không lưu tiến độ riêng của một cuộc chat thành sự thật lâu dài của repo.
