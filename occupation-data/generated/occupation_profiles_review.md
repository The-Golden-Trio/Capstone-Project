# Duyệt hồ sơ nghề chuẩn: lý do từng quyết định

> Sinh bởi `occupation-data/scripts/build_occupation_profiles.py`. Đừng sửa tay; muốn đổi quyết định thì sửa file gốc ghi trong từng dòng rồi chạy lại.
> Cách duyệt: đọc từng nghề, đánh dấu `[x]` khi đồng ý; chỗ không đồng ý ghi ngay dưới dòng đó.

## Logic chung

**Lương nghề ngoài IT**, lấy nguồn đầu tiên có trong thứ tự:
1. Lương rao VietJobs khi nghề có từ 20 tin có lương (P25, trung vị, P75 của trung điểm khoảng lương).
2. Thang lương nhà nước (hệ số × lương cơ sở 2.530.000 đ) cho nghề chủ yếu ở khu vực nhà nước. theo `datasets/vn/public_pay.json`.
3. Lương tham khảo đã duyệt trong `datasets/vn/salary_reference.json`: chỉ nhận số đã mở trang đọc được, từ năm 2022; chất lượng tốt (khảo sát có mẫu, thang nhà nước, thống kê đúng nghề), vừa (bài hướng nghiệp, từ 3 tin), yếu (số mô hình WageIndicator, 1–2 tin, số đại diện cho ngành rộng hơn).
4. Trung bình nhóm nghề cấp 1 của Cục Thống kê 2024 theo mã nghề Việt Nam.

**Lương nghề IT:** báo cáo ITviec 2025–2026: trung vị theo vị trí và số năm kinh nghiệm khi bảng có dòng cho nghề; nếu không, số ở mục khác của báo cáo. Không dùng lương theo cấp của toàn ngành.

**Nhu cầu tuyển:** IT đếm tin trên ITviec cùng ngày, chia ba mức theo tam phân vị trong 22 nghề IT. Ngoài IT là số tin trên 10.000 tin VietJobs, bỏ khi dưới 5 tin, chia ba mức theo tam phân vị.

**Mã nghề Việt Nam:** nối O\*NET → ESCO → ISCO-08 → mã Việt Nam cùng số; 61 dòng sửa tay có lý do; bỏ dòng độ tin cậy thấp (decisions/onet_to_vsco.csv).

**Việc hằng ngày:** IT ưu tiên task theo cấp từ JD đã xác minh (78_roles_unmerged.json), rồi task tóm từ JD mới (it_jd_tasks.json), rồi task O\*NET dịch nháp. Ngoài IT là 5 task Core đầu của mã O\*NET chính, dịch nháp.

**Nơi làm việc:** luật trong `datasets/work_settings.json`, theo thứ tự, tối đa hai nơi; luật dự phòng chỉ áp khi chưa khớp luật nào.

**Đã bỏ trên toàn bộ:**
- Mã nghề Việt Nam độ tin cậy thấp: PROD_PM, ONET-11-9032.00, ONET-11-9111.00, ONET-13-1041.00
- Phần O*NET (câu môi trường, hợp với ai, kỹ năng, kiến thức) của nghề IT có cùng bộ mã O*NET với nghề khác: SWE_MOBILE (giống SWE_BACKEND)
- Bước 'Vị trí gần, dễ vào hơn' của lộ trình: 80 nghề
- Lương rao VietJobs của nghề có dưới 20 tin có lương.
- Nhu cầu tuyển của nghề có dưới 5 tin trong VietJobs (bộ dữ liệu không phủ ngành đó, không phải ít tuyển): 57 nghề

## Công nghệ thông tin (22 nghề)

### Lập trình viên Front-end (`SWE_FRONTEND`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1254.00. Gán theo `ROLES` trong build_onet_profiles.py: Web Developers.
- **Mã nghề Việt Nam:** 2513 Nhà phát triển web và truyền thông đa phương tiện — giữ đề xuất tự động; mã ISCO 2513 chiếm 33% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Front-end Developer" của bảng vị trí × năm kinh nghiệm: giữa 34,8tr, 3 mốc năm có số.
- **Nhu cầu tuyển:** 15 tin trên ITviec, từ khoá `frontend-developer`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Công nghệ thông tin, Khoa học máy tính; cao đẳng, trung cấp: Lập trình máy tính, Thiết kế trang web.
- **Phần nháp cần đọc kỹ:** overview.

### Lập trình viên Back-end / Kỹ sư Back-end (`SWE_BACKEND`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1252.00. Gán theo `ROLES` trong build_onet_profiles.py: Software Developers.
- **Mã nghề Việt Nam:** 2512 Nhà phát triển phần mềm — giữ đề xuất tự động; mã ISCO 2512 chiếm 38% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Back-end Developer" của bảng vị trí × năm kinh nghiệm: giữa 37,8tr, 5 mốc năm có số.
  - Thêm thang viên chức để so: 4,7tr–17,2tr.
- **Nhu cầu tuyển:** 91 tin trên ITviec, từ khoá `backend-developer`, ngày 2026-10-21; mức cao so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Công nghệ thông tin, Khoa học máy tính; cao đẳng, trung cấp: Lập trình máy tính.
- **Phần nháp cần đọc kỹ:** overview.

### Lập trình viên Mobile / Kỹ sư ứng dụng di động (`SWE_MOBILE`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1252.00. Gán theo `ROLES` trong build_onet_profiles.py: O*NET không có mã riêng cho mobile; dùng chung hồ sơ với Back-end nên hai nghề không được so với nhau.
  - Cùng bộ mã với `SWE_BACKEND` nên bỏ câu môi trường, câu "hợp với ai", kỹ năng, kiến thức O\*NET (chép nguyên).
  - Mã chính trùng với `SWE_BACKEND` nên không dùng task O\*NET; task lấy từ JD nếu có.
- **Mã nghề Việt Nam:** 2512 Nhà phát triển phần mềm — giữ đề xuất tự động; mã ISCO 2512 chiếm 38% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Mobile Developer" của bảng vị trí × năm kinh nghiệm: giữa 36,9tr, 5 mốc năm có số.
- **Nhu cầu tuyển:** 13 tin trên ITviec, từ khoá `mobile-application-developer`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Công nghệ thông tin, Khoa học máy tính; cao đẳng, trung cấp: Lập trình máy tính.
- **Phần nháp cần đọc kỹ:** overview.

### Lập trình viên Game (`SWE_GAME`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1252.00, 15-1255.01. Gán theo `ROLES` trong build_onet_profiles.py: Ghép Software Developers và Video Game Designers.
  - Mã chính trùng với `SWE_BACKEND` nên không dùng task O\*NET; task lấy từ JD nếu có.
- **Mã nghề Việt Nam:** 2512 Nhà phát triển phần mềm — giữ đề xuất tự động; mã ISCO 2512 chiếm 38% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Game Developer" của bảng vị trí × năm kinh nghiệm: giữa 33,4tr, 3 mốc năm có số.
- **Nhu cầu tuyển:** 7 tin trên ITviec, từ khoá `game-developer`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** 16 JD ở Việt Nam (datasets/vn/it_jd_tasks.json) (nháp).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Khoa học máy tính, Nghệ thuật số; cao đẳng, trung cấp: Lập trình máy tính, Thiết kế mỹ thuật game.
- **Phần nháp cần đọc kỹ:** overview, daily_work.

### Chuyên viên thiết kế UI/UX (`SWE_UIUX`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1255.00. Gán theo `ROLES` trong build_onet_profiles.py: Web and Digital Interface Designers.
- **Mã nghề Việt Nam:** 2166 Nhà thiết kế đồ họa và truyền thông đa phương tiện — giữ đề xuất tự động; mã ISCO 2166 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026 không có số cho nghề này.
- **Nhu cầu tuyển:** 12 tin trên ITviec, từ khoá `ui-ux-designer`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thiết kế đồ họa, Nghệ thuật số, Công nghệ thông tin; cao đẳng, trung cấp: Thiết kế tương tác, Thiết kế đồ họa.
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư phần mềm nhúng / Kỹ sư IoT (`SWE_EMBEDDED`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1252.00, 17-2061.00. Gán theo `ROLES` trong build_onet_profiles.py: Ghép Software Developers và Computer Hardware Engineers.
  - Mã chính trùng với `SWE_BACKEND` nên không dùng task O\*NET; task lấy từ JD nếu có.
- **Mã nghề Việt Nam:** 2512 Nhà phát triển phần mềm — giữ đề xuất tự động; mã ISCO 2512 chiếm 38% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Embedded Engineer" của bảng vị trí × năm kinh nghiệm: giữa 34,4tr, 5 mốc năm có số.
- **Nhu cầu tuyển:** 17 tin trên ITviec, từ khoá `embedded-engineer`, ngày 2026-10-21; mức vừa so với 22 nghề IT.
- **Việc hằng ngày:** 13 JD ở Việt Nam (datasets/vn/it_jd_tasks.json) (nháp).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật máy tính, Kỹ thuật điện tử - viễn thông, Kỹ thuật điều khiển và tự động hóa; cao đẳng, trung cấp: Công nghệ kỹ thuật máy tính, Điện tử công nghiệp.
- **Phần nháp cần đọc kỹ:** overview, daily_work.

### Kiến trúc sư giải pháp (`SWE_ARCH_SOL`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1299.08. Gán theo `ROLES` trong build_onet_profiles.py: Computer Systems Engineers/Architects.
- **Mã nghề Việt Nam:** 2511 Nhà phân tích hệ thống — giữ đề xuất tự động; mã ISCO 2511 chiếm 46% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, bảng vị trí không có dòng cho nghề này; dùng số ở mục khác: trung bình 56,3tr (Trên 5 năm kinh nghiệm. Top 5 vị trí khó tuyển dụng).
- **Nhu cầu tuyển:** 15 tin trên ITviec, từ khoá `solution-architect`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Khoa học máy tính, Hệ thống thông tin.
- **Phần nháp cần đọc kỹ:** overview.

### Trưởng nhóm kỹ thuật (`SWE_TECHLEAD`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1252.00, 11-3021.00. Gán theo `ROLES` trong build_onet_profiles.py: Không có mã riêng; ghép Software Developers và Computer and Information Systems Managers.
  - Mã chính trùng với `SWE_BACKEND` nên không dùng task O\*NET; task lấy từ JD nếu có.
- **Mã nghề Việt Nam:** 2512 Nhà phát triển phần mềm — giữ đề xuất tự động; mã ISCO 2512 chiếm 38% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Tech Lead" của bảng vị trí × năm kinh nghiệm: giữa 51,8tr, 3 mốc năm có số.
- **Nhu cầu tuyển:** 32 tin trên ITviec, từ khoá `technical-leader`, ngày 2026-10-21; mức vừa so với 22 nghề IT.
- **Việc hằng ngày:** 12 JD ở Việt Nam (datasets/vn/it_jd_tasks.json) (nháp).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Khoa học máy tính, Công nghệ thông tin.
- **Phần nháp cần đọc kỹ:** overview, daily_work.

### Trưởng phòng Kỹ thuật (`SWE_EM`)

- [ ] Đã duyệt
- **Mã O\*NET:** 11-3021.00. Gán theo `ROLES` trong build_onet_profiles.py: Computer and Information Systems Managers.
- **Mã nghề Việt Nam:** 1736 Dịch vụ và tính toán — sửa tay: ISCO 1330 (quản lý dịch vụ CNTT) trùng số với mã 1330 Chánh án của Việt Nam; 1736 'Dịch vụ và tính toán' là quản lý bộ phận tin học; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "IT Manager" của bảng vị trí × năm kinh nghiệm: giữa 50,2tr, 2 mốc năm có số.
- **Nhu cầu tuyển:** 56 tin trên ITviec, từ khoá `engineering-manager`, ngày 2026-10-21; mức cao so với 22 nghề IT.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Công nghệ thông tin, Hệ thống thông tin quản lý.
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư kiểm thử thủ công / Tester (`QA_MANUAL`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1253.00. Gán theo `ROLES` trong build_onet_profiles.py: Software Quality Assurance Analysts and Testers.
- **Mã nghề Việt Nam:** 2519 Nhà chuyên môn về phát triển phần mềm ứng dụng và nhà phân tích chưa được phân vào đâu — giữ đề xuất tự động; mã ISCO 2519 chiếm 82% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, dòng "QA - QC" của bảng vị trí × năm kinh nghiệm: giữa 31,2tr, 4 mốc năm có số.
- **Nhu cầu tuyển:** 45 tin trên ITviec, từ khoá `manual-tester`, ngày 2026-10-21; mức cao so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Công nghệ thông tin, Hệ thống thông tin; cao đẳng, trung cấp: Lập trình máy tính, Tin học ứng dụng.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên phân tích dữ liệu (`DATA_DA`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-2051.01. Gán theo `ROLES` trong build_onet_profiles.py: Business Intelligence Analysts.
- **Mã nghề Việt Nam:** 2421 Nhà phân tích tổ chức và quản lý — giữ đề xuất tự động; mã ISCO 2421 chiếm 60% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Data Analyst/Data Scientist/Business Intelligence Analyst" của bảng vị trí × năm kinh nghiệm: giữa 40,6tr, 2 mốc năm có số.
- **Nhu cầu tuyển:** 11 tin trên ITviec, từ khoá `data-analyst`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Khoa học dữ liệu, Hệ thống thông tin quản lý, Thống kê; cao đẳng, trung cấp: Xử lý dữ liệu, Hệ thống thông tin kinh tế.
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư trí tuệ nhân tạo (`DATA_AI`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-2051.00. Gán theo `ROLES` trong build_onet_profiles.py: Data Scientists.
- **Mã nghề Việt Nam:** 2511 Nhà phân tích hệ thống — giữ đề xuất tự động; mã ISCO 2511 chiếm 71% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, bảng vị trí không có dòng cho nghề này; dùng số ở mục khác: trung bình 50,6tr (Trung bình tại công ty AI/Deep Tech. Vị trí khó tuyển nhất hiện nay).
- **Nhu cầu tuyển:** 140 tin trên ITviec, từ khoá `ai-machine-learning-engineer`, ngày 2026-10-21; mức cao so với 22 nghề IT.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Trí tuệ nhân tạo, Khoa học dữ liệu, Khoa học máy tính; cao đẳng, trung cấp: Công nghệ ứng dụng trí tuệ nhân tạo.
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư dữ liệu (`DATA_DE`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1243.01, 15-1243.00. Gán theo `ROLES` trong build_onet_profiles.py: Ghép Data Warehousing Specialists và Database Architects.
- **Mã nghề Việt Nam:** 2521 Nhà quản trị và thiết kế cơ sở dữ liệu — giữ đề xuất tự động; mã ISCO 2521 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Data Engineer" của bảng vị trí × năm kinh nghiệm: giữa 41,3tr, 1 mốc năm có số.
- **Nhu cầu tuyển:** 24 tin trên ITviec, từ khoá `data-engineer`, ngày 2026-10-21; mức vừa so với 22 nghề IT.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Khoa học dữ liệu, Hệ thống thông tin, Khoa học máy tính; cao đẳng, trung cấp: Quản trị cơ sở dữ liệu.
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư DevOps (`CLOUD_DEVOPS`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1244.00, 15-1252.00. Gán theo `ROLES` trong build_onet_profiles.py: Không có mã riêng; ghép Network and Computer Systems Administrators và Software Developers.
- **Mã nghề Việt Nam:** 2522 Nhà quản trị hệ thống — giữ đề xuất tự động; mã ISCO 2522 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026 không có số cho nghề này.
- **Nhu cầu tuyển:** 69 tin trên ITviec, từ khoá `devops-engineer`, ngày 2026-10-21; mức cao so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phần mềm, Mạng máy tính và truyền thông dữ liệu, Công nghệ thông tin; cao đẳng, trung cấp: Quản trị hệ thống.
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư điện toán đám mây (`CLOUD_ENG`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1299.08, 15-1244.00. Gán theo `ROLES` trong build_onet_profiles.py: Không có mã riêng; ghép Computer Systems Engineers/Architects và Network and Computer Systems Administrators.
  - Mã chính trùng với `SWE_ARCH_SOL` nên không dùng task O\*NET; task lấy từ JD nếu có.
- **Mã nghề Việt Nam:** 2511 Nhà phân tích hệ thống — giữ đề xuất tự động; mã ISCO 2511 chiếm 46% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026 không có số cho nghề này.
- **Nhu cầu tuyển:** 82 tin trên ITviec, từ khoá `cloud-engineer`, ngày 2026-10-21; mức cao so với 22 nghề IT.
- **Việc hằng ngày:** 11 JD ở Việt Nam (datasets/vn/it_jd_tasks.json) (nháp).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Mạng máy tính và truyền thông dữ liệu, Công nghệ thông tin, Kỹ thuật máy tính; cao đẳng, trung cấp: Quản trị hệ thống, Quản trị mạng máy tính.
- **Phần nháp cần đọc kỹ:** overview, daily_work.

### Kỹ sư an ninh mạng / Kỹ sư bảo mật (`SEC_ENG`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1299.05. Gán theo `ROLES` trong build_onet_profiles.py: Information Security Engineers.
- **Mã nghề Việt Nam:** 2529 Nhà chuyên môn về cơ sở dữ liệu và mạng chưa được phân vào đâu — giữ đề xuất tự động; mã ISCO 2529 chiếm 89% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, bảng vị trí không có dòng cho nghề này; dùng số ở mục khác: trung bình 44,1tr (Trung bình tại công ty ngành An ninh mạng. Security Engineer trong Top 15 vị trí nhu cầu lớn 2026).
- **Nhu cầu tuyển:** 45 tin trên ITviec, từ khoá `security-engineer`, ngày 2026-10-21; mức cao so với 22 nghề IT.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: An ninh mạng, Công nghệ thông tin, Mạng máy tính và truyền thông dữ liệu; cao đẳng, trung cấp: An ninh mạng.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên kiểm thử xâm nhập / Hacker mũ trắng (`SEC_PENTEST`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1299.04. Gán theo `ROLES` trong build_onet_profiles.py: Penetration Testers.
- **Mã nghề Việt Nam:** 2529 Nhà chuyên môn về cơ sở dữ liệu và mạng chưa được phân vào đâu — giữ đề xuất tự động; mã ISCO 2529 chiếm 89% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, bảng vị trí không có dòng cho nghề này; dùng số ở mục khác: trung bình 44,1tr (Dùng chung số của nhóm An ninh mạng — chưa có số riêng cho Pentest).
- **Nhu cầu tuyển:** 43 tin trên ITviec, từ khoá `penetration-tester`, ngày 2026-10-21; mức vừa so với 22 nghề IT. Gần bằng security-engineer (45): từ khoá khớp rộng sang tin bảo mật nói chung.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: An ninh mạng, Kỹ thuật mật mã, Công nghệ thông tin; cao đẳng, trung cấp: An ninh mạng.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên phân tích nghiệp vụ / BA (`PROD_BA`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1211.00. Gán theo `ROLES` trong build_onet_profiles.py: Computer Systems Analysts.
- **Mã nghề Việt Nam:** 2511 Nhà phân tích hệ thống — giữ đề xuất tự động; mã ISCO 2511 chiếm 54% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Business Analyst" của bảng vị trí × năm kinh nghiệm: giữa 30,0tr, 5 mốc năm có số.
- **Nhu cầu tuyển:** 36 tin trên ITviec, từ khoá `business-analyst`, ngày 2026-10-21; mức vừa so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Hệ thống thông tin quản lý, Hệ thống thông tin, Quản trị kinh doanh; cao đẳng, trung cấp: Hệ thống thông tin quản lý.
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý sản phẩm / Product Manager (`PROD_PM`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1299.09. Gán theo `ROLES` trong build_onet_profiles.py: Chỉ IT Project Managers; không ghép Marketing Managers vì kéo hồ sơ về phía marketing.
- **Mã nghề Việt Nam:** 2511 Nhà phân tích hệ thống — sửa tay: Danh mục không có product manager; ISCO 1330 trùng số với Chánh án. Lấy mã gần nhất trong nhóm CNTT; **bỏ khỏi hồ sơ** vì độ tin cậy thấp.
- **Lương:** báo cáo ITviec 2025–2026, dòng "Product Owner/Product Manager" của bảng vị trí × năm kinh nghiệm: giữa 50,1tr, 4 mốc năm có số.
- **Nhu cầu tuyển:** 8 tin trên ITviec, từ khoá `product-manager`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp (datasets/onet_vi/it.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị kinh doanh, Hệ thống thông tin quản lý, Công nghệ thông tin.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên tư vấn giải pháp ERP (`INFRA_ERP`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1211.00, 13-1111.00. Gán theo `ROLES` trong build_onet_profiles.py: Ghép Computer Systems Analysts và Management Analysts.
  - Mã chính trùng với `PROD_BA` nên không dùng task O\*NET; task lấy từ JD nếu có.
- **Mã nghề Việt Nam:** 2511 Nhà phân tích hệ thống — giữ đề xuất tự động; mã ISCO 2511 chiếm 54% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** báo cáo ITviec 2025–2026, dòng "ERP Engineer/ERP Consultant" của bảng vị trí × năm kinh nghiệm: giữa 30,2tr, 4 mốc năm có số.
- **Nhu cầu tuyển:** 24 tin trên ITviec, từ khoá `erp`, ngày 2026-10-21; mức vừa so với 22 nghề IT.
- **Việc hằng ngày:** 15 JD ở Việt Nam (datasets/vn/it_jd_tasks.json) (nháp).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Hệ thống thông tin quản lý, Kế toán, Công nghệ thông tin; cao đẳng, trung cấp: Hệ thống thông tin quản lý, Kế toán tin học.
- **Phần nháp cần đọc kỹ:** overview, daily_work.

### Nhân viên hỗ trợ kỹ thuật / IT Support (`INFRA_HELPDESK`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1232.00. Gán theo `ROLES` trong build_onet_profiles.py: Computer User Support Specialists.
- **Mã nghề Việt Nam:** 3512 Kỹ thuật viên hỗ trợ người sử dụng công nghệ thông tin và truyền thông — giữ đề xuất tự động; mã ISCO 3512 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026, dòng "IT Support/Helpdesk" của bảng vị trí × năm kinh nghiệm: giữa 20,0tr, 3 mốc năm có số.
- **Nhu cầu tuyển:** 19 tin trên ITviec, từ khoá `it-support`, ngày 2026-10-21; mức vừa so với 22 nghề IT.
- **Việc hằng ngày:** JD đã xác minh (datasets/78_roles_unmerged.json).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Công nghệ thông tin, Mạng máy tính và truyền thông dữ liệu; cao đẳng, trung cấp: Kỹ thuật sửa chữa, lắp ráp máy tính, Quản trị mạng máy tính, Tin học ứng dụng.
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư hệ thống mạng (`INFRA_NETWORK`)

- [ ] Đã duyệt
- **Mã O\*NET:** 15-1244.00, 15-1241.00. Gán theo `ROLES` trong build_onet_profiles.py: Ghép Network and Computer Systems Administrators và Computer Network Architects.
  - Mã chính trùng với `CLOUD_DEVOPS` nên không dùng task O\*NET; task lấy từ JD nếu có.
- **Mã nghề Việt Nam:** 2522 Nhà quản trị hệ thống — giữ đề xuất tự động; mã ISCO 2522 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** báo cáo ITviec 2025–2026 không có số cho nghề này.
- **Nhu cầu tuyển:** 14 tin trên ITviec, từ khoá `network-engineer`, ngày 2026-10-21; mức thấp so với 22 nghề IT.
- **Việc hằng ngày:** 12 JD ở Việt Nam (datasets/vn/it_jd_tasks.json) (nháp).
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Mạng máy tính và truyền thông dữ liệu, Công nghệ thông tin, Kỹ thuật điện tử - viễn thông; cao đẳng, trung cấp: Quản trị mạng máy tính, Quản trị hệ thống.
- **Phần nháp cần đọc kỹ:** overview, daily_work.

## Quản lý (11 nghề)

### Giám đốc điều hành, quản lý vận hành (`ONET-11-1021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 11-1021.00, không gộp.
- **Mã nghề Việt Nam:** 1710 Chủ tịch, Phó Chủ tịch Hội đồng quản trị, Tổng giám đốc doanh nghiệp, Phó Tổng giám đốc doanh nghiệp, Chủ tịch, Phó Chủ tịch Hội đồng trường, Hiệu trưởng, Phó Hiệu trưởng trường đại học lớn và tương đương (chuyên trách) — sửa tay: ISCO 1120 (giám đốc điều hành) không có ở Việt Nam; 1710 là chủ tịch, tổng giám đốc doanh nghiệp; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (50 tin có lương): 14,5tr–43,1tr, giữa 20,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 110 tin trong VietJobs (32.4/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (nhóm 11, 13, 15, 17, 19, 21, 23, 25, 27, 41, 43; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị kinh doanh, Khoa học quản lý, Kinh tế học; ghi chú: Thường đi lên từ một nghề chuyên môn sau nhiều năm; nhiều người học thêm thạc sĩ quản trị kinh doanh.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý sản xuất (`ONET-11-3051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 11-3051.00 và 1 mã gộp vào (Quản lý hệ thống chất lượng). Lý do gộp: Quản lý hệ thống chất lượng là một mảng của quản lý nhà máy (decisions/onet_merge/11.json).
- **Mã nghề Việt Nam:** 1722 Khai khoáng, công nghiệp chế biến, chế tạo, sản xuất và phân phối điện, khí đốt, nước nóng, hơi nước và điều hòa không khí — sửa tay: ISCO 1321 trùng số với mã Chánh án của Việt Nam; 1722 là quản lý bộ phận sản xuất ngành chế biến, chế tạo; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (92 tin có lương): 16,1tr–27,5tr, giữa 21,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 142 tin trong VietJobs (41.8/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 43-5, 11-3051, 17-2112, 17-2199, 17-2141, 17-2071; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý công nghiệp, Kỹ thuật công nghiệp, Kỹ thuật cơ khí; cao đẳng, trung cấp: Quản lý công nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý hành chính (`ONET-11-3012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 11-3012.00 và 4 mã gộp vào (Quản lý cơ sở vật chất; Quản lý an ninh; Trưởng bưu cục; Quản lý chống thất thoát). Lý do gộp: Quản lý cơ sở vật chất, an ninh, bưu cục và chống thất thoát đều là quản lý vận hành hành chính của một tổ chức (decisions/onet_merge/11.json).
- **Mã nghề Việt Nam:** 1731 Tài chính, kế toán, quản trị hành chính — sửa tay: ISCO 1349 không có ở Việt Nam; 1731 là quản lý bộ phận tài chính, kế toán, quản trị hành chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (46 tin có lương): 18,4tr–28,5tr, giữa 22,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 70 tin trong VietJobs (20.6/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (nhóm 11, 13, 15, 17, 19, 21, 23, 25, 27, 41, 43; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị văn phòng, Quản trị nhân lực, Quản trị kinh doanh; cao đẳng, trung cấp: Hành chính văn phòng, Quản trị văn phòng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (2); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý xây dựng (chỉ huy trưởng công trình) (`ONET-11-9021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 11-9021.00, không gộp.
- **Mã nghề Việt Nam:** 1723 Xây dựng — sửa tay: ISCO 1323 không có ở Việt Nam; 1723 là quản lý bộ phận sản xuất ngành xây dựng; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (48 tin có lương): 21,5tr–27,5tr, giữa 22,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 71 tin trong VietJobs (20.9/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý xây dựng, Kỹ thuật xây dựng; cao đẳng, trung cấp: Quản lý xây dựng; giấy phép: Chứng chỉ hành nghề hoạt động xây dựng hạng I, II, III (thiết kế, giám sát, khảo sát).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý kỹ thuật và nghiên cứu (`ONET-11-9041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 11-9041.00 và 1 mã gộp vào (Quản lý nghiên cứu khoa học tự nhiên). Lý do gộp: Cùng trải nghiệm quản lý một đội kỹ sư hoặc nhà khoa học (decisions/onet_merge/11.json).
- **Mã nghề Việt Nam:** 1737 Nghiên cứu và phát triển — sửa tay: ISCO 1349 không có ở Việt Nam; 1737 là quản lý bộ phận nghiên cứu và phát triển; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (32 tin có lương): 22,5tr–30,0tr, giữa 27,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 53 tin trong VietJobs (15.6/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật cơ khí, Kỹ thuật điện, Quản lý khoa học và công nghệ; ghi chú: Thường là kỹ sư hoặc nhà khoa học lên quản lý.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý giáo dục (hiệu trưởng, trưởng khoa) (`ONET-11-9032.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 11-9032.00 và 2 mã gộp vào (Quản lý cơ sở giáo dục mầm non; Quản lý giáo dục đại học). Lý do gộp: Cùng trải nghiệm điều hành cơ sở giáo dục, khác cấp học (decisions/onet_merge/11.json).
- **Mã nghề Việt Nam:** 1729 Các đơn vị sản xuất và dịch vụ còn lại chưa được phân vào đâu — sửa tay: ISCO 1345 không có ở Việt Nam; danh mục không tách quản lý giáo dục, 1729 là quản lý bộ phận các ngành còn lại; **bỏ khỏi hồ sơ** vì độ tin cậy thấp.
- **Lương:** VietJobs: 15 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 15,0tr–25,0tr, trung bình 19,3tr — JobsGO, tra cứu lương "Hiệu Trưởng", 2026; loại job_ads, chất lượng **yếu**. Chủ yếu trường tư; hiệu trưởng trường công theo thang lương nhà nước. 11 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 15–25tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 29 tin trong VietJobs (8.5/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (nhóm 11, 13, 15, 17, 19, 21, 23, 25, 27, 41, 43; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý giáo dục, Giáo dục học; ghi chú: Thường là giáo viên, giảng viên có thâm niên được bổ nhiệm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý nhà hàng (`ONET-11-9051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 11-9051.00 và 1 mã gộp vào (Tổ trưởng chế biến và phục vụ ăn uống). Lý do gộp: Tổ trưởng phục vụ và chế biến là cấp ngay dưới quản lý nhà hàng (decisions/onet_merge/11.json).
- **Mã nghề Việt Nam:** 1725 Dịch vụ lưu trú và ăn uống — sửa tay: ISCO 1412 trùng số với mã Hội đồng nhân dân của Việt Nam; 1725 là quản lý bộ phận dịch vụ lưu trú và ăn uống; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (54 tin có lương): 12,0tr–17,5tr, giữa 14,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 80 tin trong VietJobs (23.6/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 33-9032, 37-2011, 43-4081, 39-9032, 41-9012, 11-9051, 11-9081; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị nhà hàng và dịch vụ ăn uống; cao đẳng, trung cấp: Quản trị nhà hàng và dịch vụ ăn uống, Quản lý và kinh doanh nhà hàng và dịch vụ ăn uống.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý khách sạn, khu nghỉ dưỡng (`ONET-11-9081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 11-9081.00 và 2 mã gộp vào (Quản lý spa; Quản lý khu vui chơi giải trí). Lý do gộp: Quản lý spa và khu vui chơi thường nằm trong khối khách sạn, khu nghỉ dưỡng (decisions/onet_merge/11.json).
- **Mã nghề Việt Nam:** 1725 Dịch vụ lưu trú và ăn uống — sửa tay: ISCO 1411 trùng số với mã Hội đồng nhân dân của Việt Nam; 1725 là quản lý bộ phận dịch vụ lưu trú và ăn uống; độ tin cậy cao.
- **Lương:** VietJobs: 15 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 18,0tr–100,0tr — CareerLink, "Mức lương ngành Khách sạn", 2026-03-18; loại career_guide, chất lượng **vừa**. Chênh lệch lớn theo hạng sao và chuỗi; năm số liệu: 2026.
- **Nhu cầu tuyển:** 20 tin trong VietJobs (5.9/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 33-9032, 37-2011, 43-4081, 39-9032, 41-9012, 11-9051, 11-9081; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị khách sạn, Du lịch; cao đẳng, trung cấp: Quản trị khách sạn, Quản lý và kinh doanh khách sạn, Quản trị khu resort.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý bệnh viện, cơ sở y tế (`ONET-11-9111.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 11-9111.00 và 1 mã gộp vào (Điều phối viên nghiên cứu lâm sàng). Lý do gộp: Điều phối nghiên cứu lâm sàng là một mảng quản lý trong bệnh viện (decisions/onet_merge/11.json).
- **Mã nghề Việt Nam:** 1729 Các đơn vị sản xuất và dịch vụ còn lại chưa được phân vào đâu — sửa tay: ISCO 1342 không có ở Việt Nam; danh mục không tách quản lý y tế, 1729 là quản lý bộ phận các ngành còn lại; **bỏ khỏi hồ sơ** vì độ tin cậy thấp.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 9,7tr–25,4tr — WageIndicator Việt Nam, "Quản lý các dịch vụ sức khỏe", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý y tế, Y tế công cộng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chủ trang trại, quản lý nông nghiệp (`ONET-11-9013.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 11-9013.00, không gộp.
- **Mã nghề Việt Nam:** 6130 Lao động trồng trọt và chăn nuôi hỗn hợp — giữ đề xuất tự động; mã ISCO 6130 chiếm 20% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 3 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 9,7tr–25,4tr — WageIndicator Việt Nam, "Quản lý sản xuất trong nông nghiệp, lâm nghiệp", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 4 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kinh tế nông nghiệp, Nông học, Chăn nuôi; cao đẳng, trung cấp: Quản lý trang trại thông minh, Quản lý và kinh doanh nông nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Quản lý bất động sản, toà nhà (`ONET-11-9141.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 11-9141.00, không gộp.
- **Mã nghề Việt Nam:** 3334 Nhân viên môi giới bất động sản và quản lý tài sản/bất động sản — giữ đề xuất tự động; mã ISCO 3334 chiếm 80% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 14 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–12,0tr, trung bình 11,0tr — TopCV, tra cứu mức lương "Quản lý tòa nhà", 2026; loại job_ads, chất lượng **vừa**. Khoảng phổ biến 10–12tr; dải 5,5–40tr. TopCV tổng hợp từ tin tuyển dụng. Đọc trên trình duyệt ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 19 tin trong VietJobs (5.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Bất động sản, Quản lý đô thị và công trình; cao đẳng, trung cấp: Quản lý tòa nhà, Quản trị kinh doanh bất động sản.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Kinh doanh và tài chính (16 nghề)

### Kế toán, kiểm toán viên (`ONET-13-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-2011.00 và 7 mã gộp vào (Nhân viên làm dịch vụ khai thuế; Chuyên viên phân tích ngân sách; Nhân viên kế toán sổ sách; Nhân viên lập hoá đơn, ghi sổ; Nhân viên tính lương, chấm công; Giám đốc tài chính, trưởng phòng tài chính; Thủ quỹ và kiểm soát viên tài chính). Lý do gộp: Làm tờ khai thuế, phân tích ngân sách, ghi sổ, lập hoá đơn và tính lương là các phần việc của kế toán ở doanh nghiệp Việt Nam. Kế toán trưởng, giám đốc tài chính là cấp cao (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 2411 Kế toán và các nhà chuyên môn có liên quan — giữ đề xuất tự động; mã ISCO 2411 chiếm 67% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (2340 tin có lương): 10,0tr–15,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 3036 tin trong VietJobs (893.9/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kế toán, Kiểm toán; cao đẳng, trung cấp: Kế toán, Kế toán doanh nghiệp; giấy phép: Chứng chỉ kiểm toán viên, kế toán viên (không bắt buộc với kế toán doanh nghiệp).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (4 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Cán bộ thuế (`ONET-13-2081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 13-2081.00, không gộp.
- **Mã nghề Việt Nam:** 2411 Kế toán và các nhà chuyên môn có liên quan — giữ đề xuất tự động; mã ISCO 2411 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); dùng thang lương nhà nước "Công chức chuyên viên đến chuyên viên chính": 5,9tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kế toán, Tài chính - Ngân hàng, Luật kinh tế; cao đẳng, trung cấp: Kế toán thuế; ghi chú: Vào ngành thuế qua thi tuyển công chức.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên tuân thủ và quản lý rủi ro (`ONET-13-1041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-1041.00 và 7 mã gộp vào (Thanh tra tài sản công; Chuyên viên đăng ký và pháp chế sản phẩm; Thanh tra tài chính, ngân hàng; Chuyên viên điều tra gian lận; Chuyên viên kế hoạch liên tục kinh doanh; Chuyên viên quản lý an ninh doanh nghiệp; Trưởng phòng pháp chế, tuân thủ). Lý do gộp: Cùng trải nghiệm kiểm tra việc tuân thủ quy định và phát hiện rủi ro; pháp chế dược, thanh tra tài chính, chống gian lận, kế hoạch liên tục kinh doanh và an ninh doanh nghiệp là các biến thể. Trưởng phòng pháp chế là cấp cao (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 2422 Nhà chuyên môn về quản trị chính sách — sửa tay: Đề xuất 3359 là công chức điều tiết nhà nước; tuân thủ ở doanh nghiệp gần nhất với chuyên môn về chính sách; **bỏ khỏi hồ sơ** vì độ tin cậy thấp.
- **Lương:** dùng lương rao VietJobs (47 tin có lương): 12,5tr–16,5tr, giữa 14,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 69 tin trong VietJobs (20.3/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Luật kinh tế, Tài chính - Ngân hàng, Kiểm toán.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên thẩm định và bồi thường bảo hiểm (`ONET-13-1031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-1031.00 và 3 mã gộp vào (Giám định viên thiệt hại xe cơ giới; Chuyên viên thẩm định hợp đồng bảo hiểm; Nhân viên xử lý hồ sơ bảo hiểm). Lý do gộp: Giám định thiệt hại xe, thẩm định hợp đồng và xử lý hồ sơ bồi thường đều thuộc khâu thẩm định của công ty bảo hiểm (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 3315 Nhân viên định giá và đánh giá mức độ thiệt hại — giữ đề xuất tự động; mã ISCO 3315 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 5 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–15,0tr — VietnamWorks HR Insider, "Ngành bảo hiểm", 2025-06-25; loại career_guide, chất lượng **vừa**; năm số liệu: 2025.
- **Nhu cầu tuyển:** 8 tin trong VietJobs (2.4/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Bảo hiểm, Tài chính - Ngân hàng; cao đẳng, trung cấp: Bảo hiểm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên tín dụng ngân hàng (`ONET-13-2072.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-2072.00 và 2 mã gộp vào (Chuyên viên phân tích tín dụng; Chuyên viên tư vấn tín dụng, quản lý nợ). Lý do gộp: Ở ngân hàng Việt Nam, phân tích tín dụng, tư vấn vay và quản lý khoản vay thường do cùng một chuyên viên tín dụng làm (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 3312 Nhân viên phụ trách các khoản tín dụng và khoản vay — giữ đề xuất tự động; mã ISCO 3312 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (27 tin có lương): 15,0tr–25,0tr, giữa 22,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 51 tin trong VietJobs (15.0/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tài chính - Ngân hàng; cao đẳng, trung cấp: Tài chính tín dụng, Tài chính - Ngân hàng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên tư vấn tài chính và đầu tư (`ONET-13-2052.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-2052.00 và 1 mã gộp vào (Nhà quản lý quỹ đầu tư). Lý do gộp: Quản lý quỹ là cấp cao của nghề tư vấn đầu tư (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 2412 Nhà tư vấn tài chính và đầu tư — giữ đề xuất tự động; mã ISCO 2412 chiếm 67% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (42 tin có lương): 14,5tr–25,1tr, giữa 20,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 51 tin trong VietJobs (15.0/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tài chính - Ngân hàng, Kinh tế đầu tư; cao đẳng, trung cấp: Tư vấn tài chính.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên phân tích tài chính định lượng (quant) (`ONET-13-2099.01`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 13-2099.01, không gộp.
- **Mã nghề Việt Nam:** 2413 Nhà phân tích tài chính và các nhà chuyên môn có liên quan — giữ đề xuất tự động; mã ISCO 2413 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–20,0tr — WageIndicator Việt Nam, "Phân tích viên tài chính", 2026; loại modelled, chất lượng **yếu**. Số của phân tích tài chính nói chung, không riêng quant; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Toán ứng dụng, Công nghệ tài chính, Toán kinh tế.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Thẩm định viên về giá (`ONET-13-2023.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-2023.00 và 1 mã gộp vào (Thẩm định viên tài sản, động sản). Lý do gộp: Ở Việt Nam chỉ có một chức danh thẩm định viên về giá, định giá bất động sản hay động sản là biến thể (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 3315 Nhân viên định giá và đánh giá mức độ thiệt hại — giữ đề xuất tự động; mã ISCO 3315 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 13 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–19,0tr, trung bình 14,0tr — JobsGO, tra cứu lương "Thẩm Định Viên", 2026; loại job_ads, chất lượng **vừa**. Chức danh có thể gồm cả thẩm định tín dụng. 48 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 10–19tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 21 tin trong VietJobs (6.2/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tài chính - Ngân hàng, Bất động sản, Kinh tế học; giấy phép: Thẻ thẩm định viên về giá.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên nhân sự (`ONET-13-1071.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-1071.00 và 7 mã gộp vào (Chuyên viên lương thưởng, phúc lợi và phân tích công việc; Chuyên viên quan hệ lao động; Chuyên viên đào tạo và phát triển; Trợ lý nhân sự; Trưởng phòng nhân sự; Quản lý lương thưởng và phúc lợi; Quản lý đào tạo và phát triển). Lý do gộp: Lương thưởng, quan hệ lao động và đào tạo là các mảng trong phòng nhân sự; trợ lý nhân sự là cấp khởi đầu, trưởng phòng nhân sự là cấp cao (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 2423 Nhà chuyên môn về nhân sự và nghề nghiệp — giữ đề xuất tự động; mã ISCO 2423 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (373 tin có lương): 10,0tr–15,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 496 tin trong VietJobs (146.0/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị nhân lực, Tâm lý học; cao đẳng, trung cấp: Quản trị nhân lực.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (3); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên marketing và nghiên cứu thị trường (`ONET-13-1161.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-1161.00 và 6 mã gộp vào (Chuyên viên marketing tìm kiếm (SEO, SEM); Chuyên viên quan hệ công chúng (PR); Trưởng phòng marketing; Quản lý quảng cáo và khuyến mãi; Quản lý quan hệ công chúng; Quản lý gây quỹ). Lý do gộp: SEO và quan hệ công chúng là các mảng của marketing và truyền thông. Trưởng phòng marketing, quảng cáo và quan hệ công chúng là cấp cao (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 2431 Nhà chuyên môn về quảng cáo và tiếp thị — giữ đề xuất tự động; mã ISCO 2431 chiếm 70% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (1021 tin có lương): 10,5tr–15,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 1309 tin trong VietJobs (385.4/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Marketing, Quản trị kinh doanh, Quan hệ công chúng; cao đẳng, trung cấp: Marketing, Marketing thương mại.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (4).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên quản lý dự án (`ONET-13-1082.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 13-1082.00, không gộp.
- **Mã nghề Việt Nam:** 2421 Nhà phân tích tổ chức và quản lý — giữ đề xuất tự động; mã ISCO 2421 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (83 tin có lương): 15,0tr–28,5tr, giữa 20,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 147 tin trong VietJobs (43.3/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý dự án, Quản trị kinh doanh.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên tổ chức sự kiện (`ONET-13-1121.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 13-1121.00, không gộp.
- **Mã nghề Việt Nam:** 3332 Nhân viên tổ chức hội thảo và sự kiện — giữ đề xuất tự động; mã ISCO 3332 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (52 tin có lương): 11,0tr–13,5tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 73 tin trong VietJobs (21.5/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quan hệ công chúng, Du lịch, Quản lý văn hóa; cao đẳng, trung cấp: Tổ chức sự kiện, Quản trị du lịch MICE.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên logistics và xuất nhập khẩu (`ONET-13-1081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-1081.00 và 7 mã gộp vào (Kỹ sư logistics; Chuyên viên phân tích logistics; Đại lý khai báo hải quan; Nhân viên đại lý vận tải hàng hoá; Nhân viên giao nhận hàng hoá (forwarder); Quản lý vận tải, kho bãi và phân phối; Quản lý chuỗi cung ứng). Lý do gộp: Phân tích, thiết kế logistics, khai báo hải quan và giao nhận vận tải là các phần việc của logistics và xuất nhập khẩu. Quản lý chuỗi cung ứng là cấp cao (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 3331 Nhân viên làm thủ tục thông quan và vận tải hàng hóa — sửa tay: ISCO 1324 không có ở Việt Nam; nghề trong danh mục là chuyên viên logistics, xuất nhập khẩu, khớp với nhân viên thủ tục thông quan và vận tải hàng hoá; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (186 tin có lương): 11,0tr–15,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 283 tin trong VietJobs (83.3/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Logistics và Quản lý chuỗi cung ứng, Kinh doanh quốc tế; cao đẳng, trung cấp: Logistics và quản lý chuỗi cung ứng, Kinh doanh xuất nhập khẩu.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (2); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên mua hàng (`ONET-13-1023.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 13-1023.00 và 4 mã gộp vào (Nhân viên thu mua nông sản; Nhân viên thu mua hàng bán buôn, bán lẻ; Nhân viên thủ tục mua hàng; Trưởng phòng mua hàng). Lý do gộp: Mua nông sản và mua hàng bán lẻ là biến thể; nhân viên thủ tục mua hàng là cấp khởi đầu, trưởng phòng mua hàng là cấp cao (decisions/onet_merge/13.json).
- **Mã nghề Việt Nam:** 3323 Nhân viên/đại lý mua hàng — giữ đề xuất tự động; mã ISCO 3323 chiếm 56% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (317 tin có lương): 11,2tr–15,5tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 438 tin trong VietJobs (129.0/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Logistics và Quản lý chuỗi cung ứng, Kinh doanh thương mại; cao đẳng, trung cấp: Thu mua.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư dự toán (QS) (`ONET-13-1051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 13-1051.00, không gộp.
- **Mã nghề Việt Nam:** 2149 Kỹ sư kỹ thuật khác chưa được phân vào đâu — sửa tay: Đề xuất 2421 là phân tích tổ chức; kỹ sư dự toán là kỹ sư, xếp vào kỹ sư khác; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (187 tin có lương): 13,5tr–18,5tr, giữa 16,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 253 tin trong VietJobs (74.5/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật xây dựng, Quản lý xây dựng; cao đẳng, trung cấp: Kế toán xây dựng; giấy phép: Chứng chỉ hành nghề hoạt động xây dựng hạng I, II, III (thiết kế, giám sát, khảo sát).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Người kinh doanh online (`ONET-13-1199.06`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 13-1199.06, không gộp.
- **Mã nghề Việt Nam:** 5221 Chủ cửa hiệu — sửa tay: Người kinh doanh online tự làm chủ cửa hàng; đề xuất 2431 là chuyên viên marketing; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (185 tin có lương): 10,0tr–15,0tr, giữa 12,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 224 tin trong VietJobs (66.0/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thương mại điện tử, Marketing; cao đẳng, trung cấp: Thương mại điện tử; ghi chú: Nhiều người tự học và mở cửa hàng mà không cần bằng cấp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Toán học và thống kê (3 nghề)

### Chuyên viên thống kê và toán ứng dụng (`ONET-15-2041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 15-2041.00 và 5 mã gộp vào (Nhà thống kê sinh học; Nhà toán học; Chuyên viên quản lý dữ liệu lâm sàng; Kỹ thuật viên tin sinh học; Trợ lý thống kê). Lý do gộp: Cùng trải nghiệm dựng mô hình và phân tích số liệu, chỉ khác lĩnh vực áp dụng (y sinh, lâm sàng, toán thuần). Ở Việt Nam, vị trí nhà toán học thuần gần như chỉ có ở viện và trường. Trợ lý thống kê là cấp khởi đầu (decisions/onet_merge/15.json).
- **Mã nghề Việt Nam:** 2122 Nhà thống kê — sửa tay: Việt Nam tách ISCO 2120 thành 2121 Nhà toán học và 2122 Nhà thống kê; độ tin cậy cao.
- **Lương:** VietJobs: 15 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–12,0tr, trung bình 10,0tr — JobsGO, tra cứu lương "Nhân Viên Thống Kê", 2026; loại job_ads, chất lượng **vừa**. 118 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 8–12tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 19 tin trong VietJobs (5.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thống kê, Thống kê kinh tế, Toán ứng dụng; cao đẳng, trung cấp: Thống kê.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên định phí bảo hiểm (actuary) (`ONET-15-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 15-2011.00, không gộp.
- **Mã nghề Việt Nam:** 2121 Nhà toán học — sửa tay: Đề xuất 3321 là đại lý bảo hiểm; định phí bảo hiểm thuộc ISCO 2120, Việt Nam tách thành 2121 và 2122; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 15,0tr–20,0tr — VietnamWorks HR Insider, "Ngành bảo hiểm", 2025-06-25; loại career_guide, chất lượng **vừa**. Actuary cấp cao ở TP.HCM có thể trên 70tr theo một công ty săn đầu người; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Toán ứng dụng, Bảo hiểm, Toán kinh tế.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên nghiên cứu vận trù (`ONET-15-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 15-2031.00, không gộp.
- **Mã nghề Việt Nam:** 2121 Nhà toán học — sửa tay: Mã 2121 có cấp 5 'Nhà phân tích nghiên cứu hoạt động'; độ tin cậy cao.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,8tr–21,1tr — WageIndicator Việt Nam, "Nhà toán học, nhà thống kê", 2026; loại modelled, chất lượng **yếu**. Số đại diện, không riêng vận trù; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Toán ứng dụng, Kỹ thuật hệ thống công nghiệp, Khoa học dữ liệu.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Kiến trúc và kỹ thuật (13 nghề)

### Kiến trúc sư (`ONET-17-1011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-1011.00 và 1 mã gộp vào (Kiến trúc sư cảnh quan). Lý do gộp: Kiến trúc cảnh quan là một chuyên ngành của kiến trúc (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2161 Kiến trúc sư xây dựng — giữ đề xuất tự động; mã ISCO 2161 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (178 tin có lương): 15,0tr–20,0tr, giữa 17,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 262 tin trong VietJobs (77.1/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kiến trúc; cao đẳng, trung cấp: Thiết kế kiến trúc; giấy phép: Chứng chỉ hành nghề hoạt động xây dựng hạng I, II, III (thiết kế, giám sát, khảo sát).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư trắc địa, bản đồ (`ONET-17-1022.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-1022.00 và 5 mã gộp vào (Kỹ sư trắc địa cao cấp (đo đạc địa cầu); Chuyên viên bản đồ và đo ảnh; Kỹ thuật viên đo đạc, bản đồ; Nhà khoa học viễn thám; Kỹ thuật viên viễn thám). Lý do gộp: Ở Việt Nam, trắc địa, bản đồ, ảnh hàng không và viễn thám học chung một ngành; kỹ thuật viên đo đạc là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2165 Nhà vẽ bản đồ và khảo sát hiện trường — giữ đề xuất tự động; mã ISCO 2165 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 15,0tr–23,0tr, trung bình 18,6tr — JobsGO, tra cứu lương "Kỹ Sư Trắc Địa", 2026; loại job_ads, chất lượng **vừa**. 194 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 15–23tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 10 tin trong VietJobs (2.9/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật trắc địa - bản đồ, Bản đồ, viễn thám và hệ thông tin địa lý; cao đẳng, trung cấp: Công nghệ kỹ thuật trắc địa, Trắc địa công trình; giấy phép: Chứng chỉ hành nghề hoạt động xây dựng hạng I, II, III (thiết kế, giám sát, khảo sát).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư xây dựng (`ONET-17-2051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2051.00 và 4 mã gộp vào (Kỹ sư giao thông; Kỹ thuật viên xây dựng; Người vẽ kỹ thuật kiến trúc, xây dựng; Thanh tra, giám sát xây dựng). Lý do gộp: Kỹ sư giao thông là một chuyên ngành xây dựng; giám sát, thanh tra công trình là việc kỹ sư xây dựng đảm nhận ở Việt Nam; kỹ thuật viên và người vẽ kỹ thuật là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2142 Kỹ sư xây dựng — giữ đề xuất tự động; mã ISCO 2142 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (244 tin có lương): 14,0tr–18,5tr, giữa 16,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 333 tin trong VietJobs (98.0/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật xây dựng, Kỹ thuật xây dựng công trình giao thông; cao đẳng, trung cấp: Công nghệ kỹ thuật xây dựng; giấy phép: Chứng chỉ hành nghề hoạt động xây dựng hạng I, II, III (thiết kế, giám sát, khảo sát).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư điện (`ONET-17-2071.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2071.00 và 3 mã gộp vào (Kỹ thuật viên điện, điện tử; Kỹ sư năng lượng; Kỹ sư hạt nhân). Lý do gộp: Năng lượng và điện hạt nhân là các chuyên ngành của hệ thống điện; kỹ thuật viên điện là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2151 Kỹ sư điện — giữ đề xuất tự động; mã ISCO 2151 chiếm 57% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (151 tin có lương): 13,5tr–20,0tr, giữa 16,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 210 tin trong VietJobs (61.8/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 43-5, 11-3051, 17-2112, 17-2199, 17-2141, 17-2071; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật điện, Kỹ thuật điều khiển và tự động hóa; cao đẳng, trung cấp: Công nghệ kỹ thuật điện, điện tử.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư điện tử, viễn thông (`ONET-17-2072.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2072.00 và 5 mã gộp vào (Chuyên viên thiết bị nhận dạng tần số vô tuyến (RFID); Kỹ sư vi hệ thống; Kỹ sư quang tử; Kỹ thuật viên quang tử; Người vẽ kỹ thuật điện, điện tử). Lý do gộp: RFID, vi hệ thống và quang tử là các chuyên ngành của điện tử; kỹ thuật viên và người vẽ mạch là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2152 Kỹ sư điện tử — giữ đề xuất tự động; mã ISCO 2152 chiếm 75% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–25,0tr — CareerLink, "Ngành điện tử viễn thông", 2026-04-10; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 12 tin trong VietJobs (3.5/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật điện tử - viễn thông, Kỹ thuật điện tử; cao đẳng, trung cấp: Công nghệ kỹ thuật điện tử, truyền thông.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư cơ khí (`ONET-17-2141.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2141.00 và 6 mã gộp vào (Kỹ sư pin nhiên liệu; Kỹ thuật viên cơ khí; Người vẽ kỹ thuật cơ khí; Kỹ sư hàng không vũ trụ; Kỹ thuật viên hàng không; Kỹ sư đóng tàu, kiến trúc sư tàu thuỷ). Lý do gộp: Hàng không, đóng tàu và pin nhiên liệu là các hướng chuyên sâu của cơ khí, ít vị trí riêng ở Việt Nam; kỹ thuật viên và người vẽ cơ khí là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2144 Kỹ sư cơ học, cơ khí — giữ đề xuất tự động; mã ISCO 2144 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (118 tin có lương): 12,5tr–17,5tr, giữa 15,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 160 tin trong VietJobs (47.1/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật cơ khí, Công nghệ kỹ thuật cơ khí; cao đẳng, trung cấp: Công nghệ kỹ thuật cơ khí.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư ô tô (`ONET-17-2141.02`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2141.02 và 1 mã gộp vào (Kỹ thuật viên ô tô). Lý do gộp: Kỹ thuật viên ô tô là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2144 Kỹ sư cơ học, cơ khí — giữ đề xuất tự động; mã ISCO 2144 chiếm 57% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 12,0tr–35,0tr — CareerLink, "Kỹ sư ô tô là gì", 2026-06-12; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 43-5, 11-3051, 17-2112, 17-2199, 17-2141, 17-2071; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật ô tô, Công nghệ kỹ thuật ô tô; cao đẳng, trung cấp: Công nghệ kỹ thuật ô tô.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư cơ điện tử, robot (`ONET-17-2199.05`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2199.05 và 3 mã gộp vào (Kỹ sư robot; Kỹ thuật viên cơ điện tử; Kỹ thuật viên robot). Lý do gộp: Robot là ứng dụng chính của cơ điện tử; kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2149 Kỹ sư kỹ thuật khác chưa được phân vào đâu — sửa tay: Đề xuất 3119 là kỹ thuật viên; nghề là kỹ sư; độ tin cậy vừa.
- **Lương:** VietJobs: 8 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–30,0tr — CareerLink, "Ngành cơ điện tử", 2025-08-29; loại career_guide, chất lượng **vừa**; năm số liệu: 2025.
- **Nhu cầu tuyển:** 13 tin trong VietJobs (3.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 43-5, 11-3051, 17-2112, 17-2199, 17-2141, 17-2071; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật cơ điện tử, Kỹ thuật Robot; cao đẳng, trung cấp: Công nghệ kỹ thuật cơ điện tử, Kỹ thuật robot công nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư hoá học, vật liệu (`ONET-17-2041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2041.00 và 3 mã gộp vào (Kỹ sư vật liệu; Kỹ sư hệ thống nano; Kỹ thuật viên công nghệ nano). Lý do gộp: Vật liệu và công nghệ nano thường học và làm cùng khối kỹ thuật hoá học ở Việt Nam (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2145 Kỹ sư hóa học — giữ đề xuất tự động; mã ISCO 2145 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 8 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–40,0tr — CareerLink, "Kỹ sư hóa học là gì", 2025-04-03; loại career_guide, chất lượng **vừa**; năm số liệu: 2025.
- **Nhu cầu tuyển:** 11 tin trong VietJobs (3.2/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật hóa học, Kỹ thuật vật liệu; cao đẳng, trung cấp: Công nghệ kỹ thuật hóa học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư, chuyên viên môi trường (`ONET-17-2081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2081.00 và 3 mã gộp vào (Kỹ thuật viên môi trường; Nhà khoa học môi trường; Kỹ thuật viên khoa học và bảo vệ môi trường). Lý do gộp: Kỹ thuật môi trường và khoa học môi trường cùng trải nghiệm quan trắc, đánh giá và xử lý ô nhiễm; kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2143 Kỹ sư môi trường — sửa tay: Danh mục có mã Kỹ sư môi trường; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (71 tin có lương): 10,0tr–17,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 95 tin trong VietJobs (28.0/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật môi trường, Khoa học môi trường; cao đẳng, trung cấp: Công nghệ kỹ thuật môi trường.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư công nghiệp, quản lý sản xuất (`ONET-17-2112.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2112.00 và 5 mã gộp vào (Kỹ sư công thái học; Kỹ sư thẩm định quy trình (validation); Kỹ sư sản xuất; Kỹ thuật viên kỹ thuật công nghiệp; Chuyên viên kiểm tra không phá huỷ (NDT)). Lý do gộp: Kỹ thuật sản xuất, công thái học, thẩm định quy trình và kiểm tra không phá huỷ là các mảng của kỹ thuật công nghiệp (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2141 Kỹ sư công nghiệp chế biến, chế tạo — giữ đề xuất tự động; mã ISCO 2141 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (60 tin có lương): 10,6tr–16,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 90 tin trong VietJobs (26.5/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 43-5, 11-3051, 17-2112, 17-2199, 17-2141, 17-2071; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật công nghiệp, Kỹ thuật hệ thống công nghiệp, Quản lý công nghiệp; cao đẳng, trung cấp: Quản lý công nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư mỏ, dầu khí (`ONET-17-2151.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 17-2151.00 và 1 mã gộp vào (Kỹ sư dầu khí). Lý do gộp: Cùng trải nghiệm khai thác tài nguyên dưới lòng đất, khác loại tài nguyên (decisions/onet_merge/17.json).
- **Mã nghề Việt Nam:** 2146 Kỹ sư khai thác mỏ, luyện kim và các nghề liên quan — giữ đề xuất tự động; mã ISCO 2146 chiếm 33% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 3 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–40,0tr — CareerLink, "Kỹ sư dầu khí là gì", 2025-07-01; loại career_guide, chất lượng **vừa**. Chỉ dầu khí, chưa có số cho kỹ sư mỏ; năm số liệu: 2025.
- **Nhu cầu tuyển:** 6 tin trong VietJobs (1.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật dầu khí, Kỹ thuật mỏ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư y sinh (`ONET-17-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 17-2031.00, không gộp.
- **Mã nghề Việt Nam:** 2149 Kỹ sư kỹ thuật khác chưa được phân vào đâu — sửa tay: Đề xuất 2131 là nhà sinh học; kỹ sư y sinh là kỹ sư; độ tin cậy vừa.
- **Lương:** VietJobs: 9 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 14,0tr — CareerLink, "Nhu cầu tuyển dụng kỹ sư hiện nay", 2026-05-13; loại career_guide, chất lượng **yếu**. Số trung bình của mọi kỹ sư, không riêng y sinh; năm số liệu: 2026.
- **Nhu cầu tuyển:** 19 tin trong VietJobs (5.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật y sinh; cao đẳng, trung cấp: Bảo trì và sửa chữa thiết bị y tế.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

## Khoa học tự nhiên và xã hội (13 nghề)

### Kỹ sư nông nghiệp (`ONET-19-1013.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-1013.00 và 6 mã gộp vào (Nhà khoa học chăn nuôi; Kỹ sư cơ khí nông nghiệp; Kỹ thuật viên nông nghiệp; Kỹ thuật viên nông nghiệp chính xác; Thanh tra viên nông nghiệp; Giảng viên khuyến nông và kinh tế gia đình). Lý do gộp: Ở Việt Nam, khoa học cây trồng, chăn nuôi, cơ giới hoá nông nghiệp, kiểm dịch và khuyến nông đều thuộc khối nông học; kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2132 Nhà tư vấn nông, lâm nghiệp và thủy sản — sửa tay: Mã 2132 có cấp 5 nhà trồng trọt, nhà khoa học đất đai; đề xuất 2133 là bảo vệ môi trường; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (22 tin có lương): 11,4tr–16,4tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 30 tin trong VietJobs (8.8/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thí nghiệm, Hiện trường, công trường, ngoài trời — luật khớp: WS_LAB (nhóm 19-1, 19-2); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Nông học, Khoa học cây trồng, Bảo vệ thực vật; cao đẳng, trung cấp: Trồng trọt và bảo vệ thực vật.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (4 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư công nghệ thực phẩm (`ONET-19-1012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-1012.00 và 1 mã gộp vào (Kỹ thuật viên công nghệ thực phẩm). Lý do gộp: Kỹ thuật viên thực phẩm là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2145 Kỹ sư hóa học — giữ đề xuất tự động; mã ISCO 2145 chiếm 33% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 14 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 12,0tr–17,2tr, giữa 16,7tr — CareerViet, "Công nghệ thực phẩm - dinh dưỡng" (dẫn VietnamSalary), 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 21 tin trong VietJobs (6.2/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thí nghiệm — luật khớp: WS_LAB (nhóm 19-1, 19-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Công nghệ thực phẩm, Đảm bảo chất lượng và an toàn thực phẩm; cao đẳng, trung cấp: Công nghệ thực phẩm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà sinh học, chuyên viên công nghệ sinh học (`ONET-19-1029.04`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-1029.04 và 7 mã gộp vào (Nhà hoá sinh, lý sinh; Nhà vi sinh vật học; Nhà khoa học tin sinh học; Nhà sinh học phân tử và tế bào; Nhà di truyền học; Kỹ thuật viên sinh học; Nhà động vật học). Lý do gộp: Hoá sinh, vi sinh, di truyền, sinh học phân tử, tin sinh và động vật học là các chuyên ngành sinh học, cùng trải nghiệm làm việc trong phòng thí nghiệm; kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2131 Nhà sinh vật học, thực vật học, động vật học và các chuyên môn liên quan — giữ đề xuất tự động; mã ISCO 2131 chiếm 82% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–40,0tr — CareerLink, "Học công nghệ sinh học ra làm gì", 2025-09-08; loại career_guide, chất lượng **vừa**; năm số liệu: 2025.
- **Nhu cầu tuyển:** 12 tin trong VietJobs (3.5/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thí nghiệm — luật khớp: WS_LAB (nhóm 19-1, 19-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Công nghệ sinh học, Sinh học; cao đẳng, trung cấp: Công nghệ sinh học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên lâm nghiệp và bảo tồn (`ONET-19-1031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-1031.00 và 4 mã gộp vào (Chuyên viên quản lý đồng cỏ; Chuyên viên giáo dục thiên nhiên ở vườn quốc gia; Kỹ sư lâm nghiệp; Kỹ thuật viên lâm nghiệp và bảo tồn). Lý do gộp: Quản lý đồng cỏ, rừng và vườn quốc gia cùng trải nghiệm quản lý tài nguyên tự nhiên; kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2133 Nhà chuyên môn về bảo vệ môi trường — giữ đề xuất tự động; mã ISCO 2133 chiếm 64% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,9tr–12,6tr — Bảng lương viên chức 2026 (LuatVietnam) × lương cơ sở 2,53tr, 2026; loại official_scale, chất lượng **yếu**. Xếp vào ngạch A1 là suy luận; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Lâm học, Quản lý tài nguyên rừng, Bảo tồn thiên nhiên và đa dạng sinh học; cao đẳng, trung cấp: Lâm sinh, Quản lý tài nguyên rừng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà nghiên cứu y sinh, dịch tễ (`ONET-19-1041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-1041.00 và 1 mã gộp vào (Nhà khoa học y sinh). Lý do gộp: Cùng trải nghiệm nghiên cứu bệnh và sức khoẻ cộng đồng bằng thí nghiệm và dữ liệu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2131 Nhà sinh vật học, thực vật học, động vật học và các chuyên môn liên quan — giữ đề xuất tự động; mã ISCO 2131 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–20,0tr — CareerLink, "Học công nghệ sinh học ra làm gì", 2025-09-08; loại career_guide, chất lượng **yếu**. Số đại diện từ ngành công nghệ sinh học; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thí nghiệm, Văn phòng — luật khớp: WS_LAB (nhóm 19-1, 19-2); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Y học dự phòng, Dịch tễ học, Y tế công cộng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà vật lý (`ONET-19-2012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-2012.00 và 3 mã gộp vào (Nhà thiên văn học; Kỹ thuật viên hạt nhân; Kỹ thuật viên giám sát bức xạ). Lý do gộp: Thiên văn là một chuyên ngành vật lý; kỹ thuật viên hạt nhân là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2111 Nhà vật lý học và thiên văn học — giữ đề xuất tự động; mã ISCO 2111 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,8tr–21,1tr — WageIndicator Việt Nam, "Nhà vật lý và nhà thiên văn", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thí nghiệm — luật khớp: WS_LAB (nhóm 19-1, 19-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Vật lý học, Vật lý kỹ thuật.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà hoá học, chuyên viên kiểm nghiệm (`ONET-19-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-2031.00 và 3 mã gộp vào (Nhà khoa học vật liệu; Kỹ thuật viên hoá; Chuyên viên kiểm nghiệm chất lượng (QC lab)). Lý do gộp: Khoa học vật liệu là một hướng của hoá học; kỹ thuật viên hoá và kiểm nghiệm chất lượng là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2113 Nhà hóa học — giữ đề xuất tự động; mã ISCO 2113 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (24 tin có lương): 8,6tr–11,4tr, giữa 10,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 58 tin trong VietJobs (17.1/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thí nghiệm — luật khớp: WS_LAB (nhóm 19-1, 19-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Hóa học, Hóa phân tích; cao đẳng, trung cấp: Hóa phân tích, Kiểm tra và phân tích hóa chất.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà khoa học địa chất, khí tượng thuỷ văn (`ONET-19-2042.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-2042.00 và 3 mã gộp vào (Nhà thuỷ văn học; Kỹ thuật viên địa chất; Nhà khí tượng học). Lý do gộp: Địa chất, thuỷ văn và khí tượng đều thuộc khoa học trái đất; kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2114 Nhà địa chất, địa vật lý — giữ đề xuất tự động; mã ISCO 2114 chiếm 80% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–20,0tr — Tin tuyển kỹ sư địa chất, Joboko, 2026; loại job_ads, chất lượng **yếu**. 1 tin; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thí nghiệm, Văn phòng — luật khớp: WS_LAB (nhóm 19-1, 19-2); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Địa chất học, Khí tượng và khí hậu học, Thủy văn học; cao đẳng, trung cấp: Khí tượng học, Thủy văn học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà kinh tế học (`ONET-19-3011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 19-3011.00, không gộp.
- **Mã nghề Việt Nam:** 2631 Nhà kinh tế học — giữ đề xuất tự động; mã ISCO 2631 chiếm 75% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–30,0tr — VietnamWorks HR Insider, "Học kinh tế ra làm gì", 2025-03-17; loại career_guide, chất lượng **vừa**. Số của người học kinh tế nói chung; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kinh tế học, Kinh tế phát triển.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà nghiên cứu khoa học xã hội (`ONET-19-3041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-3041.00 và 6 mã gộp vào (Nhà nhân học và khảo cổ học; Nhà sử học; Nhà địa lý học; Nhà chính trị học; Chuyên viên điều tra xã hội học; Trợ lý nghiên cứu khoa học xã hội). Lý do gộp: Xã hội học, nhân học, lịch sử, địa lý, chính trị học và điều tra xã hội học cùng trải nghiệm nghiên cứu con người và xã hội; trợ lý nghiên cứu là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2632 Nhà xã hội học, nhà nhân chủng học và các nghề có liên quan — giữ đề xuất tự động; mã ISCO 2632 chiếm 88% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,5tr–26,0tr — WageIndicator Việt Nam, "Chuyên viên xã hội học, nhà nhân loại học", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 2 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Xã hội học, Nhân học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà tâm lý học (`ONET-19-3033.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-3033.00 và 4 mã gộp vào (Nhà tâm lý học đường; Nhà tâm lý học thần kinh; Nhà tâm lý học thần kinh lâm sàng; Nhà tâm lý học tổ chức – công nghiệp). Lý do gộp: Tâm lý học đường, thần kinh và tổ chức là các chuyên ngành tâm lý học (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2634 Nhà tâm lý học — giữ đề xuất tự động; mã ISCO 2634 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–50,0tr — CareerLink, "Ngành Tâm lý học là gì", 2026-02-05; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tâm lý học, Tâm lý học lâm sàng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên quy hoạch đô thị (`ONET-19-3051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-3051.00 và 1 mã gộp vào (Chuyên viên quy hoạch giao thông). Lý do gộp: Quy hoạch giao thông là một mảng của quy hoạch đô thị (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2164 Nhà quy hoạch đô thị và giao thông — giữ đề xuất tự động; mã ISCO 2164 chiếm 43% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 14 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–40,0tr, giữa 25,4tr — Joboko, tin tuyển "kiến trúc sư quy hoạch", 2026; loại job_ads, chất lượng **vừa**. 7 tin có ghi lương; năm số liệu: 2026.
- **Nhu cầu tuyển:** 23 tin trong VietJobs (6.8/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quy hoạch vùng và đô thị, Đô thị học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên an toàn lao động (HSE) (`ONET-19-5011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 19-5011.00 và 3 mã gộp vào (Kỹ thuật viên an toàn và vệ sinh lao động; Kỹ sư an toàn và sức khoẻ lao động; Kỹ sư phòng cháy chữa cháy). Lý do gộp: Kỹ sư an toàn và phòng cháy cùng trải nghiệm đánh giá, phòng ngừa rủi ro tại nơi làm việc; kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/19.json).
- **Mã nghề Việt Nam:** 2263 Nhà chuyên môn về vệ sinh môi trường và bệnh nghề nghiệp — giữ đề xuất tự động; mã ISCO 2263 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (90 tin có lương): 12,9tr–17,5tr, giữa 15,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 170 tin trong VietJobs (50.1/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý an toàn và sức khỏe nghề nghiệp, An toàn, vệ sinh lao động; cao đẳng, trung cấp: An toàn, vệ sinh lao động, Bảo hộ lao động.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

## Cộng đồng và công tác xã hội (4 nghề)

### Chuyên viên tư vấn tâm lý (`ONET-21-1014.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 21-1014.00 và 3 mã gộp vào (Chuyên viên tư vấn cai nghiện và rối loạn hành vi; Nhà trị liệu hôn nhân và gia đình; Chuyên viên tư vấn phục hồi chức năng). Lý do gộp: Cùng trải nghiệm tham vấn một–một hoặc theo nhóm, chỉ khác đối tượng (người nghiện, gia đình, người cần phục hồi) (decisions/onet_merge/21.json).
- **Mã nghề Việt Nam:** 2635 Nhà chuyên môn về tư vấn và công tác xã hội — giữ đề xuất tự động; mã ISCO 2635 chiếm 64% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–20,0tr — CareerLink, "Ngành Tâm lý học là gì", 2026-02-05; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tâm lý học, Tâm lý học lâm sàng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên tư vấn học đường và hướng nghiệp (`ONET-21-1012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 21-1012.00, không gộp.
- **Mã nghề Việt Nam:** 2423 Nhà chuyên môn về nhân sự và nghề nghiệp — sửa tay: ISCO 2359 không có ở Việt Nam; 2423 gồm chuyên môn về nghề nghiệp, hợp với hướng nghiệp; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (167 tin có lương): 13,0tr–22,5tr, giữa 19,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 187 tin trong VietJobs (55.1/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tâm lý học giáo dục, Giáo dục học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên công tác xã hội (`ONET-21-1021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 21-1021.00 và 4 mã gộp vào (Nhân viên công tác xã hội trong y tế; Nhân viên công tác xã hội về sức khoẻ tâm thần và nghiện chất; Trợ lý dịch vụ xã hội; Quản lý dịch vụ xã hội và cộng đồng). Lý do gộp: Cùng trải nghiệm đánh giá hoàn cảnh và kết nối thân chủ với dịch vụ; chỉ khác môi trường (trường học, bệnh viện, cơ sở cai nghiện). Trợ lý dịch vụ xã hội là cấp khởi đầu, quản lý dịch vụ xã hội là cấp cao (decisions/onet_merge/21.json).
- **Mã nghề Việt Nam:** 2635 Nhà chuyên môn về tư vấn và công tác xã hội — giữ đề xuất tự động; mã ISCO 2635 chiếm 64% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–20,0tr — CareerLink, "Ngành công tác xã hội là gì", 2025-08-20; loại career_guide, chất lượng **vừa**; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Công tác xã hội; cao đẳng, trung cấp: Công tác xã hội.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (2) → Cấp cao (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên y tế cộng đồng (`ONET-21-1094.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 21-1094.00 và 1 mã gộp vào (Chuyên viên giáo dục sức khoẻ). Lý do gộp: Giáo dục sức khoẻ là phần việc chính của y tế cộng đồng (decisions/onet_merge/21.json).
- **Mã nghề Việt Nam:** 3253 Nhân viên y tế cộng đồng — giữ đề xuất tự động; mã ISCO 3253 chiếm 40% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,5tr–8,7tr — WageIndicator Việt Nam, "Nhân viên sức khỏe cộng đồng", 2026; loại modelled, chất lượng **yếu**. Nhân viên y tế thôn bản chỉ nhận phụ cấp, không có lương; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Y tế công cộng; cao đẳng, trung cấp: Dân số y tế.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Pháp lý (3 nghề)

### Luật sư (`ONET-23-1011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 23-1011.00 và 1 mã gộp vào (Trọng tài viên, hoà giải viên). Lý do gộp: Ở Việt Nam, trọng tài viên và hoà giải viên thương mại phần lớn là luật sư kiêm nhiệm (decisions/onet_merge/23.json).
- **Mã nghề Việt Nam:** 2611 Luật sư — giữ đề xuất tự động; mã ISCO 2611 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 10 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–200,0tr — CareerLink, "Mức lương ngành Luật", 2026-03-18; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 28 tin trong VietJobs (8.2/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Luật, Luật kinh tế; giấy phép: Chứng chỉ hành nghề luật sư (sau đào tạo nghề luật sư và tập sự).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Thẩm phán (`ONET-23-1023.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 23-1023.00 và 2 mã gộp vào (Thẩm phán hành chính, người xét xử và chủ toạ phiên điều trần; Thư ký pháp lý của thẩm phán). Lý do gộp: Thẩm phán hành chính là một loại thẩm phán. Thư ký toà án là bước đầu của con đường lên thẩm phán ở Việt Nam (decisions/onet_merge/23.json).
- **Mã nghề Việt Nam:** 2612 Thẩm phán — giữ đề xuất tự động; mã ISCO 2612 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,9tr–20,2tr, giữa 11,1tr — Bảng lương cán bộ, công chức 2026 (LuatVietnam) × lương cơ sở 2,53tr, 2026; loại official_scale, chất lượng **vừa**. Xếp ngạch theo cấp tòa lấy từ nguồn thứ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Luật; ghi chú: Sau đại học luật phải qua đào tạo nghiệp vụ xét xử và thi tuyển thẩm phán.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Trợ lý pháp lý, chuyên viên pháp chế (`ONET-23-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 23-2011.00 và 1 mã gộp vào (Chuyên viên thẩm tra quyền sở hữu bất động sản). Lý do gộp: Tra cứu hồ sơ pháp lý nhà đất là một phần việc của trợ lý pháp lý; ở Việt Nam không có nghề thẩm tra quyền sở hữu riêng (decisions/onet_merge/23.json).
- **Mã nghề Việt Nam:** 3411 Nhân viên về luật pháp — giữ đề xuất tự động; mã ISCO 3411 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (84 tin có lương): 11,6tr–20,0tr, giữa 15,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 139 tin trong VietJobs (40.9/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Luật, Luật kinh tế; cao đẳng, trung cấp: Dịch vụ pháp lý, Dịch vụ pháp lý doanh nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

## Giáo dục và thư viện (9 nghề)

### Giảng viên đại học, cao đẳng (`ONET-25-1081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-1081.00 và 35 mã gộp vào (Giảng viên kinh tế, quản trị kinh doanh; Giảng viên khoa học máy tính; Giảng viên toán học; Giảng viên kiến trúc; Giảng viên kỹ thuật; Giảng viên nông nghiệp; Giảng viên sinh học; Giảng viên lâm nghiệp và bảo tồn; Giảng viên khoa học trái đất, khí quyển và biển; Giảng viên hoá học; Giảng viên khoa học môi trường; Giảng viên vật lý; Giảng viên nhân học và khảo cổ học; Giảng viên khu vực học, văn hoá học; Giảng viên kinh tế học; Giảng viên địa lý; Giảng viên chính trị học; Giảng viên tâm lý học; Giảng viên xã hội học; Giảng viên các chuyên ngành y; Giảng viên điều dưỡng; Giảng viên thư viện học; Giảng viên tư pháp hình sự, an ninh; Giảng viên luật; Giảng viên công tác xã hội; Giảng viên mỹ thuật, sân khấu, âm nhạc; Giảng viên truyền thông; Giảng viên ngôn ngữ và văn học; Giảng viên ngoại ngữ; Giảng viên lịch sử; Giảng viên triết học và tôn giáo học; Giảng viên khoa học gia đình; Giảng viên giáo dục thể chất, giải trí; Giảng viên cao đẳng nghề; Trợ giảng đại học). Lý do gộp: Cùng trải nghiệm giảng dạy và nghiên cứu ở bậc đại học, cao đẳng; môn dạy là biến thể. Trợ giảng là cấp khởi đầu (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2311 Giảng viên đại học và cao học — sửa tay: Việt Nam tách ISCO 2310 thành 2311 đại học và 2312 cao đẳng; độ tin cậy cao.
- **Lương:** VietJobs: 13 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Giảng viên, giảng viên chính, giảng viên cao cấp": 5,9tr–20,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** 34 tin trong VietJobs (10.0/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trường học, trung tâm, Văn phòng — luật khớp: WS_SCHOOL (nhóm 25); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** giấy phép: Đạt chuẩn trình độ đào tạo theo cấp học; người không học sư phạm cần chứng chỉ nghiệp vụ sư phạm; ghi chú: Cần bằng thạc sĩ trở lên ở ngành mình dạy.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Giáo viên trung học (THCS, THPT) (`ONET-25-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-2031.00 và 4 mã gộp vào (Giáo viên trung học cơ sở; Giáo viên hướng nghiệp, dạy nghề bậc THCS; Giáo viên dạy nghề bậc THPT; Giáo viên dạy thay). Lý do gộp: Ở Việt Nam, giáo viên dạy theo môn ở cả THCS và THPT; giáo viên dạy nghề và dạy thay là biến thể (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2331 Giáo viên trung học phổ thông (cấp III) — sửa tay: Việt Nam tách ISCO 2330 thành 2331 THPT và 2332 THCS; độ tin cậy cao.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Giáo viên tiểu học, THCS, THPT hạng III đến hạng I": 5,9tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** 11 tin trong VietJobs (3.2/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trường học, trung tâm — luật khớp: WS_SCHOOL (nhóm 25).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Sư phạm Toán học, Sư phạm Ngữ văn, Sư phạm Khoa học tự nhiên; giấy phép: Đạt chuẩn trình độ đào tạo theo cấp học; người không học sư phạm cần chứng chỉ nghiệp vụ sư phạm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Giáo viên tiểu học (`ONET-25-2021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-2021.00 và 1 mã gộp vào (Trợ giảng phổ thông). Lý do gộp: Trợ giảng phổ thông là cấp khởi đầu của nghề giáo viên (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2341 Giáo viên tiểu học (cấp I) — sửa tay: Đề xuất 2352 là giáo dục đặc biệt; 2341 là giáo viên tiểu học; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Giáo viên tiểu học, THCS, THPT hạng III đến hạng I": 5,9tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trường học, trung tâm — luật khớp: WS_SCHOOL (nhóm 25).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Giáo dục Tiểu học; giấy phép: Đạt chuẩn trình độ đào tạo theo cấp học; người không học sư phạm cần chứng chỉ nghiệp vụ sư phạm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Giáo viên mầm non (`ONET-25-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-2011.00 và 1 mã gộp vào (Giáo viên mẫu giáo). Lý do gộp: Ở Việt Nam, nhà trẻ và mẫu giáo cùng thuộc bậc mầm non (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2342 Giáo viên mầm non — giữ đề xuất tự động; mã ISCO 2342 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 11 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Giáo viên mầm non hạng III đến hạng I": 5,3tr–16,1tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** 12 tin trong VietJobs (3.5/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trường học, trung tâm — luật khớp: WS_SCHOOL (nhóm 25).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Giáo dục Mầm non; cao đẳng, trung cấp: Giáo dục mầm non; giấy phép: Đạt chuẩn trình độ đào tạo theo cấp học; người không học sư phạm cần chứng chỉ nghiệp vụ sư phạm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Giáo viên giáo dục đặc biệt (`ONET-25-2051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-2051.00 và 6 mã gộp vào (Giáo viên giáo dục đặc biệt bậc mẫu giáo; Giáo viên giáo dục đặc biệt bậc tiểu học; Giáo viên giáo dục đặc biệt bậc THCS; Giáo viên giáo dục đặc biệt bậc THPT; Giáo viên thể chất cho trẻ khuyết tật; Trợ giảng giáo dục đặc biệt). Lý do gộp: Cùng trải nghiệm dạy trẻ có nhu cầu đặc biệt, khác cấp học; trợ giảng là cấp khởi đầu (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2392 Giáo viên theo các nhu cầu đặc biệt — sửa tay: ISCO 2352 không có ở Việt Nam; 2392 là giáo viên theo nhu cầu đặc biệt; độ tin cậy cao.
- **Lương:** VietJobs: 3 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Giáo viên tiểu học, THCS, THPT hạng III đến hạng I": 5,9tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 4 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trường học, trung tâm — luật khớp: WS_SCHOOL (nhóm 25).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Giáo dục đặc biệt; cao đẳng, trung cấp: Giáo dục đặc biệt; giấy phép: Đạt chuẩn trình độ đào tạo theo cấp học; người không học sư phạm cần chứng chỉ nghiệp vụ sư phạm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Gia sư, giáo viên trung tâm (`ONET-25-3041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-3041.00 và 2 mã gộp vào (Giáo viên dạy người lớn và dạy tiếng Anh; Giáo viên dạy kỹ năng, năng khiếu). Lý do gộp: Dạy tiếng Anh, dạy kỹ năng và năng khiếu ở trung tâm cùng trải nghiệm dạy ngoài hệ thống trường (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2399 Nhà chuyên môn giảng dạy khác chưa được phân vào đâu — sửa tay: ISCO 2359 không có ở Việt Nam; 2399 là nhà chuyên môn giảng dạy khác; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (79 tin có lương): 10,5tr–17,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 109 tin trong VietJobs (32.1/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trường học, trung tâm, Văn phòng — luật khớp: WS_SCHOOL (nhóm 25); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Sư phạm tiếng nước ngoài, Ngôn ngữ Anh; ghi chú: Trung tâm thường cần bằng đại học đúng môn và chứng chỉ ngoại ngữ, không bắt buộc học sư phạm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Thủ thư, chuyên viên lưu trữ (`ONET-25-4022.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-4022.00 và 3 mã gộp vào (Nhân viên thư viện; Nhân viên hành chính thư viện; Chuyên viên lưu trữ). Lý do gộp: Lưu trữ và thư viện cùng trải nghiệm quản lý, tra cứu tài liệu; nhân viên thư viện là cấp khởi đầu (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2621 Nhà chuyên môn về lưu trữ và giám tuyển — giữ đề xuất tự động; mã ISCO 2621 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 4,7tr–19,1tr, giữa 5,9tr — Thông tư 02/2022/TT-BVHTTDL × lương cơ sở 2,53tr, 2026; loại official_scale, chất lượng **tốt**. Thủ thư ở thư viện công lập; năm số liệu: 2026.
- **Nhu cầu tuyển:** 15 tin trong VietJobs (4.4/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Khoa học thư viện, Lưu trữ học; cao đẳng, trung cấp: Thư viện, Văn thư - Lưu trữ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên bảo tàng (`ONET-25-4012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 25-4012.00 và 1 mã gộp vào (Kỹ thuật viên bảo tàng, chuyên viên bảo quản hiện vật). Lý do gộp: Bảo quản hiện vật là một phần việc của bảo tàng (decisions/onet_merge/25.json).
- **Mã nghề Việt Nam:** 2621 Nhà chuyên môn về lưu trữ và giám tuyển — giữ đề xuất tự động; mã ISCO 2621 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,5tr–26,0tr — WageIndicator Việt Nam, "Người lưu trữ và bảo tàng", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (nhóm 11, 13, 15, 17, 19, 21, 23, 25, 27, 41, 43; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Bảo tàng học, Di sản học; cao đẳng, trung cấp: Bảo tàng học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên phát triển chương trình đào tạo (`ONET-25-9031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 25-9031.00, không gộp.
- **Mã nghề Việt Nam:** 2391 Chuyên gia về phương pháp giáo dục — sửa tay: ISCO 2351 không có ở Việt Nam; 2391 là chuyên gia về phương pháp giáo dục; độ tin cậy cao.
- **Lương:** VietJobs: 7 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–18,0tr — Tin tuyển "Curriculum Developer" (IIG Việt Nam), 2024-11-26; loại job_ads, chất lượng **yếu**. Chỉ 1–2 tin; năm số liệu: 2024.
- **Nhu cầu tuyển:** 9 tin trong VietJobs (2.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (nhóm 11, 13, 15, 17, 19, 21, 23, 25, 27, 41, 43; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Lý luận và phương pháp dạy học, Công nghệ giáo dục.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

## Nghệ thuật, thiết kế, giải trí, thể thao và truyền thông (17 nghề)

### Nhà thiết kế đồ hoạ (`ONET-27-1024.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-1024.00 và 2 mã gộp vào (Giám đốc nghệ thuật (art director); Nhân viên dàn trang, chế bản điện tử). Lý do gộp: Dàn trang là một phần việc của thiết kế đồ hoạ; giám đốc nghệ thuật là cấp cao (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2166 Nhà thiết kế đồ họa và truyền thông đa phương tiện — giữ đề xuất tự động; mã ISCO 2166 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (472 tin có lương): 11,0tr–15,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 657 tin trong VietJobs (193.4/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thiết kế đồ họa; cao đẳng, trung cấp: Thiết kế đồ họa.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Hoạ sĩ hoạt hình, kỹ xảo (`ONET-27-1014.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 27-1014.00, không gộp.
- **Mã nghề Việt Nam:** 2166 Nhà thiết kế đồ họa và truyền thông đa phương tiện — giữ đề xuất tự động; mã ISCO 2166 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (243 tin có lương): 12,5tr–17,5tr, giữa 15,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 324 tin trong VietJobs (95.4/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Nghệ thuật số, Thiết kế đồ họa; cao đẳng, trung cấp: Sản xuất phim hoạt hình, Thiết kế hình ảnh 3D.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Hoạ sĩ, nghệ nhân (`ONET-27-1013.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-1013.00 và 4 mã gộp vào (Nghệ nhân thủ công; Thợ chạm khắc đá; Thợ thổi, uốn và hoàn thiện thuỷ tinh; Thợ làm gốm). Lý do gộp: Cùng trải nghiệm sáng tác tác phẩm bằng tay; đồ thủ công, gốm, chạm đá và thuỷ tinh là biến thể (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2651 Nghệ sỹ hình ảnh — giữ đề xuất tự động; mã ISCO 2651 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (44 tin có lương): 11,6tr–17,5tr, giữa 14,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 52 tin trong VietJobs (15.3/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay — luật khớp: WS_STUDIO (nhóm 27-1013; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Hội họa, Mỹ thuật tạo hình, Thủ công mỹ nghệ; cao đẳng, trung cấp: Hội họa, Thủ công mỹ nghệ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhà thiết kế sản phẩm công nghiệp (`ONET-27-1021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 27-1021.00, không gộp.
- **Mã nghề Việt Nam:** 2163 Nhà thiết kế sản phẩm và may mặc — giữ đề xuất tự động; mã ISCO 2163 chiếm 54% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 2 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 12,1tr) vì số chưa xác nhận (Chức danh 'Product Designer' của JobsGO (53 mẫu, trung bình 15,9tr) có thể là thiết kế giao diện số nên không dùng. JobsGO nhóm 'Thiết kế sản phẩm - công nghiệp': trung bình 12,9tr; dưới 1 năm 11,5tr, 1–3 năm 14tr, trên 3 năm 16tr); năm số liệu: 2024.
- **Nhu cầu tuyển:** 13 tin trong VietJobs (3.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thiết kế công nghiệp; cao đẳng, trung cấp: Thiết kế công nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhà thiết kế thời trang (`ONET-27-1022.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 27-1022.00, không gộp.
- **Mã nghề Việt Nam:** 2163 Nhà thiết kế sản phẩm và may mặc — giữ đề xuất tự động; mã ISCO 2163 chiếm 58% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (46 tin có lương): 11,5tr–16,8tr, giữa 14,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 74 tin trong VietJobs (21.8/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thiết kế thời trang; cao đẳng, trung cấp: Thiết kế thời trang, May thời trang.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhà thiết kế nội thất và trang trí (`ONET-27-1025.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-1025.00 và 3 mã gộp vào (Nhà thiết kế bối cảnh và triển lãm; Nhân viên trưng bày hàng hoá (visual merchandiser); Nhà thiết kế hoa (florist)). Lý do gộp: Thiết kế bối cảnh, trưng bày cửa hàng và cắm hoa trang trí cùng trải nghiệm tạo không gian; khác quy mô (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 3432 Nhà thiết kế và trang trí nội thất — giữ đề xuất tự động; mã ISCO 3432 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (142 tin có lương): 12,9tr–17,5tr, giữa 15,2tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 158 tin trong VietJobs (46.5/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (nhóm 11, 13, 15, 17, 19, 21, 23, 25, 27, 41, 43; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thiết kế nội thất, Kiến trúc nội thất; cao đẳng, trung cấp: Thiết kế nội thất, Trang trí nội thất.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Diễn viên (`ONET-27-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 27-2011.00, không gộp.
- **Mã nghề Việt Nam:** 2655 Diễn viên — sửa tay: Danh mục có mã Diễn viên; độ tin cậy cao.
- **Lương:** VietJobs: 4 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,5tr–26,0tr — WageIndicator Việt Nam, "Diễn viên", 2026; loại modelled, chất lượng **yếu**. Số mô hình; thu nhập thực tế theo vai, theo show; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 4 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay, Hiện trường, công trường, ngoài trời — luật khớp: WS_STUDIO (nhóm 27-2, 27-4); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Diễn viên, Nghệ thuật điện ảnh, truyền hình; cao đẳng, trung cấp: Diễn viên kịch - điện ảnh.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Đạo diễn, nhà sản xuất (`ONET-27-2012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-2012.00 và 3 mã gộp vào (Trưởng ban biên tập chương trình phát thanh, truyền hình; Đạo diễn tuyển vai (casting director); Trưởng bộ phận kỹ thuật phát thanh, truyền hình). Lý do gộp: Biên tập chương trình, tuyển vai và chỉ đạo kỹ thuật là các vai trò trong ê-kíp sản xuất (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2654 Đạo diễn, nhà sản xuất phim, sân khấu và các nghề liên quan — giữ đề xuất tự động; mã ISCO 2654 chiếm 60% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 14 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,5tr–26,0tr — WageIndicator Việt Nam, "Giám đốc phim, cảnh quay và nhà sản xuất", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** 20 tin trong VietJobs (5.9/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay, Văn phòng — luật khớp: WS_STUDIO (nhóm 27-2, 27-4); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Nghệ thuật điện ảnh, truyền hình, Nghệ thuật sân khấu; cao đẳng, trung cấp: Đạo diễn điện ảnh, truyền hình, Sản xuất phim.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Ca sĩ, nhạc công (`ONET-27-2042.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-2042.00 và 2 mã gộp vào (Chỉ huy dàn nhạc và nhà soạn nhạc; DJ sự kiện). Lý do gộp: Sáng tác, chỉ huy và DJ là các hướng khác nhau của nghề âm nhạc (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2652 Nhạc công, ca sỹ và nhạc sỹ — giữ đề xuất tự động; mã ISCO 2652 chiếm 82% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,5tr–26,0tr — WageIndicator Việt Nam, "Nhạc sĩ, ca sĩ và người sáng tác", 2026; loại modelled, chất lượng **yếu**. Số mô hình; thu nhập thực tế theo show; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay — luật khớp: WS_STUDIO (nhóm 27-2, 27-4).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thanh nhạc, Biểu diễn nhạc cụ phương tây, Biểu diễn nhạc cụ truyền thống; cao đẳng, trung cấp: Thanh nhạc, Biểu diễn nhạc cụ phương Tây.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Diễn viên múa (`ONET-27-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-2031.00 và 1 mã gộp vào (Biên đạo múa). Lý do gộp: Biên đạo là cấp cao của diễn viên múa (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2653 Vũ công và biên đạo múa — sửa tay: Danh mục có mã Vũ công và biên đạo múa; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 12,1tr) vì chỉ có số năm 2012 (3–4tr), quá cũ nên không dùng; năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay — luật khớp: WS_STUDIO (nhóm 27-2, 27-4).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Diễn viên múa, Biên đạo múa; cao đẳng, trung cấp: Diễn viên múa.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Vận động viên, huấn luyện viên thể thao (`ONET-27-2021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-2021.00 và 2 mã gộp vào (Huấn luyện viên thể thao và chuyên viên tuyển trạch; Trọng tài thể thao). Lý do gộp: Ở Việt Nam, huấn luyện viên và trọng tài phần lớn đi lên từ vận động viên (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 3421 Vận động viên và người chơi thể thao — giữ đề xuất tự động; mã ISCO 3421 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 10,1tr) vì không có số lương; chỉ có mức thưởng tối đa 40tr/tháng cho thành tích quốc tế (Nghị định 349/2025/NĐ-CP); năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay, Hiện trường, công trường, ngoài trời — luật khớp: WS_STUDIO (nhóm 27-2, 27-4); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Huấn luyện thể thao, Giáo dục Thể chất; cao đẳng, trung cấp: Vận động viên thể thao, Huấn luyện thể thao.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1).
- **Phần nháp cần đọc kỹ:** overview.

### Phóng viên, nhà báo (`ONET-27-3023.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-3023.00 và 1 mã gộp vào (Phát thanh viên, dẫn chương trình phát thanh). Lý do gộp: Phát thanh viên và dẫn chương trình tin tức thuộc khối báo chí (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2642 Nhà báo, biên tập viên — giữ đề xuất tự động; mã ISCO 2642 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 18 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,2tr–27,3tr — WageIndicator Việt Nam, "Phóng viên", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** 21 tin trong VietJobs (6.2/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Báo chí học, Truyền thông đại chúng; cao đẳng, trung cấp: Báo chí học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Biên tập viên (`ONET-27-3041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-3041.00 và 2 mã gộp vào (Nhân viên đọc mo-rát; Người viết tài liệu kỹ thuật). Lý do gộp: Đọc mo-rát và viết tài liệu kỹ thuật là các phần việc biên tập (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2642 Nhà báo, biên tập viên — giữ đề xuất tự động; mã ISCO 2642 chiếm 64% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (134 tin có lương): 10,0tr–13,5tr, giữa 11,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 149 tin trong VietJobs (43.9/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Báo chí học, Xuất bản, Văn học; cao đẳng, trung cấp: Xuất bản.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhà văn, người viết nội dung (`ONET-27-3043.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-3043.00 và 1 mã gộp vào (Nhà thơ, người viết lời bài hát và người viết sáng tạo). Lý do gộp: Thơ, lời bài hát và văn sáng tạo là biến thể của nghề viết (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2641 Nhà văn và nghề có liên quan — giữ đề xuất tự động; mã ISCO 2641 chiếm 42% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (578 tin có lương): 10,0tr–13,0tr, giữa 11,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 694 tin trong VietJobs (204.3/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Báo chí học, Văn học, Truyền thông đa phương tiện; cao đẳng, trung cấp: Sản xuất nội dung số.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Phiên dịch, biên dịch viên (`ONET-27-3091.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-3091.00 và 1 mã gộp vào (Thư ký tốc ký toà án và người tạo phụ đề trực tiếp). Lý do gộp: Tốc ký và làm phụ đề trực tiếp cùng trải nghiệm chuyển lời nói thành văn bản (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 2643 Nhà biên dịch, phiên dịch và nhà ngôn ngữ khác — giữ đề xuất tự động; mã ISCO 2643 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (144 tin có lương): 13,5tr–18,9tr, giữa 15,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 221 tin trong VietJobs (65.1/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Ngôn ngữ Anh, Ngôn ngữ Trung Quốc, Ngôn ngữ Nhật; cao đẳng, trung cấp: Phiên dịch tiếng Anh thương mại.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhiếp ảnh, quay phim và dựng phim (`ONET-27-4031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-4031.00 và 2 mã gộp vào (Nhiếp ảnh gia; Biên tập dựng phim và video). Lý do gộp: Ở Việt Nam, nhiếp ảnh, quay phim và dựng phim thường do cùng một người hoặc studio làm (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 3521 Kỹ thuật viên truyền hình và nghe - nhìn — giữ đề xuất tự động; mã ISCO 3521 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (606 tin có lương): 11,0tr–15,0tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 715 tin trong VietJobs (210.5/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay — luật khớp: WS_STUDIO (nhóm 27-2, 27-4).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quay phim, Nhiếp ảnh, Công nghệ điện ảnh, truyền hình; cao đẳng, trung cấp: Quay phim, Dựng ảnh, Nhiếp ảnh.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên âm thanh, ánh sáng, phát sóng (`ONET-27-4014.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 27-4014.00 và 2 mã gộp vào (Kỹ thuật viên âm thanh và hình ảnh; Kỹ thuật viên phát sóng). Lý do gộp: Cùng trải nghiệm vận hành thiết bị âm thanh, hình ảnh cho sự kiện và phát sóng (decisions/onet_merge/27.json).
- **Mã nghề Việt Nam:** 3521 Kỹ thuật viên truyền hình và nghe - nhìn — giữ đề xuất tự động; mã ISCO 3521 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 12 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–12,0tr — Tin tuyển kỹ thuật viên âm thanh ánh sáng, 123job, 2026-01-06; loại job_ads, chất lượng **yếu**. 1 tin; năm số liệu: 2026.
- **Nhu cầu tuyển:** 15 tin trong VietJobs (4.4/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Phòng thu, sân khấu, trường quay, Văn phòng — luật khớp: WS_STUDIO (nhóm 27-2, 27-4); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thiết kế âm thanh, ánh sáng, Công nghệ âm nhạc; cao đẳng, trung cấp: Thiết kế âm thanh, ánh sáng, Kỹ sư âm thanh, Kỹ thuật sản xuất chương trình truyền hình.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Y tế chuyên môn và kỹ thuật y tế (15 nghề)

### Bác sĩ (`ONET-29-1215.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1215.00 và 21 mã gộp vào (Bác sĩ gây mê hồi sức; Bác sĩ da liễu; Bác sĩ cấp cứu; Bác sĩ nội tổng quát; Bác sĩ thần kinh; Bác sĩ sản phụ khoa; Bác sĩ nhi khoa; Bác sĩ giải phẫu bệnh; Bác sĩ tâm thần; Bác sĩ chẩn đoán hình ảnh; Bác sĩ dị ứng – miễn dịch; Bác sĩ điều trị nội trú; Bác sĩ tiết niệu; Bác sĩ phục hồi chức năng; Bác sĩ y học dự phòng; Bác sĩ y học thể thao; Bác sĩ nhãn khoa; Trợ lý bác sĩ (y sĩ); Bác sĩ trị liệu tự nhiên; Chuyên viên nắn chỉnh cột sống; Bác sĩ chuyên khoa bàn chân). Lý do gộp: Cùng trải nghiệm khám và điều trị người bệnh; chuyên khoa là biến thể. Trợ lý bác sĩ tương ứng y sĩ ở Việt Nam. Nắn chỉnh cột sống, chân và trị liệu tự nhiên không có vị trí riêng ở Việt Nam (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2211 Bác sỹ đa khoa — sửa tay: Đề xuất 2635 là công tác xã hội; mã chính là bác sĩ gia đình, khớp Bác sỹ đa khoa (bác sĩ chuyên khoa là 2212); độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (29 tin có lương): 17,0tr–38,8tr, giữa 22,0tr; kèm thang nhà nước để so: 5,9tr–20,2tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 65 tin trong VietJobs (19.1/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Y khoa, Y học gia đình; cao đẳng, trung cấp: Y sỹ đa khoa; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực); ghi chú: Bác sĩ học Y khoa 6 năm; trung cấp chỉ đào tạo y sỹ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Bác sĩ răng hàm mặt (nha sĩ) (`ONET-29-1021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1021.00 và 3 mã gộp vào (Bác sĩ phẫu thuật hàm mặt; Bác sĩ chỉnh nha; Bác sĩ phục hình răng). Lý do gộp: Phẫu thuật hàm mặt, chỉnh nha và phục hình là các chuyên ngành của răng hàm mặt (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2261 Bác sỹ răng - hàm - mặt — giữ đề xuất tự động; mã ISCO 2261 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 13 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Bác sĩ hạng III đến hạng I": 5,9tr–20,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** 19 tin trong VietJobs (5.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Răng - Hàm - Mặt; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Dược sĩ (`ONET-29-1051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1051.00 và 2 mã gộp vào (Kỹ thuật viên dược; Nhân viên phụ việc nhà thuốc). Lý do gộp: Dược sĩ trung cấp và nhân viên nhà thuốc là cấp khởi đầu của nghề dược (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2262 Dược sỹ — giữ đề xuất tự động; mã ISCO 2262 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (69 tin có lương): 11,0tr–17,5tr, giữa 13,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 97 tin trong VietJobs (28.6/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Dược học; cao đẳng, trung cấp: Dược học, Kỹ thuật dược; giấy phép: Chứng chỉ hành nghề dược.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Điều dưỡng (`ONET-29-1141.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1141.00 và 10 mã gộp vào (Điều dưỡng cấp cứu, hồi sức; Điều dưỡng tâm thần chuyên sâu; Điều dưỡng hồi sức tích cực; Điều dưỡng chuyên khoa lâm sàng; Điều dưỡng thực hành nâng cao; Điều dưỡng trung cấp; Kỹ thuật viên chăm sóc tâm thần; Kỹ thuật viên dụng cụ phẫu thuật; Phụ mổ; Kỹ thuật viên nội soi). Lý do gộp: Cùng trải nghiệm chăm sóc người bệnh theo y lệnh; hồi sức, tâm thần, phòng mổ, nội soi và điều dưỡng chuyên khoa là biến thể (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2221 Y tá/Điều dưỡng (cao cấp) — giữ đề xuất tự động; mã ISCO 2221 chiếm 80% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (81 tin có lương): 10,5tr–14,8tr, giữa 12,0tr; kèm thang nhà nước để so: 5,3tr–17,2tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 111 tin trong VietJobs (32.7/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Điều dưỡng; cao đẳng, trung cấp: Điều dưỡng; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (3) → Lên quản lý (1); bỏ bước "dễ vào hơn" (5 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Hộ sinh (`ONET-29-1161.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1161.00 và 1 mã gộp vào (Hộ sinh (không phải điều dưỡng)). Lý do gộp: Ở Việt Nam chỉ có một nghề hộ sinh (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2222 Hộ sinh (cao cấp) — sửa tay: Danh mục có mã Hộ sinh; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Điều dưỡng, hộ sinh, kỹ thuật y hạng IV đến hạng II": 5,3tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Hộ sinh; cao đẳng, trung cấp: Hộ sinh; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên gây mê hồi sức (`ONET-29-1151.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1151.00 và 2 mã gộp vào (Trợ lý bác sĩ gây mê; Kỹ thuật viên trị liệu hô hấp). Lý do gộp: Ở Việt Nam, hỗ trợ gây mê và trị liệu hô hấp thuộc ngành gây mê hồi sức (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 3259 Kỹ thuật viên sức khỏe khác chưa được phân vào đâu — giữ đề xuất tự động; mã ISCO 3259 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); dùng thang lương nhà nước "Điều dưỡng, hộ sinh, kỹ thuật y hạng IV đến hạng II": 5,3tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật gây mê hồi sức; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên, chuyên viên phục hồi chức năng (`ONET-29-1123.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1123.00 và 15 mã gộp vào (Chuyên viên hoạt động trị liệu; Chuyên viên ngôn ngữ trị liệu; Chuyên viên thính học; Chuyên viên trị liệu bằng hoạt động giải trí; Chuyên viên sinh lý vận động; Chuyên viên trị liệu bằng nghệ thuật; Chuyên viên trị liệu bằng âm nhạc; Chuyên viên chăm sóc chấn thương thể thao; Kỹ thuật viên chỉnh hình, chân tay giả; Chuyên viên máy trợ thính; Kỹ thuật viên vật lý trị liệu; Phụ tá vật lý trị liệu; Kỹ thuật viên hoạt động trị liệu; Phụ tá hoạt động trị liệu; Kỹ thuật viên hỗ trợ âm ngữ trị liệu). Lý do gộp: Ở Việt Nam, vật lý trị liệu, hoạt động trị liệu, ngôn ngữ trị liệu, thính học, chỉnh hình và các liệu pháp bổ trợ thuộc ngành phục hồi chức năng; phụ tá và kỹ thuật viên là cấp khởi đầu (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2264 Nhà chuyên môn về vật lý trị liệu — sửa tay: Danh mục có mã Nhà chuyên môn về vật lý trị liệu; độ tin cậy cao.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Điều dưỡng, hộ sinh, kỹ thuật y hạng IV đến hạng II": 5,3tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** 6 tin trong VietJobs (1.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật Phục hồi chức năng; cao đẳng, trung cấp: Kỹ thuật phục hồi chức năng, Kỹ thuật vật lý trị liệu; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (9 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Y học cổ truyền, châm cứu (`ONET-29-1291.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 29-1291.00, không gộp.
- **Mã nghề Việt Nam:** 2230 Nhà chuyên môn về y học cổ truyền và hỗ trợ — giữ đề xuất tự động; mã ISCO 2230 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,5tr–50,0tr — CareerLink, "Có nên học ngành Y học cổ truyền", 2026-10-02; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 6 tin trong VietJobs (1.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Y học cổ truyền; cao đẳng, trung cấp: Y sỹ y học cổ truyền; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên dinh dưỡng (`ONET-29-1031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1031.00 và 1 mã gộp vào (Kỹ thuật viên dinh dưỡng). Lý do gộp: Kỹ thuật viên dinh dưỡng là cấp khởi đầu (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2265 Nhà chuyên môn về dinh dưỡng — giữ đề xuất tự động; mã ISCO 2265 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 9 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–20,0tr — CareerViet, "Dinh dưỡng", 2026; loại career_guide, chất lượng **vừa**. Đọc trên trình duyệt ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 11 tin trong VietJobs (3.2/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Dinh dưỡng; cao đẳng, trung cấp: Dinh dưỡng; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Bác sĩ thú y (`ONET-29-1131.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1131.00 và 2 mã gộp vào (Kỹ thuật viên thú y; Trợ lý thú y và nhân viên chăm sóc động vật thí nghiệm). Lý do gộp: Kỹ thuật viên và trợ lý thú y là cấp khởi đầu (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2250 Bác sỹ thú y — giữ đề xuất tự động; mã ISCO 2250 chiếm 92% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 5 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–30,0tr — CareerLink, "Ngành thú y là gì", 2026-02-05; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 7 tin trong VietJobs (2.1/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thú y; cao đẳng, trung cấp: Thú y, Dịch vụ thú y.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên xét nghiệm (`ONET-29-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-2011.00 và 7 mã gộp vào (Kỹ thuật viên di truyền tế bào; Kỹ thuật viên tế bào học; Kỹ thuật viên mô học (bậc cao); Kỹ thuật viên xét nghiệm; Kỹ thuật viên mô học; Kỹ thuật viên lấy máu; Chuyên viên tư vấn di truyền). Lý do gộp: Tế bào, di truyền, mô học và lấy máu là các mảng của xét nghiệm y học (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 3212 Kỹ thuật viên phòng thí nghiệm y tế — giữ đề xuất tự động; mã ISCO 3212 chiếm 44% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 11 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Điều dưỡng, hộ sinh, kỹ thuật y hạng IV đến hạng II": 5,3tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** 14 tin trong VietJobs (4.1/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật xét nghiệm y học; cao đẳng, trung cấp: Kỹ thuật xét nghiệm y học; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (2) → Lên quản lý (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên chẩn đoán hình ảnh (`ONET-29-2034.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-2034.00 và 7 mã gộp vào (Kỹ thuật viên tim mạch; Kỹ thuật viên siêu âm; Kỹ thuật viên y học hạt nhân; Kỹ thuật viên chụp cộng hưởng từ (MRI); Kỹ thuật viên tính liều xạ trị; Kỹ thuật viên xạ trị; Kỹ thuật viên chẩn đoán thần kinh). Lý do gộp: X-quang, siêu âm, tim mạch, y học hạt nhân, MRI, xạ trị và điện não đều thuộc ngành kỹ thuật hình ảnh y học (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 3211 Kỹ thuật viên hình ảnh và thiết bị y tế — sửa tay: Mã 3211 có cấp 5 kỹ thuật viên X quang, siêu âm; độ tin cậy cao.
- **Lương:** VietJobs: 7 tin có lương, cần từ 20 tin, không dùng; dùng thang lương nhà nước "Điều dưỡng, hộ sinh, kỹ thuật y hạng IV đến hạng II": 5,3tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** 15 tin trong VietJobs (4.4/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật hình ảnh y học; cao đẳng, trung cấp: Kỹ thuật hình ảnh y học; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên khúc xạ, nhãn khoa (`ONET-29-1041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-1041.00 và 5 mã gộp vào (Nhân viên cắt, lắp kính mắt; Kỹ thuật viên nhãn khoa; Kỹ thuật viên nhãn khoa (bậc cao); Chuyên viên chỉnh thị; Chuyên viên phục hồi thị lực kém). Lý do gộp: Đo khúc xạ, cắt kính, kỹ thuật nhãn khoa và phục hồi thị lực cùng thuộc mảng chăm sóc mắt (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 2267 Nhà chuyên môn về thị lực và nhãn khoa — giữ đề xuất tự động; mã ISCO 2267 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 6 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–17,0tr, trung bình 13,9tr — JobsGO, tra cứu lương "Kỹ Thuật Viên Khúc Xạ", 2026; loại job_ads, chất lượng **vừa**. 23 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 10–17tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 9 tin trong VietJobs (2.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Khúc xạ nhãn khoa; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên cấp cứu ngoại viện (`ONET-29-2043.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 29-2043.00, không gộp.
- **Mã nghề Việt Nam:** 3258 Nhân viên cấp cứu — giữ đề xuất tự động; mã ISCO 3258 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–15,0tr — CareerLink, "Mức lương ngành Y", 2026-03-18; loại career_guide, chất lượng **yếu**. Số của điều dưỡng, dùng làm đại diện; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc, Hiện trường, công trường, ngoài trời — luật khớp: WS_HEALTH (nhóm 29, 31); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Cấp cứu ngoại viện; cao đẳng, trung cấp: Cấp cứu ngoại viện; giấy phép: Giấy phép hành nghề khám bệnh, chữa bệnh (có kỳ kiểm tra đánh giá năng lực).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên hồ sơ bệnh án (`ONET-29-2072.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 29-2072.00 và 1 mã gộp vào (Nhân viên hỗ trợ người bệnh). Lý do gộp: Hỗ trợ và tiếp nhận người bệnh là việc hành chính của bệnh viện, cùng khối với hồ sơ bệnh án (decisions/onet_merge/29.json).
- **Mã nghề Việt Nam:** 3252 Kỹ thuật viên ghi chép sổ sách y tế và thông tin về sức khỏe — giữ đề xuất tự động; mã ISCO 3252 chiếm 67% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–12,0tr — CareerViet, "Thư ký y khoa", 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc, Văn phòng — luật khớp: WS_HEALTH (nhóm 29, 31); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Thư ký y khoa.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

## Hỗ trợ y tế (5 nghề)

### Hộ lý, trợ lý điều dưỡng (`ONET-31-1131.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 31-1131.00 và 3 mã gộp vào (Nhân viên vận chuyển người bệnh; Hộ lý tâm thần; Nhân viên chuẩn bị và tiệt trùng thiết bị y tế). Lý do gộp: Cùng trải nghiệm chăm sóc cơ bản và hỗ trợ trong bệnh viện; vận chuyển người bệnh, hộ lý tâm thần và tiệt trùng dụng cụ là các vị trí hộ lý chuyên biệt (decisions/onet_merge/31.json).
- **Mã nghề Việt Nam:** 5321 Nhân viên hỗ trợ về chăm sóc sức khỏe — giữ đề xuất tự động; mã ISCO 5321 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 3 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–8,0tr — CareerLink, "Hộ lý là gì", 2025-08-25; loại career_guide, chất lượng **vừa**. Bệnh viện công; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Điều dưỡng; ghi chú: Hộ lý thường học sơ cấp hoặc đào tạo tại bệnh viện.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên chăm sóc tại nhà (`ONET-31-1121.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 31-1121.00 và 1 mã gộp vào (Nhân viên chăm sóc cá nhân). Lý do gộp: Cùng trải nghiệm chăm sóc người bệnh, người già tại nhà; ở Việt Nam không tách hai vị trí (decisions/onet_merge/31.json).
- **Mã nghề Việt Nam:** 5322 Nhân viên chăm sóc cá nhân tại nhà — sửa tay: Danh mục có mã Nhân viên chăm sóc cá nhân tại nhà; độ tin cậy cao.
- **Lương:** VietJobs: 2 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–15,0tr — CareerLink, "Nghề chăm sóc người cao tuổi", 2026-07-07; loại career_guide, chất lượng **yếu**. Bài không có số riêng cho người chăm sóc; khoảng này ghép từ số hộ lý và điều dưỡng; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 2 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Chăm sóc người cao tuổi, Dịch vụ chăm sóc gia đình.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Trợ thủ nha khoa (`ONET-31-9091.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 31-9091.00 và 1 mã gộp vào (Kỹ thuật viên vệ sinh răng miệng). Lý do gộp: Vệ sinh răng miệng là việc của trợ thủ, kỹ thuật viên nha khoa ở Việt Nam (decisions/onet_merge/31.json).
- **Mã nghề Việt Nam:** 3251 Phụ tá nha khoa và trị liệu — giữ đề xuất tự động; mã ISCO 3251 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (20 tin có lương): 10,5tr–12,5tr, giữa 11,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 23 tin trong VietJobs (6.8/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật phục hình răng; ghi chú: Thường học sơ cấp hoặc đào tạo tại phòng khám.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Trợ lý y khoa (`ONET-31-9092.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 31-9092.00 và 1 mã gộp vào (Nhân viên ghi chép y khoa). Lý do gộp: Ghi chép y khoa ở Việt Nam do trợ lý và điều dưỡng kiêm, không có vị trí riêng (decisions/onet_merge/31.json).
- **Mã nghề Việt Nam:** 3256 Nhân viên trợ giúp y tế — sửa tay: Danh mục có mã Nhân viên trợ giúp y tế; độ tin cậy cao.
- **Lương:** VietJobs: 9 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,5tr–19,0tr — WageIndicator Việt Nam, "Phụ tá y tế", 2026; loại modelled, chất lượng **yếu**. Số mô hình; năm số liệu: 2026.
- **Nhu cầu tuyển:** 12 tin trong VietJobs (3.5/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Trợ lý y khoa.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên xoa bóp trị liệu (`ONET-31-9011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 31-9011.00, không gộp.
- **Mã nghề Việt Nam:** 3255 Kỹ thuật viên vật lý trị liệu và phụ tá — giữ đề xuất tự động; mã ISCO 3255 chiếm 60% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (40 tin có lương): 10,1tr–18,2tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 45 tin trong VietJobs (13.2/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Bệnh viện, phòng khám, cơ sở chăm sóc — luật khớp: WS_HEALTH (nhóm 29, 31).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Spa trị liệu và chăm sóc sức khỏe du lịch, Kỹ thuật vật lý trị liệu.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

## Dịch vụ bảo vệ an ninh và an toàn (8 nghề)

### Cảnh sát (công an) (`ONET-33-3051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 33-3051.00 và 4 mã gộp vào (Chỉ huy cảnh sát và điều tra viên; Cảnh sát đường sắt và giao thông công cộng; Nhân viên kiểm soát đỗ xe; Cảnh sát hỗ trợ tư pháp tại toà án). Lý do gộp: Ở Việt Nam, tuần tra, giữ trật tự đường sắt, kiểm soát đỗ xe và bảo vệ phiên toà đều do lực lượng công an đảm nhận; chỉ huy là cấp cao (decisions/onet_merge/33.json).
- **Mã nghề Việt Nam:** 0210 Sĩ quan — sửa tay: Cảnh sát ở Việt Nam thuộc lực lượng công an (nhóm 02). ISCO 3355 trùng số với mã Kiểm lâm của Việt Nam; độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); dùng thang lương nhà nước "Sĩ quan công an từ Thiếu úy đến Thượng tá": 10,6tr–18,5tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Trinh sát cảnh sát, Quản lý trật tự an toàn giao thông; ghi chú: Học tại học viện, trường của Bộ Công an; tuyển sinh riêng có sơ tuyển sức khoẻ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Điều tra viên (`ONET-33-3021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 33-3021.00 và 4 mã gộp vào (Cán bộ kỹ thuật hình sự và hồ sơ; Chuyên viên phân tích tình báo; Thám tử tư; Kỹ thuật viên giám định pháp y, hình sự). Lý do gộp: Cùng trải nghiệm thu thập và phân tích chứng cứ; kỹ thuật hình sự, giám định pháp lý, phân tích tình báo và điều tra tư là các biến thể (decisions/onet_merge/33.json).
- **Mã nghề Việt Nam:** 0210 Sĩ quan — sửa tay: Điều tra viên thuộc lực lượng công an (nhóm 02). ISCO 3355 trùng số với mã Kiểm lâm của Việt Nam; độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); dùng thang lương nhà nước "Sĩ quan công an từ Thiếu úy đến Thượng tá": 10,6tr–18,5tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Điều tra hình sự, Trinh sát cảnh sát; ghi chú: Học tại học viện, trường của Bộ Công an.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1).
- **Phần nháp cần đọc kỹ:** overview.

### Cán bộ quản giáo (`ONET-33-3012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 33-3012.00 và 1 mã gộp vào (Đội trưởng quản giáo). Lý do gộp: Đội trưởng quản giáo là cấp cao của nghề này (decisions/onet_merge/33.json).
- **Mã nghề Việt Nam:** 0210 Sĩ quan — sửa tay: Quản giáo trại giam thuộc lực lượng công an (nhóm 02); ISCO 5413 không có ở Việt Nam; độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); dùng thang lương nhà nước "Sĩ quan công an từ Thiếu úy đến Thượng tá": 10,6tr–18,5tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Thi hành án hình sự và hỗ trợ tư pháp; ghi chú: Học tại trường của Bộ Công an.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Lính cứu hoả, cứu nạn (`ONET-33-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 33-2011.00 và 2 mã gộp vào (Chỉ huy đội phòng cháy chữa cháy; Thanh tra và điều tra viên phòng cháy). Lý do gộp: Thanh tra phòng cháy và chỉ huy đội chữa cháy cùng thuộc lực lượng phòng cháy chữa cháy (decisions/onet_merge/33.json).
- **Mã nghề Việt Nam:** 0220 Hạ sĩ quan, chiến sĩ — sửa tay: Cảnh sát phòng cháy chữa cháy thuộc lực lượng công an (nhóm 02); ISCO 5411 không có ở Việt Nam. Cấp bậc thực tế có cả sĩ quan (0210); độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); dùng thang lương nhà nước "Sĩ quan công an từ Thiếu úy đến Thượng tá": 10,6tr–18,5tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Phòng cháy chữa cháy và cứu nạn cứu hộ; ghi chú: Học tại Trường Đại học Phòng cháy chữa cháy (Bộ Công an).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kiểm lâm (`ONET-33-2022.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 33-2022.00 và 1 mã gộp vào (Kiểm lâm và kiểm ngư). Lý do gộp: Ở Việt Nam, kiểm lâm vừa phòng cháy rừng vừa thực thi luật về động vật hoang dã (decisions/onet_merge/33.json).
- **Mã nghề Việt Nam:** 3355 Kiểm lâm — sửa tay: Danh mục có mã Kiểm lâm (3355, và 2445 cho cấp chuyên môn); độ tin cậy cao.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,9tr–12,6tr — Bảng lương công chức 2026 (LuatVietnam) × lương cơ sở 2,53tr, 2026; loại official_scale, chất lượng **yếu**. Xếp ngạch kiểm lâm lấy từ đoạn trích, chưa đọc văn bản; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý tài nguyên rừng, Lâm học; cao đẳng, trung cấp: Quản lý tài nguyên rừng; ghi chú: Vào ngạch kiểm lâm qua thi tuyển công chức.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Cán bộ hải quan và biên phòng cửa khẩu (`ONET-33-3051.04`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 33-3051.04, không gộp.
- **Mã nghề Việt Nam:** 3351 Nhân viên hải quan của Chính phủ — giữ đề xuất tự động; mã ISCO 3351 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,9tr–17,2tr — Thời báo Tài chính Việt Nam (hệ số công chức hải quan) × lương cơ sở 2,53tr, 2024; loại official_scale, chất lượng **vừa**. Chỉ hải quan, chưa có số cho bộ đội biên phòng; năm số liệu: 2024.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý biên giới và cửa khẩu, Biên phòng; ghi chú: Hải quan tuyển qua thi công chức; biên phòng học tại học viện của Bộ Quốc phòng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên bảo vệ, an ninh (`ONET-33-9032.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 33-9032.00 và 6 mã gộp vào (Đội trưởng bảo vệ; Nhân viên soi chiếu an ninh hàng không; Chuyên viên chống thất thoát hàng hoá bán lẻ; Nhân viên giám sát và điều tra sòng bạc; Nhân viên điều tiết giao thông, hướng dẫn sang đường; Nhân viên giám sát xe buýt học sinh). Lý do gộp: Cùng trải nghiệm canh gác và kiểm soát người ra vào; soi chiếu sân bay, chống thất thoát siêu thị và điều tiết giao thông là các vị trí bảo vệ chuyên biệt (decisions/onet_merge/33.json).
- **Mã nghề Việt Nam:** 5401 Nhân viên an ninh (trừ công an) — sửa tay: ISCO 5414 không có ở Việt Nam; 5401 là nhân viên an ninh (trừ công an); độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (25 tin có lương): 8,0tr–14,5tr, giữa 9,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 45 tin trong VietJobs (13.2/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 33-9032, 37-2011, 43-4081, 39-9032, 41-9012, 11-9051, 11-9081; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Không cần bằng cấp; công ty dịch vụ bảo vệ đào tạo ngắn hạn và cấp chứng nhận nghiệp vụ bảo vệ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên cứu hộ bể bơi, bãi biển (`ONET-33-9092.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 33-9092.00, không gộp.
- **Mã nghề Việt Nam:** 5409 Nhân viên dịch vụ bảo vệ khác chưa được phân vào đâu — sửa tay: ISCO 5419 không có ở Việt Nam; 5409 là nhân viên dịch vụ bảo vệ khác; độ tin cậy vừa.
- **Lương:** VietJobs: 2 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–21,0tr, giữa 10,0tr — Tin tuyển cứu hộ bể bơi trên 123job và Joboko, 2026; loại job_ads, chất lượng **vừa**. 5 tin; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 4 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Học khoá cứu hộ ngắn hạn và có chứng nhận.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Chế biến và phục vụ ăn uống (3 nghề)

### Đầu bếp (`ONET-35-2014.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 35-2014.00 và 7 mã gộp vào (Bếp trưởng; Đầu bếp đồ ăn nhanh; Đầu bếp bếp ăn tập thể; Đầu bếp gia đình; Đầu bếp món nấu nhanh; Nhân viên sơ chế thực phẩm; Nhân viên rửa bát). Lý do gộp: Cùng trải nghiệm nấu ăn trong bếp, chỉ khác nơi làm (nhà hàng, đồ ăn nhanh, bếp tập thể, gia đình). Rửa bát và sơ chế là việc khởi đầu trong bếp; bếp trưởng là cấp cao nhất (decisions/onet_merge/35.json).
- **Mã nghề Việt Nam:** 5120 Đầu bếp — giữ đề xuất tự động; mã ISCO 5120 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (119 tin có lương): 8,0tr–15,0tr, giữa 10,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 162 tin trong VietJobs (47.7/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật chế biến món ăn.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (2) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên pha chế (barista, bartender) (`ONET-35-3023.01`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 35-3023.01 và 1 mã gộp vào (Nhân viên pha chế (bartender)). Lý do gộp: Ở Việt Nam thường tuyển chung là nhân viên pha chế; cà phê và cocktail là hai biến thể (decisions/onet_merge/35.json).
- **Mã nghề Việt Nam:** 5132 Nhân viên pha chế — giữ đề xuất tự động; mã ISCO 5132 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (27 tin có lương): 7,0tr–11,5tr, giữa 8,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 44 tin trong VietJobs (13.0/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật pha chế đồ uống.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên phục vụ nhà hàng (`ONET-35-3031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 35-3031.00 và 4 mã gộp vào (Nhân viên cửa hàng đồ ăn nhanh và quầy phục vụ; Nhân viên phục vụ suất ăn ngoài nhà hàng; Nhân viên dọn bàn nhà hàng, căng tin và phụ quầy bar; Nhân viên đón tiếp nhà hàng, quán cà phê). Lý do gộp: Cùng trải nghiệm phục vụ khách ăn uống; đón khách, dọn bàn và phục vụ quầy là các vị trí trong cùng một ca làm (decisions/onet_merge/35.json).
- **Mã nghề Việt Nam:** 5131 Bồi bàn — giữ đề xuất tự động; mã ISCO 5131 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (59 tin có lương): 7,5tr–11,0tr, giữa 8,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 71 tin trong VietJobs (20.9/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Quản trị nhà hàng; ghi chú: Phần lớn học việc tại chỗ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

## Vệ sinh và bảo dưỡng toà nhà, cảnh quan (3 nghề)

### Nhân viên vệ sinh và buồng phòng (`ONET-37-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 37-2011.00 và 3 mã gộp vào (Nhân viên buồng phòng và dọn dẹp; Tổ trưởng buồng phòng và vệ sinh; Nhân viên giặt là, giặt khô). Lý do gộp: Cùng trải nghiệm dọn dẹp theo quy trình, khác nơi làm (toà nhà, khách sạn); giặt là là một bộ phận của buồng phòng. Tổ trưởng là cấp cao của nghề này (decisions/onet_merge/37.json).
- **Mã nghề Việt Nam:** 9112 Người quét dọn và giúp việc trong văn phòng, khách sạn và các cơ sở khác — giữ đề xuất tự động; mã ISCO 9112 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (29 tin có lương): 7,2tr–10,2tr, giữa 8,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 36 tin trong VietJobs (10.6/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 33-9032, 37-2011, 43-4081, 39-9032, 41-9012, 11-9051, 11-9081; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Nghiệp vụ lưu trú; ghi chú: Phần lớn học việc tại chỗ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân cảnh quan và cây xanh (`ONET-37-3011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 37-3011.00 và 3 mã gộp vào (Tổ trưởng chăm sóc cảnh quan và cây xanh; Nhân viên phun thuốc bảo vệ thực vật; Công nhân cắt tỉa cây). Lý do gộp: Phun thuốc và cắt tỉa cây là các phần việc chuyên biệt của chăm sóc cảnh quan; tổ trưởng là cấp cao (decisions/onet_merge/37.json).
- **Mã nghề Việt Nam:** 6113 Lao động làm vườn, trồng vườn và vườn ươm — giữ đề xuất tự động; mã ISCO 6113 chiếm 33% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 4 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–14,0tr — CareerViet, "Cây xanh", 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 6 tin trong VietJobs (1.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Làm vườn - Cây cảnh, Quản lý cây xanh đô thị.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên kiểm soát côn trùng (`ONET-37-2021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 37-2021.00, không gộp.
- **Mã nghề Việt Nam:** 7544 Thợ hun khói và thợ kiểm soát thực vật, động vật có hại khác — sửa tay: Đề xuất 7133 là lau dọn toà nhà; 7544 là thợ kiểm soát động thực vật có hại; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 11,0tr–13,0tr, trung bình 12,3tr — JobsGO, tra cứu lương "Nhân Viên Kiểm Soát Côn Trùng", 2026; loại job_ads, chất lượng **vừa**. 29 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 11–13tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Bảo vệ thực vật; ghi chú: Học việc tại công ty và khoá an toàn hoá chất.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Chăm sóc và dịch vụ cá nhân (10 nghề)

### Thợ làm tóc (`ONET-39-5012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-5012.00 và 3 mã gộp vào (Thợ cắt tóc nam (barber); Nhân viên gội đầu; Giám sát nhân viên dịch vụ cá nhân). Lý do gộp: Cắt tóc nam và gội đầu là các vị trí trong cùng một tiệm tóc; tổ trưởng là cấp cao (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 5141 Thợ làm đầu — sửa tay: Danh mục có mã Thợ làm đầu; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 7,3tr) vì chỉ có bài khoảng năm 2019 (thợ chính 10–15tr), quá cũ nên không dùng. Chức danh 'Stylist' của JobsGO (12 mẫu, 10,8tr) có thể là stylist thời trang nên không dùng; năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật chăm sóc tóc.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên chăm sóc da (spa) (`ONET-39-5094.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 39-5094.00, không gộp.
- **Mã nghề Việt Nam:** 5142 Nhân viên làm đẹp và nhân viên có liên quan — giữ đề xuất tự động; mã ISCO 5142 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (72 tin có lương): 11,5tr–20,0tr, giữa 14,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 80 tin trong VietJobs (23.6/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Chăm sóc sắc đẹp, Spa trị liệu và chăm sóc sức khỏe du lịch.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Thợ làm móng (`ONET-39-5092.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 39-5092.00, không gộp.
- **Mã nghề Việt Nam:** 5142 Nhân viên làm đẹp và nhân viên có liên quan — giữ đề xuất tự động; mã ISCO 5142 chiếm 64% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 2 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 7,3tr) vì chỉ có bài năm 2020 (8–12tr), quá cũ nên không dùng. JobsGO 'Nhân viên nail' có 15 mẫu, trung bình 34,4tr (15–68tr): bất thường, có thể lẫn tin đi làm ở nước ngoài, nên không dùng; năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 2 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ, Văn phòng — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Chăm sóc sắc đẹp; ghi chú: Thường học khoá ngắn tại tiệm hoặc trung tâm.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Chuyên viên trang điểm (`ONET-39-5091.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-5091.00 và 1 mã gộp vào (Nhân viên phục trang). Lý do gộp: Cùng trải nghiệm tạo hình cho người biểu diễn ở hậu đài; phục trang là phần việc đi kèm (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 5142 Nhân viên làm đẹp và nhân viên có liên quan — giữ đề xuất tự động; mã ISCO 5142 chiếm 75% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–50,0tr — CareerLink, "Makeup artist là gì", 2026-03-26; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Tạo hình hóa trang, Chăm sóc sắc đẹp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Hướng dẫn viên du lịch (`ONET-39-7011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-7011.00 và 1 mã gộp vào (Hướng dẫn viên du lịch đường dài). Lý do gộp: Ở Việt Nam chỉ có một nghề hướng dẫn viên, tour ngắn hay dài là biến thể (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 5113 Nhân viên hướng dẫn du lịch — sửa tay: Đề xuất 4221 là tư vấn viên du lịch; 5113 là hướng dẫn viên du lịch; độ tin cậy cao.
- **Lương:** VietJobs: 4 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,5tr–14,0tr, trung bình 11,3tr — TopCV, tra cứu mức lương "Hướng dẫn viên du lịch", 2026; loại job_ads, chất lượng **vừa**. Khoảng phổ biến 8,5–14tr; dải 7,5–30tr. TopCV tổng hợp từ tin tuyển dụng. Đọc trên trình duyệt ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 9 tin trong VietJobs (2.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Du lịch; cao đẳng, trung cấp: Hướng dẫn du lịch; ghi chú: Cần thẻ hướng dẫn viên du lịch theo Luật Du lịch.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên trông trẻ, bảo mẫu (`ONET-39-9011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-9011.00 và 1 mã gộp vào (Bảo mẫu tại gia). Lý do gộp: Cùng trải nghiệm chăm sóc trẻ, khác nơi làm (cơ sở hay gia đình) (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 5311 Nhân viên chăm sóc trẻ em — giữ đề xuất tự động; mã ISCO 5311 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 4,5tr–15,0tr — CareerViet, "Bảo mẫu", 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ, Hiện trường, công trường, ngoài trời — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Chăm sóc và nuôi dưỡng trẻ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Huấn luyện viên thể hình (`ONET-39-9031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-9031.00 và 1 mã gộp vào (Điều phối viên chương trình sức khoẻ, thể hình). Lý do gộp: Điều phối chương trình sức khoẻ, thể hình là cấp quản lý của huấn luyện viên thể hình (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 3423 Người hướng dẫn tập luyện và giải trí, người chỉ đạo chương trình — giữ đề xuất tự động; mã ISCO 3423 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 9 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–25,0tr, trung bình 17,4tr — JobsGO, tra cứu lương "Huấn Luyện Viên", 2026; loại job_ads, chất lượng **vừa**. JobsGO xếp tin personal trainer vào chức danh này. 60 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 10–25tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 9 tin trong VietJobs (2.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Giáo dục Thể chất, Huấn luyện thể thao; cao đẳng, trung cấp: Quản lý, huấn luyện sức khỏe, Huấn luyện thể thao.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên tổ chức hoạt động vui chơi giải trí (`ONET-39-9032.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-9032.00 và 4 mã gộp vào (Giám sát nhân viên giải trí và vui chơi; Nhân viên khu vui chơi giải trí; Nhân viên soát vé và hướng dẫn chỗ ngồi; Nhân viên phòng thay đồ và phòng gửi đồ). Lý do gộp: Soát vé, phục vụ khu vui chơi và phòng thay đồ là các vị trí trong cùng một khu giải trí; tổ trưởng là cấp cao (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 3423 Người hướng dẫn tập luyện và giải trí, người chỉ đạo chương trình — giữ đề xuất tự động; mã ISCO 3423 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 17 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–9,0tr, trung bình 7,7tr — JobsGO, tra cứu lương "Nhân Viên Khu Vui Chơi", 2026; loại job_ads, chất lượng **vừa**. 35 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 6–9tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 21 tin trong VietJobs (6.2/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 33-9032, 37-2011, 43-4081, 39-9032, 41-9012, 11-9051, 11-9081; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý thể dục thể thao, Du lịch; cao đẳng, trung cấp: Văn hóa, văn nghệ quần chúng, Tổ chức sự kiện.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên chăm sóc thú cưng và động vật (`ONET-39-2021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-2021.00 và 1 mã gộp vào (Huấn luyện viên động vật). Lý do gộp: Huấn luyện là một phần việc chuyên sâu của chăm sóc động vật (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 5164 Nhân viên chăm sóc và làm đẹp động vật — giữ đề xuất tự động; mã ISCO 5164 chiếm 79% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 4 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–40,0tr — VOH, dẫn lời trưởng khoa Thú y HUTECH, 2025-08-18; loại news, chất lượng **yếu**. Ước tính của một chuyên gia; năm số liệu: 2025.
- **Nhu cầu tuyển:** 5 tin trong VietJobs (1.5/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ, Hiện trường, công trường, ngoài trời — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Dịch vụ thú y.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên dịch vụ tang lễ (`ONET-39-4031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 39-4031.00 và 3 mã gộp vào (Nhân viên phục vụ tang lễ; Nhân viên ướp xác; Quản lý nhà tang lễ). Lý do gộp: Ở Việt Nam, phục vụ lễ, khâm liệm và tổ chức tang lễ thường do cùng một cơ sở dịch vụ tang lễ đảm nhận; quản lý nhà tang lễ là cấp cao (decisions/onet_merge/39.json).
- **Mã nghề Việt Nam:** 5163 Người làm nghề phục vụ tang lễ và ướp xác — giữ đề xuất tự động; mã ISCO 5163 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 7,3tr) vì không tìm được số ở Việt Nam; năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ, Hiện trường, công trường, ngoài trời — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Học việc tại cơ sở dịch vụ tang lễ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

## Bán hàng (9 nghề)

### Nhân viên bán hàng (`ONET-41-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 41-2031.00 và 5 mã gộp vào (Nhân viên bán phụ tùng; Tổ trưởng bán lẻ; Nhân viên trình diễn và quảng bá sản phẩm; Người bán hàng tận nhà, bán báo và bán hàng rong; Nhân viên quầy dịch vụ và cho thuê). Lý do gộp: Cùng trải nghiệm tư vấn và bán trực tiếp cho người mua; bán phụ tùng, PG, bán tận nhà và quầy cho thuê là các biến thể. Tổ trưởng cửa hàng là cấp cao (decisions/onet_merge/41.json).
- **Mã nghề Việt Nam:** 5223 Nhân viên trợ giúp bán hàng — giữ đề xuất tự động; mã ISCO 5223 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (606 tin có lương): 8,5tr–16,0tr, giữa 11,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 733 tin trong VietJobs (215.8/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Bán hàng trong siêu thị, Kinh doanh thương mại; ghi chú: Phần lớn không đòi bằng cấp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Thu ngân (`ONET-41-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 41-2011.00 và 1 mã gộp vào (Nhân viên đổi tiền và thu ngân sòng bạc). Lý do gộp: Thu ngân ở khu vui chơi là một biến thể của thu ngân (decisions/onet_merge/41.json).
- **Mã nghề Việt Nam:** 5230 Nhân viên thu ngân và bán vé — giữ đề xuất tự động; mã ISCO 5230 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (103 tin có lương): 7,0tr–9,5tr, giữa 8,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 126 tin trong VietJobs (37.1/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 35, 39, 41-2).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Bán hàng trong siêu thị; ghi chú: Phần lớn học việc tại chỗ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Tư vấn viên bảo hiểm (`ONET-41-3021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 41-3021.00, không gộp.
- **Mã nghề Việt Nam:** 3321 Nhân viên đại diện bảo hiểm — giữ đề xuất tự động; mã ISCO 3321 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 5 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,0tr–60,0tr — CareerLink, "Chuyên viên tư vấn bảo hiểm là gì", 2026-04-03; loại career_guide, chất lượng **vừa**. Thu nhập chủ yếu từ hoa hồng; năm số liệu: 2026.
- **Nhu cầu tuyển:** 8 tin trong VietJobs (2.4/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Bảo hiểm; cao đẳng, trung cấp: Bảo hiểm; ghi chú: Đại lý bảo hiểm cần chứng chỉ đại lý do doanh nghiệp bảo hiểm tổ chức thi.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên môi giới chứng khoán (`ONET-41-3031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 41-3031.00, không gộp.
- **Mã nghề Việt Nam:** 3311 Nhân viên môi giới, buôn bán chứng khoán và tài chính — giữ đề xuất tự động; mã ISCO 3311 chiếm 86% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 4,0tr–100,0tr, giữa 17,5tr — JobOKO, "Lương của nhân viên môi giới chứng khoán"; loại career_guide, chất lượng **yếu**. Bài không ghi ngày; năm số liệu: không ghi năm.
- **Nhu cầu tuyển:** **bỏ**, chỉ 4 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tài chính - Ngân hàng; ghi chú: Cần chứng chỉ hành nghề chứng khoán theo Luật Chứng khoán.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên môi giới bất động sản (`ONET-41-9022.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 41-9022.00 và 1 mã gộp vào (Môi giới bất động sản (chủ sàn)). Lý do gộp: Chủ sàn là cấp cao của môi giới bất động sản (decisions/onet_merge/41.json).
- **Mã nghề Việt Nam:** 3334 Nhân viên môi giới bất động sản và quản lý tài sản/bất động sản — giữ đề xuất tự động; mã ISCO 3334 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (112 tin có lương): 12,0tr–51,9tr, giữa 22,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 148 tin trong VietJobs (43.6/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Bất động sản; cao đẳng, trung cấp: Kinh doanh bất động sản; ghi chú: Cần chứng chỉ hành nghề môi giới bất động sản theo Luật Kinh doanh bất động sản.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên kinh doanh (sales B2B) (`ONET-41-4012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 41-4012.00 và 5 mã gộp vào (Nhân viên kinh doanh dịch vụ; Nhân viên kinh doanh quảng cáo; Tổ trưởng kinh doanh (ngoài bán lẻ); Nhân viên bán hàng qua điện thoại (telesales); Trưởng phòng kinh doanh). Lý do gộp: Cùng trải nghiệm tìm khách, chào hàng và chốt hợp đồng; bán quảng cáo, bán dịch vụ và telesales là biến thể. Trưởng nhóm và trưởng phòng kinh doanh là cấp cao (decisions/onet_merge/41.json).
- **Mã nghề Việt Nam:** 3322 Nhân viên đại diện bán hàng hóa thương mại — sửa tay: Đề xuất 3324 là môi giới thương mại; 3322 là đại diện bán hàng thương mại; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (2769 tin có lương): 12,5tr–20,0tr, giữa 15,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 3511 tin trong VietJobs (1033.7/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị kinh doanh, Kinh doanh thương mại, Marketing; cao đẳng, trung cấp: Quản trị bán hàng, Kinh doanh thương mại.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (2); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ sư kinh doanh (sales kỹ thuật) (`ONET-41-9031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 41-9031.00 và 1 mã gộp vào (Nhân viên kinh doanh sản phẩm kỹ thuật và khoa học). Lý do gộp: Bán sản phẩm kỹ thuật, khoa học đòi cùng nền kỹ thuật như kỹ sư kinh doanh (decisions/onet_merge/41.json).
- **Mã nghề Việt Nam:** 2433 Nhà chuyên môn về bán hàng hóa kỹ thuật và y tế (không bao gồm công nghệ thông tin và truyền thông) — giữ đề xuất tự động; mã ISCO 2433 chiếm 91% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (211 tin có lương): 13,5tr–22,5tr, giữa 16,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 285 tin trong VietJobs (83.9/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (nhóm 11, 13, 15, 17, 19, 21, 23, 25, 27, 41, 43; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật cơ khí, Kỹ thuật điện, Kinh doanh thương mại.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên kinh doanh tour du lịch (`ONET-41-3041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 41-3041.00, không gộp.
- **Mã nghề Việt Nam:** 4221 Nhân viên và tư vấn viên du lịch — giữ đề xuất tự động; mã ISCO 4221 chiếm 80% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (208 tin có lương): 10,5tr–17,5tr, giữa 13,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 271 tin trong VietJobs (79.8/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Du lịch; cao đẳng, trung cấp: Điều hành tour du lịch, Quản trị lữ hành.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Người mẫu (`ONET-41-9012.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 41-9012.00, không gộp.
- **Mã nghề Việt Nam:** 5241 Nhân viên làm mẫu — giữ đề xuất tự động; mã ISCO 5241 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 7,3tr) vì số chưa xác nhận (Paylab 'Model': 80% người mẫu 2,97–9,07tr); năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 33-9032, 37-2011, 43-4081, 39-9032, 41-9012, 11-9051, 11-9081; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Nghệ thuật trình diễn mẫu thời trang.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

## Văn phòng và hỗ trợ hành chính (9 nghề)

### Nhân viên hành chính, thư ký (`ONET-43-6014.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-6014.00 và 12 mã gộp vào (Thư ký giám đốc, trợ lý điều hành; Thư ký pháp lý; Thư ký y khoa; Tổ trưởng hành chính văn phòng; Nhân viên văn phòng; Nhân viên lưu trữ hồ sơ; Nhân viên văn thư; Nhân viên thư tín nội bộ; Nhân viên vận hành máy văn phòng; Nhân viên nhập liệu; Nhân viên đánh máy, soạn thảo văn bản; Lễ tân văn phòng). Lý do gộp: Cùng trải nghiệm làm việc văn phòng theo quy trình: thư ký, lễ tân văn phòng, nhập liệu, lưu trữ, văn thư. Thư ký giám đốc là cấp cao; tổ trưởng hành chính là cấp quản lý (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 3343 Thư ký hành chính và điều hành — giữ đề xuất tự động; mã ISCO 3343 chiếm 29% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (587 tin có lương): 9,5tr–14,0tr, giữa 11,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 848 tin trong VietJobs (249.7/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị văn phòng; cao đẳng, trung cấp: Hành chính văn phòng, Thư ký, Văn thư hành chính.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (2) → Cấp cao (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên chăm sóc khách hàng (`ONET-43-4051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-4051.00 và 5 mã gộp vào (Nhân viên tổng đài; Điện thoại viên; Phỏng vấn viên khảo sát; Nhân viên nhắc phí, thu hồi nợ; Nhân viên nhận đơn hàng). Lý do gộp: Cùng trải nghiệm trả lời và xử lý yêu cầu của khách qua điện thoại hoặc trực tiếp: tổng đài, phỏng vấn khảo sát, nhắc phí, nhận đơn (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 4222 Nhân viên trung tâm thông tin liên lạc — giữ đề xuất tự động; mã ISCO 4222 chiếm 40% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (568 tin có lương): 9,0tr–13,5tr, giữa 10,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 702 tin trong VietJobs (206.7/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Quản trị kinh doanh; ghi chú: Phần lớn không đòi ngành học riêng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Lễ tân khách sạn (`ONET-43-4081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-4081.00 và 3 mã gộp vào (Nhân viên khuân hành lý (bellman); Nhân viên hỗ trợ khách (concierge); Nhân viên đặt chỗ và bán vé). Lý do gộp: Concierge, hành lý và đặt phòng, đặt vé đều thuộc bộ phận tiền sảnh (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 4224 Nhân viên lễ tân khách sạn — sửa tay: Danh mục có mã Nhân viên lễ tân khách sạn; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (78 tin có lương): 7,5tr–10,5tr, giữa 8,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 104 tin trong VietJobs (30.6/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Cửa hàng, nhà hàng, khách sạn, cơ sở dịch vụ — luật khớp: WS_SERVICE (nhóm 33-9032, 37-2011, 43-4081, 39-9032, 41-9012, 11-9051, 11-9081; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản trị khách sạn; cao đẳng, trung cấp: Nghiệp vụ lễ tân, Tiếng Anh lễ tân nhà hàng, khách sạn.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Giao dịch viên ngân hàng (`ONET-43-3071.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-3071.00 và 4 mã gộp vào (Nhân viên mở tài khoản; Nhân viên tiếp nhận hồ sơ vay; Nhân viên kiểm tra, phê duyệt tín dụng; Nhân viên nghiệp vụ chứng khoán). Lý do gộp: Mở tài khoản, tiếp nhận hồ sơ vay, kiểm tra tín dụng và giấy tờ chứng khoán là các việc ở quầy giao dịch (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 4211 Nhân viên giao dịch ngân hàng và các nghề liên quan — giữ đề xuất tự động; mã ISCO 4211 chiếm 27% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 9 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,5tr–30,6tr, trung bình 11,3tr — VietnamWorks HR Insider, "Lương nhân viên ngân hàng", 2025-05-30; loại career_guide, chất lượng **vừa**; năm số liệu: 2025.
- **Nhu cầu tuyển:** 19 tin trong VietJobs (5.6/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Tài chính - Ngân hàng; cao đẳng, trung cấp: Tài chính - Ngân hàng, Kế toán ngân hàng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (3) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Cán bộ tiếp nhận hồ sơ hành chính công (`ONET-43-4031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-4031.00 và 1 mã gộp vào (Cán bộ xét duyệt hồ sơ chính sách). Lý do gộp: Ở Việt Nam, xét điều kiện hưởng chính sách và cấp giấy phép đều qua bộ phận một cửa (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 3411 Nhân viên về luật pháp — giữ đề xuất tự động; mã ISCO 3411 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin); dùng thang lương nhà nước "Công chức chuyên viên đến chuyên viên chính": 5,9tr–17,2tr, chưa gồm phụ cấp; năm số liệu: 2026.
- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý nhà nước, Luật; cao đẳng, trung cấp: Pháp luật về quản lý hành chính công; ghi chú: Vào qua thi tuyển công chức, viên chức.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên kho và kế hoạch vật tư (`ONET-43-5071.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-5071.00 và 2 mã gộp vào (Nhân viên cân đo, kiểm đếm hàng; Nhân viên kế hoạch và điều độ sản xuất). Lý do gộp: Cân đo kiểm hàng và lập kế hoạch vật tư là các phần việc của kho (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 4321 Nhân viên ghi chép tồn kho — giữ đề xuất tự động; mã ISCO 4321 chiếm 60% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (418 tin có lương): 8,5tr–11,0tr, giữa 9,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 545 tin trong VietJobs (160.5/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 43-5, 11-3051, 17-2112, 17-2199, 17-2141, 17-2071; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Logistics và Quản lý chuỗi cung ứng; cao đẳng, trung cấp: Quản lý kho hàng, Quản trị kho vận.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên giao hàng (shipper) (`ONET-43-5021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-5021.00 và 1 mã gộp vào (Nhân viên bưu tá). Lý do gộp: Đưa thư bưu điện và giao hàng cùng trải nghiệm (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 9621 Người đưa thư, người giao hàng và người khuân vác hành lý — sửa tay: ISCO 4412 là nhân viên phân loại thư; shipper khớp 9621 có cấp 5 'Người giao hàng'; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (87 tin có lương): 9,0tr–11,5tr, giữa 10,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 98 tin trong VietJobs (28.9/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Không đòi bằng cấp; cần giấy phép lái xe máy.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên bưu chính (`ONET-43-5051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-5051.00 và 1 mã gộp vào (Nhân viên phân loại bưu phẩm). Lý do gộp: Phân loại thư là một phần việc của bưu cục (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 4402 Nhân viên phân loại và vận chuyển thư — sửa tay: Đề xuất 4211 là giao dịch viên ngân hàng; ISCO 4412 của nhân viên bưu chính ứng với 4402 ở Việt Nam; độ tin cậy vừa.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–13,0tr, trung bình 10,5tr — JobsGO, tra cứu lương "Nhân Viên Bưu Cục", 2026; loại job_ads, chất lượng **vừa**. 32 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 8–13tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 43-5, 11-3051, 17-2112, 17-2199, 17-2141, 17-2071; luật dự phòng).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kinh doanh dịch vụ bưu chính viễn thông.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Điều phối viên vận tải và khẩn cấp (`ONET-43-5032.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 43-5032.00 và 1 mã gộp vào (Tổng đài viên khẩn cấp (113, 114, 115)). Lý do gộp: Cùng trải nghiệm nhận cuộc gọi và điều xe, điều người; tổng đài 113, 114, 115 là biến thể khẩn cấp (decisions/onet_merge/43.json).
- **Mã nghề Việt Nam:** 4323 Nhân viên vận chuyển — giữ đề xuất tự động; mã ISCO 4323 chiếm 78% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (48 tin có lương): 10,0tr–14,0tr, giữa 12,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 61 tin trong VietJobs (18.0/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Văn phòng — luật khớp: WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Khai thác vận tải, Logistics và Quản lý chuỗi cung ứng; cao đẳng, trung cấp: Quản lý vận tải và dịch vụ logistics, Khai thác vận tải đường bộ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

## Nông nghiệp, ngư nghiệp và lâm nghiệp (4 nghề)

### Lao động trồng trọt (`ONET-45-2092.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 45-2092.00 và 3 mã gộp vào (Công nhân phân loại nông sản; Người vận hành máy nông nghiệp; Tổ trưởng lao động nông, lâm, ngư nghiệp). Lý do gộp: Phân loại nông sản và lái máy nông nghiệp là các phần việc của trồng trọt; tổ trưởng là cấp cao (decisions/onet_merge/45.json).
- **Mã nghề Việt Nam:** 9201 Lao động trồng trọt — sửa tay: Nghề là lao động phổ thông trồng trọt; ISCO 9211 ứng với 9201 ở Việt Nam; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 5,4tr — Cục Thống kê, quý III/2026, qua VnBusiness, 2026-10-06; loại statistics, chất lượng **vừa**. Thu nhập bình quân ngành nông, lâm, thủy sản, gồm cả người tự làm; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Trồng trọt; ghi chú: Phần lớn học việc tại chỗ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Lao động chăn nuôi và nuôi trồng thuỷ sản (`ONET-45-2093.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 45-2093.00 và 1 mã gộp vào (Người nhân giống vật nuôi). Lý do gộp: Nhân giống là một phần việc chuyên sâu của chăn nuôi (decisions/onet_merge/45.json).
- **Mã nghề Việt Nam:** 9202 Lao động chăn nuôi — sửa tay: Nghề là lao động phổ thông chăn nuôi; ISCO 9212 ứng với 9202 ở Việt Nam. Nuôi trồng thuỷ sản là 9206; độ tin cậy vừa.
- **Lương:** VietJobs: 13 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 5,4tr — Cục Thống kê, quý III/2026, qua VnBusiness, 2026-10-06; loại statistics, chất lượng **yếu**. Số của cả ngành nông, lâm, thủy sản; năm số liệu: 2026.
- **Nhu cầu tuyển:** 22 tin trong VietJobs (6.5/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Chăn nuôi gia súc, gia cầm, Nuôi trồng thủy sản; ghi chú: Phần lớn học việc tại chỗ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Ngư dân, người đánh bắt thuỷ sản (`ONET-45-3031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 45-3031.00, không gộp.
- **Mã nghề Việt Nam:** 6223 Lao động khai thác thủy sản trong vùng biển Việt Nam — sửa tay: Đề xuất 8350 là thuỷ thủ; 6223 là khai thác thuỷ sản trên biển (6222 là nội địa); độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 5,4tr — Cục Thống kê, quý III/2026, qua VnBusiness, 2026-10-06; loại statistics, chất lượng **yếu**. Ngư dân nhận tiền theo chuyến, không theo tháng; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Khai thác thủy sản; ghi chú: Phần lớn học việc trên tàu.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân lâm nghiệp (`ONET-45-4011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 45-4011.00 và 3 mã gộp vào (Công nhân đốn cây; Người vận hành máy khai thác gỗ; Người phân hạng và đo gỗ). Lý do gộp: Đốn cây, vận hành máy khai thác và phân hạng gỗ là các phần việc trong cùng một đội lâm nghiệp (decisions/onet_merge/45.json).
- **Mã nghề Việt Nam:** 6210 Lao động trong lâm nghiệp và lĩnh vực có liên quan — sửa tay: ISCO 9215 không có ở Việt Nam; 6210 là lao động lâm nghiệp; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 5,4tr — Cục Thống kê, quý III/2026, qua VnBusiness, 2026-10-06; loại statistics, chất lượng **yếu**. Số của cả ngành nông, lâm, thủy sản; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Lâm sinh, Lâm nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

## Xây dựng và khai khoáng (8 nghề)

### Thợ xây, ốp lát (`ONET-47-2021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-2021.00 và 14 mã gộp vào (Thợ xây đá; Thợ bê tông; Thợ trát; Thợ cốt thép; Lao động phổ thông xây dựng (phụ hồ); Phụ việc thợ xây, thợ ốp lát; Đốc công xây dựng và khai thác; Thợ ốp lát gạch, đá; Thợ làm sàn đá mài (terrazzo); Thợ trải thảm; Thợ lát sàn; Thợ chà, đánh bóng sàn; Thợ lát gạch block vỉa hè; Thợ dựng hàng rào). Lý do gộp: Xây đá, đổ bê tông, trát, buộc thép, ốp lát và lát sàn là các phần việc của thợ xây trên công trường Việt Nam; phụ hồ là cấp khởi đầu, đốc công là cấp cao (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 7112 Thợ nề và các thợ có liên quan — sửa tay: Đề xuất 7123 là thợ thạch cao; mã chính là thợ xây gạch, khớp Thợ nề; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 9,0tr–10,8tr — Sở Xây dựng Hà Nội, Quyết định 3461/QĐ-SXD (đơn giá nhân công xây dựng), 2025-12-22; loại official_scale, chất lượng **vừa**. Đơn giá dự toán, nhân 26 ngày công; không phải lương trả thực tế; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Nề - Hoàn thiện.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ mộc (`ONET-47-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-2031.00 và 3 mã gộp vào (Phụ việc thợ mộc; Thợ lợp mái; Phụ việc thợ lợp mái). Lý do gộp: Lợp mái là một phần việc của thợ mộc công trình; phụ việc là cấp khởi đầu (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 7115 Thợ mộc và thợ làm đồ gỗ — giữ đề xuất tự động; mã ISCO 7115 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–15,0tr, trung bình 12,9tr — JobsGO, tra cứu lương "Thợ Mộc", 2026; loại job_ads, chất lượng **vừa**. 35 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 10–15tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Mộc xây dựng và trang trí nội thất, Cốp pha - Giàn giáo.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ sơn, thạch cao và hoàn thiện (`ONET-47-2141.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-2141.00 và 5 mã gộp vào (Thợ dán giấy dán tường; Thợ làm vách, trần thạch cao; Thợ xử lý mối nối thạch cao; Thợ lắp vật liệu cách nhiệt sàn, trần, tường; Phụ việc thợ sơn, thợ trát). Lý do gộp: Dán giấy, làm trần thạch cao, xử lý mối nối và cách nhiệt là các việc hoàn thiện nội thất (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 7131 Thợ sơn và thợ liên quan khác — giữ đề xuất tự động; mã ISCO 7131 chiếm 75% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 2 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–14,0tr, trung bình 10,8tr — JobsGO, tra cứu lương "Thợ Sơn", 2026; loại job_ads, chất lượng **vừa**. 34 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 8–14tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 4 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Nề - Hoàn thiện, Công nghệ sơn.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ điện công trình (`ONET-47-2111.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-2111.00 và 2 mã gộp vào (Phụ việc thợ điện; Thợ lắp đặt điện mặt trời). Lý do gộp: Lắp điện mặt trời là một phần việc của thợ điện; phụ việc là cấp khởi đầu (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 7411 Thợ lắp điện cho tòa nhà và thợ điện có liên quan — giữ đề xuất tự động; mã ISCO 7411 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (74 tin có lương): 9,0tr–12,6tr, giữa 11,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 94 tin trong VietJobs (27.7/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Điện dân dụng, Điện công nghiệp, Lắp đặt điện công trình.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ ống nước, đường ống (`ONET-47-2152.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-2152.00 và 5 mã gộp vào (Thợ đặt ống; Phụ việc thợ ống nước; Thợ lò hơi; Thợ bảo ôn đường ống; Thợ hút bể phốt, thông cống). Lý do gộp: Đặt ống, lò hơi, bảo ôn đường ống và thông tắc cống cùng trải nghiệm làm hệ thống đường ống (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 7126 Thợ ống nước — giữ đề xuất tự động; mã ISCO 7126 chiếm 75% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 2 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–16,0tr, trung bình 13,1tr — JobsGO, tra cứu lương "Thợ Điện Nước", 2026; loại job_ads, chất lượng **vừa**. Chức danh gộp cả thợ điện và thợ nước. 128 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 10–16tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Điện - Nước, Cấp, thoát nước, Kỹ thuật lắp đặt ống công nghệ.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (5 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ kết cấu thép, nhôm kính (`ONET-47-2221.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-2221.00 và 2 mã gộp vào (Thợ gò tôn; Thợ lắp kính, nhôm kính). Lý do gộp: Gò tôn và lắp kính cùng trải nghiệm lắp dựng kết cấu kim loại cho công trình (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 7214 Thợ chuẩn bị và lắp ráp các cấu kiện kim loại — giữ đề xuất tự động; mã ISCO 7214 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 11 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 9,0tr–17,0tr, trung bình 13,2tr — JobsGO, tra cứu lương "Thợ Nhôm Kính", 2026; loại job_ads, chất lượng **vừa**. Chưa có số riêng cho thợ kết cấu thép. 30 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 9–17tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 17 tin trong VietJobs (5.0/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Cốt thép - Hàn, Hàn.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Người vận hành máy thi công (`ONET-47-2073.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-2073.00 và 4 mã gộp vào (Người vận hành máy rải và đầm mặt đường; Người vận hành máy đóng cọc; Người vận hành máy đặt và bảo dưỡng ray; Công nhân duy tu đường bộ). Lý do gộp: Máy rải nhựa, máy đóng cọc, máy đặt ray và duy tu đường là các loại máy thi công (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 8342 Thợ vận hành máy đào đất và thợ vận hành thiết bị có liên quan — giữ đề xuất tự động; mã ISCO 8342 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 11,0tr–16,0tr, trung bình 13,3tr — JobsGO, tra cứu lương "Lái Máy Công Trình", 2026; loại job_ads, chất lượng **yếu**. 10 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 11–16tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Vận hành máy xây dựng, Vận hành máy xúc thủy lực, Vận hành máy thi công nền.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân khai thác mỏ, dầu khí (`ONET-47-5041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 47-5041.00 và 11 mã gộp vào (Thợ vận hành tháp khoan dầu khí; Thợ khoan dầu khí; Thợ vận hành thiết bị dịch vụ giếng dầu khí; Công nhân giàn khoan dầu khí; Thợ khoan địa chất; Người vận hành máy xúc mỏ lộ thiên; Thợ chống lò; Người vận hành máy xúc bốc hầm lò; Thợ tách đá ở mỏ đá; Thợ nổ mìn; Phụ việc khai thác mỏ). Lý do gộp: Khoan, xúc bốc, chống lò, nổ mìn và phụ việc giàn khoan cùng trải nghiệm khai thác tài nguyên dưới lòng đất hoặc ngoài khơi (decisions/onet_merge/47.json).
- **Mã nghề Việt Nam:** 8111 Thợ khai thác mỏ và đá — giữ đề xuất tự động; mã ISCO 8111 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: tới 25,0tr, trung bình 20,0tr — Nhân Dân, kết quả năm 2024 của TKV, 2025; loại news, chất lượng **vừa**. Chỉ trong Tập đoàn Than – Khoáng sản Việt Nam; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 2 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Khai thác mỏ; cao đẳng, trung cấp: Khai thác mỏ, Kỹ thuật khai thác mỏ hầm lò, Vận hành thiết bị khai thác dầu khí.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

## Lắp đặt, bảo trì và sửa chữa (9 nghề)

### Thợ sửa chữa ô tô (`ONET-49-3023.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-3023.00 và 7 mã gộp vào (Thợ gò hàn, đồng sơn ô tô; Thợ lắp và sửa kính ô tô; Thợ sửa và thay lốp; Thợ sửa xe buýt, xe tải và động cơ diesel; Kỹ thuật viên xe cắm trại (RV); Thợ lắp đặt, sửa chữa điện tử ô tô; Tổ trưởng thợ sửa chữa, lắp đặt). Lý do gộp: Đồng sơn, kính, lốp, động cơ diesel và điện tử ô tô là các tổ trong cùng một xưởng ô tô; tổ trưởng là cấp cao (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7231 Thợ cơ khí và sửa chữa xe có động cơ — giữ đề xuất tự động; mã ISCO 7231 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (20 tin có lương): 8,6tr–15,0tr, giữa 12,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 26 tin trong VietJobs (7.7/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Bảo trì và sửa chữa ô tô, Công nghệ kỹ thuật ô tô.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (4 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ sửa xe máy (`ONET-49-3052.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-3052.00 và 3 mã gộp vào (Thợ sửa động cơ nhỏ, máy làm vườn; Thợ sửa xe đạp; Thợ sửa ca nô, xuồng máy). Lý do gộp: Động cơ nhỏ, xe đạp và ca nô cùng trải nghiệm sửa máy cỡ nhỏ (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7231 Thợ cơ khí và sửa chữa xe có động cơ — giữ đề xuất tự động; mã ISCO 7231 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 4 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–12,0tr — Muaban.net, bảng lương thợ sửa xe Đà Nẵng, 2026-10; loại career_guide, chất lượng **vừa**. Khảo sát của Muaban.net ở Đà Nẵng. Đọc trên trình duyệt ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 4 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Sửa chữa, lắp ráp xe máy.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ sửa máy công trình, máy nông nghiệp (`ONET-49-3042.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-3042.00 và 2 mã gộp vào (Thợ sửa máy nông nghiệp; Thợ sửa toa xe đường sắt). Lý do gộp: Cùng trải nghiệm sửa máy hạng nặng, khác loại máy (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7233 Thợ cơ khí và sửa chữa máy móc nông nghiệp và công nghiệp — giữ đề xuất tự động; mã ISCO 7233 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 8,2tr) vì số chưa xác nhận (JobsGO 'Thợ sửa chữa': trung bình 11,3tr (9–14tr)); năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 2 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Sửa chữa máy thi công xây dựng, Kỹ thuật máy nông nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên bảo dưỡng máy bay (`ONET-49-3011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-3011.00 và 1 mã gộp vào (Kỹ thuật viên điện tử hàng không). Lý do gộp: Điện tử hàng không là một chuyên ngành bảo dưỡng máy bay (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7232 Thợ cơ khí và sửa chữa động cơ máy bay — giữ đề xuất tự động; mã ISCO 7232 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 15,0tr–50,0tr — CafeF, dẫn lời ông Tạ Minh Trọng (Cục Hàng không Việt Nam), 2026-08-05; loại news, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật hàng không; cao đẳng, trung cấp: Bảo trì và sửa chữa máy bay, Kỹ thuật hàng không.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Thợ điện lạnh (`ONET-49-9021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-9021.00 và 1 mã gộp vào (Thợ sửa đồ gia dụng). Lý do gộp: Sửa đồ gia dụng thường do thợ điện lạnh kiêm (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7127 Thợ cơ khí thiết bị điều hòa không khí và làm lạnh — sửa tay: Danh mục có mã thợ cơ khí điều hoà không khí và làm lạnh; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (41 tin có lương): 10,5tr–14,5tr, giữa 11,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 51 tin trong VietJobs (15.0/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật máy lạnh và điều hòa không khí, Vận hành, sửa chữa thiết bị lạnh.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ bảo trì máy công nghiệp (`ONET-49-9041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-9041.00 và 13 mã gộp vào (Công nhân bảo trì máy; Thợ lắp đặt, căn chỉnh máy; Thợ sửa vật liệu chịu lửa; Thợ lắp đặt, sửa van và thiết bị điều khiển; Thợ sửa cửa cơ khí, cửa cuốn; Thợ lắp đặt, sửa chữa thang máy; Thợ bảo trì, sửa chữa tổng hợp; Kỹ thuật viên bảo dưỡng tua-bin gió; Thợ sửa máy bán hàng tự động, máy trò chơi; Thợ lắp đặt nhà tiền chế; Thợ chằng buộc, nâng hạ (rigger); Phụ việc lắp đặt, bảo trì, sửa chữa; Thợ khoá, sửa két sắt). Lý do gộp: Lắp đặt, căn chỉnh và sửa chữa máy, van, cửa, thang máy, tua-bin gió và khoá đều thuộc bảo trì cơ khí; phụ việc là cấp khởi đầu (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7233 Thợ cơ khí và sửa chữa máy móc nông nghiệp và công nghiệp — giữ đề xuất tự động; mã ISCO 7233 chiếm 53% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (246 tin có lương): 10,0tr–13,0tr, giữa 11,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 336 tin trong VietJobs (98.9/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Bảo trì hệ thống thiết bị công nghiệp, Bảo dưỡng công nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (8 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân đường dây và trạm điện (`ONET-49-9051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-9051.00 và 2 mã gộp vào (Thợ sửa chữa điện trạm, nhà máy điện và rơ-le; Thợ sửa tín hiệu và ghi đường sắt). Lý do gộp: Sửa chữa trạm biến áp và tín hiệu đường sắt cùng trải nghiệm làm hệ thống điện ngoài trời (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7413 Thợ lắp đặt và sửa chữa đường dây điện — giữ đề xuất tự động; mã ISCO 7413 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 3 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 12,3tr — Cục Thống kê, quý I/2025, qua VnEconomy, 2025-04-08; loại statistics, chất lượng **yếu**. Số của cả ngành điện, khí đốt; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Xây lắp đường dây và trạm điện, Hệ thống điện.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (2).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên lắp đặt viễn thông (`ONET-49-9052.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-9052.00 và 4 mã gộp vào (Thợ lắp đặt, sửa thiết bị vô tuyến, trạm phát sóng; Thợ lắp đặt, sửa thiết bị viễn thông; Thợ lắp hệ thống an ninh, báo cháy; Thợ lắp đặt, sửa thiết bị âm thanh hình ảnh). Lý do gộp: Trạm phát sóng, thiết bị viễn thông, hệ thống báo cháy, an ninh và âm thanh hình ảnh cùng trải nghiệm lắp đặt mạng tín hiệu (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7422 Thợ lắp đặt và dịch vụ kỹ thuật thông tin và truyền thông — giữ đề xuất tự động; mã ISCO 7422 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 11 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 8,2tr) vì số chưa xác nhận (JobsGO chỉ có 'Kỹ sư viễn thông' (55 mẫu, 15tr), khác kỹ thuật viên lắp đặt nên không dùng. Tin FPT Telecom, Viettel: 10–20tr); năm số liệu: 2024.
- **Nhu cầu tuyển:** 12 tin trong VietJobs (3.5/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật mạng ngoại vi và thiết bị đầu cuối, Kỹ thuật lắp đặt đài trạm viễn thông.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (4).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ sửa chữa điện, điện tử (`ONET-49-2094.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 49-2094.00 và 7 mã gộp vào (Thợ sửa động cơ điện, dụng cụ điện; Thợ sửa điện, điện tử phương tiện vận tải; Thợ sửa máy tính, máy ATM và máy văn phòng; Kỹ thuật viên sửa chữa thiết bị y tế; Thợ sửa máy ảnh; Thợ sửa đồng hồ; Thợ sửa và lên dây nhạc cụ). Lý do gộp: Sửa động cơ điện, máy văn phòng, thiết bị y tế, máy ảnh, đồng hồ và nhạc cụ cùng trải nghiệm chẩn đoán và sửa thiết bị chính xác (decisions/onet_merge/49.json).
- **Mã nghề Việt Nam:** 7421 Thợ cơ khí và thợ dịch vụ điện tử — giữ đề xuất tự động; mã ISCO 7421 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (20 tin có lương): 10,0tr–13,2tr, giữa 11,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 22 tin trong VietJobs (6.5/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Điện tử dân dụng, Điện tử công nghiệp và dân dụng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

## Sản xuất (16 nghề)

### Công nhân lắp ráp (`ONET-51-2092.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-2092.00 và 9 mã gộp vào (Công nhân lắp ráp kết cấu, hệ thống máy bay; Công nhân quấn dây, bọc và hoàn thiện cuộn dây; Công nhân lắp ráp thiết bị điện, điện tử; Công nhân lắp ráp thiết bị cơ điện; Công nhân lắp ráp động cơ, máy móc; Công nhân làm sản phẩm composite sợi thuỷ tinh; Công nhân lắp ráp, căn chỉnh đồng hồ; Tổ trưởng sản xuất; Phụ việc sản xuất). Lý do gộp: Lắp ráp máy bay, động cơ, thiết bị điện tử, cơ điện và đồng hồ cùng trải nghiệm làm việc trên dây chuyền lắp ráp (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 8209 Thợ lắp ráp chưa được phân vào đâu — sửa tay: ISCO 8211 không có ở Việt Nam; lắp ráp chung khớp 8209 (8201 cơ khí, 8202 điện tử); độ tin cậy vừa.
- **Lương:** dùng lương rao VietJobs (26 tin có lương): 8,5tr–11,5tr, giữa 10,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 41 tin trong VietJobs (12.1/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Không đòi bằng cấp; đào tạo tại nhà máy.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ cơ khí, tiện phay CNC (`ONET-51-4041.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-4041.00 và 22 mã gộp vào (Thợ vận hành máy đùn, kéo kim loại và nhựa; Thợ vận hành máy rèn; Thợ vận hành máy cán; Thợ vận hành máy cắt, đột, dập; Thợ vận hành máy khoan, doa; Thợ vận hành máy mài, đánh bóng; Thợ tiện; Thợ phay, bào; Thợ vận hành nhiều loại máy công cụ; Thợ làm khuôn mẫu, dụng cụ; Thợ làm mẫu kim loại và nhựa; Thợ làm mẫu đúc kim loại và nhựa; Thợ làm khuôn đúc và lõi; Thợ vận hành máy làm khuôn, đúc; Thợ vận hành thiết bị nhiệt luyện; Thợ lấy dấu kim loại và nhựa; Thợ vận hành máy mạ; Thợ mài, giũa dụng cụ; Thợ vận hành lò luyện kim; Thợ rót, đúc kim loại; Thợ vận hành máy CNC; Lập trình viên máy CNC). Lý do gộp: Đứng máy tiện, phay, mài, dập, đúc, nhiệt luyện, mạ, làm khuôn và lập trình CNC là các vị trí trong cùng một xưởng cơ khí; khác loại máy (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 7223 Thợ lắp ráp và vận hành máy công cụ kim loại — giữ đề xuất tự động; mã ISCO 7223 chiếm 73% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (106 tin có lương): 10,5tr–15,6tr, giữa 12,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 128 tin trong VietJobs (37.7/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Cắt gọt kim loại, Công nghệ CNC nâng cao.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1); bỏ bước "dễ vào hơn" (19 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ hàn (`ONET-51-4121.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-4121.00 và 2 mã gộp vào (Thợ vận hành máy hàn; Thợ gia công, lắp ráp kết cấu kim loại). Lý do gộp: Hàn máy và gia công kết cấu kim loại cùng trải nghiệm hàn, cắt, ghép kim loại (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 7212 Thợ hàn và thợ cắt kim loại bằng nhiệt — giữ đề xuất tự động; mã ISCO 7212 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 9 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–20,0tr — CareerLink, "Thợ hàn là gì", 2026-03-26; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 13 tin trong VietJobs (3.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Hàn, Công nghệ hàn.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân chế biến thực phẩm (`ONET-51-3092.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-3092.00 và 6 mã gộp vào (Công nhân vận hành máy rang, nướng, sấy thực phẩm; Công nhân vận hành máy nấu thực phẩm; Thợ pha lóc thịt; Công nhân cắt, sơ chế thịt, gia cầm, cá; Công nhân giết mổ và đóng gói thịt; Công nhân vận hành thiết bị làm lạnh, cấp đông). Lý do gộp: Rang sấy, nấu, pha trộn, pha lóc thịt cá và cấp đông là các công đoạn của nhà máy thực phẩm (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 8160 Thợ vận hành máy sản xuất thực phẩm và các thợ có liên quan — giữ đề xuất tự động; mã ISCO 8160 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 9,0tr–11,0tr, giữa 10,0tr — Báo Thanh Tra, dẫn một doanh nghiệp thủy sản TP.HCM, 2025-12-16; loại news, chất lượng **vừa**; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Chế biến thực phẩm; ghi chú: Phần lớn đào tạo tại nhà máy.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ làm bánh (`ONET-51-3011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 51-3011.00, không gộp.
- **Mã nghề Việt Nam:** 7512 Thợ nướng bánh, thợ làm bánh ngọt và bánh kẹo — giữ đề xuất tự động; mã ISCO 7512 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 12 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 6,0tr–15,0tr — CareerLink, "Thợ làm bánh là gì", 2026-03-26; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 13 tin trong VietJobs (3.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật làm bánh.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân in ấn (`ONET-51-5112.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-5112.00 và 3 mã gộp vào (Kỹ thuật viên chế bản in; Công nhân đóng xén, hoàn thiện sản phẩm in; Công nhân xử lý, tráng rửa ảnh). Lý do gộp: Chế bản, in, đóng xén và in tráng ảnh là các công đoạn của ngành in (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 7322 Thợ in — giữ đề xuất tự động; mã ISCO 7322 chiếm 89% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (24 tin có lương): 9,0tr–11,9tr, giữa 11,5tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 32 tin trong VietJobs (9.4/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Công nghệ kỹ thuật in, Công nghệ chế bản điện tử.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân may mặc, da giày (`ONET-51-6031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-6031.00 và 12 mã gộp vào (Công nhân là, ủi; Thợ may tay; Thợ may đo; Công nhân vận hành máy tẩy, nhuộm; Công nhân vận hành máy cắt vải; Công nhân vận hành máy dệt, đan; Công nhân vận hành máy cuộn, xe, kéo sợi; Công nhân vận hành máy đùn sợi tổng hợp, sợi thuỷ tinh; Nhân viên thiết kế rập; Công nhân vận hành máy làm giày; Thợ giày, đồ da; Thợ bọc nệm, ghế). Lý do gộp: Dệt, nhuộm, cắt, may, là, làm rập, may đo, bọc nệm và giày da là các công đoạn của ngành dệt may, da giày Việt Nam (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 8153 Thợ vận hành máy may — giữ đề xuất tự động; mã ISCO 8153 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (20 tin có lương): 9,2tr–16,2tr, giữa 11,8tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 29 tin trong VietJobs (8.5/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Công nghệ may, May thời trang, Công nghệ da giày.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ mộc đồ gỗ nội thất (`ONET-51-7011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-7011.00 và 5 mã gộp vào (Thợ hoàn thiện đồ gỗ; Thợ làm mẫu gỗ; Thợ làm mẫu đúc bằng gỗ; Công nhân vận hành máy cưa gỗ; Công nhân vận hành máy chế biến gỗ). Lý do gộp: Hoàn thiện, làm mẫu và đứng máy cưa, máy chế biến gỗ là các công đoạn của xưởng đồ gỗ (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 7522 Thợ sản xuất làm đồ gỗ và các thợ có liên quan — giữ đề xuất tự động; mã ISCO 7522 chiếm 36% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 8 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–15,0tr, trung bình 12,9tr — JobsGO, tra cứu lương "Thợ Mộc", 2026; loại job_ads, chất lượng **vừa**. JobsGO không tách thợ mộc xây dựng và thợ mộc đồ gỗ. 35 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 10–15tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 8 tin trong VietJobs (2.4/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Mộc dân dụng, Gia công và thiết kế sản phẩm mộc.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (2) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Vận hành nhà máy điện (`ONET-51-8013.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-8013.00 và 3 mã gộp vào (Nhân viên vận hành lò phản ứng hạt nhân; Điều độ viên hệ thống điện; Thợ vận hành lò hơi và máy cố định). Lý do gộp: Vận hành lò phản ứng, điều độ điện và vận hành lò hơi thuộc khối vận hành nhà máy điện (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 3131 Người vận hành trạm hoặc nhà máy phát điện — giữ đề xuất tự động; mã ISCO 3131 chiếm 91% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 12,3tr — Cục Thống kê, quý I/2025, qua VnEconomy, 2025-04-08; loại statistics, chất lượng **yếu**. Số của cả ngành điện, khí đốt; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 2 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Vận hành điện trong nhà máy điện, Vận hành nhà máy điện gió, điện mặt trời.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (3) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Vận hành nhà máy nước, xử lý nước thải (`ONET-51-8031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 51-8031.00, không gộp.
- **Mã nghề Việt Nam:** 3132 Người vận hành lò đốt rác và nhà máy xử lý nước — giữ đề xuất tự động; mã ISCO 3132 chiếm 55% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (20 tin có lương): 10,1tr–17,5tr, giữa 13,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 25 tin trong VietJobs (7.4/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kỹ thuật thoát nước và xử lý nước thải, Xử lý nước thải công nghiệp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Vận hành nhà máy hoá chất, lọc dầu, khí (`ONET-51-8091.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-8091.00 và 7 mã gộp vào (Nhân viên vận hành nhà máy khí; Nhân viên vận hành lọc dầu, hệ thống bơm dầu; Công nhân vận hành thiết bị hoá chất; Công nhân vận hành máy tách, lọc, chưng cất; Người vận hành trạm nén, bơm khí; Người vận hành trạm bơm; Người vận hành bơm đầu giếng). Lý do gộp: Nhà máy khí, lọc dầu, thiết bị hoá chất, chưng tách và trạm bơm, nén khí cùng trải nghiệm vận hành dây chuyền quá trình liên tục (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 8131 Thợ vận hành máy và thiết bị sản xuất hóa chất — giữ đề xuất tự động; mã ISCO 8131 chiếm 50% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 8,7tr) vì chỉ có trung bình cả ngành chế biến chế tạo (9,1tr), thấp hơn nhiều so với vận hành lọc dầu nên không dùng; năm số liệu: 2024.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Hiện trường, công trường, ngoài trời — luật khớp: WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Vận hành thiết bị chế biến dầu khí, Công nghệ kỹ thuật hóa học.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Nhân viên kiểm tra chất lượng sản xuất (QC) (`ONET-51-9061.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 51-9061.00, không gộp.
- **Mã nghề Việt Nam:** 7543 Thợ phân loại và kiểm tra sản phẩm (trừ thực phẩm và đồ uống) — giữ đề xuất tự động; mã ISCO 7543 chiếm 93% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (219 tin có lương): 10,0tr–14,0tr, giữa 12,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 335 tin trong VietJobs (98.6/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Kiểm nghiệm chất lượng lương thực, thực phẩm, Công nghệ kỹ thuật đo lường.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên sản xuất bán dẫn (`ONET-51-9141.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** chỉ một mã 51-9141.00, không gộp.
- **Mã nghề Việt Nam:** 3114 Kỹ thuật viên kỹ thuật điện tử — sửa tay: ISCO 8212 không có ở Việt Nam; 3114 có cấp 5 'Kỹ thuật viên bán dẫn'; độ tin cậy cao.
- **Lương:** VietJobs: 3 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–30,0tr — Sài Gòn Giải Phóng, dẫn khảo sát Hội Vi mạch bán dẫn TP.HCM, 2024-07-31; loại survey, chất lượng **tốt**; năm số liệu: 2024.
- **Nhu cầu tuyển:** 5 tin trong VietJobs (1.5/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Công nghệ bán dẫn; cao đẳng, trung cấp: Công nghệ sản xuất chip bán dẫn, Kiểm thử và đóng gói vi mạch.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Thợ kim hoàn (`ONET-51-9071.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-9071.00 và 1 mã gộp vào (Thợ chế tác đá quý, kim cương). Lý do gộp: Chế tác đá quý là một chuyên ngành kim hoàn (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 7313 Thợ kim hoàn — giữ đề xuất tự động; mã ISCO 7313 chiếm 82% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 14 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng trung bình nhóm nghề (trung bình 8,2tr) vì số chưa xác nhận (Tin 123job, Joboko, DOJI: học việc 6–9tr, lành nghề 10–15tr, kinh nghiệm 15–20tr); năm số liệu: 2024.
- **Nhu cầu tuyển:** 16 tin trong VietJobs (4.7/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi, Văn phòng — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Thủ công mỹ nghệ; ghi chú: Phần lớn học nghề tại tiệm kim hoàn.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Kỹ thuật viên phục hình, chỉnh hình (`ONET-51-9081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-9081.00 và 2 mã gộp vào (Kỹ thuật viên chế tạo dụng cụ chỉnh hình y tế; Kỹ thuật viên mài lắp tròng kính). Lý do gộp: Làm răng giả, dụng cụ chỉnh hình và tròng kính cùng trải nghiệm chế tác dụng cụ y tế theo đơn (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 3214 Kỹ thuật viên lắp răng giả và chỉnh hình — giữ đề xuất tự động; mã ISCO 3214 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 4 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 12,0tr–20,0tr — CareerViet, "Nha khoa", 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 6 tin trong VietJobs (1.8/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật phục hình răng; cao đẳng, trung cấp: Kỹ thuật phục hình răng.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân vận hành máy sản xuất (`ONET-51-9111.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 51-9111.00 và 15 mã gộp vào (Công nhân vận hành máy nghiền, xay, đánh bóng; Công nhân mài, đánh bóng thủ công; Công nhân vận hành máy trộn, phối liệu; Công nhân cắt, tỉa thủ công; Công nhân vận hành máy cắt, thái; Công nhân vận hành máy đùn, ép, nén; Công nhân vận hành lò nung, lò sấy, nồi nấu; Công nhân sơn, phủ, trang trí sản phẩm; Công nhân vận hành máy sơn, phủ, phun; Công nhân vận hành máy dán keo; Công nhân vận hành thiết bị làm sạch, tẩy rửa kim loại; Thợ khắc, chạm; Thợ đúc, tạo hình sản phẩm phi kim; Công nhân vận hành máy sản xuất sản phẩm giấy; Công nhân sản xuất lốp xe). Lý do gộp: Đóng gói, nghiền, trộn, cắt, ép, sấy, sơn phủ, dán, khắc, đúc và làm giấy, lốp cùng trải nghiệm đứng máy trên dây chuyền; khác loại máy và sản phẩm (decisions/onet_merge/51.json).
- **Mã nghề Việt Nam:** 8183 Thợ vận hành thiết bị đóng gói, đóng chai và dán nhãn — giữ đề xuất tự động; mã ISCO 8183 chiếm 62% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (149 tin có lương): 9,0tr–12,5tr, giữa 11,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 201 tin trong VietJobs (59.2/10.000 tin), mức cao; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Nhà máy, xưởng, kho bãi — luật khớp: WS_FACTORY (nhóm 49, 51; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Không đòi bằng cấp; đào tạo tại nhà máy.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Lên quản lý (1).
- **Phần nháp cần đọc kỹ:** overview.

## Vận tải và bốc dỡ hàng hoá (11 nghề)

### Phi công (`ONET-53-2011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-2011.00 và 1 mã gộp vào (Phi công thương mại). Lý do gộp: Phi công hãng và phi công thương mại khác loại máy bay, cùng trải nghiệm (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 3153 Phi công phương tiện bay và kỹ thuật viên hỗ trợ liên quan — giữ đề xuất tự động; mã ISCO 3153 chiếm 90% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 208,0tr–468,0tr — CafeF, dẫn Aviation A2Z, 2026-10-02; loại news, chất lượng **vừa**. Chỉ số của cơ trưởng; hãng chưa xác nhận; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật hàng không; giấy phép: Giấy phép lái tàu bay do Cục Hàng không Việt Nam cấp; ghi chú: Học tại trường đào tạo phi công (thường do hãng bay tuyển và tài trợ).
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Kiểm soát viên không lưu (`ONET-53-2021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-2021.00 và 1 mã gộp vào (Chuyên viên khai thác sân bay). Lý do gộp: Điều hành sân bay là phần việc mặt đất của quản lý bay (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 3154 Kiểm soát viên không lưu — giữ đề xuất tự động; mã ISCO 3154 chiếm 75% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,4tr–25,5tr — WageIndicator Việt Nam, "Kiểm soát viên không lưu", 2026; loại modelled, chất lượng **yếu**. Có thể thấp hơn thực tế; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Văn phòng — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_OFFICE (Work Context cao: sitting; không cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Quản lý hoạt động bay.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Tiếp viên (`ONET-53-2031.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-2031.00 và 2 mã gộp vào (Tổ trưởng tiếp viên; Tiếp viên tàu, xe). Lý do gộp: Tiếp viên tàu, xe là biến thể của tiếp viên; tổ trưởng là cấp cao (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 5111 Tiếp viên trên tàu hoặc máy bay — giữ đề xuất tự động; mã ISCO 5111 chiếm 100% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 15,0tr–80,0tr — CareerLink, "Mức lương tiếp viên hàng không", 2026-03-20; loại career_guide, chất lượng **vừa**. Tổng thu nhập; lương cứng 8–40tr; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 0 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Dịch vụ thương mại hàng không; ghi chú: Hãng bay tuyển và đào tạo; yêu cầu ngoại hình, tiếng Anh.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Tài xế xe tải (`ONET-53-3032.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-3032.00 và 3 mã gộp vào (Tài xế xe tải nhẹ; Tài xế giao hàng kiêm bán hàng; Đội trưởng lái xe và vận hành máy bốc xếp). Lý do gộp: Xe tải nhẹ, xe giao hàng kèm bán là biến thể; đội trưởng là cấp cao (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 8332 Lái xe tải hạng vừa và xe tải hạng nặng — giữ đề xuất tự động; mã ISCO 8332 chiếm 45% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 16 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 10,0tr–25,0tr — CareerViet, "Tài xế", 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** 18 tin trong VietJobs (5.3/10.000 tin), mức thấp; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** giấy phép: Giấy phép lái xe hạng C1, C hoặc CE; ghi chú: Không đòi bằng cấp; cần giấy phép lái xe phù hợp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Tài xế xe khách, xe buýt (`ONET-53-3052.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-3052.00 và 3 mã gộp vào (Tài xế xe đưa đón học sinh; Tài xế xe đưa đón, tài xế riêng; Tài xế xe cứu thương). Lý do gộp: Cùng trải nghiệm chở người theo lộ trình; xe đưa đón, xe cứu thương là biến thể (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 8331 Lái xe buýt và xe điện — giữ đề xuất tự động; mã ISCO 8331 chiếm 80% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 3 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 12,0tr–18,0tr — CareerViet, "Tài xế", 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 3 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** giấy phép: Giấy phép lái xe hạng D1, D2 hoặc D; ghi chú: Không đòi bằng cấp; cần giấy phép lái xe phù hợp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (1 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Lái tàu hoả, tàu điện (`ONET-53-4011.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-4011.00 và 4 mã gộp vào (Lái tàu dồn trong ga; Nhân viên gác ghi, tín hiệu và phanh đường sắt; Trưởng tàu, trực ban ga; Lái tàu điện ngầm, tàu điện). Lý do gộp: Dồn tàu, gác ghi, trưởng tàu và lái tàu điện ngầm đều thuộc ngành vận hành đường sắt (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 8311 Lái các phương tiện vận chuyển trên đường ray — sửa tay: Đề xuất 8312 là nhân viên tín hiệu, bẻ ghi; 8311 là lái phương tiện trên đường ray; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 13,0tr–15,0tr — Sài Gòn Giải Phóng, đợt tuyển lái tàu Metro Hà Nội, 2022-02-14; loại news, chất lượng **yếu**. Chưa gồm ăn trưa và thưởng; năm số liệu: 2022.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Lái tàu diesel đường sắt, Lái tàu đường sắt đô thị.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Thuyền viên, sĩ quan hàng hải (`ONET-53-5021.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-5021.00 và 3 mã gộp vào (Thuỷ thủ, thợ máy tàu; Người lái ca nô, xuồng máy; Sĩ quan máy tàu biển). Lý do gộp: Thuỷ thủ, lái ca nô và máy trưởng là các chức danh trên cùng một con tàu (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 3152 Hoa tiêu và nhân viên văn phòng trên tàu — giữ đề xuất tự động; mã ISCO 3152 chiếm 75% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** VietJobs: 1 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 7,0tr–50,0tr — CareerViet, "Thuyền viên", 2026; loại career_guide, chất lượng **vừa**; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Khoa học hàng hải; cao đẳng, trung cấp: Điều khiển tàu biển, Khai thác máy tàu biển; giấy phép: Giấy chứng nhận khả năng chuyên môn thuyền viên.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (2 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Người vận hành xe nâng, cần cẩu (`ONET-53-7051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-7051.00 và 6 mã gộp vào (Người vận hành cần cẩu, cẩu tháp; Người vận hành tàu cuốc, máy nạo vét; Người vận hành tời, palăng; Người vận hành băng tải; Tổ trưởng bốc xếp hàng hoá hàng không; Công nhân nạp hàng lên toa, xe bồn và tàu). Lý do gộp: Cùng trải nghiệm vận hành máy nâng hạ, bốc xếp hàng hoá; khác loại máy (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 8344 Thợ vận hành xe bốc dỡ — sửa tay: Đề xuất 8332 là lái xe tải; 8344 là vận hành xe bốc dỡ (cần trục là 8343); độ tin cậy vừa.
- **Lương:** VietJobs: 11 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 8,0tr–11,0tr, trung bình 9,5tr — JobsGO, tra cứu lương "Lái Xe Nâng", 2026; loại job_ads, chất lượng **vừa**. Chưa có số riêng cho lái cần cẩu. 36 mẫu lương trong 12 tháng gần nhất, khoảng phổ biến 8–11tr. Đọc trên Chrome ngày 21/10/2026; năm số liệu: 2026.
- **Nhu cầu tuyển:** 22 tin trong VietJobs (6.5/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** cao đẳng, trung cấp: Vận hành cần, cầu trục, Xếp dỡ cơ giới tổng hợp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Chuyên sâu, cần học thêm (1) → Cấp cao (1).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân bốc xếp, đóng gói (`ONET-53-7062.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-7062.00 và 8 mã gộp vào (Công nhân đóng gói thủ công; Nhân viên xếp hàng lên kệ, soạn đơn; Công nhân cấp liệu và nhận sản phẩm ở máy; Nhân viên rửa xe và thiết bị; Tổ trưởng bốc xếp; Nhân viên trông giữ xe; Nhân viên cây xăng, dịch vụ xe; Nhân viên phục vụ mặt đất cho tàu bay). Lý do gộp: Cùng trải nghiệm lao động phổ thông trong kho bãi và dịch vụ phương tiện; tổ trưởng là cấp cao (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 9333 Người mang vác hàng — giữ đề xuất tự động; mã ISCO 9333 chiếm 86% liên kết ESCO của mã O\*NET chính; độ tin cậy cao.
- **Lương:** dùng lương rao VietJobs (29 tin có lương): 7,2tr–9,2tr, giữa 8,0tr; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Nhu cầu tuyển:** 36 tin trong VietJobs (10.6/10.000 tin), mức vừa; năm số liệu: trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin).
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Không đòi bằng cấp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** Nghề chính (1) → Cấp cao (1); bỏ bước "dễ vào hơn" (3 mã).
- **Phần nháp cần đọc kỹ:** overview.

### Công nhân thu gom, xử lý rác và chất thải (`ONET-53-7081.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-7081.00 và 1 mã gộp vào (Công nhân xử lý vật liệu nguy hại). Lý do gộp: Xử lý vật liệu nguy hại là một mảng của xử lý chất thải (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 9611 Người thu gom rác và tái chế — giữ đề xuất tự động; mã ISCO 9611 chiếm 40% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: trung bình 9,9tr — Cục Thống kê, quý I/2025, qua VnEconomy, 2025-04-08; loại statistics, chất lượng **yếu**. Số của cả ngành cấp nước, xử lý rác thải; năm số liệu: 2025.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** ghi chú: Không đòi bằng cấp.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình.
- **Phần nháp cần đọc kỹ:** overview.

### Đăng kiểm viên, thanh tra giao thông (`ONET-53-6051.00`)

- [ ] Đã duyệt
- **Gộp O\*NET:** mã chính 53-6051.00 và 4 mã gộp vào (Thanh tra hàng không; Đăng kiểm viên phương tiện, thiết bị vận tải; Kỹ thuật viên giao thông; Nhân viên vận hành cầu cất, âu thuyền). Lý do gộp: Cùng trải nghiệm kiểm tra an toàn phương tiện và hạ tầng giao thông (decisions/onet_merge/53.json).
- **Mã nghề Việt Nam:** 3359 Nhân viên điều tiết của Chính phủ khác chưa được phân vào đâu — giữ đề xuất tự động; mã ISCO 3359 chiếm 43% liên kết ESCO của mã O\*NET chính; độ tin cậy vừa.
- **Lương:** VietJobs: 0 tin có lương, cần từ 20 tin, không dùng; không thuộc thang lương nhà nước trong public_pay.json; dùng lương tham khảo: 5,3tr–20,2tr — Thông tư 45/2022/TT-BGTVT × lương cơ sở 2,53tr, 2026; loại official_scale, chất lượng **tốt**. Đơn vị đăng kiểm công lập; năm số liệu: 2026.
- **Nhu cầu tuyển:** **bỏ**, chỉ 1 tin (cần từ 5); bộ dữ liệu không phủ ngành này.
- **Việc hằng ngày:** O*NET 31.0, dịch nháp.
- **Nơi làm việc:** Trên xe, tàu, máy bay, Hiện trường, công trường, ngoài trời — luật khớp: WS_VEHICLE (nhóm 53; Work Context cao: vehicle); WS_FIELD (Work Context cao: outdoors).
- **Ngành học (nhóm tự gán, decisions/education_map.json):** đại học: Kỹ thuật ô tô, Kỹ thuật cơ khí động lực; cao đẳng, trung cấp: Công nghệ kỹ thuật ô tô.
- **Lộ trình (suy từ quyết định gộp và Job Zone):** chỉ có nghề chính, không hiện lộ trình; bỏ bước "dễ vào hơn" (4 mã).
- **Phần nháp cần đọc kỹ:** overview.

