# Nhóm E · Nội dung màn

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `SCENARIO` (`clock`, `difficulty`, `ambient_min_points`, `wait_window`, `review_max`, `promise_*`, `ot_offers`, `sidequest_hooks`, `estimated_minutes`), `SCENARIO_SLOT`, `FACT`, `ARTEFACT`, `ACTION`, `TIMELINE_EVENT`, `AMBIENT`, `STORY_FLAG`, `CHECK`, `NODE`, `OPTION`, `REVIEW_PROBE`, `OBSERVED_ITEM`, `REFERENCE_ANSWER`.
- **Yêu cầu:** FR-09, FR-10, FR-12, FR-22, FR-24, FR-33; NFR-09, NFR-10, NFR-15; D-116. **Use case:** UC-D01, UC-D02, UC-E08, UC-E11…E15. **Diagram:** `AD-04`, `SD-01`, `SD-05`; class `CL-03` (ScenarioAuthoringAndLifecycle).
- **Code:** Prisma có `Scenario`, `Activity`, `ActivityItem`, `RubricCriterion`, `RandomEvent`, `Ending`, `ReferenceAnswer` (prototype) và `ShiftSeedDoc` (JSON). `ContentValidator` (509 dòng) có spec. `game-core/src/shift/` (`engine.ts`, `lint.ts`, `context.ts`, `flags.ts`, `time.ts`) có `engine.spec.ts`. `domain/grading/structuredGrading.ts` chưa có spec. Seed vàng: `occupation-data/seeds/SWE_BACKEND/L3.m2.json` (bản 4; phần `_draft` chờ DE duyệt).

## Lớp tương đương và biên

| Biến                               | Lớp hoặc giá trị                                                                                 | Biên              | Nguồn                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------- | -------------------------- |
| Định dạng nút (`NODE.format`)      | 9: trắc nghiệm, chọn có giờ, chọn nhiều, sắp thứ tự, nối, đúng/sai, tự luận, email ngắn, mã ngắn | giá trị thứ 10    | Seed scenario D3           |
| `FACT.visibility`                  | hiện sẵn, hiện khi hỏi (`on_ask`), chỉ AI biết (`ai_only`)                                       |                   | Seed scenario B2           |
| `NODE.kind`                        | mở, giữa, kết                                                                                    |                   | Seed scenario D1           |
| `NODE.trigger.type`                | giờ, người chơi, dữ kiện                                                                         |                   | Seed scenario D5           |
| Biểu cảm                           | 8 mã: `binh_thuong`, `vui`, `cuoi_lon`, `ngac_nhien`, `suy_nghi`, `lo_lang`, `kho_chiu`, `buon`  | mã thứ 9          | Luật dẫn truyện A5         |
| Hướng hỏi thêm                     | 5: làm rõ, vì sao, nếu thì, ai bị ảnh hưởng, bước tiếp                                           |                   | Seed scenario D4           |
| Số slot (`HAS_SLOT`)               | 2–6, ít nhất 1 slot thường trú                                                                   | 1; 2; 6; 7        | ERD                        |
| Mục quan sát (`HAS_OBSERVED_ITEM`) | 3–6                                                                                              | 2; 3; 6; 7        | ERD, Seed E1               |
| Keyword trọng tâm (`FOCUSES_ON`)   | 1–2                                                                                              | 0; 1; 2; 3        | ERD                        |
| Thời lượng (`estimated_minutes`)   | 10–15 phút                                                                                       | 9,9; 10; 15; 15,1 | Seed scenario, Khối 1      |
| Nút giữa                           | 1–3; ít nhất 1 nút đóng; tối đa 1 nút có giờ; có nút kết                                         | 0; 1; 3; 4        | Seed scenario D1, D2       |
| Nhịp thoại (R4)                    | ≤ 120 ký tự mỗi nhịp; ≤ 5 nhịp mỗi lượt (số tạm)                                                 | 120/121; 5/6      | Luật dẫn truyện C2         |
| Câu hỏi mỗi lượt (R2)              | ≤ 1, ở nhịp cuối, do chính NPC đang nói hỏi                                                      | 0; 1; 2           | Luật dẫn truyện C2         |
| Cửa sổ hứa                         | giữ lời nếu hứa từ −2 đến +1 điểm quanh mốc, kiểm ở mốc +1                                       | −3; −2; +1; +2    | Luật dẫn truyện A1b        |
| "Tạm làm việc khác"                | chỉ hiện khi nút có giờ kế tiếp cách ≤ 6 điểm                                                    | 6; 7              | Luật dẫn truyện A1b        |
| Ambient chèn                       | sau hành động từ 2 điểm trở lên, mỗi cái dùng một lần                                            | 1; 2 điểm         | Seed mẫu L3 m2 (`ambient`) |
| Độ dư thời gian                    | ≥ 30% so với quỹ điểm                                                                            | 29%; 30%          | Luật dẫn truyện A1         |

## Thẻ ca kiểm

### TC-E-EP-01 · Chín định dạng câu hỏi

- **Nguồn:** Seed scenario D3 (đã chốt); FR-10; G-05 (DE chọn định dạng, engine sinh hint)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Cao
- **Tiền điều kiện:** mỗi định dạng có một nút mẫu hợp lệ
- **Dữ liệu vào:** 9 nút mẫu; thêm một nút có định dạng không có trong danh sách
- **Các bước:** 1. Kiểm tra seed. 2. Chạy từng nút qua engine với đáp án đúng, sai, bỏ trống.
- **Kết quả mong đợi:** định dạng thứ 10 bị từ chối; mỗi định dạng có đúng một đường chấm và một dạng bằng chứng; hint do engine sinh, seed không chứa trường hint
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/domain/grading/structuredGrading.spec.ts` và `shift/engine.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được cho phần engine; Chờ hiện thực cho các định dạng chưa có trong engine hiện tại (xác nhận khi đọc code)

### TC-E-EP-02 · Mức hiển thị của dữ kiện

- **Nguồn:** Seed scenario B2; Luật dẫn truyện (mỗi hành động mở tối đa một dữ kiện); ERD `FACT.visibility`, `unlock`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Cao
- **Tiền điều kiện:** seed có ba dữ kiện: hiện sẵn, `on_ask` (mở khi hỏi đúng slot và loại câu hỏi), `ai_only`
- **Dữ liệu vào:** người chơi hỏi đúng; hỏi sai slot; hỏi sai loại câu hỏi; mở một hành động liên quan hai dữ kiện
- **Các bước:** 1. Bắt đầu màn. 2. Thực hiện từng thao tác. 3. Đọc `narratorView` và dữ liệu gửi client.
- **Kết quả mong đợi:** dữ kiện hiện sẵn có ngay; `on_ask` chỉ hiện khi khớp `unlock.slot` và `question_kind`; `ai_only` không bao giờ nằm trong dữ liệu gửi client; mỗi hành động mở tối đa một dữ kiện mới
- **Hậu điều kiện:** danh sách dữ kiện đã mở trong state khớp những gì đã hiện
- **Tự động hoá:** `shift/engine.spec.ts` và `domain/narration/narratorView.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-EP-03 · Loại nút và loại kích hoạt

- **Nguồn:** Seed scenario D1, D5; Luật dẫn truyện A1b; ERD `NODE.kind`, `trigger`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Cao
- **Tiền điều kiện:** seed có nút mở (0 điểm), nút giữa theo giờ (kèm `fallback_at`), nút giữa theo người chơi, nút kết
- **Dữ liệu vào:** người chơi chạm hoặc bỏ lỡ từng kích hoạt
- **Các bước:** 1. Chạy màn theo từng kịch bản. 2. Đọc thứ tự nút đã xảy ra.
- **Kết quả mong đợi:** nút kích hoạt theo giờ tới mốc thì xảy ra hoặc dùng `fallback_at`; nút theo người chơi chỉ xảy ra khi bấm; nút kết chỉ bấm được khi mọi nút giữa đã xảy ra; nút chưa tới vì hết giờ ghi "không xét" và giữ phần quỹ
- **Hậu điều kiện:** sự kiện nút ghi vào `RUN_EVENT` theo đúng thứ tự
- **Tự động hoá:** `shift/engine.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-EP-04 · Bộ biểu cảm 8 mã

- **Nguồn:** Luật dẫn truyện A5, R4; ERD `SCENARIO_SLOT.voice`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** schema lượt kể chuyện `{beats: [{speaker, text, expression}], question_by}`
- **Dữ liệu vào:** từng mã trong 8 mã; một mã ngoài bộ
- **Các bước:** 1. Kiểm tra đầu ra kể chuyện. 2. Kiểm tra seed có lời soạn sẵn.
- **Kết quả mong đợi:** 8 mã hợp lệ; mã ngoài bộ làm đầu ra bị loại theo luật khuôn R4
- **Hậu điều kiện:** không có
- **Tự động hoá:** `domain/narration/rules.spec.ts` (đã có, mở rộng)
- **Trạng thái:** Chạy được

### TC-E-BVA-01 · Số slot, mục quan sát, keyword trọng tâm

- **Nguồn:** ERD `HAS_SLOT (2,6)`, `HAS_OBSERVED_ITEM (3,6)`, `FOCUSES_ON (1,2)`; Seed scenario E1
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** seed mẫu hợp lệ
- **Dữ liệu vào:** số slot 1, 2, 6, 7 (có và không có slot thường trú); mục quan sát 2, 3, 6, 7; keyword trọng tâm 0, 1, 2, 3
- **Các bước:** 1. Biến một đại lượng mỗi lần, giữ các đại lượng khác hợp lệ. 2. Chạy `ContentValidator` và `lintSeed`.
- **Kết quả mong đợi:** chỉ giá trị trong khoảng và (với slot) có ít nhất một slot thường trú được chấp nhận; giá trị ngoài khoảng báo đúng lỗi
- **Hậu điều kiện:** không có
- **Tự động hoá:** `content-validator.spec.ts`, `shift/lint.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được cho phần validator hiện có; xác nhận từng luật khi đọc code

### TC-E-BVA-02 · Thời lượng và số nút

- **Nguồn:** Seed scenario, Khối 1 và D1, D2; ERD `SCENARIO.estimated_minutes`, `NODE`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàm `estimateMinutes` của `ContentValidator`
- **Dữ liệu vào:** ước lượng 9,9; 10; 15; 15,1 phút; số nút giữa 0, 1, 3, 4; số nút đóng 0 và 1; số nút có giờ 1 và 2; có và không có nút kết
- **Các bước:** 1. Dựng màn theo từng giá trị. 2. Kiểm tra hợp lệ.
- **Kết quả mong đợi:** ngoài 10–15 phút bị từ chối; nút giữa phải 1–3; cần ít nhất 1 nút đóng, tối đa 1 nút có giờ; thiếu nút kết bị từ chối
- **Hậu điều kiện:** không có
- **Tự động hoá:** `content-validator.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được (số liệu Seed theo "chốt"; số nút giữa tối thiểu cần xác nhận với code)

### TC-E-BVA-03 · Đồng hồ: quỹ điểm, độ dư, nhắc tạm làm việc khác

- **Nguồn:** Luật dẫn truyện A1, A1b (đã chốt, bản 3); ERD `SCENARIO.clock`, `wait_window`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** `minutes_per_point` = 5; quỹ = (hạn − bắt đầu) ÷ `minutes_per_point`
- **Dữ liệu vào:** tổng điểm hành động bắt buộc chiếm 70% và 71% quỹ; nút có giờ kế tiếp cách 6 và 7 điểm; còn 20% quỹ
- **Các bước:** 1. Lint seed. 2. Chạy màn đến các mốc.
- **Kết quả mong đợi:** độ dư đúng 30% đạt, 29% không đạt; "tạm làm việc khác" hiện khi cách 6 điểm, không hiện khi cách 7; cảnh báo sắp hết giờ xuất hiện quanh còn 20% quỹ
- **Hậu điều kiện:** không có
- **Tự động hoá:** `shift/lint.spec.ts`, `shift/time.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-E-BVA-04 · Cửa sổ hứa

- **Nguồn:** Luật dẫn truyện A1b; ERD `SCENARIO.promise_reminders`, `promise_events`, `OPTION.promise`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** người chơi hứa với một NPC, mốc kiểm có định nghĩa
- **Dữ liệu vào:** lời hứa đặt tại −3, −2, +1, +2 điểm so với mốc
- **Các bước:** 1. Đặt lời hứa. 2. Đi tới mốc +1.
- **Kết quả mong đợi:** −2 và +1 được tính là hứa đúng lúc; −3 và +2 không; kết quả kiểm lời hứa khớp
- **Hậu điều kiện:** danh sách lời hứa còn mở của engine cập nhật đúng
- **Tự động hoá:** `shift/engine.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-BVA-05 · Khuôn lời kể chuyện R2, R4

- **Nguồn:** Luật dẫn truyện C2 (R2, R4, số tạm); `domain/narration/rules.ts`, `beats.ts`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** đầu ra kể chuyện mẫu
- **Dữ liệu vào:** nhịp dài 120 và 121 ký tự; lượt 5 và 6 nhịp; lượt có 0, 1, 2 câu hỏi; câu hỏi ở nhịp giữa; lời cảnh (`speaker: canh`) có câu hỏi; lượt `probe` không có hoặc có hai câu hỏi
- **Các bước:** 1. Chạy `checkNarration` và `checkBeats`.
- **Kết quả mong đợi:** 121 ký tự và 6 nhịp bị loại; 2 câu hỏi bị loại; câu hỏi không ở nhịp cuối bị loại; lời cảnh không bao giờ hỏi; `probe` bắt buộc có đúng một câu hỏi theo hook
- **Hậu điều kiện:** không có
- **Tự động hoá:** `domain/narration/rules.spec.ts`, `beats.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-BVA-06 · Ambient chèn sau hành động từ 2 điểm

- **Nguồn:** Seed mẫu L3 m2 (mục `ambient`); ERD `AMBIENT`, `SCENARIO.ambient_min_points`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Thấp
- **Tiền điều kiện:** hai ambient chưa dùng
- **Dữ liệu vào:** hành động 1 điểm và 2 điểm
- **Các bước:** 1. Thực hiện hành động. 2. Đọc ambient được chèn.
- **Kết quả mong đợi:** hành động 1 điểm không chèn ambient; 2 điểm có thể chèn; mỗi ambient dùng tối đa một lần
- **Hậu điều kiện:** danh sách ambient đã dùng cập nhật
- **Tự động hoá:** `shift/engine.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-DT-01 · Điểm thời gian theo loại hành động

- **Nguồn:** Luật dẫn truyện A1 (đã chốt, bản 3); G-09; ERD `ACTION.points`, `free_on_repeat`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** engine ca làm
- **Dữ liệu vào:** từng loại hành động theo bảng
- **Các bước:** 1. Thực hiện hành động. 2. Đọc số điểm đã trừ.
- **Kết quả mong đợi:**

| Hành động                  | Điểm                                                    |
| -------------------------- | ------------------------------------------------------- |
| Cuộc trò chuyện tới 3 lượt | 1                                                       |
| Mở tài liệu lần đầu        | 1                                                       |
| Mở lại tài liệu            | 0                                                       |
| Việc nhỏ                   | 1–2                                                     |
| Việc vừa                   | 3                                                       |
| Việc lớn                   | 5 (Luật dẫn truyện A1; Seed D2 ghi 3, đã bị thay, G-09) |
| Nút giữa, nút kết          | 1                                                       |
| Nút mở                     | 0                                                       |

- **Hậu điều kiện:** quỹ điểm còn lại khớp tổng đã trừ
- **Tự động hoá:** `shift/engine.spec.ts`, `shift/time.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-DT-02 · Chấm câu đóng theo 0, 1, 2

- **Nguồn:** D-116 (đã chốt); Seed scenario E1 mục 2; ERD `OPTION.is_harmful`, `must_not`, `consensus_rank`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** nút có hai mục con liên quan X, Y
- **Dữ liệu vào:** phương án đúng; đánh đổi (tốt cho X, kém cho Y); sai; sai gây hại; chọn vào mục `must_not`; sắp thứ tự gần, xa, ngược với đồng thuận; chọn nhiều đủ, thiếu, thừa
- **Các bước:** 1. Chấm. 2. Đọc mức từng mục con và cờ.
- **Kết quả mong đợi:**

| Tình huống      | Mức                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Đúng            | 2 ở các mục con liên quan                                                                              |
| Đánh đổi        | 2 ở X, 0 ở Y                                                                                           |
| Sai             | 0                                                                                                      |
| Sai gây hại     | 0 kèm cờ                                                                                               |
| Chọn `must_not` | cờ                                                                                                     |
| Sắp thứ tự      | mức giảm khi khoảng cách tới thứ tự đồng thuận tăng (ngưỡng chia 0/1/2 chưa có số: kiểm tính đơn điệu) |
| Chọn nhiều      | mức theo tỉ lệ chọn trúng                                                                              |

- **Hậu điều kiện:** không gọi AI cho câu đóng
- **Tự động hoá:** `packages/game-core/src/domain/grading/structuredGrading.spec.ts` (dự kiến; hiện chưa có spec)
- **Trạng thái:** Chờ hiện thực cho ngưỡng sắp thứ tự; Chạy được cho phần còn lại

### TC-E-DT-03 · Ba trường hợp chấm đặc biệt

- **Nguồn:** Seed scenario E1 mục 4 (đã chốt); G-07
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** màn có nút đếm giờ và một nút thấy sau
- **Dữ liệu vào:** hết giờ ở nút đếm giờ; nút sau chưa tới vì hết thời gian; dùng hint ở một nút
- **Các bước:** 1. Chạy từng trường hợp. 2. Đọc mức các mục con.
- **Kết quả mong đợi:** hết giờ → mức 0, không cờ; nút chưa tới → "không xét", giữ phần quỹ để chơi lại; dùng hint → vẫn chấm, chỉ giảm trọng số mức của mục con đó (hệ số chưa chốt, xem `TC-J-DT-03`)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `shift/engine.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-DT-04 · Luật trùng màn

- **Nguồn:** G-04; Seed scenario, Khối 1 (đã chốt); ERD `PERFORMS_TASK`, `FOCUSES_ON`, `FOR_LEVEL`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** cấp L3 đã có màn M1 (việc `L3#3`, loại tình huống S1, keyword {a, b})
- **Dữ liệu vào:** màn mới theo bảng
- **Các bước:** 1. Thêm từng màn mới. 2. Kiểm tra trùng.
- **Kết quả mong đợi:**

| Cùng cấp?        | Cùng việc chính | Cùng loại tình huống | Cùng cặp keyword | Kết quả                                                  |
| ---------------- | --------------- | -------------------- | ---------------- | -------------------------------------------------------- |
| có               | có              | có                   | bất kỳ           | từ chối                                                  |
| có               | có              | không                | khác cặp         | chấp nhận                                                |
| có               | có              | không                | cùng cặp         | từ chối                                                  |
| có               | không           | bất kỳ               | khác cặp         | chấp nhận                                                |
| không (cấp khác) | có              | bất kỳ               | bất kỳ           | chấp nhận nếu vai người chơi khác, từ chối nếu vai giống |

- **Hậu điều kiện:** không có
- **Tự động hoá:** `content-validator.spec.ts` (mở rộng)
- **Trạng thái:** Chờ hiện thực (FR-33 theo diễn giải G-04)

### TC-E-DT-05 · Nút kết và hộp xác nhận

- **Nguồn:** Luật dẫn truyện, mục B (E7); ERD `NODE.closing`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** màn có hai nút giữa, một nút kết
- **Dữ liệu vào:** bấm nút kết khi (mọi nút giữa đã xảy ra, trước hạn), (còn nút giữa chưa xảy ra), (mọi nút giữa đã xảy ra, đã tới hạn)
- **Các bước:** 1. Bấm nút kết ở từng trạng thái.
- **Kết quả mong đợi:** còn nút giữa chưa xảy ra → không bấm được; trước hạn → hộp xác nhận của giao diện ("Gửi email cho anh An? Gửi xong thì ca này kết thúc.") chứ không phải lời NPC; tới hạn → ca kết thúc theo luật hạn chót của seed (xác nhận cách xử lý với engine khi viết test)
- **Hậu điều kiện:** nút kết chỉ ghi một lần
- **Tự động hoá:** `shift/engine.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-CL-01 · Luật soạn seed A1…A13: luật nào máy kiểm

- **Nguồn:** Luật dẫn truyện, Phần A, B, C
- **Cấp · loại · kỹ thuật:** Static · chất lượng nội dung · checklist
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** seed vàng và một seed lỗi cho từng luật
- **Dữ liệu vào:** bảng dưới
- **Các bước:** 1. Với mỗi luật, tìm lint hiện có. 2. Nếu thiếu lint, ghi vào hàng chờ viết lint hoặc kiểm tay. 3. Chạy seed lỗi và seed vàng.
- **Kết quả mong đợi:** cột "Kiểm bằng" được xác nhận với `lint.ts` ở bước B2; seed vàng không lỗi, mỗi seed lỗi bị đúng luật tương ứng bắt

| Luật    | Nội dung rút gọn                                                 | Kiểm bằng (đề xuất, đối chiếu với lint khi đọc code) |
| ------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| A1, A1b | điểm thời gian cố định, việc có giờ chen ngang                   | Máy                                                  |
| A2      | nút mở là một cuộc trò chuyện                                    | Người                                                |
| A3, A4  | lời soạn chỉ nói điều người nói biết; gọi tên sau khi giới thiệu | Người (R1 máy kiểm một phần)                         |
| A5      | biểu cảm lấy trong bộ có sẵn                                     | Máy                                                  |
| A6      | mỗi lựa chọn có người đáp lại                                    | Máy                                                  |
| A7      | câu hỏi thêm là câu của nhân vật                                 | Máy                                                  |
| A8      | hành động làm bằng chứng phải có chỗ làm thật                    | Máy                                                  |
| A9      | cờ truyện: nút sau nhớ chuyện đã xảy ra                          | Máy                                                  |
| A10     | có chỗ cho chuyện đời thường                                     | Người                                                |
| A11     | nút soạn sẵn thích ứng theo việc đã làm                          | Máy                                                  |
| A12     | điều kiện đọc chữ khai thành câu hỏi có/không                    | Máy                                                  |
| A13     | khúc mắc cho nút kết giấu tới nút kết                            | Máy                                                  |

- **Hậu điều kiện:** danh sách luật chưa có lint được ghi để nhóm quyết định viết hay kiểm tay
- **Tự động hoá:** `shift/lint.spec.ts` (dự kiến), phần "Người" kiểm tay trong play-test
- **Trạng thái:** Chạy được

### TC-E-GB-01 · Mọi keyword đầu ra được luyện ở ít nhất 2 màn

- **Nguồn:** Cơ chế game, khối G ("mỗi keyword đầu ra được luyện ở ít nhất 2 màn"); ERD `FOCUSES_ON`, `TRAINS`; FR-39
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** cấp có `TRAINS` {k1, k2} và các màn đã xuất bản
- **Dữ liệu vào:** cấp có k1 ở 1 màn và k2 ở 2 màn
- **Các bước:** 1. Chạy báo cáo độ phủ keyword theo màn.
- **Kết quả mong đợi:** k1 bị báo thiếu, k2 đạt; cấp chưa đủ phủ không được xuất bản đầy đủ
- **Hậu điều kiện:** không có
- **Tự động hoá:** test truy vấn toàn vẹn (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-E-GB-02 · NFR-09: mỗi màn nêu rõ mục tiêu

- **Nguồn:** NFR-09; Seed scenario B1 (`goal`: một câu, nói khi nào xong, không lộ cách giải)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** seed mẫu
- **Dữ liệu vào:** `goal` rỗng; `goal` không nêu điều kiện xong; `goal` có sẵn
- **Các bước:** 1. Chạy `ContentValidator`.
- **Kết quả mong đợi:** `goal` rỗng bị từ chối; hai trường hợp còn lại: validator chỉ kiểm tồn tại (kiểm chất lượng câu thuộc buổi đọc hiểu của NFR-09, ≥ 80% trên ít nhất 20 người đọc)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `content-validator.spec.ts` (mở rộng); đọc hiểu: thủ công
- **Trạng thái:** Chạy được

### TC-E-DU-01 · `estimated_minutes` tính lại được

- **Nguồn:** ERD `SCENARIO.estimated_minutes` (dẫn xuất)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** seed mẫu
- **Dữ liệu vào:** seed; sửa điểm của một hành động
- **Các bước:** 1. Tính `estimated_minutes`. 2. Sửa điểm một hành động. 3. Tính lại.
- **Kết quả mong đợi:** giá trị phụ thuộc vào điểm hành động, `minutes_per_point`; đổi điểm thì giá trị đổi đúng lượng tương ứng; không lưu giá trị cũ
- **Hậu điều kiện:** không có
- **Tự động hoá:** `content-validator.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-E-EG-01 · Seed vàng Back-end L3 m2 qua lint

- **Nguồn:** `occupation-data/seeds/SWE_BACKEND/L3.m2.json`; Seed mẫu Back-end L3 m2 (bản 4); AGENTS.md (phần `_draft` chờ DE duyệt)
- **Cấp · loại · kỹ thuật:** Unit · hồi quy · đoán lỗi
- **Ưu tiên:** Cao
- **Tiền điều kiện:** `pnpm data:build` đã chạy
- **Dữ liệu vào:** seed vàng; từng bản sao có một lỗi cố ý (thiếu `reaction` của một lựa chọn, cờ đọc mà chưa ai đặt, biểu cảm ngoài bộ, thiếu `fallback_at`)
- **Các bước:** 1. Chạy `lintSeed` trên seed vàng. 2. Chạy trên từng bản lỗi.
- **Kết quả mong đợi:** seed vàng không lỗi nghiêm trọng (cảnh báo phần `_draft` được ghi lại, không bị coi là đạt); mỗi bản lỗi bị đúng luật bắt, không lan sang luật khác
- **Hậu điều kiện:** không có
- **Tự động hoá:** `shift/lint.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-E-UC-01 · UC-E11, UC-E13, UC-E14: chơi một màn

- **Nguồn:** FR-10…FR-14; `AD-01d`, `SD-01`, `SD-02`
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer đã vào cấp; seed Back-end L3 m2 đã xuất bản; `AI_MODE=fake`
- **Dữ liệu vào:** luồng chính: mở đầu → hành động → nút giữa → nút kết → nhìn lại ca; luồng phụ: tạm làm việc khác, hint, câu hỏi thêm; luồng lỗi: đóng trình duyệt giữa chừng, mất mạng, model lỗi
- **Các bước:** 1. Chạy luồng chính. 2. Chạy từng luồng phụ và luồng lỗi. Chi tiết bước đối chiếu với `AD-01d` và `SD-01`.
- **Kết quả mong đợi:** nộp lượt trả về trước khi có lời gọi model; kết quả về qua SSE; sau khi đóng trình duyệt, mở lại tiếp đúng chỗ (NFR-03); lỗi model hiện thông báo và giữ tiến độ (NFR-04)
- **Hậu điều kiện:** `RUN_EVENT` ghi đủ và không trùng
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực (cần E2E; ca làm chưa chấm điểm)

### TC-E-BLK-01 · Kết cục của màn

- **Nguồn:** ERD `[CAM]` `SCENARIO.outcomes`; Seed scenario "chưa chốt"
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: các kết cục của màn khai báo và chọn đúng theo điều kiện. Lý do chặn: research chưa chốt cấu trúc kết cục

## Mục tiêu white box

### WB-E-01 · `apps/api/src/app/scenario/content/content-validator.ts`

- **Tiêu chí phủ:** phủ nhánh và phủ điều kiện (khoảng 52 điểm quyết định)
- **Nhánh cần phủ:** mỗi luật trong bảng `rules`; `followupCap`, `closedActivityCap`, `estimateMinutes`; mỗi lỗi trả về tương ứng
- **Hiện có:** `content-validator.spec.ts`; đo coverage để biết nhánh còn thiếu
- **Trạng thái:** Chạy được

### WB-E-02 · `packages/game-core/src/shift/lint.ts`

- **Tiêu chí phủ:** phủ nhánh (khoảng 63 điểm quyết định)
- **Nhánh cần phủ:** mỗi luật lint của seed (mục tiêu A1…A13 và các luật khai báo)
- **Hiện có:** chỉ qua `engine.spec.ts`; chưa có spec riêng
- **Trạng thái:** Chạy được

### WB-E-03 · `packages/game-core/src/domain/grading/structuredGrading.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `gradeChoice`, `gradeOrdering`, `gradePrioritizing`: biên của từng nhánh theo `TC-E-DT-02`
- **Hiện có:** chưa có test
- **Trạng thái:** Chạy được

### WB-E-04 · `packages/game-core/src/shift/context.ts`, `flags.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `actionAvailability`, `revealCandidates`, `detectReveal`, `buildNarrateRequest`, `waitPoints`; `matches` của cờ truyện (`requires_all`, `requires_none`)
- **Hiện có:** chỉ qua `engine.spec.ts`
- **Trạng thái:** Chạy được
