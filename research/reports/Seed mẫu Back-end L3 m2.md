# Seed SWE_BACKEND.L3.m2 (bản 4, cập nhật theo D4 và D5): phần AI-4 và engine được đọc
Soạn theo `Seed scenario JobQuest.md` và [Luật dẫn truyện JobQuest.md](Luật%20dẫn%20truyện%20JobQuest.md) bản 3 đã chốt (A1, A1b, A11, A12, A13; gồm sửa D3). File đã bỏ observes, signs, difficulty và profile điểm. Lời thoại cần audit.

Đổi so với bản 3:
- f5 sửa số liệu; thêm f10 về app cũ.
- Quy định "duyệt rồi mới lên" được nói ở n0.
- Niềm tin sai của anh An chuyển vào canon n0.
- Có `check_q` (A12) và nhánh `log_staging` đủ trường hợp.
- Có `timeline` tách khỏi ambient, và `hold_until` (A13).
- n1 có 4 adapt; lời adapt không nói trước ý của phương án.
- Nút tốn 1 điểm. Thêm "Sửa lại bản vá" và "Tạm làm việc khác".

## Gói cấp (tóm tắt)
- **company:** "Giao Nhanh" (hư cấu). Startup giao đồ ăn và đi chợ hộ, khoảng 120 nhân viên, văn phòng quận 1 TP.HCM. Team Back-end có 6 người.
- **workplace:** văn phòng, giờ hành chính 8:30–17:30. Có chat nội bộ và kênh #su-co để báo sự cố. Anh An và chị Linh đều có trong kênh.
- **level_scope:** Kỹ sư Back-end L3, khoảng 2–3 năm. Tự làm tính năng và sửa lỗi phần mình; lên hệ thống thật cần người duyệt.
- **resident_npcs:** mentor, support.
- **rules:**
  1. Đụng tới production thì nhắn #su-co trước, và anh An duyệt rồi mới đưa lên. Gộp luôn `limits.need_approval`. *(told_at: n0)*
  2. Không hứa giờ xong với khách khi chưa chắc. *(told_at: n0)*
- **Nhịp thời gian (A1):** 1 điểm = 5 phút.

## Màn
- **id:** SWE_BACKEND.L3.m2 · **title:** "Sự cố hệ thống giờ cao điểm!" · **task_ref:** L3#3
- **player_role** (thẻ "Vai của bạn"): "API lịch sử đơn là phần bạn viết ba tuần trước. Tuần này bạn trực sự cố của team, báo cho anh An, mentor của bạn."
- **limits:** decide_alone: Xem log; Chạy thử trên staging; Viết và test bản sửa · need_approval: Đưa bản sửa lên hệ thống thật (người duyệt: mentor, told_at n0) · not_allowed: Hứa giờ xong với khách (told_at n0).
- **situation** (1 câu): "Sáng đầu tuần, bạn vừa ngồi xuống thì app nội bộ báo đỏ: API lịch sử đơn chậm hẳn."
- **goal:** "Tìm ra vì sao API chậm và báo anh An hướng xử lý trước 12:00."
- **stakes** (chỉ mentor nói, khi hợp): "Tới trưa vẫn chậm thì đơn giờ cao điểm sẽ rớt."
- **clock:** bắt đầu 9:40, hạn chót 12:00, ngân sách 28 điểm.
- **glossary:** Log · Staging · Production (như bản 3).

## Fact sheet
| id | text | visibility | unlock / known_by | ghi chú |
|---|---|---|---|---|
| f1 | API lịch sử đơn chậm từ 8:00: thường 0,2 giây, giờ hơn 4 giây | shown (n0) | mentor, support | |
| f3 | API do bạn viết ba tuần trước, anh An review | shown (player_role) | mentor | |
| f6 | Anh An gấp release module thanh toán lúc 14:00 | shown (n0) | mentor | |
| f2 | Bộ phận hỗ trợ đã nhận 3 phàn nàn; sau 10:30 là 12 | on_ask, timeline | hỏi support | |
| f4 | Khách sỉ Minh Phát (MP-0042) có 900 đơn trong lịch sử | on_ask | mở bảng số liệu, hoặc hỏi support | |
| f5 | Mở lịch sử đơn của MP-0042 thì hệ thống hỏi cơ sở dữ liệu 901 lần; khách 3 đơn chỉ 4 lần | on_ask | mở log | sửa số |
| f9 | Minh Phát doạ huỷ hợp đồng nếu trưa còn chậm | on_ask | hỏi support về khách; **reserved_for n1** | |
| f10 | App bản cũ không gửi số trang khi xem lịch sử đơn; nhiều khách sỉ vẫn dùng app cũ | on_ask | hỏi mentor về app cũ hay số trang | mới |
| f7 | Nguyên nhân: lấy chi tiết từng đơn trong một vòng lặp | ai_only | mentor xác nhận khi người chơi nói ra (chat, ghi chú hay email) | |
| f8 | API không giới hạn số đơn trả về | ai_only | mentor xác nhận khi người chơi nói ra (chat, ghi chú hay email) | |

## Artefacts
- **log_api, bang_so_lieu, code_api:** nguyên văn như bản 3.
- **ban_va:** ô "Mô tả thay đổi". Lúc lưu, engine hỏi bộ phán (A12):
  - `bv.bo_vong_lap`: "Bản vá có bỏ việc gọi cơ sở dữ liệu trong vòng lặp, thay bằng một truy vấn gom không?"
  - `bv.phan_trang`: "Bản vá có giới hạn số đơn trả về mỗi lần (phân trang hoặc giới hạn) không?"
  - `bv.giu_app_cu`: "Bản vá có nói cách xử lý request không gửi số trang không?"
  - "Sửa lại bản vá" mở lại ô cũ để sửa; lưu thì hỏi lại cả 3 câu.
- **log_staging:** engine chọn nhánh theo cờ, không để AI phán. Người chơi chạy thử bằng request kiểu app mới (có page), và nếu `bv.phan_trang` thì thêm một dòng kiểu app cũ (không page).

  | Cờ bản vá | App mới (có page) | App cũ (không page) |
  |---|---|---|
  | Chưa có bản vá, hoặc không `bo_vong_lap` | `4.40s  db_queries=901` | (không chạy dòng này) |
  | Có `bo_vong_lap`, không `phan_trang` | `1.12s  db_queries=2  rows=900` | (không chạy dòng này) |
  | Có `bo_vong_lap` và `phan_trang`, không `giu_app_cu` | `0.18s  db_queries=2  page=1 size=50` | `0.18s  db_queries=2  page=1 size=50  (không gửi page → trả trang 1)` |
  | Có cả 3 cờ | `0.18s  db_queries=2  page=1 size=50` | `0.31s  db_queries=2  limit=200  has_more=true` |

  Mỗi dòng đều bắt đầu bằng `GET /orders/history?customer=MP-0042`.
- **ghi_chu_su_co** (artefact của n2): 3 ô "Hiện tượng" · "Nguyên nhân nghi ngờ, kèm bằng chứng" · "Đã làm gì", cộng danh sách giả thuyết h1–h5 như bản 3. Sau khi lưu vẫn "Xem lại và sửa" được, 0 điểm.
- **tin_su_co:** ô tin nhắn gửi kênh #su-co.
- **email_an** (artefact của n3): 3 phần "Nguyên nhân" · "Hướng xử lý" · "Rủi ro và cách lùi lại". Bộ phán (A12):
  - `email.co_cach_kiem`: "Email có nêu cách kiểm tra hay theo dõi sau khi đưa lên production không?"
  - `email.co_rollback`: "Email có nêu cách lùi lại (rollback) nếu bản sửa gây lỗi không?"

## Cờ đọc từ hội thoại (A12)
Engine hỏi bộ phán sau mỗi cuộc trò chuyện, chỉ cho các câu khai ở đây:
- Với **support**:
  - `support_biet_tim_ra_loi`: "Người chơi có cho chị Linh biết là bên kỹ thuật đã thấy lỗi, đang sửa hay đã sửa xong không (nói nguyên nhân, “tìm ra lỗi rồi”, “đang sửa”, “sửa xong” đều tính)?" Chạy cả khi người chơi nhắn #su-co, vì chị Linh có trong kênh (A12, D4).
  - `hua_bao_lai`: "Người chơi có hẹn báo lại chị Linh, vào một giờ cụ thể hoặc khi có một tin (sửa xong, có duyệt) không?" Nếu có thì chạy `extract` lấy giờ hoặc sự kiện, và kênh, có nguyên văn trong chữ. Ghi thành `hua_bao_lai@<giờ>` hoặc `hua_bao_lai@<sự kiện>`; kênh trống thì dùng kênh của cuộc đó (A1b, D5).
  - `hua_chac_trua`: "Người chơi có hứa với chị Linh là trưa xong không?"
- Với **mentor**:
  - `nguyen_nhan_da_noi_voi_mentor`: "Người chơi có nêu với anh An nguyên nhân kèm bằng chứng từ log, code hay bảng số liệu không?"
  - `da_loai_db_bang_chung`: "Người chơi có đưa ra bằng chứng cho thấy không phải DB quá tải (ví dụ khách ít đơn cùng giờ vẫn nhanh, số query tăng theo số đơn) không?" Chạy cả với chat, ghi chú và #su-co.
- Với **ghi_chu_su_co**: `gc.h4` bật khi người chơi tick h4, **hoặc** khi n2 xong mà bộ phán trả có cho câu "Trong nút này, người chơi có nói giữ khả năng API trả hết đơn không giới hạn, kèm lý do không?" (A12, D5).
- Với **mentor, chạy theo lượt** (`realtime: true`; A12, D5): `xin_duyet`: "Trong lượt này, người chơi có xin anh An duyệt đưa bản sửa lên không?" Có thì anh An đáp tối đa 1 nhịp về nội dung, rồi nói `approval_line`.
- Với **cả nút n3** (chạy khi nút xong, đọc email, câu trả lời probe và lượt đáp; A12, D4):
  - `n3.co_cach_kiem`: "Trong nút này, người chơi có nêu cách kiểm tra hay theo dõi sau khi đưa lên production không?"
  - `n3.co_rollback`: "Trong nút này, người chơi có nêu cách lùi lại nếu bản sửa gây lỗi không (ví dụ rollback, deploy lại bản cũ)?"

## Cast
**mentor:** anh An, 32 tuổi, giọng Nam, nhắn ngắn.
- want: sự cố xử lý gọn, không trễ release 14:00. pressure: đang gấp release. stance: tin người chơi, muốn người chơi tự tìm ra.
- concerns:
  - `nguyen_nhan`: muốn chắc nguyên nhân trước khi cho sửa. Gỡ khi cờ `nguyen_nhan_da_noi_voi_mentor` bật.
  - `rui_ro_production`: sợ bản sửa làm hỏng chỗ khác trên production. **hold_until: n3** (A13). Gỡ khi xét xong cả nút n3: `n3.co_cach_kiem` và `n3.co_rollback` cùng bật.
- channel: chat. expertise: 3. beliefs: "Chắc DB quá tải giờ cao điểm" (nói trong canon n0; `drop_when: nguyen_nhan_da_noi_voi_mentor`). disclosure_style: nói thẳng.
- approval_line (A13, D4): (binh_thuong) "Em gửi anh email hướng xử lý nha, anh duyệt trên đó."

**support:** chị Linh, 29 tuổi, giọng Nam, lo thì nói nhiều.
- want: có câu trả lời cho khách sỉ. pressure: Minh Phát gọi liên tục. stance: quý người chơi, đang hoảng.
- concerns:
  - `can_cau_tra_loi`: cần câu để nói với khách. Gỡ khi `hua_bao_lai` bật, hoặc khi người chơi cho một câu nói được với khách mà không hứa chắc (bộ phán: "Người chơi có đưa chị Linh một câu để nói với khách mà không hứa giờ chắc không?").
  - `can_gio_chac`: khách đòi giờ chắc. **hold_until: n1.** Không gỡ trong màn; phương án a hay c ở n1 làm chị dịu xuống, phương án b làm chị vui vì tưởng đã được hứa.
- channel: gọi điện hoặc chat. expertise: 0. beliefs: "App lag là do mạng của khách" (`drop_when: support_biet_tim_ra_loi`). disclosure_style: nói thẳng, kể dài.
- Không có mặt ở nút kết. Lời hứa còn treo với chị thì nhắc ở "Nhìn lại ca" (A13).

## story_flags
- Lời hứa và tin báo: `hua_bao_lai@<giờ>`, `hua_chac_trua`, `support_biet_tim_ra_loi`, `da_bao_su_co`, `tre_hen` (A1b).
- Tài liệu: `da_mo_log`, `da_mo_code`, `da_mo_bang`.
- Bản vá và staging: `da_viet_ban_va`, `bv.bo_vong_lap`, `bv.phan_trang`, `bv.giu_app_cu`, `staging_da_chay`.
- Nguyên nhân: `nguyen_nhan_da_noi_voi_mentor`, `da_loai_db_bang_chung`, `gc.h4`.
- Email và nút kết: `email.co_cach_kiem`, `email.co_rollback` (chọn hook probe n3); `n3.co_cach_kiem`, `n3.co_rollback` (gỡ khúc mắc, xét khi nút xong).
- Khúc mắc đã gỡ: `resolved_<id khúc mắc>`.

## actions[] (theo bảng A1 bản 3)
| Hành động | Điểm |
|---|---|
| Trò chuyện với một người (tối đa 3 lượt; tiếp thêm 3 lượt thì thêm 1). Kể cả cuộc do NPC mở | 1 |
| Mở log · Mở bảng số liệu · Mở code API (xem lại: 0) | 1 |
| Nhắn kênh #su-co | 1 |
| Chạy thử trên staging | 2 |
| Gọi họp nhanh | 3 |
| Viết bản vá | 5 |
| Sửa lại bản vá | 3 |
| Tạm làm việc khác (chỉ hiện khi nút lõi kế là nút theo giờ và còn cách ≤ 6 điểm; chạy tới mốc tới trước) | số điểm tới mốc |
| "Chốt nguyên nhân" (n2; hiện sau khi n1 đã xảy ra) | 1 |
| "Gửi anh An" (n3; hiện sau khi n2 đã xảy ra; trước 12:00 thì có hộp xác nhận E7) | 1 |

## ambient (không gắn giờ, mỗi cái dùng 1 lần, chèn sau hành động từ 2 điểm trở lên)
- am1: Nhóm chat team bàn trưa nay ăn cơm tấm hay bún đậu.
- am2: Máy lạnh phòng họp kế bên kêu rè rè, có người đứng dậy chỉnh.
- am3: Có người hỏi trong nhóm chat ai còn dư sạc laptop.
- am4: Chị lao công đi ngang, hỏi nhỏ bàn bạn có rác cần đổ không.
- am5 (`before: 11:30`): Bot deploy báo "Build module thanh toán #482 đang chạy…"

## timeline (gắn giờ; tách khỏi ambient, A1b)
- **10:30:** f2 thành 12 phàn nàn. Mốc im lặng, không hiện, không cắt hành động.
- **11:30:** (cảnh) "Bot deploy báo 'Build #482 xong'. Lịch nhóm nhắc: 12:30 họp release." Anh An vẫn ngồi máy.
- **Nhịp báo sắp hết giờ** (còn ≤ 6 điểm): (cảnh) "Góc màn hình chỉ gần trưa, nhóm chat bắt đầu hỏi ai đặt cơm."
- **Sự kiện cho lời hứa theo sự kiện** (A1b, D5): `su_kien.staging_ok` (log staging lần đầu ra nhánh nhanh), `su_kien.duyet` (anh An duyệt; thường ở n3, lúc đó lời hứa chuyển sang "Nhìn lại ca").
- **Lời hứa** (A1b): lời hứa theo giờ kiểm ở mốc + 1 điểm; lời hứa theo sự kiện kiểm 1 điểm sau sự kiện. Chưa giữ thì người được hứa nhắc qua kênh đã hứa:
  - support, kênh chat: (lo_lang) "Em ơi, tới giờ em hẹn rồi nè 😥"
  - support, kênh gọi: (lo_lang) "Alo em ơi, 11 rưỡi rồi nè, bên đó sao rồi em?"
  - Biến thể khi người chơi đã nhắn #su-co sau lúc hứa: chị Linh mở bằng (lo_lang) "Chị thấy em nhắn bên #su-co rồi, mà chị chờ em báo nè." rồi hỏi như trên; nếu tin #su-co có nói tình hình thì chỉ hỏi phần chị cần nói với khách: "Giờ chị nói khách sao em?"
  - Bật cờ `tre_hen`.

## Nút (lõi theo thứ tự: n0 → n1 → n2 → n3)
### n0 · nút mở, 9:40, mentor, chat (0 điểm)
1. (lo_lang) "Em ơi, API lịch sử đơn chậm từ 8 giờ, 0,2 giây lên hơn 4 giây. Chắc DB quá tải giờ cao điểm."
2. (binh_thuong) "Anh đang dí release thanh toán 2 giờ chiều, em coi giùm, trưa có hướng xử lý báo anh nha."
3. (binh_thuong) "À, đụng production thì nhắn #su-co trước, anh duyệt rồi mới lên. Đừng hứa giờ với khách khi chưa chắc nha."

Người chơi đáp tự do (không chấm). AI-4 viết 1–2 nhịp đáp của anh An.

### n1 · nút giữa, 10:50, support gọi điện, chen ngang (1 điểm)
- **core:** chị Linh đòi một giờ chắc chắn để hứa với khách.
- **adapt** (xét từ trên xuống; lời adapt không nói trước ý của phương án):
  1. Nếu `support_biet_tim_ra_loi` và `hua_bao_lai`:
     - (lo_lang) "Alo em ơi, chị Linh nè. Em nói tìm ra lỗi rồi, chị báo khách là đang sửa rồi đó."
     - (kho_chiu) "Mà Minh Phát hổng chịu chờ nữa, họ nói trưa còn lag là huỷ hợp đồng luôn."
     - (lo_lang) "Chị nói với họ trưa xong được hông em?"
  2. Nếu chỉ `support_biet_tim_ra_loi`:
     - (vui) "Alo em ơi, nghe em nói tìm ra lỗi rồi chị mừng quá."
     - (lo_lang) "Mà Minh Phát nói trưa còn lag là huỷ hợp đồng luôn á."
     - (lo_lang) "Chị nói với họ trưa xong được hông em?"
  3. Nếu chỉ `hua_bao_lai`:
     - (lo_lang) "Alo em ơi, chị Linh nè. Chị biết em đang coi, mà khách hối quá."
     - (kho_chiu) "Minh Phát nói trưa còn lag là huỷ hợp đồng luôn."
     - (lo_lang) "Chị nói với họ trưa xong được hông em?"
  4. Mặc định:
     - (lo_lang) "Alo em ơi, chị Linh bên hỗ trợ nè. Khách sỉ Minh Phát gọi chị nãy giờ á."
     - (kho_chiu) "Họ nói trưa mà còn lag là huỷ hợp đồng luôn."
     - (lo_lang) "Chị nói với họ trưa xong được hông em?"
- **format:** chọn có đếm giờ, 30 giây. Phương án, reaction và sets giữ như bản 3:
  - a → `hua_bao_lai@11:30`; nếu đã có lời hứa cùng giờ thì gộp làm một.
  - b → `hua_chac_trua`.
  - c → không bật cờ.
  - Hết giờ: như bản 3.
- Sau reaction: người chơi nói thêm 1 lượt tự do trong cuộc gọi, đã tính trong 1 điểm của nút. Bộ phán kiểm lại các cờ hội thoại với support.

### n2 · nút giữa, bấm "Chốt nguyên nhân" (hiện sau n1) hoặc fallback 11:20, mentor, chat (1 điểm)
- **core:** ghi nguyên nhân kèm bằng chứng vào ghi chú sự cố và đánh dấu giả thuyết.
- **Lời dẫn (adapt), chỉ khi fallback:**
  - Có `nguyen_nhan_da_noi_voi_mentor`: (binh_thuong) "Em ghi giùm anh cái ghi chú sự cố nha, chiều anh dán vào báo cáo."
  - Mặc định: (suy_nghi) "Em ơi, chốt được nguyên nhân chưa? Ghi vào ghi chú sự cố cho anh coi với."
- **reaction:** (suy_nghi) "Anh coi ghi chú rồi nè." Sau đó AI-4 viết tối đa 1 nhịp xác nhận hay bác bỏ điều anh biết (f7, f8). Không nhắc `rui_ro_production`, vì khúc mắc này đang giấu (A13).
- **probe** (by mentor, hướng "vì sao"). Hook xét theo thứ tự; hook có `answered_if` đã bật thì bỏ qua (A7, D4); hết hook thì không hỏi:
  - Có `nguyen_nhan_da_noi_voi_mentor`:
    1. hook "anh An cần ghi vào báo cáo vì sao loại khả năng DB quá tải, điều chính anh từng tin; hỏi em lấy gì để loại" · `answered_if: da_loai_db_bang_chung`
    2. hook "anh An thấy ghi chú còn mấy khả năng chưa đánh dấu; hỏi chung em loại mấy cái còn lại bằng gì. **Không nêu tên khả năng nào**" (A7, D5) · `answered_if: gc.h4`
  - Mặc định:
    1. hook "anh An cần chắc trước khi cho sửa; hỏi em dựa vào đâu giữ hay loại một giả thuyết" · `answered_if: da_loai_db_bang_chung`
    2. như hook 2 ở trên.

### n3 · nút kết, bấm "Gửi anh An" (hiện sau n2) hoặc 12:00, mentor, chat (1 điểm)
- **Lời dẫn:** trigger theo giờ thì (binh_thuong) "Trưa rồi nè em, gửi anh hướng xử lý nha." Người chơi bấm thì không có lời dẫn; trước 12:00 thì hiện hộp xác nhận E7.
- **format:** email_an.
- **reaction:** AI-4 viết 1–2 nhịp. Khúc mắc `rui_ro_production` mở ra từ nút này. Anh An không khen chê.
- **probe** (by mentor, hướng "nếu… thì sao"):
  - Có `email.co_cach_kiem` và `email.co_rollback`: hook "anh An sắp duyệt; hỏi một tình huống xấu khác sau khi lên production, ví dụ khách nhiều đơn hơn hay app cũ".
  - Mặc định: hook "anh An chưa thấy cách kiểm hay cách lùi lại; hỏi nếu lên production rồi lỗi thì em làm gì".
- **Sau probe** (A13, D4): xét `rui_ro_production` trên cả nút. Đã gỡ thì anh An duyệt. Chưa gỡ thì anh hoãn và nói lý do bằng nỗi lo của mình ("để anh coi kỹ đã"), không dặn cách làm.

### Nhìn lại ca (sau n3; A7, D4)
Mỗi mục bật theo cờ, xét theo thứ tự, tối đa 2 mục:
- `tre_hen` · by support, chat · hook "chị Linh đã chờ tin lúc hẹn mà không thấy, phải tự gọi; hỏi lúc đó em kẹt gì".
- lời hứa còn treo khi hết màn, theo giờ hay theo sự kiện · by support, chat · hook "chị Linh vẫn đang chờ tin em hẹn; hỏi giờ chị nói sao với khách".
- `hua_chac_trua` · by support, chat · hook "khách đã nghe chị hứa trưa xong; hỏi nếu trưa chưa lên được thì chị nói sao".
