# KHỐI 1 — SPEC CỐ ĐỊNH cho Pass 1

> Thay thế PHẦN A và mục "ĐỊNH DẠNG OUTPUT" của `prompt-career-path-vn-v2.md`.
> Dán y nguyên vào mọi batch. Bốn chỗ đánh dấu 🔧 là phần đã sửa so với bản v2 gốc.

---

## 1. Thang bậc toàn cục

Mọi role map lên thang này. Một role KHÔNG bắt buộc chiếm hết các band.

```
L1  intern                            | 0 năm      | học việc, có mentor kèm sát
L2  fresher                           | 0–1 năm    | task đã chia nhỏ, review 100%
L3  junior                            | 1–2 năm    | tự làm task rõ ràng, cần review
L4  middle                            | 2–4 năm    | tự chủ 1 module, ít cần review
L5  senior                            | 4–7 năm    | tự chủ 1 domain, review người khác
L6  lead / staff                      | 6–9 năm    | dẫn dắt kỹ thuật 1 team/1 hệ thống
L7  principal / architect / manager   | 8–12 năm   | chịu trách nhiệm cross-team
L8  senior manager / senior architect | 10–15 năm  | chịu trách nhiệm cross-domain
L9  head / director                   | 12+ năm    | chịu trách nhiệm 1 function
L10 VP / C-level                      | 15+ năm    | chịu trách nhiệm tổ chức
```

### 🔧 Ràng buộc số năm ⟷ band (MỚI)

`min_years_experience` **phải nằm trong khoảng hợp của band thấp nhất tới band cao nhất** trong `occupied_bands`.

- Role chiếm L6–L8 → khoảng hợp lệ là 6–15.
- Sàn không được thấp hơn sàn của band thấp nhất. Trần không được vượt trần của band cao nhất.
- Muốn ghi số nằm ngoài khoảng đó → **bắt buộc** giải thích trong `destination_profile.years_band_check` và thêm một mục vào `unknowns`.
- Nếu không có bằng chứng để thu hẹp, hãy lấy **trọn khoảng của band**. Khoảng rộng là cách biểu đạt trung thực việc thiếu dữ liệu, không phải sự cẩu thả.

> Lý do: toàn bộ giá trị của thang L1–L10 nằm ở chỗ band và số năm khoá vào nhau. Lệch một chỗ là lúc render sản phẩm sẽ hiện "L7 = 8–12 năm" ngay cạnh một role L7 ghi "7–10 năm".

---

## 2. Quy tắc tối thượng

- CHỈ sinh các cấp bậc THỰC SỰ TỒN TẠI trên thị trường VN cho role đang xét.
- TUYỆT ĐỐI KHÔNG bịa cấp bậc cho đủ khuôn. Thiếu band nào thì bỏ trống band đó.
- Role không có L1–L4 (ví dụ Enterprise Architect) là output ĐÚNG, không phải output thiếu.

### 🔧 Quy tắc khoảng trống lấy mẫu (MỚI)

Bộ JD tham chiếu **cố ý chỉ phủ một số role**. Khi role đang xét không có JD nào:

- Ghi `_meta.anchor_strength: "không có"` và nói rõ trong `unknowns`: **"CHƯA THU THẬP JD NÀO cho role này"**.
- **CẤM** viết thành "title này không tồn tại tại VN" hay bất kỳ phát biểu nào về thị trường. Không thấy trong một mẫu vốn không nhắm tới role đó thì không nói lên điều gì về thị trường.
- Hai câu này khác nhau hoàn toàn khi đưa vào báo cáo.

---

## 3. Nhãn độ tin cậy

```
"A_VERIFIED"    — có JD thật KÈM URL sống, đã mở được trong phiên này
"B_TITLE_SEEN"  — chắc chắn title tồn tại tại VN, nêu được tên công ty, không có URL sống
"C_INFERRED"    — suy luận từ chuẩn ngành, CHƯA xác minh trên thị trường VN
```

Ở Pass 1: **mọi** `evidence_level` = `C_INFERRED`, **mọi** `source_url` = `null`, `tasks[]` / `skills_hard[]` / `skills_soft[]` / `certifications[]` để **rỗng**. Chúng thuộc về Pass 2.

KHÔNG BAO GIỜ bịa URL. Trả về `null` là hành vi ĐÚNG.

---

## 4. 🔧 Bốn nhóm company_type (ĐÃ ĐỔI TÊN)

Key trong `company_type_variance` **bắt buộc** đúng bốn chữ sau:

```
outsourcing      — FPT Software, KMS, NashTech, Rikkeisoft, TMA, CodeLeap, SoftwareOne
product_local    — MoMo, VNG, Base.vn, Katalon, One Mount, FireGroup
enterprise_bank  — Techcombank, VPBank, ACB, HDBank, TPBank, NAB, Shinhan
bigtech_fdi      — NAVER, Axon, Binance, NVIDIA, Money Forward, ANDPAD, Workday
```

⚠ Bản v2 gốc dùng `product_startup` và `bigtech_unicorn` — **hai key này đã bỏ**. Lý do: `product_startup` gộp hai trục vốn độc lập. NAVER làm product in-house nhưng là FDI lớn, không phải startup. Trục mô hình kinh doanh (`product_inhouse` / `outsourcing`) được ghi riêng ở capture sheet, không nằm ở đây.

Nhóm nào không có JD → ghi đúng chuỗi `"CHUA_CO_DU_LIEU"`. Không mô tả bằng kiến thức chung.

---

## 5. 🔧 Schema output (ĐÃ BỔ SUNG 4 KEY)

Trả về DUY NHẤT một JSON object, không markdown fence, không preamble. Nhiều role thì ngăn bằng `===SPLIT===`.

```jsonc
{
  "_meta": {
    "pass": 1,
    "batch": "<mã batch>",
    "generated_at": "<YYYY-MM-DD>",
    "golden_used": [],
    "search_enabled": false,
    "anchor_strength": "mạnh | trung bình | không có",
    "anchor_note": "<neo vào golden nào, hoặc nói rõ là không có JD>"
  },

  "role_code": "...", "role_name": "...", "role_name_vn": "...", "role_group": "...",
  "archetype": "A|B|C|D",
  "archetype_reasoning": "<căn cứ THỊ TRƯỜNG VN, không nói lý thuyết chung>",
  "occupied_bands": [],
  "entry_note": null,

  // archetype A/B dùng "levels"; archetype C dùng "destination_profile"
  "levels": [],
  "destination_profile": {
    "band_range": "...",
    "min_years_experience": "...",
    "years_band_check": "<🔧 MỚI — đối chiếu với mục 1>",
    "core_output": "<phải có ĐỦ HAI TRỤC: trục ROLE + trục BAND>",
    "tasks": [], "skills_hard": [], "skills_soft": [], "certifications": [],
    "evidence_level": "C_INFERRED",
    "evidence_company": null,
    "evidence_title_observed": null,
    "source_url": null
  },

  "branching": "...",
  "internal_variants": [],

  "related_roles": {                    // 🔧 MỚI — trước đây 3 mảng này nằm ở cấp cao nhất
    "feeder_roles": [],
    "next_steps": [],
    "lateral_moves": [],
    "often_confused_with": []
  },

  "company_type_variance": {
    "outsourcing": "...", "product_local": "...",
    "enterprise_bank": "...", "bigtech_fdi": "..."
  },

  "work_environment_ids": [], "work_environment_primary": null, "work_environment_note": "...",
  "education_path_ids": [], "education_path_primary": null, "education_path_note": "...",

  "job_outlook": {                      // 🔧 MỚI — Pass 1 để null hết, thuộc Bước F
    "method": "posting_count",
    "itviec_open_postings": null, "topdev_open_postings": null,
    "measured_at": null, "confidence": "low", "method_note": "..."
  },

  "salary_ref": {                       // 🔧 MỚI — Pass 1 để trống, thuộc Bước G
    "source": "taxonomy_v2", "joined": false, "note": "..."
  },

  "verification_flags": [],             // 🔧 MỚI — chỗ để xả nghi ngờ mà không phá dataset
  "confidence_overall": "high|medium|low",
  "unknowns": []                        // BẮT BUỘC, tối thiểu 2 mục
}
```

Mọi phần tử trong `feeder_roles` / `next_steps` / `lateral_moves` đều phải có **cả** `role_code` **và** `role_name`. `role_code` phải tồn tại trong `roles.csv`; không map được thì để `role_code: null` và giữ `role_name` — **không tạo mã giả**.

Trường nào không áp dụng → `null` hoặc mảng rỗng. **KHÔNG xoá key.**

---

## 6. Ba lỗi hay gặp — tự kiểm trước khi trả kết quả

1. `unknowns` rỗng hoặc chỉ 1 mục → dấu hiệu tự tin giả. Bắt buộc ≥ 2.
2. `company_type_variance` điền đủ 4 nhóm bằng chữ đẹp trong khi chỉ có JD của 1 nhóm → 3 nhóm kia phải là `CHUA_CO_DU_LIEU`.
3. `core_output` chỉ có trục ROLE (công nghệ) mà thiếu trục BAND (phạm vi tự chủ) → dán được sang band khác → vô nghĩa trong career path.
