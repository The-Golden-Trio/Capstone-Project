# reports: source LaTeX các báo cáo nộp cô

Mỗi lần nộp báo cáo cho cô, lưu **source LaTeX** vào đây rồi chạy skill `capstone-sync-report` để cập nhật [`docs/project-hub/`](../docs/project-hub/00-tong-quan.md) (single source of truth).

## Quy ước

- Mỗi báo cáo một folder: `reports/yyyy-mm-dd_<slug>/`, với `yyyy-mm-dd` là **ngày nộp**. Ví dụ `reports/2026-09-18_ch1-5/`.
- Trong folder: `main.tex`, các file con (`chapters/*.tex`…), `images/`, `*.bib`. Lấy từ Overleaf bằng **Menu → Download → Source**, rồi giải nén vào folder.
- **Không sửa report cũ** sau khi đã nộp. Tuần sau nộp bản mới thì tạo folder mới, kể cả khi chỉ sửa vài chương.
- **PDF bản cuối** vẫn lưu ở [`docs/project-hub/submissions/`](../docs/project-hub/submissions/) với tên `yyyy-mm-dd_JobQuest_<Tên>.pdf`.

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
