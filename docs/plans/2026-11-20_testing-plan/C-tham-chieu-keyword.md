# Nhóm C · Dữ liệu tham chiếu, soft skill, keyword, thư viện chấm

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `IMPORT_BATCH`, `IMPORT_ISSUE` (yếu), `ONET_OCCUPATION`, `ESCO_OCCUPATION`, `ESCO_SKILL_GROUP`, `KEYWORD`, `SOFT_SKILL_GROUP`, `SOFT_SKILL_ITEM`, `CHECK_QUESTION`, `CONDUCT_FLAG`; quan hệ `MAPS_TO_ONET`, `MAPS_TO_ESCO`, `IN_SKILL_GROUP`, `TRANSFERS_TO` (`s`, `credit`), `REQUIRES_KEYWORD` (`kind`, `rank`, `max_proficiency`, `is_optional_supplement`), `TRAINS` (`proficiency`), `TIER_NAME`, `BUDGETS` (`points`, `is_focus`, `required_tier`).
- **Yêu cầu:** FR-31, FR-21; DR-01, DR-02, DR-03; D-114, D-118, D-120, D-123. **Use case:** UC-C02, UC-D05. **Diagram:** `AD-02c`, `SD-09`; class `CL-02`.
- **Code:** chưa có bảng nào của nhóm này. `staff` có `ReferenceImportPage` chạy trên dữ liệu mẫu. Có `packages/game-core/src/profile/softSkills.ts` (`tierOf`, `keptTier`, `tierProgress`) và `domain/grading/keywordGrader.ts` (của prototype, không phải thiết kế). Dữ liệu research sinh ra: `occupation-data/generated/keyword_map.json` (221 nghề).

## Lớp tương đương và biên

| Biến                                        | Giá trị hoặc lớp                                                                                 | Biên                                                                                | Nguồn                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| Số keyword mỗi nghề (`REQUIRES_KEYWORD`)    | 5–10                                                                                             | 4; 5; 10; 11                                                                        | ERD `(5,10)`, G-10                            |
| Số keyword nâng mỗi cấp (`TRAINS`)          | 0–5                                                                                              | 0; 1; 5; 6                                                                          | ERD `(0,5)`; G2 "giữ tạm"                     |
| Số nghề ESCO và O\*NET của một nghề         | 1–2                                                                                              | 0; 1; 2; 3                                                                          | D-123; ERD `(1,2)`                            |
| Bậc kỹ năng (điểm tích luỹ mỗi nhóm)        | bậc 0 từ 0; 1 từ 500; 2 từ 1.500; 3 từ 3.000; 4 từ 6.000; 5 từ 10.000; trần 10.000               | 499 / 500 / 1.499 / 1.500 / 2.999 / 3.000 / 5.999 / 6.000 / 9.999 / 10.000 / 10.001 | D-114 (đã chốt; Cơ chế game D1 còn ghi "tạm") |
| Quỹ điểm của cấp (`BUDGETS`)                | đúng 7 dòng, mỗi nhóm soft skill một dòng; nhóm trọng tâm nhân 1,6; tác giả dời tối đa 30%       | 6 và 8 dòng; dời 30% và 31%                                                         | ERD `(7,7)`; Cơ chế game                      |
| Mức thành thạo của keyword                  | Làm quen 1, Thành thạo 2, Chuyên sâu 3                                                           |                                                                                     | D-120                                         |
| Hệ số chuyển đổi `credit` theo độ giống `s` | cùng nhóm = 1; 0,75 ≤ s: 0,5; 0,5 ≤ s < 0,75: 0,25; s < 0,5: 0; lấy giá trị lớn nhất, không cộng | 0,75 / 0,7499 / 0,5 / 0,4999                                                        | D-118                                         |
| Mục con soft skill                          | 42 mục con trong 7 nhóm                                                                          |                                                                                     | Seed scenario E1                              |

## Thẻ ca kiểm

### TC-C-BVA-01 · Số keyword của một nghề

- **Nguồn:** ERD `REQUIRES_KEYWORD (5,10)`; G-10; `occupation-data/generated/keyword_map.json`
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** validator của nghề
- **Dữ liệu vào:** nghề có 4, 5, 10, 11 keyword
- **Các bước:** 1. Kiểm tra hợp lệ từng nghề. 2. Chạy trên `keyword_map.json` (221 nghề).
- **Kết quả mong đợi:** 4 và 11 bị từ chối; 5 và 10 hợp lệ; trên dữ liệu thật mọi nghề trong [5, 10], giá trị nhỏ nhất là 5 (`ONET-43-4031.00`, bù bằng 4 kỹ năng tuỳ chọn), trung bình khoảng 9,4 theo research
- **Hậu điều kiện:** không có
- **Tự động hoá:** `occupation-data/scripts` kiểm tra hoặc `packages/game-core/src/data/keywordMap.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được (kiểm dữ liệu sinh); Chờ hiện thực (kiểm trong DB)

### TC-C-BVA-02 · Số keyword nâng mỗi cấp

- **Nguồn:** ERD `TRAINS (0,5)`; Cơ chế game, khối G (mỗi cấp nâng tối đa 5 keyword; G2 giữ tạm)
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** tham số trần = 5 (cấu hình được)
- **Dữ liệu vào:** cấp nâng 0, 1, 5, 6 keyword
- **Các bước:** 1. Kiểm tra từng cấp.
- **Kết quả mong đợi:** 6 bị từ chối; 0–5 hợp lệ; đổi tham số trần thì biên dịch chuyển theo
- **Hậu điều kiện:** không có
- **Tự động hoá:** `levels.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-BVA-03 · Bậc soft skill theo điểm tích luỹ

- **Nguồn:** D-114; ERD `SKILL_TIER.min_points`; `profile/softSkills.ts` (`tierOf`)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** bảng ngưỡng nạp từ `SKILL_TIER`, không viết cứng trong test
- **Dữ liệu vào:** 0; 499; 500; 1.499; 1.500; 2.999; 3.000; 5.999; 6.000; 9.999; 10.000; 10.001
- **Các bước:** 1. Gọi `tierOf` với từng giá trị.
- **Kết quả mong đợi:** bậc 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5; điểm 10.001 bị kẹp về trần 10.000 của nhóm
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/profile/profile.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được (ngưỡng cần đối chiếu với D-114)

### TC-C-BVA-04 · Mức thành thạo tối đa của keyword

- **Nguồn:** D-120; Cơ chế game, khối G ("Mức cao nhất theo độ cốt lõi"); ERD `REQUIRES_KEYWORD.max_proficiency`
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** nghề có 10 keyword xếp theo độ cốt lõi: hai keyword cốt lõi đầu, rồi xen kẽ đặc trưng và cốt lõi
- **Dữ liệu vào:** danh sách 10 keyword; thử thêm danh sách 5 và 7 keyword
- **Các bước:** 1. Tính `max_proficiency`.
- **Kết quả mong đợi:** với 10 keyword: 3 Chuyên sâu (30% đầu), 2 Làm quen (20% cuối), 5 Thành thạo; hai keyword cốt lõi đầu luôn là Chuyên sâu. Với 5 và 7 keyword, luật làm tròn nguồn chưa nêu: chỉ kiểm bất biến (có ít nhất 1 Chuyên sâu ở đầu, Làm quen ở cuối, thứ tự không đảo)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `occupation-data` pipeline test (dự kiến)
- **Trạng thái:** Chạy được (kiểm dữ liệu sinh)

### TC-C-DT-01 · Tín chỉ chuyển đổi giữa nhóm kỹ năng

- **Nguồn:** D-118 (đã chốt); Cơ chế game, khối G; ERD `TRANSFERS_TO.s`, `credit`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàm quy đổi nhận cặp nhóm kỹ năng và độ giống `s`
- **Dữ liệu vào:** theo bảng
- **Các bước:** 1. Tính `credit` cho từng hàng. 2. Với keyword thuộc nhiều nhóm, tính theo nhóm tốt nhất.
- **Kết quả mong đợi:**

| Quan hệ   | `s`           | `credit` |
| --------- | ------------- | -------- |
| cùng nhóm | không áp dụng | 1        |
| khác nhóm | 0,75 trở lên  | 0,5      |
| khác nhóm | 0,7499        | 0,25     |
| khác nhóm | 0,5           | 0,25     |
| khác nhóm | 0,4999        | 0        |

Nhiều nhóm cùng có tín chỉ cho một keyword: lấy lớn nhất, không cộng (G-03).

- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/transfer.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-DT-02 · Quy A, B, C ra mức 0, 1, 2

- **Nguồn:** Seed scenario E2 "Quy ra mức" (G-02); D-116; ERD `CHECK_QUESTION` (slot A/B/C)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** judge trả lời có/không cho từng câu A, B, C của một mục con
- **Dữ liệu vào:** cả 8 tổ hợp A, B, C
- **Các bước:** 1. Quy ra mức cho từng tổ hợp. 2. Thêm trường hợp mục con "không xét".
- **Kết quả mong đợi:** A và B có, C không → 1; A, B, C đều có → 2; mọi tổ hợp còn lại → 0; mục con "không xét" bị loại khỏi trung bình, A, B, C không thể "không xét" riêng lẻ (Seed E2, luật viết số 5)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/grading/checklist.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (luật quy mức theo E2, gắn nhãn "nháp E2"; văn bản câu hỏi thuộc `TC-C-BLK-01`)

### TC-C-DT-03 · Keyword thuộc nhiều nhóm ESCO

- **Nguồn:** G-03; Cơ chế game, khối G ("mỗi keyword nghề đích lấy nhóm tốt nhất"); ERD `IN_SKILL_GROUP`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** keyword K thuộc hai nhóm G1 và G2; người chơi có mức ở G1 là 2 và ở G2 là 1
- **Dữ liệu vào:** nghề đích cần K
- **Các bước:** 1. Tính độ phủ của K.
- **Kết quả mong đợi:** dùng nhóm có tín chỉ cao nhất, tính một lần; keyword thuộc nhiều nhóm không nặng hơn keyword thuộc một nhóm
- **Hậu điều kiện:** không có
- **Tự động hoá:** `transfer.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-ST-01 · Lô import: nhập, liệt kê lỗi, xử lý, báo DE

- **Nguồn:** FR-31; UC-C02; `AD-02c`, `SD-09`; ERD `IMPORT_BATCH.status`, `IMPORT_ISSUE.resolved_at` (giá trị `status` không được liệt kê; vòng đời suy ra từ use case)
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** tệp O\*NET và ESCO nhỏ, có một dòng không khớp mã
- **Dữ liệu vào:** tệp hợp lệ; tệp có dòng lỗi; xử lý từng lỗi (sửa hoặc bỏ qua)
- **Các bước:** 1. CA tải tệp. 2. Xem danh sách lỗi. 3. Xử lý từng lỗi. 4. Hoàn tất.
- **Kết quả mong đợi:** dòng lỗi thành `IMPORT_ISSUE` với `reason`; xử lý xong đặt `resolved_at`; DE liên quan được thông báo (`NOTIFICATION`); bản ghi đã nhập khớp mã nguồn
- **Hậu điều kiện:** nhập lại cùng tệp không tạo bản trùng
- **Tự động hoá:** `import.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-GB-01 · Bản ghi import khớp mã nguồn

- **Nguồn:** DR-01; ERD `MAPS_TO_ONET`, `MAPS_TO_ESCO (1,2)`
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** DB đã import
- **Dữ liệu vào:** không có
- **Các bước:** 1. Tìm bản ghi trỏ tới `soc_code` hoặc `esco_uri` không tồn tại. 2. Đếm số nghề ESCO và O\*NET của mỗi nghề.
- **Kết quả mong đợi:** không có tham chiếu mồ côi; mỗi nghề có 1–2 nghề ESCO và 1–2 nghề O\*NET
- **Hậu điều kiện:** không có
- **Tự động hoá:** test truy vấn toàn vẹn (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-GB-02 · Danh mục soft skill 7 nhóm, 42 mục con

- **Nguồn:** DR-02; Seed scenario E1; ERD `SOFT_SKILL_GROUP`, `SOFT_SKILL_ITEM`, `OBSERVED_ITEM`
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** DB đã seed danh mục
- **Dữ liệu vào:** không có
- **Các bước:** 1. Đếm nhóm và mục con. 2. Tìm mục `OBSERVED_ITEM` không trỏ tới mục con.
- **Kết quả mong đợi:** 7 nhóm, 42 mục con; không `OBSERVED_ITEM` mồ côi; mỗi mục con có `indicator`
- **Hậu điều kiện:** không có
- **Tự động hoá:** test truy vấn toàn vẹn (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-GB-03 · Quỹ điểm đúng 7 dòng, trần mỗi nhóm

- **Nguồn:** ERD `BUDGETS (7,7)`; D-114; Cơ chế game, khối G
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** cấp nghề đã seed
- **Dữ liệu vào:** cấp có 6, 7, 8 dòng `BUDGETS`; dời quỹ 30% và 31%
- **Các bước:** 1. Lưu cấp. 2. Kiểm tra tổng quỹ.
- **Kết quả mong đợi:** chỉ cấp có 7 dòng được lưu; dời quỹ không quá 30% và tổng quỹ giữ nguyên; `is_focus` đúng cho nhóm trọng tâm (nhân 1,6)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `levels.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-DU-01 · Thuộc tính dẫn xuất nhóm C tính lại được

- **Nguồn:** ERD `REQUIRES_KEYWORD.max_proficiency`, `BUDGETS.is_focus`, `BUDGETS.required_tier`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** dữ liệu gốc của một nghề
- **Dữ liệu vào:** như `TC-C-BVA-04`, `TC-C-GB-03`
- **Các bước:** 1. Xoá giá trị lưu rồi tính lại. 2. So sánh.
- **Kết quả mong đợi:** `max_proficiency` ← thứ hạng `rank` và tỉ lệ 30/50/20; `is_focus` ← nhóm trọng tâm của cấp; `required_tier` ← 60% quỹ các cấp trước (D-118, mức vào cấp). Giá trị tính lại bằng giá trị lưu
- **Hậu điều kiện:** không có
- **Tự động hoá:** pipeline test (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-C-EG-01 · Keyword quá chung và trùng nghĩa với soft skill

- **Nguồn:** Cơ chế game, khối G (bỏ kỹ năng chung, ngoại ngữ, bộ 40 kỹ năng nghiên cứu); `Gợi ý nghề` ghi chú keyword quá chung
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · đoán lỗi
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** `keyword_map.json`
- **Dữ liệu vào:** kho keyword 1.414
- **Các bước:** 1. Tìm keyword thuộc nhóm ESCO trùng 7 nhóm soft skill. 2. Tìm kỹ năng ngoại ngữ S1.15.1 (trừ biên dịch, phiên dịch). 3. Đếm keyword cùng gốc từ trong một nghề.
- **Kết quả mong đợi:** không có keyword soft skill hoặc ngoại ngữ trong kho; mỗi nghề chỉ giữ một keyword cho cặp kỹ năng và kiến thức cùng gốc
- **Hậu điều kiện:** không có
- **Tự động hoá:** pipeline test (dự kiến)
- **Trạng thái:** Chạy được (kiểm dữ liệu sinh)

### TC-C-BLK-01 · Thư viện câu hỏi có/không và 13 cờ chung

- **Nguồn:** Seed scenario E2 (nháp); ERD `CHECK_QUESTION`, `CONDUCT_FLAG`, `SOFT_SKILL_ITEM.consider_condition` (đều `[CAM]`)
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: mỗi mục con có A, B, C, điều kiện xét và cờ hay gặp; cờ chỉ ghi cho hành vi có hại ở mọi nơi làm việc hoặc trái quy định đã nói. Lý do chặn: câu chữ là suy luận của nhóm, chờ duyệt; cần bộ nhỏ có người Việt gắn nhãn trước khi tin thư viện (Seed E2, "Rủi ro")

### TC-C-BLK-02 · Tên bậc, thành phần O\*NET

- **Nguồn:** ERD `[CAM]` `TIER_NAME` (35 tên bậc, H5/D2), `SOFT_SKILL_GROUP.onet_elements` (B2)
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: mỗi nhóm có đủ tên cho bậc 1–5 và bậc 1 không là lời chê. Lý do chặn: danh sách 35 tên và bảng nối O\*NET chưa duyệt

## Mục tiêu white box

### WB-C-01 · `packages/game-core/src/profile/softSkills.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `tierOf` ở từng biên; `keptTier` khi điểm giảm hoặc không đổi; `tierProgress` ở bậc đầu và bậc cuối
- **Hiện có:** có trong `profile.spec.ts`; thêm biên theo `TC-C-BVA-03`
- **Trạng thái:** Chạy được

### WB-C-02 · `packages/game-core/src/domain/grading/keywordGrader.ts`

- **Tiêu chí phủ:** chỉ phủ để làm baseline cho §7.3 (so với judge panel), không mở rộng
- **Nhánh cần phủ:** theo mã hiện có; ghi chú đây là code prototype, thiết kế là judge panel bất đồng bộ
- **Hiện có:** chưa có spec
- **Trạng thái:** Chạy được
