# 00 · Tổng quan: đọc file này đầu tiên

> **Single source of truth** của đề tài. Tổng hợp ngày 21/09/2026 từ Messenger, Discord, `git log` và mọi file đã nộp cô.
> Những gì chỉ bàn trực tiếp mà không để lại dấu vết thì chưa có ở đây. Ai nhớ thì bổ sung vào file tương ứng.

## Đề tài

| | |
|---|---|
| **Tên** | **JobQuest**: An AI-Native Experiential Career-Exploration Platform |
| **Slogan** | *Try the job before you pick the career.* |
| **Môn** | Đồ án chuyên ngành (ĐACN), HCMUT. Giai đoạn sau là capstone (mở rộng số nghề và độ hoàn thiện) |
| **GVHD** | PGS. TS. Võ Thị Ngọc Châu |
| **Nhóm** | Golden Trio (nhóm 23, project 258) |
| **Repo** | `github.com/The-Golden-Trio/Capstone-Project` |

**Ý tưởng lõi:** JobQuest là web/game để người dùng **trải nghiệm một nghề càng thật càng tốt**: nhận vai, làm các tình huống công việc theo kiểu visual novel, và AI dẫn dắt, chấm điểm dựa trên cách họ xử lý. Sau đó **người dùng tự cảm nhận** mình có hợp nghề đó không. JobQuest **không** hướng nghiệp và **không** phán "bạn hợp ngành X".

Mỗi nghề có nhiều cấp, bắt đầu từ **L1 (intern)**. **Cấp cao nhất cần xác nhận:** không tới C-level; chưa có file nộp cô nào ghi rõ cấp cuối. Mỗi cấp có các **scenario** lấy từ task thật của nghề. Người chơi tích luỹ **kỹ năng**, và kỹ năng là "nhiên liệu" để lên cấp hoặc bay sang **nghề tương tự hay nghề thăng tiến** trên bản đồ ngân hà. **Phase 1 chỉ làm mảng IT.**

## Hiện trạng tại 21/9

| Mảng | Đã có | Chưa có |
|---|---|---|
| **Đề tài & định vị** | Đã chốt tên, scope IT, đối tượng "mọi người", 9 luật nghiệp vụ, 43 yêu cầu, 13 use case, 5 vấn đề nghiên cứu | Chỉnh theo nhận xét của cô 19/9 (objectives, AI-native, bối cảnh vận hành…) |
| **Báo cáo** | Chương 1 → 5.1 (48 trang, nộp 18/9) | Phần còn lại của Chương 5, Chương 6–8 *(nguồn: deck 18/9 slide 2 "This deck reports Chapters 1 to 5.1. Implementation, testing, evaluation and conclusions follow in Chapters 6 to 8" và slide 30 "Complete the Chapter 5 design sections"; báo cáo §1.5)* |
| **Dữ liệu nghề** | 78 role IT (6 domain, thang L1–L10) → 22 role có skill, lương, graph, 97 sự kiện → 18 role chơi được | |
| **Spec kịch bản** | `spec-scenario-KHOI1.md` v2.2 + hướng dẫn sinh scenario | Thanh tiến độ và mở band, context theo kinh nghiệm người chơi, hợp nhất với hệ sự kiện |
| **Nội dung chơi được** | 2 kịch bản (Backend L1, L3), 43 sự kiện, quiz 6 câu | Kịch bản cho các nghề khác (DevOps và Solution Architect đã giao từ 27/8) |
| **Prototype web** | Chạy end-to-end: đăng nhập (email + Google), đồng ý giám hộ, quiz, **bản đồ ngân hà 3D**, quần đảo L1–L10, màn chơi (chat + văn phòng 2D), tổng kết, hành trang. Dùng DB thật | **AI sinh và chấm** (hiện chấm bằng từ khoá), đánh giá nghề 5 tiêu chí, random bối cảnh công ty, công cụ cho chuyên gia/admin |
| **Đánh giá** | **Chưa làm gì.** Báo cáo 18/9 mới chỉ mô tả hướng đánh giá trên giấy (deck 18/9 slide 28) | Chưa có bộ chuẩn · chưa có chuyên gia · chưa triển khai thiết kế đo lường nào |

## Đã chốt 23/9 (chi tiết ở [02](02-quyet-dinh.md))

- **Get-to-know-me là tuỳ chọn** (D-29).
- **Người chơi học cả hard skill lẫn soft skill** (D-32).

## Việc chưa làm (chi tiết ở [07](07-van-de-mo.md))

1. **Tích hợp LLM:** chọn model sinh và model chấm (phải khác họ), ước chi phí.
2. **Ai là domain expert** cho bộ chuẩn đánh giá?
3. Trả lời nhận xét của cô: viết lại objectives, thể hiện AI-native, bối cảnh vận hành và business model.

## Các file trong thư mục này

| File | Đọc khi cần |
|---|---|
| [02 · Nhật ký quyết định](02-quyet-dinh.md) | **Đã chốt gì**, cái gì bị thay, cái gì đang mâu thuẫn |
| [03 · Sản phẩm](03-san-pham.md) | JobQuest chơi thế nào, mô hình nội dung, luật, thuật ngữ |
| [04 · Hiện trạng code & dữ liệu](04-hien-trang-code-data.md) | Repo có gì, chạy ra sao, cái gì thật và cái gì giả lập |
| [05 · Họp & tiến độ tuần](tuan/README.md) | Minutes gặp cô và họp nhóm, **task được giao và việc làm được** theo từng tuần (thư mục `tuan/`) |
| [07 · Vấn đề mở](07-van-de-mo.md) | Việc cần quyết, nhận xét của cô chưa xử lý |
| [08 · Nguồn](08-nguon.md) | Mọi tài liệu gốc nằm ở đâu |
| `submissions/` | Bản lưu mọi file đã nộp hoặc trình bày cho cô (PDF, PPTX) |
| [`reports/`](../../reports/README.md) (gốc repo) | Source LaTeX các báo cáo nộp cô, mỗi lần nộp một folder, kèm nhật ký sync |
| `archive/` | Tài liệu của hướng đề tài đã bỏ |
| `templates/` | Mẫu meeting minutes |

## Quy ước giữ single source of truth

1. **Sau mỗi buổi họp** (kể cả họp trực tiếp): chạy `/capstone-meeting-minutes` với ghi chú, tin nhắn Discord hoặc transcript. Skill tạo minutes theo [`templates/meeting-minutes.md`](templates/meeting-minutes.md) trong `tuan/<tuần>/`, giao task có ID, và cập nhật `02`, `07`. Chat Discord chỉ để bàn, **kết luận phải về repo**.
2. **Quyết định mới:** thêm dòng vào `02`. **Không xoá dòng cũ**, đổi trạng thái thành ♻️.
3. **File nộp cô:** lưu bản cuối vào `submissions/` với tên `yyyy-mm-dd_Tên.ext`. Với báo cáo LaTeX, lưu thêm source vào `reports/yyyy-mm-dd_<slug>/` rồi chạy skill **`capstone-sync-report`** để cập nhật thư mục này (xem [`reports/README.md`](../../reports/README.md)).
4. **Cập nhật file này** khi hiện trạng thay đổi đáng kể (mỗi tuần một lần là đủ).
5. **Commit và PR** theo [`CONTRIBUTING.md`](../../CONTRIBUTING.md) (husky và check `pr-check` sẽ chặn nếu sai). Ghi `Task: T….` vào commit/PR làm task được giao. Chiều thứ 6 chạy `/capstone-weekly-progress` để đối chiếu task giao với việc làm được trong `tuan/<tuần>/tuan.md`.
