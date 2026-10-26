# Plan chốt · phần AI tuần 41 (CHƯA ÁP DỤNG)

> Phúc chốt 9/10/2026. File này gom lại trạng thái cuối cùng; nhật ký từng bước nằm ở `plan-sua_2026-W41.md`.
> **Chưa có dòng nào dưới đây được sửa vào báo cáo hay hub.** Phúc duyệt lại file này rồi mới áp dụng một lượt.
> Nhánh làm việc: `docs/report-ai-w41` (rẽ từ `origin/main`). File này, `plan-sua_2026-W41.md` và thư mục `research/` chưa được git theo dõi.

Ký hiệu: ✅ đã chốt · ⏳ chờ game design · ❓ hỏi cô · 👤 báo người khác · 🔍 phải đọc bản gốc trước khi đưa con số vào báo cáo

---

## A. Đã chốt

### A1. Phạm vi giai đoạn này

- ✅ Chỉ làm **bảo chứng kỹ thuật**: làm sao bảo đảm AI đúng và có bằng chứng kiểm tra.
- ✅ Coi như **chưa có game design data**. Dữ liệu kịch bản mẫu hiện có và cách tính điểm đều tạm, sẽ sửa khi làm game design. Mọi con số tính từ kịch bản mẫu chỉ là ví dụ.
- ✅ **Chỉ hỗ trợ tiếng Việt.**
- ✅ **Bỏ hẳn phần luật về độ tuổi khỏi báo cáo**, kể cả đoạn đồng ý của người giám hộ ở §4.1.4 và các chỗ nhắc người dùng vị thành niên ở §2.7. Lưu ý khi áp dụng: code vẫn có luồng `/consent` cho người dưới 16 tuổi, nên báo cáo và code sẽ lệch nhau ở điểm này.
- ✅ Mọi lập luận về cách dùng AI phải logic và có dẫn chứng khoa học; chỗ nào tài liệu chưa có thì nói thẳng.

### A2. Kiến trúc AI năm thành phần

```
Lúc soạn nội dung
  DE ──(AI-1 hỏi)──▶ kiến thức thô ──(AI-2, CA)──▶ seed ──(AI-3, DE kiểm thử)──▶ seed đã duyệt
                                                     ▲                │
                                                     └── DE phán ca khó, sửa seed
Lúc chơi
  seed đã duyệt ──(AI-4 dẫn truyện, follow-up)──▶ người chơi trả lời ──(AI-5 chấm)──▶ điểm kỹ năng
                                                                          │
                                                   ca chấm lệch ──▶ AI-3 ──▶ DE
```

| # | Việc | Người dùng | Con người quyết gì |
|---|---|---|---|
| AI-1 | Phỏng vấn chuyên gia để lấy thông tin dựng seed; gộp ý nhiều chuyên gia | DE | DE xác nhận bản ghi |
| AI-2 | Chuyển lời chuyên gia thành khung game (bối cảnh, nhân vật, tình huống, canon event, khung chấm) | CA | DE đặt mọi khoá chấm và mốc rubric, DE duyệt seed |
| AI-3 | Hỗ trợ DE kiểm thử: chọn ca cần DE xem trong các lượt chơi thử | DE | DE phán ca khó và duyệt xuất bản |
| AI-4 | Dẫn truyện và hỏi follow-up lúc chơi | Người chơi | Không có người lúc chạy |
| AI-5 | Chấm lượt chơi theo rubric | Người chơi | DE xem ca bị gắn cờ, qua AI-3 |

- ✅ Phân vai soạn seed: DE cung cấp kiến thức, đặt khoá chấm, duyệt; CA cùng AI-2 dựng khung game.
- ✅ Lời phản hồi cho người chơi viết từ đầu ra của AI-5. Hội thoại định hướng và khử định danh nằm ngoài kiến trúc AI chính.
- ✅ Vấn đề nghiên cứu vẫn là hai (D-06): RP-1 gắn với AI-4, RP-2 gắn với AI-5.
- ✅ Phạm vi ĐACN tạm thời: làm thật AI-4 và AI-5; AI-3 ở mức phép thử; AI-1 và AI-2 ở mức thiết kế và bản thử (❓ hỏi cô, mục C).

### A3. Lúc chơi (AI-4)

- ✅ Tách model dẫn truyện và judge; không dùng một model làm cả hai.
- ✅ Engine giữ thứ tự canon event. Nội dung canon hiển thị nguyên văn từ seed.
- ✅ Một tình huống có thể có nhiều canon event để engine chọn ngẫu nhiên. Mỗi biến thể phải được DE duyệt; log ghi biến thể nào đã được dùng.
- ✅ AI-4 chỉ viết lời nối và câu follow-up. Rubric và khoá chấm không nằm trong prompt của AI-4.
- ✅ Lúc chạy chỉ kiểm phần AI viết bằng luật tất định (con số và tên riêng phải có trong seed hoặc trong câu người chơi gõ; trần follow-up do engine đếm). Kiểm bằng model làm sau, trên log.
- ✅ Không trích các số liệu bên ngoài về giới hạn của phép kiểm. Báo cáo cũng không khẳng định phép kiểm bắt được mọi lỗi; ghi là hiệu quả sẽ đo bằng bộ thử của nhóm.

### A4. Chấm (AI-5)

- ✅ **Không có đáp án mẫu.** Judge chấm theo rubric: mỗi tiêu chí đáp ứng tới đâu thì được bấy nhiêu điểm. Giai đoạn này cũng không dùng ví dụ đã chấm.
- ✅ **Mỗi tình huống một lượt gọi cho mỗi judge**, tối đa 3 tiêu chí mỗi lượt gọi. Lượt gọi chạy nền ngay khi tình huống kết thúc; kết quả chỉ hiện ở màn tổng kết.
- ✅ Đầu vào của judge: bối cảnh, bản ghi từ đầu tới hết tình huống đó, rubric của tình huống.
- ✅ Đầu ra cho từng tiêu chí, theo thứ tự: câu trích nguyên văn của người chơi, lý do, mức điểm. Câu trích phải là chuỗi con của lời người chơi.
- ✅ Panel ba judge thuộc ba họ model khác nhau, lấy trung vị. Lý do nêu trong báo cáo là độ bền, không viết là chính xác hơn một judge đơn.
- ✅ Các judge lệch nhau quá một mức thì gắn cờ cho DE xem; kèm một mẫu ngẫu nhiên các ca không bị gắn cờ, kiểm mù.
- ✅ Một judge lỗi thì chờ đủ ba judge rồi mới ra điểm, không chấm tạm bằng hai.

### A5. AI-native

- ✅ Định nghĩa: bỏ AI đi thì phần cốt lõi (sinh và chấm) coi như chết. Sản phẩm không có đường thay thế nào, vì không có AI thì không xử lý được câu trả lời tự do cho hợp lý.
- ✅ Khi AI lỗi: phiên chơi tạm dừng, câu trả lời và tiến độ được lưu (NFR-04), chơi tiếp khi AI trở lại. Các trang không dùng AI vẫn mở được.
- ✅ Chuyển sang nhà cung cấp khác vẫn là AI, không tính là fallback.
- ✅ Không bàn tới prototype trong lập luận này.

### A6. Kiểm định judge (benchmark)

- ✅ Đơn vị thử: bản ghi lượt chơi theo từng tình huống.
- ✅ Dữ liệu thử chính: các lượt DE chơi thử và chấm; điểm của DE đem so với điểm của judge. Giai đoạn này nhóm đóng vai DE và cô kiểm một phần (D-47, D-63).
- ✅ Thước đo: độ đồng thuận giữa judge và DE (QWK kèm khoảng tin cậy, bảng nhầm lẫn, tỉ lệ khớp đúng mức và lệch một mức). Cách đo dùng được cho mọi thang có thứ bậc.
- ✅ Biến thể bẫy (viết dài hơn, sai chính tả, chèn lệnh) chỉ là phép thử phụ.
- ✅ Nói thẳng với cô: bằng chứng công bố cho thấy LLM judge chỉ đáng tin có điều kiện, nên nhóm tự đo (RP-2).

### A7. Công cụ và model

- ✅ Chạy thử offline: **Inspect AI** (UK AI Security Institute, MIT). Lúc chạy trong sản phẩm: **module TypeScript tự viết**, kiểm đầu ra bằng `zod`. Prompt và rubric để trong file dữ liệu dùng chung cho hai bản.
- ✅ Cần bốn họ model: một họ cho việc sinh, ba họ cho panel judge.
- ✅ Model dự kiến đem thử (giá USD cho một triệu token vào / ra, đọc 8–9/10/2026):

| Vai | Ứng viên |
|---|---|
| Judge, họ Anthropic | `claude-sonnet-5-5` (2 / 10) và `claude-haiku-5-5` (0,10 / 0,50) |
| Judge, họ OpenAI | `gpt-6.1-sol` (2 / 10) và `gpt-6-luna` (0,10 / 0,50) |
| Judge, họ Google | `gemini-3.8-flash` (0,75 / 3,75) và `gemini-3.5-flash-lite` (0,30 / 2,50) |
| Dẫn truyện | `deepseek-flash` (0,30 / 1,20) và `qwen3.8-flash` (0,15 / 0,47): thử cả hai, chọn theo số đo |
| Mã nguồn mở, bậc rẻ nhất | Gemma 4 31B, Qwen3.5-9B |

- Không ghép chung trong một panel: các model GPT với gpt-oss; Haiku, Sonnet, Opus; Gemini với Gemma; mọi bản Qwen và SEA-LION.
- Mình đã đối chiếu dòng Anthropic với tài liệu tham chiếu của Claude API. Giá của OpenAI, Google, DeepSeek, Alibaba mới theo agent 🔍.

### A8. Những đề xuất cũ đã bị thay (để khỏi nhầm khi đọc nhật ký)

- "Một lượt gọi chấm mọi kỹ năng" (7/10) và "mỗi tiêu chí một lượt gọi" (8/10): thay bằng mỗi tình huống một lượt gọi.
- "Seed đóng vai đáp án mẫu nên judge không cần mạnh": bỏ, vì không có đáp án mẫu.
- "Model dẫn truyện lỗi thì chạy phần canon" và "chấm tạm bằng hai judge": bỏ, theo A5 và A4.
- "Scenario mẫu không cần AI hỗ trợ kiểm": thay bằng AI-3 chọn ca cho DE xem.
- Bộ thử dựng từ "câu trả lời mẫu rồi hạ từng tiêu chí": thay bằng lượt DE chơi thử (A6).

---

## B. Chưa chốt được, chờ game design ⏳

- Thang chấm có mấy mức và mỗi mức nghĩa là gì. Báo cáo chỉ ghi thang −1 / 0 / +1 / +2 là **dự kiến**. Ghi chú về D-87: mức +1 hiện chưa có mô tả ở đâu cả (spec và hai kịch bản chỉ viết mốc cho +2, 0, −1).
- Bảng chấm năng lực của một lượt chơi; bộ tiêu chí cụ thể đưa cho judge; số tiêu chí mỗi tình huống.
- Danh sách fact bắt buộc của seed (cần để đo NFR-15).
- Luật bằng chứng cho quá trình (hint, thời gian, follow-up) và cách gộp điểm thành năng lực.
- Luật kết cục và sự kiện ngẫu nhiên đang dựa vào điểm giữa chừng (spec A12, A13).
- Phần "gamify" của AI-2 (nhịp truyện, độ khó theo band, nhân vật).
- Đầu vào đã có cho việc này: bảng chỗ lệch giữa spec v2.2 và các quyết định, trong `plan-sua_2026-W41.md`, mục T0610.9.

## C. Hỏi cô ❓

1. **Phạm vi AI-1 và AI-2 trong ĐACN.** Phúc thấy hai phần này không quá khó, còn AI-3, AI-4, AI-5 khó hơn.
2. **Mô hình miễn phí vài lượt mỗi ngày, mua thêm lượt.** Số để trình (token và tỉ giá là giả định): một lượt chơi tốn khoảng 400 đồng với panel bậc nhỏ, khoảng 2.200 đồng với panel bậc giữa. Nếu cô đồng ý thì phải đổi D-17, mục tiêu 4 ở §1.2, §1.4.1, §4.1.5 và thêm business rule, FR. Mình đề xuất tách: hạn mức miễn phí mỗi ngày làm trong ĐACN (khớp NFR-11); mua thêm lượt chỉ mô tả, chưa cài.
3. **Mốc của NFR-14:** giữ ngưỡng QWK ≥ 0,70, hay lấy "không thấp hơn quá 0,10 so với độ khớp giữa các chuyên gia" làm chính.
4. **Định nghĩa AI-native:** hai nguồn neo là một preprint (Xu et al., 7/2026) và một white paper của Ericsson; chưa có định nghĩa bình duyệt nào cho phần mềm. Cô có chấp nhận không.
5. **Cách viết mục 5.2.3:** ứng viên, tiêu chí, lựa chọn tạm thời, kế hoạch thử; lựa chọn cuối ghi sau phép thử.
6. Danh sách task 6/10 có phải nhận xét của cô ở buổi 3/10 không. Repo chưa có biên bản buổi đó.

## D. Báo người khác 👤

**Nam** (phần yêu cầu và use case):
- FR-15, UC-07: DE không tự soạn seed nữa; DE cung cấp qua AI-1 và duyệt, CA cùng AI-2 dựng.
- UC-03 luồng 2a và 5a: bỏ "dùng lượt mẫu đã duyệt"; AI lỗi thì phiên chơi tạm dừng.
- NFR-02: việc chấm chạy nền theo tình huống, kết quả ở màn tổng kết; viết lại ngưỡng 8 giây cho khớp.
- NFR-08: chỉ tiếng Việt.
- FR-04: lời của lựa chọn không được viết lại lúc chạy.
- FR-20 ghi "khác provider", DC-01 ghi "khác họ model"; hai thứ không trùng nhau.
- NFR-14: câu hỏi về mốc (mục C3).
- BR-17: "vị trí" chỉ là vị trí trong bảng tổ chức, hay gồm cả vai trò trong hệ thống.
- §4.1.2 và §4.2.1 về vai trò DE, CA đổi theo A2.

**Nhật:** thêm BR-17 vào bảng ánh xạ số cũ sang số mới (T2609.29); các trích dẫn mới sẽ nối vào cuối danh mục.

## E. Việc sửa khi áp dụng

### E0. Chuẩn bị

- Chép `reports/2026-10-02_ch1-5/` thành `reports/2026-10-09_ch1-5/` (không chép `latex/main.pdf`).
- Sau khi sửa: `python tools/report/md2tex.py`, `pdflatex main.tex` ba lần, kiểm không lỗi và không tham chiếu hỏng.
- Sau khi sửa hub: `python tools/hub/tuan.py check` và `check_hub.py`.
- Mình stage và soạn message; Phúc commit, push. PR mở vào `main`.

### E1. Báo cáo (`report.md` trong folder mới)

| Chỗ | Việc |
|---|---|
| §2.5 | Sửa giọng: LLM judge đáng tin có điều kiện; thêm mức trung bình trên dữ liệu công khai 🔍; khớp lại câu về "ví dụ đã chấm"; ghi các nghiên cứu dùng model 2023–2024, tiếng Anh |
| §2.6 | Thêm một câu về lỗi tương quan giữa các judge và kết quả panel ngang judge đơn tốt nhất 🔍 |
| §2.7, §4.1.4 | Bỏ phần độ tuổi và đồng ý của người giám hộ |
| §4.1.2 | Viết lại quy trình nội dung theo A2 và A3; quy trình chơi: chấm theo tình huống, thang ghi là dự kiến |
| §4.1.3, §4.4 | BR-17 và đếm lại số business rule (chờ Nam trả lời phạm vi "vị trí") |
| §4.2.1 | Vai trò DE, CA theo A2; đoạn lập luận AI-native theo A5 |
| §5.2.3 (mới) | Viết theo năm thành phần: cách ràng buộc nội dung sinh; model dẫn truyện; cách chấm và judge; bốn họ model; cách gọi nhiều nhà cung cấp; công cụ; chi phí (ghi rõ token là giả định); trả lời "judge có cần mạnh hơn model sinh"; kế hoạch thử. Nguồn nội dung: báo cáo nghiên cứu, sửa theo mục A |
| §5.3.6 | Chưa viết tuần này (prompt, schema đầu ra, luồng chấm) |
| §3.2, §3.3 | Chưa đụng; việc kiểm lại EntryLevel, Anthropos, JobWay, AI Hay để sau |

### E2. Hub

- `02-quyet-dinh.md`: thêm các quyết định mới vào nhóm I (số dự kiến D-89 đến D-95, chốt lại khi áp dụng): kiểm lúc chạy bằng luật và canon nhiều biến thể; kiến trúc năm thành phần và phân vai soạn seed; cách chấm (A4); AI-native không có đường thay thế; chỉ tiếng Việt; bỏ luật độ tuổi khỏi báo cáo; công cụ. Ghi chú vào D-87 (thang là dự kiến, mức +1 chưa có mô tả). Không viết lại dòng cũ.
- `07-van-de-mo.md`: cập nhật B2, B20, B24, C1, C7; thêm các mục mở ở B và các câu hỏi ở C; ghi việc kiểm lại §3.2.
- `tuan/2026-W41/tuan.md`: trạng thái và bằng chứng cho T0610.5 đến T0610.10 và T0610.16 (mục G).
- `00-tong-quan.md`: bảng "Hiện trạng tại 30/9" đã cũ, cập nhật.

## F. Phép thử đầu tiên (T0610.17, tuần 42)

- **Dữ liệu:** khoảng 30 bản ghi lượt chơi dựng từ kịch bản tạm; nhóm đóng vai DE chấm từng tiêu chí.
- **So sánh:** 6 model judge (3 họ, 2 bậc) và 2 model mã nguồn mở; cách chấm theo tình huống so với chấm gộp cả lượt chơi; mỗi cấu hình chạy lặp 3 lần.
- **Đo:** độ đồng thuận với điểm của nhóm (QWK kèm khoảng tin cậy, bảng nhầm lẫn, khớp đúng mức và lệch một mức); độ ổn định giữa các lần chạy; tỉ lệ câu trích đúng nguyên văn; số token; thời gian.
- **Model dẫn truyện:** `deepseek-flash` và `qwen3.8-flash`, đo độ trễ từ Việt Nam và số lần vi phạm luật.
- **Chi phí ước tính:** khoảng 5 USD cho 12 model ứng viên (token là giả định). Phúc đồng ý chạy phép thử; chưa nêu ai trả. Dùng đường miễn phí trước (mỗi model Qwen có 1 triệu token trong 90 ngày). **Mỗi lượt gọi trả tiền và việc cài Inspect AI đều phải hỏi Phúc trước khi làm.**
- **Điều kiện trước:** có rubric tạm đủ rõ để hai người chấm ra cùng một mức.

## G. Trạng thái bảy task của Phúc

| Task | Trạng thái thật |
|---|---|
| T0610.5 business rule | Có câu chữ BR-17; chờ Nam trả lời phạm vi "vị trí"; chưa vào báo cáo |
| T0610.6 judge mạnh hơn model sinh | Có kết luận và nguồn; chưa vào báo cáo |
| T0610.7 framework | Đã chọn công cụ; chưa vào báo cáo |
| T0610.8 benchmark | Có danh sách benchmark sẵn có và thiết kế kiểm định (A6); chi tiết chờ game design |
| T0610.9 game design data | Để lại; có bảng chỗ lệch làm đầu vào; chờ game design |
| T0610.10 AI-native | Có định nghĩa và lập luận (A5); chưa vào báo cáo |
| T0610.16 viết 5.2.3 | **Chưa viết vào báo cáo.** Nội dung nền nằm ở báo cáo nghiên cứu |

Hạn của các task là thứ Sáu 9/10. Tới lúc chốt file này, chưa task nào có chữ trong `report.md`.

## H. Để sau

- Kiểm lại EntryLevel, Anthropos, JobWay, AI Hay từ nguồn chính (đụng tới §3.2 đã nộp cô).
- Khảo sát mô hình "miễn phí có hạn mức, mua thêm lượt" nếu cô đồng ý.
- Đọc bản gốc các nguồn đánh dấu 🔍 và chạy lại phép tính cỡ mẫu trước khi trích con số.
- Viết §5.3.6.
- Quyết định có commit thư mục `research/` vào repo không.

## I. Nguồn

- Báo cáo nghiên cứu: `research/reports/Giải pháp AI cho JobQuest.md` (tiếng Anh, viết 8/10). **Một số chỗ trong đó đã bị các quyết định ở mục A thay:** bảng "khi nhà cung cấp lỗi", cách chấm một lượt gọi cho mọi kỹ năng, bộ thử dựng từ câu trả lời mẫu, phần luật về độ tuổi, tiêu chí tiếng Anh.
- Ghi chú nguồn: `research/research_notes/Giải pháp AI cho JobQuest/` (7 file). `source_verification.md` sửa 12 con số của các lượt khảo sát trước.
- Khảo sát 9/10 (danh sách model, cách chia lượt gọi) và bảng nguồn kèm mức đã kiểm: `plan-sua_2026-W41.md`, mục 1g, 1h và mục 3.
- Mọi lần đọc nguồn đều qua công cụ tóm tắt trang, chưa đọc PDF.
