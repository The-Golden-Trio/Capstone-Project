# 07 · Vấn đề mở, cần chốt

> Đã chuyển sang [02](02-quyet-dinh.md) ngày 23/9: Get-to-know-me tuỳ chọn (D-29), học cả hard lẫn soft skill (D-32).

> Danh sách việc **phải có người quyết định**. Chốt xong thì ghi vào [02](02-quyet-dinh.md) và đánh dấu ✅ ở đây kèm ngày.
> Ưu tiên: 🔴 chặn báo cáo hoặc code tuần tới · 🟠 cần chốt trong tháng · ⚪ để sau cũng được

---

## A. Mâu thuẫn giữa các nguồn (đang nói hai kiểu)

| # | Ưu tiên | Vấn đề | Các phía đang nói gì | Cần ai chốt |
|---|---|---|---|---|
| A3 | 🟠 | **Tên sản phẩm: JobQuest hay Vào Nghề?** | Mọi file nộp cô: JobQuest. App: "Vào Nghề" | Phúc |
| A4 | 🟠 | **Bản đồ: giữ hệ sao và đường nối, hay bỏ?** | Code: 22 hành tinh, 64 đường nối. Nam 18/9: thiên hà → hệ sao → carousel hành tinh (tham khảo Plants vs Zombies). Nam 20/9: bỏ hệ sao và đường nối, toạ độ tính từ skill | Cả nhóm |
| A5 | 🟠 | **Điểm tính chung, hay tách domain point / skill point?** | Code: một loại XP theo skill. Đề xuất 18/9 và 20/9: tách theo domain/career, thêm achievement | Cả nhóm |
| A6 | 🟠 | **BR-01 và BR-03 nghe như mâu thuẫn** | BR-01: cấp đầu mọi nghề mở. BR-03: vào nghề kề cần năng lực trùng. Nếu ý là "BR-03 cho vào thẳng cấp cao hơn của nghề kề" thì phải ghi rõ trong báo cáo | Người viết Ch.4 |
| A7 | ⚪ | **Đánh giá nghề sau mỗi task hay sau cả nghề?** | Minutes 27/8: sau mỗi task. Deck 7/9 và BR-04: sau khi xong cả nghề, 5 tiêu chí. Code: chấm sao độ thực tế sau mỗi màn | Đã nghiêng về "sau cả nghề", cần xác nhận |

## B. Nhận xét của cô 19/9 chưa xử lý

| # | Ưu tiên | Việc | Gợi ý |
|---|---|---|---|
| B1 | 🔴 | Viết lại **Objectives** thành mục tiêu, không phải danh sách task | Dùng câu cô gợi ý (xem [05](05-bien-ban-hop.md#gap-co-199)) |
| B2 | 🔴 | Phần solution phải **thể hiện được AI-native**, và so với các hệ thống AI-native hiện có | Gắn với việc AI sinh, dẫn truyện và chấm. Hiện code **chưa có AI** (xem C1) |
| B3 | 🔴 | **Bối cảnh vận hành:** ai chạy, hạ tầng AI do ai cung cấp, doanh thu từ đâu, tìm domain expert ở đâu | Viết vào §4.1 báo cáo |
| B4 | 🟠 | Gati (1996) quá cũ → phân tích lại bối cảnh chọn nghề, thêm nguồn mới | Chương 1–2 |
| B5 | 🟠 | Scope: chỉ nêu cái **trong** scope | Bỏ mục "Explicitly not" / non-goals |
| B6 | 🟠 | Business rule đang là ràng buộc hệ thống → viết lại **gắn với người dùng** | §4.1.3 |
| B7 | 🟠 | Trả lời câu hỏi của cô về Get-to-know-me | Đã chốt là **tuỳ chọn** (D-29) → sửa báo cáo và slide cho khớp |
| B8 | ⚪ | Cân nhắc **mức độ trưởng thành nghề nghiệp** để chia level | Tìm lý thuyết về career maturity (Super, Crites) |
| B9 | ❓ | Ba câu hỏi xin cô quyết định (C1–C8, Must/Should, thiết kế đánh giá) | **Chưa có ghi chép cô trả lời** → ai dự buổi 19/9 bổ sung giúp |

## C. Khoảng trống lớn giữa đề tài và code

| # | Ưu tiên | Khoảng trống |
|---|---|---|
| C1 | 🔴 | **Chưa tích hợp LLM** (sinh, dẫn truyện, chấm). Cần chọn provider, và theo BR-09 model chấm phải khác họ với model sinh. Cần ước chi phí mỗi lượt chơi (NFR-11) |
| C2 | 🔴 | **Chưa xác định domain expert.** Script 19/9 có lưu ý: nếu chính nhóm chấm bộ chuẩn thì cô sẽ hỏi tính độc lập ở đâu |
| C3 | 🟠 | Nội dung quá mỏng: 2 kịch bản, 1 nghề. Task 27/8 (DevOps, Solution Architect) chưa làm |
| C4 | 🟠 | Chưa có công cụ viết seed và duyệt (FR-15, FR-16, NFR-10 đều Must) |
| C5 | 🟠 | Chưa có đánh giá nghề 5 tiêu chí (FR-12) và random bối cảnh công ty |
| C6 | ⚪ | Get-to-know-me 6 câu tự soạn, chưa kiểm định. 81/97 sự kiện là C_INFERRED |

## D. Câu hỏi thiết kế còn treo từ spec kịch bản (`spec-scenario-KHOI1.md`, mục "CÒN THIẾU")

1. **Thanh tiến độ và mở khoá band:** bao nhiêu scenario thì đầy thanh? chơi lại có tính không? có tụt band không?
2. **Context theo kinh nghiệm người chơi:** NPC có đối xử khác với người mới và người chơi lâu không? (đánh đổi: hai người sẽ không còn so sánh được với nhau)
3. **Hợp nhất hệ sự kiện** (97 sự kiện, 8 chiều fit) **với hệ kịch bản** (kỹ năng +2/0/−1): sự kiện có cần `job_scope` không? một lựa chọn có phát cả hai loại tín hiệu không? mức C_INFERRED nào thì đủ tin để đưa vào đánh giá?
4. RP-3: ngưỡng năng lực để sang nghề kề do chuyên gia đặt. Vậy phần nghiên cứu nằm ở đâu?

## E. Pháp lý và dữ liệu

- Code và báo cáo dựa trên **NĐ 13/2023/NĐ-CP** cho ngưỡng đồng ý dưới 16 tuổi. Cần **kiểm lại văn bản đang có hiệu lực** trước khi nộp.
- Gửi câu trả lời của người dùng cho nhà cung cấp LLM ở nước ngoài là chuyển dữ liệu ra nước ngoài. Script thuyết trình 19/9 hẹn câu này ở §5.3.10, nhưng **mục đó chưa được viết** (báo cáo mới tới 5.1).

## F. Dọn dẹp repo (xem [04 §7](04-hien-trang-code-data.md#7-nợ-kỹ-thuật--dọn-dẹp-chưa-ai-làm))

- Viết `README.md` mới (bản cũ đã archive), xoá code chết `apps/api/src/app/{skills,career-graph,persistence}`, quyết số phận PR #1, commit sơ đồ flow, đưa source LaTeX Ch.1–5 và landing page vào repo.
