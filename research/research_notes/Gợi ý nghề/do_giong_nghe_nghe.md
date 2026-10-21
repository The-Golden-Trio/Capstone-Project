# Độ giống nghề–nghề (occupation–occupation similarity) cho JobQuest

Ghi chú nghiên cứu, 2026-10-18. Nhãn kiểm chứng: **toàn văn** (đã đọc bản đầy đủ), **tóm tắt** (chỉ đọc abstract/trang giới thiệu), **thứ cấp** (qua nguồn khác trích lại), **trang chính thức** (trang O*NET/ESCO), **chưa xác nhận**.

## Q2a. O*NET xây "Related Occupations" (2022+) như thế nào

Nguồn chính: Dahlke, J. A., Putka, D. J., Shewach, O., & Lewis, P. (2022, 12/4). *Developing Related Occupations for the O\*NET Program*. HumRRO 2022 No. 036, cho National Center for O*NET Development. https://www.onetcenter.org/reports/Related_2022.html — PDF https://www.onetcenter.org/dl_files/Related_2022.pdf — **toàn văn** (đã đọc tr. 1–29).

- **Bối cảnh:** trước đó có 2 ma trận cũ: *Career Changers* (kỹ năng + kinh nghiệm tương tự, chuyển việc ít cần đào tạo thêm) và *Career Starters* (năng lực chung + sở thích tương tự), tối đa 10 nghề/nghề, chỉ phủ 777/923 nghề, dựa nhiều vào điểm level/importance của skills, knowledge, abilities, work styles, interests (Allen et al., 2012). Ma trận mới thay cả hai bằng **một ma trận duy nhất**, phủ đủ **923** nghề data-level (O*NET-SOC 2019).
- **Triết lý:** liên quan = "giống về công việc thực làm" (tasks, DWA) vì dễ hiểu với người dùng và hợp chuẩn chuyển giao hiệu lực (validity transport). Cuối cùng gồm 3 thành phần: người ta **làm gì** (task + DWA), **biết gì** (knowledge), **được gọi là gì** (alternate titles).
- **Pha 1 – độ đo dựa trên công việc (WB-OSM):** 30 độ đo: 12 từ task, 12 từ DWA, 6 từ mô tả nghề. Mỗi câu → vector (TF, TF-IDF, GloVe, GloVe TF-IDF, SBERT `nli-distilroberta-base-v2`, USE-DAN); similarity nghề = **trung bình cosine trên mọi cặp task** giữa 2 nghề (có bản trọng số theo importance). Chỉ dùng core task.
  - Thử angular distance thay cosine: **không cải thiện**, nên chỉ báo cosine (chú thích 4).
  - Kiểm định bằng **5 tiêu chí ngoài** (criterion): (1) KSA distance composite = z(Euclid knowledge)+z(Euclid skills)+z(Euclid abilities) — dùng khoảng cách vì *mức* (elevation) KSA có ý nghĩa (độ phức tạp nghề); (2) shape (Pearson r) hồ sơ RIASEC; (3) shape work values; (4) shape work styles; (5) |chênh lệch lương trung vị|. Với sở thích/values/styles chỉ dùng **shape (tương quan)** vì mức chung không có ý nghĩa lý thuyết. 5 tiêu chí khá độc lập (|r| TB = .31).
  - Kết quả: TF kém nhất, TF-IDF kế tiếp; GloVe/SBERT/USE ngang nhau → chọn SBERT. **Trọng số theo importance không thêm gì** (ΔR² ≈ 0). DWA thêm chút so với task (ΔR² TB ≈ .02–.04); mô tả nghề không thêm.
- **Pha 2 – sửa composite:** composite chỉ task+DWA hỏng ở **nghề giảng dạy và quản lý**: giáo viên ĐH môn Sinh gợi toàn giáo viên môn khác (Biologists xếp hạng 163/922) vì task/DWA dạy học giống nhau, khác chủ đề. Thêm: cosine hồ sơ importance **33 knowledge**, cosine embedding **alternate titles** (GloVe + TF-IDF tính trong từng job family).
  - Công thức cuối: `Relatedness = Z( (Z[WBOSM_task&DWA] + Z[cos_knowledge] + Z[cos_alt_titles]) / 3 )`, z-chuẩn hoá trên toàn bộ 851.006 cặp có thứ tự; trọng số **bằng nhau**.
  - Rà soát có cấu trúc 60 nghề (50 ngẫu nhiên phân tầng theo job family + job zone, 5 điểm thấp, 5 điểm cao): chỉ đổi **35/600 = 5,8%** nghề top-10; thay thế thường do **khác job zone**. Thứ hạng quan trọng hơn độ lớn điểm.
- **Pha 3 – ngưỡng "bookmark":** 425.503 cặp; lấy 20 cặp/percentile từ percentile 60 trở lên (800 cặp); 5 tiến sĩ I/O psychology đánh giá nhị phân "có liên quan" và dừng khi hết thấy liên quan. Điểm dừng 89–95 percentile, trung vị 93 → **ngưỡng z = 1,61649** (đáy percentile 93).
- **Pha 4 – ma trận cuối (O*NET 26.1 → phát hành 26.3):** top-25 + quan hệ cha-con/anh-em trong taxonomy gửi chuyên viên Center rà. Trong 9.230 nghề top-10, đổi **1.272 (13,78%)**, ở 579/923 nghề; 37,27% nghề không đổi gì; chỉ **5** bị loại hẳn, 1.267 bị **giáng xuống "supplemental"**.
- **Pha 5 – đánh giá:** 93% nghề primary vượt ngưỡng; 81,58% nghề có cả 10 primary vượt ngưỡng (Career Changers cũ: 67%, Career Starters: 49%). So primary vs. 912 nghề còn lại theo Cohen's d trung bình: tương quan RIASEC **d = 1,38**; skills 1,12; abilities 1,10; work styles 0,96; work values 0,90; |Δ job zone| −0,95; |Δ lương| −0,66. Tương quan hồ sơ trung bình primary vs non-primary: skills .87 vs .62; abilities .89 vs .68; **interest .79 vs .16**; work styles .71 vs .49; work values .60 vs .11. Tỷ lệ giảm phương sai (VRR) TB .62–.87.
  - Hàm ý cho JobQuest: hồ sơ skills/abilities của mọi nghề **tương quan cao sẵn** (.62 với nghề ngẫu nhiên) → tương quan thô ít phân biệt; RIASEC phân biệt mạnh nhất (.16 vs .79).

### Định dạng file Related Occupations (trang chính thức)
Nguồn: https://www.onetcenter.org/dictionary/30.0/excel/related_occupations.html — **trang chính thức**.
- Cột: `O*NET-SOC Code`, `Title`, `Related O*NET-SOC Code`, `Related Title`, `Relatedness Tier`, `Index`.
- Tier: **Primary-Short** = 5 nghề liên quan mạnh nhất sau rà soát chuyên gia; **Primary-Long** = hạng 6–10; **Supplemental** = hạng 11–20. Mỗi nghề có đúng **20** nghề liên quan (10 primary + 10 supplemental). `Index` = thứ tự sau rà soát chuyên gia (1–20). Bản 30.0: 18.460 dòng.
- Kèm "Related Occupations Research Dataset" (điểm relatedness định lượng cho mọi cặp 923×922) tải ở trang báo cáo 2022.
- Có memo cập nhật: Dahlke & Harris (5/2/2024) cho O*NET 28.0 — https://www.onetcenter.org/dl_files/Related_2024.pdf; memo 17/11/2025 cho O*NET 30.0 — https://www.onetcenter.org/dl_files/Related_2025.pdf (**thứ cấp**, chỉ thấy qua kết quả tìm kiếm).

### Cập nhật 2025 (O*NET 30.0 → phát hành 30.1)
Nguồn: Harris, J. L., & Dahlke, J. A. (17/11/2025). *Updates to Related Occupations for the O\*NET Program Using the O\*NET 30.0 Database: Technical Memorandum*. HumRRO 2025 No. 127. https://www.onetcenter.org/dl_files/Related_2025.pdf — **toàn văn** (tr. 1–8).
- Giữ nguyên phương pháp 2022. Công thức có chuẩn (norm) cố định từ O*NET 28.0:
  `Relatedness = ( ((WBOSM−0.302)/0.063 + (cos_JT−0.182)/0.173 + (cos_KIP−0.924)/0.035) / 3 + 0.002 ) / 0.842`
  (WBOSM = TB của cosine-SBERT task và cosine-SBERT DWA; JT = job titles; KIP = knowledge importance profile; nếu thiếu knowledge thì chia 2).
- **Quan sát quan trọng cho Q2c:** cosine hồ sơ importance knowledge có **TB 0,924, SD 0,035** giữa mọi cặp nghề → cosine thô trên điểm importance (thang 1–5, luôn dương) gần như hằng số; chỉ dùng được sau khi z-chuẩn hoá trên phân phối cặp (hoặc phải centering trước).
- Rà soát: 635 nghề có top-10 thay đổi so với lần trước → chuyên viên Center xem worksheet (10 primary hiện tại + 15 "alternate" = quan hệ cấu trúc taxonomy hoặc điểm cao kế tiếp). Đổi 190/6.350 primary (2,99%) ở 149 nghề. Primary có thể tự di chuyển giữa Short/Long theo điểm thực nghiệm; Supplemental làm mới cho mọi nghề. Có danh sách "do not display".
- **Research Dataset** (codebook bảng A-2) có thêm cột: `Work-Based Occupational Similarity`, `Knowledge Cosine`, `Job Titles Cosine`, `Relatedness Score`, `Empirical Relatedness Rank`; Tier có thêm `N/A = Not categorized`. → JobQuest có thể tải về làm **baseline 923×922** để so sánh.
- Hàm ý: Related Occupations của O*NET **không** dùng RIASEC, Work Activities (GWA), Work Styles, Skills — chỉ task/DWA (văn bản), knowledge, job titles. Nên nếu JobQuest tính similarity từ RIASEC/WA/Skills/Knowledge thì so với O*NET RO là kiểm định **gần độc lập** (chỉ trùng phần knowledge).

## Q2b. Khoảng cách kỹ năng/task trong kinh tế lao động

### Gathmann & Schönberg (2010) — angular separation
Gathmann, C., & Schönberg, U. (2010). How general is human capital? A task-based approach. *Journal of Labor Economics*, 28(1), 1–49. https://doi.org/10.1086/649786 — **toàn văn** bản working paper 8/2008 (https://doku.iab.de/fdz/events/2008/Gathmann.pdf); số liệu bản tạp chí có thể khác.
- Dữ liệu: khảo sát BIBB/IAB (Đức), mỗi nghề = vector 19 chiều, q_oj = tỷ lệ lao động trong nghề o làm task j. Mobility từ hồ sơ an sinh xã hội Đức 1975–2001 (>100.000 người, 63 nghề).
- Độ đo: **angular separation = cosine không trung tâm (uncentered correlation)** của 2 vector; khoảng cách = 1 − cos (0–1). Lý do chọn hơn Euclid: không nhạy với độ dài vector (nghề dùng mọi task ở mức vừa vẫn có thể giống nhau). Lấy từ văn liệu "technological proximity" của Jaffe (1986).
- Kiểm chứng: so phân phối khoảng cách của **bước chuyển thực tế** với **chuyển ngẫu nhiên tỷ lệ theo quy mô nghề** → chuyển thực tế gần hơn rõ rệt (KS test p<1%). Khoảng cách TB giữa các nghề 0,24 (SD 0,22). Kinh nghiệm tăng → bước chuyển gần hơn (người học vấn cao: 10 năm làm giảm 0,16 ≈ 70% SD). Task-specific human capital giải thích ≥40% tăng lương 10 năm của người có bằng ĐH (bản tạp chí: "up to 52%" — **tóm tắt**).
- Dùng 3 nhóm task gộp (analytic/manual/interactive) cho kết quả tương tự → kết luận không nhạy với độ mịn.
- **Không** so sánh cosine với Euclid/correlation về khả năng dự đoán; chỉ lập luận.

### Dawson, Williams & Rizoiu (2021) — Skills Space + RCA
Dawson, N., Williams, M.-A., & Rizoiu, M.-A. (2021). Skill-driven recommendations for job transition pathways. *PLOS ONE*, 16(8), e0254722. https://doi.org/10.1371/journal.pone.0254722 — **toàn văn** (qua WebFetch, phương trình là ảnh nên chỉ thấy mô tả).
- 8 triệu tin tuyển dụng Úc (Burning Glass, 2012–2020); **RCA** đo độ quan trọng kỹ năng trong tin (giảm khi kỹ năng phổ biến khắp nơi — tức là đã "trừ phần chung"); kỹ năng "hiệu dụng" khi RCA ≥ 1; θ(s1,s2) = đồng xuất hiện có điều kiện (theo Alabdulkareem et al. 2018) — đo **bổ trợ**, không phải thay thế; Θ(nghề A, nghề B) = TB có trọng số (theo RCA) của θ giữa các cặp kỹ năng. Θ đối xứng; bất đối xứng đến từ đặc trưng khác (học vấn, kinh nghiệm, lương).
- Ground truth: 2.999 chuyển nghề trong khảo sát HILDA (2012–2018); âm tính = cùng nghề nguồn + nghề đích ngẫu nhiên (cân bằng 5.998). XGBoost.
- Kết quả: accuracy **76%** (mọi đặc trưng), **73% chỉ với khoảng cách Skills Space**, 74% chỉ cung–cầu lao động. Bỏ Skills Space làm giảm nhiều nhất.
- Hạn chế (nhận xét của mình): âm tính ngẫu nhiên là phép thử dễ; không so với cosine/O*NET/Jaccard → **không** chứng minh RCA hơn cosine.

### Mealy, del Rio-Chanona & Farmer (2018) — so sánh 21 độ đo O*NET với chuyển nghề CPS
Mealy, P., del Rio-Chanona, R. M., & Farmer, J. D. (2018). *What you do at work matters: New lenses on labour*. SSRN Working Paper 3143064. https://ssrn.com/abstract=3143064 — PDF https://bennettschool.cam.ac.uk/wp-content/uploads/2020/12/What_you_do_at_work_matters.pdf — **toàn văn** (working paper, chưa bình duyệt tại thời điểm đọc).
- Ground truth: xác suất chuyển nghề P_ij = T_ij / T_i từ CPS theo tháng 1/2010–1/2017, mã nghề ACS 4 chữ số (215.296 cặp).
- So **3 dạng hàm × 7 bộ mô tả** = 21 độ đo: (a) tương quan Pearson co giãn (1+r)/2; (b) proximity = min của tỷ lệ phần tử chung (Hidalgo 2007); (c) **scarcity-adjusted proximity** = proximity có trọng số độ hiếm s_w = 1/(số nghề có phần tử w) (Zaccaria 2014). Mô tả: IWA (332), DWA, Skills, Abilities, Knowledge, GWA, gộp mọi thang liên tục. Với thang liên tục, nhị phân hoá bằng "relative importance indicator" RII = (M_ie/M_i)/(M_e/M) > 1 — tức là **chuẩn hoá trừ mức chung theo cả nghề lẫn phần tử** (giống RCA).
- **Kết quả (Pearson r với P_ij):** IWA: .234 / .240 / **.301** (scarcity-adjusted cao nhất); DWA: .165–.196; Knowledge: .036–.060; GWA: .010–.063; Skills: .012–.041; Abilities: .026–.034; gộp liên tục: .015–.044. IWA scarcity-adjusted giải thích ~9% phương sai (adj R² .094); thêm học vấn/lương/việc làm → .201.
- Phiên bản top-10 nhị phân của độ đo IWA vẫn giải thích nhiều phương sai hơn **O*NET Career Changers Matrix** (ma trận cũ, Euclid trên WA/knowledge/skills/work context + rà soát chuyên gia).
- Các độ đo dựa trên thang liên tục tương quan cao với nhau nhưng thấp với độ đo IWA/DWA → chúng chứa thông tin khác nhau.
- **Hàm ý:** để dự đoán *chuyển nghề thực tế* (của người lao động Mỹ), hoạt động rời rạc (IWA/DWA) + trọng số độ hiếm vượt xa Skills/Knowledge/GWA dạng thang điểm. Lưu ý: r tính trên P_ij thô rất lệch, nên giá trị tuyệt đối nhỏ; đây là bài toán khác với "gợi ý nghề để *thử*" cho học sinh.

### Carrillo-Tudela, Darougheh & Visschers (2025) — Euclid trên PCA, angular ≈ Manhattan
Carrillo-Tudela, C., Darougheh, S., & Visschers, L. (2025). *Confused about careers? Untangling occupational mobility, miscoding and distance*. Danmarks Nationalbank Working Paper No. 212. https://www.nationalbanken.dk/media/43xpq2wx/confused-about-careers-untangling-occupational-mobility-miscoding-and-distance.pdf — **toàn văn** (working paper).
- Khoảng cách task: 120 chiều O*NET → **PCA + varimax** (25 thành phần ở mức nghề 3 chữ số, 79,8% phương sai) → **Euclid** (theo Guvenen et al. 2020). Chú thích 38: **angular và Manhattan cho kết quả rất giống** → khi đã giảm chiều/chuẩn hoá, chọn hàm khoảng cách ít quan trọng.
- Đánh giá theo **bin phân vị khoảng cách** (thứ tự, không dùng giá trị tuyệt đối): luồng chuyển tập trung ở các bin gần. O*NET task distance phân biệt kém giữa "hơi giống" và "rất giống" → khoảng cách dựa trên lỗi mã hoá (miscoding) dự đoán tốt hơn ở khoảng gần. Hàm ý: O*NET mô tả thang điểm phân giải kém ở đỉnh danh sách (đúng chỗ top-k quan trọng).

### Poletaev & Robinson (2008); Robinson (2018) — phân tích nhân tố rồi khoảng cách
Poletaev, M., & Robinson, C. (2008). Human capital specificity: Evidence from the Dictionary of Occupational Titles and Displaced Worker Surveys, 1984–2000. *Journal of Labor Economics*, 26(3), 387–420. https://doi.org/10.1086/588180 — **toàn văn** bản working paper UWO CHCP 2008-3 (https://hdl.handle.net/20.500.14721/10007).
- Phân tích nhân tố (factor analysis) các đặc trưng DOT ở mức nghề, **có trọng số việc làm**, nhân tố chuẩn hoá mean 0 / SD 1 → 4 nhân tố trực giao giải thích 77% hiệp phương sai (nhân tố 1 ≈ "trí tuệ chung" ~40%, nhân tố 2 vận động tinh ~20%...). Một đơn vị khác biệt = 1 SD của lực lượng lao động → khoảng cách có nghĩa diễn giải. Khoảng cách dùng thứ tự + mức + Euclid có trọng số.
- Phát hiện: mất lương sau sa thải gắn với **đổi danh mục kỹ năng** hơn là đổi mã ngành/mã nghề.
- Robinson (2018, *J. Human Resources* 53(2), 513–551, **thứ cấp** qua Neffke et al. 2023): 49 đặc trưng DOT → 4 kỹ năng bằng factor analysis; thêm **hướng** (lên/xuống thang kỹ năng) → khoảng cách bất đối xứng.

### Neffke, Nedelkoska & Wiederhold (2024) — thiếu hụt vs dư thừa kỹ năng (bất đối xứng)
Neffke, F., Nedelkoska, L., & Wiederhold, S. (2024). Skill mismatch and the costs of job displacement. *Research Policy*, 53(2), 104933 — **toàn văn** bản IWH DP 11/2023 (https://www.iwh-halle.de/fileadmin/user_upload/publications/iwh_discussion_papers/iwh-discussion-paper_2023_11_Neffke_Nedelkoska_Wiederhold.pdf).
- Phê bình: angular (Gathmann–Schönberg) và Euclid (Poletaev–Robinson) đều **đối xứng** và không tách được thiếu/dư cùng lúc. Đề xuất: redundancy_{o→o'} = Σ β_i (f_io − f_io') khi f_io > f_io'; shortage = Σ β_i (f_io' − f_io) khi f_io < f_io'; β_i = số năm học cần để có thêm 1 SD kỹ năng i (hồi quy). Dữ liệu BIBB 2005/06, 263 nghề.
- Kết quả: thiếu hụt → thu nhập hồi phục khá nhanh; dư thừa → thu nhập thấp vĩnh viễn.
- Hàm ý JobQuest: gợi ý nghề "kế tiếp" có thể bất đối xứng (nghề đích đòi hỏi cao hơn = "thử thách", thấp hơn = "dễ vào"); dùng Job Zone làm hướng.

### Macaluso (2017/2023) — khoảng cách trung bình tuyệt đối trên 35 skills O*NET
Macaluso, C. (2017). *Skill remoteness and post-layoff labor market outcomes* (bản 4/1/2017, NBER conference; bản CESifo WP 10845, 2023). https://conference.nber.org/conf_papers/f95558/f95558.pdf — **toàn văn** (bản 2017).
- d_ij = (1/S) Σ_s |A_is − R_js| trên **35 skills O*NET (Level)** chuẩn hoá về [0,1] (Manhattan trung bình). Chú thích 9: **Euclid và các cách trọng số khác cho kết quả gần như không đổi**.
- Kiểm chứng với luồng CPS 2000–2015 (22 nhóm SOC 2 chữ số, 484 cặp): hồi quy log-log, độ co giãn luồng theo khoảng cách ≈ −0,73 đến −0,77; R² 0,23 (chỉ khoảng cách) → 0,81 (thêm hiệu ứng cố định nghề nguồn/đích).
- Lưu ý: kết quả ở mức gộp rất thô (22 nhóm), không so sánh trực tiếp với Mealy et al. (mức 4 chữ số, Skills r ≈ .01–.04).

### Alabdulkareem et al. (2018) — Skillscape (RCA + đồng xuất hiện)
Alabdulkareem, A., Frank, M. R., Sun, L., AlShebli, B., Hidalgo, C., & Rahwan, I. (2018). Unpacking the polarization of workplace skills. *Science Advances*, 4(7), eaao6030. https://doi.org/10.1126/sciadv.aao6030 — **toàn văn** (PMC6051733, qua WebFetch).
- 161 "kỹ năng" = skills + knowledge + abilities của O*NET, 672 nghề. rca(j,s) = (tỷ phần importance của s trong nghề j) / (tỷ phần của s trên toàn bộ nghề); e(j,s) = 1 nếu rca > 1 → **trừ phần phổ biến chung**. θ(s,s') = Σ_j e·e' / max(Σ e, Σ e') (min của 2 xác suất có điều kiện). Mạng kỹ năng tách 2 cụm: xã hội–nhận thức vs cảm giác–thể chất.
- Kiểm chứng: tỷ lệ kỹ năng nhận thức tương quan lương nghề ρ = .42; chuyển nghề CPS 2014–2015 (5.400) lệch khỏi ngẫu nhiên. **Không** báo độ chính xác dự đoán chuyển nghề cặp-đôi.

### Frank et al. (2024) — mịn hơn thì dự đoán tốt hơn
Frank, M. R., et al. (2024). Network constraints on worker mobility. *Nature Cities*, 1, 94–104. https://digitaleconomy.stanford.edu/publication/network-constraints-on-worker-mobility — **tóm tắt**.
- Độ giống kỹ năng dự đoán tỷ lệ chuyển nghề trên 1 khảo sát đại diện quốc gia + 3 bộ dữ liệu CV; **dự đoán tốt hơn khi dữ liệu kỹ năng mịn hơn** (cùng hướng với Mealy et al.: IWA/DWA > GWA/Skills).

## Q2c. Centering/chuẩn hoá và kết hợp nhiều miền mô tả

### Allen et al. (2012) — ma trận cũ Career Changers / Career Starters
Allen, M. T., Waugh, G. W., Shaw, M., Tsacoumis, S., et al. (2012). *The development and evaluation of a new O\*NET Related Occupations Matrix* (FR-12-29). HumRRO. https://www.onetcenter.org/dl_files/Related.pdf — **toàn văn** (tr. i–16).
- Thử 9 miền (Knowledge, Skills, Abilities, Interests, Work Styles, Work Values, GWA, Work Context, Job Zone) × 4 độ đo (Euclid thô, Mahalanobis D, Euclid chuẩn hoá, Pearson r). Lý thuyết (Edwards 1993; Cronbach–Gleser): độ đo **khác biệt** giữ "elevation" (mức) — hợp cho *chuyển việc* (đủ trình độ chưa); độ đo **tương quan** chỉ giữ "shape" — hợp cho *khám phá nghề*, như Strong Interest Inventory chấm ipsative.
- **Cách kết hợp miền:** (1) mỗi miền 1 ma trận similarity riêng (Knowledge/Skills/GWA: trung bình không trọng số của Level và Importance); (2) **z-chuẩn hoá từng ma trận**; (3) trung bình cộng. Lý do: nếu gộp mọi phần tử vào 1 vector thì Abilities (52 phần tử) **át** Interests (6 phần tử). Kiểm tra "trọng số hiệu dụng" (Wang & Stanley 1970): Job Zone (1 phần tử) thấp hơn 20–30% → nhân 1,3.
- Cuối cùng chọn **Euclid thô** cho cả hai (diễn giải được hơn, "face valid" hơn Mahalanobis/Euclid chuẩn hoá). Starter = Abilities + Interests + Work Styles + Work Values; Changer = Knowledge + Skills + GWA + Work Context + Job Zone×1,3, loại nghề lệch >1 Job Zone. Thêm Knowledge/Skills vào Starter làm danh sách dễ hiểu hơn nhưng trùng Changer tới 49% → bỏ để giữ khác biệt.
- Rà soát: 4 chuyên viên; bỏ 15,2% cặp ở cả hai ma trận (mỗi người 3,1%–34,7% → **độ tin cậy giữa người chấm có thể thấp**, không kiểm được vì không chấm chồng). Đánh giá thống kê bằng **p(Overlap) có hiệu chỉnh cơ hội** theo Job Family, CIP family, lương, học vấn/kinh nghiệm.
- Mealy et al. (2018) cho thấy ma trận Career Changers này giải thích chuyển nghề CPS **kém** hơn độ đo IWA đơn giản.

### Tổng hợp bằng chứng cho Q2c
1. **Phần chung giữa mọi nghề là lớn** (trang chính thức + toàn văn): cosine knowledge-importance giữa mọi cặp TB **0,924 (SD 0,035)** (Harris & Dahlke 2025); tương quan hồ sơ skills với nghề *ngẫu nhiên* đã là **.62**, abilities .68 (Dahlke et al. 2022, Bảng 9). → cosine/tương quan thô trên điểm O*NET bị nén ở vùng cao, khó phân biệt top-k.
2. **Cách "trừ phần chung" đã được dùng và có lợi:** RCA (Alabdulkareem 2018; Dawson 2021), RII + trọng số độ hiếm 1/n (Mealy 2018 — độ hiếm tăng r từ .234 lên .301 với IWA), TF-IDF (HumRRO cho job titles). Tương tự trong NLP: trừ vector trung bình + vài hướng chính làm cosine embedding tốt hơn (Mu & Viswanath, *All-but-the-Top*, ICLR 2018, https://arxiv.org/abs/1702.01417 — **tóm tắt**).
3. **Phân biệt 2 kiểu centering:** (a) *centering theo hàng* (trừ trung bình các phần tử của chính nghề đó) → cosine = Pearson r = "shape"; vẫn giữ phần hồ sơ chung (ai cũng cần Reading, Speaking cao). (b) *centering/z theo cột* (trừ trung bình nghề cho từng phần tử, chia SD) → loại "cái mọi nghề đều có", nhấn mạnh điểm đặc trưng. RCA/RII ≈ kết hợp cả hai (chia cho trung bình hàng và cột). Chưa thấy nghiên cứu nào so sánh trực tiếp (a) vs (b) trên O*NET với tiêu chí ngoài → **chưa xác nhận**, cần thử nghiệm trên dữ liệu của mình.
4. **Hàm khoảng cách ít quan trọng hơn biểu diễn:** angular ≈ Manhattan ≈ Euclid sau PCA (Carrillo-Tudela et al. 2025); Euclid ≈ Manhattan (Macaluso 2017); angular ≈ cosine (Dahlke et al. 2022). Cái tạo khác biệt lớn là **chọn miền mô tả và độ mịn** (Mealy 2018: IWA r=.30 vs Skills ≤.04) và **trừ phần phổ biến**.
5. **Kết hợp miền:** thông lệ của O*NET (cả 2012 lẫn 2022) = tính similarity **riêng từng miền → z-chuẩn hoá trên phân phối mọi cặp → trung bình bằng nhau** (có điều chỉnh trọng số hiệu dụng nếu miền ít phần tử). Không có bằng chứng thực nghiệm cho trọng số tối ưu; HumRRO chọn trọng số bằng nhau vì thực dụng (hồi quy theo từng nghề không khả thi). Miền tương quan cao với nhau (Skills–Abilities–Knowledge, Mealy Hình 7) → gộp lại sẽ "đếm hai lần" cùng một thông tin; có thể PCA hoặc chỉ giữ 1 đại diện.
6. **Shape vs elevation theo mục đích:** sở thích/work styles/values → shape (Pearson); KSA → khoảng cách có mức (Dahlke 2022; Allen 2012). Allen 2012 cuối cùng vẫn dùng Euclid cho cả Starter vì dữ liệu O*NET có thang tuyệt đối.

## Q5a. Cách kiểm định một độ đo độ giống nghề

| Kiểu kiểm định | Ai đã làm | Chỉ số | Con số tham chiếu |
|---|---|---|---|
| Khớp với danh sách chuyên gia/O*NET | Allen 2012; Mealy 2018 (so với Career Changers) | % trùng (overlap) top-10 | Career Changers mới vs ma trận gốc 1999: 16–24% trùng; Starter vs Changer trước rà soát 31,3% (Allen 2012, **toàn văn**) |
| Rà soát chuyên gia | Dahlke 2022; Harris & Dahlke 2025; Allen 2012 | % cặp top-10 bị thay/loại | 5,8% (60 nghề mẫu), 13,78% (toàn bộ 923), 2,99% (cập nhật 2025), 15,2% (Allen 2012) |
| Ngưỡng "bookmark" chuyên gia | Dahlke 2022 | % top-10 vượt ngưỡng | 93% (mới) vs 67% (Career Changers) vs 49% (Career Starters) |
| Tiêu chí ngoài (không dùng để xây) | Dahlke 2022; Allen 2012 | Cohen's d top-10 vs phần còn lại; tỷ lệ giảm phương sai; p(Overlap) hiệu chỉnh cơ hội theo Job Family/CIP | d: interest 1,38; skills 1,12; Δjob zone −0,95; Δlương −0,66 |
| Chuyển nghề thực tế | Mealy 2018 (CPS); Macaluso 2017 (CPS); Gathmann–Schönberg 2010 (Đức); Dawson 2021 (HILDA) | Pearson r với P_ij; độ co giãn log-log; so phân phối với chuyển ngẫu nhiên (KS); accuracy phân loại | r = .30 (IWA tốt nhất), ≤ .06 (Skills/Knowledge/GWA); co giãn −0,77; accuracy 73–76% (âm tính ngẫu nhiên, dễ) |

- **Chưa tìm thấy** benchmark công khai chuẩn kiểu precision@k / nDCG cho bài toán nghề–nghề trên O*NET (**chưa xác nhận** là không tồn tại). Các bài kinh tế lao động dùng hồi quy/tương quan, không dùng chỉ số truy hồi.
- Dữ liệu chuyển nghề công khai: CPS (IPUMS) dùng mã Census ~500 nghề, cần crosswalk sang O*NET-SOC; dữ liệu CV (Burning Glass/Lightcast, LinkedIn) là độc quyền — dữ liệu của Schubert, Stansbury & Taska (16 triệu CV) có công khai hay không: **chưa xác nhận**.
- Lưu ý vòng lặp: O*NET RO dùng knowledge cosine → nếu JobQuest cũng dùng Knowledge thì một phần khớp là do trùng đầu vào; RIASEC, Skills, GWA, Work Styles **không** nằm trong RO nên khớp ở đó là bằng chứng độc lập hơn.

## ESCO — phương án thay thế (ngắn)
- ESCO v1.2 (5/2024): **3.039 nghề**, **13.939** kỹ năng/kiến thức (slide ra mắt chính thức, https://esco.ec.europa.eu/system/files/2024-05/V1.2%20Launch%20-%20ESCO%20SEC%20combined%20-%20final%20clean.pdf — **trang chính thức**). Mỗi nghề gắn kỹ năng **essential** / **optional** (quan hệ nhị phân, không có điểm importance/level); mỗi nghề thuộc đúng 1 nhóm đơn vị ISCO-08 cấp 4.
- Có crosswalk ESCO↔O*NET (ML + chuyên gia xác nhận), bảng CSV tải được: https://esco.ec.europa.eu/en/about-esco/publications/publication/crosswalk-between-esco-and-onet-technical-report — **trang chính thức** (chưa đọc báo cáo).
- Độ giống trên ESCO phải dùng dạng nhị phân: Jaccard/proximity có trọng số độ hiếm (kiểu Mealy) hoặc RCA; ưu điểm: rất mịn (giống IWA/DWA), đa ngôn ngữ, gần ISCO-08 (khung phân loại nghề Việt Nam được cho là dựa trên ISCO-08 — **chưa xác nhận**). Nhược điểm: không có RIASEC, work styles; không có thang mức độ.

## Đề xuất cho JobQuest

**1. Hai "ống kính" độ giống, khớp với 2 loại gợi ý (theo logic Starter/Changer của Allen 2012):**
- **Cùng lĩnh vực ("nghề gần, làm tương tự")** = Knowledge (33) + Skills (35) + Work Activities (41 GWA). Nếu được, thêm DWA/IWA (O*NET có file Tasks to DWAs, DWA/IWA Reference) vì bằng chứng chuyển nghề mạnh nhất nằm ở IWA/DWA (Mealy 2018) và O*NET RO cũng dựa trên task/DWA.
- **Khác lĩnh vực ("nghề hợp với con người bạn")** = RIASEC (6) + Work Styles. Dùng **shape** (Pearson r) vì mức chung không có ý nghĩa với sở thích (Dahlke 2022; Allen 2012); sau đó lọc nghề khác Job Family/SOC nhóm lớn để đảm bảo "khác ngành".

**2. Cách tính trong mỗi miền:**
- Dùng điểm Importance (có thể TB với Level đã đổi thang, như Allen 2012); bỏ giá trị bị O*NET đánh dấu suppress/không tin cậy.
- **Trừ phần chung:** z-chuẩn hoá từng phần tử theo cột trên 923 nghề (hoặc RCA), rồi **cosine** giữa 2 vector. Lý do: cosine thô bị nén (knowledge TB .924), skills tương quan .62 với nghề ngẫu nhiên. Với RIASEC: Pearson trên 6 điểm thô (centering theo hàng) là đủ.
- Hàm khoảng cách (cosine/angular/Euclid/Manhattan) ít quan trọng; chọn cosine cho đơn giản và thống nhất với O*NET 2022.

**3. Kết hợp miền:** mỗi miền → ma trận 923×923 → **z-chuẩn hoá trên mọi cặp** → **trung bình bằng nhau** (như O*NET 2012 và 2022). Không trộn mọi phần tử vào 1 vector (Abilities/GWA nhiều phần tử sẽ át RIASEC 6 phần tử). Job Zone dùng làm **bộ lọc/phạt** (|ΔJZ| ≤ 1 cho "cùng lĩnh vực") hoặc hướng gợi ý (thử thách hơn/dễ vào hơn, theo Neffke et al. 2024). Chỉ tinh chỉnh trọng số nếu kiểm định trên tập giữ lại cho thấy lợi rõ.

**4. Quy trình kiểm định (đề xuất):**
1. **Baseline:** ngẫu nhiên (precision@10 kỳ vọng ≈ 10/922 ≈ 1,1%); cùng nhóm SOC nhỏ; từng miền riêng lẻ; composite.
2. **Khớp O*NET Related Occupations 31.0** cho lens "cùng lĩnh vực": precision@5 vs Primary-Short, precision@10 / recall@10 vs Primary (10 nghề), recall@20 vs cả 20; **nDCG@10** với mức liên quan theo tier (Short = 3, Long = 2, Supplemental = 1, khác = 0); báo theo Job Family. Thêm Spearman ρ theo từng nghề đích với `Relatedness Score` trong Research Dataset. Chia đôi nghề (tuning/hold-out) nếu chỉnh trọng số. Ghi rõ phần trùng đầu vào (Knowledge).
3. **Tiêu chí ngoài kiểu HumRRO:** Cohen's d top-10 vs phần còn lại về |ΔJob Zone|, |Δlương| (BLS), tương quan RIASEC — cho cả 2 lens.
4. **Rà soát chuyên gia nhỏ:** 30–60 nghề phân tầng theo job family × job zone; 2–3 người (GV hướng nghiệp/chuyên viên tư vấn) chấm **chồng nhau** để tính kappa (khắc phục hạn chế của Allen 2012); câu hỏi nhị phân "hợp lý để học sinh thử tiếp?"; báo % bị thay (mốc tham chiếu O*NET: 6–15%).
5. (Tuỳ chọn) chuyển nghề CPS qua IPUMS theo cách Mealy 2018 — chỉ khi còn thời gian; không phải mục tiêu chính vì JobQuest gợi ý để *khám phá*, không phải để *chuyển việc*.

**5. Phương án nhanh nhất có thể bảo vệ:** dùng thẳng O*NET Related Occupations làm gợi ý "cùng lĩnh vực" (đã có chuyên gia rà, phương pháp công bố), và chỉ tự tính lens "khác lĩnh vực" bằng RIASEC + Work Styles, kiểm định bằng bước 3–4.
