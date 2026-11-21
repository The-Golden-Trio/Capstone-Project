# Nhóm K · Kinh tế, sức khoẻ, lịch, quan hệ NPC

Thuộc [testing plan](../2026-11-20_testing-plan.md). Mọi ca kiểm nhóm này ở trạng thái _Chờ hiện thực_ hoặc _Chặn_: **chưa có code nào** (khảo sát 20/11: không có xu, cửa hàng, sức khoẻ, thói quen, cột mốc, độ thân trong API, web, staff hay game-core; chữ "inventory", "health" chỉ xuất hiện trong dữ liệu demo và breaker của gateway). Ca kiểm viết trước để làm tiêu chí nghiệm thu.

## Phạm vi

- **ERD:** `XU_TRANSACTION` (`kind`, `amount`, `unit_price_paid`), `SHOP_ITEM`, `INVENTORY_ITEM` (`uses_left`), `HEALTH_CHANGE` (`delta`, `reason`), `CAREER_HABIT`, `OCCASION`, `GAP` (`slots_total`, `slots_used`), `LIFE_MILESTONE`, `EXPLORER_MILESTONE`, `INTIMACY_GAIN`; quan hệ `KNOWS` (`intimacy_points`), `HAS_HABIT (0,3)` (`slot_no`), `WARNED` (`shown_at`), `PLACES_DECOR`; thuộc tính của `EXPLORER`: `balance`, `savings`, `savings_locked`, `health_value`, `health_cap`, `consecutive_ot`, `slow_recovery`, `gap_slots_left`; `SCENARIO_RUN.health_before`, `health_after`, `ot {count, hours, paid}`, `buff_total`.
- **Nguồn thiết kế:** D-133; `Kinh tế và sức khoẻ JobQuest.md` (khối 1 tiền và lịch, khối 2 cửa hàng, khối 3 sức khoẻ và OT, khối 4 NPC); `Hồ sơ NPC JobQuest.md`.
- **Yêu cầu:** không có FR riêng (G-12); ca kiểm truy về D-133 và research. Nhóm K không có use case trong UC-00. Liên quan FR-16 (nhiệm vụ phụ).

## Lớp tương đương và biên

| Biến                           | Lớp hoặc giá trị                                                                                                                                                                                   | Biên                           | Nguồn                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------- |
| Sức khoẻ                       | 0–100; trần mặc định 100, nâng lên 110 sau cột mốc theo khối 3 (xác nhận tên cột mốc); không âm                                                                                                    | 0; 1; 99; 100; 110; 111; −1    | KT khối 3; ERD `health_cap`        |
| Bậc sức khoẻ                   | Sung sức từ 80; Ổn 50–79; Mệt 25–49; Kiệt sức 0–24                                                                                                                                                 | 100; 80; 79; 50; 49; 25; 24; 0 | KT khối 3                          |
| Tác động số lượt theo bậc      | +1; 0; −1; −2 (theo thứ tự bậc trên)                                                                                                                                                               |                                | KT khối 3                          |
| OT mỗi màn                     | lần 1: +2 lượt, −12 sức khoẻ; lần 2: +1 lượt, −18 sức khoẻ; lần 3 là sự kiện vượt trần (từ chối, hoặc nhận với sức khoẻ trừ gấp đôi, hoặc gọi NPC Công Lý nếu đủ thân); Kiệt sức không được mời OT | lần 0, 1, 2, 3                 | S1, S2 (đã chốt)                   |
| Hao mòn nền một màn            | 2 + lịch làm việc (+2) + rủi ro thể chất (+2 hoặc +4) + tiếp khách (+1 hoặc +2) + cuối tuần (+1); tức 2–11                                                                                         | 2; 11                          | KT khối 3                          |
| Buff mỗi màn                   | tối đa 1 vật phẩm; vật phẩm +10, +20, +30%; Vận may +50%; cung hoàng đạo +12% nếu nhóm thuộc cung; cột mốc +5% (không cộng dồn trong cùng nhóm); tổng tối đa +50%                                  | 0; 47; 50; 51                  | C1…C3 (đã chốt)                    |
| Thước giá                      | u = xu một màn (60–250); X = xu chuẩn của band: L1 84, L2 92, L3 98, L4 103, L5 107, L6 114, L7 124, L8 131, L9 149                                                                                |                                | KT khối 1                          |
| Nhóm giá                       | rẻ ≤ 0,1 u; vừa 0,2–0,5 u; đắt 0,6–1,5 u; cột mốc 2–8 X                                                                                                                                            |                                | KT khối 2 (giá cụ thể C5 cần chốt) |
| Thói quen nghề                 | 0–3                                                                                                                                                                                                | 0; 3; 4                        | ERD `(0,3)`                        |
| Suất hoạt động mỗi khoảng nghỉ | 2 (nhiệm vụ phụ, nghỉ, cảnh cột mốc)                                                                                                                                                               | 0; 2; 3                        | KT khối 1                          |
| Cột mốc                        | 17 mốc; mỗi mốc trả một lần                                                                                                                                                                        |                                | D-133                              |

## Thẻ ca kiểm

### TC-K-BVA-01 · Sức khoẻ trong [0, trần]

- **Nguồn:** D-133; KT khối 3 (S1, S2); ERD `EXPLORER.health_value`, `health_cap`, `HEALTH_CHANGE`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàm áp thay đổi sức khoẻ; trần 100
- **Dữ liệu vào:** sức khoẻ 5 với OT lần 1 (−12); sức khoẻ 98 với hồi +10; trần 110 với sức khoẻ 108 và hồi +10; thay đổi 0
- **Các bước:** 1. Áp thay đổi. 2. Đọc `health_value` và sổ `HEALTH_CHANGE`.
- **Kết quả mong đợi:** 5 − 12 → 0 (không âm), sổ ghi −12 hoặc −5 theo thiết kế (kiểm cả hai: giá trị thực trừ và giá trị đã kẹp ghi vào `delta`, xác nhận với nguồn); 98 + 10 → 100; ở trần 110: 108 + 10 → 110
- **Hậu điều kiện:** `health_after` của run khớp
- **Tự động hoá:** `packages/game-core/src/domain/health.spec.ts` (dự kiến, thêm property-based)
- **Trạng thái:** Chờ hiện thực

### TC-K-BVA-02 · Bậc sức khoẻ và số lượt

- **Nguồn:** KT khối 3; ERD `SCENARIO_RUN.health_tier` (dẫn xuất)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàm bậc sức khoẻ
- **Dữ liệu vào:** 100, 80, 79, 50, 49, 25, 24, 0
- **Các bước:** 1. Tính bậc và tác động số lượt.
- **Kết quả mong đợi:** Sung sức, Sung sức, Ổn, Ổn, Mệt, Mệt, Kiệt sức, Kiệt sức; số lượt +1, +1, 0, 0, −1, −1, −2, −2
- **Hậu điều kiện:** không có
- **Tự động hoá:** `health.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-DT-01 · OT: số lần và bậc sức khoẻ

- **Nguồn:** S1, S2 (đã chốt); KT khối 3 "OT đổi lượt"
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định (kèm MC/DC)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** màn có điểm mời OT (`ot_offers`)
- **Dữ liệu vào:** số lần OT đã dùng trong màn (0, 1, 2) × bậc sức khoẻ (Kiệt sức và không)
- **Các bước:** 1. Đặt trạng thái. 2. Hỏi có mời OT không và nếu nhận thì kết quả.
- **Kết quả mong đợi:**

| OT đã dùng | Bậc            | Kết quả                                                                                                                                            |
| ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0          | không Kiệt sức | mời; nhận → +2 lượt, −12 sức khoẻ, `ot.count` = 1                                                                                                  |
| 1          | không Kiệt sức | mời; nhận → +1 lượt, −18 sức khoẻ, `ot.count` = 2                                                                                                  |
| 2          | không Kiệt sức | sự kiện vượt trần: từ chối, hoặc nhận với sức khoẻ trừ gấp đôi, hoặc gọi NPC Công Lý nếu đủ thân; `ot.count` không vượt 2 theo luật "tối đa 2 lần" |
| bất kỳ     | Kiệt sức       | không mời OT                                                                                                                                       |

Mỗi điều kiện đổi một mình phải làm kết quả đổi.

- **Hậu điều kiện:** `HEALTH_CHANGE` ghi đúng `delta` và lý do; `ot.hours`, `ot.paid` theo loại tăng ca của nơi làm việc (`TC-B-EP-02`)
- **Tự động hoá:** `health.spec.ts`, `shift/engine.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-DT-02 · OT liên tiếp

- **Nguồn:** KT khối 3 ("OT dài và thói quen nghề"); ERD `EXPLORER.consecutive_ot`, `slow_recovery`, `WARNED`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** chuỗi các màn liên tiếp
- **Dữ liệu vào:** OT ở 1, 2, 3 màn liên tiếp; một màn không OT chen giữa
- **Các bước:** 1. Chơi chuỗi. 2. Đọc `consecutive_ot`, `slow_recovery`, hồi phí.
- **Kết quả mong đợi:** `consecutive_ot` đếm đúng và về 0 khi có màn không OT; từ 3 màn liên tiếp hồi miễn phí giảm một nửa (`slow_recovery`); dòng cảnh báo WHO/ILO hiện một lần mỗi nghề (xem `TC-K-BLK-01`)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `health.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (phần cảnh báo chặn)

### TC-K-BVA-03 · Hao mòn nền của một màn

- **Nguồn:** KT khối 3 ("Chi tiết: OT đổi lượt" và công thức hao mòn); ERD `WORK_ENVIRONMENT.health_cost`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** môi trường làm việc với từng yếu tố bật tắt
- **Dữ liệu vào:** tất cả yếu tố tắt; tất cả ở mức cao nhất (lịch +2, rủi ro thể chất +4, tiếp khách +2, cuối tuần +1); từng yếu tố bật riêng
- **Các bước:** 1. Tính hao mòn.
- **Kết quả mong đợi:** 2; 11 (2 + 2 + 4 + 2 + 1); từng yếu tố cộng đúng mức; kết quả luôn trong [2, 11]
- **Hậu điều kiện:** không có
- **Tự động hoá:** `health.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-DT-03 · Quy tắc buff và trần chung +50%

- **Nguồn:** C1…C3 (đã chốt); KT khối 2 mục "luật buff và trần chung"; G-11; ERD `SCENARIO_RUN.buff_total`, `buff_breakdown`, `ITEM_BUFFS`, `MILESTONE_BUFFS`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định (kèm property-based)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** nhóm soft skill G của màn, trần nhóm 240
- **Dữ liệu vào:** theo bảng
- **Các bước:** 1. Chuẩn bị nguồn buff. 2. Tính `buff_total`. 3. Áp vào điểm thô.
- **Kết quả mong đợi:**

| Cung (nhóm thuộc cung) | Cột mốc                            | Vật phẩm              | Vận may  | `buff_total`                                              |
| ---------------------- | ---------------------------------- | --------------------- | -------- | --------------------------------------------------------- |
| không                  | không                              | không                 | không    | 0%                                                        |
| có (12%)               | có (5%)                            | +30%                  | không    | 47%                                                       |
| có (12%)               | có (5%)                            | không                 | có (50%) | 50% (kẹp trần, thô 67%)                                   |
| không                  | hai cột mốc cùng nhóm (5% mỗi mốc) | không                 | không    | 5% (không cộng dồn trong cùng nhóm)                       |
| không                  | không                              | hai vật phẩm cùng màn | không    | từ chối vật phẩm thứ hai (tối đa 1 vật phẩm buff mỗi màn) |

Điểm sau buff không vượt trần nhóm: thô 160 với 47% → 235,2; thô 170 với 47% → 240 (kẹp). Điểm thô được giữ riêng (`TC-J-GB-04`).

- **Hậu điều kiện:** `buff_breakdown` liệt kê từng nguồn
- **Tự động hoá:** `packages/game-core/src/domain/buff.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-BVA-04 · Thước giá u và X

- **Nguồn:** KT khối 1 ("Hai thước giá"), khối 2; ERD `BAND.lifestyle_x`, `SHOP_ITEM.price`, `price_unit`
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** bảng `BAND` đã seed
- **Dữ liệu vào:** `lifestyle_x` của L1…L9; vật phẩm tiến độ (buff, hồi sức khoẻ, vé nhiệm vụ phụ, quà NPC); vật phẩm đời sống (cột mốc, decor)
- **Các bước:** 1. Đọc X theo band. 2. Quy giá vật phẩm ra xu.
- **Kết quả mong đợi:** X lần lượt 84, 92, 98, 103, 107, 114, 124, 131, 149 (tăng đơn điệu); vật phẩm tiến độ tính theo u, vật phẩm đời sống tính theo X; giá luôn dương; phân nhóm giá khớp khoảng (rẻ ≤ 0,1 u, vừa 0,2–0,5 u, đắt 0,6–1,5 u, cột mốc 2–8 X). Giá cụ thể của từng món (C5) là tham số, không viết cứng trong test
- **Hậu điều kiện:** không có
- **Tự động hoá:** `economy.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (giá C5 chặn)

### TC-K-GB-01 · Sổ xu chỉ ghi thêm

- **Nguồn:** D-133 (sổ chỉ ghi thêm, không chuyển xu giữa người chơi, không phí cố định, không trừ xu làm phạt, không đăng nhập hằng ngày); ERD `XU_TRANSACTION`, `EXPLORER.balance` (dẫn xuất)
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** Postgres thật
- **Dữ liệu vào:** chuỗi nhận xu sau màn, mua vật phẩm, mua cột mốc; thử sửa và xoá giao dịch; thử mua khi thiếu xu; thử chuyển xu cho explorer khác; đăng nhập nhiều ngày liên tiếp
- **Các bước:** 1. Thực hiện từng thao tác. 2. So `balance` với tổng `amount`.
- **Kết quả mong đợi:** `balance` bằng tổng sổ; sửa và xoá bị từ chối; mua khi thiếu xu bị từ chối (suy ra); không có API chuyển xu; không có giao dịch trừ xu mang tính phạt, không có phí cố định; đăng nhập không sinh xu; mỗi cột mốc trả một lần
- **Hậu điều kiện:** mỗi giao dịch liên kết một nguồn (màn, vật phẩm, cột mốc hoặc dịp)
- **Tự động hoá:** `ledger.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-BVA-05 · Thói quen nghề tối đa 3

- **Nguồn:** ERD `HAS_HABIT (0,3)` (`slot_no`); KT khối 3
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** explorer có 0, 2 và 3 thói quen
- **Dữ liệu vào:** nhận thói quen thứ 1, 3, 4
- **Các bước:** 1. Nhận thói quen.
- **Kết quả mong đợi:** tối đa 3, `slot_no` không trùng; thói quen thứ 4 bị từ chối hoặc phải thay một thói quen (theo thiết kế, xác nhận)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `habits.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (danh sách thói quen chặn, xem `TC-K-BLK-01`)

### TC-K-BVA-06 · Khoảng nghỉ có 2 suất

- **Nguồn:** KT khối 1 ("Lịch"); ERD `GAP.slots_total`, `slots_used` (dẫn xuất), `EXPLORER.gap_slots_left`, `LIFE_MILESTONE.cost_slots`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** khoảng nghỉ mới
- **Dữ liệu vào:** dùng suất cho nhiệm vụ phụ, nghỉ, cảnh cột mốc (có `cost_slots`)
- **Các bước:** 1. Dùng lần lượt các suất.
- **Kết quả mong đợi:** `slots_total` = 2; `slots_used` đếm đúng (cột mốc có thể tốn nhiều suất theo `cost_slots`); suất thứ ba bị từ chối; `gap_slots_left` = `slots_total` − `slots_used`
- **Hậu điều kiện:** mỗi màn chính là một ngày làm, giữa hai màn lịch nhảy vài tuần
- **Tự động hoá:** `calendar.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-DT-04 · Cột mốc cuộc sống

- **Nguồn:** D-133; KT khối 5; G-11; ERD `LIFE_MILESTONE`, `EXPLORER_MILESTONE`, `MILESTONE_BUFFS (0,1)`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer có xu và suất hoạt động
- **Dữ liệu vào:** mua cột mốc khi (đủ xu, đủ điều kiện tiên quyết, còn suất); thiếu từng điều kiện; mua hai cột mốc cùng nhóm buff; mua cột mốc nhánh thay thế
- **Các bước:** 1. Mua. 2. Đọc `EXPLORER_MILESTONE`, xu, buff.
- **Kết quả mong đợi:** chỉ mua được khi mọi điều kiện đủ; mỗi cột mốc trả một lần; buff +5% một nhóm, không cộng dồn trong cùng nhóm và nằm trong trần +50%; nhánh thay thế (`branch_group`) cho thưởng ngang nhau; có 17 cột mốc; cột mốc khoá tiết kiệm (`locks_savings`) cập nhật `savings_locked` (mức khoá xác nhận với nguồn)
- **Hậu điều kiện:** giao dịch ghi `TXN_MILESTONE`
- **Tự động hoá:** `milestones.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (giá L1 chặn; buff đã chốt)

### TC-K-DT-05 · Hồi sức khoẻ

- **Nguồn:** KT khối 3 (bảng "Hồi"); S3 "cần chốt"
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** mức hồi là tham số (S3 chưa chốt); giá trị hiện tại: khoảng nghỉ +10 miễn phí, suất nghỉ +8, nhiệm vụ phụ +6, vào cấp mới ít nhất 70, mời nghỉ khi Kiệt sức +35
- **Dữ liệu vào:** từng nguồn hồi, ở sức khoẻ thấp, gần trần và trên 70
- **Các bước:** 1. Hồi. 2. Đọc sức khoẻ.
- **Kết quả mong đợi:** không vượt `health_cap`; không âm; vào cấp mới đưa sức khoẻ lên ít nhất 70 nhưng không hạ nếu đã cao hơn; về quê ăn Tết hồi đầy; các giá trị hồi đọc từ cấu hình, đổi cấu hình thì kết quả đổi theo
- **Hậu điều kiện:** mỗi lần hồi ghi `HEALTH_CHANGE`
- **Tự động hoá:** `health.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (mức hồi chặn: chỉ kiểm bất biến)

### TC-K-DU-01 · Thuộc tính dẫn xuất nhóm K tính lại được

- **Nguồn:** ERD `EXPLORER.balance`, `health_value`, `consecutive_ot`, `gap_slots_left`; `GAP.slots_used`; `SCENARIO_RUN.health_tier`, `buff_total`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** lịch sử kinh tế và sức khoẻ mẫu
- **Dữ liệu vào:** sổ `XU_TRANSACTION`, sổ `HEALTH_CHANGE`, các run, các khoảng nghỉ
- **Các bước:** 1. Xoá giá trị lưu. 2. Tính lại từ dữ liệu gốc. 3. So sánh.
- **Kết quả mong đợi:** `balance` ← tổng `XU_TRANSACTION.amount`; `health_value` ← sổ `HEALTH_CHANGE`; `consecutive_ot` ← `ot.count` của các run liên tiếp; `gap_slots_left` ← `slots_total` − `slots_used`; `slots_used` ← số hoạt động trong khoảng nghỉ; `health_tier` ← `health_before`; `buff_total` ← `buff_breakdown`. Mọi cặp khớp
- **Hậu điều kiện:** không có
- **Tự động hoá:** `economy.spec.ts`, `health.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-EG-01 · Bất biến kinh tế qua chuỗi sự kiện ngẫu nhiên

- **Nguồn:** D-133; KT khối 1…3 (các bất biến ở bảng trên)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · đoán lỗi (property-based)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** bộ sinh chuỗi sự kiện: màn, mua, OT, nghỉ, nhiệm vụ phụ, cột mốc
- **Dữ liệu vào:** 1.000 chuỗi ngẫu nhiên với hạt giống cố định
- **Các bước:** 1. Áp chuỗi. 2. Kiểm bất biến sau mỗi sự kiện.
- **Kết quả mong đợi:** sức khoẻ ∈ [0, `health_cap`]; số dư ≥ 0; `buff_total` ≤ 50%; điểm cộng ≤ trần nhóm; sổ chỉ tăng chiều dài; mỗi màn tối đa 1 vật phẩm buff và tối đa 2 lần OT; thói quen ≤ 3
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/economy.property.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-K-EG-02 · Cân bằng kinh tế: người tiết kiệm mua được căn hộ

- **Nguồn:** KT khối 2 ("mức này giữ để người tiết kiệm ở nghề trung vị vẫn mua được căn hộ trong nghề đầu", khối 6); ghi chú mô phỏng cân bằng 4/11
- **Cấp · loại · kỹ thuật:** System · chất lượng · thăm dò (mô phỏng)
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** tham số kinh tế hiện hành; nghề trung vị
- **Dữ liệu vào:** người chơi giả tiết kiệm, người chơi giả tiêu nhiều
- **Các bước:** 1. Mô phỏng hết nghề đầu. 2. Kiểm khả năng mua căn hộ và tiền dồn đống.
- **Kết quả mong đợi:** người tiết kiệm ở nghề trung vị mua được căn hộ trong nghề đầu; không có tiền dồn đống mất ý nghĩa (nguồn dẫn Lostgarden "Value chains": nơi tiêu nhỉnh hơn nguồn vào); chơi lại giảm xu
- **Hậu điều kiện:** báo cáo mô phỏng đưa vào chương đánh giá
- **Tự động hoá:** script mô phỏng (dự kiến)
- **Trạng thái:** Chờ hiện thực (tham số chưa chốt)

### TC-K-UC-01 · Khoảng nghỉ: cửa hàng, mua, dùng vật phẩm, OT, tổng kết

- **Nguồn:** KT khối 1…3 (không có use case trong UC-00, G-12)
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer có xu và một khoảng nghỉ
- **Dữ liệu vào:** luồng chính: vào khoảng nghỉ → mua vật phẩm buff → vào màn kế → dùng vật phẩm → được mời OT → nhận → tổng kết sức khoẻ và xu; luồng lỗi: thiếu xu, dùng hai buff, Kiệt sức vẫn thử OT
- **Các bước:** 1. Chạy luồng chính. 2. Chạy từng luồng lỗi.
- **Kết quả mong đợi:** mỗi quy tắc ở các thẻ trên được thấy trên giao diện; thông báo tiếng Việt; xu là luật chơi và ghi rõ "xu đã nén chênh lệch để mọi nghề chơi được" (lương bằng đồng luôn hiện, KT khối 1)
- **Hậu điều kiện:** sổ xu và sổ sức khoẻ khớp
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực

### TC-K-BLK-01 · Các tham số kinh tế còn mở

- **Nguồn:** ERD `[CAM]`: `CAREER_HABIT` (S6), `LIFE_MILESTONE` giá (L1) và buff (L3 đã chốt theo G-11), `PLACES_DECOR`, `WARNED` (S5); KT mục "Cần chốt": giá cửa hàng (C5), mức hồi sức khoẻ (S3), số mức thân (N2), tiền khi chơi lại (K5)
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: giá và mức hồi cụ thể đúng bảng sau khi chốt; danh sách thói quen nghề và điều kiện nhận; vị trí decor; dòng cảnh báo WHO/ILO một lần mỗi nghề; ngưỡng thân và tỉ lệ xu chơi lại. Lý do chặn: nguồn ghi "cần chốt"; test kiểm bất biến thay giá trị cho đến khi chốt

## Mục tiêu white box

### WB-K-01 · Hàm thuần kinh tế và sức khoẻ trong `game-core` (dự kiến, chưa có code)

- **Tiêu chí phủ:** MC/DC cho điều kiện mời OT (bậc sức khoẻ, số lần OT đã dùng, vai Kiệt sức) và điều kiện nhận vật phẩm buff; phủ nhánh cho kẹp trần buff, kẹp sức khoẻ, quy giá theo u và X
- **Nhánh cần phủ:** theo bảng quyết định `TC-K-DT-01`, `TC-K-DT-03`, `TC-K-DT-05`
- **Hiện có:** chưa có code
- **Trạng thái:** Chờ hiện thực
