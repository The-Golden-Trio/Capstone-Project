# Tuần 43 · 19/10 → 25/10/2026

> Buổi họp T7/CN trước tuần này là buổi mở đầu tuần. Minutes: skill `/capstone-meeting-minutes`. Đối chiếu giao với làm được: skill `/capstone-weekly-progress` (thường chiều T6).

## Buổi họp

<!-- Mỗi buổi một dòng, link tới file minutes trong thư mục này. -->

## Task giao

| ID | Ai | Task | Hạn | Nguồn | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|
| T1010.1 | Nhật | Xử lý ý dựa vào Yoshida (judge không cần là reasoning model) ở slide 8 của deck AI và ở đoạn "Strength of the judge relative to the generator" của §5.2.3. Cô: *"hơi tranh cãi"* (07 B25; tiếp T0610.6). *Suy luận:* hướng xử lý là bỏ câu và nguồn này | T6 23/10 | ↪ 2026-W42, [10/10 gặp cô](../2026-W42/2026-10-10_gap-co.md) · chuyển từ Phúc sang Nhật 19/10 | ⏳ |  |
| T1010.2 | Nhật | Làm kỹ lại phần **"LLM judge có đáng tin không"**: slide 9 và đoạn "Reliability of a language-model judge" của §5.2.3 (07 B20; tiếp T2609.23). Lưu ý: đọc bản gốc các nguồn trước khi dùng con số; kết bằng cách nhóm tự kiểm định (dữ liệu, người chấm, chỉ số, ngưỡng) | T6 23/10 | ↪ 2026-W42, [10/10 gặp cô](../2026-W42/2026-10-10_gap-co.md) · chuyển từ Phúc sang Nhật 19/10 | ⏳ |  |
| T1010.3 | Nhật | Giải thích rõ hơn phần **AI-native**, nhất là **core loop**: slide 11 và đoạn "AI-native character and provider failure" của §5.2.3 (07 B2; tiếp T0610.10) | T6 23/10 | ↪ 2026-W42, [10/10 gặp cô](../2026-W42/2026-10-10_gap-co.md) · chuyển từ Phúc sang Nhật 19/10 | ⏳ |  |
| T1010.4 | Nhật | Tìm nguồn **"sáu tiêu chí của sản phẩm AI-native"** cô nêu (critical path, agentic mediation, retrieval value, feedback capture, một tiêu chí chưa rõ tên, supervised autonomy), rồi đối chiếu JobQuest với từng tiêu chí (07 B26). Lưu ý: hỏi lại cô nếu không tìm ra | T6 23/10 | ↪ 2026-W42, [10/10 gặp cô](../2026-W42/2026-10-10_gap-co.md) · chuyển từ Phúc sang Nhật 19/10 | ⏳ | Đã tìm hai lần 11/10, chưa ra nguồn |
| T1910.1 | Nhật | Vẽ lại **deployment diagram** của §5.3 (đoạn "Deployment" trong `report.md`) | T6 23/10 | Giao thêm 16/10, không qua buổi họp | ⏳ | Bản hiện tại: `reports/2026-10-02_ch1-5/latex/figures/jobquest_deployment.png` (chưa commit) |
| T1910.2 | Nhật | **Tổng hợp flow AI → Thiết kế mô hình AI (§5.3.6)**: tech stack, hạ tầng, pipeline dữ liệu. Các bước: (0) đưa các sửa tay trong `.tex` của bản 16/10 về `report.md`; (1) kiểm kê mọi thứ về AI đang có; (2) hình flow AI end-to-end và hình đường đi của dữ liệu; (3) brief khoảng 2 trang và mail xin cô xác nhận phạm vi trước khi viết (Nhật gửi); (4) viết các phần không phụ thuộc câu trả lời của cô; (5) viết §5.3.6 sau buổi gặp cô. Từ 19/10 Nhật nhận luôn T1010.1 đến T1010.4 (§5.2.3), nên §5.2.3 và §5.3.6 cùng một người viết. Ý tưởng LLM local làm fallback ghi ở D-98 (không hiện thực) | T6 23/10 (mail: T4 21/10) | Giao thêm 19/10, không qua buổi họp | ⏳ | Bước 0 xong 19/10: [`reports/2026-10-16_ch1-5/report.md`](../../../../reports/2026-10-16_ch1-5/report.md), `md2tex.py` nhận thêm khối `usecase` và ảnh có độ rộng riêng. Bước 1 xong 19/10: [kiểm kê thiết kế AI](../../assets/ai-design/kiem-ke.md). Bước 2–3 xong 19/10: hai hình, brief 1 trang; **mail đã gửi 19/10** ([bản lưu](../../submissions/2026-10-19_JobQuest_Mail_Thiet_Ke_AI.md)), chờ cô trả lời. Quyết định D-99 đến D-102 |

## Làm thêm ngoài task giao

<!-- capstone-weekly-progress: việc có trong git/PR nhưng không gắn với task nào ở trên. -->

## Đã nộp / trình bày cho cô

<!-- Report, deck, demo. capstone-sync-report và capstone-meeting-minutes ghi vào đây. -->

- 19/10 (T2): Nhật gửi mail xin cô góp ý phạm vi phần Thiết kế mô hình AI (§5.3.6), kèm brief 1 trang. Lưu ở [`submissions/2026-10-19_JobQuest_Mail_Thiet_Ke_AI.md`](../../submissions/2026-10-19_JobQuest_Mail_Thiet_Ke_AI.md). Chờ cô trả lời (4 câu hỏi)

## Theo người

<!-- capstone-weekly-progress: mỗi người 3–8 dòng, Đã xong / Đang làm / Quy ước. -->

## Chuyển sang tuần sau

<!-- Task ↪ và việc cần để ý. -->
