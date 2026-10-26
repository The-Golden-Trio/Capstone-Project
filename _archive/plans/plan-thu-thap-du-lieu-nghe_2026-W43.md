# Plan thu thập dữ liệu nghề còn thiếu · tuần 43

> Soạn 20/10/2026. File này chỉ là plan, chưa thu thập gì.
> Phạm vi: mọi field của hồ sơ nghề mà người chơi cần đọc trên trang hồ sơ, cho 22 nghề IT (`datasets/final_22_roles.json`) và 199 nghề ngoài IT (`generated/onet_all_roles.json`).
> **Không làm:** sự kiện role-play cho 199 nghề ngoài IT.

## 1. Hiện trạng sau tuần này

Tuần này đã sinh thêm từ O\*NET, không cần thu thập: môi trường làm việc (`work_environment_onet`), câu "hợp với ai" (`fit_summary`), mức chuẩn bị (`job_zone`), kỹ năng và kiến thức. Nghề ngoài IT có thêm lộ trình nháp (`career_path`). Phần của 22 nghề IT nằm riêng ở `generated/onet_it_extras.json`, chưa gộp vào `final_22_roles.json`.

| Field | 22 nghề IT | 199 nghề ngoài IT |
|---|---|---|
| Mô tả, mặt trái | 22/22, nháp | 199/199, dịch nháp |
| Việc làm hằng ngày | Task theo cấp: 8/22 | 5 task O\*NET: 199/199, dịch nháp |
| Cấp bậc | 22/22 (band, tên cấp, số năm) | Không có; thay bằng `job_zone` |
| Lương Việt Nam | 22/22 (lương chung toàn ngành theo band) | **0/199** |
| Nhu cầu tuyển | 22/22, trong đó 11 độ tin cậy thấp | **0/199** |
| Lộ trình học | 8/22 | **0/199**; chỉ có mô tả mức chuẩn bị của O\*NET (Mỹ) |
| Môi trường làm việc | 8/22 có mã; 22/22 có câu O\*NET | 199/199 câu O\*NET, chưa có mã |
| Thăng tiến | 13/22 | 149/199 có hơn một bước, nháp |
| Lý do nghỉ việc | 14/22 | Không có |
| Hợp với ai, kỹ năng, kiến thức | 22/22 (O\*NET) | 199/199 (O\*NET) |

Mọi số liệu O\*NET là của thị trường Mỹ. Ba lỗ lớn nhất của nghề ngoài IT đều là dữ liệu Việt Nam: lương, nhu cầu tuyển, đường học.

## 2. Việc cần làm

Mỗi việc ghi: lấy từ đâu, làm thế nào, ghi vào đâu, xong khi nào. Nguồn có dấu *(cần kiểm)* là mình biết có tồn tại nhưng chưa mở ra xem nội dung và điều khoản.

### A. Gộp phần O\*NET vào 22 nghề IT (không cần thu thập)

- **Làm:** script gộp `generated/onet_it_extras.json` vào `final_22_roles.json`: `work_environment_onet`, `fit_summary`, `job_zone`; `skills_status.knowledge_top`; `hard_skills_top` chỉ cho 7 nghề đang thiếu.
- **Lưu ý:** Back-end và Mobile ra cùng một kết quả vì chung mã 15-1252.00. Cần một người viết tay lại câu môi trường và câu "hợp với ai" cho Mobile, hoặc ẩn hai field này ở Mobile.
- **Xong khi:** 22/22 nghề có đủ ba field; `node docs/data/build.mjs` chạy không lỗi.

### B. Nghề IT: lấp năm chỗ trống

| Việc | Nghề thiếu | Nguồn | Cách làm |
|---|---|---|---|
| B1. Task theo cấp | 14 nghề: CLOUD_ENG, DATA_AI, DATA_DE, INFRA_ERP, INFRA_NETWORK, PROD_PM, SEC_ENG, SEC_PENTEST, SWE_ARCH_SOL, SWE_EM, SWE_EMBEDDED, SWE_GAME, SWE_TECHLEAD, SWE_UIUX | JD trên ITviec, TopDev, như cách đã làm cho 8 nghề | 15–20 JD mỗi nghề, chia theo band, rút 3–5 task mỗi cấp; ghi nguồn từng JD |
| B2. Lộ trình học | 14 nghề: SWE_GAME, SWE_UIUX, SWE_EMBEDDED, SWE_ARCH_SOL, SWE_TECHLEAD, SWE_EM, DATA_AI, DATA_DE, CLOUD_ENG, SEC_ENG, SEC_PENTEST, PROD_PM, INFRA_ERP, INFRA_NETWORK | Cùng bộ JD ở B1 (dòng yêu cầu bằng cấp); danh mục `education_path_ids` có sẵn | Đếm JD đòi bằng gì, gán `education_path_primary` |
| B3. Thăng tiến | 9 nghề: SWE_GAME, SWE_EMBEDDED, SWE_EM, QA_MANUAL, DATA_AI, CLOUD_ENG, SEC_PENTEST, PROD_PM, INFRA_ERP | JD cấp cao (dòng "đã từng làm…"); `78_to_22_roles.csv` | Ghi `progresses_to` bằng `role_code` trong 22 nghề |
| B4. Lý do nghỉ việc | 8 nghề: SWE_UIUX, SWE_EMBEDDED, DATA_AI, CLOUD_DEVOPS, CLOUD_ENG, SEC_ENG, SEC_PENTEST, INFRA_NETWORK | Cùng nguồn khảo sát của 14 nghề đã có | Nếu nguồn không tách được nghề, ghi `gap_note` và dùng lý do của nhóm |
| B5. Nhu cầu tuyển | 11 nghề có `confidence: low` | Đếm tin trên ITviec và TopDev cùng ngày | Đếm cả hai trang để có hai con số; đổi `confidence` khi hai số khớp nhau |

- **Xong khi:** mỗi nghề có đủ năm field, mỗi giá trị có `evidence_level` và nguồn.

### C. Nghề ngoài IT: dữ liệu Việt Nam

**C0. Nối mã O\*NET với mã nghề Việt Nam (làm trước tiên).** *Xong 20/10: `decisions/onet_to_vsco.csv`, 221/221 nghề có mã; xem `JSON_SCHEMA.md` §12.3.* Lương và thống kê lao động Việt Nam xếp theo danh mục nghề VSCO 2020, dựng trên ISCO-08 của ILO. Cần một bảng `onet_code → isco08 → vsco` cho 199 nghề.
- Nguồn: bảng nối SOC ↔ ISCO-08 của BLS *(cần kiểm: có bản cho SOC 2018 không)*; bảng nối O\*NET ↔ ESCO, rồi ESCO → ISCO-08 *(cần kiểm)*; danh mục VSCO 2020 kèm Quyết định 34/2020/QĐ-TTg *(cần kiểm)*.
- Ra file `decisions/onet_to_vsco.csv`. Nghề nối được nhiều mã thì ghi mã chính và lý do.
- Phải xin phép trước khi tải từng file.

**C1. Lương.** Chưa có nguồn nào phủ cả 199 nghề, nên dùng theo bậc, ghi rõ bậc vào `compensation._status`:

| Bậc | Nguồn | Phủ được | Độ chi tiết |
|---|---|---|---|
| 1 | Báo cáo điều tra lao động việc làm của Tổng cục Thống kê *(cần kiểm: bảng thu nhập theo nghề)* | Mọi nghề, qua C0 | Chỉ tới nhóm nghề cấp 1–2 |
| 2 | Báo cáo lương của các công ty tuyển dụng (Navigos, Talentnet, Adecco…) *(cần kiểm)* | Văn phòng, quản lý, kỹ sư | Theo vị trí và cấp |
| 3 | Khoảng lương ghi trên tin tuyển dụng (VietnamWorks, TopCV, CareerViet…) | Nghề có nhiều tin | Theo tin; cần đủ số tin mới tính |

- Quy tắc đề xuất: một nghề cần **ít nhất 20 tin** có ghi lương mới dùng bậc 3; ít hơn thì lùi về bậc 2 hoặc 1 và ghi rõ là lương của nhóm nghề.
- Trước khi đếm tin phải đọc điều khoản của từng trang. Đếm tay hoặc dùng bộ lọc có sẵn của trang; không viết script cào nếu điều khoản cấm.
- Ra `compensation.vn_monthly_vnd: {p25, median, p75, n, source, measured_at}`.

**C2. Nhu cầu tuyển.** Dùng lại cách của IT (đếm tin đang mở cùng một ngày), đổi sang trang tuyển dụng đa ngành. 199 nghề mà đếm tay thì quá nhiều; đề xuất đếm đủ 199 nghề nhưng chỉ ở **một trang**, rồi kiểm chéo ở trang thứ hai cho 30 nghề có số tin lớn nhất. Nghề không có tin vẫn ghi 0, kèm từ khoá đã tìm.

**C3. Đường học ở Việt Nam.** Gán mỗi nghề với ngành đào tạo theo danh mục ngành của Bộ Giáo dục và Đào tạo (đại học) và Bộ Lao động (giáo dục nghề nghiệp) *(cần kiểm số hiệu văn bản hiện hành)*. Ra `education_path_vn: {level, majors[], note}`. Nghề cần chứng chỉ hành nghề (bác sĩ, luật sư, kế toán viên, kiến trúc sư…) ghi thêm tên chứng chỉ.

**C4. Môi trường làm việc có mã.** `datasets/work_environments.json` mới có 6 môi trường của IT. Đề xuất thêm khoảng 6 môi trường dùng được cho mọi ngành (văn phòng; hiện trường, công trường; nhà máy, xưởng; bệnh viện, phòng khám; cửa hàng, nhà hàng; trên đường, trên xe), rồi gán tự động từ `work_environment_onet.facts_basis` và sửa tay chỗ sai.

**C5. Cấp bậc.** O\*NET không có thang cấp trong nghề. Đề xuất không dựng L1–L10 cho 199 nghề; dùng `career_path` đã có, chỉ sửa tay tên gọi cấp cho 30 nghề hay được gợi ý nhất (xem D).

**C6. Lý do nghỉ việc.** Chưa có nguồn theo nghề. Để trống, chỉ hiện mặt trái. Không thu thập trong đợt này.

### D. Duyệt phần nháp

Toàn bộ chữ của 199 nghề và các câu O\*NET mới đều đang ở trạng thái `NHAP_CHO_DUYET`.

- **Thứ tự duyệt:** chạy module gợi ý với một nhóm hồ sơ RIASEC mẫu, lấy **30 nghề hay được gợi ý nhất**; duyệt 30 nghề này trước, phần còn lại sau.
- **Mỗi nghề kiểm:** tên tiếng Việt có đúng tên người Việt hay dùng không; mô tả có điều gì chỉ đúng ở Mỹ không (luật, bằng cấp, bảo hiểm); mặt trái có đúng với Việt Nam không; lộ trình có bước nào vô lý không (ví dụ "Phụ mổ" ở bước dễ vào hơn của Điều dưỡng).
- **Ai duyệt:** thành viên nhóm cho nghề phổ thông; với y tế, luật, giáo dục, xin một người làm nghề đọc giúp 10 phút mỗi nhóm.
- Duyệt xong đổi `status` thành `DA_DUYET`, ghi người duyệt và ngày.

### E. Đưa lên giao diện

Phần lớn field mới chưa được app đọc. Việc này đã có thẻ đề xuất riêng (nối mô tả và cấp bậc vào app). Bổ sung vào thẻ đó: trang hồ sơ nghề cần hiện `fit_summary`, `work_environment_onet.facts`, `job_zone`, `career_path`, và nhãn "Nháp, số liệu của Mỹ" khi `status` chưa là `DA_DUYET`.

## 3. Thứ tự và ước lượng

| Tuần | Việc | Ước lượng |
|---|---|---|
| 43 | A; C0; chốt danh sách nguồn C1–C3 sau khi đọc điều khoản | 1–2 buổi |
| 43–44 | B1, B2, B3 (cùng một bộ JD) | 3–4 buổi |
| 44 | C1 bậc 1 cho cả 199 nghề; C2 một trang | 3 buổi |
| 44–45 | C3; C4; D cho 30 nghề đầu | 3–4 buổi |
| 45 | C1 bậc 2–3 cho 30 nghề đầu; B4, B5; E | 3 buổi |

## 4. Cần chốt trước khi làm

1. Có chấp nhận lương theo nhóm nghề (bậc 1) cho phần lớn 199 nghề không, hay chỉ hiện lương ở nghề có số riêng?
2. Đếm tin tuyển dụng tay hay viết script? Viết script chỉ khi điều khoản của trang cho phép.
3. Mobile: viết tay câu môi trường và câu "hợp với ai", hay ẩn đi?
4. Ai duyệt nhóm y tế, luật, giáo dục?
5. Có cần dựng L1–L10 cho nghề ngoài IT không, hay `career_path` là đủ cho trang hồ sơ?
