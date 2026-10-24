# reports: source LaTeX các báo cáo nộp cô

Mỗi lần nộp báo cáo cho cô, lưu **source LaTeX** vào đây rồi chạy skill `capstone-sync-report` để cập nhật [`docs/project-hub/`](../docs/project-hub/00-tong-quan.md) (single source of truth).

## Quy ước

- Mỗi báo cáo một folder: `reports/yyyy-mm-dd_<slug>/`, với `yyyy-mm-dd` là **ngày nộp**. Ví dụ `reports/2026-09-18_ch1-5/`.
- Trong folder: `main.tex`, các file con (`chapters/*.tex`…), `images/`, `*.bib`. Lấy từ Overleaf bằng **Menu → Download → Source**, rồi giải nén vào folder.
- **Cấu trúc báo cáo theo mẫu ĐACN**: tên chương, tên mục và thứ tự ở [`docs/project-hub/templates/bao-cao-dacn.md`](../docs/project-hub/templates/bao-cao-dacn.md).
- **Report master:** từ bản 16/10, báo cáo tổng nằm ở `reports/master/` và được cập nhật xuyên suốt, thay cho folder mới mỗi lần nộp. Các folder theo ngày cũ (`2026-09-26_ch1-5`, `2026-10-02_ch1-5`) giữ nguyên làm lịch sử.
- **Không sửa report cũ** sau khi đã nộp. Tuần sau nộp bản mới thì tạo folder mới, kể cả khi chỉ sửa vài chương.
- **PDF bản cuối** vẫn lưu ở [`docs/project-hub/submissions/`](../docs/project-hub/submissions/) với tên `yyyy-mm-dd_JobQuest_<Tên>.pdf`.

## Báo cáo viết bằng Markdown (từ 26/9)

Từ bản 26/9, báo cáo được viết bằng **Markdown** (`report.md`), và LaTeX được **sinh ra** từ đó theo class `hcmut-report`:

```
python tools/report/md2tex.py reports/<ngày>_<slug>/report.md reports/<ngày>_<slug>
cd reports/<ngày>_<slug>
latexmk -pdf -outdir=build main.tex    (tự chạy đủ số lần; PDF ở build/main.pdf)
```

- **Sửa nội dung ở `report.md`**, rồi chạy lại script. Không sửa tay `main.tex`, `chapters/*.tex`, `references.tex`: lần chạy sau sẽ ghi đè.
- Sơ đồ Mermaid trong `report.md` không vẽ được trong LaTeX. Sơ đồ thứ n lấy ảnh `latex/figures/fig<n>.png`; đổi sơ đồ thì thay ảnh này.
- Ảnh có sẵn (ví dụ xuất từ PlantUML) thì viết một dòng `![Chú thích.](latex/figures/<tên>.png)`. Ảnh này không tính vào số thứ tự `fig<n>` của sơ đồ Mermaid. Sơ đồ dạng dọc (activity diagram) thì thêm độ rộng: `![Chú thích.](latex/figures/<tên>.png){width=0.63}` (rộng 0,63 lần bề ngang trang, cao tối đa 0,85 trang; `{width=1}` là rộng hết trang).
- Hình rất ngang (flow nhiều làn) thì thêm `{landscape}` sau ảnh: hình nằm riêng một trang xoay ngang, rộng hết dòng.
- Công thức: một dòng `$$ … $$` thành `equation` có đánh số; `$…$` trong câu giữ nguyên cho LaTeX (class đã nạp `amsmath`).
- Dòng phụ trên bìa lấy từ comment `<!-- reporttype: Report: Chapters 1 to 5 and 7 -->` ở đầu `report.md`; không có comment thì giữ chữ mặc định "Report: Chapters 1 to 5.1".
- Được phép bỏ qua chương hoặc mục chưa viết (ví dụ có Chương 7 khi chưa có Chương 6, hay §5.3.10 ngay sau §5.3.1): script đặt lại bộ đếm LaTeX để số in ra khớp số ghi trong `report.md`.
- Bảng use case viết thẳng bằng LaTeX trong `report.md`, từ dòng `\begin{usecase}{UC-E01}{Tên}` đến `\end{usecase}`. Script chép nguyên văn khối này; môi trường `usecase` và các lệnh `\ucrow`, `\ucsteps`, `\ucstep`, `\ucitem` định nghĩa trong hằng `MAIN`.
- Bìa (tên môn, GVHD, nhóm, sinh viên) nằm trong hằng `MAIN` của `tools/report/md2tex.py`.
- **Bài học 8–16/10:** Chương 5 từng được sửa tay trong `.tex` (bảng use case, activity diagram), nên `report.md` lệch với bản nộp 16/10. Ngày 19/10 đã đưa các sửa đó về `reports/master/report.md`; sinh lại từ file này ra đúng nội dung bản 16/10 (chỉ khác độ rộng cột tự tính). Từ bản sau, mọi sửa đi qua `report.md`.
- Script tự kiểm số mục: nếu `## 4.3 …` trong Markdown lệch với số LaTeX sẽ đánh thì dừng và báo.

## Build PDF offline (thay Overleaf)

- Cài TeX Live một lần: `brew install --cask mactex-no-gui` (macOS, khoảng 6 GB). Cài xong mở lại terminal và VS Code để có `latexmk` trong PATH.
- VS Code: cài extension **LaTeX Workshop** (`james-yu.latex-workshop`, đã có trong gợi ý của repo). Cấu hình nằm ở `.vscode/settings.json`: mở `main.tex` hoặc một file trong `chapters/`, lưu là tự build, PDF mở trong tab bên cạnh. Ctrl/Cmd+click vào PDF để nhảy về dòng nguồn.
- Kết quả build ở `build/` cạnh `main.tex` và đã bị gitignore. Bản nộp vẫn copy sang `docs/project-hub/submissions/`.

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
