# Plan hồ sơ nghề chuẩn và thu thập dữ liệu Việt Nam · tuần 43

> Soạn 21/10/2026. File này chỉ là plan, chưa sửa data. Nối tiếp `plan-thu-thap-du-lieu-nghe_2026-W43.md` (việc A và C0 đã xong).
> Yêu cầu: (1) gộp kỹ năng và mọi thứ gắn với nghề vào **một khuôn hồ sơ chuẩn**, không để file hay field phụ; (2) bỏ phần kém tin cậy; (3) tìm thêm nguồn cho chỉ số còn thiếu, cái nào không tìm được thì báo để quyết gộp hay bỏ.
> Không làm: sự kiện role-play cho 199 nghề ngoài IT.

## 1. Khuôn hồ sơ chuẩn

### 1.1. Vấn đề hiện tại

Một thông tin nằm ở nhiều chỗ, mỗi bộ nghề một kiểu:

- Kỹ năng IT ở `skills_status.hard_skills_languages`, `hard_skills_frameworks` (ITviec), `onet_skills_top`, `knowledge_top` (O\*NET). Kỹ năng ngoài IT ở `skills_status.hard_skills_top`.
- Cấp bậc IT ở `levels[]`; ngoài IT ở `career_path.steps[]`. Lương IT ở `compensation.by_band`, ngoài IT chưa có.
- Phần O\*NET của IT nằm ở cả `generated/onet_it_extras.json` lẫn `final_22_roles.json`.

### 1.2. Đề xuất

Một file `generated/occupation_profiles.json` cho **cả 221 nghề**, cùng một khuôn, do một script dựng từ các nguồn. `final_22_roles.json` vẫn là dữ liệu gốc của game (sự kiện, band, archetype), app không phải đổi ngay.

```jsonc
{
  "role_code": "SWE_BACKEND",            // IT giữ mã cũ; ngoài IT là ONET-xx-xxxx.xx
  "role_name_vn": "string", "role_name": "string",
  "role_group_vn": "string", "is_it": true,
  "codes": { "onet": ["15-1252.00"], "vsco": { "code": "2512", "name": "string" } },

  "overview":   { "summary": "string", "fit_summary": "string", "downsides": ["string"] },
  "interests":  { "interest_code": "ICR", "riasec": { "Realistic": 0 } },
  "daily_work": { "tasks": [ { "text": "string", "level": "L3 | null" } ] },
  "skills": {                            // Một chỗ duy nhất cho kỹ năng
    "hard":      [ { "name_vn": "Lập trình", "name": "Programming", "source": "onet", "score": 4.1 } ],
    "tools":     [ { "name": "Java", "source": "itviec", "rank": 1 } ],     // Ngôn ngữ, framework, phần mềm
    "knowledge": [ { "name_vn": "string", "name": "string", "source": "onet", "score": 4.6 } ],
    "soft":      { "giao_tiep_hop_tac": 0.4 }
  },
  "work_environment": { "settings": ["WE_OFFICE"], "facts": ["string"] },
  "education": {
    "preparation": { "zone": 4, "label_vn": "string" },                     // Job Zone
    "majors_vn":   [ { "code": "7480201", "name": "Công nghệ thông tin", "level": "dai_hoc" } ],
    "licence":     { "name": "string", "law": "string" } | null
  },
  "career": {
    "levels":   [ { "band": "L3", "title_vn": "string", "years": "string" } ],  // Chỉ nghề có thang cấp
    "path":     [ { "stage": "string", "roles": ["role_code"] } ],
    "progresses_to": ["role_code"], "similar": [ { "role_code": "string", "why": "string" } ]
  },
  "pay": {
    "monthly_vnd": { "low": 0, "median": 0, "high": 0 },
    "basis": "itviec | job_postings | public_scale | group_average",
    "n": 0, "by_level": [ { "band": "L3", "median": 0 } ]
  },
  "outlook":   { "...": "xem mục 3.2, chờ quyết" },
  "work_life": { "reasons_to_leave": ["string"] },
  "sources":   { "pay": { "evidence": "A | B", "source": "string", "measured_at": "2026-10" } }
}
```

- Mỗi mục có nguồn và mức chứng cứ trong `sources`. A: số liệu Việt Nam đã kiểm hoặc văn bản chính thức. B: O\*NET (Mỹ) hoặc số Việt Nam của nhóm nghề rộng hơn.
- Mục rỗng thì **không có trong hồ sơ** (không để `null` kèm ghi chú dài như bây giờ), để app chỉ cần kiểm "có hay không".
- `generated/onet_it_extras.json` và các field `onet_skills_top`, `knowledge_top`, `work_environment_onet`, `fit_summary`, `job_zone` vừa gộp vào `final_22_roles.json` hôm qua sẽ bị bỏ, vì đã nằm trong hồ sơ chuẩn. Xoá file cần bạn đồng ý.

### 1.3. Luật bỏ phần kém tin cậy

Tách hai loại:

- **Nháp chờ duyệt** (bản dịch, mô tả do nhóm viết): **giữ**, gắn nhãn nháp. Nếu bỏ thì 199 nghề không còn mô tả.
- **Kém tin cậy** (căn cứ yếu đã biết): **bỏ khỏi hồ sơ**, vẫn lưu ở file gốc để làm lại sau.

| Mục bị bỏ | Số nghề | Vì sao |
|---|---|---|
| Mã nghề Việt Nam độ tin cậy `thap` | 4 (Quản lý sản phẩm, Quản lý giáo dục, Quản lý y tế, Chuyên viên tuân thủ) | Danh mục không có mã cho nghề này |
| Nhu cầu tuyển `confidence: low` | 11 nghề IT | Một nguồn, số nhỏ; đếm lại thì đưa vào |
| Câu môi trường và câu "hợp với ai" của Mobile | 1 | Chép nguyên từ Back-end |
| Bước "Vị trí gần, dễ vào hơn" của lộ trình | 80 | Chỉ suy từ Job Zone, không có nghĩa là bước vào nghề |
| Lương nghề có dưới 20 tin tuyển dụng | Chưa biết | Mẫu quá nhỏ; lùi về lương nhóm nghề nếu bạn chọn vậy (mục 3) |
| Kỹ năng ITviec của nghề báo cáo không có | 7 nghề IT | Hiện đã rỗng; chỉ còn kỹ năng O\*NET |

## 2. Nguồn cho chỉ số còn thiếu

Kết quả tìm ngày 21/10/2026. "Đã mở" là có người đọc trang gốc; "chỉ thấy tin" là mới thấy qua kết quả tìm kiếm hoặc báo.

### 2.1. Lương: tìm được, theo ba lớp

| Lớp | Nguồn | Phủ | Ghi chú |
|---|---|---|---|
| 1. Thang lương nhà nước | Lương cơ sở **2.530.000 đ** từ 01/7/2026 (Nghị định 161/2026/NĐ-CP, đã mở trên chinhphu.vn) × hệ số theo Nghị định 204/2004 | Giáo viên, bác sĩ, điều dưỡng, công chức, công an, quân đội | Hạng chức danh của từng nghề (bác sĩ hạng III = A1…) mới thấy trên báo, phải đối chiếu thông tư của Bộ Y tế, Bộ Giáo dục. Lương giáo viên theo Luật Nhà giáo 2025 vẫn đang dự thảo |
| 2. Tin tuyển dụng | Bộ dữ liệu **VietJobs** (HuggingFace `dinhieufam/VietJobs`, 48.100 tin, có lương min/max) | Nghề tư nhân có nhiều tin: kinh doanh, văn phòng, kỹ sư, thợ, lái xe, F&B | **Giấy phép chưa rõ** (repo code là MIT, trang dữ liệu không ghi). Là lương rao, không phải lương thật |
| 3. Trung bình nhóm nghề | Báo cáo điều tra lao động việc làm 2024, Cục Thống kê (đã mở): biểu 3.5 lương bình quân theo 9 nhóm nghề cấp 1, biểu 3.4 theo 21 ngành | Mọi nghề, qua mã Việt Nam | Thô: ví dụ mọi nghề nhóm 2 đều là 12,1 triệu |
| Sàn | Lương tối thiểu vùng 2026 (Nghị định 293/2025/NĐ-CP): vùng I 5,31 triệu | Công nhân, bảo vệ, vệ sinh | Kiểm tra chéo |
| IT | Báo cáo ITviec 2025–2026 (đã có) | 22 nghề IT | Giữ nguyên |

Không dùng được: báo cáo lương của Talentnet-Mercer (trả phí), Michael Page (phải đăng nhập), Adecco (chỉ có trang bìa), TopCV, JobsGO (không truy cập được, chưa đọc được điều khoản).

**Ước lượng phủ:** agent tìm nguồn ước khoảng 120–150/199 nghề có được khoảng lương riêng (lớp 1 hoặc 2). Số này **chưa kiểm**; sẽ đo thật sau khi khớp tên nghề.

**Không có số riêng:** nông dân và lao động tự làm (thống kê chỉ tính người làm công ăn lương), nghệ sĩ, vận động viên, luật sư hay bác sĩ hành nghề tư.

### 2.2. Đường học: tìm được

- Danh mục ngành đại học mới: **Thông tư 74/2026/TT-BGDĐT** (hiệu lực 12/10/2026, thay Thông tư 09/2022). Mới thấy trên một bài báo có link PDF.
- Danh mục ngành nghề giáo dục nghề nghiệp: **Thông tư 77/2026/TT-BGDĐT** (hiệu lực 01/12/2026, thay Thông tư 26/2020). Ba trang báo xác nhận; PDF trên chinhphu.vn chưa đọc được.
- Không có bảng nối chính thức ngành học ↔ nghề ở Việt Nam. Gán tay từng nghề vào 1–3 ngành, dùng bảng nối CIP–SOC của Mỹ để gợi ý.
- Giấy phép hành nghề cho nhóm nghề có quản lý: y (Luật Khám bệnh, chữa bệnh 2023), dược, công chứng, kiểm toán, xây dựng (Luật Xây dựng 2025), lái xe (Luật Trật tự, an toàn giao thông đường bộ 2024), giáo viên (Luật Nhà giáo 2025). Số hiệu luật sư, kế toán mới nhớ, chưa kiểm.

### 2.3. Môi trường làm việc có mã: không cần nguồn mới

Thêm khoảng 6 môi trường chung (văn phòng, hiện trường, nhà máy, cơ sở y tế, cửa hàng–nhà hàng, trên xe), gán tự động từ Work Context của O\*NET, sửa tay chỗ sai.

## 3. Không tìm được nguồn: cần bạn quyết

| # | Chỉ số | Tình trạng | Các lựa chọn | Đề xuất |
|---|---|---|---|---|
| 1 | **Nhu cầu tuyển** từng nghề ngoài IT | Không có số chính thức theo nghề (chỉ có theo ngành, theo 9 nhóm nghề). Trang tuyển dụng có số tin, nhưng CareerViet cấm bot; VietnamWorks, ITviec cấm sao chép nội dung | (a) Bỏ mục này cho nghề ngoài IT; (b) thay bằng **quy mô nhóm nghề** (số người đang làm, theo 9 nhóm, Cục Thống kê); (c) dùng tỉ lệ tin trong VietJobs làm chỉ báo tương đối | (b): có nguồn chính thức, nói rõ là nhóm nghề |
| 2 | **Lương** của nghề không có số riêng | Xem 2.1 | (a) Hiện lương trung bình nhóm nghề, ghi rõ "trung bình nhóm"; (b) ẩn lương ở các nghề này | (a) |
| 3 | **Lý do nghỉ việc** ngoài IT | Không có khảo sát theo nghề | Bỏ; trang hồ sơ chỉ hiện mặt trái | Bỏ |
| 4 | **Thang cấp L1–L10** ngoài IT | Không có nguồn | Bỏ; dùng lộ trình (`career.path`) | Bỏ |
| 5 | **Task theo cấp** cho 14 nghề IT | Phải đọc JD trên ITviec, TopDev; điều khoản ITviec cấm lấy nội dung khi chưa xin phép | (a) Đọc tay, tóm ý, không chép nguyên văn; (b) dùng task O\*NET như nghề ngoài IT | (b) ngay, (a) sau nếu còn thời gian |

## 4. Cần xin phép tải

| File | Nguồn | Dùng cho |
|---|---|---|
| Bộ VietJobs (Parquet/CSV, khoảng 48.100 dòng) | huggingface.co/datasets/dinhieufam/VietJobs | Lương lớp 2, có thể cả chỉ báo nhu cầu. **Nên hỏi tác giả về giấy phép trước** |
| Báo cáo điều tra lao động việc làm 2024 (PDF) | nso.gov.vn | Lương nhóm nghề, quy mô nhóm nghề |
| Thông tư 74/2026/TT-BGDĐT (PDF) | giaoduc.net.vn (link tới bản ký số) | Ngành đại học |
| Thông tư 77/2026/TT-BGDĐT (PDF) | datafiles.chinhphu.vn | Ngành nghề trung cấp, cao đẳng |

## 5. Thứ tự làm

1. Script dựng `generated/occupation_profiles.json` từ dữ liệu đang có, theo khuôn 1.2 và luật 1.3. Cập nhật `JSON_SCHEMA.md`. Chưa có lương, đường học.
2. Lương lớp 1 (thang nhà nước) và lớp 3 (nhóm nghề), vì không phụ thuộc giấy phép.
3. Đường học: gán ngành theo Thông tư 74 và 77, thêm giấy phép hành nghề.
4. Lương lớp 2 (VietJobs), nếu giấy phép ổn.
5. Môi trường làm việc có mã.
6. Báo cáo độ phủ cuối cùng: mỗi mục bao nhiêu nghề có, nghề nào thiếu.

Xong khi: 221 nghề cùng một khuôn; mỗi mục có nguồn và mức chứng cứ; bảng độ phủ cho thấy rõ còn thiếu gì.

## 6. Kết quả ngày 21/10/2026

Đã làm bước 1–6. Hồ sơ chuẩn: `occupation-data/generated/occupation_profiles.json` (221 nghề, khuôn ở `JSON_SCHEMA.md` §13); bảng độ phủ: `occupation-data/generated/occupation_profiles.md`. `final_22_roles.json` đã trả về bản trước khi gộp phần O\*NET hôm 20/10, vì phần đó giờ nằm trong hồ sơ chuẩn.

Nguồn đã dùng: VietJobs (lương rao, số tin); Báo cáo điều tra lao động việc làm 2024 (biểu 2.4, 3.3, 3.4, 3.5); Nghị định 161/2026 (lương cơ sở 2.530.000 đ), Nghị định 293/2025 (lương tối thiểu vùng), Thông tư 31/2026/TT-BGDĐT, 02/2025/TT-BYT, 41/2025/TT-BYT, 02/2021/TT-BNV (hạng chức danh); Thông tư 74/2026 và 77/2026/TT-BGDĐT (ngành học).

| Mục | IT (/22) | Ngoài IT (/199) | Ghi chú |
|---|---|---|---|
| Lương | 22 | 197 | Ngoài IT: 75 lương rao, 17 thang nhà nước, 105 chỉ có trung bình nhóm nghề |
| Nhu cầu tuyển | 11 | 128 | Bỏ 11 nghề IT độ tin cậy thấp và 56 nghề dưới 5 tin |
| Ngành học | 22 | 131 đại học, 151 cao đẳng/trung cấp | 30 nghề có giấy phép hành nghề |
| Nơi làm việc có mã | 22 | 199 | 9 mã trong `datasets/work_settings.json` |
| Việc hằng ngày | 16 | 199 | |
| Lý do nghỉ việc | 14 | 0 | Bỏ cho nghề ngoài IT (đã quyết ở mục 3) |

### Không tìm được, cần quyết gộp hay bỏ

1. **Lương 105 nghề chỉ có trung bình nhóm nghề** (kỹ sư điện tử, ô tô, mỏ; nhà khoa học; luật sư; nghệ sĩ…): rất thô, mọi nghề nhóm 2 đều 12,1 triệu. Báo cáo lương có số riêng (Talentnet-Mercer, Michael Page, Adecco) phải trả phí hoặc đăng nhập.
2. **Lương 2 nghề không có gì** (Quản lý giáo dục, Quản lý y tế): mã nghề Việt Nam độ tin cậy thấp nên không lấy được trung bình nhóm.
3. **Nhu cầu tuyển 11 nghề IT** độ tin cậy thấp: đếm lại tay trên ITviec cần lưu ý điều khoản (cấm lấy nội dung khi chưa xin phép).
4. **Task, câu "hợp với ai", câu môi trường của 6–7 nghề IT dùng chung mã O\*NET** (Game, nhúng, Tech Lead, Cloud, ERP, Network; Mobile chỉ thiếu hai câu): chỉ lấy được bằng cách đọc JD.
5. **Giấy phép hành nghề**: số hiệu Luật Luật sư, Luật Giá, Luật Hàng không dân dụng, Bộ luật Hàng hải chưa đối chiếu văn bản.
6. **Giấy phép dữ liệu VietJobs** chưa rõ: cần hỏi nhóm tác giả trước khi công bố số liệu.

## 7. Kết quả ngày 21/10/2026, đợt hai

| Mục | IT (/22) | Ngoài IT (/199) | Ghi chú |
|---|---|---|---|
| Lương | 22 | 199 | Ngoài IT: 75 lương rao VietJobs, 17 thang nhà nước, **96 lương tham khảo** (3 tốt, 59 vừa, 34 yếu), 11 trung bình nhóm nghề |
| Nhu cầu tuyển | **22** | 127 | IT: đếm lại cả 22 nghề trên ITviec ngày 21/10 |
| Việc hằng ngày | **22** | 199 | 6 nghề IT có task theo cấp tóm từ 79 JD |

**Còn 11 nghề chỉ có trung bình nhóm nghề:**
- 5 nghề có số chưa xác nhận (thiết kế sản phẩm công nghiệp, người mẫu, thợ sửa máy công trình, kỹ thuật viên lắp đặt viễn thông, thợ kim hoàn): Paylab báo lỗi, 123job hết hạn tin, JobsGO không có chức danh khớp đúng. Số và lý do ở `occupation-data/datasets/vn/salary_reference.json` mục `unverified`.
- 6 nghề không tìm được số dùng được: vận động viên, diễn viên múa, thợ làm tóc, thợ làm móng (chỉ có số trước 2022 hoặc số bất thường), dịch vụ tang lễ, vận hành lọc dầu.

**Giấy phép hành nghề:** giữ như hiện tại, không kiểm thêm số hiệu luật, vì với game thì tên giấy phép là đủ.

## 8. Nguồn dữ liệu và bản quyền

Đồ án chưa công bố. Bảng dưới để biết nguồn nào cần xin phép trước khi phát hành công khai.

| Nguồn | Dùng cho | Điều khoản đã thấy | Khi công bố |
|---|---|---|---|
| O\*NET 31.0 (Bộ Lao động Mỹ) | Mô tả, task, kỹ năng, môi trường, RIASEC | CC BY 4.0 | **Không cần xin**; ghi công và nói rõ đã sửa đổi (đã có câu ghi công trong `_meta.attribution`) |
| Bảng nối ESCO–O\*NET (O\*NET Resource Center) | Mã nghề Việt Nam | CC BY 4.0; ESCO của Ủy ban châu Âu cho dùng lại có ghi nguồn | **Không cần xin**; ghi công |
| Văn bản nhà nước: Quyết định 34/2020, Thông tư 74, 77/2026, các nghị định, thông tư về lương, Quyết định 3461 của Sở Xây dựng Hà Nội | Mã nghề, ngành học, thang lương | Văn bản quy phạm pháp luật và văn bản hành chính không thuộc đối tượng bảo hộ quyền tác giả | **Không cần xin** |
| Báo cáo điều tra lao động việc làm 2024 (Cục Thống kê) | Lương và số người theo nhóm nghề | Trang ghi "Bản quyền thuộc Cục Thống kê", yêu cầu ghi nguồn khi dùng | **Không cần xin**; ghi nguồn |
| Báo cáo ITviec 2025–2026 | Lương IT theo cấp, kỹ năng, lý do nghỉ việc | Báo cáo có bản quyền; điều khoản ITviec mục 2.2 cấm lấy, sao chép nội dung khi chưa có đồng ý bằng văn bản | **Cần xin phép ITviec** |
| Số tin đang mở trên ITviec (đếm 21/10) | Nhu cầu tuyển IT | Cùng điều khoản ITviec | **Cần xin phép ITviec**, hoặc bỏ số khi công bố |
| JD trên ITviec, TopDev, 123job, Joboko, Việc làm Tuổi Trẻ, trang công ty | Task theo cấp của 6 nghề IT | JD là nội dung của nhà tuyển dụng; mình chỉ tóm ý, không chép nguyên văn | Rủi ro thấp; nên xin ITviec, TopDev nếu công bố kèm link JD |
| Bộ dữ liệu VietJobs (HuggingFace) | Lương rao 75 nghề, nhu cầu tuyển 127 nghề | Trang dữ liệu không ghi giấy phép; repo code MIT | **Cần hỏi nhóm tác giả** |
| WageIndicator Việt Nam | Lương tham khảo 18 nghề (số mô hình) | Trang ghi "© WageIndicator 2026"; chưa đọc điều khoản | **Cần đọc điều khoản**, có thể phải xin |
| CareerLink, CareerViet, VietnamWorks HR Insider, JobOKO, 123job (bài hướng nghiệp) | Lương tham khảo 41 nghề | Bài có bản quyền (CareerLink ghi "All rights reserved"); mình chỉ lấy con số và để link | Trích số ngắn có ghi nguồn thường được chấp nhận; **nên xin** nếu dùng nhiều số của cùng một trang |
| Báo chí: CafeF, Sài Gòn Giải Phóng, Tiền Phong, Nhân Dân, VnEconomy, VnBusiness, Thanh Tra, VOH, Tuổi Trẻ, Tuyển Sinh Số | Lương tham khảo phần còn lại (cùng thang lương và tin tuyển dụng: 28 nghề) | Bài có bản quyền; mình chỉ lấy con số và ghi nguồn | **Không cần xin** để trích số liệu ngắn có ghi nguồn |
| LuatVietnam, Thời báo Tài chính (bảng hệ số lương) | Thang lương tính sẵn | Số lấy từ văn bản nhà nước; trang chỉ trình bày lại | **Không cần xin**; nên dẫn thẳng văn bản gốc |
| TopCV (tra cứu mức lương), Muaban.net | Lương tham khảo 3 nghề | Số tổng hợp từ tin tuyển dụng của trang; đọc trên trình duyệt | Trích số ngắn có ghi nguồn; **nên xin** nếu dùng nhiều |
| JobsGO (tra cứu lương) | Lương tham khảo 16 nghề | Trang ghi "All Rights Reserved"; số tổng hợp từ tin tuyển dụng 12 tháng, có cỡ mẫu; đọc bằng Chrome của người dùng | **Nên xin phép** nếu công bố |
| Paylab | Chưa dùng | Báo lỗi truy cập | Nếu sau này dùng thì đọc điều khoản trước |

Phần pháp lý ở cột cuối là nhận định của nhóm, không phải ý kiến luật sư.

## 9. Kiểm tra trước khi duyệt (21/10/2026)

**Cách duyệt:** mở `occupation-data/generated/occupation_profiles_review.md`. File này ghi lý do của từng quyết định cho từng nghề: gộp mã O\*NET nào và vì sao, mã nghề Việt Nam lấy từ đâu, lương chọn nguồn nào và vì sao bỏ các nguồn trước, nhu cầu tuyển, task, nơi làm việc khớp luật nào, ngành học, lộ trình, phần nào là nháp. Mỗi nghề có ô `[ ]` để đánh dấu đã duyệt. Muốn đổi quyết định thì sửa file gốc ghi trong dòng đó rồi chạy lại script.

**Kiểm tra tự động đã qua** (221 hồ sơ): không còn trường rỗng; mọi nghề có tóm tắt, ít nhất 3 mặt trái, sở thích RIASEC, việc hằng ngày, nơi làm việc, mức chuẩn bị, lương, nghề gần; mọi số lương là số nguyên trong khoảng 3–500 triệu, thấp ≤ giữa ≤ cao; mọi tham chiếu nghề gần, thăng tiến trỏ đúng nghề có trong danh mục; không trùng tên nghề.

**Sửa trong lúc kiểm:**
- Luật "dùng chung mã O\*NET" của nghề IT trước đây so mã chính, bỏ nhầm câu môi trường, câu "hợp với ai", kỹ năng, kiến thức của 6 nghề (Game, nhúng, Tech Lead, Cloud, ERP, Network). Các phần này là trung bình trên mọi mã của nghề nên không phải bản chép; nay chỉ bỏ ở Mobile (cùng bộ mã với Back-end).
- 16 nghề ngoài IT có nghề gần là nghề IT nhưng thiếu tên tiếng Việt; nay điền từ danh mục.

**Còn thiếu, không chặn việc duyệt:**

| Mục | Nghề thiếu | Vì sao |
|---|---|---|
| Lương riêng của nghề IT | 8 nghề IT (Game, UI/UX, QA, DevOps, Cloud, ERP, Helpdesk, Network) chỉ có lương toàn ngành theo cấp | Báo cáo ITviec không có vị trí này |
| Công cụ, ngôn ngữ (ITviec) | 7 nghề IT | Như trên |
| Thăng tiến | 9 nghề IT | Chưa có dữ liệu trong final_22_roles.json |
| Lý do nghỉ việc | 8 nghề IT; mọi nghề ngoài IT (đã quyết bỏ) | Không có khảo sát |
| Câu "hợp với ai", câu môi trường, kỹ năng O\*NET | Mobile | Cùng bộ mã với Back-end |
| Nhu cầu tuyển | 72 nghề ngoài IT (57 dưới 5 tin, 15 tuyển chủ yếu qua thi công chức, công an) | Bộ VietJobs không phủ |
| Lộ trình | 69 nghề ngoài IT chỉ có nghề chính | Không có mã gộp nào ở bậc khác |
| Ngành học | 11 nghề không đòi bằng cấp (bảo vệ, shipper, tài xế, công nhân…) và giảng viên (cần thạc sĩ ngành mình dạy) | Có ghi chú thay cho ngành |
| Lương riêng | 11 nghề ngoài IT chỉ có trung bình nhóm nghề | Xem mục 7 |

**Phần là nháp, cần người đọc:** mô tả và mặt trái của 221 nghề; bản dịch tên, task của 199 nghề ngoài IT; task từ JD của 6 nghề IT; bảng gán ngành học; luật gán nơi làm việc; các mã nghề Việt Nam sửa tay.

**Review code (21/10/2026):** agent reviewer đọc 7 script mới, không biết cách viết. Đã sửa: luật khớp chức danh VietJobs khớp nhầm ("rap" khớp "lắp ráp" làm sai lương nhà thiết kế thời trang; "giáo viên toán" khớp "toàn thời gian"; "intern" khớp "internet"; "lean", "ppc", "ui", "ux" khớp nhầm); bộ lọc tin thực tập, bán thời gian nay đọc cả cột loại hợp đồng; `--download` của O\*NET nay tải đủ 11 file; mô tả trong script khớp với code; bỏ import và dòng code thừa. Sau khi sửa: lương nhà thiết kế thời trang 14 triệu (trước 12,5), nhu cầu tuyển còn 127 nghề ngoài IT.

**JobsGO (21/10/2026, đợt ba):** mở JobsGO bằng Chrome của bạn (trình duyệt trong app bị Cloudflare chặn), đọc số của 66 chức danh kèm cỡ mẫu. Dùng cho 16 nghề có chức danh khớp đúng, chỉ thay chỗ đang có số yếu hoặc chưa có số: thống kê, trắc địa, thợ mộc, thợ mộc đồ gỗ, thợ sơn, thợ ống nước (chức danh "thợ điện nước"), thợ kết cấu (chức danh "thợ nhôm kính"), khúc xạ, thẩm định giá, lái xe nâng, quản lý giáo dục (chức danh "hiệu trưởng", 11 mẫu, chất lượng yếu), bưu chính, kiểm soát côn trùng, huấn luyện viên thể hình, vận hành máy thi công (10 mẫu, yếu), hoạt náo viên (chức danh "nhân viên khu vui chơi"). Không dùng các chức danh lệch nghĩa: Product Designer, Stylist, Kỹ sư viễn thông, Giúp việc, Nhân viên nail (trung bình 34 triệu, bất thường). Còn 5 nghề có số chưa xác nhận và 6 nghề không tìm được.
