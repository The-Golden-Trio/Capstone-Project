# Nhóm B · Danh mục nghề, hồ sơ nghề, môi trường làm việc

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `INTEREST_REGION`, `OCCUPATION_GROUP`, `OCCUPATION` (`difficulty_k`, `difficulty_tier`, `is_senior_entry`), `OCCUPATION_LEVEL` (`xu_per_mission`, `main_mission_count`, `side_quest_budget`), `BAND`, `LEVEL_TASK`, `SKILL_TIER`, `WORK_ENVIRONMENT`, `DEPARTMENT`, `COMPANY_TYPE`, `COMPANY`; quan hệ `REQUIRES_PRIOR` (`kind`, `reason`, `min_band`), `SIMILAR_TO`, `WORKS_IN`, `HAS_DEPARTMENT`.
- **Yêu cầu:** FR-05, FR-17, FR-21, FR-30; DR-15; BR-16; NFR-10. **Use case:** UC-C01, UC-D11, UC-E05, UC-E06, UC-E09, UC-E18. **Diagram:** `AD-02b`, `AD-03d`; class `CL-02`.
- **Code:** Prisma có `Domain`, `Occupation`, `OccupationLevel`, `Task`, `Downside`; `CatalogueModule` rút gọn (`catalogue.service.ts` chưa có spec). Chưa có `difficulty_k`, các thuộc tính dẫn xuất, `BAND`, `COMPANY`, `DEPARTMENT`. Explorer chạy chế độ `hybrid` với dữ liệu mẫu.

## Lớp tương đương và biên

| Biến                 | Giá trị hoặc lớp                                                     | Biên cần kiểm                                                                                              | Nguồn                            |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `difficulty_k`       | [1, 2]                                                               | 0,99; 1; 2; 2,01                                                                                           | D-115                            |
| `difficulty_tier`    | dễ: k < 1,4; vừa: < 1,75; khó: < 1,9; rất khó: còn lại               | 1,39 / 1,4 / 1,74 / 1,75 / 1,89 / 1,9                                                                      | D-115                            |
| `xu_per_mission`     | 100·√(lương / 13 triệu), sàn 60, trần 250                            | xu theo công thức < 60 → 60; = 60 (lương khoảng 4,68 triệu); = 250 (lương khoảng 81,25 triệu); > 250 → 250 | Kinh tế và sức khoẻ K2 (đã chốt) |
| `main_mission_count` | số keyword đầu ra + 1, kẹp trong [3, 6]                              | keyword đầu ra: 0, 1, 2, 3, 5 → 3, 3, 3, 4, 6                                                              | D-119                            |
| `side_quest_budget`  | ≤ 10% quỹ của cấp; quỹ = base × 0,746 × k^1,4                        | k = 1 và 2 ở L1 (base 300): khoảng 223,8 và 590,6; ngân sách phụ ≤ 22,4 và ≤ 59,1                          | D-114, D-119                     |
| Số cấp nghề ngoài IT | 4–7                                                                  | 3; 4; 7; 8                                                                                                 | D-117                            |
| `evidence_grade`     | A, B, C                                                              | giá trị khác                                                                                               | D-117                            |
| `OCCUPATION.status`  | nháp → xuất bản → ngừng                                              | chuyển ngược                                                                                               | FR-30, BR-16                     |
| Vùng quan tâm        | đúng 1 vùng mỗi nghề; 6 vùng; 221 nghề (50 + 33 + 48 + 38 + 17 + 35) | nghề không vùng; nghề hai vùng                                                                             | D-125                            |

## Thẻ ca kiểm

### TC-B-BVA-01 · Hệ số khó và bậc khó

- **Nguồn:** D-115; ERD `OCCUPATION.difficulty_k`, `difficulty_tier`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàm tính bậc khó nhận `k`
- **Dữ liệu vào:** 0,99; 1; 1,39; 1,4; 1,74; 1,75; 1,89; 1,9; 2; 2,01
- **Các bước:** 1. Gọi hàm với từng giá trị.
- **Kết quả mong đợi:** 0,99 và 2,01 bị từ chối; 1 và 1,39 → dễ; 1,4 và 1,74 → vừa; 1,75 và 1,89 → khó; 1,9 và 2 → rất khó
- **Hậu điều kiện:** hàm thuần, không đổi trạng thái
- **Tự động hoá:** `packages/game-core/src/domain/difficulty.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-BVA-02 · Xu mỗi màn quy từ lương

- **Nguồn:** Kinh tế và sức khoẻ, khối 1 "quy lương ra xu" (K2 chốt); D-133; ERD `OCCUPATION_LEVEL.xu_per_mission`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên (kèm property-based)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** lương đại diện của cấp lấy theo mục "quy lương ra xu" của nguồn
- **Dữ liệu vào:** lương đại diện: 4 triệu, 4,68 triệu, 13 triệu, 81,25 triệu, 100 triệu
- **Các bước:** 1. Tính xu cho từng giá trị.
- **Kết quả mong đợi:** 60 (sàn), 60, 100, 250, 250 (trần); với mọi lương > 0 kết quả nằm trong [60, 250] và không giảm khi lương tăng
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/economy.spec.ts` (dự kiến, thêm property-based)
- **Trạng thái:** Chờ hiện thực

### TC-B-BVA-03 · Số màn chính mỗi cấp

- **Nguồn:** D-119 (đã chốt); Cơ chế game, khối G; ERD `main_mission_count`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** số keyword đầu ra của cấp (tối đa 5 theo G2, giữ tạm)
- **Dữ liệu vào:** 0, 1, 2, 3, 5 keyword đầu ra
- **Các bước:** 1. Tính số màn chính.
- **Kết quả mong đợi:** 3, 3, 3, 4, 6 (số keyword + 1, kẹp tối thiểu 3, tối đa 6)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/levels.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-BVA-04 · Quỹ nhiệm vụ phụ

- **Nguồn:** D-114, D-119; ERD `side_quest_budget`, `BAND.base_budget`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** bảng `BAND.base_budget` (L1 300 … L9 2.700)
- **Dữ liệu vào:** L1 với k = 1 và k = 2; L9 với k = 1
- **Các bước:** 1. Tính quỹ cấp = base × 0,746 × k^1,4. 2. Tính trần nhiệm vụ phụ = 10% quỹ.
- **Kết quả mong đợi:** quỹ L1 khoảng 223,8 (k = 1) và 590,6 (k = 2); `side_quest_budget` ≤ 10% quỹ; luật làm tròn theo nguồn chưa nêu nên kiểm bất biến 0 ≤ ngân sách ≤ 10% quỹ
- **Hậu điều kiện:** không có
- **Tự động hoá:** `levels.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-EP-01 · Số cấp của nghề ngoài IT

- **Nguồn:** D-117; ERD `HAS_LEVEL`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hồ sơ nghề ngoài IT, nghề IT có số cấp riêng (ví dụ Trưởng nhóm kỹ thuật có 2 cấp)
- **Dữ liệu vào:** nghề ngoài IT có 3, 4, 7, 8 cấp
- **Các bước:** 1. Nhập nghề. 2. Kiểm tra hợp lệ.
- **Kết quả mong đợi:** 4 và 7 hợp lệ; 3 và 8 bị từ chối; nghề IT không áp khoảng 4–7
- **Hậu điều kiện:** nghề bị từ chối không được xuất bản
- **Tự động hoá:** `apps/api/src/app/catalogue/catalogue.service.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-EP-02 · Cấp độ bằng chứng và loại tăng ca

- **Nguồn:** D-117; Kinh tế và sức khoẻ, khối 1 "thưởng và OT ra xu"; ERD `evidence_grade`, `WORK_ENVIRONMENT.overtime_pay`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** không có
- **Dữ liệu vào:** `evidence_grade` ∈ {A, B, C, D}; từng giá trị `overtime_pay` theo bảng nguồn
- **Các bước:** 1. Nhập giá trị. 2. Tính xu OT hoặc hiệu ứng sức khoẻ.
- **Kết quả mong đợi:** D bị từ chối; mỗi loại `overtime_pay` cho đúng hệ số trong bảng của nguồn (xem dòng 120 của file Kinh tế và sức khoẻ)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `economy.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-DT-01 · Vào nghề cấp cao (D-121)

- **Nguồn:** D-121 (đã chốt); ERD `OCCUPATION.is_senior_entry`, `REQUIRES_PRIOR`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** nghề đích có `is_senior_entry` = đúng (12 nghề không có cấp vào tự do)
- **Dữ liệu vào:** hai điều kiện
- **Các bước:** 1. Dựng người chơi theo từng hàng. 2. Hỏi quyền vào.
- **Kết quả mong đợi:**

| Đã xong một cấp nghề đi trước với band ≥ (band vào − 1) | Mọi nhóm soft skill ở mốc 60% | Vào được |
| ------------------------------------------------------- | ----------------------------- | -------- |
| có                                                      | có                            | có       |
| có                                                      | không                         | không    |
| không                                                   | có                            | không    |
| không                                                   | không                         | không    |

Thêm hai ca biên: band đúng bằng (band vào − 1) → thoả; (band vào − 2) → không thoả.

- **Hậu điều kiện:** màn giải thích nêu điều kiện còn thiếu
- **Tự động hoá:** `packages/game-core/src/domain/bands.spec.ts` (mở rộng)
- **Trạng thái:** Chờ hiện thực

### TC-B-ST-01 · Vòng đời nghề: nháp, xuất bản, ngừng

- **Nguồn:** FR-30; BR-16; DR-15; UC-C01
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** nghề ở trạng thái nháp, thiếu mô tả một cấp
- **Dữ liệu vào:** hành động xuất bản; bổ sung mô tả rồi xuất bản; ngừng; xuất bản lại nghề đã ngừng
- **Các bước:** 1. Xuất bản. 2. Bổ sung đủ trường. 3. Xuất bản. 4. Ngừng. 5. Xuất bản lại.
- **Kết quả mong đợi:** bước 1 bị từ chối vì thiếu trường bắt buộc hoặc mô tả cấp; bước 3 thành công; bước 4 gỡ nghề khỏi explorer; bước 5 bị từ chối
- **Hậu điều kiện:** nghề đã ngừng không xuất hiện cho explorer nhưng dữ liệu cũ giữ nguyên
- **Tự động hoá:** `catalogue.service.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (chưa có xuất bản FR-37, theo 07 A26(3))

### TC-B-GB-01 · Mỗi nghề đúng một vùng quan tâm; 221 nghề

- **Nguồn:** D-125; `occupation-data/decisions/interest_regions.json`; ERD `IN_REGION`
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** DB đã seed danh mục
- **Dữ liệu vào:** không có
- **Các bước:** 1. Đếm nghề theo vùng. 2. Đếm nghề không vùng và nghề hai vùng.
- **Kết quả mong đợi:** 6 vùng; số nghề 50, 33, 48, 38, 17, 35 (tổng 221); không nghề nào thiếu hoặc thừa vùng
- **Hậu điều kiện:** không có
- **Tự động hoá:** `apps/api/src/scripts/seed-content.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-GB-02 · Nghề xuất bản có đủ trường và mô tả mọi cấp

- **Nguồn:** DR-15; FR-21
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** có nghề xuất bản
- **Dữ liệu vào:** không có
- **Các bước:** 1. Truy vấn nghề xuất bản thiếu trường bắt buộc. 2. Truy vấn cấp thiếu mô tả.
- **Kết quả mong đợi:** cả hai truy vấn trả về rỗng
- **Hậu điều kiện:** không có
- **Tự động hoá:** test truy vấn toàn vẹn (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-DU-01 · Thuộc tính dẫn xuất nhóm B tính lại được

- **Nguồn:** ERD nhóm B; mục 6 file chiến lược
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** bộ dữ liệu gốc của một nghề
- **Dữ liệu vào:** như `TC-B-BVA-01…04` và `TC-B-DT-01`
- **Các bước:** 1. Với mỗi thuộc tính, xoá giá trị lưu rồi tính lại từ nguồn gốc. 2. So sánh.
- **Kết quả mong đợi:** `difficulty_tier` ← `difficulty_k`; `is_senior_entry` ← `REQUIRES_PRIOR.kind`; `xu_per_mission` ← `salary`; `main_mission_count` ← `TRAINS`; `side_quest_budget` ← `BAND`, `difficulty_k`; `min_band` ← `AT_BAND` của nghề đi trước. Giá trị tính lại bằng giá trị lưu
- **Hậu điều kiện:** không có
- **Tự động hoá:** `game-core` spec, mỗi thuộc tính một dòng kiểm (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-B-EG-01 · Nghề mới không cần sửa code

- **Nguồn:** NFR-10; UC-C01
- **Cấp · loại · kỹ thuật:** Acceptance · bảo trì · thăm dò
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** CA đăng nhập staff app; không có thay đổi code nào đang chờ triển khai
- **Dữ liệu vào:** một nghề thử với hồ sơ đủ
- **Các bước:** 1. CA tạo nghề qua giao diện. 2. DE thêm hồ sơ. 3. Xuất bản. 4. Ghi lại mọi lần triển khai.
- **Kết quả mong đợi:** nghề xuất hiện cho explorer; nhật ký triển khai không có thay đổi code
- **Hậu điều kiện:** nghề thử được gỡ
- **Tự động hoá:** thủ công
- **Trạng thái:** Chờ hiện thực (cần xuất bản)

### TC-B-UC-01 · UC-E05, UC-E06, UC-E09, UC-E18: khám phá nghề

- **Nguồn:** FR-05, FR-17; `AD-01c`
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer đăng nhập; có nghề đã xuất bản
- **Dữ liệu vào:** luồng chính: mở bản đồ → chọn nghề → xem hồ sơ → xem mô tả cấp → xem lộ trình
- **Các bước:** 1. Theo luồng chính. 2. Mở nghề đã ngừng bằng đường dẫn trực tiếp.
- **Kết quả mong đợi:** hồ sơ có việc hằng ngày theo cấp, lương, lộ trình; nghề đã ngừng trả 404 hoặc thông báo tiếng Việt
- **Hậu điều kiện:** không có
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực (chưa có `GET /occupations/{id}`, 07 A26(7))

### TC-B-BLK-01 · Bộ phận trong công ty (`DEPARTMENT`, 353 bộ phận)

- **Nguồn:** ERD chú thích `[CAM]`; `Hồ sơ NPC JobQuest.md` §5.7, §8; `HAS_DEPARTMENT (2,4)`
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: mỗi loại công ty có 2–4 bộ phận, mỗi bộ phận có quy tắc trang phục. Lý do chặn: danh sách 353 bộ phận chờ nhóm duyệt

## Mục tiêu white box

### WB-B-01 · `apps/api/src/app/catalogue/catalogue.service.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** nghề tồn tại hay không; theo mã nghề hay theo uuid; trạng thái nghề; lọc theo vùng
- **Hiện có:** chưa có spec
- **Trạng thái:** Chạy được
