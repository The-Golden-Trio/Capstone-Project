# Lương rao và số tin theo nghề (VietJobs)

> Sinh bởi `occupation-data/scripts/build_vietjobs_stats.py`. Sửa luật khớp ở `decisions/vietjobs_title_rules.json`.
> Lương rao, không phải lương thực nhận. Bộ dữ liệu không có ngày đăng của từng tin. Chưa ghi trên trang dữ liệu; repo code của nhóm tác giả là MIT. Cần hỏi tác giả trước khi công bố.

33964 tin sau làm sạch, 20503 tin khớp ít nhất một nghề. 75/184 nghề có đủ 20 tin có lương.

| Nghề | Số tin | /10.000 | Có lương | P25 | Trung vị | P75 | Chức danh hay gặp |
|---|---|---|---|---|---|---|---|
| ONET-41-4012.00 | 3511 | 1033.7 | 2769 | 12.5 | 15.0 | 20.0 | Nhân Viên Kinh Doanh; Nhân Viên Kinh Doanh Thị Trường; Chuyên Viên Kinh Doanh |
| ONET-13-2011.00 | 3036 | 893.9 | 2340 | 10.0 | 12.5 | 15.0 | Kế Toán Tổng Hợp; Nhân Viên Kế Toán; Kế Toán Nội Bộ |
| ONET-13-1161.00 | 1309 | 385.4 | 1021 | 10.5 | 12.5 | 15.0 | Nhân Viên Marketing; Nhân Viên Content Marketing; Nhân Viên Digital Marketing |
| ONET-43-6014.00 | 848 | 249.7 | 587 | 9.5 | 11.5 | 14.0 | Trợ Lý Tiếng Trung; Nhân Viên Văn Phòng; Nhân Viên Admin |
| ONET-41-2031.00 | 733 | 215.8 | 606 | 8.5 | 11.0 | 16.0 | Nhân Viên Bán Hàng; Nhân Viên Tư Vấn Bán Hàng; Nhân Viên Bán Hàng Thời Trang |
| ONET-27-4031.00 | 715 | 210.5 | 606 | 11.0 | 12.5 | 15.0 | Nhân Viên Video Editor; Video Editor; Nhân Viên Quay Dựng |
| ONET-43-4051.00 | 702 | 206.7 | 568 | 9.0 | 10.5 | 13.5 | Nhân Viên Chăm Sóc Khách Hàng; Chăm Sóc Khách Hàng; Chuyên Viên Chăm Sóc Khách Hàng |
| ONET-27-3043.00 | 694 | 204.3 | 578 | 10.0 | 11.5 | 13.0 | Nhân Viên Content Marketing; Người tạo nội dung; Nhân Viên Content Creator |
| ONET-27-1024.00 | 657 | 193.4 | 472 | 11.0 | 12.5 | 15.0 | Nhân Viên Thiết Kế; Thiết kế đồ họa; Nhân Viên Thiết Kế Đồ Họa |
| ONET-43-5071.00 | 545 | 160.5 | 418 | 8.5 | 9.0 | 11.0 | Nhân Viên Kho; Nhân Viên Thủ Kho; Thủ Kho |
| ONET-13-1071.00 | 496 | 146.0 | 373 | 10.0 | 12.5 | 15.0 | Chuyên Viên Tuyển Dụng; Nhân Viên Tuyển Dụng; Chuyên Viên Nhân Sự |
| ONET-13-1023.00 | 438 | 129.0 | 317 | 11.2 | 12.5 | 15.5 | Nhân Viên Mua Hàng; Nhân Viên Thu Mua; Chuyên Viên Mua Hàng |
| ONET-49-9041.00 | 336 | 98.9 | 246 | 10.0 | 11.5 | 13.0 | Nhân Viên Bảo Trì; Nhân Viên Kỹ Thuật Bảo Trì; Nhân Viên Bảo Trì Điện |
| ONET-51-9061.00 | 335 | 98.6 | 219 | 10.0 | 12.0 | 14.0 | Nhân Viên QC; Nhân Viên Kiểm Soát Chất Lượng; Nhân Viên QA |
| ONET-17-2051.00 | 333 | 98.0 | 244 | 14.0 | 16.5 | 18.5 | Kỹ Sư Xây Dựng; Kỹ Sư Hiện Trường; Kỹ Sư Kết Cấu |
| ONET-27-1014.00 | 324 | 95.4 | 243 | 12.5 | 15.0 | 17.5 | Nhân Viên Thiết Kế 3D; Nhân Viên Thiết Kế 2D; Chuyên Viên Thiết Kế 3D |
| ONET-41-9031.00 | 285 | 83.9 | 211 | 13.5 | 16.5 | 22.5 | Nhân Viên Kinh Doanh Phần Mềm; Kỹ Sư Bán Hàng; Nhân Viên Kinh Doanh Thiết Bị Y Tế |
| ONET-13-1081.00 | 283 | 83.3 | 186 | 11.0 | 12.5 | 15.0 | Nhân Viên Xuất Nhập Khẩu; Nhân Viên Khai Báo Hải Quan; Chuyên Viên Xuất Nhập Khẩu |
| ONET-41-3041.00 | 271 | 79.8 | 208 | 10.5 | 13.0 | 17.5 | Nhân Viên Điều Hành Tour; Nhân Viên Kinh Doanh Du Lịch; Nhân viên kinh doanh tư vấn du lịch |
| ONET-17-1011.00 | 262 | 77.1 | 178 | 15.0 | 17.5 | 20.0 | Kiến Trúc Sư; Kiến Trúc Sư Triển Khai; Kiến Trúc Sư Thiết Kế Nội Thất |
| ONET-13-1051.00 | 253 | 74.5 | 187 | 13.5 | 16.0 | 18.5 | Kỹ Sư QS; Nhân Viên Dự Toán; Kỹ Sư Dự Toán |
| ONET-13-1199.06 | 224 | 66.0 | 185 | 10.0 | 12.0 | 15.0 | Nhân Viên Vận Hành Sàn Thương Mại Điện Tử; Nhân Viên Sale Online; Nhân Viên Bán Hàng Online |
| ONET-27-3091.00 | 221 | 65.1 | 144 | 13.5 | 15.5 | 18.9 | Phiên Dịch Tiếng Trung; Trợ Lý Phiên Dịch Tiếng Trung; Nhân Viên Phiên Dịch Tiếng Hàn |
| ONET-17-2071.00 | 210 | 61.8 | 151 | 13.5 | 16.0 | 20.0 | Kỹ Sư Điện; Kỹ Sư Cơ Điện; Kỹ Sư Tự Động Hóa |
| ONET-51-9111.00 | 201 | 59.2 | 149 | 9.0 | 11.0 | 12.5 | Nhân Viên Vận Hành Máy; Nhân Viên Vận Hành Máy CNC; Nhân Viên Đóng Gói |
| ONET-21-1012.00 | 187 | 55.1 | 167 | 13.0 | 19.0 | 22.5 | Nhân Viên Tư Vấn Tuyển Sinh; Chuyên Viên Tư Vấn Tuyển Sinh; Tư Vấn Tuyển Sinh |
| ONET-19-5011.00 | 170 | 50.1 | 90 | 12.9 | 15.0 | 17.5 | Giám Sát An Toàn Lao Động; Nhân Viên An Toàn Lao Động; Nhân Viên HSE |
| ONET-35-2014.00 | 162 | 47.7 | 119 | 8.0 | 10.0 | 15.0 | Nhân Viên Phụ Bếp; Bếp Chính; Bếp Trưởng |
| ONET-17-2141.00 | 160 | 47.1 | 118 | 12.5 | 15.0 | 17.5 | Kỹ Sư Thiết Kế Cơ Khí; Kỹ Sư Cơ Khí; Kỹ sư cơ khí |
| ONET-27-1025.00 | 158 | 46.5 | 142 | 12.9 | 15.2 | 17.5 | Nhân Viên Thiết Kế Nội Thất; Thiết Kế Nội Thất; Kiến Trúc Sư Thiết Kế Nội Thất |
| ONET-27-3041.00 | 149 | 43.9 | 134 | 10.0 | 11.5 | 13.5 | Nhân Viên Editor; Biên Tập Viên; Editor |
| ONET-41-9022.00 | 148 | 43.6 | 112 | 12.0 | 22.5 | 51.9 | Nhân Viên Kinh Doanh Bất Động Sản; Nhân Viên Kinh Doanh/ Tư Vấn/ Sales Bất Động Sản; Chuyên Viên Kinh Doanh Bất Động Sản |
| ONET-13-1082.00 | 147 | 43.3 | 83 | 15.0 | 20.0 | 28.5 | Quản Lý Dự Án; Project Manager; Nhân Viên Quản Lý Dự Án |
| ONET-11-3051.00 | 142 | 41.8 | 92 | 16.1 | 21.0 | 27.5 | Quản Lý Sản Xuất; Giám Đốc Sản Xuất; Trưởng Phòng Sản Xuất |
| ONET-23-2011.00 | 139 | 40.9 | 84 | 11.6 | 15.0 | 20.0 | Chuyên Viên Pháp Chế; Chuyên Viên Pháp Lý; Nhân Viên Pháp Chế |
| ONET-51-4041.00 | 128 | 37.7 | 106 | 10.5 | 12.5 | 15.6 | Nhân Viên Vận Hành Máy CNC; Thợ Cơ Khí; Nhân Viên Kỹ Thuật CNC |
| ONET-41-2011.00 | 126 | 37.1 | 103 | 7.0 | 8.5 | 9.5 | Nhân Viên Thu Ngân; Thu Ngân; Nhân Viên Lễ Tân - Thu Ngân |
| ONET-29-1141.00 | 111 | 32.7 | 81 | 10.5 | 12.0 | 14.8 | Điều Dưỡng Viên; Điều Dưỡng; Nhân Viên Điều Dưỡng |
| ONET-11-1021.00 | 110 | 32.4 | 50 | 14.5 | 20.0 | 43.1 | Giám Đốc Vận Hành; Giám Đốc Điều Hành; Giám Đốc Chi Nhánh |
| ONET-25-3041.00 | 109 | 32.1 | 79 | 10.5 | 12.5 | 17.0 | Giáo Viên Tiếng Anh; Giáo Viên Tiếng Trung; Giáo Viên Tiếng Nhật |
| ONET-43-4081.00 | 104 | 30.6 | 78 | 7.5 | 8.5 | 10.5 | Nhân Viên Lễ Tân; Lễ Tân Khách Sạn; Nhân Viên Lễ Tân Văn Phòng |
| ONET-43-5021.00 | 98 | 28.9 | 87 | 9.0 | 10.0 | 11.5 | Nhân Viên Giao Hàng; Nhân Viên Giao Nhận; Nhân Viên Giao Hàng Xe Máy |
| ONET-29-1051.00 | 97 | 28.6 | 69 | 11.0 | 13.5 | 17.5 | Trình Dược Viên OTC; Trình Dược Viên; Dược Sĩ |
| ONET-17-2081.00 | 95 | 28.0 | 71 | 10.0 | 12.5 | 17.0 | Nhân Viên Môi Trường; Nhân Viên Quan Trắc Môi Trường; Nhân Viên Kỹ Thuật Môi Trường |
| ONET-47-2111.00 | 94 | 27.7 | 74 | 9.0 | 11.5 | 12.6 | Nhân Viên Kỹ Thuật Điện; Nhân Viên Kỹ Thuật Điện Nước; Thợ Điện |
| ONET-17-2112.00 | 90 | 26.5 | 60 | 10.6 | 12.5 | 16.0 | Nhân Viên Kế Hoạch Sản Xuất; Chuyên Viên Kế Hoạch Sản Xuất; Kế Hoạch Sản Xuất |
| ONET-11-9051.00 | 80 | 23.6 | 54 | 12.0 | 14.0 | 17.5 | Quản Lý Nhà Hàng; Trợ Lý Quản Lý Nhà Hàng; Cửa Hàng Trưởng/Quản Lý Nhà Hàng |
| ONET-39-5094.00 | 80 | 23.6 | 72 | 11.5 | 14.5 | 20.0 | Kỹ Thuật Viên Spa; Kỹ Thuật Viên Chăm Sóc Da; Tư Vấn Viên Spa |
| ONET-27-1022.00 | 74 | 21.8 | 46 | 11.5 | 14.0 | 16.8 | Nhân Viên Thiết Kế Rập; Nhân Viên Thiết Kế Thời Trang; Thiết Kế Thời Trang |
| ONET-13-1121.00 | 73 | 21.5 | 52 | 11.0 | 12.5 | 13.5 | Nhân Viên Tổ Chức Sự Kiện; Chuyên Viên Tổ Chức Sự Kiện; Nhân Viên Sự Kiện |
| ONET-11-9021.00 | 71 | 20.9 | 48 | 21.5 | 22.5 | 27.5 | Chỉ Huy Trưởng Công Trình; Chỉ Huy Trưởng; Chỉ Huy Trưởng Cơ Điện |
| ONET-35-3031.00 | 71 | 20.9 | 59 | 7.5 | 8.5 | 11.0 | Nhân Viên Phục Vụ; Nhân Viên Phục Vụ Nhà Hàng; Phục Vụ Bàn |
| ONET-11-3012.00 | 70 | 20.6 | 46 | 18.4 | 22.5 | 28.5 | Trưởng Phòng Hành Chính Nhân Sự; Trưởng Phòng Hành Chính; Trưởng Phòng HCNS |
| ONET-13-1041.00 | 69 | 20.3 | 47 | 12.5 | 14.0 | 16.5 | Chuyên Viên Kiểm Soát Nội Bộ; Nhân Viên Kiểm Soát Nội Bộ; Kiểm Soát Nội Bộ |
| ONET-29-1215.00 | 65 | 19.1 | 29 | 17.0 | 22.0 | 38.8 | Bác Sĩ Da Liễu; Bác Sĩ Tiêm Chủng; Bác Sĩ Chẩn Đoán Hình Ảnh |
| ONET-43-5032.00 | 61 | 18.0 | 48 | 10.0 | 12.0 | 14.0 | Nhân Viên Điều Phối Vận Tải; Nhân Viên Điều Phối Xe; Nhân Viên Điều Phối Xe Container |
| ONET-19-2031.00 | 58 | 17.1 | 24 | 8.6 | 10.0 | 11.4 | Nhân Viên Phòng Thí Nghiệm; Nhân Viên Phòng Lab; Kiểm Nghiệm Viên Hóa Lý |
| ONET-11-9041.00 | 53 | 15.6 | 32 | 22.5 | 27.5 | 30.0 | Trưởng Phòng Kỹ Thuật; Trưởng Phòng R&D; Trưởng Phòng Kỹ Thuật Hạ Tầng, Giao Thông |
| ONET-27-1013.00 | 52 | 15.3 | 44 | 11.6 | 14.0 | 17.5 | 3D Artist; 2D Game Artist; Nhân Viên 2D Artist |
| ONET-13-2072.00 | 51 | 15.0 | 27 | 15.0 | 22.5 | 25.0 | Chuyên Viên Quan Hệ Khách Hàng Cá Nhân; Chuyên Viên Quan Hệ Khách Hàng Doanh Nghiệp; CHUYÊN VIÊN QUAN HỆ KHÁCH HÀNG CÁ NHÂN |
| ONET-13-2052.00 | 51 | 15.0 | 42 | 14.5 | 20.0 | 25.1 | Chuyên Viên Tư Vấn Tài Chính; Nhân Viên Tư Vấn Tài Chính; Nhân Viên Kinh Doanh - Chuyên Viên Tư Vấn Tài Chính Kênh Ngân Hàng |
| ONET-49-9021.00 | 51 | 15.0 | 41 | 10.5 | 11.0 | 14.5 | Nhân Viên Kỹ Thuật Điện Lạnh; Nhân Viên Bảo Trì Điện Lạnh; Nhân Viên Điện Lạnh |
| ONET-31-9011.00 | 45 | 13.2 | 40 | 10.1 | 12.5 | 18.2 | Kỹ Thuật Viên Spa; Nhân Viên Chăm Sóc Da - Kỹ Thuật Viên Spa (Da Cơ Bản + Dưỡng Sinh); Kỹ Thuật Viên Massage Mẹ Bé |
| ONET-33-9032.00 | 45 | 13.2 | 25 | 8.0 | 9.5 | 14.5 | Nhân Viên An Ninh; Nhân Viên Bảo Vệ; Bảo Vệ |
| ONET-35-3023.01 | 44 | 13.0 | 27 | 7.0 | 8.5 | 11.5 | Nhân Viên Pha Chế; Bartender; Giám Sát Bar |
| ONET-51-2092.00 | 41 | 12.1 | 26 | 8.5 | 10.0 | 11.5 | Nhân Viên Lắp Ráp Và Điều Chỉnh Tổng Hợp; Nhân Viên Lắp Ráp Thiết Bị Y TẾ; Công Nhân Lắp Ráp |
| ONET-37-2011.00 | 36 | 10.6 | 29 | 7.2 | 8.5 | 10.2 | Nhân Viên Buồng Phòng; Giám Sát Vệ Sinh Công Nghiệp; Phó Bộ Phận Buồng Phòng |
| ONET-53-7062.00 | 36 | 10.6 | 29 | 7.2 | 8.0 | 9.2 | Nhân Viên Đóng Gói; Nhân Viên Soạn Hàng, Đóng Gói Hàng Hoá Máy Móc; Nhân Viên KCS Đóng Gói Hàng Hoá |
| ONET-25-1081.00 | 34 | 10.0 | 13 |  |  |  | Giảng Viên Cơ Hữu; Giảng Viên An Toàn Điện; Giảng Viên Điều Dưỡng |
| ONET-51-5112.00 | 32 | 9.4 | 24 | 9.0 | 11.5 | 11.9 | Nhân Viên Kỹ Thuật In Ấn; Nhân Viên Thiết Kế - In Ấn Bao Bì Tem Nhãn; Nhân Viên Kỹ Thuật Bình Ghép File Và In Ấn |
| ONET-19-1013.00 | 30 | 8.8 | 22 | 11.4 | 12.5 | 16.4 | Kỹ Sư Nông Nghiệp; Nhân Viên Kỹ Thuật Nông Nghiệp; Kỹ Sư Nông Nghiệp - Chuyên Ngành Phân Bón - BVTV |
| ONET-11-9032.00 | 29 | 8.5 | 15 |  |  |  | Trưởng Phòng Đào Tạo; Quản Lý Đào Tạo; Phó Hiệu Trưởng |
| ONET-51-6031.00 | 29 | 8.5 | 20 | 9.2 | 11.8 | 16.2 | Thợ May Mẫu Sản Xuất-Hàng Thiết Kế Thời Trang; Thợ May; Nhân Viên Thiết Kế/ Pattern Staff (May Mặc) |
| ONET-23-1011.00 | 28 | 8.2 | 10 |  |  |  | Luật Sư; Luật Sư Khởi Kiện Tại Tòa Án; Trợ Lý Luật Sư |
| ONET-49-3023.00 | 26 | 7.7 | 20 | 8.6 | 12.0 | 15.0 | Nhân Viên Kỹ Thuật Ô Tô; Kỹ Thuật Viên Ô Tô; Kỹ Thuật Viên Sửa Chữa Ô Tô |
| ONET-51-8031.00 | 25 | 7.4 | 20 | 10.1 | 13.0 | 17.5 | Nhân Viên Vận Hành Hệ Thống Xử Lý Nước Thải; Nhân Viên Bảo Trì Hệ Thống Xử Lý Nước; Nhân Viên Xử Lý Nước Thải |
| ONET-19-3051.00 | 23 | 6.8 | 14 |  |  |  | Kiến Trúc Sư Quy Hoạch; Chuyên Viên Thiết Kế Quy Hoạch; Chuyên Viên Quy Hoạch - Xây Dựng |
| ONET-31-9091.00 | 23 | 6.8 | 20 | 10.5 | 11.5 | 12.5 | Phụ Tá Nha Khoa; Trợ Thủ Nha Khoa; Nhân Viên Điều Dưỡng/Phụ Tá Nha Khoa |
| ONET-45-2093.00 | 22 | 6.5 | 13 |  |  |  | Nhân Viên Kỹ Thuật Chăn Nuôi Heo; Kỹ Thuật Viên Chăn Nuôi - Trại Heo/Gà - Hỗ Trợ Chỗ Ở; Kỹ Thuật Chăn Nuôi (Không Yêu Cầu Kinh Nghiệm) |
| ONET-49-2094.00 | 22 | 6.5 | 20 | 10.0 | 11.0 | 13.2 | Nhân Viên Kỹ Thuật Điện Tử; Kỹ Thuật Viên Điện Tử; Nhân Viên Tiếp Nhận & Điều Phối Sửa Chữa Laptop |
| ONET-53-7051.00 | 22 | 6.5 | 11 |  |  |  | Nhân Viên Vận Hành Xe Nâng; Nhân Viên Kho Lái Xe Nâng; Trình quản lý thiết kế cấu trúc thép |
| ONET-13-2023.00 | 21 | 6.2 | 13 |  |  |  | Chuyên Viên Thẩm Định Giá; Nhân viên định giá; Nhân Viên Quy Hoạch, Kế Hoạch Và Định Giá Đất |
| ONET-19-1012.00 | 21 | 6.2 | 14 |  |  |  | Nhân Viên Nghiên Cứu Phát Triển Sản Phẩm; Nhân Viên R&D Thực Phẩm; Nhân Viên Nghiên Cứu Phát Triển Sản Phẩm POD |
| ONET-27-3023.00 | 21 | 6.2 | 18 |  |  |  | MC Kiêm Sự Kiện; Nhân Viên Lễ Tân - Có Kinh Nghiệm Làm MC; Chuyên Viên Truyền Thông (Kỹ Năng MC Tốt) |
| ONET-39-9032.00 | 21 | 6.2 | 17 |  |  |  | Quản Lý Khu Vui Chơi Trẻ Em; 2D Animator (Spine) All Level; Nhân Viên Giải Trí |
| ONET-11-9081.00 | 20 | 5.9 | 15 |  |  |  | Quản Lý Spa; Quản Lý Khách Sạn; Hotel Manager |
| ONET-27-2012.00 | 20 | 5.9 | 14 |  |  |  | Nhân Viên Media - Media Producer (Video Editor); Video Producer; Nhà sản xuất/biên tập viên |
| ONET-11-9141.00 | 19 | 5.6 | 14 |  |  |  | Trưởng Ban Quản Lý Tòa Nhà; Quản Lý Tòa Nhà; Nhân Viên Kế Toán - Hành Chính Ban Quản Lý Tòa Nhà |
| ONET-15-2041.00 | 19 | 5.6 | 15 |  |  |  | Nhân Viên Thống Kê; Nhân Viên Lễ Tân - Thống Kê; Chuyên Viên Báo Cáo Thống Kê - QLTC - MSB - 3K019 |
| ONET-17-2031.00 | 19 | 5.6 | 9 |  |  |  | Kỹ Sư Thiết Bị Y Tế; Nhân Viên Kỹ Thuật Thiết Bị Y Tế; Nhân Viên Lắp Ráp Thiết Bị Y TẾ |
| ONET-29-1021.00 | 19 | 5.6 | 13 |  |  |  | Bác Sĩ Nha Khoa; Bác Sĩ Răng Hàm Mặt; Tư Vấn Viên Nha Khoa Tấm Dentist |
| ONET-43-3071.00 | 19 | 5.6 | 9 |  |  |  | Giao Dịch Viên; Giao Dịch Viên/ Tư Vấn BĐS ( Có Lương Cứng Không Áp KPI ) |
| ONET-53-3032.00 | 18 | 5.3 | 16 |  |  |  | Tài Xế Xe Tải Giao Hàng; Nhân Viên Lái Xe Tải Giao Hàng; Tài Xế Xe Tải (Bằng B2) |
| ONET-47-2221.00 | 17 | 5.0 | 11 |  |  |  | Bản Vẽ Kết Cấu Thép - 鉄骨図面 - Tiếng Nhật N3; Nhân Viên Kỹ Thuật Nhôm Kính; Giám Sát Công Trường (Thi Công Cửa Nhôm Kính) |
| ONET-51-9071.00 | 16 | 4.7 | 14 |  |  |  | Trưởng/Phó Trung Tâm Trang Sức; Nhân Viên Thiết Kế Trang Sức 3D; Nhân Viên Tư Vấn Trang Sức Cao Cấp |
| ONET-25-4022.00 | 15 | 4.4 | 6 |  |  |  | Chuyên Viên Nghiệp Vụ Lưu Trữ Chứng Từ; Nhân Viên Văn Thư Phòng Kiểm Nghiệm; Thư Ký Bộ Phận Lưu Trú |
| ONET-27-4014.00 | 15 | 4.4 | 12 |  |  |  | Nhân Viên Kỹ Thuật Âm Thanh Hội Nghị; Nhân Viên Âm Thanh Nhạc Nền Video YouTube; Nhân Viên Kỹ Thuật Âm Thanh Ánh Sáng Sự Kiện |
| ONET-29-2034.00 | 15 | 4.4 | 7 |  |  |  | Kỹ Thuật Viên Chẩn Đoán Hình Ảnh; Bác Sĩ Chẩn Đoán Hình Ảnh; Giảng Viên Chẩn Đoán Hình Ảnh (Từ Thạc Sĩ Trở Lên) |
| ONET-29-2011.00 | 14 | 4.1 | 11 |  |  |  | Kỹ Thuật Viên Xét Nghiệm; Giảng Viên Xét Nghiệm Y Học (Từ Thạc Sĩ Trở Lên); Điều Dưỡng/KTV Xét Nghiệm Lấy Mẫu Tại Nhà |
| ONET-17-2199.05 | 13 | 3.8 | 8 |  |  |  | Nhân Viên Kỹ Thuật Cơ Điện Tử; Giáo Viên Robotics; Giáo Viên Tin Học - Robotics |
| ONET-27-1021.00 | 13 | 3.8 | 2 |  |  |  | Product Design - Thiết Kế Thời Trang (Ngành Giày Dép); Nhân Viên Thiết Kế Sản Phẩm Khuôn Bu Lông Ốc Vít; Chuyên Gia Xây Dựng Và Thiết Kế Sản Phẩm |
| ONET-51-4121.00 | 13 | 3.8 | 9 |  |  |  | Thợ Hàn; Nhân Viên Thợ Hàn; Thợ Hàn Cắt Inox |
| ONET-51-3011.00 | 13 | 3.8 | 12 |  |  |  | Nhân Viên Bếp Bánh Mì Ngọt; Nhân Viên Bếp Bánh (Bánh Mì); Quản Lý Quầy Bánh Mì |
| ONET-17-2072.00 | 12 | 3.5 | 6 |  |  |  | Kỹ Sư Điện Tự Động Hóa; Kỹ Sư Điện Tử Viễn Thông; Electronic Engineer - Kỹ Sư Điện Tử - Thu Nhập 500-1000 USD (Bắc Ninh) |
| ONET-19-1029.04 | 12 | 3.5 | 6 |  |  |  | Kỹ Sư Công Nghệ Sinh Học; Kỹ Sư Sinh Học; Kỹ Sư Sinh Học Ngành Thực Phẩm |
| ONET-25-2011.00 | 12 | 3.5 | 11 |  |  |  | Giáo Viên Mầm Non; Giáo Viên Mầm Non Đã Có Kinh Nghiệm Từ 1 Năm Trở Lên; Giáo Viên Mầm Non / Giáo Dục Đặc Biệt / Can Thiệp Sớm |
| ONET-31-9092.00 | 12 | 3.5 | 9 |  |  |  | Lễ Tân Phòng Khám; Trợ Lý Bác Sĩ; Trợ Lý Y Khoa |
| ONET-49-9052.00 | 12 | 3.5 | 11 |  |  |  | Nhân Viên Kỹ Thuật Viễn Thông; Kỹ Thuật Viễn Thông; Kỹ Thuật Viên Viễn Thông |
| ONET-17-2041.00 | 11 | 3.2 | 8 |  |  |  | Kỹ Sư Hóa Dầu; Kỹ Sư Hóa Học (PE3); Kỹ Sư Hóa Polymer |
| ONET-25-2031.00 | 11 | 3.2 | 6 |  |  |  | Giáo Viên Toán; Giáo Viên Toán Tiếng Anh; Giáo Viên Toán/Khoa Học Khối Quốc Tế Full Time |
| ONET-29-1031.00 | 11 | 3.2 | 9 |  |  |  | Chuyên Viên Dinh Dưỡng; Tư Vấn Tổng Đài Sản Phẩm Sữa Dinh Dưỡng; Chuyên Viên R&D (Mảng Dinh Dưỡng Thể Thao) |
| ONET-17-1022.00 | 10 | 2.9 | 6 |  |  |  | Kỹ Sư Trắc Địa Công Trình; Chuyên Viên Biên Tập Bản Đồ; Trắc Đạc/Kỹ Sư Trắc Địa |
| ONET-25-9031.00 | 9 | 2.6 | 7 |  |  |  | Chuyên Viên Phát Triển Chương Trình Và Học Liệu; Chuyên Viên Phát Triển Chương Trình; Chuyên Viên R&D Học Liệu Fulltime |
| ONET-29-1041.00 | 9 | 2.6 | 6 |  |  |  | Kỹ Thuật Viên Khúc Xạ; Nhân Viên Tư Vấn Kính Mắt Hàn Quốc; Kỹ Thuật Viên Khúc Xạ Nhãn Khoa |
| ONET-39-7011.00 | 9 | 2.6 | 4 |  |  |  | Hướng Dẫn Viên Du Lịch; Tour Guide; Hướng Dẫn Viên Du Lịch Quốc Tế |
| ONET-39-9031.00 | 9 | 2.6 | 9 |  |  |  | Quản Lý Đội Huấn Luyện Viên Phòng Gym; Giáo Viên Năng Khiếu (Aerobic + Yoga Kid); Huấn Luyện Viên Thể Hình (PT) |
| ONET-13-1031.00 | 8 | 2.4 | 5 |  |  |  | Admin Giải Quyết Bồi Thường Bảo Hiểm; Nhân Viên Giám Định Container; Nhân Viên Giám Định |
| ONET-41-3021.00 | 8 | 2.4 | 5 |  |  |  | Chuyên Viên Tư Vấn Bảo Hiểm; Chuyên Viên Kinh Doanh / Tư Vấn Bảo Hiểm; Chuyên Viên Tư Vấn Bảo Hiểm- Dự Án Hợp Tác Ngân Hàng ACB |
| ONET-51-7011.00 | 8 | 2.4 | 8 |  |  |  | Kỹ Sư Tư Vấn Hỗ Trợ Phần Mềm Sản Xuất Đồ Gỗ; Kỹ Thuật Sản Xuất Nội Thất Và Ra File Cnc; Triển Khai Sản Xuất Nội Thất |
| ONET-29-1131.00 | 7 | 2.1 | 5 |  |  |  | Bác Sĩ Thú Y; Kỹ Sư Chăn Nuôi Thú Y; Trợ Lý Bác Sĩ Thú Y |
| ONET-17-2151.00 | 6 | 1.8 | 3 |  |  |  | Kỹ Sư Mỏ (Có Kinh Nghiệm Về Mỏ Đá); (JP 156) Kỹ Sư Mô Hình Hóa 3D, Tạo Dữ Liệu 2D, Mô Hình 3D PMI, Sản Phẩm Biến Tần; Kỹ Sư Mô Hình Hóa 3D, Tạo Dữ Liệu 2D, Mô Hình 3D PMI, Sản Phẩm Biến Tần (Member) |
| ONET-29-1123.00 | 6 | 1.8 | 6 |  |  |  | Kỹ Thuật Viên Phục Hồi Chức Năng; Kỹ Thuật Viên Vật Lý Trị Liệu Phục Hồi Chức Năng; Bác Sỹ Y Học Cổ Truyền - Phục Hồi Chức Năng |
| ONET-29-1291.00 | 6 | 1.8 | 6 |  |  |  | Chuyên Viên Content Y Học Cổ Truyền; Lễ Tân Phòng Khám Đông Y - Đi Làm Ngay; Bác Sỹ Y Học Cổ Truyền - Phục Hồi Chức Năng |
| ONET-37-3011.00 | 6 | 1.8 | 4 |  |  |  | Tổ Trưởng Cây Xanh; Nhân Viên Cảnh Quan Dự Án; Nhân Viên Làm Vườn Cảnh Quan (Nam) |
| ONET-51-9081.00 | 6 | 1.8 | 4 |  |  |  | Kỹ Thuật Viên Nha Khoa; Bác Sĩ Chấn Thương Chỉnh Hình |
| ONET-39-2021.00 | 5 | 1.5 | 4 |  |  |  | Thợ Grooming Tay Nghề Cao; Chuyên Viên Chăm Sóc Mèo - Cat Care Specialist; Chuyên Viên Thú Cưng (Toàn Thời Gian) |
| ONET-51-9141.00 | 5 | 1.5 | 3 |  |  |  | Kỹ Sư Thiết Kế Vi Mạch FPGA; Giảng Viên Lĩnh Vực Thiết Kế Vi Mạch Bán Dẫn; Kỹ Sư Thiết Kế FPGA (Thiết Kế Chip & RTL Logic) |
| ONET-11-9013.00 | 4 | 1.2 | 3 |  |  |  | Quản Lý Trang Trại; Trưởng Trại Chăn Nuôi Heo; Quản Lý Trang Trại (Không Yêu Cầu Kinh Nghiệm) |
| ONET-25-2051.00 | 4 | 1.2 | 3 |  |  |  | Giáo Viên Mầm Non / Giáo Dục Đặc Biệt / Can Thiệp Sớm; Giáo Viên Can Thiệp Sớm; Giáo Viên Giáo Dục Đặc Biệt |
| ONET-27-2011.00 | 4 | 1.2 | 4 |  |  |  | Trợ Lý Diễn Viên - Mảng Quay Dựng & Quản Lý Kênh; Diễn Viên; Diễn Viên - Không Yêu Cầu Kinh Nghiệm |
| ONET-33-9092.00 | 4 | 1.2 | 2 |  |  |  | Nhân Viên Cứu Hộ Bể Bơi; Tổ Trưởng Cứu Hộ; Nhân Viên Cứu Hộ |
| ONET-41-3031.00 | 4 | 1.2 | 1 |  |  |  | Chuyên Viên Tư Vấn Đầu Tư Chứng Khoán; Chuyên Viên Chứng Khoán Và Đầu Tư; Chuyên Viên Dịch Vụ Giao Dịch Chứng Khoán |
| ONET-47-2141.00 | 4 | 1.2 | 2 |  |  |  | Thợ Sơn Bả Kim Loại; Thợ Sơn Xe Ô Tô; Thợ Sơn Xe Ô Tô (Đánh Bóng) |
| ONET-49-3052.00 | 4 | 1.2 | 4 |  |  |  | Nhân Viên Kỹ Thuật Sửa Xe Máy Điện; Kỹ Thuật Viên Xe Máy Điện; Kỹ Thuật Viên Sửa Chữa Xe Máy - Phân Khối Lớn BMW |
| ONET-19-1031.00 | 3 | 0.9 | 1 |  |  |  | Nhân Viên Kỹ Thuật Lâm Nghiệp; Kỹ Sư Trồng Trọt Cây Cao Su Và Cây Lâm Nghiệp; Kỹ Sư Lâm Nghiệp |
| ONET-25-2021.00 | 3 | 0.9 | 1 |  |  |  | Giáo Viên Tiểu Học |
| ONET-29-1161.00 | 3 | 0.9 | 1 |  |  |  | Hộ Sinh; Nữ Hộ Sinh |
| ONET-29-2072.00 | 3 | 0.9 | 1 |  |  |  | Nhân Viên Kho Hồ Sơ Bệnh Án; Nhân Viên Thư Ký Y Khoa; Thư Ký Y Khoa |
| ONET-31-1131.00 | 3 | 0.9 | 3 |  |  |  | Điều Dưỡng Viên Chăm Sóc; Điều Dưỡng Viên Hỗ Trợ Khai Trương; Điều Dưỡng Viên Chăm Sóc Tại Nhà |
| ONET-47-2152.00 | 3 | 0.9 | 2 |  |  |  | Nhân Viên Triển Khai Bản Vẽ MEP Cấp Thoát Nước; Chuyên Viên M&E (Cấp Thóat Nước, Điện) |
| ONET-49-9051.00 | 3 | 0.9 | 3 |  |  |  | Nhân Viên Vận Hành Trạm Biến Áp 110kV; Kỹ Sư Hiện Trường Dự Án Cáp Ngầm, Đường Dây; Nhân Viên Vận Hành Lưới Điện 22kV |
| ONET-53-3052.00 | 3 | 0.9 | 3 |  |  |  | Lái Xe Du Lịch 16 Chỗ - Đi Làm Ngay |
| ONET-19-3041.00 | 2 | 0.6 | 0 |  |  |  | Nghiên Cứu Viên |
| ONET-31-1121.00 | 2 | 0.6 | 2 |  |  |  | Điều Dưỡng Chăm Sóc Tại Nhà; Điều Dưỡng Viên Chăm Sóc Tại Nhà |
| ONET-39-5092.00 | 2 | 0.6 | 2 |  |  |  | Nhân Viên Làm Nail (Khu Vực Khách VIP) - Đi Làm Ngay |
| ONET-47-5041.00 | 2 | 0.6 | 1 |  |  |  | Kỹ Sư Khai Thác Mỏ; Chuyên Viên Kỹ Thuật/Sửa Chữa Xe Khai Thác Mỏ |
| ONET-49-3042.00 | 2 | 0.6 | 1 |  |  |  | Kỹ Thuật Viên Sửa Chữa Máy Công Trình; Kỹ Sư Bảo Trì Sửa Chữa Xe Cơ Giới |
| ONET-51-8013.00 | 2 | 0.6 | 1 |  |  |  | Nhân Viên Vận Hành Nhà Máy Điện Gió; Nhân Viên Vận Hành Lò Hơi |
| ONET-11-9111.00 | 1 | 0.3 | 1 |  |  |  | Quản Lý Phòng Khám |
| ONET-15-2011.00 | 1 | 0.3 | 0 |  |  |  | Chuyên Viên Định Phí Bảo Hiểm |
| ONET-17-2141.02 | 1 | 0.3 | 1 |  |  |  | Kỹ Sư Ô Tô |
| ONET-19-1041.00 | 1 | 0.3 | 0 |  |  |  | Điều phối viên nghiên cứu lâm sàng |
| ONET-19-3011.00 | 1 | 0.3 | 1 |  |  |  | Chuyên Viên Cao Cấp Phân Tích Vĩ Mô |
| ONET-19-3033.00 | 1 | 0.3 | 1 |  |  |  | Giáo Viên Hỗ Trợ Trẻ Đặc Biệt - Tâm Lý Học - Công Tác Xã Hội - Trường Mầm Non |
| ONET-21-1021.00 | 1 | 0.3 | 1 |  |  |  | Giáo Viên Hỗ Trợ Trẻ Đặc Biệt - Tâm Lý Học - Công Tác Xã Hội - Trường Mầm Non |
| ONET-27-2042.00 | 1 | 0.3 | 1 |  |  |  | Giáo Viên Piano (Full-Time) |
| ONET-27-2031.00 | 1 | 0.3 | 1 |  |  |  | Idol Dance Tiktok (Giải Trí Livestream) |
| ONET-27-2021.00 | 1 | 0.3 | 1 |  |  |  | Huấn Luyện Viên Bơi (Bể Bơi Aqua-Tots) |
| ONET-37-2021.00 | 1 | 0.3 | 1 |  |  |  | Kỹ Thuật Viên Kiểm Soát Côn Trùng |
| ONET-39-5012.00 | 1 | 0.3 | 1 |  |  |  | Chuyên Viên Đào Tạo Gội Đầu |
| ONET-39-5091.00 | 1 | 0.3 | 1 |  |  |  | Make Up |
| ONET-39-9011.00 | 1 | 0.3 | 0 |  |  |  | Nhân Viên Bảo Mẫu |
| ONET-41-9012.00 | 1 | 0.3 | 0 |  |  |  | Mẫu Livestream (Ngành Hàng Cao Cấp) |
| ONET-43-5051.00 | 1 | 0.3 | 1 |  |  |  | Bưu Tá Giao Nhận Xe Máy |
| ONET-45-2092.00 | 1 | 0.3 | 0 |  |  |  | Chuyên Viên Vận Hành Sau Thu Hoạch |
| ONET-47-2073.00 | 1 | 0.3 | 1 |  |  |  | Lái Xe Xúc Lật |
| ONET-51-3092.00 | 1 | 0.3 | 1 |  |  |  | Nhân Viên Nhà Máy Chế Biến Thực Phẩm |
| ONET-51-8091.00 | 1 | 0.3 | 1 |  |  |  | Nhân Viên Kỹ Thuật Mảng Hoá Chất |
| ONET-53-4011.00 | 1 | 0.3 | 1 |  |  |  | Nhân Viên Phục Vụ Tàu Đường Sắt(Cần Tiếng Anh) |
| ONET-53-5021.00 | 1 | 0.3 | 1 |  |  |  | Giám Định Viên Hàng Hải |
| ONET-53-7081.00 | 1 | 0.3 | 0 |  |  |  | Nhân Viên Vận Hành Dây Chuyền Phân Loại Chất Thải |
| ONET-53-6051.00 | 1 | 0.3 | 0 |  |  |  | Nhân Viên Hồ Sơ Đăng Kiểm Chứng Nhận |
| ONET-13-2099.01 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-19-2042.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-21-1014.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-39-4031.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-45-3031.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-45-4011.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-47-2021.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-47-2031.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-49-3011.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-53-2011.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-53-2021.00 | 0 | 0.0 | 0 |  |  |  |  |
| ONET-53-2031.00 | 0 | 0.0 | 0 |  |  |  |  |
