# Nền tảng Định hướng Nghề nghiệp bằng AI cho Học sinh THPT Việt Nam
### Bản Brainstorm Đầy đủ Chức năng Hệ thống — Giới hạn trong Thị trường Việt Nam (để sau này phân loại theo phạm vi từng học kỳ)

> **Ghi chú phạm vi:** Nền tảng này được thiết kế hoàn toàn xoay quanh hệ thống giáo dục Việt Nam (chương trình GDPT 2018, tổ hợp môn, kỳ thi tốt nghiệp THPT), các trường đại học và phương thức tuyển sinh của Việt Nam, thị trường lao động trong nước, và nội dung bằng tiếng Việt. Không có tính năng đa ngôn ngữ hay hướng tới thị trường quốc tế nào nằm trong phạm vi này.

---

## Bối cảnh Thị trường (vì sao điều này quan trọng)
- Hơn 1 triệu học sinh tốt nghiệp THPT tại Việt Nam mỗi năm; trên 80% có nguyện vọng vào đại học, nhưng chỉ khoảng 50% thực sự nhập học.
- Khoảng 50% sinh viên cảm thấy lựa chọn ngành ban đầu không phù hợp; 36% muốn đổi ngành; khoảng 15% có ý định chuyển ngành ngay trong năm nhất.
- 70% lao động trẻ thiếu kỹ năng cần thiết khi bước vào thị trường lao động.
- Các giải pháp hiện có còn yếu: khảo sát thủ công do giáo viên thực hiện (Google Forms + trắc nghiệm Holland/MI/SWOT), chương trình nội bộ của Vinschool (chỉ dành riêng cho học sinh trường, không công khai), các ngày hội hướng nghiệp đơn lẻ, và VietCareer (nhắm đến người đi làm/người tìm việc, không phải học sinh THPT).
- Bộ GD&ĐT (MOET) hiện đang thí điểm khung giáo dục AI, trong đó định vị bậc THPT rõ ràng là giai đoạn "thiết kế và định hướng nghề nghiệp" (đánh giá thí điểm hoàn tất giữa năm 2026) — đây là một lực đẩy thể chế thực sự cho việc các trường tiếp nhận sản phẩm.
- Chương trình học hiện nay không còn giống năm 2018 (học đều tất cả các môn) mà học sinh chỉ học 4 môn bắt buộc (Toán, Ngữ văn, Tiếng Anh, Lịch sử) và tự chọn thêm 3 môn trong số các môn còn lại (Lý, Hoá, Sinh, Địa, v.v.) — việc chọn môn tự chọn diễn ra sớm và có tác động trực tiếp, dài hạn đến tổ hợp môn xét tuyển đại học, khiến nhu cầu định hướng nghề nghiệp sớm càng cấp thiết hơn.

---

## 1. Cỗ máy Khảo sát Động & Học vấn (Cá nhân hóa)
- Khảo sát onboarding thích ứng — câu hỏi phân nhánh dựa trên câu trả lời trước đó (tính cách, sở thích), không phải một biểu mẫu tĩnh cố định; nội dung và ngôn ngữ hoàn toàn bằng tiếng Việt
- Nhập hồ sơ học tập — điểm số các môn/học bạ theo chương trình GDPT 2018 (nhập thủ công, hoặc import từ các định dạng học bạ dùng tại Việt Nam)
- Theo dõi tổ hợp môn — ánh xạ theo các tổ hợp chuẩn của Việt Nam (A00, A01, B00, C00, D01, D07, v.v.) và cách mỗi tổ hợp liên kết với các ngành đại học đủ điều kiện xét tuyển
- Bảng "chân dung năng lực" theo thời gian thực — biểu đồ radar/mạng nhện kết hợp loại tính cách (Holland RIASEC), đa trí thông minh, và thế mạnh học tập
- Nhắc đánh giá lại định kỳ — khảo sát ngắn làm lại mỗi học kỳ để theo dõi sở thích thay đổi theo thời gian
- Theo dõi sự dịch chuyển sở thích — gắn cờ khi hồ sơ học sinh thay đổi đáng kể giữa các lần đánh giá
- So sánh đối chiếu theo nhóm bạn cùng lớp — so sánh ẩn danh với bạn cùng lớp hoặc mức trung bình khối
- Xuất báo cáo hồ sơ (PDF) — bản tóm tắt dành cho phụ huynh/giáo viên chủ nhiệm
- Admin: công cụ chỉnh sửa ngân hàng câu hỏi & logic phân nhánh cho đội ngũ tư vấn/nội dung cập nhật khảo sát mà không cần lập trình

## 2. Vòng lặp Khám phá qua Nhiệm vụ Nhỏ (Micro-task)
- Danh mục lĩnh vực nghề nghiệp (bắt đầu với một bộ chọn lọc, ví dụ 15–25 lĩnh vực cho MVP, mở rộng sau)
- Thư viện micro-task theo từng lĩnh vực — các tình huống mô phỏng ngắn (ví dụ: "phân loại bệnh nhân giả định," "định giá gói tour," "debug đoạn code," "viết pitch sản phẩm")
- Nhiều định dạng nhiệm vụ — trắc nghiệm tình huống, trả lời ngắn dạng viết, mô phỏng kéo-thả, thử thách tính giờ
- Chấm điểm mức độ phù hợp dựa trên hiệu suất thực tế — điểm số dựa trên cách học sinh thực sự thực hiện, không chỉ tự đánh giá
- Hàng đợi nhiệm vụ thông minh — gợi ý nhiệm vụ tiếp theo, khuyến khích khám phá các lĩnh vực chưa thử ("bạn chưa thử lĩnh vực Kinh doanh")
- Đánh dấu/lưu các hướng nghề nghiệp yêu thích để tìm hiểu sâu hơn
- Huy hiệu/thành tích cho độ rộng khám phá (gamification khuyến khích thử nhiều lĩnh vực, không chốt sớm)
- Gợi ý dạng "Học sinh giống bạn cũng làm tốt ở…"
- Admin: công cụ soạn nhiệm vụ, quản lý phiên bản nhiệm vụ, và bảng phân tích nhiệm vụ (nhiệm vụ nào quá dễ/khó/bị bỏ qua nhiều)

## 3. Bản đồ Lộ trình Trực quan & Phân tích Thị trường
- Bản đồ lộ trình tương tác — Tổ hợp môn → Ngành học → Nghề nghiệp (biểu đồ dạng node-graph hoặc Sankey)
- Tìm kiếm/lọc theo sở thích, tổ hợp môn hiện tại, hoặc khu vực trong Việt Nam (ví dụ: Hà Nội, TP.HCM, Đà Nẵng, và các tỉnh thành khác)
- Biểu đồ mức lương theo VND theo ngành/vị trí, lấy từ dữ liệu thị trường lao động Việt Nam (ví dụ: VietnamWorks, TopCV, báo cáo GSO)
- Biểu đồ xu hướng nhu cầu/tăng trưởng lao động theo ngành, dựa trên báo cáo thị trường lao động Việt Nam (ví dụ: Bộ LĐTB&XH / Tổng cục Thống kê)
- Tra cứu và so sánh điểm chuẩn tuyển sinh đại học qua các trường và các năm, bao gồm cả xét điểm thi THPT lẫn xét học bạ
- Bộ mô phỏng "nếu như" — thay đổi tổ hợp môn, xem ngành/nghề nào mở ra hoặc đóng lại
- So sánh nghề nghiệp song song (lương VND, nhu cầu, số năm học, độ phù hợp tính cách) — chỉ giới hạn trong các nghề/ngành có tại Việt Nam
- Công cụ xây dựng lộ trình cá nhân — học sinh lưu kế hoạch nhiều năm (môn học kỳ này → ngành đại học mục tiêu → công việc mục tiêu)
- Đánh giá, xếp hạng & bình luận cộng đồng theo từng nghề/công việc — học sinh, cựu sinh viên, và người đi làm có thể đánh giá và để lại lời khuyên định tính về một nghề/công việc cụ thể (ví dụ: thực tế công việc hàng ngày, ưu/nhược điểm, lời khuyên chân thực), hiển thị cùng biểu đồ lương/nhu cầu
- Bảng tin tức ngành/nghề — hiển thị tin tức gần đây liên quan đến các nghề học sinh đã lưu/khám phá, giúp trang lộ trình luôn cập nhật thay vì tĩnh
- Admin: công cụ import/cập nhật dữ liệu lương, nhu cầu, điểm chuẩn từ các nguồn công khai/chính thức của Việt Nam (một hạng mục phạm vi ẩn thực sự — cần chiến lược nguồn dữ liệu riêng cho Việt Nam, vì hiện chưa có API công khai thống nhất cho loại dữ liệu này)
- Admin: hàng đợi kiểm duyệt cho đánh giá/bình luận cộng đồng trên trang nghề nghiệp

## 4. Không gian Cố vấn & Chia sẻ từ Cựu sinh viên (Diễn đàn Cộng đồng)
- Cấu trúc diễn đàn theo chủ đề — tổ chức theo lĩnh vực/chuyên ngành (ví dụ: Khoa học Máy tính, DevOps, MLOps, Kinh doanh, Y khoa, Thiết kế...), không phải ghép cặp 1:1
- Chuỗi bài đăng & trả lời trong từng chủ đề — học sinh, cựu sinh viên, người đi làm có thể đăng câu hỏi, câu trả lời, thảo luận
- Theo dõi/đăng ký chủ đề — học sinh có thể theo dõi các chủ đề quan tâm và nhận cập nhật bài mới
- Upvote/đánh dấu hữu ích cho câu trả lời — đưa câu trả lời hữu ích nhất lên đầu chuỗi
- Hồ sơ người đóng góp — huy hiệu/nhãn thể hiện vai trò (học sinh hiện tại, cựu sinh viên, người đi làm) và lĩnh vực, để người đọc biết nguồn gốc thông tin
- Nhắn tin trực tiếp trong ứng dụng — nhắn tin 1:1 giữa người dùng (học sinh với cựu sinh viên, học sinh với học sinh), tách biệt khỏi diễn đàn công khai; có kèm báo cáo/kiểm duyệt vì đối tượng người dùng có trẻ vị thành niên
- Thư viện chuyện "Một ngày làm nghề X" — bài viết dạng blog do cựu sinh viên đóng góp (nội dung tốn ít công sức hơn mentoring trực tiếp, phù hợp giải quyết cold-start), có thể ghim trong các chủ đề liên quan
- Tìm kiếm trên toàn bộ chủ đề/bài đăng diễn đàn
- Admin: hàng đợi kiểm duyệt nội dung, công cụ tạo/quản lý chủ đề, xác minh vai trò người đóng góp (học sinh/cựu sinh viên/người đi làm)

## Các Tính năng Nền tảng Xuyên suốt (cần cho mọi phân hệ)
- Tài khoản đa vai trò: Học sinh, Phụ huynh (bảng điều khiển chỉ xem), Giáo viên/Cố vấn (quản lý một lớp, xem xu hướng tổng hợp), Cố vấn/Cựu sinh viên, Quản trị viên
- Xác thực & đồng ý: đăng ký học sinh (xác minh mã trường gắn với các trường học Việt Nam), quy trình đồng ý của phụ huynh — quan trọng vì đối tượng người dùng là trẻ vị thành niên
- Thông báo: nhắc khảo sát/nhiệm vụ, phiên cố vấn mới, gợi ý lộ trình mới
- Kiểm soát quyền riêng tư & dữ liệu: màn hình đồng ý rõ ràng, phụ huynh có thể xem hoạt động, không công khai dữ liệu khảo sát cá nhân thô, tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân liên quan đến xử lý dữ liệu trẻ vị thành niên
- Bảng điều khiển chính: mức độ hoàn thiện hồ sơ, hành động tiếp theo được đề xuất, dòng hoạt động gần đây
- Bảng điều khiển giáo viên/cố vấn: xem xu hướng toàn lớp (ví dụ: "60% học sinh khối 11 thiên về STEM"), khả năng giao nhiệm vụ cho cả lớp
- Báo cáo/xuất tổng hợp: PDF kết hợp kết quả khảo sát + lộ trình đề xuất hàng đầu + cố vấn gợi ý, có thể chia sẻ với phụ huynh
- Tìm kiếm/lọc toàn cục trên các nghề nghiệp, ngành học, trường đại học
- Công cụ kiểm duyệt & báo cáo, áp dụng toàn nền tảng

## Lớp AI (tính năng cộng thêm — lên phạm vi riêng, xây dựng sau cùng)
- Chọn câu hỏi tiếp theo thích ứng trong khảo sát (bắt đầu bằng rule-based, nâng cấp lên ML sau)
- Mô hình xếp hạng mức độ phù hợp kết hợp kết quả khảo sát + hiệu suất micro-task
- Gợi ý chủ đề/chuỗi bài dạng văn bản tự do (hiển thị các thảo luận diễn đàn liên quan dựa trên hồ sơ hoặc hoạt động gần đây của học sinh)
- Trợ lý chat hỏi-đáp nghề nghiệp dựa trên dữ liệu thị trường của chính nền tảng (RAG trên bộ dữ liệu lương/nhu cầu)
- Gắn cờ nguy cơ mất hứng thú/bỏ cuộc cho giáo viên/cố vấn

---

## Câu hỏi Mở cho Bước tiếp theo (Phân loại phạm vi)
- Trụ cột nào sẽ có **bản mẫu hoạt động (prototype)** trong Học kỳ 1 so với chỉ **thiết kế/đề xuất**?
- Chiến lược nguồn dữ liệu cho lương/nhu cầu/điểm chuẩn của Việt Nam là gì (Trụ cột 3)? Không có API công khai thống nhất nào tồn tại — có thể cần scraping/tổng hợp từ GSO, cổng tuyển sinh đại học, và các trang việc làm như VietnamWorks/TopCV.
- Làm sao giải quyết vấn đề cold-start của diễn đàn (Trụ cột 4) trong một học kỳ — ví dụ: tự gieo mầm các chủ đề/chuỗi bài ban đầu hoặc tuyển đội ngũ đóng góp ban đầu từ chính cộng đồng trường đại học của bạn?
- "Lớp AI" nên đi sâu đến đâu trong Học kỳ 1 — dùng rule-based thay thế hay ML thực sự, và có thành phần AI nào (ví dụ trợ lý hỏi-đáp nghề nghiệp) cần được huấn luyện/prompt riêng cho tiếng Việt không?
- Quy trình đồng ý của phụ huynh và xử lý dữ liệu trẻ vị thành niên sẽ được triển khai như thế nào để phù hợp với Nghị định 13/2023/NĐ-CP?

---

## Đánh giá Tính khả thi để Đưa ra Thị trường

### Khả thi để đưa ra thị trường

**1. Khảo sát & hồ sơ học vấn (Pillar 1)** — Đây là lõi sản phẩm, kỹ thuật đơn giản (form logic + lưu trữ dữ liệu), không phụ thuộc nguồn ngoài. Radar chart, tổ hợp môn, xuất PDF đều làm được ngay với đội nhỏ.

**2. Micro-task exploration (Pillar 2)** — Nội dung do chính đội ngũ biên soạn (không phụ thuộc dữ liệu bên thứ ba khó lấy), có thể launch với 15-25 lĩnh vực MVP như đề xuất, mở rộng dần. Gamification (badge, smart queue) là tính năng UX tiêu chuẩn, chi phí thấp.

**3. Bản đồ lộ trình + điểm chuẩn (một phần Pillar 3)** — Điểm chuẩn tuyển sinh (điểm chuẩn) là dữ liệu công khai, có sẵn hàng năm từ các trường/Bộ GD&ĐT, tổng hợp thủ công hoặc scrape định kỳ là khả thi. "What-if" simulator và pathway map chỉ là logic map dữ liệu này.

**4. Cross-cutting: Auth, multi-role, dashboard, notification** — Là hạ tầng chuẩn của mọi SaaS giáo dục, không có rủi ro đặc thù, bắt buộc phải có để launch.

**5. AI Layer — bản rule-based** — "Adaptive next-question" và "fit-score ranking" ở dạng rule-based (không cần ML) hoàn toàn khả thi ngay từ đầu và tạo cảm giác "AI" cho sản phẩm mà không cần dữ liệu huấn luyện lớn.

### Khó khả thi / nên trì hoãn hoặc scope lại

**Dữ liệu lương/nhu cầu lao động từ VietnamWorks, TopCV, GSO (Pillar 3)** — Đây là "hidden scope item" mà chính tài liệu đã tự nhận diện. Lý do: không có API công khai thống nhất, các trang như VietnamWorks/TopCV không cấp API mở và scraping quy mô lớn có rủi ro pháp lý/ToS + cần bảo trì liên tục khi cấu trúc trang thay đổi. **Khuyến nghị:** launch với bộ dữ liệu tĩnh cập nhật thủ công theo quý từ báo cáo GSO/Bộ LĐTB&XH thay vì pipeline scraping tự động.

**Diễn đàn cộng đồng (Pillar 4)** — Vấn đề cold-start là thật: một forum trống không có giá trị, nhưng để có nội dung cần cộng đồng cựu sinh viên/mentor sẵn có mà một sản phẩm mới không có. Nhắn tin 1:1 giữa học sinh vị thành niên và người lạ (alumni) tạo rủi ro an toàn trẻ em (child safety) đáng kể, đòi hỏi kiểm duyệt real-time, không chỉ moderation queue sau sự việc — chi phí vận hành cao so với quy mô MVP. **Khuyến nghị:** launch trước với "câu chuyện nghề nghiệp" dạng blog (nội dung do đội ngũ sản xuất/mời viết), hoãn forum + DM 1:1 đến khi có đủ người dùng và quy trình kiểm duyệt an toàn.

**Import học bạ từ định dạng trường học Việt Nam** — Không có chuẩn định dạng thống nhất giữa các trường/hệ thống quản lý học bạ (VNEdu, SMAS, các phần mềm riêng của từng Sở), nên "import" thực chất sẽ cần tích hợp riêng lẻ từng nguồn — không khả thi ở MVP. **Khuyến nghị:** chỉ nhập tay ở giai đoạn đầu.

**Đồng ý phụ huynh & tuân thủ Nghị định 13/2023/NĐ-CP** — Về mặt kỹ thuật khả thi, nhưng đây là rủi ro pháp lý thực sự nếu launch thật (không phải đồ án demo): xử lý dữ liệu trẻ vị thành niên yêu cầu quy trình đồng ý có thể kiểm chứng được, không chỉ một checkbox. Nếu chỉ là bản demo/đồ án tốt nghiệp, có thể làm ở mức tối thiểu; nếu đưa ra thị trường thật, cần tư vấn pháp lý trước khi thu thập dữ liệu học sinh thật.

**RAG career Q&A chatbot bằng tiếng Việt** — Khả thi về công nghệ nhưng phụ thuộc vào chính bộ dữ liệu lương/nhu cầu ở trên (chưa có), nên nên xếp sau cùng đúng như tài liệu đã đề xuất ("build last").

Nhìn chung, nhóm khả thi cho MVP/Semester 1 gần trùng với Pillar 1, 2, phần tĩnh của Pillar 3, và hạ tầng cross-cutting; nhóm rủi ro cao nên để prototype/design-only là forum + DM, data pipeline tự động, và import học bạ.
