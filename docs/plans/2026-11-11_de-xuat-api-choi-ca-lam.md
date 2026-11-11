# Đề xuất API chơi ca làm (Game Design W45)

> **Trạng thái: ĐỀ XUẤT, chờ nhóm duyệt.**
>
> Code đã chạy theo đề xuất này, ở `apps/api/src/play`, `assessment`, `notification`. Nếu nhóm đổi đề xuất thì code đổi theo.
>
> `reports/master/api/openapi.yaml` chưa được sửa.

## Vì sao cần

`openapi.yaml` (11/11) mô tả màn chơi là một chuỗi hoạt động cố định: `GET /runs/{id}/activity` và `POST /runs/{id}/answers`.

Game Design W45 (PR #20) đã chốt một mô hình khác. Nguồn là `Luật dẫn truyện JobQuest.md` bản 3, D-127, D-128, D-129 và `Seed scenario JobQuest.md`. Theo mô hình mới, một ca làm gồm:

- nút canon xen pha xử lý tự do, tính bằng điểm thời gian;
- hội thoại 3 lượt, hành động có giá, artefact;
- cờ truyện, câu kiểm có/không, lời hứa có hạn, phần "Nhìn lại ca".

Hợp đồng hiện tại không có endpoint cho hành động, hội thoại, artefact hay đồng hồ. Vì vậy cần một nhóm endpoint mới.

## Nguyên tắc giữ từ thiết kế

- **Đường dẫn và lỗi:** mọi đường dẫn dưới `/api/v1`. Lỗi theo Problem Details (RFC 9457) với `code` ổn định.
- **Không gọi model trong request:** lượt cần AI được lưu, đẩy job, trả `202`, kết quả về qua `GET /stream` (SD-01).
- **Chuỗi sự kiện:** lượt chơi là chuỗi sự kiện append-only (`run_event`); trạng thái = fold qua engine `shift` của game-core.
- **Output của model:** là sự kiện có provenance (model, phiên bản prompt, chi phí, độ trễ), không bao giờ tính lại.
- **Gửi lại an toàn:** máy khách tạo `turnId`; gửi lại cùng `turnId` thì nhận lại đúng kết quả cũ (NFR-04).
- **Xác thực:** cookie phiên như prototype; Bearer cũng nhận. Chuyển hẳn sang Bearer (Q2) thuộc P0.

## Endpoint

| Method, path                                    | Việc                                                                                       | Trả về                                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /runs` `{taskId, enrolmentId?}`           | Mở lượt; có lượt đang dở của cùng nhiệm vụ thì trả lượt đó                                 | `201` / `200` `Run`; `409 SCENARIO_UNAVAILABLE`                                                                                                             |
| `GET /runs/{id}`                                | Thông tin lượt: tên ca, mục tiêu, vai, câu cảnh, cast, glossary, `paused`, `pendingTurnId` | `Run`                                                                                                                                                       |
| `GET /runs/{id}/scene`                          | Cảnh hiện tại (xem `SceneView` bên dưới)                                                   | `SceneView`                                                                                                                                                 |
| `GET /runs/{id}/transcript?after=seq`           | Các dòng thoại sau `seq`, dùng khi tải lại trang                                           | `TranscriptLine[]`                                                                                                                                          |
| `POST /runs/{id}/turns`                         | Mọi thao tác của người chơi (xem bảng `kind`)                                              | `200 {turnId, lines, scene}` · `202 {jobId, turnId, streamEvent, lines}` · `409 TURN_IN_PROGRESS` · `409 RUN_PAUSED` · `409 RUN_ENDED` · `422 TURN_INVALID` |
| `POST /runs/{id}/hints` `{turnId}`              | Gợi ý bậc 1/2 do engine sinh từ fact sheet, không tốn điểm, không hạ điểm (D4, D-83, D-86) | như `/turns`                                                                                                                                                |
| `POST /runs/{id}/resume`                        | Tiếp tục phiên đã tạm dừng vì hết model (D-92)                                             | `202 {jobId, turnId}`; `409 NOT_PAUSED`                                                                                                                     |
| `POST /runs/{id}/notes` `{text}`                | Ghi chú riêng trong sổ tay (khối M); không gửi AI, không chấm                              | `201`                                                                                                                                                       |
| `POST /runs/{id}/flags` `{activityKey, reason}` | Báo nội dung sai (FR-14)                                                                   | `201`                                                                                                                                                       |
| `GET /runs/{id}/summary`                        | Tổng kết cuối ca, kể theo truyện, **chưa chấm điểm**                                       | `ShiftSummary`; `404 SUMMARY_NOT_READY`                                                                                                                     |
| `GET /stream`                                   | Server-Sent Events, mở bằng `fetch`; nhận `Last-Event-ID`                                  | xem bên dưới                                                                                                                                                |

`taskId` tạm là mã seed (`SWE_BACKEND.L3.m2`), vì CatalogueModule chưa có `taskId` dạng uuid.

Ca kết thúc qua `kind: confirm_end`, hoặc khi nút kết tự bật lúc hết giờ, nên không cần endpoint `finish` riêng.

### `POST /runs/{id}/turns`: các `kind`

| `kind`                       | Trường                         | Đầu vào engine                                                                                                                                                                               |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `action`                     | `key`, `fields?`, `ticks?`     | Hành động trong `actions[]` của seed: trò chuyện, mở tài liệu, viết bản vá, nhắn kênh, chạy thử, họp, "Tạm làm việc khác", bấm nút "Chốt…". Hành động viết thì gửi kèm chữ lúc bắt đầu (A1b) |
| `say`                        | `text`                         | Một lượt nói trong cuộc trò chuyện, trả lời nút hay probe                                                                                                                                    |
| `end_conversation`           | —                              | Đóng cuộc trò chuyện (bộ phán chạy câu kiểm hội thoại)                                                                                                                                       |
| `choose`                     | `option`, `elapsedMs?`         | Chọn phương án; thời gian đo trên thiết bị (D-83)                                                                                                                                            |
| `timeout`                    | —                              | Hết giờ ở câu đếm giờ: mức 0, không cờ (D-86)                                                                                                                                                |
| `save_artefact`              | `artefact`, `fields`, `ticks?` | Nộp artefact của nút (ghi chú sự cố, email)                                                                                                                                                  |
| `confirm_end` / `cancel_end` | —                              | Hộp xác nhận nộp nút kết trước hạn (E7)                                                                                                                                                      |

### `SceneView` (rút gọn)

- `clock`: `time`, `start`, `deadline`, `pointsUsed`, `budget`, `remaining`, `minutesPerPoint`.
- `mode`: `phase` · `conversation` · `node` · `review` · `confirm_end` · `waiting` · `ended`.
- `conversation`: `people`, `channel`, `turnsLeftInPoint`.
- `node`: `format`, `speaker`, `prompt`, `options` (chỉ `key` + `text`), `timeLimitSeconds`, `form`.
- `actions[]`: `points` (đã tính "xem lại 0 điểm" và "tới mốc kế"), `enabled`, `reason`, `form`.
- `documents[]`: tài liệu đã mở, kết quả chạy thử, artefact đã lưu.
- `notebook`: dữ kiện đã biết, lời hứa.
- `suspended`: hành động đang dở vì bị chen ngang.
- `paused`, `pendingTurnId`, `notes`.

`SceneView` không chứa câu kiểm, khúc mắc, niềm tin, dữ kiện chưa lộ hay phần chấm.

### Tin trên `/stream`

| `type`           | Khi nào                                         | `payload`                             |
| ---------------- | ----------------------------------------------- | ------------------------------------- |
| `turn.lines`     | AI xong một bước của lượt                       | `{lines}`: dòng mới, hiện ngay        |
| `turn.done`      | Lượt xong, engine chờ người chơi                | `{scene, ended}`                      |
| `scene.changed`  | Nối lại với `Last-Event-ID` mà có sự kiện bị lỡ | `{}`: tải lại `scene` và `transcript` |
| `provider.delay` | Model chạy quá 4 giây                           | `{waitingFor: narration \| checks}`   |
| `run.paused`     | Hết model dùng được                             | `{reason}`                            |

Tin gắn với sự kiện đã lưu có `id` bằng `run_event.id`.

## Lưu trữ

Migration `20261111120000_add_shift_runtime` **chưa apply**.

- **Bảng mới, tên theo ERD-05/06:**
  - `run_event`: append-only, `unique(runId, seq)`.
  - `answer`: một lượt người chơi, `id` = `turnId`.
  - `scenario_feedback`: tổng kết.
  - `content_flag`, `player_note`.
- **Bảng nội dung:** `ShiftSeedDoc`, `LevelPackDoc`.
- **`ScenarioRun`** thêm `status`, `isPlaytest`, `enrolmentId`, `schemaVersion` (2 = ca làm), `seedId`, `currentNodeId`, `pausedAt`. FK tạm trỏ tới `User`, `Enrollment` và phiên bản nội dung của prototype, vì `user_account`, `scenario_release` và `scenario_build` (P0, ERD-01/04) chưa có.

## Chạy

- Worker là process riêng: `src/worker.ts`, target `serve-worker` (Q7).
- API và worker chỉ nói chuyện qua hàng đợi BullMQ và Redis pub/sub.
- Dùng thẳng `bullmq`, không dùng `@nestjs/bullmq`, vì bản 12 của lớp bọc đó chỉ có ESM và không chạy được trong Jest của API.
- `AI_MODE=live|fake`:
  - `live` gọi model qua gateway: AI-4 bản 2 dùng prompt nháp C3; bộ phán có/không dùng một model khác họ với AI-4 (DC-01).
  - `fake` dùng narrator và bộ phán tất định của game-core, chỉ để dev và demo; bị cấm khi `NODE_ENV=production` (D-92).

## Cần nhóm quyết

1. Duyệt nhóm endpoint trên để bổ sung vào `openapi.yaml`. Ba nhóm endpoint cũ `/runs/{id}/activity`, `/answers`, `/finish` sẽ bỏ hay giữ cho dạng màn cũ?
2. D-130 💡: prompt AI-4 bản 2 đang chạy dưới dạng nháp (`ai/shift/prompts/narrator.v2-draft.ts`), cần Nhật duyệt. Engine thêm hai trường `may_reveal` và `confirm_only` vào hồ sơ gửi AI-4, để giữ luật "mỗi hành động mở tối đa một dữ kiện" (B2).
3. Bộ phán hiện là một model. AI-5 đầy đủ (panel 3 judge, D-91) chưa có. Prompt bộ phán (`checker.v1-draft.ts`) cũng cần duyệt.
4. Chưa có:
   - chấm điểm, kết cục, sự kiện ngẫu nhiên (khuôn seed ghi chưa chốt);
   - mở khoá cấp theo D-114: lượt ca làm hiện không xét mở khoá cấp;
   - random công ty, onboard 6 slide.
5. Nội dung soạn nháp trong seed mẫu (gắn `_draft`) cần DE duyệt (BR-05).
6. Q5 ("hint không trừ điểm") khác chữ của D-83/D-86 ("giảm trọng số khi cộng năng lực"). Engine chỉ ghi lại việc dùng hint; trọng số để lúc chấm.
