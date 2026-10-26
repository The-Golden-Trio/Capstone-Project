# Plan sửa slide phần AI · tuần 42 (CHƯA LÀM GÌ)

> Soạn 11/10/2026. Căn cứ: deck Phúc đã trình cô (`JobQuest_AI_Deck_W41.pdf`, 16 slide) và bốn góp ý của cô sau buổi đó.
> File này chỉ là plan. Chưa có slide nào bị sửa.
> **12/10:** tuần 41 đã chốt: nội dung deck đã trình được viết vào báo cáo §5.2.3 và hub (D-89…D-97) **theo đúng lập luận đã trình**, kể cả các điểm cô góp ý; riêng trích dẫn đã lược 10 nguồn. Những chỗ phải sửa ở tuần 42 nằm ở mục 3 và mục 7.

## 1. Căn cứ

**Deck đã trình là bản gốc để sửa**, không phải plan slide dài hơn mình soạn hôm 9/10. So với plan đó, Phúc đã tự cắt:

- Slide 3: bỏ phần "điểm yếu đã biết" và "khoảng trống".
- Slide 6: bỏ một nguồn, còn hai.
- Slide 8: chỉ giữ hai ý; hai ý còn lại chuyển sang slide 9.
- Slide 10: bỏ phần benchmark, chỉ còn framework.
- Slide 14: chỉ hỏi cô một câu (hạn mức miễn phí mỗi ngày).

**Góp ý của cô tuần này** (theo ghi chú Phúc dán lại):

1. Ý thứ hai ở slide 8, dựa vào bài của Yoshida, còn gây tranh cãi.
2. Phần "LLM judge có đáng tin không" phải làm kỹ lại.
3. Giải thích rõ hơn phần AI-native, nhất là "core loop".
4. Tham khảo sáu tiêu chí của một sản phẩm AI-native: critical path, agentic mediation, retrieval value, feedback capture, một tiêu chí về intent (ghi chú bị lỗi chữ: "learn intend-cruiting"), supervised autonomy.

**Góp ý của Phúc:** mình trích dẫn nhiều hơn mức cần, có chỗ thừa.

## 2. Nguyên tắc trích dẫn từ nay

- Chỉ trích ở chỗ cô có thể hỏi "căn cứ đâu". Quyết định thiết kế của nhóm không cần nguồn.
- Mỗi nhận định một nguồn mạnh nhất; mỗi slide nhiều nhất hai nguồn.
- Ưu tiên nguồn đã bình duyệt. Preprint chỉ dùng khi không có nguồn thay thế, và ghi rõ là preprint.
- Con số chỉ lên slide khi chính con số đó mang lập luận.
- Nguồn nào chưa đọc từ bản gốc thì chưa lên slide.
- Phần còn lại để trong ghi chú người trình bày hoặc phụ lục, không lên slide.

## 3. Sửa theo từng góp ý của cô

### 3.1. Slide 8 · bỏ ý dựa vào Yoshida

- **Bỏ** dòng "Not necessarily a reasoning model" và nguồn Yoshida (2025). Lý do cô nêu là còn tranh cãi; nhìn lại thì đó là một nghiên cứu, hai model, một bộ bài luận, không đủ để khái quát.
- Câu hỏi "bật suy luận có giúp judge chấm tốt hơn không" chuyển thành một câu hỏi của phép thử, không trích nguồn.
- Sau khi bỏ, slide 8 còn: câu trả lời, một lý do, cách quyết định. Mình đề xuất lý do duy nhất là "judge phải đủ hiểu việc mới áp được rubric", trích một nguồn đã bình duyệt (JudgeBench, ICLR 2025). Ý "model nhỏ khớp kém với người" (Jung et al.) chuyển về slide 9, nơi nói về độ tin cậy.
- **Chỗ khác cũng phải gỡ ý này:** `plan-chot_2026-W41.md` và báo cáo nghiên cứu đều đang viết "model suy luận không an toàn hơn".

### 3.2. Slide 9 · làm lại phần "LLM judge có đáng tin không"

Slide hiện có tám gạch đầu dòng và bảy nguồn, trộn nhiều ý khác loại. Con số duy nhất là của ChatGPT và Llama đời 2023, nên lập luận yếu. Plan làm lại:

1. **Tách "đáng tin" thành ba câu hỏi rõ ràng:**
   - Chấm lại cùng một bài có ra cùng điểm không (độ nhất quán).
   - Điểm có khớp với người chấm không (độ khớp với chuyên gia).
   - Có thiên lệch có hệ thống không.
2. **Đọc bản gốc** của các nguồn sẽ dùng. Từ trước tới giờ mình mới đọc qua tóm tắt.
3. **Lập một bảng bằng chứng gọn**, bốn tới năm dòng, mỗi dòng một nghiên cứu: bài toán, đời model, chỉ số, mức LLM với người, mức người với người. Ứng viên cho bảng:
   - Henkel et al. (L@S 2024), đã có trong báo cáo [102]: chấm câu trả lời ngắn, gần bài toán của mình nhất.
   - Bài tổng hợp 65 nghiên cứu [101] (preprint).
   - Jung et al. (NCME AIME 2025): model nhỏ so với model lớn.
   - Schleifer et al. (BEA 2026): yếu ở bài đúng một phần.
   - Một nguồn về độ nhất quán. Hiện có hai nguồn nói ngược nhau: Hackl et al. [105] thấy rất nhất quán, Haldar & Hockenmaier (EMNLP 2025) thấy kém nhất quán. Phải đọc cả hai để biết khác nhau ở đâu rồi mới chọn.
4. **Tìm thêm bằng chứng dùng model đời 2025–2026** cho chấm theo rubric. Nếu không có thì nói thẳng là không có.
5. **Kết bằng cách nhóm sẽ tự chứng minh**, viết cụ thể hơn một dòng "RP-2": dữ liệu nào, ai chấm, chỉ số nào, ngưỡng nào.
6. **Chuyển ra khỏi slide 9** các ý không thuộc câu hỏi này: thiên vị model cùng họ (đã có ở slide 12).

Nếu nội dung không vừa một slide, mình đề xuất hai slide: một cho bằng chứng đã công bố, một cho cách nhóm kiểm định. Phần kiểm định chính là phần benchmark Phúc đã cắt; ⏳ Phúc quyết có đưa lại không.

### 3.3. Slide 11 · giải thích "core loop"

- Thêm một sơ đồ vòng lặp cốt lõi của JobQuest: người chơi trả lời tự do → AI viết lời dẫn và câu hỏi tiếp khớp với câu trả lời đó → người chơi trả lời tiếp → AI chấm theo rubric → điểm kỹ năng → tình huống kế.
- Mỗi bước ghi: AI làm gì, và nếu bỏ AI thì bước đó ra sao.
- Định nghĩa thuật ngữ "core loop" bằng một nguồn về thiết kế game. 🔍 Mình chưa có nguồn này trong tay.
- Tách slide 11 làm hai: một slide "AI-native là gì và JobQuest đạt thế nào", một slide "khi nhà cung cấp lỗi".
- Số liệu sự cố API (Chu et al.) mình chưa đọc bản gốc; ⏳ bỏ khỏi slide cho tới khi đọc, hoặc bỏ hẳn nếu Phúc thấy thừa.

### 3.4. Sáu tiêu chí của sản phẩm AI-native

- **Việc đầu tiên: xác định đúng nguồn cô nhắc tới.** Mình đã tìm thử hai lượt với các cụm từ trong ghi chú và không thấy tài liệu nào dùng đủ sáu cụm đó. Có vài bài viết dùng từng cụm riêng lẻ ("critical path", "supervised autonomy"), nhưng mình không xác nhận được đó là nguồn của cô. ❓ Phúc có link, ảnh slide hoặc tên tác giả cô đưa không? Nếu không, nên hỏi lại cô.
- **Khi có nguồn:** đọc định nghĩa của từng tiêu chí, rồi lập bảng sáu dòng: tiêu chí, định nghĩa theo nguồn, JobQuest đáp ứng ở thành phần nào, mức đáp ứng (đạt, đạt một phần, chưa có).
- **Phán đoán sơ bộ của mình, chưa có căn cứ từ nguồn:** JobQuest có vẻ khớp rõ ở critical path (AI-4 và AI-5 nằm trên mọi lượt chơi), feedback capture (phán quyết của DE quay lại rubric) và supervised autonomy (DE duyệt, engine giới hạn). Tiêu chí retrieval value có thể chỉ đạt một phần, vì thiết kế không dùng truy xuất. Bảng thật phải chờ đọc nguồn.
- **Bộ sáu tiêu chí này thay cho hai nguồn neo hiện tại** (preprint về game và white paper của Ericsson) làm khung chính, vì cô là người đề xuất. Hai nguồn cũ rút khỏi slide.

## 4. Cắt trích dẫn ở các slide còn lại

Đề xuất cho từng slide của deck đã trình; ⏳ Phúc duyệt mức cắt.

| Slide | Hiện có | Đề xuất |
|---|---|---|
| 3 · AI-1 | 4 nguồn | Giữ Flanagan (phương pháp) và Chopra & Haaland (bằng chứng); bỏ Whetzel, Xiao |
| 4 · AI-2 | 3 nguồn | Bỏ Klang (đề thi y khoa, xa bài toán); giữ một nguồn cho evidence-centered design |
| 5 · AI-3 | 5 nguồn | Giữ quy tắc "số ba" cho mẫu ngẫu nhiên (sau khi đọc bản gốc); bỏ phần người chơi giả lập cùng hai nguồn của nó, hoặc rút còn một câu không số |
| 6 · AI-4 | 2 nguồn | Giữ Riedl & Bulitko; bỏ Li et al. |
| 7 · AI-5 | 4 nguồn | Giữ Peng (vì sao chia theo tình huống) và Kim (vì sao panel); bỏ Yu, Haldar |
| 10 · Framework | 2 nguồn | Bỏ câu về bài báo của phương pháp; công cụ không cần trích |
| 12 · Model | 1 nguồn và bảng giá | Giữ; đọc lại giá của bốn hãng trước khi dùng |
| 15, 16 · Tài liệu tham khảo | 37 mục | Còn một slide, khoảng 12 tới 15 mục |

## 5. Thứ tự làm

1. Phúc trả lời các câu ở mục 6.
2. Tìm và đọc nguồn sáu tiêu chí (3.4); tìm nguồn cho "core loop" (3.3).
3. Đọc bản gốc các nguồn cho bảng bằng chứng của slide 9 (3.2).
4. Viết lại chữ trên các slide bị đổi (8, 9, 11, tài liệu tham khảo) và bản cắt của các slide còn lại, đưa Phúc duyệt.
5. Sau khi duyệt mới dựng lại deck.
6. Cập nhật `plan-chot_2026-W41.md` cho khớp: bỏ ý Yoshida, đổi khung AI-native. Báo cáo và hub vẫn chưa đụng tới cho tới khi Phúc bảo áp dụng.

## 6. Cần Phúc trả lời

1. **Nguồn sáu tiêu chí:** cô có đưa link, tên bài hay tên tác giả không?
2. **Slide 9:** một slide hay hai (bằng chứng, và cách nhóm kiểm định)?
3. **Mức cắt trích dẫn** ở mục 4 có đúng ý không, hay cắt mạnh hơn?
4. ~~File nguồn của deck đã trình nằm ở đâu?~~ Đã có: `docs/project-hub/slides/JobQuest_AI_Deck_W41.html` (và bản PDF cùng thư mục).
5. **Cô đã trả lời gì cho câu hỏi về hạn mức miễn phí mỗi ngày,** và cô còn nói gì khác ngoài bốn ý trên không? Nếu có thì mình ghi biên bản buổi 10/10 vào hub luôn khi Phúc cho phép.

## 7. Việc phải sửa trong báo cáo và hub, ghi lại khi chốt tuần 41 (12/10)

Báo cáo §5.2.3 đang lưu **lập luận đã trình cô 10/10**, đã lược bớt trích dẫn (mục 7.3). Các mục dưới đây chưa sửa, để tuần 42.

### 7.1. Theo góp ý của cô (sửa cả deck lẫn §5.2.3)

| Chỗ trong §5.2.3 | Việc phải làm | Mục plan |
|---|---|---|
| Đoạn "Strength of the judge relative to the generator": câu về reasoning model, nguồn Yoshida [126] | Bỏ câu và bỏ nguồn; chuyển thành một câu hỏi của phép thử | 3.1 |
| Đoạn "Reliability of a language-model judge" | Viết lại theo ba câu hỏi (nhất quán, khớp với chuyên gia, thiên lệch), sau khi đọc bản gốc các nguồn | 3.2 |
| Đoạn "AI-native character and provider failure" | Giải thích core loop bằng sơ đồ; đối chiếu sáu tiêu chí cô nêu (chưa tìm ra nguồn) | 3.3, 3.4 |

### 7.2. Con số và nguồn chưa đọc từ bản gốc

Các con số này đã lên deck và đã vào báo cáo. Phải đọc bản gốc; sai thì sửa, không xác minh được thì bỏ.

- Chu et al. (số liệu sự cố của nhà cung cấp): **đã bỏ khỏi báo cáo 12/10** vì phần tóm tắt của bài không có các số này. Deck vẫn còn; tuần 42 đọc bản gốc rồi quyết định giữ hay gỡ khỏi deck.
- Ericsson [133]: câu định nghĩa AI-native mình diễn đạt lại, chưa đối chiếu nguyên văn.
- SEA-HELM [134]: điểm tiếng Việt lấy từ bảng xếp hạng ngày 18/9; vài dòng là của model đời trước, không phải model sẽ thử.
- Giá model [135]: mới đối chiếu kỹ giá của Anthropic; giá của OpenAI, Google, DeepSeek, Alibaba phải mở lại trang giá.
- Hanley & Lippman-Hand [119]: tên đồng tác giả và số trang ghi theo trí nhớ, chưa đối chiếu.
- Ước chi phí một lượt chơi (0,015 và 0,086 USD) dựa trên số token giả định, chưa đo. Báo cáo chưa ghi số token giả định là bao nhiêu, nên người đọc không tính lại được: phải ghi rõ hoặc bỏ con số.
- Bảng model: giá của Sonnet và `gpt-6.1-sol` trùng nhau (2 / 10), giá của Haiku và `gpt-6-luna` cũng trùng (0,10 / 0,50). Có thể là trùng thật, nhưng phải mở lại trang giá để chắc.
- [114] (Cohen 1960) có trong danh mục nhưng thân `report.md` không trích; chỉ `ch5.tex` trích ở một use case của Nam. Hoặc trích ở NFR-14, hoặc bỏ khi đổi sang QWK (07 A20).

### 7.3. Trích dẫn

- Đã lược 10 nguồn so với deck đã trình (12/10): Wu et al. (không có trên deck); Xiao, Shankar, Lu & Wang, Yu, Haldar & Hockenmaier, Goel, Li D. (trùng ý với nguồn khác hoặc chỉ đỡ cho quyết định của nhóm); ITU-R (không đỡ cho lập luận nào); Chu et al. (số chưa xác minh). Deck chưa sửa theo, nên deck và báo cáo đang lệch nhau ở 10 nguồn này.
- §5.2.3 còn 21 nguồn mới ([115]–[135]). Đoạn độ tin cậy và đoạn AI-native sẽ cắt tiếp khi viết lại theo mục 3.
- Hai file `plan-chot_2026-W41.md` và `research/` còn giữ đủ các nguồn đã cắt; không đưa lại vào báo cáo nếu chưa đọc bản gốc.

### 7.4. Chỗ lệch với phần của Nam và Nhật (hub 07 A20)

Chín điểm lệch giữa §5.2.3 và yêu cầu, use case hiện có đã ghi ở `07-van-de-mo.md` dòng A20. Cần ngồi với Nam để chốt bên nào sửa: phương án thay thế khi AI lỗi (FR-12, FR-14, NFR-15, use case Perform scenario); ai soạn scenario (FR-22, FR-23); đáp án mẫu (FR-24); Cohen's kappa hay QWK (NFR-14); 8 giây mỗi câu hay chấm nền (NFR-02); một hay hai ngôn ngữ (NFR-08); "khác provider" hay "khác họ model" (FR-42); hint (FR-13 so với D-86); §4.1.2 và §4.2.1 theo thiết kế cũ.

Ngoài ra:

- UR-S04 còn chữ "minors" (phần của Nam), trong khi phần luật độ tuổi đã bỏ khỏi báo cáo (D-97).
- Mã yêu cầu trong `plan-chot_2026-W41.md` mục D (FR-15, UC-07, FR-20…) là mã **cũ**, trước khi Nam đánh số lại. Dùng mã ở 07 A20.
- 5.2.1 Frontend và 5.2.2 Backend trong báo cáo mới là hai tiêu đề giữ chỗ, mỗi mục một câu (cần có để 5.2.3 đúng số). Nhật viết thì thay vào.
- `latex/chapters/ch5.tex` và `latex/main.tex` đã được sửa tay (56 khối use case). **Không chạy `md2tex.py` đè lên cả thư mục**: sinh ra thư mục tạm rồi ghép từng phần.

### 7.5. Việc chuyển tiếp

- T0610.5 (BR-17): chờ Nam trả lời "vị trí" là vị trí trong bảng tổ chức hay cả vai trò hệ thống.
- T0610.9 (game design data): chờ game design.
- T0610.17 (phép thử đầu tiên): hỏi Phúc trước khi gọi model trả tiền hoặc cài Inspect AI.
- So sánh AI-native với các hệ thống ở §3.2 (07 B2) chưa làm lại.
