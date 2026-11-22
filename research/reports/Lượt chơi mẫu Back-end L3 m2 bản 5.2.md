# JobQuest · Lượt chơi mẫu: "Chín trăm đơn của Minh Phát" (theo bản 5.2)

Đây là một lượt chơi trọn vẹn, ghi lại **đúng từng thứ người chơi thấy trên màn hình**: câu cảnh, tin nhắn, cuộc gọi, nội dung từng tài liệu khi mở ra, các ô phải điền, kết quả chạy thử, kết ca. Dùng để đọc như kịch bản, để chơi thử bằng giấy, và để đối chiếu khi lập trình.

**Người chơi:** Lan, học sinh lớp 11, không biết gì về lập trình. Lan chơi cẩn thận nhưng có một sơ suất (quên lo cho app cũ ở bản vá đầu). Lời Lan gõ để đúng kiểu học sinh gõ thật: viết thường, viết tắt ("a", "k", "hnay", "11h30"), ít dấu câu. Riêng email thì Lan viết cẩn thận hơn.

**Cách đọc:**

- 🖥 là thứ hiện trên màn hình (giao diện, câu cảnh, tài liệu).
- Lời nhân vật ghi kèm biểu cảm trong ngoặc, mỗi dòng là một nhịp.
- **Lan gõ** là lời người chơi tự gõ; **Lan chọn** là bấm phương án có sẵn.
- 📒 là sổ tay của người chơi tự ghi thêm.
- > 📝 Ghi chú thiết kế: không hiện trong game, chỉ để người đọc tài liệu hiểu Lan suy luận thế nào và game đang làm gì.

---

## Trước khi vào ca: 6 slide giới thiệu

🖥 **Slide 1 · Giao Nhanh**
Startup đi chợ hộ và giao đồ ăn ở TP.HCM, khoảng 120 người. Ngoài khách lẻ, nhiều quán ăn đặt rau thịt mỗi ngày qua app. Trong công ty gọi họ là **khách sỉ**.

🖥 **Slide 2 · Back-end làm gì?**
Mỗi lần bạn bấm một nút trong app, app gửi một **yêu cầu** tới máy chủ. Hãy hình dung máy chủ là bếp sau của nhà hàng: **API** là người nhận order, **cơ sở dữ liệu** là kho. Kỹ sư Back-end viết cách người nhận order vào kho lấy đồ cho nhanh và đúng. Bạn không cần biết viết code: mọi thứ cần cho ca làm đều có trong tài liệu, wiki và lời đồng nghiệp.

🖥 **Slide 3 · Những người bạn gặp**
**Anh An**, trưởng nhóm Back-end, cũng là người kèm bạn từ ngày vào. Nói ngắn, thẳng.
**Chị Linh**, trưởng nhóm chăm sóc khách hàng (CS). Không rành kỹ thuật, lo thì nói nhiều.

🖥 **Slide 4 · Vai của bạn**
Kỹ sư Back-end khoảng 2–3 năm. Bạn tự sửa phần mình viết, nhưng đưa lên hệ thống thật thì phải có anh An duyệt. Tuần này bạn **trực sự cố** cho team: có gì hỏng thì bạn là người coi đầu tiên.

🖥 **Slide 5 · Quy định của team**
(1) Đụng tới hệ thống thật thì nhắn kênh **#su-co** trước, và phải có anh An duyệt.
(2) Không hứa giờ xong với khách khi chưa chắc.

🖥 **Slide 6 · Điều nên biết trước**
Trực sự cố nghĩa là có lúc phải bỏ dở việc đang làm. Lỗi trong code mình viết có thể lộ ra trước cả team, và người đang chờ bạn thường là người đang bị khách ép.

🖥 Nút **"Vào ca"**.

---

## 9:40 · Bắt đầu ca (còn 28 điểm)

🖥 Màn hình làm việc hiện ra:

- Góc trên: **🕘 9:40 · Thứ Hai** · **⏳ 28 điểm** (1 điểm = 5 phút)
- Dải mục tiêu: **"Tìm ra vì sao API lịch sử đơn chậm và gửi anh An hướng xử lý trước 12:00."**
- Thẻ "Vai của bạn": _"API lịch sử đơn là phần bạn viết ba tuần trước, anh An review. Tuần này bạn trực sự cố cho team; có gì thì báo anh An."_

🖥 Câu cảnh:

> Sáng thứ Hai, bạn vừa họp đầu tuần xong, quay về bàn thì thấy app giám sát báo đỏ: API lịch sử đơn có yêu cầu chậm quá 4 giây.

🖥 Khung chat bật lên: **Anh An** đang nhắn…

**Anh An** (chat):

- _(lo lắng)_ "Lan ơi, API lịch sử đơn có request chậm từ 8h, bình thường 0,2s mà có lúc lên hơn 4s."
- _(suy nghĩ)_ "Chắc DB quá tải giờ cao điểm. Anh đang chạy release thanh toán 2h chiều, em coi giùm anh, trước 12h có hướng xử lý thì gửi anh nha."
- _(bình thường)_ "À, đụng production thì nhắn #su-co trước, anh duyệt rồi mới lên. Bên CS chắc sẽ hỏi em giờ xong, chưa chắc thì đừng hứa nha."

> 📝 Các chữ _API, request, DB, release, production, #su-co, CS_ đều gạch chân chấm. Lan chạm vào "DB" và thấy: _"Kho chứa mọi dữ liệu: khách, đơn, món trong đơn."_ Chạm vào "production": _"Hệ thống thật khách đang dùng."_

**Lan gõ:** "dạ em coi liền a. sao a nghĩ là DB quá tải vậy ạ"

**Anh An:**

- _(suy nghĩ)_ "Anh đoán thôi, giờ này đơn đông mà."
- _(bình thường)_ "Anh chưa coi dashboard."

📒 Sổ tay ghi: _API lịch sử đơn chậm từ 8:00 (0,2 giây → hơn 4 giây) · Anh An gấp release 14:00 · Quy định: nhắn #su-co trước khi đụng production, phải có anh An duyệt; không hứa giờ với khách khi chưa chắc._

🖥 Danh sách hành động hiện ra (số trong ngoặc là điểm):

| Nói chuyện        | Tài liệu                  | Làm việc                  |
| ----------------- | ------------------------- | ------------------------- |
| Nhắn anh An (1)   | Mở log API (1)            | Viết bản vá (5)           |
| Gọi chị Linh (1)  | Mở bảng số liệu khách (1) | Chạy thử trên staging (2) |
| Nhắn #su-co (1)   | Mở bảng theo dõi CSDL (1) |                           |
| Gọi họp nhanh (3) | Mở code API (1)           |                           |
|                   | Mở Wiki kỹ thuật (1)      |                           |

---

## 9:40 → 9:45 · Mở Wiki kỹ thuật (1 điểm, còn 27)

🖥 **Wiki kỹ thuật Giao Nhanh · Mục lục**

- S1 · Đọc log API
- S2 · Đọc bảng theo dõi CSDL
- S3 · Bốn kiểu chậm hay gặp
- S4 · Phiên bản app
- S5 · Quy trình đưa lên production
- S6 · Hỗ trợ khách khi có sự cố

Lan chạm lần lượt cả sáu mục (mỗi mục 0 điểm sau lần mở mục lục). Nội dung hiện ra:

**S1 · Đọc log API.** Mỗi dòng là một yêu cầu. _Kết quả_ `200` nghĩa là trả lời thành công; `499` nghĩa là app đã bỏ đi trước khi có trả lời. _Thời gian trả lời_ do máy chủ tự đo từ lúc nhận yêu cầu tới lúc trả xong, **chưa tính đường mạng tới khách**. _Số lần hỏi CSDL_ là số lần API vào kho trong yêu cầu đó. _Số đơn trả về_ là số dòng dữ liệu gửi về app.

**S2 · Đọc bảng theo dõi CSDL.** CPU trên 80% kéo dài là kho quá tải. Kết nối gần đầy (gần 200/200) là kho bị nghẽn cửa. Khi kho quá tải, **mọi yêu cầu cùng chậm**, khách nào cũng vậy. Giờ trưa (11:00–13:00) đông đơn, các yêu cầu thường chậm thêm khoảng 20–30%.

**S3 · Bốn kiểu chậm hay gặp.**

| Kiểu                   | Hình dung                                                             | Dấu hiệu                                                                                  | Cách xử lý                                                                                                               |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Kho quá tải            | Bếp đông quá, ai vào kho cũng phải chờ                                | CPU cao; mọi khách cùng chậm                                                              | Giảm tải, hoặc xin thêm máy (cần sếp kỹ thuật duyệt chi phí)                                                             |
| Hỏi kho trong vòng lặp | Người nhận order chạy vào kho lấy từng món một, 900 món là 900 chuyến | Số lần hỏi tăng theo số dòng dữ liệu; khách càng nhiều dòng càng chậm, khách ít vẫn nhanh | **Gom truy vấn**: cầm cả danh sách vào kho, lấy một chuyến                                                               |
| Trả quá nhiều một lần  | Bưng cả trăm món ra một lượt                                          | Một yêu cầu trả hàng trăm dòng                                                            | **Phân trang**: mỗi lần trả một phần, app xin tiếp khi người dùng kéo xuống. Chỉ app biết gửi số trang mới xin tiếp được |
| Mỗi lần hỏi kho chậm   | Kho không có mục lục, mỗi chuyến tìm lâu                              | Số lần hỏi ít nhưng mỗi lần lâu                                                           | Thêm **chỉ mục (index)**                                                                                                 |

**S4 · Phiên bản app.** App 3.x (từ tháng 9) gửi số trang khi xem lịch sử đơn. App 2.x không gửi, vẫn chạy trên một số máy tính bảng cũ của khách sỉ. App nào cũng **tự ngắt sau 5 giây** nếu chưa có trả lời. Đổi con số này phải ra bản app mới và chờ kho ứng dụng duyệt 2–3 ngày.

**S5 · Quy trình đưa lên production.**

1. Chạy thử trên staging.
2. Gửi người phụ trách email xin duyệt (team Back-end: anh An), gồm: thay đổi gì và vì sao; kết quả chạy thử; **cách kiểm tra sau khi lên**; **cách lùi lại**.
3. Được duyệt thì nhắn #su-co trước khi đưa lên.
4. Sau khi lên, canh log và giám sát ít nhất 15 phút.

Lùi lại: bấm "Rollback" trên công cụ deploy, khoảng 2 phút là production quay về bản trước.

**S6 · Hỗ trợ khách khi có sự cố.** Không hứa giờ xong khi chưa chắc. Có thể xuất danh sách đơn của một khách ra file từ trang quản trị (khoảng 10 phút) để bên CS đặt giùm khách trong lúc chờ sửa.

🖥 Hành động mới hiện thêm: **Xuất danh sách đơn cho chị Linh (2)**.

> 📝 Lan không hiểu hết, nhưng nhớ được ba ý: "quá tải thì khách nào cũng chậm", "hỏi kho trong vòng lặp thì khách nhiều đơn mới chậm", và "app tự ngắt sau 5 giây".

---

## 9:45 → 9:50 · Mở log API (1 điểm, còn 26)

🖥 **Log API lịch sử đơn** (trích, sáng nay)

| Giờ      | Đường dẫn và khách    | Kết quả | Thời gian trả lời | Số lần hỏi CSDL | Số đơn trả về |
| -------- | --------------------- | ------- | ----------------- | --------------- | ------------- |
| 07:58:02 | lịch sử đơn · C-1187  | 200     | 0.19s             | 4               | 3             |
| 08:01:15 | lịch sử đơn · MP-0042 | 200     | 4.38s             | 901             | 900           |
| 08:01:17 | lịch sử đơn · C-2210  | 200     | 0.21s             | 13              | 12            |
| 08:06:40 | lịch sử đơn · C-0510  | 200     | 1.27s             | 241             | 240           |
| 08:14:40 | lịch sử đơn · MP-0042 | 200     | 4.52s             | 901             | 900           |
| 08:20:03 | lịch sử đơn · C-0931  | 200     | 0.18s             | 6               | 5             |
| 09:02:51 | lịch sử đơn · C-0510  | 200     | 1.29s             | 241             | 240           |
| 09:32:11 | lịch sử đơn · C-0931  | 200     | 0.18s             | 6               | 5             |
| 09:35:58 | lịch sử đơn · MP-0042 | 200     | 4.47s             | 901             | 900           |
| 09:38:12 | lịch sử đơn · C-1187  | 200     | 0.19s             | 4               | 3             |

🖥 Nút "Xem dạng gốc" mở bản chữ thô (`GET /orders/history?customer=MP-0042  200  4.38s  db_queries=901  rows=900` …) cho ai muốn nhìn như kỹ sư thật.

📒 Sổ tay ghi: _Log: MP-0042 900 đơn, hỏi 901 lần, 4,4 giây · C-0510 240 đơn, hỏi 241 lần, 1,3 giây · khách vài đơn 0,2 giây._

> 📝 Lan để ý: số lần hỏi luôn nhiều hơn số đơn đúng 1 (4/3, 13/12, 241/240, 901/900). Khớp với dấu hiệu "hỏi kho trong vòng lặp" ở S3. Cùng giờ 8:01, MP-0042 mất 4,38 giây mà C-2210 chỉ 0,21 giây, nên không giống kiểu "quá tải thì khách nào cũng chậm".

---

## 9:50 → 9:55 · Mở bảng theo dõi CSDL (1 điểm, còn 25)

🖥 **Bảng theo dõi CSDL · 7:00–9:45**

| Chỉ số            | Giá trị                                                  | Ghi chú                  |
| ----------------- | -------------------------------------------------------- | ------------------------ |
| Mức bận CPU       | 18–26% (cao nhất 26% lúc 08:15)                          | Cảnh báo khi trên 80%    |
| Kết nối đang mở   | 31–42 / 200                                              |                          |
| Lượt hỏi mỗi giây | Thường 120–160; từ 08:00 có những đợt vọt lên khoảng 350 | Mỗi đợt kéo dài 4–5 giây |

📒 Sổ tay ghi: _CSDL: CPU tối đa 26% (ngưỡng 80%), kết nối 42/200._

> 📝 Lan suy ra: CPU 26% còn xa 80%, nên kho không quá tải; anh An đoán sai. Mỗi đợt vọt lên dài 4–5 giây, bằng đúng thời gian một lần MP-0042 mở lịch sử.

---

## 9:55 → 10:00 · Mở code API (1 điểm, còn 24)

🖥 **Code API lịch sử đơn** (chạm vào `db.query` hiện: _"một lần hỏi CSDL"_)

```js
// Lấy lịch sử đơn của một khách (PR #318, anh An review)
async function getOrderHistory(customerId, page) {
  // Bước 1: lấy danh sách đơn của khách, mới nhất trước
  const orders = await db.query(
    'SELECT id, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
    [customerId],
  );

  // Bước 2: với mỗi đơn, lấy các món trong đơn đó
  for (const order of orders) {
    order.items = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id],
    );
  }

  // TODO: dùng `page` để phân trang (app 3.x đã gửi page)
  return orders;
}
```

📒 Sổ tay ghi: _Code: bước 2 hỏi CSDL riêng cho mỗi đơn · chưa dùng `page`, trả hết đơn một lần._

> 📝 Lan không đọc được code, nhưng đọc được chú thích: bước 1 hỏi một lần, bước 2 "với mỗi đơn" hỏi thêm một lần. 1 + 900 = 901. Đây là "người nhận order chạy vào kho 900 chuyến".

---

## 10:00 → 10:05 · Gọi chị Linh (1 điểm, còn 23)

🖥 📞 Đang gọi chị Linh…

**Chị Linh:** _(bình thường)_ "Alo, Linh nghe nè em."

**Lan gõ:** "chị ơi khách phàn nàn gì vậy chị"

**Chị Linh:**

- _(lo lắng)_ "Trời ơi em, sáng giờ chị nhận ba cuộc rồi á, toàn bên Minh Phát."
- _(lo lắng)_ "Nhân viên bếp nói mở lịch sử đơn cứ xoay xoay hoài, bốn năm giây mới hiện."

**Lan gõ:** "sao hnay mới bị vậy chị, hôm qua có gì thay đổi k ạ"

**Chị Linh:**

- _(suy nghĩ)_ "À, tối qua bên vận hành mới gộp sáu tài khoản chi nhánh của họ làm một, cho dễ xuất hoá đơn."
- _(suy nghĩ)_ "Sáng nay mới bị vậy đó em."

**Lan gõ:** "dạ em coi log rồi, lỗi ở API bên em chứ k phải mạng khách đâu chị. 11h30 em gọi báo chị nha"

**Chị Linh:**

- _(ngạc nhiên)_ "Ủa, vậy là lỗi bên mình hả em? Chị tưởng mạng khách."
- _(bình thường)_ "Ừ, vậy 11 rưỡi chị chờ em nha."

📒 Sổ tay ghi: _Chị Linh: 3 cuộc phàn nàn, đều từ Minh Phát · Tối qua gộp 6 tài khoản chi nhánh Minh Phát làm một._
📒 **Lời hứa:** _Gọi chị Linh lúc 11:30_ (giữ lời nếu liên lạc trong 11:20–11:35).

> 📝 Game ghi hai trạng thái: chị Linh đã biết lỗi ở bên kỹ thuật (**T**), và đã có hẹn (**P**). Niềm tin "do mạng khách" của chị được bỏ. Lan giờ đã hiểu vì sao lỗi ba tuần mới lộ: hôm qua Minh Phát mới có 900 đơn trong một tài khoản.

---

## 10:05 · Tin bot trong nhóm chat team

🖥 **Bot deploy:** "Build module thanh toán #482 bắt đầu chạy…"

📒 Sổ tay ghi: _Build thanh toán #482 bắt đầu 10:05._

---

## 10:05 → 10:10 · Nhắn anh An (1 điểm, còn 22)

**Lan gõ:** "a ơi khách MP-0042 900 đơn mà API hỏi CSDL 901 lần, Bà Ba 240 đơn hỏi 241 lần. CPU DB có 24% à. em nghĩ do bước 2 trong code em lấy món từng đơn 1"

**Anh An:**

- _(ngạc nhiên)_ "900 đơn mà hỏi 901 lần… ờ, khớp."
- _(bình thường)_ "Vậy hổng phải DB rồi."

> 📝 Khúc mắc 1 của anh An được gỡ (nguyên nhân có bằng chứng), niềm tin "DB quá tải" được bỏ. Anh xác nhận dữ kiện chứ không khen ("ờ, khớp"), và không gợi bước tiếp theo.

---

## 10:10 → 10:35 · Viết bản vá (5 điểm, còn 17)

🖥 **Bản vá · API lịch sử đơn.** Đánh dấu các thay đổi muốn làm:

- [x] **Gom truy vấn**: lấy món của tất cả đơn bằng một lần hỏi CSDL, thay vì mỗi đơn một lần
- [x] **Phân trang 50 đơn**: mỗi lần trả 50 đơn; app gửi số trang thì xin tiếp được
- [ ] **Giữ cách trả cũ cho app không gửi số trang**: yêu cầu không có số trang thì vẫn trả đủ đơn như trước
- [ ] **Thêm chỉ mục cho bảng món trong đơn**: giúp mỗi lần hỏi bảng món nhanh hơn

Ô "Ghi chú cho người review" — **Lan gõ:** "gom truy vấn cho hết vòng lặp + phân trang"

🖥 Nút **"Lưu bản vá"**.

> 📝 Lan bỏ qua ô thứ ba vì chưa nối mục S4 (app 2.x không gửi số trang) với khách Minh Phát. Lan cũng không chọn chỉ mục vì S3 nói chỉ mục dành cho kiểu "số lần hỏi ít nhưng mỗi lần lâu", còn ở đây là số lần hỏi quá nhiều.

🖥 Đời thường: _Có người trong nhóm chat hỏi: "Trưa nay cơm tấm hay bún đậu mấy ông?" Ba người thả tim cơm tấm._

---

## 10:35 → 10:45 · Chạy thử trên staging (2 điểm, còn 15)

🖥 **Kết quả chạy thử · MP-0042**

```text
GET /orders/history?customer=MP-0042&page=1   (app 3.x)              0.18s  db_queries=2  rows=50
GET /orders/history?customer=MP-0042          (app 2.x, máy tính bảng) 0.18s  db_queries=2  rows=50
⚠ app 2.x không có nút "xem thêm": chỉ hiện 50 đơn gần nhất (khoảng 1 ngày của 6 quán)
```

🖥 Hành động mới hiện thêm: **Đưa lên production (1)**.

🖥 (10:40) **Bot deploy:** "Build #482 xong ✅"

🖥 Đời thường: _Phòng họp kế bên, máy lạnh kêu rè rè, có người đứng dậy chỉnh._

> 📝 Lan thấy 0,18 giây là nhanh hẳn, nhưng chưa hiểu dòng ⚠ có hại gì. Nút "Đưa lên production" đã hiện, nhưng Lan nhớ quy định phải có anh An duyệt.

---

## 10:45 → 10:50 · Tạm làm việc khác (1 điểm, còn 14)

🖥 Hiện vì mốc có giờ kế tiếp (10:50) còn cách 5 phút. Lan bấm, đồng hồ chạy tới 10:50.

---

## 10:50 · Chị Linh gọi, chen ngang (n1, 1 điểm, còn 13)

🖥 📞 **Chị Linh đang gọi** (rung)

> 📝 Lời dẫn `[n1-dan-1]`, vì có G (đã nói chuyện lúc 10:00), T (chị biết lỗi ở bên kỹ thuật) và P (đã có hẹn 11:30). Đã nói chuyện nên chị gọi "bên Minh Phát", không giới thiệu lại. Lúc 10:40 Minh Phát vừa doạ ngưng hợp đồng, nên chị biết thêm f9.

**Chị Linh:**

- _(lo lắng)_ "Alo em ơi, chị Linh nè. Chị có nói với khách là bên kỹ thuật thấy lỗi rồi."
- _(khó chịu)_ "Mà bên Minh Phát hổng chịu chờ nữa, mười hai cuộc rồi á. Họ nói trưa còn vậy là ngưng hợp đồng luôn."
- _(lo lắng)_ "Em nói chị nghe, trưa xong được hông em?"

🖥 Ba phương án, đồng hồ đếm ngược **40 giây**:

- **a.** "Em chưa dám hứa giờ chị ạ. Tới giờ hẹn em báo chị như đã nói." _(chữ đã đổi vì Lan có hẹn từ trước)_
- **b.** "Chắc trưa là xong thôi chị."
- **c.** "Giờ em chưa nói được. Nhưng khách cần lịch sử để đặt lại đơn phải không chị? Em xuất danh sách đơn của họ gửi chị trong 15 phút."

**Lan chọn c** (sau 25 giây).

**Chị Linh:**

- _(ngạc nhiên)_ "Ờ đúng rồi, họ bấm đặt lại đơn tuần trước á."
- _(vui)_ "Có file thì bên chị đặt giùm họ được."
- _(lo lắng)_ "Mà khách vẫn hỏi chừng nào hết lag đó em."

🖥 Lượt nói thêm trong cuộc gọi.

**Lan gõ:** "dạ file em gửi liền ạ. 11h30 em vẫn gọi chị như hẹn nha"

**Chị Linh:** _(bình thường)_ "Ừ, chị chờ em nha."

📒 Sổ tay ghi: _Minh Phát doạ ngưng hợp đồng nếu trưa còn lỗi · 12 cuộc phàn nàn · Bếp Minh Phát đặt lại đơn của tuần trước._
📒 **Lời hứa:** _Gửi chị Linh danh sách đơn trước 11:10._

> 📝 Đây là lúc Lan nối được hai mảnh: khách cần đơn **tuần trước**, mà dòng ⚠ ở staging nói app 2.x chỉ còn **50 đơn, khoảng 1 ngày**. Nếu máy tính bảng của Minh Phát chạy app 2.x thì bản vá hiện tại sẽ làm mất đơn tuần trước. Lan quyết định sửa lại bản vá sau khi gửi file.

---

## 10:55 → 11:05 · Xuất danh sách đơn cho chị Linh (2 điểm, còn 11)

🖥 `MP-0042_lich_su_don.xlsx · 900 đơn · đã gửi chị Linh`

**Chị Linh** (chat): _(vui)_ "Chị nhận rồi nè em, để bên chị đặt giùm họ."

📒 Lời hứa _gửi file trước 11:10_: ✅ đã giữ.

🖥 (11:00) Trạng thái anh An đổi thành: **"Đang họp · 11:20 trả lời"**.

---

## 11:05 · Bắt đầu sửa lại bản vá (3 điểm, 15 phút)

🖥 Bản vá cũ mở lại. **Lan đánh dấu thêm:** [x] **Giữ cách trả cũ cho app không gửi số trang.**

Ghi chú cho người review — **Lan gõ thêm:** "app 2.x k gửi số trang thì vẫn trả đủ đơn (cho máy tính bảng của khách)"

### 11:10 · Chị Linh nhắn, chen ngang (e1, 1 điểm)

> 📝 Lời dẫn `[e1-2]`: Lan đã nói lỗi ở bên kỹ thuật, nhưng chưa nói có bản sửa. File đã gửi nên không có nhịp hỏi file.

**Chị Linh** (chat):

- _(lo lắng)_ "Lan ơi, Minh Phát gọi lên tới sếp chị rồi 😥"
- _(lo lắng)_ "Bên em sửa tới đâu rồi? Có cách nào nhanh hơn hông em?"

**Lan gõ:** "dạ em có bản sửa chạy thử rồi chị, đang chỉnh thêm cho máy tính bảng bên Minh Phát. mà phải có a An duyệt mới đưa lên được, a họp tới 11h20. 11h30 em gọi chị như hẹn nha"

**Chị Linh:**

- _(lo lắng)_ "Ừ… vậy chị ráng giữ khách thêm chút."
- _(bình thường)_ "Có tin em báo chị liền nha."

🖥 _Việc đang dở: sửa bản vá, còn 10 phút._

> 📝 Cám dỗ ở đây là nút "Đưa lên production" đang hiện sẵn, và chị Linh đang hỏi "có cách nào nhanh hơn". Lan không bấm. Lan nói "máy tính bảng của Minh Phát" dù chưa hỏi chị Linh khách dùng máy gì (f12 chưa mở). Đây là đoán đúng, nên theo luật bản 5.1 không gắn cờ "bịa".

### 11:15 · Bot giám sát ở #su-co

🖥 ⚠️ **Giám sát:** "3 yêu cầu lịch sử đơn của MP-0042 bị app tự ngắt vì quá 5 giây (11:12–11:15)."

📒 Sổ tay ghi: _Từ 11:12, app bắt đầu tự ngắt với MP-0042._

> 📝 Đúng như wiki S2 và S4 báo trước: trưa đông chậm thêm 20–30%, 4,4 giây thành khoảng 5,5 giây, vượt mức 5 giây.

### 11:20 · Anh An họp xong, nút "Chốt nguyên nhân" tự bật (n2, 1 điểm)

**Anh An** (chat): _(bình thường)_ "Em ghi giùm anh cái ghi chú sự cố nha, chiều anh dán vào báo cáo."

> 📝 Dùng `[n2-nhac-1]` vì Lan đã nêu nguyên nhân với anh lúc 10:05.

🖥 **Ghi chú sự cố.** Ba ô có chữ mờ gợi mở: _"Từ mấy giờ, ai bị…"_ · _"Em nghĩ do…, vì…"_ · _"Em đã…"_. Lan điền:

**Hiện tượng:** "Từ 8:00, mở lịch sử đơn của khách nhiều đơn bị chậm: Minh Phát 4,4 giây, Bà Ba 1,3 giây; khách ít đơn vẫn 0,2 giây. Từ 11:12 app bắt đầu tự ngắt với Minh Phát."

**Nguyên nhân, kèm bằng chứng:** "API lịch sử đơn (phần em viết) lấy món của từng đơn trong vòng lặp, nên số lần hỏi CSDL bằng số đơn cộng 1 (901/900, 241/240, code bước 2). Tối qua gộp tài khoản nên Minh Phát lên 900 đơn, lỗi mới lộ ra."

**Đã làm gì:** "Viết bản vá gom truy vấn và phân trang, chạy thử staging còn 0,18 giây. Đang chỉnh thêm cho app 2.x. Đã gửi chị Linh danh sách đơn của Minh Phát để đặt giùm khách."

**Giả thuyết:**

|     | Giả thuyết                                      | Lan chọn | Vì sao                                                |
| --- | ----------------------------------------------- | -------- | ----------------------------------------------------- |
| h1  | CSDL quá tải giờ cao điểm                       | Loại     | CPU 24–26%, dưới 80%; khách ít đơn cùng giờ vẫn nhanh |
| h2  | Mạng phía khách chậm                            | Loại     | Thời gian trong log do máy chủ đo, chưa tính mạng     |
| h3  | API hỏi CSDL một lần cho mỗi đơn                | Giữ      | 901/900, 241/240, code bước 2                         |
| h4  | API trả hết đơn một lần, không giới hạn         | Giữ      | Trả cả 900 đơn một lần                                |
| h5  | Build module thanh toán làm chậm hệ thống       | Loại     | Build bắt đầu 10:05, còn chậm từ 8:00                 |
| h6  | Dữ liệu Minh Phát bị hỏng sau khi gộp tài khoản | Chưa rõ  |                                                       |

🖥 Nút **"Gửi anh An"** (ghi chú).

**Anh An:**

- _(suy nghĩ)_ "Anh coi ghi chú rồi nè."
- _(bình thường)_ "Số lần hỏi khớp số đơn, anh thấy rồi."
- _(suy nghĩ)_ "Mấy cái em để chưa rõ, em tính kiểm bằng gì?"

> 📝 Câu hỏi thêm số 1 (vì sao loại DB) được bỏ qua vì Lan đã nêu bằng chứng lúc 10:05. Câu số 2 không gọi tên h6.

**Lan gõ:** "dạ log vẫn trả 200, đủ 900 đơn nên chắc dữ liệu k hỏng, chỉ là nhiều đơn hơn. em đổi thành loại ạ"

**Anh An:** _(bình thường)_ "Ok."

🖥 _Việc đang dở: sửa bản vá, còn 5 phút._
🖥 Hành động mới hiện thêm: **Gửi anh An (1)**.

---

## 11:30 · Sửa bản vá xong (còn 6 điểm)

🖥 Câu cảnh:

> Đồng hồ góc màn hình nhảy sang 11:30, nhóm chat bắt đầu réo ai đặt cơm.

---

## 11:30 → 11:35 · Gọi chị Linh đúng hẹn (1 điểm, còn 5)

**Chị Linh:** _(lo lắng)_ "Alo em, chị nghe nè."

**Lan gõ:** "chị ơi bản sửa xong rồi, em chạy thử lại rồi gửi a An duyệt. có duyệt em báo chị liền nha"

**Chị Linh:** _(lo lắng)_ "Ừ, nhanh nha em, khách hối quá trời."

📒 Lời hứa _gọi chị Linh lúc 11:30_: ✅ đã giữ.
📒 **Lời hứa:** _Có anh An duyệt thì báo chị Linh_ (theo sự kiện).

---

## 11:35 → 11:45 · Chạy thử lại trên staging (2 điểm, còn 3)

🖥 **Kết quả chạy thử · MP-0042**

```text
GET /orders/history?customer=MP-0042&page=1   (app 3.x)              0.18s  db_queries=2  rows=50
GET /orders/history?customer=MP-0042          (app 2.x, máy tính bảng) 1.12s  db_queries=2  rows=900
```

🖥 Đời thường: _Có người hỏi trong nhóm chat ai còn dư sạc laptop._

> 📝 Không còn dòng ⚠. App 2.x nhận đủ 900 đơn trong 1,12 giây; trưa có chậm thêm 25% cũng chỉ khoảng 1,4 giây, dưới mức 5 giây.

---

## 11:45 · Gửi anh An (n3, 1 điểm, còn 2)

> 📝 Staging xong đúng 11:45, cũng là giờ dự phòng của n3. Theo `[pha-luat]`, Lan được hành động trước nên anh An chưa nhắc.

🖥 Hộp xác nhận: _"Gửi xong thì ca này kết thúc."_ → Lan bấm **"Gửi"**.

🖥 **Email gửi anh An.** Ba ô có chữ mờ gợi mở: _"Em thấy nguyên nhân là…"_ · _"Em đề xuất…"_ · _"Nếu lên rồi có lỗi thì…"_. Lan điền:

> **Tiêu đề:** Sự cố API lịch sử đơn, xin duyệt bản sửa
>
> Chào anh An,
>
> **Nguyên nhân:** API lịch sử đơn (phần em viết) lấy món của từng đơn bằng một lần hỏi CSDL riêng, nên Minh Phát 900 đơn phải hỏi 901 lần, mất 4,4 giây. Trưa đông thì quá 5 giây và app tự ngắt, đã bị từ 11:12. CPU DB chỉ 24–26% nên không phải quá tải.
>
> **Hướng xử lý:** Gom truy vấn còn 2 lần hỏi, phân trang 50 đơn cho app 3.x, app 2.x không gửi số trang thì vẫn trả đủ đơn. Chạy thử trên staging với MP-0042: app 3.x từ 4,4 giây còn 0,18 giây, app 2.x còn 1,12 giây, đều chỉ 2 lần hỏi. Anh duyệt giúp em đưa lên production nha.
>
> **Rủi ro và cách lùi lại:** Nếu lên rồi có lỗi, em bấm Rollback trên công cụ deploy, khoảng 2 phút là về bản cũ.
>
> Em Lan

**Anh An:**

- _(bình thường)_ "Anh đọc rồi."
- _(lo lắng)_ "Anh chỉ sợ lên rồi hỏng chỗ khác, máy khách đủ loại mà."
- _(suy nghĩ)_ "Lên rồi sao em biết là ổn?"

> 📝 Xét câu hỏi thêm theo thứ tự: bản vá có v1 (bỏ qua nhánh 1), email có cách lùi lại (bỏ qua nhánh 2), nhưng chưa có cách kiểm tra, nên vào **nhánh 3**. Câu hỏi không gọi tên đáp án.

**Lan gõ:** "dạ lên xong em canh log 15p, xem Minh Phát mở lịch sử dưới 2s và chỉ hỏi CSDL 2 lần. k đúng vậy là em rollback liền"

> 📝 Đủ điều kiện duyệt: có v1; có v2 thì có v3; có cách kiểm tra cụ thể; có cách lùi lại.

**Anh An:**

- _(vui)_ "Ok Lan, anh duyệt."
- _(bình thường)_ "Nhắn #su-co rồi đưa lên nha."

---

## 11:50 · Lượt báo tin cuối ca (0 điểm)

🖥 Lan còn lời hứa _"có duyệt thì báo chị Linh"_, nên hiện ô: **"Nhắn chị Linh trước khi kết ca?"**

**Lan gõ:** "chị ơi a An duyệt rồi, em đưa lên liền nha. chị báo khách là bên em đang đưa bản sửa lên ạ"

**Chị Linh:** _(vui)_ "Trời, vậy chị báo khách liền nha em!"

📒 Lời hứa _có duyệt thì báo chị Linh_: ✅ đã giữ.

---

## Kết ca

🖥 **Bot deploy:** "Bản sửa lên production lúc 12:06."
🖥 **Bot giám sát (12:20):** "MP-0042: 1,12s · 2 lần hỏi CSDL."

**Chị Linh** (chat): _(vui)_ "Minh Phát nói mở được rồi nè em, hú hồn!"

> 📝 Kết ca ghép từ mảnh production "được duyệt" và mảnh chị Linh "khách ổn". Nhìn lại ca **không có mục nào** vì không xảy ra chuyện nào trong năm mục (không tự đưa lên, không hứa chắc, không để chị Linh tin sai, không trễ hẹn, không lời hứa treo), nên game chuyển thẳng sang màn nhận xét cuối màn.

---

## Tổng kết lượt chơi

### Điểm thời gian

| Giờ         | Việc                                         | Điểm | Còn |
| ----------- | -------------------------------------------- | ---- | --- |
| 9:40        | n0 · Anh An giao việc                        | 0    | 28  |
| 9:40–9:45   | Mở wiki                                      | 1    | 27  |
| 9:45–9:50   | Mở log                                       | 1    | 26  |
| 9:50–9:55   | Mở bảng theo dõi CSDL                        | 1    | 25  |
| 9:55–10:00  | Mở code                                      | 1    | 24  |
| 10:00–10:05 | Gọi chị Linh                                 | 1    | 23  |
| 10:05–10:10 | Nhắn anh An                                  | 1    | 22  |
| 10:10–10:35 | Viết bản vá                                  | 5    | 17  |
| 10:35–10:45 | Chạy staging                                 | 2    | 15  |
| 10:45–10:50 | Tạm làm việc khác                            | 1    | 14  |
| 10:50–10:55 | n1 · Chị Linh gọi                            | 1    | 13  |
| 10:55–11:05 | Xuất danh sách đơn                           | 2    | 11  |
| 11:05–11:30 | Sửa bản vá (3), bị chen bởi e1 (1) và n2 (1) | 5    | 6   |
| 11:30–11:35 | Gọi chị Linh đúng hẹn                        | 1    | 5   |
| 11:35–11:45 | Chạy staging lần hai                         | 2    | 3   |
| 11:45–11:50 | n3 · Gửi anh An                              | 1    | 2   |
| 11:50       | Lượt báo tin cuối ca                         | 0    | 2   |

Dùng 26/28 điểm. Lan không mở bảng số liệu khách, vì log đã có số đơn.

### Sự thật đã mở

| Đã mở                                                                                                                                                                                          | Chưa mở                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| f1, f6 (n0) · f3 (vai) · f4, f5 (log) · f15 (bảng theo dõi) · f8 (code) · f10, f14, f18 (wiki) · f2, f11 (gọi chị Linh) · f7 (anh An xác nhận) · f16 (bot) · f9, f13 (n1) · f17 (bot giám sát) | f12 (Minh Phát dùng app 2.x): Lan đoán đúng mà không hỏi |

### Lời hứa

| Lời hứa                   | Hẹn                       | Kết quả                     |
| ------------------------- | ------------------------- | --------------------------- |
| Gọi chị Linh              | 11:30 (khung 11:20–11:35) | Giữ, gọi lúc 11:30          |
| Gửi danh sách đơn         | Trước 11:10               | Giữ, gửi lúc 11:05          |
| Báo chị Linh khi có duyệt | Theo sự kiện              | Giữ, ở lượt báo tin cuối ca |

### Chấm dự kiến

| Mục                            | Mức | Bằng chứng (trích lời Lan)                                                                                                                                                                                                 |
| ------------------------------ | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.2 Tìm nguyên nhân gốc        | 2   | A: "bước 2 trong code em lấy món từng đơn 1", "901 lần" · B: "CPU DB có 24% à", "build bắt đầu 10:05" · C: "từ 4,4 giây còn 0,18 giây… đều chỉ 2 lần hỏi"                                                                  |
| 7.1 Trung thực, nhận lỗi       | 2   | A: "lỗi ở API bên em chứ k phải mạng khách" · B: "API lịch sử đơn (phần em viết)"                                                                                                                                          |
| 1.5 Chia sẻ thông tin đúng lúc | 2   | A: báo chị Linh lúc 10:05 · B: "có bản sửa chạy thử rồi… phải có a An duyệt" · C: "11h30 em gọi báo chị"                                                                                                                   |
| 7.4 Giữ lời hứa                | 2   | A: hẹn 11:30 và gọi đúng hẹn; n1-c gửi file đúng hẹn · B: "phải có a An duyệt mới đưa lên được"                                                                                                                            |
| 1.1 Viết rõ ràng               | 2   | A: câu đầu phần Nguyên nhân và phần Hướng xử lý nói thẳng · B: "Anh duyệt giúp em đưa lên production" · C: "901 lần", "4,4 giây còn 0,18 giây"                                                                             |
| R Lường trước rủi ro           | 2   | A: "phải có a An duyệt mới đưa lên được" (chọn chờ duyệt khi bị hối) · B: "xem Minh Phát mở lịch sử dưới 2s và chỉ hỏi CSDL 2 lần" (khi được hỏi) · C: "em bấm Rollback… khoảng 2 phút là về bản cũ" (tự viết trong email) |

**Cờ:** không có.
