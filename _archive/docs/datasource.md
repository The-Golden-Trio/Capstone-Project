# Nguồn Dữ liệu

Danh sách các nguồn dữ liệu mà nền tảng sẽ sử dụng, theo từng nhóm.

## 1. Dữ liệu học vụ & tuyển sinh

- Chương trình GDPT 2018 — cấu trúc môn học, môn bắt buộc/tự chọn.
- Các tổ hợp môn xét tuyển đại học chuẩn của Việt Nam (A00, A01, B00, C00, D01, D07, v.v.) và ánh xạ sang các ngành đại học đủ điều kiện xét tuyển.
- Điểm chuẩn tuyển sinh (điểm chuẩn) của các trường đại học Việt Nam theo từng năm, bao gồm cả phương thức xét điểm thi tốt nghiệp THPT và xét học bạ — nguồn từ website các trường và Bộ GD&ĐT.

**Link tham khảo:**
- Cổng thông tin Bộ Giáo dục và Đào tạo: https://moet.gov.vn
- Website tuyển sinh/điểm chuẩn của từng trường đại học (mỗi trường công bố riêng theo năm, cần tổng hợp thủ công hoặc bằng scraper theo từng trường).

## 2. Dữ liệu thị trường lao động

- Báo cáo Bộ Lao động – Thương binh và Xã hội (LĐTB&XH) và Tổng cục Thống kê (GSO) — xu hướng nhu cầu/tăng trưởng lao động theo ngành.
- Dữ liệu lương và nhu cầu tuyển dụng từ các trang việc làm như VietnamWorks, TopCV.
- **Cách thu thập:** do AI/agent tự động scrape và tổng hợp định kỳ từ các nguồn công khai nói trên, không nhập thủ công — dữ liệu lương, nhu cầu tuyển dụng và điểm chuẩn được cập nhật liên tục để phản ánh đúng thị trường thực tế.

**Link tham khảo:**
- Tổng cục Thống kê (GSO): https://www.gso.gov.vn
- VietnamWorks: https://www.vietnamworks.com
- TopCV: https://www.topcv.vn
- Cổng thông tin Bộ Lao động – Thương binh và Xã hội — *lưu ý: chức năng/cơ quan quản lý lĩnh vực lao động có thể đã thay đổi do tái cơ cấu bộ máy chính phủ gần đây, cần kiểm tra lại tên và domain hiện hành trước khi tích hợp.*

## 3. Dữ liệu học vấn cá nhân của học sinh

- Điểm số/học bạ và tổ hợp môn — nhập trực tiếp bởi học sinh trong quá trình sử dụng nền tảng (không tích hợp với các hệ thống quản lý học bạ của trường như VNEdu, SMAS do chưa có chuẩn định dạng thống nhất giữa các trường/Sở).

**Link tham khảo:**
- VNEdu (Viettel): https://vnedu.vn
- SMAS — hệ thống quản lý học bạ nội bộ của từng Sở/trường, không có domain công khai thống nhất.

## 4. Dữ liệu tự sinh trên nền tảng

- Nội dung micro-task mô phỏng theo từng lĩnh vực nghề nghiệp — do đội ngũ nội dung biên soạn.
- Bài viết "một ngày làm nghề X" — do cựu sinh viên/người đi làm đóng góp.
- Bài đăng, thảo luận trong diễn đàn theo chủ đề — do học sinh, cựu sinh viên, người đi làm tạo ra.
- Đánh giá, xếp hạng và bình luận cộng đồng trên từng trang nghề nghiệp/công việc.

*(Nguồn nội bộ, do người dùng và đội ngũ tạo ra trên chính nền tảng — không có link tham khảo bên ngoài.)*

## 5. Khung pháp lý tham chiếu

- Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân — không phải nguồn dữ liệu sản phẩm, nhưng là ràng buộc bắt buộc khi thu thập, lưu trữ và xử lý dữ liệu của học sinh (đối tượng có trẻ vị thành niên).

**Link tham khảo:**
- Cổng thông tin điện tử Chính phủ (văn bản pháp luật): https://vanban.chinhphu.vn — tra cứu theo số hiệu "13/2023/NĐ-CP".

---

*Lưu ý:* các đường link trên là trang chủ/domain chính thức của từng nguồn ở mức tôi tự tin về tính chính xác; đường link sâu đến báo cáo/trang dữ liệu cụ thể có thể thay đổi theo thời gian nên cần kiểm tra lại khi triển khai thực tế thay vì hard-code.
