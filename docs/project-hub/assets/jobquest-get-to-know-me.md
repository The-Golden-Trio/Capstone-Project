# Get to Know Me: đặc tả

> Bước tự vấn **tuỳ chọn** (D-29) ở đầu hành trình. Kết thúc bằng màn **Chân dung** gồm ba phần: **StarMap 5 nghề hợp nhất** (FR-10), **đoạn mô tả người chơi do AI viết** và **chỉ số xã hội** (FR-13, DR-13).
> Quyết định: [D-74](../02-quyet-dinh.md). Dữ liệu: `occupation-data/datasets/DRAFT_fit_quiz.json` v0.2 (vẫn `CHUA_VERIFY`). Code: `packages/game-core/src/domain/{quiz,social,textSignal,fit}.ts`, `apps/api/src/profile/`, `apps/web/src/routes/Quiz*.tsx`.

## 1. Vị trí trong sản phẩm

- JobQuest **không phán "bạn hợp nghề X"** (D-02). Bài này chỉ gợi ý **nên ghé hành tinh nào trước**; người chơi tự kiểm chứng bằng cách làm nhiệm vụ.
- Lần đầu đăng nhập được mời vào (`decideGate`), có nút **Bỏ qua** ở mọi câu. Sau đó vào lại lúc nào cũng được; **làm lại thì thay hẳn** phần đóng góp của lần trước.
- Đã làm thì **ba câu kể ngắn là bắt buộc**: đó là phần AI đọc để hiểu người chơi. Bỏ ngang thì gửi phần đã làm.
- Thời lượng khoảng 5 phút: 1 câu giai đoạn, 14 câu hai vế, 3 câu kể ngắn.

## 2. Bộ câu hỏi

Thứ tự: stage → q1 → q2 → q3 → q4 → T1 → q5 → q6 → q7 → q8 → q9 → T2 → q10 → q11 → q12 → q13 → q14 → T3. Ba câu kể xen giữa để người chơi không phải viết liền một lúc.

**Câu hai vế.** Chọn một vế, rồi chọn mức **"Rất giống mình" (×1)** hoặc **"Hơi giống" (×0.5)**. Mỗi vế cộng tín hiệu vào 1–3 trong 8 chiều. Hai vế được soạn để **nghe đều chấp nhận được**, tránh việc người chơi chọn vế "nghe hay hơn" (điểm yếu đã ghi ở v0.1). Cột `Người/Vật` là giá trị trên trục Người–Vật (§4).

| ID | Câu | Vế A | Vế B |
|---|---|---|---|
| q1 | Một buổi chiều làm việc lý tưởng với bạn là | Bốn tiếng liền không ai làm phiền, làm xong đúng một thứ<br>`DEEP_WORK+2 INTERRUPT−1 · Vật −1` | Họp với ba nhóm khác nhau, gỡ được vài chỗ đang tắc<br>`PEOPLE+2 INTERRUPT+1 · Người +1` |
| q2 | Bạn nhận một yêu cầu chỉ có đúng một câu, không rõ phải làm gì | Thấy thú vị. Tự tìm hiểu rồi đề xuất cách làm<br>`AMBIGUITY+2` | Hỏi lại cho rõ đầu vào, đầu ra rồi mới bắt tay làm<br>`AMBIGUITY−2 DETAIL+1` |
| q3 | Điện thoại reo lúc 10 giờ tối, hệ thống đang có chuyện | Mở máy xử lý luôn. Cảm giác gỡ được sự cố khá đã<br>`PRESSURE+2 INTERRUPT+2` | Nếu hay xảy ra thì mình không trụ được lâu ở chỗ đó<br>`PRESSURE−2 INTERRUPT−2` |
| q4 | Trong một bản báo cáo dài, bạn thường là người | Phát hiện ra con số ở trang 7 không khớp với trang 2<br>`DETAIL+2 DEEP_WORK+1` | Nhìn ra kết luận chung, chi tiết nhỏ để người khác soát<br>`DETAIL−1 AMBIGUITY+1` |
| q5 | Sau một tuần làm việc, điều khiến bạn thấy đáng nhất là | Có thứ chạy được để đưa người khác xem ngay<br>`VISIBLE+2` | Một phần nền móng chưa ai thấy, nhưng mình biết nó chắc<br>`VISIBLE−1 DEEP_WORK+2` |
| q6 | Một công việc phải lặp lại gần như y hệt mỗi tuần | Không sao. Làm quen tay rồi thì nhanh và ít sai<br>`REPETITION+2 DETAIL+1` | Chịu được vài tuần, sau đó phải tìm cách tự động hoá nó đi<br>`REPETITION−2 AMBIGUITY+1` |
| q7 | Trong một dự án nhóm, bạn thường nhận phần | Đi hỏi người dùng và các bên xem họ thật sự cần gì<br>`PEOPLE+2 AMBIGUITY+1 · Người +2` | Phần khó nhất về kỹ thuật, ít người khác làm được<br>`DEEP_WORK+2 PEOPLE−1 · Vật −2` |
| q8 | Đồng đội kẹt ở một lỗi mà bạn từng gặp | Kéo ghế ngồi cạnh, cùng dò cho tới khi hiểu<br>`PEOPLE+2 INTERRUPT+1 · Người +2` | Gửi link tài liệu và cách sửa, rồi quay lại việc của mình<br>`DEEP_WORK+1 INTERRUPT−1 · Vật −1` |
| q9 | Mai là hạn nộp, còn ba đầu việc chưa xong | Tối nay dồn sức làm, áp lực thế này mình làm nhanh hơn<br>`PRESSURE+2 VISIBLE+1` | Mình ghét cảnh này nên lẽ ra đã chia việc từ tuần trước<br>`PRESSURE−2 DETAIL+1` |
| q10 | Tin nhắn công việc cứ đến liên tục trong lúc bạn đang làm | Trả lời ngay khi có, để không ai phải chờ mình<br>`INTERRUPT+2 PEOPLE+1 · Người +1` | Tắt thông báo, gom lại trả lời hai lần một ngày<br>`INTERRUPT−2 DEEP_WORK+1 · Vật −1` |
| q11 | Được chọn một việc để sửa, bạn chọn | Luồng thanh toán mà khách hàng phàn nàn là khó dùng<br>`VISIBLE+2 PEOPLE+1 · Người +1` | Một câu truy vấn chậm không ai thấy nhưng đang tốn tiền<br>`DETAIL+2 VISIBLE−1 · Vật −1` |
| q12 | Cùng một công việc, bạn muốn làm ở | Một sản phẩm ổn định, nhịp việc đều và rõ ràng<br>`REPETITION+1 PRESSURE−1` | Một startup mà ưu tiên có thể đổi mỗi tuần<br>`AMBIGUITY+2 PRESSURE+1 REPETITION−1` |
| q13 | Bạn cần thuyết phục cả nhóm theo giải pháp của mình | Trình bày trong buổi họp, trả lời thắc mắc tại chỗ<br>`PEOPLE+2 VISIBLE+1 · Người +2` | Viết một tài liệu kỹ, có số liệu, để mọi người tự đọc<br>`DETAIL+2 DEEP_WORK+1 · Vật −2` |
| q14 | Mỗi lần phát hành, quy trình kiểm tra của bạn là | Một danh sách cố định, lần nào cũng làm đúng từng bước<br>`REPETITION+2 DETAIL+1` | Mỗi lần mỗi khác, tuỳ lần này thay đổi những gì<br>`REPETITION−1 AMBIGUITY+1` |

Độ phủ: mỗi chiều được **3–7 câu** chạm tới (v0.1: 1–3). DEEP_WORK 7, DETAIL 7, PEOPLE 6, AMBIGUITY 6, INTERRUPT 4, VISIBLE 4, PRESSURE 3, REPETITION 3. 6 câu mang giá trị Người–Vật. Test `quiz.spec.ts` giữ điều kiện "mỗi chiều ≥ 3".

**Câu kể ngắn** (20–400 ký tự):

| ID | Câu | Chiều câu được soạn để làm lộ ra |
|---|---|---|
| T1 | Kể một lần bạn làm một việc mà quên cả giờ giấc. Bạn đang làm gì, một mình hay với ai? | DEEP_WORK, PEOPLE, VISIBLE, DETAIL |
| T2 | Kiểu công việc hay môi trường nào làm bạn kiệt sức nhất? Vì sao? | PRESSURE, INTERRUPT, REPETITION, AMBIGUITY, PEOPLE |
| T3 | Năm năm nữa, nếu có ai quay lại một ngày làm việc lý tưởng của bạn, người xem sẽ thấy bạn đang làm gì? | PEOPLE, VISIBLE, DEEP_WORK, PRESSURE |

**Câu giai đoạn** (không chấm): học sinh chọn ngành · sinh viên hoặc mới ra trường · đã đi làm, nghĩ chuyện đổi nghề · chỉ tò mò. Chỉ dùng để chỉnh giọng văn của đoạn mô tả.

## 3. Chấm điểm

1. **Câu chọn:** máy chủ tra tín hiệu từ bộ câu hỏi, nhân với mức (1 hoặc 0.5), cộng thành vector 8 chiều (`scoreQuizChoices`). Máy khách chỉ gửi "chọn vế nào, mức nào".
2. **Câu kể (phần AI-native):** AI đọc cả ba câu trong một lần gọi và trả, cho mỗi chiều có bằng chứng, một giá trị nguyên **−2…+2 kèm trích dẫn nguyên văn** (cùng kiểu bằng chứng như FR-05). Máy chủ (`acceptTextReading`):
   - **bỏ** mọi giá trị có trích dẫn không tìm thấy trong câu trả lời (không phân biệt hoa thường, khoảng trắng), hoặc rơi vào chiều lạ;
   - **kẹp** mỗi chiều của mỗi câu về ±2, để một câu kể không bao giờ nặng hơn một câu chọn "rất giống";
   - lưu bằng chứng (`quizTextEvidence`) để giải thích và kiểm tra lại được.
3. **Không có AI** (chưa cấu hình khoá, lỗi, quá 8 giây, bị từ chối): bài vẫn được lưu, câu kể **nằm chờ** và được đọc lại lần tới người chơi mở Chân dung. Màn Chân dung báo "phần kể ngắn chưa được đọc".
4. **Chân dung tổng** = câu chọn + câu kể + nhiệm vụ phụ đã chơi (cộng lại mỗi lần đọc, không lưu tổng).

## 4. Chỉ số xã hội (social-orientation index)

**Định nghĩa.** Người chơi thích làm việc **qua con người** (trao đổi, thuyết phục, gỡ rối cho người khác) hay **qua hệ thống, công cụ, dữ liệu**. Đây là trục **People–Things** trong World-of-Work map của Prediger (1982), vốn suy ra từ RIASEC. Thang **0–100**: 0 là hoàn toàn thiên về vật, 100 là hoàn toàn thiên về người. **Không bên nào tốt hơn**, và giao diện nói rõ điều đó.

**Nguồn tín hiệu** (mỗi tín hiệu trong khoảng −2…+2, dương là Người):
- bài tự vấn: 6 câu chọn có giá trị Người–Vật (nhân với mức), cộng câu kể mà AI đọc ra được trục này (kèm trích dẫn);
- khi chơi: **lựa chọn** ở nhiệm vụ phụ, lấy tín hiệu `PEOPLE` của lựa chọn đó. Chỉ tính người chơi **chọn gì**, không tính họ làm **tốt** tới đâu: đây là thiên hướng, không phải năng lực.

**Công thức** (`socialIndex`):

```
Q = trung bình tín hiệu từ bài tự vấn (0 nếu chưa làm)
O = (6·Q + Σ tín hiệu khi chơi) / (6 + số lựa chọn khi chơi)
S = round(50 + 50·tanh(O))
```

Bài tự vấn nặng bằng **6 lựa chọn khi chơi**: lúc đầu bài quyết định, chơi càng nhiều thì lựa chọn thật càng lấn át. Chưa làm bài và chưa chơi thì **không có chỉ số** (giao diện nói "chưa có", không hiện 50).

**Nhãn:** 0–34 *Thiên về hệ thống* · 35–65 *Cân bằng* · 66–100 *Thiên về con người*.

## 5. Năm nghề hợp nhất (StarMap)

- Độ khớp = cosine giữa chân dung 8 chiều của người chơi và `fit_profile` của từng nghề (`topMatches`, n = 5). Chưa có chân dung thì không xếp hạng.
- Mỗi hành tinh kèm **lý do**: 2 chiều góp nhiều nhất vào độ khớp, hiện thành "vì bạn thích tập trung sâu và tỉ mỉ".
- Bấm hành tinh → vào cấp đầu của nghề (BR-01).

## 6. Đoạn mô tả "Về bạn"

- **Đầu vào:** giai đoạn, 3 chiều mạnh nhất và 2 chiều âm nhất (kèm mô tả), chỉ số xã hội, tên 5 nghề, ba câu kể, ngôn ngữ. **Không gửi tên, email, ngày sinh** hay định danh nào (NFR-05; có test).
- **Luật viết:** 2–3 câu, tối đa 80 từ, xưng "bạn"; tả cách người chơi có vẻ thích làm việc và **nêu một điều có thể khó**; được nhắc 1–2 nghề như chỗ nên thử trước nhưng **không bảo chọn nghề nào, không nói hợp/không hợp**, không dùng nhãn kiểu MBTI; chỉnh giọng theo giai đoạn.
- **Nhãn "AI viết · có thể chưa đúng"** (NFR-07). Không có AI thì viết bằng **khuôn cố định** (`templateDescription`, VI và EN), nhãn "Viết theo khuôn".
- **Chỉ viết lại khi nền đổi:** làm lại bài, tập 5 nghề đổi, nhãn chỉ số đổi, câu kể vừa được đọc, hoặc đổi ngôn ngữ. Nếu lần trước AI lỗi và phải dùng khuôn thì thử lại sau 10 phút.
- Model đặt qua `PORTRAIT_MODEL` (mặc định `claude-opus-5`, effort `low`), không cần sửa mã (NFR-12).

## 7. Dữ liệu và API

| | |
|---|---|
| `POST /api/profile/quiz` | `{ answers: [{questionId, optionId, strength?}], texts: [{questionId, text}] }` |
| `GET /api/profile/portrait?locale=vi\|en` | `{ quizDone, top[5], socialIndex, description, textsPending }` |
| `GameProfile` (cột mới) | `quizOrientationSum/N`, `stage`, `quizTexts`, `quizTextFit`, `quizTextEvidence`, `quizTextReadAt`, `portraitText/Source/Model/Basis/At`. Migration `20260930120000_get_to_know_me_portrait`. Câu kể là dữ liệu cá nhân, xoá theo tài khoản |
| ERD | Ứng với `orientation_session` / `orientation_answer` / `orientation_result` (rank, fit_score). Prototype chưa tách bảng: kết quả tính lại mỗi lần đọc; cần thêm cột chỉ số xã hội và mô tả vào ERD cho khớp DR-13 |

## 8. Giới hạn đã biết

- Bộ câu hỏi vẫn **tự soạn, chưa kiểm định** (07 C6). Giá trị Người–Vật của từng vế là suy luận của nhóm theo khái niệm của Prediger, chưa đối chiếu với thang đo gốc.
- `fit_profile` của nghề **suy ra từ chính sự kiện của nghề** (`build.mjs`, cờ `_derived`), không phải số đo. Top 5 hiện xếp trên **9 nghề nhóm Software** có hồ sơ; muốn phủ 22 hành tinh cần dựng `fit_profile` cho 13 nghề còn lại.
- Chưa có số liệu người dùng thật để kiểm xem gợi ý có đúng không (RP-5 chưa đụng tới phần này).
