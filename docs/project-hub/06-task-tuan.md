# 06 · Task theo tuần

> Tên gọi: **AN** = Châu Anh Nhật (Brian) · **knam** = Trương Gia Kỳ Nam · **Phúc** = Nguyễn Phúc (trưởng nhóm).
> Trạng thái được đối chiếu với commit và file nộp: ✅ có sản phẩm · 🟡 làm một phần · ❌ chưa thấy sản phẩm · ❓ không đủ dữ liệu để biết.
> Từ tuần này: ghi task mới **lên đầu file** theo mẫu ở cuối.

---

## Tuần 14/9 – 20/9 — Prototype + báo cáo Chương 1–5

| Ai | Task | Hạn | Kết quả |
|---|---|---|---|
| knam | Dựng prototype chạy được: React, auth, DB, quần đảo, nhiệm vụ phụ | demo T4 16/9 | ✅ `2fef4c7` … `19a9e93` (17–18/9) |
| AN | Bản đồ 3D, tách điểm cứng/mềm, văn phòng 2D, trang Hành trang | 18/9 | ✅ `83e8966`, `d1845fe`, `79ffb84`, `34efd5c`, `63f167b` |
| ? | Báo cáo Ch.1–5.1 + advisor deck | T7 19/9 | ✅ Nam gửi lên Discord 18/9 (xem `nop-co/`) |
| AN | Script thuyết trình | 19/9 | ✅ Claude artifact "JobQuest – Script thuyết trình" |
| knam | Bảng so sánh 5 nhóm hệ thống × 8 tiêu chí C1–C8 | 19/9 | ✅ Discord 19/9 |
| AN | Sơ đồ màn hình của code hiện tại | — | ✅ `docs/vao-nghe-flow.*` (20/9, chưa commit) |

## <a id="tuan-0709"></a>Tuần 7/9 – 13/9 — minutes #weekly-minutes 8/9, hạn **tối T2 14/9**

| Ai | Task | Kết quả |
|---|---|---|
| AN | Lưu hard/soft skill của user: stat tích luỹ, mỗi lượt chơi được đánh giá để earn skill point | ✅ skill taxonomy + XP (`83e8966`), điểm cứng/mềm (`79ffb84`) |
| AN | Nghề thăng tiến và nghề tương tự → **graph 3D hành tinh**, có khoảng cách trọng số. User là tên lửa, skill là nhiên liệu, mở khoá nghề theo ngưỡng skill | ✅ `/jobs` (18/9, trễ 4 ngày) |
| AN | Random bối cảnh công ty cho user ngay từ đầu (OT không, WFH không). Chốt đủ các loại context (soft/hard skill, activity, company, NPC) và scope của từng loại | ❌ tách thành task riêng (theo `report-skill-graph-mvp.md`) |
| knam | 1 task = tiêu đề 1 scenario. Scenario chia thành activity, mỗi activity có context riêng | ✅ spec v2.1 (`5e15365`, 7/9) |
| cả nhóm | Dựng **prototype toàn hệ thống**: screen flow tĩnh nhưng cụ thể, mock data, chưa cần logic | ✅ `docs/prototype.html` (`188c3bf`, 15/9) |
| cả nhóm | Bổ sung kiến thức nền cho literature review (Phúc: *"mình còn thiếu kiến thức để làm xong lit review, để AI lái không ổn"*) | ✅ phản ánh trong báo cáo Ch.2–3 (18/9) |
| AN | Review và merge nhánh Phúc lọc bớt file | ❓ không thấy nhánh này trong repo |
| cả nhóm | Deck 7/9 + tập thuyết trình, gặp cô T5 10/9 | ✅ |

## Tuần 31/8 – 6/9 — kickoff

| Ai | Task | Kết quả |
|---|---|---|
| AN / knam | Slide kickoff (Nhật 1–3, KN 4–6) theo plan của Phúc | ✅ `JobQuest_Kickoff_Slides.pdf` (3/9) |
| AN / knam | Logo (mỗi người 3 mẫu, sau đó thêm 2) + giải thích ý nghĩa | ✅ logo v1 ở kickoff, logo v2 ngày 7–8/9 |
| Phúc | Landing page | ✅ `JobQuest.zip` trên Discord (**chưa có trong repo**) |
| knam | Sửa landing page cho responsive, đọc từng section | ❓ |

## <a id="tuan-2408"></a>Tuần 24/8 – 30/8 — minutes 23/8 (hạn T3) và 27/8 (hạn T7 29/8)

| Ai | Task | Kết quả |
|---|---|---|
| AN | **(T3)** Lọc role phổ biến, gộp role ít khác biệt, bỏ role hẹp đã có role lớn bao trùm. **Giữ cột similar role khi gộp** | ✅ `roles_18_playable.csv` (có `similar_roles`), `FILTERED_ROLES.csv` |
| knam | **(T3)** Task và soft skill, **giữ hard skill làm context** → dựng skeleton chung để feed cho AI, giống nhau cho mọi scenario. Thời lượng ≤ 15 phút | ✅ `spec-scenario-KHOI1.md` |
| AN | **(T7)** Khử bias do đọc JD công ty → tìm chuẩn chung | ✅ dùng khảo sát ITviec 2025–26 (`README_DATASET.md`, Req 1) |
| AN | **(T7)** Bổ sung lương và phúc lợi | ✅ 15/22 role (Req 2) |
| AN | **(T7)** Task, soft skill, hard skill đầy đủ cho từng role | 🟡 skill có cho 15/22 role; file 22 role **không có soft skill** |
| AN | **(T7)** Graph quan hệ giữa các role gần nhau (gợi ý hướng khác, hoặc thăng tiến theo level) | ✅ 97 cạnh (Req 3) |
| AN | **(T7)** Work-life, tình huống → random event (on-call nửa đêm, layoff…), càng nhiều case càng tốt | ✅ 97 sự kiện, nhưng 81 cái là C_INFERRED (Req 4) |
| knam | **(T7)** Hint trong free text · không để 4 lựa chọn cùng lúc với free text · câu cố định / follow-up · giới hạn follow-up · context user/job theo kinh nghiệm · 1 job → nhiều scenario → task → beat · gộp "grounded in" vào context · thêm thời gian cho quick action · câu chốt trước ending · review/rating sau mỗi task · thanh progress mở level | ✅ phần lớn nằm trong spec v2.x. Còn bỏ ngỏ: "context theo kinh nghiệm", "thanh progress" (spec mục CÒN THIẾU) |
| knam | Làm scenario cho 3 nghề **Backend, DevOps, Solution Architect**, chia nhiều beat, visualize nếu được | 🟡 chỉ có **Backend** (L1, L3). DevOps và SA ❌ |
| — | Ghi chú 27/8: *"thiếu data để sinh scenario"* | → dẫn tới task dữ liệu 22 role |

## <a id="tuan-1708"></a>Tuần 17/8 – 23/8 — minutes 18/8

| Ai | Task | Kết quả |
|---|---|---|
| AN | **Occupation profile:** tìm đủ các role mảng IT · các level trong role và job outlook · công việc, hoạt động, skill, bằng cấp · các dạng môi trường làm việc · lương và phúc lợi · quan hệ giữa các role · xu hướng chung về startup và AI | ✅ `occupation-data/` (`dc2ce4d`, 22/8): 78 role, L1–L10, 6 lộ trình học vấn, 6 môi trường làm việc, feeder/next/lateral |
| knam | **Market analysis** theo role và thời gian trong 3 năm (biểu đồ): role mới, role đông và cạnh tranh nhất, cung–cầu theo role/level, tỷ lệ thất nghiệp/layoff, lương, tỷ lệ bị AI thay thế, độ khó và áp lực. Có nguồn rõ ràng, dữ liệu VN 3 năm | ❓ **Không thấy file** trong repo. Một phần job outlook nằm trong `output/outlook/posting_counts.csv` (commit của AN) |

## Tuần 10/8 – 16/8
- Cả nhóm: đọc lại 2 topic, gặp cô T6 14/8 → ✅
- Sau buổi gặp: gửi lại mô tả hệ thống, finalize tên đề tài, nghiên cứu tổng quan → ✅ tên và mô tả gửi trước 26/8 (*suy luận*, không có bản lưu)

## Tuần 3/8 – 9/8
- Phúc: viết topic mới (`app_decisions_so_far.md`, workspace AI) → ✅ (topic sau đó không được chọn)
- Cả nhóm: tạo Discord, kênh rules và minutes, chốt 6 luật nhóm → ✅

## Tuần 20/7 – 2/8 (đề tài v1)
| Ai | Task | Kết quả |
|---|---|---|
| Phúc | Báo cáo phần 3 (so sánh giải pháp), phần 4 | ✅ `report.md` |
| knam | Báo cáo phần 5–6, bản LaTeX | ✅ `report/main.tex` |
| AN | Cập nhật báo cáo · supplementary report trả lời 5 câu hỏi của cô | ✅ `progress/week-2/supplementary_report.md` (25/7) |
| AN + knam | Tìm bài báo liên quan, gắn link, lọc còn khoảng 10 bài | ✅ nhưng PR #1 `feat/paper-links` **chưa merge** |

## Tuần 13/7 – 19/7
- Chọn đề tài hướng nghiệp, khởi tạo repo, brainstorm, dàn ý báo cáo → ✅ (19/7)

---

## Mẫu cho tuần mới

```markdown
## Tuần dd/mm – dd/mm — <mục tiêu tuần>
Họp: <ngày giờ> · Biên bản: 05-bien-ban-hop.md#...

| Ai | Task | Hạn | Kết quả |
|---|---|---|---|
| AN | ... | T.. dd/mm | ⬜ chưa làm / 🟡 / ✅ link commit hoặc PR |
```
