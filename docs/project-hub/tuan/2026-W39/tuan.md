# Tuần 39 · 21/9 → 27/9/2026

> Buổi mở đầu tuần: [gặp cô T7 19/9](2026-09-19_gap-co.md). Minutes: skill `/capstone-meeting-minutes`. Đối chiếu giao với làm được: skill `/capstone-weekly-progress` (thường chiều T6).

## Buổi họp

- [19/9 (T7) 17h · Gặp cô · Báo cáo Chương 1–5.1](2026-09-19_gap-co.md)
- [20/9 (CN) · Phân task tuần 39 (Phúc, Discord)](2026-09-20_phan-task.md)
- [23/9 (T4) · Họp nhóm · Midweek check](2026-09-23_hop-nhom.md)

## Task giao

| ID | Ai | Task | Hạn | Nguồn | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|
| T2009.1 | Nhật | Tổng hợp lại tài liệu từ trước đến giờ (meeting minutes, task tuần, data trong repo) cho có cấu trúc, rồi trình bày lại hiện trạng nhóm đang có gì | T7 26/9 | [20/9 phân task](2026-09-20_phan-task.md) · nhắc lại [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ | Đã có: `docs/project-hub/` (`6652636`, 21/9, branch `chore/reorganize-structure`, chưa merge vào main); `tuan/` (25/9, chưa commit). Phần "trình bày lại" chưa thấy dấu vết |
| T2009.2 | Nhật | Sau T2009.1: DB design v0 | T7 26/9 | [20/9 phân task](2026-09-20_phan-task.md) | 🚫 | Bỏ ở midweek 23/9, giao lại cho Nam (T2309.10) |
| T2009.3 | Nam | Làm tiếp cho xong phần thiết kế hệ thống: các screen trên bản Nhật gửi buổi sáng (*suy luận:* sơ đồ màn hình `vao-nghe-flow`, 20/9), **gồm cả phần cho admin** (báo cáo chưa làm kỹ); phần user tham khảo báo cáo. Lưu ý: mỗi screen phải có nội dung và thông tin rõ, dễ nhìn, chữ vừa phải; thẻ profile bên phải màn thiên hà đang gò bó, xem lại | T7 26/9 | [20/9 phân task](2026-09-20_phan-task.md) · nhắc lại [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |
| T2009.4 | Nam | Sau T2009.3: functional requirement và các phần liên quan use case | T7 26/9 | [20/9 phân task](2026-09-20_phan-task.md) · nhắc lại [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |
| T2309.1 | Nhật | Tạo nơi lưu source LaTeX của report; mỗi lần update report thì Claude tự cập nhật các docs còn lại | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ | Đã có ở máy Nhật (25/9, chưa commit): `reports/`, skill `capstone-sync-report` |
| T2309.2 | Nhật | Chuyển công việc sau này hoàn toàn lên repo; cuối tuần dùng skill Claude gom commit để cập nhật tiến độ | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ | Đã có ở máy Nhật (25/9, chưa commit): skill `capstone-weekly-progress`, `capstone-commit-helper`, husky + `pr-check`, `CONTRIBUTING.md`. Husky chưa cài |
| T2309.3 | Nhật | File khuôn mô tả các cấu trúc data JSON: hoạt động thế nào, ý nghĩa ra sao | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ | Đã có `occupation-data/JSON_SCHEMA.md` (25/9, chưa commit) |
| T2309.4 | Nhật | Trình bày skeleton của Nam: logic đã hợp lý chưa, data đã đủ để cung cấp chưa | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |
| T2309.5 | Nhật | Cấu hình để Claude không đọc `_archive/` trừ khi được nhắc | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ | Đã có ở máy Nhật (25/9, chưa commit): quy tắc trong `CLAUDE.md`, `Read`/`Edit` `_archive/**` ở chế độ ask trong `.claude/settings.json` |
| T2309.6 | Nhật | Đưa landing page vào repo | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ | Landing page hiện chỉ có `JobQuest.zip` trên Discord (xem T3108.3 ở [W36](../2026-W36/tuan.md)) |
| T2309.7 | Nhật | Tạo folder riêng ghi weekly progress / meeting minutes, phân biệt việc được giao và việc làm được | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ | Đã có ở máy Nhật (25/9, chưa commit): `docs/project-hub/tuan/`, skill `capstone-meeting-minutes` |
| T2309.8 | Nam | Nội dung chi tiết của từng màn hình: màn hình đó có những nội dung nào (chưa cần cụ thể, nhưng biết phải có gì) | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |
| T2309.9 | Nam | So với data và các quyết định hiện tại, các screen và phần đang làm còn thiếu nội dung gì | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |
| T2309.10 | Nam | DB v0 dựa trên những gì đang có, mang các field trong JSON qua (nhận lại từ T2009.2) | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |
| T2309.11 | Nhật | Báo cáo lại phần mình đã trình bày đến đâu trong slide tuần trước, để chuẩn bị nội dung tuần này | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |
| T2309.12 | Nam | Báo cáo lại phần mình đã trình bày đến đâu trong slide tuần trước, để chuẩn bị nội dung tuần này | T7 26/9 | [23/9 midweek](2026-09-23_hop-nhom.md) | ⏳ |  |

Task tuần này được giao qua [bài phân task CN 20/9](2026-09-20_phan-task.md) và điều chỉnh ở [midweek T4 23/9](2026-09-23_hop-nhom.md). Hạn chung: **T7 26/9**. Việc sửa báo cáo theo nhận xét của cô 19/9 ([07 §B](../../07-van-de-mo.md#b-nhận-xét-của-cô-199-chưa-xử-lý)) **chưa có trong danh sách giao**.

**Task cũ còn mở**, cần nhóm quyết làm tiếp hay huỷ. Làm tiếp thì chép dòng đó vào bảng trên với cùng ID; huỷ thì đổi thành 🚫 ở tuần cũ:

| ID | Ai | Task | Trạng thái | Ở tuần |
|---|---|---|---|---|
| T1808.2 | Nam | Market analysis theo role, 3 năm | ❓ | [W34](../2026-W34/tuan.md) |
| T2708.3 | Nhật | Task, soft skill, hard skill đầy đủ cho từng role (thiếu soft skill) | 🟡 | [W35](../2026-W35/tuan.md) |
| T2708.7 | Nam | Scenario cho DevOps và Solution Architect | 🟡 | [W35](../2026-W35/tuan.md) |
| T0309.1 | Nam | Sửa landing page cho responsive | ❓ | [W36](../2026-W36/tuan.md) |
| T0809.3 | Nhật | Random bối cảnh công ty, chốt các loại context | ❌ | [W37](../2026-W37/tuan.md) |
| T0809.7 | Nhật | Review và merge nhánh Phúc lọc bớt file | ❓ | [W37](../2026-W37/tuan.md) |

## Làm thêm ngoài task giao

<!-- capstone-weekly-progress: việc có trong git/PR nhưng không gắn với task nào ở trên. -->

## Đã nộp / trình bày cho cô

- T7 19/9: trình bày báo cáo Chương 1–5.1 và advisor deck (nộp 18/9, xem [W38](../2026-W38/tuan.md))

## Theo người

<!-- capstone-weekly-progress: mỗi người 3–8 dòng, Đã xong / Đang làm / Quy ước. -->

## Chuyển sang tuần sau

<!-- Task ↪ và việc cần để ý. -->
