# Dataset 22 role — Trạng thái hoàn thành 4 requirement

Nguồn chính: **ITviec Vietnam IT Salary & Recruitment Market Report 2025-2026** (n=1.839 chuyên gia IT tại VN)

## Req 1 — Khử bias skill ✅ 15/22 role

**Cách khử bias:** đổi nguồn từ JD sang **khảo sát tự đánh giá của chính người làm nghề**.
Đây là điểm mấu chốt — dữ liệu không phụ thuộc công ty nào chịu đăng tin, cũng không
phụ thuộc cách HR viết mô tả công việc.

Mỗi role có: `hard_skills_languages` (Top 10 ngôn ngữ), `hard_skills_frameworks` (Top 10
thư viện/framework), kèm thứ hạng. Trường `skills_status._source` ghi rõ phương pháp.

7 role không có hồ sơ trong 18 vị trí của báo cáo: AI Engineer, DevOps, Cloud Engineer,
Cybersecurity, Pentest, Network, UI/UX — để `KHONG_CO_TRONG_BAO_CAO`, không suy diễn.

## Req 2 — Lương & phúc lợi ✅ 15/22 role

`compensation.itviec_2025_2026` — median theo **5 khoảng kinh nghiệm** (<1, 1-2, 3-4,
5-8, >8 năm), số thật từ tr.54 của báo cáo.

Bối cảnh trong `_meta.salary_context`: lương theo thành phố × kinh nghiệm, theo 4 nhóm
company_type (khớp đúng trục dự án đã có), theo quốc gia chủ quản, theo quy mô công ty.

Phúc lợi: `compensation._context.benefits_common` + `work_life.top_reasons_to_apply`
(tiêu chí thật khiến chuyên gia IT chọn offer).

## Req 3 — Task/skill + graph ✅

**97 cạnh, 3 loại:**
- `PROGRESSES_TO` (28) — app gợi ý "làm tiếp vài năm em có thể thành..."
- `SIMILAR` (30) — app gợi ý "role tương tự em có thể thử". **20/30 cạnh có trọng số
  tính bằng Jaccard trên skill thật**, kèm `shared_skills` liệt kê kỹ năng chung
- `ABSORBED` (39) — để user gõ "Data Scientist" vẫn ra AI Engineer

Mỗi role có `graph_edges.similar_ranked` đã sắp theo độ giống giảm dần — dùng trực tiếp
cho tính năng gợi ý.

## Req 4 — Work-life + tình huống role-play ✅

**97 sự kiện:** 7 dùng chung (layoff, offer công ty khác, bất đồng với senior, deadline
trùng việc gia đình, đổi công nghệ, kèm người mới, đánh giá hiệu suất thấp) + 90 riêng
theo role (mỗi role 4-5).

Mỗi sự kiện có: `measures` (1-3 trong 8 chiều đo), `band_range`, `frequency`, 3 lựa chọn
kèm `outcome` và `signal` để chấm điểm. **8 chiều đo** trong `fit_dimensions`.

**Work-life có dữ liệu thật** (14/22 role): `work_life.top_reasons_to_leave` và
`top_reasons_to_apply` — phần trăm thật từ khảo sát, dùng để dựng thêm sự kiện có căn cứ.

## Hạn chế cần khai báo

1. **16/97 sự kiện có neo nguồn thật**, 81 còn lại là `C_INFERRED`. Phỏng vấn 1-2 người
   mỗi nghề sẽ nâng chất lượng phần này nhiều nhất.
2. **7 role thiếu cả skill lẫn lương** vì không có trong 18 vị trí của báo cáo. Nghịch lý
   đáng chú ý: DevOps không có hồ sơ riêng dù chính báo cáo xếp DevOps & CI/CD là kỹ năng
   ưu tiên số 1 (53,1% doanh nghiệp) — nhiều khả năng người làm DevOps tự khai là
   "Back-end Developer" hoặc "IT Manager" khi trả lời khảo sát.
3. Khảo sát ITviec là **tự nguyện trên nền tảng ITviec** — nghiêng về HCM/Hà Nội, loại
   trừ freelancer. Vẫn là mẫu công khai tốt nhất cho thị trường VN.
4. Radar kỹ năng tiếng Anh ở dạng hình ảnh, chưa rút thành số.
