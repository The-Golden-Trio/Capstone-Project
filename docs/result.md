# Thành phẩm Dự án

## Sản phẩm là gì?

Một **nền tảng định hướng nghề nghiệp bằng AI** dành riêng cho học sinh THPT Việt Nam, xây dựng quanh 4 trụ cột chính:

1. **Khảo sát & hồ sơ học vấn cá nhân hóa** — khảo sát onboarding thích ứng, hồ sơ điểm số/tổ hợp môn theo chương trình GDPT 2018, "chân dung năng lực" (radar chart kết hợp Holland RIASEC + đa trí thông minh + học lực), theo dõi sự thay đổi sở thích theo thời gian.
2. **Micro-task khám phá nghề nghiệp** — thư viện tình huống mô phỏng ngắn theo từng lĩnh vực, chấm điểm mức độ phù hợp dựa trên hiệu suất thực tế thay vì chỉ tự đánh giá, gamification khuyến khích khám phá nhiều lĩnh vực.
3. **Bản đồ lộ trình & phân tích thị trường** — bản đồ tương tác Tổ hợp môn → Ngành học → Nghề nghiệp, tra cứu/so sánh điểm chuẩn tuyển sinh, biểu đồ lương/nhu cầu lao động theo VND, bộ mô phỏng "what-if", công cụ xây dựng lộ trình cá nhân nhiều năm.
4. **Không gian cố vấn & chia sẻ từ cựu sinh viên** — diễn đàn theo chủ đề, chuyện "một ngày làm nghề X", nhắn tin trực tiếp có kiểm duyệt (vì đối tượng là trẻ vị thành niên).

Bốn trụ cột này được đặt trong một hạ tầng dùng chung: tài khoản đa vai trò (học sinh, phụ huynh, cố vấn/cựu sinh viên, admin), thông báo, kiểm soát quyền riêng tư tuân thủ Nghị định 13/2023/NĐ-CP, bảng điều khiển cho giáo viên/cố vấn theo dõi xu hướng cả lớp, và báo cáo tổng hợp có thể chia sẻ với phụ huynh.

## Dành cho ai?

- **Học sinh THPT Việt Nam** — đối tượng sử dụng chính, đặc biệt ở giai đoạn chọn tổ hợp môn và định hướng ngành/nghề.
- **Phụ huynh** — theo dõi hoạt động và nhận báo cáo tổng hợp về con em mình.
- **Giáo viên/cố vấn hướng nghiệp** — công cụ quản lý lớp, xem xu hướng tổng hợp (ví dụ "60% học sinh khối 11 thiên về STEM"), giao nhiệm vụ cho cả lớp.
- **Cựu sinh viên và người đi làm** — đóng vai trò mentor, chia sẻ kinh nghiệm thực tế qua diễn đàn và bài viết.
- **Đội ngũ quản trị/nội dung nhà trường** — quản lý ngân hàng câu hỏi, nội dung micro-task, kiểm duyệt diễn đàn và dữ liệu thị trường.

## Điểm đột phá

So với các giải pháp hiện có tại Việt Nam — khảo sát giấy/Google Form thủ công do giáo viên thực hiện, chương trình nội bộ của Vinschool (không công khai), các hội chợ hướng nghiệp đơn lẻ, hay VietCareer (nhắm người đi làm, không phải học sinh THPT) — nền tảng này khác biệt ở:

- **Cá nhân hóa dựa trên hiệu suất thực tế:** điểm phù hợp nghề nghiệp được tính từ cách học sinh thực sự thực hiện các micro-task mô phỏng, không chỉ dựa trên tự đánh giá qua trắc nghiệm tính cách.
- **Gắn chặt với hệ thống giáo dục Việt Nam:** tổ hợp môn (A00, A01, B00, C00, D01, D07...) theo đúng chương trình GDPT 2018 và cơ chế tuyển sinh đại học trong nước, thay vì mô hình hướng nghiệp chung chung của nước ngoài.
- **"What-if" simulator:** cho phép học sinh thay đổi tổ hợp môn và thấy ngay những ngành/nghề nào mở ra hoặc đóng lại, biến việc chọn môn thành một quyết định có dữ liệu hỗ trợ.
- **Dữ liệu thị trường lao động luôn cập nhật nhờ AI:** thay vì cập nhật thủ công theo quý, hệ thống dùng AI để tự động scrape và tổng hợp dữ liệu lương, nhu cầu tuyển dụng, điểm chuẩn từ các nguồn công khai — giữ cho lộ trình và so sánh nghề nghiệp luôn phản ánh thị trường thực tế mà không cần đội vận hành lớn.
- **Lớp AI thông minh dần theo thời gian:** bắt đầu từ rule-based (chọn câu hỏi tiếp theo, xếp hạng mức độ phù hợp) và có thể nâng cấp lên mô hình học máy, kể cả một trợ lý hỏi-đáp nghề nghiệp dạng RAG dựa trên chính dữ liệu thị trường của nền tảng.
- **Đúng thời điểm thị trường:** Bộ GD&ĐT đang thí điểm khung giáo dục AI định vị bậc THPT là giai đoạn "thiết kế và định hướng nghề nghiệp" (hoàn tất đánh giá thí điểm giữa năm 2026) — tạo lực đẩy thể chế thực sự cho việc các trường tiếp nhận sản phẩm.

## Phạm vi ưu tiên (MVP/Học kỳ 1)

Theo đánh giá tính khả thi, nhóm tính năng khả thi để triển khai sớm gồm: Pillar 1 (khảo sát & hồ sơ), Pillar 2 (micro-task), phần tĩnh của Pillar 3 (bản đồ lộ trình + điểm chuẩn), và hạ tầng cross-cutting (auth, đa vai trò, dashboard, thông báo). Diễn đàn/nhắn tin 1:1 (Pillar 4), pipeline dữ liệu tự động quy mô lớn, và import học bạ theo định dạng trường học được xếp vào nhóm rủi ro cao hơn, ưu tiên prototype/thiết kế trước khi triển khai đầy đủ.
