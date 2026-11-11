# Seed scenario JobQuest: một màn chơi được soạn thế nào

File này ghi các quyết định đã chốt qua buổi walkthrough seed (27/10 đến 4/11). Buổi đó dựng lại seed từ đầu, chốt từng mục một. Một **seed** là khuôn để sinh ra một **màn chơi**. Seed giữ phần cố định: việc chính, sự thật, các nút canon, cách chấm. AI-4 (dẫn truyện) chỉ viết lời nối và lời NPC trong giới hạn của seed. AI-5 (judge) chấm riêng và không bao giờ đọc lời của AI-4 làm chuẩn. Mọi quyết định bám theo game design D-104 đến D-126.

## Cách đọc file này

- File chia theo khối, theo đúng thứ tự đã chốt: **1** (một màn là gì), **A** (định danh và vai), **G** (gói cấp, công ty, onboard), **B** (bối cảnh và fact sheet), **C** (cast và NPC), **D** (luồng màn), **E** (chấm), **M** (mini note).
- Mỗi khối ghi **đã chốt** hoặc **chưa chốt**. Phần chưa chốt và hàng chờ nằm ở cuối file.
- Ví dụ xuyên suốt là màn Back-end L3 **"Sự cố hệ thống giờ cao điểm!"**: API lịch sử đơn chậm giữa giờ cao điểm, nguyên nhân là lỗi N+1.
- Lời thoại mẫu trong file viết theo văn nói, nhưng **cần một người viết bản ngữ audit** trước khi dùng thật.
- Các con số (số lượt, số điểm thời gian, cỡ fact sheet, trọng số hint) đều là số tạm, chỉnh sau khi chơi thử.

**Trạng thái (4/11):** khối 1, A, G, B, C, D và phần 1 của khối E đã chốt. Phần 2 của khối E (thư viện câu hỏi có/không và cờ chung) mới có bản nháp. Các phần kết cục, sự kiện ngẫu nhiên, vòng đời seed và quy trình soạn chưa bàn.

## Bức tranh chung

| Khối | Một dòng |
|---|---|
| **1. Một màn** | Một việc chính, 1–2 keyword trọng tâm, 10–15 phút, tự đủ kiến thức, diễn giải bằng lời thường |
| **A. Định danh và vai** | `id`, `level_ref`, `title`, `task_ref`, `focus_keywords`, `situation_type`; `player_role`; giới hạn riêng của màn (`limits`), nói qua lời dặn |
| **G. Gói cấp và công ty** | Mỗi cấp random một công ty theo tỉ lệ thật của ngành; công ty đổi màu sắc, không đổi thế nào là làm tốt; onboard 6 slide |
| **B. Bối cảnh và fact sheet** | `situation`, `goal`, `stakes`, `clock`, `glossary`, `difficulty`; `facts[]` có điều kiện mở, `artefacts[]`, luật "chưa rõ" |
| **C. Cast và NPC** | Seed khai vai (2–6 slot), không khai người; NPC chỉ biết trong vai; thoại chia nhịp, mỗi nhịp một biểu cảm |
| **D. Luồng màn** | Pha xử lý tốn điểm thời gian và nút canon tuyến tính; định dạng chọn theo bảng; không minigame |
| **E. Chấm** | Mỗi màn quan sát 3–6 mục con; thang 0/1/2 cộng cờ cho mọi định dạng; judge trả lời câu hỏi có/không |
| **M. Mini note** | Tự ghi dữ kiện đã mở; người chơi tự ghi chú; tìm kiếm xuyên kênh |

## Khối 1 · Một màn là gì (đã chốt)

> **Một màn là một tình huống công việc trọn vẹn, dài 10–15 phút, xoay quanh một việc chính của cấp. Màn cho người chơi trải nghiệm 1–2 keyword trọng tâm, và tự mang theo mọi kiến thức cần để trả lời.**

- **Không phải "một ngày nhiều việc".** Mỗi cấp chỉ có khoảng 3 việc đặc trưng (`occupation_profiles.json`, `daily_work`). Gom nhiều việc vào một màn thì 1–2 màn là hết việc của cả cấp.
- **Nét riêng đến từ tổ hợp** việc chính × keyword trọng tâm × loại tình huống. Không cần thêm field riêng cho "nét riêng". Có ba kiểu khác nhau:

  | Khác nhau giữa | Cơ chế | Cố định trong seed? |
  |---|---|---|
  | Các màn cùng cấp | Tổ hợp việc × keyword × loại tình huống khác nhau | Có |
  | Các màn khác cấp | Cùng việc nhưng vai và quyền khác theo cấp (tự làm → hướng dẫn → quyết cho team) | Có |
  | Các lần chơi lại | Biến thể lời, công ty random, sự kiện ngẫu nhiên, lời AI-4 | Không |

- **Hai luật kiểm trùng khi soạn:**
  - *Cùng cấp:* không có hai màn trùng cả việc chính lẫn loại tình huống; cặp keyword trọng tâm phải khác nhau.
  - *Khác cấp:* dùng lại việc được, nhưng vai của người chơi phải khác.
- **Màn tự đủ kiến thức.** Chấm cách xử lý (soft skill), không chấm kiến thức có sẵn. Ví dụ không hỏi "lỗi này tên là gì". Màn cho log ghi "hỏi cơ sở dữ liệu 901 lần" rồi hỏi "bạn làm gì tiếp?". Khớp D-84 và D-114.
- **Diễn giải bằng lời thường:** thuật ngữ đi kèm lời giải thích; con số kèm mức so sánh ("thường 0,2 giây, sáng nay 4 giây"); mục tiêu nói thẳng ra.

## Khối A · Định danh màn và vai người chơi (đã chốt)

### A1 · Định danh

| Field | Thay cho | Ghi chú |
|---|---|---|
| `id` | key `SWE_BACKEND_L3_S_INCIDENT` | `NGHỀ.CẤP.mN`, ví dụ `SWE_BACKEND.L3.m2`. Phiên bản để ở field riêng |
| `level_ref` | `job.*` | Trỏ tới gói cấp; chức danh, kinh nghiệm, phạm vi việc chung lấy từ đó |
| `title` | `scenario_title` | Tên màn, xem luật đặt tên |
| `task_ref` | `context.task` | Việc chính, ghi cả cấp lẫn số thứ tự trong `daily_work`, ví dụ `L3#3`. Trỏ sang việc của cấp khác được |
| `focus_keywords` | `skills_hard` | 1–2 keyword ESCO, lưu bằng mã. Tạm chọn trong 10 keyword của nghề (xem hàng chờ H1) |
| `situation_type` | `scenario_archetype` | Giữ 6 loại và luật mở dần theo cấp (D-22); nghề ngoài IT xét theo `band_equivalent` (D-117) |

**Bỏ:** `shortname`, `takeaway` (nội dung chuyển vào kết cục và phần nhận xét), `estimated_minutes` (máy tự tính từ số bước và loại câu hỏi, sau này thay bằng trung vị thời gian chơi thật).

**Luật đặt tên màn:**
1. Nói thẳng tình huống; đọc tên là biết màn về việc gì.
2. Thêm độ căng bằng cách chọn từ (sự cố, gấp, giờ cao điểm, trước hạn…). Tình huống gấp dùng **một** dấu "!".
3. Lời thường, không thuật ngữ khó, không lộ cách giải.
4. Khoảng 3–8 từ, vì tên in thẳng lên bản đồ.
5. Không trùng tên trong cùng một nghề.

Ví dụ: *Sự cố hệ thống giờ cao điểm!* · *Thiết kế dữ liệu cho tính năng mới* · *Review code gấp trước giờ release!*

### A2 · Người chơi là ai, được quyết gì

- **Thông tin của cấp** (chức danh, kinh nghiệm, phạm vi việc chung) nằm ở gói cấp và được kể ở màn onboard. Seed không chép lại.
- **`player_role`:** 1–3 câu, chỉ nói về người chơi: đang phụ trách gì, liên quan thế nào tới chuyện sắp xảy ra, báo cáo cho ai. Không lặp phần `situation`.
- **`limits`:** giới hạn riêng của màn. Chỉ AI-4 đọc, để NPC nói trước sau như một và chặn đúng trong vai. Người chơi nghe các giới hạn này qua lời dặn ở nút mở, không phải đọc danh sách. Người chơi chỉ thấy một lớp quyền, để tránh rối giữa quyền của cấp và quyền của màn.

```jsonc
"limits": {
  "decide_alone":  ["Xem log", "Viết và test bản sửa"],
  "need_approval": [{ "action": "Đưa bản sửa lên hệ thống thật", "approver": "mentor" }],
  "not_allowed":   ["Hứa giờ xong với khách"]
}
```

**Luật công bằng:** mọi mục trong `need_approval` và `not_allowed` phải được nói ra trong lời dặn hoặc lời thoại của màn. Không chặn hay gắn cờ người chơi vì một giới hạn họ chưa từng nghe.

**Dữ liệu người chơi đưa cho AI-4:**

| Dữ liệu | Xử lý | Lý do |
|---|---|---|
| Tên gọi hoặc biệt danh | AI-4 viết chỗ giữ tên (`{ten}`), server thay tên sau | NPC gọi tên được mà tên không rời Việt Nam (D-110, §5.3.6) |
| Câu trả lời trong màn | Gửi, sau khi khử định danh | AI-4 phải đáp lại |
| Thẻ mục tiêu | Gửi, sau khi khử định danh | D-109: chỉ nhắc lại lời người chơi để động viên |
| Ngày sinh, email, số điện thoại, trường | Không gửi | Không cần cho dẫn truyện |
| Cung hoàng đạo | Không gửi | D-113 |
| Điểm soft skill, RIASEC, lịch sử chơi | Không gửi | Cá nhân hoá để sau (H5) |
| Giới tính | Không có trong hệ thống | NPC xưng "em" hoặc "bạn"; không đoán giới tính từ tên |

`player_role` cố định trong seed, không đổi theo lịch sử chơi, để hai người cùng chơi một màn nhận cùng một đề.

## Khối G · Gói cấp, công ty và màn onboard (đã chốt)

**Random công ty:**
- Vào một cấp: random một công ty theo **tỉ lệ thật của ngành**. Trọng số lấy từ `occupation-data/decisions/occupation_work_environments.csv`; 157/221 nghề có trọng số tạm, ghi `weight_status = tam_thoi`.
- Xong cấp: được random lại công ty và chơi lại cấp đó. Điểm giữ kết quả cao nhất, chỉ cộng phần chênh (D-119).
- Sang cấp mới: chọn ở lại công ty cũ (onboard "ngày nhận vị trí mới") hoặc random (onboard "ngày đầu ở công ty mới").
- **Không** chia tỉ lệ công ty tốt/xấu theo kết quả chơi, **không** có thư mời để chọn công ty. Có quyền chọn thì ai cũng chọn công ty tốt nhất, và người chơi giỏi sẽ không bao giờ thấy mặt xấu của nghề.

**Hồ sơ công ty đưa thẳng cho AI-4.** Thông tin công ty không phải dữ liệu cá nhân, nên không cần chỗ trống. Hai hệ quả:
- Lời canon trong seed viết không gắn công ty cụ thể ("app của công ty", không ghi tên sản phẩm).
- Luật R1 (số và tên riêng phải có nguồn) thêm một nguồn: hồ sơ công ty đang được random.

**Luật chặn cho bối cảnh công ty:**
- Công ty **được đổi** lời thoại, nhịp việc, áp lực, chế độ làm việc, văn hoá, thái độ NPC. Đây là chất riêng của mỗi lần chơi lại.
- Công ty **không được đổi** thế nào là làm tốt: khoá chấm, mục con đang quan sát, phạm vi hậu quả theo cấp.
- Màn nào có đáp án đúng phụ thuộc văn hoá công ty (ví dụ ngân hàng bắt buộc qua phê duyệt) thì khai `fits`: những loại hình công ty màn hợp. Hệ thống chỉ random trong các loại hình hợp với mọi màn chính của cấp.

**Gói cấp (sân khấu chung):**

| Field | Nội dung |
|---|---|
| `company` | Từ kho công ty hư cấu theo loại hình; không dùng tên công ty hay sản phẩm thật |
| `workplace` | Mã loại nơi làm (`work_settings.json`) và loại hình chi tiết (`work_environments.json`, 110 loại hình, 12 thuộc tính, gồm `shifts`, `workweek`, `overtime`) |
| `team` | Team làm gì, người chơi đứng ở đâu |
| `resident_npcs` | Các slot NPC thường trực của cấp |
| `level_scope` | Chức danh, kinh nghiệm, phạm vi việc chung (từ dữ liệu nghề) |
| `rules` | 2–3 quy định thật; quy định công ty ở hồ sơ công ty, quy định nghề (an toàn, bảo mật) ở gói cấp |
| `honest_note` | Mặt không hay của vị trí này (BR-07) |
| `shared_facts` | Sự thật dùng chung cho mọi màn của cấp |
| `hr_open`, `hr_close` | Câu mở và câu kết của HR |

**Màn onboard:** slide dựng tự động từ gói cấp. HR chỉ nói câu mở và câu kết, phần còn lại hiện trên slide. Không gọi AI, không chấm, không tính vào số màn chính, xem lại được. Sáu slide, rà theo khung 4C của onboarding (Bauer 2010, SHRM Foundation):

| # | Slide | Khung |
|---|---|---|
| 1 | Chào mừng: công ty, sản phẩm, khách hàng, cách mọi người làm việc với nhau | Culture |
| 2 | Một ngày ở đây: giờ làm, nhịp việc, nơi làm, 3 việc thường ngày | Xem trước công việc trung thực |
| 3 | Những người bạn sẽ gặp | Connection |
| 4 | Vai của bạn: chức danh, phạm vi, ai duyệt việc, thế nào là làm tốt, cấp này luyện keyword và nhóm soft skill nào | Clarification |
| 5 | Quy định cần giữ (`rules`) | Compliance |
| 6 | Điều nên biết trước (`honest_note`) | Xem trước công việc trung thực |

Quy định đã nói ở slide 5 thì về sau làm trái mới bị gắn cờ (luật công bằng).

## Khối B · Bối cảnh màn và fact sheet (đã chốt)

### B1 · Bối cảnh

| Field | Nội dung | Ai đọc | Căn cứ |
|---|---|---|---|
| `situation` | Chuyện gì đang xảy ra: 2–4 câu, lời thường, không gắn công ty, con số kèm mức so sánh; không lặp `player_role` và `limits` | Người chơi, AI-4 | INACSL 2021, tiêu chí 5 |
| `goal` | Việc của bạn: 1 câu, nói rõ khi nào là xong, không lộ cách giải; hiện suốt màn ở dải mục tiêu | Người chơi, AI-4 | Mislevy, Almond & Lukas 2003 (task model) |
| `stakes` | Hỏng thì mất gì, phạm vi hợp với cấp (L1–L2: việc của mình; L3–L5: một tính năng, một nhóm khách; L6+: cả team, doanh thu) | Người chơi, AI-4 | Flanagan 1954 (critical incident) |
| `clock` | Giờ bắt đầu, hạn chót, ngân sách điểm thời gian, mốc phụ | Người chơi, AI-4 | Gộp để chỉ còn một nguồn giờ giấc |
| `glossary` | 3–5 thuật ngữ, mỗi thuật ngữ một câu lời thường; chạm vào chữ thì hiện | Người chơi | INACSL 2021, tiêu chí 8 |
| `difficulty` | 4 biến × 3 mức: độ mơ hồ, số bên liên quan, thông tin bị thiếu, áp lực giờ | Người soạn, máy kiểm | Mislevy 2003 (task model variables) |
| `honest_detail` | Tuỳ chọn: một chi tiết khó chịu có thật của nghề | AI-4 | INACSL 2021, tiêu chí 6 |

**Luật:**
1. Đồng hồ nằm trong giờ làm của công ty được random. Màn ngoài giờ (sự cố 2 giờ sáng) thì khai `fits` là loại hình có trực on-call.
2. Mọi con số và tên riêng trong `situation`, `stakes`, `honest_detail` phải có trong fact sheet. Máy kiểm.
3. `difficulty` không đưa cho AI-4. Các màn cùng cấp phải có độ khó tương đương, và độ khó tăng dần theo cấp. AI-4 không được tự chỉnh khó dễ.

```jsonc
"situation": "API xem lịch sử đơn chậm hẳn từ 8 giờ sáng: bình thường trả về trong 0,2 giây, giờ mất hơn 4 giây. Hệ thống chưa sập, nhưng app cứ quay mãi và bộ phận hỗ trợ bắt đầu nhận phàn nàn. API này do chính bạn viết ba tuần trước.",
"goal": "Tìm ra vì sao API chậm và báo anh An hướng xử lý.",
"stakes": "Chưa mất tiền, nhưng nếu tới trưa vẫn chậm thì đơn đặt giờ cao điểm sẽ rớt.",
"clock": { "start": "Sáng đầu tuần, 9:40", "deadline": "12:00", "time_points": 12, "milestones": [] },
"glossary": [{ "term": "Log", "plain": "Nhật ký máy chủ tự ghi lại mọi việc nó làm, dùng để tra lỗi." }],
"difficulty": { "ambiguity": "thấp", "stakeholders": "vừa", "missing_info": "vừa", "time_pressure": "cao" }
```

### B2 · Fact sheet

Fact sheet là nguồn duy nhất cho mọi chi tiết cụ thể của màn. AI-4 dựa vào nó để không bịa; NPC dựa vào nó để trả lời; luật R1 kiểm dựa trên nó; đo được "giữ đúng sự thật bắt buộc" (RP-1).

| Trường của `facts[]` | Nghĩa |
|---|---|
| `id` | Mã dữ kiện; cũng là mã mini note dùng để tự ghi |
| `text` | Một câu khẳng định, lời thường |
| `values` | Con số và tên riêng tách ra cho máy kiểm R1 |
| `visibility` | `shown` (nói sẵn) · `on_ask` (lộ khi đạt điều kiện mở) · `ai_only` (AI biết để giữ nhất quán, không nói thẳng) |
| `unlock` | Điều kiện mở: hỏi slot nào, kiểu câu hỏi nào, hoặc mở tài liệu nào (thay cho `where`) |
| `form` | Lộ theo ba nấc: gợi ý mơ hồ → một phần → đầy đủ khi người chơi hỏi tiếp |
| `layer` | Chỉ cho dữ kiện của slot khách hàng: L1–L4 (khối C) |
| `known_by` | Slot nào biết. Ghi rõ, không để AI tự suy |
| `required` | Sự thật bắt buộc giữ đúng |
| `timeline` | Tuỳ chọn: dữ kiện đổi theo đồng hồ, ví dụ số phàn nàn tăng dần |

- **`artefacts[]`:** tài liệu mở được trong màn (log, email, ticket, bảng số liệu), viết sẵn, hiện nguyên văn như canon, mỗi tài liệu có `visibility` riêng. Tài liệu hiện như thật và bấm được (khối D).
- **Luật "chưa rõ":** hỏi điều không có trong fact sheet, hồ sơ công ty hay gói cấp thì NPC trả lời trong vai là chưa biết, hoặc nói chung chung không kèm số và tên.
- **Ba tầng nguồn sự thật**, mỗi sự thật chỉ nằm một tầng: hồ sơ công ty · gói cấp (`shared_facts`) · fact sheet của màn.
- **Cỡ:** khoảng 8–20 dữ kiện mỗi màn (ước lượng).
- **Mỗi hành động của người chơi mở tối đa một dữ kiện mới**, dù có bao nhiêu NPC cùng nói. Lý do: simulator dùng LLM hay đưa đủ thông tin quá sớm (Zhou và cộng sự 2026, preprint).

| id | text | visibility | unlock / known_by | required |
|---|---|---|---|---|
| f1 | API lịch sử đơn chậm từ 8:00: thường 0,2 giây, giờ hơn 4 giây | shown | — | ✓ |
| f2 | Bộ phận hỗ trợ đã nhận 3 phàn nàn (sau 6 điểm thời gian: 12) | shown, có timeline | support | |
| f3 | API do bạn viết ba tuần trước, mentor review | shown | mentor | ✓ |
| f4 | Sáng nay có một khách sỉ với 900 đơn trong lịch sử | on_ask | mở bảng số liệu | ✓ |
| f5 | Mỗi lần mở lịch sử đơn, hệ thống hỏi cơ sở dữ liệu 901 lần | on_ask | mở log | ✓ |
| f6 | Mentor đang gấp release module thanh toán lúc 14:00 | on_ask | hỏi mentor về lịch | |
| f7 | Nguyên nhân: lấy chi tiết từng đơn trong một vòng lặp | ai_only | mentor | ✓ |
| f8 | API không giới hạn số đơn trả về | ai_only | mentor | |

## Khối C · Cast và NPC (đã chốt)

### C1 · Seed khai vai, không khai người

Hệ thống NPC kiểu confidant và tarot của *Persona* thiết kế ở báo cáo `Kinh tế và sức khoẻ JobQuest.md` (22 lá, 6 lá mở sẵn). Nhân vật có hồ sơ, tính cách, giọng nói, trang phục riêng; tên và trang phục đổi theo công ty, vai giữ nguyên. Seed màn chỉ khai **slot**, đến lúc chơi hệ thống điền nhân vật vào.

| Field của slot | Nghĩa |
|---|---|
| `slot` | Mã vai trong màn, ví dụ `mentor`. Mọi chỗ trỏ tới NPC (`limits`, `known_by`, lời canon) đều dùng mã này |
| `relation` | Cấp trên trực tiếp, ngang hàng, cấp dưới, khách hàng, phòng ban khác |
| `source` | `resident` (thường trực của cấp, đã giới thiệu ở onboard) · `guest` (chỉ có trong màn này) |
| `fill` | Kiểu điền: cố định, random hay người mới; gắn lá tarot khi cố định. Tên `fill` để khỏi trùng `slot` |
| `want` | NPC muốn gì trong màn |
| `pressure` | Điều khiến NPC không rảnh giúp |
| `stance` | Thái độ với người chơi trong màn này |
| `concerns[]` | Khúc mắc của NPC, mỗi cái có `resolve_when` (xem D4) |
| `default_channel` | Gặp trực tiếp, chat hay gọi điện; bước nào khác thì ghi đè |
| `expertise` | Mức hiểu biết theo lĩnh vực, 0–3; mức 0–1 nói lời đời thường |
| `beliefs[]` | Phỏng đoán sai nhưng hợp lý của NPC |
| `disclosure_style` | Nói thẳng, ngại nói, hay phòng thủ |

**Luật soạn:** 2–6 slot mỗi màn; có ít nhất một slot `resident`; `want` của các slot kéo về các hướng khác nhau, để có lựa chọn khó mà không cần bịa thêm sự cố.

### C2 · NPC chỉ biết trong vai

Các nghiên cứu LLM nhập vai (Character-LLM, EMNLP 2023; TimeChara, Findings ACL 2024) cho thấy model hay "biết nhiều hơn nhân vật", và chỉ dặn "đừng tiết lộ" là không đủ.

1. **Engine lọc ngữ cảnh theo NPC.** Người chơi chọn nói với ai, qua kênh nào. Engine chỉ đưa vào prompt các dữ kiện NPC đó biết, cộng những gì người chơi đã thấy. NPC không biết nguyên nhân thật thì AI-4 cũng không có nó trong tay khi đóng NPC đó. Việc lọc là luật trong code, không tốn thêm lượt gọi model.
2. **NPC không biết thì đoán như người thường**, dựa vào `expertise` và `beliefs`. Mọi điều NPC nói phải truy được về `known_by` hoặc `beliefs`; không có thì nói "mình không rõ". LLM được huấn luyện để trả lời hay nhất nên rất khó đóng người kém hiểu biết (Wu và cộng sự, ACL 2025, bằng chứng gián tiếp).
3. **NPC biết thì chỉ lộ khi được hỏi đúng, và lộ dần** theo `unlock` và `form`.
4. **Khách hàng không tự biết mình cần gì.** Dữ kiện của slot khách chia lớp (khung "đã biết, ngầm, chưa biết" của Sutcliffe & Sawyer, RE 2013; chia 4 lớp là đề xuất của nhóm):

   | Lớp | Lộ khi nào |
   |---|---|
   | L1 nêu sẵn | Khách nói ngay, thường là một giải pháp ("làm cho tôi nút X") |
   | L2 | Hỏi đúng chủ đề, hỏi lại "vì sao" |
   | L3 ngầm | Hỏi theo tình huống cụ thể, hoặc xem quy trình thật |
   | L4 chưa ai biết | Chỉ khi người chơi đưa ra phương án và khách phản ứng |

   Khách được nói mâu thuẫn giữa các lớp; người chơi phát hiện ra mâu thuẫn là hành vi được chấm.
5. **Theo kênh** (suy luận từ media richness, Daft & Lengel 1986, cần thử): gặp trực tiếp thì xem được tài liệu, thấy cảm xúc, nhu cầu ngầm dễ lộ nhất; chat thì ngắn, hay bỏ sót câu hỏi ghép, số liệu và file rõ ràng; gọi điện thì hay nói ước chừng, cần số chính xác thì hẹn nhắn lại.
6. **NPC nói chuyện với nhau, người chơi nghe.** Dữ kiện của từng NPC vẫn tách riêng trong prompt. Điều được nói ra thì người chơi và mọi NPC có mặt đều biết, mini note tự ghi. Cuộc trò chuyện nhiều người do nút canon mở, hoặc do người chơi mở (gọi họp, nhắn nhóm chat), và tốn điểm thời gian như một hành động. Lời NPC nói với nhau chỉ là bối cảnh cho judge.

### C3 · Lời thoại: nhịp và biểu cảm

- **Đơn vị nhỏ nhất là nhịp (beat).** Mỗi lượt nói gồm nhiều nhịp, mỗi nhịp một ý, 1–2 câu, khoảng 2 dòng hộp thoại.
- **Ngắt ở chỗ người thật sẽ ngừng:** chuyển ý, đổi cảm xúc, ngay trước một con số hay tin quan trọng, khi bị chen ngang. Câu hỏi dành cho người chơi luôn là nhịp cuối, đứng riêng.
- **Không giới hạn số nhịp.** Không có trường `pause`. Ở cả ba kênh, người chơi bấm để qua nhịp. Gọi điện hiện giống gặp trực tiếp; chat hiện từng bong bóng.
- **Biểu cảm theo từng nhịp**, chọn trong bộ khoảng 8 biểu cảm có asset (bình thường, vui, cười lớn, ngạc nhiên, suy nghĩ, lo lắng, khó chịu, buồn). Đầu ra ép theo JSON schema, sai thì về "bình thường". Biểu cảm theo tính cách và nội dung truyện, **không theo đúng hay sai so với khoá chấm**. Asset vẽ tách lớp mặt và lớp trang phục.
- **Lời viết theo văn nói**, giọng vùng miền khai trong hồ sơ nhân vật. Có nút hiện hết nhịp và lịch sử thoại để xem lại.
- AI-4 trả nhịp theo danh sách, nên app hiện được nhịp đầu trong lúc model còn sinh các nhịp sau (NFR-01).

```jsonc
{ "speaker": "support", "channel": "call",
  "beats": [
    { "text": "Alo em ơi, chị Linh nè.", "expression": "lo_lang" },
    { "text": "Khách sỉ gọi chị nãy giờ á.", "expression": "lo_lang" },
    { "text": "Họ nói trưa mà còn lag là huỷ đơn luôn.", "expression": "kho_chiu" },
    { "text": "Chị hứa với họ trưa xong được hông em?", "expression": "lo_lang" }
  ] }
```

## Khối D · Luồng màn (đã chốt)

### D1 · Pha xử lý và nút canon

| Khối | Là gì | Ai viết lời | Chấm |
|---|---|---|---|
| **Pha xử lý** | Người chơi tự do: hỏi NPC nào, qua kênh nào, mở tài liệu nào, tự mô tả việc mình làm. Tốn điểm thời gian, đồng hồ chạy | AI-4, trong giới hạn fact sheet | Judge đọc cả transcript của pha |
| **Nút** (canon) | Sự kiện cố định do seed viết sẵn, kèm một câu hỏi theo 1 trong 9 định dạng | Người soạn viết lõi, AI-4 chỉ viết lời nối | Chỗ chấm chính |

- Mỗi màn có **nút mở** (dặn dò bằng trò chuyện: mục tiêu, luật hôm nay, giới hạn), 1–2 pha xử lý, 1–3 nút giữa, **nút kết** (nộp kết quả).
- **Ba cách bật nút:** theo giờ (đồng hồ tới mốc, chỗ đặt câu đếm giờ), theo người chơi (bấm "Chốt…"), theo dữ kiện (mở được dữ kiện X).
- **Lõi tuyến tính:** mọi người chơi gặp cùng các nút với cùng nội dung lõi (D-67, D-89), nên điểm so sánh được. Lựa chọn trước chỉ đổi **biến thể lời** (`variants`) của nút sau và kết cục. **Phần xử lý giữa các nút linh hoạt**: người chơi đi đường nào cũng được, judge chấm hành vi chứ không so với lộ trình đúng.

| Thời điểm | Khối | Nội dung |
|---|---|---|
| 9:40 | Nút mở | Mentor nhắn: API chậm, trưa phải có hướng xử lý; đụng gì trên production thì nhắn kênh sự cố trước |
| Pha 1 | Pha xử lý | Hỏi support, mở log, mở bảng số liệu, hỏi mentor |
| Khoảng 10:50 | Nút giữa, đếm giờ | Support gọi hỏi có hứa với khách là trưa xong không |
| Pha 2 | Pha xử lý | Tiếp tục điều tra |
| Người chơi bấm "Chốt nguyên nhân" | Nút giữa | Chọn nhiều: giả thuyết nào đã có bằng chứng |
| Người chơi bấm "Báo anh An", hoặc hết thời gian | Nút kết | Email rút gọn: nguyên nhân, hướng xử lý, rủi ro |

### D2 · Điểm thời gian

Ngân sách của màn tính bằng **điểm thời gian**, đồng hồ hiện theo giờ trong truyện. Nói chuyện tốn ít hơn làm việc.

| Hành động | Điểm |
|---|---|
| Một câu hỏi hay tin nhắn gửi NPC | 1 |
| Mở một tài liệu lần đầu (mở lại thì không tốn) | 1 |
| Việc nhỏ, ví dụ chạy thử truy vấn trên staging | 2 |
| Việc lớn, ví dụ viết bản vá, gọi họp | 3 |
| Trả lời nút và follow-up của nút; viết hay xem mini note | 0 |

- Seed khai các việc hay gặp trong `actions[]`, kèm số điểm. Người chơi tự mô tả việc khác thì AI-4 chỉ được xếp nó vào một trong các loại trên, engine trừ điểm theo bảng.
- Ngân sách = số trong `clock` cộng trừ phần điều chỉnh từ sức khoẻ và vật phẩm, trong phần dự phòng báo cáo kinh tế đã chốt.
- **Hết thời gian = chạm hạn chót.** Nút kết bật ngay, người chơi vẫn nộp với những gì đã có. Không có trạng thái thua.
- **Nút chưa tới mà hết thời gian** (`if_unreached`): không xét, phần quỹ của nút để dành cho lần chơi lại (D-119).

### D3 · Trình bày và định dạng

**Không làm minigame riêng cho từng nghề.** Cái được chấm là cách quyết định; mô phỏng cần tác vụ giống thật hơn là bề ngoài giống thật (Hamstra và cộng sự 2014, *Academic Medicine*). Minigame còn đưa vào phương sai không liên quan tới thứ cần đo (Messick 1995, *American Psychologist*), và 221 nghề thì không làm xuể. Thay bằng:
- hình cảnh lúc mở màn và lúc có sự kiện;
- tài liệu hiện như thật, đọc và bấm được (`artefacts[]`);
- nút hành động gắn vào tài liệu, có ghi số điểm thời gian (`actions[]`);
- thao tác nhẹ trên tài liệu, chính là các định dạng đóng (khoanh dòng log, kéo thả ưu tiên, nối triệu chứng với nguyên nhân).

**Chọn định dạng:** đã cụ thể, biết trước các lựa chọn thật thì dùng định dạng đóng; cần nói chuyện, giải thích, thuyết phục thì dùng tự do. Mọi lời nói với NPC trong pha xử lý luôn là gõ tự do.

| Định dạng (D-80) | Dùng khi |
|---|---|
| Trắc nghiệm một đáp án | Ngoài đời chỉ có vài cách làm rõ ràng, phải chọn một |
| Lựa chọn có đếm giờ | Quyết định gấp, ngoài đời cũng không có thời gian nghĩ |
| Chọn nhiều | Lọc từ một danh sách có sẵn |
| Sắp thứ tự | Cân ưu tiên giữa nhiều việc có thật |
| Ghép cặp | Nối hai cột mà màn đã cho đủ thông tin |
| Đúng/sai | Kiểm một quy định hay sự thật đã nói trong màn |
| Tự luận | Giải thích lý do, đề xuất hướng làm |
| Email rút gọn | Sản phẩm thật là văn bản gửi người khác |
| Code rút gọn | Nghề có viết code, đoạn code đủ ngắn để đọc trong màn |

**Luật soạn mỗi màn:** nút kết luôn là định dạng viết (dữ liệu cho RP-2); có ít nhất 1 nút đóng; tối đa 1 nút đếm giờ (đo trên thiết bị, hết giờ không trừ −1, D-83, D-86); hỏi kiểu "bạn làm gì?" (D-84); đúng/sai và ghép cặp chỉ dùng khi màn đã cho đủ kiến thức; định dạng đóng có lựa chọn đánh đổi thì kèm một câu "vì sao" tự do; thuyết phục không bao giờ dùng định dạng đóng.

### D4 · Follow-up, hint, phản ứng NPC

- **Follow-up không lộ đáp án.** Nút viết khai `deliverable_parts` (người chơi thấy ngay trong đề); trả lời thiếu phần nào thì AI-4 hỏi lại đúng phần đó. Nút chọn 1–2 trong năm **hướng hỏi trung lập** (`probe`): làm rõ, vì sao, nếu… thì sao, ai bị ảnh hưởng, bước tiếp theo. Trần follow-up khai ở gói cấp, thay cho đoạn viết cứng trong `followups.ts`. Cơ sở: phỏng vấn có cấu trúc nên giới hạn và chuẩn hoá câu hỏi thêm (Campion, Palmer & Campion 1997, *Personnel Psychology*).
- **Hint do engine sinh từ trạng thái fact sheet**, không do AI đọc rubric. Bậc 1 nhắc nguồn chưa xem; bậc 2 nhắc dữ kiện đã mở mà chưa dùng; không có bậc nói đáp án. Dùng hint thì bằng chứng giảm trọng số, không chặn tiến độ, không tốn điểm thời gian (D-83, D-86).
- **NPC phản ứng theo sự thật và vai, không theo điểm.** Được xác nhận hay bác bỏ một dữ kiện mình biết; được nói hệ quả đã khai trong `reactions[]` của nút. Không được đánh giá chất lượng lời giải ("hướng này đúng rồi").
- **Thuyết phục theo khúc mắc.** Mỗi NPC có `concerns[]`, mỗi khúc mắc có `resolve_when`. Người chơi gỡ từng khúc mắc thì NPC dịu dần; lời giải không cần đúng 100% như hệ thống thật. AI-4 theo dõi khúc mắc như trạng thái truyện; judge chấm độc lập cách người chơi dẫn dắt và thuyết phục.
- **Chấm theo thông tin lúc quyết định, không theo kết quả.** Seed có thể có diễn biến cả NPC lẫn người chơi đều không biết trước; kết quả xấu do việc không ai lường trước thì không trừ điểm, để tránh outcome bias (Baron & Hershey 1988, *JPSP*). Sau khi kết quả lộ ra, màn có thể thêm một nút để người chơi xử lý tiếp.

### D5 · Trường của một nút

```jsonc
{
  "id": "n2",
  "kind": "mid",                                   // open | mid | end
  "trigger": { "by": "time", "at": "10:50" },      // time | player | fact
  "speaker": "support", "channel": "call",
  "canon": { "setup": [ … ], "npc_line": [ … ], "prompt": "Bạn trả lời chị Linh thế nào?" },   // chia nhịp sẵn
  "variants": [ { "if": "n1.choice == 'b'", "npc_line": [ … ] } ],
  "format": "timed_choice", "time_limit_seconds": 30,
  "options": [ … ],                                // profile từng phương án: khối E
  "deliverable_parts": null,
  "probe": ["vì sao"],
  "reactions": [ … ],
  "if_unreached": "skip",
  "observes": [ … ]                                // khối E
}
```

Trường cũ đổi như sau: `isOrigin` và `forward_to` thay bằng `kind` và `trigger`; `summary` và `choice_reason` gộp vào ghi chú cho người soạn; `hints[]` bỏ khỏi seed (engine sinh); `followup_goal` thay bằng `probe` và `deliverable_parts`; `context.skills_in_play` bỏ (trùng `observes`); `context.job_scope` chuyển thành `limits` ở mức màn.

## Khối E · Chấm

### E1 · Chấm cái gì, ở đâu, theo thang nào (đã chốt)

**1. Mỗi màn khai 3–6 mục con** trong 42 mục con của 7 nhóm, ưu tiên 2 nhóm trọng tâm của cấp (D-114). Mỗi mục con ghi bằng chứng lấy ở đâu (`from`: nút nào, hay cả pha).

```jsonc
"observes": [
  { "sub": "DD.trung_thuc", "from": ["n2", "n4"],
    "signs": { "A": "báo mentor hoặc kênh sự cố trước 12 giờ; không hứa với support khi chưa chắc",
               "B": "thừa nhận API mình viết gọi cơ sở dữ liệu trong vòng lặp",
               "C": "đề xuất thêm test tải, hoặc giới hạn số đơn trả về",
               "not": ["\"Chắc DB có vấn đề\" không phải là nhận lỗi"] } },
  { "sub": "TD.nguyen_nhan", "from": ["pha", "n3"] }
]
```

- **Hai lớp hướng dẫn cho judge.** Lớp chung lấy từ thư viện (viết một lần cho mọi màn, mọi nghề) giữ một chuẩn chấm, nên điểm giữa các màn và các nghề so sánh được. Lớp riêng (`signs`) cho biết A, B, C trông thế nào trong đúng tình huống này.
- **Signs là ví dụ minh hoạ, không phải danh sách đáp án.** Câu hỏi chung quyết định; người chơi nói kiểu gì cũng được, miễn đúng ý. Signs ghi thêm ví dụ **không tính**, để tránh chấm nhầm "có". Cách làm này giống hướng dẫn chấm của PISA: tiêu chí chung kèm câu trả lời mẫu. Màn không có signs thì judge dùng câu hỏi chung.
- **Mỗi chữ "có" phải trích lại câu của người chơi.** Code kiểm câu trích có đúng là lời người chơi không.
- **Chấm theo đoạn bằng chứng**, không theo từng tin nhắn. Với nút: câu trả lời cộng follow-up. Với pha: cả pha. Mỗi đoạn chấm một lần cho mỗi mục con, rồi lấy trung bình.
- **Ca lạ:** hành vi đạt yêu cầu mà signs không lường trước thì vẫn chấm "có" và ghi chú "khác ví dụ". Các ca này gom cho người soạn bổ sung signs. Ca judge không chắc thì các judge khác trong panel AI-5 cùng xét.
- `observes` và `signs` **AI-4 không bao giờ thấy**; AI-5 thấy; người chơi chỉ thấy sau màn, trong phần nhận xét. `skills_hard`, `skills_soft` cũ bỏ, chip kỹ năng suy ra từ `observes`. Keyword không chấm theo màn (D-114).

**2. Một thang duy nhất: 0 / 1 / 2 cộng cờ** (D-116) cho cả câu đóng lẫn câu viết. Thang D-87 gộp vào: +2 → 2, +1 → 1, 0 → 0, −1 → 0 cộng một cờ.
- Profile phương án câu đóng (D-81, D-82): đúng → 2 ở các mục con liên quan; đánh đổi → 2 ở mục này, 0 ở mục kia; sai → 0, kèm cờ nếu gây hại.
- Sắp thứ tự: khoảng cách tới thứ tự đồng thuận của chuyên gia, chia ngưỡng ra 0/1/2. Chọn nhiều: tỉ lệ chọn trúng ra mức; chọn vào mục có hại (`must_not`) thì ghi cờ.

**3. Chấm pha xử lý theo hành vi**, không so lộ trình đúng. Mục con không có cơ hội thể hiện thì "không xét". Judge nhận kèm danh sách dữ kiện người chơi đã mở tới lúc đó. Trạng thái khúc mắc NPC chỉ là bối cảnh.

**4. Ba trường hợp đặc biệt:**

| Trường hợp | Cách chấm | Lý do |
|---|---|---|
| Hết giờ ở câu đếm giờ | Mức 0, không cờ | "Không xét" sẽ cho người cố tình để hết giờ ở câu khó trung bình cao hơn; mức 0 vẫn đúng D-86 |
| Nút chưa tới vì hết thời gian | Không xét, giữ phần quỹ để chơi lại | D2 |
| Dùng hint | Chấm bình thường, giảm trọng số mức của mục con đó | D-83, D-86; con số chốt khi chơi thử |

**Cờ chỉ ghi cho hai loại hành vi:** có hại ở mọi nơi làm việc (đổ lỗi, xúc phạm, bịa số liệu, làm lộ bí mật…), và làm trái một quy định **đã được nói ra** trong màn.

### E2 · Thư viện câu hỏi có/không và cờ chung (chưa chốt, bản nháp)

**Luật viết (nháp):**
1. Mỗi câu hỏi một hành vi quan sát được trong lời người chơi; "có" luôn là tốt. CheckEval (Lee và cộng sự, EMNLP 2025) cho thấy checklist có/không tách nhỏ làm các judge đồng ý với nhau hơn.
2. Không dùng từ mơ hồ ("phù hợp", "tốt", "hiệu quả").
3. Mỗi câu thoả được bằng một câu nói; C là một hành vi khác, không phải "chi tiết hơn". Judge hay chấm cao câu dài (Zheng và cộng sự, NeurIPS 2023; Dubois và cộng sự, COLM 2024).
4. Hỏi người chơi có làm gì, không hỏi không làm gì; việc tránh hành vi xấu đưa sang cờ.
5. Mỗi mục con có điều kiện xét; không có thì cả mục con "không xét", A/B/C không "không xét" riêng lẻ.
6. Judge trả lời từng câu một, trích nguyên văn trước rồi mới kết luận (TICK, Cook và cộng sự 2024; Wang và cộng sự, ACL 2024).
7. Chấp nhận cách nói vòng, lễ phép của người Việt; judge xét câu đó làm gì, không dò từ khoá.
8. Chỉ chấm lời người chơi.
9. AI-5 dùng họ model khác AI-4 (Panickssery và cộng sự, NeurIPS 2024: model chấm cao văn của chính nó).

**Quy ra mức:** A và B → 1; A, B và C → 2; còn lại → 0.

**13 cờ chung (nháp):** xúc phạm, hạ thấp người khác · chế giễu trên lưng người khác · đổ lỗi của mình cho người khác · bịa sự thật, số liệu, kết quả · giấu hoặc nói giảm lỗi · để lộ thông tin bí mật · hứa kết quả không chắc làm được · cố ý làm trái quy định đã nói · từ chối yêu cầu hợp lý ("không phải việc của em") · đe doạ, gây sức ép · gạt người khác ra (nói chen, phớt lờ) · nói rập khuôn, phân biệt đối xử · nhận công người khác hoặc lừa để có lợi cho mình. Nguồn: thang CWB-C (Spector và cộng sự 2006) và thang bất lịch sự nơi làm việc (Cortina và cộng sự 2001) cho một phần; phần còn lại là suy luận của nhóm.

**Bản mẫu nhóm 7, Đạo đức & chuyên nghiệp:** đã soạn đủ 6 mục con (điều kiện xét, A/B/C, cờ hay gặp), đang chờ duyệt. Câu chữ từng câu hỏi là suy luận của nhóm; nguồn (NACE, rubric VALUE của AAC&U) chỉ đỡ ở mức khái niệm.

**Rủi ro đã thấy:** câu A ở mục "tuân thủ" và "giữ lời hứa" chấm việc nói ra cam kết, nên màn cần một nút về sau để thấy có làm thật; nhóm 7 dễ bị chấm cao vì người chơi đoán được game muốn nghe gì; judge chấm tiếng Việt chưa đáng tin (kappa khoảng 0,3 giữa các judge trên nhiều ngôn ngữ, Fu & Liu, Findings EMNLP 2025), cần một bộ nhỏ có người Việt gắn nhãn trước khi tin thư viện.

## Khối M · Mini note (đã chốt)

- Dữ kiện nào được mở (theo `facts[].id`) thì tự vào note, mục "đã biết" hoặc "còn chưa rõ". Note ghi từ dữ liệu có cấu trúc, không từ lời AI-4, nên không lệch. Chỉ ghi dữ kiện; suy luận để người chơi tự ghép (ship log của *Outer Wilds*).
- Người chơi tự thêm ghi chú. Ghi chú của người chơi không gửi cho AI, không chấm.
- Tìm từ khoá xuyên chat, cuộc gọi, lúc gặp và lịch sử thoại (tìm kiếm của *Her Story*).

## Móc nối với các thiết kế khác

- **Kinh tế, sức khoẻ, cửa hàng** (`Kinh tế và sức khoẻ JobQuest.md`): sức khoẻ và vật phẩm cộng trừ vào ngân sách điểm thời gian trong phần dự phòng; OT đổi sức khoẻ lấy thêm thời gian và không được chấm; nhiệm vụ phụ không chấm soft skill, làm xong được thưởng cố định trong quỹ 10% của D-119; "luật hôm nay" của mỗi màn đi vào nút mở và email phản hồi cuối màn.
- **Môi trường làm việc** (`occupation-data/datasets/work_environments.json`, `decisions/occupation_work_environments.csv`): loại hình nơi làm, trọng số random công ty, `peak_season` cho lịch năm.
- **Thiết kế AI** (§5.3.6): khử định danh (D-110), luật R1–R4, AI-4 không thấy rubric.

## Chưa chốt và hàng chờ

| # | Việc | Ghi chú |
|---|---|---|
| E2 | Thư viện câu hỏi có/không cho 42 mục con, 13 cờ chung | Bản mẫu nhóm 7 chờ duyệt; 6 nhóm còn lại soạn sau khi duyệt |
| — | Kết cục và sự kiện ngẫu nhiên | Mỗi kết cục có một câu "điều bạn nhận ra về nghề" (thay `takeaway`); thang cũ `min_plus2`, `max_minus1` phải đổi theo thang 0/1/2 |
| — | Vòng đời seed, phiên bản, quy trình soạn và duyệt | AI-1 phỏng vấn DE, AI-2 dựng nháp, DE đặt khoá chấm (D-90, D-99); chơi thử với người ngoài nghề (INACSL, tiêu chí 11) |
| H1 | Keyword chia cho cấp không khớp việc thật của cấp | Ví dụ Back-end L3 tối ưu API nhưng keyword nâng là quản lý dự án; cần tách "keyword trải nghiệm trong màn" khỏi "keyword lên mức khi xong cấp" |
| H5 | Cá nhân hoá theo lịch sử chơi | Để sau |
| — | Kế hoạch đánh giá D-106 | Cần S_EXEC L1 và S_AMBIG L2 cho cả 3 nghề, nhưng DevOps bắt đầu từ L3 và BA không có việc ở L1 |
| — | Con số | Điểm thời gian mỗi màn, cỡ fact sheet, trọng số hint, ngưỡng quy đổi sắp thứ tự |
| — | Audit lời thoại | Mọi lời mẫu trong file cần người viết bản ngữ duyệt |
| — | Code và schema | `packages/game-core/src/data/schema.ts` và hai kịch bản mẫu chưa đổi theo file này |
| — | Ghi vào hub | Các quyết định trong file chưa được ghi vào `docs/project-hub/02-quyet-dinh.md` |

## Nguồn

- INACSL Standards Committee 2021, *Healthcare Simulation Standards of Best Practice: Simulation Design* (toàn văn, tiêu chí 3, 4, 5, 6, 8, 11).
- Mislevy, Almond & Lukas 2003, *A Brief Introduction to Evidence-Centered Design*, CSE Report 632 (toàn văn, tr. 12–13).
- Flanagan 1954, "The critical incident technique", *Psychological Bulletin* 51(4) (thứ cấp).
- Bauer 2010, *Onboarding New Employees: Maximizing Success*, SHRM Foundation (thứ cấp).
- Shao và cộng sự 2023, Character-LLM, EMNLP; Ahn và cộng sự 2024, TimeChara, Findings ACL (tóm tắt).
- Sutcliffe & Sawyer 2013, "Requirements elicitation: towards the unknown unknowns", RE (tóm tắt).
- Daft & Lengel 1986, "Organizational information requirements, media richness and structural design", *Management Science* (thứ cấp; lý thuyết còn tranh cãi).
- Hamstra và cộng sự 2014, "Reconsidering fidelity in simulation-based training", *Academic Medicine* 89(3).
- Messick 1995, "Validity of psychological assessment", *American Psychologist* 50(9).
- Campion, Palmer & Campion 1997, "A review of structure in the selection interview", *Personnel Psychology* 50(3).
- Baron & Hershey 1988, "Outcome bias in decision evaluation", *Journal of Personality and Social Psychology* 54(4).
- Lee và cộng sự 2025, CheckEval, EMNLP (toàn văn); Cook và cộng sự 2024, TICK (preprint, workshop NeurIPS).
- Zheng và cộng sự 2023, Judging LLM-as-a-Judge, NeurIPS Datasets & Benchmarks; Dubois và cộng sự 2024, Length-Controlled AlpacaEval, COLM; Wang và cộng sự 2024, "Large Language Models are not Fair Evaluators", ACL; Panickssery và cộng sự 2024, NeurIPS; Fu & Liu 2025, Findings EMNLP (tóm tắt).
- Spector và cộng sự 2006, CWB-C, *Journal of Vocational Behavior* 68 (trang của tác giả); Cortina và cộng sự 2001, Workplace Incivility Scale (thứ cấp).
- AAC&U VALUE Rubrics: Teamwork, Ethical Reasoning (toàn văn); NACE Career Readiness Competencies, Professionalism 2025 (trang chính thức).
