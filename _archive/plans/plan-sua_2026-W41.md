# Plan sửa · tuần 41 (CHƯA ÁP DỤNG) · NHẬT KÝ

> **Bản chốt nằm ở `plan-chot_2026-W41.md` (9/10/2026).** File này là nhật ký từng bước, có nhiều đề xuất đã bị thay; khi hai file khác nhau thì theo bản chốt.
> File làm việc, không commit. Ghi mọi chỗ cần sửa phát sinh khi bàn từng task tuần 41 của Phúc.
> Chưa có dòng nào dưới đây được sửa vào báo cáo hay hub.
> Cập nhật lần cuối: 9/10/2026. Nhánh làm việc: `docs/report-ai-w41` (rẽ từ `origin/main`).

Ký hiệu: ✅ Phúc đã đồng ý hướng · ⏳ chờ Phúc chốt · 👤 chờ người khác · 🔍 cần đọc bản gốc trước khi đưa số vào báo cáo

---

## 0. Chuẩn bị trước khi sửa báo cáo

- Chép `reports/2026-10-02_ch1-5/` thành `reports/2026-10-09_ch1-5/` (không chép `latex/main.pdf`), theo `reports/README.md`. Mọi sửa báo cáo bên dưới làm trong folder mới.
- Sau khi sửa: `python tools/report/md2tex.py <report.md> <latex dir>`, `pdflatex main.tex` ba lần, kiểm không lỗi và không tham chiếu hỏng.
- Sau khi sửa hub: `python tools/hub/tuan.py check` và `check_hub.py`.
- PR mở vào `main`.

## 1. Quyết định mới cần ghi vào `02-quyet-dinh.md`

### D-89 (đề xuất, nhóm I) ✅ hướng đã đồng ý 7/10, chờ duyệt câu chữ

**Lúc người chơi đang chơi, lượt sinh chỉ được kiểm bằng luật tất định; kiểm bằng model làm offline.**

- Phần canon của seed (đề bài, số liệu, các lựa chọn và khoá của chúng) hiển thị nguyên văn. AI chỉ viết lời nối và câu follow-up.
- Ba điều kiện của D-88 lớp 2 được bảo đảm như sau: đủ canon event do engine điều khiển luồng; giữ fact và khoá lựa chọn do hiển thị nguyên văn; phần AI viết được kiểm bằng luật (con số và tên riêng phải có trong seed, không chứa tên kỹ năng hay mốc điểm, không vượt trần follow-up).
- Kiểm bằng model nằm ngoài thời gian chờ: (a) lọc mẫu trước khi tới chuyên gia; (b) rà log các lượt đã chơi.
- Việc viết lại lời của lựa chọn chỉ làm offline, trong mẫu đã duyệt.
- Lý do: thêm một lớp LLM kiểm sẽ cộng vào thời gian chờ của người chơi (NFR-01, 5 giây). Rủi ro còn lại: một câu nối sai mà không chứa số liệu chỉ bị bắt khi rà log.
- Làm rõ D-88, không thay D-88.

### (CŨ, thay bởi mục 1b) Vai trò của AI theo từng giai đoạn · Phúc nêu 7/10

| Lúc nào | AI làm gì | Ai kiểm | Trong thời gian chờ |
|---|---|---|---|
| Chuyên gia soạn seed | Hỗ trợ đúng cấu trúc, nhắc chỗ thiếu thông tin | Chuyên gia quyết nội dung | Không |
| Duyệt mẫu | Sinh mẫu từ seed | Máy lọc lỗi cơ học, rồi chuyên gia duyệt | Không |
| Người chơi đang chơi | Viết lời nối và câu follow-up | Luật tất định; model rà log sau | Chỉ model sinh |
| Người chơi trả lời | Chấm theo rubric | Panel judge, phải khớp chuyên gia (NFR-14) | Có, 8 giây (NFR-02) |

- Scenario mẫu **không** cần AI judge chấm chất lượng; chuyên gia là người duyệt (RP-1). Máy chỉ kiểm thứ có đáp án: đủ fact, không số liệu lạ, đúng cấu trúc, không lộ rubric.
- Bước duyệt mẫu cũng là chỗ đo bộ kiểm: so kết quả của máy với nhận định của chuyên gia trên cùng bộ mẫu (khớp cách kiểm chứng của NFR-15).
- ⏳ Cần nói rõ trong báo cáo seed tạm ở giai đoạn này được soạn thế nào: hiện AI viết nháp cả skeleton từ dữ liệu nghề (KHỐI A của spec), rộng hơn "hỗ trợ cấu trúc". Liên quan 07 A19 (mẫu yêu cầu trích dẫn phần AI hỗ trợ).

## 1b. Kiến trúc AI năm thành phần · Phúc nêu 8/10 · ⏳ đang thống nhất sườn

Phúc liệt kê 8/10. Mình hệ thống lại và ghép phương pháp từ ba lượt khảo sát của agent `researcher` (8/10) cộng lượt về judge (7/10). Chưa có dòng nào được Phúc duyệt.

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

### AI-1 · Phỏng vấn chuyên gia (người dùng: DE)

- Khung chủ đề do người viết, bám kỹ thuật critical incident [26] và quy trình soạn SJT [27]; LLM chỉ hỏi đào sâu trong từng chủ đề [CH].
- Hỏi về sự việc và hành vi cụ thể, không hỏi năng lực trừu tượng [Mo] 🔍.
- Bộ theo dõi các trường seed còn thiếu: phỏng vấn bằng LLM chỉ lấy được nhiều nhất 73,7% yêu cầu trong [LR] 🔍.
- Tóm tắt lại cho chuyên gia xác nhận [CH]; lưu nguyên văn từng lượt, mỗi trường của seed trỏ về lượt nó xuất phát (D-63).
- Phỏng vấn từng chuyên gia riêng; bản gộp ghi rõ phần "đồng thuận" và phần "khác nhau"; chuyên gia chấm lại bản gộp theo kiểu Delphi [Ha] 🔍.
- Điểm yếu đã ghi nhận: LLM đào sâu chưa đủ ở câu trả lời bất ngờ [Wu1] (nghiên cứu nhỏ, 11 buổi).
- Chưa có nghiên cứu nào về LLM phỏng vấn critical incident với chuyên gia nghề, và không có gì bằng tiếng Việt.

### AI-2 · Dựng seed (người dùng: CA; DE duyệt)

- Schema của seed theo khuôn evidence-centered design: mẫu thiết kế có biến của nhiệm vụ và luật bằng chứng [MH] 🔍.
- Sinh nháp từ nguyên văn lời chuyên gia; để model lập luận bằng văn tự do rồi mới chuyển sang schema [Ta].
- Kiểm tất định rồi sửa lặp (đã có sẵn khoảng 35 phép kiểm trong hướng dẫn sinh scenario) [RS] 🔍.
- **Chuyên gia đặt mọi khoá chấm và mốc rubric**; model chỉ viết nháp. Lý do: rubric do LLM viết lệch rubric của người [Wu2]; khoảng 15% câu hỏi GPT-4 soạn phải sửa [Kl] 🔍.
- Gắn cờ nội dung chung chung.

### AI-3 · Hỗ trợ kiểm thử (người dùng: DE)

- Lượt chơi thử từ hai nguồn: câu trả lời giả lập ở mức đã định [73], [LW], và một số lượt do người thật chơi. Giả lập giỏi quá mức và ít đa dạng [BB], chỉ dùng để tìm chỗ khó tương đối.
- Gắn cờ bằng nhiều tín hiệu gộp: panel lệch quá một mức; dao động giữa các lần chạy; xa các ví dụ đã chấm; lượt sinh vi phạm luật của AI-4. Chưa tín hiệu nào được chứng minh trên rubric nhiều mức [Fe], [Yao] 🔍, nên ngưỡng chọn từ dữ liệu thử của đề tài.
- DE thấy hàng đợi đã xếp hạng: câu trả lời, ba điểm và lý do của judge, lý do gắn cờ, ví dụ gần nhất. DE sửa được mốc rubric ngay khi duyệt; rubric có phiên bản, vì tiêu chí của người chấm trôi dần trong lúc chấm [Sh].
- DE xem thêm một mẫu ngẫu nhiên các ca không bị gắn cờ, không thấy điểm của máy. Không thấy lỗi nào trong n ca thì tỉ lệ lỗi nhiều nhất khoảng 3/n (quy tắc số ba) 🔍.
- Phán quyết của DE quay lại seed làm ví dụ đã chấm: 6 đến 10 ví dụ cân bằng giữa các mức [Sc]; kiểm lại trên phần phán quyết để riêng.
- Dùng chung cỗ máy với bộ thử Giai đoạn A (D-47) và FR-17, UC-09.

### AI-4 · Dẫn truyện lúc chơi (người dùng: người chơi)

- Engine giữ thứ tự canon event, model chỉ viết phần nối [RB]. D-89 giữ nguyên.
- Đưa cả seed vào prompt, không dùng RAG hay tinh chỉnh [Li2] (suy rộng cho tài liệu nhỏ là suy luận của mình).
- Follow-up: mỗi câu một mục tiêu lấy từ seed, engine đếm trần. Chatbot hỏi follow-up thu được câu trả lời tốt hơn bảng hỏi tĩnh [Xi].
- Người chơi đi lạc: nhân vật đáp ngắn trong vai rồi quay về canon event kế [Me] 🔍.
- Luật kiểm lúc chạy: con số và tên riêng phải có trong seed hoặc trong câu người chơi gõ. Đây là hai loại lỗi nhiều nhất của văn bản sinh từ dữ liệu [TR].
- Không đưa rubric và khoá chấm vào prompt của AI-4 (suy luận, chưa có nguồn kiểm chứng); nhắc lại hồ sơ nhân vật mỗi lượt.
- Rủi ro còn lại: câu sai ghép từ từ ngữ đúng, và lộ rubric qua diễn đạt lại, không bị luật bắt [TR].
- Thời gian chờ: thí nghiệm 2, 9, 20 giây trên tác vụ hỏi đáp thấy hành vi người dùng không đổi theo độ trễ [Tn]; chỉ là bằng chứng gián tiếp.

### AI-5 · Chấm bài (người dùng: người chơi)

- Như đã chốt ở T0610.6 và T0610.7: panel ba judge khác họ, một lượt gọi chấm mọi kỹ năng, thứ tự câu trích, lý do, mức điểm; gộp trung vị; gắn cờ ca lệch quá một mức.
- Báo cáo riêng độ khớp ở hai mức giữa (0 và +1): LLM chấm kém nhất ở bài đúng một phần [Sc].
- Đề xuất: lời phản hồi cho người chơi viết từ câu trích và lý do của judge (FR-07).
- Đề xuất: panel chạy nền trong lúc chơi, chỉ cần xong trước màn tổng kết (tiền lệ: luận văn aBridgeAI, cùng cô hướng dẫn).

### Điểm chung

- Chỉ AI-4 và AI-5 nằm trong thời gian chờ của người chơi.
- Con người quyết ở cả ba bước soạn: DE xác nhận bản ghi (AI-1), đặt khoá và mốc (AI-2), phán ca khó và duyệt xuất bản (AI-3).
- Khác họ model: AI-4 với AI-5 (DC-01); model viết câu trả lời giả lập với các judge (D-49).
- Vấn đề nghiên cứu vẫn là hai (D-06): RP-1 gắn với AI-4, RP-2 gắn với AI-5. AI-1, AI-2, AI-3 là thiết kế, không phải vấn đề nghiên cứu.
- Cả năm thành phần đều thiếu bằng chứng trực tiếp cho bối cảnh của đề tài (nghề IT, tiếng Việt, chuyên gia tình nguyện); mỗi chỗ thiếu ghi thành một phép đo cho pilot.

### Chỗ khác với báo cáo và quyết định cũ

- FR-15, UC-07, §4.1.2 ghi DE tự soạn seed; §4.2.1 ghi CA không soạn nội dung chuyên môn. Kiến trúc mới: DE cung cấp và duyệt, CA cùng AI-2 dựng. Phải viết lại (phần của Nam).
- Ngày 7/10 mình nói mẫu không cần AI judge; nay có AI-3, nhưng nó chọn ca cho DE xem, không duyệt thay.
- Chưa nằm trong năm thành phần: hội thoại định hướng (FR-11), khử định danh (DC-03).

### ✅ Phúc chốt 8/10

1. Phân vai soạn seed: DE cung cấp kiến thức, đặt khoá chấm và duyệt; CA cùng AI-2 dựng khung game.
2. Lời phản hồi cho người chơi gộp vào AI-5. Hội thoại định hướng và khử định danh nằm ngoài kiến trúc AI chính.
3. AI-3 dùng cả câu trả lời giả lập lẫn lượt người thật chơi. **Giai đoạn đầu thiếu cả người chơi thật lẫn chuyên gia:** nhóm đóng vai người chơi thử (lượt đánh dấu loại "test", DR-07) và đóng vai DE trên seed tạm (D-63); cô kiểm khoảng 1/5 (D-47). Kết quả giai đoạn này chỉ cho thấy cỗ máy chạy đúng, không cho thấy độ khớp với chuyên gia.
4. Phạm vi ĐACN tạm thời: làm thật AI-4 và AI-5, AI-3 ở mức bộ thử Giai đoạn A, AI-1 và AI-2 ở mức thiết kế và bản thử. **Hỏi cô:** Phúc thấy AI-1, AI-2 không quá khó, còn AI-3, AI-4, AI-5 khó hơn; xin ý kiến cô về phạm vi.

### Đối chiếu sườn với các câu hỏi về AI của cô (8/10)

| Câu hỏi | Thành phần | Trả lời theo sườn | Còn thiếu |
|---|---|---|---|
| Model chấm có cần mạnh hơn model sinh không | AI-5 so với AI-4; AI-3 so với AI-4 và AI-2 | AI-5 chấm bài của người, nên không so với AI-4; cỡ judge do phép thử tuần 42 quyết. Bộ kiểm offline của AI-3 có seed làm bản đối chiếu nên không cần mạnh hơn, nhưng phải khác họ | Sửa đoạn văn T0610.6 theo tên AI-1…AI-5 |
| Framework cho LLM judge | AI-3 (offline), AI-4 và AI-5 (lúc chạy) | Inspect AI là bộ chạy thử của AI-3; lúc chạy dùng module mỏng trên SDK gọi model | ⏳ Phúc duyệt đề xuất thư viện |
| Benchmark | Cả năm, trọng tâm AI-5 và AI-4 | Mỗi thành phần một phép đo: AI-5 theo bộ thử Giai đoạn A, báo riêng mức 0 và +1; AI-4 theo tỉ lệ vi phạm luật, giữ fact, chất lượng follow-up do người chấm; AI-3 theo tỉ lệ bỏ sót qua mẫu ngẫu nhiên | Chưa khảo sát danh sách benchmark có sẵn (T0610.8a) |
| Chấm quá trình chơi và QA kịch bản sinh cần game design data | Seed (ra từ AI-2, vào AI-3, AI-4, AI-5) | "Game design data" là schema của seed cộng vết lượt chơi. Chấm quá trình là AI-5 cộng luật bằng chứng; QA kịch bản sinh là AI-3 | ⏳ Hai câu của T0610.9: luật bằng chứng cho quá trình; chấm từng lượt hay cả hội thoại |
| AI-native, khi AI sập còn chạy không | Cả năm | Bỏ AI thì hệ thống lùi về kịch bản viết tay và chấm từ khoá (prototype hiện tại). Khi nhà cung cấp lỗi lúc chơi: AI-4 lỗi thì vẫn chơi được bằng phần canon hiển thị nguyên văn, bỏ follow-up; AI-5 lỗi thì câu có khoá vẫn chấm, tự luận chờ chấm (UC-03 5a). AI-1, AI-2, AI-3 lỗi thì việc soạn tạm dừng, người chơi không bị ảnh hưởng | Chưa có định nghĩa "AI-native" có nguồn; UC-03 2a cần thêm chế độ chỉ chạy phần canon (báo Nam) |

Hệ quả cho §5.2.3: cần **bốn họ model**. Một họ cho các việc sinh (AI-1, AI-2, AI-4 và câu trả lời giả lập của AI-3), ba họ khác cho panel của AI-5 (DC-01, D-49). Đây là ràng buộc chi phí và tích hợp phải nêu khi chọn model.

### Nguồn cho mục này

Đã mở trang nguồn và tóm tắt khớp (chưa đọc PDF): [CH] Chopra & Haaland, "Conducting Qualitative Interviews with AI", CESifo WP 10666 · [Wu1] Wuttke et al., arXiv:2410.01824 (LaTeCH-CLfL 2025) · [LR] Korn, Gorsch, Vogelsang, LLMREI, arXiv:2507.02564 (preprint) · [Wu2] Wu et al., arXiv:2407.18328 (Technology, Knowledge and Learning) · [Ta] Tam et al., arXiv:2408.02442 · [LW] Lu & Wang, L@S 2024, arXiv:2405.11591 · [BB] Balog & Bakken, Findings of EMNLP 2026, arXiv:2608.30033 · [Fe] Ferrer et al., arXiv:2603.29559 (preprint) · [Sc] Schleifer et al., BEA 2026, arXiv:2605.07647 · [Sh] Shankar et al., arXiv:2404.12272 (agent ghi UIST 2024) · LLM-Rubric: Hashemi et al., ACL 2024, arXiv:2501.00274 · [RB] Riedl & Bulitko, AI Magazine 34(1), doi:10.1609/aimag.v34i1.2449 · [Li2] Li et al., EMNLP 2024 industry track, arXiv:2407.16833 · [TR] Thomson & Reiter, INLG 2020, arXiv:2011.03992 · [Xi] Xiao et al., TOCHI 2020, doi:10.1145/3381804 · [Tn] Tan et al., CHI 2026, arXiv:2604.06183.

🔍 Chưa tự mở được, chỉ theo agent: [Mo] Morgeson et al. 2004 (J. Applied Psychology) · [Ha] Hasson et al. 2000 (J. Advanced Nursing) · [MH] Mislevy & Haertel 2006 (Educational Measurement: Issues and Practice) · [RS] Rogosch & Schrader 2026 (Applied Sciences, doi:10.3390/app16062932, trang trả 403) · [Kl] Klang et al. 2023 (BMC Medical Education, doi:10.1186/s12909-023-04752-w) · [Yao] Yao, Yang, Kuang 2026 (AIME-Con) · [Me] Mehta et al. 2007 (AAMAS) · quy tắc số ba (Hanley & Lippman-Hand 1983).

## 1c. Báo cáo nghiên cứu giải pháp AI (8/10) · ⏳ chờ Phúc đọc

- Báo cáo: `research/reports/Giải pháp AI cho JobQuest.md` (tiếng Anh, khoảng 15.600 từ). Ghi chú nguồn: `research/research_notes/Giải pháp AI cho JobQuest/` (7 file, gồm `source_verification.md` sửa 12 con số của các lượt khảo sát trước). Cả thư mục `research/` chưa được git theo dõi.
- Ba quyết định đã chốt bị bằng chứng đặt nghi vấn, báo cáo đề xuất đưa thành giả thuyết để thử ở Giai đoạn A:
  1. Một lượt gọi chấm mọi kỹ năng: RuVerBench (EMNLP 2026, mới đọc tóm tắt) thấy chấm gộp đánh đổi độ chính xác.
  2. Trung vị của panel: trên BiGGen Bench, năm judge bỏ phiếu đạt 0,627 so với 0,623 của judge đơn tốt nhất.
  3. Chỉ gắn cờ khi judge lệch quá một mức: lỗi mà judge vừa tự tin vừa nhất quán không bị bắt, nên phải có mẫu ngẫu nhiên kiểm mù.
- NFR-14 (QWK ≥ 0,70) cao hơn mọi mức trung bình đã kiểm của LLM chấm bằng prompt trên dữ liệu tiếng Anh công khai (ASAP-AES khoảng 0,31–0,47; ASAP-SAS 0,26–0,68).
- D-89: luật kiểm lúc chạy không bắt được câu sai ghép từ từ ngữ đúng; NFR-15 chỉ chứng nhận được cho fact và con số bắt buộc.
- Công cụ: Inspect AI đã có sẵn bộ gộp trung vị và Krippendorff alpha thứ bậc; gói `krippendorff` là GPL-3.0, có thể bỏ. QWK vẫn dùng scikit-learn.
- Pháp lý: dữ liệu hành vi chơi có thể là dữ liệu nhạy cảm (NĐ 356 Đ.4(1)(l)); điều khoản Gemini API cấm dịch vụ mà người dưới 18 tuổi có khả năng dùng. Văn bản luật mới đọc qua bản sao không chính thức.
- Đề xuất phân họ model của báo cáo (chưa ai duyệt): judge từ OpenAI, Anthropic, Google; model sinh từ Qwen.
- Cỡ bộ thử Giai đoạn A: khoảng 100 bài mỗi năng lực mỗi ngôn ngữ cho sai số ±0,10, khoảng 46 bài cho ±0,15 (số tự tính, phải chạy lại trước khi trích).

## 1d. Phúc chốt sau khi đọc báo cáo nghiên cứu (8/10)

- **Phạm vi giai đoạn này: chỉ bảo chứng kỹ thuật.** Coi như chưa có game design data. Câu hỏi cần trả lời là làm sao bảo đảm AI đúng và có bằng chứng kiểm tra. Chấm quá trình chơi (hint, thời gian, cách gộp điểm) và phần "gamify" của AI-2 để sau, khi bàn game design.
- **Bỏ các quy định pháp luật về độ tuổi** khỏi phần AI của báo cáo, để báo cáo không phức tạp không cần thiết. (Mình hiểu là áp cho phần AI mới viết; §2.7 và §4.1.4 hiện có chưa đụng tới, chờ Phúc xác nhận.)
- **Canon event:** một tình huống có thể có nhiều canon event, engine chọn ngẫu nhiên. Tất cả vẫn là nội dung soạn sẵn. Đây cũng là thứ engine chạy khi AI-4 lỗi.
- **Chốt một phương pháp chấm, không để ở dạng giả thuyết** (mình đề xuất, chờ Phúc xác nhận dòng đầu vì nó đảo lựa chọn 7/10):
  1. **Mỗi lượt gọi chấm một năng lực** (đổi so với "một lượt chấm mọi kỹ năng" ngày 7/10). Dẫn chứng: G-Eval [58] chấm "on one metric" mỗi prompt (§2 của bài, đã kiểm); BiGGen Bench và Prometheus chấm theo một rubric mỗi lượt (đã kiểm BiGGen §3.1); Hu et al., ACL 2024 (arXiv:2402.12055, đã kiểm tóm tắt) cho thấy LLM chấm lẫn lộn giữa các tiêu chí. RuVerBench không dùng làm dẫn chứng: tóm tắt chỉ nói có đánh đổi, không nói chiều nào.
  2. **Panel ba judge khác họ, lấy trung vị.** Lý do nêu trong báo cáo là độ bền, không phải chính xác hơn: panel ngang judge đơn tốt nhất mà không cần biết trước judge nào tốt nhất (BiGGen Bench, Bảng 3: 0,627 so với 0,623, đã kiểm); sự cố của các nhà cung cấp không tương quan (Chu et al., ICPE 2025); có tín hiệu lệch để gắn cờ.
  3. **Gắn cờ khi các judge lệch quá một mức, cộng một mẫu ngẫu nhiên kiểm mù** các ca không bị gắn cờ.
- **Để sau, chưa làm:** kiểm lại EntryLevel, Anthropos, JobWay, AI Hay từ nguồn chính (đụng tới §3.2 đã nộp cô).

## 1e. Phúc nêu 8/10 (lượt sau) · chỉ ghi lại, CHƯA SỬA GÌ

- **Bỏ hẳn phần luật về độ tuổi khỏi báo cáo**, kể cả đoạn đồng ý của người giám hộ ở §4.1.4 và các chỗ nhắc tới người dùng vị thành niên ở §2.7. Hệ quả cần nhớ khi áp dụng: code vẫn có luồng `/consent` cho người dưới 16 tuổi, nên báo cáo và code sẽ lệch nhau ở điểm này.
- **AI-native theo Phúc:** bỏ AI đi thì ứng dụng hỏng hẳn, không có fallback nào; như vậy mới là native. Mình đề xuất cách viết: không có chế độ thay thế (không chấm từ khoá, không chạy kịch bản soạn sẵn thay cho AI); khi AI lỗi thì phiên chơi tạm dừng, câu trả lời và tiến độ được lưu (NFR-04), chơi tiếp khi AI trở lại. Chuyển sang nhà cung cấp khác vẫn là AI, không tính là fallback. Việc này bỏ đề xuất "AI-4 lỗi thì chạy phần canon" ở mục 1c, 1d, và UC-03 luồng 2a ("dùng lượt mẫu đã duyệt") phải viết lại (phần của Nam).
- **Kiến trúc chấm (Phúc nghiêng về, mình đề xuất chi tiết, chờ Phúc xác nhận):**
  1. Tách model dẫn truyện và judge. Không dùng một model làm cả hai.
  2. Lúc chơi chỉ có model dẫn truyện chạy; không chấm trong lúc chơi.
  3. Chơi xong mới chấm: panel ba judge khác họ đọc bản ghi cả lượt chơi; mỗi lượt gọi chấm một tiêu chí (một năng lực ở một tình huống), trả câu trích, lý do, mức; lấy trung vị; gắn cờ ca lệch quá một mức cộng mẫu ngẫu nhiên kiểm mù.
  4. Hệ quả: NFR-02 (chấm trong 8 giây mỗi câu) trở thành thời gian chờ một lần ở màn tổng kết, cần viết lại (Nam). Luật kết cục và sự kiện ngẫu nhiên trong spec đang dựa vào điểm giữa chừng (A12, A13); đó là việc của game design, để sau.

## 1f. Phúc phản hồi về phương pháp chấm (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- **AI-native:** cách viết ở mục 1e ổn. ✅
- **Không đồng ý tách mỗi tiêu chí một lượt gọi.** Lý do Phúc nêu: khi số tiêu chí và số tình huống tăng thì chờ rất lâu, tốn token, và các lượt gọi rời nhau không giữ được cách hiểu nhất quán về cùng một lượt chơi.
- **Không có đáp án mẫu.** Câu trả lời là văn tự do; judge chấm theo rubric: mỗi tiêu chí đáp ứng tới đâu thì được bấy nhiêu điểm. Phải có rubric chấm điểm đàng hoàng thì mới đo được judge có chấm đúng theo ngữ cảnh câu trả lời không.
- **Đính chính của mình:** bài Hu et al. (ACL 2024) cho thấy LLM lẫn tiêu chí ngay cả khi mỗi lượt chỉ hỏi một tiêu chí, nên nó không chứng minh được rằng tách lượt gọi thì hết lẫn. Dẫn chứng cho "mỗi lượt một tiêu chí" vì vậy chỉ còn là thông lệ của G-Eval và BiGGen, không phải một phép so sánh.
- **Đề xuất tạm thời của mình (chờ kết quả khảo sát đang chạy và Phúc xác nhận):** mỗi judge một lượt gọi cho cả lượt chơi, tức ba lượt gọi ở cuối bất kể số tiêu chí. Trong lượt đó judge đi lần lượt từng tiêu chí, mỗi tiêu chí trả câu trích, lý do, mức. Khi lượt chơi dài thì tách theo tình huống, không tách theo tiêu chí. Prompt của judge gồm bối cảnh, bản ghi lượt chơi và rubric; không có đáp án mẫu. Ví dụ đã chấm (nếu có sau này) không dùng ở giai đoạn này.
- **Hệ quả cho câu hỏi "judge có cần mạnh hơn model sinh":** vì không có đáp án mẫu, judge phải tự hiểu nghề để áp rubric; kết quả "judge chấm đúng chủ yếu ở câu nó tự giải được" (Krumdick et al.; JudgeBench) áp dụng trực tiếp. Mốc rubric càng cụ thể thì càng bớt phụ thuộc. Judge nhiều khả năng cần bậc giữa, không phải bậc rẻ nhất; để phép thử quyết.
- **Đang khảo sát (9/10):** (1) danh sách model cụ thể dự kiến đem thử cho vai dẫn truyện và ba vai judge; (2) bằng chứng về chấm nhiều tiêu chí trong một lượt gọi so với tách riêng, và chấm cả bản ghi ở cuối.
- Mọi thay đổi vẫn chỉ nằm trong plan, chưa áp vào báo cáo hay hub.

## 1g. Danh sách model dự kiến đem thử (khảo sát 9/10) · ⏳ chờ Phúc duyệt

Nguồn: lượt khảo sát của agent (giá đọc lại từ trang chính thức, không đổi so với 8/10). Mình đã đối chiếu riêng dòng Anthropic với tài liệu tham chiếu của Claude API (bản lưu 6/10/2026): mã `claude-haiku-5-5` giá 0,10 / 0,50 USD và `claude-sonnet-5-5` giá 2 / 10 USD cho một triệu token là đúng. **Một chỗ agent ghi sai:** giá đọc cache của Sonnet 5.5 là 0,20 USD, không phải 0,10.

**Judge: ba họ, mỗi họ thử hai bậc** để biết bậc rẻ có đủ không.

| Họ | Bậc giữa | Bậc nhỏ | Điểm tiếng Việt (SEA-HELM, model đời trước cùng dòng) |
|---|---|---|---|
| Anthropic | `claude-sonnet-5-5` (2 / 10) | `claude-haiku-5-5` (0,10 / 0,50) | Sonnet 5: 77,0; Haiku 4.5: 67,7 |
| OpenAI | `gpt-6.1-sol` (2 / 10) | `gpt-6-luna` (0,10 / 0,50) | GPT 5.6 Sol: 77,1; GPT 5.6 Luna: 71,9 |
| Google | `gemini-3.8-flash` (0,75 / 3,75) | `gemini-3.5-flash-lite` (0,30 / 2,50) | 78,4; Gemini 3.1 Flash Lite: 75,2 |

**Model dẫn truyện: phải thuộc họ thứ tư.**

- Chính: `deepseek-flash` (0,30 / 1,20 giờ cao điểm). Nhanh nhất trong các số đã công bố: 1,06 giây tới chữ đầu, 219 token/giây. Hạn chế: chỉ có chế độ JSON object, dữ liệu lưu ở Trung Quốc, chính sách dùng dữ liệu để huấn luyện chưa đọc được rõ.
- Dự phòng: `qwen3.8-flash` (0,15 / 0,47). Bản mở cùng dòng có điểm hội thoại tiếng Việt cao (87), nhưng số đo tốc độ chậm hơn hẳn (2,47 giây, 56 token/giây).
- Nếu đổi model dẫn truyện sang `gpt-6-luna` hoặc `claude-haiku-5-5` thì panel judge phải bỏ họ đó và thêm Qwen hoặc DeepSeek.

**Mã nguồn mở để thử làm bậc rẻ nhất:** Gemma 4 31B (điểm tiếng Việt 77,1) và Qwen3.5-9B (71,9), thuê theo token ở bên thứ ba.

**Không ghép chung trong một panel** (cùng họ hoặc cùng dòng dõi): các model GPT với gpt-oss; Haiku, Sonnet, Opus; Gemini với Gemma (đề phòng, chưa có nguồn); mọi bản Qwen và SEA-LION; Muse Glimmer với Muse Spark.

**Chi phí** (số token là giả định: bản ghi và rubric 4.000 token vào, 1.000 token ra mỗi lượt gọi):

| | Chấm gộp (3 lượt gọi) | Chấm tách, không cache (36 lượt gọi) |
|---|---|---|
| Panel bậc nhỏ, một lượt chơi | 0,0055 USD | 0,020 USD |
| Panel bậc giữa, một lượt chơi | 0,043 USD | 0,177 USD |

- Model dẫn truyện bậc nhỏ: khoảng 0,005 USD một lượt chơi (12 lượt, 3.000 token vào và 200 ra mỗi lượt).
- Lượt thử đầu (30 bản ghi, mỗi model chấm lặp 3 lần, chấm gộp): cả 12 ứng viên khoảng 5,25 USD; riêng ba model bậc giữa 3,85 USD, hoặc 1,92 USD nếu dùng batch.
- Đường miễn phí: mỗi model Qwen có 1 triệu token miễn phí trong 90 ngày; gói miễn phí của Gemini dùng nội dung để huấn luyện nên chỉ hợp cho dữ liệu tổng hợp.

**Thời gian chờ khi chấm gộp** (mình tính từ số trung vị của Artificial Analysis, đo từ Mỹ, không ghi ngày): một lượt gọi trả 1.000 token mất khoảng 9 giây với `gpt-6-luna`, khoảng 11 giây với `claude-sonnet-5-5` ở mức suy luận thấp, khoảng 24 giây với `gpt-6.1-sol`. Chấm tách thì mỗi lượt gọi ngắn và chạy song song nên nhanh hơn, đổi lại tốn gấp khoảng 4 lần.

**Chưa có:** không model nào trong danh sách có điểm benchmark công khai về kiến thức IT cho ba vai Backend, DevOps, BA; các model bậc nhỏ đời mới chưa có trên SEA-HELM; chưa có số đo độ trễ ở phân vị 95 hay đo từ Việt Nam. Ba chỗ này chỉ phép thử của nhóm mới trả lời được.

## 1h. Cách chia lượt gọi khi chấm (khảo sát 9/10) · ⏳ chờ Phúc chốt

Ba cách: (A) mỗi judge một lượt gọi cho cả lượt chơi; (B) mỗi tiêu chí một lượt gọi; (C) mỗi tình huống một lượt gọi, chấm 1 đến 3 tiêu chí của tình huống đó.

**Bằng chứng** (chưa có nghiên cứu nào so trực tiếp trên rubric thứ bậc, tiếng Việt hay bản ghi nhập vai):

- Peng et al., EMNLP 2026 (arXiv:2606.29920; mình đã mở §4.4 và kết luận): gộp nhiều rubric vào một lượt gọi đánh đổi độ chính xác lấy chi phí. Mất ít khi bằng chứng nằm gọn; mất nhiều khi bằng chứng rải trên một chuỗi dài, nơi gộp 4 đến 5 rubric làm mọi model tụt điểm, thường hai chữ số. Tác giả khuyên gộp nhỏ hoặc chấm từng rubric khi chi phí cho phép. Con số chi tiết theo từng cỡ gộp nằm trong hình, mình chưa đọc được.
- Yu et al., preprint 8/2026 (arXiv:2608.14684; mình đã mở tóm tắt): chấm nhiều rubric cùng lúc thì kết luận cho một rubric đổi theo việc có những rubric nào khác đứng cạnh; chỉ một phần ba số mẫu giữ nguyên kết luận khi đổi tập rubric.
- Lee et al. (arXiv:2404.04941; mình đã mở tóm tắt): chấm từng nét riêng hơn hẳn chấm thẳng một lần trên bài luận. Số so với "mọi nét trong một lượt" (0,492 so với 0,306) là theo agent, chưa kiểm.
- Ngược chiều: Zhang et al. (preprint, theo agent, chưa kiểm) thấy prompt nhiều khía cạnh ngang hoặc hơn và rẻ hơn 61 đến 70%.
- Không tìm thấy nghiên cứu nào cho thấy một lượt gọi gộp thì nhất quán giữa các tiêu chí hơn các lượt gọi rời.

**Đề xuất của mình: cách C, tối đa 3 tiêu chí mỗi lượt gọi, chạy nền ngay khi tình huống kết thúc; kết quả vẫn chỉ hiện ở màn tổng kết.**

- Mỗi lượt gọi nhận bản ghi từ đầu tới hết tình huống đó, kèm rubric của tình huống.
- Thứ tự đầu ra: câu trích, lý do, mức.
- Không trông vào nhiệt độ 0 để có kết quả ổn định; panel ba judge đóng vai bỏ phiếu (Rating Roulette, EMNLP 2025: judge chấm lại cùng một bài cho điểm khác nhau).
- Ngưỡng 3 tiêu chí là mình đọc từ hai bài trên, không phải số đã được đo.

**Chi phí một lượt chơi, mình tự tính** (giả định 4 tình huống, mỗi lượt gọi 3.000 token vào và 250 ra, không cache): panel bậc nhỏ khoảng 0,0095 USD, panel bậc giữa khoảng 0,081 USD. Tức gấp gần 2 lần cách A và chưa bằng một nửa cách B.

**Trong phép thử:** chạy cả A và C trên cùng bộ bản ghi để có số đo chênh lệch của chính đề tài.

**Ý đáng cân nhắc khi viết rubric** (theo agent, mình chưa mở nguồn): tách mô tả mỗi mức thành các câu hỏi có/không về hành vi, judge chỉ trả lời có/không, điểm do hệ thống cộng. CheckEval báo độ đồng thuận giữa 12 judge tăng từ 0,09 lên 0,48 trên bài tóm tắt tiếng Anh.

## 1i. Phúc chốt và nêu ý mới (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- ✅ **Cách chia lượt gọi khi chấm: cách C** ở mục 1h (mỗi tình huống một lượt gọi, tối đa 3 tiêu chí, chạy nền, kết quả hiện ở màn tổng kết).
- 💡 **Ý của Phúc, định đề xuất với cô:** mỗi ngày cho chơi miễn phí vài lượt; muốn chơi thêm thì nạp tiền mua lượt.
  - Ý này mở lại câu Q2 của buổi 26/9 chưa từng hỏi cô (cô nói "Free is good but people view free poorly"; nhóm tự chốt giữ miễn phí ở D-17).
  - Nếu cô đồng ý, các chỗ phải đổi: D-17 (chuyển ♻️); mục tiêu cụ thể 4 ở §1.2 ("không phụ thuộc khả năng chi trả"); §1.4.1; §4.1.5 (giá trị và người hưởng lợi, nguồn kinh phí, biện pháp bảo vệ "không thu phí người dùng", câu "No paid tier is introduced"); thêm business rule về hạn mức miễn phí mỗi ngày; thêm FR cho hạn mức và mua lượt (phần của Nam).
  - Mình đề xuất tách hai phần: **hạn mức miễn phí mỗi ngày** là cơ chế giữ chi phí, khớp NFR-11 và làm được trong ĐACN; **mua thêm lượt** chỉ mô tả trong mô hình kinh doanh, chưa cài, vì tích hợp thanh toán là một khối việc lớn và có thủ tục riêng.
  - Số để trình cô (token là giả định, tỉ giá mình giả định khoảng 26.000 đồng một USD): một lượt chơi tốn khoảng 0,015 USD với panel bậc nhỏ (khoảng 400 đồng) và khoảng 0,086 USD với panel bậc giữa (khoảng 2.200 đồng), đã gồm model dẫn truyện.
  - Chưa có dẫn chứng nào cho mô hình "miễn phí có hạn mức, trả tiền mua thêm" trong giáo dục; nếu cô đồng ý thì cần một lượt khảo sát riêng trước khi viết vào §4.1.5.

## 1j. Rà từng câu hỏi của cô (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- ✅ **Câu 2, framework:** Phúc đồng ý Inspect AI cho chạy thử offline và module TypeScript tự viết (kiểm đầu ra bằng `zod`) lúc chạy. Việc phát sinh khi viết báo cáo: lập bảng so sánh theo tiêu chí; kiểm lại lý do loại promptfoo, DeepEval, Ragas; viết lại mô tả bộ chấm theo cách C; để prompt và rubric trong file dữ liệu dùng chung cho bản Python và bản TypeScript.
- **Câu 3, benchmark:** các chỗ báo cáo nghiên cứu lệch với quyết định mới, cần sửa khi viết: (1) đơn vị thử phải là bản ghi lượt chơi theo từng tình huống, không phải câu trả lời rời; (2) bộ thử vẫn cần các lượt chơi mẫu ở mức biết trước, dùng làm dữ liệu thử chứ không đưa cho judge; (3) rubric trong skeleton hiện có ba mốc, bộ thử cần bốn mức; (4) cỡ mẫu 100 hoặc 46 là số tự tính, chưa chạy lại; (5) giai đoạn này chưa có chuyên gia nên bộ thử chỉ cho thấy judge nhạy với từng tiêu chí.

## 1k. Phúc chốt cho câu 3, benchmark (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- ✅ Đơn vị thử là bản ghi lượt chơi theo từng tình huống.
- ✅ **Dữ liệu thử chính là các lượt DE chơi thử và chấm;** điểm của DE được đem so với điểm của judge. Giai đoạn này chưa có DE nên nhóm đóng vai, cô kiểm một phần (D-47, D-63). Các biến thể bẫy (viết dài hơn, sai chính tả, chèn lệnh) chỉ là phép thử phụ.
- ✅ **Thước đo dự kiến: độ đồng thuận giữa judge và DE.** Cách đo (QWK, bảng nhầm lẫn, tỉ lệ khớp đúng mức và lệch một mức) dùng được cho mọi thang có thứ bậc, nên không phụ thuộc số mức.
- ⏳ **Chưa chốt được, chờ game design:** thang chấm có mấy mức và mỗi mức nghĩa là gì; bảng chấm năng lực của một lượt chơi; bộ tiêu chí cụ thể đưa cho judge. Vì vậy báo cáo chỉ viết thang −1 / 0 / +1 / +2 là **dự kiến**.
  - Ghi chú về D-87 (Phúc chốt 1/10): bốn mức ra đời để gộp hai cách chấm vào một thang (lựa chọn có khoá và tự luận) và để có điểm âm cho lựa chọn sai theo lời cô 26/9. Nhưng trong D-87 chỉ có +2 và −1 được dùng cho lựa chọn, và spec cùng hai kịch bản hiện có chỉ viết mốc cho +2, 0, −1. Mức +1 chưa có mô tả ở đâu cả. Khi áp dụng thay đổi vào hub, ghi chú điểm này vào D-87 và 07.
- ✅ **Chỉ hỗ trợ tiếng Việt.** Bỏ phép nhân theo ngôn ngữ trong cỡ mẫu và bỏ lượt chạy thử tiếng Anh trên ASAP-SAS, Mohler. Đụng tới NFR-08 (đang ghi tiếng Việt và tiếng Anh, mức Should): báo Nam.
- Đính chính: "4 tiêu chí" mình dùng trong các phép tính là số đếm từ kịch bản mẫu `L3_S_INCIDENT.json` (bốn cặp tình huống và kỹ năng ở các câu tự luận), không phải con số thiết kế. Số tiêu chí thật chờ game design.

## 1l. Câu 4, chấm quá trình chơi và QA kịch bản sinh (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- **Phúc nhắc:** dữ liệu kịch bản mẫu hiện có và cách tính điểm đều chưa chốt, sẽ sửa lại khi làm game design. Không lấy chúng làm căn cứ cho quyết định nào; mọi con số mình tính từ kịch bản mẫu chỉ là ví dụ.
- **Cách trả lời cô ở giai đoạn này (chỉ phần kỹ thuật):** QA nội dung sinh gồm bốn chốt nối nhau: (1) seed được kiểm cấu trúc bằng máy rồi DE duyệt; (2) DE chơi thử, AI-3 chọn ca cho DE xem, kèm mẫu ngẫu nhiên kiểm mù; (3) lúc chơi, engine giữ thứ tự canon event, nội dung canon hiển thị nguyên văn, phần AI viết bị kiểm bằng luật; (4) sau khi chơi, model khác họ rà log. Chấm lượt chơi: judge chấm theo từng tình huống, thước đo là độ đồng thuận với DE.
- **Chỗ báo cáo nghiên cứu lệch với quyết định mới, phải sửa khi viết:**
  1. Bảng "khi nhà cung cấp lỗi" ghi AI-4 lỗi thì chạy phần canon; trái với cách viết AI-native đã chốt (không có chế độ thay thế, phiên chơi tạm dừng).
  2. Phần kiểm chứng AI-5 viết theo câu trả lời rời và biến thể có mức biết trước; nay là bản ghi theo tình huống và lượt DE chơi thử.
  3. Chưa nói tới việc một tình huống có nhiều canon event để chọn ngẫu nhiên: mỗi biến thể phải được DE duyệt, và log phải ghi biến thể nào đã được dùng.
- **Chưa làm được cho tới khi có game design:** đo tỉ lệ giữ fact (NFR-15) vì seed chưa có danh sách fact bắt buộc; luật bằng chứng cho quá trình (hint, thời gian, follow-up); cách gộp điểm thành năng lực.
- **Chưa có số đo nào:** bốn chốt trên mới là thiết kế và kế hoạch thử. Bằng chứng kiểm tra chỉ có sau khi dựng bộ lượt chơi viết sẵn (bốn loại: đúng mạch, đi lạc, cố ý phá, moi rubric) và chạy nó.

## 1m. Phúc chốt cho câu 4 và rà câu 5 (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- ✅ **Canon event nhiều biến thể:** mỗi biến thể phải được DE duyệt; log ghi biến thể nào đã được dùng.
- ✅ **Bỏ phần "giới hạn" dựa trên số liệu bên ngoài** (luật không bắt được câu sai ghép từ từ đúng; bộ kiểm bằng model đạt 75–77% trên tiếng Anh; chưa phép kiểm nào thử trên tiếng Việt). Lý do của Phúc: các số đó không giúp chứng minh gì cho đề tài; nhóm sẽ tự dựng bộ kiểm và tự đánh giá sau. Lưu ý của mình khi viết: báo cáo không trích các số đó, và cũng không khẳng định các phép kiểm bắt được mọi lỗi; ghi là hiệu quả sẽ đo bằng bộ thử của nhóm.
- **Câu 5, AI-native và khi AI sập. Chỗ báo cáo nghiên cứu phải sửa khi viết:**
  1. Bảng "khi nhà cung cấp lỗi" viết theo hướng có chế độ dự phòng (AI-4 chạy phần canon, AI-5 chấm bằng hai trong ba judge). Theo cách đã chốt thì không có chế độ thay thế: phiên chơi tạm dừng, lưu câu trả lời và tiến độ, chơi tiếp khi AI trở lại; chuyển nhà cung cấp vẫn là AI.
  2. Hai nguồn neo của định nghĩa là một preprint (Xu et al., 7/2026) và một white paper không ghi ngày của Ericsson; chưa tìm được định nghĩa bình duyệt nào cho phần mềm. Câu trích của Ericsson phải đọc lại trên trang gốc.
  3. Phần so với các hệ thống hiện có: Anthropos, JobWay, AI Hay chưa kiểm được; EntryLevel lệch với §3.2. Phúc đã bảo để sau.
- **Hai điểm mình nêu để Phúc quyết:**
  1. Prototype hiện tại chạy trọn vẹn mà không có AI (kịch bản viết tay, chấm từ khoá). Nếu định nghĩa là "bỏ AI thì ứng dụng hỏng hẳn" thì báo cáo phải nói rõ prototype là bản dựng giao diện với nội dung tạm, và khi tích hợp AI thì đường chấm từ khoá cùng kịch bản viết tay bị gỡ, không giữ làm đường dự phòng.
  2. Khi AI lỗi, phần không dùng AI (đăng nhập, bản đồ nghề, hồ sơ, lịch sử) vẫn mở được. Cách nói chính xác với cô: vòng chơi dừng hẳn, các trang không dùng AI vẫn xem được, tiến độ không mất.
  3. Một judge trong panel lỗi: mình đề xuất chờ đủ ba judge rồi mới ra điểm (việc chấm vốn chạy nền nên người chơi không bị chặn), không chấm tạm bằng hai judge.

## 1n. Phúc chốt cho câu 5 và rà câu 6 (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- ✅ **Không bàn tới prototype** trong lập luận AI-native. Sản phẩm chính không có AI thì không có đường dự phòng nào: không xử lý được câu trả lời tự do cho hợp lý, và dù nội dung canon còn đó thì lời dẫn cũng không khớp được.
- ✅ **Cách nói với cô:** AI lỗi thì phần sinh và phần chấm, tức phần cốt lõi, coi như chết. (Các trang không dùng AI vẫn mở được; tiến độ không mất.)
- ✅ **Một judge trong panel lỗi:** chờ đủ ba judge rồi mới ra điểm, không chấm tạm bằng hai.
- **Câu 6, bằng chứng LLM judge đáng tin (cô hỏi 26/9). Việc phải làm khi viết:**
  1. Sửa giọng đoạn §2.5 hiện có: bằng chứng công bố cho thấy LLM chấm bằng prompt đạt mức người chấm chỉ trong một số điều kiện, còn trung bình trên dữ liệu công khai thấp hơn ngưỡng 0,70 (bài luận ASAP-AES khoảng 0,31–0,47; câu trả lời ngắn ASAP-SAS 0,26–0,68; trong khi người với người là 0,752 và 0,874, model tinh chỉnh 0,75–0,82).
  2. §2.5 đang ghi judge cần "ví dụ đã chấm"; thiết kế giai đoạn này không dùng ví dụ đã chấm và không có đáp án mẫu. Hai chỗ này phải khớp nhau: hoặc sửa §2.5, hoặc ghi rõ ví dụ đã chấm sẽ có sau khi DE phán các ca thử.
  3. Ghi rõ các nghiên cứu được trích dùng model đời 2023–2024, tiếng Anh, bài luận hoặc câu trả lời ngắn; không có nghiên cứu nào trên tiếng Việt hay bản ghi nhập vai.
  4. Câu hỏi cho cô: giữ ngưỡng QWK ≥ 0,70 của NFR-14 làm mốc đạt, hay coi tiêu chí "không thấp hơn quá 0,10 so với độ khớp giữa các chuyên gia" là chính (NFR-14 thuộc phần của Nam).

## 1o. Phúc chốt cho câu 6 và rà câu 7 (9/10) · chỉ ghi lại, CHƯA SỬA GÌ

- ✅ **Câu 6:** trả lời cô thẳng rằng bằng chứng công bố cho thấy LLM judge chỉ đáng tin có điều kiện, nên nhóm tự đo (RP-2); sửa §2.5 theo đó. Đem hỏi cô nên lấy mốc nào của NFR-14 làm chính (ngưỡng QWK ≥ 0,70 hay "không thấp hơn quá 0,10 so với độ khớp giữa các chuyên gia").
- **Câu 7, đối sánh và chọn model (email cô 1/10, mục 5.2.3). Việc phải làm khi viết:**
  1. Thống nhất model dẫn truyện: báo cáo nghiên cứu đề xuất họ Qwen, danh sách 9/10 (mục 1g) đặt `deepseek-flash` lên trước vì nhanh hơn. Thử cả hai rồi chọn theo độ trễ đo từ Việt Nam và độ tự nhiên của tiếng Việt.
  2. Bảng so sánh phải dùng khung tiêu chí của Nam và Nhật (T0610.13) khi khung đó có; hiện các bảng dùng tiêu chí mình rút từ yêu cầu, và điểm trong bảng là nhận định, chưa đo.
  3. Viết 5.2.3 theo dạng: ứng viên, tiêu chí, lựa chọn tạm thời, kế hoạch thử. Lựa chọn cuối cùng ghi sau phép thử, theo khuôn mục 7.4 của luận văn aBridgeAI.
  4. Bỏ các tiêu chí đã bị loại: tiếng Anh, điều khoản về độ tuổi của nhà cung cấp.
  5. Ghi rõ ba thứ chưa có: bằng chứng công khai về kiến thức IT của các model; điểm tiếng Việt của các model bậc nhỏ đời mới; độ trễ ở phân vị 95 đo từ Việt Nam.
- **Chờ quyết:** ai trả khoảng 5 USD cho lượt thử đầu (đường miễn phí: 1 triệu token mỗi model Qwen trong 90 ngày; gói miễn phí của Gemini chỉ hợp với dữ liệu tổng hợp); phạm vi AI-1, AI-2 (hỏi cô); mô hình thu phí theo lượt chơi (hỏi cô).

## 2. Theo task

### T0610.5 · Business rule một người giữ nhiều vị trí · 👤 chờ hỏi Nam

Sửa `report.md`:

1. §4.1.3, thêm dòng cuối bảng business rule:

   | ID | Rule | Origin |
   |---|---|---|
   | BR-17 | A position is a set of responsibilities rather than a person. In the early stages one person may hold more than one position, provided that no one reviews content they authored. | Small founding team (Section 4.1.5); independence of expert validation (BR-05) |

2. §4.4: "twelve business rules" thành "thirteen business rules".
3. §4.1.5, câu cuối đoạn "Organisational structure": thêm tham chiếu "(BR-17)".

Sửa hub: 07 B11 ghi đã có BR-17; `tuan/2026-W41/tuan.md` đổi trạng thái T0610.5.

Báo Nhật: thêm BR-17 vào bảng ánh xạ số cũ sang số mới (T2609.29).

👤 **Hỏi Nam:** "vị trí" chỉ là vị trí trong bảng tổ chức (Bảng 4.3), hay gồm cả vai trò trong hệ thống (một tài khoản vừa là DE vừa là CA)? Nếu gồm cả vai trò hệ thống thì tài khoản phải gán được nhiều vai trò và FR-16 kiểm theo người.

### T0610.6 · Model chấm có cần mạnh hơn model sinh không · ✅ hướng, ⏳ duyệt câu chữ

**Kết luận.** Tuỳ vào việc model đang chấm cái gì; thiết kế chỉ đặt model vào vai chấm ở hai chỗ.

- Lọc mẫu offline (chấm đầu ra của model khác, có seed làm bản đối chiếu): không cần mạnh hơn model sinh, nhưng phải khác họ (DC-01).
- Chấm bài của người chơi: so với model sinh là so sai đối tượng. Thứ quyết định là rubric rõ và ví dụ đã chấm. Cỡ judge và thành phần panel để phép thử tuần 42 quyết.

**Đoạn văn cho §5.2.3** (đã sửa theo D-89):

> Whether the judging model must be stronger than the generating model depends on what is judged, and the design places a model in the judging role at two points only. The first is offline, when a sample of scenarios generated from a seed is screened before expert review. Here the checker evaluates another model's output against an expert-written source. Without a reference, a judge agrees with experts mainly on items it could have answered correctly itself, and an expert-written reference largely removes this dependence [K]; small purpose-built checkers given the source text approach the accuracy of the largest models at a fraction of the cost [M]. Because the seed supplies that reference, the checker need not be stronger than the generator, but it comes from a different family, since judges favour the outputs of related models [P][L][G] (DC-01). At run time no model checks the generation: canon content is served as authored in the seed, and the text the model adds is verified by deterministic rules, so that checking adds no model call to the user's wait (NFR-01). The second point is the scoring of a user's written response. The generator is not the relevant comparison there, because the text is written by a person; what matters is agreement with experts under an explicit rubric with scored examples (Section 2.5). Evidence that a panel outperforms a single judge was obtained for binary and pairwise judgments [74] and does not hold where the judges' errors are correlated [Ko]; the composition of the panel is therefore settled by measurement on the project's own tasks (Section 7.3).

**Sửa kèm trong `report.md`:**

1. §2.6, sau câu về panel judge [74]: thêm một câu về lỗi tương quan giữa các judge [Ko] (và [Mu] nếu đã đọc bản gốc).
2. §4.1.2, đoạn "content lifecycle", câu về lớp duyệt thứ hai: viết lại cho khớp D-89 (phần canon hiển thị nguyên văn; phần model viết được kiểm bằng luật; kiểm bằng model làm trên mẫu và trên log).
3. Không sửa §4.1.5: câu về panel ở đó chỉ nói panel rẻ hơn, và điều này đứng vững (bài [74] ghi rẻ hơn 7 đến 8 lần). *Đính chính: ngày 7/10 mình nói cần sửa một câu ở §4.1.5; đọc lại thì không cần.*
4. Không sửa câu chữ DC-01 (là câu của cô). Nơi DC-01 có tác dụng được nêu trong §5.2.3: bộ kiểm mẫu offline và câu trả lời tổng hợp của Giai đoạn A (D-49).

**Đề xuất gửi Nam (không tự sửa):**

- FR-04 đang ghi "a keyed response option may be rephrased". Theo D-89, việc viết lại chỉ diễn ra offline trong mẫu đã duyệt.
- FR-20 ghi "rejects identical provider for both roles", còn DC-01 ghi "different model families". Provider và họ model không trùng nhau.

**Câu hỏi để lại cho phép thử tuần 42 (T0610.17):**

1. Trên câu trả lời tiếng Việt, judge nhỏ và judge lớn chênh nhau bao nhiêu QWK, và chênh đó có lớn hơn nhiễu của 30 bài không?
2. Thêm ví dụ đã chấm có kéo judge nhỏ lên nhiều hơn judge lớn không?
3. Trung vị của panel ba model có hơn thành viên tốt nhất của nó không?
4. Bật chế độ suy luận có tăng độ khớp không, và có vượt 8 giây không?

**Khoảng trống phải ghi trong báo cáo:** chưa tìm thấy nghiên cứu nào về LLM chấm rubric cho câu trả lời tiếng Việt hay cho bài tập nghề nghiệp.

### T0610.9 · Game design data · ⏳ để lại, chưa bàn xong

Nội dung đã trình bày 7/10, chưa viết thành file. Ba nhóm dữ liệu: dữ liệu thiết kế (seed), bản ghi lượt sinh, vết lượt chơi.

Chỗ lệch giữa spec v2.2 và các quyết định 1/10 (đã đối chiếu với `L3_S_INCIDENT.json`, `schema.ts`, `runs.service.ts`):

| Chỗ lệch | Spec v2.2 đang có | Cần theo quyết định |
|---|---|---|
| Fact bắt buộc | Nằm lẫn trong văn | Danh sách có mã, để kiểm NFR-15 |
| Canon event | Không đánh dấu phần nào bất biến | D-67, D-89 |
| Thang chấm | Ba mốc +2 / 0 / −1 | D-87: bốn mức, thiếu mốc +1 |
| Điểm lựa chọn | `optionGrade` một điểm, một kỹ năng | D-81, D-82 |
| Hint | `costs_ceiling`: trần 0 | D-86: giảm trọng số |
| Hết giờ | Tính −1 | D-86: không trả lời |
| Ví dụ đã chấm | Không có | §2.5: judge cần ví dụ mẫu |
| Nguồn gốc | Cấp cả kịch bản | D-63, DR-04: theo phần tử |
| Định dạng | 4 loại activity | D-80: 9 định dạng |
| Ai chấm | Một AI vừa dẫn truyện vừa phát `evidence_emitted` (KHỐI B) | DC-01, D-49: tách model dẫn truyện và judge |

Thiếu ở vết lượt chơi: thời gian trả lời đo trên thiết bị (FR-22); câu follow-up đã hỏi; điểm từng judge, phiên bản model và prompt; trạng thái chờ chấm; loại lượt chơi (DR-07). Cách "chấm bằng chạy lại" của `runs.service.ts` hết dùng được cho phần tự luận khi judge là LLM.

⏳ Chờ Phúc chốt:
1. Luật bằng chứng cho quá trình. Đề xuất: hint và follow-up được tính; thời gian, lượt đi lạc, sự kiện chỉ ghi lại.
2. Dạng sản phẩm: `docs/project-hub/assets/jobquest-game-design-data.md`, gửi Nam. Không sửa spec (T0110.12 chưa ai nhận).
3. "Chấm quá trình chơi" là chấm từng lượt rồi gộp, hay judge đọc cả hội thoại và chấm tổng thể?

### T0610.7 · Framework cho LLM judge · đang làm

**Phúc chốt 7/10:**

1. "Framework" là **thư viện phần mềm** để dựng và đánh giá LLM judge. Khảo sát từ bài báo và nguồn uy tín. 🔍 Đang khảo sát.
2. Khi các judge trong panel lệch nhau: **trả điểm trung vị ngay**, gắn cờ cho bài lệch (không cho bài chờ chấm).
3. **Một lượt gọi chấm mọi kỹ năng** của câu trả lời. Kiểm ở tuần 42 xem điểm các kỹ năng có bị kéo theo nhau không.
4. Nguyên tắc chung: mọi lập luận về cách dùng AI phải logic và có dẫn chứng khoa học.

**Phần giao thức chấm** (đã trình bày 7/10, chi tiết để dành cho §5.3.6; §5.2.3 chỉ nêu lựa chọn):

- Bốn hướng so sánh: một judge mạnh có rubric và ví dụ đã chấm; panel ba judge khác họ lấy trung vị [74]; panel trước rồi chuyển lên judge mạnh khi lệch [TE]; model chấm tinh chỉnh riêng [Pr].
- Thiết kế gốc là panel (FR-06), gộp bằng trung vị. Bài mà các judge lệch nhau quá một mức được gắn cờ và vào danh sách cho chuyên gia xem (FR-17).
- Thứ tự đầu ra của judge: trích câu của người chơi, lý do, rồi mức điểm. `quote` phải là chuỗi con của câu người chơi gõ (spec B3).
- Ví dụ đã chấm cho từng mức [Y]. Seed chưa có chỗ chứa ví dụ, nối sang T0610.9.
- Thêm bài thử chèn lệnh vào bộ thử Giai đoạn A (nối sang T0610.8).
- Judge không được biết người chơi có dùng hint hay không.

**Khảo sát thư viện** (agent khảo sát 7/10, khoảng 20 ứng viên; mình kiểm lại Inspect AI và Vercel AI SDK qua Context7) · ⏳ chờ Phúc duyệt đề xuất

Kết quả chung:

- Không thư viện nào có sẵn đúng thiết kế judge của đề tài (ba judge khác nhà cung cấp, mỗi judge một lượt gọi chấm nhiều năng lực trên thang bốn mức, gộp trung vị, gắn cờ bài lệch).
- Không thư viện nào tính QWK hay Krippendorff alpha. Dù chọn gì cũng cần `scikit-learn` (`cohen_kappa_score(weights="quadratic")`) và gói `krippendorff`.
- Phần lớn công cụ không có bài báo bình duyệt. Bằng chứng khoa học nằm ở **phương pháp** (G-Eval [58], panel [74], Prometheus [Pr], LLM-Rubric), không ở công cụ. Trong báo cáo: trích công cụ như phần mềm, trích phương pháp bằng bài báo, và chọn công cụ theo bảng tiêu chí.

Đề xuất:

| Chỗ dùng | Chọn | Lý do | Phương án đứng sau |
|---|---|---|---|
| Bộ chạy đánh giá offline (Giai đoạn A, phép thử tuần 42) | **Inspect AI** (UK AI Security Institute, MIT) cộng `scikit-learn`, `krippendorff` | Do một viện của chính phủ Anh duy trì; bản 0.3.277 ngày 6/10/2026; chạy lặp (`epochs`), nhiều model chấm trong một lượt, ghi log token; chạy hoàn toàn trên máy | promptfoo: điểm chỉ 0–1, không có thang thứ bậc. Script tự viết: minh bạch nhất nhưng phải tự làm log, thử lại, cache |
| Judge lúc chạy trong sản phẩm (NestJS) | **Không dùng framework judge.** Một module TypeScript mỏng trên Vercel AI SDK, đầu ra có cấu trúc bằng `zod`, tự tính trung vị | Các framework judge đều là Python hoặc chỉ cho một judge mỗi lần; `zod` đã có trong repo | openevals-js (LangChain): chỉ bọc prompt, thêm phụ thuộc |

Mình đã kiểm qua Context7 (mã nguồn và tài liệu chính thức):

- Inspect AI: `model_graded_qa(model=[...])` gọi `multi_scorer(...)`, bộ gộp mặc định là `"majority"`; bộ chấm dựng sẵn chỉ rút **một** điểm bằng regex, nên rubric nhiều năng lực của đề tài cần **scorer tự viết**; `Score` có `value`, `explanation`, `metadata`, và scorer trả giá trị dạng dict được đặt tên theo khoá; `Epochs` có bộ gộp `mean`, `mode`, `max`.
- Vercel AI SDK: `generateText` với `Output.object({ schema })` và `zod`; `result.usage` trả số token. Tài liệu có hướng dẫn chuyển lên bản 7.

Chưa kiểm, cần xem trước khi viết vào báo cáo:

- 🔍 Gộp trung vị giữa ba model chấm trong Inspect: agent suy ra là làm được bằng scorer tự viết, tài liệu không ghi sẵn.
- 🔍 Đầu ra có cấu trúc của Inspect (`--response-schema`) theo agent chỉ hỗ trợ OpenAI, Google, Mistral; với Anthropic phải tự phân tích văn bản.
- 🔍 Gói `krippendorff`: README ghi GPL-3.0 (chỉ ảnh hưởng khi phân phối lại), chưa xác nhận hỗ trợ mức đo thứ bậc.
- 🔍 Ngày phát hành lấy từ GitHub, chưa đối chiếu PyPI/npm.
- 🔍 Bằng chứng Inspect được dùng trong nghiên cứu: tìm thấy qua tìm kiếm, chưa mở bài: "Developing and Maintaining an Open-Source Repository of AI Evaluations: Challenges and Insights", arXiv:2507.06893 (preprint, về kho `inspect_evals` hơn 70 bài đánh giá).
- LLM-Rubric (Microsoft, ACL 2024, arXiv:2501.00274): mã nghiên cứu kèm bài báo về hiệu chỉnh điểm judge theo nhãn người. Không dùng làm công cụ, nhưng là nguồn bình duyệt cho ý "hiệu chỉnh judge theo chuyên gia". 🔍 chưa mở bài.

Ghi chú:

- Lựa chọn cho judge lúc chạy trùng với quyết định "cách gọi nhiều nhà cung cấp" của §5.2.3 (T0610.16); viết chung ở đó.
- Thêm Inspect AI hay Vercel AI SDK là thêm phụ thuộc: chỉ cài khi Phúc đồng ý, và chưa cần cho tới tuần 42.
- Các ứng viên bị loại và lý do (để đưa vào bảng so sánh): OpenAI Evals (OpenAI ghi đang ngừng sản phẩm Evals); HELM, lm-evaluation-harness (đo model theo benchmark, không phải judge theo rubric); Prometheus-eval, Verdict (không còn phát hành từ 2024–2025); DeepEval, Ragas (thang 1–5 chuẩn hoá về 0–1, một judge mỗi metric); dịch vụ đánh giá của Vertex AI, Azure, Bedrock (trả phí, khoá vào cloud).

### T0610.8, T0610.10, T0610.16 · chưa bàn

## 3. Tài liệu tham khảo mới và mức đã kiểm

Mọi lần đọc đều qua công cụ tóm tắt trang web, chưa đọc PDF. 🔍 = phải đọc bản gốc trước khi đưa con số vào báo cáo.

| Ký hiệu | Nguồn | Đã kiểm | Dùng cho |
|---|---|---|---|
| [K] | Krumdick, Lovering, Reddy, Ebner, Tanner, "No Free Labels: Limitations of LLM-as-a-Judge Without Human Grounding", arXiv:2503.05061 (preprint) | Tóm tắt khớp. 🔍 Bảng 4: kappa của GPT-4o 0,78 (câu nó trả lời đúng) và 0,30 (câu nó trả lời sai) khi không có bản đối chiếu; 0,92 và 0,83 khi có bản của chuyên gia. Agent ghi sai thành "0,78 xuống 0,14" | T0610.6 |
| [M] | Tang, Laban, Durrett, "MiniCheck: Efficient Fact-Checking of LLMs on Grounding Documents", EMNLP 2024, arXiv:2404.10774 | Bảng 2: MiniCheck-FT5 74,7; GPT-4 75,3. Bảng 3: 0,24 USD so với 107 USD. 770 triệu tham số | T0610.6 |
| [P] | Panickssery, Bowman, Feng, "LLM Evaluators Recognize and Favor Their Own Generations", arXiv:2404.13076 (agent ghi NeurIPS 2024, 🔍 chưa kiểm nơi đăng) | Tóm tắt khớp | T0610.6 |
| [L] | Li et al., "Preference Leakage: A Contamination Problem in LLM-as-a-judge", ICLR 2026, arXiv:2502.01534 | Tóm tắt khớp. 🔍 số liệu Bảng 2 | T0610.6 |
| [G] | Goel et al., "Great Models Think Alike and this Undermines AI Oversight", arXiv:2502.04313 (agent ghi ICML 2025, 🔍 chưa kiểm nơi đăng) | Tóm tắt khớp | T0610.6 |
| [Ko] | Kohli, "Nine Judges, Two Effective Votes: Correlated Errors Undermine LLM Evaluation Panels", arXiv:2605.29800 (preprint, 2026) | Tóm tắt khớp: 9 judge, 7 họ, khoảng 2 phiếu độc lập; thử trên NLI | T0610.6, T0610.7 |
| [Mu] | Mukherjee, Hamna, Bali, Sitaram, "The Geometry of LLM-as-Judge: Why Inter-LLM Consensus Is Not Human Alignment", EMNLP 2026, arXiv:2606.03043 | Tóm tắt khớp: 42 judge, 8 ngôn ngữ Ấn Độ, đạt 58–66% độ khớp của người | T0610.7 |
| [F] | Bao et al., "FaithBench", arXiv:2410.13210 (preprint) | Tóm tắt khớp. 🔍 số liệu | T0610.6 (chưa dùng) |
| [Pr] | Kim et al., "Prometheus: Inducing Fine-grained Evaluation Capability in Language Models", ICLR 2024, arXiv:2310.08491 | Tóm tắt khớp: ngang GPT-4 khi có đáp án mẫu và rubric | T0610.7 |
| [TE] | Jung, Brahman, Choi, "Trust or Escalate: LLM Judges with Provable Guarantees for Human Agreement", arXiv:2407.18370 (agent ghi ICLR 2025, 🔍 chưa kiểm nơi đăng) | Tóm tắt khớp: judge rẻ chấm trước, chuyển lên judge mạnh khi không chắc; thử trên so cặp | T0610.7 |
| [Y] | Yoshida, "Are the Reasoning Models Good at Automated Essay Scoring?", Findings of EMNLP 2025, pp. 8388–8394, doi:10.18653/v1/2025.findings-emnlp.445 | Tóm tắt khớp: o3-mini, o4-mini kém GPT-4o mini; ICC khoảng 0,7 so với 0,95; few-shot giúp nhiều hơn CoT | T0610.7 |
| [J] | Jung, Lu, Benker, Darici, "How Model Size, Temperature, and Prompt Style Affect LLM-Human Assessment Score Alignment", NCME AIME 2025, arXiv:2509.19329 | Tóm tắt khớp: cỡ model là yếu tố chính. 🔍 số ICC | T0610.7 |
| [Ma] | Mansour, Albatarni, Eltanbouly, Elsayed, "Can Large Language Models Automatically Score Proficiency of Written Essays?", LREC-COLING 2024, arXiv:2403.06149 | Tóm tắt khớp. 🔍 số QWK | T0610.7 |

Chưa kiểm, chưa dùng: Thakur et al. (arXiv:2406.12624), Lee et al. (arXiv:2601.07506), Zhao et al. (arXiv:2406.08598), Jayarao et al. (arXiv:2509.13332), Hardy (arXiv:2603.04820), Zha et al. AlignScore (arXiv:2305.16739), Laban et al. (arXiv:2305.14540), Nguyen et al. ViHallu (arXiv:2601.04711), Kang et al. (arXiv:2402.10496), Fu & Liu (arXiv:2505.12201), Doğruöz et al. (arXiv:2607.02235).

## 4. Câu hỏi còn mở cho Phúc

1. Nguyên văn lời cô (nếu là nhận xét buổi 3/10) cho "game design data", "framework", "AI sập".
2. Bảng "Hiện trạng tại 30/9" trong `00-tong-quan.md` đã cũ; cập nhật cùng lúc với hub cuối tuần.
3. Các câu ở mục T0610.9.
