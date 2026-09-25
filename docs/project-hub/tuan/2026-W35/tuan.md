# Tuần 35 · 24/8 → 30/8/2026 — Dữ liệu 22 role + spec scenario

> Tái dựng 21/9 từ chat, Discord và git (bản cũ của `05-meeting-minutes.md` và `06-task-tuan.md`), chuyển vào đây 25/9.

## Buổi họp

- 22/8 (T7) 11h · Trực tiếp, lầu 5 A4 · Phúc nhận xét buổi sáng (Nhật định cải thiện occupation data theo nhận xét) 💬
- 23/8 (CN) 13h30 · Online · **Minutes** ở Discord `#weekly-minutes` 🎮
- 26/8 (T4) 21h30 · 1-1 Phúc × Nam · Nhận xét phần scenario / follow-up (gộp chung vào minutes 27/8) 💬
- 27/8 (T5) 7h30 · 1-1 Phúc × Nhật · **Minutes** ở Discord `#weekly-minutes` 🎮

## Task giao

| ID | Ai | Task | Hạn | Nguồn | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|
| T2308.1 | Nhật | Lọc role phổ biến, gộp role ít khác biệt, bỏ role hẹp đã có role lớn bao trùm. **Giữ cột similar role khi gộp** | T3 25/8 | minutes 23/8 | ✅ | `roles_18_playable.csv` (có `similar_roles`), `FILTERED_ROLES.csv` |
| T2308.2 | Nam | Task và soft skill, **giữ hard skill làm context** → dựng skeleton chung để feed cho AI, giống nhau cho mọi scenario. Thời lượng ≤ 15 phút | T3 25/8 | minutes 23/8 | ✅ | `spec-scenario-KHOI1.md` |
| T2708.1 | Nhật | Khử bias do đọc JD công ty → tìm chuẩn chung | T7 29/8 | minutes 27/8 | ✅ | Dùng khảo sát ITviec 2025–26 (`README_DATASET.md`, Req 1) |
| T2708.2 | Nhật | Bổ sung lương và phúc lợi | T7 29/8 | minutes 27/8 | ✅ | 15/22 role (Req 2) |
| T2708.3 | Nhật | Task, soft skill, hard skill đầy đủ cho từng role | T7 29/8 | minutes 27/8 | 🟡 | Skill có cho 15/22 role; file 22 role **không có soft skill** |
| T2708.4 | Nhật | Graph quan hệ giữa các role gần nhau (gợi ý hướng khác, hoặc thăng tiến theo level) | T7 29/8 | minutes 27/8 | ✅ | 97 cạnh (Req 3) |
| T2708.5 | Nhật | Work-life, tình huống → random event (on-call nửa đêm, layoff…), càng nhiều case càng tốt | T7 29/8 | minutes 27/8 | ✅ | 97 sự kiện, nhưng 81 cái là C_INFERRED (Req 4) |
| T2708.6 | Nam | Hint trong free text · không để 4 lựa chọn cùng lúc với free text · câu cố định / follow-up · giới hạn follow-up · context user/job theo kinh nghiệm · 1 job → nhiều scenario → task → beat · gộp "grounded in" vào context · thêm thời gian cho quick action · câu chốt trước ending · review/rating sau mỗi task · thanh progress mở level | T7 29/8 | minutes 27/8 | ✅ | Phần lớn nằm trong spec v2.x. Còn bỏ ngỏ: "context theo kinh nghiệm", "thanh progress" (spec mục CÒN THIẾU) |
| T2708.7 | Nam | Làm scenario cho 3 nghề **Backend, DevOps, Solution Architect**, chia nhiều beat, visualize nếu được | — | minutes 27/8 | 🟡 | Chỉ có **Backend** (L1, L3). DevOps và SA chưa có |

Ghi chú 27/8: *"thiếu data để sinh scenario"* → dẫn tới task dữ liệu 22 role.

## Làm thêm ngoài task giao

*Không đối chiếu cho các tuần tái dựng.*

## Đã nộp / trình bày cho cô

- 26/8: tên đề tài và mô tả hệ thống (gửi mail, không có bản lưu)

## Theo người

*Không tổng hợp cho các tuần tái dựng. Xem bảng task.*

## Chuyển sang tuần sau

*Không ghi nhận.*
