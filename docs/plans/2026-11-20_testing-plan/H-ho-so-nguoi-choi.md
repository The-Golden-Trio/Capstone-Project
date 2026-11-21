# Nhóm H · Hồ sơ explorer (Get to know me, gợi ý nghề, hồ sơ cá nhân)

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `EXPLORER` (`address_form`, `stage`, `zodiac_sign`, `riasec_self`, `riasec_tried`), `GTKM_CARD`, `GTKM_ATTEMPT`, `GOAL_QUESTION`, `GOAL_OPTION`, `EXPLORER_GOAL`, `HOBBY`, `DISTRESS_TERM`, `ZODIAC_SIGN`, `ACHIEVEMENT`, `SUGGESTION_EVENT` (`scored_scenarios`); quan hệ `ANSWERS_CARD (18,18)`, `LIKES (0,5)`, `PROGRESSES (7,7)`, `BOOSTS (2,2)`, `SUGGESTS (0,9)`.
- **Yêu cầu:** FR-03, FR-04, FR-18; DR-12; D-108, D-111, D-125; NFR-07, NFR-08. **Use case:** UC-E03, UC-E04, UC-E19. **Diagram:** `AD-01b`, `SD-03`; class `CL-05` (ExplorerCareerAndLife). **Tài liệu:** `Hồ sơ JobQuest cơ chế game.md` khối C, D, E; `Gợi ý nghề cách tính.md`; `Hoàng đạo 12 cung.md`.
- **Code:** có quiz RIASEC và hồ sơ của prototype (`GameProfile`, `profile.service.ts` `submitQuiz`, `importLegacy`). `game-core/src/profile/` có `riasec.ts` (`combinedAxis`, `isFlatProfile`), `softSkills.ts`, `zodiac.ts` (có `profile.spec.ts`); `domain/fit.ts` (`cosine`, `rankRoles`, `adjacentRoles`, `applySignal`, có `fit.spec.ts`). Chưa có bảng GTKM, mục tiêu, thành tựu, `SUGGESTION_EVENT`. Web có màn demo và `quizDraft.ts`.

## Lớp tương đương và biên

| Biến               | Lớp hoặc giá trị                                                      | Biên                    | Nguồn                             |
| ------------------ | --------------------------------------------------------------------- | ----------------------- | --------------------------------- |
| Thẻ GTKM           | 18 thẻ: 12 RIASEC (2 mỗi trục) và 6 thẻ vùng; mở rộng được tới 24     | 17; 18; 19 thẻ          | Cơ chế game khối C; ERD `(18,18)` |
| Giá trị thẻ        | 1 Không thích, 2 Bình thường, 3 Thích                                 | 0; 1; 3; 4              | Cơ chế game khối C                |
| Điểm trục RIASEC   | trung bình hai thẻ, trong [1, 3]                                      | 1; 2; 3                 | Cơ chế game khối B                |
| Hồ sơ phẳng        | độ lệch chuẩn các trục < 0,15 (E2, tạm)                               | 0,149; 0,15             | Gợi ý nghề khối E                 |
| Số vùng được gợi ý | 2–3 trong 6 vùng (G-06)                                               |                         | D-125                             |
| Ô gợi ý            | 3 ô, mỗi ô 0–3 nghề; ô 2 và 3 tối đa 2 nghề mỗi nhóm ngành; ô rỗng ẩn | 0; 3; 4 nghề            | D-111                             |
| Hạng độ khớp r     | A ≥ 0,73; B ≥ 0,61; C ≥ 0,43                                          | 0,43; 0,429; 0,61; 0,73 | Gợi ý nghề, khối E                |
| Hạng độ giỏi S     | A ≥ 0,67; B ≥ 0,55; C ≥ 0,38                                          | 0,38; 0,379; 0,55; 0,67 | Gợi ý nghề, khối E                |
| Số sự kiện gợi ý   | `SUGGESTS (0,9)`                                                      | 9; 10                   | ERD                               |
| Điểm mạnh yếu      | chỉ hiện sau ít nhất 3 màn có điểm (B5, tạm)                          | 2; 3                    | Cơ chế game                       |
| Ghim thành tựu     | tối đa 3                                                              | 3; 4                    | Cơ chế game khối D                |
| Câu mục tiêu       | 5 câu                                                                 | 4; 5; 6                 | Cơ chế game khối C                |
| Sở thích (`LIKES`) | 0–5 sở thích (`HOBBY`)                                                | 0; 5; 6                 | ERD `(0,5)`                       |
| Cung hoàng đạo     | 12 cung theo ngày sinh                                                | các ngày biên dưới      | Hoàng đạo 12 cung                 |

Ngày biên của 12 cung (đầu – cuối): Bạch Dương 21/3 – 19/4; Kim Ngưu 20/4 – 20/5; Song Tử 21/5 – 20/6; Cự Giải 21/6 – 22/7; Sư Tử 23/7 – 22/8; Xử Nữ 23/8 – 22/9; Thiên Bình 23/9 – 22/10; Bọ Cạp 23/10 – 21/11; Nhân Mã 22/11 – 21/12; Ma Kết 22/12 – 19/1; Bảo Bình 20/1 – 18/2; Song Ngư 19/2 – 20/3.

## Thẻ ca kiểm

### TC-H-EP-01 · Nộp Get to know me: giá trị và số thẻ

- **Nguồn:** FR-04; DR-12; Cơ chế game khối C; ERD `ANSWERS_CARD (18,18)`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer đã đăng nhập
- **Dữ liệu vào:** 18 thẻ đủ giá trị 1, 2, 3; 17 thẻ; 19 thẻ; một thẻ có giá trị 0 hoặc 4; một thẻ lặp
- **Các bước:** 1. Gửi từng bộ. 2. Đọc `GTKM_ATTEMPT`.
- **Kết quả mong đợi:** chỉ bộ đủ 18 thẻ, giá trị 1–3, mỗi thẻ một lần được chấp nhận; bộ lỗi bị từ chối, không ghi lần làm
- **Hậu điều kiện:** `GTKM_ATTEMPT` đặt `is_current` cho lần mới nhất
- **Tự động hoá:** `apps/api/src/app/profile/profile.service.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (code prototype dùng quiz cũ)

### TC-H-BVA-01 · Điểm trục RIASEC và hồ sơ phẳng

- **Nguồn:** Cơ chế game khối B; Gợi ý nghề khối E; `riasec.ts` (`combinedAxis`, `isFlatProfile`)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** hàm tính trục từ hai thẻ
- **Dữ liệu vào:** cặp thẻ (1, 1), (1, 3), (3, 3), (2, 3); hồ sơ sáu trục đều 2; hồ sơ có độ lệch chuẩn đúng 0,15 và dưới 0,15 (dựng từ dữ liệu tính trước)
- **Các bước:** 1. Tính trục. 2. Gọi `isFlatProfile`.
- **Kết quả mong đợi:** trục là trung bình: 1; 2; 3; 2,5, luôn trong [1, 3]; hồ sơ sáu trục đều nhau là phẳng; độ lệch 0,15 không phải phẳng, dưới 0,15 là phẳng (nếu code dùng độ lệch mẫu hay độ lệch tổng thể thì ghi rõ trong test)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `packages/game-core/src/profile/profile.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được (xác nhận ngưỡng 0,15 trong code)

### TC-H-BVA-02 · Cung hoàng đạo theo ngày sinh

- **Nguồn:** `Hoàng đạo 12 cung.md`; ERD `EXPLORER.zodiac_sign` (dẫn xuất), `ZODIAC_SIGN`; `zodiac.ts`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hàm cung theo ngày
- **Dữ liệu vào:** ngày đầu và ngày cuối của mỗi cung (24 ngày) và các ngày liền kề; 29/2 của năm nhuận
- **Các bước:** 1. Tính cung cho từng ngày.
- **Kết quả mong đợi:** mỗi ngày thuộc đúng một cung theo bảng ngày biên; 19/1 là Ma Kết, 20/1 là Bảo Bình; 29/2 là Song Ngư
- **Hậu điều kiện:** không có
- **Tự động hoá:** `profile.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-H-DT-01 · Ba ô gợi ý nghề

- **Nguồn:** D-111 (đã chốt); Gợi ý nghề khối E; Cơ chế game, khối E; ERD `SUGGESTION_EVENT`, `SUGGESTS`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer có hồ sơ RIASEC, đã chơi vài màn, danh sách nghề với độ khớp r và độ giỏi S
- **Dữ liệu vào:** nghề thử với các điều kiện dưới đây
- **Các bước:** 1. Tính ba ô. 2. Kiểm từng điều kiện.
- **Kết quả mong đợi:**

| Ô                                    | Điều kiện của một nghề để vào ô                             | Giới hạn                     |
| ------------------------------------ | ----------------------------------------------------------- | ---------------------------- |
| 1. Cùng nhóm ngành, bạn có thể thích | độ giống nghề ≥ 1,2 hoặc keyword chung ≥ 30%, và r hạng A–C | tối đa 3                     |
| 2. Khác nhóm ngành, bạn làm tốt      | S hạng A–C, bậc ≥ 2, r ≥ 0                                  | tối đa 3, mỗi nhóm ngành ≤ 2 |
| 3. Khác nhóm ngành, bạn có thể thích | r hạng A–C, có ít nhất 1 nghề ở nhóm ngành chưa ghé         | tối đa 3, mỗi nhóm ngành ≤ 2 |

Thêm: biên r = 0,43, 0,429, 0,61, 0,73; S = 0,38, 0,379, 0,55, 0,67; loại nghề đã chơi hoặc đã gợi ý trong 2 lượt gần nhất; ô rỗng ẩn.

- **Hậu điều kiện:** mỗi lần gợi ý ghi `SUGGESTION_EVENT` với `scored_scenarios`
- **Tự động hoá:** `packages/game-core/src/domain/suggest.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (`fit.ts` là bản prototype; kiểm xem đã theo công thức khối E chưa)

### TC-H-DT-02 · Hồ sơ phẳng hoặc chưa có dữ liệu

- **Nguồn:** Gợi ý nghề khối E ("Chưa có dữ liệu", E2 tạm); Cơ chế game khối E
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer mới (chưa chơi), explorer hồ sơ phẳng, explorer hồ sơ rõ
- **Dữ liệu vào:** ba loại explorer
- **Các bước:** 1. Tính gợi ý.
- **Kết quả mong đợi:** hồ sơ phẳng hoặc chưa có dữ liệu → 3 nghề ở 3 vùng RIASEC cách xa nhau, không lấy nghề phổ biến; hồ sơ rõ → theo `TC-H-DT-01`
- **Hậu điều kiện:** không có
- **Tự động hoá:** `suggest.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-H-DT-03 · Kết quả GTKM: vùng nên thử

- **Nguồn:** G-06; D-125; Cơ chế game khối C
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** sáu thẻ vùng với giá trị khác nhau
- **Dữ liệu vào:** (a) hai vùng thích, bốn vùng thường; (b) cả sáu vùng thích; (c) cả sáu vùng không thích
- **Các bước:** 1. Tính kết quả.
- **Kết quả mong đợi:** kết quả là hai hoặc ba vùng nên thử trước (không phải danh sách 5 nghề như FR-03); trường hợp (b) và (c) vẫn trả kết quả hợp lý, không lỗi; mỗi nghề thuộc đúng một vùng (`occupation-data/decisions/interest_regions.json`)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `profile.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (quy tắc chọn 2–3 vùng khi đồng điểm chưa ghi; kiểm bất biến số vùng 2–3)

### TC-H-BVA-03 · Điểm mạnh yếu, ghim thành tựu, số sự kiện

- **Nguồn:** Cơ chế game khối B (B5 tạm), khối D; ERD `SUGGESTS (0,9)`, `SUGGESTION_EVENT.scored_scenarios`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** ngưỡng 3 là tham số
- **Dữ liệu vào:** explorer có 2 và 3 màn có điểm; ghim 3 và 4 thành tựu; 9 và 10 sự kiện gợi ý trong một lần
- **Các bước:** 1. Mở trang hồ sơ. 2. Ghim. 3. Sinh gợi ý.
- **Kết quả mong đợi:** 2 màn chưa hiện nhận xét điểm mạnh yếu, 3 màn hiện; ghim thứ 4 bị từ chối; sự kiện thứ 10 bị từ chối
- **Hậu điều kiện:** không có
- **Tự động hoá:** `suggest.spec.ts`, `profile.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-H-EG-01 · Công bằng của gợi ý (kiểm biến đổi)

- **Nguồn:** Gợi ý nghề, "Chọn gợi ý" (không dùng giới tính, lương, độ danh giá); Hồ sơ người chơi khối F (cung hoàng đạo chỉ trang trí)
- **Cấp · loại · kỹ thuật:** Unit · công bằng · đoán lỗi (metamorphic)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer có hồ sơ cố định
- **Dữ liệu vào:** đổi `address_form` giữa anh và chị; đổi ngày sinh sang cung khác; đổi lương và độ danh giá của các nghề ứng viên
- **Các bước:** 1. Tính gợi ý gốc. 2. Đổi từng biến một. 3. Tính lại.
- **Kết quả mong đợi:** danh sách gợi ý và thứ tự không đổi (lương và danh giá không tham gia xếp hạng; `address_form` chỉ dùng để xưng hô; cung hoàng đạo không là đầu vào của gợi ý hay nhận xét tính cách)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `suggest.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-H-EP-02 · Lời lý do của gợi ý

- **Nguồn:** Gợi ý nghề, "Lời lý do"; Cơ chế game, đoạn "Lời lý do" (bằng chứng và từ cấm)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** gợi ý của một nghề
- **Dữ liệu vào:** gợi ý dựa trên việc đã làm; gợi ý dựa trên điều người chơi nói thích; gợi ý không có bằng chứng
- **Các bước:** 1. Sinh lời lý do.
- **Kết quả mong đợi:** mỗi lời lý do một dòng, nêu bằng chứng cụ thể và nói rõ nguồn ("bạn đã làm…" khác "bạn nói bạn thích…"); không chứa từ cấm theo danh sách của nguồn; gợi ý không có bằng chứng không được sinh lời lý do bịa
- **Hậu điều kiện:** không có
- **Tự động hoá:** `suggest.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (danh sách từ cấm xác nhận ở Cơ chế game)

### TC-H-GB-01 · Get to know me không gọi AI

- **Nguồn:** FR-04; CLAUDE.md; ERD `GTKM_ATTEMPT`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** cổng model giả đếm lời gọi
- **Dữ liệu vào:** toàn bộ luồng GTKM, gồm cả câu mục tiêu tự viết
- **Các bước:** 1. Chạy luồng. 2. Đọc số `AI_JOB` và `MODEL_CALL` sinh ra.
- **Kết quả mong đợi:** 0 lời gọi model trong khi làm GTKM; văn bản tự viết chỉ lưu, chưa gửi đi (dữ liệu gửi AI chỉ xảy ra ở màn sau, sau khử định danh, và người chơi được thông báo trước)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `profile.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-H-GB-02 · Làm lại GTKM thay hồ sơ cũ

- **Nguồn:** DR-12; ERD `GTKM_ATTEMPT.is_current`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer đã làm GTKM một lần
- **Dữ liệu vào:** làm lần hai với câu trả lời khác
- **Các bước:** 1. Làm lại. 2. Đọc `GTKM_ATTEMPT` và `riasec_self`.
- **Kết quả mong đợi:** đúng một lần có `is_current`; `riasec_self` tính lại hoàn toàn từ lần mới nhất; lần cũ còn trong lịch sử nhưng không ảnh hưởng gợi ý; hồ sơ tính lại được từ câu trả lời đã lưu
- **Hậu điều kiện:** không có
- **Tự động hoá:** `profile.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-H-DU-01 · Thuộc tính dẫn xuất nhóm H tính lại được

- **Nguồn:** ERD `EXPLORER.zodiac_sign`, `riasec_self`, `riasec_tried`; `SUGGESTION_EVENT.scored_scenarios`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hồ sơ explorer mẫu
- **Dữ liệu vào:** ngày sinh, câu trả lời GTKM, các lần chạm "thích" sau màn (`INTEREST_TAP`), số màn có điểm
- **Các bước:** 1. Xoá giá trị lưu. 2. Tính lại từ dữ liệu gốc.
- **Kết quả mong đợi:** `zodiac_sign` ← `date_of_birth`; `riasec_self` ← `GTKM_ATTEMPT`; `riasec_tried` ← các lần chạm "thích" gắn trục RIASEC của nút; `scored_scenarios` ← số màn có điểm. Giá trị tính lại bằng giá trị lưu
- **Hậu điều kiện:** không có
- **Tự động hoá:** `profile.spec.ts` (mở rộng)
- **Trạng thái:** Chờ hiện thực

### TC-H-EG-02 · Hồi quy mô phỏng người chơi giả

- **Nguồn:** Gợi ý nghề khối 4B (mô phỏng 20–30 người chơi giả: mỗi kiểu RIASEC chủ đạo × vài mức soft skill, chạy 5 cấp)
- **Cấp · loại · kỹ thuật:** System · chất lượng · thăm dò
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** dữ liệu nghề 221 nghề; công thức khối E
- **Dữ liệu vào:** 20–30 người chơi giả
- **Các bước:** 1. Chạy 5 cấp cho từng người. 2. Thống kê.
- **Kết quả mong đợi:** đo số nghề từng được gợi ý, độ đa dạng mỗi màn; luật "nhóm ngành chưa ghé" đúng 100%; đổi giới tính không đổi gợi ý; hồ sơ phẳng xử lý đúng. Đây là bước kiểm định B của nguồn; bước C (chuyên gia chấm, kappa) và D (khoảng 34 học sinh, cần đồng ý của phụ huynh nếu dưới 18 tuổi) là nghiệm thu thủ công, ngoài phạm vi tự động
- **Hậu điều kiện:** báo cáo số liệu lưu lại để dùng ở chương đánh giá
- **Tự động hoá:** script mô phỏng (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-H-UC-01 · UC-E03, UC-E04, UC-E19: GTKM, chân dung, hồ sơ cá nhân

- **Nguồn:** FR-03, FR-04, FR-18; `AD-01b`, `SD-03`; NFR-07, NFR-08
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer mới đăng nhập
- **Dữ liệu vào:** luồng chính: 18 thẻ và năm câu mục tiêu (khoảng ba phút) → kết quả vùng nên thử → vào bản đồ → xem hồ sơ; luồng phụ: bỏ qua GTKM (D-29, tuỳ chọn); luồng lỗi: đóng giữa chừng
- **Các bước:** 1. Chạy luồng chính. 2. Bỏ qua GTKM. 3. Đóng và mở lại giữa chừng.
- **Kết quả mong đợi:** mọi chữ hiển thị tiếng Việt; bỏ qua GTKM vẫn dùng được app; đóng giữa chừng giữ bản nháp; hồ sơ cá nhân chỉ riêng tư của người đó
- **Hậu điều kiện:** không có
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực

### TC-H-BLK-01 · Từ báo hiệu căng thẳng và danh sách thành tựu

- **Nguồn:** ERD `[CAM]` `DISTRESS_TERM` (H4, còn gọi C4), `ACHIEVEMENT` (D3, khoảng 100 thành tựu)
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: văn bản người chơi tự viết chứa từ báo hiệu căng thẳng thì app hiện lời hỗ trợ thay vì tiếp tục như thường; thành tựu mở đúng điều kiện và không trùng. Lý do chặn: danh sách từ và danh sách thành tựu chưa chốt

## Mục tiêu white box

### WB-H-01 · `packages/game-core/src/profile/riasec.ts`, `zodiac.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `combinedAxis` với dữ liệu thiếu; `isFlatProfile` ở biên; cung ở 24 ngày biên
- **Hiện có:** `profile.spec.ts`
- **Trạng thái:** Chạy được

### WB-H-02 · `packages/game-core/src/domain/fit.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `cosine`, `rankRoles`, `adjacentRoles`, `applySignal`; xác định nhánh nào còn đúng theo công thức khối E (trọng số RIASEC 2, kiến thức 2, kỹ năng 1, phong cách làm việc 1)
- **Hiện có:** `fit.spec.ts`; code prototype, có thể lệch công thức khối E
- **Trạng thái:** Chạy được (kiểm lại công thức khi viết test)

### WB-H-03 · `apps/api/src/app/profile/profile.service.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `submitQuiz`, `answerEvent`, `importLegacy`; nhánh lỗi của từng hàm
- **Hiện có:** chưa có spec; module prototype không khớp CL-00, ghi rõ khi viết
- **Trạng thái:** Chạy được
