# Từ điển dữ liệu ERD JobQuest

Giải thích từng entity, từng field và từng quan hệ của mô hình dữ liệu Chen ([ERD_JobQuest_Chen.puml](ERD_JobQuest_Chen.puml), tách thành 6 nhóm sơ đồ `ERD-01` … `ERD-06`, mỗi nhóm gồm 2–5 sơ đồ nhỏ `ERD-01a` … `ERD-06d`). Viết ngày 21/11/2026 theo trạng thái file nguồn lúc đó.

> **Trạng thái:** đây là thiết kế đề xuất vẽ theo `research/`, chưa phải mô tả code đang chạy. Prisma hiện tại còn lệch sơ đồ này (xem [07 A28](../../../../docs/project-hub/07-van-de-mo.md)). File này viết tay, **không tự sinh**: sửa ERD thì phải cập nhật lại ở đây.

## Cách đọc

- **113 entity** và **236 relationship**. Mỗi entity được mô tả đầy đủ ở sơ đồ chủ của nó (mục A–L bên dưới); ở sơ đồ khác chỉ xuất hiện dạng rút gọn với khoá.
- Cột **Kiểu** của field: `khoá` (khoá chính; ở entity yếu là khoá bộ phận, ghép với khoá của entity cha), `suy ra` (tính từ dữ liệu khác, không nhất thiết lưu cứng), `nhiều giá trị` (một field có nhiều giá trị), `ghép` (field gồm các field con, ghi dạng `cha.con`).
- Dấu **†** cuối câu: ý nghĩa suy ra từ tên field, research không mô tả riêng. Cần xác nhận lại khi hiện thực.
- Nhãn **[CAM]** trên entity hoặc relationship: research còn ghi "cần chốt" hoặc bản nháp, nhóm chưa duyệt (07 A28). **[VANG]**: research ghi "đã chốt" nhưng chưa có mã quyết định D-xx.
- Tên mã nguồn (FR, D, BR, DR, DC, SM…) trỏ về yêu cầu và quyết định trong `docs/project-hub/` và báo cáo master.
- Entity yếu được đánh dấu _(entity yếu)_: không tồn tại độc lập, phụ thuộc entity cha qua relationship định danh.

### Cách quan hệ được lưu khi hiện thực

Sơ đồ Chen không có khoá ngoại; quan hệ là hình thoi. Khi chuyển sang bảng, quy tắc dùng ở đây:

| Cách lưu                                                | Điều kiện                                                                | Số lượng |
| ------------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| Bảng nối                                                | Nhiều–nhiều: cần một bảng riêng, có thể mang field riêng của quan hệ     | 51       |
| Bảng nối ba ngôi                                        | Nối ba entity: cần một bảng riêng                                        | 2        |
| Gộp vào entity (cột)                                    | Một–nhiều nhưng có field riêng: field đó thành cột của entity phía nhiều | 3        |
| Cột tham chiếu                                          | Một–nhiều hoặc một–một không có field riêng: một cột tham chiếu          | 138      |
| Định danh (khoá của entity yếu gồm khoá của entity cha) | Entity yếu: khoá của cha là một phần khoá của entity yếu                 | 42       |

Như vậy số bảng khi hiện thực xấp xỉ số entity cộng với số bảng nối. Field `nhiều giá trị` và field `ghép` có thể thành bảng con hoặc cột JSON; nhóm chưa chọn.

### Không vẽ thành entity

- **Trạng thái lúc chơi** (cờ truyện đã bật, lời hứa, điểm đã tiêu, dữ kiện đã mở…) là kết quả gộp các `RUN_EVENT` qua `game-core`, không có bảng riêng.
- **Hint** do engine sinh; **màn onboard** dựng từ `LEVEL_PACK`; thống kê giám sát, màn giải thích nhảy nghề, phép tính gợi ý nghề, trang sổ tay NPC đều tính khi cần.
- Chưa đưa vào: sự kiện ngẫu nhiên khi chơi lại (research ghi "chưa bàn"), đồng ý của người giám hộ (C7 cần chốt).

## Mục lục

- **ERD-01** Danh tính, chất lượng chấm, vận hành AI: nhóm A, L
- **ERD-02** Danh mục nghề, tham chiếu, keyword: nhóm B, C
- **ERD-03** Gói cấp và nội dung màn: nhóm D, E
- **ERD-04** Soạn, duyệt, trình bày, play-test, xuất bản: nhóm F
- **ERD-05** NPC, nhiệm vụ phụ, kinh tế, sức khoẻ, lịch: nhóm G, K
- **ERD-06** Hồ sơ, tiến trình, lượt chơi, chấm: nhóm H, I, J

---

## ERD-01 · Danh tính, chất lượng chấm, vận hành AI

Sơ đồ: [ERD-01a_Identity.puml](ERD-01a_Identity.puml), [ERD-01b_QualityAndFeedback.puml](ERD-01b_QualityAndFeedback.puml), [ERD-01c_AiOperations.puml](ERD-01c_AiOperations.puml)

### A. Danh tính và phân công

#### Entity (7)

##### `USER_ACCOUNT`

Tài khoản gốc của mọi người dùng. Explorer và nhân sự đều là một tài khoản; vai cụ thể nằm ở `roles` và ở hai lớp con.

| Field           | Kiểu          | Ý nghĩa                                                                                                       |
| --------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`            | khoá          | Mã tài khoản (uuid).                                                                                          |
| `email`         |               | Email đăng nhập, duy nhất.                                                                                    |
| `password_hash` |               | Băm mật khẩu; không lưu mật khẩu thô.                                                                         |
| `display_name`  |               | Tên hiển thị.                                                                                                 |
| `date_of_birth` |               | Ngày sinh; cung hoàng đạo của explorer suy ra từ đây (D-113).                                                 |
| `roles`         | nhiều giá trị | Các vai của tài khoản (explorer, content_admin, domain_expert, system_admin). Một người có thể giữ nhiều vai. |
| `status`        |               | Trạng thái tài khoản.                                                                                         |
| `created_at`    |               | Thời điểm tạo.                                                                                                |
| `deleted_at`    |               | Thời điểm xoá mềm; rỗng nếu còn dùng.                                                                         |

##### `EXPLORER`

Lớp con của `USER_ACCOUNT` cho người chơi. Gom cả ví xu, sức khoẻ, lịch game và điểm RIASEC của người chơi (quan hệ 1–1 toàn phần nên không tách entity riêng).

| Field            | Kiểu   | Ý nghĩa                                                                             |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `nickname`       |        | Tên gọi người chơi muốn được NPC gọi.                                               |
| `address_form`   |        | Cách xưng hô chọn ở hồ sơ ban đầu; NPC dùng khi nói chuyện (NPC §4).                |
| `stage`          |        | Giai đoạn hiện tại của người chơi (đang học, đã đi làm…), chọn ở hồ sơ ban đầu. †   |
| `knows_target`   |        | Người chơi đã có nghề mục tiêu hay chưa. †                                          |
| `crest_seed`     |        | Hạt giống để sinh huy hiệu hoặc ảnh đại diện của người chơi. †                      |
| `zodiac_sign`    | suy ra | Cung hoàng đạo, suy ra từ ngày sinh (D-113).                                        |
| `balance`        | suy ra | Số dư xu, suy ra từ tổng `XU_TRANSACTION`.                                          |
| `savings`        |        | Số xu đang gửi tiết kiệm (D-133).                                                   |
| `savings_locked` |        | Phần tiết kiệm bị khoá bởi cột mốc (`LIFE_MILESTONE.locks_savings`).                |
| `health_value`   | suy ra | Sức khoẻ hiện tại, suy ra từ các `HEALTH_CHANGE`.                                   |
| `health_cap`     |        | Trần sức khoẻ hiện tại.                                                             |
| `consecutive_ot` | suy ra | Số lượt tăng ca liên tiếp, suy ra từ các lượt gần nhất.                             |
| `slow_recovery`  |        | Cờ hồi phục chậm sau chuỗi tăng ca. †                                               |
| `game_date`      |        | Ngày hiện tại trong game.                                                           |
| `gap_slots_left` | suy ra | Số slot nghỉ còn lại trong khoảng nghỉ hiện tại.                                    |
| `riasec_self`    | suy ra | Điểm RIASEC tự khai từ thẻ Get-to-know-me, 6 trục.                                  |
| `riasec_tried`   | suy ra | Điểm RIASEC từ những gì đã thử (qua `INTEREST_TAP`): tổng và số lần theo từng trục. |

##### `STAFF_MEMBER`

Lớp con của `USER_ACCOUNT` cho nhân sự (CA, DE, system admin). Không có field riêng; vai nằm ở `USER_ACCOUNT.roles`, phân công nghề ở `ASSIGNED_TO`.

##### `USER_IDENTITY` _(entity yếu)_

Danh tính đăng nhập từ nhà cung cấp ngoài (ví dụ Google). Phụ thuộc tài khoản.

| Field      | Kiểu | Ý nghĩa                                                |
| ---------- | ---- | ------------------------------------------------------ |
| `provider` | khoá | Nhà cung cấp danh tính; cùng tài khoản tạo thành khoá. |
| `subject`  |      | Mã người dùng bên nhà cung cấp.                        |

##### `AUTH_SESSION`

Một phiên đăng nhập (Bearer + refresh token).

| Field          | Kiểu | Ý nghĩa                                |
| -------------- | ---- | -------------------------------------- |
| `id`           | khoá | Mã phiên.                              |
| `refresh_hash` |      | Băm refresh token.                     |
| `created_at`   |      | Lúc mở phiên.                          |
| `expires_at`   |      | Lúc hết hạn.                           |
| `revoked_at`   |      | Lúc bị thu hồi; rỗng nếu còn hiệu lực. |

##### `PASSWORD_RESET_TOKEN`

Mã đặt lại mật khẩu gửi qua email, dùng một lần.

| Field        | Kiểu | Ý nghĩa                          |
| ------------ | ---- | -------------------------------- |
| `token_hash` | khoá | Băm mã.                          |
| `expires_at` |      | Hạn dùng.                        |
| `used_at`    |      | Lúc đã dùng; rỗng nếu chưa dùng. |

##### `AUDIT_LOG`

Nhật ký thao tác nhạy cảm của người dùng.

| Field          | Kiểu | Ý nghĩa                               |
| -------------- | ---- | ------------------------------------- |
| `id`           | khoá | Mã bản ghi.                           |
| `action`       |      | Hành động.                            |
| `subject_type` |      | Loại đối tượng bị tác động.           |
| `subject_ref`  |      | Tham chiếu tới đối tượng bị tác động. |
| `detail`       |      | Chi tiết hành động.                   |
| `at`           |      | Thời điểm.                            |

#### Relationship (5)

| Quan hệ          | Nối                                                       | Cách lưu                                                | Ý nghĩa                                                       |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| `HAS_IDENTITY`   | `USER_ACCOUNT` (1) — `USER_IDENTITY` (N, bắt buộc)        | Định danh (khoá của entity yếu gồm khoá của entity cha) | Tài khoản có các danh tính đăng nhập ngoài.                   |
| `OPENS`          | `USER_ACCOUNT` (1) — `AUTH_SESSION` (N, bắt buộc)         | Cột tham chiếu                                          | Tài khoản mở các phiên đăng nhập.                             |
| `REQUESTS_RESET` | `USER_ACCOUNT` (1) — `PASSWORD_RESET_TOKEN` (N, bắt buộc) | Cột tham chiếu                                          | Tài khoản yêu cầu các mã đặt lại mật khẩu.                    |
| `PERFORMS`       | `USER_ACCOUNT` (1) — `AUDIT_LOG` (N)                      | Cột tham chiếu                                          | Tài khoản là người thực hiện các thao tác ghi trong nhật ký.  |
| `ASSIGNED_TO`    | `STAFF_MEMBER` (M) — `OCCUPATION` (N)                     | Bảng nối                                                | Gán nhân sự phụ trách một nghề. Mỗi nghề đúng một CA (FR-40). |

Field riêng của quan hệ:

| Quan hệ       | Field         | Kiểu | Ý nghĩa                                    |
| ------------- | ------------- | ---- | ------------------------------------------ |
| `ASSIGNED_TO` | `role`        |      | Vai của nhân sự với nghề này (CA hoặc DE). |
| `ASSIGNED_TO` | `assigned_at` |      | Lúc gán.                                   |

### L. Chất lượng chấm, phản hồi, vận hành AI

#### Entity (13)

##### `BLIND_RATING`

Người chấm mù cho một `ASSESSMENT`, để đo độ tin cậy (FR-29).

| Field      | Kiểu          | Ý nghĩa                    |
| ---------- | ------------- | -------------------------- |
| `id`       | khoá          | Mã.                        |
| `level`    |               | Mức người chấm cho.        |
| `flags`    | nhiều giá trị | Cờ hành vi người chấm bật. |
| `rated_at` |               | Lúc chấm.                  |

##### `REFERENCE_REGRADE`

Chạy lại AI trên câu mẫu để phát hiện chấm lệch (FR-28).

| Field    | Kiểu | Ý nghĩa        |
| -------- | ---- | -------------- |
| `id`     | khoá | Mã.            |
| `level`  |      | Mức AI cho.    |
| `model`  |      | Model đã dùng. |
| `run_at` |      | Lúc chạy.      |

##### `OCCUPATION_RATING`

Đánh giá nghề của người chơi (FR-19, BR-04).

| Field        | Kiểu | Ý nghĩa        |
| ------------ | ---- | -------------- |
| `id`         | khoá | Mã.            |
| `comment`    |      | Nhận xét.      |
| `created_at` |      | Thời điểm tạo. |

##### `RATING_ATTRIBUTE`

Một trong 5 tiêu chí của đánh giá nghề.

| Field  | Kiểu | Ý nghĩa |
| ------ | ---- | ------- |
| `code` | khoá | Mã.     |
| `name` |      | Tên.    |

##### `APP_FEEDBACK`

Góp ý về app (FR-20).

| Field         | Kiểu | Ý nghĩa                  |
| ------------- | ---- | ------------------------ |
| `id`          | khoá | Mã.                      |
| `text`        |      | Nội dung.                |
| `app_version` |      | Phiên bản app lúc góp ý. |
| `status`      |      | Trạng thái xử lý.        |
| `created_at`  |      | Thời điểm tạo.           |

##### `PROMPT_TEMPLATE`

Prompt hệ thống có version, staff sửa được (màn "System prompts").

| Field        | Kiểu | Ý nghĩa                            |
| ------------ | ---- | ---------------------------------- |
| `id`         | khoá | Mã.                                |
| `key`        |      | Khoá prompt.                       |
| `version`    |      | Phiên bản.                         |
| `role`       |      | Vai trò prompt (narrator, judge…). |
| `body`       |      | Nội dung.                          |
| `created_at` |      | Thời điểm tạo.                     |

##### `MODEL_CONFIG`

Cấu hình một model (FR-42, DC-01).

| Field                      | Kiểu | Ý nghĩa                                   |
| -------------------------- | ---- | ----------------------------------------- |
| `id`                       | khoá | Mã.                                       |
| `provider`                 |      | Nhà cung cấp.                             |
| `model`                    |      | Tên model.                                |
| `family`                   |      | Họ model; narrator và judge phải khác họ. |
| `tier`                     |      | Bậc.                                      |
| `pinned_snapshot`          |      | Bản chụp model đã ghim.                   |
| `call_profile`             | ghép | Tham số gọi.                              |
| `call_profile.max_tokens`  |      | Số token tối đa.                          |
| `call_profile.temperature` |      | Nhiệt độ.                                 |
| `call_profile.reasoning`   |      | Mức suy luận.                             |
| `call_profile.timeout`     |      | Thời gian chờ tối đa.                     |
| `call_profile.retries`     |      | Số lần thử lại.                           |
| `is_active`                |      | Còn dùng không.                           |

##### `MODEL_SLOT`

Vai model: narrator, judge_1…3, generator, interviewer, triage.

| Field  | Kiểu | Ý nghĩa  |
| ------ | ---- | -------- |
| `role` | khoá | Tên vai. |

##### `MODEL_PRICE` _(entity yếu)_

Bảng giá model theo ngày hiệu lực. Phụ thuộc `MODEL_CONFIG`.

| Field            | Kiểu | Ý nghĩa                |
| ---------------- | ---- | ---------------------- |
| `effective_from` | khoá | Ngày bắt đầu hiệu lực. |
| `input`          |      | Giá token đầu vào.     |
| `cache_read`     |      | Giá đọc từ cache.      |
| `cache_write`    |      | Giá ghi vào cache.     |
| `output`         |      | Giá token đầu ra.      |
| `reasoning`      |      | Giá token suy luận.    |

##### `AI_JOB`

Một job bất đồng bộ trong hàng đợi (sinh, chấm, chấm lại).

| Field         | Kiểu | Ý nghĩa           |
| ------------- | ---- | ----------------- |
| `id`          | khoá | Mã.               |
| `kind`        |      | Loại job.         |
| `status`      |      | Trạng thái.       |
| `attempts`    |      | Số lần thử.       |
| `payload`     |      | Đầu vào.          |
| `error`       |      | Lỗi.              |
| `queued_at`   |      | Lúc vào hàng đợi. |
| `finished_at` |      | Lúc xong.         |

##### `MODEL_CALL`

Sổ chi phí: mỗi lời gọi model (D-109).

| Field                | Kiểu | Ý nghĩa                                                     |
| -------------------- | ---- | ----------------------------------------------------------- |
| `id`                 | khoá | Mã.                                                         |
| `requested_model`    |      | Model được yêu cầu.                                         |
| `returned_model`     |      | Model thực sự trả lời; có thể khác khi dùng model dự phòng. |
| `prompt_version`     |      | Phiên bản prompt.                                           |
| `rubric_version`     |      | Phiên bản rubric chấm.                                      |
| `schema_version`     |      | Phiên bản schema đầu ra.                                    |
| `tokens`             | ghép | Số token.                                                   |
| `tokens.uncached`    |      | Token không qua cache.                                      |
| `tokens.cache_read`  |      | Token đọc từ cache.                                         |
| `tokens.cache_write` |      | Token ghi vào cache.                                        |
| `tokens.output`      |      | Token đầu ra.                                               |
| `tokens.reasoning`   |      | Token suy luận.                                             |
| `cost`               |      | Chi phí.                                                    |
| `price_date`         |      | Ngày của bảng giá áp dụng.                                  |
| `latency`            |      | Độ trễ.                                                     |
| `finish_reason`      |      | Lý do model dừng.                                           |
| `check_result`       |      | Kết quả kiểm đầu ra.                                        |

##### `NOTIFICATION`

Thông báo gửi cho người dùng.

| Field        | Kiểu | Ý nghĩa        |
| ------------ | ---- | -------------- |
| `id`         | khoá | Mã.            |
| `kind`       |      | Loại.          |
| `text`       |      | Nội dung.      |
| `created_at` |      | Thời điểm tạo. |
| `read_at`    |      | Lúc đọc.       |

##### `PLATFORM_SETTING`

Cài đặt nền tảng có version (DR-17): tỉ lệ mở khoá 60%, trần chi phí mỗi phiên…

| Field        | Kiểu | Ý nghĩa    |
| ------------ | ---- | ---------- |
| `key`        | khoá | Khoá.      |
| `version`    |      | Phiên bản. |
| `value`      |      | Giá trị.   |
| `changed_at` |      | Lúc đổi.   |

#### Relationship (18)

| Quan hệ           | Nối                                                          | Cách lưu                                                | Ý nghĩa                             |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------- |
| `RATES_BLIND`     | `BLIND_RATING` (N, bắt buộc) — `ASSESSMENT` (1)              | Cột tham chiếu                                          | Lượt chấm mù nhắm vào một lần chấm. |
| `RATER`           | `BLIND_RATING` (N, bắt buộc) — `STAFF_MEMBER` (1)            | Cột tham chiếu                                          | Người chấm mù.                      |
| `REGRADES`        | `REFERENCE_REGRADE` (N, bắt buộc) — `REFERENCE_ANSWER` (1)   | Cột tham chiếu                                          | Lần chấm lại nhắm vào một câu mẫu.  |
| `REGRADE_JOB`     | `REFERENCE_REGRADE` (N, bắt buộc) — `AI_JOB` (1)             | Cột tham chiếu                                          | Lần chấm lại chạy bởi một AI_JOB.   |
| `RATES`           | `EXPLORER` (1) — `OCCUPATION_RATING` (N, bắt buộc)           | Cột tham chiếu                                          | Người chơi đánh giá các nghề.       |
| `RATING_FOR`      | `OCCUPATION_RATING` (N, bắt buộc) — `OCCUPATION` (1)         | Cột tham chiếu                                          | Đánh giá nhắm vào một nghề.         |
| `SCORES_ATTR`     | `OCCUPATION_RATING` (5–5, bắt buộc) — `RATING_ATTRIBUTE` (N) | Bảng nối                                                | Điểm cho từng trong 5 tiêu chí.     |
| `SENDS_FEEDBACK`  | `USER_ACCOUNT` (1) — `APP_FEEDBACK` (N, bắt buộc)            | Cột tham chiếu                                          | Tài khoản gửi góp ý.                |
| `HANDLES`         | `STAFF_MEMBER` (1) — `APP_FEEDBACK` (N)                      | Cột tham chiếu                                          | Nhân sự xử lý góp ý.                |
| `EDITS_PROMPT`    | `STAFF_MEMBER` (1) — `PROMPT_TEMPLATE` (N)                   | Cột tham chiếu                                          | Nhân sự sửa prompt.                 |
| `FILLS_SLOT`      | `MODEL_CONFIG` (M) — `MODEL_SLOT` (N)                        | Bảng nối                                                | Model nào đảm nhiệm vai nào.        |
| `PRICED`          | `MODEL_CONFIG` (1) — `MODEL_PRICE` (N, bắt buộc)             | Định danh (khoá của entity yếu gồm khoá của entity cha) | Model có các bảng giá theo ngày.    |
| `JOB_FOR_RUN`     | `AI_JOB` (N) — `SCENARIO_RUN` (0–1)                          | Cột tham chiếu                                          | Job gắn với một lượt chơi.          |
| `JOB_PROMPT`      | `AI_JOB` (N) — `PROMPT_TEMPLATE` (0–1)                       | Cột tham chiếu                                          | Job dùng một prompt.                |
| `CALLS`           | `AI_JOB` (1) — `MODEL_CALL` (N, bắt buộc)                    | Cột tham chiếu                                          | Job có các lời gọi model.           |
| `CALL_MODEL`      | `MODEL_CALL` (N, bắt buộc) — `MODEL_CONFIG` (1)              | Cột tham chiếu                                          | Lời gọi dùng một cấu hình model.    |
| `NOTIFIES`        | `USER_ACCOUNT` (1) — `NOTIFICATION` (N, bắt buộc)            | Cột tham chiếu                                          | Tài khoản nhận các thông báo.       |
| `CHANGES_SETTING` | `STAFF_MEMBER` (1) — `PLATFORM_SETTING` (N)                  | Cột tham chiếu                                          | Nhân sự đổi các cài đặt.            |

Field riêng của quan hệ:

| Quan hệ       | Field      | Kiểu | Ý nghĩa                                             |
| ------------- | ---------- | ---- | --------------------------------------------------- |
| `SCORES_ATTR` | `score`    |      | Điểm từ 1 đến 5.                                    |
| `FILLS_SLOT`  | `priority` |      | Thứ tự ưu tiên; dùng để chuyển sang model dự phòng. |

---

## ERD-02 · Danh mục nghề, tham chiếu, keyword

Sơ đồ: [ERD-02a_Occupations.puml](ERD-02a_Occupations.puml), [ERD-02b_LevelsAndTasks.puml](ERD-02b_LevelsAndTasks.puml), [ERD-02c_WorkEnvironments.puml](ERD-02c_WorkEnvironments.puml), [ERD-02d_ReferenceAndKeywords.puml](ERD-02d_ReferenceAndKeywords.puml), [ERD-02e_SoftSkills.puml](ERD-02e_SoftSkills.puml)

### B. Danh mục nghề, hồ sơ nghề, nơi làm

#### Entity (11)

##### `INTEREST_REGION`

Vùng sở thích trên bản đồ ngân hà; nhóm nghề thuộc về một vùng (D-125).

| Field        | Kiểu | Ý nghĩa          |
| ------------ | ---- | ---------------- |
| `code`       | khoá | Mã vùng.         |
| `name`       |      | Tên vùng.        |
| `sort_order` |      | Thứ tự hiển thị. |

##### `OCCUPATION_GROUP`

Nhóm nghề (một thiên hà trên bản đồ) (D-110, D-125).

| Field        | Kiểu | Ý nghĩa               |
| ------------ | ---- | --------------------- |
| `code`       | khoá | Mã nhóm.              |
| `name`       |      | Tên nhóm.             |
| `colour_hex` |      | Màu nhóm trên bản đồ. |
| `sort_order` |      | Thứ tự hiển thị.      |

##### `OCCUPATION`

Một nghề trong danh mục (221 nghề: 22 IT và 199 ngoài IT).

| Field             | Kiểu          | Ý nghĩa                                                          |
| ----------------- | ------------- | ---------------------------------------------------------------- |
| `id`              | khoá          | Mã nghề (uuid).                                                  |
| `code`            |               | Mã nghề dạng chữ (ví dụ `SWE_BACKEND`).                          |
| `name`            |               | Tên nghề.                                                        |
| `summary`         |               | Mô tả ngắn.                                                      |
| `status`          |               | Trạng thái vòng đời của nghề (SM-01).                            |
| `downsides`       | nhiều giá trị | Mặt trái của nghề, hiển thị cho người chơi (BR-07).              |
| `difficulty_k`    |               | Hệ số độ khó của nghề (D-115).                                   |
| `difficulty_tier` | suy ra        | Bậc độ khó, suy ra từ hệ số (D-115).                             |
| `is_senior_entry` | suy ra        | Nghề chỉ vào được ở cấp cao, suy ra từ `REQUIRES_PRIOR` (D-121). |
| `riasec_profile`  | nhiều giá trị | Hồ sơ RIASEC của nghề, giá trị theo từng trục (D-111).           |

##### `OCCUPATION_LEVEL` _(entity yếu)_

Một cấp (L1, L2…) của nghề. Phụ thuộc `OCCUPATION`.

| Field                   | Kiểu   | Ý nghĩa                                                  |
| ----------------------- | ------ | -------------------------------------------------------- |
| `level_no`              | khoá   | Số thứ tự cấp trong nghề.                                |
| `title`                 |        | Chức danh của cấp.                                       |
| `experience`            | ghép   | Khoảng kinh nghiệm của cấp.                              |
| `experience.from_years` |        | Số năm tối thiểu.                                        |
| `experience.to_years`   |        | Số năm tối đa.                                           |
| `scope`                 |        | Phạm vi trách nhiệm.                                     |
| `basis`                 |        | Cơ sở xác định cấp (nguồn).                              |
| `evidence_grade`        |        | Mức bằng chứng của thông tin cấp.                        |
| `core_output`           |        | Sản phẩm đầu ra cốt lõi.                                 |
| `salary`                | ghép   | Khoảng lương theo khu vực.                               |
| `salary.enterprise_min` |        | Lương tối thiểu ở doanh nghiệp.                          |
| `salary.enterprise_max` |        | Lương tối đa ở doanh nghiệp.                             |
| `salary.public_min`     |        | Lương tối thiểu ở khu vực công.                          |
| `salary.public_max`     |        | Lương tối đa ở khu vực công.                             |
| `xu_per_mission`        | suy ra | Xu thưởng mỗi màn của cấp, suy ra từ band và lương (K2). |
| `main_mission_count`    | suy ra | Số màn chính của cấp, suy ra (D-119).                    |
| `side_quest_budget`     | suy ra | Ngân sách nhiệm vụ phụ của cấp, suy ra. †                |

##### `BAND`

Bảng tham số theo band (nhóm cấp) dùng cho kinh tế (D-114, D-116, K6).

| Field          | Kiểu | Ý nghĩa                                              |
| -------------- | ---- | ---------------------------------------------------- |
| `band_no`      | khoá | Số band.                                             |
| `base_budget`  |      | Ngân sách cơ sở của band.                            |
| `penalty_rate` |      | Tỉ lệ phạt.                                          |
| `lifestyle_x`  |      | Hệ số lối sống X; giá cột mốc cuộc sống tính theo X. |

##### `LEVEL_TASK` _(entity yếu)_

Một đầu việc hằng ngày của cấp. Một màn thực hiện một việc (`PERFORMS_TASK`). Phụ thuộc `OCCUPATION_LEVEL`.

| Field  | Kiểu | Ý nghĩa                |
| ------ | ---- | ---------------------- |
| `seq`  | khoá | Thứ tự việc trong cấp. |
| `text` |      | Mô tả việc.            |

##### `SKILL_TIER`

Bậc kỹ năng (D-114).

| Field        | Kiểu | Ý nghĩa                    |
| ------------ | ---- | -------------------------- |
| `tier`       | khoá | Số bậc.                    |
| `min_points` |      | Điểm tối thiểu để đạt bậc. |

##### `WORK_ENVIRONMENT`

Môi trường làm việc của một nghề: ca, tăng ca, chi phí sức khoẻ.

| Field              | Kiểu          | Ý nghĩa                             |
| ------------------ | ------------- | ----------------------------------- |
| `code`             | khoá          | Mã môi trường.                      |
| `name`             |               | Tên môi trường.                     |
| `shifts`           |               | Chế độ ca làm.                      |
| `workweek`         |               | Tuần làm việc.                      |
| `overtime`         |               | Mức độ tăng ca.                     |
| `overtime_pay`     |               | Tăng ca có được trả tiền hay không. |
| `peak_season`      | nhiều giá trị | Các mùa cao điểm.                   |
| `health_cost`      |               | Chi phí sức khoẻ của môi trường.    |
| `evidence`         | ghép          | Nguồn của thông tin trên.           |
| `evidence.grade`   |               | Mức bằng chứng.                     |
| `evidence.sources` |               | Danh sách nguồn.                    |

##### `DEPARTMENT` _(entity yếu)_ **[CAM]**

Phòng ban trong một môi trường làm việc (2–4 mỗi môi trường); quy tắc trang phục NPC theo phòng ban. Phụ thuộc `WORK_ENVIRONMENT`. Chờ nhóm duyệt.

| Field          | Kiểu          | Ý nghĩa                                                    |
| -------------- | ------------- | ---------------------------------------------------------- |
| `code`         | khoá          | Mã phòng ban.                                              |
| `name`         |               | Tên phòng ban.                                             |
| `relation_fit` | nhiều giá trị | Các quan hệ NPC (sếp, đồng nghiệp…) phù hợp với phòng ban. |
| `base_outfit`  |               | Trang phục nền.                                            |
| `layers`       | nhiều giá trị | Các lớp áo thêm.                                           |
| `accessories`  | nhiều giá trị | Phụ kiện.                                                  |
| `colour_rule`  |               | Quy tắc màu.                                               |
| `source_kind`  |               | Nguồn gốc dữ liệu phòng ban.                               |

##### `COMPANY_TYPE`

Loại hình công ty (ví dụ startup, tập đoàn).

| Field  | Kiểu | Ý nghĩa   |
| ------ | ---- | --------- |
| `code` | khoá | Mã loại.  |
| `name` |      | Tên loại. |

##### `COMPANY`

Một công ty cụ thể; mỗi lần vào cấp, người chơi được bốc một công ty.

| Field               | Kiểu | Ý nghĩa          |
| ------------------- | ---- | ---------------- |
| `code`              | khoá | Mã công ty.      |
| `name`              |      | Tên công ty.     |
| `colour_hex`        |      | Màu nhận diện.   |
| `profile`           | ghép | Hồ sơ công ty.   |
| `profile.product`   |      | Sản phẩm.        |
| `profile.customers` |      | Khách hàng.      |
| `profile.culture`   |      | Văn hoá.         |
| `profile.rules`     |      | Quy định nội bộ. |

#### Relationship (13)

| Quan hệ          | Nối                                                                | Cách lưu                                                | Ý nghĩa                                                            |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------ |
| `IN_REGION`      | `OCCUPATION_GROUP` (N, bắt buộc) — `INTEREST_REGION` (1, bắt buộc) | Cột tham chiếu                                          | Nhóm nghề thuộc một vùng sở thích.                                 |
| `IN_GROUP`       | `OCCUPATION` (N, bắt buộc) — `OCCUPATION_GROUP` (1, bắt buộc)      | Cột tham chiếu                                          | Nghề thuộc một nhóm nghề.                                          |
| `HAS_LEVEL`      | `OCCUPATION` (1, bắt buộc) — `OCCUPATION_LEVEL` (N, bắt buộc)      | Định danh (khoá của entity yếu gồm khoá của entity cha) | Nghề có các cấp.                                                   |
| `AT_BAND`        | `OCCUPATION_LEVEL` (N, bắt buộc) — `BAND` (1)                      | Cột tham chiếu                                          | Cấp tương đương một band kinh tế.                                  |
| `HAS_TASK`       | `OCCUPATION_LEVEL` (1) — `LEVEL_TASK` (N, bắt buộc)                | Định danh (khoá của entity yếu gồm khoá của entity cha) | Cấp có các việc hằng ngày.                                         |
| `REQUIRES_PRIOR` | `OCCUPATION` (M) — `OCCUPATION` (N)                                | Bảng nối                                                | Nghề này cần đã qua nghề khác (cấp cao hoặc chuyển ngang) (D-121). |
| `SIMILAR_TO`     | `OCCUPATION` (M) — `OCCUPATION` (N)                                | Bảng nối                                                | Độ giống giữa hai nghề, dùng để gợi ý (D-111, D-122).              |
| `NEEDS_SKILL`    | `OCCUPATION` (M, bắt buộc) — `SOFT_SKILL_GROUP` (N, bắt buộc)      | Bảng nối                                                | Nghề cần nhóm kỹ năng mềm nào (D-114).                             |
| `WORKS_IN`       | `OCCUPATION` (M) — `WORK_ENVIRONMENT` (N)                          | Bảng nối                                                | Nghề thường làm trong môi trường nào.                              |
| `HAS_DEPARTMENT` | `WORK_ENVIRONMENT` (1, bắt buộc) — `DEPARTMENT` (2–4, bắt buộc)    | Định danh (khoá của entity yếu gồm khoá của entity cha) | Môi trường làm việc có 2–4 phòng ban.                              |
| `OFFERS_TYPE`    | `WORK_ENVIRONMENT` (M) — `COMPANY_TYPE` (N)                        | Bảng nối                                                | Môi trường làm việc có những loại công ty nào.                     |
| `LOCATED_IN`     | `COMPANY` (N, bắt buộc) — `WORK_ENVIRONMENT` (1)                   | Cột tham chiếu                                          | Công ty thuộc một môi trường làm việc.                             |
| `OF_TYPE`        | `COMPANY` (N, bắt buộc) — `COMPANY_TYPE` (1)                       | Cột tham chiếu                                          | Công ty thuộc một loại hình.                                       |

Field riêng của quan hệ:

| Quan hệ          | Field           | Kiểu   | Ý nghĩa                                       |
| ---------------- | --------------- | ------ | --------------------------------------------- |
| `REQUIRES_PRIOR` | `kind`          |        | Loại điều kiện: cấp cao hoặc chuyển ngang.    |
| `REQUIRES_PRIOR` | `reason`        |        | Lý do.                                        |
| `REQUIRES_PRIOR` | `min_band`      | suy ra | Band tối thiểu phải đạt ở nghề trước, suy ra. |
| `SIMILAR_TO`     | `sim`           |        | Điểm giống.                                   |
| `SIMILAR_TO`     | `computed_at`   |        | Lúc tính.                                     |
| `NEEDS_SKILL`    | `z_need`        |        | Mức cần của nhóm kỹ năng, đã chuẩn hoá.       |
| `WORKS_IN`       | `weight`        |        | Trọng số khi bốc môi trường cho người chơi.   |
| `WORKS_IN`       | `weight_status` |        | Trọng số còn tạm thời hay đã có số liệu.      |

### C. Dữ liệu tham chiếu, kỹ năng mềm, keyword, thư viện chấm

#### Entity (10)

##### `IMPORT_BATCH`

Một lần import dữ liệu tham chiếu (O*NET, ESCO) do staff chạy (FR-31).

| Field         | Kiểu | Ý nghĩa               |
| ------------- | ---- | --------------------- |
| `id`          | khoá | Mã lô.                |
| `source`      |      | Nguồn dữ liệu.        |
| `version`     |      | Phiên bản nguồn.      |
| `file_key`    |      | Khoá file đã tải lên. |
| `status`      |      | Trạng thái lô.        |
| `imported_at` |      | Lúc import.           |

##### `IMPORT_ISSUE` _(entity yếu)_

Một dòng lỗi hoặc xung đột khi import, chờ người xử lý. Phụ thuộc `IMPORT_BATCH`.

| Field         | Kiểu | Ý nghĩa                           |
| ------------- | ---- | --------------------------------- |
| `source_ref`  | khoá | Tham chiếu tới dòng nguồn bị lỗi. |
| `reason`      |      | Lý do lỗi.                        |
| `resolved_at` |      | Lúc đã xử lý; rỗng nếu còn chờ.   |

##### `ONET_OCCUPATION`

Nghề tham chiếu của O*NET.

| Field      | Kiểu | Ý nghĩa   |
| ---------- | ---- | --------- |
| `soc_code` | khoá | Mã SOC.   |
| `title`    |      | Tên nghề. |

##### `ESCO_OCCUPATION`

Nghề tham chiếu của ESCO.

| Field      | Kiểu | Ý nghĩa                  |
| ---------- | ---- | ------------------------ |
| `esco_uri` | khoá | URI của nghề trong ESCO. |
| `name_en`  |      | Tên tiếng Anh.           |

##### `ESCO_SKILL_GROUP`

Nhóm kỹ năng ESCO, có cây cha–con.

| Field             | Kiểu | Ý nghĩa                                  |
| ----------------- | ---- | ---------------------------------------- |
| `esco_uri`        | khoá | URI nhóm.                                |
| `name`            | ghép | Tên nhóm.                                |
| `name.en`         |      | Tên tiếng Anh.                           |
| `name.vi`         |      | Tên tiếng Việt.                          |
| `level`           |      | Cấp của nhóm trong cây.                  |
| `kind`            |      | Loại nhóm.                               |
| `is_soft_overlap` |      | Nhóm trùng với kỹ năng mềm của hệ thống. |

##### `KEYWORD`

Một kỹ năng cụ thể (keyword ESCO) mà người chơi tích luỹ qua các màn (D-120).

| Field            | Kiểu | Ý nghĩa                         |
| ---------------- | ---- | ------------------------------- |
| `esco_uri`       | khoá | URI keyword.                    |
| `name`           | ghép | Tên keyword.                    |
| `name.vi`        |      | Tên tiếng Việt.                 |
| `name.en`        |      | Tên tiếng Anh.                  |
| `name_vi_status` |      | Tình trạng bản dịch tiếng Việt. |
| `skill_type`     |      | Loại kỹ năng.                   |
| `description`    |      | Mô tả.                          |

##### `SOFT_SKILL_GROUP` **[CAM]**

Một trong 7 nhóm kỹ năng mềm; người chơi tích điểm theo nhóm.

| Field           | Kiểu          | Ý nghĩa                                              |
| --------------- | ------------- | ---------------------------------------------------- |
| `code`          | khoá          | Mã nhóm.                                             |
| `name`          |               | Tên nhóm.                                            |
| `sort_order`    |               | Thứ tự hiển thị.                                     |
| `onet_elements` | nhiều giá trị | Các yếu tố O*NET ánh xạ vào nhóm; còn chờ chốt (B2). |

##### `SOFT_SKILL_ITEM` **[CAM]**

Mục con của nhóm kỹ năng mềm (42 mục). Là đơn vị chấm 0/1/2.

| Field                | Kiểu | Ý nghĩa                                  |
| -------------------- | ---- | ---------------------------------------- |
| `code`               | khoá | Mã mục.                                  |
| `name`               |      | Tên mục.                                 |
| `indicator`          |      | Dấu hiệu quan sát.                       |
| `consider_condition` |      | Điều kiện để xét mục này; bản nháp (E2). |

##### `CHECK_QUESTION` _(entity yếu)_ **[CAM]**

Thư viện câu hỏi có/không của từng mục con, dùng cho judge. Phụ thuộc `SOFT_SKILL_ITEM`.

| Field  | Kiểu | Ý nghĩa                   |
| ------ | ---- | ------------------------- |
| `slot` | khoá | Vị trí câu hỏi (A, B, C). |
| `text` |      | Nội dung câu hỏi.         |

##### `CONDUCT_FLAG` **[CAM]**

Cờ hành vi chung (13 cờ) mà judge có thể bật.

| Field         | Kiểu | Ý nghĩa        |
| ------------- | ---- | -------------- |
| `code`        | khoá | Mã cờ.         |
| `name`        |      | Tên cờ.        |
| `description` |      | Mô tả hành vi. |

#### Relationship (15)

| Quan hệ                  | Nối                                                                   | Cách lưu                                                | Ý nghĩa                                                                                  |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `RUNS_IMPORT`            | `STAFF_MEMBER` (1) — `IMPORT_BATCH` (N)                               | Cột tham chiếu                                          | Nhân sự chạy các lần import.                                                             |
| `HAS_ISSUE`              | `IMPORT_BATCH` (1) — `IMPORT_ISSUE` (N, bắt buộc)                     | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lô import có các dòng lỗi.                                                               |
| `RESOLVES`               | `STAFF_MEMBER` (1) — `IMPORT_ISSUE` (N)                               | Cột tham chiếu                                          | Nhân sự xử lý các dòng lỗi.                                                              |
| `MAPS_TO_ONET`           | `OCCUPATION` (1–2, bắt buộc) — `ONET_OCCUPATION` (N)                  | Bảng nối                                                | Ánh xạ nghề của ta sang 1–2 nghề O*NET.                                                  |
| `MAPS_TO_ESCO`           | `OCCUPATION` (1–2, bắt buộc) — `ESCO_OCCUPATION` (N)                  | Bảng nối                                                | Ánh xạ nghề sang 1–2 nghề ESCO (D-123).                                                  |
| `PARENT_OF`              | `ESCO_SKILL_GROUP` (1) — `ESCO_SKILL_GROUP` (N)                       | Cột tham chiếu                                          | Cây nhóm kỹ năng ESCO: nhóm cha có nhóm con.                                             |
| `IN_SKILL_GROUP`         | `KEYWORD` (M, bắt buộc) — `ESCO_SKILL_GROUP` (N)                      | Bảng nối                                                | Keyword thuộc nhóm kỹ năng ESCO nào (nhiều–nhiều).                                       |
| `TRANSFERS_TO`           | `ESCO_SKILL_GROUP` (M) — `ESCO_SKILL_GROUP` (N)                       | Bảng nối                                                | Kỹ năng ở nhóm này được tính một phần khi sang nhóm kia (D-118).                         |
| `REQUIRES_KEYWORD`       | `OCCUPATION` (5–10, bắt buộc) — `KEYWORD` (N, bắt buộc)               | Bảng nối                                                | Nghề yêu cầu 5–10 keyword.                                                               |
| `TRAINS`                 | `OCCUPATION_LEVEL` (0–5) — `KEYWORD` (N)                              | Bảng nối                                                | Cấp đưa keyword lên mức thành thạo nào. Chỉ lưu đầu ra; đầu vào là đầu ra của cấp trước. |
| `ITEM_OF`                | `SOFT_SKILL_ITEM` (N, bắt buộc) — `SOFT_SKILL_GROUP` (1, bắt buộc)    | Cột tham chiếu                                          | Mục con thuộc một nhóm kỹ năng mềm (42 mục × 7 nhóm).                                    |
| `TIER_NAME` **[CAM]**    | `SOFT_SKILL_GROUP` (M) — `SKILL_TIER` (N)                             | Bảng nối                                                | Tên bậc kỹ năng của từng nhóm.                                                           |
| `BUDGETS`                | `OCCUPATION_LEVEL` (7–7, bắt buộc) — `SOFT_SKILL_GROUP` (N, bắt buộc) | Bảng nối                                                | Ngân sách điểm 7 nhóm kỹ năng của một cấp (D-114).                                       |
| `HAS_QUESTION` **[CAM]** | `SOFT_SKILL_ITEM` (1) — `CHECK_QUESTION` (N)                          | Định danh (khoá của entity yếu gồm khoá của entity cha) | Mục con có các câu hỏi có/không.                                                         |
| `COMMON_FLAG` **[CAM]**  | `SOFT_SKILL_ITEM` (M) — `CONDUCT_FLAG` (N)                            | Bảng nối                                                | Cờ hành vi hay gặp ở mục con.                                                            |

Field riêng của quan hệ:

| Quan hệ            | Field                    | Kiểu   | Ý nghĩa                         |
| ------------------ | ------------------------ | ------ | ------------------------------- |
| `MAPS_TO_ONET`     | `is_primary`             |        | Là ánh xạ chính.                |
| `MAPS_TO_ESCO`     | `match_method`           |        | Cách khớp.                      |
| `MAPS_TO_ESCO`     | `is_primary`             |        | Là ánh xạ chính.                |
| `MAPS_TO_ESCO`     | `note`                   |        | Ghi chú.                        |
| `TRANSFERS_TO`     | `s`                      |        | Độ gần giữa hai nhóm.           |
| `TRANSFERS_TO`     | `credit`                 |        | Phần được tính.                 |
| `REQUIRES_KEYWORD` | `kind`                   |        | Loại yêu cầu.                   |
| `REQUIRES_KEYWORD` | `rank`                   |        | Thứ hạng quan trọng.            |
| `REQUIRES_KEYWORD` | `max_proficiency`        | suy ra | Mức thành thạo tối đa, suy ra.  |
| `REQUIRES_KEYWORD` | `is_hand_picked`         |        | Chọn tay thay vì tự động.       |
| `REQUIRES_KEYWORD` | `pick_reason`            |        | Lý do chọn tay.                 |
| `REQUIRES_KEYWORD` | `is_optional_supplement` |        | Là keyword bổ sung tuỳ chọn.    |
| `TRAINS`           | `proficiency`            |        | Mức thành thạo đạt được.        |
| `TIER_NAME`        | `name`                   |        | Tên bậc.                        |
| `BUDGETS`          | `points`                 |        | Số điểm.                        |
| `BUDGETS`          | `is_adjusted`            |        | Đã được chỉnh tay.              |
| `BUDGETS`          | `is_focus`               | suy ra | Nhóm trọng tâm của cấp, suy ra. |
| `BUDGETS`          | `required_tier`          | suy ra | Bậc yêu cầu, suy ra.            |

---

## ERD-03 · Gói cấp và nội dung màn

Sơ đồ: [ERD-03a_Scenario.puml](ERD-03a_Scenario.puml), [ERD-03b_PackAndSlots.puml](ERD-03b_PackAndSlots.puml), [ERD-03c_FactsAndActions.puml](ERD-03c_FactsAndActions.puml), [ERD-03d_Nodes.puml](ERD-03d_Nodes.puml), [ERD-03e_ProbesAndAnswers.puml](ERD-03e_ProbesAndAnswers.puml)

### D. Gói cấp

#### Entity (2)

##### `LEVEL_PACK`

Gói dùng chung cho mọi màn của một cấp: nơi làm, đội, luật, giờ làm, dữ kiện chung. Có version, đi qua vòng đời duyệt như màn.

| Field               | Kiểu          | Ý nghĩa                                                                     |
| ------------------- | ------------- | --------------------------------------------------------------------------- |
| `id`                | khoá          | Mã gói.                                                                     |
| `version_no`        |               | Số phiên bản của gói.                                                       |
| `status`            |               | Trạng thái vòng đời (SM-01).                                                |
| `workplace`         |               | Mô tả nơi làm việc.                                                         |
| `team`              |               | Mô tả đội.                                                                  |
| `level_scope`       |               | Phạm vi công việc của cấp.                                                  |
| `honest_note`       |               | Ghi chú thành thật về mặt khó của cấp.                                      |
| `rules`             | nhiều giá trị | Các luật nơi làm việc; mỗi luật gồm mã, nội dung và lúc nói với người chơi. |
| `shared_facts`      | nhiều giá trị | Dữ kiện dùng chung cho mọi màn của cấp.                                     |
| `action_costs`      | nhiều giá trị | Điểm thời gian mỗi loại hành động; mỗi mục gồm loại hành động và số điểm.   |
| `hr_open`           |               | Giờ bắt đầu làm việc.                                                       |
| `hr_close`          |               | Giờ kết thúc làm việc.                                                      |
| `followup_cap`      |               | Trần số lần hỏi tiếp trong một cuộc trò chuyện.                             |
| `minutes_per_point` |               | Một điểm thời gian tương ứng bao nhiêu phút trong truyện.                   |
| `onboarding_slides` | suy ra        | Các màn giới thiệu cấp, dựng từ gói.                                        |

##### `RESIDENT_SLOT` _(entity yếu)_

Chỗ cho nhân vật thường trú của gói (sếp, đồng nghiệp ngồi cạnh…). Phụ thuộc `LEVEL_PACK`.

| Field      | Kiểu | Ý nghĩa                                     |
| ---------- | ---- | ------------------------------------------- |
| `slot`     | khoá | Mã chỗ.                                     |
| `relation` |      | Quan hệ với người chơi (sếp, đồng nghiệp…). |
| `is_fixed` |      | Nhân vật cố định hay bốc ngẫu nhiên.        |

#### Relationship (4)

| Quan hệ          | Nối                                                 | Cách lưu                                                | Ý nghĩa                                         |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `STAGES`         | `OCCUPATION_LEVEL` (1) — `LEVEL_PACK` (N, bắt buộc) | Cột tham chiếu                                          | Cấp có các phiên bản gói cấp.                   |
| `AUTHORS_PACK`   | `STAFF_MEMBER` (1) — `LEVEL_PACK` (N, bắt buộc)     | Cột tham chiếu                                          | Nhân sự soạn gói cấp.                           |
| `HAS_RESIDENT`   | `LEVEL_PACK` (1) — `RESIDENT_SLOT` (N, bắt buộc)    | Định danh (khoá của entity yếu gồm khoá của entity cha) | Gói có các chỗ nhân vật thường trú.             |
| `FILLS_RESIDENT` | `RESIDENT_SLOT` (N) — `NPC_CARD` (0–1)              | Cột tham chiếu                                          | Chỗ thường trú được gán cho một nhân vật tarot. |

### E. Nội dung màn

#### Entity (14)

##### `SCENARIO` **[CAM]**

Một màn chơi theo mô hình "màn": vai, bối cảnh, mục tiêu, đồng hồ, độ khó, nhịp màn, móc kinh tế.

| Field                         | Kiểu          | Ý nghĩa                                                                                                                                 |
| ----------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                          | khoá          | Mã màn.                                                                                                                                 |
| `code`                        |               | Mã dạng chữ.                                                                                                                            |
| `title`                       |               | Tên màn.                                                                                                                                |
| `situation_type`              |               | Loại tình huống; cùng cấp và cùng việc thì loại tình huống phải khác nhau.                                                              |
| `status`                      |               | Trạng thái vòng đời (SM-01).                                                                                                            |
| `player_role`                 |               | Vai của người chơi trong màn.                                                                                                           |
| `limits`                      | nhiều giá trị | Việc người chơi không được tự làm; mỗi mục gồm loại giới hạn, hành động bị giới hạn, chỗ nhân vật phải duyệt và lúc nói với người chơi. |
| `situation`                   |               | Mô tả tình huống.                                                                                                                       |
| `goal`                        |               | Mục tiêu của người chơi.                                                                                                                |
| `stakes`                      |               | Hậu quả nếu không làm được.                                                                                                             |
| `clock`                       | ghép          | Đồng hồ trong truyện.                                                                                                                   |
| `clock.start`                 |               | Giờ bắt đầu.                                                                                                                            |
| `clock.deadline`              |               | Hạn chót.                                                                                                                               |
| `clock.budget_points`         |               | Quỹ điểm thời gian.                                                                                                                     |
| `clock.time_points`           |               | Các mốc điểm thời gian.                                                                                                                 |
| `glossary`                    | nhiều giá trị | Thuật ngữ cần giải thích; mỗi mục gồm thuật ngữ và nghĩa.                                                                               |
| `difficulty`                  | ghép          | Bốn trục độ khó.                                                                                                                        |
| `difficulty.ambiguity`        |               | Mức mơ hồ của yêu cầu.                                                                                                                  |
| `difficulty.stakeholders`     |               | Số bên liên quan.                                                                                                                       |
| `difficulty.missing_info`     |               | Mức thiếu thông tin.                                                                                                                    |
| `difficulty.time_pressure`    |               | Áp lực thời gian.                                                                                                                       |
| `honest_detail`               |               | Chi tiết thật của nghề được lồng vào màn.                                                                                               |
| `ambient_min_points`          |               | Điểm tối thiểu giữa hai câu nền.                                                                                                        |
| `wait_window`                 |               | Khoảng chờ để NPC nhắc.                                                                                                                 |
| `review_max`                  |               | Số câu nhìn lại tối đa.                                                                                                                 |
| `promise_reminders`           | nhiều giá trị | Cách nhắc lời hứa.                                                                                                                      |
| `promise_events`              | nhiều giá trị | Sự kiện sinh ra từ lời hứa.                                                                                                             |
| `ot_offers`                   | nhiều giá trị | Lời mời tăng ca trong màn.                                                                                                              |
| `sidequest_hooks`             | nhiều giá trị | Móc mời sang nhiệm vụ phụ.                                                                                                              |
| `house_rules`                 | nhiều giá trị | Luật riêng của màn.                                                                                                                     |
| `calendar`                    |               | Dịp lễ hoặc mốc lịch trong màn.                                                                                                         |
| `health_cost_override`        | ghép          | Chi phí sức khoẻ riêng của màn, ghi đè giá trị của môi trường.                                                                          |
| `health_cost_override.value`  |               | Giá trị.                                                                                                                                |
| `health_cost_override.reason` |               | Lý do ghi đè.                                                                                                                           |
| `outcomes`                    | nhiều giá trị | Các kết cục có thể xảy ra; chưa chốt.                                                                                                   |
| `estimated_minutes`           | suy ra        | Thời lượng ước tính, suy ra.                                                                                                            |

##### `SCENARIO_SLOT` _(entity yếu)_

Chỗ nhân vật trong một màn. Phụ thuộc `SCENARIO`.

| Field              | Kiểu          | Ý nghĩa                                   |
| ------------------ | ------------- | ----------------------------------------- |
| `slot`             | khoá          | Mã chỗ.                                   |
| `name`             |               | Tên vai.                                  |
| `relation`         |               | Quan hệ với người chơi.                   |
| `source`           |               | Nhân vật thường trú hay khách.            |
| `fill`             |               | Nhân vật cố định hay chọn khi chơi.       |
| `want`             |               | Nhân vật muốn gì.                         |
| `pressure`         |               | Áp lực nhân vật đang chịu.                |
| `stance`           |               | Thái độ.                                  |
| `default_channel`  |               | Kênh liên lạc mặc định.                   |
| `disclosure_style` |               | Cách nhân vật tiết lộ thông tin.          |
| `voice`            |               | Giọng nói.                                |
| `approval_line`    |               | Câu duyệt khi người chơi xin phép.        |
| `present_at_end`   |               | Có mặt ở cuối màn hay không.              |
| `expertise`        | nhiều giá trị | Chuyên môn của nhân vật.                  |
| `beliefs`          | nhiều giá trị | Niềm tin của nhân vật và điều kiện để bỏ. |
| `concerns`         | nhiều giá trị | Khúc mắc cần được gỡ.                     |

##### `FACT` _(entity yếu)_

Một dữ kiện của màn và điều kiện mở khoá. Phụ thuộc `SCENARIO`.

| Field                  | Kiểu          | Ý nghĩa                        |
| ---------------------- | ------------- | ------------------------------ |
| `code`                 | khoá          | Mã dữ kiện.                    |
| `text`                 |               | Nội dung dữ kiện.              |
| `values`               | nhiều giá trị | Các giá trị có thể có.         |
| `visibility`           |               | Hiện ngay hay ẩn.              |
| `unlock`               | ghép          | Điều kiện mở khoá.             |
| `unlock.slot`          |               | Hỏi nhân vật nào.              |
| `unlock.question_kind` |               | Loại câu hỏi mở được dữ kiện.  |
| `form`                 | nhiều giá trị | Dạng trình bày.                |
| `layer`                |               | Lớp thông tin (nông hay sâu).  |
| `required`             |               | Có bắt buộc phải hỏi ra không. |

##### `ARTEFACT` _(entity yếu)_

Một tài liệu, email hoặc form trong màn. Phụ thuộc `SCENARIO`.

| Field             | Kiểu          | Ý nghĩa                          |
| ----------------- | ------------- | -------------------------------- |
| `code`            | khoá          | Mã tài liệu.                     |
| `kind`            |               | Loại tài liệu.                   |
| `title`           |               | Tiêu đề.                         |
| `body`            |               | Nội dung.                        |
| `visibility`      |               | Hiện ngay hay ẩn.                |
| `fields`          | nhiều giá trị | Các trường người chơi phải điền. |
| `ticks`           | nhiều giá trị | Các ô tick.                      |
| `tick_flags`      | nhiều giá trị | Cờ bật khi tick ô nào.           |
| `branches`        | nhiều giá trị | Nhánh phản hồi theo điều kiện.   |
| `channel_members` | nhiều giá trị | Thành viên của kênh chat.        |

##### `ACTION` _(entity yếu)_

Một việc tốn điểm thời gian (hỏi, kiểm tra, mở tài liệu). Phụ thuộc `SCENARIO`.

| Field            | Kiểu          | Ý nghĩa                     |
| ---------------- | ------------- | --------------------------- |
| `key`            | khoá          | Khoá việc.                  |
| `label`          |               | Nhãn hiển thị.              |
| `kind`           |               | Loại việc.                  |
| `points`         |               | Điểm thời gian tiêu tốn.    |
| `free_on_repeat` |               | Làm lại có miễn điểm không. |
| `evidence`       |               | Bằng chứng sinh ra.         |
| `requires_all`   | nhiều giá trị | Điều kiện phải đủ tất cả.   |
| `requires_none`  | nhiều giá trị | Điều kiện không được có.    |

##### `TIMELINE_EVENT` _(entity yếu)_

Sự kiện theo mốc thời gian trong truyện. Phụ thuộc `SCENARIO`.

| Field  | Kiểu | Ý nghĩa               |
| ------ | ---- | --------------------- |
| `at`   | khoá | Mốc thời gian (khoá). |
| `kind` |      | Im lặng hay vào cảnh. |
| `text` |      | Nội dung.             |

##### `AMBIENT` _(entity yếu)_

Câu nền chèn khi nhân vật chờ. Phụ thuộc `SCENARIO`.

| Field    | Kiểu | Ý nghĩa                 |
| -------- | ---- | ----------------------- |
| `seq`    | khoá | Thứ tự.                 |
| `text`   |      | Nội dung.               |
| `before` |      | Chỉ dùng trước mốc này. |
| `after`  |      | Chỉ dùng sau mốc này.   |

##### `STORY_FLAG` _(entity yếu)_

Cờ truyện. Ý nghĩa nằm ở nơi bật (`*_SETS_FLAG`) và nơi đọc (`*_READS_FLAG`). Phụ thuộc `SCENARIO`.

| Field  | Kiểu | Ý nghĩa |
| ------ | ---- | ------- |
| `code` | khoá | Tên cờ. |

##### `CHECK` _(entity yếu)_

Câu hỏi có/không về lời người chơi (D-129). Phụ thuộc `SCENARIO`.

| Field                | Kiểu | Ý nghĩa                         |
| -------------------- | ---- | ------------------------------- |
| `code`               | khoá | Mã câu hỏi.                     |
| `question`           |      | Nội dung câu hỏi.               |
| `in_channel`         |      | Kiểm trong kênh nào.            |
| `realtime`           |      | Kiểm ngay hay để cuối.          |
| `extract`            | ghép | Thông tin cần trích.            |
| `extract.fields`     |      | Các trường cần trích.           |
| `extract.promise_to` |      | Lời hứa được ghi nhận cho ai.   |
| `on_yes`             |      | Việc làm nếu câu trả lời là có. |

##### `NODE` _(entity yếu)_

Nút quyết định của màn, theo mô hình nút (D-128). Phụ thuộc `SCENARIO`.

| Field                      | Kiểu          | Ý nghĩa                                                     |
| -------------------------- | ------------- | ----------------------------------------------------------- |
| `code`                     | khoá          | Mã nút.                                                     |
| `seq`                      |               | Thứ tự.                                                     |
| `kind`                     |               | Nút mở, giữa hay cuối.                                      |
| `points`                   |               | Điểm thời gian của nút.                                     |
| `channel`                  |               | Kênh.                                                       |
| `format`                   |               | Dạng câu hỏi (một trong 9 dạng, D-80).                      |
| `prompt`                   |               | Câu dẫn.                                                    |
| `time_limit_seconds`       |               | Giới hạn thời gian (giây).                                  |
| `riasec_axis`              |               | Trục RIASEC mà lần chạm hứng thú ở nút này ghi lại (D-106). |
| `trigger`                  | ghép          | Khi nào nút xuất hiện.                                      |
| `trigger.type`             |               | Loại kích hoạt.                                             |
| `trigger.at`               |               | Mốc kích hoạt.                                              |
| `trigger.fallback_at`      |               | Mốc dự phòng.                                               |
| `trigger.action`           |               | Hành động kích hoạt.                                        |
| `core`                     |               | Nội dung cốt lõi của nút.                                   |
| `adapt`                    | nhiều giá trị | Nội dung thích nghi theo cờ.                                |
| `absorb_if`                |               | Điều kiện để nút này được gộp vào nút khác.                 |
| `assumes`                  | nhiều giá trị | Các giả định về trạng thái trước khi vào nút.               |
| `closing`                  | ghép          | Cách đóng nút.                                              |
| `closing.approve_beats`    |               | Nhịp duyệt.                                                 |
| `closing.approve_event`    |               | Sự kiện duyệt.                                              |
| `closing.concern`          |               | Khúc mắc còn lại.                                           |
| `closing.defer_hint`       |               | Gợi ý hoãn.                                                 |
| `timeout`                  | ghép          | Xử lý khi hết giờ.                                          |
| `timeout.reaction`         |               | Phản ứng.                                                   |
| `timeout.sets`             |               | Cờ bật khi hết giờ.                                         |
| `reaction_beats`           |               | Các nhịp phản ứng của NPC.                                  |
| `reaction_ai_beats`        |               | Nhịp phản ứng do AI sinh.                                   |
| `free_turn_after_reaction` |               | Cho người chơi một lượt tự do sau phản ứng.                 |
| `if_unreached`             |               | Xử lý nếu nút không được tới.                               |
| `probe`                    | ghép          | Câu đào sâu.                                                |
| `probe.by`                 |               | Ai hỏi.                                                     |
| `probe.direction`          |               | Hướng đào.                                                  |
| `probe.hooks`              |               | Các móc đào sâu.                                            |

##### `OPTION` _(entity yếu)_

Một phương án của nút trắc nghiệm. Phụ thuộc `NODE`.

| Field             | Kiểu | Ý nghĩa                             |
| ----------------- | ---- | ----------------------------------- |
| `key`             | khoá | Khoá phương án.                     |
| `seq`             |      | Thứ tự.                             |
| `text`            |      | Nội dung.                           |
| `must_not`        |      | Phương án không được chọn.          |
| `is_harmful`      |      | Phương án có hại.                   |
| `reaction`        |      | Phản ứng của NPC.                   |
| `promise`         | ghép | Lời hứa đi kèm.                     |
| `promise.at`      |      | Thời điểm hứa.                      |
| `promise.channel` |      | Kênh hứa.                           |
| `promise.to`      |      | Hứa với ai.                         |
| `consensus_rank`  |      | Thứ hạng đồng thuận của chuyên gia. |

##### `REVIEW_PROBE` _(entity yếu)_

Câu hỏi ở bước "Nhìn lại ca". Phụ thuộc `SCENARIO`.

| Field               | Kiểu | Ý nghĩa                     |
| ------------------- | ---- | --------------------------- |
| `id`                | khoá | Mã câu.                     |
| `condition`         |      | Điều kiện để hỏi.           |
| `channel`           |      | Kênh.                       |
| `hook`              |      | Câu mở.                     |
| `when_promise_open` |      | Chỉ hỏi khi lời hứa còn mở. |

##### `OBSERVED_ITEM` _(entity yếu)_

Mục kỹ năng mềm mà màn này quan sát (3–6 mục). Phụ thuộc `SCENARIO`.

| Field            | Kiểu          | Ý nghĩa              |
| ---------------- | ------------- | -------------------- |
| `signs`          | nhiều giá trị | Dấu hiệu cần thấy.   |
| `includes_phase` |               | Có tính cả pha cuối. |

##### `REFERENCE_ANSWER`

Câu trả lời mẫu của chuyên gia, làm few-shot cho AI-5 (FR-24).

| Field                | Kiểu | Ý nghĩa                                |
| -------------------- | ---- | -------------------------------------- |
| `id`                 | khoá | Mã câu mẫu.                            |
| `text`               |      | Nội dung.                              |
| `difficulty_stratum` |      | Tầng độ khó.                           |
| `source`             |      | Nguồn (chuyên gia hay chọn từ triage). |
| `in_regression_set`  |      | Thuộc bộ kiểm hồi quy.                 |
| `status`             |      | Trạng thái.                            |

#### Relationship (44)

| Quan hệ              | Nối                                                   | Cách lưu                                                | Ý nghĩa                                                                   |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `HAS_SLOT`           | `SCENARIO` (1) — `SCENARIO_SLOT` (2–6, bắt buộc)      | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có 2–6 chỗ nhân vật.                                                  |
| `HAS_FACT`           | `SCENARIO` (1) — `FACT` (N, bắt buộc)                 | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các dữ kiện.                                                       |
| `HAS_ARTEFACT`       | `SCENARIO` (1) — `ARTEFACT` (N, bắt buộc)             | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các tài liệu.                                                      |
| `HAS_ACTION`         | `SCENARIO` (1) — `ACTION` (N, bắt buộc)               | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các việc tốn điểm.                                                 |
| `HAS_TIMELINE`       | `SCENARIO` (1) — `TIMELINE_EVENT` (N, bắt buộc)       | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các sự kiện theo mốc.                                              |
| `HAS_AMBIENT`        | `SCENARIO` (1) — `AMBIENT` (N, bắt buộc)              | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các câu nền.                                                       |
| `HAS_FLAG`           | `SCENARIO` (1) — `STORY_FLAG` (N, bắt buộc)           | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các cờ truyện.                                                     |
| `HAS_CHECK`          | `SCENARIO` (1) — `CHECK` (N, bắt buộc)                | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các câu hỏi có/không.                                              |
| `HAS_NODE`           | `SCENARIO` (1) — `NODE` (N, bắt buộc)                 | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các nút quyết định.                                                |
| `HAS_REVIEW_PROBE`   | `SCENARIO` (1) — `REVIEW_PROBE` (N, bắt buộc)         | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các câu nhìn lại ca.                                               |
| `HAS_OBSERVED_ITEM`  | `SCENARIO` (1) — `OBSERVED_ITEM` (3–6, bắt buộc)      | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn quan sát 3–6 mục kỹ năng.                                             |
| `FOR_LEVEL`          | `SCENARIO` (N, bắt buộc) — `OCCUPATION_LEVEL` (1)     | Cột tham chiếu                                          | Màn thuộc một cấp.                                                        |
| `PERFORMS_TASK`      | `SCENARIO` (N, bắt buộc) — `LEVEL_TASK` (1)           | Cột tham chiếu                                          | Màn thực hiện một việc của cấp (có thể việc của cấp khác).                |
| `FOCUSES_ON`         | `SCENARIO` (1–2, bắt buộc) — `KEYWORD` (N)            | Bảng nối                                                | Màn có 1–2 keyword trọng tâm.                                             |
| `FITS`               | `SCENARIO` (M) — `WORK_ENVIRONMENT` (N)               | Bảng nối                                                | Màn hợp với môi trường làm việc nào.                                      |
| `AUTHORS`            | `STAFF_MEMBER` (1) — `SCENARIO` (N, bắt buộc)         | Cột tham chiếu                                          | Nhân sự là tác giả của màn.                                               |
| `FILLED_BY`          | `SCENARIO_SLOT` (N) — `NPC_CARD` (0–1)                | Cột tham chiếu                                          | Chỗ nhân vật trong màn được gán cố định cho một nhân vật tarot.           |
| `IS_RESIDENT`        | `SCENARIO_SLOT` (N) — `RESIDENT_SLOT` (0–1)           | Cột tham chiếu                                          | Chỗ trong màn chính là một chỗ thường trú của gói.                        |
| `KNOWN_BY`           | `FACT` (M) — `SCENARIO_SLOT` (N)                      | Bảng nối                                                | Nhân vật nào biết dữ kiện nào.                                            |
| `UNLOCKED_BY`        | `FACT` (N) — `ARTEFACT` (0–1)                         | Cột tham chiếu                                          | Dữ kiện được mở khi xem một tài liệu.                                     |
| `RESERVED_FOR`       | `FACT` (N) — `NODE` (0–1)                             | Cột tham chiếu                                          | Dữ kiện dành cho một nút.                                                 |
| `UPDATES`            | `TIMELINE_EVENT` (N) — `FACT` (0–1)                   | Cột tham chiếu                                          | Sự kiện theo mốc làm đổi một dữ kiện.                                     |
| `TARGETS`            | `ACTION` (N) — `ARTEFACT` (0–1)                       | Cột tham chiếu                                          | Việc tốn điểm nhắm vào một tài liệu.                                      |
| `INVOLVES`           | `ACTION` (M) — `SCENARIO_SLOT` (N)                    | Bảng nối                                                | Việc tốn điểm liên quan nhân vật nào.                                     |
| `ACTION_SETS_FLAG`   | `ACTION` (M) — `STORY_FLAG` (N)                       | Bảng nối                                                | Hành động bật cờ truyện.                                                  |
| `OPTION_SETS_FLAG`   | `OPTION` (M) — `STORY_FLAG` (N)                       | Bảng nối                                                | Phương án bật cờ truyện.                                                  |
| `CHECK_SETS_FLAG`    | `CHECK` (M) — `STORY_FLAG` (N)                        | Bảng nối                                                | Câu hỏi có/không bật cờ truyện.                                           |
| `NODE_SETS_FLAG`     | `NODE` (M) — `STORY_FLAG` (N)                         | Bảng nối                                                | Nút (khi hết giờ) bật cờ truyện.                                          |
| `NODE_READS_FLAG`    | `NODE` (M) — `STORY_FLAG` (N)                         | Bảng nối                                                | Nút đọc cờ để thích nghi.                                                 |
| `PROBE_READS_FLAG`   | `REVIEW_PROBE` (M) — `STORY_FLAG` (N)                 | Bảng nối                                                | Câu nhìn lại đọc cờ để quyết định có hỏi.                                 |
| `CHECKS_ON_ARTEFACT` | `CHECK` (N) — `ARTEFACT` (0–1)                        | Cột tham chiếu                                          | Câu hỏi có/không kiểm trên một tài liệu.                                  |
| `CHECKS_ON_NODE`     | `CHECK` (N) — `NODE` (0–1)                            | Cột tham chiếu                                          | Câu hỏi có/không kiểm trên một nút.                                       |
| `IN_CONVERSATION`    | `CHECK` (M) — `SCENARIO_SLOT` (N)                     | Bảng nối                                                | Câu hỏi có/không áp dụng trong cuộc trò chuyện với ai.                    |
| `SPEAKS`             | `NODE` (N) — `SCENARIO_SLOT` (0–1)                    | Cột tham chiếu                                          | Nút do một nhân vật nói.                                                  |
| `USES_ARTEFACT`      | `NODE` (N) — `ARTEFACT` (0–1)                         | Cột tham chiếu                                          | Nút dùng một tài liệu làm sản phẩm.                                       |
| `RECHECKS`           | `NODE` (M) — `SCENARIO_SLOT` (N)                      | Bảng nối                                                | Nút kiểm lại hội thoại của những nhân vật nào.                            |
| `HAS_OPTION`         | `NODE` (1) — `OPTION` (N, bắt buộc)                   | Định danh (khoá của entity yếu gồm khoá của entity cha) | Nút có các phương án.                                                     |
| `SCORES`             | `OPTION` (M) — `SOFT_SKILL_ITEM` (N)                  | Bảng nối                                                | Hồ sơ điểm của phương án: chọn phương án này thì mục con nào đạt mức nào. |
| `ASKED_BY`           | `REVIEW_PROBE` (N) — `SCENARIO_SLOT` (1)              | Cột tham chiếu                                          | Câu nhìn lại do một nhân vật hỏi.                                         |
| `OBSERVES`           | `OBSERVED_ITEM` (N, bắt buộc) — `SOFT_SKILL_ITEM` (1) | Cột tham chiếu                                          | Mục quan sát trỏ tới một mục kỹ năng mềm.                                 |
| `EVIDENCED_AT`       | `OBSERVED_ITEM` (M) — `NODE` (N)                      | Bảng nối                                                | Mục quan sát lấy bằng chứng từ những nút nào.                             |
| `ANSWERS_NODE`       | `REFERENCE_ANSWER` (N, bắt buộc) — `NODE` (1)         | Cột tham chiếu                                          | Câu mẫu trả lời cho một nút.                                              |
| `WRITES_REF`         | `STAFF_MEMBER` (1) — `REFERENCE_ANSWER` (N)           | Cột tham chiếu                                          | Nhân sự viết câu mẫu.                                                     |
| `REF_GRADE`          | `REFERENCE_ANSWER` (M) — `SOFT_SKILL_ITEM` (N)        | Bảng nối                                                | Câu mẫu đạt mức nào ở mục con nào.                                        |

Field riêng của quan hệ:

| Quan hệ     | Field   | Kiểu | Ý nghĩa              |
| ----------- | ------- | ---- | -------------------- |
| `SCORES`    | `level` |      | Mức 0, 1 hoặc 2.     |
| `REF_GRADE` | `level` |      | Mức 0, 1 hoặc 2.     |
| `REF_GRADE` | `flags` |      | Cờ hành vi kèm theo. |

---

## ERD-04 · Soạn, duyệt, trình bày, play-test, xuất bản

Sơ đồ: [ERD-04a_InterviewAndDrafting.puml](ERD-04a_InterviewAndDrafting.puml), [ERD-04b_ReviewAndLifecycle.puml](ERD-04b_ReviewAndLifecycle.puml), [ERD-04c_PresentationAndRelease.puml](ERD-04c_PresentationAndRelease.puml)

### F. Soạn bằng AI, duyệt, trình bày, play-test, xuất bản

#### Entity (18)

##### `TOPIC_GUIDE`

Bộ chủ đề hướng dẫn phỏng vấn DE, có version.

| Field        | Kiểu | Ý nghĩa        |
| ------------ | ---- | -------------- |
| `version`    | khoá | Số phiên bản.  |
| `content`    |      | Nội dung.      |
| `created_at` |      | Thời điểm tạo. |

##### `EXPERT_INTERVIEW`

Một vòng AI-1 phỏng vấn DE (D-90, D-99).

| Field            | Kiểu          | Ý nghĩa                           |
| ---------------- | ------------- | --------------------------------- |
| `id`             | khoá          | Mã vòng.                          |
| `round_no`       |               | Số vòng.                          |
| `status`         |               | Trạng thái.                       |
| `summary`        |               | Tóm tắt.                          |
| `confirmed_at`   |               | Lúc DE xác nhận tóm tắt.          |
| `field_coverage` | nhiều giá trị | Những trường của màn đã được phủ. |

##### `INTERVIEW_TURN` _(entity yếu)_

Một lượt hỏi–đáp trong phỏng vấn. Phụ thuộc `EXPERT_INTERVIEW`.

| Field             | Kiểu          | Ý nghĩa                             |
| ----------------- | ------------- | ----------------------------------- |
| `seq`             | khoá          | Thứ tự.                             |
| `role`            |               | Ai nói (AI hay DE).                 |
| `text`            |               | Nội dung.                           |
| `at`              |               | Thời điểm.                          |
| `seed_field_refs` | nhiều giá trị | Các trường seed mà lượt này đã phủ. |

##### `GENERATION_RUN`

Một lần AI-2 sinh bản nháp một phần của màn.

| Field              | Kiểu          | Ý nghĩa                                     |
| ------------------ | ------------- | ------------------------------------------- |
| `id`               | khoá          | Mã lần sinh.                                |
| `section`          |               | Phần được sinh.                             |
| `input`            |               | Đầu vào.                                    |
| `output`           |               | Kết quả.                                    |
| `field_provenance` | nhiều giá trị | Nguồn gốc từng trường (AI sinh hay DE sửa). |
| `check_result`     | nhiều giá trị | Kết quả kiểm bằng `ContentValidator`.       |
| `revision_count`   |               | Số lần sửa.                                 |
| `de_edits`         |               | Các chỉnh sửa của DE.                       |
| `status`           |               | Trạng thái.                                 |
| `created_at`       |               | Thời điểm tạo.                              |

##### `CRITERIA_VERSION` _(entity yếu)_

Bộ tiêu chí duyệt của một nghề, có version (FR-32, DR-19). Phụ thuộc `OCCUPATION`.

| Field        | Kiểu | Ý nghĩa        |
| ------------ | ---- | -------------- |
| `version_no` | khoá | Số phiên bản.  |
| `created_at` |      | Thời điểm tạo. |

##### `REVIEW_CRITERION` _(entity yếu)_

Một tiêu chí trong bộ tiêu chí. Phụ thuộc `CRITERIA_VERSION`.

| Field  | Kiểu | Ý nghĩa            |
| ------ | ---- | ------------------ |
| `seq`  | khoá | Thứ tự.            |
| `text` |      | Nội dung tiêu chí. |

##### `REVIEW_ASSIGNMENT`

Việc giao duyệt một màn hoặc một gói cho DE.

| Field         | Kiểu | Ý nghĩa       |
| ------------- | ---- | ------------- |
| `id`          | khoá | Mã giao việc. |
| `deadline`    |      | Hạn duyệt.    |
| `status`      |      | Trạng thái.   |
| `assigned_at` |      | Lúc giao.     |

##### `REVIEW`

Kết quả một lần duyệt.

| Field        | Kiểu | Ý nghĩa                          |
| ------------ | ---- | -------------------------------- |
| `id`         | khoá | Mã.                              |
| `decision`   |      | Quyết định (duyệt hoặc trả lại). |
| `comment`    |      | Nhận xét chung.                  |
| `decided_at` |      | Lúc quyết định.                  |

##### `REVIEW_COMMENT` _(entity yếu)_

Bình luận theo từng trường. Phụ thuộc `REVIEW`.

| Field          | Kiểu | Ý nghĩa                |
| -------------- | ---- | ---------------------- |
| `seq`          | khoá | Thứ tự.                |
| `target_field` |      | Trường được bình luận. |
| `text`         |      | Nội dung.              |

##### `ASSET`

Một ảnh hoặc tệp media của nội dung.

| Field                   | Kiểu          | Ý nghĩa                      |
| ----------------------- | ------------- | ---------------------------- |
| `id`                    | khoá          | Mã.                          |
| `kind`                  |               | Loại asset.                  |
| `storage_key`           |               | Khoá lưu trong kho tệp.      |
| `source`                |               | Nguồn (tải lên hay AI sinh). |
| `ai_prompt`             |               | Prompt nếu do AI sinh.       |
| `bias_check`            | ghép          | Kết quả kiểm thiên lệch.     |
| `bias_check.status`     |               | Trạng thái kiểm.             |
| `bias_check.checked_at` |               | Lúc kiểm.                    |
| `batch_no`              |               | Số lô sản xuất.              |
| `qa_checklist`          | nhiều giá trị | Checklist QA đã làm.         |

##### `PRESENTATION`

Bản trình bày của một màn (cảnh, ảnh).

| Field        | Kiểu | Ý nghĩa     |
| ------------ | ---- | ----------- |
| `id`         | khoá | Mã.         |
| `version_no` |      | Phiên bản.  |
| `status`     |      | Trạng thái. |

##### `PRESENTATION_SCENE` _(entity yếu)_

Một cảnh trong bản trình bày, gắn vào một nút. Phụ thuộc `PRESENTATION`.

| Field      | Kiểu | Ý nghĩa                        |
| ---------- | ---- | ------------------------------ |
| `position` | khoá | Vị trí cảnh (mã nút hoặc pha). |

##### `SCENARIO_BUILD`

Bản nháp đã dựng từ nội dung và trình bày, dùng để play-test.

| Field      | Kiểu | Ý nghĩa           |
| ---------- | ---- | ----------------- |
| `id`       | khoá | Mã bản dựng.      |
| `content`  |      | Nội dung đã dựng. |
| `built_at` |      | Lúc dựng.         |

##### `PLAYTEST_FINDING`

Lỗi hoặc nhận xét ghi lại khi play-test.

| Field        | Kiểu | Ý nghĩa                        |
| ------------ | ---- | ------------------------------ |
| `id`         | khoá | Mã.                            |
| `kind`       |      | Lỗi hiển thị hay lỗi nội dung. |
| `text`       |      | Mô tả.                         |
| `created_at` |      | Thời điểm tạo.                 |

##### `TRIAGE_ITEM`

Một lượt chơi được AI-3 chọn để người xem lại (D-91).

| Field               | Kiểu          | Ý nghĩa                                        |
| ------------------- | ------------- | ---------------------------------------------- |
| `id`                | khoá          | Mã.                                            |
| `selection`         |               | Được chọn vì bị gắn cờ hay do kiểm ngẫu nhiên. |
| `signals`           | nhiều giá trị | Các tín hiệu khiến lượt bị chọn.               |
| `threshold_version` |               | Phiên bản ngưỡng đã dùng.                      |
| `decision`          |               | Quyết định của người xem.                      |
| `reviewed_at`       |               | Lúc xem xong.                                  |

##### `SCENARIO_RELEASE` _(entity yếu)_

Bản đã xuất bản của màn, bất biến, có version. Phụ thuộc `SCENARIO`.

| Field          | Kiểu | Ý nghĩa             |
| -------------- | ---- | ------------------- |
| `version_no`   | khoá | Số phiên bản.       |
| `content`      |      | Nội dung đóng băng. |
| `effective_at` |      | Lúc có hiệu lực.    |
| `release_note` |      | Ghi chú phát hành.  |
| `published_at` |      | Lúc xuất bản.       |

##### `REVALIDATION_REQUEST`

Yêu cầu thẩm định lại một bản đã xuất bản (FR-27, BR-15).

| Field         | Kiểu | Ý nghĩa         |
| ------------- | ---- | --------------- |
| `id`          | khoá | Mã.             |
| `reason`      |      | Lý do.          |
| `due_at`      |      | Hạn.            |
| `result`      |      | Kết quả.        |
| `resolved_at` |      | Lúc xử lý xong. |

##### `LIFECYCLE_LOG`

Nhật ký chuyển trạng thái của màn, gói, nghề, chương NPC (SM-01, DR-13). Ghi cùng transaction với việc chuyển.

| Field         | Kiểu          | Ý nghĩa               |
| ------------- | ------------- | --------------------- |
| `id`          | khoá          | Mã.                   |
| `from_status` |               | Trạng thái trước.     |
| `to_status`   |               | Trạng thái sau.       |
| `reason`      |               | Lý do.                |
| `checks`      | nhiều giá trị | Các kiểm tra đã chạy. |
| `at`          |               | Thời điểm.            |

#### Relationship (41)

| Quan hệ                  | Nối                                                               | Cách lưu                                                | Ý nghĩa                                          |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| `INTERVIEWS`             | `STAFF_MEMBER` (1) — `EXPERT_INTERVIEW` (N, bắt buộc)             | Cột tham chiếu                                          | Nhân sự (DE) được AI-1 phỏng vấn.                |
| `INTERVIEW_FOR_SCENARIO` | `EXPERT_INTERVIEW` (N) — `SCENARIO` (0–1)                         | Cột tham chiếu                                          | Vòng phỏng vấn phục vụ một màn.                  |
| `INTERVIEW_FOR_PACK`     | `EXPERT_INTERVIEW` (N) — `LEVEL_PACK` (0–1)                       | Cột tham chiếu                                          | Vòng phỏng vấn phục vụ một gói cấp.              |
| `FOLLOWS_GUIDE`          | `EXPERT_INTERVIEW` (N, bắt buộc) — `TOPIC_GUIDE` (1)              | Cột tham chiếu                                          | Vòng phỏng vấn theo bộ chủ đề nào.               |
| `HAS_TURN`               | `EXPERT_INTERVIEW` (1) — `INTERVIEW_TURN` (N, bắt buộc)           | Định danh (khoá của entity yếu gồm khoá của entity cha) | Vòng phỏng vấn có các lượt hỏi–đáp.              |
| `GENERATES`              | `GENERATION_RUN` (N, bắt buộc) — `SCENARIO` (1)                   | Cột tham chiếu                                          | Lần sinh bản nháp thuộc một màn.                 |
| `RUN_BY_JOB`             | `GENERATION_RUN` (1) — `AI_JOB` (1)                               | Cột tham chiếu                                          | Lần sinh chạy bởi một AI_JOB.                    |
| `DEFINES`                | `OCCUPATION` (1) — `CRITERIA_VERSION` (N)                         | Định danh (khoá của entity yếu gồm khoá của entity cha) | Nghề có các bộ tiêu chí duyệt.                   |
| `HAS_CRITERION`          | `CRITERIA_VERSION` (1) — `REVIEW_CRITERION` (N, bắt buộc)         | Định danh (khoá của entity yếu gồm khoá của entity cha) | Bộ tiêu chí có các tiêu chí.                     |
| `REVIEWS_SCENARIO`       | `REVIEW_ASSIGNMENT` (N, bắt buộc) — `SCENARIO` (0–1)              | Cột tham chiếu                                          | Việc duyệt nhắm vào một màn.                     |
| `REVIEWS_PACK`           | `REVIEW_ASSIGNMENT` (N, bắt buộc) — `LEVEL_PACK` (0–1)            | Cột tham chiếu                                          | Việc duyệt nhắm vào một gói cấp.                 |
| `REVIEWER`               | `REVIEW_ASSIGNMENT` (N, bắt buộc) — `STAFF_MEMBER` (1)            | Cột tham chiếu                                          | Người được giao duyệt.                           |
| `ASSIGNER`               | `REVIEW_ASSIGNMENT` (N, bắt buộc) — `STAFF_MEMBER` (1)            | Cột tham chiếu                                          | Người giao việc duyệt.                           |
| `REASSIGNS`              | `REVIEW_ASSIGNMENT` (0–1) — `REVIEW_ASSIGNMENT` (0–1)             | Cột tham chiếu                                          | Việc duyệt thay thế một việc duyệt trước.        |
| `DECIDES`                | `REVIEW_ASSIGNMENT` (1) — `REVIEW` (0–1, bắt buộc)                | Cột tham chiếu                                          | Việc duyệt cho ra tối đa một kết quả duyệt.      |
| `USES_CRITERIA`          | `REVIEW` (N, bắt buộc) — `CRITERIA_VERSION` (1)                   | Cột tham chiếu                                          | Kết quả duyệt dùng bộ tiêu chí nào.              |
| `ANSWERS_CRITERION`      | `REVIEW` (M) — `REVIEW_CRITERION` (N)                             | Bảng nối                                                | Kết quả duyệt trả lời từng tiêu chí.             |
| `HAS_COMMENT`            | `REVIEW` (1) — `REVIEW_COMMENT` (N)                               | Định danh (khoá của entity yếu gồm khoá của entity cha) | Kết quả duyệt có các bình luận.                  |
| `PRESENTS`               | `PRESENTATION` (N, bắt buộc) — `SCENARIO` (1)                     | Cột tham chiếu                                          | Bản trình bày thuộc một màn.                     |
| `HAS_SCENE`              | `PRESENTATION` (1) — `PRESENTATION_SCENE` (N, bắt buộc)           | Định danh (khoá của entity yếu gồm khoá của entity cha) | Bản trình bày có các cảnh.                       |
| `SCENE_AT`               | `PRESENTATION_SCENE` (N) — `NODE` (0–1)                           | Cột tham chiếu                                          | Cảnh gắn vào một nút.                            |
| `SCENE_ASSET`            | `PRESENTATION_SCENE` (N, bắt buộc) — `ASSET` (1)                  | Cột tham chiếu                                          | Cảnh dùng một asset.                             |
| `CHECKS_BIAS`            | `STAFF_MEMBER` (1) — `ASSET` (N)                                  | Cột tham chiếu                                          | Nhân sự kiểm thiên lệch của asset.               |
| `BUILDS`                 | `SCENARIO_BUILD` (N, bắt buộc) — `SCENARIO` (1)                   | Cột tham chiếu                                          | Bản dựng thuộc một màn.                          |
| `FROM_PRESENTATION`      | `SCENARIO_BUILD` (N, bắt buộc) — `PRESENTATION` (1)               | Cột tham chiếu                                          | Bản dựng dùng bản trình bày nào.                 |
| `BUILT_BY`               | `SCENARIO_BUILD` (N, bắt buộc) — `STAFF_MEMBER` (1)               | Cột tham chiếu                                          | Nhân sự dựng.                                    |
| `FINDING_ON`             | `PLAYTEST_FINDING` (N, bắt buộc) — `SCENARIO_BUILD` (1)           | Cột tham chiếu                                          | Phát hiện thuộc một bản dựng.                    |
| `FINDING_FROM`           | `PLAYTEST_FINDING` (N) — `SCENARIO_RUN` (0–1)                     | Cột tham chiếu                                          | Phát hiện sinh ra từ một lượt chơi.              |
| `REPORTS`                | `PLAYTEST_FINDING` (N, bắt buộc) — `STAFF_MEMBER` (1)             | Cột tham chiếu                                          | Nhân sự báo phát hiện.                           |
| `TRIAGES`                | `TRIAGE_ITEM` (N, bắt buộc) — `SCENARIO_RUN` (1)                  | Cột tham chiếu                                          | Mục triage chọn một lượt chơi.                   |
| `TRIAGED_BY`             | `TRIAGE_ITEM` (N) — `STAFF_MEMBER` (1)                            | Cột tham chiếu                                          | Nhân sự xem mục triage.                          |
| `RELEASES`               | `SCENARIO` (1) — `SCENARIO_RELEASE` (N, bắt buộc)                 | Định danh (khoá của entity yếu gồm khoá của entity cha) | Màn có các bản xuất bản.                         |
| `RELEASED_FROM`          | `SCENARIO_RELEASE` (1, bắt buộc) — `SCENARIO_BUILD` (1, bắt buộc) | Cột tham chiếu                                          | Bản xuất bản được tạo từ đúng một bản dựng.      |
| `PUBLISHES`              | `STAFF_MEMBER` (1) — `SCENARIO_RELEASE` (N, bắt buộc)             | Cột tham chiếu                                          | Nhân sự xuất bản.                                |
| `REVALIDATES`            | `REVALIDATION_REQUEST` (N, bắt buộc) — `SCENARIO_RELEASE` (1)     | Cột tham chiếu                                          | Yêu cầu thẩm định lại nhắm vào một bản xuất bản. |
| `REQUESTS_REVAL`         | `REVALIDATION_REQUEST` (N, bắt buộc) — `USER_ACCOUNT` (1)         | Cột tham chiếu                                          | Người yêu cầu thẩm định lại.                     |
| `LOGS_SCENARIO`          | `LIFECYCLE_LOG` (N) — `SCENARIO` (0–1)                            | Cột tham chiếu                                          | Nhật ký vòng đời của một màn.                    |
| `LOGS_PACK`              | `LIFECYCLE_LOG` (N) — `LEVEL_PACK` (0–1)                          | Cột tham chiếu                                          | Nhật ký vòng đời của một gói cấp.                |
| `LOGS_OCCUPATION`        | `LIFECYCLE_LOG` (N) — `OCCUPATION` (0–1)                          | Cột tham chiếu                                          | Nhật ký vòng đời của một nghề.                   |
| `LOGS_CHAPTER`           | `LIFECYCLE_LOG` (N) — `NPC_CHAPTER` (0–1)                         | Cột tham chiếu                                          | Nhật ký vòng đời của một chương NPC.             |
| `ACTOR`                  | `LIFECYCLE_LOG` (N, bắt buộc) — `USER_ACCOUNT` (1)                | Cột tham chiếu                                          | Người thực hiện chuyển trạng thái.               |

Field riêng của quan hệ:

| Quan hệ             | Field    | Kiểu | Ý nghĩa             |
| ------------------- | -------- | ---- | ------------------- |
| `ANSWERS_CRITERION` | `answer` |      | Đạt hoặc không đạt. |
| `ANSWERS_CRITERION` | `note`   |      | Ghi chú.            |

---

## ERD-05 · NPC, nhiệm vụ phụ, kinh tế, sức khoẻ, lịch

Sơ đồ: [ERD-05a_NpcCards.puml](ERD-05a_NpcCards.puml), [ERD-05b_NpcChaptersAndSideQuests.puml](ERD-05b_NpcChaptersAndSideQuests.puml), [ERD-05c_Economy.puml](ERD-05c_Economy.puml), [ERD-05d_HealthAndLife.puml](ERD-05d_HealthAndLife.puml)

### G. NPC tarot, nhiệm vụ phụ, asset nhân vật

#### Entity (6)

##### `NPC_CARD`

Nhân vật tarot (22 lá).

| Field                         | Kiểu          | Ý nghĩa                              |
| ----------------------------- | ------------- | ------------------------------------ |
| `arcana_no`                   | khoá          | Số lá bài (khoá).                    |
| `code`                        |               | Mã.                                  |
| `version`                     |               | Phiên bản hồ sơ.                     |
| `full_name`                   |               | Họ tên đầy đủ.                       |
| `display_name`                |               | Tên hiển thị.                        |
| `gender`                      |               | Giới tính.                           |
| `age`                         |               | Tuổi.                                |
| `birthday`                    |               | Sinh nhật.                           |
| `colour_hex`                  |               | Màu của lá.                          |
| `short_meaning`               |               | Ý nghĩa ngắn của lá.                 |
| `meeting_place`               |               | Nơi gặp.                             |
| `short_desc`                  |               | Mô tả ngắn.                          |
| `face_anchor`                 |               | Mốc khuôn mặt để sinh ảnh nhất quán. |
| `profile_person`              |               | Hồ sơ công khai.                     |
| `profile_private`             |               | Hồ sơ riêng, chỉ mở khi thân hơn.    |
| `address_lock`                | ghép          | Luật xưng hô của nhân vật (NPC §4).  |
| `address_lock.exception`      |               | Trường hợp ngoại lệ.                 |
| `address_lock.self_ref`       |               | Cách nhân vật tự xưng.               |
| `address_lock.call_by_choice` |               | Gọi người chơi theo lựa chọn của họ. |
| `address_lock.off_hours`      |               | Xưng hô ngoài giờ làm.               |
| `address_lock.from_intimacy`  |               | Mức thân để đổi cách xưng hô.        |
| `address_lock.fallback_call`  |               | Cách gọi dự phòng.                   |
| `gifts`                       | ghép          | Quà thích và ghét.                   |
| `gifts.likes`                 |               | Quà thích.                           |
| `gifts.dislikes`              |               | Quà ghét.                            |
| `valid_roles`                 | nhiều giá trị | Các vai nhân vật có thể đóng.        |
| `unlock_route`                |               | Cách mở khoá nhân vật.               |
| `review_status`               |               | Trạng thái duyệt hồ sơ.              |
| `batch_done`                  |               | Đã xong lô sản xuất ảnh.             |

##### `NPC_ABILITY` _(entity yếu)_

Năng lực đặc biệt của nhân vật. Phụ thuộc `NPC_CARD`.

| Field           | Kiểu | Ý nghĩa                    |
| --------------- | ---- | -------------------------- |
| `code`          | khoá | Mã.                        |
| `tier`          |      | Bậc.                       |
| `description`   |      | Mô tả.                     |
| `notebook_text` |      | Chữ hiển thị trong sổ tay. |
| `effect`        |      | Hiệu ứng trong game.       |

##### `NPC_CHAPTER` _(entity yếu)_

Chương cốt truyện phụ của nhân vật, không chấm điểm (N5). Phụ thuộc `NPC_CARD`.

| Field                 | Kiểu | Ý nghĩa                            |
| --------------------- | ---- | ---------------------------------- |
| `chapter_no`          | khoá | Số chương.                         |
| `code`                |      | Mã.                                |
| `title`               |      | Tên chương.                        |
| `summary`             |      | Tóm tắt.                           |
| `climax`              |      | Cao trào.                          |
| `raises_to_level`     |      | Mức thân đạt được khi xong chương. |
| `unlock`              | ghép | Điều kiện mở chương.               |
| `unlock.min_intimacy` |      | Mức thân tối thiểu.                |
| `unlock.ticket`       |      | Vé cần có.                         |
| `unlock.milestone`    |      | Cột mốc cần có.                    |
| `unlock.min_health`   |      | Sức khoẻ tối thiểu.                |
| `xu_cost`             |      | Xu phải trả.                       |
| `fixed_bonus`         | ghép | Thưởng cố định.                    |
| `fixed_bonus.group`   |      | Nhóm kỹ năng nhận thưởng.          |
| `fixed_bonus.amount`  |      | Lượng thưởng.                      |
| `health_gain`         |      | Sức khoẻ nhận được.                |
| `status`              |      | Trạng thái duyệt.                  |

##### `SIDE_ACTIVITY`

Nhiệm vụ phụ ngoài tuyến cốt truyện (cà phê, đi ăn, vé, đi nhóm). Không lên mức thân.

| Field         | Kiểu | Ý nghĩa             |
| ------------- | ---- | ------------------- |
| `code`        | khoá | Mã.                 |
| `name`        |      | Tên.                |
| `kind`        |      | Loại hoạt động.     |
| `xu_cost`     |      | Xu phải trả.        |
| `health_gain` |      | Sức khoẻ nhận được. |
| `bonus`       |      | Thưởng.             |
| `unlock`      |      | Điều kiện mở.       |

##### `OUTFIT_GROUP` **[CAM]**

Nhóm trang phục; engine chọn theo phòng ban và loại công ty. Chờ nhóm duyệt.

| Field                 | Kiểu          | Ý nghĩa                                |
| --------------------- | ------------- | -------------------------------------- |
| `code`                | khoá          | Mã.                                    |
| `name`                |               | Tên nhóm.                              |
| `batch_no`            |               | Số lô sản xuất ảnh.                    |
| `components`          | ghép          | Thành phần.                            |
| `components.base`     |               | Phần nền.                              |
| `components.layer`    |               | Phần lớp áo.                           |
| `share`               |               | Tỉ lệ dùng chung giữa các nhân vật. †  |
| `has_colour_mask`     |               | Có mặt nạ màu để đổi màu theo công ty. |
| `accessories_default` | nhiều giá trị | Phụ kiện mặc định.                     |
| `accessories_alt`     | nhiều giá trị | Phụ kiện thay thế.                     |

##### `NPC_ASSET` _(entity yếu)_

Một ảnh của nhân vật theo loại. Phụ thuộc `NPC_CARD`.

| Field  | Kiểu | Ý nghĩa                                      |
| ------ | ---- | -------------------------------------------- |
| `kind` | khoá | Loại ảnh (biểu cảm, trang phục, cảnh riêng). |
| `code` |      | Mã ảnh.                                      |

#### Relationship (12)

| Quan hệ                   | Nối                                                                              | Cách lưu                                                | Ý nghĩa                                                 |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `RELATES_TO`              | `NPC_CARD` (M) — `NPC_CARD` (N)                                                  | Bảng nối                                                | Quan hệ giữa hai nhân vật tarot.                        |
| `HAS_ABILITY`             | `NPC_CARD` (1, bắt buộc) — `NPC_ABILITY` (1–2, bắt buộc)                         | Định danh (khoá của entity yếu gồm khoá của entity cha) | Nhân vật có 1–2 năng lực.                               |
| `HAS_CHAPTER`             | `NPC_CARD` (1, bắt buộc) — `NPC_CHAPTER` (3–3, bắt buộc)                         | Định danh (khoá của entity yếu gồm khoá của entity cha) | Nhân vật có đúng 3 chương.                              |
| `CHAPTER_OCCASION`        | `NPC_CHAPTER` (N) — `OCCASION` (0–1)                                             | Cột tham chiếu                                          | Chương gắn với một dịp.                                 |
| `ACTIVITY_WITH`           | `SIDE_ACTIVITY` (M) — `NPC_CARD` (N)                                             | Bảng nối                                                | Hoạt động phụ làm được với nhân vật nào.                |
| `NEEDS_TICKET`            | `SIDE_ACTIVITY` (N) — `SHOP_ITEM` (0–1)                                          | Cột tham chiếu                                          | Hoạt động phụ cần một món vé.                           |
| `HAS_ASSET`               | `NPC_CARD` (1) — `NPC_ASSET` (N, bắt buộc)                                       | Định danh (khoá của entity yếu gồm khoá của entity cha) | Nhân vật có các ảnh.                                    |
| `DEPICTS`                 | `NPC_ASSET` (N, bắt buộc) — `ASSET` (1)                                          | Cột tham chiếu                                          | Ảnh dùng một asset.                                     |
| `IN_OUTFIT`               | `NPC_ASSET` (N) — `OUTFIT_GROUP` (0–1)                                           | Cột tham chiếu                                          | Ảnh thuộc một nhóm trang phục.                          |
| `SCENE_OF`                | `NPC_ASSET` (N) — `NPC_CHAPTER` (0–1)                                            | Cột tham chiếu                                          | Ảnh là cảnh riêng của một chương.                       |
| `FALLS_BACK_TO` **[CAM]** | `OUTFIT_GROUP` (N) — `OUTFIT_GROUP` (0–1)                                        | Gộp vào entity (cột)                                    | Nhóm trang phục dự phòng cho nhóm khác.                 |
| `DRESSES` **[CAM]**       | `DEPARTMENT` (N, bắt buộc) — `COMPANY_TYPE` (0–1) — `OUTFIT_GROUP` (1, bắt buộc) | Bảng nối ba ngôi                                        | Phòng ban và loại công ty quy định nhóm trang phục nào. |

Field riêng của quan hệ:

| Quan hệ         | Field      | Kiểu | Ý nghĩa                 |
| --------------- | ---------- | ---- | ----------------------- |
| `RELATES_TO`    | `relation` |      | Loại quan hệ.           |
| `FALLS_BACK_TO` | `kind`     |      | Tạm thời hay vĩnh viễn. |

### K. Kinh tế, sức khoẻ, lịch, quan hệ NPC

#### Entity (10)

##### `XU_TRANSACTION`

Sổ giao dịch xu của người chơi, chỉ ghi thêm.

| Field             | Kiểu | Ý nghĩa                                                       |
| ----------------- | ---- | ------------------------------------------------------------- |
| `id`              | khoá | Mã.                                                           |
| `kind`            |      | Loại giao dịch; quyết định nguồn nào trong `TXN_*` được dùng. |
| `amount`          |      | Số xu (cộng hoặc trừ).                                        |
| `unit_price_paid` |      | Đơn giá đã trả lúc giao dịch.                                 |
| `created_at`      |      | Thời điểm tạo.                                                |

##### `SHOP_ITEM`

Một món hàng trong cửa hàng.

| Field         | Kiểu | Ý nghĩa                       |
| ------------- | ---- | ----------------------------- |
| `code`        | khoá | Mã.                           |
| `item_group`  |      | Nhóm món.                     |
| `name`        |      | Tên.                          |
| `price`       |      | Giá.                          |
| `price_unit`  |      | Đơn vị giá (xu hay X).        |
| `effect`      |      | Hiệu ứng.                     |
| `tier`        |      | Bậc.                          |
| `rarity`      |      | Độ hiếm.                      |
| `is_periodic` |      | Món theo chu kỳ.              |
| `period_gaps` |      | Chu kỳ tính theo khoảng nghỉ. |
| `decor_slot`  |      | Vị trí trang trí.             |
| `gift_group`  |      | Nhóm quà.                     |
| `is_active`   |      | Còn bán không.                |

##### `INVENTORY_ITEM`

Một món người chơi đang có.

| Field         | Kiểu | Ý nghĩa              |
| ------------- | ---- | -------------------- |
| `id`          | khoá | Mã.                  |
| `acquired_at` |      | Lúc có.              |
| `uses_left`   |      | Số lần dùng còn lại. |
| `used_at`     |      | Lúc dùng.            |

##### `HEALTH_CHANGE`

Mỗi lần sức khoẻ thay đổi.

| Field        | Kiểu | Ý nghĩa        |
| ------------ | ---- | -------------- |
| `id`         | khoá | Mã.            |
| `delta`      |      | Mức đổi.       |
| `reason`     |      | Lý do.         |
| `created_at` |      | Thời điểm tạo. |

##### `CAREER_HABIT` **[CAM]**

Thói quen nghề nghiệp người chơi có thể hình thành. Còn chờ chốt (S6).

| Field          | Kiểu | Ý nghĩa       |
| -------------- | ---- | ------------- |
| `code`         | khoá | Mã.           |
| `name`         |      | Tên.          |
| `good_side`    |      | Mặt tốt.      |
| `bad_side`     |      | Mặt xấu.      |
| `acquire_rule` |      | Luật có được. |

##### `OCCASION`

Dịp lễ hoặc sinh nhật trong lịch game.

| Field            | Kiểu | Ý nghĩa           |
| ---------------- | ---- | ----------------- |
| `code`           | khoá | Mã.               |
| `name`           |      | Tên.              |
| `kind`           |      | Loại.             |
| `month_day`      |      | Ngày trong năm.   |
| `repeats_yearly` |      | Lặp lại hằng năm. |

##### `GAP` _(entity yếu)_

Một khoảng nghỉ giữa các màn. Phụ thuộc `EXPLORER`.

| Field         | Kiểu   | Ý nghĩa                  |
| ------------- | ------ | ------------------------ |
| `seq`         | khoá   | Thứ tự khoảng nghỉ.      |
| `game_date`   |        | Ngày trong game.         |
| `slots_total` |        | Tổng số slot.            |
| `slots_used`  | suy ra | Số slot đã dùng, suy ra. |

##### `LIFE_MILESTONE` **[CAM]**

Cột mốc cuộc sống (17 mốc đã chốt). Giá và buff còn chờ chốt.

| Field            | Kiểu          | Ý nghĩa                  |
| ---------------- | ------------- | ------------------------ |
| `code`           | khoá          | Mã.                      |
| `domain`         |               | Lĩnh vực.                |
| `name`           |               | Tên.                     |
| `prerequisite`   | nhiều giá trị | Cột mốc phải có trước.   |
| `scene`          |               | Cảnh minh hoạ.           |
| `price_x`        |               | Giá tính theo X.         |
| `parent_price_x` |               | Giá của mốc cha.         |
| `cost_slots`     |               | Số slot nghỉ tốn.        |
| `branch_group`   |               | Nhóm nhánh loại trừ.     |
| `buff_kind`      |               | Loại buff.               |
| `buff_value`     |               | Giá trị buff.            |
| `locks_savings`  |               | Có khoá tiết kiệm không. |
| `repeat_yearly`  |               | Lặp lại hằng năm.        |

##### `EXPLORER_MILESTONE` _(entity yếu)_

Người chơi đã đạt hoặc mất cột mốc nào. Phụ thuộc `EXPLORER`.

| Field         | Kiểu | Ý nghĩa                    |
| ------------- | ---- | -------------------------- |
| `seq`         | khoá | Thứ tự.                    |
| `year`        |      | Năm trong game.            |
| `achieved_at` |      | Lúc đạt.                   |
| `lost_at`     |      | Lúc mất; rỗng nếu còn giữ. |

##### `INTIMACY_GAIN`

Mỗi lần tăng độ thân với một NPC.

| Field    | Kiểu | Ý nghĩa     |
| -------- | ---- | ----------- |
| `id`     | khoá | Mã.         |
| `source` |      | Nguồn tăng. |
| `points` |      | Số điểm.    |
| `at`     |      | Thời điểm.  |

#### Relationship (31)

| Quan hệ                  | Nối                                                       | Cách lưu                                                | Ý nghĩa                                                             |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| `TRANSACTS`              | `EXPLORER` (1) — `XU_TRANSACTION` (N, bắt buộc)           | Cột tham chiếu                                          | Người chơi có các giao dịch xu.                                     |
| `TXN_RUN`                | `XU_TRANSACTION` (N) — `SCENARIO_RUN` (0–1)               | Cột tham chiếu                                          | Giao dịch xu sinh từ một lượt chơi.                                 |
| `TXN_ITEM`               | `XU_TRANSACTION` (N) — `SHOP_ITEM` (0–1)                  | Cột tham chiếu                                          | Giao dịch xu sinh từ một món hàng.                                  |
| `TXN_MILESTONE`          | `XU_TRANSACTION` (N) — `LIFE_MILESTONE` (0–1)             | Cột tham chiếu                                          | Giao dịch xu sinh từ một cột mốc.                                   |
| `TXN_OCCASION`           | `XU_TRANSACTION` (N) — `OCCASION` (0–1)                   | Cột tham chiếu                                          | Giao dịch xu sinh từ một dịp.                                       |
| `ITEM_BUFFS`             | `SHOP_ITEM` (N) — `SOFT_SKILL_GROUP` (0–1)                | Cột tham chiếu                                          | Món hàng buff một nhóm kỹ năng.                                     |
| `ITEM_OCCASION`          | `SHOP_ITEM` (N) — `OCCASION` (0–1)                        | Cột tham chiếu                                          | Món hàng gắn với một dịp.                                           |
| `ITEM_NEEDS_CARD`        | `SHOP_ITEM` (N) — `NPC_CARD` (0–1)                        | Gộp vào entity (cột)                                    | Món hàng cần độ thân tối thiểu với một nhân vật.                    |
| `ITEM_NEEDS_MILESTONE`   | `SHOP_ITEM` (N) — `LIFE_MILESTONE` (0–1)                  | Cột tham chiếu                                          | Món hàng cần một cột mốc.                                           |
| `OWNS`                   | `EXPLORER` (1) — `INVENTORY_ITEM` (N, bắt buộc)           | Cột tham chiếu                                          | Người chơi sở hữu các món trong túi.                                |
| `INSTANCE_OF`            | `INVENTORY_ITEM` (N, bắt buộc) — `SHOP_ITEM` (1)          | Cột tham chiếu                                          | Món trong túi là bản của một món hàng.                              |
| `ITEM_TARGET_GROUP`      | `INVENTORY_ITEM` (N) — `SOFT_SKILL_GROUP` (0–1)           | Cột tham chiếu                                          | Món trong túi nhắm vào một nhóm kỹ năng.                            |
| `ITEM_TARGET_CARD`       | `INVENTORY_ITEM` (N) — `NPC_CARD` (0–1)                   | Cột tham chiếu                                          | Món trong túi dành tặng một nhân vật.                               |
| `FRAMED_FROM`            | `INVENTORY_ITEM` (N) — `SIDE_QUEST_RUN` (0–1)             | Cột tham chiếu                                          | Món trong túi được đóng khung từ một lượt nhiệm vụ phụ.             |
| `PLACES_DECOR` **[CAM]** | `EXPLORER` (1) — `INVENTORY_ITEM` (N)                     | Gộp vào entity (cột)                                    | Người chơi đặt món trang trí vào vị trí.                            |
| `HEALTH_OF`              | `HEALTH_CHANGE` (N, bắt buộc) — `EXPLORER` (1)            | Cột tham chiếu                                          | Thay đổi sức khoẻ thuộc một người chơi.                             |
| `HEALTH_IN_RUN`          | `HEALTH_CHANGE` (N) — `SCENARIO_RUN` (0–1)                | Cột tham chiếu                                          | Thay đổi sức khoẻ sinh từ một lượt chơi.                            |
| `WARNED` **[CAM]**       | `EXPLORER` (M) — `OCCUPATION` (N)                         | Bảng nối                                                | Đã hiện cảnh báo sức khoẻ (WHO/ILO) cho nghề nào, một lần mỗi nghề. |
| `HAS_HABIT`              | `EXPLORER` (0–3) — `CAREER_HABIT` (N)                     | Bảng nối                                                | Người chơi có tối đa 3 thói quen.                                   |
| `HAS_GAP`                | `EXPLORER` (1) — `GAP` (N, bắt buộc)                      | Định danh (khoá của entity yếu gồm khoá của entity cha) | Người chơi có các khoảng nghỉ.                                      |
| `GAP_OCCASION`           | `GAP` (M) — `OCCASION` (N)                                | Bảng nối                                                | Khoảng nghỉ trùng dịp nào.                                          |
| `MILESTONE_BUFFS`        | `LIFE_MILESTONE` (N) — `SOFT_SKILL_GROUP` (0–1, bắt buộc) | Cột tham chiếu                                          | Cột mốc buff một nhóm kỹ năng.                                      |
| `REACHES`                | `EXPLORER` (1) — `EXPLORER_MILESTONE` (N, bắt buộc)       | Định danh (khoá của entity yếu gồm khoá của entity cha) | Người chơi đạt các cột mốc.                                         |
| `MILESTONE_OF`           | `EXPLORER_MILESTONE` (N, bắt buộc) — `LIFE_MILESTONE` (1) | Cột tham chiếu                                          | Bản ghi đạt cột mốc ứng với cột mốc nào.                            |
| `MILESTONE_IN_GAP`       | `EXPLORER_MILESTONE` (N) — `GAP` (0–1)                    | Cột tham chiếu                                          | Cột mốc đạt trong khoảng nghỉ nào.                                  |
| `KNOWS`                  | `EXPLORER` (M, bắt buộc) — `NPC_CARD` (N)                 | Bảng nối                                                | Quan hệ người chơi với một nhân vật.                                |
| `GAIN_FOR`               | `INTIMACY_GAIN` (N, bắt buộc) — `EXPLORER` (1)            | Cột tham chiếu                                          | Lần tăng độ thân thuộc một người chơi.                              |
| `GAIN_CARD`              | `INTIMACY_GAIN` (N, bắt buộc) — `NPC_CARD` (1)            | Cột tham chiếu                                          | Lần tăng độ thân với một nhân vật.                                  |
| `GAIN_RUN`               | `INTIMACY_GAIN` (N) — `SCENARIO_RUN` (0–1)                | Cột tham chiếu                                          | Nguồn tăng là một lượt chơi.                                        |
| `GAIN_SIDE`              | `INTIMACY_GAIN` (N) — `SIDE_QUEST_RUN` (0–1)              | Cột tham chiếu                                          | Nguồn tăng là một lượt nhiệm vụ phụ.                                |
| `GAIN_ITEM`              | `INTIMACY_GAIN` (N) — `INVENTORY_ITEM` (0–1)              | Cột tham chiếu                                          | Nguồn tăng là một món quà.                                          |

Field riêng của quan hệ:

| Quan hệ           | Field             | Kiểu          | Ý nghĩa                    |
| ----------------- | ----------------- | ------------- | -------------------------- |
| `ITEM_NEEDS_CARD` | `min_intimacy`    |               | Độ thân tối thiểu.         |
| `PLACES_DECOR`    | `slot`            |               | Vị trí trang trí.          |
| `WARNED`          | `shown_at`        |               | Lúc hiện cảnh báo.         |
| `HAS_HABIT`       | `slot_no`         |               | Ô thói quen.               |
| `HAS_HABIT`       | `progress`        |               | Tiến độ hình thành.        |
| `HAS_HABIT`       | `acquired_at`     |               | Lúc có được.               |
| `KNOWS`           | `unlock_route`    |               | Cách mở khoá nhân vật.     |
| `KNOWS`           | `unlocked_at`     |               | Lúc mở khoá.               |
| `KNOWS`           | `met_at`          |               | Lúc gặp lần đầu.           |
| `KNOWS`           | `intimacy_points` |               | Điểm thân.                 |
| `KNOWS`           | `intimacy_level`  | suy ra        | Mức thân, suy ra.          |
| `KNOWS`           | `chapters_done`   | suy ra        | Số chương đã xong, suy ra. |
| `KNOWS`           | `promises`        | nhiều giá trị | Các lời hứa còn mở.        |

---

## ERD-06 · Hồ sơ, tiến trình, lượt chơi, chấm

Sơ đồ: [ERD-06a_ExplorerProfile.puml](ERD-06a_ExplorerProfile.puml), [ERD-06b_Progression.puml](ERD-06b_Progression.puml), [ERD-06c_Runs.puml](ERD-06c_Runs.puml), [ERD-06d_Grading.puml](ERD-06d_Grading.puml)

### H. Hồ sơ người chơi

#### Entity (10)

##### `GTKM_CARD`

Thẻ Get-to-know-me. Làm bộ thẻ này không gọi AI (FR-04).

| Field         | Kiểu | Ý nghĩa                                                                               |
| ------------- | ---- | ------------------------------------------------------------------------------------- |
| `code`        | khoá | Mã thẻ.                                                                               |
| `cluster_no`  |      | Số cụm thẻ.                                                                           |
| `text`        |      | Nội dung thẻ.                                                                         |
| `sort_order`  |      | Thứ tự hiển thị.                                                                      |
| `riasec_axis` |      | Trục RIASEC của thẻ. Một thẻ có hoặc trục RIASEC hoặc vùng sở thích, không có cả hai. |

##### `GTKM_ATTEMPT`

Một lần người chơi làm bộ thẻ.

| Field          | Kiểu | Ý nghĩa                 |
| -------------- | ---- | ----------------------- |
| `id`           | khoá | Mã lần làm.             |
| `is_current`   |      | Lần làm đang được dùng. |
| `started_at`   |      | Lúc bắt đầu.            |
| `completed_at` |      | Lúc xong.               |

##### `GOAL_QUESTION`

Câu hỏi mục tiêu (D-109).

| Field        | Kiểu | Ý nghĩa          |
| ------------ | ---- | ---------------- |
| `code`       | khoá | Mã câu hỏi.      |
| `text`       |      | Nội dung.        |
| `sort_order` |      | Thứ tự hiển thị. |

##### `GOAL_OPTION` _(entity yếu)_

Lựa chọn của câu hỏi mục tiêu. Phụ thuộc `GOAL_QUESTION`.

| Field  | Kiểu | Ý nghĩa   |
| ------ | ---- | --------- |
| `seq`  | khoá | Thứ tự.   |
| `text` |      | Nội dung. |

##### `EXPLORER_GOAL`

Mục tiêu hiện tại của người chơi (D-109).

| Field           | Kiểu | Ý nghĩa                                        |
| --------------- | ---- | ---------------------------------------------- |
| `id`            | khoá | Mã.                                            |
| `text`          |      | Nội dung mục tiêu.                             |
| `set_at`        |      | Lúc đặt.                                       |
| `baseline_tier` |      | Bậc kỹ năng lúc đặt mục tiêu, làm mốc so sánh. |
| `updated_at`    |      | Lúc sửa gần nhất.                              |
| `deleted_at`    |      | Lúc xoá mềm.                                   |

##### `HOBBY`

Sở thích để người chơi chọn.

| Field  | Kiểu | Ý nghĩa |
| ------ | ---- | ------- |
| `code` | khoá | Mã.     |
| `name` |      | Tên.    |

##### `DISTRESS_TERM` **[CAM]**

Từ khoá báo hiệu người chơi đang gặp khủng hoảng; do staff duy trì. Còn chờ chốt (H4).

| Field        | Kiểu | Ý nghĩa       |
| ------------ | ---- | ------------- |
| `term`       | khoá | Từ khoá.      |
| `updated_at` |      | Lúc cập nhật. |

##### `ZODIAC_SIGN`

Cung hoàng đạo và nhóm kỹ năng được tăng tốc (D-113).

| Field            | Kiểu          | Ý nghĩa                     |
| ---------------- | ------------- | --------------------------- |
| `code`           | khoá          | Mã cung.                    |
| `name`           |               | Tên cung.                   |
| `dates`          | ghép          | Khoảng ngày của cung.       |
| `dates.start_md` |               | Ngày bắt đầu (tháng–ngày).  |
| `dates.end_md`   |               | Ngày kết thúc (tháng–ngày). |
| `element`        |               | Nguyên tố.                  |
| `modality`       |               | Thể.                        |
| `rulers`         | nhiều giá trị | Các hành tinh cai quản.     |
| `motto`          |               | Châm ngôn.                  |
| `traits`         | nhiều giá trị | Đặc điểm.                   |
| `description`    |               | Mô tả.                      |
| `caution`        |               | Lưu ý.                      |

##### `ACHIEVEMENT` **[CAM]**

Thành tích (khoảng 100). Còn chờ chốt (D3).

| Field       | Kiểu | Ý nghĩa        |
| ----------- | ---- | -------------- |
| `code`      | khoá | Mã.            |
| `kind`      |      | Loại.          |
| `name`      |      | Tên.           |
| `condition` |      | Điều kiện đạt. |

##### `SUGGESTION_EVENT`

Một lần hệ thống gợi ý nghề cho người chơi (D-111).

| Field             | Kiểu | Ý nghĩa                                    |
| ----------------- | ---- | ------------------------------------------ |
| `id`              | khoá | Mã.                                        |
| `trigger_kind`    |      | Gợi ý được kích hoạt bởi sự kiện nào.      |
| `is_flat_profile` |      | Hồ sơ người chơi phẳng, chưa đủ phân biệt. |
| `created_at`      |      | Thời điểm tạo.                             |

#### Relationship (18)

| Quan hệ          | Nối                                                              | Cách lưu                                                | Ý nghĩa                                                |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `CARD_REGION`    | `GTKM_CARD` (N) — `INTEREST_REGION` (0–1)                        | Cột tham chiếu                                          | Thẻ Get-to-know-me thuộc một vùng sở thích.            |
| `TAKES`          | `EXPLORER` (1) — `GTKM_ATTEMPT` (N, bắt buộc)                    | Cột tham chiếu                                          | Người chơi làm các lần Get-to-know-me.                 |
| `ANSWERS_CARD`   | `GTKM_ATTEMPT` (18–18, bắt buộc) — `GTKM_CARD` (N)               | Bảng nối                                                | Câu trả lời từng thẻ trong một lần làm (đúng 18 thẻ).  |
| `INVITED`        | `EXPLORER` (M) — `OCCUPATION` (N)                                | Bảng nối                                                | Nghề nào đã mời người chơi (mỗi nghề một lần, D-107).  |
| `HAS_OPTION_Q`   | `GOAL_QUESTION` (1) — `GOAL_OPTION` (N, bắt buộc)                | Định danh (khoá của entity yếu gồm khoá của entity cha) | Câu hỏi mục tiêu có các lựa chọn.                      |
| `CHOOSES`        | `GTKM_ATTEMPT` (M) — `GOAL_OPTION` (N)                           | Bảng nối                                                | Lựa chọn mục tiêu trong một lần làm.                   |
| `OPTION_TARGETS` | `GOAL_OPTION` (N) — `SOFT_SKILL_GROUP` (0–1)                     | Cột tham chiếu                                          | Lựa chọn nhắm vào nhóm "Cần giỏi lên".                 |
| `SETS_GOAL`      | `EXPLORER` (1) — `EXPLORER_GOAL` (N, bắt buộc)                   | Cột tham chiếu                                          | Người chơi đặt các mục tiêu.                           |
| `GOAL_FROM`      | `EXPLORER_GOAL` (N) — `GTKM_ATTEMPT` (0–1)                       | Cột tham chiếu                                          | Mục tiêu được suy từ một lần làm.                      |
| `LIKES`          | `EXPLORER` (0–5) — `HOBBY` (N)                                   | Bảng nối                                                | Người chơi chọn tối đa 5 sở thích.                     |
| `MAINTAINS_TERM` | `STAFF_MEMBER` (1) — `DISTRESS_TERM` (N)                         | Cột tham chiếu                                          | Nhân sự duy trì các từ khoá báo hiệu khủng hoảng.      |
| `PROGRESSES`     | `EXPLORER` (7–7, bắt buộc) — `SOFT_SKILL_GROUP` (N, bắt buộc)    | Bảng nối                                                | Điểm tích luỹ của người chơi ở 7 nhóm kỹ năng (D-114). |
| `BOOSTS`         | `ZODIAC_SIGN` (2–2, bắt buộc) — `SOFT_SKILL_GROUP` (N, bắt buộc) | Bảng nối                                                | Cung hoàng đạo tăng tốc hai nhóm kỹ năng.              |
| `ACH_LEVEL`      | `ACHIEVEMENT` (N) — `OCCUPATION_LEVEL` (0–1)                     | Cột tham chiếu                                          | Thành tích gắn với một cấp.                            |
| `EARNS`          | `EXPLORER` (M) — `ACHIEVEMENT` (N)                               | Bảng nối                                                | Người chơi đạt thành tích.                             |
| `RECEIVES`       | `EXPLORER` (1) — `SUGGESTION_EVENT` (N, bắt buộc)                | Cột tham chiếu                                          | Người chơi nhận các lần gợi ý nghề.                    |
| `TRIGGERED_AT`   | `SUGGESTION_EVENT` (N) — `OCCUPATION_LEVEL` (0–1)                | Cột tham chiếu                                          | Lần gợi ý được kích hoạt ở một cấp.                    |
| `SUGGESTS`       | `SUGGESTION_EVENT` (0–9, bắt buộc) — `OCCUPATION` (N)            | Bảng nối                                                | Một lần gợi ý gồm tối đa 9 nghề.                       |

Field riêng của quan hệ:

| Quan hệ        | Field              | Kiểu   | Ý nghĩa                               |
| -------------- | ------------------ | ------ | ------------------------------------- |
| `ANSWERS_CARD` | `value`            |        | Giá trị trả lời.                      |
| `INVITED`      | `shown_at`         |        | Lúc hiện lời mời.                     |
| `INVITED`      | `response`         |        | Phản hồi của người chơi.              |
| `CHOOSES`      | `free_text`        |        | Câu tự do người chơi viết thêm.       |
| `PROGRESSES`   | `points`           |        | Điểm hiện có.                         |
| `PROGRESSES`   | `raw_points`       |        | Điểm gốc, chưa buff.                  |
| `PROGRESSES`   | `tier`             |        | Bậc kỹ năng hiện tại.                 |
| `PROGRESSES`   | `scored_scenarios` | suy ra | Số màn đã có điểm ở nhóm này, suy ra. |
| `BOOSTS`       | `rate`             |        | Tỉ lệ tăng tốc.                       |
| `EARNS`        | `achieved_at`      |        | Lúc đạt.                              |
| `EARNS`        | `pin_order`        |        | Thứ tự ghim (tối đa 3).               |
| `SUGGESTS`     | `box`              |        | Ô hiển thị.                           |
| `SUGGESTS`     | `rank`             |        | Thứ hạng.                             |
| `SUGGESTS`     | `grade`            |        | Điểm hoặc hạng phù hợp.               |
| `SUGGESTS`     | `reason`           |        | Lý do gợi ý.                          |
| `SUGGESTS`     | `is_exploration`   |        | Là gợi ý khám phá ngoài hồ sơ.        |
| `SUGGESTS`     | `clicked_at`       |        | Lúc người chơi bấm.                   |

### I. Tiến trình trong nghề

#### Entity (2)

##### `LEVEL_ENROLMENT`

Việc người chơi vào một cấp của một nghề. Là entity liên kết vì lượt chơi tham chiếu tới.

| Field            | Kiểu   | Ý nghĩa                                                  |
| ---------------- | ------ | -------------------------------------------------------- |
| `id`             | khoá   | Mã.                                                      |
| `round_no`       |        | Vòng chơi lại cấp này.                                   |
| `entry_route`    |        | Vào bằng `entry`, `jump` (nhảy nghề) hay `prerequisite`. |
| `company_choice` |        | Giữ công ty cũ (`stay`) hay bốc lại (`redraw`).          |
| `status`         |        | Trạng thái.                                              |
| `started_at`     |        | Lúc bắt đầu.                                             |
| `completed_at`   |        | Lúc xong.                                                |
| `onboard_kind`   | suy ra | Loại màn giới thiệu, suy ra từ đường vào.                |

##### `SCENARIO_BEST` _(entity yếu)_

Điểm cao nhất của người chơi trên một màn, theo từng nhóm kỹ năng (D-119, BR-11). Phụ thuộc cùng lúc explorer, màn và nhóm.

| Field             | Kiểu   | Ý nghĩa                            |
| ----------------- | ------ | ---------------------------------- |
| `best_points`     |        | Điểm cao nhất.                     |
| `completions`     |        | Số lần hoàn thành.                 |
| `replay_pay_rate` | suy ra | Tỉ lệ thưởng khi chơi lại, suy ra. |

#### Relationship (9)

| Quan hệ             | Nối                                                               | Cách lưu                                                | Ý nghĩa                                                    |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `ENROLS`            | `EXPLORER` (1) — `LEVEL_ENROLMENT` (N, bắt buộc)                  | Cột tham chiếu                                          | Người chơi vào các cấp.                                    |
| `IN_LEVEL`          | `LEVEL_ENROLMENT` (N, bắt buộc) — `OCCUPATION_LEVEL` (1)          | Cột tham chiếu                                          | Lần vào thuộc một cấp.                                     |
| `AT_COMPANY`        | `LEVEL_ENROLMENT` (N, bắt buộc) — `COMPANY` (1)                   | Cột tham chiếu                                          | Lần vào gắn với một công ty.                               |
| `CASTS` **[VANG]**  | `LEVEL_ENROLMENT` (M) — `NPC_CARD` (N)                            | Bảng nối                                                | Nhân vật được bốc cho lần vào cấp này.                     |
| `EARNED_KEYWORD`    | `EXPLORER` (M) — `KEYWORD` (N) — `OCCUPATION_LEVEL` (1, bắt buộc) | Bảng nối ba ngôi                                        | Người chơi đạt keyword nào, ở mức nào, từ cấp nào (D-124). |
| `BEST_FOR_EXPLORER` | `EXPLORER` (1) — `SCENARIO_BEST` (N, bắt buộc)                    | Định danh (khoá của entity yếu gồm khoá của entity cha) | Điểm cao nhất thuộc một người chơi (phần định danh).       |
| `BEST_FOR_SCENARIO` | `SCENARIO` (1) — `SCENARIO_BEST` (N, bắt buộc)                    | Định danh (khoá của entity yếu gồm khoá của entity cha) | Điểm cao nhất thuộc một màn (phần định danh).              |
| `BEST_FOR_GROUP`    | `SOFT_SKILL_GROUP` (1) — `SCENARIO_BEST` (N, bắt buộc)            | Định danh (khoá của entity yếu gồm khoá của entity cha) | Điểm cao nhất thuộc một nhóm kỹ năng (phần định danh).     |
| `BEST_RUN`          | `SCENARIO_BEST` (N, bắt buộc) — `SCENARIO_RUN` (1)                | Cột tham chiếu                                          | Điểm cao nhất đến từ lượt chơi nào.                        |

Field riêng của quan hệ:

| Quan hệ          | Field         | Kiểu | Ý nghĩa                            |
| ---------------- | ------------- | ---- | ---------------------------------- |
| `CASTS`          | `draw_kind`   |      | Cố định, ngẫu nhiên hay người mới. |
| `EARNED_KEYWORD` | `proficiency` |      | Mức thành thạo.                    |
| `EARNED_KEYWORD` | `achieved_at` |      | Lúc đạt.                           |

### J. Lượt chơi và chấm

#### Entity (10)

##### `SCENARIO_RUN`

Một lượt chơi một màn, kể cả lượt play-test của DE.

| Field            | Kiểu          | Ý nghĩa                                                     |
| ---------------- | ------------- | ----------------------------------------------------------- |
| `id`             | khoá          | Mã lượt.                                                    |
| `is_playtest`    |               | Lượt play-test; không cộng xu, điểm, sức khoẻ thật (DR-11). |
| `status`         |               | Trạng thái của lượt.                                        |
| `started_at`     |               | Lúc bắt đầu.                                                |
| `ended_at`       |               | Lúc kết thúc.                                               |
| `time_budget`    | suy ra        | Quỹ điểm thời gian, suy ra từ đồng hồ của màn.              |
| `health_before`  |               | Sức khoẻ trước lượt.                                        |
| `health_after`   |               | Sức khoẻ sau lượt.                                          |
| `health_tier`    | suy ra        | Mức sức khoẻ, suy ra.                                       |
| `ot`             | ghép          | Tăng ca trong lượt.                                         |
| `ot.count`       |               | Số lần.                                                     |
| `ot.hours`       |               | Số giờ.                                                     |
| `ot.paid`        |               | Có được trả không.                                          |
| `buff_total`     | suy ra        | Tổng buff, suy ra.                                          |
| `buff_breakdown` | nhiều giá trị | Các phần của buff (nguồn và lượng).                         |
| `feedback_text`  |               | Nhận xét của người chơi sau lượt.                           |
| `realism_rating` |               | Điểm người chơi chấm độ chân thực của màn. †                |

##### `RUN_EVENT` _(entity yếu)_

Một sự kiện trong lượt chơi, chỉ ghi thêm. Trạng thái lượt chơi là kết quả gộp các sự kiện này. Phụ thuộc `SCENARIO_RUN`.

| Field                       | Kiểu | Ý nghĩa                   |
| --------------------------- | ---- | ------------------------- |
| `seq`                       | khoá | Thứ tự trong lượt.        |
| `type`                      |      | Loại sự kiện.             |
| `payload`                   |      | Nội dung sự kiện (JSON).  |
| `at`                        |      | Thời điểm.                |
| `provenance`                | ghép | Nguồn gốc nếu do AI sinh. |
| `provenance.model`          |      | Model đã dùng.            |
| `provenance.prompt_version` |      | Phiên bản prompt.         |
| `provenance.cost`           |      | Chi phí.                  |
| `provenance.latency`        |      | Độ trễ.                   |

##### `EVIDENCE_SEGMENT` _(entity yếu)_

Một đoạn bằng chứng của lượt đưa cho judge chấm. Phụ thuộc `SCENARIO_RUN`.

| Field       | Kiểu | Ý nghĩa                                        |
| ----------- | ---- | ---------------------------------------------- |
| `seq`       | khoá | Thứ tự đoạn.                                   |
| `kind`      |      | Đoạn thuộc nút, pha, kết thúc hay nhìn lại ca. |
| `phase_no`  |      | Số pha, khi màn chia pha.                      |
| `from_seq`  |      | Số thứ tự `RUN_EVENT` đầu của đoạn.            |
| `to_seq`    |      | Số thứ tự `RUN_EVENT` cuối của đoạn.           |
| `hint_used` |      | Người chơi đã dùng gợi ý ở đoạn này hay chưa.  |

##### `ASSESSMENT` _(entity yếu)_

Một lần chấm: một đoạn bằng chứng × một mục kỹ năng mềm. Phụ thuộc cả hai.

| Field         | Kiểu | Ý nghĩa                                                         |
| ------------- | ---- | --------------------------------------------------------------- |
| `level`       |      | Mức chấm 0/1/2 sau khi tổng hợp các judge.                      |
| `weight`      |      | Trọng số của mục trong màn.                                     |
| `status`      |      | `waiting` hoặc `final` (D-132). Điểm chỉ được cộng khi `final`. |
| `off_example` |      | Đánh dấu bài lệch xa câu mẫu. †                                 |
| `graded_at`   |      | Lúc chấm xong.                                                  |

##### `JUDGE_RESULT` _(entity yếu)_

Phán quyết của một judge trong panel ba judge. Phụ thuộc `ASSESSMENT`.

| Field        | Kiểu          | Ý nghĩa                    |
| ------------ | ------------- | -------------------------- |
| `judge_slot` | khoá          | Ghế judge (1–3).           |
| `model`      |               | Model thực tế đã chấm.     |
| `level`      |               | Mức judge này cho.         |
| `answers`    | nhiều giá trị | Trả lời từng câu có/không. |
| `reason`     |               | Lý do chấm.                |

##### `FEEDBACK_NOTE` _(entity yếu)_

Ghi chú phản hồi cho người chơi (FR-14). Phụ thuộc `SCENARIO_RUN`.

| Field  | Kiểu | Ý nghĩa                          |
| ------ | ---- | -------------------------------- |
| `seq`  | khoá | Thứ tự.                          |
| `kind` |      | Kết quả, phản hồi hay hướng dẫn. |
| `text` |      | Nội dung hiển thị.               |

##### `CONTENT_FLAG`

Người chơi báo một nội dung có vấn đề (DR-07).

| Field       | Kiểu | Ý nghĩa                       |
| ----------- | ---- | ----------------------------- |
| `id`        | khoá | Mã.                           |
| `event_seq` |      | Số thứ tự `RUN_EVENT` bị báo. |
| `reason`    |      | Lý do.                        |
| `status`    |      | Tiến độ xử lý.                |
| `at`        |      | Lúc báo.                      |

##### `INTEREST_TAP` _(entity yếu)_

Lần người chơi chạm bày tỏ hứng thú ở một nút, dùng cho RIASEC (D-106). Phụ thuộc `SCENARIO_RUN`.

| Field       | Kiểu | Ý nghĩa          |
| ----------- | ---- | ---------------- |
| `node_code` | khoá | Mã nút nơi chạm. |
| `axis`      |      | Trục RIASEC.     |
| `value`     |      | Mức hứng thú.    |
| `tapped_at` |      | Lúc chạm.        |

##### `NPC_MEMORY`

Điều NPC nhớ sau một lượt chơi.

| Field        | Kiểu | Ý nghĩa        |
| ------------ | ---- | -------------- |
| `id`         | khoá | Mã.            |
| `text`       |      | Nội dung.      |
| `created_at` |      | Thời điểm ghi. |

##### `SIDE_QUEST_RUN`

Một lần chơi nhiệm vụ phụ; không chấm điểm (N5, D-133).

| Field            | Kiểu | Ý nghĩa              |
| ---------------- | ---- | -------------------- |
| `id`             | khoá | Mã.                  |
| `status`         |      | Trạng thái.          |
| `started_at`     |      | Lúc bắt đầu.         |
| `completed_at`   |      | Lúc xong.            |
| `bonus_credited` |      | Đã cộng thưởng chưa. |

#### Relationship (26)

| Quan hệ                 | Nối                                                   | Cách lưu                                                | Ý nghĩa                                                                  |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `PLAYS`                 | `USER_ACCOUNT` (1) — `SCENARIO_RUN` (N, bắt buộc)     | Cột tham chiếu                                          | Tài khoản chơi các lượt (kể cả play-test của DE).                        |
| `OF_RELEASE`            | `SCENARIO_RUN` (N) — `SCENARIO_RELEASE` (0–1)         | Cột tham chiếu                                          | Lượt chơi trên một bản xuất bản.                                         |
| `OF_BUILD`              | `SCENARIO_RUN` (N) — `SCENARIO_BUILD` (0–1)           | Cột tham chiếu                                          | Lượt chơi trên một bản dựng (play-test). Mỗi lượt có đúng một trong hai. |
| `IN_ENROLMENT`          | `SCENARIO_RUN` (N) — `LEVEL_ENROLMENT` (0–1)          | Cột tham chiếu                                          | Lượt chơi nằm trong một lần vào cấp. Play-test thì không có.             |
| `HAS_EVENT`             | `SCENARIO_RUN` (1) — `RUN_EVENT` (N, bắt buộc)        | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lượt chơi có các sự kiện.                                                |
| `HAS_SEGMENT`           | `SCENARIO_RUN` (1) — `EVIDENCE_SEGMENT` (N, bắt buộc) | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lượt chơi có các đoạn bằng chứng.                                        |
| `HAS_NOTE`              | `SCENARIO_RUN` (1) — `FEEDBACK_NOTE` (N, bắt buộc)    | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lượt chơi có các ghi chú phản hồi.                                       |
| `HAS_TAP`               | `SCENARIO_RUN` (1) — `INTEREST_TAP` (N, bắt buộc)     | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lượt chơi có các lần chạm hứng thú.                                      |
| `SEGMENT_AT_NODE`       | `EVIDENCE_SEGMENT` (N) — `NODE` (0–1)                 | Cột tham chiếu                                          | Đoạn bằng chứng ứng với một nút.                                         |
| `SEGMENT_AT_PROBE`      | `EVIDENCE_SEGMENT` (N) — `REVIEW_PROBE` (0–1)         | Cột tham chiếu                                          | Đoạn bằng chứng ứng với một câu nhìn lại.                                |
| `ASSESSMENT_OF_SEGMENT` | `EVIDENCE_SEGMENT` (1) — `ASSESSMENT` (N, bắt buộc)   | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lần chấm thuộc một đoạn bằng chứng (phần định danh).                     |
| `ASSESSMENT_OF_ITEM`    | `SOFT_SKILL_ITEM` (1) — `ASSESSMENT` (N, bắt buộc)    | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lần chấm thuộc một mục kỹ năng (phần định danh).                         |
| `HAS_JUDGE`             | `ASSESSMENT` (1) — `JUDGE_RESULT` (N, bắt buộc)       | Định danh (khoá của entity yếu gồm khoá của entity cha) | Lần chấm có các phán quyết judge.                                        |
| `GRADED_BY_JOB`         | `ASSESSMENT` (N) — `AI_JOB` (1)                       | Cột tham chiếu                                          | Lần chấm do một AI_JOB thực hiện.                                        |
| `RAISES_FLAG`           | `SCENARIO_RUN` (M) — `CONDUCT_FLAG` (N)               | Bảng nối                                                | Cờ hành vi bị bật trong lượt (mỗi cờ tối đa một lần mỗi màn).            |
| `EARNS_POINTS`          | `SCENARIO_RUN` (M) — `SOFT_SKILL_GROUP` (N)           | Bảng nối                                                | Điểm của lượt chơi cho từng nhóm kỹ năng.                                |
| `NOTE_ITEM`             | `FEEDBACK_NOTE` (N) — `SOFT_SKILL_ITEM` (0–1)         | Cột tham chiếu                                          | Ghi chú phản hồi nói về một mục con.                                     |
| `FLAGS_CONTENT`         | `CONTENT_FLAG` (N, bắt buộc) — `SCENARIO_RUN` (1)     | Cột tham chiếu                                          | Báo lỗi nội dung thuộc một lượt chơi.                                    |
| `USES_ITEM`             | `SCENARIO_RUN` (0–1) — `INVENTORY_ITEM` (0–1)         | Cột tham chiếu                                          | Lượt chơi dùng một vật phẩm chuẩn bị (tối đa một vật phẩm buff).         |
| `REMEMBERS`             | `NPC_MEMORY` (N, bắt buộc) — `NPC_CARD` (1)           | Cột tham chiếu                                          | Ký ức thuộc một nhân vật.                                                |
| `MEMORY_FROM`           | `NPC_MEMORY` (N, bắt buộc) — `SCENARIO_RUN` (1)       | Cột tham chiếu                                          | Ký ức sinh ra từ một lượt chơi.                                          |
| `PRESENT`               | `NPC_MEMORY` (M) — `NPC_CARD` (N)                     | Bảng nối                                                | Những nhân vật có mặt khi ký ức hình thành.                              |
| `PLAYS_SIDE`            | `EXPLORER` (1) — `SIDE_QUEST_RUN` (N, bắt buộc)       | Cột tham chiếu                                          | Người chơi chơi các nhiệm vụ phụ.                                        |
| `OF_CHAPTER`            | `SIDE_QUEST_RUN` (N) — `NPC_CHAPTER` (0–1)            | Cột tham chiếu                                          | Lượt phụ thuộc một chương NPC.                                           |
| `OF_ACTIVITY`           | `SIDE_QUEST_RUN` (N) — `SIDE_ACTIVITY` (0–1)          | Cột tham chiếu                                          | Lượt phụ thuộc một hoạt động phụ. Mỗi lượt có đúng một trong hai.        |
| `IN_GAP`                | `SIDE_QUEST_RUN` (N) — `GAP` (0–1)                    | Cột tham chiếu                                          | Lượt phụ diễn ra trong một khoảng nghỉ.                                  |

Field riêng của quan hệ:

| Quan hệ        | Field      | Kiểu | Ý nghĩa                                 |
| -------------- | ---------- | ---- | --------------------------------------- |
| `RAISES_FLAG`  | `quote`    |      | Câu trích làm bằng chứng.               |
| `RAISES_FLAG`  | `turn_ref` |      | Lượt hội thoại tương ứng.               |
| `EARNS_POINTS` | `cap`      |      | Trần điểm của nhóm cho màn này.         |
| `EARNS_POINTS` | `raw`      |      | Điểm thô từ chấm.                       |
| `EARNS_POINTS` | `buffed`   |      | Điểm sau buff.                          |
| `EARNS_POINTS` | `credited` |      | Điểm thực sự được cộng sau khi áp trần. |

---

## Chuyên biệt hoá

- `USER_ACCOUNT` có hai lớp con chồng nhau (một người có thể vừa là explorer vừa là nhân sự): `EXPLORER`, `STAFF_MEMBER`.
