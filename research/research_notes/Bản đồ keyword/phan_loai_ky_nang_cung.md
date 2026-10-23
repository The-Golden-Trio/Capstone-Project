# Phân loại kỹ năng cứng cho bản đồ keyword JobQuest

Ngày ghi: 2026-10-22. Ghi chú nghiên cứu, viết dần. Mỗi khẳng định gắn một nguồn mạnh nhất kèm nhãn kiểm chứng:
"toàn văn" (đã đọc trang/văn bản gốc đầy đủ phần liên quan), "tóm tắt" (chỉ đọc tóm tắt/abstract), "thứ cấp" (nguồn khác trích lại), "trang chính thức" (trang web chính thức của tổ chức, đã đọc), "chưa xác nhận" (chưa kiểm được, không dùng làm số liệu).

Câu hỏi: bản đồ keyword kỹ năng cứng cho 221 nghề nên dùng phân loại nào, độ mịn nào, và đổi cấp độ keyword sang 3 mức Làm quen / Thành thạo / Chuyên sâu thế nào.

---

## 1. O*NET 31.0

### 1.1 Thay đổi lớn ở bản 30.3 (đã kế thừa sang 31.0)

- Bản 30.3 "hiện đại hoá" Content Model thành cấu trúc 3 chiều Worker, Job, Market; tệp Skills cũ bị tách thành nhiều tệp; IWA, DWA và cây danh mục phần mềm được đưa vào Content Model Reference; hệ phân cấp phần mềm trước nằm ở "UNSPSC Reference" nay chuyển vào "Content Model Reference"; tệp "Tools Used" và "Work Values" **không còn cập nhật và không còn trong cơ sở dữ liệu** (dùng tạm bản 30.2 nếu cần). Nguồn: O*NET 30.3 Data Dictionary, Appendix 4 Release Notes, https://www.onetcenter.org/dictionary/30.3/text/appendix_updates.html — trang chính thức. Tài liệu ánh xạ cột/tệp cũ sang mới: https://www.onetcenter.org/dl_files/30_3_migration_reference.xlsx — chưa xác nhận (chưa mở, là tệp tải về).
- Tệp "Technology Skills" đổi tên thành "Software Skills" ở bản 30.3; các cột "Example", "Commodity Code", "Commodity Title" đổi thành "Workplace Example", "Element ID", "Element Name". Nguồn: https://www.onetcenter.org/dictionary/31.0/excel/software_skills.html — trang chính thức.
- "DWA Reference" đổi tên thành "GWAs to IWAs to DWAs", "IWA Reference" thành "GWAs to IWAs" ở bản 30.3. Nguồn: https://www.onetcenter.org/dictionary/31.0/excel/gwas_to_iwas_to_dwas.html và .../gwas_to_iwas.html — trang chính thức.
- Bản 31.0: cập nhật 208 nghề; thêm/cập nhật Abilities, Essential Skills, Transferable Skills cho 157 nghề. Nguồn: https://www.onetcenter.org/dictionary/31.0/nt/appendix_updates.html — trang chính thức.
- Giấy phép: CC BY 4.0, phải ghi "O*NET 31.0 Database" và U.S. Department of Labor, Employment and Training Administration, ghi chú nếu đã sửa; "O*NET" là nhãn hiệu của USDOL/ETA. Nguồn: https://www.onetcenter.org/database.html — trang chính thức.

### 1.2 Skills = Essential Skills (10) + Transferable Skills (25) = 35

Nguồn danh sách: O*NET OnLine Browse by Essential Skills https://www.onetonline.org/find/descriptor/browse/2.A và Browse by Transferable Skills https://www.onetonline.org/find/descriptor/browse/2.B — trang chính thức. Số phần tử và số nghề: data dictionary 31.0 (essential_skills.html: 10 phần tử, 910 nghề, 18.200 dòng; transferable_skills.html: 25 phần tử, 910 nghề, 45.500 dòng, 2 thang) — trang chính thức.

- Essential Skills ("cần cho hầu hết công việc"): Foundational Areas 2.A.1 = Reading Comprehension, Active Listening, Writing, Speaking, Mathematics, Science; Ways of Working 2.A.2 = Critical Thinking, Active Learning, Learning Strategies, Monitoring.
- Transferable Skills ("dùng được qua nhiều công việc"): Social 2.B.1 (Social Perceptiveness, Coordination, Persuasion, Negotiation, Instructing, Service Orientation); Complex Problem Solving 2.B.2.i; Technical 2.B.3 (Operations Analysis, Technology Design, Equipment Selection, Installation, Programming, Operations Monitoring, Operation and Control, Equipment Maintenance, Troubleshooting, Repairing, Quality Control Analysis); Systems 2.B.4 (Judgment and Decision Making, Systems Analysis, Systems Evaluation); Resource Management 2.B.5 (Time Management, Management of Financial/Material/Personnel Resources).

Phân loại cho JobQuest (suy luận của nhóm, không phải O*NET phân):
- **Kỹ thuật, dùng làm keyword cứng**: 11 Technical Skills; Mathematics, Science (nền tảng); Systems Analysis, Systems Evaluation; Management of Financial Resources, Management of Material Resources (gần nghiệp vụ).
- **Trùng 7 nhóm soft skill, loại khỏi keyword cứng**: Active Listening, Speaking, Writing, Reading Comprehension (giao tiếp); Social 2.B.1 cả 6 (giao tiếp, cảm xúc, lãnh đạo); Critical Thinking, Complex Problem Solving, Judgment and Decision Making (tư duy); Active Learning, Learning Strategies (thích ứng, học); Monitoring, Time Management (tự quản lý); Management of Personnel Resources (lãnh đạo).

### 1.3 Knowledge: 33 lĩnh vực trong 10 nhóm

Nguồn: https://www.onetonline.org/find/descriptor/browse/2.C — trang chính thức. Nhóm: Arts & Humanities (5), Business & Management (6), Communications (2), Education & Training (1), Engineering & Technology (5), Health Services (2), Law & Public Safety (2), Manufacturing & Production (2), Mathematics & Science (7), Transportation (1). Có thang Importance và Level, có anchor Level. Knowledge gần như hoàn toàn là kiến thức chuyên môn nên hợp làm keyword cứng dùng chung; ngoại lệ cần cân nhắc: Customer and Personal Service, Psychology, Therapy and Counseling, Education and Training dễ lẫn với soft skill nếu đặt tên mơ hồ.

### 1.4 Work Activities: GWA → IWA → DWA

- GWAs to IWAs: 332 dòng, mỗi IWA gắn đúng một GWA. Nguồn: https://www.onetcenter.org/dictionary/31.0/excel/gwas_to_iwas.html — trang chính thức. (332 dòng = 332 IWA, suy ra từ cấu trúc 1 dòng/IWA.)
- GWAs to IWAs to DWAs: 2.087 dòng, mỗi DWA gắn đúng một IWA. Nguồn: https://www.onetcenter.org/dictionary/31.0/excel/gwas_to_iwas_to_dwas.html — trang chính thức.
- Tasks to DWAs: 24.087 dòng; mỗi DWA nối nhiều task, mỗi task nối một hoặc nhiều DWA; DWA nối với nghề **gián tiếp qua task**, không có điểm Importance/Level riêng cho DWA (điểm nằm ở task: Task Ratings). Nguồn: https://www.onetcenter.org/dictionary/31.0/excel/tasks_to_dwas.html — trang chính thức.
- Ý nghĩa: DWA/IWA mô tả *việc làm* (động từ + đối tượng), không phải kỹ năng; hợp làm "output" của cấp nghề (nhiệm vụ trong game), nhưng ~2.000 DWA là quá mịn cho keyword.

### 1.5 Software Skills (trước là Technology Skills)

- 31.821 dòng, 7 cột: O*NET-SOC Code, Title, Workplace Example (tên phần mềm cụ thể), Element ID, Element Name (lớp phần mềm theo UNSPSC v260801), Hot Technology (Y/N, xuất hiện thường xuyên trong tin tuyển dụng của mọi nghề), In Demand (Y/N, thường xuyên trong tin tuyển dụng của nghề đó). Nguồn: https://www.onetcenter.org/dictionary/31.0/excel/software_skills.html — trang chính thức.
- Bản 30.3 cập nhật 176 "Employer-Based Hot Technologies", hơn 11.500 liên kết nghề. Nguồn: Appendix 4 bản 30.3 — trang chính thức.
- Không còn tệp Tools Used (dụng cụ, máy móc) từ 30.3. Với nghề tay chân (nấu ăn, điện, cơ khí) phải dùng bản 30.2 hoặc lấy từ DWA/task.

### 1.6 Thang Importance và Level

- Importance 1–5, Level 0–7; O*NET OnLine quy về 0–100 bằng S = (O − L)/(H − L) × 100. Level "không liên quan" khi ≥75% người đánh giá cho Importance là "not important". Nguồn: https://www.onetonline.org/help/online/scales — trang chính thức.
- Level Scale Anchors: 483 dòng, anchor cho Abilities, Knowledge, Essential Skills, Transferable Skills, Work Activities, chỉ áp dụng thang LV. Nguồn: https://www.onetcenter.org/dictionary/31.0/excel/level_scale_anchors.html — trang chính thức.
- Ví dụ Programming trên OnLine: anchor ở 28, 57, 85 (tức 2, 4, 6 trên 0–7): "viết chương trình sắp xếp đối tượng trong cơ sở dữ liệu" / "viết chương trình phân tích thống kê dữ liệu dân số" / "viết chương trình phân tích dữ liệu địa chất tìm mỏ khoáng sản". Nguồn: https://www.onetonline.org/find/descriptor/result/2.B.3.e — trang chính thức. Anchor 2–4–6 khớp tự nhiên với 3 mức Làm quen–Thành thạo–Chuyên sâu.

---

## 2. ESCO (bản hiện hành v1.2.1)

- Phiên bản hiện hành trên cổng ESCO là **v1.2.1** (cập nhật 10/12/2025), không phải v1.2.0. Trụ kỹ năng có 4 phân loại con: Knowledge, Language skills and knowledge, Skills, Transversal skills; phân biệt "skill/competence" và "knowledge" bằng trường skill type, **không** phân biệt skill với competence; mỗi khái niệm có nhãn ưu tiên và nhãn thay thế trong 28 ngôn ngữ, mô tả, scope note, reusability level, quan hệ với kỹ năng khác và nghề. Nguồn: https://esco.ec.europa.eu/en/classification/skill_main — trang chính thức.
- Quy mô và cây phân cấp (slide của DG EMPL, 24/06/2025): 3.039 nghề, 13.939 skills/competences & knowledge. Skills & Competences: 8 nhóm chính (S1 giao tiếp, hợp tác, sáng tạo; S2 kỹ năng thông tin; S3 hỗ trợ và chăm sóc; S4 kỹ năng quản lý; S5 làm việc với máy tính; S6 bốc xếp và di chuyển; S7 xây dựng; S8 làm việc với máy móc và thiết bị chuyên dụng) → 75 nhóm → 308 nhóm → khái niệm. Knowledge: 12 nhóm chính → 58 → 150 → khái niệm. Transversal: 6 nhóm chính → 24 nhóm → khái niệm. Nguồn: F. Losappio, "ESCO – The European Classification of Skills, Competences and Occupations", ETF, 2025, https://www.etf.europa.eu/sites/default/files/2025-08/3.%20Short%20overview%20of%20ESCO_0.pdf — toàn văn (slide 1–12).
- Knowledge của ESCO được phân loại theo ISCED-F 2013 (lĩnh vực giáo dục đào tạo của UNESCO). Nguồn: ESCOpedia "Knowledge", https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/knowledge — trang chính thức. Hệ quả cho JobQuest: nhánh Knowledge của ESCO cùng gốc ISCED-F với danh mục ngành đào tạo Việt Nam, dễ nối keyword kiến thức với ngành học.
- Trụ kỹ năng là đơn phân cấp: mỗi khái niệm thuộc đúng một nhóm; nhóm kỹ năng chiếm 3 tầng trên, kỹ năng ESCO nằm từ tầng 4 trở xuống. Tệp quan hệ: broaderRelationsOccPillar, broaderRelationsSkillPillar, occupationSkillRelations, skillSkillRelations. Nguồn: tài liệu tải dữ liệu trên cổng ESCO (kết quả tìm kiếm trỏ tới https://esco.ec.europa.eu/en/use-esco/download) — thứ cấp (chưa mở trang gốc, chưa đọc cột của skillSkillRelations).
- 4 mức reusability: Transversal (dùng cho nhiều nghề, nhiều ngành), Cross-sector (nhiều ngành kinh tế), Sector-specific (một ngành, nhiều nghề), Occupation-specific (thường chỉ một nghề và các chuyên môn của nó). Nguồn: ESCOpedia "Skill reusability level", https://esco.ec.europa.eu/en/escopedia/Skill-reusability-level — trang chính thức.
- Quan hệ nghề–kỹ năng: "essential" = thường cần khi làm nghề, không phụ thuộc bối cảnh hay người tuyển; "optional" = có thể cần tuỳ người tuyển, bối cảnh hoặc quốc gia. Nguồn: ESCOpedia "Essential", https://esco.ec.europa.eu/en/escopedia/Essential — trang chính thức (định nghĩa optional lấy từ trang ESCO qua kết quả tìm kiếm — thứ cấp). ESCO **không có thang mức độ** (level/proficiency) cho kỹ năng trong hồ sơ nghề; chỉ có essential/optional.
- Ngôn ngữ: 28 ngôn ngữ = tất cả ngôn ngữ chính thức EU + tiếng Iceland, Na Uy, Ukraina, Ả Rập. **Không có tiếng Việt.** Nguồn: slide ETF 2025 ở trên và báo cáo kỹ thuật crosswalk 2022 — toàn văn.
- Bộ sưu tập: 1.201 khái niệm số (718 kỹ năng, 475 kiến thức, 7 transversal); 571 khái niệm xanh; ResearchComp có 4 mức thành thạo (foundational, intermediate, advanced, expert). Nguồn: slide ETF 2025 — toàn văn.

### 2.1 Crosswalk ESCO–O*NET (9/2022)

Nguồn: European Commission & US DOL/ETA, "The crosswalk between ESCO and O*NET – Technical Report", 9/2022 (cập nhật 12/2022), https://esco.ec.europa.eu/system/files/2022-12/ONET%20ESCO%20Technical%20Report.pdf — toàn văn (15 trang).
- **Chỉ ánh xạ nghề, không ánh xạ kỹ năng.** Phiên bản: O*NET-SOC 2019, ESCO v1.1.0, ISCO-08.
- 958 nghề O*NET được ánh xạ (loại 58: 16 nghề quân đội, 42 nghề "All Other"); 2.997 nghề ESCO.
- Phương pháp: BERT fine-tune gợi ý 10 nghề ESCO cho mỗi nghề O*NET theo độ giống ngữ nghĩa, rồi người kiểm; nhóm O*NET kiểm lại.
- Kiểu quan hệ: exact, narrow, broad, close (bản chính thức); related (bảng phụ, chất lượng thấp hơn, không qua QA của US DOL). Kết quả: 542 exact (499 ESCO–O*NET, 43 ISCO–O*NET), ~227 narrow, 2.066 broad, 1.442 close; tổng 5.175 (7.385 nếu tính related).
- Hệ quả: muốn lấy kỹ năng ESCO cho 221 nghề JobQuest phải đi O*NET-SOC → nghề ESCO → occupationSkillRelations; vì đa số là broad (một nghề O*NET ứng với nhiều nghề ESCO) nên phải hợp nhiều danh sách kỹ năng, tốn công và nhiễu. Repo đã có bảng này: `occupation-data/external/esco_onet/ESCO_to_ONET-SOC.xlsx`.

---

## 3. Lightcast Open Skills

- Quy mô "34.000+ skills", cấu trúc 3 tầng Category → Subcategory → Skill. Nguồn: https://lightcast.io/open-skills — trang chính thức. Trang danh mục ghi **31 Skill Categories**: https://lightcast.io/taxonomies/skills-taxonomy/categories — trang chính thức. Số subcategory: chưa xác nhận.
- Mỗi skill thuộc một trong 3 loại: specialized skill, common skill, certification. Nguồn: https://lightcast.io/open-skills/faqs — trang chính thức.
- Giấy phép: "Your use of the taxonomy is determined by the type of license you request"; "API access is now available on a contract basis"; mô tả lấy từ Wikipedia theo CC BY-SA; trang open-skills chỉ hứa miễn phí cho tổ chức phi lợi nhuận. Nguồn: FAQ và trang open-skills ở trên — trang chính thức. Một blog bên thứ ba (jobspipe.dev, 7/2026) nói tài liệu Lightcast sửa 4/2026 tách quyền "public-good" và "commercial" — thứ cấp, chưa xác nhận.
- Đánh giá cho JobQuest: không có thang mức, không gắn sẵn O*NET-SOC trong bản mở, phải xin quyền API, điều khoản không rõ cho sản phẩm có thể thương mại hoá. **Không làm xương sống**; chỉ tham khảo tên công cụ, chứng chỉ.

---

## 4. Việt Nam

### 4.1 Tiêu chuẩn kỹ năng nghề quốc gia (TCKNNQG)

- Khung pháp lý cũ: Thông tư 56/2015/TT-BLĐTBXH (24/12/2015, hiệu lực 15/02/2016). Nguồn: https://caselaw.vn/van-ban-phap-luat/263106-thong-tu-56-2015-tt-bldtbxh-huong-dan-viec-xay-dung-tham-dinh-va-cong-bo-tieu-chuan-ky-nang-nghe-quoc-gia-do-bo-truong-bo-lao-dong-thuong-binh-va-xa-hoi-ban-hanh — toàn văn (bản đăng lại, chưa đối chiếu Công báo).
  - Điều 3: "Đơn vị năng lực là sự trình bày chi tiết về một việc được làm như thế nào, cách thức thực hiện và kiến thức nền tảng được áp dụng".
  - Điều 5: 5 bậc, mô tả theo 3 tiêu chí (tính chất và mức độ công việc; mức độ linh hoạt, sáng tạo; sự phối hợp và trách nhiệm). Bậc 1: việc đơn giản, lặp lại, tình huống cố định. Bậc 2: việc thông thường và một số việc phức tạp; cần chỉ dẫn với vấn đề phức tạp; tự chủ khi làm theo tổ nhóm. Bậc 3: phần lớn việc phức tạp, nhiều lựa chọn; đưa giải pháp cho vấn đề chuyên môn phức tạp; hướng dẫn người khác trong tổ nhóm. Bậc 4: hầu hết việc phức tạp trong nhiều tình huống; kiến thức chuyên môn sâu; quản lý, điều hành tổ nhóm. Bậc 5: việc phức tạp trong mọi tình huống; phân tích, chẩn đoán, thiết kế giải pháp; chịu trách nhiệm cả tổ nhóm.
  - Điều 6: tiêu chuẩn gồm mô tả nghề; danh mục đơn vị năng lực chia năng lực cơ bản / năng lực chung (của một ngành) / năng lực chuyên môn (của nghề); chi tiết từng đơn vị (tên; thành phần và tiêu chí thực hiện; kỹ năng quan trọng và kiến thức thiết yếu; điều kiện thực hiện gồm công cụ, nguồn lực; hướng dẫn đánh giá).
- Khung pháp lý mới: Luật Việc làm số 74/2025/QH15 (thông qua 16/06/2025, hiệu lực 01/01/2026); Điều 2 khoản 3 định nghĩa TCKNNQG là yêu cầu về kiến thức chuyên môn, kỹ thuật, năng lực thực hành và khả năng ứng dụng cho từng bậc trình độ của nghề; Điều 22–26 về khung, tiêu chuẩn, đánh giá, chứng chỉ. Nguồn: https://luatvietnam.vn/lao-dong/luat-viec-lam-cua-quoc-hoi-so-74-2025-qh15-405176-d1.html — toàn văn (bản đăng lại).
- Nghị định 138/2026/NĐ-CP (07/4/2026): khung 5 bậc (mô tả ở Phụ lục I), "số lượng bậc ... phụ thuộc vào mức độ phức tạp của từng nghề"; tiêu chuẩn gồm mô tả nghề, danh mục đơn vị năng lực (cơ bản, chung, nghề nghiệp chuyên môn), mô tả từng đơn vị, điều kiện bảo đảm; **Bộ Nội vụ** quyết định danh mục nghề cần xây dựng, thẩm định, công bố. Nguồn: Cổng PBGDPL TP Cần Thơ, https://pbgdpl.cantho.gov.vn/quy-dinh-khung-trinh-do-ky-nang-nghe-quoc-gia-tieu-chuan-ky-nang-nghe-quoc-gia — thứ cấp (cơ quan nhà nước tóm tắt; chưa đọc toàn văn Nghị định và Phụ lục I).
- Số bộ tiêu chuẩn: một bài báo nêu đã ban hành 193 bộ TCKNNQG, trong đó 86 bộ của nghề trọng điểm, không ghi thời điểm. Nguồn: Báo Thanh tra, https://thanhtra.com.vn/an-sinh-AFA9C5670/nhieu-giai-phap-doi-moi-va-nang-cao-chat-luong-gdnn-005B3E77.html — **chưa xác nhận**, không dùng làm số liệu.
- Đánh giá cho JobQuest: danh mục TCKNNQG nghiêng về nghề kỹ thuật, dịch vụ; mỗi bộ là văn bản riêng, không có mã nối O*NET-SOC, không có dữ liệu máy đọc. Dùng ở hai chỗ: (1) **mô tả 5 bậc** làm căn cứ tiếng Việt cho 3 mức keyword; (2) **tên đơn vị năng lực** làm nguồn đặt tên keyword tiếng Việt cho nghề có TCKNNQG (tra từng nghề). Cách chia năng lực cơ bản / chung / chuyên môn khớp với cách chia keyword dùng chung toàn game / dùng chung trong nhóm ngành / riêng của nghề.

### 4.2 Khung trình độ quốc gia Việt Nam

- QĐ 1982/QĐ-TTg (18/10/2016) **đã được thay** bằng Quyết định 39/2026/QĐ-TTg (ký 23/7/2026, hiệu lực 07/9/2026). Vẫn 8 bậc, mô tả theo kiến thức, kỹ năng, mức độ tự chủ và trách nhiệm cá nhân; bậc 2 và bậc 6 thêm năng lực số, ứng dụng công nghệ, đổi mới sáng tạo. Xếp văn bằng: sơ cấp bậc 2, trung cấp bậc 4, cao đẳng bậc 5, đại học bậc 6, thạc sĩ bậc 7, tiến sĩ bậc 8. Nguồn: Cổng PBGDPL TP Cần Thơ, https://pbgdpl.cantho.gov.vn/quy-dinh-ve-khung-trinh-do-quoc-gia-viet-nam (số hiệu, ngày ký, hiệu lực, 8 bậc, 3 thành phần) — thứ cấp; Báo SGGP 25/07/2026, https://sggp.org.vn/khung-trinh-do-quoc-gia-viet-nam-gom-8-bac-trinh-do-post863953.html (xếp văn bằng) — thứ cấp; việc thay QĐ 1982: Báo Văn hoá, https://baovanhoa.vn/doi-song/tam-bac-trinh-do-quoc-gia-moi-hoc-sinh-sau-lop-9-co-nhung-huong-di-nao-248617.html — thứ cấp. Toàn văn trên thuvienphapluat.vn trả lỗi 403, chưa đọc Phụ lục.
- Đánh giá cho JobQuest: khung xếp **văn bằng**, không xếp mức thạo từng kỹ năng. Không dùng để định nghĩa mức keyword; chỉ dùng cho cấp đầu vào của nghề (nghề cần bằng đại học thì bắt đầu ở cấp cao hơn) và câu chữ "mức tự chủ và trách nhiệm".

---

## 5. Đổi mức độ sang thang 3 mức của game

### 5.1 Bằng chứng

- O*NET: Level 0–7, Importance 1–5 (mục 1.6). Level Scale Anchors có 483 dòng; Knowledge 33 + Skills 35 + Abilities 52 + Work Activities 41 = 161 phần tử, 161 × 3 = 483, nên **mỗi phần tử có 3 anchor** (suy luận từ số dòng, kiểm lại khi tải tệp). Giá trị anchor khác nhau giữa phần tử: Programming ở 2/4/6 (28/57/85 trên OnLine), Economics and Accounting ở 1/4/7 (14/57/100). Nguồn: https://www.onetonline.org/find/descriptor/result/2.B.3.e và https://www.onetonline.org/find/descriptor/result/2.C.1.c — trang chính thức.
- Phân bố thực tế (nhóm tự tính từ `occupation-data/external/onet_31_0/knowledge.csv` và `transferable_skills.csv`, chỉ cặp nghề–phần tử có IM ≥ 3): Knowledge LV thập phân vị 10–90 là 3,15 → 5,35; Transferable Skills 2,88 → 4,00. Thang bị nén: cắt cứng ở 3 và 5 sẽ dồn gần hết kỹ năng vào Thành thạo.
- Mỗi nghề có trung vị 8 Knowledge với IM ≥ 3 (tứ phân vị 5–10). Gộp Knowledge, 11 Technical Skills, Mathematics, Science, Systems Analysis/Evaluation, Management of Financial/Material Resources thì trung vị 10 (7–14). **54% nghề không có Technical Skill nào đạt IM ≥ 3**: 11 Technical Skills không đủ phân biệt nghề ngoài kỹ thuật.
- Tiền lệ chính phủ Canada (OaSIS): Skills và Abilities đổi từ thang 7 điểm của O*NET sang thang thạo 1–5 bằng công thức quy về trung bình, ngưỡng giữa các mức theo độ lệch chuẩn **riêng của từng descriptor**; Knowledge chấm thang **1–3** theo Canadian Rating Guide, không lấy từ O*NET; Work Activities chấm độ phức tạp 1–5 đổi từ O*NET. Nguồn: ESDC, OaSIS methodology, https://noc.esdc.gc.ca/OASIS/OASISMethodology — trang chính thức (không nêu số độ lệch chuẩn).
- ESCO không có thang mức; ResearchComp trong ESCO dùng 4 mức (foundational, intermediate, advanced, expert) — mục 2.
- TCKNNQG 5 bậc có mô tả chữ rõ — mục 4.1.

### 5.2 Cách đổi đề xuất (nhận định của nhóm, chưa có nguồn công bố trực tiếp)

- **Mức keyword trong từng cấp nghề đi theo cấp nghề, không lấy thẳng từ O*NET.** O*NET chỉ có một điểm LV cho cả nghề, không tách junior/senior.
- **O*NET LV đặt "trần"** (mức cao nhất keyword đạt ở cấp cao nhất của nghề) theo phân vị riêng của từng phần tử trên ~900 nghề, theo tinh thần OaSIS: dưới phân vị 33 → trần Làm quen; 33–80 → trần Thành thạo; từ 80 → trần Chuyên sâu. Ngưỡng 33/80 là tham số tạm, hiệu chỉnh bằng 22 nghề IT đã điền tay.
- **Neo chữ cho 3 mức theo TCKNNQG**: Làm quen ≈ Bậc 1 (việc đơn giản, lặp lại, có người hướng dẫn); Thành thạo ≈ Bậc 2 (việc thông thường, tự chủ, cần chỉ dẫn với việc phức tạp); Chuyên sâu ≈ Bậc 3 trở lên (phần lớn việc phức tạp, đưa giải pháp, hướng dẫn người khác). Phần "quản lý, điều hành tổ nhóm" của Bậc 4–5 thuộc soft skill (lãnh đạo), không đẩy vào keyword.
- **Câu ví dụ cho từng keyword**: mượn 3 anchor của O*NET (thấp/giữa/cao) cho Làm quen/Thành thạo/Chuyên sâu, Việt hoá ngữ cảnh.

### 5.3 Bảng chuyển đổi keyword giữa các nghề

- Bằng chứng học thuật về cấu trúc kỹ năng giữa nghề: Alabdulkareem và cs. (2018) dựng mạng kỹ năng O*NET theo đồng xuất hiện có trọng số (revealed comparative advantage), thấy kỹ năng tách thành hai cụm xã hội–nhận thức và cảm giác–thể chất, hạn chế dịch chuyển nghề. Nguồn: Science Advances 4(7): eaao6030, https://doi.org/10.1126/sciadv.aao6030 — tóm tắt.
- Đề xuất: không làm bảng N×N giữa mọi keyword. Mỗi keyword lưu `onet_refs` (mã phần tử O*NET: Knowledge, Technical Skill, IWA, lớp Software Skills). Hai keyword của hai nghề "đổi được" khi cùng `onet_refs` chính, hoặc nằm trong cùng IWA; quy tắc đổi: cùng mã → giữ mức; cùng IWA khác DWA → hạ một mức; chỉ cùng Knowledge → hạ một mức và tối đa Thành thạo. Ví dụ đã có trong IT: Cơ sở dữ liệu Thành thạo từ Back-end đủ điều kiện Phân tích dữ liệu (D-38).

---

## Đề xuất cho JobQuest

1. **Xương sống là O*NET 31.0**, vì 221 nghề đã gắn O*NET-SOC, giấy phép CC BY 4.0, có điểm Importance/Level theo nghề và anchor mức. ESCO (không có tiếng Việt, crosswalk chỉ ở mức nghề, đa số broad match) và Lightcast (giấy phép theo hợp đồng) chỉ để tham khảo tên. TCKNNQG dùng cho câu chữ 3 mức và tên tiếng Việt.
2. **Ba tầng keyword**, khớp cách chia năng lực cơ bản / chung / chuyên môn của TCKNNQG:
   - *Tầng nền, dùng chung toàn game (~30–35 keyword)*: 33 Knowledge của O*NET (gộp còn ~25–30, ví dụ gộp Physics + Chemistry khi cần) + Mathematics, Science + các Technical Skills chung (Vận hành máy, Bảo trì sửa chữa, Kiểm tra chất lượng, Lắp đặt). Loại: Customer and Personal Service, Education and Training, Psychology, Therapy and Counseling khi tên dễ lẫn soft skill thì đặt tên theo phương pháp ("Tư vấn tâm lý", "Soạn bài giảng"), không theo hành vi.
   - *Tầng nhóm ngành (~8–12 keyword mỗi nhóm × 22 nhóm)*: rút từ IWA (332) có nhiều nghề trong nhóm cùng dùng, cộng lớp phần mềm "In Demand" của Software Skills. 22 keyword IT hiện có chính là tầng này cho nhóm IT.
   - *Tầng riêng nghề (0–3 keyword, gắn nhãn "đặc thù" như Mobile, Game)*: rút từ DWA của task Core có điểm cao nhất.
   - Tổng ước tính 200–280 keyword cho 221 nghề.
3. **Số lượng**: mỗi nghề 6–10 keyword (trung vị O*NET là 10 phần tử cứng có IM ≥ 3, nhưng gộp lại cho dễ chơi); mỗi cấp nghề đầu vào 2–4 keyword, đầu ra nâng 1–2 keyword lên một mức hoặc thêm 1 keyword mới.
4. **Đặt tên**: 1–4 từ, danh từ chỉ việc hoặc lĩnh vực ("Kế toán", "Pha chế", "Đo đạc", "Hàn"), tên theo việc không theo công cụ (giữ quy ước hiện có); mỗi keyword kèm câu nghĩa một dòng và 3 câu ví dụ theo mức. Ưu tiên lấy chữ từ tên đơn vị năng lực TCKNNQG hoặc tên ngành trong danh mục đào tạo Việt Nam nếu có.
5. **Tách khỏi 7 nhóm soft skill**: loại hẳn 21 Skills O*NET thuộc giao tiếp, xã hội, tư duy, học tập, tự quản lý, quản lý nhân sự (danh sách ở mục 1.2) và mọi Work Styles. Phép thử cho mỗi keyword: "có thể học bằng khoá học hoặc giáo trình chuyên ngành và kiểm bằng sản phẩm, bài thực hành không?" — có thì là keyword; nếu chỉ thấy qua cách cư xử thì là soft skill.
6. **Mức**: mức trong cấp nghề đi theo band cấp; O*NET LV (phân vị theo từng phần tử) chỉ đặt trần; neo chữ theo TCKNNQG Bậc 1 / 2 / 3+.
7. **Dữ liệu cần tải thêm** (O*NET 31.0, đã có knowledge, essential_skills, transferable_skills, task_statements, work_activities, occupation_data): Software Skills, Tasks to DWAs, GWAs to IWAs to DWAs, Task Ratings, Level Scale Anchors, Scales Reference, Content Model Reference. Tools Used không còn từ bản 30.3; nghề tay chân cần dụng cụ thì lấy từ DWA/task.

---

## 6. Đổi xương sống sang ESCO cho mọi nghề (23/10)

Đề xuất ở mục trên (O*NET làm xương sống, IT giữ 22 keyword nhóm soạn) đã chạy ở bản 22/10 và bị thay. Lý do: đối xử khác nhau giữa IT và ngành khác, và O*NET quá thô.

**Đo trên bản 22/10:**

| Vấn đề | Số liệu |
|---|---|
| Nếu IT cũng rút từ O*NET thì nhiều nghề trùng nhau | Back-end = Mobile (cùng mã 15-1252.00); DevOps ≈ Network; Cloud ≈ Solution Architect; mất Cloud, DevOps, API, Git, Mobile, ERP, AI |
| Mức keyword lệch | IT (nhóm soạn) 17/55/29% Làm quen/Thành thạo/Chuyên sâu; ngoài IT 0/5/95%, vì IWA của O*NET không có thang mức |
| O*NET thô với nghề tay nghề | Thợ hàn chỉ có "Hàn"; DWA (2.087 mục) vẫn ở dạng việc chung, IT chỉ có "Design software applications" |

**ESCO v1.2.1** (13.939 kỹ năng, 3.039 nghề, mỗi nghề có kỹ năng bắt buộc và tuỳ chọn) tách nghề mịn hơn: cùng mã O*NET 15-1252.00 có mobile application developer, digital games developer, embedded systems software developer, user interface developer; cùng 51-4121.00 có welder, pipe welder, spot welder, brazier, solderer. Kỹ năng ở mức Git, API: "tools for software configuration management", "use an application-specific interface", "perform tungsten inert gas welding", "apply arc welding techniques".

**So ba phương án trên 221 nghề** (bản thử dùng nghề liên quan O*NET; bản chọn có thêm phép kiểm cùng nhóm ISCO-08 3 số, 782 cặp có hướng, nhưng phép này chỉ là soát sơ bộ vì cách chọn keyword đã dùng nhóm ISCO):

| | O*NET + IT nhóm soạn (22/10) | ESCO một tầng | ESCO hai tầng (chọn) |
|---|---|---|---|
| Cùng nguồn cho mọi nghề | Không | Có | Có |
| AUC độ phủ, nghề liên quan O*NET | 0,918 (trên 878 nghề O*NET, có lợi thế sân nhà) | 0,763 (bản thử) | 0,878 |
| AUC độ phủ, cùng ISCO 3 số | 0,903 | chưa đo | 0,909 |
| Cặp liên quan / cặp khác đạt 50% (O*NET) | 42,0% / 2,1% | 9,8% / 0,2% (bản thử) | 36,6% / 1,5% |
| Khớp 22 keyword nhóm soạn (có trọng số mức) | 38% (O*NET cho IT) | 53–56% (bản thử) | 49,5% |
| Nhảy khác nhóm ngành vào sâu hơn cấp đầu | 7–10% | 0–3% | 3–8% |

"Hai tầng" nghĩa là keyword mịn dùng để hiển thị và lên mức, còn nhảy nghề quy keyword về nhóm kỹ năng cấp 3 của ESCO (S x.y.z, lĩnh vực ISCED-F 4 số). Một tầng thì keyword mịn quá nên hai nghề hầu như không trùng, nhảy nghề gần như tắt.

**Luật lọc kỹ năng mềm** dựa trên cây kỹ năng ESCO: bỏ transversal, ngoại ngữ (S1.15.1), bộ 40 kỹ năng nghiên cứu chung, và kỹ năng mà mọi nhánh đều nằm trong 14 nhóm trùng 7 nhóm soft skill (S1.0, S1.1, S1.2, S1.4, S1.7, S1.8, S1.9, S4.1, S4.2, S4.5, S4.6, S4.8, S4.9, S3.3.1). Nhánh S1 của ESCO lẫn kỹ năng chuyên môn (S1.11 thiết kế hệ thống, S1.3 giảng dạy, S1.6 bán hàng), nên không bỏ cả nhánh. Nhóm trùng soft skill cũng bị bỏ khỏi tầng quy đổi, để "tuân thủ an toàn" không nối mọi nghề tay nghề với nhau.

**Giới hạn còn lại:** ESCO là chuẩn châu Âu, không có tiếng Việt, không có nghề tư vấn ERP và thợ sửa xe máy; vài nghề ESCO ghi rất ít kỹ năng bắt buộc (Vận động viên, Cán bộ tiếp nhận hồ sơ). Bảng nối 221 nghề → ESCO ở `nghe_esco.csv`; bảng tương đương 22 keyword nhóm soạn → kỹ năng ESCO ở `keyword_it_esco.csv` (dùng làm bài kiểm). `keyword_it_onet.csv` giữ lại để có thể quay về cách cũ.

