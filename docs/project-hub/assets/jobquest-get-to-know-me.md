# Get to Know Me: đặc tả (mô hình RIASEC)

> Bước tự vấn **tuỳ chọn** (D-29) ở đầu hành trình. Đo **hồ sơ sở thích RIASEC** của người chơi (Holland, 1997) bằng **13 câu với 9 dạng trả lời**, rồi kết thúc bằng màn **Chân dung**: StarMap 5 nghề hợp nhất (FR-10), Workstyle của người chơi và đoạn mô tả do AI viết (FR-13, DR-13).
>
> **Trạng thái:** nhóm chốt 15/10 dùng thang RIASEC, dưới 15 câu, nhiều dạng trả lời (chưa ghi vào [02](../02-quyet-dinh.md)). Bản này **thay** mô hình hai trục ở D-75. **Code chưa đổi theo**: nhánh `feat/gtkm` vẫn chạy bản v0.3 (19 câu, hai trục World-of-Work). Xem §10.

## 1. Vị trí trong sản phẩm

- JobQuest **không phán "bạn hợp nghề X"** (D-02). Bài này chỉ gợi ý **nên ghé hành tinh nào trước**; người chơi tự kiểm chứng bằng cách làm nhiệm vụ.
- Lần đầu đăng nhập được mời vào (`decideGate`), có nút **Bỏ qua** ở mọi câu. Sau đó vào lại lúc nào cũng được; **làm lại thì thay hẳn** kết quả lần trước.
- Thời lượng khoảng **5–7 phút**: 1 câu giai đoạn, 10 câu có chấm, 2 câu kể ngắn.

## 2. Mô hình

### 2.1 Sáu kiểu RIASEC

Holland (1997) chia sở thích nghề nghiệp thành sáu kiểu, xếp trên một hình lục giác. Hai kiểu kề nhau thì giống nhau, hai kiểu đối diện thì khác nhau nhất.

```
              R ─────── I
            ╱             ╲
          C                 A
            ╲             ╱
              E ─────── S
```

| Kiểu | Tên hiển thị | Thích làm gì |
|---|---|---|
| **R** Realistic | Người thực hành (Doer) | làm bằng tay, với công cụ, máy móc, hệ thống |
| **I** Investigative | Người phân tích (Thinker) | tìm hiểu, phân tích, giải bài toán khó |
| **A** Artistic | Người sáng tạo (Creator) | sáng tạo, diễn đạt, làm việc không theo khuôn |
| **S** Social | Người hỗ trợ (Helper) | giúp đỡ, dạy, chăm sóc người khác |
| **E** Enterprising | Người dẫn dắt (Persuader) | thuyết phục, lãnh đạo, ra quyết định |
| **C** Conventional | Người tổ chức (Organizer) | sắp xếp, làm theo quy trình, xử lý dữ liệu |

Tên tiếng Anh trong ngoặc là biệt danh phổ biến của sáu kiểu, không phải tên trong bài gốc. Khi trích nguồn, dùng mã RIASEC.

### 2.2 Workstyle = hồ sơ RIASEC

Trên giao diện, hồ sơ RIASEC của người chơi mang tên **Workstyle**, giữ tên đã chốt ở D-75. Trong report nên gọi đúng là **hồ sơ sở thích RIASEC**, vì O*NET dùng "Work Styles" cho một khái niệm khác (phẩm chất cá nhân).

Workstyle mô tả **người chơi thích làm việc với cái gì, qua ai**. Nó **không** đo năng lực, tính cách, hay mức độ hợp một nghề cụ thể. **Không kiểu nào tốt hơn kiểu nào**, và giao diện ghi rõ điều đó.

### 2.3 Kết quả tính ra

| Kết quả | Ý nghĩa | Nguồn |
|---|---|---|
| **6 điểm RIASEC** (0–100) | mức thích từng kiểu | Holland |
| **Mã Holland** 3 chữ, ví dụ "IRC" | ba kiểu cao nhất theo thứ tự | Holland |
| **Độ phân hoá** (differentiation) | hồ sơ nhọn (rõ ràng) hay phẳng (chưa rõ) | Holland |
| **Độ nhất quán** (consistency) | hai kiểu cao nhất nằm kề nhau, cách một, hay đối diện trên lục giác | Holland |
| **Mức hứng thú chung** (elevation) | thích nhiều thứ hay ít thứ, nói chung | Holland |
| **Vị trí World-of-Work** (2 trục) | tóm tắt 6 điểm thành một điểm trên bản đồ, để hiển thị | Prediger (1982) |

So với mô hình hai trục cũ, ba chỉ số phân hoá, nhất quán và mức hứng thú chung giữ lại những thông tin mà một điểm trên bản đồ làm mất:
- người thích **cả hai kiểu đối diện** (ví dụ R và S) có độ nhất quán thấp, thay vì bị hiển thị là "cân bằng";
- người **thích mọi thứ** và người **không thích gì** đều có hồ sơ phẳng, nhưng mức hứng thú chung khác nhau.

## 3. Bộ câu hỏi

### 3.1 Nguyên tắc thiết kế

- **Mỗi câu đo nhiều kiểu cùng lúc.** Bản ngắn chuẩn của O*NET Interest Profiler có 60 câu, mỗi câu đo một kiểu. Ở đây dùng các dạng xếp hạng, chọn tốt nhất và tệ nhất, chia điểm, chọn nhiều, nên 10 câu có chấm cho khoảng **10 lần quan sát trên mỗi kiểu**.
- **Trộn hai nhóm dạng câu:**
  - **Dạng tuyệt đối** (chọn nhiều, thang 5 mức) cho biết người chơi thích một kiểu **nhiều hay ít**. Chỉ nhóm này đo được mức hứng thú chung, và chỉ nhóm này phát hiện được người thích cả hai kiểu đối diện.
  - **Dạng so sánh** (xếp hạng, MaxDiff, chia điểm, chọn hai, thanh trượt) ép người chơi phân biệt các kiểu, nên ít bị kiểu "cái gì cũng thích". Tổng điểm của dạng này luôn cố định, nên không đo được mức hứng thú chung (Hicks, 1970).
- **Hoạt động rộng hơn IT.** Bài đo sở thích của con người, không phải sở thích trong IT. Chỉ hỏi về IT thì gần như ai cũng ra R, I hoặc C.
- **Đảo thứ tự lựa chọn** ngẫu nhiên cho mỗi người chơi, để vị trí trên màn hình không ảnh hưởng tới câu trả lời.
- **Nội dung dưới đây là bản nháp nhóm soạn** theo phong cách của O*NET Interest Profiler. Trước khi dùng thật, cần đối chiếu hoặc thay bằng câu chuyển thể từ kho câu O*NET, rồi qua bước chuyên gia phân loại mù (§8.1).

### 3.2 Tổng quan 13 câu

| # | Dạng | Nhóm | Kiểu được đo | Số quan sát mỗi kiểu |
|---|---|---|---|---|
| 0 | Chọn một (giai đoạn) | — | không chấm | — |
| 1 | Chọn nhiều (12 thẻ) | tuyệt đối | cả 6 | 2 |
| 2 | Thang 5 mức (6 việc) | tuyệt đối | cả 6 | 1 |
| 3 | Xếp hạng kéo thả (6 môi trường) | so sánh | cả 6 | 1 |
| 4–6 | MaxDiff, 3 lượt × 4 việc | so sánh | mỗi lượt 4 kiểu | 2 |
| 7 | Chia 10 điểm (6 vai trò) | so sánh | cả 6 | 1 |
| 8 | Tình huống, chọn 2 trong 6 | so sánh | cả 6 | 1 |
| 9 | Chọn 2 trong 6 hình | so sánh | cả 6 | 1 |
| 10 | 3 thanh trượt cặp đối diện | so sánh | cả 6 | 1 |
| 11–12 | Tự luận, AI đọc | bổ sung | tuỳ câu trả lời | 0–2 |

Tổng mỗi kiểu: **10 quan sát** từ câu 1–10 (3 tuyệt đối, 7 so sánh), cộng thêm câu kể nếu AI tìm được bằng chứng.

### 3.3 Nội dung từng câu (bản nháp)

**Câu 0. Giai đoạn** (không chấm, chỉ để chỉnh giọng văn đoạn mô tả)
"Bạn đang ở giai đoạn nào?" · Học sinh, đang chọn ngành · Sinh viên hoặc mới ra trường · Đã đi làm, đang nghĩ chuyện đổi nghề · Chỉ tò mò muốn thử.

**Câu 1. Chọn nhiều.** "Những việc nào bạn muốn thử ngay? Chọn bao nhiêu cũng được."

| Kiểu | Thẻ 1 | Thẻ 2 |
|---|---|---|
| R | Lắp ráp và sửa một chiếc máy tính | Dựng hệ thống đèn và âm thanh cho một sự kiện |
| I | Tìm ra vì sao một thí nghiệm cho kết quả lạ | Đọc dữ liệu để hiểu vì sao người dùng bỏ app |
| A | Vẽ giao diện cho một ứng dụng mới | Viết kịch bản cho một video ngắn |
| S | Kèm một bạn mới học lập trình | Lắng nghe và giúp một người bạn đang gặp khó khăn |
| E | Thuyết phục một nhà tài trợ ủng hộ dự án | Dẫn dắt một nhóm hoàn thành dự án đúng hạn |
| C | Sắp xếp lại một bộ dữ liệu cho gọn và đúng | Lập bảng theo dõi chi tiêu và tiến độ cho nhóm |

**Câu 2. Thang 5 mức** (rất ghét · ghét · bình thường · thích · rất thích). "Bạn thấy thế nào nếu phải…"

| Kiểu | Việc |
|---|---|
| R | Tự tay sửa một thiết bị bị hỏng |
| I | Giải một bài toán khó mà chưa ai chỉ cách |
| A | Sáng tác nhạc, vẽ hoặc thiết kế một thứ của riêng mình |
| S | Dạy hoặc hướng dẫn người khác một kỹ năng |
| E | Bán một sản phẩm, hoặc thuyết phục người khác làm theo ý mình |
| C | Kiểm tra số liệu và giấy tờ cho thật chính xác |

**Câu 3. Xếp hạng.** "Kéo để xếp các nơi làm việc từ muốn nhất tới ít muốn nhất." Cần có nút lên/xuống thay cho kéo thả, để dùng được bằng bàn phím.

| Kiểu | Môi trường |
|---|---|
| R | Xưởng kỹ thuật hoặc phòng máy, làm việc với thiết bị |
| I | Phòng lab, nơi mọi người thử nghiệm và phân tích |
| A | Studio sáng tạo, không có khuôn mẫu cố định |
| S | Lớp học hoặc trung tâm hỗ trợ, gặp nhiều người cần giúp |
| E | Văn phòng kinh doanh, nhiều cuộc họp và quyết định |
| C | Phòng vận hành, quy trình rõ ràng, mọi thứ ngăn nắp |

**Câu 4–6. MaxDiff** (Louviere, Flynn & Marley, 2015). Mỗi lượt có 4 việc; người chơi chọn **việc thích nhất** và **việc ít thích nhất**. Ba lượt được xếp sao cho **mỗi kiểu xuất hiện đúng 2 lần**: lượt 1 gồm R, I, A, S; lượt 2 gồm R, A, E, C; lượt 3 gồm I, S, E, C.

| Lượt | Lựa chọn |
|---|---|
| 4 | (R) Cài đặt và cấu hình mạng cho một văn phòng · (I) Phân tích vì sao một hệ thống chạy chậm · (A) Thiết kế logo và bộ nhận diện cho một câu lạc bộ · (S) Tổ chức buổi chia sẻ kinh nghiệm cho sinh viên năm nhất |
| 5 | (R) Lắp và lập trình một robot nhỏ · (A) Làm video giới thiệu một sản phẩm · (E) Đàm phán giá với một khách hàng · (C) Lập kế hoạch và ngân sách chi tiết cho một dự án |
| 6 | (I) Nghiên cứu một công nghệ mới rồi viết báo cáo · (S) Hỗ trợ khách hàng gỡ rối qua điện thoại · (E) Khởi động một dự án kinh doanh của riêng mình · (C) Soát lỗi và chuẩn hoá tài liệu theo quy định |

**Câu 7. Chia điểm.** "Nhóm bạn làm một app cho trường. Chia 10 điểm cho các vai trò theo mức bạn muốn nhận."

| Kiểu | Vai trò |
|---|---|
| R | Người dựng: viết code, cài đặt, làm cho nó chạy |
| I | Người tìm nguyên nhân: phân tích lỗi, thử giả thuyết |
| A | Người thiết kế trải nghiệm: giao diện, hình ảnh, cảm giác khi dùng |
| S | Người hỗ trợ: giúp đồng đội, hướng dẫn người dùng |
| E | Người dẫn dắt: thuyết trình, kêu gọi tài trợ, chốt quyết định |
| C | Người lên kế hoạch: chia việc, theo dõi tiến độ, giữ tài liệu |

**Câu 8. Tình huống, chọn 2.** "App của nhóm sập ngay trước buổi demo. Bạn muốn nhận hai việc nào?"

| Kiểu | Phương án |
|---|---|
| R | Tự tay khởi động lại máy chủ, sửa cấu hình |
| I | Đọc log để tìm nguyên nhân gốc |
| A | Nghĩ ra cách trình bày khác bằng bản thiết kế để buổi demo vẫn ổn |
| S | Trấn an đồng đội, giúp từng người làm phần của mình |
| E | Ra nói chuyện với ban giám khảo, xin thêm thời gian |
| C | Lập danh sách việc cần làm, theo dõi ai đang làm gì |

**Câu 9. Chọn 2 trong 6 hình.** "Bạn muốn mình ở trong cảnh nào?" Sáu tranh minh hoạ cùng một phong cách, tránh khuôn mẫu về giới tính và ngoại hình.

| Kiểu | Cảnh |
|---|---|
| R | Một người đeo găng lắp thiết bị trong phòng máy chủ |
| I | Một người đứng trước bảng đầy biểu đồ và công thức |
| A | Bàn làm việc bày bản phác thảo và bảng màu |
| S | Một người đang hướng dẫn một nhóm nhỏ |
| E | Một người đang thuyết trình trước khán giả |
| C | Màn hình với bảng tính và lịch được sắp xếp gọn gàng |

**Câu 10. Thanh trượt cặp đối diện.** Ba thanh 7 mức, mỗi thanh nối hai kiểu **đối diện** trên lục giác. Người chơi kéo về phía mình thích hơn.

| Cặp | Đầu trái | Đầu phải |
|---|---|---|
| R ↔ S | Sửa một cái máy | Giúp một con người |
| I ↔ E | Tìm hiểu cho thật rõ vì sao | Ra quyết định và kéo mọi người làm theo |
| A ↔ C | Tự do sáng tạo, không có khuôn | Làm đúng quy trình, rõ ràng từng bước |

**Câu 11–12. Kể ngắn** (20–400 ký tự, bắt buộc nếu đã làm bài).
- **T1:** "Kể một lần bạn làm một việc mà quên cả giờ giấc. Bạn đang làm gì, một mình hay với ai?"
- **T2:** "Năm năm nữa, nếu có ai quay lại một ngày làm việc lý tưởng của bạn, người xem sẽ thấy bạn đang làm gì?"

## 4. Chấm điểm

### 4.1 Quy từng dạng câu về thang 0–1 cho mỗi kiểu

| Câu | Cách quy |
|---|---|
| 1. Chọn nhiều | số thẻ được chọn của kiểu đó ÷ 2 |
| 2. Thang 5 mức | (mức − 1) ÷ 4 |
| 3. Xếp hạng | (6 − thứ hạng) ÷ 5; hạng 1 được 1, hạng 6 được 0 |
| 4–6. MaxDiff | mỗi lần xuất hiện: thích nhất +1, ít thích nhất −1, còn lại 0; cộng 2 lần xuất hiện được s ∈ [−2, 2]; quy về (s + 2) ÷ 4 |
| 7. Chia điểm | số điểm ÷ 10 |
| 8. Tình huống | 1 nếu được chọn, 0 nếu không |
| 9. Chọn hình | 1 nếu được chọn, 0 nếu không |
| 10. Thanh trượt | vị trí t ∈ {−3…+3}, dương về đầu phải: kiểu đầu phải được (t + 3) ÷ 6, kiểu đầu trái được 1 − (t + 3) ÷ 6 |
| 11–12. Kể ngắn | AI trả, cho mỗi kiểu có bằng chứng, một giá trị nguyên −2…+2 **kèm trích dẫn nguyên văn**; quy về (giá trị + 2) ÷ 4. Kiểu không có bằng chứng thì câu này không tính cho kiểu đó |

**Luật cho câu kể** (cùng kiểu bằng chứng như FR-05):
- máy chủ **bỏ** mọi giá trị có trích dẫn không tìm thấy trong câu trả lời (không phân biệt hoa thường và khoảng trắng);
- lưu bằng chứng để giải thích và kiểm lại được;
- không có AI (chưa cấu hình khoá, lỗi, quá 8 giây, bị từ chối) thì câu kể **nằm chờ** và được đọc lại lần sau; Chân dung báo "phần kể ngắn chưa được đọc".

### 4.2 Gộp thành 6 điểm và các chỉ số

```
điểm(k)   = round(100 · Σ_f w_f · v_f(k) / Σ_f w_f)     k ∈ {R, I, A, S, E, C}
             (chỉ cộng những dạng f có quan sát cho kiểu k; mặc định mọi w_f = 1)
mức chung = round(100 · trung bình của v(k) trên câu 1 và câu 2)
```

- **Mã Holland:** ba kiểu có điểm cao nhất. Hai kiểu chênh nhau dưới 5 điểm thì coi là ngang nhau và hiển thị cả hai thứ tự, ví dụ "I/R".
- **Độ phân hoá** = điểm cao nhất − điểm thấp nhất. Ngưỡng tạm: dưới 20 là *phẳng*, 20–40 là *vừa*, trên 40 là *rõ*. Hiệu chỉnh sau pilot.
- **Độ nhất quán** theo vị trí của hai kiểu cao nhất trên lục giác:
  - **cao** khi kề nhau: RI, IA, AS, SE, EC, CR;
  - **vừa** khi cách một: RA, IS, AE, SC, ER, CI;
  - **thấp** khi đối diện: RS, IE, AC.
- **Vị trí World-of-Work.** Trừ mỗi điểm cho trung bình 6 điểm của chính người đó (để bỏ mức hứng thú chung), rồi áp công thức của Prediger:
  ```
  Data/Ideas    = 1.73E + 1.73C − 1.73I − 1.73A
  People/Things = 2S + E + A − 2R − I − C        (dương = People)
  ```
  Chuẩn hoá về −1…1 để vẽ. Vị trí này **chỉ để hiển thị**; mọi phép tính khác dùng 6 điểm.

### 4.3 Ví dụ

Một người chơi có 6 điểm R 72, I 80, A 45, S 30, E 35, C 60:
- Mã Holland **IRC**, tức Người phân tích, rồi Người thực hành, rồi Người tổ chức.
- Độ phân hoá = 80 − 30 = 50, tức **rõ**.
- Hai kiểu cao nhất I và R kề nhau, nên độ nhất quán **cao**.
- Trên bản đồ World-of-Work, chấm nằm ở nửa Vật, hơi lệch về Ý tưởng.

Nếu thay vào đó R 75, S 74 và các kiểu còn lại thấp, thì R và S đối diện nhau, độ nhất quán **thấp**. Đoạn mô tả sẽ nói người chơi thích cả làm kỹ thuật lẫn giúp người. Mô hình hai trục cũ đặt người này ở tâm và gọi là "cân bằng".

## 5. Cập nhật theo lượt chơi (đề xuất, chưa chốt)

FR-13 yêu cầu Workstyle cập nhật khi người chơi chơi. Đề xuất:

- **Gắn nhãn RIASEC** cho mỗi lựa chọn trong nhiệm vụ phụ và scenario, ví dụ "đọc log tìm nguyên nhân" là I. Nhãn do nhóm soạn và **domain expert duyệt**.
- **Chỉ tính người chơi chọn gì**, không tính họ làm tốt tới đâu, vì đây là sở thích, không phải năng lực.
- **Trộn với kết quả bài tự vấn** bằng trung bình có trọng số: cả bài nặng bằng *m* lựa chọn khi chơi trên mỗi kiểu (đề xuất *m* = 10, bằng số quan sát của bài). Lúc đầu bài quyết định; chơi càng nhiều thì hành vi thật càng lấn át.
- **Bỏ qua bài** thì xuất phát từ hồ sơ phẳng, mức 50 cho cả 6 kiểu. Giao diện báo "chưa đủ dữ liệu" cho tới khi đủ số lựa chọn tối thiểu.
- **Luật soạn nội dung:** mỗi sự kiện có lựa chọn gắn RIASEC thì nên có ít nhất hai kiểu khác nhau, để người chơi có thể đi theo nhiều hướng.

## 6. Năm nghề hợp nhất (StarMap)

Bài mới **không còn đo 8 chiều** nữa, nên top 5 không thể tiếp tục dựa vào chân dung 8 chiều sau bài tự vấn. Đề xuất:

- **So 6 điểm của người chơi với hồ sơ RIASEC của từng nghề trong O*NET** (mục *Interests*). Việc này cần gắn 22 nghề IT với mã O*NET-SOC; nghề không có mã riêng thì lấy trung bình vài mã gần nhất, và domain expert duyệt.
- **Độ khớp** = tương quan giữa hai hồ sơ 6 điểm, kèm một chỉ số tương hợp giữa mã Holland của người chơi và của nghề.
- **Lý do** hiện cạnh mỗi hành tinh là kiểu góp nhiều nhất vào độ khớp, ví dụ "vì bạn thích phân tích và tự tay làm".
- **Chân dung 8 chiều** vẫn giữ, nhưng chỉ tích luỹ từ nhiệm vụ phụ và chỉ dùng cho gợi ý nghề kề (`adjacentRoles`).

Việc này **cần chốt riêng**, vì nó thay đổi dữ liệu nghề (§11).

## 7. Hiển thị và đoạn mô tả

**Thẻ Workstyle trên màn Chân dung và trong Hành trang:**
- mã Holland và tên kiểu đầu tiên, kèm một câu mô tả;
- biểu đồ lục giác 6 điểm: hình dạng cho thấy ngay độ phân hoá và độ nhất quán;
- bản đồ World-of-Work với chấm vị trí, dùng lại thành phần `WorkstyleMap` đã có;
- nhãn độ phân hoá và độ nhất quán, viết bằng lời thường, ví dụ "Bạn nghiêng rất rõ về…" hoặc "Bạn thích cả hai hướng khá khác nhau…";
- dòng nguồn "Dựa trên mô hình RIASEC của Holland và World-of-Work Map (Prediger, 1982)";
- câu "Không kiểu nào tốt hơn kiểu nào".

**Đoạn "Về bạn" do AI viết:**
- **Đầu vào:** giai đoạn, 6 điểm, mã Holland, độ phân hoá, độ nhất quán, tên 5 nghề, hai câu kể, ngôn ngữ. **Không gửi tên, email, ngày sinh** hay định danh nào (NFR-05).
- **Luật viết:** 2–3 câu, tối đa 80 từ, xưng "bạn"; tả cách người chơi thích làm việc và nêu một điều có thể khó; được nhắc 1–2 nghề như chỗ nên thử trước, nhưng **không bảo chọn nghề nào, không nói hợp hay không hợp**, không dùng nhãn kiểu MBTI.
- **Nhãn "AI viết · có thể chưa đúng"** (NFR-07). Không có AI thì viết bằng khuôn cố định theo mã Holland (VI và EN).
- **Chỉ viết lại khi nền đổi:** làm lại bài, mã Holland đổi, tập 5 nghề đổi, câu kể vừa được đọc, đổi ngôn ngữ.

## 8. Kế hoạch kiểm định

13 câu **có đủ** để đo RIASEC hay không là một nhận định đo lường, chỉ chứng minh được bằng dữ liệu. Có hai giai đoạn.

### 8.1 Giai đoạn 0: trước khi có người chơi

| Bước | Làm gì | Ra con số gì |
|---|---|---|
| Ma trận phủ nội dung | Lập bảng *kiểu × mặt chính × dạng câu*. Kiểm mỗi kiểu được đo bằng ít nhất 3 dạng câu khác nhau và mỗi mặt chính có câu chạm tới | bảng phủ |
| Chuyên gia phân loại mù | 3–5 người am hiểu RIASEC xếp từng lựa chọn (khoảng 70) vào một kiểu mà không biết nhóm định gán kiểu nào | Fleiss' kappa; I-CVI từng lựa chọn (Lynn, 1986) |
| Mô phỏng | Tạo vài nghìn người chơi ảo với hồ sơ biết trước (ví dụ từ hồ sơ RIASEC các nghề O*NET), cộng nhiễu, cho làm bài, rồi khôi phục 6 điểm | tương quan điểm khôi phục với điểm thật; tỉ lệ đúng chữ đầu và hai chữ đầu của mã Holland |

Mô phỏng chứng minh **thiết kế** không làm mất thông tin. Nó không chứng minh người thật trả lời đúng như mô hình giả định.

### 8.2 Giai đoạn 1: pilot với người thật

Cùng một nhóm người làm **cả hai bài**: bài 13 câu và **O*NET Interest Profiler bản 60 câu** (công khai, dịch sang tiếng Việt bằng cách dịch xuôi rồi dịch ngược). Thứ tự làm hai bài đảo ngẫu nhiên.

| Kiểm tra | Chỉ số | Ngưỡng |
|---|---|---|
| Hội tụ từng kiểu | tương quan điểm cùng kiểu giữa hai bài | r ≥ 0,70 (ngưỡng hay dùng cho bài rút gọn) |
| Phân biệt | ma trận đa đặc điểm – đa phương pháp (Campbell & Fiske, 1959): cùng kiểu khác bài phải cao hơn khác kiểu | đúng cho cả 6 kiểu |
| Mã Holland | tỉ lệ trùng chữ đầu; trùng hai chữ đầu không kể thứ tự; chỉ số tương hợp | nhóm đặt trước khi pilot |
| Hồ sơ từng người | trung vị của tương quan 6 điểm giữa hai bài | |
| Cấu trúc lục giác | kiểm định thứ tự vòng tròn bằng randomization test (Hubert & Arabie, 1987), ví dụ chạy RANDALL (Tracey, 1997) | correspondence index dương, có ý nghĩa |
| Ổn định | làm lại bài 13 câu sau khoảng 2 tuần | r ≥ 0,70; mã Holland ít đổi |

- **Cỡ mẫu:** khoảng 100–200 người cho phần so với O*NET, khoảng 50 người làm lại. Người dưới 16 tuổi cần người giám hộ đồng ý (NFR-05).
- **Nếu chưa đạt:** phân tích từng câu để bỏ hoặc sửa câu kém; **hiệu chỉnh trọng số w_f** từng dạng câu bằng hồi quy lên điểm O*NET.
- **Viết vào report:** trước pilot chỉ được nói bài "được thiết kế để đo" và đưa số liệu của giai đoạn 0. Sau pilot mới được nói bài "cho kết quả tương đương" bài RIASEC chuẩn.
- Phần này thuộc kế hoạch đánh giá offline (RP-5).

## 9. Giới hạn đã biết

- **Đây là một công cụ mới, chưa kiểm định.** Dù nội dung chuyển thể từ O*NET, việc đổi dạng câu và rút xuống 13 câu tạo ra công cụ khác bài gốc. Kết quả chỉ là gợi ý hướng khám phá cho tới khi qua §8.2.
- **RIASEC chỉ là một khía cạnh của cách làm việc:** làm với cái gì, qua ai. Nó không đo điều kiện làm việc chịu được (áp lực, bị ngắt quãng), giá trị nghề nghiệp (thu nhập, ổn định, tự do), hay năng lực.
- **Hai trục của Prediger không giải thích hết cấu trúc sở thích.** Theo trí nhớ của Claude, nghiên cứu sau này (Tracey & Rounds) có đề xuất thêm một chiều về mức uy tín của nghề; cần kiểm nguồn trước khi trích dẫn.
- **Dạng so sánh làm tổng điểm cố định.** Mức hứng thú chung vì vậy chỉ dựa trên 3 quan sát mỗi kiểu (câu 1 và 2), nên kém chính xác hơn 6 điểm RIASEC.
- **Trọng số và ngưỡng** (w_f = 1, ngưỡng phân hoá 20/40, ngưỡng ngang nhau 5 điểm, *m* = 10) đều là giá trị tạm, chưa hiệu chỉnh trên dữ liệu thật.
- **Hồ sơ RIASEC của nghề lấy từ O*NET**, tức thị trường Mỹ. Nghề IT ở Việt Nam có thể khác; domain expert nên duyệt.

## 10. Hiện trạng code (chưa đổi theo bản này)

Nhánh `feat/gtkm` đang chạy bản v0.3:
- 19 câu: 15 câu hai vế, 3 câu kể, 1 câu giai đoạn;
- đo 8 chiều và hai trục World-of-Work trực tiếp;
- top 5 theo chân dung 8 chiều.

Muốn cài bản RIASEC thì cần:

| Phần | Thay đổi |
|---|---|
| Dữ liệu câu hỏi | định dạng mới cho 9 dạng câu, mỗi lựa chọn gắn một kiểu RIASEC |
| game-core | module chấm RIASEC thay cho `quiz.ts` và `workstyle.ts` hiện tại; `textSignal.ts` đọc 6 kiểu thay cho 8 chiều và 2 trục |
| API | lưu 6 điểm và bằng chứng câu kể; trả mã Holland, các chỉ số và vị trí World-of-Work; prompt đọc câu kể theo RIASEC |
| Database | migration mới cho 6 điểm RIASEC. Hai migration cũ của nhánh (`20260930…`, `20261013…`) chưa chạy trên DB chung, nên có thể gộp hoặc bỏ |
| Web | các thành phần trả lời mới: chọn nhiều, thang 5 mức, xếp hạng, MaxDiff, chia điểm, chọn hình, thanh trượt; biểu đồ lục giác; `WorkstyleMap` nhận vị trí tính từ 6 điểm |
| Dữ liệu nghề | gắn 22 nghề với mã O*NET-SOC và hồ sơ RIASEC (nếu chốt §6) |
| Nội dung | 6 tranh minh hoạ cho câu 9 |

## 11. Cần chốt

1. **Nguồn nội dung:** chuyển thể từ kho câu O*NET Interest Profiler (đề xuất), hay giữ bản nháp nhóm soạn ở §3.3 sau khi qua chuyên gia.
2. **Top 5 nghề:** chuyển sang so khớp RIASEC với O*NET (§6). Bài mới không đo 8 chiều nữa, nên nếu không chuyển thì top 5 sau bài tự vấn không còn dữ liệu để tính.
3. **Cập nhật theo lượt chơi:** có gắn nhãn RIASEC cho lựa chọn trong nhiệm vụ không, và ai duyệt nhãn (§5).
4. **Trọng số các dạng câu:** bằng nhau cho tới khi có pilot (đề xuất), hay đặt khác ngay từ đầu.
5. **Ghi quyết định vào [02](../02-quyet-dinh.md):** thêm D-76 cho mô hình RIASEC 13 câu, và đánh dấu ♻️ phần hai trục của D-75.

## 12. Tài liệu tham khảo (cho report)

- Holland, J. L. (1997). *Making vocational choices: A theory of vocational personalities and work environments* (3rd ed.). Psychological Assessment Resources.
- Prediger, D. J. (1982). Dimensions underlying Holland's hexagon: Missing link between interests and occupations? *Journal of Vocational Behavior, 21*(3), 259–287.
- Louviere, J. J., Flynn, T. N., & Marley, A. A. J. (2015). *Best-worst scaling: Theory, methods and applications*. Cambridge University Press.
- Hicks, L. E. (1970). Some properties of ipsative, normative, and forced-choice normative measures. *Psychological Bulletin, 74*(3), 167–184.
- Campbell, D. T., & Fiske, D. W. (1959). Convergent and discriminant validation by the multitrait–multimethod matrix. *Psychological Bulletin, 56*(2), 81–105.
- Lynn, M. R. (1986). Determination and quantification of content validity. *Nursing Research, 35*(6), 382–385.
- Hubert, L., & Arabie, P. (1987). Evaluating order hypotheses within proximity matrices. *Psychological Bulletin, 102*(1), 172–178.
- Tracey, T. J. G. (1997). RANDALL: A Microsoft FORTRAN program for a randomization test of hypothesized order relations. *Educational and Psychological Measurement, 57*(1), 164–168.
- O*NET Resource Center: tài liệu kỹ thuật của O*NET Interest Profiler (bản 60 câu và các bản rút gọn), và dữ liệu *Interests* của từng nghề.

> Thông tin trích dẫn ghi theo trí nhớ của Claude. **Kiểm lại số trang, số tập và DOI trên Google Scholar trước khi đưa vào report.** Với O*NET, ghi rõ phiên bản cơ sở dữ liệu và tài liệu kỹ thuật cụ thể mà nhóm dùng.
