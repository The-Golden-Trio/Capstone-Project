# Quy đổi keyword kỹ năng (keyword-to-keyword credit)

Ngày bắt đầu: 2026-10-22. Ghi chú nghiên cứu, cập nhật dần.

Câu hỏi: đo độ liên quan / khả năng chuyển giao giữa hai kỹ năng thế nào, và kiểm chứng ra sao, để làm bảng quy đổi "keyword A mức x cho bao nhiêu điểm vào keyword B" trong cơ chế nhảy nghề (coverage = Σ min(have, need) / Σ need ≥ 50%).

Nhãn kiểm chứng: "toàn văn" (đã đọc bài gốc), "tóm tắt" (chỉ đọc abstract / trang bài), "thứ cấp" (qua nguồn khác trích lại), "trang chính thức" (trang của tổ chức phát hành), "chưa xác nhận".

## 1. Độ liên quan kỹ năng từ đồng xuất hiện

### 1.1 Alabdulkareem et al. 2018, Science Advances: RCA + θ trên O*NET

Nguồn: Alabdulkareem, Frank, Sun, AlShebli, Hidalgo, Rahwan (2018). "Unpacking the polarization of workplace skills". Science Advances 4(7): eaao6030. DOI 10.1126/sciadv.aao6030. PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC6051733. Nhãn: **toàn văn** (bản PMC, đọc qua công cụ trích; công thức bị làm phẳng nhưng đọc được).

- Dữ liệu: 161 kỹ năng/kiến thức/năng lực O*NET (importance), 672 nghề SOC, O*NET các năm 2010–2015.
- RCA của kỹ năng s trong nghề j (trên điểm importance onet(j,s)):
  `rca(j,s) = [onet(j,s) / Σ_s' onet(j,s')] / [Σ_j' onet(j',s) / Σ_j',s' onet(j',s')]`
- Dùng hiệu quả (effective use): `e(j,s) = 1 nếu rca(j,s) > 1, ngược lại 0`.
- Độ bổ trợ kỹ năng (complementarity):
  `θ(s,s') = Σ_j e(j,s)·e(j,s') / max(Σ_j e(j,s), Σ_j e(j,s'))`
  Bài nói rõ đây là **min của hai xác suất có điều kiện** P(s|s') và P(s'|s) (cùng được dùng hiệu quả trong một nghề). Giống "product space" của Hidalgo et al. 2007.
- Ngưỡng: phân cụm Louvain trên mạng đầy đủ (không cắt θ); θ > 0.6 chỉ để vẽ hình.
- Kiểm chứng: (a) tỷ lệ kỹ năng nhận thức của nghề tương quan với lương ρ = 0.42; (b) 5.400 chuyển nghề CPS 2014–2015: người lao động nhóm thể chất–giác quan có dịch về nghề nhận thức nhưng ít hơn mô hình ngẫu nhiên; (c) "proximity" (tổng θ tới các kỹ năng đã có / tổng θ) dự báo việc thu nhận kỹ năng mới ở cấp thành phố, nghề, cá nhân (AUROC ở phụ lục, không đọc số cụ thể).
- Ý nghĩa cho JobQuest: θ là **độ bổ trợ** (hay đi cùng nhau), không phải "thay thế được". Hai kỹ năng θ cao = nghề cần A thường cũng cần B, nên người có A dễ có/đạt B. Đây là cơ sở hợp lý nhất cho "credit chéo" khi có dữ liệu nghề–kỹ năng như O*NET.

### 1.2 Dawson, Williams, Rizoiu 2021, PLOS ONE: Skills Space trên tin tuyển dụng

Nguồn: Dawson N., Williams M.-A., Rizoiu M.-A. (2021). "Skill-driven recommendations for job transition pathways". PLOS ONE 16(8): e0254722. DOI 10.1371/journal.pone.0254722. arXiv 2011.11801. Nhãn: **toàn văn** (đọc trang 4–7 bản arXiv PDF + trang PLOS).

- 8.002.780 tin tuyển dụng Úc (Burning Glass) 2012–2020; giữ kỹ năng xuất hiện ≥ 5 lần.
- Eq.1 RCA(j,s) như trên nhưng x(j,s) nhị phân (tin j có yêu cầu s hay không). Eq.2 θ(s1,s2) = Σ e(j,s1)e(j,s2) / max(Σ e(j,s1), Σ e(j,s2)), với e = 1 khi RCA ≥ 1. θ ∈ [0,1], "complementary, not replaceable".
- Eq.3 trọng số kỹ năng trong một tập: w(s,S) = trung bình RCA(j,s) trên các tin thuộc S.
- Eq.4 độ giống hai tập kỹ năng: `Θ(S1,S2) = (1/C) Σ_{s1∈S1} Σ_{s2∈S2} w(s1,S1) w(s2,S2) θ(s1,s2)`, C = Σ Σ w w. Diễn giải của tác giả: "Θ cao thì người có S1 dễ đáp ứng yêu cầu của S2".
- Bất đối xứng: tác giả thừa nhận Θ đối xứng trong khi chuyển nghề **bất đối xứng**; họ xử lý bằng cách thêm đặc trưng của nghề nguồn/đích (số năm học, kinh nghiệm, lương, cung–cầu) vào bộ phân loại XGBoost. Ví dụ: Finance Manager → Accounting Clerk dễ hơn chiều ngược lại.
- Kiểm chứng: 2.999 chuyển nghề thật từ khảo sát HILDA + cùng số mẫu âm ngẫu nhiên (5.998). Độ chính xác 76% (mọi đặc trưng), 73% chỉ với các khoảng cách Skills Space; chia 80/20, lặp 10 lần. Chuyển nghề thật có Θ cao hơn mẫu ngẫu nhiên (paired t-test, Cohen's d = 0.42 trên mọi chuyển nghề; 0.14 khi chỉ tính chuyển sang nghề khác).
- Ý nghĩa: (a) công thức θ có thể dùng nguyên văn trên ma trận nghề × keyword của JobQuest; (b) cách kiểm chứng "mẫu chuyển thật vs mẫu ngẫu nhiên" chép được; (c) chỉ riêng độ giống kỹ năng đã đạt 73%, tức là tín hiệu có thật nhưng không hoàn hảo.

### 1.3 Neffke & Henning 2013; Neffke, Otto, Weyh 2017: "skill relatedness" từ dòng chuyển lao động

Nguồn chính: Neffke F., Otto A., Weyh A. (2017). "Inter-industry labor flows". Journal of Economic Behavior & Organization 142: 275–292. DOI 10.1016/j.jebo.2017.07.003. PDF: https://growthlab.hks.harvard.edu/wp-content/uploads/2018/01/interindustry_labor_neffke.pdf. Nhãn: **toàn văn** (đọc trang 278–283). Bài gốc Neffke & Henning (2013), Strategic Management Journal 34(3): 297–316, DOI 10.1002/smj.2014: nhãn **tóm tắt** (dữ liệu Thuỵ Điển, ~400 ngành).

- Đơn vị là **ngành** (hoặc nghề), không phải kỹ năng: hai ngành "liên quan về kỹ năng" nếu người lao động chuyển giữa chúng nhiều hơn kỳ vọng.
- Eq.1: `R_ij = F_ij · F.. / (F_i. · F_.j)` (dòng quan sát / dòng kỳ vọng nếu chuyển ngẫu nhiên theo tổng dòng ra của i và tổng dòng vào của j). Biến đổi cho đối xứng quanh 0: `R̃_ij = (R_ij − 1)/(R_ij + 1)` ∈ [−1, 1]; R̃ > 0 nghĩa là "liên quan".
- R_ij có hướng (F_ij ≠ F_ji), tức là đo được bất đối xứng nếu không gộp hai chiều.
- Bằng chứng phụ: ở Đức 1999–2007, các ngành chiếm 5% việc làm hấp thụ 62% người đổi việc (mô hình ngẫu nhiên chỉ 14%), tức chuyển việc đi theo "đường hẹp" của kỹ năng.
- Ý nghĩa cho JobQuest: không áp trực tiếp cho keyword (không có dữ liệu chuyển việc theo kỹ năng), nhưng là **chuẩn vàng để kiểm chứng**: nếu có ma trận chuyển nghề (CPS Mỹ), tính R̃ cho cặp nghề và so với độ giống nghề suy ra từ bảng quy đổi keyword.

### 1.4 Gathmann & Schönberg 2010, Journal of Labor Economics: khoảng cách nhiệm vụ (cosine)

Nguồn: Gathmann C., Schönberg U. (2010). "How general is human capital? A task-based approach". Journal of Labor Economics 28(1): 1–49. DOI 10.1086/649786. Bản nháp 8/2008: https://doku.iab.de/fdz/events/2008/Gathmann.pdf. Nhãn: **toàn văn** (bản nháp 2008, đọc trang 1–6, 12–13; số liệu bản in có thể khác).

- Mỗi nghề o là vector q_o gồm tỷ lệ người làm từng nhiệm vụ (19 nhiệm vụ, khảo sát BIBB Đức 30.000 người/đợt; 64 nghề).
- `AngSep(o,o') = Σ_j q_jo q_jo' / sqrt(Σ_j q_jo² · Σ_k q_ko'²)` (cosine / tương quan không trừ trung bình); khoảng cách = 1 − AngSep.
- Kết quả: người lao động chuyển sang nghề có nhiệm vụ giống hơn nhiều so với mô hình chuyển ngẫu nhiên; khoảng cách các lần chuyển giảm theo kinh nghiệm; vốn nhân lực theo nhiệm vụ giải thích ít nhất 40% tăng lương 10 năm ở người tốt nghiệp đại học (25% trung cấp, 35% thấp); mất việc mà sang nghề giống thì mất ~12% lương, sang nghề rất xa mất gần gấp 3.
- Ý nghĩa cho JobQuest: cosine **đối xứng**, thuộc cấp nghề. Có thể "lật" ma trận: mỗi keyword là vector điểm level/importance trên các nghề, cosine giữa hai keyword = độ giống hồ sơ nghề của chúng. Đây là phương án dự phòng khi θ quá thưa.

## 2. ESCO, crosswalk ESCO–O*NET, và độ giống bằng embedding

### 2.1 O*NET Related Occupations (Dahlke et al. 2022, HumRRO cho O*NET Center)

Nguồn: Dahlke J. A., Putka D. J., Shewach O., Lewis P. (2022). "Developing Related Occupations for the O*NET Program". National Center for O*NET Development. https://www.onetcenter.org/reports/Related_2022.html, PDF https://www.onetcenter.org/dl_files/Related_2022.pdf. Nhãn: **trang chính thức** + **toàn văn** (đọc phần phương pháp, Phase 1–4).

- So sánh 6 cách biểu diễn văn bản nhiệm vụ: TF, TF-IDF, GloVe, GloVe TF-IDF, SBERT (`nli-distilroberta-base-v2`), USE-DAN. Độ giống nghề = **trung bình cosine trên mọi cặp task** (và mọi cặp DWA) giữa hai nghề. Tiêu chí ngoài để chấm: khoảng cách hồ sơ KSA, độ giống sở thích nghề, giá trị nghề, phong cách làm việc, chênh lệch lương trung vị.
- Kết quả: TF và TF-IDF kém nhất; GloVe, USE-DAN, SBERT tương đương nhau; chọn SBERT vì dễ dùng và nắm ngữ cảnh. **Gán trọng số theo importance của task không thêm giá trị** (R² không tăng, tương quan có trọng số và không trọng số gần bằng 1).
- Composite ban đầu (trung bình task + DWA) hỏng ở nghề dạy học và quản lý: câu chữ giống nhau nhưng khác chuyên môn (ví dụ "Biological Science Teachers, Postsecondary" xếp Biologists hạng 163/922). Sửa bằng cách thêm cosine hồ sơ importance của **33 Knowledge** và cosine embedding GloVe của **tên gọi thay thế**; composite cuối = trung bình 3 điểm z, chuẩn hoá lại trên 851.006 cặp nghề.
- Ngưỡng "liên quan" đặt bằng **bookmarking**: 5 tiến sĩ tâm lý tổ chức đọc 800 cặp (20 cặp/percentile, từ percentile 60 trở lên) và dừng ở chỗ hết thấy liên quan; điểm dừng 89–95, trung vị 93 → ngưỡng z = 1.61649 (đáy percentile 93).
- Kiểm định chuyên gia: mẫu 60 nghề, nhân viên Center đề nghị thay 5.8% trong 600 nghề liên quan hàng đầu; bản cuối 923 nghề, người duyệt độc lập thay 13.78% (1.272/9.230), chỉ loại hẳn 5; phần còn lại hạ xuống "supplemental". Thay thế thường do chênh **Job Zone**.
- Ý nghĩa cho JobQuest: (a) embedding câu (SBERT) dùng được để so **chữ** của keyword, nhưng bài học của O*NET là chữ giống chưa chắc cùng chuyên môn, cần thêm tín hiệu từ dữ liệu (Knowledge, đồng xuất hiện); (b) quy trình bookmarking + tỷ lệ chuyên gia sửa là khuôn kiểm chứng chép được; (c) chênh Job Zone là nguồn lỗi chính, tương ứng với chênh **mức** keyword trong JobQuest.

### 2.2 ESCO: quan hệ kỹ năng–kỹ năng và crosswalk ESCO–O*NET

Nguồn: ESCO, "Structure of the ESCO downloadable datasets", https://esco.ec.europa.eu/en/structure-esco-downloadable-datasets; ESCO LOD model https://ec.europa.eu/esco/lod/static/model.html; trang crosswalk https://esco.ec.europa.eu/en/node/410 (bài/ báo cáo kỹ thuật: https://esco.ec.europa.eu/publication/crosswalk-between-esco-and-onet-technical-report). Nhãn: **trang chính thức** (chưa đọc báo cáo kỹ thuật PDF).

- ESCO có file `skillSkillRelations` (chỉ chứa URI). Mô hình LOD định nghĩa `hasEssentialSkill` = kỹ năng "essential for the subject occupation or skill" và `hasOptionalSkill`; chiều ngược là `isEssentialSkillFor`/`isOptionalSkillFor`, đều là con của `skos:related`. Tức là ESCO **có quan hệ có hướng giữa hai kỹ năng** (kỹ năng/kiến thức B là thiết yếu cho kỹ năng A) do chuyên gia gán, nhưng không có điểm số độ giống. Tên cột cụ thể (originalSkillUri, relationType, relatedSkillUri) và số lượng quan hệ: **chưa xác nhận** (cần mở file CSV tải về).
- Trụ kỹ năng ESCO là đơn phân cấp (mỗi kỹ năng thuộc 1 nhóm; nhóm ở 3 tầng trên, kỹ năng ở tầng 4 trở xuống), có thuộc tính `skillReuseLevel` (mức tái dùng: transversal / cross-sector / sector-specific / occupation-specific, giá trị cụ thể **thứ cấp**, trang model không liệt kê).
- Crosswalk ESCO–O*NET: chỉ **nghề**, không phải kỹ năng. BERT tinh chỉnh + cosine gợi ý 10 nghề ESCO cho mỗi nghề O*NET; hai người duyệt + người thứ ba phân xử, rồi Bộ Lao động Mỹ duyệt lại. Mô hình tốt nhất đặt exact match ở hạng 1 cho 85% nghề (90% nếu tính cả narrow/broad/close). Có loại match exact/narrow/broad/close (+ "related" chất lượng thấp hơn).
- Ý nghĩa cho JobQuest: (a) quan hệ essential skill–skill của ESCO là nguồn **chuyên gia** cho cạnh có hướng (tiền đề), dùng để đối chiếu cạnh bất đối xứng suy ra từ dữ liệu; (b) mức tái dùng là tín hiệu "độ chung" của kỹ năng (kỹ năng transversal cho credit rộng, occupation-specific cho credit hẹp); (c) quy trình máy gợi ý top-k + 2 người duyệt + người phân xử là mẫu kiểm định tốt cho bảng quy đổi.

### 2.3 Mạng chuyển nghề thực nghiệm (dùng làm chuẩn vàng)

Nguồn: del Rio-Chanona R. M., Mealy P., Beguerisse-Díaz M., Lafond F., Farmer J. D. (2021). "Occupational mobility and automation: a data-driven network model". Journal of the Royal Society Interface 18: 20200898. DOI 10.1098/rsif.2020.0898. PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC7879770/. Dữ liệu và code: https://zenodo.org/record/4305783. Nhãn: **toàn văn** (bản PMC); nội dung kho Zenodo **chưa xác nhận** (chưa tải).

- Chuyển nghề Mỹ từ CPS (IPUMS) 2010–2017, 464 nghề, mạng **có hướng có trọng số**: A_ij = (1 − r)·P_ij, P_ij = xác suất người rời nghề i chuyển sang nghề j.
- Mạng thực nghiệm làm thất nghiệp cân bằng cao hơn mạng "đầy đủ" không ràng buộc kỹ năng (bài ghi 5.3% so với 4.1%), tức cấu trúc chuyển nghề bị kỹ năng ràng buộc mạnh.
- Bài này **không** so mạng chuyển nghề với độ giống O*NET.
- Ý nghĩa cho JobQuest: đây là ma trận chuyển nghề công khai, có hướng, dùng làm chuẩn vàng để kiểm "độ giống nghề suy ra từ bảng quy đổi keyword" (sau khi nối mã nghề CPS ↔ O*NET-SOC).

### 2.4 Embedding và đồng xuất hiện có khớp nhau không?

- Chưa tìm được bài bình duyệt nào báo cáo trực tiếp tương quan giữa độ giống kỹ năng bằng embedding (SBERT) và θ đồng xuất hiện trên cùng tập kỹ năng. Nhãn: **chưa xác nhận** (tìm kiếm mở rộng ngày 22/10/2026 không ra).
- Bằng chứng gián tiếp mạnh nhất là báo cáo O*NET 2022 (mục 2.1): embedding task/DWA tốt hơn TF/TF-IDF nhưng một mình nó sai có hệ thống ở nghề có câu chữ chung (dạy học, quản lý), phải bổ sung tín hiệu Knowledge. Suy luận: embedding đo **giống về chữ/nghĩa**, θ đo **hay đi cùng nhau**; hai cái bổ sung cho nhau và JobQuest nên tự đo mức khớp trên dữ liệu của mình (xem mục 5).

## 3. Tính bất đối xứng (A giúp B nhưng B không giúp A)

### 3.1 Hosseinioun, Neffke, Zhang, Youn 2025, Nature Human Behaviour: phụ thuộc kỹ năng lồng nhau

Nguồn: Hosseinioun M., Neffke F., Zhang L., Youn H. (2025). "Skill dependencies uncover nested human capital". Nature Human Behaviour 9: 673–687. Bản arXiv 2303.15629 (đọc v4 HTML: https://arxiv.org/html/2303.15629v4). Trang CSH: https://csh.ac.at/publication/skill-dependencies-uncover-nested-human-capital/. Nhãn: **toàn văn** (bản preprint arXiv v4, có thể khác chi tiết so với bản in NHB).

- Dữ liệu: O*NET 2005 và 2019, 120 mô tả (knowledge + skills + abilities), dùng **level** (tương quan với importance 0.94). Nhị phân hoá ma trận nghề × kỹ năng bằng disparity filter (α_in = 0.4, α_out = 0.275). Kiểm chứng trên ~70 triệu chuyển việc từ ~20 triệu hồ sơ Burning Glass 2007–2020.
- Bước 1, lọc cặp đồng xuất hiện có ý nghĩa (Eq.5, siêu bội): `z(u,v) = (N(u,v) − μ)/σ > z_th`, `μ = N(u)N(v)/|O|`, `σ² = μ · (|O|−N(v))/|O| · (|O|−N(u))/(|O|−1)`; N(u) = số nghề cần u, |O| = tổng số nghề. Chọn z_th = 4.75.
- Bước 2, chiều phụ thuộc (Eq.6): giữ cạnh khi `|P(u|v) − P(v|u)| > (k_max / min(k_u,k_v)) · α_th`, α_th = 0.05; k = bậc của kỹ năng trong mạng.
- Bước 3, trọng số cạnh (Eq.7): `w = (min(k_u,k_v)/k_max) · (N(u,v)/N(v) − N(u,v)/N(u))`, tức hiệu hai xác suất có điều kiện P(u|v) − P(v|u).
- Diễn giải: nếu hầu như nghề nào cần v cũng cần u (P(u|v) cao) mà u lại xuất hiện ở nhiều nghề không cần v, thì u là kỹ năng **nền** và v **phụ thuộc** u. Kết quả: 31 kỹ năng chung, 43 trung gian, 46 chuyên biệt; kỹ năng "lồng" đúng cấu trúc có lương cao hơn, cần học lâu hơn, ít bị tự động hoá; người đi làm thường tích luỹ kỹ năng chung trong 3 công việc đầu rồi mới chuyên sâu.
- Ý nghĩa cho JobQuest (suy luận của người ghi, không phải kết luận của bài): credit chiều A → B nên tỷ lệ với **P(B | A)** = tỷ lệ nghề cần A cũng cần B. Có kỹ năng chuyên sâu v thì gần như chắc đã có nền u (P(u|v) cao → credit v→u cao); có nền u thì chưa chắc có v (P(v|u) thấp → credit u→v thấp). Đây là cách tự nhiên để có bảng **bất đối xứng** từ cùng một ma trận nghề × keyword.

### 3.2 Bằng chứng bất đối xứng khác

- Dawson et al. 2021 (mục 1.2): chuyển nghề bất đối xứng, xử lý bằng đặc trưng nghề nguồn/đích; ví dụ quản lý tài chính → nhân viên kế toán dễ hơn chiều ngược. Nhãn: **toàn văn**.
- del Rio-Chanona et al. 2021 (mục 2.3): mạng chuyển nghề CPS là mạng có hướng, A_ij ≠ A_ji. Nhãn: **toàn văn**.
- Neffke et al. 2017 (mục 1.3): R_ij tính theo dòng có hướng. Nhãn: **toàn văn**.
- ESCO `hasEssentialSkill` giữa hai kỹ năng là quan hệ có hướng do chuyên gia gán (mục 2.2). Nhãn: **trang chính thức**.
- Kết luận của người ghi: có hai cách lấy chiều: (a) từ dữ liệu, hiệu P(B|A) − P(A|B) trên ma trận nghề × kỹ năng (Hosseinioun); (b) từ chuyên gia, quan hệ essential của ESCO. Cách (a) làm được ngay trên O*NET; cách (b) dùng để đối chiếu.

### 3.3 Nguồn chưa đọc được / chỉ đọc tóm tắt

- Anderson K. A. (2017). "Skill networks and measures of complex human capital". PNAS 114(48): 12720–12724. DOI 10.1073/pnas.1706597114. Nhãn: **tóm tắt**. Mạng kỹ năng từ Upwork: hai kỹ năng nối nhau nếu một người có cả hai hoặc một job cần cả hai; người có kỹ năng đa dạng **và dùng kết hợp** được trả cao nhất. Bổ sung cho ý "bổ trợ" của θ, không cho công thức credit.
- Mealy P., del Rio-Chanona R. M., Farmer J. D. (2018). "What you do at work matters: new lenses on labour". Nhãn: **chưa xác nhận** (không tìm được bản gốc trong phiên này; không dùng số liệu nào từ bài).

## 4. Đổi điểm giống nhau thành tỷ lệ credit: tiền lệ công nhận tín chỉ

### 4.1 ECTS Users' Guide 2015 + Công ước Lisbon

Nguồn: European Commission (2015). ECTS Users' Guide, mục 4 (Recognition). https://education.ec.europa.eu/sites/default/files/document-library-docs/ects-users-guide_en.pdf. Nhãn: **trang chính thức**, **toàn văn** mục 4.

- Công nhận dựa trên **"compatibility of learning outcomes rather than equivalence of course contents"**; không kỳ vọng hai học phần giống hệt. Tín chỉ đạt cho kết quả học tập tương thích thay cho số tín chỉ tương ứng ở nơi cấp bằng.
- Trích Công ước Lisbon (1997, hiệu lực 1999), điều 36–37 qua Guide: chỉ **khác biệt căn bản** mới dẫn tới **công nhận một phần** hoặc không công nhận; gánh nặng chứng minh khác biệt căn bản thuộc về bên công nhận.
- Ý nghĩa: (a) có tiền lệ chính thức cho **3 mức**: công nhận đủ / một phần / không; (b) nguyên tắc "mặc định công nhận trừ khi có khác biệt căn bản" ủng hộ việc cho credit rộng tay với keyword gần nghĩa. Nhưng ECTS **không** đưa công thức hay tỷ lệ % cho công nhận một phần.

### 4.2 Việt Nam: Quy chế đào tạo đại học (Thông tư 08/2021/TT-BGDĐT), Điều 13

Nguồn: Bộ GD&ĐT (2021). Quy chế đào tạo trình độ đại học, ban hành kèm Thông tư 08/2021/TT-BGDĐT, Điều 13 "Công nhận kết quả học tập và chuyển đổi tín chỉ". Bản đọc: https://caselaw.vn/van-ban-phap-luat/365862-thong-tu-so-08-2021-tt-bgddt-ngay-18-03-2021-cua-bo-truong-bo-giao-duc-va-dao-tao-ve-quy-che-dao-tao-trinh-do-dai-hoc; bản gốc PDF trên vbpl.vn. Nhãn: **thứ cấp** (đọc qua caselaw.vn, chưa mở PDF gốc).

- Hội đồng chuyên môn xét trên cơ sở "đối sánh chuẩn đầu ra, nội dung và khối lượng học tập, cách thức đánh giá học phần"; công nhận theo từng học phần, nhóm học phần, hoặc cả chương trình.
- Khoản 3: khối lượng tối đa được công nhận, chuyển đổi **không vượt quá 50%** khối lượng học tập tối thiểu của chương trình.
- Ý nghĩa cho JobQuest (tương tự, không phải bằng chứng thực nghiệm): một **trần** cho phần credit đến từ quy đổi là có tiền lệ chính sách; con số 50% trùng với ngưỡng nhảy nghề của game, nên cần quyết định rõ: credit quy đổi một mình có được phép đủ để nhảy hay không.

### 4.3 Úc: specified / unspecified credit

Nguồn: Flinders University, Credit Policy (định nghĩa theo AQF Qualifications Pathways Policy 2013). https://www.flinders.edu.au/content/dam/documents/staff/policies/academic-students/credit-policy.pdf. Nhãn: **trang chính thức** (chính sách một trường; bản AQF gốc chưa đọc).

- Credit = giá trị gán cho việc công nhận **tương đương về nội dung và kết quả học tập**. Phân biệt *specified credit* (tính vào học phần bắt buộc), *unspecified credit* (chỉ tính vào học phần tự chọn), *block credit* (cả khối). Chính sách không nêu ngưỡng % tương đương.
- Ý nghĩa: tiền lệ cho ý "học liên quan nhưng không trùng thì chỉ được tính vào phần mềm (tự chọn), không thay được phần lõi". Trong game: credit quy đổi có thể bị loại khỏi keyword **lõi** (mức 3) của nghề đích.

### 4.4 Kết luận mục 4

- Không tìm thấy nguồn chính thức nào quy định **tỷ lệ số** (ví dụ 0.5) cho "kỹ năng liên quan". Mọi con số credit trong JobQuest là **lựa chọn thiết kế**, phải được hiệu chỉnh và kiểm chứng (mục 5), không được trình bày như chuẩn quốc tế.
- Tiền lệ có thật: (1) ba mức đủ / một phần / không (Lisbon, ECTS); (2) trần tổng phần công nhận (VN 50%); (3) credit liên quan không thay được phần lõi (unspecified credit).

## 5. Quy trình kiểm chứng

### 5.1 Các chuẩn có thể dùng

| Chuẩn | Dùng để kiểm | Nguồn | Mốc tham chiếu đã công bố |
|---|---|---|---|
| Chuyển nghề thật vs mẫu ngẫu nhiên | Độ giống tập kỹ năng có dự báo chuyển nghề không | Dawson et al. 2021 | Chỉ dùng khoảng cách kỹ năng: accuracy 73% (cân bằng 50/50); Cohen's d = 0.42 |
| Mạng chuyển nghề CPS có hướng | Chiều bất đối xứng | del Rio-Chanona et al. 2021 (Zenodo 4305783) | Không có mốc cho bài toán này |
| O*NET Related Occupations (Primary-Short 1–5, Primary-Long 6–10, Supplemental 11–20) | Danh sách nghề "gần" suy ra từ bảng quy đổi có khớp danh sách chính thức không | Dahlke et al. 2022; data dictionary O*NET | Chuyên gia thay 5.8%–13.8% trong top-10 của chính O*NET |
| Bookmarking chuyên gia | Đặt ngưỡng | Dahlke et al. 2022 | Điểm dừng trung vị ở percentile 93 |
| Độ đồng thuận người chấm | Độ tin của bảng chuyên gia | Krippendorff, ngưỡng α ≥ 0.800 (tin được), ≥ 0.667 (tạm kết luận) | Nhãn: **thứ cấp** (qua Wikipedia và bảng trong PMC10173677; chưa đọc Krippendorff 2004 gốc) |

### 5.2 Ghi chú

- Chưa có benchmark công khai nào cho "bảng quy đổi kỹ năng ↔ kỹ năng" theo nghĩa game; benchmark chỉ có ở **cấp nghề**. Vì vậy cách kiểm chứng hợp lý là: từ bảng keyword suy ra độ giống nghề, rồi so với chuẩn cấp nghề.
- Lỗi đã biết phải dò: keyword quá chung (giống "teaching", "managing") làm mọi nghề cùng nhóm thành "gần" (Dahlke et al. 2022); chênh Job Zone là lý do chuyên gia sửa nhiều nhất.

## Đề xuất cho JobQuest

Phần này là **đề xuất thiết kế của người ghi**, ghép từ các phương pháp đã kiểm ở trên. Các ngưỡng là **giá trị khởi đầu để hiệu chỉnh**, không phải chuẩn đã công bố.

### A. Dữ liệu

1. Tính thống kê trên **toàn bộ nghề data-level của O*NET 31.0** (khoảng 900 nghề), không chỉ 221 nghề của game, để xác suất có điều kiện đỡ nhiễu.
2. Mỗi keyword JobQuest nối với 1 hoặc vài phần tử O*NET: Knowledge (33), Skills kỹ thuật, DWA/IWA, Technology Skills (commodity). Ma trận nghề × keyword:
   - Knowledge, Skills (có Importance): RCA theo Alabdulkareem trên importance, `e(o,k) = 1 nếu RCA(o,k) > 1`.
   - DWA, Technology Skills (có/không): x(o,k) nhị phân, RCA theo Dawson, `e(o,k) = 1 nếu RCA ≥ 1`.
   - Keyword nối nhiều phần tử: e(o,k) = 1 nếu ít nhất một phần tử có e = 1.
   - Bỏ keyword có N(k) = Σ_o e(o,k) < 5 (theo ngưỡng ≥ 5 của Dawson) khỏi phần quy đổi tự động; chỉ cho quy đổi qua duyệt tay.

### B. Công thức credit có hướng

- `N(A) = Σ_o e(o,A)`, `N(A,B) = Σ_o e(o,A)·e(o,B)`.
- **Điểm chuyển giao A → B**: `s(A→B) = P(B|A) = N(A,B) / N(A)` (tỷ lệ nghề dùng A cũng dùng B). Chiều ngược dùng `P(A|B)`. Bất đối xứng có sẵn: có kỹ năng chuyên (ít nghề dùng) thì gần như chắc có kỹ năng nền đi kèm, chiều ngược thì không (Hosseinioun et al. 2025).
- **Lọc ngẫu nhiên**: chỉ giữ cặp có `z(A,B) ≥ 3` theo Eq.5 Hosseinioun (siêu bội). Bài gốc dùng 4.75; với keyword thưa hơn nên thử 2, 3, 4.75 và báo độ nhạy. Cặp không đạt: s = 0.
- **Đổi thành hệ số credit c(A→B)** theo 4 bậc:

| Bậc | Điều kiện | c |
|---|---|---|
| Trùng | A = B, hoặc đồng nghĩa đã được chuyên gia xác nhận (cùng phần tử O*NET; gợi ý ứng viên bằng SBERT cosine cao giữa mô tả tiếng Anh) | 1.0 |
| Mạnh | s(A→B) ≥ 0.75, hoặc ESCO ghi B là essential skill của A | 0.5 |
| Yếu | 0.5 ≤ s(A→B) < 0.75 | 0.25 |
| Không | còn lại | 0 |

  Lý do chọn trần 0.5 cho mọi keyword không trùng: credit quy đổi một mình chỉ chạm đúng ngưỡng nhảy 50% trong trường hợp cực đoan (mọi keyword đích đều có keyword "mạnh" ở đủ mức), nên lần nhảy bình thường vẫn cần một phần kỹ năng trùng thật. Tương tự trần 50% công nhận tín chỉ trong Thông tư 08/2021 (tương tự chính sách, không phải bằng chứng).
  Chọn bậc rời thay cho hệ số liên tục: dễ giải thích cho người chơi và dễ cho chuyên gia chấm (giống ba mức đủ / một phần / không của Lisbon–ECTS).

### C. Xử lý mức (1 Làm quen, 2 Thành thạo, 3 Chuyên sâu)

- Mức hiệu dụng của keyword đích B:
  `have*(B) = max( have(B), max_A [ c(A→B) · have(A) ] )`
- Coverage giữ nguyên công thức game: `coverage = Σ_B min(have*(B), need(B)) / Σ_B need(B)`, tính với số thập phân.
- Dùng **max, không cộng dồn**: nhiều keyword yếu không cộng thành thạo.
- Hệ quả: Chuyên sâu (3) ở A mạnh-liên-quan cho 1.5 ở B (giữa Làm quen và Thành thạo); chỉ trùng thật mới đạt mức 3 ở B. Tuỳ chọn thêm (giống *unspecified credit*): không cho credit quy đổi vào keyword need = 3 của nghề đích.

### D. Quy trình kiểm chứng chạy trên O*NET 31.0

1. **V0, thống kê sức khoẻ**: số keyword đủ N ≥ 5; phân phối s; tỷ lệ cặp bất đối xứng mạnh (|P(B|A) − P(A|B)| ≥ 0.25); top-10 keyword có N lớn nhất (nguy cơ keyword "chung" kiểu teaching/managing làm mọi nghề cùng nhóm thành gần nhau).
2. **V1, chấm chuyên gia + đồng thuận**: lấy mẫu phân tầng ~150 cặp có hướng (≈ 35 mỗi bậc + 10 cặp ngẫu nhiên); 3 người chấm độc lập (2 thành viên nhóm + 1 người ngoài, ví dụ GVHD) gán bậc {0, 0.25, 0.5, 1}. Tính Krippendorff α (ordinal): dưới 0.667 thì sửa định nghĩa bậc và chấm lại; ≥ 0.8 là tốt. So đa số chuyên gia với thuật toán: tỷ lệ cặp bị đổi bậc (tham chiếu mềm: chuyên gia O*NET thay 5.8–13.8% danh sách top-10).
3. **V2, đặt ngưỡng bằng bookmarking** (như O*NET 2022): xếp các cặp đạt z theo s, lấy 10 cặp mỗi percentile từ 50 đến 100; mỗi người dừng ở chỗ "hết thấy liên quan" và chỗ "hết thấy liên quan mạnh"; τ_yếu và τ_mạnh = trung vị điểm dừng. Thay 0.5 / 0.75 khởi đầu bằng giá trị này.
4. **V3, khớp với O*NET Related Occupations** (cột Relatedness Tier): với mỗi nghề i trong 221 nghề, tính coverage chỉ-quy-đổi từ toàn bộ keyword của i (ở mức cao nhất của i) sang cấp đầu của mọi nghề j; xếp hạng j. Báo (a) AUC phân biệt cặp Primary-Short/Primary-Long với cặp còn lại, (b) recall@10. So với **hai đường cơ sở**: chỉ tính keyword trùng (c = 1 hoặc 0), và θ đối xứng. Yêu cầu tối thiểu: bảng quy đổi tốt hơn đường cơ sở "chỉ trùng" (bootstrap theo nghề). Lưu ý tính vòng: Related Occupations cũng dựng từ task/DWA/Knowledge, nên phải có thêm V4.
5. **V4, kiểm chiều bằng chuyển nghề thật**: nối 464 nghề CPS của del Rio-Chanona et al. (Zenodo 4305783) sang O*NET-SOC; với cặp có chuyển cả hai chiều và chênh rõ, kiểm `sign(cov(i→j) − cov(j→i)) = sign(P_ij − P_ji)`; báo tỷ lệ khớp so với mốc may rủi 50%. Thêm kiểm Job Zone: chiều "dễ" theo bảng quy đổi có thường đi từ Job Zone cao xuống thấp không (như ví dụ Finance Manager → Accounting Clerk của Dawson). Tuỳ chọn: tái hiện thử nghiệm của Dawson (chuyển thật vs ngẫu nhiên, mốc 73% khi chỉ dùng khoảng cách kỹ năng).
6. **V5, sức khoẻ game**: đồ thị nhảy nghề ở ngưỡng 50%: không nghề nào bị cô lập, không nghề "trung tâm" nhận nhảy từ quá nhiều nghề; soát tay 10 nghề có bậc vào cao nhất.
7. **Cặp lệch giữa dữ liệu và chữ**: tính SBERT cosine (O*NET 2022 dùng `nli-distilroberta-base-v2`) trên mô tả tiếng Anh của phần tử O*NET; đưa vào danh sách duyệt tay các cặp s cao nhưng cosine thấp, và cặp cosine cao nhưng s = 0. Không đưa cosine trực tiếp vào công thức, vì O*NET 2022 cho thấy chữ giống chưa chắc cùng chuyên môn.

### E. Câu nên viết trong báo cáo

"Hệ số quy đổi keyword dựa trên xác suất có điều kiện đồng xuất hiện trên ma trận nghề × kỹ năng O*NET (Alabdulkareem et al. 2018; Dawson et al. 2021), lấy chiều theo Hosseinioun et al. (2025), rời rạc hoá thành bốn bậc và hiệu chỉnh ngưỡng bằng chấm chuyên gia (quy trình theo O*NET Related Occupations, Dahlke et al. 2022). Các ngưỡng là lựa chọn thiết kế đã được kiểm chứng, không phải chuẩn quốc tế."
