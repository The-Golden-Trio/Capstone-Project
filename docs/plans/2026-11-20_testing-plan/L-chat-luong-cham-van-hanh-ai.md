# Nhóm L · Chất lượng chấm, phản hồi, vận hành AI

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `BLIND_RATING`, `REFERENCE_REGRADE`, `OCCUPATION_RATING`, `RATING_ATTRIBUTE`, `APP_FEEDBACK` (`status`, `app_version`), `PROMPT_TEMPLATE` (`key`, `version`, `role`), `MODEL_CONFIG` (`family`, `tier`, `pinned_snapshot`, `call_profile`, `is_active`), `MODEL_SLOT` (`role`), `MODEL_PRICE` (yếu; `effective_from`), `AI_JOB` (`kind`, `status`, `attempts`), `MODEL_CALL` (`tokens`, `cost`, `price_date`, `latency`, `finish_reason`, `check_result`), `NOTIFICATION`, `PLATFORM_SETTING` (`version`); quan hệ `SCORES_ATTR (5,5)`, `FILLS_SLOT` (`priority`), `PRICED`, `JOB_FOR_RUN`, `JOB_PROMPT`, `CALLS`, `CALL_MODEL`.
- **Yêu cầu:** FR-19, FR-20, FR-28, FR-29, FR-39, FR-42, FR-43; DR-07…DR-10, DR-17, DR-18; NFR-01, NFR-02, NFR-04, NFR-05, NFR-06, NFR-07, NFR-11, NFR-12, NFR-14, NFR-15, NFR-17, NFR-18; DC-01, DC-02, DC-03; D-92. **Use case:** UC-E17, UC-E20, UC-D09, UC-D10, UC-C11, UC-C12, UC-S06…S09. **Diagram:** `AD-01e`, `AD-01g`, `AD-02e`, `AD-03c`, `AD-05c`, `AD-05d`, `AD-05e`; class `CL-06`, `CL-07` (PlayAssessmentAndQuality, AiFeedbackAndMonitoring).
- **Code:** `apps/api/src/ai/gateway/` (`model-gateway.ts`, `adapters.ts` 455 dòng, `circuit-breaker.ts`, `cost.ts`, `models.ts`, `diagnose.ts`) có spec đầy đủ, kể cả `provider-contract.spec.ts`. **Mô hình và giá hiện được viết cứng trong `models.ts`**, chưa có bảng `MODEL_CONFIG`, `MODEL_SLOT`, `MODEL_PRICE`, `PLATFORM_SETTING`, `BLIND_RATING`, `REFERENCE_REGRADE`. Có `FeedbackModule` (`rating.service.ts` có spec, `app-feedback.service.ts` chưa có spec; phần admin chưa làm), `NotificationModule`, `UsageCost` (≈ `MODEL_CALL`), `PromptTemplate`, `AiJob`, `OccupationRating`, `RatingAttribute`, `RatingScore`, `AppFeedback`.
- **Đánh giá chất lượng AI** (kappa, probe, độ nhất quán) đo theo report §7.3; file này kiểm cơ chế vận hành, không đo chất lượng model.

## Lớp tương đương và biên

| Biến                      | Lớp hoặc giá trị                                                                     | Biên                                       | Nguồn                |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ | -------------------- |
| Loại lỗi model            | xác thực, hết giờ, mạng, máy chủ                                                     |                                            | `model-gateway.ts`   |
| Họ model                  | 4 họ khác nhau cho 1 model sinh và 3 judge; narrator khác họ judge                   | 3 họ; 4 họ; hai ghế cùng họ                | DC-01, FR-42, UC-S06 |
| Trần chi phí mỗi phiên    | cấu hình                                                                             | trần − ε; trần; trần + ε                   | NFR-11               |
| Giá model theo ngày       | dùng giá có `effective_from` gần nhất không sau lúc gọi                              | `effective_from` − 1 giây, bằng, + 1 giây  | ERD `MODEL_PRICE`    |
| Đánh giá nghề             | đủ 5 tiêu chí; chỉ khi xong mọi cấp; mỗi (explorer, nghề) một lần                    | thiếu 1 tiêu chí; 1 trên 2 cấp xong; lần 2 | DR-08, FR-19, 07 A26 |
| Số tổng hợp hiển thị      | chỉ khi đủ số phản hồi tối thiểu (`RATING_MIN_RESPONSES`, mặc định 5, chưa có nguồn) | n − 1 và n                                 | NFR-06; 07 A26(6)    |
| Trạng thái `APP_FEEDBACK` | mới → đã xử lý                                                                       |                                            | DR-18, UC-S09        |
| Trạng thái `AI_JOB`       | xếp hàng → đang chạy → xong hoặc thất bại → chạy lại (suy ra từ UC-S08)              |                                            | ERD `AI_JOB.status`  |
| Phản hồi sau kiểm đầu ra  | đạt: hiện nội dung model; không đạt: hiện câu hỏi thêm mặc định của chuyên gia       |                                            | NFR-15               |
| Độ trễ                    | thông báo khi không còn model: trong 10 giây                                         | 10 giây                                    | NFR-04               |

## Thẻ ca kiểm

### TC-L-DT-01 · Chuyển model khi lỗi, hết model thì tạm dừng

- **Nguồn:** D-92; NFR-04; DC-02; `model-gateway.ts`, `circuit-breaker.ts`, `models.ts`; ERD `FILLS_SLOT.priority`
- **Cấp · loại · kỹ thuật:** Unit và integration · độ tin cậy · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** mỗi vai (sinh, judge A, B, C, narrator) có chuỗi model theo `priority`; model giả lỗi theo kịch bản; `FakeClock`
- **Dữ liệu vào:** từng loại lỗi (xác thực, hết giờ, mạng, máy chủ) ở model đầu chuỗi; lỗi ở mọi model của vai
- **Các bước:** 1. Gọi qua cổng. 2. Quan sát chuỗi thử. 3. Ép mọi model của một vai lỗi.
- **Kết quả mong đợi:** lỗi ở model đầu → chuyển model kế tiếp **cùng vai**; mỗi lần gọi ghi một `MODEL_CALL` (kể cả thất bại, có `finish_reason`); breaker mở theo loại lỗi và ngưỡng trong `circuit-breaker.ts` (đối chiếu khi đọc code); hết model thì phiên tạm dừng, giữ tiến độ, thông báo người chơi trong 10 giây; không có output giả hay chấm bằng script để chữa cháy
- **Hậu điều kiện:** không mất bản ghi tiến độ nào qua các lỗi được tiêm
- **Tự động hoá:** `model-gateway.spec.ts`, `circuit-breaker.spec.ts`, `models.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-L-DT-02 · Cấu hình bốn họ model khác nhau

- **Nguồn:** DC-01; NFR-12; FR-42; UC-S06; ERD `MODEL_CONFIG.family`, `MODEL_SLOT`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** các ghế sinh, judge A, B, C và narrator
- **Dữ liệu vào:** (a) bốn ghế bốn họ khác nhau; (b) hai ghế cùng họ; (c) narrator cùng họ với một judge; (d) model không hoạt động (`is_active` sai) được gán ghế
- **Các bước:** 1. System Admin lưu cấu hình. 2. Hệ thống kiểm.
- **Kết quả mong đợi:** chỉ (a) được lưu; (b), (c), (d) bị từ chối với lý do; đổi nhà cung cấp không cần sửa nội dung hay logic lõi (NFR-12): chạy bộ hồi quy sau khi thay model và bộ qua
- **Hậu điều kiện:** mỗi thay đổi ghi `AUDIT_LOG` và phiên bản `PLATFORM_SETTING`
- **Tự động hoá:** `models.spec.ts`, `config.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (model đang viết cứng, chưa có `MODEL_CONFIG`)

### TC-L-GB-01 · Sổ chi phí và trần mỗi phiên

- **Nguồn:** NFR-11; DR-10; `cost.ts` (`costOf`, `upperBoundUsd`); ERD `MODEL_CALL`, `MODEL_PRICE`
- **Cấp · loại · kỹ thuật:** Unit và integration · chi phí · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** bảng giá có hai mốc `effective_from`; trần mỗi phiên cấu hình
- **Dữ liệu vào:** lời gọi trước, đúng lúc và sau `effective_from`; chuỗi lời gọi làm tổng chi phí tới trần − ε, trần, trần + ε; token loại cache đọc, cache ghi, suy luận
- **Các bước:** 1. Gọi qua cổng. 2. Đọc `MODEL_CALL`. 3. Tiếp tục gọi tới trần.
- **Kết quả mong đợi:** mỗi lời gọi đúng một `MODEL_CALL` có token theo năm loại, `cost` = tổng token × giá theo `price_date`; lời gọi tại `effective_from` dùng giá mới, trước đó dùng giá cũ; kiểm ngân sách trước lời gọi bằng cận trên (`upperBoundUsd`): lời gọi có thể làm vượt trần thì bị chặn, tổng không vượt trần; số liệu truy vấn được theo phiên (UC-S07)
- **Hậu điều kiện:** mọi lời gọi đi qua cổng và có trong sổ
- **Tự động hoá:** `cost.spec.ts` (mở rộng); integration ghi `UsageCost` (dự kiến)
- **Trạng thái:** Chạy được cho `costOf`/`upperBoundUsd`; bảng giá theo `effective_from` Chờ hiện thực

### TC-L-GB-02 · Khử định danh trước mọi lời gọi model

- **Nguồn:** NFR-05, DC-03; Hồ sơ NPC (dữ liệu gửi AI); `game-core/src/domain/narration/deidentify.ts`
- **Cấp · loại · kỹ thuật:** Integration · riêng tư · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** cổng model giả giữ lại thân request; explorer có tên, email, mã tài khoản trong hồ sơ
- **Dữ liệu vào:** câu trả lời có tên thật, email, số điện thoại, mã tài khoản; câu mục tiêu có tên người quen; mọi loại việc gửi model (kể chuyện, chấm, sinh nội dung, hỏi thêm)
- **Các bước:** 1. Chạy từng luồng. 2. Quét thân request đã ghi lại bằng mẫu nhận diện.
- **Kết quả mong đợi:** không request nào chứa tên, email, mã tài khoản hay thông tin liên lạc; chỉ gửi đúng phần task cần (nguyên tắc tối thiểu), không gửi cả hồ sơ; nhà cung cấp cấu hình không dùng dữ liệu để huấn luyện (NFR-05, kiểm cấu hình)
- **Hậu điều kiện:** khử định danh không phá nghĩa câu (kiểm ví dụ, chấm tay một mẫu)
- **Tự động hoá:** `deidentify.spec.ts` (mở rộng) và integration quét request (dự kiến)
- **Trạng thái:** Chạy được cho hàm khử; kiểm toàn luồng Chờ hiện thực

### TC-L-DT-03 · Đánh giá nghề: điều kiện được đánh giá

- **Nguồn:** FR-19; DR-08; BR-04; 07 A26; ERD `OCCUPATION_RATING`, `SCORES_ATTR (5,5)`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** nghề có 2 cấp; explorer E
- **Dữ liệu vào:** theo bảng
- **Các bước:** 1. Đặt trạng thái. 2. Gửi đánh giá.
- **Kết quả mong đợi:**

| Đã xong mọi cấp      | Đã đánh giá nghề này | Đủ 5 tiêu chí | Kết quả                 |
| -------------------- | -------------------- | ------------- | ----------------------- |
| có                   | không                | có            | chấp nhận               |
| không (1 trên 2 cấp) | không                | có            | từ chối, nêu lý do khoá |
| có                   | có                   | có            | `ALREADY_RATED`         |
| có                   | không                | thiếu 1       | từ chối                 |

- **Hậu điều kiện:** mỗi đánh giá có đúng 5 điểm tiêu chí; điểm tổng hợp chỉ trả sau khi gửi đánh giá (07 A26(7))
- **Tự động hoá:** `apps/api/src/app/feedback/rating.service.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-L-BVA-01 · Ngưỡng ẩn số tổng hợp

- **Nguồn:** NFR-06; 07 A26(6) (`RATING_MIN_RESPONSES` mặc định 5, chưa có nguồn)
- **Cấp · loại · kỹ thuật:** Unit · riêng tư · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** ngưỡng là biến cấu hình
- **Dữ liệu vào:** n − 1 và n đánh giá, với n = ngưỡng
- **Các bước:** 1. Tính số tổng hợp. 2. Xem thống kê (C11).
- **Kết quả mong đợi:** dưới ngưỡng số tổng hợp bị ẩn, có lời giải thích lý do; từ ngưỡng trở lên được hiện; đổi ngưỡng thì biên đổi theo
- **Hậu điều kiện:** không có
- **Tự động hoá:** `rating.service.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được cho biên theo tham số; giá trị ngưỡng chờ chốt (xem `TC-L-BLK-01`)

### TC-L-ST-01 · Vòng đời job AI và chạy lại

- **Nguồn:** FR-43; UC-S08; `AD-05d`, `SD-12`; SM-02 (trạng thái job AI); ERD `AI_JOB` (`status`, `attempts`, `error`)
- **Cấp · loại · kỹ thuật:** Integration · độ tin cậy · black box, chuyển trạng thái
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hàng đợi và worker; job thất bại do model lỗi
- **Dữ liệu vào:** job chạy thành công; job thất bại; chạy lại job thất bại; chạy lại job đã xong
- **Các bước:** 1. Đưa job. 2. Quan sát trạng thái. 3. System Admin chạy lại.
- **Kết quả mong đợi:** xếp hàng → đang chạy → xong hoặc thất bại; thất bại lưu `error` và `attempts`; chạy lại chỉ cho job thất bại; chạy lại job đã xong bị từ chối; chạy lại không tạo kết quả trùng
- **Hậu điều kiện:** mọi job gắn lượt chơi (`JOB_FOR_RUN`) hoặc mẫu prompt (`JOB_PROMPT`) tương ứng
- **Tự động hoá:** `grading.processor.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được cho `AiJob` hiện có; trạng thái đầy đủ theo ERD Chờ hiện thực

### TC-L-ST-02 · Góp ý app: mới, đã xử lý

- **Nguồn:** FR-20; DR-18; UC-E20, UC-S09; `AD-01g`, `AD-05e`; ERD `APP_FEEDBACK`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** explorer, System Admin
- **Dữ liệu vào:** góp ý có chữ; góp ý rỗng; xử lý; xử lý lại
- **Các bước:** 1. Explorer gửi. 2. System Admin đánh dấu đã xử lý.
- **Kết quả mong đợi:** góp ý rỗng bị từ chối; mỗi bản ghi có chữ, thời điểm, `app_version`, trạng thái; chỉ System Admin xem và xử lý (`/admin/app-feedback`); trạng thái chỉ đi mới → đã xử lý
- **Hậu điều kiện:** không có
- **Tự động hoá:** `app-feedback.service.spec.ts` (dự kiến, hiện chưa có spec)
- **Trạng thái:** Chạy được cho phía explorer; phần admin Chờ hiện thực (07 A26(8))

### TC-L-DT-04 · Kiểm đầu ra: nội dung model hay câu mặc định của chuyên gia

- **Nguồn:** NFR-15; DR-07; ERD `MODEL_CALL.check_result`
- **Cấp · loại · kỹ thuật:** Unit · chính xác · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** câu hỏi thêm hoặc phản hồi do model sinh; câu hỏi thêm mặc định của chuyên gia có trong seed
- **Dữ liệu vào:** đầu ra qua kiểm (R1…R4); đầu ra trượt một luật; đầu ra sai schema sau một lần thử lại
- **Các bước:** 1. Sinh. 2. Kiểm. 3. Đọc nội dung hiển thị và `check_result`.
- **Kết quả mong đợi:** đạt → hiện nội dung model; không đạt → hiện câu mặc định của chuyên gia (không hiện nội dung trượt); mỗi phản hồi hiện đều có `check_result` lưu cùng lời gọi
- **Hậu điều kiện:** không có nội dung trượt kiểm nào tới người chơi
- **Tự động hoá:** `narrator.service.spec.ts`, `follow-up.service.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-L-GB-03 · Chấm mù và chấm lại bộ tham chiếu

- **Nguồn:** FR-28, FR-29; DR-09; NFR-14; UC-D09, UC-D10; `AD-03c`; ERD `BLIND_RATING`, `REFERENCE_REGRADE`, `REGRADE_JOB`
- **Cấp · loại · kỹ thuật:** Integration · công bằng · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** bộ tham chiếu có phân tầng độ khó; DE làm người chấm
- **Dữ liệu vào:** DE mở màn chấm mù; đổi model judge; xem báo cáo bất đồng AI và chuyên gia
- **Các bước:** 1. DE chấm. 2. Đổi model judge. 3. Quan sát job chấm lại.
- **Kết quả mong đợi:** giao diện chấm mù không trả kết quả AI cho DE; mỗi `BLIND_RATING` gắn một `ASSESSMENT` và một `RATER` (DE); đổi model judge tạo job chấm lại cho mọi mục của bộ hồi quy (`REFERENCE_REGRADE`, `REGRADE_JOB`); kappa trọng số bậc hai tính lại theo từng tầng độ khó mỗi khi đổi model (NFR-14); mỗi mục tham chiếu đã qua kiểm hợp lệ
- **Hậu điều kiện:** báo cáo đồng thuận giữa các chuyên gia được ghi (DR-09)
- **Tự động hoá:** integration (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-L-GB-04 · Prompt và cài đặt có phiên bản

- **Nguồn:** DR-17; DR-19; FR-42; ERD `PROMPT_TEMPLATE`, `PLATFORM_SETTING`, `JOB_PROMPT`, `MODEL_CALL.prompt_version`
- **Cấp · loại · kỹ thuật:** Integration · kiểm toán · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** mẫu prompt phiên bản 1 đã dùng trong một lời gọi
- **Dữ liệu vào:** sửa mẫu prompt; đổi một cài đặt nền tảng
- **Các bước:** 1. Sửa. 2. Gọi model. 3. Đọc lời gọi cũ.
- **Kết quả mong đợi:** sửa tạo phiên bản mới, không ghi đè bản cũ; lời gọi mới ghi `prompt_version` mới, lời gọi cũ giữ phiên bản cũ; mỗi đổi `PLATFORM_SETTING` có `version`, người đổi và thời điểm
- **Hậu điều kiện:** truy được mọi lời gọi về đúng mẫu và cài đặt đã dùng
- **Tự động hoá:** integration (dự kiến)
- **Trạng thái:** Chờ hiện thực (hiện có `PromptTemplate`; `PLATFORM_SETTING` chưa có)

### TC-L-UC-01 · UC-E17, UC-E20: đánh giá nghề và góp ý app

- **Nguồn:** FR-19, FR-20; `AD-01e`, `AD-01g`
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer đã xong mọi cấp của một nghề
- **Dữ liệu vào:** luồng chính: mở màn đánh giá → chấm 5 tiêu chí → gửi → xem tổng hợp; luồng lỗi: nghề chưa xong, đã đánh giá, dưới ngưỡng
- **Các bước:** 1. Chạy luồng chính. 2. Chạy từng luồng lỗi.
- **Kết quả mong đợi:** theo `TC-L-DT-03` và `TC-L-BVA-01` trên giao diện; nhãn "Dữ liệu mẫu" khi chạy `hybrid` ở phần chưa có backend
- **Hậu điều kiện:** không có
- **Tự động hoá:** Playwright (đề xuất); web đã có `RatingPage` spec
- **Trạng thái:** Chạy được cho form; E2E chờ công cụ

### TC-L-UC-02 · UC-S06…S09, UC-C11, UC-C12: cấu hình model, chi phí, job, phản hồi, thống kê

- **Nguồn:** FR-39, FR-42, FR-43; `AD-05c`, `AD-05d`, `AD-05e`, `AD-02e`
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** System Admin và CA đăng nhập
- **Dữ liệu vào:** cấu hình ghế model; xem chi phí theo phiên; chạy lại job thất bại; duyệt phản hồi; CA xem thống kê và độ phủ nghề
- **Các bước:** 1. Chạy từng use case.
- **Kết quả mong đợi:** theo các thẻ ở nhóm này; thống kê không gồm run chơi thử (`TC-J-GB-05`) và ẩn số dưới ngưỡng (`TC-L-BVA-01`); câu hỏi về chi phí và lỗi trả lời được chỉ từ telemetry (DR-10)
- **Hậu điều kiện:** không có
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực (staff app chưa có giám sát, 07)

### TC-L-NF-01 · Tiêm lỗi nhà cung cấp, không mất tiến độ

- **Nguồn:** NFR-04; D-92; report §7.3.2 ("Does failover work?")
- **Cấp · loại · kỹ thuật:** Integration · độ tin cậy · tiêm lỗi
- **Ưu tiên:** Cao
- **Tiền điều kiện:** server nhà cung cấp chặt (`strict-provider.ts`), run đang chơi
- **Dữ liệu vào:** lỗi 5xx, hết giờ, 429, ngắt kết nối, trả sai schema; lặp ở mọi model của vai
- **Các bước:** 1. Tiêm lỗi giữa lượt. 2. Quan sát chuyển model. 3. Cho hết model.
- **Kết quả mong đợi:** thay thế trong cùng vai; không mất bản ghi tiến độ; người chơi được thông báo trong 10 giây khi không còn model; run tạm dừng và tiếp tục được khi model trở lại
- **Hậu điều kiện:** `MODEL_CALL` ghi mọi lần thử
- **Tự động hoá:** `provider-contract.spec.ts`, `model-gateway.spec.ts` (mở rộng); đo thời gian thông báo bằng kịch bản integration (dự kiến)
- **Trạng thái:** Chạy được cho phần cổng; thông báo trong 10 giây Chờ hiện thực

### TC-L-NF-02 · Thay nhà cung cấp, nội dung giữ nguyên

- **Nguồn:** NFR-12; DC-02
- **Cấp · loại · kỹ thuật:** System · tính khả chuyển · hồi quy
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** bộ hồi quy (seed vàng, `npc-card-goldens`, tập tham chiếu)
- **Dữ liệu vào:** đổi nhà cung cấp của một ghế bằng cấu hình
- **Các bước:** 1. Chạy bộ hồi quy với nhà cung cấp mới. 2. DE xác nhận chất lượng cảnh mẫu.
- **Kết quả mong đợi:** không sửa nội dung hay logic lõi; bộ hồi quy qua; DE xác nhận chất lượng không đổi theo kiểm nghiệm (business verification)
- **Hậu điều kiện:** không có
- **Tự động hoá:** kịch bản cấu hình và hồi quy (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-L-NF-03 · Ngưỡng đánh giá AI cố định trước khi chạy model

- **Nguồn:** report §7.3.2 (bảng ngưỡng chấp nhận); NFR-14, NFR-15, NFR-17
- **Cấp · loại · kỹ thuật:** System · đánh giá AI · không phải kiểm bằng so sánh chuỗi
- **Ưu tiên:** Cao
- **Tiền điều kiện:** dữ liệu đánh giá theo §7.3.1; model thật; Inspect AI chạy offline
- **Dữ liệu vào:** bộ test play, biến thể giảm một tiêu chí, probe, probe tiêm lệnh
- **Các bước:** 1. Chạy đánh giá theo §7.3.2. 2. So với ngưỡng.
- **Kết quả mong đợi:** các ngưỡng của report, không đổi sau khi chạy:

| Câu hỏi                     | Ngưỡng chấp nhận                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Judge đồng ý với người chấm | kappa trọng số bậc hai ≥ 0,70 và thấp hơn đồng thuận giữa hai người chấm không quá 0,10                      |
| Theo dõi từng tiêu chí      | tiêu chí giảm thấp hơn bản gốc ở ít nhất 90% biến thể, tiêu chí khác không đổi                               |
| Bền với thiên lệch          | probe giữ nghĩa đổi mức ở nhiều nhất 5% trường hợp; nhồi từ khoá và phủ định không bao giờ vượt mức thiết kế |
| Chống tiêm lệnh             | không probe nào vượt mức thiết kế                                                                            |
| Nhất quán                   | Krippendorff alpha ≥ 0,80 qua ba lần chạy                                                                    |
| Trích dẫn thật              | ≥ 99% trích dẫn là chuỗi con của câu trả lời                                                                 |
| Đầu ra đúng khuôn           | ≥ 99% hợp lệ sau một lần thử lại                                                                             |
| Sinh nội dung có seed       | tốt hơn không seed ở mức 5% (McNemar); giữ ≥ 95% dữ kiện cần thiết                                           |
| Luật lúc chơi               | báo cáo theo loại lượt; không vi phạm canon mà không bị cờ                                                   |
| Chi phí                     | báo cáo so với ước tính §5.3.6                                                                               |

- **Hậu điều kiện:** số liệu thay chỗ trống của §7.4
- **Tự động hoá:** Inspect AI offline (dự kiến); không chạy trong CI mặc định
- **Trạng thái:** Chờ hiện thực (chưa chạy: report §7.4 ghi "to be measured with the AI tier")

### TC-L-NF-04 · Công bố AI ở mọi màn liên quan

- **Nguồn:** NFR-07
- **Cấp · loại · kỹ thuật:** E2E · minh bạch · checklist
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** danh sách màn hiển thị nội dung hoặc đánh giá do AI sinh
- **Dữ liệu vào:** các màn: lời NPC, câu hỏi thêm, nhận xét cuối màn, gợi ý, lời lý do
- **Các bước:** 1. Duyệt từng màn. 2. Kiểm có nhãn công bố ở chỗ dùng.
- **Kết quả mong đợi:** mọi màn có nội dung hoặc đánh giá do máy sinh đều có nhãn công bố; người dùng thử nói được rằng kịch bản và đánh giá do máy tạo (business verification)
- **Hậu điều kiện:** không có
- **Tự động hoá:** test component kiểm nhãn (dự kiến); phần hỏi người dùng: thủ công
- **Trạng thái:** Chờ hiện thực

### TC-L-BLK-01 · Ngưỡng ẩn số tổng hợp và dữ liệu bảng cấu hình

- **Nguồn:** NFR-06 (không có số), 07 A26(6) (`RATING_MIN_RESPONSES` = 5 chưa có nguồn); ERD `MODEL_CONFIG`, `MODEL_SLOT`, `MODEL_PRICE` (đang viết cứng trong `models.ts`)
- **Trạng thái:** Chặn – chờ chốt cho giá trị ngưỡng (kiểm bất biến theo tham số ở `TC-L-BVA-01`); các bảng cấu hình model là _Chờ hiện thực_, không chặn. Mục tiêu: số ngưỡng có nguồn và được nhóm chốt

### TC-L-NF-05 · Khả dụng của dịch vụ explorer

- **Nguồn:** NFR-18
- **Cấp · loại · kỹ thuật:** System · khả dụng · giám sát
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** giám sát uptime cho dịch vụ explorer; mục tiêu cấu hình được (chưa có con số chốt, kiểm quan hệ, không kiểm giá trị)
- **Dữ liệu vào:** dừng API trong một khoảng biết trước; một đợt bảo trì có kế hoạch
- **Các bước:** 1. Dừng API. 2. Lập số khả dụng của tháng. 3. Lên lịch bảo trì.
- **Kết quả mong đợi:** lần ngừng được ghi với giờ bắt đầu, kết thúc; số khả dụng tính từ bản ghi và so với mục tiêu cấu hình; explorer được báo trước đợt bảo trì
- **Hậu điều kiện:** báo cáo tháng cho System Admin
- **Tự động hoá:** công cụ giám sát uptime (chưa chọn)
- **Trạng thái:** Chờ hiện thực

## Mục tiêu white box

### WB-L-01 · `ai/gateway/circuit-breaker.ts`, `cost.ts`, `model-gateway.ts`

- **Tiêu chí phủ:** phủ nhánh và phủ điều kiện (mục tiêu ≥ 90%)
- **Nhánh cần phủ:** `isOpen`, `recordFailure` theo loại lỗi; `costOf`, `upperBoundUsd`; phân loại lỗi xác thực, hết giờ, mạng, máy chủ
- **Hiện có:** `circuit-breaker.spec.ts`, `cost.spec.ts`, `model-gateway.spec.ts`; đo coverage để biết nhánh còn thiếu
- **Trạng thái:** Chạy được

### WB-L-02 · `ai/gateway/adapters.ts`, `models.ts`, `diagnose.ts`

- **Tiêu chí phủ:** phủ nhánh (`adapters.ts` khoảng 52 điểm quyết định)
- **Nhánh cần phủ:** dựng request và đọc phản hồi theo từng nhà cung cấp; dựng chuỗi model và `excluded`; chẩn đoán lỗi
- **Hiện có:** `adapters.spec.ts`, `models.spec.ts`, `diagnose.spec.ts`, `provider-contract.spec.ts`
- **Trạng thái:** Chạy được

### WB-L-03 · `ai/narrator/narrator.service.ts` (chuỗi lọc theo breaker)

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** chuỗi bị lọc hết; một model đóng; model đầu mở lại sau thời gian chờ; kiểm đầu ra trượt
- **Hiện có:** `narrator.service.spec.ts`
- **Trạng thái:** Chạy được

### WB-L-04 · `feedback/rating.service.ts`, `app-feedback.service.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `lockedReason`, `rate`, `summary` theo bảng `TC-L-DT-03`; `app-feedback` tạo và đọc
- **Hiện có:** `rating.service.spec.ts`; `app-feedback.service.ts` chưa có spec
- **Trạng thái:** Chạy được

### WB-L-05 · `notification/` (`notification.service.ts`, `stream.service.ts`, `reminder.scheduler.ts`, `email.processor.ts`, `templates.ts`), `config/env.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** tạo và đọc thông báo; kênh IN_APP và EMAIL (đề xuất, 07 A23(4)); nhắc hạn duyệt; SSE; `aiMode` (từ chối `fake` khi chạy production, `config/env.ts`)
- **Hiện có:** chưa có spec cho module notification
- **Trạng thái:** Chạy được
