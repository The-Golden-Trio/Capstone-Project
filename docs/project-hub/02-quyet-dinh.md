# 02 · Nhật ký quyết định (Decision log)

> Mỗi dòng là một quyết định **có dấu vết** trong chat, commit hoặc file nộp cô. Những gì chỉ bàn miệng mà không để lại dấu vết thì không có ở đây. Ai nhớ thì bổ sung theo mẫu ở cuối file.
>
> **Trạng thái:** ✅ đang hiệu lực · ♻️ đã bị thay thế · ⚠️ đang mâu thuẫn, cần chốt · 💡 mới là đề xuất

---

## A. Đề tài & định vị

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-01 | Làm **JobQuest: An AI-Native Experiential Career-Exploration Platform**, slogan *"Try the job before you pick the career"* | 3/9 | Kickoff slide 1 | ✅ |
| D-02 | **Không hướng nghiệp, không phán "bạn hợp ngành X".** Cho người dùng trải nghiệm nghề càng thật càng tốt, rồi họ tự cảm nhận mình có hợp không. Định hướng nghề chỉ là module phụ | 7/9 → 18/9 | Deck 7/9 S5: *"Career orientation is a supporting module, not the core"*. Báo cáo §1.3: đánh giá tính cách/sở thích chỉ giữ ở vai trò hỗ trợ | ✅ |
| D-03 | Cốt lõi là **"làm thử nghề"**, không phải trắc nghiệm tự khai. Trắc nghiệm dễ bị thiên lệch, còn làm nhiệm vụ thì lộ ra năng lực thật | 25/7 | 💬 Brian, `_archive/docs/progress/week-2/supplementary_report.md` | ✅ (ý gốc của D-02) |
| D-04 | Đóng góp khoa học = **kết hợp và kiểm định** 3 kỹ thuật: sinh tình huống có ràng buộc, đánh giá năng lực qua hành vi, chấm câu trả lời mở bằng LLM. Có 5 vấn đề nghiên cứu RP-1…RP-5; **RP-1 và RP-2 quyết định đề tài** | 18/9 | Báo cáo §1.2, §4.2.2; deck 18/9 S22 | ♻️ phần "5 RP" thay bởi D-06; hướng đóng góp vẫn giữ |
| D-05 | Ba lớp trình bày: tiến trình kiểu **RPG**, cảnh kiểu **visual novel** phân nhánh, sự kiện kiểu **roguelike** (*"life is more than work"*) | 7/9 | Deck 7/9 S5; báo cáo §4.2.1 | ✅ |
| D-06 | **Chỉ còn 2 vấn đề nghiên cứu.** Mỗi RP phải thoả 3 điều kiện: câu trả lời chưa có trong tài liệu, khái quát được ra ngoài hệ thống này, và đánh giá của đề tài tạo ra bằng chứng trả lời nó. **RP-1** sinh scenario có seed chuyên gia: tỉ lệ scenario chuyên gia đánh giá đúng nghề và đòi hỏi năng lực mục tiêu, **so với sinh không có seed**. **RP-2** độ tin cậy của chấm tự động (stealth assessment): độ khớp với chuyên gia đo bằng **QWK**, so với độ khớp giữa các chuyên gia, theo độ khó và qua nhiều lần chạy. RP-3 cũ → thiết kế (Ch.5), RP-4 → hướng phát triển, RP-5 → phương pháp đánh giá (Ch.7) | 26/9 | Báo cáo 26/9 §4.2.2 (Bảng câu hỏi không phải RP), §1.2; `reports/2026-09-26_ch1-5/block-resolutions.md` B6 | ✅ (thay phần "5 RP" của D-04) |

### Các đề tài đã cân nhắc và bỏ

| Đề tài | Thời gian | Vì sao bỏ |
|---|---|---|
| Sàn chứng khoán có chatbot | 30/6 | Không đi tiếp. Cô yêu cầu chọn trong 5 domain |
| Web luyện IELTS / Tiếng Anh 12 | 5–11/7 | Cô không đồng ý (**suy luận:** thiếu điểm nổi bật) |
| Bách Khoa community (forum, marketplace…) | 15/7 | Chọn hướng nghiệp thay thế |
| **v1: Nền tảng định hướng nghề bằng AI cho HS THPT**, 4 trụ cột: khảo sát, micro-task, bản đồ lộ trình + thị trường, diễn đàn | 15/7 – 7/8 | ♻️ Được thay bằng JobQuest. Tài liệu đã chuyển vào `_archive/docs/` (`init*.md`, `report.md`, `report/main.tex`, `progress/week-2/`) |
| Workspace AI tổng hợp (Notion/ClickUp + AI orchestrator) | 5/8 – 14/8 | Topic thứ hai đem đi gặp cô. **Suy luận:** cô chọn hướng nghề nghiệp. Bản quyết định lưu ở [`archive/`](archive/) |

## B. Phạm vi & đối tượng

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-10 | **Phase 1 chỉ làm mảng IT**, thiết kế không phụ thuộc lĩnh vực. Lý do (theo báo cáo): chỉ có chuyên môn IT để dựng bộ chuẩn đánh giá | 20/8 → 18/9 | 💬 Phúc 20/8; báo cáo §1.3 | ✅ |
| D-11 | Đối tượng: **mọi người**, gồm học sinh chọn ngành, sinh viên mới ra trường và người muốn chuyển nghề | 5/9 → 18/9 | 💬 landing page đổi "school & career center" thành "for everyone"; báo cáo §4.2.1 | ✅ (thay "HS THPT" của v1) |
| D-12 | **Không làm:** theo dõi kết quả nghề dài hạn, môi giới tuyển dụng, tuyên bố mô phỏng thay được đi làm thật | 18/9 | Báo cáo §1.3; deck 18/9 S6 | ✅ |
| D-13 | Bốn nhóm người dùng: **Explorer**, **Domain expert**, **Content admin**, **System admin** | 18/9 | Báo cáo §4.2.1 (deck 7/9 mới có 3 nhóm) | ✅ |
| D-14 | Ý cô (14/8): hướng tới sản phẩm thật như startup. **Benchmark và dữ liệu nghề có thể bỏ**, dữ liệu trường ĐH dùng demo cũng được. Đánh giá thiên về kỹ thuật | 14/8 | 💬 ghi chú Brian gửi 18/8 | ✅ (định hướng của cô) |
| D-15 | **Domain expert chỉ tư vấn cho content admin**, không thao tác trực tiếp trên hệ thống | 23/9 | Phúc, [midweek 23/9](tuan/2026-W39/2026-09-23_hop-nhom.md) | ♻️ thay bởi D-16 (29/9) |
| D-16 | **Phân vai theo cô 26/9, DE dùng hệ thống:** **Domain Expert** viết và sở hữu nội dung chuyên môn của scenario, thao tác trực tiếp trên hệ thống · **Content Admin** (không phải business admin) đưa nội dung lên màn chơi, lo layout, trình bày, quản lý và duyệt nghề, vận hành vòng đời nội dung · **System Admin** chỉ lo hệ thống (vận hành, model, tài khoản, system review) · **Explorer** là người dùng cuối | 26/9 → 29/9 | [Minutes 26/9](tuan/2026-W40/2026-09-26_gap-co.md): phân vai của cô; Phúc chốt DE dùng hệ thống 29/9 | ✅ (thay D-15; báo cáo 18/9 và `03` §3 cần sửa cho khớp) |
| D-17 | **Giữ miễn phí.** Chừa chỗ cho **logo công ty tài trợ cho hệ thống** (không phải quảng cáo) và **ô quyên góp**. Nhà tài trợ không được viết hay duyệt nội dung; logo không nằm trong scenario, chấm điểm hay bảng xếp hạng | 26/9 → 29/9 | Cô gợi ý tài trợ và quyên góp 26/9; Phúc chốt 29/9, [minutes](tuan/2026-W40/2026-09-26_gap-co.md) | ✅ (thay ý "không quảng cáo, không kiếm tiền" trong §4.1.5 báo cáo). Pháp lý của logo nhà tài trợ **chưa kết luận**: thiết kế thuần ghi nhận, báo cáo ghi "cần rà soát pháp lý", hỏi pháp chế của trường trước khi logo lên thật. Tín hiệu uy tín (chốt 29/9): huy hiệu "chuyên gia đã kiểm định" chỉ trên scenario chuyên gia thật đã duyệt (từ Giai đoạn 1), công bố kết quả Giai đoạn A/B khi đã có và nêu rõ giai đoạn; bảo chứng của Bộ hoặc đối tác để Giai đoạn 3. Trước Giai đoạn 1 chỉ có logo và ô quyên góp |
| D-18 | "Bỏ cardinality" chỉ áp cho **BR-09 và BR-10** (số BR của deck). Số chuyên gia trong bảng tổ chức và "ít nhất 3 chuyên gia" cho RP-1 được giữ | 29/9 | Phúc, [minutes 26/9](tuan/2026-W40/2026-09-26_gap-co.md) | ✅ (chú ý số BR của deck lệch hub, xem [07](07-van-de-mo.md) A13) |
| D-19 | Mỗi **design constraint dẫn xuất từ ít nhất một NFR**; có thể thêm nguồn ngoài là **quy định pháp lý** khi đó là gốc thật (VD DC-03 về dữ liệu cá nhân). **Business rule không phải nguồn** (là chính sách nghiệp vụ; ràng buộc kiểu BR thực chất là NFR). Cột "Dẫn xuất từ": NFR ID (bắt buộc) + nguồn ngoài (tuỳ chọn) | 29/9 | Phúc, [Minutes 26/9](tuan/2026-W40/2026-09-26_gap-co.md) | ✅ (nhóm chốt; 30/9 Phúc: NFR là đủ, **không hỏi cô** nói nốt "NFR và …", xem [07](07-van-de-mo.md) A10) |

## C. Cấu trúc nội dung & gameplay

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-20 | Thang cấp bậc toàn cục **L1 (intern) → L10 (C-level)**. Mỗi nghề chỉ chiếm các band có thật ở VN, **không bịa band** | 22/8 | `_archive/occupation-data/spec-pass1-KHOI1-fixed.md` | ✅ |
| D-21 | **job = (nghề, band)**. **Mỗi task của band = một scenario**, tên scenario chính là chuỗi task. Mỗi scenario có **3–4 activity cố định** cộng follow-up do AI sinh, dài **10–15 phút** | 23/8 → 7/9 | 🎮 minutes 23/8, 27/8, 8/9; `spec-scenario-KHOI1.md` v2.1 | ✅ (thay "beat" bằng "activity") |
| D-22 | **6 archetype** mở dần theo band: S_EXEC (L1+), S_AMBIG (L2+), S_INCIDENT (L3+), S_CONFLICT và S_REVIEW (L4+), S_DECISION (L6+) | 7/9 | spec A3 | ✅ |
| D-23 | **FREETEXT là mặc định.** CHOICE tối đa 1 lần mỗi scenario. Không dùng 4 lựa chọn cùng lúc với tự luận. Thêm ORDERING và PRIORITIZING (v2.2) | 27/8 → 7/9 | 🎮 minutes 27/8; spec A7 | ♻️ thay bởi D-80 và D-85 (1/10) |
| D-24 | Chấm theo **rubric ECD**: mỗi activity quan sát kỹ năng nào, với 3 mốc hành vi **+2 / 0 / −1** | 7/9 | spec A8 | ♻️ phần thang thay bởi D-87 (1/10); ý "mỗi activity khai báo kỹ năng quan sát" vẫn giữ |
| D-25 | **Hint** trong câu tự luận: dùng hint thì trần điểm là 0. **Quick action** có đếm giờ, hết giờ thì −1. Follow-up không cần hint, có giới hạn số lần | 27/8 | 🎮 minutes 27/8; spec A9, A11 | ♻️ thay bởi D-83 và D-86 (1/10) |
| D-26 | **Random event** chỉ rẽ hướng (DIVERT) hoặc kết thúc sớm (EARLY_END), vẫn bám luồng cũ. Chỉ để tạo đa dạng, **không gắn với phần thưởng** | 27/8 → 18/9 | 🎮 minutes 27/8; spec A12; báo cáo §4.2.1 | ✅ |
| D-27 | Người chơi **đánh giá nghề sau khi xong cả nghề**, theo **5 tiêu chí: lương, áp lực, độ khó, cân bằng công việc – cuộc sống, mức yêu thích**. Chỉ công bố số tổng hợp | 7/9 → 18/9 | Deck 7/9 S10; BR-04, BR-08; FR-12 | ✅ (thay ý "review/rating sau mỗi task" ngày 27/8) |
| D-28 | Mỗi nghề có **thanh tiến độ**: xong đủ scenario thì mở level tiếp | 27/8 | 🎮 minutes 27/8 | ♻️ thay bởi D-39 (1/10) |
| D-29 | **Get-to-know-me là tuỳ chọn**, dành cho người chưa biết bắt đầu từ đâu | 7/9 → 23/9 | **Chốt 23/9 (Brian): tuỳ chọn.** Trước đó: deck 7/9, báo cáo 18/9 (FR-11 Should) và flow 20/9 ghi tuỳ chọn; ghi chú của Nam 18/9 ghi bắt buộc; cô 19/9 hỏi vì sao bắt buộc | ✅ (thay ghi chú "bắt buộc" 18/9) |

## D. Kỹ năng, tiến trình & bản đồ nghề

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-30 | Người chơi **tích luỹ kỹ năng qua mỗi lượt chơi**. Kỹ năng là **"nhiên liệu"** để lên level và đi sang nghề khác | 8/9 | 🎮 minutes 8/9; deck 7/9 S12 | ✅ |
| D-31 | Nghề = **hành tinh** trên bản đồ 3D, người chơi = tên lửa. Khoảng cách có trọng số giữa nghề tương tự và nghề thăng tiến | 8/9 | 🎮 minutes 8/9; code `/jobs` | ✅ (cách vẽ đang được bàn lại, xem D-35) |
| D-32 | **Người chơi học cả hard skill lẫn soft skill.** Khớp với deck 7/9 ("mỗi task trả cả soft và hard") và code 18/9 | 23/9 | Chốt 23/9 (Brian) | ✅ (thay minutes 23/8 "giữ hard skill làm context" và ghi chú 18/9 "chỉ học soft skill") |
| D-33 | Luật mở khoá: **cấp đầu mọi nghề mở tự do** (BR-01). Lên cấp cần đủ điểm năng lực (BR-02). Sang nghề kề cần năng lực trùng với yêu cầu đầu vào (BR-03) | 7/9 → 18/9 | Deck 7/9 S5 (*"bỏ 2 mode riêng"*); báo cáo §4.1.3 | ✅ (cần giải thích BR-01 vs BR-03, xem [07](07-van-de-mo.md)) |
| D-34 | (Cài đặt) **Nhiên liệu là ngưỡng, không bị trừ khi bay.** Chỉ bay tới hành tinh kề (1-hop). Công thức: XP ≥ khoảng cách × 100 và mọi skill yêu cầu ≥ Lv1 | 18/9 | `_archive/docs/report-skill-graph-mvp.md` (Brian) | 💡 quyết định kỹ thuật, team chưa duyệt |
| D-35 | **Flow bản đồ mới:** thiên hà = domain, hành tinh = nghề. **Bỏ hệ sao và đường nối**, toạ độ hành tinh tính từ skill. Góc nhìn từ trục z. Profile = nhật ký trải nghiệm. Tách **domain point / skill point**, có achievement và biểu đồ thống kê | 18/9 → 20/9 | 🎮 Nam 18/9 23:36 và 20/9 13:41 | 💡 chưa chốt. Bản 18/9 còn "hệ sao → carousel hành tinh", bản 20/9 bỏ hệ sao |
| D-36 | Cân nhắc **mức độ trưởng thành nghề nghiệp** (career maturity) để chia level cho game | 19/9 | 🎮 nhận xét của cô (Nam ghi 20/9) | 💡 |
| D-37 | **Viết lại BR-11** (trần điểm khi chơi lại), không bỏ: *"Chơi lại một scenario không thể nâng năng lực vượt quá mức điểm scenario đó có thể cho"*. Bảo vệ BR-02: không có trần thì chơi lại cũng mở được cấp | 29/9 | Cô 26/9 (khó hiểu), Phúc chốt 29/9, [Minutes 26/9](tuan/2026-W40/2026-09-26_gap-co.md) | ✅ (số BR-11 là của deck, xem [07](07-van-de-mo.md) A13) |
| D-38 | **Viết lại BR-03** để không nghe như mâu thuẫn với BR-01: năng lực đã chứng minh ở một nghề **được tính vào điểm các cấp của nghề kề**, nên người dùng có thể vào nghề kề **từ một cấp cao hơn cấp đầu**. BR-01 lo khám phá tự do, BR-03 lo "không phải làm lại từ đầu" (khớp user story §4.3.1 *"so that I need not restart"*) | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) A6) | ✅ (báo cáo §4.1.3 cần sửa) |
| D-39 | **Thanh tiến độ:** **không tụt band**; **chơi lại vẫn được tính nhưng có trần** theo BR-11 viết lại (D-37); thanh đầy khi **đủ điểm năng lực** của cấp (BR-02), không đếm số scenario. Ngưỡng cụ thể để Chương 5 | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) §D1) | ✅ (thay D-28) |

## E. AI & đánh giá

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-40 | **AI là engine lõi:** sinh scenario từ **seed do người viết**, dẫn truyện và thích ứng theo lựa chọn, chấm câu trả lời | 3/9 | Kickoff S3; deck 7/9 S5 | ✅ (**chưa cài**: code đang chấm bằng từ khoá) |
| D-41 | Giám sát AI: **human-in-the-loop khi soạn** (người viết seed), **human-on-the-loop khi chạy** (AI tự chạy từng lượt, chất lượng kiểm bằng bộ chuẩn offline) | 7/9 | Deck 7/9 S10 (cô yêu cầu nói rõ) | ✅ |
| D-42 | **Không nội dung nào tới người dùng nếu chuyên gia chưa duyệt** (BR-05). Sửa seed thì mọi bản sinh từ seed đó bị huỷ và sinh lại | 18/9 | BR-05; Hình 5.2 | ✅ (1/10: "chuyên gia duyệt" được làm rõ thành hai lớp ở D-88) |
| D-43 | **Mô hình chấm phải khác họ với mô hình sinh** (BR-09), để tránh model tự khen bài của chính nó | 18/9 | BR-09; FR-20 | ✅ (báo cáo 26/9 chuyển luật này từ BR-09 thành **DC-01**, xem [07](07-van-de-mo.md) A13) |
| D-44 | Đánh giá **offline** bằng **bộ chuẩn IT do chuyên gia duyệt**. Đo riêng 2 thứ: chất lượng sinh và độ khớp khi chấm (**Cohen's κ, chia theo độ khó**). Không làm user study lớn | 3/9 → 18/9 | Kickoff S6; deck 7/9 S13; deck 18/9 S28 | ♻️ thay bởi D-47 (hai giai đoạn) và D-48 (QWK thay κ). Ý "đo riêng sinh và chấm, chia theo độ khó" vẫn giữ |
| D-45 | Kết quả chấm **chỉ để người học tự tham khảo**: không gửi nhà tuyển dụng, không dùng quyết định cơ hội nào (BR-06). Phải thể hiện cả mặt xấu của nghề (BR-07) | 18/9 | BR-06, BR-07 | ✅ |
| D-46 | **Bỏ BR-12** (lượt test của nhân sự) khỏi business rule, **giữ hành vi** bằng trường đánh dấu loại lượt chơi thêm vào DR-07: lượt chơi ở chế độ review hoặc test được đánh dấu, loại khỏi số liệu explorer và điểm đánh giá tổng hợp. Cần vì DE giờ chơi scenario khi duyệt | 29/9 | Cô 26/9 (*"chắc bỏ đi"*), Phúc chốt 29/9, [Minutes 26/9](tuan/2026-W40/2026-09-26_gap-co.md) | ✅ (số BR-12 là của deck; DR-07 có trong báo cáo, chưa có trường loại lượt chơi nên phải thêm; hub chưa có bảng DR) |
| D-47 | **Đánh giá hai giai đoạn**, vì chuyên gia chỉ có dần. **Giai đoạn A (ĐACN):** benchmark tổng hợp. Mỗi bài tự luận có một câu trả lời mẫu tốt và các biến thể **làm hỏng đúng một tiêu chí rubric** tới mức biết trước, kèm bài thử thiên lệch (độ dài, định dạng, thứ tự). Cô kiểm ~1/5 số biến thể. Giai đoạn A **chỉ cho biết** judge có nhạy với từng tiêu chí, bền trước thiên lệch và ổn định qua các lần chạy, **không** cho biết độ khớp với chuyên gia. **Giai đoạn B (capstone):** tình nguyện viên làm task trên sản phẩm hoàn chỉnh (có đồng ý), **3 chuyên gia mỗi role pilot chấm mù và độc lập**; đây mới là câu trả lời đầy đủ cho RP-2 | 26/9 | Báo cáo 26/9 §4.2.2, DR-09; block-resolutions B4 | ✅ (thay D-44) |
| D-48 | **Thước đo và ngưỡng chấp nhận.** RP-2 dùng **QWK** (thang rubric là thứ bậc) thay Cohen's κ, theo 3 tiêu chí ETS (Williamson, Xi & Breyer 2012): **QWK ≥ 0,70**, chênh lệch điểm trung bình chuẩn hoá **≤ 0,15**, và **không thấp hơn quá 0,10** so với độ khớp chuyên gia–chuyên gia. Độ khớp giữa chuyên gia: Krippendorff α ≥ 0,800. RP-1: **I-CVI ≥ 0,78, S-CVI/Ave ≥ 0,90**, McNemar p < 0,05 (có seed so với không seed), giữ **≥ 95%** fact bắt buộc của seed | 26/9 | Báo cáo 26/9 §2.6, §4.2.2; block-resolutions B6 | ✅ (thay κ của D-44; 1/10 Phúc: giữ 95% và ghi là *"proposed target"*, dùng luôn làm NFR mới cho DC-06) |
| D-49 | **Chấm tự luận bằng một panel judge thuộc nhiều họ model**, mỗi judge chấm độc lập, gộp điểm, và chạy lặp để đo độ ổn định. Panel model nhỏ khác họ hơn một judge lớn và rẻ hơn (Verga et al. 2024, preprint). Câu trả lời tổng hợp của Giai đoạn A do một họ model **khác mọi judge** viết | 26/9 | Báo cáo 26/9 §4.2.2, FR-06; block-resolutions B4 | ✅ (mở rộng D-43) |

## F. Dữ liệu nghề

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-50 | Taxonomy **78 role IT / 6 domain**, xếp 4 archetype (A = có tuyển fresher, B = chuyển ngang, C = đích đến, D = lai). Nhãn tin cậy A_VERIFIED / B_TITLE_SEEN / C_INFERRED. **Thiếu dữ liệu thì ghi `unknowns`, không suy diễn** | 22/8 | `_archive/occupation-data/`: `pass0-archetype-triage.md`, `spec-pass1-KHOI1-fixed.md`, `output/REPORT.md` | ✅ |
| D-51 | **Khử bias JD:** lấy skill và lương từ khảo sát tự khai của người làm nghề (**ITviec IT Salary Report 2025–26**, n = 1.839) thay vì từ JD công ty | 27/8 → 10/9 | 🎮 minutes 27/8 ("bias do đọc JD"); `README_DATASET.md` (đã xoá, còn trong commit `6652636`) | ✅ |
| D-52 | Lọc role phổ biến, gộp role ít khác biệt, **giữ cột similar role khi gộp** → **22 role** cho graph, **18 role chơi được** | 23/8 → 10/9 | 🎮 minutes 23/8; 💬 26/8; `roles_18_playable.csv` | ✅ |
| D-53 | Có 97 sự kiện role-play (7 chung + 90 riêng), đo trên **8 chiều fit** (DEEP_WORK, PRESSURE, PEOPLE…). **Hệ sự kiện này và hệ kịch bản chưa được hợp nhất** | 10/9 | `README_DATASET.md` (đã xoá, còn trong commit `6652636`); spec "CÒN THIẾU #4" | ⚠️ |

## G. Vận hành & chuyên gia

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-60 | **Lộ trình 5 giai đoạn, mỗi giai đoạn có "cổng" bằng chứng.** 0 · Đồ án ở trường (tới hết 2026): hệ thống lõi mảng IT, seed tạm, đánh giá Giai đoạn A → 1 · Capstone và pilot đầu (2027): panel chuyên gia đầu, pilot với sinh viên IT tình nguyện, Giai đoạn B → 2 · Ươm tạo, pilot nhiều điểm ở TP.HCM (2027–2028) → 3 · Hợp tác với Sở GD&ĐT TP.HCM rồi Bộ, mở lĩnh vực thứ hai (2028–2029) → 4 · Tài nguyên công cấp quốc gia (từ 2030). Đạt ngưỡng RP-1, RP-2 là bằng chứng để tiếp cận nhà tài trợ và cơ quan nhà nước. Mốc chính sách: QĐ 522/QĐ-TTg (2018–2025), nghị định kế nhiệm đang soạn, mục tiêu STEM 2030 của TP.HCM | 26/9 | Báo cáo 26/9 §4.1.5 (Bảng 4.2); block-resolutions B1 | ✅ (năm là dự kiến; 1/10 Phúc: giữ nguyên) |
| D-61 | **Hình thức tổ chức theo giai đoạn.** Giai đoạn 0–1 do trường host, chưa cần pháp nhân. Giai đoạn 2 lập tổ chức **phi thương mại** (doanh nghiệp xã hội hoặc trung tâm thuộc trường), chốt khi có tư vấn pháp lý. Cơ cấu vận hành lâu dài: ban chỉ đạo, 5 đơn vị (sản phẩm và kỹ thuật, nội dung và chuyên môn nghề, nghiên cứu và đánh giá, đối tác, bảo vệ dữ liệu), khoảng 11 vị trí toàn thời gian, mỗi miền nghề có một domain lead | 26/9 | Báo cáo 26/9 §4.1.5 (Bảng 4.3) | ✅ (cột "user group" của Bảng 4.3 còn ghi CA = business admin, sửa ở T2609.1; cho một người giữ nhiều vai ở T2609.27) |
| D-62 | **Tiêu chuẩn chuyên gia.** Senior hoặc lead trong nghề, khoảng **5 năm kinh nghiệm trở lên**, từng kèm junior, đang làm hoặc mới rời nghề. **3–4 người mỗi role**, từ **ít nhất 2 loại công ty** (product, outsource, startup, IT nội bộ). **Không ai duyệt scenario sinh từ seed mình góp soạn.** Với ~22 role, mạng lưới đủ là 66–88 người, có dần qua đối tác, làm bán thời gian, kiểm định lại hằng năm | 26/9 | Báo cáo 26/9 §4.2.1; block-resolutions B2 | ✅ (D-18 giữ số 3–4 người) |
| D-63 | **Chuyên gia tham gia theo giai đoạn.** Giai đoạn 0 **chưa có chuyên gia ngành**: nhóm soạn **seed tạm** từ nguồn công khai (O\*NET, ESCO, JD của nhiều công ty, báo cáo sự cố công khai) dưới hướng dẫn của cô, ghi nguồn từng phần tử, **không gọi là đã kiểm định**. Giai đoạn 1: panel đầu ~9 người (khoảng 3 role pilot × 3), ước **~7 giờ mỗi chuyên gia** (chấm scenario, chấm câu trả lời, gán khoá lựa chọn) | 26/9 | Báo cáo 26/9 §4.2.1, §4.2.3; block-resolutions B2 | ✅ |
| D-64 | **Đối tác và nhà tài trợ dùng chung một bộ biện pháp bảo vệ.** Bộ/Sở GD&ĐT và tổ chức edtech đều có thể vừa là đối tác vừa là nhà tài trợ; đối tác ngành và hiệp hội cung cấp chuyên gia; HCMUT là nơi host và giám sát học thuật. Biện pháp chung: **không viết, duyệt hay xếp hạng nội dung**; chỉ nhận số liệu tổng hợp; không thu phí hay kiếm tiền từ người dùng; công khai mọi quan hệ | 26/9 | Báo cáo 26/9 §4.1.5; block-resolutions B5 | ✅ (ý "không quảng cáo" đã được D-17 nới cho logo tài trợ) |
| D-65 | **Đòn bẩy chi phí khi không có doanh thu:** panel judge nhỏ khác họ rẻ hơn một judge lớn; **sinh và duyệt scenario theo lô, offline** (vì mọi scenario phải được duyệt trước khi phục vụ), để chi phí lúc chạy chủ yếu là chấm tự luận; đổi được provider (NFR-12, DC-02) | 26/9 | Báo cáo 26/9 §4.1.5; block-resolutions B1 | ♻️ phần "sinh và duyệt theo lô" thay bởi D-67 (1/10); panel judge nhỏ và provider thay được vẫn giữ |
| D-66 | **Role:** 22 role theo `occupation-data/datasets/final_22_roles.json`. **3 role pilot** cho Giai đoạn 1: **Backend** (đã có 2 kịch bản), **DevOps/Cloud** (đã giao từ 27/8), và **Business Analyst** (`PROD_BA`; chọn 1/10 vì khác nghề viết code nhiều nhất và đầu ra chủ yếu là văn bản, hợp với RP-2), để kiểm tra rằng cách chấm không chỉ đúng với nghề viết code | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) G1) | ✅ |
| D-67 | **Seed là khuôn có mốc cố định, AI phát triển giữa các mốc.** Seed định ra các **canon event** ở những mốc nhất định trong scenario. AI phát triển câu chuyện **theo câu trả lời của người dùng** nhưng **luôn bám các luồng đó** và đi qua đủ các canon event. Chuyên gia duyệt seed (canon event, lựa chọn có khoá, rubric); phần nối giữa các mốc do AI sinh lúc chơi, trong ràng buộc DC-06 | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) G2) | ✅ (thay ý pool sinh sẵn của D-65; cần sửa cách diễn đạt BR-05, FR-16, D-42, xem [07](07-van-de-mo.md) A18) |
| D-68 | **Chuyên gia Giai đoạn 1 đóng góp tự nguyện** qua mạng lưới của cô và cựu sinh viên (~7 giờ mỗi người). Từ Giai đoạn 2 có dòng thù lao trong kinh phí tài trợ | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) G3) | ✅ (thêm một câu vào §4.1.5) |
| D-69 | **Để sau các module chính:** module tuyển sinh/học thuật, dữ liệu thị trường lao động và lương, chỉ số ẩn trên dashboard, roadmap builder, chi tiết chơi lại, blind box, đường bí mật. Không đưa vào báo cáo ĐACN, trừ một dòng ở hướng phát triển | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) G7) | ✅ |

## H. Thương hiệu & cách làm việc

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-70 | **Logo v2:** ngôi sao dẫn đường 8 cánh, kiêm tên lửa, có quỹ đạo và vòng la bàn (thay ngôi sao 4 cánh ở kickoff) | 7–8/9 | Deck 7/9 S3; 💬 8/9 | ✅ |
| D-71 | Tên sản phẩm: mọi file nộp cô dùng **JobQuest**, nhưng app đang hiển thị **"Vào Nghề"** (`index.html`, màn đăng nhập) | 18/9 | code | ♻️ thay bởi D-74 |
| D-72 | **Gặp cô mỗi tuần** (chọn ngày 5/9). Slot đăng ký là chiều T7 (16h, từ 19/9 đổi thành 17h). Riêng tuần 7/9 gặp vào T5 10/9 lúc 17h | 30/8 → 14/9 | 💬 | ✅ |
| D-73 | Thảo luận trên Discord. Task và minutes ghi ở kênh `#weekly-minutes`. Tài liệu đẩy lên repo, chia theo tuần | 25/7, 6/8 | 💬 | ✅ (từ 21/9: ghi vào `docs/project-hub/`) |
| D-74 | Tên sản phẩm là **JobQuest** ở mọi nơi, kể cả trong app (thay "Vào Nghề") | 30/9 | Phúc chốt 30/9 ([07](07-van-de-mo.md) A3) | ✅ (app còn hiện "Vào Nghề", cần sửa code) |

## I. Định dạng task & chấm kiểu SJT

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-80 | **Task = một scenario trong một cấp, người dùng trả lời bằng một trong 9 định dạng:** trắc nghiệm một đáp án, chọn nhiều, sắp thứ tự, ghép cặp, đúng/sai, lựa chọn có đếm giờ, tự luận, email rút gọn, code rút gọn. Mỗi task khai báo trong seed các năng lực nó nhắm tới. **RP-2 chỉ phủ các định dạng viết:** tự luận, email, giải thích hoặc review code (viết code thì chấm bằng test chạy được) | 26/9 | Báo cáo 26/9 §4.1.2, FR-05, FR-06; block-resolutions B3 | ✅ Phúc chốt 1/10 (thay D-23; spec và code cập nhật sau, xem D-85) |
| D-81 | **Chấm các định dạng lựa chọn theo situational judgment test (SJT).** Mỗi lựa chọn có một **profile hiệu quả trên nhiều năng lực** do chuyên gia chấm. Lựa chọn viết từ **critical incident** chuyên gia kể, và khoá chấm do **một nhóm chuyên gia khác** lập. Sắp thứ tự chấm theo khoảng cách tới thứ tự đồng thuận (có điểm từng phần); đúng/sai và ghép cặp dùng đáp án khi là kiến thức thuần. Mỗi lựa chọn phải **grounded, plausible, intentional, consistent, distinct**. Model được viết lại lời nhưng **không được đổi profile** của lựa chọn (DC-06) | 26/9 | Báo cáo 26/9 §2.2, FR-05, DC-06; block-resolutions B3 | ✅ (câu "đánh đổi, không đúng sai" ở §2.2 thay bởi D-82) |
| D-82 | **Ba loại lựa chọn:** **đúng** (hiệu quả nhất), **đánh đổi** (hiệu quả lẫn lộn giữa các năng lực), **sai** (không hiệu quả hoặc có hại, **hiệu quả âm**). Khớp khoá SJT xếp từ rất kém tới rất hiệu quả. Cho phép điểm âm | 26/9 → 29/9 | Cô 26/9 ([07](07-van-de-mo.md) B17); handoff 29/9 §3 | ✅ (báo cáo 26/9 §2.2 còn ghi "không đúng sai", sửa ở T2609.18) |
| D-83 | **Hint dùng được ở mọi định dạng.** Dùng hint được ghi vào evidence: giảm trọng số của câu trả lời đó như bằng chứng năng lực **tự làm**, nhưng **không chặn tiến độ**. Thời gian trả lời **đo trên thiết bị, không tính trễ mạng**, để không phạt người dùng máy yếu hay mạng chậm (NFR-13) | 26/9 | Báo cáo 26/9 §4.1.2, FR-22, UC-03; block-resolutions B3 | ✅ Phúc chốt 1/10 (thay D-25, chi tiết ở D-86) |
| D-84 | Câu hỏi trong task hỏi theo kiểu **"bạn làm gì?"** (xu hướng hành vi), hợp với khám phá vì cho thấy cách người dùng hay hành động; câu kiểu "cách nào hiệu quả nhất?" đo kiến thức nhiều hơn (McDaniel et al. 2007). Chấm vẫn theo khoá hiệu quả của chuyên gia | 26/9 | block-resolutions B3 ("one construct choice to confirm"); báo cáo 26/9 §2.2 nêu phát hiện nhưng chưa ghi lựa chọn | ✅ Phúc chốt 1/10 (thêm một câu vào §2.2 và §4.1.2) |
| D-85 | **Ánh xạ spec sang 9 định dạng:** PRIORITIZING là một biến thể của **sắp thứ tự** (xếp theo mức ưu tiên). Luật "FREETEXT mặc định, CHOICE tối đa 1 lần mỗi scenario" chỉ còn là **hướng dẫn soạn scenario** trong spec, không phải luật của hệ thống. Code không cần có đủ 9 định dạng ngay, vì báo cáo mô tả hệ thống dự định | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) A15) | ✅ (spec v2.2 cần thêm ghi chú ánh xạ) |
| D-86 | **Hint và đếm giờ:** câu có dùng hint vẫn được tính, nhưng **trọng số thấp hơn** khi cộng vào năng lực (mức cụ thể để Chương 5). **Hết giờ = không trả lời:** ghi lại thời gian, không cộng điểm, **bỏ luật −1 cố định**. Lý do: đây là công cụ khám phá, không phải bài thi, và không phạt người dùng máy yếu (NFR-13) | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) A16) | ✅ (spec A9, A11 cần sửa) |
| D-87 | **Một thang chung −1 / 0 / +1 / +2 cho mỗi năng lực**, dùng cho cả hai loại chấm. **Lựa chọn (SJT):** chuyên gia gán mỗi lựa chọn một điểm trên từng năng lực: lựa chọn đúng có năng lực đạt +2; lựa chọn đánh đổi thì +2 ở năng lực này, −1 ở năng lực kia; lựa chọn sai thì −1. **Tự luận:** mỗi tiêu chí rubric chấm trên cùng thang. Thang thứ bậc 4 mức nên tính QWK được, và khớp benchmark Giai đoạn A (4 mức mỗi tiêu chí) | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) A17) | ✅ (thay thang của D-24; báo cáo §4.1.2, FR-05, FR-06 và spec A8 cần sửa) |
| D-88 | **"Đã duyệt" gồm hai lớp**, vì phần nối giữa các canon event do AI sinh lúc chơi (D-67). **Lớp 1, chuyên gia:** duyệt **seed** (canon event, lựa chọn có khoá, rubric) **và một mẫu các lượt sinh** từ seed đó; mẫu này cũng là dữ liệu cho RP-1. **Lớp 2, máy kiểm từng lượt sinh lúc chạy:** đi qua đủ canon event, giữ fact bắt buộc, không đổi profile lựa chọn (DC-06). Không qua thì sinh lại, hoặc dùng lại một lượt trong mẫu đã duyệt | 1/10 | Phúc chốt 1/10 ([07](07-van-de-mo.md) A18) | ✅ (làm rõ D-42; sửa BR-05, FR-16, UC-03 ở T0110.3) |

---

## Mẫu thêm quyết định mới

```
| D-xx | <quyết định, 1–2 câu> | <ngày> | <link Discord / commit / file> | ✅/⚠️/💡 |
```
Khi một quyết định bị thay: **đừng xoá dòng cũ**. Đổi trạng thái sang ♻️ và ghi "thay bởi D-yy".
