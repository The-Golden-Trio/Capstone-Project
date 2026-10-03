# BÁO CÁO NGHIỆM THU: DATASET "OCCUPATION PROFILE" NGÀNH IT VIỆT NAM

**Dự án:** Capstone - IT Career Pathway & Occupation Profile
**File đính kèm:** `occupation-data_2.zip` (Chứa toàn bộ dữ liệu JSON/CSV)

---

## 1. Tìm full các role trong mảng IT (Taxonomy & Archetype)
- **Kết quả:** Quy hoạch thành công **78 chức danh (roles)** thuộc 6 nhóm (Software, Data, Cloud, Security, Product, Executive).
- **Phân loại (Archetype):** 
  - **A (Trọn vẹn):** Có cửa vào Fresher (VD: `SWE_BACKEND`, `PROD_BA`).
  - **B (Chuyển ngang):** Bắt buộc có kinh nghiệm role khác (VD: `CLOUD_DEVOPS`).
  - **C (Đích đến):** Quản lý/Kiến trúc sư cấp cao (VD: `CLOUD_ARCH`).
  - **D (Lai):** Fresher hiếm, chủ yếu là điểm đến chuyển ngang (VD: `PROD_PM`).

## 2. Các level trong role & Job Outlook
- **Leveling:** Áp dụng thang đo toàn cục **L1 (Intern) - L10 (C-level)**.
- **Mapping:** Xác định rõ dải level cho từng role (VD: `QA_MANUAL` chạm trần ở L5, `SWE_BACKEND` lên tới L7).
- **Job Outlook:** Đã map field dữ liệu cào từ ITviec (`job_outlook.itviec_open_postings`) để phản ánh độ hot của role.

## 3. Công việc (Tasks), Kỹ năng (Skills) & Bằng cấp (Degree)
- **Hoàn thành Pass 2 (Verify):** 9 Role cốt lõi Tier 1 (`SWE_BACKEND`, `DATA_DA`, `SEC_SOC`...) đã đạt chuẩn `A_VERIFIED`.
- **Dữ liệu:** `tasks` và `skills` (Hard/Soft) được trích xuất trực tiếp từ Job Description của VNG, Techcombank, Shopee, KMS...
- **Education Path:** Phân loại 6 lộ trình học vấn (File: `education_paths.json`). 
  - *Ví dụ:* `SWE_BACKEND` (Cần bằng CS), `QA_MANUAL` (Trái ngành/Đào tạo ngắn hạn).

## 4. Các dạng Work Environment
- **Kết quả:** Xây dựng bộ Taxonomy 6 môi trường làm việc đặc thù (File: `work_environments.json`).
- **Ứng dụng:** Mapping môi trường vào từng role. 
  - *Ví dụ:* `WE_ONSITE_ENTERPRISE` (Làm hành chính, quy trình chặt), `WE_SHIFT_24_7` (Trực ca kíp cho SOC/Helpdesk).


## 5. Relationship (Lộ trình thăng tiến)
- **Kết quả:** Xây dựng mạng lưới kết nối giữa 78 roles.
- **Các luồng dịch chuyển:**
  - `feeder_roles`: Vị trí bàn đạp (VD: `INFRA_HELPDESK` -> `SEC_SOC`).
  - `next_steps`: Thăng tiến dọc.
  - `lateral_moves`: Chuyển ngang (VD: `PROD_BA` <-> `PROD_PO`).
  - `often_confused_with`: Phân biệt các chức danh dễ nhầm lẫn.

---

## 📌 DELIVERABLES (CÁC FILE BÀN GIAO MỚI NHẤT)
1. **`dataset_final_merged.json`**: Master Dataset chứa 78 Roles hoàn chỉnh.
2. **`9_roles_tier1_pass2.json`**: File review nhanh 9 roles Tier 1 đã Verify bằng JD thật.
3. **`work_environments.json`** & **`education_paths.json`**: Taxonomy môi trường & giáo dục.
