# Kinh tế và sức khoẻ JobQuest: lương thật, sức có hạn

JobQuest thêm một lớp **đời sống** quanh công việc:
- **Xu** kiếm bằng việc chơi, theo lương thật của nghề và cấp.
- **Lịch**: mỗi màn chính là một ngày làm việc; giữa hai màn lịch nhảy vài tuần, và khoảng nghỉ đó là lúc mở cửa hàng, nhiệm vụ phụ, cột mốc.
- **Cửa hàng sáu nhóm**: vật phẩm buff, vé nhiệm vụ phụ, thân mật và mở khoá nhân vật, cột mốc cuộc sống, hồi sức khoẻ, decor góc làm việc.
- **Sức khoẻ** 0–100, không phải máu.
- **Làm thêm giờ (OT)**: lựa chọn đổi lượt lấy sức khoẻ, có lương hay không tuỳ loại công ty.
- **22 NPC tarot** mở dần bằng việc chơi hoặc bằng xu.
- **17 cột mốc cuộc sống**, mỗi mốc một cảnh riêng và một buff vĩnh viễn nhỏ.

Hai nguyên tắc giữ cho lớp này công bằng:
- **Tiền mua tốc độ và lựa chọn, không mua trần.** Mọi buff cộng lại không quá +50%, và điểm sau buff không vượt trần của màn.
- **Lương thật hiện ở mức sống, không ở khả năng qua cấp.** Món ảnh hưởng tiến độ tính giá theo xu của chính nghề đang chơi; món đời sống tính giá theo mặt bằng của band.

Mô phỏng 4 nghề × 3 mức chơi × 4 kiểu người chơi (300 lượt mỗi tổ hợp) cho thấy không kiểu nào áp đảo, và cày OT là kiểu tệ nhất. Mọi số trong file là số tạm.

## Cách đọc file này

File chia **tám khối**. Mỗi khối đi theo thứ tự **Đề xuất** → **Chi tiết** → **Mượn từ game** → **Chỗ căng** → **Căn cứ** → **Cần chốt** (khối nào không có phần nào thì bỏ phần đó). Việc cần chốt đánh số theo khối (K, C, S, N, L, B).

| Khối | Nội dung |
|---|---|
| 1–5 | Thiết kế: tiền, cửa hàng, sức khoẻ, NPC, cột mốc |
| 6 | Kết quả mô phỏng cân bằng |
| 7 | Quyết định cũ đề xuất sửa |
| 8 | Các móc mà seed màn cần chừa |

**Trạng thái:**
- **3/11/2026:** bản đề xuất đầu.
- **4/11/2026:** ghép phần Phúc đã chốt ở session walkthrough seed (bốn cơ chế thêm, cửa hàng 6 nhóm, 17 cột mốc, lịch) và chạy mô phỏng cân bằng.
- **4/11/2026, lượt hai:** Phúc chốt sáu điểm còn mở, bỏ chi cố định, chốt nhánh rẻ (L2) và nhiệm vụ phụ không chấm (N5); mô phỏng chạy lại với các thay đổi đó.

Phần đã chốt ghi **(đã chốt)**; phần còn lại là đề xuất. Chưa sửa `docs/project-hub/02-quyet-dinh.md`.

### Cách đọc nguồn

Ghi chú nguồn ở `research/research_notes/Kinh tế và sức khoẻ/`:

| File | Nội dung |
|---|---|
| `cua_hang_buff_game_that.md` | Cửa hàng và buff trong Persona 3/4/5, The Sims 4, Stardew Valley, Fire Emblem: Three Houses, Princess Maker 2, Hades, Slay the Spire, Disco Elysium, Animal Crossing |
| `suc_khoe_cang_thang_game.md` | Mệt, ốm, căng thẳng trong Persona 3, The Sims 4, Stardew, Darkest Dungeon, Frostpunk, Papers, Please, Spent; mẫu chống phạt (Celeste, Hades) |
| `kinh_te_game_dong_luc.md` | Nguồn tiền vào và nơi tiêu tiền, nén chênh lệch lương, công bằng, phần thưởng bên ngoài và động lực, cày cuốc |
| `ot_suc_khoe_xem_truoc_cong_viec.md` | Xem trước công việc thật (RJP), giờ làm dài và sức khoẻ (WHO/ILO), Bộ luật Lao động 2019, lương và giờ làm ở Việt Nam |
| `luong_quy_xu.csv`, `luong_quy_xu.py` | Lương ước theo cấp và xu mỗi màn cho 1.318 cấp của 221 nghề |
| `mo_phong_can_bang.py`, `ket_qua_mo_phong.md` | Mô phỏng cân bằng và bảng kết quả đầy đủ (khối 6) |

Mức kiểm chứng ghi cạnh nguồn như ở `Hồ sơ JobQuest cơ chế game.md`: **toàn văn**, **tóm tắt**, **thứ cấp**, **trang chính thức**, **wiki người hâm mộ**, **chưa xác nhận**.
- Phần lớn số liệu game lấy từ wiki người hâm mộ và hướng dẫn của người chơi. Nhiều wiki chặn công cụ đọc trang, nên một số số chỉ thấy qua trích đoạn tìm kiếm. Giá trong game là để so tỉ lệ, không trích như sự thật.
- Bộ luật Lao động đọc trên bản ký đăng ở cổng Chính phủ. Phần pháp lý là đọc văn bản, không phải tư vấn pháp lý.

## Bức tranh chung

Câu đó là: *"Nghề nào cũng có lương và có giá phải trả. Bạn chọn tiêu sức và tiêu tiền vào đâu."*

| Khối | Một dòng |
|---|---|
| **1. Tiền và lịch** | Xu mỗi màn = 100 × √(lương cấp ÷ 13 triệu), sàn 60, trần 250. Một màn là một ngày làm việc; giữa hai màn là vài tuần nghỉ. Giá theo hai thước: **u** (xu một màn của nghề đang chơi) cho món tiến độ, **X** (xu chuẩn của band) cho món đời sống |
| **2. Cửa hàng** | Sáu nhóm (đã chốt) cộng nhóm phụ là lá bài của NPC Bánh Xe Số Phận. Buff vật phẩm ba bậc +10 / +20 / +30%; trần chung +50% gồm chòm sao, cột mốc, vật phẩm; điểm không vượt trần màn |
| **3. Sức khoẻ và OT** | Thang 0–100, bốn mức; chỉ đổi lượt và lời dẫn. OT hai lần mỗi màn (+2 lượt −12, +1 lượt −18; tổng 4 giờ, đúng trần trong ngày của Điều 107). OT ba màn liền thì hồi chậm lại; dễ sinh thói quen nghề hai mặt |
| **4. NPC tarot và nhiệm vụ phụ** | 6 lá mở sẵn; danh thiếp đưa lá mới vào bộ bài; quà đúng gu, sinh nhật NPC; cốt truyện riêng mở theo ngưỡng thân, quà chỉ làm nhanh hơn |
| **5. Cột mốc, lịch, sự kiện** | 17 cột mốc (đã chốt), mỗi mốc một cảnh và một buff nhỏ; nhánh thay thế thưởng ngang; dịp trong năm có lời mời riêng; mọi cột mốc trả một lần, không có chi cố định |
| **6. Cân bằng** | Cùng mức chơi, bốn kiểu chênh nhau không quá 2 điểm % quỹ; người chơi cân bằng kẹt 1–2% ở mọi nghề; cày OT tệ nhất; người chơi trung bình chơi cân bằng có đủ 7 trên 7 buff vĩnh viễn ở mọi nghề; căn hộ: Back-end cấp 4–6, Điều dưỡng cấp 7 nếu tiết kiệm, nghề lương thấp nhờ bố mẹ góp hoặc ở nghề sau. Năm mục tiêu cân bằng đều đạt |
| **7. Quyết định cũ đề xuất sửa** | D-110, D-114, D-111, D-105, D-113, D-119; giữ D-17, D-86, D-27 |
| **8. Móc cho seed màn** | 13 móc: hao tổn sức khoẻ, đồng hồ có dự phòng, điểm mời OT, mục chưa kịp làm, vai NPC, nhiệm vụ phụ, luật hôm nay, dữ kiện cho mini note, dịp trong lịch… |

---

## Khối 1 · Tiền và lịch

### Đề xuất

| Phần | Đề xuất |
|---|---|
| **Tên** | **Xu** (tạm, K1). Chỉ có trong game, kiếm bằng việc chơi; không bán, không quy đổi ra tiền thật hay quà thật (D-17) |
| **Kiếm từ đâu** | (1) Xong một màn chính: **xu của cấp**. (2) OT ở công ty có trả. (3) Thưởng của công ty theo lịch: lương tháng 13, thưởng Tết, thưởng dự án, mức theo loại hình công ty. (4) Lá "Tiền công" của NPC Bánh Xe Số Phận. (5) Sổ tiết kiệm: +3% thu nhập. Không kiếm được bằng đăng nhập hằng ngày hay xem quảng cáo |
| **Theo lương thế nào** | **Xu mỗi màn = 100 × √(lương tháng của cấp ÷ 13 triệu)**, làm tròn, sàn 60, trần 250. 13 triệu là trung vị lương của 217 nghề có số |
| **Chơi lại** | Lần đầu xong màn 100%, lần hai 50%, từ lần ba 25%. Kết quả điểm theo D-119 |
| **Lịch** (đã chốt) | Mỗi màn chính = một ngày làm việc. Giữa hai màn lịch nhảy vài tuần. Một cấp dài gần bằng thời gian thật: thực tập vài tháng, từ junior trở lên khoảng một năm. Khoảng nghỉ có **2 suất hoạt động** (nhiệm vụ phụ, nghỉ, cảnh cột mốc) |
| **Hai thước giá** | **u** = xu một màn của nghề và cấp đang chơi (60–250). **X** = xu chuẩn của band, là trung vị xu của mọi nghề ở band đó: L1 84 · L2 92 · L3 98 · L4 103 · L5 107 · L6 114 · L7 124 · L8 131 · L9 149. Món **tiến độ** (buff, hồi sức khoẻ, vé nhiệm vụ phụ, quà NPC) tính theo u; món **đời sống** (cột mốc, decor) tính theo X. Cả hai tự tăng theo cấp |
| **Hiện thế nào** | Màn chọn cấp và màn tổng kết luôn hiện **lương tham khảo bằng đồng**, kèm nguồn và năm số liệu, cạnh số xu. Xu hiện sau màn như "lương kỳ này", không hứa trước "làm X được Y xu". Ngày lương có thư báo, cửa hàng giảm giá (đã chốt) |
| **Không có** | Chi cố định (tiền phòng, trả góp, báo hiếu hằng tháng; đã chốt bỏ cho đỡ phức tạp), bảng xếp hạng tài sản, chuyển xu giữa người chơi, xu mua mở cấp hay gợi ý nghề, phạt trừ xu (email "luật hôm nay" chỉ mang thông tin, đã chốt) |

### Chi tiết: quy lương ra xu

Lương mỗi cấp ước từ trường `pay` của `occupation_profiles.json`:
- **Nghề IT có số theo năm kinh nghiệm của ITviec:** lấy mức gần nhất với số năm của cấp.
- **Nghề khác:** nội suy đều từ mức thấp (P25 hoặc low) ở cấp đầu tới mức cao (P75 hoặc high) ở cấp cuối. Đây là ước lượng thô (K3).

| Phép quy | Thấp nhất | P5 | Trung vị | P95 | Cao nhất | Cao nhất ÷ thấp nhất | P95 ÷ P5 |
|---|---|---|---|---|---|---|---|
| Tuyến tính (100 × lương ÷ 13 triệu) | 31 | 52 | 105 | 356 | 3.600 | 117 | 6,8 |
| **Căn bậc hai, sàn 60, trần 250 (đề xuất)** | **60** | **72** | **103** | **189** | **250** | **4,2** | **2,6** |
| Sàn 60 + 40 × căn bậc hai | 82 | 89 | 101 | 134 | 300 | 3,7 | 1,5 |

Bảng tính trên 1.294 cấp có lương. 24 cấp của 4 nghề IT chưa có lương: UI/UX, DevOps, Cloud, Mạng.
- **Tuyến tính** làm Phi công (lương tham khảo 208–468 triệu) gấp 117 lần nghề thấp nhất, trong khi màn của hai nghề dài như nhau.
- **Căn bậc hai** giữ thứ tự và giữ cảm giác "nghề này lương cao hơn hẳn": khoảng giữa 90% vẫn chênh 2,6 lần. 7 cấp chạm sàn, 15 cấp chạm trần.
- **Sàn cố định cộng phần nén** làm khác biệt gần như biến mất (1,5 lần).

| Nghề | Xu mỗi màn từ cấp đầu tới cấp cuối | Lương tham khảo (triệu/tháng) | Xu cả nghề (mô phỏng, khối 6) |
|---|---|---|---|
| Lao động trồng trọt | 60 → 73 | 4,3 → 7,0 | khoảng 1.900 |
| Nhân viên phục vụ nhà hàng | 76 → 92 | 7,5 → 11,0 | khoảng 2.500 |
| Điều dưỡng | 90 → 107 | 10,5 → 14,8 | khoảng 3.100 |
| Lập trình viên Back-end | 121 → 206 | 18,9 → 54,9 | khoảng 5.100 |
| Phi công | 250 (chạm trần) | 208 → 468 | |

Bảng đủ 1.318 cấp ở `luong_quy_xu.csv`.

### Chi tiết: vì sao hai thước giá

Phúc đề nghị tính giá theo số xu một màn trả để giá tự tăng theo cấp. Mô phỏng (khối 6) cho thấy:
- **Món tiến độ tính theo X của band:** nghề lương cao mua buff nhiều hơn. Người chơi yếu chơi cân bằng kẹt ở 4% lượt chơi ở nghề trồng trọt so với 1% ở Back-end. Như vậy tiền đổi được một phần khả năng qua cấp, trái D-17 (mở cấp theo năng lực, không theo tiền).
- **Món tiến độ tính theo u của chính nghề đó:** tỉ lệ kẹt là 1–2% ở cả bốn nghề. Một lá buff vừa luôn bằng nửa lương một màn, ở nghề nào cũng thế.

Món đời sống thì tính theo X: phòng riêng, xe máy, căn hộ có giá như nhau với mọi nghề cùng band, nên nghề lương cao mua được sớm hơn. **Chênh lệch lương hiện ra ở mức sống, không ở chỗ ai qua cấp được.**

### Chi tiết: thưởng và OT ra xu

| Loại trả OT của công ty (`overtime_pay`) | Mỗi lần nhận OT trong màn | Lời dẫn |
|---|---|---|
| `tra_them` (trả theo giờ) | +15% xu của màn | *"Tối nay tính 150% lương giờ."* |
| `theo_san_pham` | +10% xu của màn | *"Làm thêm được thêm sản phẩm, tính theo sản phẩm."* |
| `phu_cap_co_dinh` | 0; phụ cấp cố định đã nằm trong lương | *"Phụ cấp trực cố định, làm thêm không tính thêm."* |
| `luong_tron_goi`, `ap_luc_khong_luong` | 0 | *"Lương trọn gói, giờ thêm không tính tiền."* |
| `nghi_bu` | 0 xu, khoảng nghỉ sau +10 sức khoẻ | *"Được nghỉ bù nửa buổi."* |

Thưởng công ty là sự kiện ở màn tổng kết hoặc thư trong lịch, mức theo loại hình công ty (doanh nghiệp lớn có lương tháng 13, startup có thể không). Mô phỏng tính gộp 0,5 u mỗi năm.

### Mượn từ game

| # | Mẫu | Game và mức kiểm chứng | Mượn gì | Tránh gì |
|---|---|---|---|---|
| 1 | Lương theo nghề và cấp | The Sims 4: bảng lương theo cấp, nghề cao gấp nhiều lần nghề thấp ([Sims Community, wiki người hâm mộ](https://simscommunity.info/2023/01/13/highest-paid-careers-in-the-sims-4/)) | Lương khác nhau thật giữa nghề | Chênh không nén: ở JobQuest tiền mua được buff, nên chênh lương phải nén trước khi thành xu |
| 2 | Giá tính theo ca làm | Persona 5 Royal: một ca cửa hàng tiện lợi ¥3.500, một lá bài của Chihaya ¥5.000 ([RPG Site, hướng dẫn](https://www.rpgsite.net/feature/5481-persona-5-royal-jobs-guide-part-time-job-list-unlocks)) | Món buff ≈ một màn lương (thước u) | |
| 3 | Kinh tế căng, nguồn có trần | Daniel Cook, "Value chains" ([Lostgarden, toàn văn](https://lostgarden.com/2021/12/12/value-chains/)): nơi tiêu nhỉnh hơn nguồn vào; nguồn cày được phải có trần | Chơi lại giảm xu; chỗ tiêu lặp lại (ăn, buff) và chỗ tiêu lớn (cột mốc) | Tiền dồn đống: 10 vàng mỗi ngày thành 7.300 sau hai năm |

### Chỗ căng

| Chỗ căng | Bằng chứng | Cách xử lý |
|---|---|---|
| **Nghề lương thấp thành "chơi khổ"** | Spent (giả lập nghèo đói) cố ý khó thắng để tạo đồng cảm ([Next Avenue, thứ cấp](https://www.nextavenue.org/what-online-poverty-game-can-teach-you/)); JobQuest là công cụ khám phá (D-86), không phải trò chơi về nghèo | Món tiến độ theo u; sàn 60 xu; không có chi cố định; hồi sức khoẻ cơ bản miễn phí; mở cấp không cần xu |
| **Nén lương thì kém trung thực** | Mục tiêu của D-02, BR-07 là cho thấy nghề thật | Trung thực nằm ở **lương bằng đồng luôn hiện**, ở chuyện OT có lương hay không, ở mức sống khác nhau (cột mốc theo X) và ở đánh giá nghề theo lương của D-27. Xu là luật chơi, ghi rõ *"xu đã nén chênh lệch để mọi nghề chơi được"* |
| **Phần thưởng bên ngoài làm giảm hứng thú** | Phần thưởng hữu hình hứa trước làm giảm động lực tự thân; thưởng theo mức hoàn thành d = −0,36, theo kết quả d = −0,28 ([Deci, Koestner và Ryan 1999, tóm tắt](https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf)) | Xu hiện sau màn như lương, không hứa trước; không bảng xếp hạng; điểm soft skill vẫn là thứ chính hiện ra sau màn |
| **Lương cấp ước thô** | Nội suy thấp–cao không phản ánh bậc lương thật; IT cấp thực tập ước 50% trung vị (Back-end L1 ra 18,9 triệu, cao hơn lương thực tập thật) | Ghi "tham khảo"; sửa dần khi có số theo cấp (K3) |

### Cần chốt

| # | Việc | Đề xuất |
|---|---|---|
| K1 | Tên đơn vị tiền | "Xu" |
| K2 | Cách nén | Căn bậc hai, sàn 60, trần 250 **(đã chốt 4/11)** |
| K3 | Lương theo cấp | Giữ nội suy tạm; cấp thực tập dùng số riêng khi có; 4 nghề IT thiếu lương tạm lấy trung bình nhóm |
| K4 | Có hiện lương bằng đồng cạnh xu không | Có, luôn kèm nguồn và năm |
| K5 | Tỉ lệ chơi lại | 100 / 50 / 25% |
| K6 | **Hai thước giá** | Món tiến độ theo u, món đời sống theo X **(đã chốt 4/11)** |

---

## Khối 2 · Cửa hàng

### Đề xuất

**Luật chung (đã chốt):**
- Mọi thứ trong cửa hàng nằm ngoài phần chấm; judge không biết người chơi có món gì.
- Không món nào khoá thông tin nghề hay màn chính.
- Chỉ dùng xu trong game, không tiền thật.
- Cảnh đời sống không chứa việc, không chấm soft skill.
- Không nội dung nào mất vĩnh viễn.

| Nhóm | Gồm | Chạm điểm soft skill? |
|---|---|---|
| **1. Vật phẩm buff** | 7 nhóm soft skill × 3 bậc, dùng một màn (bảng dưới) | Có, theo luật buff và trần chung |
| **2. Vé nhiệm vụ phụ đặc biệt** | Xem phim suất khuya, karaoke cả phòng, concert (mở cảnh của NPC mê nhạc), lớp nấu ăn cuối tuần, chợ hoa Tết (chỉ bán dịp Tết) | Không chấm; xong nhiệm vụ phụ thì cộng một lượng thưởng cố định từ quỹ 10% của cấp (D-119) |
| **3. Thân mật và mở khoá nhân vật** | Cà phê sữa đá (ai cũng nhận), quà đúng gu theo danh sách thích và ghét trong hồ sơ lá (mở cảnh riêng), quà sinh nhật NPC theo lịch, **danh thiếp** (đưa một lá tarot mới vào bộ bài để bốc ở công ty sau; lá hiếm giá cao) | Không trực tiếp |
| **4. Cột mốc cuộc sống** | 17 mốc (khối 5) | Buff vĩnh viễn +5% một nhóm, trong trần chung |
| **5. Buff sức khoẻ** | Tô phở sáng, nước dừa (hồi nhẹ); gói gym tháng (hồi đều mỗi khoảng nghỉ); massage cổ vai gáy (hồi nhiều); khám sức khoẻ định kỳ (gỡ hồi chậm do OT dài); nghỉ phép 3 ngày (hồi đầy, lịch trôi thêm 3 ngày) | Không |
| **6. Decor góc làm việc** | Chia ô (mặt bàn, kệ, tường, màn hình) để tự sắp: sen đá, ly in tên, figure, đèn bàn, bàn phím cơ, màn hình phụ, lịch để bàn, poster; đồ theo dịp (đèn lồng Trung thu, bao lì xì); khung ảnh tự sinh từ nhiệm vụ phụ đã chơi; mang theo khi chuyển công ty; NPC thỉnh thoảng bình luận. Chỉ đồ nhìn thấy được, thuần trang trí | Không |
| **Nhóm phụ: lá bài** | Bốn lá của NPC Bánh Xe Số Phận: Vận may (+50% một nhóm, màn kế), Tiền công (xu màn kế ×1,5), Duyên (tình thân với một NPC ×2 ở màn kế), Xem trước (hiện hai nhóm trọng tâm của màn kế) | Vận may: có, trong trần chung |

### Chi tiết: luật buff và trần chung

1. **Một ô chuẩn bị mỗi màn.** Trước màn chọn tối đa một vật phẩm buff hoặc lá Vận may (Stardew chỉ cho một buff đồ ăn một lúc; Chihaya chỉ đọc bài vài tối mỗi tuần).
2. **Nhân điểm đã kiếm, chỉ phần dương.** Code nhân sau khi judge chấm (judge không biết có buff), giống buff chòm sao (D-113, D-116).
3. **Trần chung của một nhóm trong một màn:** phần cộng thêm = chòm sao (12% nếu nhóm thuộc cung) + buff vĩnh viễn của cột mốc (5%, các mốc cùng nhóm không cộng dồn) + vật phẩm (10 / 20 / 30%, Vận may 50%), **tối đa +50%**. Tổ hợp mạnh nhất không dùng lá là 12 + 5 + 30 = 47%; có lá Vận may thì chạm trần 50%.
4. **Điểm sau buff không vượt trần của nhóm trong màn** (phần hoạt động đã kịp làm). Buff giúp người chơi chưa hoàn hảo tới gần trần, không đẩy ai vượt điều một người chơi hoàn hảo có được. Luật này áp cho cả chòm sao: một người chơi đạt 100% không còn phần dư của chòm sao (sửa D-113, khối 7).
5. **Hai sổ điểm.** Engine giữ **điểm** (có buff, dùng mở cấp, hiện trên biểu đồ 7 góc) và **điểm gốc** (không buff nào). Gợi ý "bạn làm tốt" (D-111), điểm mạnh và điểm cần luyện (D-105) tính trên điểm gốc. Ô thông tin của biểu đồ ghi *"+180 Giao tiếp · gồm +60 từ buff"*.

**Ví dụ.** Màn L3, trần Giao tiếp 240, người chơi cung Song Tử (chòm sao buff Giao tiếp), có chứng chỉ ngoại ngữ (cột mốc +5% Giao tiếp), dùng bình trà mời cả nhóm (+30%).
- Phần cộng thêm là 12 + 5 + 30 = 47%.
- Đạt 55% thì được 132 × 1,47 = 194 điểm, dưới trần nên giữ.
- Đạt 100% (240 điểm) thì vẫn 240.

### Chi tiết: bảng giá

Giá ghi theo **u** (món tiến độ) hoặc **X** (món đời sống). Ở trung vị u ≈ X ≈ 100, nên "0,5 u" nghĩa là khoảng nửa lương một màn. Mỗi bậc giá có một nhiệm vụ trong nền kinh tế:

| Bậc | Giá | Vai trò |
|---|---|---|
| **Rẻ** | ≤ 0,1 u | Mua mỗi khoảng nghỉ không nghĩ |
| **Trung** | 0,2–0,5 u | Cân nhắc mỗi màn |
| **Đắt** | 0,6–1,5 u | Để dành vài màn |
| **Cột mốc** | 2–8 X | Để dành một hai cấp |

**1. Vật phẩm buff** (một ô chuẩn bị mỗi màn, dùng một màn)

| Nhóm soft skill | Nhẹ +10% · 0,25 u | Vừa +20% · 0,5 u | Mạnh +30% · 0,9 u |
|---|---|---|---|
| Tư duy và giải quyết vấn đề | Giấy note vàng | Bảng trắng mini | Sổ sơ đồ tư duy bìa da |
| Thích ứng và học hỏi | Bộ thẻ ghi nhớ | Tai nghe podcast | Thẻ thư viện năm |
| Tự quản lý và chịu áp lực | Ly cà phê đen | Đồng hồ cát Pomodoro | Sổ kế hoạch tuần |
| Giao tiếp và hợp tác | Kẹo bạc hà | Xấp thiệp "cảm ơn" | Bình trà mời cả nhóm |
| Trí tuệ cảm xúc và xử lý xung đột | Bóng bóp giảm stress | Túi trà hoa cúc | Sổ nhật ký cảm xúc |
| Lãnh đạo và tư duy kinh doanh | Báo kinh tế sáng nay | Cây bút ký | Áo blazer |
| Đạo đức và chuyên nghiệp | Bìa hồ sơ trong suốt | Sổ checklist | Con dấu "Đã kiểm tra" |

Lá Vận may (+50%) giá 1,5 u, chỉ có khi NPC Bánh Xe Số Phận đã thân. Bậc mạnh đắt gấp 3,6 lần bậc nhẹ nhưng chỉ mạnh gấp 3 lần, nên dùng bậc nhẹ đều đặn rẻ hơn mỗi phần trăm; bậc mạnh đáng mua khi một nhóm đang nghẽn sát ngưỡng mở cấp.

**2–3. Vé nhiệm vụ phụ và thân mật** (theo u)

| Món | Giá | Ghi chú |
|---|---|---|
| Cà phê sữa đá mời NPC | 0,05 u | Ai cũng nhận; tình thân nhỏ |
| Vé phim suất khuya | 0,2 u | Nhiệm vụ phụ với một NPC đã thân |
| Karaoke cả phòng | 0,3 u | Nhiệm vụ phụ nhóm |
| Quà đúng gu | 0,3 u | Mở cảnh riêng nếu đúng danh sách thích |
| Quà sinh nhật NPC | 0,5 u | Mốc cốt truyện, chỉ trong khoảng nghỉ có ngày sinh nhật |
| Lớp nấu ăn cuối tuần | 0,6 u | Nhiệm vụ phụ; cần chỗ ở có bếp để nấu lại ở nhà |
| Chợ hoa Tết | 0,4 u | Chỉ bán dịp Tết |
| Concert | 1,0 u | Mở cảnh cốt truyện của NPC mê nhạc |
| Danh thiếp | 1,0 u, lá hiếm 3,0 u | Đưa một lá tarot chưa mở vào bộ bài công ty |

Trung bình mỗi nhiệm vụ phụ trong mô phỏng tốn 0,2 u; mức này giữ để người tiết kiệm ở nghề trung vị vẫn mua được căn hộ trong nghề đầu (khối 6).

**5. Buff sức khoẻ** (theo u)

| Món | Giá | Tác dụng |
|---|---|---|
| Nước dừa | 0,05 u | +5 |
| Tô phở sáng | 0,1 u | +8 |
| Gói gym tháng | 0,3 u mỗi khoảng nghỉ, mua 4 khoảng | +5 mỗi khoảng nghỉ |
| Massage cổ vai gáy | 0,5 u | +25 |
| Khám sức khoẻ định kỳ | 0,8 u | Gỡ "hồi chậm do OT dài", +15 |
| Nghỉ phép 3 ngày | 1,0 u (chi phí đi chơi; phép năm không mất tiền) | Hồi đầy, gỡ hồi chậm; lịch trôi thêm 3 ngày |

**6. Decor** (theo X): món thường 0,3–1 X, món lớn (bàn phím cơ, màn hình phụ) 2–3 X, đồ theo dịp 0,5–1,5 X. Decor là nơi tiêu tiền lớn duy nhất không có trần, để người tiêu hết và người nghề lương cao có chỗ dùng xu (Cook: cần chỗ tiêu lặp lại để tiền không dồn đống).

**Không bán:**
- Món cộng thẳng điểm, vì đi vòng qua việc chơi.
- Món nâng trần cấp hay hạ ngưỡng mở cấp.
- Món đổi kết quả judge.
- Món mở cấp, mở nghề hay mở gợi ý nghề.
- Bảo hiểm và vay nợ, vì thêm luật mà không thêm nhu cầu.
- Đồ có tác dụng ngầm (ghế công thái học đã bỏ, đã chốt).

### Mượn từ game

| # | Mẫu | Game và mức kiểm chứng | Mượn gì | Tránh gì |
|---|---|---|---|---|
| 4 | Buff trong ngày bán bởi một nhân vật | Persona 5: Luck Reading ×1,5 một chỉ số xã hội trong ngày, ¥5.000; chỉ tối thứ Ba, Năm, Bảy, Chủ nhật; quan hệ mở bằng Holy Stone ¥100.000, hoàn lại ở rank 9 ([samurai-gamers, hướng dẫn](https://samurai-gamers.com/persona-5/fortune-confidant-chihaya-mifune/); [RPG Site, hướng dẫn](https://www.rpgsite.net/feature/5472-persona-5-chihaya-mifune-fortune-confidant-choices-relationship-guide)) | Lá bài của NPC Bánh Xe Số Phận | |
| 5 | Một ô buff | Stardew Valley: một buff đồ ăn một lúc, đồ uống ô riêng, hết khi ngủ ([wiki người hâm mộ, trích đoạn](https://stardewvalleywiki.com/Food)) | Ô chuẩn bị | Buff xếp chồng làm người giàu vượt nhịp |
| 6 | Buff lớn trả bằng tiền khác, không bằng lương | The Sims 4: trait học nhanh mua bằng Satisfaction Points kiếm từ mong muốn, không từ lương ([Sims Community, wiki người hâm mộ](https://simscommunity.info/2022/05/23/guide-to-satisfaction-points-rewards-in-the-sims-4/)) | Lý do món tiến độ tính theo u của nghề, không theo lương tuyệt đối | |
| 7 | Giá tăng dần | Slay the Spire: xoá bài 75 vàng, mỗi lần +25 ([wiki.gg, wiki người hâm mộ](https://slaythespire.wiki.gg/wiki/Shop)) | Dự phòng nếu chơi thử thấy buff bị lạm dụng | |
| 8 | Món rẻ mà có ý nghĩa | Persona 3 Reload: cà phê ¥500 +2 Charm ([megatenwiki, wiki người hâm mộ](https://megatenwiki.com/wiki/Chagall_Cafe)) | Bậc rẻ ≤ 0,1 u | |

### Chỗ căng

| Chỗ căng | Bằng chứng | Cách xử lý |
|---|---|---|
| **Buff thổi phồng soft skill, mà soft skill mở cấp (D-114)** | Mua sức mạnh bằng tiền kiếm trong game được chấp nhận ở game một người chơi vì ai cũng đối mặt cùng một nền kinh tế; cảm giác bất công đến khi nguồn tiền không đều giữa người chơi ([Freeman và cộng sự 2022, tóm tắt](https://digitalcommons.njit.edu/fac_pubs/2577)) | Trần chung +50%; không vượt trần màn; món tiến độ theo u; mô phỏng: buff thêm khoảng 6 điểm % quỹ ở mọi mức chơi (khối 6) |
| **Buff làm sai gợi ý nghề (D-111)** | Gợi ý "bạn làm tốt" là phép đo | Hai sổ điểm; gợi ý, điểm mạnh và điểm cần luyện dùng điểm gốc |
| **Chòm sao mất phần dư ở người chơi giỏi** | Trần màn áp cho mọi buff | Có chủ ý: chòm sao vẫn giúp người sát ngưỡng (đúng ý "lợi thế nhỏ" ở khối F · Hoàng đạo của `Hồ sơ JobQuest cơ chế game.md`), không còn đẩy ai quá điều chơi hoàn hảo có được |

### Cần chốt

| # | Việc | Đề xuất |
|---|---|---|
| C1 | Buff mua được có chạm điểm không | Có, theo năm luật trên **(đã chốt 4/11)** |
| C2 | Mức buff | Vật phẩm +10 / +20 / +30%; Vận may +50%; cột mốc +5% **(đã chốt 4/11)** |
| C3 | **Trần chung** | Phần cộng thêm ≤ +50%, điểm ≤ trần màn, áp cả chòm sao **(đã chốt 4/11)** |
| C4 | Biểu đồ 7 góc hiện điểm có buff hay điểm gốc | Điểm có buff, ô thông tin tách phần buff |
| C5 | Giá | Bảng trên, chỉnh khi chơi thử |

---

## Khối 3 · Sức khoẻ và làm thêm giờ

### Đề xuất

| Phần | Đề xuất |
|---|---|
| **Thang** | 0–100 (giải 10K đầu tiên nâng trần lên 110), bốn mức hiện bằng chữ và màu: **Sung sức** 80+ · **Ổn** 50–79 · **Mệt** 25–49 · **Kiệt sức** 0–24. Không bao giờ dưới 0, không có thua |
| **Tác động** | Chỉ đổi **số lượt** và **lời dẫn**; không đổi điểm, trần, thang chấm hay judge. Sung sức +1 lượt dự phòng · Ổn bình thường · Mệt −1 lượt · Kiệt sức −2 lượt, không có lời mời OT |
| **Giảm vì** | (1) **Hao tổn nền** của màn 2–9, tính từ môi trường công ty, hiện trước khi vào màn. (2) **OT** do người chơi chọn. (3) Sự kiện người chơi chọn. Không giảm ngẫu nhiên |
| **Hồi** | Mỗi khoảng nghỉ +10 miễn phí; mỗi suất nghỉ +8; nhiệm vụ phụ +6; vào cấp mới và Tết về quê nâng lên ít nhất 70 (về quê ăn Tết: hồi đầy); đồ ăn, gym, massage, nghỉ phép; căn hộ +5 mỗi khoảng nghỉ |
| **Kiệt sức** | Trước màn kế, game đề nghị **nghỉ một buổi**: cảnh ngắn miễn phí, +35. Người chơi được từ chối |

**Hao tổn nền** = 2 + lịch (ca xoay, trực, theo chuyến +2) + rủi ro thể chất (vừa +2, cao +4) + tiếp xúc khách (vừa +1, cao +2) + làm cuối tuần +1. Ví dụ:
- Back-end ở công ty product: 2.
- Lao động trồng trọt ở nông hộ: 5.
- Phục vụ nhà hàng chuỗi: 9.
- Điều dưỡng bệnh viện công: 9.

### Chi tiết: OT đổi lượt

Có hai cách gặp OT, cả hai đều là lựa chọn và báo giá trước:
1. **Hết giờ mà chưa xong:** *"Ở lại làm nốt?"* Lời mời này luôn có, trừ khi Kiệt sức.
2. **Công ty yêu cầu:** NPC ở vai quản lý đề nghị ở lại. Tần suất theo `overtime_level` của loại hình công ty:
   - `it`: khoảng 10% số màn;
   - `theo_dot`: khoảng 35%, dồn vào mùa cao điểm của lịch;
   - `thuong_xuyen`: khoảng 80%.

   Theo dữ liệu môi trường làm việc, 119/221 nghề có loại hình OT thường xuyên; với 85 nghề, đó là loại hình chính.

| Lần nhận OT trong màn | Lượt | Sức khoẻ | Giờ |
|---|---|---|---|
| Lần 1 | +2 | −12 | 2 giờ |
| Lần 2 | +1 | −18 | 2 giờ |
| Lần 3 | Không có lời mời thường; nếu công ty vẫn ép thì là sự kiện quá trần | | |

- **Trần trong ngày.** Một màn là một ngày, nên hai lần OT là 4 giờ, đúng mức *"không quá 50% số giờ làm việc bình thường trong 01 ngày"* của Điều 107 với ngày 8 giờ. Vì vậy trần luật nằm ngay trong luật chơi.
- **Lần sau lời ít hơn lần trước.** Quá một ngưỡng giờ làm, sản lượng tăng chậm dần ([Pencavel 2014, tóm tắt](https://docs.iza.org/dp8129.pdf)).
- **Lời mời ghi đủ giá.** Ví dụ: *"Ở lại tới 20:00: +2 lượt · −12 sức khoẻ · công ty trả 150% lương giờ."*
- **Quỹ dự phòng 6 tháng** (cột mốc) làm OT hao ít hơn 20%.
- **Không chấm lựa chọn OT.** Nhận hay từ chối là chuyện giá trị cá nhân; judge không thấy lựa chọn này. Từ chối OT thì việc dở được ghi là chưa kịp làm (móc 4, khối 8): không bị trừ, phần quỹ đó lấy được khi chơi lại.
- **Ép làm quá trần.** Công ty yêu cầu lần ba trong cùng ngày, hoặc mùa cao điểm kéo dài, thì có sự kiện riêng với ba lựa chọn:
  - từ chối (hợp pháp, lời dẫn trích Điều 107);
  - nhận (sức khoẻ trừ gấp đôi, không thêm lượt);
  - gọi NPC Công Lý nếu đã thân.

  Ngành được làm tới 300 giờ/năm (dệt may, da giày, điện tử, chế biến nông lâm thuỷ sản, điện, viễn thông…) ghi rõ trong lời dẫn.

### Chi tiết: OT dài và thói quen nghề

- **OT dài:** nhận OT ở 3 màn liền thì hồi miễn phí mỗi khoảng nghỉ còn một nửa. Gỡ bằng một trong ba cách: khám sức khoẻ, nghỉ phép 3 ngày, hoặc một màn không OT.
- **Thói quen nghề hai mặt (đã chốt):** sau nhiều OT hoặc sự cố, người chơi nhận một thói quen có cả mặt tốt và mặt xấu. Có 3 ô; thói quen hình thành qua vài màn; đổi được bằng nghỉ ngơi hoặc xu.
  - Ví dụ: *"Cú đêm"* (OT lần một chỉ −8, nhưng hồi mỗi khoảng nghỉ −3); *"Phản xạ sự cố"* (+1 lượt dự phòng ở màn có sự cố, nhưng lời dẫn căng hơn ở màn thường).
  - Luật: chỉ đổi lượt, lời dẫn, tiện ích; không đổi điểm judge; không khoá vĩnh viễn. Mô phỏng chưa tính thói quen nghề.

### Chi tiết: tổng kết cuối màn

Ví dụ: *"Hôm nay bạn làm 12 tiếng, 4 tiếng là làm thêm (được trả 150%). Sức khoẻ 64 → 25, mức Mệt."*
- **Dòng bằng chứng:** khi người chơi nhận OT ở ba màn liền, tổng kết thêm một dòng, không lên lớp: *"Làm từ 55 giờ một tuần trở lên làm nguy cơ đột quỵ cao hơn khoảng 35% (WHO và ILO, 2021)."* Mỗi nghề hiện dòng này tối đa một lần.
- **Mỗi mức có lối mở:**
  - Mệt: NPC đã thân hỏi han, mở cảnh ngắn tăng tình thân.
  - Kiệt sức: NPC Sức Mạnh hoặc Tiết Độ rủ đi bơi, đi bộ (nhiệm vụ phụ hồi phục).

### Mượn từ game

| # | Mẫu | Game và mức kiểm chứng | Mượn gì | Tránh gì |
|---|---|---|---|---|
| 9 | Tăng ca là luật người chơi tự bật | Frostpunk: Extended Shift tăng bất mãn và làm sức khoẻ công nhân xấu đi ([Fandom, trích đoạn](https://frostpunk.fandom.com/wiki/Extended_Shift_(Adaptation_Law))) | OT là lựa chọn có giá thấy trước | |
| 10 | Bỏ mệt ngẫu nhiên | Persona 3 Reload bỏ hệ Tired/Sick vì đánh vào lịch và làm game kém vui; ốm đến ngẫu nhiên ([Siliconera, trang tin](https://www.siliconera.com/persona-3-reload-will-remove-fatigue-system/)) | Không giảm sức khoẻ ngẫu nhiên | Mệt rơi xuống không báo |
| 11 | Biến bất lợi thành cơ hội | Persona 3: mệt hay ốm thì ghé phòng y tế được thêm Courage ([samurai-gamers, hướng dẫn](https://samurai-gamers.com/persona-3-reload/p3re-status-conditions-guide/)) | Mỗi mức có lối mở | |
| 12 | Kẹp mức xấu nhất | Darkest Dungeon: về thị trấn thì căng thẳng kẹp ở 100 ([wiki.gg, wiki người hâm mộ](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon))) | Cấp mới bắt đầu từ ít nhất 70 | Hồi phục đắt (1.000–2.700 vàng ở Abbey) |
| 13 | Tật hai mặt | Darkest Dungeon: quirk tốt và xấu hình thành sau chuyến đi ([wiki.gg, wiki người hâm mộ](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon))); Disco Elysium: Thought Cabinet | Thói quen nghề 3 ô | Tật khoá vĩnh viễn |
| 14 | Báo trước bằng mức | The Sims 4: "Dazed" báo trước burnout ([Sims Community, wiki người hâm mộ](https://simscommunity.info/2023/05/10/sims-4-burnouts/)) | Bốn mức có tên | Burnout không tắt được, người chơi xin bỏ ([diễn đàn EA](https://forums.ea.com/discussions/the-sims-4-feedback-en/please-make-burnout-optional/11218467)) |

### Chỗ căng

| Chỗ căng | Bằng chứng | Cách xử lý |
|---|---|---|
| **Sức khoẻ có phải là máu mà D-110 đã bỏ** | Máu là thanh hết thì thua | Không làm thua, không hạ điểm, không chặn mở cấp; gần năng lượng của Stardew hơn máu. Sửa câu chữ D-110 (khối 7) |
| **Ít lượt hơn là phạt gián tiếp** | Ít lượt thì có thể không kịp làm hết | Mục chưa kịp làm không bị trừ (móc 4); đồng hồ chừa 2 lượt dự phòng; mô phỏng: người không cày OT gần như không bao giờ Mệt |
| **Lên lớp về OT** | Xem trước công việc giúp chủ yếu nhờ người xem thấy được **sự trung thực**, không phải nhờ hạ kỳ vọng ([Earnest, Allen và Landis 2011, tóm tắt](https://wrap.warwick.ac.uk/57084/)) | Nói OT như một sự thật của nghề, có số; một dòng bằng chứng mỗi nghề; không chấm lựa chọn |
| **Nói quá về hiệu quả** | Hiệu ứng của xem trước công việc nhỏ (r khoảng −0,06 tới −0,07 với nghỉ việc, thứ cấp); chưa có nghiên cứu nào về xem trước công việc bằng game | Ghi "dựa trên lý thuyết xem trước công việc", không ghi "đã chứng minh" |

### Căn cứ

- **Giờ làm dài:**
  - 488 triệu người (8,9% dân số thế giới) làm từ 55 giờ/tuần; 745.194 ca tử vong do bệnh tim thiếu máu và đột quỵ năm 2016 ([Pega và cộng sự 2021, tóm tắt](https://pubmed.ncbi.nlm.nih.gov/34011457/)).
  - Từ 55 giờ/tuần, nguy cơ đột quỵ +35%, bệnh tim +17%; Tây Thái Bình Dương và Đông Nam Á chịu nặng nhất ([WHO, trang chính thức](https://www.who.int/news/item/17-05-2021-long-working-hours-increasing-deaths-from-heart-disease-and-stroke-who-ilo)).
- **Luật Việt Nam** ([Bộ luật Lao động 45/2019/QH14, bản ký, trang chính thức](https://datafiles.chinhphu.vn/cpp/files/vbpq/2019/12/45.signed.pdf), tr. 37–40):
  - Điều 105: giờ bình thường không quá 8 giờ/ngày, 48 giờ/tuần.
  - Điều 107: làm thêm phải được người lao động đồng ý; không quá 50% giờ bình thường trong ngày, *"không quá 40 giờ trong 01 tháng"*, không quá 200 giờ/năm, 300 giờ/năm ở các ngành ở khoản 3.
  - Điều 98: lương làm thêm ít nhất 150% ngày thường, 200% ngày nghỉ hằng tuần, 300% ngày lễ, Tết.
- **Giờ làm và thu nhập ở Việt Nam:**
  - Khoảng 29% người có việc làm trên 48 giờ/tuần năm 2024 (số của Cục Thống kê qua Vietcetera, thứ cấp).
  - Thu nhập bình quân quý III/2026 là 9,2 triệu đồng, gồm cả tiền làm thêm ([Cục Thống kê, trang chính thức](https://www.nso.gov.vn/wp-content/uploads/2026/10/Thong-cao-bao-chi-ve-tinh-hinh-lao-dong-viec-lam-QIII-nam-2026.pdf)).

### Cần chốt

| # | Việc | Đề xuất |
|---|---|---|
| S1 | Sức khoẻ có làm mất lượt không | Có, −1 và −2, kèm đồng hồ dự phòng 2 lượt **(đã chốt 4/11)** |
| S2 | Lượng OT | +2/−12 rồi +1/−18, tối đa 2 lần mỗi màn (4 giờ) **(đã chốt 4/11)** |
| S3 | Hồi | +10 mỗi khoảng nghỉ, +8 mỗi suất nghỉ, ít nhất 70 khi vào cấp mới |
| S4 | Lựa chọn OT có được chấm không | Không **(đã chốt 4/11)** |
| S5 | Dòng bằng chứng WHO/ILO | Một lần mỗi nghề, chỉ khi nhận OT ba màn liền |
| S6 | Thói quen nghề | Danh sách thói quen cụ thể viết cùng walkthrough seed |

---

## Khối 4 · 22 NPC tarot và nhiệm vụ phụ

### Đề xuất

| Phần | Đề xuất |
|---|---|
| **Mức thân** | **Gặp** (đã xuất hiện trong màn) → **Thân** (mở khoá vĩnh viễn: rủ đi chơi, nhiệm vụ phụ đầu) → **Gắn bó** (nhiệm vụ phụ thứ hai, năng lực 1) → **Tri kỷ** (năng lực 2, cảnh kết của người đó) |
| **Tăng tình thân** | Cùng làm trong màn; nhiệm vụ phụ; cà phê, quà đúng gu, quà sinh nhật; lá "Duyên". **Cốt truyện riêng mở theo ngưỡng thân; quà chỉ làm nhanh hơn** (đã chốt) |
| **Bộ bài công ty** | Mỗi cấp bốc NPC từ bộ bài gồm các lá đã mở. Mở thêm lá bằng một trong ba đường: **danh thiếp** (xu, chọn lá); **ô người mới** (mỗi cấp bốc một lá chưa mở, miễn phí); **cột mốc** (3 lá) |
| **Mở ban đầu** | 6 lá mở sẵn; 13 lá mở bằng danh thiếp hoặc ô người mới; 3 lá theo cột mốc |
| **Vai trong màn** | Mỗi cấp có 2 vai cố định (để nhiệm vụ phụ nối liền), 1–2 vai random từ bộ bài, 1 ô người mới |
| **Năng lực** | Giảm giá một loại món, thêm lượt dự phòng khi người đó cùng màn, giảm hao tổn OT, bán lá bài, đỡ khi bị ép OT quá trần… Không năng lực nào nâng trần, hạ ngưỡng mở cấp hay đổi chấm |
| **Biểu cảm** (thuộc hệ NPC, đã chốt) | Mỗi câu thoại trả về `{speaker_id, text, expression}`, bộ khoảng 8 biểu cảm có asset; biểu cảm theo tính cách và nội dung truyện, không theo đúng sai của rubric |

### Chi tiết: bảng 22 lá (gợi ý vai, để nhóm viết nhân vật duyệt)

NPC là người trong đời người chơi, không gắn một nghề; vai trong màn (sếp, đồng nghiệp, khách) do công ty random gán, nên dùng được cho cả 221 nghề.

| Lá | Vai gợi ý | Mở | Năng lực khi Gắn bó · Tri kỷ |
|---|---|---|---|
| 0 Chàng Khờ | Bạn cùng đợt vào nghề, đi theo người chơi qua các nghề | Sẵn | +1 lượt dự phòng khi cùng màn · đi cùng khi nhảy nghề |
| I Nhà Ảo Thuật | Đồng nghiệp rành công cụ | Danh thiếp, người mới | Vật phẩm buff bậc nhẹ −30% · một lần mỗi cấp hỏi nhanh như một gợi ý (luật hint D-86) |
| II Nữ Tư Tế | Người kèm việc | Sẵn | Vật phẩm Tư duy, Thích ứng −30% · bậc vừa của hai nhóm này kéo dài thêm 1 màn |
| III Hoàng Hậu | Cô chủ quán cơm gần chỗ làm | Sẵn | Đồ ăn −30% · phở hồi thêm +5 |
| IV Hoàng Đế | Quản lý trực tiếp | Sẵn | Lời mời OT báo trước sớm hơn · OT lần một chỉ −9 |
| V Giáo Hoàng | Thầy cũ, người hướng nghiệp | Danh thiếp, người mới | Xem lộ trình nghề sâu hơn · gợi ý nghề kèm một câu vì sao |
| VI Tình Nhân | Bạn thân ngoài công việc (không mặc định là người yêu) | Sẵn | Cà phê hồi gấp đôi · cảnh cuối tuần miễn phí mỗi cấp |
| VII Cỗ Xe | Bạn tập thể thao | Danh thiếp, người mới | Gym −30% · hao tổn nền −1 |
| VIII Sức Mạnh | Điều dưỡng, huấn luyện viên | Danh thiếp, người mới | Khám sức khoẻ −50% · đi bơi hồi phục khi Kiệt sức |
| IX Ẩn Sĩ | Người ít nói, giỏi một việc | Danh thiếp, người mới | Lá "Xem trước" miễn phí mỗi cấp một lần |
| X Bánh Xe Số Phận | Người đọc bài ở quán cà phê | Cột mốc: phí xem bài đầu 5 u, hoàn lại khi Tri kỷ | **Bán bốn lá** · Vận may −30% |
| XI Công Lý | Người làm công đoàn, luật | Danh thiếp, người mới | Giải thích quyền khi làm thêm · đỡ sự kiện ép OT quá trần |
| XII Người Treo Ngược | Người đã đổi nghề | Danh thiếp, người mới | Màn giải thích nhảy nghề kể thêm kinh nghiệm của người đó |
| XIII Cái Chết (khép lại, sang trang) | Người vừa nghỉ việc | Cột mốc: lần đầu nhảy nghề | Cảnh "nhìn lại" khi rời một nghề |
| XIV Tiết Độ | Bạn tập yoga, thiền | Danh thiếp, người mới | Massage −30% · nghỉ một buổi hồi +45 thay vì +35 |
| XV Ác Quỷ | Người rủ "kiếm nhanh" | Danh thiếp, người mới | Mời OT trả cao hơn nhưng sức khoẻ trừ nhiều hơn; luôn từ chối được |
| XVI Toà Tháp | Đồng nghiệp hay gặp sự cố | Danh thiếp, người mới | Nhiệm vụ phụ "xử lý khủng hoảng" |
| XVII Ngôi Sao | Người truyền cảm hứng trong ngành, mê nhạc | Danh thiếp, người mới | Decor −30% · cảnh concert; cảnh động viên đọc thẻ mục tiêu (D-109) |
| XVIII Mặt Trăng | Người làm ca đêm | Danh thiếp, người mới | Hao tổn ca đêm −2 |
| XIX Mặt Trời | Em trong nhà | Sẵn | Về quê hồi thêm, cảnh báo hiếu |
| XX Phán Xét | Người làm tuyển dụng | Danh thiếp, người mới | Thi thử phỏng vấn trước khi vào cấp mới (màn luyện, không tính điểm) |
| XXI Thế Giới | Người đã đi hết một con đường nghề | Cột mốc: xong cấp cuối một nghề | Cảnh kết; danh hiệu trang trí |

### Chi tiết: nhiệm vụ phụ

Nhiệm vụ phụ (D-119) là cảnh ngắn **ngoài công việc chính** với một NPC: đi cà phê, ăn trưa, chạy bộ, xem phim, karaoke, concert, về nhà ăn cơm, đi chơi cuối tuần.
- **Cho gì:** tình thân, hồi sức khoẻ (+6), một cảnh đặc biệt, và một lượng **thưởng cố định** cộng vào điểm, lấy từ quỹ tối đa 10% của cấp (mô phỏng: 2,5% quỹ của một nhóm mỗi nhiệm vụ phụ). Nhiệm vụ phụ **không chấm**: chơi thế nào cũng nhận đủ thưởng khi xong (đã chốt 4/11).
- **Tốn gì:** một suất của khoảng nghỉ, và xu khi ngoài đời cũng tốn (vé, bữa ăn).
- **Dịp trong lịch:** một số nhiệm vụ phụ chỉ có trong khoảng nghỉ đi qua dịp đó, năm sau lặp lại (khối 5).

| Điều kiện mở | Ví dụ |
|---|---|
| NPC ở mức Thân | Cà phê với Nữ Tư Tế |
| NPC ở mức Gắn bó | Chuyến đi cuối tuần |
| Có vé | Phim suất khuya, karaoke, concert, lớp nấu ăn |
| Có cột mốc | Xe máy cho chuyến phượt 30/4; phòng riêng cho "rủ bạn về ăn lẩu" |
| Trạng thái sức khoẻ | Kiệt sức thì Sức Mạnh rủ đi bơi |
| Dịp | Chợ hoa Tết, sinh nhật NPC |

**Đã rõ (N5):** mọi cảnh đời sống, kể cả nhiệm vụ phụ, đều không chấm. Nhiệm vụ phụ chỉ để mở một cảnh đặc biệt; xong thì mặc định được cộng thưởng của màn nhiệm vụ phụ đó. Như vậy luật "cảnh đời sống không chấm soft skill" và quỹ 10% của D-119 không còn mâu thuẫn: quỹ 10% là trần của tổng thưởng cố định, không phải quỹ để chấm.

**Gợi ý cho walkthrough seed:** mức thưởng cố định có thể chia đều cho số nhiệm vụ phụ của cấp, hoặc ghi sẵn trong seed nhiệm vụ phụ (ví dụ +2,5% quỹ của nhóm mà nhiệm vụ phụ đó gắn với). Mô phỏng dùng cách thứ hai.

### Mượn từ game

| # | Mẫu | Game và mức kiểm chứng | Mượn gì | Tránh gì |
|---|---|---|---|---|
| 15 | Confidant theo lá tarot | Persona 5: mỗi confidant một lá Major Arcana, rank lên thì mở năng lực | Bốn mức thân, năng lực theo mức | Mười rank mỗi người là quá dài với màn 10–15 phút |
| 16 | Tiền mở cửa, thời gian làm thân | Persona 5: Holy Stone mở quan hệ với Chihaya; rank lên bằng thời gian. Hades: tặng Nectar một lần mở keepsake ([wiki người hâm mộ, trích đoạn](https://hades.fandom.com/wiki/Wretched_Broker)) | Danh thiếp mở lá; thân lên bằng chơi | |
| 17 | Trà, quà, đồ thất lạc | Fire Emblem: Three Houses: trà tốn một ô thời gian và 500–2.000 vàng, support +1 tới +6 tuỳ cuộc trò chuyện ([samurai-gamers, hướng dẫn](https://samurai-gamers.com/fire-emblem-three-houses/tea-party/)) | Cà phê, quà đúng gu | |

### Chỗ căng

| Chỗ căng | Cách xử lý |
|---|---|
| **Người lương thấp mở NPC chậm hơn** | Danh thiếp và quà tính theo u, nên mọi nghề trả cùng số màn; ô người mới miễn phí mỗi cấp; 6 lá mở sẵn |
| **Lá Tình Nhân gợi ý tình yêu và giới tính** | Mặc định là bạn thân; mốc người yêu và cưới là cột mốc tuỳ chọn, không giới hạn giới tính (khối 5) |
| **Lá Cái Chết và Ác Quỷ nghe nặng** | Hiện nghĩa tarot bên cạnh tên; Ác Quỷ là cám dỗ OT, luôn từ chối được |
| **Ai viết 22 nhân vật** | Bảng trên chỉ là gợi ý vai và năng lực để nối với kinh tế; tên, tính cách, giọng, danh sách thích và ghét do nhóm viết nhân vật chốt |

### Cần chốt

| # | Việc | Đề xuất |
|---|---|---|
| N1 | 6 lá mở sẵn | Chàng Khờ, Nữ Tư Tế, Hoàng Hậu, Hoàng Đế, Tình Nhân, Mặt Trời **(đã chốt 4/11)** |
| N2 | Số mức thân | Bốn mức |
| N3 | Danh thiếp và ô người mới là hai đường mở lá; giá danh thiếp | Hai đường **(đã chốt 4/11)**; giá 1 u, lá hiếm 3 u |
| N4 | Vai cố định mỗi cấp | Hoàng Đế (quản lý) từ cấp hai; Nữ Tư Tế (người kèm) ba cấp đầu; cấp quản lý thêm Giáo Hoàng |
| N5 | Nhiệm vụ phụ có chấm soft skill không | Không; chỉ mở cảnh đặc biệt, xong thì cộng thưởng cố định trong quỹ 10% **(đã chốt 4/11)** |

---

## Khối 5 · Cột mốc, lịch và sự kiện cuộc sống

### Đề xuất

**Luật (đã chốt):**
- Mọi mốc là tuỳ chọn.
- Không có điểm "cuộc sống", không % hoàn thành, không dòng thời gian "chậm hơn bạn bè".
- Nhánh thay thế thưởng ngang nhau.
- Mốc nhà giàu không mạnh hơn mốc ai cũng làm được.
- NPC không đối xử khác người cưới và người độc thân.

Mỗi mốc mở một **cảnh độc quyền ngoài công việc** (không chấm) và một **buff vĩnh viễn nhỏ**.

**Đề xuất thêm hai luật:**
- Buff soft skill của cột mốc là **+5% cho đúng một nhóm**; các mốc cùng nhóm không cộng dồn. Cả bảy nhóm đều có một đường rẻ, nên người lương thấp vẫn đủ bảy.
- Giá theo **X** của band lúc mua, **trả một lần**. Không có chi cố định (đã chốt 4/11): không tiền phòng, không trả góp, không tiền nuôi thú hằng kỳ.

### Chi tiết: 17 cột mốc

| Mảng | Mốc (đã chốt) | Điều kiện | Cảnh | Buff vĩnh viễn | Giá đề xuất |
|---|---|---|---|---|---|
| Nhà ở | Thuê phòng riêng | Từ junior (cấp 2) | Đêm đầu ở một mình | +5% Tự quản lý | 3 X |
| Nhà ở | Mua căn hộ, có lựa chọn bố mẹ góp | Phòng riêng, từ cấp 4 | Tân gia, rủ bạn về ăn lẩu | +5 sức khoẻ mỗi khoảng nghỉ | 8 X (bố mẹ góp: 4 X) |
| Đi lại | Xe máy | | Đêm mưa chở đồng nghiệp | Chi tiêu đi lại hằng ngày −20%: đồ ăn, vé nhiệm vụ phụ, gym, khám | 4 X |
| Đi lại | Ô tô | Xe máy + bằng lái | Đi phượt cùng đồng nghiệp | +1 suất mỗi khoảng nghỉ (đề xuất giới hạn: chỉ cho chuyến đi xa) | 20 X, bằng 1,5 X |
| Gia đình | Báo hiếu: lần đầu gửi lương về nhà; sau đó gọi video và quà quê là cảnh lặp lại | Từ cấp 2 | Gọi video, quê gửi quà | +5% Đạo đức và chuyên nghiệp; không phạt nếu không gửi | 1 X một lần (bỏ mức hằng tháng vì không còn chi cố định) |
| Gia đình | Về quê ăn Tết (mỗi năm; có thể chọn du lịch mùng 1–2 thay thế) | Dịp Tết | Cả họ hỏi lương, người yêu; hài hước, không bẽ mặt | Hồi đầy sức khoẻ đầu năm | Vé 0,3 X |
| Gia đình | Đưa bố mẹ đi chơi, sửa nhà cho bố mẹ | | Chỉ có cảnh | Không | 3 X, 8 X |
| Tình cảm | Người yêu → cưới (tuỳ chọn, từ khoảng L3, không giới hạn giới tính) | NPC thân tới dự | Đám cưới | +5% Trí tuệ cảm xúc | 4 X |
| Tình cảm | Nuôi thú cưng (nhánh thay thế, buff ngang cưới) | Phòng riêng | Mèo đón cửa | +5% Trí tuệ cảm xúc | 2 X |
| Bạn bè | Họp mặt hội bạn hằng năm | Thân ≥ 2 NPC | Lẩu ở nhà | Tình thân tăng nhanh ×1,25 | 0,5 X mỗi năm |
| Cho đi | Mentor ở trường cũ / chạy bộ gây quỹ | Từ cấp giữa | Buổi chia sẻ | +5% Lãnh đạo và tư duy kinh doanh | 2 suất, không tốn xu |
| Học thêm | Chứng chỉ ngoại ngữ | | Ngày nhận kết quả | +5% Giao tiếp và hợp tác | 4 X; **nhánh rẻ:** tham gia CLB trong công ty, 3 suất, không tốn xu |
| Học thêm | Cao học = khoá tối = tự làm portfolio (ngang nhau) | | Ngày bảo vệ, ngày ra mắt | +5% Tư duy và giải quyết vấn đề | 8 X = 3 X = 3 suất |
| Trải nghiệm | Chuyến nước ngoài đầu tiên | | Sân bay | +5% Thích ứng và học hỏi | 6 X; **nhánh rẻ:** company trip, 1 X |
| Sức khoẻ | Xong giải 10K đầu tiên | 3 suất tập | Vạch đích | Trần sức khoẻ 110 | 0,3 X |
| Tài chính | Quỹ dự phòng 6 tháng | | Mở sổ | OT hao sức khoẻ ít hơn 20% | Khoá 6 X (rút ra thì mất buff) |
| Tài chính | Sổ tiết kiệm đầu tiên | Quỹ dự phòng | | Thu nhập +3% | Khoá 6 X |

Hai nhánh rẻ giữ luật "mốc nhà giàu không mạnh hơn": không có chúng, buff Giao tiếp và Thích ứng chỉ có ở mức 4 X và 6 X. Phúc chốt (4/11) dùng hoạt động trong công ty như **CLB của công ty** và **company trip**; không nhất thiết là hai hoạt động này, miễn mỗi nhóm có một đường rẻ hoặc chỉ tốn suất.

**Số liệu nền** (do session walkthrough seed ghi; nguồn là TCTK và VnExpress, link chưa kèm nên coi là thứ cấp):
- Tuổi kết hôn lần đầu 27,3 (năm 2024).
- 89,4% hộ dùng xe máy, 9% dùng ô tô (2024).
- Người mua nhà ở tuổi 25–35 chiếm trên 40%, nhiều người được bố mẹ góp.
- Giá căn hộ Hà Nội tăng 11,7%/năm, trong khi thu nhập tăng 6,4%/năm.

Chưa có nguồn cho tỉ lệ gửi tiền về nhà, tỉ lệ thuê hay mua nhà ở Hà Nội và TP.HCM, tuổi học IELTS hay cao học: các số đó là giả định của nhóm.

### Chi tiết: lịch trong năm (đã chốt)

Lịch đi qua một dịp thì hub hiện lời mời nhiệm vụ phụ độc quyền, chỉ có trong khoảng nghỉ đó, năm sau lặp lại. **Lỡ dịp chỉ là không có cảnh đó, không mất gì.** Thư báo trước mùa cao điểm của nghề lấy từ `peak_season` của dữ liệu môi trường làm việc.

| Dịp | Lời mời |
|---|---|
| Tết | Về quê, chợ hoa, thưởng Tết |
| 30/4–1/5 | Phượt (cần xe) |
| 8/3, 20/10 | Quà cho đồng nghiệp |
| Trung thu | Đèn lồng (decor) |
| Mùa cưới cuối năm | Đám cưới của NPC thân |
| Giáng sinh, tất niên | Tiệc công ty |
| Sinh nhật NPC thân | Quà sinh nhật |
| Ngày lương, lương tháng 13 | Cửa hàng giảm giá |
| Mùa cao điểm của nghề | Thư báo trước: OT nhiều hơn (theo `overtime_level` và `peak_season`) |

### Chỗ căng

| Chỗ căng | Cách xử lý |
|---|---|
| **Căn hộ: nghề lương thấp không mua được trong nghề đầu** | Đúng với thực tế giá nhà tăng nhanh hơn thu nhập (số liệu nền ở trên). Có nhánh bố mẹ góp một nửa; xu mang sang nghề sau; căn hộ chỉ cho +5 sức khoẻ mỗi khoảng nghỉ, không cho buff soft skill |
| **Hôn nhân thành món hàng** | Cưới là cột mốc tuỳ chọn có cảnh, buff ngang nuôi thú cưng; NPC không đối xử khác; không mốc nào yêu cầu cưới |
| **Tết hỏi lương, người yêu** | Hài hước, không bẽ mặt (đã chốt); có lựa chọn du lịch thay thế |

### Cần chốt

| # | Việc | Đề xuất |
|---|---|---|
| L1 | Giá cột mốc | Bảng trên, trả một lần |
| L2 | Nhánh rẻ cho Giao tiếp và Thích ứng | CLB trong công ty, company trip **(đã chốt 4/11)** |
| L3 | Buff soft skill của cột mốc | +5% một nhóm, không cộng dồn trong cùng nhóm |

---

## Khối 6 · Cân bằng: mô phỏng qua cả một nghề

### Cách chạy

`mo_phong_can_bang.py` cho người chơi đi hết một nghề, từ cấp đầu tới cấp cuối, với các mặc định sau:

| Thành phần | Mặc định trong mô phỏng |
|---|---|
| **Số màn mỗi cấp** | Theo keyword đầu ra (D-119), phần lớn là 4–5 |
| **Quỹ điểm** | Theo `point_budgets.json` (D-114), chia đều cho các màn |
| **Mở cấp** | Cần ≥ 60% quỹ ở mọi nhóm; không đủ thì chơi lại màn kém nhất, tối đa 8 lần, quá thì tính là **kẹt** |
| **Môi trường công ty** | Random theo trọng số của `occupation_work_environments.csv` |
| **Chất lượng mỗi nhóm mỗi màn** | Ngẫu nhiên quanh mức của người chơi |
| **Số lượt cần** | 8 hoạt động × (1 + độ chậm) |
| **Mọi luật** | Như khối 1–5 |

Biến thể chạy, 300 lượt mỗi tổ hợp:
- **4 nghề:** trồng trọt, phục vụ nhà hàng, điều dưỡng, Back-end.
- **3 mức chơi:** yếu (đạt 55%, chậm 35%), trung bình (70%, 20%), giỏi (85%, 5%).
- **4 kiểu người chơi:**
  - **cày OT:** nhận mọi lời mời OT, mua buff mạnh mỗi màn;
  - **cân bằng:** OT khi thiếu lượt và còn khoẻ, buff vừa khi một nhóm dưới 70%, mua cột mốc rẻ trước;
  - **tiết kiệm:** ít buff, ưu tiên nhà, xe, quỹ;
  - **tiêu hết:** buff mạnh mỗi màn, phần dư vào decor, không cột mốc.

Bảng đầy đủ: `ket_qua_mo_phong.md`.

### Kết quả: người chơi trung bình

| Nghề | Kiểu | % quỹ | Xu kiếm | Chi buff | Chi sức khoẻ | Chi cột mốc | Buff vĩnh viễn (trên 7) | Phòng riêng | Xe máy | Căn hộ |
|---|---|---|---|---|---|---|---|---|---|---|
| Trồng trọt | cày OT | 77% | 1.883 | 1.383 | 51 | 0 | 0 | | | |
| Trồng trọt | cân bằng | 76% | 1.883 | 111 | 9 | 1.102 | 7,0 | cấp 2 | cấp 4 | |
| Trồng trọt | tiết kiệm | 75% | 1.883 | 4 | 0 | 1.322 | 2,0 | cấp 2 | cấp 5 | |
| Nhà hàng | cày OT | 76% | 2.516 | 1.228 | 674 | 0 | 0 | | | |
| Nhà hàng | cân bằng | 76% | 2.516 | 125 | 8 | 1.643 | 7,0 | cấp 2 | cấp 4 | |
| Nhà hàng | tiết kiệm | 75% | 2.516 | 6 | 0 | 1.291 | 2,0 | cấp 2 | cấp 5 | |
| Điều dưỡng | cày OT | 76% | 3.096 | 1.552 | 730 | 0 | 0 | | | |
| Điều dưỡng | cân bằng | 77% | 3.096 | 152 | 16 | 1.780 | 7,0 | cấp 2 | cấp 4 | |
| Điều dưỡng | tiết kiệm | 75% | 3.096 | 7 | 0 | 2.271 | 3,0 | cấp 2 | cấp 4 | cấp 7 |
| Back-end | cày OT | 77% | 5.111 | 3.584 | 109 | 0 | 0 | | | |
| Back-end | cân bằng | 77% | 5.111 | 210 | 37 | 2.567 | 7,0 | cấp 2 | cấp 3 | cấp 6 |
| Back-end | tiết kiệm | 76% | 5.156 | 10 | 0 | 3.141 | 7,0 | cấp 2 | cấp 1 | cấp 4 |

- **Tiêu hết** giống cày OT về điểm (76–77%) và dồn phần dư vào decor.
- **Xu còn cuối nghề:** khoảng 100–750 ở ba nghề đầu. Back-end chơi cân bằng hoặc tiết kiệm còn khoảng 1.000–1.300 (6–8 màn, tính theo xu trung bình một màn của nghề); người giỏi chơi cân bằng còn khoảng 1.600 (10 màn). Phần này để mua decor hoặc mang sang nghề sau.
- **Căn hộ** trả một lần nên giá phải hạ từ "cọc 7 X + trả góp" xuống **8 X**. Đã thử 10 X và 12 X: Điều dưỡng tiết kiệm gần như không mua được trong nghề đầu (0–7% lượt chơi).

### Kết quả: người chơi yếu và tỉ lệ kẹt

| Kiểu | Trồng trọt | Nhà hàng | Điều dưỡng | Back-end | Màn Mệt (nhà hàng, điều dưỡng) |
|---|---|---|---|---|---|
| cày OT | 6% | 26% | 33% | 3% | 37–39% |
| cân bằng | 2% | 1% | 1% | 1% | 0% |
| tiết kiệm | 10% | 7% | 7% | 8% | 0% |
| tiêu hết | 2% | 1% | 2% | 2% | 0% |
| *cân bằng, nếu món tiến độ tính theo X* | *4%* | *1%* | *1%* | *1%* | |

Người chơi yếu đạt 56–59% quỹ gốc, sát hoặc dưới ngưỡng 60%. Họ cần buff, nhiệm vụ phụ và chơi lại: trung bình 7–14 lần chơi lại cho cả nghề, khoảng 1–2 lần mỗi cấp. Người chơi trung bình và giỏi không kẹt, không phải chơi lại.

So với lượt chạy trước, tỉ lệ kẹt giảm ở mọi kiểu vì nhiệm vụ phụ giờ cho thưởng cố định. Trước đây thưởng nhân theo mức chơi, nên người yếu nhận ít hơn.

### Đọc kết quả

1. **Không kiểu nào áp đảo.** Cùng mức chơi, bốn kiểu chênh nhau không quá 2 điểm % quỹ. Buff và nhiệm vụ phụ thêm khoảng 6 điểm % so với điểm gốc ở mọi mức: yếu 56–59 → 62–63%, trung bình 70 → 75–77%, giỏi 85 → 89–91%.
2. **Cày OT là kiểu tệ nhất.**
   - Ở nghề hao tổn cao (nhà hàng, điều dưỡng), người yếu cày OT bị Mệt ở 37–39% số màn, mất lượt và kẹt ở 26–33% lượt chơi.
   - Người trung bình cày OT không thêm điểm nào so với người cân bằng. Ở nhà hàng và điều dưỡng, họ còn tốn khoảng một phần tư thu nhập (674–730 xu) cho hồi phục.
   - Ở nghề hao tổn thấp (Back-end), cày OT ít hại hơn.

   Đây là bài học trung thực mà không cần lên lớp: OT không lương ở nghề nặng thì lỗ.
3. **Dùng OT vừa phải là tốt nhất cho người chậm.** Người yếu chơi cân bằng nhận trung bình 0,10–0,17 lần OT mỗi màn và có tỉ lệ kẹt thấp nhất (1–2%). Như vậy OT là lựa chọn thật, không phải bẫy.
4. **Tiền không đổi được khả năng qua cấp.**
   - Khi món tiến độ tính theo u, người cân bằng kẹt 1–2% ở cả bốn nghề, dù xu cả nghề chênh 2,7 lần (1.883 so với 5.111).
   - Người tiết kiệm (ít buff) cũng kẹt ngang nhau giữa các nghề (7–10%).
   - Tính theo X thì nghề lương thấp nhất kẹt gấp bốn (4% so với 1%). Khoảng cách này nhỏ hơn lượt trước, nhưng thước u vẫn công bằng hơn.
5. **Lương hiện ở mức sống.**
   - Phòng riêng: người chơi trung bình và giỏi mua ở cấp 2 ở mọi nghề; người yếu ở cấp 3–4, vì tiêu xu vào buff trước.
   - Xe máy: cấp 4–5 ở nghề lương thấp và trung vị, cấp 1–3 ở Back-end.
   - Căn hộ: Back-end mua ở cấp 4–6, Điều dưỡng tiết kiệm ở cấp 7, nghề lương thấp chưa mua được trong nghề đầu.
   - Buff vĩnh viễn: người chơi trung bình chơi cân bằng có đủ 7 trên 7 ở mọi nghề, nhờ các nhánh rẻ (portfolio, mentor, báo hiếu, CLB công ty, company trip). Người yếu tiêu phần lớn xu vào buff một màn nên chỉ có khoảng 3 (Back-end gần 7).
6. **Sức khoẻ chỉ là giá của OT.** Người không cày OT gần như không bao giờ Mệt. Chỉ khi hao tổn nền của nghề nặng (9 mỗi màn) cộng với OT thường xuyên thì mới tụt xuống Mệt.

### Mục tiêu cân bằng là gì (B1)

"Mục tiêu cân bằng" là **bộ tiêu chí dùng để biết một bộ số (giá, mức buff, lượng sức khoẻ) là ổn hay phải chỉnh**. Khi đổi một con số, chạy lại mô phỏng hoặc chơi thử rồi soát từng dòng dưới đây; dòng nào trượt thì chỉnh số. Nói gọn, đây là "đề bài" cho cân bằng, không phải một cơ chế trong game.

| # | Mục tiêu | Vì sao | Cách đo | Hiện tại |
|---|---|---|---|---|
| 1 | Không kiểu chơi nào áp đảo | Mọi lối chơi đều là lựa chọn thật | Cùng mức chơi, % quỹ giữa bốn kiểu chênh ≤ 3 điểm | ≤ 2 điểm · đạt |
| 2 | Nghề lương thấp không khó qua cấp hơn | D-17: mở cấp theo năng lực, không theo tiền | Người cân bằng kẹt ≤ 5% ở mọi nghề, chênh giữa nghề ≤ 3 điểm | 1–2% · đạt |
| 3 | Cày OT không phải cách tốt nhất | Không dạy người chơi rằng làm quá sức là đúng | % quỹ của cày OT không cao hơn cân bằng | Ngang điểm, tốn hơn · đạt |
| 4 | Mốc lớn mở ở cấp hợp lý | Lương thật hiện ở mức sống | Phòng riêng cấp 2; xe máy cấp 3–5; căn hộ cấp 4–7 ở nghề lương trung vị trở lên (người chơi trung bình) | Phòng riêng và căn hộ đúng. Xe máy đúng ở ba nghề; Back-end mua sớm hơn (cấp 1–3), đúng tinh thần "lương cao thì mức sống cao" · đạt |
| 5 | Kinh tế căng | Xu phải có nơi tiêu, không dồn đống | Cuối nghề không ai dư quá khoảng 10 màn lương (xu trung bình một màn của nghề đó) | Tối đa khoảng 10 màn (Back-end giỏi, cân bằng) · sát ngưỡng, đạt |

Phúc đã đồng ý năm dòng này (4/11). Từ nay mọi lần chỉnh số đều soát theo bảng này.

### Giới hạn của mô phỏng

- **Mở cấp:** dùng ngưỡng liên tục 60%, khắt khe hơn D-114 thật (mở theo bậc rời rạc). Vì vậy tỉ lệ kẹt là mức trên.
- **Chưa mô phỏng:** ô tô, cưới, giải 10K, thói quen nghề, lá bài, sự kiện ép quá trần, nghỉ bù (+10), phần hồi +15 của khám sức khoẻ (mô phỏng chỉ gỡ hồi chậm), nghỉ một buổi khi Kiệt sức (+35; mô phỏng không ai tụt tới Kiệt sức).
- **Đơn giản hoá:**
  - Mỗi người chơi có một cung (Song Tử).
  - Quỹ chia đều cho các màn.
  - Thưởng Tết gộp 0,5 u mỗi năm.
  - Nhiệm vụ phụ cho thưởng cố định 2,5% quỹ của nhóm đang nghẽn, không phụ thuộc mức chơi.
  - Báo hiếu, CLB công ty, company trip là mốc mua một lần hoặc tốn suất.
- **Kiểu người chơi:** là luật cố định, không phải người thật. Cần chơi thử để biết người thật chơi thế nào.

### Cần chốt

| # | Việc | Đề xuất |
|---|---|---|
| B1 | Mục tiêu cân bằng | Năm dòng ở bảng "Mục tiêu cân bằng là gì" **(đã chốt 4/11)** |
| B2 | Chơi thử | Dựng bảng tính hoặc bản chơi thử 2 nghề × 3 cấp trước khi làm cửa hàng đầy đủ |

---

## Khối 7 · Quyết định cũ đề xuất sửa

| ID | Đang ghi | Đề xuất sửa | Lý do |
|---|---|---|---|
| **D-110** | Không danh hiệu, cấp tài khoản, XP, chuỗi ngày, **máu**. Tiền tệ để sau, **nếu làm chỉ mua đồ trang trí** | Giữ: không danh hiệu, cấp tài khoản, XP, chuỗi ngày, **không có thanh làm thua**. Thêm: **sức khoẻ** 0–100 chỉ đổi lượt và lời dẫn. Tiền tệ là **xu** kiếm bằng việc chơi, mua sáu nhóm món của cửa hàng | Phúc đã chốt cửa hàng 6 nhóm; "chỉ trang trí" thì lương không có tác động nào |
| **D-114** | Điểm chỉ đến từ việc chơi, **ngoại lệ duy nhất là buff chòm sao** | Thêm ngoại lệ: **vật phẩm buff và buff vĩnh viễn của cột mốc**. Một ô mỗi màn; trần chung +50%; không vượt trần màn; ngưỡng mở cấp giữ | Buff là chiến lược (Phúc chọn); mô phỏng: buff thêm khoảng 6 điểm %, không kiểu nào áp đảo |
| **D-111** | "Bạn làm tốt" không tính buff chòm sao | **Không tính mọi buff**: dùng điểm gốc | Gợi ý nghề là phép đo |
| **D-105** | Điểm mạnh và điểm cần luyện suy từ biến động điểm | Tính trên **điểm gốc** | Như trên |
| **D-113** | Buff chòm sao +12%, nhân sau cùng | Chòm sao nằm trong **trần chung +50%** và **không vượt trần màn**; thứ tự: judge chấm → cộng mọi buff → cắt ở trần | Một luật cho mọi buff; người chơi hoàn hảo không vượt quỹ |
| **D-119** | Nhiệm vụ phụ thiết kế sau, quỹ tối đa 10% | Nhiệm vụ phụ **mở qua NPC** (Thân trở lên), một số cần vé, cột mốc hay dịp; nhiệm vụ phụ **không chấm**, xong thì cộng thưởng cố định, tổng không quá quỹ 10%; chơi lại màn được 100/50/25% xu | Nối nhiệm vụ phụ với NPC, cửa hàng, lịch |
| D-17 | Giữ miễn phí; mở cấp theo năng lực, không theo tiền | **Giữ**, thêm: không bán xu, không quy đổi xu ra tiền hay quà thật; **món tiến độ tính giá theo xu của nghề đang chơi** | Mô phỏng: tính theo band thì nghề lương cao kẹt ít hơn |
| D-86 | Công cụ khám phá, không phải bài thi | **Giữ**; sức khoẻ không hạ điểm, lựa chọn OT không chấm, email "luật hôm nay" không trừ xu | |
| D-27 | Đánh giá nghề theo lương, áp lực, độ khó, cân bằng, yêu thích | **Giữ**; màn đánh giá nhắc lại lương tham khảo, số giờ OT đã làm và cột mốc đã có ở nghề đó | Người chơi chấm "lương" và "cân bằng" dựa trên trải nghiệm trong game |

---

## Khối 8 · Móc cho seed màn

Phần nối với walkthrough thiết kế seed. Tên trường theo kiểu của `occupation-data/scenarios/*/*.json` (`context`, `cast`, `activities`, `random_events`). Đây là gợi ý; walkthrough seed chốt tên cuối.

| # | Móc | Trường gợi ý | Seed cần ghi gì | Ai tính |
|---|---|---|---|---|
| 1 | **Hao tổn sức khoẻ của màn** | `context.health_cost` | 2–9, mặc định tính từ `work_environment_id`; seed được ghi đè kèm lý do | Code, hiện trước màn |
| 2 | **Đồng hồ có dự phòng** | `context.clock` = `{turn_budget, buffer_turns: 2, minutes_per_turn, deadline}` | Số lượt cần để làm hết canon event, cộng 2 lượt dự phòng. Sức khoẻ cộng trừ vào dự phòng | Seed |
| 3 | **Điểm mời OT** | `ot_offers[]` = `{after_activity, by_npc_role, story_hours, kind: deadline\|company}` | Lời mời "ở lại làm nốt" khi hết giờ là mặc định; lời mời của công ty đặt ở màn cao điểm; mỗi lần 2 giờ, tối đa 2 lần | Seed đặt chỗ; code tính lượt, sức khoẻ, xu |
| 4 | **Mục chưa kịp làm** | `activities[].if_unreached` | Hoạt động không tới được vì hết lượt thì không bị trừ; phần quỹ lấy khi chơi lại. Seed ghi đoạn khép khi màn dừng sớm | Seed viết đoạn khép; walkthrough seed chốt cách tính điểm |
| 5 | **Vai NPC** | `cast[].slot: fixed\|random\|newcomer`, `cast[].arcana` | 2 vai cố định (lá cụ thể), 1–2 vai random (chỉ ghi vai trong màn), 1 ô người mới. Vai random phải viết được cho bất kỳ lá nào trong bộ bài | Seed ghi vai; code điền lá |
| 6 | **Móc nhiệm vụ phụ** | `sidequest_hooks[]` = `{npc_arcana, min_bond, requires_item, requires_state, occasion}` | Chỗ trong màn nhắc tới nhiệm vụ phụ (*"Tối thứ Sáu đi karaoke không?"*) và điều kiện mở | Seed |
| 7 | **Trạng thái cho lời dẫn** | Đầu vào của AI dẫn truyện: `health_tier`, `active_buff`, `ot_taken`, `habits[]` | AI đổi giọng theo sức khoẻ và thói quen nghề; **judge không nhận các trường này** | Code |
| 8 | **Lương của màn** | `context.pay` = `{salary_ref_vnd, source, xu}` | Lấy từ hồ sơ nghề và `luong_quy_xu.csv`; seed không tự viết số | Code |
| 9 | **Luật hôm nay** (đã chốt) | `context.house_rules[]` | 1–2 quy trình riêng của công ty, nói ở slide onboard hoặc lời dặn; email cuối màn chỉ mang thông tin, **không trừ xu** | Seed |
| 10 | **Dữ kiện cho mini note** (đã chốt) | `facts[].id` trong fact sheet | Dữ kiện mở ra thì tự vào note mục "đã biết / chưa rõ"; chỉ ghi dữ kiện, không ghi suy luận | Seed ghi mã; code ghi note |
| 11 | **Dịp trong lịch** | `context.calendar` = `{date, occasion, peak_season}` | Màn rơi vào mùa cao điểm thì tần suất OT tăng; dịp cho lời mời ở khoảng nghỉ sau | Seed |
| 12 | **Ép OT quá trần** | `random_events[]` có `condition: ot_count >= 2 and company_push` | Lời đề nghị lần ba, ba lựa chọn (từ chối hợp pháp · nhận · gọi Công Lý) | Seed viết lời; code kiểm |
| 13 | **Tổng kết cuối màn** | `debrief` | Giờ làm, giờ OT và có trả không, sức khoẻ trước và sau, xu; dòng bằng chứng WHO/ILO theo luật ở khối 3 | Code |

**Không seed nào được:**
- đặt sức khoẻ làm điều kiện cho canon event;
- cho judge chấm lựa chọn OT;
- trừ sức khoẻ bằng sự kiện ngẫu nhiên;
- trừ xu vì sai "luật hôm nay";
- viết số lương vào lời dẫn khác với số trong hồ sơ nghề.

---

## Chung

### Những chỗ chưa có bằng chứng

- **Nén lương bằng căn bậc hai** là lựa chọn thiết kế, không có nguồn nào nêu luật nén; chỉ có lời khuyên chung là nén và đặt giá theo số màn ([Cook 2021](https://lostgarden.com/2021/12/12/value-chains/)).
- **Giá, mức buff, lượng sức khoẻ** đã qua mô phỏng nhưng chưa qua người chơi thật.
- **Xem trước công việc bằng game** chưa có nghiên cứu với kết quả nghề nghiệp; chỉ dựa vào lý thuyết xem trước công việc nói chung.
- **Không tìm thấy nghiên cứu Việt Nam** về việc người trẻ đoán sai lương; nghiên cứu ở Cộng hoà Dominica cho thấy thông tin về thu nhập đổi được quyết định đi học ([Jensen 2010 qua J-PAL, tóm tắt](https://www.povertyactionlab.org/fr/node/1727)).

### Thứ tự làm đề xuất

1. **Bản đầu:**
   - Xu theo cấp, lương tham khảo, chơi lại giảm xu.
   - Sức khoẻ bốn mức; OT "ở lại làm nốt" và OT theo công ty; tổng kết cuối màn.
   - Vật phẩm buff 7 × 3 và buff sức khoẻ; hai sổ điểm.
   - Móc 1–4, 7, 8, 13.
2. **Bản hai:**
   - 6 NPC mở sẵn, bốn mức thân, danh thiếp, quà.
   - Vé nhiệm vụ phụ; lịch và dịp; decor.
   - Móc 5, 6, 9–11.
3. **Sau:**
   - 16 NPC còn lại, lá bài.
   - 17 cột mốc, thói quen nghề, sự kiện ép quá trần (móc 12).

### Đã chốt (4/11/2026)

1. **Buff soft skill** (C1, C2, C3): vật phẩm +10 / +20 / +30%, Vận may +50%, cột mốc +5%; trần chung +50%, áp cả chòm sao.
2. **Sức khoẻ làm mất lượt** (S1, S2): −1 và −2 lượt; OT +2/−12 rồi +1/−18.
3. **Cách nén lương** (K2, K6): căn bậc hai, sàn 60, trần 250; hai thước giá u và X.
4. **Lựa chọn OT không chấm** (S4).
5. **Sáu NPC mở sẵn** (N1, N3), thêm danh thiếp và ô người mới.
6. **Sửa quyết định cũ** như khối 7.
7. **Bỏ chi cố định**: mọi cột mốc trả một lần; căn hộ 8 X; báo hiếu là mốc 1 X.
8. **L2**: nhánh rẻ là hoạt động trong công ty (CLB công ty, company trip), không bắt buộc đúng hai hoạt động này.
9. **N5**: nhiệm vụ phụ không chấm, chỉ mở cảnh đặc biệt; xong thì cộng thưởng cố định trong quỹ 10%.
10. **B1**: năm mục tiêu cân bằng ở khối 6.

### Còn mở

- **B2:** có dựng bản chơi thử nhỏ trước khi làm cửa hàng đầy đủ không.
- **Ghi vào `02-quyet-dinh.md`:** các điểm đã chốt ở trên chưa được ghi. Cần Phúc đồng ý trước khi sửa file quyết định.
- **Các mục khác trong bảng "Cần chốt" của từng khối** (K1, K3–K5, C4, C5, S3, S5, S6, N2, N4, L1, L3) vẫn là đề xuất, chưa ai chốt.
