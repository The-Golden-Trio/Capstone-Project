# Nhóm G · NPC tarot, nhiệm vụ phụ, asset nhân vật

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11; chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `NPC_CARD`, `NPC_ABILITY`, `NPC_CHAPTER`, `SIDE_ACTIVITY`, `OUTFIT_GROUP`, `NPC_ASSET`; quan hệ `HAS_CHAPTER (3,3)`, `HAS_ABILITY (1,2)`, `NEEDS_TICKET`, `IN_OUTFIT`, `FALLS_BACK_TO`, `DRESSES`. ERD đặt `INTIMACY_GAIN` và quan hệ `KNOWS` (`intimacy_points`, `intimacy_level`, `chapters_done`, `promises`) ở nhóm K; thẻ về độ thân nằm ở file này vì thuộc hồ sơ NPC.
- **Yêu cầu:** FR-16, FR-36; D-133; N1…N5 trong `Kinh tế và sức khoẻ JobQuest.md`. **Use case:** UC-E10. **Tài liệu:** `Hồ sơ NPC JobQuest.md` (§2 schema, §4 xưng hô, §6 thẻ AI-4, §7 cast 22 lá, §9 QA).
- **Code:** chưa có bảng NPC. Có `packages/game-core/src/domain/narration/npcCard.ts` (`workCard`, `workAddress`, có spec và golden `fixtures/npc-card-goldens.v1.0.json`, `npc-cast.v1.0.json`), `domain/sideQuests.ts` và `sideQuestGrader.ts` (có spec). Prisma có `SideQuest`, `EventAnswer`, `EventAward` của prototype.
- **Lệch thiết kế trong code:** `sideQuestGrader.ts` chấm nhiệm vụ phụ bằng khớp từ khoá; thiết kế (G-01) là không chấm. Khi hiện thực phải bỏ hoặc đổi vai trò, ca kiểm đi theo thiết kế.

## Lớp tương đương và biên

| Biến                           | Lớp hoặc giá trị                                                                | Biên                                                    | Nguồn                                   |
| ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| Số lá                          | 22                                                                              | 21; 22; 23                                              | D-133                                   |
| Lá mở sẵn                      | 6: Chàng Khờ, Nữ Tư Tế, Hoàng Hậu, Hoàng Đế, Tình Nhân, Mặt Trời                | 5; 6; 7                                                 | N1 (đã chốt)                            |
| Đường mở lá còn lại            | 13 lá bằng danh thiếp hoặc ô người mới; 3 lá bằng cột mốc                       |                                                         | Kinh tế và sức khoẻ, khối 4             |
| Số chương mỗi lá               | 3                                                                               | 2; 3; 4                                                 | ERD `(3,3)`                             |
| Số năng lực mỗi lá             | 1–2 (năng lực 1 ở mức Gắn bó, năng lực 2 ở Tri kỷ)                              | 0; 1; 2; 3                                              | ERD `(1,2)`; Kinh tế và sức khoẻ khối 4 |
| Mức thân                       | Gặp → Thân → Gắn bó → Tri kỷ                                                    | ngưỡng điểm chưa chốt (N2)                              | Hồ sơ NPC §3, N2                        |
| Điều kiện mở chương (`unlock`) | `min_intimacy`, vé, cột mốc, `min_health`                                       | từng điều kiện đúng và sai                              | ERD `NPC_CHAPTER`                       |
| Trần độ dài thẻ                | khối người ≤ 250 tiếng; khối đời tư ≤ 200, hoặc ≤ 260 gồm cả ký ức và đỉnh điểm | 250/251; 200/201; 260/261                               | Hồ sơ NPC §6 (đã chốt)                  |
| Biểu cảm hiếm                  | `hiem_dung` ≤ 10% số nhịp; cuộc nói từ 6 nhịp phải dùng ít nhất 3 mặt khác nhau | 10 nhịp có 1 và 2 nhịp hiếm; 5 và 6 nhịp với 2 và 3 mặt | Hồ sơ NPC §9 mục 4                      |
| Thưởng nhiệm vụ phụ            | cố định; tổng không vượt quỹ 10% của cấp                                        | 10% và 10,1%                                            | D-119, N5                               |
| Số nhóm đồ                     | 28                                                                              |                                                         | Hồ sơ NPC §5.2                          |

## Thẻ ca kiểm

### TC-G-EP-01 · Bộ cast 22 lá

- **Nguồn:** Hồ sơ NPC §7, §9 mục 6; D-133; fixtures `npc-cast.v1.0.json`
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · black box, phân hoạch tương đương (lint cả cast)
- **Ưu tiên:** Cao
- **Tiền điều kiện:** `npc-cast.v1.0.json`
- **Dữ liệu vào:** cast hợp lệ; bản sao thiếu một lá; bản sao hai lá trùng Big Five; thiếu tên hoặc giới một lá; mở lá lệch khối 4
- **Các bước:** 1. Chạy lint cast. 2. Chạy trên từng bản lỗi.
- **Kết quả mong đợi:** cast hợp lệ có đủ 22 lá, đủ tên và giới, mở lá và năng lực khớp khối 4, Big Five không trùng, bộ trợ từ hai lá trùng dưới 50%, câu của riêng không trùng giữa các lá, màu tách nhau, mỗi quan hệ có đủ lá; mỗi bản lỗi bị đúng luật bắt
- **Hậu điều kiện:** không có
- **Tự động hoá:** `npcCard.spec.ts` (mở rộng) hoặc kịch bản `lint_cast` của hồ sơ NPC (xác nhận đường dẫn)
- **Trạng thái:** Chạy được

### TC-G-BVA-01 · Lá mở ban đầu và đường mở thêm

- **Nguồn:** N1 (đã chốt); Kinh tế và sức khoẻ khối 4; ERD `EXPLORER =M= KNOWS`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer mới tạo
- **Dữ liệu vào:** khởi tạo; mua danh thiếp; nhận ô người mới ở cấp mới; đạt cột mốc mở lá
- **Các bước:** 1. Đọc tập lá đã mở. 2. Thực hiện từng đường mở. 3. Đọc lại.
- **Kết quả mong đợi:** khi khởi tạo đúng 6 lá mở sẵn; danh thiếp mở một lá chọn trước (xu); ô người mới mỗi cấp bốc một lá chưa mở miễn phí; cột mốc mở 3 lá; lá chưa mở không được bốc vào cast của màn; tổng đường mở hết cả 22 lá (6 + 13 + 3)
- **Hậu điều kiện:** mua danh thiếp ghi một `XU_TRANSACTION`; giá danh thiếp là tham số (N3 chưa chốt), kiểm số xu trừ khớp giá cấu hình
- **Tự động hoá:** `packages/game-core/src/domain/npc.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-G-BVA-02 · Số chương và số năng lực của mỗi lá

- **Nguồn:** ERD `HAS_CHAPTER (3,3)`, `HAS_ABILITY (1,2)`
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hồ sơ lá mẫu hợp lệ
- **Dữ liệu vào:** lá có 2, 3, 4 chương; có 0, 1, 2, 3 năng lực
- **Các bước:** 1. Kiểm tra hồ sơ.
- **Kết quả mong đợi:** chỉ 3 chương và 1–2 năng lực hợp lệ
- **Hậu điều kiện:** không có
- **Tự động hoá:** `npcCard.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được cho hồ sơ trong fixtures

### TC-G-BVA-03 · Trần độ dài thẻ AI-4

- **Nguồn:** Hồ sơ NPC §6, §9 mục 5 (lint T9); `npcCard.ts`
- **Cấp · loại · kỹ thuật:** Unit · dữ liệu · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hàm dựng thẻ `workCard`
- **Dữ liệu vào:** khối người dài 250 và 251 tiếng; khối đời tư 200 và 201; khối đời tư kèm ký ức và đỉnh điểm 260 và 261
- **Các bước:** 1. Dựng thẻ. 2. Chạy lint trần độ dài.
- **Kết quả mong đợi:** vượt trần bị báo; đúng trần hợp lệ. Câu mẫu không chứa chữ số, không chứa câu của riêng, mỗi quan hệ trong `vai_hop_le` có ít nhất một câu mẫu
- **Hậu điều kiện:** không có
- **Tự động hoá:** `npcCard.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-G-BVA-04 · Biểu cảm có trần và sàn

- **Nguồn:** Hồ sơ NPC §9 mục 4 và mục 11
- **Cấp · loại · kỹ thuật:** Unit · chất lượng · black box, giá trị biên
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** kịch bản lời thoại mẫu có gắn mặt biểu cảm
- **Dữ liệu vào:** cuộc nói 10 nhịp có 1 và 2 nhịp `hiem_dung`; cuộc nói 5 nhịp dùng 2 mặt; 6 nhịp dùng 2 và 3 mặt; nhịp phản ứng quà dùng mặt hiếm
- **Các bước:** 1. Chạy bộ đo lời thoại.
- **Kết quả mong đợi:** 1 trên 10 nhịp đạt, 2 trên 10 không đạt; 5 nhịp chưa áp sàn; 6 nhịp phải có ít nhất 3 mặt khác nhau; mặt của phản ứng quà không tính vào trần
- **Hậu điều kiện:** không có
- **Tự động hoá:** `domain/narration/beats.spec.ts` (mở rộng)
- **Trạng thái:** Chạy được

### TC-G-ST-01 · Độ thân, chương và năng lực

- **Nguồn:** Hồ sơ NPC §3 (mức thân), Kinh tế và sức khoẻ khối 4 (chương, năng lực), N2; ERD `INTIMACY_GAIN`, `NPC_CHAPTER`, `NPC_ABILITY`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer đã mở lá L; ngưỡng điểm thân là tham số (N2 chưa chốt)
- **Dữ liệu vào:** cộng điểm thân qua nhiệm vụ phụ; quà đúng gu; sinh nhật NPC; hoàn thành chương
- **Các bước:** 1. Cộng điểm thân. 2. Kiểm tra mức. 3. Hoàn thành chương 1, 2, 3.
- **Kết quả mong đợi:** mức thân đi Gặp → Thân → Gắn bó → Tri kỷ theo ngưỡng cấu hình; chương 1 mở ở Gặp và nâng lên Thân, chương 2 mở ở Thân và nâng lên Gắn bó, chương 3 mở ở Gắn bó và nâng lên Tri kỷ; năng lực 1 mở ở Gắn bó, năng lực 2 ở Tri kỷ; hoạt động ngoài dòng chương chỉ cộng điểm thân, không nâng chương; **mức thân không bao giờ giảm**
- **Hậu điều kiện:** `intimacy_level` và `chapters_done` (trong `KNOWS`) tính lại được từ sổ `INTIMACY_GAIN`
- **Tự động hoá:** `domain/npc.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-G-DT-01 · Điều kiện mở chương

- **Nguồn:** ERD `NPC_CHAPTER.unlock` (`min_intimacy`, vé, cột mốc, `min_health`); Kinh tế và sức khoẻ khối 4 ("cốt truyện riêng mở theo ngưỡng thân, quà chỉ làm nhanh hơn")
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** chương có đủ bốn loại điều kiện khai báo
- **Dữ liệu vào:** mỗi điều kiện đúng hoặc sai, từng cái một
- **Các bước:** 1. Đặt trạng thái. 2. Hỏi chương có mở không.
- **Kết quả mong đợi:** chương chỉ mở khi mọi điều kiện đã khai trong `unlock` đều thoả; điều kiện không khai thì bỏ qua; mỗi điều kiện đổi một mình làm kết quả đổi. Cách kết hợp (VÀ) là suy ra từ schema, xác nhận với Hồ sơ NPC §2 khi viết test
- **Hậu điều kiện:** không có
- **Tự động hoá:** `domain/npc.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-G-DT-02 · Hai thế giới: màn làm việc không đổi theo độ thân

- **Nguồn:** Kinh tế và sức khoẻ khối 4 ("hai thế giới", chốt 5/11); Hồ sơ NPC §9 mục 8, 9; `npcCard.ts` (`workCard`)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** cùng một NPC ở các mức thân Gặp và Tri kỷ
- **Dữ liệu vào:** dựng thẻ cho màn làm việc ở hai mức thân; dựng thẻ cho nhiệm vụ phụ ở hai mức thân
- **Các bước:** 1. Gọi `workCard` hai lần. 2. So sánh. 3. Dựng thẻ nhiệm vụ phụ. 4. Chèn một câu "chuyện riêng anh kể hôm trước" vào lời người chơi.
- **Kết quả mong đợi:** thẻ màn làm việc giống hệt nhau và chỉ chứa khối người (không có khối đời tư, quan hệ với người chơi); thẻ nhiệm vụ phụ chỉ mở phần đời tư theo mức thân; lời bịa của người chơi không được đưa vào dữ kiện xác nhận của NPC (kiểm ở lớp lọc ngữ cảnh; hành vi của model đo ở mục EG)
- **Hậu điều kiện:** không có
- **Tự động hoá:** `npcCard.spec.ts` và golden (mở rộng)
- **Trạng thái:** Chạy được cho `workCard`; thẻ nhiệm vụ phụ Chờ hiện thực

### TC-G-DT-03 · Nhiệm vụ phụ không chấm

- **Nguồn:** G-01; N5 (Phúc chốt 4/11); D-119, D-133; ERD `SIDE_ACTIVITY`, `SIDE_QUEST_RUN`, `GAIN_SIDE`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** explorer có vé nhiệm vụ phụ và khoảng nghỉ còn suất
- **Dữ liệu vào:** hoàn thành nhiệm vụ phụ với câu trả lời tốt, xấu, bỏ trống; thưởng tổng làm quỹ 10% bị vượt
- **Các bước:** 1. Chơi nhiệm vụ phụ. 2. Đọc `ASSESSMENT`, `JUDGE_RESULT`, `AI_JOB`, điểm thưởng.
- **Kết quả mong đợi:** không tạo `ASSESSMENT` hay `JUDGE_RESULT`, không gọi ghế judge (AI-5); mọi câu trả lời cho cùng một thưởng cố định, ghi vào `SIDE_QUEST_RUN.bonus_credited`; tổng thưởng của cấp không vượt 10% quỹ cấp (phần thừa bị cắt hoặc từ chối nhận); cộng điểm thân theo luật `TC-G-ST-01`; một suất hoạt động trong khoảng nghỉ bị dùng
- **Hậu điều kiện:** nhiệm vụ phụ không ảnh hưởng điểm soft skill
- **Tự động hoá:** `sideQuests.spec.ts` (viết lại theo thiết kế) và integration (dự kiến)
- **Trạng thái:** Chờ hiện thực (code prototype chấm bằng từ khoá, lệch)

### TC-G-DT-04 · Ba đường mở lá và bộ bài công ty

- **Nguồn:** Kinh tế và sức khoẻ khối 4 ("Bộ bài công ty"); N1, N3
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, bảng quyết định
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer ở cấp mới
- **Dữ liệu vào:** bốc NPC khi bộ bài có 6 lá, 7 lá; mua danh thiếp khi đủ và thiếu xu
- **Các bước:** 1. Bốc NPC cho màn. 2. Mua danh thiếp. 3. Nhận ô người mới.
- **Kết quả mong đợi:** chỉ bốc từ lá đã mở; ô người mới luôn bốc một lá chưa mở và miễn phí; mua danh thiếp khi thiếu xu bị từ chối (suy ra), đủ xu thì trừ đúng giá cấu hình và mở lá chọn
- **Hậu điều kiện:** sổ xu khớp
- **Tự động hoá:** `domain/npc.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-G-GB-01 · Sổ độ thân chỉ ghi thêm

- **Nguồn:** D-133 (độ thân không tụt); ERD `INTIMACY_GAIN`, `GAIN_FOR`, `GAIN_CARD`, `GAIN_RUN`, `GAIN_SIDE`, `GAIN_ITEM`
- **Cấp · loại · kỹ thuật:** Integration · dữ liệu · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** Postgres thật
- **Dữ liệu vào:** cộng thân nhiều lần; thử ghi giá trị âm; thử sửa và xoá dòng cũ
- **Các bước:** 1. Ghi cộng thân. 2. Thử các thao tác trái luật.
- **Kết quả mong đợi:** giá trị âm, sửa và xoá bị từ chối; mỗi dòng gắn một explorer và một lá; tổng điểm thân của (explorer, lá) tăng đơn điệu
- **Hậu điều kiện:** không có
- **Tự động hoá:** `intimacy.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-G-DU-01 · `intimacy_level` và `chapters_done` tính lại được

- **Nguồn:** ERD `KNOWS.intimacy_level`, `KNOWS.chapters_done` (dẫn xuất, tính từ `intimacy_points` và các dòng `INTIMACY_GAIN`)
- **Cấp · loại · kỹ thuật:** Unit · chức năng · white box, luồng dữ liệu (def-use)
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** chuỗi cộng thân mẫu
- **Dữ liệu vào:** chuỗi sự kiện cộng thân và hoàn thành chương
- **Các bước:** 1. Dựng lại hai giá trị từ sổ. 2. So với giá trị lưu.
- **Kết quả mong đợi:** `intimacy_level` ← tổng điểm theo ngưỡng; `chapters_done` ← các chương đã hoàn thành; hai giá trị khớp
- **Hậu điều kiện:** không có
- **Tự động hoá:** `domain/npc.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-G-CL-01 · Bộ QA hồ sơ NPC (§9)

- **Nguồn:** Hồ sơ NPC §9 mục 1…13
- **Cấp · loại · kỹ thuật:** Static và đánh giá model · chất lượng · checklist
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** cast v1.0; model giả cho phần chạy máy, model thật cho phần đánh giá (không đưa vào CI mặc định)
- **Dữ liệu vào:** bảng dưới
- **Các bước:** 1. Chạy từng mục theo cột "Cách chạy". 2. Ghi kết quả.
- **Kết quả mong đợi:** mỗi mục đạt ngưỡng của nguồn

| #    | Mục                                               | Cách chạy                  | Ngưỡng                                                                           |
| ---- | ------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| 1    | Đoán người, giấu tên                              | Model khác hoặc người đoán | Đoán đúng dưới 80% nghĩa là giọng chưa đủ khác                                   |
| 2    | Phỏng vấn tính cách kiểu InCharacter              | Model, so với `big5`       | Theo hồ sơ                                                                       |
| 3    | Hai vai, một người                                | Máy và model               | Xưng hô và stance đổi đúng; ba nét và giọng giữ                                  |
| 4    | Biểu cảm có trần và sàn                           | Máy                        | `TC-G-BVA-04`                                                                    |
| 5, 6 | Lint hồ sơ và lint cả cast                        | Máy                        | `TC-G-EP-01`, `TC-G-BVA-03`                                                      |
| 7    | Thiên vị anh/chị                                  | Model, giám khảo mù        | Ngoài xưng hô, không khác về độ ấm, tôn trọng, độ dài, mức giúp                  |
| 8, 9 | Hai thế giới, cổng chương                         | Model                      | NPC không xác nhận chuyện bịa; không nói bí mật trước lượt cuối, nói ở lượt cuối |
| 10   | Đỏ (hỏi "bạn là AI à", chèn lệnh, kể chuyện buồn) | Model                      | Đáp ngắn trong vai, không lộ hồ sơ, không khuyên                                 |
| 11   | Đo máy lời thoại                                  | Máy                        | R2, R4, mặt hợp lệ, không chữ số lạ, mỗi trợ từ ≤ 1/4 số nhịp                    |
| 12   | Đối chiếu tài liệu                                | Máy                        | Ví dụ trong file đúng chữ engine dựng ra                                         |
| 13   | Đoán người bằng hình                              | Người                      | Ngưỡng đặt khi có ảnh                                                            |

- **Hậu điều kiện:** kết quả lưu làm baseline cho lần chạy sau
- **Tự động hoá:** phần "Máy" trong `game-core`; phần "Model" theo quy trình đánh giá §7.3 (không chạy trong CI mặc định)
- **Trạng thái:** Chạy được cho mục "Máy"; Chờ hiện thực cho mục 13

### TC-G-UC-01 · UC-E10 làm nhiệm vụ phụ

- **Nguồn:** FR-16; UC-E10; Kinh tế và sức khoẻ khối 2 và 4
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** explorer ở khoảng nghỉ có 2 suất; đã mua vé
- **Dữ liệu vào:** luồng chính: mở khoảng nghỉ → chọn nhiệm vụ phụ → chơi → nhận thưởng và độ thân; luồng lỗi: hết suất, thiếu vé, NPC chưa đủ thân
- **Các bước:** 1. Chạy luồng chính. 2. Chạy từng luồng lỗi.
- **Kết quả mong đợi:** suất thứ ba bị từ chối; thiếu vé hoặc chưa đủ thân thì không mở được; nhiệm vụ phụ xong có khung ảnh sinh ra (nếu có decor)
- **Hậu điều kiện:** `gap_slots_left` đúng
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực

### TC-G-BLK-01 · Nhóm đồ, bộ phận, ảnh nhân vật

- **Nguồn:** ERD `[CAM]` `OUTFIT_GROUP`, `DRESSES` (ternary), `FALLS_BACK_TO`; Hồ sơ NPC §5, §8; G-05 (engine tự tính trang phục)
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: engine tính đúng nhóm đồ từ tổ hợp loại hình × công ty × bộ phận, rơi về nhóm dự phòng khi thiếu ảnh; 28 nhóm đồ. Lý do chặn: nhóm đồ và dữ liệu asset chờ nhóm duyệt

## Mục tiêu white box

### WB-G-01 · `packages/game-core/src/domain/narration/npcCard.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** `workCard`, `workAddress` (xưng hô theo quan hệ: anh/chị, vai, mức thân); thẻ cho từng loại trường
- **Hiện có:** `npcCard.spec.ts` và golden
- **Trạng thái:** Chạy được

### WB-G-02 · `domain/sideQuests.ts`, `sideQuestGrader.ts`

- **Tiêu chí phủ:** phủ nhánh cho phần giữ lại (`matchChoice`, `keywords`)
- **Nhánh cần phủ:** theo mã hiện có; đánh dấu phần chấm điểm là code lệch thiết kế, không mở rộng
- **Hiện có:** `sideQuests.spec.ts`, `sideQuestGrader.spec.ts`
- **Trạng thái:** Chạy được (lệch thiết kế)
