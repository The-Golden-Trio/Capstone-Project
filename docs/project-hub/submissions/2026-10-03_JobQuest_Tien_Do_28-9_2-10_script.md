# Script thuyết trình · Tiến độ 28/9 – 2/10

Deck: [2026-10-03_JobQuest_Tien_Do_28-9_2-10.html](2026-10-03_JobQuest_Tien_Do_28-9_2-10.html) · 13 slide · khoảng 9 phút.

---

## Slide 1 · Bìa (20 giây)

Em chào cô. Hôm nay em báo cáo những gì nhóm đã sửa trong bản nộp báo cáo Chương 1 đến 5 ngày 2/10. Các thay đổi này làm theo góp ý của cô ở buổi 19/9 và 26/9, và hai email ngày 23/9 và 1/10.

## Slide 2 · Mục lục (15 giây)

Em trình bày theo ba phần: vai trò và business rule; design constraint; và mục tiêu cùng phần tổng quan tài liệu.

## Slide 3 · 01 Vai trò và business rule (10 giây)

Phần đầu là góp ý của cô buổi 26/9: Content Admin không phải business admin, nên nhóm phải chốt lại các vai trò.

## Slide 4 · Bốn vai trò sau khi chốt lại (60 giây)

Hệ thống giờ có bốn vai trò.

- **Explorer** là người dùng cuối: chơi các scenario của nghề, rồi tự cảm nhận mình có hợp nghề đó không.
- **Domain Expert** dùng hệ thống trực tiếp. Chuyên gia soạn nội dung chuyên môn (fact, năng lực cần thể hiện, các lựa chọn và đáp án, rubric) và duyệt scenario ngay trong hệ thống.
- **Content Admin** không soạn nội dung chuyên môn. CA lo layout và cách trình bày trong màn chơi, duyệt nghề như một tổng thể, xuất bản, và vận hành vòng đời nội dung.
- **System Admin** chỉ lo phần hệ thống: vận hành, model, tài khoản.

Nhóm đã bỏ cụm "business administrator" khỏi báo cáo, thêm user story cho Domain Expert, và chia lại cột nhóm của FR-15 đến FR-21 theo bốn vai trò này.

## Slide 5 · Business rule: sửa, bỏ và chuyển chỗ (75 giây)

Đây là các luật đã thay đổi.

- **BR-03:** BR-01 và BR-03 trước đây nghe như mâu thuẫn. Nay BR-03 ghi rõ: năng lực trùng với nghề kề được tính vào các cấp của nghề kề. Hai luật bổ sung cho nhau: BR-01 giữ cấp đầu của mọi nghề luôn mở, còn BR-03 cho người chơi không phải bắt đầu lại từ đầu.
- **BR-08:** cô nhận xét đây là biện pháp riêng tư, không phải business rule. Nhóm đã bỏ nó khỏi bảng BR và gộp nội dung vào NFR-06: số liệu chỉ công bố dạng tổng hợp.
- **BR-11:** cô thấy khó hiểu, nên nhóm viết lại thành: *chơi lại một scenario không thể nâng năng lực vượt mức điểm scenario đó có thể cho*. Nhóm giữ luật này vì nếu không có trần, người chơi có thể chơi lại một scenario nhiều lần để mở cấp.
- **BR-12:** theo ý cô, nhóm bỏ luật này. Hành vi vẫn được giữ bằng trường "loại lượt chơi" trong DR-07: lượt review và lượt test bị loại khỏi số liệu.
- **Cardinality:** báo cáo không có hai luật cardinality như trong deck nên không có gì phải xoá. Nhóm thêm câu "một người có thể giữ nhiều vị trí ở giai đoạn đầu", và giữ mức 3 đến 4 chuyên gia mỗi role.

## Slide 6 · Bốn business rule mới về vòng đời (50 giây)

Cô nhận xét báo cáo còn thiếu luật về vòng đời, nên nhóm thêm bốn luật:

- **BR-13:** nội dung chỉ tới người chơi khi Content Admin xuất bản, và muốn xuất bản thì seed phải đã được duyệt.
- **BR-14:** khi sửa một seed, các scenario sinh từ seed cũ bị rút lại cho tới khi seed mới được duyệt.
- **BR-15:** chuyên gia kiểm định lại nội dung đã xuất bản hằng năm, vì công việc thực tế của nghề thay đổi.
- **BR-16:** nghề đã retired vẫn nằm trong hồ sơ của người từng chơi, nhưng không bắt đầu mới được.

Bốn luật này sẽ được đối chiếu lại khi có sơ đồ state machine vòng đời mà Nhật đang vẽ.

## Slide 7 · 02 Design constraint (10 giây)

Phần thứ hai là design constraint. Cô yêu cầu mỗi DC phải cho thấy nó được dẫn xuất từ NFR nào.

## Slide 8 · Bốn design constraint còn lại (50 giây)

Bảng DC giờ có cột "Derived from", và mỗi DC có ít nhất một NFR gốc.

- **DC-01:** mô hình chấm và mô hình sinh thuộc hai họ khác nhau, dẫn xuất từ NFR-14 về độ chính xác của việc chấm.
- **DC-02:** thay nhà cung cấp model mà không phải sửa logic lõi, từ NFR-12 và NFR-04.
- **DC-03:** tuân thủ Luật Bảo vệ dữ liệu cá nhân 91/2025 và Nghị định 356/2025, từ NFR-05 và NFR-06.
- **DC-05:** hệ thống là web app, dùng qua trình duyệt, không cần cài đặt, từ NFR-13.

Câu chữ của DC-01 và DC-02 được viết lại theo đúng câu cô gửi trong email 1/10.

## Slide 9 · Những gì đã chuyển ra khỏi DC (50 giây)

Có hai DC đã được chuyển ra khỏi bảng:

- **DC-04, trần chi phí:** cô nhận xét đây là giải pháp chứ không phải ràng buộc, và trong email 1/10 cô nghiêng về NFR. Vì vậy yêu cầu đo được nằm ở NFR-11, còn trần chi phí được mô tả ở §4.1.5 như một cơ chế quản lý chi phí.
- **DC-06** trở thành hành vi của FR-04: mỗi scenario sinh ra đều được kiểm tự động với seed của nó.

Để mọi DC đều có NFR gốc, nhóm thêm hai NFR:
- **NFR-14:** QWK giữa máy chấm và chuyên gia từ 0,70 trở lên.
- **NFR-15:** scenario sinh ra giữ ít nhất 95% fact mà seed yêu cầu.

## Slide 10 · 03 Mục tiêu và tài liệu (10 giây)

Phần cuối là mục tiêu và tổng quan tài liệu. Ở buổi 19/9 và 26/9 cô góp ý rằng Objectives phải là mục tiêu, theo SMART, và phải ánh xạ được vào mục tiêu chung.

## Slide 11 · Ánh xạ vào mục tiêu chung (60 giây)

Mục tiêu chung là giúp một người đang phải chọn nghề được trải nghiệm công việc của nghề, được đánh giá mình làm tốt đến đâu, rồi dùng kết quả đó để quyết định nên khám phá nghề nào tiếp, trước khi cam kết với một nghề.

Bốn mục tiêu cụ thể, mỗi mục tiêu lo một phần của mục tiêu chung:

- **Mục tiêu 1:** trải nghiệm đúng công việc của nghề. Gắn với vấn đề nghiên cứu RP-1.
- **Mục tiêu 2:** người dùng biết mình đã làm tốt đến đâu. Gắn với RP-2.
- **Mục tiêu 3:** biến kết quả đó thành quyết định khám phá nghề nào tiếp. Mục tiêu này hiện thực qua thiết kế hệ thống.
- **Mục tiêu 4:** người dùng có được điều này trước khi cam kết với một nghề, và không phụ thuộc khả năng chi trả. Mục tiêu này hiện thực qua mô hình kinh doanh.

Trong báo cáo, mỗi mục tiêu có phạm vi, chỉ tiêu đo được và mốc thời gian: cuối giai đoạn này (hết 2026) hoặc cuối giai đoạn capstone (2027).

> *Nếu cô hỏi chỉ tiêu (§1.2):* MT1: giữ ≥ 95% fact (2026), chuyên gia chấm I-CVI ≥ 0,78 và S-CVI ≥ 0,90 (2027). MT2: QWK ≥ 0,70, chênh lệch điểm trung bình chuẩn hoá (SMD) ≤ 0,15, thấp hơn mức đồng thuận giữa các chuyên gia không quá 0,10 (2027). MT3: mở cấp đúng ngưỡng, nghề kề khớp taxonomy (2026). MT4: không thu phí, chi phí mỗi phiên trong trần (2026).

## Slide 12 · LLM judge có đáng tin không? (60 giây)

Cô yêu cầu bằng chứng đã công bố rằng LLM judge đáng tin. Nhóm đã thêm vào §2.5 một đoạn dựa trên năm nguồn, và kết luận chỉ đúng khi có điều kiện:

- Một bài tổng hợp 65 nghiên cứu chấm bài luận cho thấy mức đồng thuận giữa LLM và người chấm phụ thuộc rất nhiều vào bối cảnh, và nhiều kết quả dưới ngưỡng 0,70.
- Khi model mạnh, có rubric rõ và có ví dụ đã chấm, kết quả gần ngang người chấm. Ví dụ, GPT-4 đạt kappa 0,70, so với 0,75 giữa hai người chấm.
- Khi không có các điều kiện đó, một model nhỏ chỉ đạt khoảng 0,5.
- Chấm nhiều lần cho kết quả rất nhất quán, nhưng nhất quán không có nghĩa là chấm đúng.

Chưa có nghiên cứu nào về task nghề nghiệp, nên nhóm không suy ra độ tin cậy từ tài liệu mà phải tự đo với chuyên gia. Đó chính là NFR-14.

## Slide 13 · Cảm ơn (15 giây)

Phần báo cáo của em đến đây là hết. Nhóm xin ý kiến của cô về các thay đổi này, nhất là cách viết lại business rule và các design constraint. Em cảm ơn cô.
