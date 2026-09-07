# KHỐI 1 — SPEC KHUNG KỊCH BẢN (SCENARIO SKELETON)

> **Phiên bản `scenario-2.0`.** Đổi so với `1.0`: beat tách hai tầng cố định/follow-up · `FREETEXT` thành mặc định · thêm hint, câu chốt, quick action, random event · gộp `grounded_in` vào `context` · thêm `debrief`. File sinh theo `1.0` không tương thích và phải sinh lại.

> Dùng cho lớp mô phỏng nghề: biến `tasks[]` / `skills_hard[]` / `skills_soft[]` của một job thành tình huống công việc chơi được.
> Quan hệ với `spec-pass1-KHOI1-fixed.md`: file đó sinh **dữ liệu nghề**, file này tiêu thụ dữ liệu đó để sinh **tình huống**. Mọi quy ước về `role_code`, thang L1–L10, nhãn độ tin cậy, bốn nhóm `company_type` đều kế thừa nguyên vẹn, không định nghĩa lại.
> Golden anchor: `scenario-golden/SWE_BACKEND_L3.json`.

File có hai khối, dùng ở hai thời điểm khác nhau:

- **KHỐI A** — dán vào phiên sinh offline, tạo ra file skeleton JSON cho từng job.
- **KHỐI B** — nạp cho AI lúc chạy thật, để ứng biến case sống **bên trong** skeleton đã sinh.

Không trộn hai khối vào một phiên. AI runtime không được nhìn thấy KHỐI A.

---

# KHỐI A — SINH SKELETON (offline)

## A1. Đơn vị sinh

Một **job** = một cặp `(role_code, band)`.

- Role archetype **A / B / D**: mỗi phần tử trong `levels[]` là một job.
- Role archetype **C** (không có `levels[]`): job duy nhất, band lấy từ `destination_profile.band_range`.

`role_code` **bắt buộc** tồn tại trong `roles.csv`. Không map được → dừng, không tạo mã giả.

## A2. Một scenario là gì

### Phân cấp

```
job  (role_code + band)
 └── nhiều scenario
      └── mỗi scenario neo vào ĐÚNG MỘT task
           └── task triển khai thành nhiều beat
```

Một scenario là tình huống công việc **tự chứa**, 3–4 beat cố định, **10–15 phút**.

- KHÔNG phải một ngày làm việc. KHÔNG phải một sprint. Không có trạng thái mang sang phiên sau.
- Mỗi scenario neo vào **đúng một** phần tử `tasks[]` của chính level đó, chép nguyên văn vào `context.task`. Một task, không nhiều hơn — nhiều task trong một tình huống thì không biết bằng chứng thu được thuộc về task nào.
- `context.estimated_minutes` phải nằm trong **[10, 15]**.

### Hai tầng beat

| Tầng | Ai viết | Số lượng |
|---|---|---|
| **Beat cố định** | Viết sẵn trong file skeleton | 3–4 |
| **Follow-up** | Runtime AI tự sinh | Theo trần khai ở beat cố định |

Beat cố định là xương sống, cố định giữa mọi lượt chơi. Follow-up là câu đào sâu, sinh ra từ chính chữ người chơi vừa gõ nên **không viết sẵn được** — skeleton chỉ khai *trần* và *mục tiêu*.

> Lý do khoá ở 10–15 phút: đây là đơn vị đo. Tình huống ngắn hơn không đủ beat để quan sát một kỹ năng mềm; dài hơn thì người chơi bỏ giữa chừng và bằng chứng thu được bị cụt.

## A3. Sáu archetype scenario, mở khoá theo band

Đây là xương sống làm cho cùng một role khác nhau theo level.

| Mã | Nội dung | Band mở |
|---|---|---|
| `S_EXEC` | Thực thi một task chuẩn, đề bài rõ | L1+ |
| `S_AMBIG` | Yêu cầu mơ hồ, thiếu thông tin, phải hỏi lại | L2+ |
| `S_INCIDENT` | Sự cố, áp lực thời gian | L3+ |
| `S_CONFLICT` | Xung đột ưu tiên hoặc xung đột con người | L4+ |
| `S_REVIEW` | Review / mentor người khác | L4+ |
| `S_DECISION` | Đánh đổi kiến trúc, ngân sách, cross-team | L6+ |

Mỗi job sinh **một scenario cho mỗi archetype đang mở** ở band đó. L1 sinh 1 scenario, L3 sinh 3, L7 sinh 6.

**CẤM** sinh archetype chưa mở khoá. L1 không có `S_DECISION` — một intern không đứng trước quyết định ngân sách, và dựng ra tình huống đó là dạy sai về nghề.

## A4. Hai trục bắt buộc

Kế thừa quy tắc `core_output` của Pass 1: mỗi scenario phải mang **cả trục ROLE lẫn trục BAND**.

Phép thử: che `role_code` và `band` đi rồi đưa scenario cho người khác đọc. Nếu họ dán được nó sang band khác mà không phải sửa gì → **sai, viết lại**.

| Band | Độ mơ hồ đề bài | Quyền quyết định | Phạm vi hậu quả |
|---|---|---|---|
| L1–L2 | Rõ, có mentor kèm sát | Làm theo hướng dẫn | Một task nhỏ, review 100% |
| L3 | Rõ | Tự làm, cần review | Một ticket |
| L4 | Trung bình | Tự chủ một module | Một module |
| L5 | Cao | Tự chủ một domain, review người khác | Một domain |
| L6 | Cao | Dẫn dắt kỹ thuật một team | Một hệ thống / một team |
| L7 | Rất cao, có xung đột lợi ích | Cross-team | Nhiều team |
| L8–L10 | Chiến lược | Cross-domain / function / tổ chức | Ngân sách, tổ chức |

Trục BAND thể hiện ở bốn chỗ trong scenario:

| Chỗ | Thể hiện |
|---|---|
| `context.situation` | Đề bài rõ hay mơ hồ |
| `beats[].input_prompt` | Được tự quyết hay chỉ xử lý trong phạm vi đã giới hạn |
| `beats[].limitFollowup` | Bao nhiêu tầng đào sâu — band cao thì nhiều tầng hơn (A7) |
| `endings[]` | Hậu quả lan tới đâu |

## A5. Chuỗi fallback khi thiếu dữ liệu

Chỉ **40/263 level** trong dataset có `tasks[]` được điền. Đây là trạng thái bình thường, không phải lỗi. Dừng ở nấc đầu tiên có dữ liệu và **ghi lại nấc đã dùng** vào `_meta.fallback_tier`:

| Tier | Nguồn | `evidence_level` |
|---|---|---|
| 1 | `tasks[]` + `skills_*[]` của chính level | giữ nguyên của level (`A_VERIFIED` nếu level là vậy) |
| 2 | Level liền kề (band ±1) cùng role | `B_TITLE_SEEN` |
| 3 | `core_output` của level + task chung của `role_group` | `C_INFERRED` |
| 4 | Không có gì | **KHÔNG SINH** |

- Tier 2: `coverage_note` phải ghi rõ mượn từ band nào, và phải hiệu chỉnh phạm vi hậu quả về đúng band đang xét theo bảng A4.
- Tier 3: `coverage_note` ghi rõ đây là suy luận. **CẤM** viết bằng giọng chắc chắn.
- Tier 4: trả về đúng một mục trong `unknowns[]` với chuỗi `"CHƯA CÓ TASK/SKILL cho job này"`, không sinh scenario. **Trả về rỗng là hành vi ĐÚNG.**

Mọi tier: CẤM bịa tên công ty thật, tên hệ thống nội bộ, URL, số liệu thị trường.

## A6. Bối cảnh chốt sẵn

Toàn bộ bối cảnh nằm trong khối `context`, chốt ngay trong skeleton, không để runtime tự nghĩ.

### Ba trường neo về dataset

Ba trường này là **hàng rào**, không phải mô tả:

- **`task`** — NGUYÊN VĂN đúng một phần tử `tasks[]` của level.
- **`skills_hard`** — NGUYÊN VĂN từ `skills_hard[].skill`.
- **`skills_soft`** — NGUYÊN VĂN từ `skills_soft[]`.

Runtime **cấm quan sát kỹ năng nằm ngoài `context.skills_hard` và `context.skills_soft`**. Server kiểm được bằng máy: mọi `skill` trong evidence phải có mặt trong hai mảng này.

### Bối cảnh sân khấu

- **`company_type`** ∈ `outsourcing` | `product_local` | `enterprise_bank` | `bigtech_fdi`. **Chỉ được chọn nhóm mà `company_type_variance` của role đó KHÔNG phải `CHUA_CO_DU_LIEU`.** Chọn nhóm không có dữ liệu = bịa bối cảnh.
- **`work_environment_id`** lấy từ `work_environment_ids[]` của role. Trỏ bằng id, **KHÔNG copy mô tả** sang file scenario — quy ước này đã ghi ở `shared/work_environments.json`.
- **`cast[]`**: 2–4 NPC. Mỗi NPC có `role_in_scene`, một **áp lực** rõ ràng (thứ khiến họ không rảnh rỗi giúp người chơi), và `voice` (cách nói).

Công ty trong scenario là **hư cấu và vô danh**: `"một ngân hàng trong nước"`, `"một công ty product tầm trung"`. Tên công ty thật chỉ tồn tại ở tầng evidence của dataset (`evidence_company`), không bao giờ xuất hiện trong nội dung chơi.

> Lý do: người chơi sẽ kể lại tình huống cho bạn bè. Gắn tên thật vào một sự cố hư cấu là tạo ra tin đồn về một công ty có thật.

## A7. Beat cố định và follow-up

### Số beat cố định: 3–4 ở mọi band

### Beat nối nhau bằng con trỏ, không bằng thứ tự mảng

Mỗi beat khai `forward_to` trỏ tới `beat_id` kế tiếp, hoặc chuỗi `"END"`. Đúng **một** beat có `isOrigin: true` — đó là chỗ bắt đầu.

```jsonc
"isOrigin": true,
"forward_to": "b2"
```

Ba luật:

- Đúng 1 beat có `isOrigin: true`. Không có hoặc có nhiều hơn một đều hỏng.
- Mọi `forward_to` phải trỏ tới `beat_id` **có thật** trong `beats[]`, hoặc `"END"`.
- Đúng 1 beat có `forward_to: "END"`, và **mọi beat phải tới được từ beat gốc**. Beat không ai trỏ tới là beat chết.

> Vì sao dùng con trỏ thay vì thứ tự mảng: `random_events` có thể đẩy người chơi đi đường khác (A12). Thứ tự mảng ngầm định chỉ mô tả được một đường thẳng; con trỏ mô tả được đồ thị, nên khi thêm nhánh không phải đổi lại schema.

### Nhãn beat

`summary` là nhãn ngắn một dòng cho beat — dùng cho UI, log và lúc rà soát. Không hiển thị cho người chơi.

### `FREETEXT` là mặc định, `CHOICE` là ngoại lệ

Mọi beat cố định mặc định `input_type: "FREETEXT"`.

`CHOICE` chỉ dùng khi tình huống **thực sự không cho phép gõ tự do** — điển hình là khoảnh khắc phản xạ tức thời, không kịp viết một câu. Ràng buộc:

- **Tối đa 1 beat `CHOICE` mỗi scenario.**
- Bắt buộc khai `choice_reason` giải thích vì sao beat này không thể là `FREETEXT`.
- Đúng 3 phương án. **CẤM phương án ngu ngốc hiển nhiên** — cả ba đều phải là lựa chọn một người thật ở band đó có thể chọn.

> Lý do đảo mặc định: chọn đáp án chỉ đo được việc nhận ra phương án đúng. Gõ tự do đo được cách người ta *diễn đạt* suy nghĩ — thứ chiếm phần lớn công việc thật và cũng là thứ khó giả vờ. Mỗi beat `CHOICE` là một beat đánh mất cơ hội quan sát.

> Lý do cấm phương án ngu ngốc: nó không đo được gì. Người chơi loại nó trong nửa giây rồi câu hỏi tụt xuống còn hai lựa chọn — nhưng rubric vẫn tính như thể có ba.

### Trần follow-up theo band

Đây là chỗ trục BAND thể hiện rõ nhất. Band càng cao thì càng nhiều tầng để đào sâu.

| Band | Tổng follow-up cả scenario | Ý nghĩa |
|---|---|---|
| L1–L2 | ≤ 2 | Đề bài rõ, ít chỗ để đào sâu |
| L3–L5 | ≤ 3 | Có chỗ hỏi lại, làm rõ |
| L6+ | ≤ 4 | Nhiều tầng đánh đổi |

Mỗi beat cố định khai hai trường:

```jsonc
"limitFollowup": 2,          // tối đa 2 mỗi beat
"followup_goal": "..."       // runtime đào sâu về cái gì. null khi limitFollowup = 0
```

Tổng `limitFollowup` của cả scenario **không được vượt trần band**. `followup_goal` là chỉ dẫn cho runtime, không phải câu hỏi viết sẵn — câu hỏi thật sinh ra từ chính chữ người chơi vừa gõ.

Beat `CHOICE` và beat `quick_action` **luôn có `limitFollowup: 0`**.

### Ngân sách thời lượng

```
estimated_minutes = 2   × (số beat FREETEXT cố định)
                  + 1   × (số beat CHOICE cố định)
                  + 1.5 × (tổng limitFollowup đã khai)
                  + 2
                    ↑ đọc situation + ending
```

Kết quả phải rơi vào **[10, 15]** và ghi vào `context.estimated_minutes`.

| Cấu hình | Tính | Kết luận |
|---|---|---|
| L3 — 3 `FREETEXT`, 3 follow-up | 6 + 4.5 + 2 = **12.5** | hợp lệ |
| L3 — 1 `CHOICE` + 2 `FREETEXT`, 3 follow-up | 1 + 4 + 4.5 + 2 = **11.5** | hợp lệ |
| L1 — 3 `FREETEXT`, 2 follow-up | 6 + 3 + 2 = **11** | hợp lệ |
| L6 — 3 `FREETEXT`, 4 follow-up | 6 + 6 + 2 = **14** | hợp lệ |
| L6 — 4 `FREETEXT`, 4 follow-up | 8 + 6 + 2 = **16** | **vượt trần, bớt 1 beat cố định** |

Vượt trần thì **bớt beat cố định, không bớt follow-up** — follow-up mới là chỗ đo được chiều sâu, còn beat cố định chỉ là khung.

## A8. Rubric ECD

Mỗi beat khai `observes[]`. Mỗi mục gồm:

- `skill_type`: `soft` | `hard`
- `skill`: **chuỗi trích NGUYÊN VĂN từ dataset** — copy đúng ký tự từ `skills_hard[].skill` hoặc `skills_soft[]` của level.
- `anchors`: ba mốc hành vi `+2` / `0` / `-1`, viết bằng **hành vi quan sát được**, không bằng tính từ.

Sai: `"+2": "Giao tiếp tốt"`. Đúng: `"+2": "Nêu đủ nguyên nhân + trạng thái + mốc thời gian, có nói rõ điều gì còn chưa chắc"`.

Định lượng:
- Mỗi scenario quan sát **2–3 soft** và **1–2 hard**.
- Với một hard skill, độ khó của mốc `+2` phải khớp `level` của skill đó trong dataset: `familiar` chỉ đòi biết dùng đúng chỗ; `proficient` đòi nêu được đánh đổi; `expert` đòi thiết kế được phương án.
- Qua **cả bộ scenario của một job**, `skills_soft[]` của level phải được phủ hết. Một skill không scenario nào quan sát = không bao giờ đo được.

Skeleton **chỉ mô tả bằng chứng, không cộng điểm**. Không có `total`, không có `max_score`. Tổng hợp là việc của tầng khác.

## A9. Hint

Chỉ beat cố định `FREETEXT` được có hint. Beat `CHOICE`, beat `quick_action`, và follow-up **không có hint**.

```jsonc
"hints": [
  {
    "text": "...",            // viết dưới dạng lời NPC, không phải giọng hệ thống
    "costs_ceiling": true     // luôn true ở phiên bản này
  }
]
```

`hints` là mảng, **tối đa 1 phần tử ở phiên bản `2.0`**. Beat không có hint để `"hints": []`.

> Vì sao dùng mảng cho một phần tử: để dành chỗ cho hint nhiều tầng sau này (gợi ý nhẹ trước, gợi ý rõ sau, mỗi tầng hạ trần sâu hơn) mà không phải đổi schema. Phiên bản này chưa mở tầng thứ hai.

### Ba luật

**1. Người chơi phải chủ động bấm xem.** Hint không tự bung sau X giây. Hạ trần chỉ công bằng khi người chơi tự chọn đánh đổi.

**2. Dùng hint thì beat đó tối đa mốc `0`.** Runtime không được phát `+2` cho beat đã xem hint, kể cả khi câu trả lời xuất sắc. Ghi `hint_used: true` vào evidence.

**3. Hint chỉ ra hướng, không đưa đáp án.**

| | Ví dụ |
|---|---|
| ✅ Đúng | "An: 'em xem log DB quanh mốc đó chưa?'" |
| ❌ Sai | "An: 'đây là N+1 query đấy'" |

Câu sai ở trên đưa thẳng thứ đang được đo. Sau khi đọc nó, người chơi nào cũng trả lời được, và beat mất hết giá trị quan sát — kể cả khi đã hạ trần.

> Vì sao follow-up không cần hint: tới lượt follow-up thì runtime đã có intent của người chơi từ câu trả lời trước. Nó hỏi tiếp dựa trên chính chữ người chơi vừa gõ, nên bản thân câu hỏi đã là dẫn dắt rồi.

## A10. Câu chốt

Mỗi beat cố định khai `closing_prompt`: câu NPC nói để đóng mạch trước khi sang beat kế, hoặc trước ending nếu là beat cuối.

```jsonc
"closing_prompt": "An: 'Ok, anh hiểu rồi. Em làm đi, xong ping anh nhé.'"
```

Hai luật:

- **Câu chốt KHÔNG phát bằng chứng mới.** Nó không có `observes[]`. Người chơi có thể trả lời hoặc không, không ảnh hưởng điểm.
- **Bắt buộc có ở mọi beat cố định**, kể cả beat cuối. Ở beat cuối, câu chốt là cầu nối sang ending.

> Lý do: không có câu chốt thì chuyển beat đột ngột — người chơi vừa viết một đoạn dài xong thì cảnh nhảy sang chỗ khác, không ai phản hồi gì. Cảm giác nói vào khoảng không đó phá trải nghiệm nhanh hơn bất kỳ lỗi nội dung nào.

## A11. Quick action

Beat gấp, có đồng hồ đếm ngược **cưỡng chế**.

```jsonc
"quick_action": true,
"time_limit_seconds": 30
```

Luật:

- **Tối đa 1 beat quick action mỗi scenario.**
- Chỉ đánh dấu beat **thực sự gấp** trong tình huống — thường là khoảnh khắc đầu của `S_INCIDENT`. Không dùng để tạo áp lực giả.
- Beat quick action **không có hint** và **không có follow-up** (`limitFollowup: 0`).
- `time_limit_seconds` trong khoảng **[20, 60]**.
- Hết giờ = **không hành động**: runtime ghi `anchor_hit: "-1"`, `quote: null`, `timeout: true`, rồi chuyển beat.

> ⚠️ **Đây là ngoại lệ DUY NHẤT của luật "quote bắt buộc" ở B3.** Hết giờ thì người chơi không gõ gì, nên không có chữ nào để trích. Mọi trường hợp khác mà `quote` là `null` đều là lỗi.

## A12. Random event

Sự kiện xen vào giữa mạch, gieo theo xác suất mỗi lượt chơi.

```jsonc
"random_events": [
  {
    "event_id": "...",
    "chance": 0.25,              // [0.1, 0.4]
    "after_beat": "b2",          // xen vào sau beat cố định nào
    "condition": null,           // null = chỉ cần gieo trúng. Xem "Hai cổng" bên dưới
    "text": "...",               // sự kiện, kể trong bối cảnh sẵn có
    "outcome": "DIVERT",         // DIVERT | EARLY_END
    "divert_note": "...",        // DIVERT: NPC kéo về mạch chính thế nào
    "early_ending_id": null      // EARLY_END: trỏ THẲNG tới một ending_id
  }
]
```

Không có sự kiện thì để `"random_events": []`.

### Hai cổng: xác suất và điều kiện

Sự kiện nổ khi **gieo trúng `chance`** VÀ **`condition` khớp**. `condition` dùng đúng hình dạng của `endings[].condition`:

```jsonc
"condition": { "min_minus1": 2, "min_plus2": null, "extra": null }
```

**`EARLY_END` BẮT BUỘC có `condition`.** Cắt sớm thuần ngẫu nhiên sẽ đẩy cả người đang chơi tốt vào kết cục xấu chỉ vì xui — đó là phạt người chơi vì một con số ngẫu nhiên họ không thấy và không kiểm soát được.

`DIVERT` được để `condition: null`, vì nó chỉ đổi đường đi chứ không kết thúc gì.

### Luật

- **Tối đa 2 sự kiện mỗi scenario.** `chance` trong khoảng 0.1–0.4.
- **Sự kiện bám vào bối cảnh sẵn có, không mở tình huống mới.** Nó đổi *đường đi*, không đổi *đề bài*. Một sự cố khác hoàn toàn ập tới giữa chừng là scenario thứ hai bị nhét vào, không phải sự kiện.
- **CẤM đổi `observes[]`.** Sự kiện đổi nhịp kể, không đổi thứ đang đo.
- `DIVERT` — sau sự kiện, NPC kéo người chơi về beat cố định kế tiếp. `divert_note` mô tả cách kéo về.
- `EARLY_END` — **bắt buộc trỏ thẳng một `ending_id` có thật**, bỏ qua toàn bộ luật ngưỡng ở A13.

> **Vì sao `EARLY_END` phải trỏ thẳng:** kết thúc sớm nghĩa là vài beat không bao giờ chạy, nên số mốc `+2` khả dĩ tụt xuống và các ngưỡng `min_plus2` trở thành không đạt được. Nếu vẫn duyệt theo ngưỡng thì người chơi luôn rơi vào ending vét — kể cả khi họ đang làm tốt và chỉ xui gặp sự kiện.

> **Sự kiện tiêu cực nên dẫn `EARLY_END`.** Khi người chơi đã lệch hẳn, kéo họ lê hết beat còn lại không dạy được gì thêm, chỉ kéo dài cảm giác thất bại. Cắt sớm và cho họ chơi lại tốt hơn.

## A13. Kết cục

`endings[]` là một mảng, **tối thiểu 2, tối đa 5** phần tử.

### Bốn loại

| `type` | Bắt buộc | Số lượng | Nội dung |
|---|---|---|---|
| `GOOD` | có | đúng 1 | Làm đúng và đủ. Việc xong, và người khác biết là bạn làm |
| `BAD` | có | đúng 1 | Việc không xong, hoặc xong nhưng do người khác gánh |
| `PARTIAL` | không | 0–2 | Việc xong nhưng trả giá: trễ, nợ kỹ thuật, một NPC mất tin tưởng |
| `SECRET` | không | 0–1 | Người chơi nhận ra thứ đề bài **không hỏi tới** |

### Luật chọn

Runtime xét `endings[]` theo `priority` **tăng dần**, dừng ở phần tử đầu tiên khớp `condition`.

- `min_plus2` — số mốc `+2` tối thiểu đã phát trong cả case. `null` = không xét.
- `max_minus1` — số mốc `-1` tối đa cho phép. `null` = không xét.
- `extra` — chuỗi mô tả **một hành vi cụ thể** bắt buộc phải xuất hiện. Chỉ `SECRET` được dùng, các loại khác để `null`.

Hai ràng buộc bắt buộc, thiếu là scenario hỏng:

1. **`SECRET` luôn có `priority: 1`.** Nó là ngoại lệ hẹp nhất nên phải được xét trước.
2. **Phần tử `priority` lớn nhất phải là catch-all** — `condition` có cả ba trường đều `null`. Đây thường là `BAD`. Không có nó thì tồn tại lượt chơi không khớp kết cục nào.

### Kết cục có hai đường vào

Ending nào được `random_events[].early_ending_id` trỏ tới thì ghi `"reachable_by_event": true`. Các ending khác để `false`.

Cờ này không đổi luật chọn — nó để người rà soát biết ending đó có thể tới bằng hai đường: duyệt ngưỡng bình thường, hoặc bị sự kiện đẩy thẳng vào. Đọc `text` của nó phải thấy hợp lý ở **cả hai** đường.

### SECRET là gì và không là gì

`SECRET` **không** phải "GOOD nhưng hay hơn". Nó là kết cục cho người chơi nhận ra một điều mà đề bài không hỏi tới — thường là nguyên nhân sâu hơn, một rủi ro sắp tới, hoặc một NPC đang gặp vấn đề mà không nói ra.

Ba luật:

- `extra` phải mô tả hành vi **thực hiện được trong chính scenario này** — phải tồn tại một beat mà người chơi có cơ hội làm điều đó. Đòi hỏi một hành vi không beat nào cho phép = kết cục không bao giờ đạt được.
- **CẤM** biến nó thành trò đoán chữ. Không có mật khẩu, không có câu thần chú. Người chơi đạt được vì hiểu nghề, không vì mò đúng từ khoá.
- `reveals` bắt buộc khác `null`: ghi rõ người chơi học được gì. Không nói được thì đó không phải secret, chỉ là một `GOOD` khác.

> Lý do tách `SECRET` khỏi `GOOD`: nếu mọi phần thưởng đều nằm trên một trục "làm đúng nhiều hơn", người chơi chỉ học được cách tối đa hoá điểm. `SECRET` thưởng cho việc **để ý**, thứ không đo được bằng thang `+2/0/-1`, và cũng là thứ phân biệt người làm nghề lâu năm với người làm đúng quy trình.

## A14. Schema output

Trả về DUY NHẤT JSON, không markdown fence, không preamble. Nhiều scenario ngăn bằng `===SPLIT===`.

Trường không áp dụng → `null` hoặc mảng rỗng. **KHÔNG xoá key.**

```jsonc
{
  "_meta": {
    "spec_version": "scenario-2.0",
    "generated_at": "<YYYY-MM-DD>",
    "source_dataset": "<tên file dataset đã đọc>",
    "fallback_tier": 1,                  // 1..3 theo bảng A5
    "golden_used": []                    // ["scenario-golden/SWE_BACKEND_L3.json"] nếu có neo
  },

  "job": {
    "role_code": "...",                  // phải có trong roles.csv
    "role_name_vn": "...",
    "band": "L3",                        // phải nằm trong occupied_bands của role
    "title_vn": "...",
    "years_experience": "...",
    "user_context": "...",               // bối cảnh TĨNH: người chơi đang ở đâu trong nghề
    "core_output": "..."                 // chép từ level, để runtime biết giới hạn quyền
  },

  "context": {
    "scenario_archetype": "S_EXEC|S_AMBIG|S_INCIDENT|S_CONFLICT|S_REVIEW|S_DECISION",

    // --- ba trường neo về dataset (A6) ---
    "task": "...",                       // NGUYÊN VĂN đúng MỘT phần tử tasks[]
    "skills_hard": [],                   // NGUYÊN VĂN — hàng rào cho runtime
    "skills_soft": [],                   // NGUYÊN VĂN — hàng rào cho runtime

    // --- sân khấu ---
    "company_type": "...",               // 1 trong 4 nhóm, KHÔNG được là nhóm CHUA_CO_DU_LIEU
    "work_environment_id": "...",        // id từ work_environments.json, không copy mô tả
    "situation": "...",                  // đề bài. Độ mơ hồ phải khớp trục BAND
    "stakes": "...",                     // hỏng thì mất gì. Phạm vi phải khớp trục BAND
    "time_pressure": "...",
    "estimated_minutes": 12              // trong [10,15], khớp công thức A7
  },

  "cast": [
    {
      "npc_id": "...",
      "role_in_scene": "...",
      "pressure": "...",                 // thứ khiến NPC này không rảnh giúp người chơi
      "voice": "..."
    }
  ],

  "beats": [                             // 3-4 BEAT CỐ ĐỊNH. Follow-up runtime tự sinh
    {
      "beat_id": "b1",
      "type": "FREETEXT",                // mặc định. CHOICE là ngoại lệ, tối đa 1/scenario
      "choice_reason": null,             // BẮT BUỘC khi type = CHOICE
      "summary": "...",                  // nhãn ngắn của beat, cho UI và debug

      "isOrigin": true,                  // đúng MỘT beat trong scenario có isOrigin: true
      "forward_to": "b2",                // beat_id kế tiếp, hoặc "END"

      "setup": "...",
      "npc_line": null,                  // hoặc lời NPC mở beat
      "options": null,                   // CHOICE: đúng 3. FREETEXT: null
      "input_prompt": "...",             // FREETEXT: câu hỏi. CHOICE: null

      "quick_action": false,             // A11
      "time_limit_seconds": null,        // [20,60] khi quick_action = true

      "hints": [],                       // A9 — tối đa 1, chỉ beat FREETEXT thường
      "limitFollowup": 1,                // A7 — CHOICE/quick_action luôn 0
      "followup_goal": "...",            // null khi limitFollowup = 0
      "closing_prompt": "...",           // A10 — BẮT BUỘC ở mọi beat cố định

      "observes": [
        {
          "skill_type": "soft",
          "skill": "...",                // NGUYÊN VĂN, phải có trong context.skills_*
          "anchors": {
            "+2": "<hành vi quan sát được>",
            "0":  "<hành vi quan sát được>",
            "-1": "<hành vi quan sát được>"
          }
        }
      ]
    }
  ],

  "random_events": [                     // A12 — tối đa 2, hoặc mảng rỗng
    {
      "event_id": "...",
      "chance": 0.25,                    // [0.1, 0.4]
      "after_beat": "b2",
      "condition": null,                 // BẮT BUỘC khác null khi outcome = EARLY_END
      "text": "...",
      "outcome": "DIVERT",               // DIVERT | EARLY_END
      "divert_note": "...",
      "early_ending_id": null            // EARLY_END: ending_id có thật
    }
  ],

  "endings": [                           // A13 — tối thiểu 2, tối đa 5
    {
      "ending_id": "...",
      "type": "GOOD|PARTIAL|BAD|SECRET",
      "priority": 1,                     // xét tăng dần, dừng ở cái đầu tiên khớp
      "condition": {
        "min_plus2": 2,                  // số mốc +2 tối thiểu, null = không xét
        "max_minus1": 0,                 // số mốc -1 tối đa, null = không xét
        "extra": null                    // hành vi cụ thể bắt buộc. Chỉ SECRET dùng
      },
      "text": "...",                     // cảnh kết, kể ở ngôi thứ hai
      "reveals": null,                   // SECRET: điều người chơi học được
      "reachable_by_event": false        // true nếu có random_event trỏ tới
    }
  ],

  "evidence_level": "A_VERIFIED|B_TITLE_SEEN|C_INFERRED",
  "coverage_note": "...",                // nguồn dữ liệu, mượn từ đâu nếu tier 2/3
  "unknowns": []                         // BẮT BUỘC, tối thiểu 2 mục
}
```

## A15. Mười lăm lỗi hay gặp — tự kiểm trước khi trả kết quả

1. **Scenario dán được sang band khác** → thiếu trục BAND. Đây là lỗi phổ biến nhất và cũng phá giá trị sản phẩm nhiều nhất: nếu L1 và L7 chơi giống nhau thì cả thang L1–L10 trở thành trang trí.
2. **Beat `CHOICE` có một phương án hiển nhiên sai** → beat đó không đo được gì.
3. **`observes[].skill` viết lại theo ý mình** thay vì trích nguyên văn → vỡ liên kết với dataset, không tổng hợp được.
4. **`company_type` là nhóm đang `CHUA_CO_DU_LIEU`** trong role file → bối cảnh bịa.
5. **`unknowns` rỗng hoặc chỉ 1 mục** → dấu hiệu tự tin giả. Bắt buộc ≥ 2.
6. **Sinh archetype chưa mở khoá** ở band đó.
7. **`anchors` viết bằng tính từ** (`"tốt"`, `"chủ động"`, `"rõ ràng"`) thay vì hành vi → runtime không chấm nhất quán được, hai lượt giống nhau ra hai kết quả khác nhau.
8. **`endings[]` không có phần tử catch-all** ở `priority` lớn nhất → có lượt chơi kết thúc mà không khớp kết cục nào.
9. **`SECRET.condition.extra` đòi hành vi mà không beat nào cho phép làm** → kết cục chết, tồn tại trên giấy nhưng không ai chạm tới được. Rà ngược từng beat xem người chơi có cửa nào làm điều đó không.
10. **Nhiều hơn 1 beat `CHOICE`**, hoặc `CHOICE` không khai `choice_reason` → đang lười, chọn hình thức dễ viết thay vì hình thức đo được nhiều hơn.
11. **Tổng `limitFollowup` vượt trần band** → phá ngân sách thời lượng, và xoá mất cách trục BAND thể hiện.
12. **Hint đưa thẳng đáp án** thay vì chỉ hướng → beat mất giá trị quan sát kể cả khi đã hạ trần.
13. **`EARLY_END` không trỏ `ending_id`, trỏ tới id không tồn tại, hoặc để `condition: null`** → lượt chơi kết thúc mà không có cảnh kết, hoặc cắt oan người đang chơi tốt.
14. **Beat `quick_action` có hint hoặc có follow-up** → mâu thuẫn: beat gấp mà lại cho thời gian đọc gợi ý và hỏi đi hỏi lại.
15. **`isOrigin` không đúng một beat**, `forward_to` trỏ tới id không tồn tại, hoặc có beat không ai trỏ tới → luồng gãy, beat chết.

Ngoài ra rà nhanh ba thứ máy kiểm được nhưng hay sót: mọi beat cố định có `closing_prompt` chưa · `skill` trong `observes[]` có nằm trong `context.skills_*` không · công thức ngân sách có ra đúng `estimated_minutes` không.

---

# KHỐI B — RUNTIME (AI ứng biến case sống)

## B1. Input

AI nhận đúng **một** scenario skeleton JSON + trạng thái phiên (beat hiện tại, lịch sử lượt). Không nhận dataset, không nhận KHỐI A, không nhận scenario khác.

## B2. Được phép / bị cấm

**Được phép:**
- Viết lời thoại NPC theo `voice` đã khai.
- Thêm chi tiết vặt làm cảnh sống động (thời tiết, tiếng ồn văn phòng, một tin nhắn lạc đề của NPC).
- Phản ứng đúng với chữ người chơi vừa gõ.
- Đổi cách diễn đạt `setup` cho tự nhiên.
- **Sinh câu hỏi follow-up** trong trần `limitFollowup` đã khai, bám `followup_goal`.

**CẤM:**
- Đổi `observes[]` hoặc mốc `anchors` — rubric là bất biến.
- Quan sát skill nằm ngoài `context.skills_hard` / `context.skills_soft`.
- Nâng hoặc hạ phạm vi hậu quả khỏi trục BAND của `job.band`.
- Bịa số liệu mới, tên công ty thật, URL, tên sản phẩm thật.
- **Tiết lộ rubric cho người chơi** — không nói "câu trả lời này được +2", không gợi ý đang chấm kỹ năng gì.
- **Vượt trần `limitFollowup`** của beat, hoặc hỏi follow-up ở beat `CHOICE` / `quick_action`.
- **Phát `+2` cho beat người chơi đã xem hint** — trần của beat đó tụt xuống `0`.
- **Đổi `observes[]` khi sự kiện ngẫu nhiên nổ.** Sự kiện đổi đường đi, không đổi thứ đang đo.

## B3. Giao thức lượt

Mỗi lượt trả về DUY NHẤT JSON:

```jsonc
{
  "narration": "...",
  "npc_lines": [ { "npc_id": "...", "line": "..." } ],

  "turn_kind": "FIXED",                 // FIXED | FOLLOWUP | CLOSING | EVENT
  "followup_used": 0,                   // đã dùng mấy follow-up trên beat hiện tại

  "options": null,                      // nếu beat kế là CHOICE, ngược lại null
  "input_prompt": "...",                // nếu beat kế là FREETEXT
  "next": "b3",                         // beat_id kế tiếp, hoặc "END"

  "evidence_emitted": [
    {
      "beat_id": "b2",
      "skill": "...",                   // đúng chuỗi trong observes[]
      "anchor_hit": "+2",               // "+2" | "0" | "-1"
      "quote": "...",                   // TRÍCH ĐÚNG chữ người chơi đã gõ
      "hint_used": false,               // true → anchor_hit không được là "+2"
      "timeout": false                  // true → quote ĐƯỢC PHÉP null
    }
  ],

  "ending": null,                       // chỉ khác null ở lượt cuối, khi next = "END"
  "debrief": null                       // chỉ khác null ở lượt cuối. Xem B5
}
```

### Bốn loại lượt

| `turn_kind` | Khi nào | Phát evidence |
|---|---|---|
| `FIXED` | Mở một beat cố định | Có |
| `FOLLOWUP` | Đào sâu câu trả lời vừa rồi | Có |
| `CLOSING` | Câu chốt trước khi chuyển beat (A10) | **Không** |
| `EVENT` | Sự kiện ngẫu nhiên nổ (A12) | **Không** |

### Luật `quote`

`quote` là bắt buộc và phải là **chuỗi con có thật** trong lượt người chơi vừa nhập. Không có chỗ nào trích được → không phát evidence cho mục đó.

**Ngoại lệ duy nhất:** `timeout: true` ở beat `quick_action`. Hết giờ thì người chơi không gõ gì, nên `quote: null` là hợp lệ và `anchor_hit` là `"-1"`.

> Lý do: `quote` là thứ duy nhất khiến điểm số kiểm tra lại được. Không có nó thì mọi con số ở tầng trên là lời khẳng định không có bằng chứng.

## B4. Người chơi đi lạc

- **Hỏi ngoài phạm vi** (hỏi về công ty, về lương, về chuyện riêng NPC): NPC trả lời ngắn **trong vai**, rồi kéo về beat hiện tại. Không phát evidence.
- **Cố ý phá** (trả lời bậy, spam): nếu đúng skill đang quan sát thì ghi `anchor_hit: "-1"`; không thì bỏ qua, không phát evidence.
- **Ba lượt lạc liên tiếp**: NPC ép quyết định ("anh cần câu trả lời bây giờ"), chuyển beat.
- **Người chơi đòi làm việc vượt quyền của band**: NPC **chặn lại trong vai** — đây không phải lỗi người chơi, mà là cơ hội dạy về phạm vi quyền của level đó.

## B5. Kết thúc

Phát bundle evidence đầy đủ, rồi chọn **đúng một** phần tử của `endings[]`:

**Nếu một `random_event` với `outcome: "EARLY_END"` đã nổ** → dùng thẳng `early_ending_id` của nó, **bỏ qua toàn bộ ba bước dưới**.

Ngược lại:

1. Đếm số mốc `+2` và số mốc `-1` đã phát trong cả case.
2. Duyệt `endings[]` theo `priority` tăng dần, chọn phần tử **đầu tiên** khớp `condition`. Trường `null` coi như luôn khớp.
3. Với `SECRET`: chỉ khớp khi hành vi mô tả ở `extra` **thực sự đã xảy ra** và trích được câu chữ của người chơi làm bằng chứng. Không trích được → không khớp, đi tiếp.

Ở lượt cuối (`next: "END"`), trường `ending` trả về:

```jsonc
"ending": {
  "ending_id": "...",
  "type": "GOOD|PARTIAL|BAD|SECRET",
  "text": "...",                  // text của phần tử đã chọn
  "reveals": null,                // SECRET: chép từ skeleton
  "matched_on": {
    "plus2": 3, "minus1": 0,      // số đếm thực tế
    "extra_quote": null,          // SECRET: trích chữ người chơi chứng minh extra đã xảy ra
    "forced_by_event": null       // EARLY_END: event_id đã đẩy vào kết cục này
  }
}
```

**CẤM tuyệt đối:**
- Nhắc tới sự tồn tại của các kết cục khác, kể cả sau khi kết thúc. Người chơi không được biết mình vừa trượt một kết cục nào.
- Gợi ý trong lúc chơi rằng có `SECRET` — làm vậy là biến case thành trò săn tìm, và mọi bằng chứng thu được sau đó đều nhiễm.
- Cho điểm số, cho sao, xếp hạng, so sánh với người chơi khác.

## B6. Debrief — nhận xét cho người chơi

Ở lượt cuối, cùng với `ending`, trả về `debrief`:

```jsonc
"debrief": {
  "did_well": [
    { "behaviour": "...", "quote": "..." }
  ],
  "could_improve": [
    { "behaviour": "...", "quote": "..." }
  ],
  "one_thing_next_time": "..."
}
```

### Bốn luật

**1. Gọi tên HÀNH VI, không gọi tên KỸ NĂNG.**

| | Ví dụ |
|---|---|
| ✅ Đúng | "Bạn gọi senior trước khi tự xem log" |
| ❌ Sai | "Kỹ năng Làm việc độc lập: mức 0" |

Câu sai lộ rubric. Người chơi đọc xong biết chính xác hệ thống đang đo gì và sẽ diễn cho khớp ở lần sau — bằng chứng thu được từ đó trở đi không còn phản ánh năng lực thật.

**2. Mỗi mục bắt buộc kèm `quote`** trích chữ người chơi. Không trích được thì không đưa vào. Nhận xét không có bằng chứng là ý kiến, không phải phản hồi.

**3. `could_improve` tối đa 2 mục.** Liệt kê hết mọi thiếu sót thì thành bảng điểm trá hình, và người chơi mới sẽ nản.

**4. Không số, không sao, không xếp hạng.** Luật cũ giữ nguyên. `debrief` là mô tả định tính, không phải điểm.

> Vì sao vẫn cho debrief dù nó làm giảm tính chống gian lận: người chơi không nhận được gì sau 12 phút thì không có lý do chơi tiếp, và một lớp đo không ai dùng thì không đo được gì cả. Luật 1 giữ lại phần lớn tính chống gian lận — biết mình gọi senior quá sớm không giống với biết hệ thống đang chấm "Làm việc độc lập".

## B7. Người chơi đánh giá scenario

Tách hoàn toàn khỏi `debrief`. Đây là dữ liệu **cải thiện nội dung**, không phải bằng chứng năng lực.

Sau khi kết thúc, tầng ứng dụng thu:

```
scenario_id · session_id · realism 1-5 · difficulty 1-5 · comment · ts
```

Hai luồng **không được trộn**: đánh giá của người chơi về scenario không bao giờ ảnh hưởng tới evidence hay ending của chính họ. Trộn vào là mở đường cho việc chấm thấp scenario để được nhận xét dễ hơn.

Runtime AI **không** thu phần này — nó là form của tầng ứng dụng.

## B8. Bảy lỗi hay gặp — tự kiểm mỗi lượt

1. Bịa số liệu mới không có trong skeleton.
2. Lộ rubric, hoặc nói bóng gió rằng vừa chấm điểm.
3. Để người chơi ở band thấp ra quyết định vượt quyền mà không NPC nào chặn.
4. `evidence_emitted[].quote` không trích đúng chữ người chơi, mà là lời AI diễn giải lại.
5. Hỏi follow-up quá trần `limitFollowup`, hoặc hỏi ở beat `CHOICE` / `quick_action`.
6. Phát `+2` cho beat người chơi đã xem hint.
7. `debrief` gọi tên kỹ năng thay vì tên hành vi.

---

# CÒN THIẾU — chưa thiết kế trong phiên bản này

Ghi lại để không rơi mất. Hai mục dưới đã được nêu trong review nhưng hoãn có chủ đích.

### 1. Context theo kinh nghiệm người chơi

Runtime hiện **không** nhận lịch sử chơi. Mọi lượt chơi giống nhau bất kể người chơi đã xong 0 hay 20 scenario ở job đó.

Nếu làm sau này: truyền thêm số scenario đã hoàn thành và các kỹ năng đang yếu, để NPC đối xử khác — người mới được dẫn nhiều hơn, người chơi lâu bị hỏi thẳng hơn. Cần cẩn thận vì nó phá tính so sánh: hai người cùng scenario nhưng khác lịch sử sẽ nhận đề bài khác nhau.

### 2. Thanh tiến độ và mở khoá band

Là **logic tầng ứng dụng**, không thuộc file scenario. Spec cố ý không định nghĩa `progress_weight` hay điều kiện hoàn thành, vì đó là quyết định sản phẩm chứ không phải thuộc tính của tình huống.

Khi làm, cần chốt trước ba điều mà spec này không trả lời được: bao nhiêu scenario thì đầy thanh · chơi lại có tính không · có tụt band không.

### 3. Chống trùng giữa các scenario cùng job

KHỐI A được viết để sinh **cả bộ của một job trong một lượt**, nên chưa có điều khoản cấm hai scenario cùng job neo vào cùng một task hoặc dựng cùng một cảnh. Khi sinh lẻ từng cái, phải tự chặn bằng tay — xem mục 4 của `HUONG-DAN-SINH-SCENARIO.md`.
