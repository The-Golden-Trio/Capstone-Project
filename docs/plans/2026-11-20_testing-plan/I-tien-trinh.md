# Nhóm I · Tiến trình

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `LEVEL_ENROLMENT` (`status`, `entry_route`, `round_no`, `onboard_kind`), `SCENARIO_BEST` (`replay_pay_rate`); các quan hệ ghi nhận điểm theo nhóm soft skill (`PROGRESSES (7,7)`, ở nhóm H) và theo keyword (`TRAINS`, ở nhóm C).
- **Yêu cầu:** FR-06, FR-07, FR-08, FR-15; D-37, D-114, D-118, D-119, D-121, D-122, D-124; BR-11. **Use case:** UC-E07, UC-E08, UC-E18. **Diagram:** `AD-01c`; class `CL-05` (ExplorerCareerAndLife).
- **Code:** Prisma có `Enrollment`, `UserBandSkill` (prototype, không khớp `LEVEL_ENROLMENT`). `game-core` có `domain/bands.ts` (`isBandOpen`, `nextBand`, `previousBand`, có `bands.spec.ts`) và `profile/softSkills.ts`. `progress/progress.service.ts` (`isUnlocked`, `enroll`, `summary`) của prototype chưa có spec. FR-07 hoãn (07 A27).
- **Cách đọc FR-07 (G-08):** luật vào nghề kề tính **theo từng người chơi** trong `game-core` (D-122, D-124); bảng `occupation_adjacency` tĩnh nếu còn giữ chỉ là cache theo cặp nghề (suy ra, cần nhóm xác nhận).

## Lớp tương đương và biên

| Biến                                  | Lớp hoặc giá trị                                                          | Biên                                           | Nguồn                      |
| ------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------- |
| Mức vào cấp                           | mọi nhóm soft skill đạt bậc ở mốc 60% quỹ các cấp trước (`required_tier`) | 59% và 60%                                     | D-114, D-118; G2 "giữ tạm" |
| Độ phủ keyword                        | Σ min(đang có, cần) ÷ Σ cần; ≥ 50% (≥ 30% nếu độ giống nghề ≥ 1,2)        | 0,4999; 0,5; 0,2999; 0,3; độ giống 1,19 và 1,2 | D-122, D-124               |
| Trạng thái mỗi keyword khi giải thích | đủ ✅, gần giống ◐ (tính 0,5 hoặc 0,25, ghi keyword được dùng), thiếu ❌  |                                                | D-124                      |
| Chơi lại                              | giữ kết quả cao nhất; chỉ cộng phần chênh; không vượt trần                | lần 2 kém hơn, bằng, tốt hơn, tới trần         | D-37, D-119, BR-11         |
| Tỉ lệ xu khi chơi lại                 | 100%, 50%, 25% theo lần (K5 cần chốt)                                     | tham số                                        | Kinh tế và sức khoẻ K5     |
| `entry_route`                         | vào thẳng, nghề kề, vào nghề cấp cao                                      |                                                | ERD                        |
| `onboard_kind`                        | công ty mới hoặc vị trí mới                                               |                                                | Seed scenario, khối G      |

## Thẻ ca kiểm

### TC-I-DT-01 · Mở cấp theo hai điều kiện

- **Nguồn:** D-114, D-118, D-122, D-124 (đã chốt); Cơ chế game khối G; FR-08
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** nghề đích có bảng yêu cầu keyword theo cấp; người chơi có mức keyword và bậc soft skill
- **Dữ liệu vào:** theo bảng
- **Các bước:** 1. Dựng người chơi. 2. Hỏi cấp cao nhất được vào.
- **Kết quả mong đợi:** vào cấp cao nhất mà **cả hai** điều kiện cùng thoả

| Bậc soft skill ở mốc 60% | Độ phủ keyword   | Độ giống nghề | Vào được |
| ------------------------ | ---------------- | ------------- | -------- |
| đạt                      | ≥ 0,5            | bất kỳ        | có       |
| đạt                      | 0,3 đến dưới 0,5 | ≥ 1,2         | có       |
| đạt                      | 0,3 đến dưới 0,5 | < 1,2         | không    |
| đạt                      | dưới 0,3         | ≥ 1,2         | không    |
| không đạt                | ≥ 0,5            | bất kỳ        | không    |

Ngưỡng là tham số (G2 giữ tạm): đổi cấu hình thì biên dịch theo.

- **Hậu điều kiện:** màn giải thích liệt kê từng keyword nghề đích cần
- **Tự động hoá:** `packages/game-core/src/domain/bands.spec.ts` (mở rộng)
- **Trạng thái:** Chờ hiện thực (FR-07 hoãn)

### TC-I-BVA-01 · Công thức độ phủ keyword

- **Nguồn:** D-122; Cơ chế game khối G
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàm độ phủ nhận mức đang có và mức cần của từng keyword nghề đích
- **Dữ liệu vào:** cần {a: 2, b: 3}; đang có {a: 3, b: 1} (ví dụ cho độ phủ 3 ÷ 5 = 0,6); đang có {} (0); đang có đúng bằng cần (1); keyword thừa không thuộc nghề đích; keyword thuộc nhóm ESCO gần giống (credit 0,5 hoặc 0,25, theo `TC-C-DT-01`)
- **Các bước:** 1. Tính độ phủ.
- **Kết quả mong đợi:** 0,6; 0; 1; keyword thừa không làm độ phủ tăng; keyword gần giống đóng góp theo credit và được ghi vào lời giải thích
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/coverage.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-I-DT-02 · Chơi lại một màn

- **Nguồn:** D-37; D-119; BR-11; DR-06; ERD `SCENARIO_BEST`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** màn đã chơi một lần, điểm tốt nhất B
- **Dữ liệu vào:** lần hai có điểm thấp hơn B; bằng B; cao hơn B; cao hơn B và chạm trần của màn; chơi lại nhiều lần
- **Các bước:** 1. Chơi lại. 2. Đọc điểm cộng và `SCENARIO_BEST`.
- **Kết quả mong đợi:** thấp hơn hoặc bằng B → cộng 0, giữ B; cao hơn → chỉ cộng phần chênh; tổng của màn không vượt trần; chơi lại không bao giờ làm điểm giảm; tổng điểm nhóm không vượt 10.000
- **Hậu điều kiện:** `replay_pay_rate` đúng theo lần chơi (tham số K5)
- **Tự động hoá:** `game-core` spec (dự kiến), `progress.service.spec.ts`
- **Trạng thái:** Chờ hiện thực

### TC-I-DT-03 · Loại onboard của lần vào cấp

- **Nguồn:** Seed scenario, khối G; ERD `LEVEL_ENROLMENT.onboard_kind`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer vào cấp mới
- **Dữ liệu vào:** công ty rút trúng công ty đang làm; trúng công ty khác; chơi lại cấp
- **Các bước:** 1. Rút công ty. 2. Đọc `onboard_kind`.
- **Kết quả mong đợi:** cùng công ty → onboard "vị trí mới"; công ty khác → "công ty mới"; chơi lại cấp tăng `round_no` và rút công ty mới theo trọng số ngành
- **Hậu điều kiện:** không có
- **Tự động hoá:** `game-core` spec (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-I-ST-01 · Vòng đời đăng ký cấp

- **Nguồn:** FR-08; ERD `LEVEL_ENROLMENT` (giá trị `status` không được liệt kê; vòng đời suy ra: đã vào → đang chơi → hoàn thành)
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer đủ điều kiện vào cấp
- **Dữ liệu vào:** vào cấp; hoàn thành mọi màn; vào cấp kế tiếp; vào cấp chưa đủ điều kiện
- **Các bước:** 1. Đăng ký cấp. 2. Hoàn thành màn. 3. Thử vào cấp không đủ điều kiện.
- **Kết quả mong đợi:** vào cấp chưa đủ điều kiện bị từ chối kèm lý do; hoàn thành mọi màn chính đánh dấu cấp xong (điều kiện cho đánh giá nghề, FR-19); `entry_route` ghi đúng đường vào
- **Hậu điều kiện:** tiến độ dựng lại được từ các bản ghi đã lưu (DR-06)
- **Tự động hoá:** `progress.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được cho `Enrollment` prototype; Chờ hiện thực cho `LEVEL_ENROLMENT`

### TC-I-EG-01 · Không dùng hồ sơ nền ẩn

- **Nguồn:** D-124 ("nhảy nghề chỉ dựa trên thứ người chơi thấy được")
- **Cấp · loại · kỹ thuật:** Unit · công bằng · đoán lỗi (metamorphic)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hai người chơi có cùng keyword đã đạt, khác nhau về RIASEC, cung hoàng đạo, `address_form`
- **Dữ liệu vào:** hai người chơi
- **Các bước:** 1. Tính quyền vào nghề đích cho cả hai.
- **Kết quả mong đợi:** kết quả giống nhau; không có đầu vào nào ngoài keyword đã đạt, độ giống nghề và bậc soft skill tham gia luật nhảy nghề
- **Hậu điều kiện:** không có
- **Tự động hoá:** `game-core` spec (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-I-EG-02 · Hồi quy số liệu kiểm định luật nhảy nghề

- **Nguồn:** D-124; Cơ chế game khối G ("Kiểm định trên 221 nghề")
- **Cấp · loại · kỹ thuật:** Static · dữ liệu · đoán lỗi
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** dữ liệu 221 nghề và script kiểm định trong `occupation-data/scripts` (tên script xác nhận khi viết)
- **Dữ liệu vào:** 774 cặp theo nhóm ISCO-08 3 số
- **Các bước:** 1. Chạy lại kiểm định sau khi đổi dữ liệu hoặc ngưỡng.
- **Kết quả mong đợi:** khoảng 67,4% cặp liên quan được nhảy tới cấp cuối so với khoảng 2,4% cặp khác, AUC độ phủ khoảng 0,909; lệch lớn so với số này là phát hiện cần xem lại
- **Hậu điều kiện:** không có
- **Tự động hoá:** script (dự kiến)
- **Trạng thái:** Chạy được nếu script có sẵn; xác nhận khi viết

### TC-I-UC-01 · UC-E07, UC-E08: vào nghề kề và chọn màn

- **Nguồn:** FR-06, FR-07; `AD-01c`
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer đã xong một nghề nguồn
- **Dữ liệu vào:** luồng chính: chọn nghề kề → xem màn giải thích từng keyword (✅ ◐ ❌) → vào cấp được phép; luồng lỗi: chọn cấp cao hơn cấp được phép
- **Các bước:** 1. Chạy luồng chính. 2. Thử cấp quá cao.
- **Kết quả mong đợi:** màn giải thích nêu độ phủ, ngưỡng (50% hoặc 30% nếu rất giống) và cấp vào được; cấp quá cao bị chặn
- **Hậu điều kiện:** `entry_route` = nghề kề
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực (FR-07 hoãn)

### TC-I-DU-01 · `replay_pay_rate`, `onboard_kind` tính lại được

- **Nguồn:** ERD `SCENARIO_BEST.replay_pay_rate`, `LEVEL_ENROLMENT.onboard_kind` (dẫn xuất)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** lịch sử chơi mẫu
- **Dữ liệu vào:** số lần chơi một màn; công ty hiện tại và công ty trước
- **Các bước:** 1. Tính lại hai giá trị từ dữ liệu gốc.
- **Kết quả mong đợi:** `replay_pay_rate` ← số lần chơi lại (theo bảng K5, tham số); `onboard_kind` ← so sánh công ty; khớp giá trị lưu
- **Hậu điều kiện:** không có
- **Tự động hoá:** `game-core` spec (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-I-BLK-01 · Vai cố định theo cấp và tiền chơi lại

- **Nguồn:** ERD `[VANG]` `CASTS` (N4 còn mở); Kinh tế và sức khoẻ K5 "cần chốt"
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: mỗi cấp có 2 vai cố định, 1–2 vai ngẫu nhiên và 1 ô người mới; số xu khi chơi lại giảm theo lần. Lý do chặn: đề xuất cast N4 chưa chốt, tỉ lệ 100/50/25% là đề xuất K5

## Mục tiêu white box

### WB-I-01 · `packages/game-core/src/domain/bands.ts`

- **Tiêu chí phủ:** MC/DC cho điều kiện mở band
- **Nhánh cần phủ:** `isBandOpen` với từng điều kiện đổi một mình; `nextBand`, `previousBand` ở band đầu và cuối (L1, L9)
- **Hiện có:** `bands.spec.ts`
- **Trạng thái:** Chạy được

### WB-I-02 · `apps/api/src/app/progress/progress.service.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `isUnlocked`, `enroll`, `summary`; cấp chưa mở, đã mở, đã xong
- **Hiện có:** chưa có spec; code prototype lệch `LEVEL_ENROLMENT`
- **Trạng thái:** Chạy được
