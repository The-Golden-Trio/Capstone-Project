# docs/: mục lục

## ▶ Bắt đầu từ đây: [`project-hub/00-tong-quan.md`](project-hub/00-tong-quan.md)

`project-hub/` là **single source of truth** của đề tài JobQuest: tổng quan, dòng thời gian, quyết định, sản phẩm, hiện trạng code, biên bản họp, task tuần, vấn đề mở, và bản lưu file đã nộp cô.

## Các file khác trong `docs/`

| File | Trạng thái | Ghi chú |
|---|---|---|
| `vao-nghe-flow.excalidraw` · `.mmd` · `.gen.mjs` | Hiện hành | Sơ đồ màn hình của code (20/9). Ảnh ở `project-hub/assets/vao-nghe-flow.png` |
| `data/build.mjs`, `data/build-galaxy.mjs` | Hiện hành | Build `packages/game-core/data/*.json` từ `occupation-data/` |
| `data/game-data.js` | Sinh tự động | `build.mjs` vẫn ghi ra; người dùng duy nhất là `prototype.html` (đã archive) |

## Đã chuyển vào `_archive/docs/` (23/9)

| File | Ghi chú |
|---|---|
| `prototype.html` | Prototype HTML tĩnh (15–17/9), đã thay bằng `apps/web` |
| `init.md`, `init.vi.md` | Brainstorm 6 trụ cột của **đề tài v1** (hướng nghiệp cho HS THPT, 19/7) |
| `steps.md`, `market-research.md` | Hướng nghiệp là gì, thị trường hướng nghiệp VN (đề tài v1) |
| `datasource.md`, `result.md` | Nguồn dữ liệu và thành phẩm dự kiến (đề tài v1) |
| `report.md`, `report/main.tex`, `report/images/hcmut.png` | Brief report đề tài v1, nộp 22/7 |
| `progress/week-2/supplementary_report.md` | Trả lời 5 câu hỏi của cô (25/7) |
| `report-skill-graph-mvp.md`, `report/images/planet-*.png` | Báo cáo cài skill progression + bản đồ 3D (18/9); route và persistence trong đó đã bị thay |

Các file đã archive vẫn hữu ích cho phần related work và market, nhưng **định vị sản phẩm trong đó đã bị thay** (xem `project-hub/02-quyet-dinh.md`, mục A).

Spec kịch bản và dữ liệu nghề đang dùng nằm ở `occupation-data/`; các spec/bằng chứng của bước pass 0–1 đã chuyển vào `_archive/occupation-data/`. `README.md` gốc repo cũng đã chuyển vào `_archive/` (xem `project-hub/08-nguon.md`).
