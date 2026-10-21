# Hệ gợi ý nghề và cách kiểm định (Q4a–Q4d, Q5b)

Ghi chú nghiên cứu, 18/10/2026. Nhãn xác minh: **toàn văn** (đã đọc bài), **tóm tắt** (đọc abstract/trang bài), **thứ cấp** (nguồn khác thuật lại), **trang chính thức**, **chưa xác nhận**.

## Q4a. Hệ gợi ý việc làm / nghề nghiệp

- **Tổng quan job recommender 2011–2021**: phần lớn là hybrid nhưng ít bài mô tả rõ hybrid gì; lựa chọn phương pháp bị chi phối bởi dữ liệu có sẵn (nhất là click data); hiếm bài kiểm tra trên nhiều tập dữ liệu; fairness ít được bàn. Review này tập trung vào thị trường lao động (ứng viên ↔ tin tuyển dụng), **không** đo hiệu quả hướng nghiệp (khám phá nghề, self-efficacy).
  Nguồn: de Ruijt & Bhulai (2021), *Job Recommender Systems: A Review*, arXiv:2111.13576. https://arxiv.org/abs/2111.13576 — **tóm tắt** (preprint, không ghi venue).

## Q4b. Giải thích trong hệ gợi ý

- **Bảy mục tiêu của lời giải thích**: effectiveness, satisfaction, transparency, scrutability, trust, persuasiveness, efficiency; các mục tiêu có thể xung đột nên phải nói rõ đo mục tiêu nào. Bốn thí nghiệm (phim, máy ảnh): cá nhân hoá lời giải thích dựa trên đặc trưng **làm giảm** effectiveness dù có thể tăng satisfaction. Bài phân tích riêng tác động của việc người dùng **đánh giá quá cao / quá thấp** món được gợi ý trước khi thử (over/underestimation) khi đo effectiveness — tức là lời giải thích "thuyết phục" chưa chắc là lời giải thích "giúp quyết định đúng".
  Nguồn: Tintarev & Masthoff (2012), UMUAI 22(4–5):399–439. DOI 10.1007/s11257-011-9117-5 — **tóm tắt**.
- **Review hệ thống về giải thích**: phân loại thiết kế giải thích theo mục tiêu, khả năng phản hồi, nội dung, cách trình bày; chỉ ra việc đánh giá giải thích còn yếu.
  Nguồn: Nunes & Jannach (2017), UMUAI 27(3–5):393–444. DOI 10.1007/s11257-017-9195-0 (preprint arXiv:2006.08672) — **tóm tắt**.
- **So sánh 10 kiểu giải thích** trong một user study: giải thích dựa trên nội dung (tag cloud theo đặc trưng món) tăng rõ *cảm nhận minh bạch* và hài lòng, nhưng tốn công đọc hơn. → Ủng hộ kiểu "vì bạn làm tốt / thích X" (feature-based) hơn kiểu chỉ đưa con số.
  Nguồn: Gedikli, Jannach & Ge (2014), *IJHCS* 72(4):367–382. DOI 10.1016/j.ijhcs.2013.12.007 — **tóm tắt**.
- **ResQue (mô hình SEM, n=239)**: có giải thích → tăng cảm nhận minh bạch (β=0,22); minh bạch → tin tưởng (β=0,14); tính mới (β=0,17) và đa dạng (β=0,14) đều góp vào cảm nhận hữu ích, dù yếu hơn độ chính xác (β=0,57). → Giải thích và tính mới có tác dụng, nhưng gợi ý phải trước hết *hợp lý* với người chơi.
  Nguồn: Pu, Chen & Hu (2011), RecSys '11, tr. 157–164. https://www.comp.hkbu.edu.hk/~lichen/download/p157-pu.pdf — **toàn văn**.
- **Herlocker, Konstan & Riedl (2000)**, CSCW '00 — thử 21 giao diện giải thích cho collaborative filtering. Chi tiết kết quả **chưa xác nhận** (chưa đọc bài) → không dẫn.

### Về "điểm % phù hợp"

- **Không tìm thấy** thí nghiệm trực tiếp cho thấy hiển thị "% match" gây tin quá mức trong hệ gợi ý nghề. Lý lẽ chống % dựa trên hai nguồn gián tiếp:
  1. **Hướng dẫn chính thức O\*NET Interest Profiler** (Bộ Lao động Mỹ, v3.0): kết quả chỉ dùng cho *khám phá và tư vấn nghề*; "mối quan hệ giữa kết quả Interest Profiler và thành công trong một nghề cụ thể **chưa được xác định**"; khuyến khích người dùng kết hợp thông tin khác khi ra quyết định. → Một con số "92% hợp" ngụ ý độ chắc chắn mà chính nhà phát triển dữ liệu nguồn không tuyên bố.
     Nguồn: Lewis & Rivkin, *O\*NET Interest Profiler User's Guide* v3.0, U.S. DOL/ETA. https://www.govinfo.gov/content/pkg/GOVPUB-L37-PURL-LPS12364/pdf/GOVPUB-L37-PURL-LPS12364.pdf — **toàn văn**, **trang chính thức**.
  2. **Độ phù hợp sở thích–nghề chỉ dự báo kết quả ở mức khiêm tốn**: các meta-analysis về congruence và hài lòng/hiệu suất công việc cho tương quan nhỏ và không thống nhất giữa các nghiên cứu (Nye, Su, Rounds & Drasgow 2012, *Perspectives on Psychological Science* 7(4):384–403, DOI 10.1177/1745691612449021 — **tóm tắt**: 60 nghiên cứu, n=15.301; con số tương quan cụ thể **chưa xác nhận**, chưa đọc toàn văn). → Không nên biến congruence thành phần trăm.

## Q4a (tiếp). Can thiệp hướng nghiệp nói chung

- **Meta-analysis can thiệp chọn nghề** (nhân rộng và mở rộng các meta-analysis trước): hiệu ứng lớn hơn với kết quả *career decision self-efficacy*; các yếu tố then chốt được nêu là hỗ trợ của tư vấn viên, làm rõ giá trị, can thiệp tâm lý–giáo dục. Bản 2003 của cùng nhóm cho thấy can thiệp qua máy tính hiệu quả hơn khi có người hướng dẫn đi kèm. Chưa đọc được số effect size cụ thể → không dẫn số.
  Nguồn: Whiston, Li, Goodrich Mitts & Wright (2017), *J. Vocational Behavior* 100:175–184. DOI 10.1016/j.jvb.2017.03.010 — **thứ cấp** (abstract bị chặn; thông tin từ tổng hợp của CDI và các bài trích dẫn).
- **Công cụ tự đánh giá RIASEC như một can thiệp (review 2026)** — nguồn gần JobQuest nhất: dùng công cụ tự-giúp *đáng tin nhất* ở kết quả gần (tăng hành vi khám phá nghề và **số nghề được cân nhắc**: Behrens & Nauta 2014; Dozier et al. 2015); kết quả xa (bản sắc nghề nghiệp, CDSE) **không nhất quán** (Luzzo & Day 1999 không thấy tăng CDSE ở nhóm tự-giúp); thêm một buổi phản hồi ngắn với người thật cho hiệu ứng mạnh hơn. Bằng chứng cũ, chủ yếu sinh viên Mỹ, mẫu nhỏ, thiên về đo hài lòng. Đây là *narrative review*, không phải systematic review.
  Nguồn: Wong, Quek & Yang (2026), "RIASEC self-assessment tools as career interventions: theory and effectiveness", *Frontiers in Organizational Psychology*. DOI 10.3389/forgp.2026.1792707. https://www.frontiersin.org/journals/organizational-psychology/articles/10.3389/forgp.2026.1792707/full — **toàn văn** (đọc ~60% đầu qua công cụ; các bài gốc bên trong là **thứ cấp**).
- **Chưa tìm thấy** nghiên cứu có đánh giá đàng hoàng (RCT/quasi) về *hệ gợi ý nghề bằng thuật toán* cho học sinh đo career exploration hoặc CDSE. Các nghiên cứu gần nhất là app tư vấn nghề (ví dụ một nghiên cứu tiền thực nghiệm 30 học sinh, 6 tuần, Indonesia, Springer *Discover Education* 2025, https://link.springer.com/article/10.1007/s44202-025-00468-8 — **tóm tắt qua kết quả tìm kiếm**, thiết kế yếu: không có nhóm đối chứng). → JobQuest **không nên tuyên bố** hệ gợi ý "giúp chọn nghề tốt hơn"; chỉ nên nói nó *gợi ý thêm lựa chọn để thử*.

## Q4c. Đa dạng, bất ngờ, khám phá

- **Topic diversification**: đa dạng hoá danh sách gợi ý theo chủ đề làm *giảm độ chính xác* offline nhưng *tăng mức hài lòng* của người dùng với cả danh sách; khảo sát online >2.100 người (sách, BookCrossing). Đề xuất thước đo intra-list similarity.
  Nguồn: Ziegler, McNee, Konstan & Lausen (2005), WWW '05, tr. 22–32. DOI 10.1145/1060745.1060754 — **tóm tắt**.
- **Tổng quan beyond-accuracy**: định nghĩa và thước đo cho diversity, serendipity, novelty, coverage; thí nghiệm offline cho thấy các mục tiêu này tương quan với nhau và đánh đổi với accuracy; có chiến lược re-ranking cho từng mục tiêu.
  Nguồn: Kaminskas & Bridge (2016/2017), *ACM TiiS* 7(1), Art. 2. DOI 10.1145/2926720 — **tóm tắt**.
- **Circumscription & compromise (Gottfredson)**: trẻ loại dần nghề theo giới tính (6–8 tuổi) rồi theo uy tín (9–13), sau 14 tuổi theo sở thích; các lựa chọn sớm "có xu hướng cố định trừ khi bị thách thức". Gợi ý can thiệp: *tối ưu trải nghiệm bằng nhiều hoạt động nghề đa dạng để thử*, ngăn hoặc đảo ngược việc loại nghề không phù hợp.
  Nguồn: Gottfredson (2005), mục từ "Circumscription and compromise", *Encyclopedia of Career Development* (bản tác giả). https://www1.udel.edu/educ/gottfredson/reprints/2004CCCentry.htm — **toàn văn** (bản reprint của tác giả). Bài gốc: Gottfredson (1981), *J. Counseling Psychology* 28(6):545–579 — chưa đọc.
- **Mô hình PIC (Gati)**: quyết định nghề gồm sàng lọc sơ bộ (thu hẹp từ tập lớn xuống tập nhỏ "có triển vọng"), khám phá sâu, rồi chọn. (Lời cảnh báo "đừng loại lựa chọn quá vội" chỉ thấy trong một tài liệu tư vấn tiếng Đức diễn giải PIC, vs.ch — **thứ cấp**.) Không tìm thấy con số cố định cho kích thước tập triển vọng → không dẫn số.
  Nguồn: Gati & Asher (2001), *Career Development Quarterly*. https://cris.huji.ac.il/en/publications/prescreening-in-depth-exploration-and-choice-from-decision-theory/ — **tóm tắt**.

## Q4d. Cold start và trộn self-report với bằng chứng hành vi

- **Người dùng mới**: so sánh 6 chiến lược chọn món để hỏi người dùng mới (theo độ phổ biến, theo entropy/thông tin, cân bằng hai cái, cá nhân hoá); thử offline và live với >300 người. Cách chọn ảnh hưởng đáng kể tới *công sức người dùng* và *độ chính xác* gợi ý. → Lúc đầu nên hỏi ít câu nhưng "đáng tiền" (phân biệt được nhiều nhóm sở thích).
  Nguồn: Rashid et al. (2002), "Getting to Know You", IUI '02, tr. 127–134. DOI 10.1145/502716.502737. PDF: https://files.grouplens.org/papers/voi-final.pdf — **tóm tắt**.
- **Tổng quan active learning cho cold start**: hệ chủ động chọn món để người dùng mới đánh giá nhằm học sở thích nhanh.
  Nguồn: Elahi, Ricci & Rubens (2016), *Computer Science Review* 20:29–50. DOI 10.1016/j.cosrev.2016.05.002 — **thứ cấp** (chỉ thấy trích dẫn và slide tác giả).
- **Explicit vs implicit feedback**: hai loại khác nhau về công sức nhận thức, thang đo, mức liên quan tới miền; nên coi là hai nguồn bổ sung, không thay thế nhau.
  Nguồn: Jawaheer, Weller & Kostkova (2014), *ACM TiiS* 4(2), Art. 8. DOI 10.1145/2512208. Bản mở: https://discovery.ucl.ac.uk/id/eprint/10088708/ — **tóm tắt**.
- **Sở thích nghề ở tuổi teen còn kém ổn định**: meta-analysis các nghiên cứu dọc cho thấy độ ổn định sở thích gần như đi ngang suốt tuổi vị thành niên, tăng mạnh ở 18–21,9 tuổi, rồi ổn định. → Self-report RIASEC của người chơi 13–17 tuổi chỉ nên là *điểm xuất phát*, cần cho bằng chứng hành vi trong game dần thay thế.
  Nguồn: Low, Yoon, Roberts & Rounds (2005), *Psychological Bulletin* 131:713–737. PubMed 16187855 — **tóm tắt** (qua bản tóm tắt PubMed do công cụ tìm kiếm trích; hệ số cụ thể chưa đọc → không dẫn số).
- Cách trộn cụ thể (trọng số self-report giảm dần theo số level đã chơi, kiểu "shrinkage" về prior) là **suy luận thiết kế** của nhóm nghiên cứu này, không có nguồn trực tiếp cho miền nghề nghiệp.

## Q5b. Kiểm định hệ gợi ý trong dự án nhỏ

- **Khung đánh giá lấy người dùng làm trung tâm**: nối khía cạnh khách quan của hệ (thuật toán, giao diện) → cảm nhận (chất lượng, đa dạng) → trải nghiệm (công sức, hữu ích, hài lòng lựa chọn) → hành vi; kiểm chứng qua 4 field trial + 2 thí nghiệm. Cảm nhận chất lượng và **đa dạng** là trung gian giữa thuật toán và trải nghiệm.
  Nguồn: Knijnenburg, Willemsen, Gantner, Soncu & Newell (2012), UMUAI 22:441–504. DOI 10.1007/s11257-011-9118-4 — **tóm tắt**.
- **Bảng hỏi ResQue**: bản đầy đủ 32 câu / 15 cấu trúc (độ chính xác, tính mới, đa dạng, giải thích, minh bạch, hữu ích, tin tưởng, ý định dùng lại…); **bản ngắn 15 câu = mỗi cấu trúc một câu**, hợp với buổi thử ngắn. Mẫu kiểm chứng 239 người; tác giả dùng quy tắc ≥5 người/câu hỏi cho phân tích nhân tố.
  Nguồn: Pu, Chen & Hu (2011), RecSys '11 — **toàn văn** (link ở Q4b).
- **Thước đo hướng nghiệp**:
  - CDSE-SF (25 câu): Betz, Klein & Taylor (1996), *J. Career Assessment* 4(1):47–57 — **thứ cấp** (trích dẫn; được một systematic review ghi là công cụ dùng nhiều nhất cho học sinh THPT, https://journal.upy.ac.id/index.php/bk/article/view/5584 — **tóm tắt qua kết quả tìm kiếm**). Bản **tiếng Việt** 23 câu/5 nhân tố trên 314 SV năm nhất Y Cần Thơ: Phan & Leksansern (2021), *J. Education and Health Promotion*, https://doaj.org/article/788c2211e1d94fce8f38fae8a902c8ee — **tóm tắt**; mới có EFA, chưa có CFA, chưa thử ở học sinh 13–17.
  - Khảo sát CDSE trên 714 học sinh THPT miền Nam: Lê Duy Hùng và cs. (2025), *Tạp chí Giáo dục* 25(SĐB 4):322–327, https://tcgd.tapchigiaoduc.edu.vn/index.php/tapchi/article/view/3753 — **tóm tắt** (không rõ dùng thang nào). Phát hiện: điểm yếu nhất là *kỹ năng lập kế hoạch*.
  - Career Exploration Survey (CES): Stumpf, Colarelli & Hartman (1983), *J. Vocational Behavior* 22(2):191–226, DOI 10.1016/0001-8791(83)90028-3 — **thứ cấp**; có thang Self-Exploration và Environmental Exploration, có bản chỉnh cho vị thành niên (Blustein); có thể cần xin phép bản quyền.
  - **Cảnh báo**: theo review Wong et al. (2026), công cụ tự-giúp dùng một mình thường **không** làm tăng CDSE rõ rệt; kết quả gần (số nghề được cân nhắc, hành vi khám phá) nhạy hơn. → Một buổi chơi 30–60 phút khó làm đổi CDSE; nên đo CDSE như biến mô tả, không như kết quả chính.
- **Cỡ mẫu trong HCI**: phân tích toàn bộ bài CHI 2014: cỡ mẫu từ 1 đến 916.000, **thường gặp nhất là 12**, khác nhau theo bối cảnh và phương pháp.
  Nguồn: Caine (2016), CHI '16, tr. 981–992. DOI 10.1145/2858036.2858498 — **tóm tắt**. (Đây là thông lệ, không phải căn cứ thống kê.)
- **Tính toán power chuẩn** (không phải từ nguồn trên): t-test ghép cặp hai phía, α=0,05, power 0,8, hiệu ứng trung bình d=0,5 → cần **≈34 người**; d=0,8 → ≈15 người. Đã kiểm bằng phân phối t không trung tâm (scipy); có thể đối chiếu G*Power khi đưa vào báo cáo.

## Đề xuất cho JobQuest

### 1. Quy tắc chọn 3 gợi ý (sau mỗi level hoàn thành)

1. **Tập ứng viên** = nghề có dữ liệu O\*NET, trừ nghề đã chơi và nghề đã gợi ý ở 2 lần gần nhất (tránh lặp).
2. **Điểm phù hợp nội bộ** = w_I·tương đồng RIASEC (cosine giữa hồ sơ người chơi và hồ sơ sở thích O\*NET) + w_S·khớp soft skill đã đạt hạng + w_H·trùng từ khoá hard skill. Điểm này **chỉ dùng để xếp hạng nội bộ, không bao giờ hiển thị** (O\*NET tự nói mối liên hệ kết quả sở thích ↔ thành công nghề "chưa được xác định").
3. **Ô 1 – cùng lĩnh vực**: nghề điểm cao nhất trong lĩnh vực vừa chơi.
4. **Ô 2 – lĩnh vực khác**: nghề điểm cao nhất ở một lĩnh vực khác lĩnh vực vừa chơi (ưu tiên lĩnh vực đã ghé nhưng chưa chơi hết, nếu có).
5. **Ô 3 – hướng mới**: chọn trong các lĩnh vực **chưa ghé**; lấy nghề có điểm cao nhất ở đó, nhưng (a) phải khác mã RIASEC chính của ô 1 và ô 2 khi có thể (đa dạng hoá kiểu Ziegler 2005), (b) chỉ cần vượt một ngưỡng tối thiểu chứ không cần cao nhất toàn cục, (c) xoay vòng lĩnh vực để mọi lĩnh vực đều có lúc xuất hiện. Căn cứ: đa dạng hoá tăng hài lòng dù giảm accuracy (Ziegler 2005); tính mới góp vào cảm nhận hữu ích (Pu 2011); tuổi teen dễ loại nghề sớm theo giới/uy tín nên cần cho thử đa dạng (Gottfredson).
6. **Không dùng giới tính, uy tín/thu nhập của nghề** làm đặc trưng xếp hạng — tránh tái tạo circumscription. Kiểm offline: cùng hồ sơ kỹ năng, đổi giới tính hiển thị → gợi ý phải y hệt.

### 2. Quy tắc lời giải thích (một dòng)

- **Dựa trên đặc trưng, có bằng chứng cụ thể từ ván chơi**: "Ở level Điều dưỡng bạn bình tĩnh xử lý khách khó chịu — nghề này cũng cần điều đó." (feature-based tăng minh bạch: Gedikli 2014; giải thích → minh bạch → tin tưởng: Pu 2011).
- **Ghi rõ nguồn**: "bạn đã làm tốt…" (hành vi) khác "bạn nói bạn thích…" (tự khai). Khi chỉ có tự khai thì nói thật là tự khai.
- **Ô 3 nói thẳng là khám phá**: "Một hướng bạn chưa thử: … — thử xem bạn có thích không." Không nói "hợp với bạn".
- **Cấm**: phần trăm, "hợp nhất", "bạn nên", "dành cho bạn", xếp hạng 1-2-3 kiểu huy chương, mã RIASEC/thuật ngữ. Dùng "có thể thử", "giống ở chỗ…".
- Mục tiêu giải thích là **effectiveness/transparency, không phải persuasiveness** (Tintarev & Masthoff 2012) — đánh giá bằng việc người chơi hiểu lý do, không bằng việc họ bấm nhiều.

### 3. Cold start và trộn dữ liệu

- **Trước level đầu**: nếu có bài tự khai RIASEC ngắn → dùng làm prior. Nếu bỏ qua → đưa 3 nghề thuộc 3 nhóm RIASEC khác xa nhau (mẫu đa dạng) thay vì chỉ nghề phổ biến (phổ biến dễ kéo về nghề "quen", ngược mục tiêu mở rộng — *suy luận*, có hậu thuẫn gián tiếp từ Rashid 2002 về việc chọn câu hỏi phân biệt tốt).
- **Sau mỗi level**: trọng số bằng chứng hành vi w_B = n/(n+k), n = số level đã xong, k là tham số chỉnh (gợi ý k=3: sau 3 level, hành vi và tự khai nặng ngang nhau). Đây là **lựa chọn thiết kế, không có nguồn trực tiếp**; lý do định hướng: sở thích tuổi teen chưa ổn định (Low et al. 2005), explicit và implicit là hai nguồn bổ sung (Jawaheer 2014).
- Không bao giờ "khoá" hồ sơ: luôn giữ ô 3 để hồ sơ sai lúc đầu vẫn có đường sửa.

### 4. Kế hoạch kiểm định nhóm chạy được

| Giai đoạn | Cách làm | Đo gì | Ngưỡng/ghi chú |
|---|---|---|---|
| A. Offline (không cần người) | 20–30 persona giả lập (mỗi nhóm RIASEC chủ đạo × vài mức kỹ năng), chạy chuỗi 5 level | coverage (% nghề từng được gợi ý), intra-list diversity của bộ 3, % ô 3 thật sự thuộc lĩnh vực chưa ghé, tỉ lệ lặp, test đổi giới tính | Ô 3 đúng luật 100%; đổi giới tính không đổi kết quả; so với baseline ngẫu nhiên: ô 1 phải có tương đồng RIASEC cao hơn |
| B. Chuyên gia | 2–3 giáo viên hướng nghiệp/tư vấn viên chấm 10–15 persona: mỗi gợi ý "hợp lý?" và lời giải thích "đúng & dễ hiểu?" (Likert 1–5) | điểm trung bình, độ đồng thuận giữa người chấm | Sửa mẫu câu giải thích bị chấm thấp |
| C. Thử với học sinh | Một nhóm, trước–sau, ~15–35 học sinh (thông lệ CHI; 34 người cho d=0,5); có đồng ý của phụ huynh với người <18 | Log: tỉ lệ bấm từng ô, đặc biệt **ô 3**; số lĩnh vực khác nhau đã ghé. Trước/sau: **số nghề muốn tìm hiểu thêm** (kết quả gần, nhạy nhất theo Wong 2026). Sau: ResQue bản ngắn (hữu ích, minh bạch, tính mới, đa dạng, tin tưởng), 1 câu "bạn có hiểu vì sao nghề này được gợi ý không?" | CDSE-SF tiếng Việt chỉ đo mô tả; **không tuyên bố hiệu quả nhân quả** khi không có nhóm đối chứng |
| D. (Tuỳ chọn) A/B nhỏ | Trong cùng người chơi: một nửa số lần gợi ý có lời giải thích, một nửa không (đảo thứ tự) | tỉ lệ bấm, câu hỏi hiểu lý do | Chỉ làm nếu C chạy trơn tru |

- Báo cáo nên nói rõ: chưa có nghiên cứu nào chứng minh hệ gợi ý nghề bằng thuật toán làm tăng CDSE ở học sinh; JobQuest đo **khám phá** (độ rộng, sự sẵn lòng thử), không đo "chọn đúng nghề".
