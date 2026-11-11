# Handoff: AI-4 và AI-5 đã nối vào luồng chơi

> Viết cho AI (và thành viên nhóm) sắp sửa hoặc mở rộng phần này. Mốc: **11/11/2026**, cập nhật **12/11/2026** (D-131, D-132). Đọc cùng `AGENTS.md` ở gốc và `AGENTS.md` của thư mục này. Tài liệu này mô tả **code đang chạy**, không phải thiết kế đã chốt: chỗ nào code chọn một cách khi thiết kế còn mở thì ghi ở mục 7.

## 1. Tóm tắt trong 30 giây

- Màn chơi mới (E10–E12, `/quest/:key` → `/run/:id`) gọi máy chủ thật theo `reports/master/api/openapi.yaml`. Đây là mặc định từ 11/11 (`VITE_PLAY_API=http`); `mock` vẫn chạy được cho buổi demo không có máy chủ.
- Câu đóng (CHOICE, ORDERING, PRIORITIZING) được chấm ngay bằng khoá của chuyên gia qua game-core.
- Câu tự luận: API ghi vào PostgreSQL, đẩy job vào queue BullMQ trên Redis, trả 202. **Worker** làm hai việc song song:
  - **AI-5**: panel ba judge (Anthropic, OpenAI, Google) chấm. Gọi qua OpenRouter, chỉ tới endpoint không lưu dữ liệu (ZDR, D-131).
  - **AI-4**: nếu engine cho hỏi vặn thì viết câu hỏi vặn.
- Kết quả về trình duyệt qua SSE `GET /api/v1/stream`, gồm `followup.asked`, `activity.closed`, `answer.graded`, `summary.ready`, `provider.delay`.
- Lượt chơi lưu dưới dạng chuỗi sự kiện chỉ ghi thêm (`run_event`). Trạng thái được tính bằng `foldPlay` của game-core.
- Đã chạy đầu cuối với model thật, qua `curl` và qua Chrome:
  - AI-4 hỏi vặn sau 1,8–5 giây.
  - Panel chấm xong sau 2,5–3,5 giây.
  - Một màn L1 tốn khoảng **0,0026 USD**.
  - Tải lại trang giữa lượt hỏi vặn vẫn mở đúng chỗ.
  - Tắt worker giữa chừng rồi bật lại thì job được xử lý tiếp.

## 2. Chạy local

Cần **PostgreSQL** và **Redis** đang chạy (`brew services start postgresql@17 redis`).

| Biến                               | Ở đâu                       | Ghi chú                                                                                         |
| ---------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL`, `DIRECT_URL`, JWT… | `apps/api/.env`             | như trước                                                                                       |
| `REDIS_URL`                        | `.env` hoặc `apps/api/.env` | để trống = `redis://localhost:6379`                                                             |
| `OPENROUTER_API_KEY`               | `.env`                      | **bắt buộc cho AI-5**. Tên `OPEN_ROUTER_API_KEY` cũng được nhận (`config/env.ts` `withAliases`) |
| `QWEN_API_KEY`                     | `.env`                      | AI-4 gọi Qwen trực tiếp trước. Không có thì dùng Qwen qua OpenRouter                            |
| `VITE_PLAY_API`                    | `apps/web/.env`             | `http` (mặc định) hoặc `mock`                                                                   |

```sh
pnpm exec prisma migrate deploy --config apps/api/prisma.config.ts   # migration 20261111153249_play_runs_and_assessment
pnpm start            # web :4200, API :3000/api, worker (serve-worker)
pnpm start:worker     # chỉ worker; cùng bản build với API, chạy main.js --worker
node tools/dev/play-e2e.mjs                       # chơi trọn màn L1 qua HTTP, in mọi sự kiện và tổng kết
node tools/dev/play-e2e.mjs SWE_BACKEND_L3_S_INCIDENT   # L3 cần điểm L1–L2 (403 LEVEL_LOCKED nếu chưa có)
pnpm exec nx run @datn/api:judge-try -- --mode=live      # thử riêng AI-5
pnpm exec nx run @datn/api:narrator-try -- --mode=check  # thử riêng AI-4
```

Khi khởi động, worker in ra chuỗi model đang dùng: `Chuỗi dẫn truyện: …`, `Ghế 1: claude-haiku-5.5 → claude-sonnet-5.5`… Có dòng `Panel judge tắt: …` nghĩa là AI-5 không chạy: thiếu key, hoặc vi phạm DC-01.

## 3. Bản đồ code

```
apps/web/src/play/          màn chơi; api/httpPlayApi.ts (fetch + SSE, tự nối lại với Last-Event-ID), store/playSession.ts
apps/api/src/play/          PlayModule (CL-03): run.controller.ts (/api/v1/...), run.service.ts, summary.service.ts, play.dto.ts
apps/api/src/assessment/    AssessmentModule (CL-04): assessment.service.ts (API: tạo job), grading.processor.ts (WORKER),
                            follow-up.service.ts (AI-4 + câu chuyên gia soạn sẵn), transcript.ts (diễn biến cho AI-4)
apps/api/src/core/          CoreModule: queues.ts (BullMQ), stream.service.ts + stream.controller.ts (SSE qua Redis),
                            run-log.service.ts (đọc/ghi run_event có khoá), problem.ts (lỗi RFC 9457)
apps/api/src/worker.module.ts, main.ts --worker      process worker
apps/api/src/ai/            gateway, judge/ (AI-5), narrator/ (AI-4) — không đổi hợp đồng, chỉ được gọi từ worker
packages/game-core/src/domain/play/playRun.ts         sự kiện, foldPlay, 4 điều kiện hỏi vặn, chấm câu đóng, gộp điểm, kết cục
apps/api/prisma/schema.prisma   run_event, answer, assessment, judge_result, judge_score, criterion_grade, ai_job, usage_cost
```

Quy tắc phụ thuộc giữ theo CL-00: `PlayModule → AssessmentModule → AiModule`. API và worker **không gọi nhau**, chỉ nói chuyện qua queue `grading` và stream Redis. Không gọi model trong request HTTP.

## 4. Một câu tự luận đi qua hệ thống

```
Trình duyệt ─POST /api/v1/runs/:id/answers {answerId, activityKey, followupNo, text}
API  RunService.submitAnswer, trong MỘT transaction (RunLogService.update khoá dòng ScenarioRun):
     ├ ghi answer + ai_job + assessment(QUEUED)
     ├ engine quyết hỏi vặn: followUpAllowed() — 4 điều kiện, KHÔNG dựa vào điểm (① 30/10)
     ├ ghi TEXT_SUBMITTED{followUpAllowed}; nếu không hỏi: ghi luôn ACTIVITY_CLOSED
     └ sau commit: enqueue grading job; nếu đã đóng: publish activity.closed
   ← 202 {jobId, answerId, streamEvent:'answer.graded'}
Worker GradingProcessor.process — hai nhánh Promise.allSettled:
     ├ AI-4 (chỉ khi TEXT_SUBMITTED.followUpAllowed và lượt còn 'awaiting'):
     │   NarratorService.narrate (contract activity) → FOLLOWUP_ASKED{source:'ai', provenance}
     │   AI-4 hỏng → câu chuyên gia soạn sẵn (FollowupDoc) → FOLLOWUP_ASKED{source:'expert_default'}
     │   không có cả hai → ACTIVITY_CLOSED. Publish followup.asked / activity.closed
     └ AI-5: JudgePanelService.grade → lưu judge_result/judge_score (mọi lần), usage_cost
         graded  → criterion_grade, assessment GRADED, ANSWER_GRADED, publish answer.graded;
                   nếu người chơi đã bấm kết thúc và hết câu chờ chấm: publish summary.ready
         pending → assessment PENDING, ném lỗi → BullMQ thử lại (5 lần, lùi 15/30/60/120 s);
                   một ghế hỏng hẳn: lượt thử 1–2 chờ, từ lượt 3 gộp hai judge, lấy mức thấp hơn (D-132);
                   hết lượt → FAILED (câu trả lời vẫn giữ, không chấm thay bằng cách khác: D-92)
Trình duyệt nhận sự kiện trên /api/v1/stream → hiện câu hỏi vặn hoặc lời kết
```

Kết thúc màn (`POST /finish`):

- Còn câu chờ chấm: ghi `FINISH_REQUESTED`, trả 202, rồi worker báo `summary.ready`.
- Không còn: chốt ngay và trả 200.

Việc chốt nằm ở `SummaryService.finalize`: chọn kết cục, ghi `ScenarioRun`, `RunEvidence`, `UserBandSkill`, và `RUN_FINISHED`. Nhờ đó hồ sơ, bản đồ và việc mở cấp của prototype đọc được lượt chơi mới. `GET /summary` cũng chốt nếu đã đủ điều kiện, vì worker không import PlayModule.

## 5. Hợp đồng

**Endpoint** (đều dưới `/api/v1`, lỗi theo `application/problem+json` có `code`):

| Endpoint                                  | Trả về                                                                 | Lỗi đáng chú ý                                                |
| ----------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| `POST /runs` `{enrolmentId, taskId}`      | 201 mới / 200 lượt dở cùng nhiệm vụ                                    | 403 `LEVEL_LOCKED`, 409 `SCENARIO_UNAVAILABLE`                |
| `GET /runs/:id`, `GET /runs/:id/activity` | `Run`, `ActivityView`                                                  | 409 `INVALID_TRANSITION` khi hết hoạt động                    |
| `POST /runs/:id/answers`                  | 200 `AnswerResult` (câu đóng) / 202 `JobAccepted` (tự luận)            | 422 `ANSWER_INVALID` kèm `errors[]`, 409 `INVALID_TRANSITION` |
| `POST /runs/:id/hints`                    | `{npcKey, text, hintUsed:true}`; không bao giờ trừ điểm                | 404 khi không có gợi ý                                        |
| `POST /runs/:id/flags`                    | 204                                                                    |                                                               |
| `POST /runs/:id/finish`                   | 200 `ScenarioSummary` / 202                                            | 409 khi chưa hết hoạt động                                    |
| `GET /runs/:id/summary`                   | `ScenarioSummary`                                                      | 404 khi chưa sẵn sàng                                         |
| `GET /stream`                             | SSE, mỗi tin có `id` (id Redis Stream); gửi `Last-Event-ID` để nhận bù |                                                               |
| `GET /releases/:key@:version`             | `Scenario` của game-core                                               | **ngoài hợp đồng**: thay CDN khi chạy local                   |

Một số điểm cụ thể:

- `taskId` là khoá kịch bản (`SWE_BACKEND_L1_S_EXEC`), chưa phải uuid.
- `enrolmentId` được nhận nhưng chưa dùng; quyền vào cấp kiểm bằng tiến độ, như luồng cũ.
- Gửi lại cùng `answerId` thì nhận đúng kết quả cũ (NFR-04).
- `ActivityView.followup` là **trường thêm ngoài hợp đồng**: câu hỏi vặn đang chờ trả lời, để mở lại màn khi trình duyệt mất trạng thái.

**Payload trên stream** (`{type, runId, jobId?, payload}`):

- `answer.graded`: `{answerId, activityKey, followupNo, score: 0|1|2|null, counterproductive}`
- `followup.asked`: `{activityKey, followupNo, npcKey, name, question}`
- `activity.closed`: `{activityKey, closingLine, nextActivityKey|null}`
- `provider.delay`: `{waitingFor: 'summary'}`. Chỉ phát khi người chơi đang chờ tổng kết; lúc chơi thì việc chấm chậm không chặn ai.
- `summary.ready`: `{}`

**Sự kiện lượt chơi** (`run_event.type`, kiểu `PlayEvent` trong game-core): `RUN_STARTED`, `CLOSED_ANSWERED`, `TEXT_SUBMITTED`, `FOLLOWUP_ASKED`, `ANSWER_GRADED`, `ACTIVITY_CLOSED`, `HINT_VIEWED`, `CONTENT_FLAGGED`, `FINISH_REQUESTED`, `RUN_FINISHED`. Chỉ ghi thêm qua `RunLogService.update` hoặc `begin`, không sửa, không xoá. Thêm loại mới thì sửa `applyPlayEvent` và test của nó trước.

## 6. Muốn đổi X thì sửa ở đâu

| Muốn                                                       | Sửa                                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Đổi model judge, bậc chính, giá, endpoint ZDR              | `ai/gateway/models.ts` (`JUDGE_MODELS`, `judgePanel({primaryTier})`); tra `GET /api/v1/endpoints/zdr`; kiểm bằng `judge-try --mode=live`         |
| Đổi temperature, trần token, timeout, số lần thử của judge | `ai/judge/judge.profile.ts` (tăng `version`)                                                                                                     |
| Đổi chính sách khi một ghế hỏng (chờ hay gộp 2)            | `JUDGE_PROFILE.whenOneJudgeDown`, `lowerOf2FromAttempt` (D-132)                                                                                  |
| Đổi luật được hỏi vặn                                      | `followUpAllowed` trong `playRun.ts`, kèm test                                                                                                   |
| Đổi số lần thử lại hoặc độ lùi của job chấm                | `core/queues.ts` (`GRADING_ATTEMPTS`, `GRADING_BACKOFF_MS`)                                                                                      |
| Chuyển AI-4 sang contract nhịp (D-130, `narrateScene`)     | `assessment/follow-up.service.ts`. Cần runtime dạng cảnh/seed mới, chưa có (xem 7)                                                               |
| Thêm ghi chú phản hồi ẩn do model viết (SD-01 bước cuối)   | job mới trong worker sau `ANSWER_GRADED`. Chờ câu hỏi ③ của thiết kế AI-4                                                                        |
| Nối sổ chi phí vào trần mỗi phiên (NFR-11)                 | `JudgePanelService.grade({budgetUsd})` và `narrate({budgetUsd})` đã nhận tham số; chỉ còn thiếu cấu hình trần và chỗ cộng `usage_cost` theo lượt |

## 7. Lệch thiết kế và việc còn mở (đọc trước khi "sửa cho đúng")

Mục 1 và 2 đã thành quyết định ngày 12/11 (D-131, D-132). Các mục còn lại là **lựa chọn của code**, chưa phải quyết định của nhóm; đừng ghi chúng vào `02-quyet-dinh.md` như đã chốt. Mục 4–7 là phần game design (Phúc), chờ D-95/D-116.

1. ✅ **Gọi judge qua OpenRouter: D-131** (thay một phần D-100). Mỗi request gửi `zdr: true` và chỉ một endpoint ghi sẵn: Claude trên `google-vertex/global`, GPT trên `azure`, Gemini trên `google-vertex/global`, cùng giá niêm yết với API gốc. Dữ liệu vẫn xử lý ở nước ngoài, nên hồ sơ chuyển dữ liệu ra nước ngoài (07 mục E) vẫn cần. Báo cáo §5.2.3, §5.3.6, §5.3.10 còn ghi theo D-100.
2. ✅ **Một ghế hỏng cả hai bậc: D-132.** Job chấm thử lượt 1–2 thì chờ (D-108). Từ lượt 3 (sớm nhất khoảng 45 giây sau lần nộp) thì gộp hai judge còn lại theo SD-01, lấy mức thấp hơn, ghi `method = lower_of_2` để chuyên gia lọc ra xem lại. Còn ít hơn hai judge thì vẫn chờ, rồi FAILED.
3. **Thời điểm chấm và hỏi vặn** theo ① ngày 30/10: song song, AI-4 không chờ điểm. Report và SD-01 còn mô tả chấm trước rồi mới hỏi.
4. **Mức một hoạt động** = mức thấp nhất trên các tiêu chí có xét. Mỗi tiêu chí lấy mức cao nhất qua câu chính và câu trả lời hỏi vặn. Luật gộp chính thức chờ D-95/D-116.
5. **"Không xét"** khi ít nhất nửa số judge nói không xét. **Cờ phản tác dụng** theo đa số. Cả hai đều tạm.
6. **Điểm phạt phản tác dụng** (D-116) và quỹ điểm theo band (D-114) chưa vào runtime: điểm cộng bằng tổng mức, như prototype.
7. **Kết cục SECRET** không mở được ở luồng này, vì điều kiện cũ là so khớp từ khoá (D-101 chờ game design). **Sự kiện xen ngang** (`randomEvent`) chưa làm.
8. **AI-4 dùng contract activity** (`narrate`, prompt `narrator.v2`), không dùng contract nhịp D-130. Nội dung chơi được hiện vẫn ở dạng activity.
9. **Nhận xét cuối màn** ghép từ lý do và câu trích của judge cùng mốc rubric, không có ghi chú do model viết riêng (câu ③ còn mở). Lý do của judge đôi khi nhắc "mức 2": đó là chữ của judge, hiện nguyên văn.
10. **Schema DB** bám ERD-05/06/07 nhưng dùng khoá chuỗi thay cho uuid tới `rubric_criterion`, `task`, `release` (ERD-03/04 chưa có). `judge_score` thêm cột `rationale`. Chưa có `model_config`, `prompt_template`.
11. **Phiên đăng nhập** đi bằng cookie; hợp đồng ghi Bearer (Bearer vẫn được nhận).
12. **Không có circuit breaker cho judge**: cả ba judge cùng là provider `openrouter`. Breaker theo provider sẽ ngắt cả panel khi một họ hỏng. Chấm chạy nền và D-132 đã giới hạn thời gian chờ, nên chưa cần breaker theo model.

## 8. Những điều đã đo hoặc kiểm thật (11–12/11/2026)

- **Không endpoint judge nào nhận `temperature`** (Claude 5.5, GPT-6 từ 11/11; Gemini trên Vertex từ 12/11). Gửi kèm `require_parameters` thì bị từ chối. Adapter bỏ tham số này theo `ModelSpec.supports.temperature`. Độ ổn định của judge phải đo ở §7.3.2.
- **Mức suy nghĩ** (`ModelSpec.minReasoning`): Haiku 5.5 và GPT-6 Luna nhận `reasoning.effort: none`. Sonnet 5.5, GPT-6.1 Sol và Gemini 3.x báo "Reasoning is mandatory…", còn `minimal` thì chạy và báo 0 token suy nghĩ. **Trước 12/11, bậc dự phòng của Claude và GPT luôn bị trả 400**, nên chưa bao giờ chấm được. Đã sửa và thử thật với `judge-try --tier=mid`.
- **ZDR (12/11):** `GET /api/v1/endpoints/zdr` (không cần key) liệt kê endpoint không lưu dữ liệu. Gửi `zdr: true` kèm host không ZDR thì OpenRouter trả 404 "No endpoints found matching your data policy". Thời gian chấm một lô qua endpoint ZDR: Haiku 1,9–4,0 s, Luna 2,4–4,3 s, Flash-Lite 1,5–2,2 s. Ở bậc dự phòng: Sonnet 3,8 s, Sol 6,7 s (sát timeout 7 s của D-109), Gemini 3.8 Flash 5,0 s.
- **Chi phí một màn L1**: Qwen (AI-4) khoảng 0,0004 USD; ba judge chấm hai câu khoảng 0,0021 USD.
- **Số token đầu vào khác nhau theo họ** với cùng một prompt: Claude khoảng 2.250, GPT khoảng 1.100, Gemini khoảng 960.
- **`@nestjs/bullmq` 12 chỉ có bản ESM**, nên code dùng thẳng `bullmq` (bản CommonJS). BullMQ 6 cần cài `ioredis` riêng (đã thêm vào `package.json` gốc).
- **Chạy test hay build có thể sinh lại** `packages/game-core/data/game-data.json` từ dữ liệu nghề mới hơn. Đừng commit kèm nếu task không về dữ liệu.

## 9. Kiểm khi sửa

```sh
pnpm exec nx run-many -t lint typecheck build test     # test mới: playRun.spec, follow-up.service.spec, transcript.spec, summary.spec
pnpm exec nx format:check --base=origin/main
node tools/dev/play-e2e.mjs                            # đầu cuối, model thật
```
