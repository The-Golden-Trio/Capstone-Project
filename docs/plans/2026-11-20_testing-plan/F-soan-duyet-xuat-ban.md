# Nhóm F · Soạn bằng AI, duyệt, trình bày, play-test, xuất bản

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `TOPIC_GUIDE`, `EXPERT_INTERVIEW`, `INTERVIEW_TURN`, `GENERATION_RUN`, `CRITERIA_VERSION`, `REVIEW_CRITERION`, `REVIEW_ASSIGNMENT`, `REVIEW`, `REVIEW_COMMENT`, `ASSET`, `PRESENTATION`, `PRESENTATION_SCENE`, `SCENARIO_BUILD`, `PLAYTEST_FINDING`, `TRIAGE_ITEM`, `SCENARIO_RELEASE`, `REVALIDATION_REQUEST`, `LIFECYCLE_LOG`; quan hệ `REASSIGNS (0,1)`, `DECIDES (0,1)`, `LOGS_SCENARIO`, `LOGS_PACK`.
- **Yêu cầu:** FR-22…FR-27, FR-32, FR-34…FR-38; DR-04, DR-05, DR-13, DR-14, DR-19; NFR-15, NFR-16; BR-15. **Use case:** UC-D01…D08, UC-C03…C10. **Diagram:** `SM-01`, `AD-04`, `AD-02d`, `AD-02f`, `AD-03b`, `SD-05`, `SD-06`, `SD-07`, `SD-08`; class `CL-03`, `CL-04` (ScenarioAuthoringAndLifecycle, ReviewAndPublishing).
- **Code:** có `LifecycleModule` (`transitions.ts` 12 hành động, `scenario-state-machine.ts`, `content-store.ts`, `scenario-view.service.ts`), `ReviewModule` (`assignment.service.ts`, `review.service.ts`), `ScenarioModule` (`scenario.service.ts`, `generation.service.ts`, `generation.processor.ts`), `PublishingModule` (`asset`, `presentation`, `build.service.ts`), `CatalogueModule` (`review-criteria.service.ts`), `NotificationModule`. Có `scenario-state-machine.spec.ts` và `content-validator.spec.ts`; các module còn lại chưa có spec. **Chưa có:** play-test (D05), xuất bản (C08), import, `TOPIC_GUIDE`, `EXPERT_INTERVIEW`, `PLAYTEST_FINDING`, `TRIAGE_ITEM`, `SCENARIO_RELEASE`, `REVALIDATION_REQUEST`.

## Vòng đời SM-01

Trạng thái: Draft, Submitted, In Review, Approved, In Playtest, Ready, Published, Retired (cuối).

| #   | Từ          | Đến         | Kích hoạt [guard]                               | Yêu cầu      |
| --- | ----------- | ----------- | ----------------------------------------------- | ------------ |
| 1   | khởi tạo    | Draft       | mở scenario [chưa có scenario trùng, theo G-04] | FR-33        |
| 2   | Draft       | Draft       | sinh, sửa, nộp [kiểm tự động không đạt]         | FR-22, FR-23 |
| 3   | Draft       | Submitted   | nộp [kiểm tự động đạt]                          | FR-23, FR-34 |
| 4   | Submitted   | In Review   | người duyệt mở [người duyệt ≠ tác giả]          | FR-25, FR-34 |
| 5   | In Review   | Draft       | yêu cầu sửa                                     | FR-25        |
| 6   | In Review   | Retired     | từ chối                                         | FR-25        |
| 7   | In Review   | Approved    | duyệt [mọi tiêu chí đã trả lời]                 | FR-25, FR-32 |
| 8   | Approved    | In Playtest | dựng bản chơi thử                               | FR-26, FR-35 |
| 9   | In Playtest | Approved    | báo lỗi hiển thị                                | FR-26        |
| 10  | In Playtest | Draft       | báo lỗi nội dung                                | FR-26        |
| 11  | In Playtest | Ready       | qua play-test                                   | FR-26        |
| 12  | Ready       | Published   | xuất bản (bị tắt ở mọi trạng thái khác)         | FR-37        |
| 13  | Published   | Published   | xác nhận lại [còn đúng]                         | FR-27        |
| 14  | Published   | Retired     | gỡ (giải phóng chỗ của việc)                    | FR-38        |

Có 8 × 8 = 64 cặp (từ, đến); 13 chuyển hợp lệ giữa trạng thái (dòng 2…14) và 51 cặp không hợp lệ.

## Lớp tương đương và biên

| Biến                                 | Lớp                                                                      | Biên                           | Nguồn         |
| ------------------------------------ | ------------------------------------------------------------------------ | ------------------------------ | ------------- |
| Quyết định duyệt (`REVIEW.decision`) | duyệt, yêu cầu sửa, từ chối                                              |                                | SM-01         |
| Số quyết định mỗi lượt (`DECIDES`)   | 0 hoặc 1                                                                 | 2                              | ERD           |
| Gán người duyệt                      | người duyệt ≠ tác giả; lượt chưa quá hạn                                 | người duyệt = tác giả; quá hạn | UC-C06        |
| Giao lại (`REASSIGNS`)               | 0 hoặc 1                                                                 | 2 lần liên tiếp                | ERD           |
| Sinh nội dung lỗi                    | thử lại schema 1 lần; sinh lại tối đa 2 lần; rồi đổi model; rồi tạm dừng | lần thử 1, 2, 3                | D-108         |
| `ASSET.bias_check.status`            | đạt, không đạt                                                           |                                | FR-36         |
| Kết quả xác nhận lại                 | còn đúng, đã lỗi thời                                                    |                                | UC-D06, BR-15 |
| Loại lỗi play-test                   | hiển thị, nội dung                                                       |                                | FR-26         |

## Thẻ ca kiểm

### TC-F-ST-01 · Mọi chuyển hợp lệ của SM-01

- **Nguồn:** SM-01; FR-22…FR-27, FR-34, FR-37, FR-38; NFR-16; ERD `LIFECYCLE_LOG`
- **Cấp · loại · kỹ thuật:** Unit và integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Cao
- **Tiền điều kiện:** scenario ở trạng thái đầu của từng chuyển; vai đúng cho chuyển đó
- **Dữ liệu vào:** 14 chuyển ở bảng trên, mỗi chuyển một ca, kể cả hai chuyển lặp tại chỗ (Draft → Draft, Published → Published)
- **Các bước:** 1. Áp hành động. 2. Đọc trạng thái. 3. Đọc `LIFECYCLE_LOG`.
- **Kết quả mong đợi:** trạng thái đích đúng; mỗi chuyển ghi một dòng log (actor, hành động, thời điểm, trạng thái trước và sau) trong cùng transaction với thay đổi trạng thái; riêng Draft → Draft nay chưa có `LifecycleAction` (07 A23(1)), kiểm theo đề xuất và ghi rõ
- **Hậu điều kiện:** đạt phủ mọi trạng thái và mọi chuyển hợp lệ
- **Tự động hoá:** `apps/api/src/app/lifecycle/scenario-state-machine.spec.ts` (mở rộng), `lifecycle.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được cho 12 hành động hiện có; Chờ hiện thực cho In Playtest, Ready, Published (P5)

### TC-F-ST-02 · Mọi cặp chuyển không hợp lệ bị từ chối

- **Nguồn:** SM-01; DR-13
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Cao
- **Tiền điều kiện:** không có
- **Dữ liệu vào:** 51 cặp (từ, đến) còn lại trong 64; hành động đúng tên nhưng sai trạng thái
- **Các bước:** 1. Với mỗi trạng thái, gọi mọi hành động. 2. Đọc kết quả của `allowedActions`.
- **Kết quả mong đợi:** hành động ngoài bảng bị từ chối, trạng thái không đổi, không ghi log; `allowedActions` của từng trạng thái đúng bằng tập hành động hợp lệ; xuất bản bị tắt ở mọi trạng thái ngoài Ready; Retired không có chuyển ra
- **Hậu điều kiện:** không có
- **Tự động hoá:** `scenario-state-machine.spec.ts` (mở rộng, sinh ca từ bảng)
- **Trạng thái:** Chạy được

### TC-F-DT-01 · Guard của các chuyển

- **Nguồn:** SM-01; FR-25, FR-32, FR-34
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định (kèm MC/DC)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** scenario ở trạng thái đầu của chuyển cần kiểm
- **Dữ liệu vào:** theo bảng
- **Các bước:** 1. Đặt điều kiện. 2. Áp hành động.
- **Kết quả mong đợi:**

| Chuyển                | Điều kiện                                                     | Kết quả   |
| --------------------- | ------------------------------------------------------------- | --------- |
| Draft → Submitted     | kiểm tự động đạt                                              | chấp nhận |
| Draft → Submitted     | kiểm tự động không đạt                                        | giữ Draft |
| Submitted → In Review | người duyệt ≠ tác giả, có lượt giao                           | chấp nhận |
| Submitted → In Review | người duyệt = tác giả                                         | từ chối   |
| Submitted → In Review | không có lượt giao                                            | từ chối   |
| In Review → Approved  | mọi tiêu chí đã trả lời                                       | chấp nhận |
| In Review → Approved  | còn tiêu chí chưa trả lời                                     | từ chối   |
| mở scenario (Draft)   | việc đã có màn trùng cả việc chính lẫn loại tình huống (G-04) | từ chối   |

Mỗi điều kiện đổi một mình phải làm kết quả đổi (MC/DC).

- **Hậu điều kiện:** các lần bị từ chối không ghi log
- **Tự động hoá:** `scenario-state-machine.spec.ts`, `review.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được cho guard hiện có; guard mở màn theo G-04 Chờ hiện thực (SM-01 ghi "một scenario active mỗi task", diễn giải lại theo Seed Khối 1)

### TC-F-DT-02 · Kết quả duyệt

- **Nguồn:** FR-25; UC-D04, UC-D05; ERD `REVIEW.decision`, `DECIDES (0,1)`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** scenario In Review, người duyệt đúng
- **Dữ liệu vào:** (duyệt, yêu cầu sửa, từ chối) × (mọi tiêu chí đã trả lời, còn thiếu); gửi quyết định lần hai
- **Các bước:** 1. Gửi quyết định. 2. Đọc trạng thái và `REVIEW`.
- **Kết quả mong đợi:** duyệt + đủ → Approved; duyệt + thiếu → từ chối, giữ In Review; yêu cầu sửa → Draft; từ chối → Retired; mỗi lượt chỉ có tối đa một quyết định (lần hai bị từ chối)
- **Hậu điều kiện:** `REVIEW` gắn `CRITERIA_VERSION` đã dùng (DR-19)
- **Tự động hoá:** `review.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-F-ST-03 · Lượt duyệt: giao, mở, quyết hoặc quá hạn, giao lại

- **Nguồn:** UC-C05, UC-C06; `AD-02f`; ERD `REVIEW_ASSIGNMENT`, `REASSIGNS (0,1)`; 07 A23 (đề xuất của code, chưa chốt)
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Cao
- **Tiền điều kiện:** CA, DE tác giả, hai DE người duyệt; đồng hồ giả
- **Dữ liệu vào:** giao cho tác giả; giao cho người duyệt; để quá hạn; giao lại; giao lại lần hai; nộp lại sau yêu cầu sửa
- **Các bước:** 1. Giao. 2. Đẩy đồng hồ tới hạn. 3. Giao lại. 4. Kiểm tra thông báo.
- **Kết quả mong đợi:** giao cho tác giả bị từ chối (409 hoặc 422 theo code); quá hạn được CA giao lại và `REASSIGNS` ghi lượt cũ; không giao lại quá một lần liên tiếp theo ERD; theo đề xuất A23: nhắc trước hạn 24 giờ, báo quá hạn một lần mỗi lượt, nộp lại giữ nguyên lượt ACTIVE (cùng người, cùng hạn); các điểm A23 kiểm theo "đề xuất", chờ nhóm xác nhận
- **Hậu điều kiện:** `NOTIFICATION` ghi đúng số lần
- **Tự động hoá:** `assignment.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được cho giao và giao lại; Chờ hiện thực cho điểm A23 chưa chốt

### TC-F-ST-04 · Sinh nội dung bằng AI: thử lại, sinh lại, đổi model, tạm dừng

- **Nguồn:** D-108; FR-22, FR-23; `AD-04`, `SD-05`; ERD `GENERATION_RUN.status`
- **Cấp · loại · kỹ thuật:** Integration · độ tin cậy · black box, chuyển trạng thái
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàng đợi `generation`, `AI_MODE=fake` với model giả lỗi theo kịch bản
- **Dữ liệu vào:** đầu ra sai schema 1 lần; sai schema liên tiếp; kiểm tự động không đạt 1, 2, 3 lần; model hết hạn mức
- **Các bước:** 1. Yêu cầu sinh. 2. Cho model giả lỗi theo kịch bản. 3. Quan sát chuỗi hành động.
- **Kết quả mong đợi:** sai schema được thử lại một lần; kiểm tự động không đạt thì sinh lại tối đa 2 lần; sau đó đổi sang model cùng vai; hết model thì tạm dừng và giữ bản nháp; mỗi lần ghi provenance (model, phiên bản prompt, chi phí, độ trễ)
- **Hậu điều kiện:** không có output giả hoặc chấm tắt để chữa cháy (D-92)
- **Tự động hoá:** `generation.processor.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được (chuỗi chính); Chờ hiện thực (phần đổi model đầy đủ)

### TC-F-DT-03 · Asset vào thư viện chỉ khi đạt kiểm thiên kiến

- **Nguồn:** FR-36; DR-14; ERD `ASSET.bias_check`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** CA đăng nhập; có asset mới
- **Dữ liệu vào:** `bias_check` đạt; không đạt; chưa kiểm; dùng asset trong bản trình bày
- **Các bước:** 1. Thêm asset. 2. Thử dùng trong `PRESENTATION_SCENE`.
- **Kết quả mong đợi:** chỉ asset đạt kiểm vào thư viện và dùng được; không đạt hoặc chưa kiểm bị từ chối; mọi asset được dùng trỏ về một mục thư viện
- **Hậu điều kiện:** không có
- **Tự động hoá:** `asset.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được cho thư viện asset; sinh ảnh bằng AI (D-104) Chờ hiện thực

### TC-F-GB-01 · Log trạng thái và thay đổi nằm trong cùng transaction

- **Nguồn:** NFR-16; DR-13; CLAUDE.md (kiến trúc: mỗi chuyển ghi log trong cùng transaction)
- **Cấp · loại · kỹ thuật:** Integration · tin cậy · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** Postgres thật (memory-prisma không mô phỏng rollback)
- **Dữ liệu vào:** chuyển trạng thái với việc ghi `LIFECYCLE_LOG` được ép lỗi
- **Các bước:** 1. Áp chuyển. 2. Làm hàm ghi log ném lỗi. 3. Đọc trạng thái.
- **Kết quả mong đợi:** trạng thái không đổi (hoàn tác); không có dòng log lẻ; không có trạng thái đổi mà thiếu log
- **Hậu điều kiện:** số dòng log bằng số chuyển đã thành công
- **Tự động hoá:** `lifecycle.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (cần service DB trong CI)

### TC-F-GB-02 · Bản đã xuất bản bất biến và bằng bản đã duyệt

- **Nguồn:** NFR-15, NFR-16; CLAUDE.md (release bất biến, có version); ERD `SCENARIO_RELEASE`
- **Cấp · loại · kỹ thuật:** Integration · chính xác · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** scenario Published
- **Dữ liệu vào:** ghi vào nội dung đã xuất bản; xoá; so bản đã duyệt với bản xuất bản
- **Các bước:** 1. Thử sửa nội dung qua mọi đường (API, `content-store`). 2. So `canonicalJson` hai bản.
- **Kết quả mong đợi:** ghi vào nội dung đã xuất bản bị từ chối; xoá bị từ chối (chỉ chuyển Retired); hai bản giống nhau từng byte sau chuẩn hoá; mỗi lần xác nhận lại tạo version mới
- **Hậu điều kiện:** không có
- **Tự động hoá:** `content-store.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (chưa có xuất bản FR-37)

### TC-F-GB-03 · Tiêu chí duyệt có phiên bản

- **Nguồn:** FR-32; DR-19; ERD `CRITERIA_VERSION`, `REVIEW_CRITERION`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hai phiên bản tiêu chí; một review đã làm với phiên bản 1
- **Dữ liệu vào:** sửa tiêu chí; tạo review mới
- **Các bước:** 1. Sửa bộ tiêu chí. 2. Tạo review mới. 3. Đọc review cũ.
- **Kết quả mong đợi:** sửa tạo phiên bản mới, không ghi đè phiên bản cũ; review mới gắn phiên bản mới; review cũ giữ phiên bản cũ
- **Hậu điều kiện:** không có
- **Tự động hoá:** `review-criteria.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được (xác nhận khi đọc `review-criteria.service.ts`)

### TC-F-ST-05 · Xác nhận lại hằng năm

- **Nguồn:** BR-15; FR-27; UC-D06, UC-C13; `AD-03b`; ERD `REVALIDATION_REQUEST.result`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** scenario Published; CA yêu cầu xác nhận lại
- **Dữ liệu vào:** DE kết luận "còn đúng"; DE kết luận "đã lỗi thời"
- **Các bước:** 1. CA yêu cầu. 2. DE trả kết quả. 3. Đọc trạng thái.
- **Kết quả mong đợi:** còn đúng → Published, ghi log; lỗi thời → đánh dấu cần thay thế (UC-C10), CA nhận thông báo; không gỡ tự động
- **Hậu điều kiện:** mỗi yêu cầu và kết quả có actor, thời điểm
- **Tự động hoá:** thủ công cho đến khi có xuất bản
- **Trạng thái:** Chờ hiện thực

### TC-F-ST-06 · Play-test: hai loại lỗi

- **Nguồn:** FR-26; UC-D08; `SD-07`; ERD `PLAYTEST_FINDING`; DR-11
- **Cấp · loại · kỹ thuật:** E2E · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** scenario In Playtest, bản chơi thử dựng xong
- **Dữ liệu vào:** báo lỗi hiển thị; báo lỗi nội dung; qua play-test
- **Các bước:** 1. DE chơi thử. 2. Báo từng loại. 3. Chơi lại sau sửa.
- **Kết quả mong đợi:** lỗi hiển thị → Approved (CA dựng lại); lỗi nội dung → Draft; qua → Ready; lượt chơi thử mang cờ play-test và không vào số liệu tổng hợp của explorer (DR-11)
- **Hậu điều kiện:** số liệu thống kê explorer không đổi
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực (play-test D05 chưa có)

### TC-F-UC-01 · Luồng đầy đủ soạn, duyệt, dựng, xuất bản

- **Nguồn:** UC-D01, UC-D02, UC-D04, UC-C07, UC-D08, UC-C09; `SD-05`, `SD-06`, `SD-07`, `SD-08`
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Cao
- **Tiền điều kiện:** nghề `SWE_BACKEND` có CA và hai DE; `AI_MODE=fake`
- **Dữ liệu vào:** luồng chính theo SM-01 từ mở scenario đến Published; luồng lỗi: kiểm tự động không đạt, yêu cầu sửa, lỗi hiển thị
- **Các bước:** 1. CA mở scenario và giao DE. 2. DE sinh và sửa bản nháp, nộp. 3. DE khác duyệt. 4. CA dựng bản chơi thử. 5. Play-test. 6. Xuất bản. Chi tiết bước đối chiếu sequence ở trên.
- **Kết quả mong đợi:** mỗi chuyển có log; người dùng chỉ thấy nút hợp lệ ở mỗi trạng thái; sau xuất bản explorer chơi được màn đó
- **Hậu điều kiện:** `LIFECYCLE_LOG` kể được toàn bộ lịch sử (nghiệm thu NFR-16: CA lần ra ai duyệt, ai xuất bản)
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực (staff app làm tới dựng bản nháp; chưa có play-test, xuất bản)

### TC-F-UC-02 · AI-1: DE được phỏng vấn theo chủ đề cố định

- **Nguồn:** `Giải pháp AI cho JobQuest.md` (AI-1: bộ chủ đề cố định, model chỉ đào sâu); ERD `TOPIC_GUIDE`, `EXPERT_INTERVIEW`, `INTERVIEW_TURN`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** bộ chủ đề của nghề; `AI_MODE=fake`
- **Dữ liệu vào:** DE trả lời đủ chủ đề; DE bỏ trống một chủ đề
- **Các bước:** 1. Mở phỏng vấn. 2. Trả lời từng chủ đề. 3. Kết thúc.
- **Kết quả mong đợi:** mọi chủ đề trong bộ đều được hỏi; mỗi lượt lưu `INTERVIEW_TURN`; chủ đề bỏ trống được đánh dấu chứ không tự điền
- **Hậu điều kiện:** phỏng vấn gắn đúng scenario hoặc gói cấp (`INTERVIEW_FOR_SCENARIO`, `INTERVIEW_FOR_PACK`)
- **Tự động hoá:** thủ công cho đến khi có `EXPERT_INTERVIEW`
- **Trạng thái:** Chờ hiện thực

### TC-F-NF-01 · Nghiệm thu truy vết lịch sử scenario

- **Nguồn:** NFR-16 (business verification); DR-13
- **Cấp · loại · kỹ thuật:** Acceptance · kiểm toán · thăm dò
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** một scenario đã Published qua đủ vòng
- **Dữ liệu vào:** không có
- **Các bước:** 1. Đưa CA một scenario và yêu cầu nói ai soạn, ai duyệt, ai xuất bản, khi nào, theo tiêu chí phiên bản nào.
- **Kết quả mong đợi:** CA trả lời đủ chỉ từ giao diện và log, không cần hỏi người khác
- **Hậu điều kiện:** không có
- **Tự động hoá:** thủ công
- **Trạng thái:** Chờ hiện thực

## Mục tiêu white box

### WB-F-01 · `apps/api/src/app/lifecycle/transitions.ts`

- **Tiêu chí phủ:** phủ nhánh; mọi dòng của bảng chuyển
- **Nhánh cần phủ:** 12 hành động hiện có; mỗi hành động ở trạng thái hợp lệ và không hợp lệ
- **Hiện có:** `scenario-state-machine.spec.ts` (phần chạm)
- **Trạng thái:** Chạy được

### WB-F-02 · `scenario-state-machine.ts` (`apply`, `allowedActions`)

- **Tiêu chí phủ:** MC/DC cho guard theo vai và trạng thái
- **Nhánh cần phủ:** mỗi hành động × vai (CA, DE tác giả, DE người duyệt) × trạng thái
- **Hiện có:** `scenario-state-machine.spec.ts`
- **Trạng thái:** Chạy được

### WB-F-03 · `content-store.ts` (`writeContent`, `readContent`)

- **Tiêu chí phủ:** phủ nhánh và phủ điều kiện (khoảng 53 điểm quyết định, 371 dòng)
- **Nhánh cần phủ:** ghi khi trạng thái cho phép sửa, ghi khi bị khoá, đọc theo version, đọc nội dung đã xuất bản
- **Hiện có:** chưa có spec riêng
- **Trạng thái:** Chạy được

### WB-F-04 · `review/assignment.service.ts`, `review/review.service.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `assign` và `reassign` với các nhánh 409 và 422; `decide`; `requireReviewer`
- **Hiện có:** chưa có spec
- **Trạng thái:** Chạy được

### WB-F-05 · `publishing/build.service.ts` (`snapshot`, `build`)

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** snapshot khi scenario ở trạng thái cho phép và không cho phép; dựng với asset thiếu
- **Hiện có:** chưa có spec
- **Trạng thái:** Chạy được

### WB-F-06 · `scenario/generation.processor.ts`, `ai/generation/scenario-generator.service.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** thử lại schema, sinh lại, đổi model, tạm dừng; ghi provenance
- **Hiện có:** `ai.module.spec.ts` chạm một phần; chưa có spec riêng
- **Trạng thái:** Chạy được
