# Thang chấm câu trả lời và chỉ số độ khó nghề

Ngày: 2026-10-22. Phạm vi: (Q1) thang chấm cho câu trả lời tự do do giám khảo LLM chấm theo rubric, gắn với tiểu mục kỹ năng mềm; (Q2) chỉ số độ khó nghề tính được từ O*NET 31.0 và cách đổi thành hệ số điểm.

Nhãn kiểm chứng: "toàn văn" (đã đọc bản đầy đủ hoặc đúng phần liên quan trong bản đầy đủ), "tóm tắt" (chỉ đọc abstract/trang tóm tắt), "thứ cấp" (qua nguồn khác trích lại), "trang chính thức", "chưa xác nhận". Mục "tự tính" là số nhóm tự tính trên dữ liệu cục bộ, không phải số trong tài liệu.

## Q1. Thang chấm

### a) Điểm âm cho phản hồi phản tác dụng: nguồn gốc

1. **SJT chấm theo khoá chuyên gia (best/worst).** Chuyên gia chọn phương án tốt nhất và tệ nhất; các phương án khác 0. OPM (Mỹ): "Scores are based on subject matter experts' judgments of the best and worst alternatives." https://opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/situational-judgment-tests — trang chính thức (không nêu giá trị điểm cụ thể). Định dạng gốc "most likely / least likely": Motowidlo, Dunnette & Carter (1990), JAP 75(6), 640–647, DOI 10.1037/0021-9010.75.6.640 — thứ cấp. Quy ước +1 chọn đúng / −1 chọn ngược khoá thấy ở tài liệu luyện thi thương mại — chưa xác nhận trong nguồn học thuật.
2. **Không có đồng thuận về cách chấm SJT; cách chấm làm đổi thứ hạng, độ tin cậy.** Bergman, Drasgow, Donovan, Henning & Juraska (2006), IJSA 14(3), 223–235 — tóm tắt (dựng 11 khoá chấm cho một SJT video).
3. **Định dạng "rate" (chấm hiệu quả từng phương án)** cho độ nhất quán nội tại và test–retest cao hơn "rank" và "most/least", ít tương quan với GMA hơn, nhưng dễ bị bóp méo câu trả lời hơn. Arthur, Glaze, Jarrett, White, Schurig & Taylor (2014), JAP 99, 535–545, DOI 10.1037/a0035788; N = 31 194 ứng viên + 492 sinh viên — tóm tắt.
4. **Chấm đồng thuận thô gắn với xu hướng chọn cực trị**, validity thấp; điều chỉnh "elevation và scatter" tăng validity và giảm chênh lệch nhóm. McDaniel, Psotka, Legree, Yost & Weekley (2011), JAP 96(2), 327–336 — tóm tắt.
5. **BARS** (Smith & Kendall 1963, JAP 47(2), 149–155, DOI 10.1037/h0047060): các mức được neo bằng ví dụ hành vi từ kém hiệu quả đến hiệu quả; hành vi tệ nằm ở **đầu thấp của thang dương**, không phải điểm âm — thứ cấp.
6. **Chấm câu trả lời tự do quy mô lớn (PISA):** Code 2 = full credit, Code 1 = partial credit, Code 0 = "có cố gắng trả lời nhưng không thành công", Code 9 = không trả lời. Lý do dùng "credit" thay cho đúng/sai: "some questions do not have 'correct' answers". Không có mã âm. Manitoba Education, PISA Sample Reading Item Marking Keys, https://www.edu.gov.mb.ca/k12/assess/pdfs/pisa_marking_key.pdf — toàn văn (tài liệu chính thức của cơ quan giáo dục, trích khoá chấm PISA).
7. **Thang lệch −1…+2:** không tìm thấy nguồn học thuật nào dùng cho một hành vi. Một SJT lãnh đạo Hàn Quốc dùng −2…+2 (đối xứng): https://accesson.kr/ksiop/v.22/1/53/19668 — thứ cấp. Kết luận: −1/0/+1 đến từ khoá best/worst của SJT (chấm **lựa chọn**, không chấm mức độ); 0/1/2 đến từ tín chỉ một phần (PISA). Thang −1…+2 của nhóm là ghép hai truyền thống này, chưa có tiền lệ được kiểm định.
8. **Điểm trừ (negative marking) trong trắc nghiệm** bất lợi cho người né rủi ro, có thể đưa thiên lệch vào điểm: Lesage, Valcke & Sabbe (2013), Studies in Educational Evaluation — thứ cấp (chỉ thấy trích lại).

### b) Số mức của thang

1. **Thang tự đánh giá (người trả lời tự chọn):** mô phỏng Monte Carlo, 2–9 phương án; độ tin cậy và validity tăng theo số phương án, tối ưu "between four and seven", dưới 4 kém. Lozano, García-Cueto & Muñiz (2008), Methodology 4(2), 73–79, DOI 10.1027/1614-2241.4.2.73 — tóm tắt.
2. Preston & Colman (2000), Acta Psychologica 104(1), 1–15, DOI 10.1016/S0001-6918(99)00050-5: 149 người, thang 2–11 điểm và 101 điểm; thang 2–4 điểm kém, tăng đến khoảng 7; test–retest giảm khi trên 10 mức — thứ cấp.
3. **Lưu ý quan trọng:** hai nghiên cứu trên đo thang **người trả lời tự chọn**, gom nhiều mục Likert. JobQuest là **người chấm (LLM) áp rubric lên một hành vi trong một tình huống** — khác bản chất; không nên dùng chúng để biện hộ cho số mức. Độ tin cậy của JobQuest đến chủ yếu từ **số lần quan sát** (nhiều câu, nhiều kịch bản), không từ thang mịn hơn.
4. Jonsson & Svingby (2007), "The use of scoring rubrics: Reliability, validity and educational consequences", Educational Research Review 2(2), 130–144, DOI 10.1016/j.edurev.2007.05.002 — chưa xác nhận (chưa đọc được abstract; không dùng số liệu nào từ bài này).

### c) LLM làm giám khảo: độ mịn của thang

1. **Li, Zhao và cs. (2026)**, "Grading Scale Impact on LLM-as-a-Judge: Human-LLM Alignment Is Highest on 0-5 Grading Scale", arXiv 2601.03444 (preprint, chưa thấy phản biện) — toàn văn (bản HTML). 6 giám khảo LLM (GPT-4o, Gemini-2.5-Flash, Llama-3.3-70B, Qwen3-32B, DeepSeek-v3.2, Mistral-7B), 6 benchmark, 12 người chấm, 150 mục. ICC(A,1) người–LLM gộp: **0–5 = 0,853; 0–10 = 0,805; 0–100 = 0,840**. Trên tác vụ chủ quan, độ tin cậy giữa các LLM thấp: MT-Bench 0,632, SummEval 0,573 (người: 0,899 và 0,930). Không phổ quát: MT-Bench tốt hơn ở 0–10 (0,570 so với 0,517). Hạn chế: phần lớn prompt không có neo mô tả từng mức.
2. **CheckEval** — Lee, Kim, Kim, Cho, Kang, Kang & Kim (2025), EMNLP 2025, tr. 15771–15798, https://aclanthology.org/2025.emnlp-main.796.pdf — toàn văn (trang 1–2). Tách tiêu chí thành câu hỏi có/không thay cho Likert 1–5; 12 mô hình giám khảo; **tăng đồng thuận trung bình giữa các mô hình giám khảo thêm 0,45** và giảm phương sai điểm, vẫn tương quan mạnh với người. Tác giả quy độ bất nhất cho "subjective evaluation criteria combined with Likert scale scoring".
3. **Prometheus** — Kim và cs. (ICLR 2024), arXiv 2310.08491: chấm 1–5 theo rubric có mô tả từng mức; Pearson với người 0,897 trên 45 rubric tự tạo (GPT-4: 0,882) — tóm tắt. Prometheus 2 (EMNLP 2024, arXiv 2405.01535): chấm theo tiêu chí người dùng định nghĩa — tóm tắt (abstract không ghi số).
4. **G-Eval** — Liu và cs. (2023), arXiv 2303.16634: GPT-4 + chain-of-thought + điền form, Spearman 0,514 với người trên tóm tắt văn bản; LLM có thể thiên vị văn bản do LLM viết — tóm tắt.
5. Tổng hợp: bằng chứng 2023–2026 nghiêng về **thang thô, có neo mô tả, hoặc tách thành câu hỏi có/không**; không có bằng chứng thang mịn (0–100) giúp ích cho chấm theo rubric.

### d) Gộp mức thành phần trăm điểm tối đa

1. **POMP** (percent of maximum possible): POMP = 100 × (điểm − min) / (max − min). Cohen, Cohen, Aiken & West (1999), "The Problem of Units and the Circumstance for POMP", Multivariate Behavioral Research 34(3), 315–346, DOI 10.1207/S15327906MBR3403_2 — tóm tắt (metadata Crossref; nội dung công thức qua nguồn thứ cấp). Ánh xạ hiện tại của nhóm (+2 → 100%, +1 → 50%, 0 → 0) chính là POMP trên dải 0…2; mức −1 nằm **ngoài** dải này nên "phạt" là quy tắc riêng, không còn là POMP.
2. **Rủi ro khi lấy trung bình mức thứ bậc:** coi dữ liệu thứ bậc là số đo khoảng có thể gây dương tính giả, bỏ sót hiệu ứng, thậm chí đảo thứ tự trung bình nhóm; "averaging across multiple ordinal measurements does not solve or even ameliorate these problems". Liddell & Kruschke (2018), J. Experimental Social Psychology 79, 328–348, DOI 10.1016/j.jesp.2018.08.009 — tóm tắt. Hệ quả cho JobQuest: trung bình mức là chấp nhận được cho điểm **trò chơi** (quy ước minh bạch), nhưng không nên diễn giải như số đo năng lực có khoảng đều, và không nên để −1 bị "bù" bởi +2 trong trung bình.

## Q2. Độ khó nghề

1. **Job Zone là thước đo độ phức tạp đã dùng trong nghiên cứu.** Le, Oh, Robbins, Ilies, Holland & Westrick (2011), JAP 96(1), 113–133, DOI 10.1037/a0021016 — toàn văn (phần Method, Study 2): dùng O*NET Job Zone làm job complexity; Job Zone dẫn xuất từ SVP; SVP tương quan **0,93** với "substantive complexity" của DOT và **0,92** với chiều Data của DOT (trích Roos & Treiman 1980). Ở Study 1, mã hoá nhị phân thấp/cao, đồng thuận người mã 92%.
2. **Cách gán Job Zone (chính thức).** National Center for O*NET Development (2022), Procedures for O*NET Job Zone Classification, https://www.onetcenter.org/dl_files/JobZoneProcedureUpdate.pdf — trang chính thức, toàn văn. Dải SVP: JZ1 < 4,0; JZ2 4,0–<6,0; JZ3 6,0–<7,0; JZ4 7,0–<8,0; JZ5 ≥ 8,0. Hai chuyên viên gán độc lập, bất đồng do chuyên viên cấp cao xem lại.
3. **Độ phức tạp điều tiết validity của năng lực nhận thức (Hunter).** Hunter & Hunter (1984): validity vận hành 0,56 / 0,50 / 0,39 cho nghề phức tạp cao / trung bình / thấp; Salgado & Moscoso (2019), Frontiers in Psychology 10:2227 (https://pmc.ncbi.nlm.nih.gov/articles/PMC6811658/) — toàn văn (phần liên quan): hiệu năng công việc 0,50 / 0,44 / 0,32; huấn luyện 0,62 / 0,58 / 0,55; mã độ phức tạp theo chiều Data/Things của DOT (Data 0–1 = cao, 2–4 = trung bình, 5–6 = thấp). Bằng chứng này ủng hộ **thứ tự** (nghề nào khó hơn), không cho tỷ lệ điểm.
4. **ISCO-08 skill level 1–4** (ILO): bậc kỹ năng = độ phức tạp và phạm vi nhiệm vụ, đo qua bản chất công việc, giáo dục chính quy (ISCED) và đào tạo/kinh nghiệm; áp ở cấp nhóm lớn. https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/ — trang chính thức (tóm tắt). Quá thô (4 bậc, gán theo nhóm lớn) để phân biệt 221 nghề.
5. **Phát hiện trên dữ liệu cục bộ O*NET 31.0 (tự tính, `occupation-data/external/onet_31_0/`):**
   - `job_zones.csv`: 923 nghề, **không có nghề JZ1** (JZ2 = 337, JZ3 = 208, JZ4 = 226, JZ5 = 152); ví dụ Dishwashers, Cashiers đều JZ2. Job Zone thực tế chỉ còn 4 bậc, 37% nghề dồn ở JZ2 → quá thô làm hệ số liên tục.
   - Chỉ số **S = trung bình Level của 35 kỹ năng (essential + transferable), trọng số (Importance − 1)/4**: tương quan với Job Zone Pearson **0,833**, Spearman **0,852** (n = 910). Không trọng số chỉ 0,624. Knowledge có trọng số: 0,720.
   - Trung bình S theo JZ: 2,46 / 2,92 / 3,36 / 3,62 (JZ2→JZ5). Phân bố S: min 1,55, p5 2,08, p25 2,56, trung vị 2,98, p75 3,42, p95 3,77, max 4,41. Thấp nhất: Packers and Packagers, Hand; cao nhất: Chief Executives, Preventive Medicine Physicians, Physicists — hợp lý về mặt bề mặt.
   - Work Context "Consequence of Error" tương quan với JZ **−0,131**, với S −0,020; "Impact of Decisions…" 0,116 / 0,279. Đây là **rủi ro**, không phải độ phức tạp; không nên trộn vào chỉ số độ khó.
6. **Chống "cày" bằng mô hình kỹ năng–độ khó.** Elo cho hệ thống học thích ứng: coi mỗi câu trả lời là một "trận" giữa người học và câu hỏi, ước lượng đồng thời năng lực và độ khó; điểm nhận được tỷ lệ với (kết quả − xác suất kỳ vọng), nên làm câu dễ hơn trình độ cho rất ít điểm. Pelánek (2016), Computers & Education, DOI 10.1016/j.compedu.2016.03.017 — tóm tắt.

## Đề xuất cho JobQuest

### Thang cho từng tiểu mục: tách −1 ra khỏi thang chất lượng

Giữ 4 kết quả nhưng **đổi cấu trúc**: thang chất lượng **0 / 1 / 2** cộng **cờ phản tác dụng** riêng, và thêm trạng thái **"không quan sát được"**.

| Kết quả | Khi nào | Tính điểm |
|---|---|---|
| N/A | Câu trả lời không tạo cơ hội thể hiện tiểu mục | Loại khỏi mẫu số (như Code 9 của PISA), không tính 0 |
| 0 | Có cơ hội nhưng không đạt | 0% |
| 1 | Đạt | 50% |
| 2 | Vượt | 100% |
| Cờ ⚑ | Hành vi gây hại/phản tác dụng | Tiểu mục bị tính 0 **và** trừ cố định ở cấp nhóm (xem dưới) |

Lý do:
- −1…+2 chưa có tiền lệ được kiểm định; −1/0/+1 của SJT chấm **lựa chọn** trong danh sách, 0/1/2 (PISA) chấm **mức độ** của câu trả lời tự do — JobQuest giống trường hợp sau.
- Khi gộp trung bình, một +2 bù một −1 thành +0,5 (25%), làm hành vi gây hại "biến mất". Tách cờ giữ được tín hiệu đó (Liddell & Kruschke: trung bình không sửa được vấn đề thứ bậc).
- Phân biệt N/A với 0 tránh phạt người chơi vì câu hỏi không gợi ra tiểu mục.
- Cho giám khảo LLM: mỗi mức nên là **câu hỏi có/không có neo hành vi** ("Câu trả lời có làm X?" → đạt; "Có làm thêm Y?" → vượt; "Có làm Z gây hại?" → cờ). Code ráp thành mức. Đây là hướng CheckEval (+0,45 đồng thuận giữa giám khảo) và khớp với kết quả thang thô 0–5 tốt nhất.

### Số mức

3 mức chất lượng + 1 cờ là đủ cho **một hành vi trong một tình huống**. Bằng chứng "4–7 mức" (Lozano; Preston & Colman) áp cho thang tự đánh giá, không áp cho người chấm theo rubric. Muốn điểm đáng tin hơn thì tăng **số lần quan sát** mỗi tiểu mục qua nhiều câu, nhiều kịch bản, không làm thang mịn hơn. Kiểm định: cho 2–3 người chấm 50–100 câu trả lời thật, báo cáo kappa có trọng số hoặc ICC giữa người–LLM và giữa các lần chạy LLM.

### Gộp mỗi kịch bản

Với nhóm g trong kịch bản s, chỉ lấy tiểu mục không N/A:
- POMP_g = trung bình(mức) / 2 (0…1). Đây là POMP, đúng ánh xạ cũ cho các mức 0/1/2.
- Điểm_g = cap_g,s × max(0, POMP_g − 0,25 × số cờ trong nhóm). Mức trừ 0,25 mỗi cờ là **tham số thiết kế**, chỉnh qua playtest. Sàn 0 cho từng nhóm trong kịch bản để một lỗi không xoá điểm các nhóm khác.
- Lưu riêng số cờ để hiển thị phản hồi ("Bạn đã …") thay vì chỉ trừ điểm âm thầm.
- Nếu không có tiểu mục nào của nhóm được quan sát: không cộng, không trừ, và không tính vào mẫu số tiến độ của nhóm đó.

### Chỉ số độ khó và hệ số

- **Chỉ số:** S = trung bình Level của 35 kỹ năng O*NET (essential + transferable), trọng số (Importance − 1)/4. Lý do: liên tục, tính được cho mọi nghề có dữ liệu, tương quan 0,83 với Job Zone (thước đo độ phức tạp đã dùng trong nghiên cứu: Le và cs. 2011), trong khi Job Zone trong 31.0 chỉ còn 4 bậc. Job Zone giữ lại để giải thích cho người chơi ("cần chuẩn bị nhiều").
- **Chuẩn hoá:** D = (S − p5) / (p95 − p5), kẹp vào 0…1, với p5/p95 tính trên 221 nghề của game (trên toàn O*NET: p5 = 2,08, p95 = 3,77).
- **Hệ số:** k = 1 + D (dải 1,0–2,0). Ngân sách điểm mỗi kịch bản = cap gốc × k. Bằng chứng chỉ đảm bảo **thứ tự** khó/dễ; độ rộng 1–2 là quyết định thiết kế, chỉnh qua playtest.
- **Chống cày:** (1) Mở cấp của một nghề chỉ dựa trên **POMP của chính nghề đó** (tỷ lệ % đạt được trên tối đa của nghề), không dùng điểm từ nghề khác; khi đó k không làm nghề khó "khó mở" hơn, chỉ làm nó **đáng giá hơn** ở bảng tổng/chòm sao. (2) Nếu có cấp người chơi toàn cục cần cổng mở nghề khó, điểm từ nghề nguồn chỉ được tính với hệ số min(1, k_nguồn / k_đích). (3) Khi có dữ liệu chơi thật, thay độ khó lý thuyết của **kịch bản** bằng độ khó ước lượng kiểu Elo (Pelánek 2016), để làm lại kịch bản đã thành thạo cho rất ít điểm.
- **Không** đưa "Consequence of Error" vào chỉ số độ khó (gần như không tương quan với Job Zone); nếu cần, dùng nó để gắn nhãn "rủi ro cao" cho kịch bản, không nhân điểm.
