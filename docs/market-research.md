# BÁO CÁO ĐÁNH GIÁ THỊ TRƯỜNG HƯỚNG NGHIỆP CHO HỌC SINH THPT TẠI VIỆT NAM — SO SÁNH VỚI THẾ GIỚI
### (Bản DRAFT phục vụ Capstone Project — gửi giảng viên hướng dẫn)

> *Ghi chú gửi cô: Đây là bản draft, cấu trúc bám theo hành trình (customer journey) của học sinh cấp 3, chia 3 giai đoạn, mỗi giai đoạn có so sánh Việt Nam ↔ thế giới. Các số liệu đã ghi rõ nguồn để em bổ sung trích dẫn chuẩn ở bản cuối. Một vài số cần em kiểm chứng lại sát ngày nộp (đã đánh dấu ở phần Caveats).*

---

## TL;DR
- **Nhu cầu rất lớn, cung chính quy gần như trống.** Mỗi năm hơn 1,16 triệu thí sinh thi tốt nghiệp THPT và khoảng 60% học sinh chọn sai ngành (khảo sát Falmi 2019), nhưng theo Bộ GD&ĐT chỉ khoảng 5% trường phổ thông có cán bộ tư vấn tâm lý chuyên trách — phần lớn học sinh phải tự "bơi" bằng công cụ miễn phí trên mạng, hoặc rơi vào các dịch vụ phi khoa học (sinh trắc vân tay DMIT, thần số học, tử vi) đang có doanh thu thật 1,3–3,5 triệu đồng/lượt.
- **Việt Nam thiếu hẳn một nền tảng tích hợp toàn trình** (self-discovery → chọn ngành → chọn trường) như O*NET/YouScience/Naviance/Xello (Mỹ) hay UCAS/Unifrog (Anh). Ở Việt Nam mỗi mảnh (trắc nghiệm, thông tin ngành, tra cứu điểm chuẩn) đang bị làm rời rạc bởi các bên khác nhau và không bên nào trung lập + toàn trình.
- **Ý tưởng web app "trắc nghiệm tính cách → gợi ý ngành → tổng hợp thông tin trường" đúng khoảng trống và khả thi** với một sinh viên full-stack, nhưng chỉ khác biệt được nếu: (1) dùng công cụ có căn cứ khoa học (**Holland RIASEC/Big Five** thay vì chỉ MBTI), (2) tích hợp **dữ liệu điểm chuẩn/phương thức xét tuyển Việt Nam** mà các nền tảng quốc tế không có, và (3) **định vị trung thực về khoa học** để tách khỏi các dịch vụ mê tín.

---

## Key Findings

1. **Quy mô cầu khổng lồ.** Kỳ thi tốt nghiệp THPT 2025 có 1.165.289 thí sinh đăng ký (Bộ GD&ĐT, tính đến 17h ngày 27/6/2025), tăng gần 100.000 so với 2024; 96,33% là học sinh lớp 12 theo chương trình GDPT 2018.

2. **Cung tư vấn chuyên nghiệp gần như trống.** Theo Bộ GD&ĐT (báo cáo tại kỳ họp Quốc hội giữa 2025, dẫn trên VOV2 và Phụ Nữ Việt Nam), tính đến cuối 2024 mới có khoảng **5% trường phổ thông có cán bộ tư vấn tâm lý chuyên trách**, phần còn lại là giáo viên kiêm nhiệm; nhu cầu ước tính **trên 52.000 người** trên tổng số ~52.000 cơ sở giáo dục phổ thông. Đây là khoảng trống thị trường lớn nhất. *(Em nên kiểm chứng lại chính xác ngày/phiên phát biểu và con số này trước khi nộp — xem Caveats.)*

3. **Học sinh chọn ngành chủ yếu theo cảm tính.** Theo ThS Trần Anh Tuấn (Phó Giám đốc Trung tâm Dự báo nhu cầu nhân lực và Thông tin thị trường lao động TP.HCM — Falmi, dẫn trên Dân trí): *"tỷ lệ học sinh chọn sai ngành học chiếm khoảng 60%"*; *"Chỉ có khoảng 5% học sinh hiểu biết về ngành mình chọn học, 20% hiểu một cách tương đối và đến 75% thiếu hiểu biết về ngành mình chọn"*. Hệ quả: tỷ lệ sinh viên bị cảnh cáo học vụ/đình chỉ ở nhiều trường là 10–23%.

4. **Công cụ khoa học tốt nhất lại miễn phí và có sẵn.** O*NET Interest Profiler (Bộ Lao động Mỹ, dựa trên Holland RIASEC) hoàn toàn miễn phí và có license mở cho developer. Big Five (OCEAN) là "chuẩn vàng" học thuật (test-retest reliability 0,80–0,90; McCrae & Costa, 2003). MBTI/16Personalities phổ biến nhưng độ tin cậy thấp — 39–76% người nhận type khác khi làm lại chỉ sau 5 tuần (David Pittenger, 2005).

5. **Thị trường "khám phá bản thân" ở Việt Nam đang bị chi phối bởi dịch vụ phi khoa học có doanh thu thật.** Sinh trắc vân tay (DMIT) giá 1,3–3,5 triệu đồng/báo cáo; có 70+ công ty tại Việt Nam chỉ tính riêng dùng phần mềm Viking; VMIT tự công bố phục vụ 100.000+ khách hàng. Khoa học đã bác bỏ DMIT (Hội Tâm thần học Ấn Độ: "không dựa trên bằng chứng khoa học"; thuyết đa trí thông minh của Gardner bị gọi là "neuromyth" trên Frontiers in Psychology, 2023).

6. **Không có nền tảng tích hợp toàn trình.** Các mảnh rời rạc: trắc nghiệm (JobWay, aihuongnghiep.com, Career Passport), tra cứu tuyển sinh (tuyensinhso.vn, tuyensinh247, hotrotuyensinh.com), chatbot của từng trường (UEH, HUIT, HUTECH). Chưa có "một cửa" nối personality → ngành → trường như Naviance/Unifrog.

7. **AI/LLM là làn sóng nóng nhất.** Hàng loạt trường ĐH ra mắt chatbot tư vấn tuyển sinh 2025 (UEH AI Chatbot ra mắt 4/2025; HUIT Chatbot LLM+RAG đạt độ chính xác >95%). Edtech Việt Nam ~5 tỷ USD, ~750 doanh nghiệp, top 3 Đông Nam Á.

---

## Details

### Bối cảnh & quy mô thị trường (Market Size & Context)

- **Số thí sinh:** Thi tốt nghiệp THPT 2025: 1.165.289 thí sinh đăng ký (Bộ GD&ĐT, đến 17h 27/6/2025), tăng gần 100.000 so với 2024; 96,33% là học sinh lớp 12 GDPT 2018. Riêng TP.HCM ~99.578, Hà Nội ~124.000.
- **Xét tuyển đại học:** 2025 là năm bỏ xét tuyển sớm, dùng tất cả phương thức trong đợt 1; từ 2026 mỗi trường được tối đa 5 phương thức (điểm thi THPT, học bạ, ĐGNL, ĐGTD, xét tuyển kết hợp/tổng hợp...). Sự phức tạp này làm tăng nhu cầu công cụ hỗ trợ tra cứu, tính điểm, so sánh.
- **Quy mô giáo dục:** Theo ông Tô Hồng Nam, Phó Cục trưởng Cục Khoa học, Công nghệ và Thông tin, Bộ GD&ĐT: Việt Nam có *"22 triệu học sinh, sinh viên, 1,6 triệu giáo viên; 53.000 trường mầm non, phổ thông và gần 400 trường đại học... chiếm khoảng 1/4 dân số cả nước"*.
- **Edtech:** Theo **Sách trắng Công nghệ Giáo dục Việt Nam 2025 (EdTech Agency)**: quy mô thị trường EdTech Việt Nam ước tính ~5 tỷ USD, tổng doanh thu 2024 ~360 triệu USD; ~750 doanh nghiệp EdTech; Việt Nam trong top 10 nước tăng trưởng nhanh nhất thế giới và top 3 thị trường tiềm năng nhất Đông Nam Á (cùng Singapore và Indonesia). Vốn đầu tư vào startup EdTech Việt Nam năm 2024 khoảng 200 triệu USD (Sách trắng, dẫn trên Diễn đàn Doanh nghiệp). Tuy nhiên ~80% doanh nghiệp EdTech tập trung K-12 học thuật (luyện thi, ngoại ngữ), **rất ít làm hướng nghiệp bài bản** — đây chính là mảng trống.

---

### GIAI ĐOẠN 1 — TÌM HIỂU TÍNH CÁCH / ĐỊNH HƯỚNG BẢN THÂN

**A. Các công cụ trắc nghiệm khoa học (đánh giá độ tin cậy):**

- **MBTI / 16Personalities (16personalities.com):** Phổ biến nhất ở giới trẻ Việt Nam nhưng có vấn đề khoa học. 16Personalities thực chất KHÔNG phải MBTI thuần: nó dùng hệ chữ cái MBTI nhưng chấm điểm theo mô hình lai dựa trên Big Five (thêm chiều thứ 5 "Assertive/Turbulent"). MBTI bị phê phán vì test-retest reliability thấp — theo David Pittenger (2005), 39–76% người nhận type khác khi làm lại sau 5 tuần; National Academy of Sciences (1991) từng review và kết luận thiếu bằng chứng. **Điểm mạnh:** dễ tiếp cận, ngôn ngữ thân thiện, tạo động lực tự khám phá → phù hợp làm "cửa vào" nhưng không nên dùng để ra quyết định nghề nghiệp nghiêm túc.
- **Big Five / OCEAN:** Chuẩn vàng học thuật. Test-retest reliability 0,80–0,90 (McCrae & Costa, 2003); dự báo tốt kết quả học tập và hiệu suất công việc (meta-analysis Barrick & Mount, 1991: Conscientiousness dự báo hiệu suất ở hầu hết ngành nghề). **Nhược điểm:** kết quả dạng "phổ" khó hiểu với học sinh, không có "nhãn" hấp dẫn như MBTI.
- **Holland Code (RIASEC):** Mô hình 6 nhóm (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) của John Holland — nền tảng lý thuyết "person-environment fit". **Đây là mô hình phù hợp nhất cho hướng nghiệp** vì trực tiếp nối sở thích → nghề. O*NET Interest Profiler dựa trên RIASEC; nghiên cứu German O*NET IP cho thấy hit-rate dự báo lựa chọn nghề 35–45%.
- **CliftonStrengths (StrengthsFinder):** 34 talent themes; hồ sơ thực nghiệm hỗn hợp, dùng nhiều trong doanh nghiệp, có phí.
- **DISC:** Đơn giản hoá, chủ yếu dùng trong môi trường công việc.

**B. Các hình thức phi khoa học / dân gian phổ biến ở Việt Nam:**

- **Sinh trắc học vân tay (Dermatoglyphics / DMIT):** Thị trường thật, có doanh thu. Giá phổ biến 1,3–3,5 triệu đồng/báo cáo (Umit 3,3 triệu; DmitVN khuyến mãi 1,925 triệu từ giá niêm yết 3,85 triệu; Ichiko từ 1,3 triệu; một số trung tâm tới 5,6 triệu/lần, theo điều tra của Dân trí). VMIT (hoạt động từ 2011) tự công bố *"đã phục vụ hơn 100.000 khách hàng trên khắp 63 tỉnh thành"* với 128+ văn phòng. Viking Software đã chuyển giao (OEM) phần mềm DMIT.US cho *"hơn 700 công ty trên toàn cầu trong đó có hơn 70 công ty tại Việt Nam"* (Dân trí, 2019). Các trung tâm quảng cáo "độ chính xác 90–95%" nhưng đây chỉ là con số marketing tự công bố. **Khoa học bác bỏ:** Hội Tâm thần học Ấn Độ (IPS) tuyên bố *"DMIT không dựa trên bằng chứng khoa học... không dùng được để đo trí thông minh, chức năng não bộ, dự đoán hành vi tương lai"*; thuyết đa trí thông minh của Gardner (nền tảng DMIT) bị bài báo trên Frontiers in Psychology (Waterhouse, 2023) gọi là "neuromyth". Chuyên gia Việt Nam cảnh báo đây thực chất là "xem bói qua máy tính".
- **Thần số học (Numerology / "Nhân số học"):** Bùng nổ 5–7 năm gần đây, được MC Lê Đỗ Quỳnh Hương phổ biến (đổi tên thành "Nhân số học" cho "có mùi khoa học"). Trend "Năm thế giới số 1" 2026 lan truyền mạnh trên mạng xã hội (Tuổi Trẻ, 10/2025). Nhiều web tra cứu miễn phí + khoá học có phí. Bản chất là pseudoscience (cold reading), không có căn cứ.
- **Tử vi, tướng số:** Vẫn phổ biến trong văn hoá, đặc biệt ở phụ huynh.

**SO SÁNH GIAI ĐOẠN 1 — Thế giới ↔ Việt Nam**

| Khía cạnh | Thế giới (Mỹ/Anh/EU) | Việt Nam |
|---|---|---|
| Công cụ chuẩn | O*NET Interest Profiler (miễn phí, RIASEC), YouScience (aptitude brain games), Big Five | Chủ yếu MBTI/16Personalities miễn phí trên mạng; Holland rải rác trong JobWay |
| Người hỗ trợ | Career counselor chuyên nghiệp tại trường (benchmark ASCA khuyến nghị 250 HS/counselor) | ~5% trường có cán bộ tư vấn chuyên trách; còn lại giáo viên kiêm nhiệm |
| Cơ sở khoa học | Aptitude + interest, có kiểm định tâm trắc | Lẫn lộn khoa học và mê tín (DMIT, thần số học có doanh thu thật) |
| Chi phí | Nhiều công cụ miễn phí do nhà nước tài trợ | Miễn phí (mạng) HOẶC trả 1–3,5 triệu cho dịch vụ phi khoa học |

---

### GIAI ĐOẠN 2 — TÌM HIỂU & CHỌN NGÀNH HỌC

- **Vấn đề cốt lõi:** Học sinh Việt Nam không có công cụ tin cậy nối tính cách/sở thích → ngành → nghề → thị trường lao động. Nhiều khảo sát cho thấy 65,4% sinh viên năm nhất chưa hiểu mục đích ngành mình học; 50,8% không biết ra trường làm gì.
- **Thế giới làm gì:**
  - **O*NET OnLine / My Next Move:** Kết quả RIASEC nối trực tiếp tới 900+ nghề, có mô tả công việc, kỹ năng, mức lương, triển vọng.
  - **YouScience:** Đo aptitude (năng lực bẩm sinh) qua "brain games" (dựa Ball Aptitude Battery) thay vì chỉ interest, rồi nối tới 500 nghề từ O*NET. Điểm hay: phát hiện "aptitude-interest gap" (ví dụ nữ sinh có aptitude cho ngành kỹ thuật cao gấp ~4 lần interest). Dùng bởi >9.000 trường/tổ chức ở Mỹ.
  - **CareerExplorer, Xello:** Nối interest → career → college pathway, có kế hoạch dài hạn theo từng lớp.
- **Việt Nam có gì (đối thủ trực tiếp của ý tưởng):**
  - **JobWay** — "Ứng dụng hướng nghiệp số hoá đầu tiên của VN". Có Holland + MBTI, mô tả ~300 nghề (tham khảo tài liệu ILO), gợi ý trường có đào tạo ngành đó (trường liên kết). *Điểm yếu:* phụ thuộc trường liên kết, thiếu dữ liệu điểm chuẩn realtime.
  - **aihuongnghiep.com (Career Advisor)** — MBTI/Big Five/RIASEC + AI gợi ý nghề + chat 24/7. Đây là đối thủ đi **đúng hướng ý tưởng của em nhất** → cần theo dõi sát.
  - **hochieunghenghiep.vn (Career Passport)** — tích hợp 5 mô hình + SWOT + IKIGAI, định vị "đặc thù Việt Nam", mô hình freemium.
  - **Hướng nghiệp Sông An** — dùng trắc nghiệm Indigo (AI, TS Ron Bonnstetter), thiên về đào tạo/tư vấn viên hơn là self-service.

**SO SÁNH GIAI ĐOẠN 2 — Thế giới ↔ Việt Nam**

| Khía cạnh | Thế giới | Việt Nam |
|---|---|---|
| Nối personality/aptitude → nghề | O*NET (900+ nghề), YouScience (500 nghề, aptitude) | JobWay (~300 nghề, Holland+MBTI), aihuongnghiep (AI) |
| Dữ liệu nghề | Mức lương, triển vọng, kỹ năng, localised | Chủ yếu mô tả định tính (ILO), thiếu dữ liệu lương VN |
| Đo aptitude (năng lực) | Có (YouScience) | Gần như chưa có (trừ DMIT phi khoa học) |
| Nối ngành → trường VN | Không có dữ liệu VN | JobWay có (trường liên kết) — điểm mạnh nội địa |

---

### GIAI ĐOẠN 3 — CHỌN TRƯỜNG & TUYỂN SINH

- **Cách học sinh Việt Nam hiện tìm thông tin:** Gọi điện từng trường; ngày hội tư vấn tuyển sinh (Tuổi Trẻ, Thanh Niên tổ chức); web tổng hợp (tuyensinhso.vn, diemthi.tuyensinh247.com, hotrotuyensinh.com, huongnghiep360.com); cổng Bộ GD&ĐT (thisinh.thitotnghiepthpt.edu.vn); fanpage/group Facebook, TikTok; và ngày càng nhiều chatbot của từng trường.
- **Thông tin học sinh cần:** Điểm chuẩn các năm, phương thức xét tuyển, học phí, chương trình đào tạo, cơ hội việc làm, học bổng. Đáng chú ý **hotrotuyensinh.com** đã có: 199 nghề (phân loại ILO), tra điểm chuẩn theo ngành, tính điểm xét tuyển kết hợp, phân nhóm "Đỗ chắc / Có khả năng / Khó", bảng bách phân vị giữa các phương thức — đây là thế mạnh riêng của các web Việt Nam mà nền tảng quốc tế không có.
- **Thế giới:**
  - **Common App (Mỹ):** ~1,5 triệu thí sinh năm nhất (mùa 2024-25), 1.097 trường thành viên, lần đầu vượt 10 triệu đơn (trung bình 6,8 đơn/thí sinh). Nộp một hồ sơ tới nhiều trường.
  - **UCAS (Anh):** Cổng nộp hồ sơ tập trung, tìm theo entry requirements/UCAS points.
  - **BigFuture (College Board):** Miễn phí, search trường theo acceptance rate/SAT/size/location, net price calculator, career quiz, học bổng.
  - **Niche, Cappex:** So sánh trường, review, rankings, "match".
  - **Unifrog:** "Universal destinations platform" — một chỗ so sánh mọi lựa chọn (ĐH Anh, ĐH quốc tế, apprenticeship), lọc theo location/cost/entry requirements/graduate job rates; tích hợp Common App; công cụ viết personal statement/CV; dashboard cho giáo viên; ~4.000 trường dùng; hơn 1,5 triệu shortlist tạo trong năm 2023.
- **Khoảng trống Việt Nam:** Không có cổng nộp hồ sơ tập trung mang tính khám phá như Common App (hệ thống của Bộ chỉ lo đăng ký nguyện vọng/lọc ảo). Thiếu công cụ so sánh trường đa tiêu chí; thiếu dữ liệu outcome (tỷ lệ có việc làm, lương sau tốt nghiệp) minh bạch, chuẩn hoá.

**SO SÁNH GIAI ĐOẠN 3 — Thế giới ↔ Việt Nam**

| Tính năng | Thế giới | Việt Nam |
|---|---|---|
| Nộp hồ sơ tập trung | Common App, UCAS | Cổng Bộ (chỉ nguyện vọng/lọc ảo) |
| So sánh trường đa tiêu chí | Unifrog, Niche, BigFuture | Rời rạc, chủ yếu tra điểm chuẩn |
| Dữ liệu outcome (lương, việc làm) | Có (localised LMI) | Gần như không chuẩn hoá |
| Nối personality→ngành→trường (toàn trình) | Naviance, Xello, Unifrog | Chưa có "một cửa" |
| Tính điểm/xác suất đỗ | (grades-based match) | tuyensinh247, hotrotuyensinh (thế mạnh riêng của VN) |

---

### Cạnh tranh (Competitive Landscape) tại Việt Nam

- **Trắc nghiệm + gợi ý nghề:** JobWay (mạnh: chuyên gia, mô tả nghề ILO; yếu: dữ liệu trường), **aihuongnghiep.com** (AI, đúng hướng nhất — đối thủ cần theo dõi), Career Passport/hochieunghenghiep.vn (đa mô hình), Hướng nghiệp Việt, Hướng nghiệp Sông An (đào tạo).
- **Tra cứu tuyển sinh:** tuyensinhso.vn, diemthi.tuyensinh247.com, hotrotuyensinh.com, huongnghiep360.com — mạnh về dữ liệu điểm chuẩn/tính điểm, yếu về self-discovery.
- **Dịch vụ phi khoa học:** VMIT, Umit, DMIT Vietnam, Gen Talents... (sinh trắc vân tay); các web/khoá numerology.
- **AI chatbot của trường:** UEH AI Chatbot (LLM, ra mắt 4/2025), HUIT Chatbot (LLM+RAG, >95% chính xác), HUTECH, ĐH Công nghiệp TP.HCM, Học viện Hàng không (VAA-BOT) — nhưng chỉ phục vụ trường mình, **không trung lập**.
- **Điểm chung của đối thủ:** Không ai làm trọn vẹn toàn trình personality (khoa học) → ngành → trường (dữ liệu VN realtime) một cách **trung lập, đẹp, dễ dùng**. Đây chính là chỗ trống cho sản phẩm.

### Xu hướng (Trends)

- **AI/LLM vào hướng nghiệp:** Bùng nổ 2025, chatbot RAG dựa dữ liệu tuyển sinh; PowerSchool tích hợp "PowerBuddy" AI vào Naviance; YouScience dùng AI. → Cơ hội: dùng LLM để cá nhân hoá phần giải thích kết quả + hỏi đáp về ngành/trường.
- **Aptitude > interest:** Xu hướng quốc tế (YouScience) chuyển từ chỉ đo sở thích sang đo năng lực bẩm sinh.
- **Bản địa hoá là lợi thế:** CEO Vuihoc nhấn mạnh giáo dục cần bản địa hoá sâu (văn hoá, cách thi cử) — đây là "con hào" (moat) của sản phẩm nội trước đối thủ ngoại như O*NET/Unifrog vốn không có dữ liệu Việt Nam.

---

## Recommendations (Định vị & lộ trình cho sản phẩm)

**Định vị đề xuất:** *"Nền tảng hướng nghiệp toàn trình, có căn cứ khoa học, dữ liệu tuyển sinh Việt Nam"* — nối 3 bước personality → ngành → trường trong một sản phẩm, điều chưa đối thủ nội nào làm trọn và các nền tảng quốc tế (O*NET, Unifrog) không có dữ liệu Việt Nam.

**Giai đoạn 1 (MVP — vừa tầm capstone của 1 full-stack dev):**
1. Dùng **Holland RIASEC làm lõi trắc nghiệm** (miễn phí, license mở của O*NET, có căn cứ khoa học, nối thẳng tới nghề) — KHÔNG chỉ dựa MBTI. Có thể bổ sung MBTI/16-style như "cửa vào" hấp dẫn nhưng ghi rõ giới hạn khoa học.
2. **Map RIASEC → nhóm ngành đào tạo tại VN** (dùng danh mục ngành của Bộ GD&ĐT + tham khảo mô tả nghề ILO như JobWay).
3. **Tổng hợp thông tin trường:** điểm chuẩn 3 năm, phương thức xét tuyển, học phí, chương trình — crawl/nhập từ đề án tuyển sinh công khai.
- *Benchmark chuyển giai đoạn:* hoàn thành luồng 3 bước end-to-end cho ≥50 trường / ≥30 ngành, có ≥30 người dùng thử thật.

**Giai đoạn 2 (khác biệt hoá):**
4. Thêm **LLM giải thích kết quả cá nhân hoá + chatbot hỏi đáp ngành/trường** (RAG trên dữ liệu tuyển sinh) — bắt trend nhưng **trung lập** (không thiên vị một trường như chatbot UEH/HUIT).
5. Thêm **công cụ tính xác suất đỗ / so sánh trường đa tiêu chí** (học từ tuyensinh247 + Unifrog).
6. Cân nhắc **module aptitude nhẹ** (học từ YouScience) để tăng chiều sâu và tách khỏi "chỉ đo sở thích".
- *Benchmark:* tỷ lệ quay lại vào mùa tuyển sinh; số shortlist trường được tạo ra.

**Giai đoạn 3 (mở rộng / mô hình kinh doanh):**
7. B2B2C: bán/tặng cho trường THPT (giải trực tiếp bài toán thiếu ~95% tư vấn viên chuyên trách), kèm dashboard cho giáo viên như Naviance/Unifrog.
8. Nguồn thu: freemium (báo cáo chuyên sâu), affiliate tuyển sinh, license trường.
- *Ngưỡng thay đổi chiến lược:* nếu một đối thủ (vd aihuongnghiep.com) chiếm lĩnh nhanh mảng AI+personality, chuyển trọng tâm sang **thế mạnh dữ liệu trường + B2B trường học** (khó sao chép hơn).

**Nguyên tắc xuyên suốt:** Định vị **trung thực về khoa học** để tách bạch hoàn toàn khỏi DMIT/thần số học — biến "tính khoa học minh bạch" thành điểm bán hàng (ghi rõ nguồn mô hình, độ tin cậy, và luôn nhấn "kết quả để tham khảo, không phải tiên đoán số phận").

---

## Caveats (lưu ý về độ tin cậy dữ liệu — quan trọng cho bản cuối)
- **Con số "~5% trường có cán bộ tư vấn chuyên trách / nhu cầu >52.000 người":** nguồn là phát biểu của lãnh đạo Bộ GD&ĐT tại Quốc hội giữa 2025 (dẫn trên VOV2, Phụ Nữ Việt Nam). Em **cần kiểm chứng lại chính xác ngày/phiên phát biểu và con số** trước khi trích trong bản nộp, vì đây là số liệu trọng yếu của báo cáo.
- **Số liệu dịch vụ sinh trắc vân tay/numerology** (số khách hàng, "độ chính xác 90–95%") là **do doanh nghiệp tự công bố trên trang marketing**, không được kiểm toán độc lập — luôn trình bày dưới dạng "công ty tuyên bố".
- **Quy mô Edtech Việt Nam có sự vênh giữa các nguồn:** Sách trắng Edtech ghi ~5 tỷ USD (doanh thu ~360 triệu USD); nguồn khác (ResearchAndMarkets/Statista, 2023) ghi ~1 tỷ USD; Statista ghi doanh thu online education ~364,7 triệu USD (2024). Nên nêu rõ đây là khoảng ước tính do định nghĩa "thị trường" khác nhau.
- **Con số "60% chọn sai ngành"** từ khảo sát 2019 của Falmi (ThS Trần Anh Tuấn) — lưu ý tính đại diện và độ cũ; nên đối chiếu thêm số liệu mới nếu có.
- **Benchmark ASCA 250:1** nên dẫn trực tiếp từ ASCA (schoolcounselor.org) trong bản cuối thay vì dẫn lại qua trang trung gian.
- Đây là bản **DRAFT**: mọi số liệu cần được kiểm tra lại và cập nhật sát ngày nộp; cần bổ sung danh mục trích dẫn (references) đầy đủ theo chuẩn cô yêu cầu.