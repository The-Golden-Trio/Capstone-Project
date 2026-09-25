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
| `datasets/dataset_22_roles_enriched_v3.json` | 22 nghề: skill, lương, graph, sự kiện, 8 chiều fit | `docs/data/build.mjs`, `docs/data/build-galaxy.mjs`, 2 script Python |
| `datasets/dataset_final_merged.json` | 78 nghề, task và skill theo từng cấp | `docs/data/build-galaxy.mjs`, `scripts/build_skill_taxonomy.py`, `tools/visualize_dataset.html` |
| `datasets/fit_quiz.json` | 6 câu Get-to-know-me | `docs/data/build.mjs` |
| `datasets/roles.csv` | Danh mục 78 `role_code` hợp lệ | Luật trong `specs/` (mọi `role_code` phải có ở đây) |
| `datasets/work_environments.json` | 6 môi trường làm việc | Kịch bản trỏ `work_environment_id` vào đây |
| `scenarios/SWE_BACKEND/L1_S_EXEC.json` | Kịch bản L1 "Tham gia fix các bug mức độ ưu tiên thấp" | `docs/data/build.mjs`, script taxonomy |
| `scenarios/SWE_BACKEND/L3_S_INCIDENT.json` | Kịch bản L3 "Tối ưu hóa các API bị chậm" — **golden anchor** của spec | `docs/data/build.mjs`, script taxonomy |
| `generated/skills_taxonomy.json` | 227 skill chuẩn hoá | `scripts/build_role_graph.py`, webpack API (copy vào `dist`), module API cũ |
| `generated/role_graph.json` | 22 hành tinh, 64 đường nối, 39 nghề gộp | `docs/data/build-galaxy.mjs`, webpack API, module API cũ |
| `specs/spec-scenario-KHOI1.md` | Luật viết kịch bản v2.2 | Người viết kịch bản |
| `specs/HUONG-DAN-SINH-SCENARIO.md` | Hướng dẫn từng bước sinh kịch bản | Người viết kịch bản |
| `decisions/FILTERED_ROLES.csv` | 78 nghề: 22 giữ, 39 gộp, 17 loại, kèm lý do | Tài liệu (quyết định D-52) |
| `decisions/roles_18_playable.json` | 18 nghề chơi được | Tài liệu (quyết định D-52) |
| `tools/visualize_*.html` | Trang xem dataset | Mở bằng trình duyệt |

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
```

Chạy mọi lệnh từ **gốc repo**.

## Thêm kịch bản mới

1. Làm theo `specs/HUONG-DAN-SINH-SCENARIO.md`. Lưu vào `scenarios/<ROLE_CODE>/<BAND>_<ARCHETYPE>.json`.
2. Thêm một dòng vào danh sách `SCENARIOS` trong `docs/data/build.mjs`.
3. Chạy `node docs/data/build.mjs`, rồi seed lại DB.

## Lưu ý

- `9_roles_tier1_pass2.json` (9 nghề đã xác minh bằng JD) đã bị xoá. `scripts/build_skill_taxonomy.py` tự bỏ qua file thiếu, nên nếu chạy lại, `generated/skills_taxonomy.json` sẽ ít skill hơn bản hiện tại. Lấy lại được bằng `git checkout 6652636 -- occupation-data/9_roles_tier1_pass2.json`.
- Dữ liệu và spec cũ (pass 0–1, JD thô, dataset các bản trước) nằm ở `_archive/occupation-data/`.
