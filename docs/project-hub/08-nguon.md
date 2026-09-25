# 08 · Chỉ mục nguồn

> Mọi thứ trong `project-hub/` đều truy về được một trong các nguồn dưới đây. Nguồn nào chưa có trong repo thì ghi rõ đang nằm ở đâu.

## 1. Đã nộp / trình bày cho cô → `submissions/` (PDF, PPTX) và `reports/` ở gốc repo (source LaTeX)

| Ngày | File | Nội dung | Trình bày |
|---|---|---|---|
| 22/7 | `_archive/docs/report.md`, `_archive/docs/report/main.tex` | Brief report đề tài v1 (hướng nghiệp cho HS THPT), 6 phần | Gửi mail |
| 25/7 | `_archive/docs/progress/week-2/supplementary_report.md` | Trả lời 5 câu hỏi của cô (đề tài v1) | Gửi mail |
| 26/8 | *(không có bản lưu)* | Tên đề tài và mô tả hệ thống (hạn T4 26/8) | Gửi mail |
| 3/9 | `submissions/2026-09-03_JobQuest_Kickoff_Slides.pdf` | Kickoff, 6 slide | 5/9, B4505 |
| 7/9 | `submissions/2026-09-07_JobQuest_Meeting_7Sep.pptx` | Báo cáo tiến độ, 14 slide, có ghi chú người nói | Gặp cô 10/9 |
| 18/9 | `submissions/2026-09-18_JobQuest_Report_Ch1-5.pdf` | Báo cáo Chương 1–5.1, 48 trang | Gặp cô 19/9 |
| 18/9 | `submissions/2026-09-18_JobQuest_Advisor_Deck.pdf` | Deck báo cáo Ch.1–5, 38 slide, 3 câu hỏi xin quyết định | Gặp cô 19/9 |

## 2. Kênh trao đổi (không đưa bản export vào repo vì có thông tin cá nhân)

| Kênh | Thời gian | Ghi chú |
|---|---|---|
| Messenger "Đồ án chuyên ngành" | 27/6 – 14/9 | ~1.300 tin nhắn không trùng. Kênh chính trước khi có Discord, vẫn dùng để hẹn giờ họp |
| Discord "Đồ Án" · `#chung` | 5/8 – 20/9 | File trao đổi và ghi chú sau buổi gặp cô |
| Discord "Đồ Án" · `#weekly-minutes` | 18/8 – 8/9 | 4 lần ghi minutes và task |
| Họp trực tiếp / Meet | | **Không có ghi chép**, chỉ biết qua chat trước và sau buổi |

**Ai là ai:** Messenger "Nguyen Phuc" = Discord **AARES** = GitHub **GitGud031005** (Phúc) · Messenger "Truong Gia Kỳ Nam" = Discord **Truong Marco** = GitHub **truongnam** (knam) · Messenger "Nhat Chau" = Discord **N** (brian1809) = GitHub **Brian Chau** (AN). Minutes 18/8 được đăng bởi tài khoản "Luffii" (**chưa xác định là ai**).

## 3. Chỉ có trên Discord hoặc bên ngoài, **chưa có trong repo**

| File / link | Ai gửi, khi nào | Ghi chú |
|---|---|---|
| `JobQuest.zip` (landing page v1) | Phúc, 3/9 | Nên đưa vào repo |
| Ảnh logo (các bản thử + bản cuối) | AN, Phúc, knam, 4–8/9 | Nên đưa vào `project-hub/assets/` |
| `occupation-data.zip` | AN, 7/9 | Có lẽ trùng với `occupation-data/` trong repo |
| `JobQuest_Advisor_Deck_18Sep2026.pptx` (bản gốc có thể sửa của deck 18/9) + bản `_2` ngày 19/9 | knam | Repo chỉ có bản PDF |
| Source LaTeX báo cáo Ch.1–5 | ? | Chỉ có PDF. Tải từ Overleaf về `reports/2026-09-18_ch1-5/` |
| Plan thuyết trình, metaphor, nội dung mới (Claude artifact công khai) | Phúc, 2/9 và 7/9 | Không đọc được từ đây. Kết quả cuối đã nằm trong các deck |
| Script thuyết trình 19/9 | AN | Claude artifact "JobQuest – Script thuyết trình" |
| Ảnh "6 luật nhóm" (9/8), ảnh giao task (8/9) | Phúc | Chỉ có dạng ảnh trong Messenger |
| `message.txt` (19/9) | knam | Script AI sinh để thuyết trình, không cần lưu |

## 4. Trong repo

| Nhóm | File |
|---|---|
| **Hiện hành: sản phẩm & spec** | `occupation-data/specs/spec-scenario-KHOI1.md` (v2.2) · `occupation-data/specs/HUONG-DAN-SINH-SCENARIO.md` |
| **Hiện hành: dữ liệu** | `occupation-data/README.md` (mục lục) · `occupation-data/datasets/` · `occupation-data/decisions/78_to_22_roles.csv` · `occupation-data/tools/visualize_*.html` |
| **Hiện hành: kỹ thuật** | `docs/vao-nghe-flow.*` · `infra/local/docker-compose.yml` (Overleaf) |
| **Lịch sử: dữ liệu pass 0–1 (tháng 8)**, trong `_archive/occupation-data/` | `spec-pass1-KHOI1-fixed.md`, `pass0-archetype-triage.md`, `output/REPORT.md`, `output/Roles_Summary.md`, `output/education_paths.json`, `pass1/`, `golden/`, `capture/`, `jd_raw/`, `dataset_v1.json`, `dataset_22_roles_enriched.json`, `output/G1_22_roles.json` |
| **Lịch sử: kỹ thuật**, trong `_archive/` | `README.md` (gốc repo), `docs/report-skill-graph-mvp.md`, `docs/prototype.html` |
| **Lịch sử: đề tài v1 (tháng 7)**, trong `_archive/docs/` | `init.md`, `init.vi.md`, `steps.md`, `market-research.md`, `datasource.md`, `result.md`, `report.md`, `report/main.tex`, `progress/week-2/supplementary_report.md` |
| **Lịch sử: topic workspace AI (tháng 8)** | `docs/project-hub/archive/2026-08-05_app-decisions-so-far_de-tai-workspace-AI.md` |
