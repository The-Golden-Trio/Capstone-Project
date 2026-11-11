# Kế hoạch kiểm chất lượng follow-up của AI-4

Đề xuất ngày 6/11/2026, **chưa được nhóm và cô duyệt**, chưa làm bước nào. Nơi nói về thiết kế AI-4: [`ai-4-thiet-ke.md`](ai-4-thiet-ke.md).

## Cần trả lời điều gì

R1–R4 (bốn luật kiểm lúc chạy) chỉ biết câu có sai không: bịa tên, bịa số, sai khuôn. Chúng không biết câu có tốt không. Kế hoạch này trả lời ba câu hỏi:

1. Follow-up có **đúng chủ đề**, có hỏi đúng chỗ người chơi còn thiếu không?
2. Follow-up có **gợi đáp án** không?
3. Follow-up có **khai thác được** thêm điều gì từ người chơi không?

## Ba nguyên tắc

- **Không dùng AI đóng vai người giỏi, người yếu làm nguồn chính.** Báo cáo [`Giải pháp AI cho JobQuest.md`](../../../../research/reports/Giải%20pháp%20AI%20cho%20JobQuest.md) (mục AI-3) ghi model được giao vai trả lời gần như đúng hết và rất đồng đều, khác 2.359 học sinh thật. Nguồn đó chỉ nói về câu trắc nghiệm. Chưa có bằng chứng nào cho câu tự luận.
- **Kiểm ý nghĩa ở ngoài lượt chơi.** Code không hiểu nghĩa. Thêm một model kiểm lúc chơi thì phải đổi D-89 (phần AI viết lúc chơi chỉ được kiểm bằng luật). Xem mục "Khi nào bật guard model".
- **Chốt ngưỡng trước khi chạy chính thức.** Ngưỡng đặt sau khi có số đo thử, rồi giữ nguyên. Hiện chưa có con số nào.

## Trình tự

| Giai đoạn | Làm gì | Cần có trước | Trả lời được |
|---|---|---|---|
| 0 | Gọi model thật, đo nền | Key | Model có chạy, nhanh chậm ra sao |
| 1 | Câu trả lời viết sẵn, chấm bằng checklist | Giai đoạn 0 | Câu 1, một phần câu 2 |
| 2 | Người trong nhóm đóng vai, chấm trước và sau follow-up | Giai đoạn 1 | Câu 2, câu 3 |
| 3 | Thử AI bị giới hạn thông tin (tuỳ chọn) | Dữ liệu giai đoạn 2 | Thêm tín hiệu cho câu 2 |
| 4 | Nối vào AI-3, chuyên gia và người chơi thật | AI-3, AI-5, chuyên gia | Kết luận cuối |

Thời gian ở các mục dưới là ước lượng của người viết.

### Giai đoạn 0: đo nền (khoảng nửa buổi)

```sh
pnpm exec nx run @datn/api:narrator-try -- --mode=check
pnpm exec nx run @datn/api:narrator-try -- --mode=live --answer=all --repeat=5 --out=<thư mục>
```

Ghi lại: độ trễ, số token, cache có trúng không, tỉ lệ qua R1–R4 ngay lần đầu, luật nào hay bị vi phạm, độ dài follow-up (`followUpLengthStats`).

**Xong khi:** `--mode=check` báo chạy được, và đã biết còn bao nhiêu thời gian trong ngân sách 4,6 giây. Câu trả lời mẫu của lệnh này là của một hoạt động duy nhất, nên chỉ đủ để đo nền.

### Giai đoạn 1: câu trả lời viết sẵn (khoảng 2–3 buổi)

Lý do làm trước: rẻ, làm được ngay, và có đáp án để so ("thiếu phần X thì phải hỏi về X").

**Dữ liệu.** Hiện chỉ có 3 hoạt động tự luận có mục tiêu đào sâu: `SWE_BACKEND_L1_S_EXEC:a4`, `SWE_BACKEND_L3_S_INCIDENT:a2`, `SWE_BACKEND_L3_S_INCIDENT:a3`. Mỗi hoạt động viết 5 kiểu trả lời:

| Kiểu | Follow-up nên làm gì |
|---|---|
| Đủ | Tuỳ câu trả lời của cô về follow-up động. Hiện engine vẫn cho hỏi |
| Thiếu đúng một phần | Hỏi đúng phần đó, không nói đáp án |
| Mơ hồ | Xin làm rõ |
| Sai hướng | Hướng người chơi nhìn lại, không nói đúng sai |
| Cụt ("Dạ có") | Xin nói thêm |

3 hoạt động × 5 kiểu × 3 lần sinh là **45 câu**. Khi đủ 15 tình huống của §7.3.1 thì thành 225 câu. Chi phí model theo số ước khoảng 2.500 token vào và 100 token ra: 45 câu khoảng 0,02 USD, 225 câu khoảng 0,1 USD.

Thiết kế seed mới có `deliverable_parts` và `probe`, nhưng code và hai kịch bản mẫu chưa có hai trường này. Trong lúc chờ, ghi tay danh sách phần của đề ngay trong file bộ thử. Mỗi dòng một ca:

```jsonc
{
  "id": "L3-a2-thieu-gioi-han",
  "scenario": "SWE_BACKEND_L3_S_INCIDENT",
  "activity": "a2",
  "kind": "thieu_mot_phan",
  "answer": "…",
  "parts": ["nguyên nhân", "hướng sửa", "giới hạn dữ liệu trả về"],
  "missing": "giới hạn dữ liệu trả về"
}
```

**Checklist.** Mỗi tiêu chí chỉ trả lời có hoặc không:

| Tiêu chí | Câu hỏi |
|---|---|
| Đúng chủ đề | Có bám việc đang làm và mục tiêu đào sâu của hoạt động không? |
| Bám câu trả lời | Có dựa vào điều người chơi vừa viết không? |
| Không hỏi lại | Có tránh hỏi điều người chơi đã nói không? |
| Hỏi đúng chỗ thiếu | Ca thiếu một phần: có nhắm đúng phần đó không? |
| Mở, trung lập | Có tránh gợi đáp án, tránh khen chê không? |
| Một ý | Có hỏi đúng một ý không? |
| Trả lời được | Chỉ với thông tin trong màn, người chơi có trả lời được không? |
| Đúng vai | Giọng có đúng nhân vật không? |

**Cách chấm.**

1. Viết tay khoảng 30 câu follow-up xấu, cố ý phạm từng tiêu chí. Người chấm và model chấm phải bắt được chúng trước khi được tin.
2. Hai thành viên chấm độc lập 45 câu thật, trộn với câu xấu, không biết câu nào là câu nào. Đo độ đồng thuận bằng Krippendorff's alpha, như §7.3.1. Lệch nhiều thì sửa checklist.
3. Nếu dùng model chấm phần còn lại: model phải khác họ Qwen, và phải đối chiếu với nhãn của người trên cùng các câu. Họ model nào còn là việc mở số 6 trong `ai-4-thiet-ke.md`.

**Xong khi:** có tỉ lệ đạt theo từng tiêu chí, có danh sách lỗi lặp lại, đã sửa prompt hoặc mục tiêu đào sâu một vòng và chạy lại so sánh.

**Giới hạn:** chưa đo được khả năng khai thác, vì không có ai trả lời tiếp follow-up.

### Giai đoạn 2: người trong nhóm đóng vai (khoảng 1 tuần, cùng lúc với §7.3.1)

Đây là nguồn chính. §7.3.1 đã có kế hoạch 3 thành viên chơi 15 tình huống, mỗi tình huống 4 kiểu (cố hết sức, người mới, vội vàng, lạc đề), tổng 180 lượt. Chỉ thêm một bước: **AI-4 viết follow-up, người đó trả lời tiếp.**

Làm thử trước trên 3 hoạt động đang có: 3 người × 3 hoạt động × 4 kiểu là 36 lượt.

Hai thành viên khác chấm theo rubric, không biết kiểu chơi. Mỗi lượt có điểm trước và sau follow-up. Giai đoạn này nhóm tự chấm vì AI-5 chưa có code.

| Đo gì | Cách tính | Nếu thấp |
|---|---|---|
| Thêm bằng chứng | Bao nhiêu lượt có thêm bằng chứng cho kỹ năng đang quan sát sau follow-up | Câu hỏi không khai thác được gì |
| Tách nhóm | Chênh lệch điểm sau follow-up giữa kiểu "cố hết sức" và kiểu "người mới" | Câu hỏi không phân biệt được ai |
| Gợi đáp án | Kiểu "người mới" tăng điểm mạnh bằng cách lặp lại chữ trong câu hỏi | Câu hỏi đã lộ đáp án |
| Trả lời cụt | Bao nhiêu lượt chỉ được một câu như "Dạ có" | Câu hỏi đóng, hoặc đề quá khó |

**Giới hạn:** nhóm chỉ đóng vai, và cả nhóm đều khác học sinh THPT. Kết quả cho thấy quy trình chạy được và tìm ra lỗi rõ ràng, chưa phải kết luận về người chơi thật. Báo cáo §5.2.3 cũng ghi điều này cho giai đoạn hiện tại.

### Giai đoạn 3: AI bị giới hạn thông tin (tuỳ chọn)

Chỉ làm khi giai đoạn 2 đã có dữ liệu. Thay vì bảo AI "đóng vai người yếu", cho AI một phiếu thông tin và yêu cầu chỉ trả lời từ phiếu đó. Phiếu không có đáp án mà AI vẫn trả lời đúng thì câu hỏi có thể đã lộ đáp án. Báo cáo research có cách làm gần giống cho AI-1 (mẫu ReqElicitGym).

Đây là ý chưa ai kiểm chứng cho trường hợp này, và AI có thể dùng kiến thức sẵn có thay vì phiếu.

**Chỉ dùng tiếp nếu** kết quả khớp với lượt chơi của người ở giai đoạn 2. Không khớp thì bỏ.

### Giai đoạn 4: nối vào AI-3, chuyên gia, người chơi thật

AI-3 không cần tự tạo người chơi. Nó nhận câu trả lời từ các nguồn trên, chạy AI-4 và AI-5, rồi đưa cho chuyên gia những ca bị gắn cờ:

- Câu bị R1–R4 loại (đã có trong thiết kế AI-3).
- Không thêm bằng chứng, không tách nhóm, có dấu hiệu gợi đáp án.
- Mẫu ngẫu nhiên trong các ca không bị gắn cờ (đã có trong thiết kế AI-3). Xem n ca không có lỗi nào thì tỉ lệ lỗi tối đa khoảng 3/n ở độ tin cậy 95%, theo báo cáo.

Chuyên gia chấm mà không biết câu nào do AI viết, câu nào do chuyên gia viết. Tiêu chí đạt: **không thua câu chuyên gia viết** về độ rõ, độ liên quan, độ cung cấp thông tin (theo cách của Shen và cộng sự, IEEE RE 2025, trong ghi chú research). Hiện chỉ có 3 câu chuyên gia viết sẵn, nên chuyên gia phải viết thêm.

Với người chơi thật thì đo thêm tỉ lệ trả lời cụt và tỉ lệ bỏ ngang sau follow-up.

## Khi nào bật guard model

Guard model là model thứ hai kiểm câu ngay lúc chơi, sai thì bắt AI-4 viết lại. Chưa bật ngay vì cần số đo. Chỉ đề nghị bật khi **cả ba** điều sau đúng:

1. Giai đoạn 1 hoặc 2 cho thấy câu dở xuất hiện nhiều và luật code không bắt được.
2. Giai đoạn 0 cho thấy còn đủ thời gian trong NFR-01 (follow-up xong trong 5 giây ở 95% số lần) cho thêm một lượt gọi.
3. Nhóm và cô đồng ý đổi D-89.

Cái code làm được ngay trong vòng viết lại: bắt câu trùng nguyên câu đã hỏi, đánh dấu câu hỏi đóng ("có… không?"). Câu hỏi đóng dễ bị loại nhầm, nên đo trên dữ liệu giai đoạn 1 rồi mới bật.

Đề xuất thêm, chưa có trong thiết kế: hết số lần viết lại mà câu vẫn chưa đạt chất lượng thì bỏ follow-up lượt đó, engine chạy tiếp nội dung của chuyên gia. Câu dở chỉ làm mất một lượt hỏi, không nên tạm dừng phiên chơi.

## Việc phải xây

| Việc | Giai đoạn | Ghi chú |
|---|---|---|
| File bộ thử, lệnh chạy nhiều hoạt động và nhiều lần sinh | 1 | `narrator-try` hiện chỉ chạy một hoạt động mẫu |
| Bảng chấm trộn câu thật với câu xấu, ẩn nguồn | 1 | Một file CSV là đủ cho vòng đầu |
| Luồng ghi lượt trả lời follow-up của người | 2 | Có thể dùng script dòng lệnh, chưa cần giao diện |
| Tính các chỉ số trước và sau follow-up | 2 | Từ file chấm của nhóm |
| Tín hiệu gắn cờ trong AI-3 | 4 | AI-3 chưa có code |

## Còn phụ thuộc

- **Cô trả lời về follow-up động.** Nếu đúng như mail xác nhận, thêm tiêu chí **hỏi đúng lúc**: chỗ cần hỏi có hỏi không, chỗ đủ rồi có bỏ qua không. Kiểu trả lời "Đủ" ở giai đoạn 1 để sẵn cho việc này.
- **Seed mới.** `probe` và `deliverable_parts` thuộc thiết kế trên nhánh `docs/game-design-w45`, chưa có trong code. Khi có thì bỏ danh sách phần ghi tay.
- **Cỡ mẫu và ngưỡng** cần cô đồng ý, như §7.3.1 đã ghi.
- **AI-5, AI-3, chuyên gia** chưa có, nên giai đoạn 4 chưa làm được trong ĐACN.
