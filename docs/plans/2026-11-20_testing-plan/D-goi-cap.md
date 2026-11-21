# Nhóm D · Gói cấp

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `LEVEL_PACK` (`status`, `workplace`, `team`, `level_scope`, `honest_note`, `rules`, `shared_facts`, `action_costs`, `hr_open`, `hr_close`, `followup_cap`, `minutes_per_point`, `onboarding_slides`), `RESIDENT_SLOT` (yếu); quan hệ `STAGES`, `AUTHORS_PACK`, `HAS_RESIDENT`, `FILLS_RESIDENT`.
- **Yêu cầu:** FR-09, FR-12, FR-22; BR-07; D-127. **Use case:** UC-E12, UC-D01. **Diagram:** `SD-05`; class `CL-03` (ScenarioAuthoringAndLifecycle).
- **Code:** gói cấp là tài liệu JSON `LevelPackDoc` (không chuẩn hoá, chưa có `RESIDENT_SLOT`). Seed vàng `occupation-data/seeds/SWE_BACKEND/L3.pack.json`. `shift/lint.ts` (`lintSeed`) kiểm seed.

## Lớp tương đương và biên

| Biến                  | Giá trị hoặc lớp                                 | Biên                   | Nguồn                 |
| --------------------- | ------------------------------------------------ | ---------------------- | --------------------- |
| `rules`               | 2–3 luật thật                                    | 0; 1; 2; 3; 4          | Seed scenario, khối G |
| `minutes_per_point`   | số dương cố định; văn phòng IT = 5; nhà hàng = 2 | 0; âm; 1; 5            | D-127                 |
| `FILLS_RESIDENT`      | một slot thường trú có không hoặc một thẻ NPC    | 0; 1; 2 thẻ            | ERD `(0,1)`           |
| `onboarding_slides`   | 6 trang, không AI, không chấm, không tính là màn | 5; 6; 7                | Seed scenario, khối G |
| `honest_note`         | bắt buộc, không rỗng                             | rỗng; chỉ khoảng trắng | BR-07                 |
| `hr_open`, `hr_close` | giờ làm việc, mở trước đóng                      | mở = đóng; mở > đóng   | ERD                   |

## Thẻ ca kiểm

### TC-D-EP-01 · Số luật của gói

- **Nguồn:** Seed scenario, khối G ("2–3 luật thật"); ERD `LEVEL_PACK.rules`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** gói mẫu hợp lệ
- **Dữ liệu vào:** gói có 0, 1, 2, 3, 4 luật
- **Các bước:** 1. Chạy `lintSeed` trên từng gói.
- **Kết quả mong đợi:** 2 và 3 hợp lệ; 0, 1, 4 báo lỗi
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/shift/lint.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được (xác nhận khi đọc `lint.ts`)

### TC-D-BVA-01 · Số phút mỗi điểm thời gian

- **Nguồn:** D-127 (đã chốt); Luật dẫn truyện A1; ERD `LEVEL_PACK.minutes_per_point`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** gói văn phòng IT (5) và gói nhà hàng (2)
- **Dữ liệu vào:** `minutes_per_point` = −1, 0, 1, 2, 5
- **Các bước:** 1. Kiểm tra gói. 2. Đổi khoảng giờ thành quỹ điểm = (giờ kết thúc − giờ bắt đầu) ÷ `minutes_per_point`.
- **Kết quả mong đợi:** −1 và 0 bị từ chối; 1, 2, 5 hợp lệ; gói văn phòng IT (5 phút một điểm) cho ca 140 phút ra 28 điểm, khớp ví dụ 28 điểm của Luật dẫn truyện A1
- **Hậu điều kiện:** không có
- **Tự động hoá:** `shift/lint.spec.ts`, `shift/time.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-D-EP-02 · `honest_note` bắt buộc

- **Nguồn:** BR-07; Seed scenario, khối G
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** gói mẫu
- **Dữ liệu vào:** `honest_note` rỗng; chỉ khoảng trắng; có nội dung
- **Các bước:** 1. Kiểm tra gói.
- **Kết quả mong đợi:** hai trường hợp đầu bị từ chối; trường hợp cuối hợp lệ
- **Hậu điều kiện:** không có
- **Tự động hoá:** `shift/lint.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (xác nhận lint có kiểm trường này)

### TC-D-GB-01 · Slot thường trú và thẻ NPC

- **Nguồn:** ERD `FILLS_RESIDENT (0,1)`; Seed scenario, khối G và C
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** gói có hai slot thường trú
- **Dữ liệu vào:** gán 0, 1, 2 thẻ NPC cho một slot
- **Các bước:** 1. Gán. 2. Đọc lại.
- **Kết quả mong đợi:** gán thẻ thứ hai cho cùng một slot bị từ chối; slot chưa gán thẻ vẫn hợp lệ; mỗi màn dùng gói này có ít nhất một slot thường trú (kiểm ở nhóm E)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `level-pack.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-D-DU-01 · `onboarding_slides` tính lại được

- **Nguồn:** ERD `LEVEL_PACK.onboarding_slides` (dẫn xuất); Seed scenario, khối G
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** gói mẫu
- **Dữ liệu vào:** gói có đủ và thiếu các trang giới thiệu
- **Các bước:** 1. Dựng màn onboard từ gói. 2. Đếm trang.
- **Kết quả mong đợi:** 6 trang; không gọi AI; không sinh `ASSESSMENT`; không tính vào số màn chính của cấp
- **Hậu điều kiện:** không có
- **Tự động hoá:** `shift` spec (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-D-EG-01 · Rút công ty theo trọng số ngành

- **Nguồn:** Seed scenario, khối G ("công ty rút theo trọng số ngành thật"); ERD `WORKS_IN.weight`, `weight_status`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · đoán lỗi
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** bộ sinh số ngẫu nhiên có hạt giống (`domain/rng.ts`)
- **Dữ liệu vào:** 10.000 lần rút với trọng số đã biết, hạt giống cố định
- **Các bước:** 1. Rút. 2. So tần suất với trọng số.
- **Kết quả mong đợi:** tần suất lệch trọng số không quá ngưỡng thống kê chọn trước (ví dụ kiểm chi-bình phương mức 5%); cùng hạt giống cho cùng kết quả; công ty có `weight_status` tạm thời vẫn được rút (157 trên 221 nghề đang tạm thời)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/rng.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-D-BLK-01 · `followup_cap` và trạng thái gói

- **Nguồn:** ERD `LEVEL_PACK.followup_cap` (không có số ở đâu); FR-12 chỉ ghi "giới hạn của hoạt động"; `LEVEL_PACK.status` qua `REVIEWS_PACK` và `LIFECYCLE_LOG` (giá trị chưa định nghĩa)
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: số câu hỏi thêm tối đa có biên và bị chặn đúng; gói đi qua vòng duyệt có log. Lý do chặn: chưa có số cho `followup_cap`, chưa có danh sách trạng thái gói

### TC-D-UC-01 · UC-E12 xem ngữ cảnh trước màn

- **Nguồn:** FR-09; UC-E12; NFR-09
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer đã vào cấp; gói và màn đã xuất bản
- **Dữ liệu vào:** luồng chính: onboard 6 trang → ngữ cảnh → bắt đầu màn
- **Các bước:** 1. Đi qua onboard. 2. Đọc ngữ cảnh. 3. Bắt đầu.
- **Kết quả mong đợi:** ngữ cảnh nêu mục tiêu rõ khi nào xong (`goal`), không lộ cách giải; `honest_note` hiển thị theo BR-07; không gọi AI khi onboard
- **Hậu điều kiện:** chưa tạo `SCENARIO_RUN` nếu chưa bấm bắt đầu
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực

## Mục tiêu white box

### WB-D-01 · `packages/game-core/src/shift/lint.ts` (phần gói)

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** từng luật lint áp vào gói: số luật, `minutes_per_point`, `hr_open` < `hr_close`, `action_costs` đủ loại hành động, `shared_facts`
- **Hiện có:** chỉ có `engine.spec.ts` chạm tới lint; chưa có spec riêng. Danh sách nhánh chính xác lấy khi đọc `lint.ts` (khoảng 63 điểm quyết định)
- **Trạng thái:** Chạy được
