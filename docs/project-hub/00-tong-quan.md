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

Mỗi nghề có các cấp **L1 (intern) → L10 (C-level)**. Mỗi cấp có các **scenario** lấy từ task thật của nghề. Người chơi tích luỹ **kỹ năng**, và kỹ năng là "nhiên liệu" để lên cấp hoặc bay sang **nghề tương tự hay nghề thăng tiến** trên bản đồ ngân hà. **Phase 1 chỉ làm mảng IT.**

## Hiện trạng tại 21/9

| Mảng | Đã có | Chưa có |
|---|---|---|
| **Đề tài & định vị** | Đã chốt tên, scope IT, đối tượng "mọi người", 9 luật nghiệp vụ, 43 yêu cầu, 13 use case, 5 vấn đề nghiên cứu | Chỉnh theo nhận xét của cô 19/9 (objectives, AI-native, bối cảnh vận hành…) |
| **Báo cáo** | Chương 1 → 5.1 (48 trang, nộp 18/9) | Phần còn lại của Chương 5, Chương 6–8 |
| **Dữ liệu nghề** | 78 role IT (6 domain, thang L1–L10) → 22 role có skill, lương, graph, 97 sự kiện → 18 role chơi được | Soft skill cho bộ 22 role. 7 role thiếu skill và lương. Nhiều sự kiện chỉ là suy luận |
| **Spec kịch bản** | `spec-scenario-KHOI1.md` v2.2 + hướng dẫn sinh scenario | Thanh tiến độ và mở band, context theo kinh nghiệm người chơi, hợp nhất với hệ sự kiện |
| **Nội dung chơi được** | 2 kịch bản (Backend L1, L3), 43 sự kiện, quiz 6 câu | Kịch bản cho các nghề khác (DevOps và Solution Architect đã giao từ 27/8) |
| **Prototype web** | Chạy end-to-end: đăng nhập (email + Google), đồng ý giám hộ, quiz, **bản đồ ngân hà 3D**, quần đảo L1–L10, màn chơi (chat + văn phòng 2D), tổng kết, hành trang. Dùng DB thật | **AI sinh và chấm** (hiện chấm bằng từ khoá), đánh giá nghề 5 tiêu chí, random bối cảnh công ty, công cụ cho chuyên gia/admin |
| **Đánh giá** | Thiết kế: bộ chuẩn IT do chuyên gia duyệt, đo Cohen's κ chia theo độ khó | Chưa có bộ chuẩn, **chưa xác định chuyên gia** |

## 5 việc cần chốt ngay (chi tiết ở [07](07-van-de-mo.md))

1. **Get-to-know-me bắt buộc hay tuỳ chọn?** Các nguồn đang nói ngược nhau, và cô đã hỏi.
2. **Người chơi học hard skill hay chỉ soft skill?** Code đang cộng cả hai.
3. **Tích hợp LLM:** chọn model sinh và model chấm (phải khác họ), ước chi phí.
4. **Ai là domain expert** cho bộ chuẩn đánh giá?
5. Trả lời nhận xét của cô: viết lại objectives, thể hiện AI-native, bối cảnh vận hành và business model.

## Nhóm

| Người | Handle | Đã làm (theo commit và chat) |
|---|---|---|
| **Nguyễn Phúc** | Messenger "Nguyen Phuc" · Discord AARES · GitHub GitGud031005 | Trưởng nhóm: đặt lịch và giao task, ghi minutes, liên lạc cô, đề xuất hướng đề tài, viết báo cáo v1 (phần 3–4), landing page, plan thuyết trình |
| **Trương Gia Kỳ Nam** (knam) | Discord Truong Marco · GitHub truongnam | Khởi tạo repo, LaTeX, **spec kịch bản** và scenario Backend, prototype HTML → React, **auth, DB, quần đảo, nhiệm vụ phụ, đưa nội dung vào DB**, gửi báo cáo và deck 18/9, ghi nhận xét của cô 19/9 |
| **Châu Anh Nhật** (AN / Brian) | Discord N · GitHub Brian Chau | Market research v1, supplementary report, **dữ liệu nghề (78/22/18 role)**, skill taxonomy, role graph, **bản đồ 3D**, văn phòng 2D, trang Hành trang, sơ đồ màn hình, script thuyết trình |

## Các file trong thư mục này

| File | Đọc khi cần |
|---|---|
| [01 · Dòng thời gian](01-dong-thoi-gian.md) | Chuyện gì xảy ra khi nào, vì sao đổi đề tài |
| [02 · Nhật ký quyết định](02-quyet-dinh.md) | **Đã chốt gì**, cái gì bị thay, cái gì đang mâu thuẫn |
| [03 · Sản phẩm](03-san-pham.md) | JobQuest chơi thế nào, mô hình nội dung, luật, thuật ngữ |
| [04 · Hiện trạng code & dữ liệu](04-hien-trang-code-data.md) | Repo có gì, chạy ra sao, cái gì thật và cái gì giả lập |
| [05 · Biên bản họp](05-bien-ban-hop.md) | Các buổi gặp cô và họp nhóm (tái dựng) |
| [06 · Task theo tuần](06-task-tuan.md) | Ai được giao gì, xong chưa |
| [07 · Vấn đề mở](07-van-de-mo.md) | Việc cần quyết, nhận xét của cô chưa xử lý |
| [08 · Nguồn](08-nguon.md) | Mọi tài liệu gốc nằm ở đâu |
| `nop-co/` | Bản lưu mọi file đã nộp hoặc trình bày cho cô |
| `archive/` | Tài liệu của hướng đề tài đã bỏ |
| `templates/` | Mẫu biên bản họp |

## Quy ước giữ single source of truth

1. **Sau mỗi buổi họp** (kể cả họp trực tiếp): người ghi điền [`templates/bien-ban-hop.md`](templates/bien-ban-hop.md), thêm vào `05`, rồi cập nhật `02`, `06`, `07` nếu có thay đổi. Chat Discord chỉ để bàn, **kết luận phải về repo**.
2. **Quyết định mới:** thêm dòng vào `02`. **Không xoá dòng cũ**, đổi trạng thái thành ♻️.
3. **File nộp cô:** lưu bản cuối vào `nop-co/` với tên `yyyy-mm-dd_Tên.ext`.
4. **Cập nhật file này** khi hiện trạng thay đổi đáng kể (mỗi tuần một lần là đủ).
