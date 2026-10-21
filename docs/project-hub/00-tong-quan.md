# 00 · Tổng quan: đọc file này đầu tiên

> **Single source of truth** của đề tài. Tổng hợp ngày 21/09/2026 từ Messenger, Discord, `git log` và mọi file đã nộp cô.
> Những gì chỉ bàn trực tiếp mà không để lại dấu vết thì chưa có ở đây. Ai nhớ thì bổ sung vào file tương ứng.

## Đề tài

| | |
|---|---|
| **Tên** | **JobQuest**: An AI-Native Experiential Career-Exploration Platform |
| **Slogan** | *Try the job before you pick the career.* |
| **Môn** | Đồ án chuyên ngành (ĐACN), HCMUT, rồi **đồ án tốt nghiệp (ĐATN, còn gọi capstone) trên cùng đề tài**. ĐACN đề xuất ý tưởng và thiết kế giải pháp; ĐATN hiện thực đầy đủ những tính năng ĐACN đã đưa ra (D-103) |
| **GVHD** | PGS. TS. Võ Thị Ngọc Châu |
| **Nhóm** | Golden Trio (nhóm 23, project 258) |
| **Repo** | `github.com/The-Golden-Trio/Capstone-Project` |

**Ý tưởng lõi:** JobQuest là web/game để người dùng **trải nghiệm một nghề càng thật càng tốt**: nhận vai, làm các tình huống công việc theo kiểu visual novel, và AI dẫn dắt, chấm điểm dựa trên cách họ xử lý. Sau đó **người dùng tự cảm nhận** mình có hợp nghề đó không. JobQuest **không** hướng nghiệp và **không** phán "bạn hợp ngành X".

Mỗi nghề có nhiều cấp, bắt đầu từ **L1 (intern)**. **Cấp cao nhất cần xác nhận:** không tới C-level; chưa có file nộp cô nào ghi rõ cấp cuối. Mỗi cấp có các **scenario** lấy từ task thật của nghề. Người chơi tích luỹ **kỹ năng**, và kỹ năng là "nhiên liệu" để lên cấp hoặc bay sang **nghề tương tự hay nghề thăng tiến** trên bản đồ ngân hà. **Phase 1 chỉ làm mảng IT.**

## Hiện trạng tại 30/9

| Mảng | Đã có | Chưa có |
|---|---|---|
| **Đề tài & định vị** | Đã chốt tên, scope IT, đối tượng "mọi người". Báo cáo 26/9: 8 BR, 6 DC, 45 yêu cầu (22 FR, 13 NFR, 10 DR), 13 use case, **2 vấn đề nghiên cứu**, lộ trình 5 giai đoạn. Phân vai 4 nhóm chốt 29/9 (D-16) | Sửa theo góp ý cô 26/9: 31 task T2609 (vai trò, BR/DC, user story → FR/NFR, sơ đồ, SMART), hạn T6 2/10 |
| **Báo cáo** | Chương 1 → 5.1, bản trình bày cô 26/9 (~62 trang, 98 tài liệu tham khảo), source Markdown ở `reports/2026-09-26_ch1-5/` | Bản sửa theo góp ý 26/9 (upload T6 2/10, gặp cô T7 3/10). Phần còn lại của Chương 5, Chương 6–8 *(báo cáo 26/9 §1.5)* |
| **Dữ liệu nghề** | 78 role IT (6 domain, thang L1–L10) → 22 role có skill, lương, graph, 97 sự kiện → 18 role chơi được | |
| **Spec kịch bản** | `spec-scenario-KHOI1.md` v2.2 + hướng dẫn sinh scenario | Thanh tiến độ và mở band, context theo kinh nghiệm người chơi, hợp nhất với hệ sự kiện |
| **Nội dung chơi được** | 2 kịch bản (Backend L1, L3), 43 sự kiện, quiz 6 câu | Kịch bản cho các nghề khác (DevOps và Solution Architect đã giao từ 27/8) |
| **Prototype web** | Chạy end-to-end: đăng nhập (email + Google), đồng ý giám hộ, quiz, **bản đồ ngân hà 3D**, quần đảo L1–L10, màn chơi (chat + văn phòng 2D), tổng kết, hành trang. Dùng DB thật | **AI sinh và chấm** (hiện chấm bằng từ khoá), đánh giá nghề 5 tiêu chí, random bối cảnh công ty, công cụ cho chuyên gia/admin |
| **Đánh giá** | **Mới có thiết kế trên giấy** (báo cáo 26/9 §4.2.2): hai giai đoạn, A là benchmark tổng hợp, B là câu trả lời thật do chuyên gia chấm; ngưỡng QWK và CVI (D-47, D-48) | Chưa dựng benchmark Giai đoạn A · chưa có chuyên gia (Giai đoạn B ở capstone) · chưa triển khai đo lường nào |
| **Thiết kế AI** (12/10) | Năm thành phần AI-1…AI-5, cách chấm, định nghĩa AI-native, công cụ và model dự kiến đem thử (D-89…D-97); viết ở báo cáo §5.2.3 (`reports/2026-10-02_ch1-5/`), đã trình cô 10/10 | Chưa đo gì: phép thử đầu tiên là T0610.17 · thang chấm, tiêu chí cho judge chờ game design (D-95) · yêu cầu và use case còn lệch với thiết kế này ([07](07-van-de-mo.md) A20) |

## Đã chốt gần đây (chi tiết ở [02](02-quyet-dinh.md))

- 23/9: **Get-to-know-me là tuỳ chọn** (D-29). **Người chơi học cả hard skill lẫn soft skill** (D-32).
- 29/9: **DE dùng hệ thống**, CA không phải business admin (D-16). **Miễn phí**, chừa chỗ logo nhà tài trợ và ô quyên góp (D-17).
- 7–9/10: **Kiến trúc AI năm thành phần**; DE đặt khoá chấm và duyệt seed, CA cùng AI dựng khung game (D-90). **Chấm không có đáp án mẫu**, panel ba judge khác họ, lấy trung vị (D-91). **AI-native là không có đường thay thế** khi AI lỗi (D-92). Thang chấm và tiêu chí chờ game design (D-95).
- 14–21/10: **Game design hồ sơ người chơi** (D-104 đến D-113): ba phần chỉ số RIASEC, soft skill 7 nhóm 5 bậc, keyword kỹ năng nghề; Get to know me chỉ chạm, không gọi AI; trang hồ sơ bốn tab; gợi ý nghề ba ô có công thức, đã kiểm với O\*NET; chòm sao buff 12%.

## Việc chưa làm (chi tiết ở [07](07-van-de-mo.md))

1. **Sửa báo cáo theo góp ý cô 26/9** (31 task T2609 và 6 task T0110 phát sinh 1/10, [tuần 40](tuan/2026-W40/tuan.md)), upload T6 2/10, gặp cô T7 3/10. Trong đó có **đổi căn cứ pháp lý**: NĐ 13/2023 đã hết hiệu lực (T0110.5).
2. **Tích hợp LLM:** thiết kế đã có ở báo cáo §5.2.3 (12/10); còn chạy phép thử đầu tiên để chọn model (T0610.17), rồi tích hợp vào code. Bộ thử là lượt DE chơi thử và chấm (D-93).
3. **Chốt ~22 role cuối và ~3 role pilot**, rồi tìm panel chuyên gia đầu (~9 người, tiêu chuẩn đã có ở D-62).

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
| [`templates/`](templates/bao-cao-dacn.md) | **Mẫu báo cáo ĐACN** (cấu trúc bắt buộc của báo cáo, kèm bảng đối chiếu) và mẫu meeting minutes |

## Quy ước giữ single source of truth

1. **Sau mỗi buổi họp** (kể cả họp trực tiếp): chạy `/capstone-meeting-minutes` với ghi chú, tin nhắn Discord hoặc transcript. Skill tạo minutes theo [`templates/meeting-minutes.md`](templates/meeting-minutes.md) trong `tuan/<tuần>/`, giao task có ID, và cập nhật `02`, `07`. Chat Discord chỉ để bàn, **kết luận phải về repo**.
2. **Quyết định mới:** thêm dòng vào `02`. **Không xoá dòng cũ**, đổi trạng thái thành ♻️.
3. **File nộp cô:** lưu bản cuối vào `submissions/` với tên `yyyy-mm-dd_Tên.ext`. Với báo cáo LaTeX, lưu thêm source vào `reports/yyyy-mm-dd_<slug>/` rồi chạy skill **`capstone-sync-report`** để cập nhật thư mục này (xem [`reports/README.md`](../../reports/README.md)).
4. **Cập nhật file này** khi hiện trạng thay đổi đáng kể (mỗi tuần một lần là đủ).
5. **Commit và PR** theo [`CONTRIBUTING.md`](../../CONTRIBUTING.md) (husky và check `pr-check` sẽ chặn nếu sai). Ghi `Task: T….` vào commit/PR làm task được giao. Chiều thứ 6 chạy `/capstone-weekly-progress` để đối chiếu task giao với việc làm được trong `tuan/<tuần>/tuan.md`.
