# Audit: dữ liệu `occupation-data/` so với spec sinh scenario

> Ngày 02/10/2026. Đối chiếu 9 file JSON với `JSON_SCHEMA.md`, `specs/spec-scenario-KHOI1.md` (v2.2) và `specs/HUONG-DAN-SINH-SCENARIO.md`.
> Mọi con số trong file này đều do script đếm trên toàn bộ dữ liệu, không lấy mẫu vài phần tử đầu. Không đọc `_archive/`.

## TL;DR

1. **`JSON_SCHEMA.md` phủ đủ 100% key** của cả 9 file, và phần lớn con số khớp dữ liệu. Có khoảng 8 chỗ mô tả sai hoặc thiếu so với spec (xem §2), nhưng không thiếu field nào.
2. **Dữ liệu chưa đủ để sinh scenario theo spec cho phần lớn nghề.** Nếu giữ đúng luật của spec, 18 nghề chơi được có tổng 108 job (nghề × band). Chỉ **41 job sinh hợp lệ được (khoảng 140 scenario)**. 67 job còn lại không sinh được. **9/18 nghề bị chặn ở mọi band.**
3. Ba nút chặn chính đều nằm ở dữ liệu, không nằm ở spec:
   - `company_type_variance` toàn `CHUA_CO_DU_LIEU` ở 64/78 nghề, nên không chọn được `company_type`.
   - `work_environment_ids` rỗng ở 67/78 nghề, nên không chọn được `work_environment_id`.
   - Chỉ 40/263 level có `tasks[]`.
4. Một số chỗ spec và hướng dẫn tự mâu thuẫn hoặc đã lỗi thời. Đáng chú ý nhất:
   - Tier 3 không thực thi được.
   - Script kiểm trong hướng dẫn chạy là crash.
   - Tên file scenario sẽ đụng nhau.
   - Ngoài ra cần chốt danh sách nghề: sinh theo 78, 22 hay 18.
5. Kịch bản L3 (golden) đạt hết luật. Kịch bản L1 **vi phạm A9**: có hint ở activity `PRIORITIZING` và `ORDERING`, và hint ở `ORDERING` lộ đáp án.

---

## 1. Dữ liệu có đáp ứng được spec sinh scenario không? (quan trọng nhất)

### 1.1 Hợp đồng đầu vào: mỗi field scenario lấy từ đâu

Spec (KHỐI A) chỉ đọc **`datasets/78_roles_unmerged.json`** và `datasets/work_environments.json`. Các file khác (`final_22_roles`, `role_graph`, `skills_taxonomy`, quiz, sự kiện) **không** tham gia sinh scenario.

| Field trong scenario | Lấy từ (78_roles) | Tình trạng |
|---|---|---|
| `job.role_code` | `role_code`, kiểm với `datasets/roles.csv` | ⚠️ `roles.csv` đã chuyển vào `_archive/`, luật kiểm gãy |
| `job.band` | `levels[].band` (A/B/D) · `destination_profile.band_range` (C) | ⚠️ Với C, `band_range` là **khoảng** ("L6 - L8"), spec không nói chọn band nào |
| `job.title_vn`, `years_experience` | `levels[].title_vn`, `years_experience` | ⚠️ `destination_profile` **không có** `title_vn` |
| `job.core_output` | `levels[].core_output` | ✅ 263/263 level có |
| `context.task` | `levels[].tasks[]` (chuỗi) | ❌ chỉ **40/263** level có, thuộc 10 nghề |
| `context.skills_hard` | `levels[].skills_hard[].skill` | ✅ ở 40 level có task, kèm `level` (familiar/proficient/expert) để chỉnh độ khó mốc +2 |
| `context.skills_soft` | `levels[].skills_soft[]` | ⚠️ Là chuỗi ở 9 nghề, nhưng là **object `{skill, seen_in}`** ở `SWE_FRONTEND` |
| `context.company_type` | key của `company_type_variance` mà value ≠ `CHUA_CO_DU_LIEU` | ❌ **64/78** nghề có cả 4 nhóm là `CHUA_CO_DU_LIEU` |
| `context.work_environment_id` | `work_environment_ids[]` → `work_environments.json` | ❌ rỗng ở **67/78** nghề |
| `activities[].context.company_flavour` | chuỗi `company_type_variance[company_type]` | ✅ nếu có, `null` nếu không có |
| `evidence_level` | `levels[].evidence_level` | ✅ 40 level có task đều `A_VERIFIED` |
| Tier 2 | level band ±1 có `tasks[]` | ✅ chạy được |
| Tier 3 | `core_output` + "task chung của `role_group`" | ❌ **Không file nào chứa "task chung của role_group"** |

Đã kiểm thêm: 185 tên skill của 40 level có task đều tra được trong `generated/skills_taxonomy.json` (0 skill thiếu).

### 1.2 Độ phủ thực tế: 18 nghề chơi được

Một job được tính là **sinh hợp lệ** khi đạt đủ bốn điều kiện:

- Có task, ở tier 1 hoặc tier 2.
- Có ít nhất một `company_type` có dữ liệu.
- Có ít nhất một `work_environment_id`.
- Có ít nhất 2 soft skill, vì A8 yêu cầu 2–3 soft mỗi scenario.

Band lấy theo `occupied_bands` trong 78. Dấu `*` nghĩa là sinh bằng tier 2 (mượn band liền kề).

Mã lý do trong cột "Không sinh được":

- `T3`: không có task ở band đó, cũng không có ở band liền kề.
- `ct`: không có `company_type` dùng được.
- `WE`: không có `work_environment_id`.
- `soft1`: level chỉ có 1 soft skill.

| Nghề | Archetype | Band (18) | Có trong 22? | Sinh được | Không sinh được |
|---|---|---|---|---|---|
| `SWE_FRONTEND` | A | L1-L7 | có | L1 L2 L3 L4 L5 L6 | L7(soft1) L8(soft1) |
| `SWE_BACKEND` | A | L1-L7 | có | L1* L2 L3 L4 L5 | L6(soft1) L7(soft1) |
| `SWE_MOBILE` | A | L1-L7 | có | L1* L2 L3 L4 L5* | L6(T3) L7(T3) |
| `SWE_GAME` | A | L1-L7 | có | — | L1–L7 (T3, ct, WE) |
| `SWE_UIUX` | A | L1-L7 | có | — | L1–L7 (T3, ct, WE) |
| `SWE_EMBEDDED` | A | L1-L7 | có | — | L1–L7 (T3, ct, WE) |
| `QA_MANUAL` | A | L1-L5 | có | L1* L2 L3 L4 L5 | — |
| `QA_AUTO` | D | L3-L7 | **không** | — | L3–L7 (T3, ct, WE) |
| `DATA_DA` | A | L1-L6 | có | L1* L2 L3 L4 | L5(soft1) L6(soft1) |
| `DATA_ML` | B | L3-L7 | **không** | — | L3–L7 (T3, ct, WE) |
| `DATA_DE` | B | L3-L7 | có | — | L3–L7 (T3, ct, WE) |
| `CLOUD_DEVOPS` | B | L3-L7 | có | L3 L4 L5 | L6(soft1) L7(soft1) |
| `CLOUD_ENG` | D | L2-L6 | có | — | L2–L6 (T3, ct, WE) |
| `SEC_SOC` | A | L1-L6 | **không** | L1* L2 L3 | L4(soft1) L5(soft1) L6(T3) |
| `SEC_PENTEST` | B | L3-L7 | có | — | L3–L7 (T3, ct, WE) |
| `PROD_BA` | A | L1-L7 | có | L1* L2 L3 L4 L5 L6* | L7(T3) |
| `PROD_PM` | D | L3-L9 | có | — | L3–L9 (T3, ct, WE) |
| `INFRA_HELPDESK` | A | L1-L4 | có | L1* L2 L3 L4* | — |

**Tổng:** 108 job. 41 job sinh được (31 tier 1, 10 tier 2), tương đương khoảng 140 scenario. 67 job không sinh được.

Trong 4 nghề thuộc 22 mà không thuộc 18:

- `SWE_TECHLEAD` và `SWE_EM` là archetype C. Chúng chỉ có `destination_profile` với `tasks: []`.
- `DATA_AI`, `SEC_ENG`, `INFRA_ERP`, `INFRA_NETWORK` đều ở tier 3 và không có `ct`/`WE`.

Trong cả 78 nghề, chỉ duy nhất `SWE_ARCH_ENT` có `destination_profile.tasks`.

### 1.3 Nút chặn cần xử lý trước khi sinh hàng loạt (P0)

**B1. `company_type_variance` gần như trống (64/78 nghề).**
Spec A6 cấm chọn nhóm `CHUA_CO_DU_LIEU`, coi đó là bịa bối cảnh. Spec cũng không có phương án dự phòng.

Hướng xử lý: chọn một trong hai.

- Bổ sung dữ liệu cho ít nhất 1 nhóm/nghề ở 9 nghề bị chặn.
- Hoặc thêm luật fallback vào A6, ví dụ cho phép `company_type` "trung tính" kèm `company_flavour: null` và ghi vào `unknowns`.

**B2. `work_environment_ids` rỗng (67/78 nghề).**
Spec bắt buộc lấy từ mảng này, và script kiểm cũng kiểm đúng điều đó. `work_environments.json` đã có `typical_role_codes`, nhưng chỉ ở một chiều và còn `CHUA_VERIFY`.

Hướng xử lý: gán `work_environment_ids` cho 18 nghề chơi được. Có thể khởi đầu bằng cách đảo ngược `typical_role_codes`.

**B3. Tier 3 thực chất là tier 4.**
Spec A5 định nghĩa tier 3 là "`core_output` + task chung của `role_group`", nhưng không file nào có dữ liệu đó. Ngoài ra:

- Level tier 3 cũng không có skill, nên A8 (2–3 soft, 1–2 hard, chép nguyên văn) không thể thoả.
- Luật hàng rào ở A6 ("cấm quan sát skill ngoài `context.skills_*`") khiến runtime không có gì để đo.

Hướng xử lý: chọn một trong hai.

- Bỏ tier 3 khỏi spec.
- Hoặc định nghĩa nguồn task/skill cho tier 3. Ví dụ dùng `final_22_roles → skills_status.hard_skills_*`; nguồn này có ở 15/22 nghề.

**B4. Level chỉ có 1 soft skill (A8 cần 2–3).**
Có 6 level đã có task nhưng chỉ 1 soft skill: `SWE_BACKEND` L6, `SWE_FRONTEND` L7, `SWE_FULLSTACK` L5, `CLOUD_DEVOPS` L6, `DATA_DA` L5, `SEC_SOC` L4. Các band mượn tier 2 từ những level này cũng bị ảnh hưởng theo.

Hướng xử lý: chọn một trong hai.

- Bổ sung soft skill cho các level này.
- Hoặc nới A8 thành "1–3 soft, tối đa bằng số soft của level".

**B5. Archetype C/D chưa được spec mô tả đủ.**

- `band_range` là một khoảng, trong khi job phải là một band.
- `destination_profile` không có `title_vn`.
- `destination_profile.tasks[]` là object `{task, seen_in}`, không phải chuỗi. Vì vậy "chép nguyên văn" là chép `task.task`.
- Nghề D có cả `levels[]` lẫn `destination_profile` (ví dụ `SWE_ARCH_SOL`: levels ở L3, L5; destination ở L6–L8). Spec chỉ nói "A/B/D dùng `levels[]`", nên phần destination của D bị bỏ quên.

**B6. Tên file và ID scenario sẽ đụng nhau.**
Quy ước hiện tại `scenarios/<ROLE>/<BAND>_<ARCHETYPE>.json` và ID trong `docs/data/build.mjs` (`ROLE_BAND_ARCH`) giả định mỗi archetype có một scenario. Nhưng spec A3 nói archetype chỉ là **thuộc tính**, còn số scenario bằng số task.

- Ở L1 chỉ mở `S_EXEC`, nên mọi task L1 đều là `S_EXEC`.
- Ví dụ `SWE_FRONTEND` L1 có 6 task, tức 6 file cùng tên `L1_S_EXEC.json`.

Hướng xử lý: đặt tên theo task, ví dụ `<BAND>_T<index>_<ARCHETYPE>.json`, hoặc một slug của task.

**B7. Chưa chốt danh sách nghề để sinh.**

- Spec sinh theo 78 nghề, app dùng 22, chơi được 18. Ba tập này không lồng nhau.
- `SEC_SOC`, `QA_AUTO`, `DATA_ML` chơi được nhưng không có trong 22. Hệ quả: chúng không có hành tinh trong `role_graph.json`, không có lương, không có sự kiện.
- `SEC_SOC` là nghề duy nhất trong ba nghề này có task.
- Band cũng lệch giữa các file:
  - `SEC_ENG`: 22 ghi `L1-L7`, nhưng `occupied_bands` trong 78 là L3–L7. Luật "band phải nằm trong `occupied_bands`" sẽ chặn L1–L2.
  - `SWE_ARCH_SOL`: 22 ghi `L6-L8`, còn 78 là L3–L8.
  - `SWE_FRONTEND`: 78 có thêm L8.

### 1.4 Chỗ spec / hướng dẫn / script kiểm lệch nhau (P1)

| # | Ở đâu | Vấn đề | Hệ quả |
|---|---|---|---|
| 1 | Script kiểm (HUONG-DAN §7) | Đọc `datasets/roles.csv`, file này không còn | **Crash ngay dòng 7** (`FileNotFoundError`) |
| 2 | Script kiểm | Công thức ngân sách vẫn theo bản 2.1, thiếu hệ số `PRIORITIZING` 1.5 và `ORDERING` 2 | Báo **FAIL oan** cho `L1_S_EXEC` (6.5 phút); tính đúng theo 2.2 là 10 |
| 3 | Script kiểm | `set(lv['skills_soft'])` lỗi khi soft skill là object | **Crash (`TypeError`) với mọi job `SWE_FRONTEND`**, mà đây lại là nghề hướng dẫn khuyên làm đầu tiên |
| 4 | Script kiểm | Không kiểm: trần activity đóng theo band; mỗi loại đóng ≤ 1; hint chỉ ở `FREETEXT`; `ORDERING` 4–6 bước; `PRIORITIZING` có `note` và chọn 2–3; số soft 2–3 / hard 1–2; `estimated_minutes` khớp công thức | Lỗi ở L1 (§1.5) lọt qua |
| 5 | HUONG-DAN | Ghi "A15. Mười chín lỗi" (spec có 20 lỗi) · "Schema ở mục A9" (thực tế là A14) · đặt tên `<ROLE_CODE>_<BAND>_<ARCHETYPE>.json` (thực tế là `<ROLE>/<BAND>_<ARCH>.json`) | Người mới dán thiếu khối hoặc lưu sai chỗ |
| 6 | Spec A12 | `condition` của random event được nói là "đúng hình dạng `endings[].condition`" (`min_plus2`, `max_minus1`, `extra`), nhưng ví dụ ngay bên dưới và golden L3 lại dùng **`min_minus1`**, không có `extra`. KHỐI B không định nghĩa `min_minus1` | Runtime không biết cách đánh giá `min_minus1` |
| 7 | Spec A5 tier 2 | Mượn nguyên bộ task của band liền kề, nên L1 và L2 có **cùng `scenario_title`**. Điều này mâu thuẫn tinh thần A4 ("dán sang band khác được là sai") | Người chơi thấy cùng tên nhiệm vụ ở hai band |
| 8 | Spec A7 | Không nói cách làm tròn `estimated_minutes` | Golden L3 khai 13, công thức ra 13.5 |
| 9 | 2 scenario, `skills_taxonomy` | `source_dataset` / `sources` trỏ `9_roles_tier1_pass2.json` (đã xoá) | **Dữ liệu không mất**: đã kiểm, task, skill (L2, L3) và `core_output`, `title_vn` (L1, L3) của `SWE_BACKEND` trong 78 khớp từng ký tự với 2 scenario. Chỉ cần sửa tên nguồn |

### 1.5 Hai scenario hiện có, chấm theo spec 2.2

`L3_S_INCIDENT.json` (golden): đạt mọi luật máy kiểm được, trừ `estimated_minutes` khai 13 trong khi công thức ra 13.5.

`L1_S_EXEC.json`: đạt các luật về luồng, kết cục, trần loại đóng (3/3) và ngân sách (10). Có các vấn đề sau:

- **Vi phạm A9:** `a1` (`PRIORITIZING`) và `a3` (`ORDERING`) có hint. Spec chỉ cho activity `FREETEXT` có hint.
- **Hint `a3` lộ đáp án:** "Nhớ là mình viết test trước khi sửa nhé" cho thẳng vị trí `s2` trước `s3`. Điều này vi phạm luật 3 của A9 ("chỉ hướng, không đưa đáp án").
- **Mâu thuẫn nội dung:** `a3.setup` nói "Code đã sửa xong trên máy bạn", nhưng các bước cần sắp xếp lại gồm "Viết unit test tái hiện lỗi" và "Sửa câu truy vấn".

---

## 2. `JSON_SCHEMA.md` đã tổng hợp đủ chưa?

**Độ phủ key: đủ.** Script đã duyệt mọi key ở mọi độ sâu của 9 file và tìm từng key trong mục tương ứng của `JSON_SCHEMA.md`. Không có key nào bị bỏ sót.

| File | Số key khác nhau | Thiếu trong JSON_SCHEMA |
|---|---|---|
| `78_roles_unmerged.json` | 128 | 0 |
| `final_22_roles.json` | 138 | 0 |
| `roles_18_playable.json` | 10 | 0 |
| `work_environments.json` | 31 | 0 |
| `DRAFT_fit_quiz.json` | 18 | 0 |
| `skills_taxonomy.json` | 16 | 0 |
| `role_graph.json` | 33 | 0 |
| `scenarios/*.json` (2 file) | 88 | 0 |

Các con số đã kiểm và khớp:

- 263 level · 57 role có `levels` · 29 có `destination_profile`.
- Archetype A14/B35/C21/D8.
- 40 `A_VERIFIED`.
- 28 `branching` là chuỗi, 50 là object.
- 81/97 sự kiện `C_INFERRED`.
- 75/75 `top_reasons_to_apply.label` là chuỗi %.
- `ev` == `evidence_level` ở cả 22 nghề.
- `_context` giống hệt nhau ở 22 nghề, trừ 3 field.
- 14/28 cạnh `PROGRESSES_TO` có `distance = 1.0`.

**Chỗ cần sửa trong JSON_SCHEMA.md:**

| # | Mục | Đang ghi | Thực tế / theo spec |
|---|---|---|---|
| 1 | §10 `random_events[].chance` | "(0–1)" | Spec ràng buộc **[0.1, 0.4]** |
| 2 | §10 `random_events[].condition` | Liệt kê `min_minus1`, không nhắc `extra` | Lệch spec A12 (xem §1.4 #6). Nên ghi rõ đây là chỗ spec chưa nhất quán |
| 3 | §10 `items[].note` | "có thể thiếu" | Spec: `PRIORITIZING` **bắt buộc** có `note` (lỗi #15) |
| 4 | §10 `hints` | "chỉ activity FREETEXT được có" | Đúng theo spec, nhưng §11 không ghi rằng `L1_S_EXEC` đang vi phạm |
| 5 | §4 "Lưu ý chất lượng" | "7/22 nghề không có dữ liệu skill **và lương** riêng" | Đúng với skill. Về lương: `role_level_salary.avg = null` ở 8 nghề khác danh sách (`SWE_GAME`, `SWE_UIUX`, `QA_MANUAL`, `CLOUD_DEVOPS`, `CLOUD_ENG`, `INFRA_ERP`, `INFRA_HELPDESK`, `INFRA_NETWORK`); `report_position = null` ở 8 nghề (thêm `SWE_ARCH_SOL`) |
| 6 | §4.3 `itviec_2025_2026` | `median_total` là số, `by_experience` có 5 phần tử | `SWE_ARCH_SOL`: `median_total = null`, `by_experience = []` |
| 7 | §3 `destination_profile` | Không đánh dấu tuỳ chọn | `min_years_experience`, `years_band_check` thiếu ở 1/29 |
| 8 | §11 | Thiếu | Nên bổ sung các nút chặn ở §1.3 (B1–B7) và §1.4 (#2–#8), vì chúng ảnh hưởng trực tiếp tới việc sinh scenario |

---

## 3. Đọc dữ liệu thế nào cho nhanh hiểu

`JSON_SCHEMA.md` đã giải thích **từng field** khá đúng, nên không cần viết lại. Cách đọc nhanh nhất là chia theo **mục đích sử dụng**:

| Mục đích | File | Field cần quan tâm |
|---|---|---|
| **Sinh scenario** (spec KHỐI A) | `78_roles_unmerged.json` | `role_code`, `archetype`, `occupied_bands`, `levels[]` (`band`, `title_vn`, `years_experience`, `core_output`, `tasks`, `skills_hard`, `skills_soft`, `evidence_level`), `destination_profile` (nghề C), `company_type_variance`, `work_environment_ids` |
| | `work_environments.json` | chỉ `environments[].id` (scenario trỏ id, không chép mô tả) |
| **Chơi scenario** (runtime KHỐI B) | `scenarios/**.json` | Toàn bộ. Runtime chỉ nhận đúng 1 file này, không nhận dataset |
| **Màn hình nghề, lương, galaxy** | `final_22_roles.json`, `role_graph.json`, `skills_taxonomy.json` | Không tham gia sinh scenario |
| **Đo độ hợp nghề** | `DRAFT_fit_quiz.json` + `final_22_roles` (`fit_dimensions`, `shared_events`, `roleplay_events`) | Đây là hệ thứ hai (8 chiều fit, `signal` −2..+2), **chưa có spec** (spec mục "CÒN THIẾU #4") |
| **Bằng chứng quyết định** | `roles_18_playable.json`, `decisions/78_to_22_roles.csv` | Tài liệu, app không đọc |

**Những cặp dễ nhầm:**

- `archetype` (A/B/C/D, cửa vào nghề) và `context.scenario_archetype` (`S_EXEC`…, kiểu tình huống) là hai thứ khác nhau.
- `bands` (chuỗi khoảng, trong 22/18) và `occupied_bands` (mảng, trong 78) đang **không khớp** ở 3 nghề. Spec kiểm theo `occupied_bands`.
- `compensation.by_band` là lương **chung toàn ngành** theo cấp. Lương riêng của nghề nằm ở `itviec_2025_2026.by_experience`.
- `similar_roles` (22/18) là các nghề **đã gộp vào**, giống `absorbed_roles`. Nghề tương tự để thử qua lại nằm ở `graph_edges.similar_ranked`.
- Hai kiểu thang điểm: `anchors` / `optionGrade` của scenario (`+2/0/-1`, đo **kỹ năng**) và `signal` của sự kiện/quiz (−2..+2 trên 8 chiều, đo **độ hợp tính**). Không cộng lẫn được.
- `CHUA_CO_DU_LIEU` nghĩa là chưa thu thập, không có nghĩa là "không áp dụng". Spec coi chọn nhóm này là bịa.

---

## 4. Đề xuất thứ tự xử lý

1. **Chốt danh sách nghề cần sinh** (B7). Đề xuất dùng 18 nghề chơi được, và quyết định số phận `SEC_SOC`/`QA_AUTO`/`DATA_ML` so với 22.
2. **Sửa script kiểm** (§1.4 #1–#4). Việc này rẻ, và nên làm trước khi sinh thêm bất kỳ file nào.
3. **Bổ sung dữ liệu cho 9 nghề đang ở tier 1/2** (B1, B2, B4): gán `work_environment_ids`, điền ≥ 1 `company_type_variance`, thêm soft skill cho 6 level thiếu. Làm xong bước này thì cả 41 job đều sinh được ngay.
4. **Quyết định chính sách cho 9 nghề không có task** (B3, B5): thu thập JD theo cách đã làm với `SWE_FRONTEND`, hoặc viết lại tier 3 với một nguồn skill cụ thể.
5. **Đổi quy ước tên file scenario** (B6) trước khi sinh hàng loạt L1.
6. **Sửa `L1_S_EXEC.json`** (§1.5) và cập nhật `JSON_SCHEMA.md` (§2).
