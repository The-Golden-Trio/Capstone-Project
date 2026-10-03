# occupation-data · Từ điển cấu trúc JSON

> Tài liệu mô tả **cấu trúc (skeleton)** và **ý nghĩa từng field** của mọi file `.json` trong `occupation-data/`.
> Sinh ngày 25/09/2026 bằng cách đọc toàn bộ dữ liệu (không đoán từ vài phần tử đầu): mọi key xuất hiện ở bất kỳ phần tử nào đều được liệt kê.
> Ý nghĩa field lấy từ chính dữ liệu, `_meta` của từng file, `specs/spec-scenario-KHOI1.md` v2.2 và `docs/project-hub/`.

## Mục lục

0. [Cách đọc tài liệu này](#0-cách-đọc-tài-liệu-này)
1. [Bản đồ các file JSON](#1-bản-đồ-các-file-json)
2. [Bảng mã dùng chung (enum)](#2-bảng-mã-dùng-chung-enum)
3. [`datasets/78_roles_unmerged.json`](#3-datasets78_roles_unmergedjson)
4. [`datasets/final_22_roles.json`](#4-datasetsfinal_22_rolesjson)
5. [`decisions/roles_18_playable.json`](#5-decisionsroles_18_playablejson)
6. [`datasets/work_environments.json`](#6-datasetswork_environmentsjson)
7. [`datasets/DRAFT_fit_quiz.json`](#7-datasetsdraft_fit_quizjson)
8. [`generated/skills_taxonomy.json`](#8-generatedskills_taxonomyjson)
9. [`generated/role_graph.json`](#9-generatedrole_graphjson)
10. [`scenarios/<ROLE>/<BAND>_<ARCHETYPE>.json`](#10-scenariosrole_band_archetypejson)
11. [Những chỗ lệch / lỗi dữ liệu phát hiện khi đọc](#11-những-chỗ-lệch--lỗi-dữ-liệu-phát-hiện-khi-đọc)

---

## 0. Cách đọc tài liệu này

Mỗi file có 4 phần: **Là gì** · **Kích thước** · **Ai dùng** · **Skeleton**.

Skeleton viết dạng JSONC (JSON có comment). Quy ước:

| Ký hiệu | Nghĩa |
|---|---|
| `"string"`, `0`, `0.0`, `true` | Kiểu dữ liệu của field |
| `"A" \| "B"` | Field chỉ nhận một trong các giá trị liệt kê (enum) |
| `[ { ... } ]` | Mảng, mô tả **một phần tử** đại diện |
| `// ...` | Ý nghĩa của field |
| `// (tuỳ chọn · 3/22)` | Field **không phải lúc nào cũng có**: chỉ có ở 3 trên 22 phần tử |
| `// vd: ...` | Giá trị ví dụ lấy từ dữ liệu thật |
| `null` trong kiểu | Field có thể là `null` |

---

## 1. Bản đồ các file JSON

| # | File | Là gì (1 dòng) | Kích thước | Sửa tay? |
|---|---|---|---|---|
| 3 | `datasets/78_roles_unmerged.json` | **Taxonomy gốc**: 78 nghề IT, mỗi nghề có ladder cấp bậc, task, skill, quan hệ nghề | 725 KB · 78 role · 263 level | ✅ |
| 4 | `datasets/final_22_roles.json` | **Bản chính của app**: 22 nghề sau khi gộp, có lương, skill ITviec, graph, 97 sự kiện, work-life | 518 KB · 22 role | ✅ |
| 5 | `decisions/roles_18_playable.json` | Danh sách 18 nghề được chọn để chơi được | 15 KB · 18 role | ✅ |
| 6 | `datasets/work_environments.json` | 6 kiểu môi trường làm việc (onsite, hybrid, ca kíp…) | 13 KB · 6 mục | ✅ |
| 7 | `datasets/DRAFT_fit_quiz.json` | 6 câu Get-to-know-me, đo người chơi trên 8 chiều fit | 5 KB · 6 câu | ✅ |
| 8 | `generated/skills_taxonomy.json` | 227 skill chuẩn hoá, mỗi skill một `skill_id` | 58 KB | ❌ script sinh |
| 9 | `generated/role_graph.json` | Graph 22 hành tinh + 64 cạnh + 39 alias, dùng cho bản đồ ngân hà | 52 KB | ❌ script sinh |
| 10 | `scenarios/SWE_BACKEND/L1_S_EXEC.json` | Kịch bản chơi L1 "Sửa bug nhỏ" | 20 KB | ✅ |
| 10 | `scenarios/SWE_BACKEND/L3_S_INCIDENT.json` | Kịch bản chơi L3 "Tối ưu API", **golden anchor** của spec | 20 KB | ✅ |

> ℹ️ Tên file đã đổi ngày 25/9 (README, script build và spec đã cập nhật theo). Đối chiếu tên cũ: `dataset_final_merged.json` → `78_roles_unmerged.json` · `dataset_22_roles_enriched_v3.json` → `final_22_roles.json` · `fit_quiz.json` → `DRAFT_fit_quiz.json` · `FILTERED_ROLES.csv` → `78_to_22_roles.csv`. Trong `_meta` của các file cũng còn dùng tên cũ.

### Quan hệ giữa các file

```
                   78_roles_unmerged.json  (78 nghề, levels[] theo band, task, skill)
                     │                 │
       lọc + gộp     │                 │  tasks[] + skills_*[] của 1 level
    (78_to_22_roles  │                 ▼
          .csv)      │          scenarios/<ROLE>/<BAND>_<ARCH>.json ──► work_environments.json
                     ▼                                  (context.work_environment_id)
            final_22_roles.json  ──────────────► roles_18_playable.json (chọn nghề chơi được)
              │   fit_dimensions (8 chiều) ◄──── DRAFT_fit_quiz.json (dùng chung 8 chiều)
              │
              ├─► scripts/build_skill_taxonomy.py ─► generated/skills_taxonomy.json
              │         (+ 78_roles, + scenarios)              │  skill_id
              └─► scripts/build_role_graph.py ◄────────────────┘
                              │
                              ▼
                   generated/role_graph.json
```

---

## 2. Bảng mã dùng chung (enum)

Các mã dưới đây xuất hiện ở **nhiều file**. Đọc phần này một lần, các phần sau chỉ tham chiếu lại.

### `role_code`: mã nghề

Dạng `<NHÓM>_<TÊN>`. Tiền tố cho biết nhóm nghề:

| Tiền tố | `role_group` | vd |
|---|---|---|
| `SWE_` | Software Engineering & Architecture | `SWE_BACKEND`, `SWE_ARCH_SOL`, `SWE_EM` |
| `DATA_` | Data, AI & Machine Learning | `DATA_DA`, `DATA_DE`, `DATA_AI` |
| `CLOUD_` | Cloud, DevOps & SRE | `CLOUD_DEVOPS`, `CLOUD_ENG` |
| `SEC_` | Cyber Security | `SEC_ENG`, `SEC_PENTEST`, `SEC_SOC` |
| `QA_` | Quality Assurance & Testing | `QA_MANUAL`, `QA_AUTO` |
| `PROD_` | Product & Project Management | `PROD_BA`, `PROD_PM` |
| `INFRA_` | IT Infrastructure & Enterprise Systems | `INFRA_HELPDESK`, `INFRA_ERP` |
| `EXEC_` | Executive Technology Layer (chỉ có trong 78) | `EXEC_CTO` |

### `archetype` (của **role**): nghề vào bằng cửa nào

Quyết định D-50. **Khác** với `scenario_archetype` (`S_*`) bên dưới.

| Giá trị | Nghĩa | Hệ quả dữ liệu |
|---|---|---|
| `A` | Có tuyển intern/fresher, ladder đầy đủ từ dưới lên | Có `levels[]` từ L1 |
| `B` | Vào bằng **chuyển ngang** từ nghề khác, gần như không tuyển fresher | `levels[]` bắt đầu từ L3+ |
| `C` | **Đích đến**: chỉ tới được sau nhiều năm ở nghề khác | **Không có `levels[]`**, dùng `destination_profile` |
| `D` | **Lai**: vừa có cửa vào entry-level, vừa là đích đến của nghề khác | Có `levels[]` và/hoặc `destination_profile` |

### `band`: cấp bậc toàn cục

Quyết định D-20: mỗi nghề **chỉ chiếm các band có thật ở VN**, không bịa band. Chuỗi `bands` dạng `"L1-L7"` = khoảng band nghề đó chiếm.

| Band | Tên | Năm KN tham khảo (SWE_BACKEND) |
|---|---|---|
| `L1` | Intern | 0 |
| `L2` | Fresher | 0–1 |
| `L3` | Junior | 1–2 |
| `L4` | Middle | 2–4 |
| `L5` | Senior | 4–7 |
| `L6` | Lead | 6–9 |
| `L7` | Principal / Manager | 8–12 |
| `L8` | Senior Manager | |
| `L9` | Head / Director | |
| `L10` | VP / C-level | |

### `evidence_level`: mức tin cậy của một mẩu dữ liệu

| Giá trị | Nghĩa |
|---|---|
| `A_VERIFIED` | Có nguồn thật đọc trực tiếp (JD thật, báo cáo ITviec) |
| `B_TITLE_SEEN` | Thấy title/nguồn gián tiếp, hoặc mượn từ level liền kề |
| `C_INFERRED` | **Suy luận**, chưa có nguồn neo |

Field `ev` trong `compensation.role_level_salary` là bản rút gọn của `evidence_level` (luôn bằng nhau).

### `fit_dimensions`: 8 chiều tính cách làm việc

Dùng chung cho quiz, sự kiện role-play và FitRadar. Mọi object `signal: { CHIỀU: điểm }` đều cộng/trừ vào 8 chiều này; điểm thường trong khoảng `-2..+2`.

| Mã | Nghĩa |
|---|---|
| `INTERRUPT` | Chịu được bị ngắt quãng, gọi ngoài giờ |
| `DEEP_WORK` | Thích tập trung sâu, làm một mình |
| `AMBIGUITY` | Chịu được yêu cầu mơ hồ, thiếu thông tin |
| `DETAIL` | Tỉ mỉ, chú ý chi tiết nhỏ |
| `PEOPLE` | Thích làm việc và thuyết phục người khác |
| `VISIBLE` | Cần thấy kết quả công việc rõ ràng |
| `REPETITION` | Chịu được công việc lặp lại |
| `PRESSURE` | Chịu áp lực thời gian và sự cố |

### `company_type`: loại hình công ty

| Mã | Nghĩa | Lương TB (ITviec) |
|---|---|---|
| `outsourcing` | Gia công dự án cho khách (thường nước ngoài) | 39,7 tr |
| `product_local` | Công ty tự xây và bán sản phẩm | 43,9 tr |
| `enterprise_bank` | IT trong ngân hàng, bán lẻ, doanh nghiệp non-IT | 43,0 tr |
| `bigtech_fdi` | Big tech / FDI / IT Services & Consulting | 48,2 tr |

### `work_environment_id`: môi trường làm việc

Định nghĩa đầy đủ ở [§6](#6-datasetswork_environmentsjson).

`WE_ONSITE_ENTERPRISE` · `WE_HYBRID_PRODUCT` · `WE_PROJECT_OUTSOURCING` · `WE_SHIFT_24_7` · `WE_FIELD_CLIENT` · `WE_REMOTE_GLOBAL`

### `education_path_id`: con đường học vấn

Chỉ xuất hiện trong `78_roles_unmerged.json` (11/78 role đã gán). **Không có file định nghĩa** trong folder này; nghĩa dưới đây suy từ tên.

| Mã | Nghĩa (suy từ tên) |
|---|---|
| `EDU_CS_REQUIRED` | Bắt buộc bằng CNTT/KHMT |
| `EDU_CS_PREFERRED` | Ưu tiên bằng CNTT, không bắt buộc |
| `EDU_ANY_PLUS_TRAINING` | Ngành nào cũng được, cộng khoá đào tạo |
| `EDU_CERT_DRIVEN` | Chứng chỉ quan trọng hơn bằng cấp |
| `EDU_DOMAIN_PLUS_IT` | Bằng chuyên ngành nghiệp vụ + kiến thức IT |

### Enum của kịch bản (scenario)

| Nhóm | Giá trị | Nghĩa |
|---|---|---|
| `scenario_archetype` | `S_EXEC` (L1+) | Thực thi một task chuẩn, đề bài rõ |
| | `S_AMBIG` (L2+) | Yêu cầu mơ hồ, phải hỏi lại |
| | `S_INCIDENT` (L3+) | Sự cố, áp lực thời gian |
| | `S_CONFLICT` (L4+) | Xung đột ưu tiên / con người |
| | `S_REVIEW` (L4+) | Review / mentor người khác |
| | `S_DECISION` (L6+) | Đánh đổi kiến trúc, ngân sách, cross-team |
| `activities[].type` | `FREETEXT` | Mặc định: người chơi tự gõ câu trả lời |
| | `CHOICE` | Chọn 1 trong 3 phương án |
| | `ORDERING` | Sắp xếp 4–6 bước theo thứ tự đúng |
| | `PRIORITIZING` | Chọn N việc làm trước trong danh sách 4–6 việc |
| Mốc chấm (`anchors`, `optionGrade`) | `+2` / `0` / `-1` | Tốt / tạm / kém. Dùng hint thì tối đa `0` |
| `random_events[].outcome` | `DIVERT` | Sự kiện chen ngang rồi NPC kéo về mạch chính |
| | `EARLY_END` | Kết thúc sớm, nhảy thẳng tới một `ending_id` |
| `endings[].type` | `GOOD` / `PARTIAL` / `BAD` / `SECRET` | Đạt / đạt nhưng trả giá / không đạt / nhận ra điều đề bài không hỏi |

---

## 3. `datasets/78_roles_unmerged.json`

**Là gì:** taxonomy gốc gồm **78 nghề IT** chưa gộp (kết quả "pass 1", 22/08/2026). Mỗi nghề mô tả ladder cấp bậc tại VN: mỗi band làm gì, cần skill gì, đi lên/đi ngang sang nghề nào, bằng chứng tới đâu. Đây là nguồn để viết kịch bản (`levels[].tasks[]` → `scenario_title`).

**Kích thước:** mảng 78 phần tử · 57 role có `levels[]` (tổng 263 level) · 29 role có `destination_profile` · 74/78 role `confidence_overall = "low"`.

**Ai dùng:** `docs/data/build-galaxy.mjs`, `scripts/build_skill_taxonomy.py`, `tools/visualize_dataset.html`, người viết kịch bản.

**Lưu ý chất lượng:** chỉ **40/263 level** có `evidence_level = A_VERIFIED`. Chưa role nào ghép lương (`salary_ref.joined = false`). Chỉ 19/78 role đã đếm tin tuyển dụng. Chỉ 11/78 role gán môi trường làm việc và học vấn.

### Skeleton: một phần tử của mảng gốc

```jsonc
[
  {
    // ─── Siêu dữ liệu sinh file ───────────────────────────────
    "_meta": {
      "pass": 1,                       // Lượt sinh dữ liệu (pass 1 = suy luận + hiệu chỉnh theo golden). (76/78)
      "batch": "string",               // Mã lô sinh, vd "B-DATA1", "C-DEST1". (76/78)
      "generated_at": "2026-08-22",    // Ngày sinh. (76/78)
      "golden_used": ["string"],       // File mẫu chuẩn đã dùng để hiệu chỉnh, vd "golden/SWE_FRONTEND.json (archetype A, 40 JD thật…)"
      "search_enabled": false,         // Lúc sinh có được tra web không. Luôn false
      "anchor_strength": "string",     // Mức neo vào dữ liệu thật: "không có" (64) | "hiệu chỉnh gián tiếp" (9) | "trung bình" | "mạnh (nhưng lệch nguồn)"…
      "anchor_note": "string",         // Giải thích vì sao neo mạnh/yếu, vd "CHƯA THU THẬP JD NÀO cho role này…"

      // ↓ Chỉ có ở 2 role "golden" đã làm kỹ bằng JD thật: SWE_FRONTEND (40 JD) và SWE_ARCH_ENT (10 JD)
      "status": "HOAN_CHINH",          // Trạng thái hoàn thiện
      "jd_count": 40,                  // Số JD thật đã đọc
      "capture_sheet": "string",       // File CSV ghi lại JD đã thu, vd "jd_capture_SWE_FRONTEND.csv"
      "note": "string",                // Ghi chú tổng
      "bands_covered": ["L1"],         // Band đã có bằng chứng (chỉ SWE_FRONTEND)
      "bands_thin": ["L3", "L6"],      // Band có ít bằng chứng
      "bands_missing": [],             // Band chưa có bằng chứng
      "version": "2.0",                // (chỉ SWE_ARCH_ENT) phiên bản file golden
      "archetype": "C",                // (chỉ SWE_ARCH_ENT)
      "jd_used_for_band": 7,           // (chỉ SWE_ARCH_ENT) số JD dùng để xác định band
      "jd_excluded": 3,                // (chỉ SWE_ARCH_ENT) số JD bị loại
      "target_roles_covered": ["SWE_ARCH_ENT"],
      "built_at": "2026-08-22",
      "changes_from_v1": ["string"]    // Danh sách thay đổi so với v1
    },

    // ─── Định danh nghề ───────────────────────────────────────
    "role_code": "CLOUD_ARCH",         // Mã nghề duy nhất (xem §2)
    "role_name": "Cloud Architect",    // Tên tiếng Anh
    "role_name_vn": "Kiến trúc sư đám mây", // Tên gọi của nghề ở Việt Nam
    "role_group": "Cloud, DevOps & SRE",    // Nhóm nghề (8 nhóm, xem §2)
    "archetype": "A" | "B" | "C" | "D",      // Nghề vào bằng cửa nào (xem §2). A 14 · B 35 · C 21 · D 8
    "archetype_reasoning": "string",   // Lý do xếp archetype đó
    "occupied_bands": ["L6", "L7", "L8"], // Các band nghề này thật sự có ở VN
    "occupied_bands_note": "string",   // (1/78) Ghi chú về cách xác định band
    "entry_note": "string | null",     // Cách một người bước vào nghề này, vd "Không có cửa vào entry-level. Đi lên từ DevOps…"

    // ─── Ladder theo band (archetype A / B / D) ──────────────  (57/78)
    "levels": [
      {
        "band": "L3",                          // Band của level này
        "title_vn": "Junior Backend Engineer", // Chức danh thường gặp ở band này
        "title_aliases": ["string"],           // Các cách gọi khác của chức danh, vd "Fresher SOC Analyst"
        "years_experience": "1-2",             // Số năm kinh nghiệm điển hình (chuỗi, có thể kèm chú thích)
        "core_output": "string",               // Đầu ra cốt lõi: ở band này người ta chịu trách nhiệm tạo ra cái gì, được/không được tự quyết gì
        "tasks": ["Tối ưu hóa các API bị chậm"], // Việc cụ thể ở band này. MỖI TASK = 1 SCENARIO (chép nguyên văn vào scenario_title). Chỉ 40/263 level có dữ liệu
        "skills_hard": [
          {
            "skill": "Redis",                  // Tên kỹ năng cứng (chép nguyên văn sang scenario)
            "level": "familiar" | "proficient" | "expert", // Mức thành thạo cần có ở band này
            "seen_in": ["FE20"]                // (48/130) Mã JD đã thấy skill này
          }
        ],
        "skills_soft": [                       // Kỹ năng mềm. ⚠️ Hỗn hợp 2 dạng:
          "Làm việc độc lập",                  //   dạng chuỗi (đa số)
          { "skill": "string", "seen_in": ["FE14"] } // dạng object có mã JD (role golden)
        ],
        "certifications": ["AWS SAA"],         // Chứng chỉ liên quan (chuỗi). (256/263)
        "evidence_level": "A_VERIFIED",        // Mức tin cậy của level (xem §2). A 40 · B 1 · C 222
        "evidence_company": "VNG Corporation | null",       // Công ty có JD làm bằng chứng
        "evidence_title_observed": "string | null",         // Title đã thấy trong JD thật
        "source_url": "https://... | null",                 // Link nguồn
        "evidence_jd_ids": ["FE01"],           // (7/263) Mã các JD làm bằng chứng
        "evidence_note": "string",             // (9/263) Ghi chú về chất lượng bằng chứng
        "calibration_note": "string",          // (3/263) Ghi chú hiệu chỉnh theo golden
        "academic_gate": "string",             // (1/263) Ngưỡng học lực, vd "Zalo yêu cầu GPA ≥ 7.5/10"
        "salary_observed": "string"            // (1/263) Lương thấy trong JD
      }
    ],

    // ─── Hồ sơ "đích đến" (archetype C, một phần D) ──────────  (29/78)
    // Nghề C không có levels[]: toàn bộ nghề gói trong một khối này, band lấy từ band_range
    "destination_profile": {
      "band_range": "L6 - L8",           // Khoảng band của nghề đích
      "min_years_experience": "6-15",    // Số năm kinh nghiệm tối thiểu
      "years_band_check": "string",      // Giải thích cách đối chiếu số năm với band
      "core_output": "string",           // Đầu ra cốt lõi của nghề đích
      "tasks": [ { "task": "string", "seen_in": ["ARCH09"] } ],  // ⚠️ Khác levels[]: task là object có mã JD
      "skills_hard": [ { "skill": "string", "level": "expert", "seen_in": ["ARCH03"], "evidence_note": "string" } ],
      "skills_soft": [ { "skill": "string", "seen_in": ["ARCH03"], "evidence_note": "string" } ],
      "certifications": [               // ⚠️ Khác levels[]: là object
        {
          "cert": "TOGAF 9 / TOGAF 10",  // Tên chứng chỉ
          "required": false | "conditional", // Có bắt buộc không
          "seen_in": ["ARCH02"],
          "evidence_note": "string"
        }
      ],
      "evidence_level": "C_INFERRED",    // 28 C · 1 A (SWE_ARCH_ENT)
      "evidence_company": "string | null",
      "evidence_title_observed": "string | null",
      "source_url": "string | null",
      // ↓ Chỉ SWE_ARCH_ENT
      "years_total_observed": { "min": "string", "max": "string", "typical": "string", "note": "string" }, // Số năm KN thấy trong JD
      "years_architecture_specific": { "observed": "string", "detail": "string", "seen_in": ["ARCH02"] },  // Số năm KN riêng mảng kiến trúc
      "core_output_axes": { "role_axis": "string", "band_axis": "string", "seen_in": ["ARCH01"] }        // Tách core_output theo trục nghề và trục band
    },

    // ─── Điểm rẽ nhánh IC / Management ───────────────────────
    // ⚠️ Kiểu hỗn hợp: 28 role là CHUỖI (vd "N/A — role này đã nằm trên nhánh Management…"), 50 role là OBJECT:
    "branching": {
      "branch_point_band": "L6",         // Band bắt đầu rẽ nhánh
      "branch_point_note": "string",     // Giải thích điểm rẽ
      "ic_track": [                      // Nhánh chuyên gia (Individual Contributor) sau điểm rẽ
        {
          "band": "L7",
          "title_vn": "Principal Backend Engineer",
          "note": "string",
          "years_experience": "string",  // (3/40)
          "evidence_jd_ids": ["FE32"]    // (3/40)
        }
      ],
      "management_track": [              // Nhánh quản lý sau điểm rẽ
        {
          "role_code": "SWE_EM",         // Nghề quản lý chuyển sang. (48/51)
          "from_band": "L6",             // Chuyển từ band nào. (48/51)
          "note": "string",
          // ↓ (3/51, chỉ SWE_FRONTEND) mô tả đầy đủ một nấc quản lý, cấu trúc như một level
          "band": "L7", "title_vn": "string", "title_aliases": ["string"], "years_experience": "string",
          "core_output": "string", "tasks": ["string"],
          "skills_hard": [ { "skill": "string", "level": "string", "seen_in": ["FE38"] } ],
          "skills_soft": [ { "skill": "string", "seen_in": ["FE40"] } ],
          "certifications": [ { "cert": "string", "required": false, "seen_in": ["FE40"] } ],
          "evidence_level": "A_VERIFIED", "evidence_company": "string", "evidence_jd_ids": ["FE38"],
          "source_url": "string", "evidence_note": "string"
        }
      ],
      "ic_track_note": "string",          // (12/50) Ghi chú khi không thấy band IC nào cao hơn
      "management_track_note": "string",  // (1/50)
      "explicit_dual_track_evidence": [   // (1/50) JD ghi rõ có 2 lộ trình
        { "jd_id": "FE34", "company": "One Mount", "note": "string" }
      ]
    },

    // ─── Biến thể trong cùng nghề ────────────────────────────  (77/78)
    "internal_variants": [
      {
        "variant_name": "Multi-cloud Architect", // Tên biến thể
        "focus": "string",                       // Biến thể này tập trung vào gì
        "evidence_level": "C_INFERRED",
        "note": "string",                  // (9/29)
        "suggested_global_band": "L3-L4",  // (3/29) Band gợi ý cho biến thể
        "anchor": "string",                // (5/29) Neo vào golden nào
        "evidence": "string",              // (4/29) Mô tả bằng chứng
        "seen_in": ["ARCH07"],             // (4/29)
        "is_architect_role": false,        // (1/29) Cờ cảnh báo trùng chữ trong title
        "warning": "string"                // (1/29)
      }
    ],

    // ─── Quan hệ với nghề khác ───────────────────────────────
    "related_roles": {
      "feeder_roles": [                    // Nghề mà người ta ĐI TỪ đó sang nghề này
        {
          "role_code": "SWE_BACKEND | null", // null = chưa map được mã
          "role_name": "Back-end Developer",
          "from_band": "L4 | null",        // Chuyển sang từ band nào của nghề nguồn
          "note": "string",
          "evidence_level": "C_INFERRED",
          "seen_in": ["ARCH02"]            // (4/126)
        }
      ],
      "next_steps": [                      // Nghề có thể TIẾN LÊN sau nghề này
        { "role_code": "CLOUD_ARCH | null", "role_name": "string", "note": "string",
          "evidence_level": "C_INFERRED", "from_band": "L6", "seen_in": ["ARCH01"] }
      ],
      "lateral_moves": [                   // Nghề có thể CHUYỂN NGANG
        { "role_code": "CLOUD_DEVOPS", "role_name": "string", "note": "string",
          "evidence_level": "C_INFERRED", "seen_in": ["ARCH09"] }
      ],
      "often_confused_with": [             // Nghề hay bị NHẦM với nghề này
        { "role_code": "string | null", "reason": "string", "evidence_level": "C_INFERRED",
          "note": "string", "seen_in": ["ARCH03"], "role_name_observed": "string" }
      ]
    },

    // ─── Khác biệt theo loại công ty ─────────────────────────
    "company_type_variance": {             // Nghề này trông khác nhau thế nào ở 4 loại công ty. "CHUA_CO_DU_LIEU" = chưa có
      "outsourcing": "Phổ biến, làm theo stack của dự án",
      "product_local": "Rất phổ biến, tự chủ tech stack, focus vào scale",
      "enterprise_bank": "Core banking, hệ thống cũ (Java/C#)…",
      "bigtech_fdi": "Scale cực lớn, kĩ năng thiết kế hệ thống phân tán quan trọng"
    },

    // ─── Môi trường làm việc & học vấn ───────────────────────
    "work_environment_ids": ["WE_HYBRID_PRODUCT"], // 0–4 môi trường điển hình (xem §6). Rỗng ở 67/78
    "work_environment_primary": "WE_HYBRID_PRODUCT | null", // Môi trường chính
    "work_environment_note": "string",             // Căn cứ gán, hoặc "Chưa gán. Thuộc Pass 2…"
    "education_path_ids": ["EDU_CS_PREFERRED"],    // 0–2 con đường học vấn (xem §2)
    "education_path_primary": "string | null",
    "education_path_note": "string",

    // ─── Nhu cầu tuyển dụng ──────────────────────────────────
    "job_outlook": {
      "method": "posting_count",           // Đo bằng đếm số tin tuyển đang mở
      "itviec_open_postings": 125,         // Số tin trên ITviec. null = chưa đo (59/78)
      "topdev_open_postings": null,        // Số tin trên TopDev. Luôn null
      "measured_at": "2026-08-22 | null",  // Ngày đếm
      "confidence": "low" | "medium",
      "method_note": "string",             // Cách đếm / lý do chưa đếm
      "itviec_slug_used": "backend-developer", // (18/78) Slug trang category ITviec đã dùng
      "itviec_query": "string"             // (1/78) Truy vấn tìm kiếm đã dùng
    },

    // ─── Lương ──────────────────────────────────────────────
    "salary_ref": {
      "source": "taxonomy_v2",             // Nguồn dự kiến
      "joined": false,                     // Đã ghép số lương vào chưa. Luôn false
      "note": "string",                    // "Chưa join. Thuộc Bước G…"
      "postings_with_salary": "0/10"       // (1/78) Bao nhiêu JD có công bố lương
    },

    // ─── Chất lượng dữ liệu ──────────────────────────────────
    "unknowns": ["string"],                // 2–9 điều CHƯA BIẾT về nghề này (không suy diễn, ghi lại)
    "verification_flags": [                // Cờ cần kiểm chứng. ⚠️ 2 dạng:
      {                                    // Dạng cờ chung (25/34)
        "id": "VF-T1-03",
        "severity": "cao" | "trung bình" | "thấp" | "đã giải quyết",
        "flag": "string",                  // Vấn đề
        "action": "string"                 // Việc cần làm
      },
      {                                    // Dạng cờ theo JD (9/34)
        "jd_id": "FE11", "company": "string",
        "issue": "string",                 // JD này lệch chỗ nào (title ≠ nội dung…)
        "action": "string"
      }
    ],
    "confidence_overall": "low | medium | …", // Độ tin cậy tổng của role. low 74/78
    "confidence_note": "string"            // (1/78)
  }
]
```

---

## 4. `datasets/final_22_roles.json`

**Là gì:** file dữ liệu **chính của app**. Từ 78 nghề, nhóm đã giữ 22 nghề có trải nghiệm role-play riêng, gộp 39 nghề vào các nghề này (quyết định D-52, xem `decisions/78_to_22_roles.csv`) và làm giàu thêm: lương ITviec 2025–26, skill tự khai ITviec, graph nghề có trọng số, **97 sự kiện role-play** (7 dùng chung + 90 riêng cho từng nghề) và dữ liệu work-life.

**Kích thước:** object với 5 key gốc · 22 role · 7 sự kiện chung · 103 cạnh graph.

**Ai dùng:** `docs/data/build.mjs`, `docs/data/build-galaxy.mjs`, `scripts/build_skill_taxonomy.py`, `scripts/build_role_graph.py`.

**Lưu ý chất lượng:** 7/22 nghề **không có dữ liệu skill và lương riêng** vì không nằm trong 18 vị trí của báo cáo ITviec: `SWE_UIUX`, `DATA_AI`, `CLOUD_DEVOPS`, `CLOUD_ENG`, `SEC_ENG`, `SEC_PENTEST`, `INFRA_NETWORK`. 81/97 sự kiện là `C_INFERRED`.

### Skeleton: cấp gốc

```jsonc
{
  "_meta": { ... },                 // Nguồn, tiến độ, bối cảnh lương toàn thị trường, kết quả audit → xem 4.1
  "fit_dimensions": { ... },        // Định nghĩa 8 chiều fit → xem §2
  "shared_events": [ ... ],         // 7 sự kiện dùng chung mọi nghề → xem 4.2
  "roles": [ ... ],                 // 22 nghề → xem 4.3
  "graph_edges_full": [ ... ]       // 103 cạnh graph đầy đủ (kể cả ABSORBED) → xem 4.4
}
```

### 4.1 `_meta`

```jsonc
"_meta": {
  "version": "1.0",
  "generated_at": "2026-08-28",
  "role_count": 22,
  "salary_source": "ITviec Vietnam IT Salary & Recruitment Market Report 2025-2026, tr.54 (n=1.839)", // Nguồn số lương
  "completed": ["Task 1 skill (ITviec self-evaluated, 15/22 role)", "..."],  // Các hạng mục làm giàu đã xong
  "not_completed": ["Task 1 skill theo tần suất — cần ITviec/TopDev report + đọc lướt JD"], // Hạng mục chưa xong

  "salary_context": {                // Lương trung vị TOÀN THỊ TRƯỜNG IT VN (VND/tháng), không riêng nghề nào
    "by_city_and_yoe": {             // Theo số năm kinh nghiệm × thành phố
      "<1 năm":  { "TOTAL": 14700000, "Hà Nội": 11600000, "TP.HCM": 13600000, "Đà Nẵng": null }, // null = mẫu quá nhỏ
      "1-2 năm": { ... }, "3-4 năm": { ... }, "5-8 năm": { ... }, ">8 năm": { ... }
    },
    "by_company_type": {             // Theo loại hình công ty (xem §2 company_type)
      "TOTAL": 43200000, "outsourcing": 39700000, "product_local": 43900000,
      "bigtech_fdi": 48200000, "enterprise_bank": 43000000,
      "_note": "string"              // Cách ánh xạ nhãn ITviec → 4 company_type
    },
    "by_company_origin": { "Việt Nam": 37300000, "Nhật Bản": 40100000, "Châu Âu": 51100000, "...": 0 }, // Theo quốc gia gốc công ty
    "by_company_size":   { "1-25": 41700000, "...": 0, "trên 5000": 45400000 }                        // Theo quy mô nhân sự
  },

  "skills_source": {                 // Nguồn dữ liệu skill
    "report": "ITviec Vietnam IT Salary & Recruitment Market Report 2025-2026",
    "section": "IT Talent Insight Snapshot (18 IT Positions), tr.69-105",
    "method": "string",              // Skill do chính người làm nghề TỰ KHAI (n=1.839), không đọc từ JD
    "why_unbiased": "string"         // Vì sao nguồn này ít bias hơn JD
  },

  "audit_2026_08_29": {              // Kết quả rà soát dữ liệu ngày 29/8
    "issues_found": 12,
    "issues_fixed": 4,
    "fixes": ["string"],             // Các lỗi đã sửa
    "remaining_known_limits": ["string"] // Giới hạn còn tồn tại (81/97 sự kiện C_INFERRED, 7 role thiếu skill…)
  }
}
```

### 4.2 `shared_events[]` và `roles[].roleplay_events.role_specific[]`: sự kiện role-play

Hai mảng dùng **cùng một cấu trúc**. Mỗi sự kiện là một màn ngắn: bối cảnh + 3 lựa chọn, mỗi lựa chọn cộng/trừ điểm vào 8 chiều fit. Đây là hệ nội dung **thứ hai**, tách biệt với scenario (§10).

```jsonc
{
  "event_id": "SH_LAYOFF",           // Mã sự kiện. Chung: "SH_<TÊN>". Riêng: "<ROLE_CODE>_<số>", vd "SWE_BACKEND_01"
  "role_code": null,                 // null = sự kiện chung. Có giá trị = sự kiện riêng của nghề đó
  "scope": "shared" | "role_specific",
  "title": "Công ty cắt giảm nhân sự",  // Tiêu đề sự kiện
  "setup": "string",                 // Bối cảnh mở đầu kể cho người chơi
  "measures": ["PRESSURE", "PEOPLE"],   // 1–3 chiều fit mà sự kiện này đo
  "band_range": ["L3", "L4", "L5"],  // Sự kiện có thể xuất hiện ở những band nào
  "frequency": "daily" | "weekly" | "monthly" | "rare", // Tần suất gặp ngoài đời
  "choices": [                       // Đúng 3 lựa chọn
    {
      "text": "Phân tích kế hoạch truy vấn, thêm chỉ mục phù hợp", // Lựa chọn hiển thị
      "outcome": "Xuống còn 200ms. Bạn hiểu sâu hơn về cơ sở dữ liệu.", // Hệ quả sau khi chọn
      "signal": { "DEEP_WORK": 2, "DETAIL": 2 }  // Điểm cộng/trừ vào chiều fit (xem §2), khoảng -2..+2
    }
  ],
  "evidence_level": "A_VERIFIED" | "C_INFERRED",
  "source_note": "string"            // Căn cứ của sự kiện, vd "Suy luận từ đặc thù nghề, chưa neo vào JD…"
}
```

### 4.3 `roles[]`: một nghề

```jsonc
{
  // ─── Định danh ──────────────────────────────────────────
  "stt": 1,                          // Số thứ tự 1–22
  "role_code": "SWE_BACKEND",        // Mã nghề (xem §2)
  "role_name": "Backend Developer",  // Tên tiếng Anh dùng trong app
  "role_name_vn": "Lập trình viên Back-end / Kỹ sư Back-end", // Tên gọi của nghề ở Việt Nam
  "role_group": "Software Engineering & Architecture",        // Nhóm nghề (7 nhóm, không còn EXEC)
  "roleplay_experience": "Viết logic nghiệp vụ và xử lý dữ liệu — phần người dùng không nhìn thấy", // Câu mô tả "chơi nghề này sẽ trải nghiệm gì"
  "archetype": "A" | "B" | "C" | "D", // Cửa vào nghề (xem §2). A 11 · B 6 · D 3 · C 2
  "bands": "L1-L7",                  // Khoảng band nghề này chiếm

  "similar_roles": [                 // Nghề đã bị GỘP vào nghề này (tên gọi khác của cùng trải nghiệm)
    {
      "role_code": "SWE_FULLSTACK",
      "role_name": "Full-stack Developer",
      "role_name_vn": "Lập trình viên Full-stack",
      "merge_reason": "Là Frontend + Backend, không phải trải nghiệm thứ ba" // Lý do gộp
    }
  ],
  "feeder_roles": [                  // Nghề mà người ta đi từ đó lên nghề này
    { "role_code": "SWE_BACKEND", "role_name": "Backend Developer" }
  ],
  "bands_correction": {              // (1/22, chỉ SEC_ENG) Ghi lại việc sửa khoảng band
    "old": "L3-L7", "new": "L1-L7", "evidence_level": "A_VERIFIED", "reason": "string"
  },

  // ─── Lương & phúc lợi ──────────────────────────────────
  "compensation": {
    "_source": {                     // Nguồn số lương
      "source": "string", "via": "https://...",
      "measured_period": "2025-2026", "currency": "VND", "period": "month"
    },
    "role_level_salary": {           // Lương TB riêng của nghề này
      "avg": 37800000,               // VND/tháng. null = báo cáo không có số riêng (8/22)
      "min": 0, "max": 0,            // (min 3/22 · max 6/22) Khoảng lương nếu có
      "note": "Chiếm 54,2% tổng nhu cầu tuyển dụng — cao nhất thị trường",
      "ev": "A_VERIFIED",            // = evidence_level (trùng lặp)
      "evidence_level": "A_VERIFIED"
    },
    "by_band": [                     // Lương theo band. ⚠️ Là số CHUNG toàn ngành, chưa tách theo nghề
      {
        "band": "L1",
        "label": "Thực tập sinh",    // Nhãn cấp bậc trong bảng ITviec
        "salary_avg": 6900000,       // Lương trung bình
        "salary_max": 8000000,       // Mức trần
        "evidence_level": "B_TITLE_SEEN",
        "note": "Lấy từ bảng lương THEO CẤP BẬC CHUNG toàn ngành, chưa tách theo role"
      }
    ],
    "_context": {                    // Bối cảnh thị trường. ⚠️ GIỐNG HỆT NHAU ở cả 22 role, trừ 3 field cuối
      "by_location": { "Hồ Chí Minh": 44900000, "Hà Nội": 40500000, "Đà Nẵng": 39600000 },
      "by_company_type": {
        "outsourcing": { "avg": 39700000, "note": "Gia công dự án IT cho khách hàng" },
        "product_local": { ... }, "enterprise_bank": { ... }, "bigtech_fdi": { ... }
      },
      "by_company_origin": { "Úc/New Zealand": 59900000, "...": 0 },
      "salary_factors": ["Kinh nghiệm thực tế (mạnh nhất trong 5 năm đầu)", "..."], // 5 yếu tố ảnh hưởng lương
      "benefits_common": [           // 8 phúc lợi phổ biến
        {
          "benefit": "Lương tháng 13",
          "frequency": "gần như phổ biến toàn thị trường", // Mức phổ biến
          "applies_to": ["SEC_ENG"]  // (44/176) Chỉ áp dụng cho các nghề này
        }
      ],
      "standard_equipment": "MacBook Pro (Apple Silicon 18GB/36GB RAM) + Màn hình 4K", // Thiết bị làm việc điển hình (RIÊNG từng nghề)
      "role_specific_benefits": ["Bản quyền GitHub Copilot / ChatGPT Plus"],           // Phúc lợi đặc thù nghề (RIÊNG từng nghề)
      "social_insurance_policy": "Đóng BHXH 100% lương gross"                           // Chính sách đóng bảo hiểm (RIÊNG từng nghề)
    },
    "unknowns": ["string"],          // Điều chưa biết về lương nghề này
    "itviec_2025_2026": {            // Lương TRUNG VỊ theo năm KN, riêng nghề (bảng tr.54 ITviec)
      "_source": { "report": "string", "page": "tr.54 — …", "sample": "n=1.839…", "metric": "median (trung vị)",
                   "currency": "VND", "period": "tháng", "note_NA": "N/A = cỡ mẫu quá nhỏ, KHÔNG phải không tồn tại" },
      "report_position": "Back-end Developer | null", // Tên vị trí tương ứng trong báo cáo. null = không có
      "evidence_level": "A_VERIFIED",
      "mapping_note": "string | null",   // (15/22) Giải thích khi phải ánh xạ gần đúng, vd SA dùng số của Project Lead
      "median_total": 31000000,          // Trung vị chung của nghề (mọi mức KN)
      "by_experience": [
        {
          "yoe": "<1 năm" | "1-2 năm" | "3-4 năm" | "5-8 năm" | ">8 năm", // Khoảng năm KN
          "band_hint": "L1-L2",          // Band tương ứng: <1→L1-L2 · 1-2→L3 · 3-4→L4 · 5-8→L5-L6 · >8→L7-L8
          "median": 12400000,            // Trung vị. null = N/A
          "available": true              // Báo cáo có số hay không
        }
      ],
      "gap_note": "string"               // (11/22) Cách vá chỗ thiếu số
    }
  },

  // ─── Sự kiện role-play ─────────────────────────────────
  "roleplay_events": {
    "role_specific": [ { ... } ],    // 4–5 sự kiện riêng của nghề. Cấu trúc xem 4.2
    "shared_pool_ref": "shared_events", // Tên key chứa sự kiện dùng chung ở cấp gốc
    "total_role_specific": 4         // Số sự kiện riêng
  },

  // ─── Graph nghề (góc nhìn từ nghề này) ─────────────────
  "graph_edges": {
    "progresses_to": ["SWE_ARCH_SOL", "SWE_TECHLEAD"], // Nghề có thể THĂNG TIẾN lên ("làm tiếp vài năm nữa em có thể thành…")
    "progresses_from": ["SWE_BACKEND"],               // Nghề đi lên tới nghề này
    "similar": ["SWE_FRONTEND", "SWE_MOBILE"],        // Nghề tương tự (không xếp hạng)
    "absorbed_roles": ["SWE_FULLSTACK"],              // Mã các nghề đã gộp vào (trùng với similar_roles[].role_code)
    "similar_ranked": [                               // Nghề tương tự CÓ XẾP HẠNG, dùng cho "role tương tự em có thể thử"
      {
        "role_code": "DATA_DE",
        "role_name": "Data Engineer",
        "weight": 0.45,              // Độ giống 0–1 (70% ngữ nghĩa + 30% skill)
        "why": "Data Engineer phần lớn đi lên từ Backend, chia sẻ kỹ năng hệ thống", // Lý do giống
        "shared_skills_top": ["html/css"] // Skill chung nổi bật
      }
    ],
    "_app_note": "string"            // Hướng dẫn app dùng từng loại cạnh ra sao
  },

  // ─── Skill (nguồn ITviec tự khai) ──────────────────────
  "skills_status": {
    "_status": "DA_LAM" | "KHONG_CO_TRONG_BAO_CAO", // Đã có skill / báo cáo không có nghề này (7/22)
    "_source": { ... },              // (15/22) Giống _meta.skills_source
    "report_position": "Back-end Developer", // (15/22) Tên vị trí trong báo cáo
    "evidence_level": "A_VERIFIED" | "C_INFERRED",
    "hard_skills_languages": [ { "skill": "Java", "rank": 1 } ],  // Ngôn ngữ lập trình dùng nhiều nhất, rank 1 = phổ biến nhất
    "hard_skills_frameworks": [ { "skill": ".NET", "rank": 1 } ], // Framework/công cụ dùng nhiều nhất
    "english_note": "string",        // (15/22) Ghi chú về radar tiếng Anh (chưa rút thành số)
    "soft_skills_note": "string",    // (15/22) Báo cáo không liệt kê soft skill trực tiếp
    "gap_note": "string",            // (7/22) Vì sao thiếu
    "next_step": "string"            // (7/22) Cần nguồn nào để bổ sung
  },

  // ─── Work-life (nguồn ITviec) ──────────────────────────
  "work_life": {
    "_source": { ... },              // (15/22)
    "evidence_level": "A_VERIFIED" | "C_INFERRED",
    "top_reasons_to_leave": [        // Lý do nghỉ việc hàng đầu của người làm nghề này
      { "label": "The salary is less than expected", "pct": 25.4 }  // label = lý do (tiếng Anh), pct = % người chọn
    ],
    "top_reasons_to_apply": [        // Lý do chọn nộp đơn vào công ty
      { "label": "50.5%", "pct": 29.3 } // ⚠️ LỖI: cả 75/75 label đang là chuỗi % chứ không phải lý do (xem §11)
    ],
    "top_universities_graduated": ["University of Science (VNU-HCM)", "(HCMUT)"], // (15/22) Trường người làm nghề hay tốt nghiệp. ⚠️ Một số tên bị cắt, vd "(HUST)"
    "top_company_industries": ["IT Services & IT Consulting"], // (15/22) Ngành của công ty họ đang làm
    "gap_note": "string"             // (7/22)
  }
}
```

### 4.4 `graph_edges_full[]`: toàn bộ cạnh graph

103 cạnh = 39 `ABSORBED` + 36 `SIMILAR` + 28 `PROGRESSES_TO`. Mỗi loại cạnh có bộ field khác nhau.

```jsonc
{
  "from": "SWE_UIUX",                // Nghề nguồn (luôn thuộc 22)
  "to": "SWE_FRONTEND",              // Nghề đích (với ABSORBED là nghề ngoài 22)
  "type": "ABSORBED" | "SIMILAR" | "PROGRESSES_TO",
    // ABSORBED      = "to" đã bị gộp vào "from". App dùng để tìm kiếm: gõ tên nghề đã gộp vẫn ra
    // SIMILAR       = hai nghề tương tự, có thể thử qua lại
    // PROGRESSES_TO = từ "from" có thể thăng tiến lên "to"
  "note": "string",                  // (75/103) Giải thích cạnh
  "_use": "string",                  // (67/103) App dùng cạnh này để làm gì

  // ↓ Chỉ cạnh SIMILAR (36/103)
  "weight": 0.55,                    // Độ giống tổng = 0.7 × semantic_weight + 0.3 × skill_weight
  "semantic_weight": 0.55,           // Độ giống về bản chất công việc (gán tay)
  "skill_weight": 0.0,               // Độ giống skill (Jaccard có trọng số). null = thiếu dữ liệu skill
  "shared_skills_top": ["html/css"], // Skill chung nổi bật
  "weight_method": "string",         // Mô tả công thức
  "evidence_level": "B_TITLE_SEEN"
}
```

---

## 5. `decisions/roles_18_playable.json`

**Là gì:** danh sách **18 nghề được chọn để chơi được** (quyết định D-52). Là bằng chứng cho quyết định, không phải dữ liệu chạy app.

**Kích thước:** mảng 18 phần tử. Archetype: A 11 · B 4 · D 3.

**Ai dùng:** tài liệu (quyết định D-52).

> ⚠️ Không phải tập con của 22 nghề: có 3 nghề **không nằm trong 22** (`QA_AUTO`, `DATA_ML`, `SEC_SOC`), và 7 nghề trong 22 **không có ở đây** (xem §11).

### Skeleton

```jsonc
[
  {
    "stt": 1,                        // Số thứ tự 1–18
    "role_code": "SWE_FRONTEND",     // Mã nghề (xem §2)
    "role_name": "Frontend Developer",           // Tên tiếng Anh
    "role_name_vn": "Lập trình viên Front-end",  // Tên gọi của nghề ở Việt Nam
    "roleplay_experience": "Dựng giao diện, thấy kết quả ngay trên màn hình", // Câu tóm tắt trải nghiệm khi chơi nghề này
    "similar_roles": [               // 0–7 nghề đã gộp vào nghề này
      { "role_code": "SWE_WEB", "role_name": "Web Developer", "role_name_vn": "Lập trình viên Web" }
    ],
    "career_destinations": [         // 0–7 nghề đích có thể thăng tiến lên (tương đương progresses_to)
      { "role_code": "SWE_TECHLEAD", "role_name": "Tech Lead" }
    ],
    "archetype": "A" | "B" | "D",    // Cửa vào nghề (xem §2). Không có C vì nghề đích không chơi từ đầu được
    "bands": "L1-L7",                // Khoảng band nghề chiếm
    "role_group": "Software Engineering & Architecture" // Nhóm nghề
  }
]
```

---

## 6. `datasets/work_environments.json`

**Là gì:** danh mục **6 kiểu môi trường làm việc** ở VN (giờ giấc, onsite/remote, ca kíp, nhịp release…). Nghề và kịch bản **trỏ vào** đây bằng ID, không chép nội dung.

**Kích thước:** 6 môi trường · trạng thái `CHUA_VERIFY` (bản nháp, suy luận từ hiểu biết thị trường, chưa đối chiếu JD).

**Ai dùng:** `78_roles_unmerged.json` (`work_environment_ids`), kịch bản (`context.work_environment_id`).

### Skeleton

```jsonc
{
  "_meta": {
    "file": "shared/work_environments.json", // Đường dẫn gốc lúc tạo
    "version": "0.1-draft",
    "status": "CHUA_VERIFY",         // Chưa được kiểm chứng
    "note": "string",                // Bản nháp, cần duyệt
    "usage": "string",               // Cách tham chiếu: role trỏ bằng work_environment_ids[] + work_environment_primary
    "assignment_rule": "string",     // Luật gán: mỗi role 1–3 ID, căn cứ JD có nhắc ca kíp/on-call/onsite/remote…
    "company_type_note": "string"    // Phân biệt company_type (loại công ty) với môi trường làm việc
  },
  "environments": [
    {
      "id": "WE_ONSITE_ENTERPRISE",  // Mã môi trường (xem §2)
      "name_vn": "Onsite doanh nghiệp lớn / ngân hàng", // Tên tiếng Việt
      "name_en": "Onsite Enterprise",                    // Tên tiếng Anh
      "summary": "string",           // Mô tả ngắn môi trường này
      "attributes": {                // Thuộc tính mô tả ngày làm việc
        "location": "onsite",        // Làm ở đâu: onsite / hybrid / remote / tại khách hàng
        "hours": "giờ hành chính cố định (thường 8:00-17:00)", // Giờ giấc
        "schedule_type": "regular" | "shift" | "regular_with_windows", // Hành chính / ca kíp / hành chính + khung giờ cắt chuyển ban đêm
        "flexibility": "thấp",       // Mức linh hoạt: rất thấp → rất cao
        "dress_code": "string",      // Trang phục
        "on_call": "string",         // Có phải trực ngoài giờ không
        "travel": "string",          // Mức đi công tác
        "pace": "string",            // Nhịp làm việc
        "release_cadence": "string"  // Tần suất phát hành phần mềm
      },
      "typical_company_types": ["Ngân hàng", "Viễn thông"], // Loại công ty điển hình (chữ tự do, không phải mã company_type)
      "typical_role_codes": ["SWE_BACKEND"], // Nghề thường gặp môi trường này
      "pros": ["Ổn định, ít rủi ro mất việc"], // 3 điểm cộng
      "cons": ["Công nghệ thường cũ hơn thị trường vài năm"], // 2–3 điểm trừ
      "note_for_students": "string", // Lời khuyên cho người đang chọn nghề
      "confidence": "high" | "medium" | "low", // Độ chắc chắn của mô tả
      "note_vn": "string",           // (1/6, WE_HYBRID_PRODUCT) Ghi chú phạm vi áp dụng
      "verification_needed": "string" // (1/6, WE_FIELD_CLIENT) Chỗ cần người kiểm lại
    }
  ]
}
```

---

## 7. `datasets/DRAFT_fit_quiz.json`

**Là gì:** 6 câu hỏi **Get-to-know-me** (bước "Hiểu bản thân", tuỳ chọn theo D-29). Mỗi câu có 2 vế; mỗi vế cộng điểm vào 1–2 trong 8 chiều fit. Cộng dồn thành vector 8 chiều, chuẩn hoá rồi so cosine với nghề để gợi ý.

**Kích thước:** 8 chiều · 6 câu · 12 vế. Trạng thái `CHUA_VERIFY`, `C_INFERRED`: câu tự soạn, **không** lấy từ bộ đo tâm lý chuẩn hoá (không phải RIASEC hay Big Five).

**Ai dùng:** `docs/data/build.mjs` → màn `/quiz`.

### Skeleton

```jsonc
{
  "_meta": {
    "file": "shared/fit_quiz.json",  // Đường dẫn gốc lúc tạo
    "version": "0.1-draft",
    "status": "CHUA_VERIFY",
    "evidence_level": "C_INFERRED",
    "purpose": "string",             // Mục đích: đo người chơi trên 8 chiều fit_dimensions
    "method_note": "string",         // Câu tự soạn, không từ bộ đo chuẩn
    "scoring": "string",             // Cách chấm: cộng dồn → vector 8 chiều → chuẩn hoá → cosine với nghề
    "usage": "string",               // Bỏ qua được, không bị thiệt
    "unknowns": ["string"]           // 3 giới hạn đã biết (6 câu quá ít để đo 8 chiều…)
  },
  "dimensions": ["INTERRUPT", "DEEP_WORK", "..."], // Danh sách 8 chiều (nghĩa xem §2)
  "questions": [
    {
      "question_id": "q1",           // Mã câu hỏi q1–q6
      "prompt": "Một buổi chiều làm việc lý tưởng với bạn là", // Câu hỏi hiển thị
      "options": [                   // Đúng 2 vế
        {
          "option_id": "q1a",        // Mã vế: <question_id> + a/b
          "text": "Bốn tiếng liền không ai làm phiền, làm xong đúng một thứ", // Nội dung vế
          "signal": { "DEEP_WORK": 2, "INTERRUPT": -1 } // Điểm cộng/trừ vào chiều fit khi chọn vế này (-2..+2)
        }
      ]
    }
  ]
}
```

---

## 8. `generated/skills_taxonomy.json`

**Là gì:** **từ điển skill chuẩn hoá**. Gom mọi tên skill rải rác trong các dataset và kịch bản, gộp các cách viết khác nhau (vd `AngularJS`, `Angularjs` → `Angular.js`) thành một `skill_id` duy nhất. `skill_id` là khoá dùng chung cho pipeline sinh kịch bản và graph nghề.

**Kích thước:** 227 skill = 169 hard + 58 soft · 31 skill có alias.

**Ai dùng:** `scripts/build_role_graph.py`, webpack API (copy vào `dist`), module API cũ. **Không sửa tay**: sinh bằng `python3 occupation-data/scripts/build_skill_taxonomy.py`.

### Skeleton

```jsonc
{
  "_meta": {
    "generated_at": "2026-09-15",
    "generator": "occupation-data/build_skill_taxonomy.py", // Script sinh ra file
    "sources": ["dataset_22_roles_enriched_v3.json", "9_roles_tier1_pass2.json", "..."], // File nguồn đã quét (tên cũ, 1 file đã bị xoá — xem §11)
    "counts": { "total": 227, "hard": 169, "soft": 58, "with_aliases": 31 },
    "note": "string"                 // Cách lookup: casefold(chuỗi) rồi so với name_vn và aliases. Chuỗi ghép như "ReactJS/VueJS" giữ nguyên chờ review
  },
  "skills": [
    {
      "skill_id": "hard_angular_js", // Khoá duy nhất: "hard_<slug>" hoặc "soft_<slug-không-dấu>", vd "soft_binh_tinh_duoi_ap_luc"
      "name_vn": "Angular.js",       // Tên hiển thị chuẩn
      "type": "hard" | "soft",       // Kỹ năng cứng / mềm
      "category": "language" | "framework" | "tool" | null, // Phân loại skill cứng. null với skill mềm
      "aliases": ["AngularJS", "Angularjs"], // Các cách viết khác đã gộp về skill này
      "sources": ["dataset_22_roles_enriched_v3"] // Skill xuất hiện ở file nguồn nào. Kịch bản ghi dạng "scenario:<đường dẫn>"
    }
  ]
}
```

---

## 9. `generated/role_graph.json`

**Là gì:** graph nghề dạng **node + edge** sẵn cho frontend vẽ **bản đồ ngân hà**: 22 hành tinh, các đường bay giữa chúng, và các nghề đã gộp (vệ tinh). Được dựng từ `final_22_roles.json` + `skills_taxonomy.json`.

**Kích thước:** 22 node · 64 cạnh (36 `SIMILAR` + 28 `PROGRESSES_TO`) · 39 alias `ABSORBED`. 7 node không có dữ liệu skill.

**Ai dùng:** `docs/data/build-galaxy.mjs`, webpack API, module API cũ. **Không sửa tay**: sinh bằng `python3 occupation-data/scripts/build_role_graph.py` (chạy **sau** taxonomy).

### Skeleton

```jsonc
{
  "_meta": {
    "generated_at": "2026-09-15",
    "generator": "occupation-data/build_role_graph.py",
    "source": "dataset_22_roles_enriched_v3.json + output/skills_taxonomy.json", // File nguồn (tên cũ)
    "counts": {
      "nodes": 22, "edges": 64,
      "edges_by_type": { "ABSORBED": 39, "PROGRESSES_TO": 28, "SIMILAR": 36 },
      "absorbed_aliases": 39,
      "nodes_without_skill_data": ["CLOUD_DEVOPS", "..."] // 7 node thiếu skill → khoảng cách PROGRESSES_TO = 1.0
    },
    "distance_rules": {              // Cách tính "khoảng cách" giữa hai nghề (càng nhỏ càng gần)
      "SIMILAR": "1 - weight",
      "PROGRESSES_TO": "max(0.05, 1 - Jaccard(skillSet A, skillSet B)); Jaccard=0 nếu thiếu skill data",
      "ABSORBED": "không phải node — ghi ở absorbed[]"
    },
    "note": "string"                 // ABSORBED không vẽ thành cạnh, giữ ở absorbed[] để UI vẽ vệ tinh
  },

  "nodes": [                         // 22 hành tinh. ⚠️ Field viết camelCase, khác snake_case ở các file khác
    {
      "roleCode": "CLOUD_DEVOPS",    // Mã nghề
      "nameVn": "Kỹ sư DevOps",      // Tên tiếng Việt
      "nameEn": "DevOps Engineer",   // Tên tiếng Anh
      "roleGroup": "Cloud, DevOps & SRE", // Nhóm nghề (= "thiên hà")
      "bands": "L3-L7",              // Khoảng band
      "hasSkillData": false,         // Có dữ liệu skill không (15 true / 7 false)
      "skillIds": ["hard_python"],   // 0–22 skill_id của nghề (tham chiếu skills_taxonomy)
      "absorbedRoles": [             // Nghề đã gộp vào node này (vệ tinh)
        { "roleCode": "CLOUD_AUTO", "note": "Tự động hoá là phần việc lõi của DevOps" }
      ]
    }
  ],

  "edges": [                         // 64 đường nối giữa các hành tinh
    {
      "id": "PROGRESSES_TO:DATA_DA->DATA_DE", // Khoá duy nhất: "<TYPE>:<from>-><to>"
      "from": "DATA_DA",
      "to": "DATA_DE",
      "type": "SIMILAR" | "PROGRESSES_TO", // Tương tự / thăng tiến (xem 4.4)
      "distance": 0.4375,            // Khoảng cách 0.05–1.0 theo distance_rules. Càng nhỏ càng dễ bay sang
      "distanceMethod": "string",    // Công thức đã dùng cho cạnh này (3 loại: 1-weight / 1-jaccard / no_skill_data)
      "requiredSkills": ["hard_python", "hard_sql"], // 0–5 skill_id cần có để bay sang (cho BR-03)
      "sharedSkillCount": 9,         // Số skill chung giữa hai nghề
      "note": "string | null"        // Giải thích (có ở cạnh SIMILAR)
    }
  ],

  "absorbed": [                      // 39 nghề đã gộp, dạng phẳng (cùng dữ liệu với nodes[].absorbedRoles)
    {
      "parentRoleCode": "CLOUD_DEVOPS", // Nghề chủ
      "roleCode": "CLOUD_AUTO",         // Nghề đã bị gộp
      "note": "string"                  // Lý do gộp
    }
  ]
}
```

---

## 10. `scenarios/<ROLE>/<BAND>_<ARCHETYPE>.json`

**Là gì:** mỗi file là **một kịch bản chơi được** (một "nhiệm vụ chính"). Một kịch bản = một task của một cặp (nghề, band), chép nguyên văn từ `78_roles_unmerged.json → levels[].tasks[]`. Kịch bản gồm 3–4 **activity** cố định, dài 10–15 phút, có NPC, sự kiện ngẫu nhiên và 2–5 kết cục. Luật viết đầy đủ ở `specs/spec-scenario-KHOI1.md` (v2.2).

**Hiện có:**

| File | Tiêu đề | Band | Archetype | Activity | Kết cục |
|---|---|---|---|---|---|
| `SWE_BACKEND/L1_S_EXEC.json` | Tham gia fix các bug mức độ ưu tiên thấp | L1 | `S_EXEC` | PRIORITIZING → CHOICE → ORDERING → FREETEXT | SECRET, GOOD, PARTIAL, BAD |
| `SWE_BACKEND/L3_S_INCIDENT.json` | Tối ưu hóa các API bị chậm (**golden anchor**) | L3 | `S_INCIDENT` | CHOICE → FREETEXT × 3 | SECRET, GOOD, PARTIAL × 2, BAD |

**Ai dùng:** `docs/data/build.mjs` (khai trong danh sách `SCENARIOS`), `scripts/build_skill_taxonomy.py`, runtime game (`packages/game-core`).

### Skeleton

```jsonc
{
  // ─── Siêu dữ liệu ──────────────────────────────────────
  "_meta": {
    "spec_version": "scenario-2.2",  // Phiên bản spec kịch bản đã tuân theo
    "generated_at": "2026-09-14",
    "source_dataset": "9_roles_tier1_pass2.json", // Dataset lấy task/skill (file này đã bị xoá — xem §11)
    "fallback_tier": 1 | 2 | 3,      // Lấy task/skill ở đâu: 1 = đúng level đó · 2 = mượn level liền kề (±1 band) · 3 = từ core_output + task chung của nhóm nghề
    "golden_used": ["scenarios/SWE_BACKEND/L3_S_INCIDENT.json"], // Kịch bản mẫu đã dùng để hiệu chỉnh. [] nếu chính nó là mẫu
    "note": "string"                 // Ghi chú của người viết
  },

  // ─── Tiêu đề ───────────────────────────────────────────
  "scenario_title": "Tối ưu hóa các API bị chậm", // Tên nhiệm vụ hiển thị cho người chơi. PHẢI BẰNG context.task
  "shortname": "Tối ưu API",         // Tên ngắn cho UI

  // ─── Vai người chơi nhận ───────────────────────────────
  "job": {
    "role_code": "SWE_BACKEND",      // Nghề
    "role_name_vn": "Lập trình viên Back-end",
    "band": "L3",                    // Cấp bậc
    "title_vn": "Junior Backend Engineer", // Chức danh người chơi đóng
    "years_experience": "1-2",       // Số năm KN của nhân vật
    "user_context": "string",        // Tiểu sử nhân vật: vào công ty bao lâu, đã làm được gì
    "core_output": "string"          // Đầu ra cốt lõi của band này (chép từ dataset)
  },

  // ─── Bối cảnh chung của kịch bản ───────────────────────
  "context": {
    "scenario_archetype": "S_INCIDENT", // Kiểu tình huống (xem §2). Phải đã mở khoá ở band này
    "task": "Tối ưu hóa các API bị chậm", // Neo về dataset để máy kiểm. PHẢI BẰNG scenario_title
    "skills_hard": ["Redis", "RESTful API Design"], // Kỹ năng cứng được đo. Chép NGUYÊN VĂN từ dataset. Runtime cấm chấm skill ngoài danh sách này
    "skills_soft": ["Giải quyết vấn đề", "Làm việc độc lập"], // Kỹ năng mềm được đo. Như trên
    "company_type": "product_local", // Loại công ty trong truyện (xem §2)
    "work_environment_id": "WE_HYBRID_PRODUCT", // Môi trường làm việc (xem §6)
    "situation": "string",           // Mở màn: mấy giờ, ở đâu, chuyện gì vừa xảy ra
    "stakes": "string",              // Được/mất gì nếu làm tốt/không tốt
    "time_pressure": "Trong buổi sáng", // Áp lực thời gian trong truyện
    "estimated_minutes": 13          // Thời lượng chơi ước tính, bắt buộc trong [10, 15]
  },

  // ─── Nhân vật phụ (NPC) ────────────────────────────────
  "cast": [
    {
      "npc_id": "an",                // Mã NPC, dùng để gắn lời thoại
      "role_in_scene": "Senior Backend, reviewer của bạn", // Vai trò trong cảnh
      "pressure": "string",          // NPC đang chịu áp lực gì (để AI diễn cho thật)
      "voice": "Ngắn gọn, hay hỏi ngược lại kiểu 'em đã xem log chưa?'" // Giọng nói / tính cách
    }
  ],

  // ─── Các activity (xương sống kịch bản) ────────────────
  "activities": [
    {
      "activity_id": "a1",           // Mã activity a1–a4
      "type": "FREETEXT" | "CHOICE" | "ORDERING" | "PRIORITIZING", // Loại tương tác (xem §2)
      "choice_reason": "string | null", // Loại đóng (≠ FREETEXT) BẮT BUỘC giải thích vì sao không để người chơi tự gõ. null với FREETEXT
      "summary": "Phát hiện sự cố, chọn nước đi đầu tiên", // Tóm tắt activity (cho người viết/debug)
      "isOrigin": true,              // Activity bắt đầu. Đúng MỘT activity có true
      "forward_to": "a2" | "END",    // Activity kế tiếp, hoặc "END" để sang kết cục
      "context": {                   // Bối cảnh riêng của activity
        "skills_in_play": ["Làm việc độc lập"], // Skill được đo ở activity này. PHẢI khớp đúng tập observes[].skill
        "company_flavour": "string", // Loại công ty ảnh hưởng thế nào tới tình huống này
        "job_scope": "string"        // Ở band này ĐƯỢC tự làm gì, KHÔNG ĐƯỢC làm gì (giới hạn quyền)
      },
      "setup": "string",             // Diễn biến hiển thị cho người chơi
      "npc_line": "string | null",   // Câu NPC nói mở activity
      "input_prompt": "string | null", // Câu nhắc người chơi làm gì, vd "Trả lời An về chuyện cache."

      // ↓ Chỉ CHOICE: 3 phương án, cả 3 phải là lựa chọn một người thật có thể chọn
      "options": ["string", "string", "string"], // null ở loại khác
      "optionGrade": ["+2", "-1", "0"],          // Mốc điểm cho từng phương án, cùng thứ tự
      "optionWhy": ["string", "string", "string"], // Lý do từng mốc, dùng khi tổng kết

      // ↓ Chỉ ORDERING và PRIORITIZING
      "items": [
        {
          "item_id": "s1" | "i1",    // ORDERING dùng s1…, PRIORITIZING dùng i1…
          "text": "string",          // Nội dung bước / việc
          "note": "string"           // (chỉ PRIORITIZING, có thể thiếu) Manh mối để phân biệt việc gấp với việc dễ thấy
        }
      ],
      "correct_order": ["s1", "s2", "s3", "s4", "s5"], // Chỉ ORDERING: thứ tự đúng. Chấm theo số cặp đảo: 0 → +2 · 1–2 → 0 · ≥3 → -1
      "pick_count": 2,               // Chỉ PRIORITIZING: số việc phải chọn
      "must_pick": ["i2"],           // Chỉ PRIORITIZING: thiếu → -1
      "should_pick": ["i3"],         // Chỉ PRIORITIZING: đủ must_pick + có should_pick → +2, thiếu → 0
      "must_not_pick": ["i5"],       // Chỉ PRIORITIZING: chọn phải → -1

      // ↓ Nhịp và trợ giúp
      "quick_action": false,         // true = có đếm ngược (khoảnh khắc thật sự gấp). Không có hint, không có follow-up
      "time_limit_seconds": 30,      // Số giây đếm ngược, trong [20, 60]. null khi quick_action = false. Hết giờ = -1
      "hints": [                     // 0–1 gợi ý, chỉ activity FREETEXT được có
        {
          "text": "An: 'Em thử đếm xem một request đang chạm DB bao nhiêu lần…'", // Viết như lời NPC, chỉ hướng không đưa đáp án
          "costs_ceiling": true      // Luôn true: xem hint thì activity đó tối đa mốc 0
        }
      ],
      "limitFollowup": 2,            // Số câu hỏi đào sâu tối đa AI được sinh. CHOICE/quick_action luôn 0. Tổng cả kịch bản ≤ 2 (L1–L2) · ≤ 3 (L3–L5) · ≤ 4 (L6+)
      "followup_goal": "string | null", // AI nên đào sâu về điều gì. null khi limitFollowup = 0
      "closing_prompt": "string",    // Câu NPC chốt lại trước khi sang activity kế. Không tính điểm

      // ↓ Rubric chấm
      "observes": [                  // Kỹ năng quan sát ở activity này
        {
          "skill_type": "hard" | "soft",
          "skill": "Làm việc độc lập", // Tên skill, chép nguyên văn từ context.skills_*
          "anchors": {               // Ba mốc hành vi quan sát được (không dùng tính từ)
            "+2": "Tự khoanh vùng bằng dữ liệu (log, query plan) trước khi gọi người khác", // Làm tốt
            "0":  "Restart để thử — có lý nhưng không thu được thông tin gì",               // Tạm được
            "-1": "Ném vấn đề sang senior khi chưa tự xem gì"                                // Chưa tốt
          }
        }
      ]
    }
  ],

  // ─── Sự kiện ngẫu nhiên ────────────────────────────────
  "random_events": [
    {
      "event_id": "re_escalate",     // Mã sự kiện, tiền tố "re_"
      "chance": 0.35,                // Xác suất xảy ra (0–1)
      "after_activity": "a3",        // Nổ ra sau activity nào
      "condition": null | {          // Điều kiện để được gieo. null = luôn gieo (chỉ được với DIVERT)
        "min_plus2": null,           // Số mốc +2 tối thiểu đã đạt
        "max_minus1": null,          // Số mốc -1 tối đa
        "min_minus1": 2              // Số mốc -1 tối thiểu (dùng để chỉ nổ khi người chơi đã lệch)
      },
      "text": "string",              // Nội dung sự kiện hiển thị
      "outcome": "DIVERT" | "EARLY_END", // Rẽ hướng rồi quay lại / kết thúc sớm
      "divert_note": "string | null",   // DIVERT: NPC kéo người chơi về mạch chính thế nào
      "early_ending_id": "e_bad | null" // EARLY_END: nhảy thẳng tới ending này
    }
  ],

  // ─── Kết cục ───────────────────────────────────────────
  "endings": [                       // 2–5 kết cục, runtime xét theo priority tăng dần, lấy cái ĐẦU TIÊN khớp
    {
      "ending_id": "e_root_cause",   // Mã kết cục, tiền tố "e_"
      "type": "SECRET" | "GOOD" | "PARTIAL" | "BAD", // Xem §2
      "priority": 1,                 // Thứ tự xét. SECRET luôn 1. Cái lớn nhất phải là catch-all (mọi condition = null)
      "condition": {
        "min_plus2": 2,              // Số mốc +2 tối thiểu trong cả lượt. null = không xét
        "max_minus1": 0,             // Số mốc -1 tối đa. null = không xét
        "extra": "string | null"     // Chỉ SECRET: hành vi cụ thể người chơi phải tự làm (AI phải trích được câu chữ làm bằng chứng)
      },
      "text": "string",              // Đoạn kết hiển thị cho người chơi
      "reveals": "string | null",    // Chỉ SECRET: điều người chơi học được
      "reachable_by_event": false    // true nếu có random_event EARLY_END trỏ tới kết cục này
    }
  ],

  // ─── Chất lượng ────────────────────────────────────────
  "evidence_level": "A_VERIFIED" | "B_TITLE_SEEN" | "C_INFERRED", // Theo fallback_tier: 1 giữ nguyên của level · 2 → B · 3 → C
  "coverage_note": "string",         // Giải thích lấy task/skill từ đâu, vì sao chọn archetype này
  "unknowns": ["string"]             // Điều chưa chắc chắn trong kịch bản (số liệu minh hoạ, ngưỡng chưa kiểm chứng…)
}
```

---

## 11. Những chỗ lệch / lỗi dữ liệu phát hiện khi đọc

| # | File | Vấn đề | Ảnh hưởng |
|---|---|---|---|
| 1 | `specs/` | Spec bắt buộc `role_code` phải có trong `datasets/roles.csv`, nhưng file này đã chuyển vào `_archive/occupation-data/roles.csv` | Bước kiểm tra `role_code` trong hướng dẫn sinh kịch bản không chạy được |
| 2 | `roles_18_playable.json` ↔ `final_22_roles.json` | 18 **không** nằm trọn trong 22. Có ở 18 mà không có ở 22: `QA_AUTO`, `DATA_ML`, `SEC_SOC`. Có ở 22 mà không có ở 18: `SWE_ARCH_SOL`, `SWE_TECHLEAD`, `SWE_EM`, `DATA_AI`, `SEC_ENG`, `INFRA_ERP`, `INFRA_NETWORK` | Mâu thuẫn với mô tả "78 → 22 → 18" |
| 3 | `final_22_roles.json` | `work_life.top_reasons_to_apply[].label` **đều là chuỗi phần trăm** (75/75, vd `"50.5%"`) thay vì tên lý do | Mất nội dung lý do nộp đơn; lỗi lúc trích từ PDF |
| 4 | `final_22_roles.json` | `top_universities_graduated` có tên bị cắt, vd `"(HUST)"`, `"(HCMUT)"`, `"Technology (VNU-UET)"` | Hiển thị xấu nếu đưa lên UI |
| 5 | `final_22_roles.json`, `role_graph.json` | 7/22 nghề không có skill → mọi cạnh `PROGRESSES_TO` chạm tới chúng có `distance = 1.0` (14/28 cạnh) | Khoảng cách không phản ánh thực tế cho nửa số cạnh thăng tiến |
| 6 | `skills_taxonomy.json`, 2 kịch bản | Trỏ tới `9_roles_tier1_pass2.json` (đã xoá), `output/dataset_final_merged.json`, `scenario-golden/*.json` (đường dẫn cũ) | Chạy lại script sẽ ra ít skill hơn bản hiện tại |
| 7 | `78_roles_unmerged.json` | Cùng một field nhưng khác kiểu: `branching` (chuỗi ở 28 role, object ở 50) · `levels[].skills_soft[]` (chuỗi hoặc object) · `certifications` (chuỗi trong `levels`, object trong `destination_profile`) · `tasks` (chuỗi trong `levels`, object trong `destination_profile`) · `verification_flags[]` (2 dạng) | Code đọc file phải xử lý cả hai kiểu |
| 8 | `78_roles_unmerged.json` | `education_path_ids` dùng mã `EDU_*` nhưng **không có file định nghĩa** trong folder | Chưa rõ nghĩa chính thức của từng mã |
| 9 | `role_graph.json` | Field viết **camelCase** (`roleCode`, `nameVn`), các file khác viết **snake_case** (`role_code`, `role_name_vn`) | Dễ nhầm khi join dữ liệu |
| 10 | `final_22_roles.json` | `compensation._context` lặp y hệt ở 22 role (trừ 3 field), và `compensation.by_band` là lương chung toàn ngành chứ không riêng nghề | File phình to; dễ hiểu nhầm là lương riêng |
