# occupation-data/

Dữ liệu nghề IT và kịch bản chơi cho JobQuest. Code **không đọc trực tiếp** phần lớn folder này lúc chạy app: các script ở `docs/data/` gom dữ liệu thành `packages/game-core/data/*.json`, rồi `seed-content.ts` đẩy vào DB.

## Cấu trúc

```
occupation-data/
├─ datasets/      Dữ liệu gốc, sửa tay ở đây
├─ scenarios/     Kịch bản chơi được, mỗi nghề một thư mục
├─ generated/     Do script sinh ra, KHÔNG sửa tay
├─ scripts/       Script Python sinh generated/
├─ specs/         Luật và hướng dẫn viết kịch bản
├─ decisions/     Bằng chứng cho quyết định lọc nghề
└─ tools/         Trang xem dữ liệu (mở bằng trình duyệt)
```

| File | Là gì | Ai đọc |
|---|---|---|
| `datasets/final_22_roles.json` | 22 nghề: skill, lương, graph, sự kiện, 8 chiều fit | `docs/data/build.mjs`, `docs/data/build-galaxy.mjs`, 2 script Python |
| `datasets/78_roles_unmerged.json` | 78 nghề, task và skill theo từng cấp | `docs/data/build-galaxy.mjs`, `scripts/build_skill_taxonomy.py`, `tools/visualize_dataset.html` |
| `datasets/DRAFT_fit_quiz.json` | 6 câu Get-to-know-me | `docs/data/build.mjs` |
| `_archive/occupation-data/roles.csv` | Danh mục 78 `role_code` hợp lệ, đã chuyển vào `_archive/` | Luật trong `specs/` vẫn trỏ `datasets/roles.csv` (xem `JSON_SCHEMA.md` §11) |
| `datasets/work_environments.json` | 6 môi trường làm việc | Kịch bản trỏ `work_environment_id` vào đây |
| `scenarios/SWE_BACKEND/L1_S_EXEC.json` | Kịch bản L1 "Tham gia fix các bug mức độ ưu tiên thấp" | `docs/data/build.mjs`, script taxonomy |
| `scenarios/SWE_BACKEND/L3_S_INCIDENT.json` | Kịch bản L3 "Tối ưu hóa các API bị chậm" — **golden anchor** của spec | `docs/data/build.mjs`, script taxonomy |
| `generated/skills_taxonomy.json` | 227 skill chuẩn hoá | `scripts/build_role_graph.py`, webpack API (copy vào `dist`), module API cũ |
| `generated/role_graph.json` | 22 hành tinh, 64 đường nối, 39 nghề gộp | `docs/data/build-galaxy.mjs`, webpack API, module API cũ |
| `specs/spec-scenario-KHOI1.md` | Luật viết kịch bản v2.2 | Người viết kịch bản |
| `specs/HUONG-DAN-SINH-SCENARIO.md` | Hướng dẫn từng bước sinh kịch bản | Người viết kịch bản |
| `decisions/78_to_22_roles.csv` | 78 nghề: 22 giữ, 39 gộp, 17 loại, kèm lý do | Tài liệu (quyết định D-52) |
| `decisions/roles_18_playable.json` | 18 nghề chơi được | Tài liệu (quyết định D-52) |
| `tools/visualize_*.html` | Trang xem dataset | Mở bằng trình duyệt |
| `generated/onet_profiles.json` | Hồ sơ O\*NET của 22 nghề IT: RIASEC, 7 nhóm soft skill, nghề gần nhất | Module gợi ý nghề |
| `generated/onet_all_roles.json` | 199 nghề ngoài IT gộp từ 846 mã O\*NET, cùng khuôn với `final_22_roles.json` | Module gợi ý nghề, trang hồ sơ nghề |
| `decisions/onet_merge/*.json` | Quyết định giữ, gộp, loại nghề ngoài IT theo từng nhóm | `scripts/build_all_onet_profiles.py` |
| `decisions/onet_to_catalogue.csv` | Bảng quyết định nghề ngoài IT, cùng cột với `78_to_22_roles.csv` | Tài liệu |
| `datasets/onet_vi/*.json` | Bản dịch tiếng Việt (nháp) và hồ sơ nhóm cho nghề ngoài IT | `scripts/build_all_onet_profiles.py` |
| `generated/occupation_profiles.json` | **Hồ sơ nghề chuẩn** cho 221 nghề (22 IT + 199 ngoài IT), một khuôn (`JSON_SCHEMA.md` §13) | Trang hồ sơ nghề, module gợi ý nghề (chưa nối) |
| `generated/occupation_profiles_review.md` | Lý do từng quyết định theo từng nghề, để duyệt trước khi dùng | Người duyệt |
| `datasets/vn/salary_reference.json`, `datasets/vn/it_postings.json`, `datasets/vn/it_jd_tasks.json` | Lương tham khảo đã xác nhận nguồn, số tin ITviec, task theo cấp từ JD | `scripts/build_occupation_profiles.py` |
| `datasets/vn/*.json` | Số liệu Việt Nam: thu nhập và số người làm theo nhóm nghề, thang lương nhà nước, danh mục ngành học | `scripts/build_occupation_profiles.py` |
| `decisions/education_map.json`, `decisions/vietjobs_title_rules.json` | Nghề → ngành học, giấy phép; luật khớp chức danh tin tuyển dụng | `scripts/build_occupation_profiles.py`, `scripts/build_vietjobs_stats.py` |
| `datasets/work_settings.json` | 9 nơi làm việc dùng chung và luật gán | `scripts/build_occupation_profiles.py` |
| `decisions/onet_to_vsco.csv` | 221 nghề nối với mã nghề Việt Nam (Quyết định 34/2020/QĐ-TTg) qua ISCO-08; sửa tay ở `decisions/onet_to_vsco_overrides.json` | Thu thập lương, thống kê lao động Việt Nam |
| `generated/point_budgets.json` | Thang cấp, độ khó, quỹ điểm soft skill và điều kiện vào cấp của 221 nghề | `scripts/build_keyword_map.py`, module điểm (chưa nối) |
| `generated/keyword_map.json` | Keyword kỹ năng cứng từ ESCO cho 221 nghề, đầu vào và đầu ra từng cấp, bảng quy đổi theo nhóm kỹ năng khi nhảy nghề | Module điểm và mở khoá, ô gợi ý cùng ngành (chưa nối) |

## Luồng dữ liệu

```
datasets/*  +  scenarios/**
   │
   ├─ python3 occupation-data/scripts/build_skill_taxonomy.py ─► generated/skills_taxonomy.json
   ├─ python3 occupation-data/scripts/build_role_graph.py     ─► generated/role_graph.json   (chạy SAU taxonomy)
   │
   ├─ node docs/data/build.mjs        ─► packages/game-core/data/game-data.json
   └─ node docs/data/build-galaxy.mjs ─► packages/game-core/data/galaxy-data.json
                                            │
                                            └─ pnpm exec nx run @datn/api:seed-content ─► PostgreSQL

external/onet_31_0/*.csv (O*NET 31.0)
   │
   ├─ python3 occupation-data/scripts/build_onet_profiles.py      ─► generated/onet_profiles.json   (22 nghề IT)
   ├─ python3 occupation-data/scripts/check_profile_stability.py  ─► generated/onet_profile_stability.md
   ├─ python3 occupation-data/scripts/evaluate_onet_similarity.py ─► generated/onet_similarity_eval.json
   └─ python3 occupation-data/scripts/build_all_onet_profiles.py  ─► generated/onet_all_roles.json  (199 nghề ngoài IT)

external/esco_onet/ + external/vsco_2020/ (tải bằng --download)
   └─ python3 occupation-data/scripts/build_onet_to_vsco.py ─► decisions/onet_to_vsco.csv, generated/onet_to_vsco.md
         ▲ đọc decisions/onet_to_vsco_overrides.json + generated/onet_all_roles.json (chạy SAU build_all_onet_profiles.py)

external/onet_31_0/ + datasets/final_22_roles.json + research/research_notes/Thang cấp nghề/ (thang cấp, nghe_di_truoc.csv)
   └─ python3 occupation-data/scripts/build_point_budgets.py ─► generated/point_budgets.json, generated/levels_non_it.json

external/esco_1_2_1/*.csv (ESCO v1.2.1, tải tay, xem dưới) + external/onet_31_0/ (Sim, kiểm định) + generated/point_budgets.json
   └─ python3 occupation-data/scripts/build_keyword_map.py ─► generated/keyword_map.json, keyword_map.md, keyword_elements_en.csv
         ▲ đọc research/research_notes/Bản đồ keyword/ (nghe_esco.csv, keyword_chon_tay.csv, ten_keyword_vi.csv, keyword_it*.csv)

external/vietjobs/ (tải bằng --download)
   └─ python3 occupation-data/scripts/build_vietjobs_stats.py ─► generated/vietjobs_stats.json

Tất cả các file trên + datasets/vn/ + decisions/education_map.json + datasets/work_settings.json
   └─ python3 occupation-data/scripts/build_occupation_profiles.py ─► generated/occupation_profiles.json  (221 nghề, chạy CUỐI)
         ▲ đọc decisions/onet_merge/*.json + datasets/onet_vi/*.json
```

Chạy mọi lệnh từ **gốc repo**.

**Tải ESCO:** ESCO không cho tải tự động (phải qua form có email và CAPTCHA). Vào [trang tải ESCO](https://esco.ec.europa.eu/en/use-esco/download), chọn *ESCO dataset - v1.2.1* · *Classification* · *csv* · *en*, gửi form, mở link trong email rồi giải nén vào `occupation-data/external/esco_1_2_1/`. Trang nào hiện keyword phải ghi "This service uses the ESCO classification of the European Commission" và nói rõ JobQuest đã chỉnh sửa dữ liệu (dòng ghi nguồn có sẵn trong `keyword_map.json`).

## Thêm kịch bản mới

1. Làm theo `specs/HUONG-DAN-SINH-SCENARIO.md`. Lưu vào `scenarios/<ROLE_CODE>/<BAND>_<ARCHETYPE>.json`.
2. Thêm một dòng vào danh sách `SCENARIOS` trong `docs/data/build.mjs`.
3. Chạy `node docs/data/build.mjs`, rồi seed lại DB.

## Lưu ý

- `9_roles_tier1_pass2.json` (9 nghề đã xác minh bằng JD) đã bị xoá. `scripts/build_skill_taxonomy.py` tự bỏ qua file thiếu, nên nếu chạy lại, `generated/skills_taxonomy.json` sẽ ít skill hơn bản hiện tại. Lấy lại được bằng `git checkout 6652636 -- occupation-data/9_roles_tier1_pass2.json`.
- Dữ liệu và spec cũ (pass 0–1, JD thô, dataset các bản trước) nằm ở `_archive/occupation-data/`.
