# reports: source LaTeX các báo cáo nộp cô

Mỗi lần nộp báo cáo cho cô, lưu **source LaTeX** vào đây rồi chạy skill `capstone-sync-report` để cập nhật [`docs/project-hub/`](../docs/project-hub/00-tong-quan.md) (single source of truth).

## Quy ước

- Mỗi báo cáo một folder: `reports/yyyy-mm-dd_<slug>/`, với `yyyy-mm-dd` là **ngày nộp**. Ví dụ `reports/2026-09-18_ch1-5/`.
- Trong folder: `main.tex`, các file con (`chapters/*.tex`…), `images/`, `*.bib`. Lấy từ Overleaf bằng **Menu → Download → Source**, rồi giải nén vào folder.
- **Cấu trúc báo cáo theo mẫu ĐACN**: tên chương, tên mục và thứ tự ở [`docs/project-hub/templates/bao-cao-dacn.md`](../docs/project-hub/templates/bao-cao-dacn.md).
- **Không sửa report cũ** sau khi đã nộp. Tuần sau nộp bản mới thì tạo folder mới, kể cả khi chỉ sửa vài chương.
- **PDF bản cuối** vẫn lưu ở [`docs/project-hub/submissions/`](../docs/project-hub/submissions/) với tên `yyyy-mm-dd_JobQuest_<Tên>.pdf`.

## Báo cáo viết bằng Markdown (từ 26/9)

Từ bản 26/9, báo cáo được viết bằng **Markdown** (`report.md`), và LaTeX được **sinh ra** từ đó theo class `hcmut-report`:

```
python tools/report/md2tex.py reports/2026-10-02_ch1-5/report.md reports/2026-10-02_ch1-5/latex
cd reports/2026-10-02_ch1-5/latex
pdflatex main.tex    (chạy 3 lần để mục lục và số bảng ổn định)
```

- **Sửa nội dung ở `report.md`**, rồi chạy lại script. Không sửa tay `main.tex`, `chapters/*.tex`, `references.tex`: lần chạy sau sẽ ghi đè.
- Sơ đồ Mermaid trong `report.md` không vẽ được trong LaTeX. Sơ đồ thứ n lấy ảnh `latex/figures/fig<n>.png`; đổi sơ đồ thì thay ảnh này.
- Bìa (tên môn, GVHD, nhóm, sinh viên) nằm trong hằng `MAIN` của `tools/report/md2tex.py`.
- Script tự kiểm số mục: nếu `## 4.3 …` trong Markdown lệch với số LaTeX sẽ đánh thì dừng và báo.

## Cách sync

Trong Claude Code, gọi skill và chỉ file `.tex`:

```
/capstone-sync-report reports/2026-09-25_ch1-6/main.tex
```

hoặc nói: *"sync report `reports/2026-09-25_ch1-6/main.tex` vào project-hub"*.

Skill sẽ đọc report, tự chọn file cần sửa trong `docs/project-hub/` (thường là `00`, `02`, `03`, `07`, `08`), ghi thẳng vào đó, rồi thêm một dòng vào bảng dưới đây. Xem lại thay đổi bằng `git diff docs/project-hub`.

## Nhật ký sync

| Report | Ngày nộp | Sync ngày | Người chạy | File hub đã sửa | Ghi chú |
|---|---|---|---|---|---|
| *(chưa có source)* Ch.1–5 | 18/9 | 21/9 | — | 00, 02, 03, 07, 08 | Hub dựng từ bản PDF `submissions/2026-09-18_JobQuest_Report_Ch1-5.pdf`. Source LaTeX còn trên Overleaf, chưa tải về |
| [2026-09-26_ch1-5](2026-09-26_ch1-5/report.md) Ch.1–5.1 | 26/9 | 30/9 | Phúc (Claude) | 00, 02, 03, 07, 08, tuan/2026-W40 | Source là **Markdown** dùng được với pandoc, không phải LaTeX, nên `extract_tex.py` chỉ trích được ID, không nhận heading. Kèm `block-resolutions.md`. Báo cáo có trước các quyết định 29/9 nên không ghi đè D-16, D-17. Thêm D-06, D-47…49, mục G (D-60…65), mục I (D-80…84) |
