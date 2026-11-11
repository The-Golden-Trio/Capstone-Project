# Thư viện câu hỏi có/không cho 42 mục con soft skill (bản v4.1, sau QA lần 3 và test mù lại, chờ DE kiểm)

## Bối cảnh chấm (đã chốt)
- Mỗi màn chọn 3–6 mục con, ghi `from`: lấy bằng chứng từ nút nào hoặc từ pha xử lý.
- Judge (AI-5) chấm theo **đoạn bằng chứng**: một nút viết (câu trả lời + follow-up) hoặc cả một pha xử lý (chat với NPC, mở tài liệu, tự mô tả hành động; mỗi hành động là một dòng nhật ký hành động có mã).
- Mỗi đoạn, mỗi mục con: mức 0/1/2, hoặc "không xét". Mức của mục con trong màn = trung bình các đoạn. Điểm nhóm trong màn = trần nhóm × (trung bình mức các mục con của nhóm ÷ 2 − hệ số phạt × số cờ giao cho nhóm); phạt 0,25 (L1–L2) · 0,35 (L3–L5) · 0,5 (L6+). Điểm nhóm trong một màn có thể âm (D-116); chơi lại giữ kết quả cao nhất (D-119).
- `signs` của seed chỉ là minh hoạ. Chấm theo thông tin người chơi có lúc quyết định. Lời NPC chỉ là bối cảnh.
- Hết giờ ở câu đếm giờ = mức 0, không cờ. Nút chưa tới vì hết thời gian = không xét. Dùng hint = giảm trọng số.

## Phạm vi của thư viện
- **Thư viện chỉ dùng cho đoạn viết tự do:** pha xử lý, nút tự luận / email / code rút gọn, và câu "vì sao" đi kèm nút đóng.
- **Nút đóng** (trắc nghiệm, chọn nhiều, sắp thứ tự, ghép cặp, đúng/sai, lựa chọn đếm giờ) chấm bằng **profile phương án** do chuyên gia lập (D-81), trên cùng thang 0/1/2 + cờ. Không áp checklist A/B/C lên lựa chọn.
- **Hành động** (mở tài liệu, chạy thử, gọi họp…) làm bằng chứng được: câu trích là **mã dòng nhật ký hành động**; code kiểm mã có thật. "Người chơi đã được nghe quy định" cũng kiểm bằng nhật ký: mã dữ kiện của quy định đã mở cho người chơi.
- Vì nút đóng không dùng thư viện, mục con muốn lấy bằng chứng từ một tình huống chỉ có nút đóng (ví dụ cuộc gọi đếm giờ) thì seed ghi `from: pha xử lý` cho phần người chơi nói thêm ngoài lựa chọn.

## Quy ra mức (đổi so với v1)
- **A = hành vi lõi.** Có A → mức 1.
- **B và C = hai cách làm tốt hơn.** Có A và (B hoặc C) → mức 2.
- Không có A → mức 0, dù có B hay C.

## Luật viết câu hỏi
1. Mỗi câu một hành vi quan sát được; "có" luôn là tốt.
2. Không dùng từ mơ hồ (phù hợp, tốt, hiệu quả).
3. Mỗi câu thoả được bằng một câu nói; B, C là hành vi khác chứ không phải "chi tiết hơn".
4. Hỏi có làm, không hỏi không làm; tránh hành vi xấu thì đưa sang cờ.
5. Mỗi mục con có "Xét khi". Tình huống do seed dựng: **seed đã dựng thì luôn xét**, kể cả khi người chơi né (né thì ra 0). Không có tình huống thì cả mục con không xét.
6. Judge trả lời từng câu, trích nguyên văn (hoặc mã hành động) trước, kết luận sau; code kiểm câu trích; không khớp thì tính "không".
7. Chấp nhận cách nói vòng, lễ phép của người Việt; câu chào, xưng hô, "dạ", "xin lỗi làm phiền" không tính là mở đầu chậm; xét chức năng câu, không dò từ khoá.
8. Chỉ chấm lời và hành động của người chơi.
9. AI-5 khác họ model với AI-4.
10. Quy định trong màn viết hiểu được hai cách thì judge đọc theo cách có lợi cho người chơi (không cờ C8, 7.3 vẫn chấm bình thường). Người viết seed phải viết quy định chỉ hiểu một cách (ví dụ "chỉ một trong hai: …").

## Luật trùng
Mỗi màn chỉ chọn một mục trong mỗi nhóm trùng sau:
- 7.1 Trung thực ↔ 5.6 Tự chịu trách nhiệm
- 2.5 Nhận feedback ↔ 6.4 Sửa sai (ưu tiên 6.4 vì đo hành động sửa) ↔ 2.2 Kiểm soát cảm xúc
- 3.1 Ra quyết định ↔ 4.3 So sánh giải pháp
- 3.6 Chiến lược dài hạn ↔ 4.5 Tư duy hệ thống
- 1.3 Lắng nghe, hỏi làm rõ ↔ 3.5 Hiểu khách hàng
- 7.2 Giữ bí mật ↔ 7.5 Ranh giới
- 1.2 Giải thích cho người không chuyên ↔ 2.6 Nhạy cảm với khác biệt
- 7.4 Giữ lời hứa ↔ 5.5 Dưới deadline (cùng có "báo lại khi không kịp")
- 4.1 Tư duy phản biện ↔ 4.7 Dùng AI (màn có công cụ AI và giả định cần soi đến từ AI thì chọn 4.7)

## Cờ chung
| Cờ | Hành vi | Không tính khi |
|---|---|---|
| C1 | Xúc phạm, hạ thấp năng lực hay giá trị của người khác | Lời cộc, giục, ra lệnh thẳng. Gạt cảm xúc ("khóc gì") tính C11. Xúc phạm dựa trên nhóm người tính C12 |
| C2 | Chế giễu, đùa trên lưng người khác, nói kẻ cả ("cái này dễ mà cũng không biết") | Giục, yêu cầu thẳng ("đừng làm chậm tụi em") |
| C3 | Đổ phần lỗi của mình cho người khác | Nêu phần của người khác **kèm** nhận phần mình gắn với một việc cụ thể ("em sai rồi" chung chung không đủ) |
| C4 | Bịa điều chưa xảy ra: khẳng định một dữ kiện, số liệu, kết quả hay việc đã làm mà không có nguồn nào trong màn, hoặc trái với điều người chơi đã biết | Nói nhẹ đi một sự cố đã biết tính C5. Nói có rào ("có thể"). Lặp lại kết quả của công cụ hay người khác mà chưa kiểm (chấm ở 4.6, 4.7) |
| C5 | Che hoặc nói nhẹ đi một lỗi, sự cố hay vi phạm người chơi **đã biết** (con số, phạm vi), kể cả nói "không có gì", "đều đúng quy trình" | Rào đón lịch sự ("hơi có vấn đề tí") khi chưa biết mức thật |
| C6 | Lộ thông tin bí mật cho người hay công cụ không có quyền | Người chơi không có cách biết thông tin là bí mật (không nhãn, không quy định đã nghe) |
| C7 | Hứa chắc chắn một kết quả chưa chắc làm được; hoặc tới mốc đã hứa mà không làm và không báo | Rào đón "dạ chắc…", "em cố…" |
| C8 | Làm trái một quy định mà người chơi **đã được nghe** trong màn | Người chơi chưa từng được nghe quy định |
| C9 | Từ chối một yêu cầu hợp lý thuộc vai mình ("không phải việc của em") | Từ chối việc ngoài vai, giữ bí mật, từ chối quà đúng mực |
| C10 | Đe doạ, gây sức ép | |
| C11 | Gạt người khác ra: nói chen, phớt lờ câu hỏi, gạt cảm xúc hay mối lo của họ ("khóc gì", "kệ ổng", "đừng hỏi nữa") | Có trả lời vào mối lo, dù lý do yếu (chấm ở mục con) |
| C12 | Rập khuôn, phân biệt đối xử (tuổi, giới, vùng miền…) | |
| C13 | Nhận công người khác, lừa người khác để mình có lợi | Nhận quà, tiền trái quy định đã nghe tính C8. Che giấu khi báo cáo tính C4 hoặc C5 |

**Cách áp dụng cờ (v4):**
- **Mọi cờ xét ở cấp màn**, trên mọi đoạn, không cần mục con mang cờ đó được chọn.
- **Judge chỉ liệt kê cờ:** mã cờ, câu trích (hoặc mã hành động), đoạn. Việc giao cờ cho nhóm và tính phạt do code làm.
- **Mỗi cờ có một nhóm nhận phạt:** C1, C2, C10, C11, C12 → nhóm 2 · C3, C4, C5, C6, C7, C8, C13 → nhóm 7 · C9 → nhóm 1. Màn không có trần nhóm nhận phạt thì code trừ vào nhóm có trần lớn nhất của màn theo `point_budgets`. *(Phúc chốt 5/11.)*
- **Một câu có thể sinh nhiều loại cờ** nếu mỗi loại là một tác hại riêng (ví dụ vừa doạ vừa phớt lờ). Với các cặp gần nhau, chỉ gắn cờ cụ thể hơn: C12 thay C1 khi lời xúc phạm dựa trên nhóm người · C5 thay C4 khi nói nhẹ đi một sự cố đã biết · C8 thay C13 khi hành vi trái quy định đã nghe · C6 thay C8 khi hành vi trái quy định chính là làm lộ thông tin.
- **Ép về 0:** cờ nặng C4, C5, C6, C8 ép về 0 ở đoạn chứa câu vi phạm: (a) mục con mang cờ đó (cột Cờ), và (b) mọi mục con có câu trích nằm trong **cùng một lượt nói** với câu vi phạm. Một lượt nói là: một tin nhắn, một câu trả lời nút, một câu trả lời follow-up (tách khỏi câu trả lời nút), hoặc một dòng nhật ký hành động. Code kiểm (b) bằng mã lượt nói.
- Cột Cờ trong bảng là cờ hay gặp của mục con, dùng cho luật ép về 0 và để judge chú ý; không giới hạn việc bắt cờ.
- Mỗi loại cờ tính **tối đa một lần mỗi màn**.

## Nhóm 1 · Giao tiếp & hợp tác
| # | Mục con | Xét khi | A (lõi) | B | C | Cờ |
|---|---|---|---|---|---|---|
| 1.1 | Viết rõ ràng, ngắn gọn | Nút email/báo cáo, hoặc tin nhắn báo cáo gửi người khác | Trong hai câu đầu (không tính chào hỏi, xưng hô, xin lỗi làm phiền) có nêu điều chính? | Có nói rõ người nhận cần làm gì? | Có kèm con số hay bằng chứng cụ thể cho điều chính? | C4 |
| 1.2 | Giải thích cho người không chuyên | Người chơi giải thích một điều chuyên môn cho người khác chuyên môn (không giải thích gì thì không xét) | Điều chính có được nói bằng lời người không chuyên hiểu được? | Có nói vấn đề ảnh hưởng gì tới chính người đó? | Có dùng ví dụ hoặc so sánh quen thuộc? | — |
| 1.3 | Lắng nghe chủ động, hỏi làm rõ | Có người đưa thông tin, yêu cầu, phàn nàn chưa rõ | Có hỏi ít nhất một câu để làm rõ điều người kia nói hoặc cần? | Có nhắc lại hoặc tóm ý người kia để xác nhận? | Có hỏi tiếp dựa trên câu trả lời vừa nhận? | — |
| 1.4 | Phối hợp đồng đội, liên phòng ban | Việc cần người/nhóm khác tham gia | Có nhờ đúng người/nhóm nắm việc làm một việc cụ thể? | Có thống nhất lúc cần xong (giờ, ngày, hoặc mốc tương đối như "trước khi deploy")? Chỉ nói việc dùng cho dịp nào ("cho đêm thứ Sáu") chưa tính | Có chia rõ phần mình làm và phần họ làm? | C9 |
| 1.5 | Chia sẻ thông tin, cập nhật đúng lúc | Tình hình thay đổi, hoặc có người đang chờ kết quả | Có chủ động báo cập nhật cho người đang chờ? | Có nói hiện trạng cụ thể (đã xong gì hoặc còn gì)? | Có hẹn mốc cập nhật tiếp? | C5 |
| 1.6 | Hỗ trợ đồng nghiệp | Đồng nghiệp gặp khó hoặc nhờ giúp | Có đưa một giúp đỡ cụ thể (thông tin, cách làm, thời gian)? | Có hỏi họ đang vướng ở đâu trước khi giúp? | Có hỏi lại đã ổn chưa? | C9 |

## Nhóm 2 · Trí tuệ cảm xúc & xử lý xung đột
| # | Mục con | Xét khi | A (lõi) | B | C | Cờ |
|---|---|---|---|---|---|---|
| 2.1 | Đồng cảm | Người kia bày tỏ lo lắng, khó chịu, áp lực | Có ghi nhận cảm xúc hoặc mối lo của họ? | Có nói ra điều họ đang sợ, hoặc đang chờ được nghe? | Có chỉnh đề xuất để gỡ đúng mối lo đó? | — |
| 2.2 | Kiểm soát cảm xúc | Bị chỉ trích, nói nặng, tình huống căng | Có đáp lại bằng lời lẽ bình tĩnh, tập trung vào vấn đề? | Có đưa hướng xử lý? | Có thêm bước chủ động (hẹn trao đổi riêng, hẹn cập nhật)? | — |
| 2.3 | Xử lý bất đồng, hoà giải | Seed dựng hai ý kiến trái nhau | Có nói ra chỗ hai bên khác nhau? | Có hỏi hoặc nhắc lý do của bên kia? | Có đề xuất phương án hoặc tiêu chí chung để chọn? | — |
| 2.4 | Cho feedback xây dựng | Người chơi cần góp ý người khác | Có chỉ ra một việc cụ thể cần sửa? | Có nói ảnh hưởng của việc đó? | Có gợi ý cách cải thiện? | — |
| 2.5 | Nhận feedback | Người chơi nhận góp ý | Có ghi nhận nội dung góp ý (nhắc lại hoặc thừa nhận điểm được góp, không chỉ "dạ vâng")? | Có hỏi lại để hiểu rõ? | Có nêu một việc cụ thể sẽ đổi (bước, công cụ, thời điểm)? | C3 |
| 2.6 | Nhạy cảm với khác biệt | Người đối diện khác vai trò, tuổi, văn hoá, chuyên môn, hoặc có nhu cầu riêng | Có đổi cách nói hoặc cách làm cho hợp một đặc điểm cụ thể của người đó (tuổi, vai trò, chuyên môn, nhu cầu)? Xưng hô lễ phép thông thường không đủ | Có hỏi hoặc tính tới nhu cầu riêng của họ? | Có đổi cách làm hoặc kênh liên lạc cho hợp? | — |
| 2.7 | Xây dựng và giữ quan hệ | Sau khi được giúp, hoặc sau một va chạm | Có cảm ơn hoặc ghi nhận cụ thể việc người kia đã làm? | Có hỏi han tình hình của họ? | Có đề nghị giúp lại hoặc hẹn phối hợp tiếp? | C13 |

## Nhóm 3 · Lãnh đạo & tư duy kinh doanh
| # | Mục con | Xét khi | A (lõi) | B | C | Cờ |
|---|---|---|---|---|---|---|
| 3.1 | Ra quyết định, chịu trách nhiệm | Cần chọn hướng trong phạm vi được quyết | Có chọn một hướng rõ ràng? | Có nêu lý do gắn với thông tin trong màn? | Có nói sẽ theo dõi hệ quả thế nào? | C3 |
| 3.2 | Giao việc, dẫn dắt, mentor | Có người cần hướng dẫn hoặc việc để giao (thường L4+) | Có giao một việc cụ thể kèm kết quả mong đợi? | Có nói hạn hoặc mức ưu tiên? | Có hướng dẫn cách làm hoặc hẹn kiểm tra giữa chừng? | C13 |
| 3.3 | Thuyết phục, đàm phán, stakeholder | Cần người khác đồng ý, hoặc lợi ích các bên khác nhau | Có trả lời khúc mắc hoặc phản đối của người kia bằng thông tin, lý do hay phương án nhắm vào đúng khúc mắc đó? Chỉ gọi tên hay ghi nhận khúc mắc ("em hiểu anh lo…") chưa đủ | Có nêu lý do gắn với điều họ quan tâm? | Có đưa nhượng bộ, phương án khác hoặc bước nhỏ để đi tới đồng ý? | C7 |
| 3.4 | Chi phí – lợi ích – rủi ro | Có từ hai cách làm, hoặc cách làm có rủi ro | Có nêu một rủi ro hoặc chi phí của phương án mình chọn? | Có nêu cách giảm rủi ro đó? | Có so phương án đó với một phương án khác về lợi và hại? | — |
| 3.5 | Hiểu khách hàng, giá trị kinh doanh | Việc ảnh hưởng khách, người dùng, doanh thu | Có hỏi khách vì sao cần, hoặc dùng vào việc gì? | Có nói lại nhu cầu của khách bằng lời mình và hỏi khách xác nhận? | Có đề xuất xếp ưu tiên theo giá trị với khách? | C7 |
| 3.6 | Chiến lược dài hạn | Quyết định có hệ quả về sau | Có nhắc một hệ quả sau màn này? | Có phân biệt chữa cháy trước mắt với sửa lâu dài? | Có đề xuất một việc cho lâu dài? | — |

## Nhóm 4 · Tư duy & giải quyết vấn đề
| # | Mục con | Xét khi | A (lõi) | B | C | Cờ |
|---|---|---|---|---|---|---|
| 4.1 | Tư duy phản biện | Có giả định, kết luận vội, thông tin chưa kiểm | Có chỉ ra một giả định hoặc kết luận chưa có bằng chứng? | Có hỏi hoặc tìm bằng chứng cho nó? | Có nêu một khả năng khác? | — |
| 4.2 | Phân tích, nguyên nhân gốc | Có sự cố hay kết quả bất thường | Có nêu một nguyên nhân cụ thể kèm một dữ kiện trong màn ủng hộ nó? | Có loại một khả năng khác bằng dữ kiện? | Có nêu cách kiểm để chắc chắn nguyên nhân? | C4 |
| 4.3 | Đề xuất, so sánh giải pháp | Cần chọn cách xử lý | Có đưa ít nhất hai cách xử lý làm được với nguồn lực trong màn? | Có so các cách theo một tiêu chí? | Có nêu khi nào nên đổi sang cách kia? | — |
| 4.4 | Sáng tạo | Cách quen không dùng được, hoặc màn để ngỏ | Có đề xuất một cách khác các cách đã nêu trong màn và làm được với nguồn lực có? | Có nêu cách thử nhỏ để kiểm? | Có nêu rủi ro của cách mới? | — |
| 4.5 | Tư duy hệ thống | Thay đổi có thể ảnh hưởng chỗ khác | Có nhắc một phía khác bị ảnh hưởng và ảnh hưởng đó là gì? | Có đề xuất kiểm ảnh hưởng đó? | Có báo hoặc đề nghị báo cho phía đó? | — |
| 4.6 | Thu thập, kiểm chứng thông tin, công cụ số | Cần thông tin để quyết định | Có lấy thông tin từ một nguồn trong màn trước khi kết luận (câu hỏi hoặc mã hành động)? | Có đối chiếu hai nguồn hoặc kiểm lại trước khi dùng? | Có nói rõ thông tin nào còn thiếu hoặc chưa chắc? | C4 |
| 4.7 | Dùng AI hiệu quả, có trách nhiệm | Màn có công cụ AI hoặc tình huống dùng AI | Có kiểm lại kết quả AI trước khi dùng? | Có nói rõ việc mình giao cho AI? | Có nêu một chỗ kết quả AI chưa đáng tin hay chưa có bằng chứng, hoặc dữ liệu không được đưa vào AI? | C6 |

## Nhóm 5 · Tự quản lý & chịu áp lực
| # | Mục con | Xét khi | A (lõi) | B | C | Cờ |
|---|---|---|---|---|---|---|
| 5.1 | Quản lý thời gian, ưu tiên | Nhiều việc cùng lúc hoặc ít thời gian | Có chọn việc làm trước và nói lý do? | Có gọi tên ít nhất một việc sẽ hoãn hoặc nhờ người khác? "Mấy cái còn lại làm sau" chưa tính | Có báo người bị ảnh hưởng bởi việc hoãn? | — |
| 5.2 | Tổ chức, lập kế hoạch | Việc có nhiều bước | Có nêu các bước theo thứ tự? | Có gắn bước với mốc thời gian? | Có nêu một bước kiểm kết quả (ví dụ kiểm health-check) hoặc một phương án dự phòng khi hỏng? | — |
| 5.3 | Chủ động | Có việc cần làm chưa ai giao hay nhắc | Có tự làm hoặc đề nghị làm một việc phục vụ mục tiêu mà chưa ai giao? | Có báo người liên quan về việc mình chủ động làm? | Có nêu một rủi ro mình phát hiện trước khi ai hỏi? | C9 |
| 5.4 | Cẩn thận, chú ý chi tiết | Seed có chi tiết dễ sót | Có nêu một chi tiết quan trọng mà chưa ai trong màn nhắc tới (con số, điều kiện, sai sót)? | Có kiểm lại hoặc đề nghị kiểm lại trước khi gửi hay làm? | Có sửa hoặc báo chỗ sai đó cho người liên quan? | C4 |
| 5.5 | Làm việc dưới deadline, áp lực | Seed đánh dấu hạn chót **chặt** (không đủ thời gian làm hết) | Khi quyết định, có chọn việc hoặc phạm vi làm kịp trước hạn? | Có báo sớm nếu thấy không kịp, kèm phương án? | Có để lại kế hoạch cho phần chưa kịp? | C7 |
| 5.6 | Tự chịu trách nhiệm việc mình | Việc thuộc phần người chơi phụ trách | Có nhận việc là của mình? | Có theo tới khi xong hoặc bàn giao rõ? | Có nêu một việc cụ thể sẽ làm khác lần sau? | C3, C9 |

## Nhóm 6 · Thích ứng & học hỏi
| # | Mục con | Xét khi | A (lõi) | B | C | Cờ |
|---|---|---|---|---|---|---|
| 6.1 | Linh hoạt khi kế hoạch đổi | Yêu cầu hoặc kế hoạch đổi giữa màn | Có điều chỉnh việc của mình theo thay đổi? | Có nói thay đổi ảnh hưởng gì tới hạn hoặc việc khác? | Có báo cho người bị ảnh hưởng (ngoài người đưa ra thay đổi) và nói rõ điều đã đổi? | C9 |
| 6.2 | Xử lý mơ hồ, thiếu thông tin | Thông tin chưa đủ để chắc | Có nói rõ điều gì còn chưa biết? | Có hỏi hoặc tìm thêm để bớt mơ hồ? | Có đưa một bước làm tạm an toàn trong lúc chờ? | C4 |
| 6.3 | Học nhanh, tự học | Màn đưa kiến thức, công cụ, quy trình mới | Có dùng đúng thông tin mới mà màn cung cấp? | Có hỏi hoặc tra thêm khi chưa hiểu? | Ở một bước sau, có làm theo một nội dung cụ thể khác của điều mới học, mà câu trích hoặc mã hành động chỉ ra được nội dung đó? Lặp lại đúng việc đã làm chưa tính | — |
| 6.4 | Cởi mở với phản hồi, sửa sai | Được chỉ ra sai hoặc nhận phản hồi trái ý | Có sửa cách làm theo phản hồi (thấy ở câu trả lời hoặc hành động sau đó)? | Có hỏi thêm để hiểu vì sao sai? | Có nêu một việc cụ thể để lần sau không lặp lại? | C3 |
| 6.5 | Phục hồi sau thất bại | Sau kết quả xấu hoặc sai sót trong màn | Có tiếp tục xử lý sau sai sót? | Có nêu một điều rút ra cụ thể? | Có đổi bước tiếp theo dựa trên điều rút ra? | C3 |

## Nhóm 7 · Đạo đức & chuyên nghiệp
| # | Mục con | Xét khi | A (lõi) | B | C | Cờ |
|---|---|---|---|---|---|---|
| 7.1 | Trung thực, nhận lỗi, báo sớm | Có lỗi hay sự cố | Có báo cho người liên quan về lỗi hoặc sự cố? | Có chỉ ra phần nào thuộc việc mình (nói vòng lịch sự vẫn tính nếu chỉ ra được phần việc)? | Có nêu một việc cụ thể để sửa hoặc để không lặp lại? | C3, C4, C5 |
| 7.2 | Giữ bí mật | Có người hỏi hoặc có dịp lộ thông tin hạn chế | Có từ chối, hoặc chuyển yêu cầu sang người có quyền trả lời? | Có nêu lý do gắn với bảo mật hay quy định? | Có chỉ cho người hỏi cách hợp lệ để có thông tin? | C6 |
| 7.3 | Tuân thủ quy trình | Màn đã nêu quy định và người chơi đã được nghe | Có làm hoặc xin làm bước bắt buộc **trước** hành động mà quy định nhắm tới? | Có nêu cách làm đúng quy định mà vẫn kịp mục tiêu? | Khi quy định cản mục tiêu, có xin ngoại lệ đúng kênh thay vì tự bỏ qua? | C8 |
| 7.4 | Đáng tin cậy, giữ lời hứa | Người chơi đưa ra cam kết | Cam kết có nói rõ làm gì và khi nào? | Có nói điều kiện hoặc giới hạn của việc mình kiểm soát được (rào "dạ chắc" không tính là điều kiện)? | Có nói sẽ báo lại thế nào nếu không kịp? | C7 |
| 7.5 | Ranh giới, ứng xử đúng mực | Yêu cầu ngoài vai, quà, sức ép, người đối diện thô | Có giữ giới hạn (từ chối quà, việc ngoài vai, sức ép trái quy định) bằng lời lẽ tôn trọng? Nhận lễ phép không tính | Có nói lý do gắn với vai trò hay quy định, bằng lời dễ hiểu? | Có chỉ đường đúng để xử lý? | C8, C10 |
| 7.6 | Cân nhắc tác động đạo đức | Quyết định ảnh hưởng người khác | Có nêu người hoặc nhóm bị ảnh hưởng và tác hại hay lợi ích cụ thể cho họ? | Có so hai phương án theo tác hại đó? | Có chọn phương án ít hại hơn và nói vì sao? | C13 |

## Để DE kiểm khi có nguồn lực thật
- Câu A còn gộp hai ý: 4.2, 4.5, 5.1, 7.4, 7.6.
- Độ khó của 2.1 B, 7.3 C (7.3 C chỉ bật khi seed dựng xung đột giữa quy định và mục tiêu).
- Hệ số phạt k so với thang mức: một cờ ở L3–L5 trừ ngang 0,7 mức trung bình, nên cờ đang lấn át item.
- Profile phương án cho nút đóng (chưa có profile để kiểm).
- Câu chữ từng câu hỏi (suy luận của nhóm; nguồn chỉ đỡ ở mức khái niệm).
- Judge chấm tiếng Việt: cần bộ câu trả lời có người gắn nhãn; đo độ dao động giữa các lần chạy judge thật; kiểm tương quan điểm với độ dài.
- Cách gộp mức theo trung bình các đoạn: người chơi đã làm tốt ở pha mà nút sau không nhắc lại thì bị kéo xuống (4C 7.6 ra 0,5). Cần DE chọn: giữ trung bình (thưởng sự nhất quán) hay chỉ xét đoạn có dịp mới.
- Mục khó bật trong cảnh 2–6 NPC nếu seed không dựng riêng: 3.2, 4.4, 4.7, 6.1, 6.3, 6.5, 7.6, 3.6.
- Phân biệt độ sâu nhu cầu khách ở 3.5 (lớp L1–L4 mở được).
- Thuật ngữ chuyên ngành trong `signs`.
- Các judge thử đều là Claude, cùng họ với người soạn đáp án. Độ khớp cao chưa chứng minh judge khác họ model (luật 9) chấm giống vậy.
