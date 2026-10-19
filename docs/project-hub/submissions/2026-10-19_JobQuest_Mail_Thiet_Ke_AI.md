# Mail gửi cô · 19/10/2026 · Xin góp ý phạm vi phần Thiết kế mô hình AI (§5.3.6)

- **Người gửi:** Châu Anh Nhật. CC Phúc, Nam. Gửi tối T2 19/10/2026 (dự kiến ban đầu là T4 21/10).
- **Đính kèm:** [`2026-10-19_JobQuest_Brief_Thiet_Ke_AI.pdf`](2026-10-19_JobQuest_Brief_Thiet_Ke_AI.pdf), 1 trang A4 ngang: hình flow AI, cách hiểu và phạm vi, quyết định mới (D-99 đến D-101), phép thử đầu, 4 câu hỏi. Ngày in trên brief là 21/10 vì soạn trước theo ngày dự kiến gửi.
- **Task:** T1910.2 ([tuần 43](../tuan/2026-W43/tuan.md)). Nguồn soạn: [`assets/ai-design/`](../assets/ai-design/README.md).
- **Không hỏi trong mail:** nguồn "sáu tiêu chí sản phẩm AI-native" (T1010.4, 07 B26). Để hỏi trực tiếp ở buổi T7 24/10.
- **Cô trả lời:** chưa có.

## Nguyên văn đã gửi

**Tiêu đề:** [JobQuest – nhóm Golden Trio] Xin cô góp ý phạm vi phần Thiết kế mô hình AI (§5.3.6)

Kính gửi Cô Võ Thị Ngọc Châu,

Em là Châu Anh Nhật, nhóm Golden Trio (đề tài JobQuest). Tuần này nhóm em bắt đầu viết mục 5.3.6 *Thiết kế mô hình AI* theo mẫu báo cáo ĐACN. Trước khi viết, nhóm em xin gửi Cô bản tóm tắt 1 trang đính kèm để Cô xem hướng nhóm định làm có đúng và có vượt phạm vi không ạ.

Tóm tắt ngắn:

1. Nhóm hiểu "mô hình AI" của JobQuest là **một hệ thống ghép nhiều mô hình ngôn ngữ lớn có sẵn**, đặt trong luật và có chuyên gia giám sát. Nhóm không huấn luyện mô hình riêng, vì điều đề tài cần chứng minh là cách ghép này có đáng tin không.
2. Phạm vi: nhóm thiết kế đầy đủ các thành phần AI (sinh scenario từ seed, chấm và phản hồi, dựng seed từ tri thức chuyên gia, chạy thử và xếp ca cho chuyên gia), và ở ĐACN chạy phép thử chứng minh khả thi cho phần sinh và phần chấm.
3. Theo gợi ý của Cô về trường hợp AI sập trên toàn cầu: nhóm dùng adapter gateway nhận được mọi nhà cung cấp. Một LLM chạy local có thể cắm vào làm dự phòng, nhưng nhóm chỉ nêu như ý tưởng, không hiện thực ở giai đoạn này.

Nhóm em xin Cô cho ý kiến bốn câu sau (cũng nằm ở cột phải của bản tóm tắt):

1. Cô có đồng ý cách hiểu "thiết kế mô hình AI" là thiết kế hệ thống ghép nhiều LLM, không huấn luyện mô hình riêng không ạ?
2. Ở ĐACN nhóm chạy phép thử chứng minh khả thi cho phần sinh và phần chấm. Mức này đã đủ chưa, hay Cô muốn nhóm làm sâu hơn phần nào ạ?
3. Ba chỗ dùng AI phụ (chân dung RIASEC, thiết kế trình bày, sinh hình) không thuộc vòng lõi sinh và chấm. Nhóm có nên đưa vào giải pháp không, hay bỏ để tập trung vào vòng lõi ạ?
4. Phép thử đầu với khoảng 30 bản ghi, nhóm đóng vai chuyên gia, có đủ làm bằng chứng cho mục 7.3 *AI-related evaluation* không ạ? Cô có thể kiểm giúp nhóm khoảng bao nhiêu bản ghi ạ?

Nếu tiện, Cô trả lời ngắn từng câu qua mail. Nếu không, nhóm em xin trao đổi thêm với Cô ở buổi gặp thứ Bảy 24/10 ạ.

Em xin thay mặt nhóm cảm ơn Cô ạ.

Châu Anh Nhật
Nhóm Golden Trio · JobQuest
