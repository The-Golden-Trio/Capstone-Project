# Đề xuất API chơi ca làm (Game Design W45)

> **Trạng thái: ĐỀ XUẤT, chờ nhóm duyệt.**
>
> Code đã chạy theo đề xuất này: `apps/api/src/play/shift-run.*`, `assessment/shift-*`, `core/shift-log.service.ts`. Nếu nhóm đổi đề xuất thì code đổi theo.
>
> `reports/master/api/openapi.yaml` chưa được sửa. Cập nhật 12/11/2026: chuyển sang dựng trên hạ tầng của PR #23.

## Vì sao cần

`openapi.yaml` và luồng `/api/v1/runs` (PR #23) chạy màn chơi dạng chuỗi hoạt động cố định.

Game Design W45 đã chốt một mô hình khác (`Luật dẫn truyện JobQuest.md` bản 3, D-127, D-128, D-129, `Seed scenario JobQuest.md`). Một ca làm gồm:

- nút canon xen pha xử lý tự do, tính bằng điểm thời gian;
- hội thoại 3 lượt, hành động có giá, artefact;
- cờ truyện, câu kiểm có/không, lời hứa có hạn, phần "Nhìn lại ca".

Hợp đồng hiện tại không có chỗ cho các phần đó. Luồng ca làm vì vậy chạy **song song** luồng activity, không sửa luồng activity.

## Dùng chung với PR #23

| Phần             | Dùng chung                                                                      | Thêm cho ca làm                                                                     |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Lượt chơi        | `ScenarioRun`, `flow = 'shift'`                                                 | —                                                                                   |
| Chuỗi sự kiện    | `run_event`, ghi có khoá như `RunLogService`                                    | `ShiftLogService`: payload là `ShiftRecord`, fold bằng engine `shift` của game-core |
| Job AI           | `ai_job` (`kind = 'SHIFT_TURN'`), BullMQ, worker `main.js --worker`             | queue `shift-turn`, `ShiftTurnProcessor`                                            |
| Đẩy tin          | `StreamService` (Redis Stream + pub/sub, `Last-Event-ID`), `GET /api/v1/stream` | loại tin `turn.lines`, `turn.done`, `run.paused`, `provider.delay`                  |
| AI-4             | `NarratorService.narrateScene` (contract nhịp D-130, `narrator.v3`)             | `ShiftSceneNarrator`: dựng `SceneTurn` và thẻ nhân vật từ trạng thái engine         |
| Bộ phán có/không | ghế judge của AI-5 (khác họ AI-4, DC-01)                                        | `ShiftCheckerService`, prompt nháp `checker.v1-draft`                               |
| Lỗi              | `Problem`, `ProblemFilter` (RFC 9457)                                           | —                                                                                   |
| Nội dung         | `ContentRelease`, seed-content                                                  | bảng `ShiftSeedDoc`, `LevelPackDoc` (migration `20261112090000_add_shift_content`)  |

## Endpoint (dưới `/api/v1/shift-runs`)

| Method, path                              | Việc                                                                                                     | Trả về                                                                                                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /` `{taskId, enrolmentId?}`         | Mở lượt; có lượt dở của cùng nhiệm vụ thì trả lượt đó                                                    | `201` / `200`; `409 SCENARIO_UNAVAILABLE`                                                                                                                   |
| `GET /:id`                                | Tên ca, mục tiêu, vai, câu cảnh, cast, glossary, `paused`, `pendingTurnId`                               |                                                                                                                                                             |
| `GET /:id/scene`                          | Cảnh hiện tại: đồng hồ, chế độ, nút đang mở, hành động (điểm, bật/tắt, lý do), tài liệu, sổ tay, ghi chú |                                                                                                                                                             |
| `GET /:id/transcript?after=seq`           | Dòng thoại sau `seq`                                                                                     |                                                                                                                                                             |
| `POST /:id/turns` `{turnId, kind, …}`     | Mọi thao tác người chơi                                                                                  | `200 {turnId, lines, scene}` · `202 {jobId, turnId, streamEvent, lines}` · `409 TURN_IN_PROGRESS` · `409 RUN_PAUSED` · `409 RUN_ENDED` · `422 TURN_INVALID` |
| `POST /:id/resume`                        | Tiếp tục phiên tạm dừng vì hết model (D-92)                                                              | `202`; `409 NOT_PAUSED`                                                                                                                                     |
| `POST /:id/notes` `{text}`                | Ghi chú riêng trong sổ tay (khối M); không gửi AI                                                        | `201`                                                                                                                                                       |
| `POST /:id/flags` `{activityKey, reason}` | Báo nội dung sai                                                                                         | `201`                                                                                                                                                       |
| `GET /:id/summary`                        | Tổng kết theo truyện, **chưa chấm điểm**                                                                 | `404 SUMMARY_NOT_READY` khi chưa xong                                                                                                                       |

Một số điểm cụ thể:

- `taskId` tạm là mã seed (`SWE_BACKEND.L3.m2`).
- Ca kết thúc qua `kind: confirm_end`, hoặc khi nút kết tự bật lúc hết giờ.

`kind` của `/turns`:

| `kind`                       | Trường                         | Việc                                                                                                                       |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `action`                     | `key`, `fields?`, `ticks?`     | Hành động trong seed: trò chuyện, mở tài liệu, viết bản vá, nhắn kênh, chạy thử, họp, "Tạm làm việc khác", bấm nút "Chốt…" |
| `say`                        | `text`                         | Nói trong cuộc trò chuyện, trả lời nút hay probe                                                                           |
| `end_conversation`           | —                              | Đóng cuộc trò chuyện (bộ phán chạy câu kiểm hội thoại)                                                                     |
| `choose`                     | `option`, `elapsedMs?`         | Chọn phương án; thời gian đo trên thiết bị (D-83)                                                                          |
| `timeout`                    | —                              | Hết giờ ở câu đếm giờ: mức 0, không cờ (D-86)                                                                              |
| `save_artefact`              | `artefact`, `fields`, `ticks?` | Nộp artefact của nút                                                                                                       |
| `confirm_end` / `cancel_end` | —                              | Hộp xác nhận nộp nút kết trước hạn (E7)                                                                                    |
| `hint`                       | —                              | Gợi ý bậc 1/2 do engine sinh; không tốn điểm, không hạ điểm                                                                |

Tin trên `/stream` có dạng `{type, runId, jobId, payload}`:

| `type`           | `payload`                                                          |
| ---------------- | ------------------------------------------------------------------ |
| `turn.lines`     | `{turnId, lines}`: dòng mới sau mỗi bước AI                        |
| `turn.done`      | `{turnId, scene, ended}`                                           |
| `provider.delay` | `{turnId, waitingFor: narration \| checks}`: model chạy quá 4 giây |
| `run.paused`     | `{turnId, reason}`                                                 |

## Cần nhóm quyết

1. **Duyệt nhóm endpoint:** đưa vào `openapi.yaml` dưới `/shift-runs`, hay gộp vào `/runs` khi luồng activity được bỏ?
2. **D-130, AI-4 contract nhịp:** engine ca làm truyền thêm chỉ dẫn trong thẻ nhân vật: "được nói ra nếu hỏi đúng chuyện" (giữ luật B2), "chỉ xác nhận khi người chơi tự nói ra" (dữ kiện `ai_only`), và hướng của lượt (ví dụ lý do hoãn duyệt). Thẻ dựng từ hồ sơ slot của seed; chưa ghép lá tarot (C1).
3. **Bộ phán:** mới là một model (ghế judge đầu, ghế đầu hỏng thì sang ghế kế). Prompt `checker.v1-draft` cần duyệt.
4. **Chưa có:**
   - chấm điểm, kết cục, sự kiện ngẫu nhiên;
   - mở khoá cấp: lượt ca làm hiện không xét;
   - random công ty, onboard 6 slide.
5. **Nội dung seed:** phần gắn `_draft` cần DE duyệt (BR-05).
6. **Hint:** Q5 ("hint không trừ điểm") khác chữ của D-83/D-86 ("giảm trọng số"). Engine chỉ ghi lại việc dùng hint.
