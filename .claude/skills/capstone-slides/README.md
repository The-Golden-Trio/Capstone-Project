# capstone-slides: Design system cho slide HTML của nhóm Capstone

Skill này giúp Claude (và AI khác) tạo slide HTML đúng phong cách của template "Management Consulting Toolkit" (slide 1–35). Phong cách gồm màu xanh navy `#003BA3` và xanh dương `#4A8CFF`, xám `#EFEFEF`, font Montserrat, và các khối màu vuông gặp nhau ở giữa slide.

## Cài đặt

### Cách 1 — Claude Code (qua repo, cả nhóm dùng chung)
1. Thư mục skill phải nằm ở `.claude/skills/capstone-slides/` trong repo Capstone-Project (tên thư mục chính là tên lệnh `/capstone-slides`).
2. `git pull` là có. Mở Claude Code trong repo, gõ `/` sẽ thấy `capstone-slides`.
3. Nếu thư mục `.claude/skills/` được tạo lúc Claude Code đang mở → khởi động lại Claude Code một lần.
4. (Tuỳ chọn, để chạy script kiểm tra/xuất PDF) `pip install playwright && playwright install chromium`.

### Cách 2 — Ứng dụng Claude (claude.ai, desktop, Cowork)
1. Bật **Code execution** trong Settings → Capabilities.
2. Vào **Customize → Skills → + → Create skill → Upload a skill**, chọn `capstone-slides.zip`.
3. Kiểm tra skill đang được bật trong danh sách Skills. Mỗi người tự upload vào tài khoản của mình.
4. Khi skill có bản mới: upload lại file zip mới (nếu ứng dụng báo trùng tên thì xoá bản cũ trước).

## Cách dùng

Chỉ cần yêu cầu tự nhiên, ví dụ:

> Tạo slide bảo vệ capstone 20 phút từ nội dung trong docs/. Dùng skill capstone-slides.

Claude sẽ lập dàn ý, chọn layout cho từng slide, ghép HTML từ các mẫu, chạy script kiểm tra rồi giao cho bạn một file `.html` duy nhất.

Khi trình chiếu: phím → / ← để chuyển slide, **F** để toàn màn hình, **O** để xem tổng quan, **P** để in hoặc lưu PDF.

> Font Montserrat được tải từ Google Fonts nên máy cần có mạng. Khi thuyết trình ở nơi không có mạng, hãy xuất PDF trước: `python3 scripts/export_pdf.py deck.html`, hoặc mở trong Chrome, nhấn Ctrl/Cmd+P, chọn Save as PDF, Margins: None và tick Background graphics.

## Cấu trúc

```
SKILL.md                 quy tắc thiết kế + quy trình, dành cho AI đọc
assets/starter.html      khung deck: token màu/chữ, CSS của 33 layout, điều khiển trình chiếu
references/layouts.md    danh mục 33 layout kèm đoạn HTML mẫu (được sinh tự động)
examples/showcase.html   xem trước toàn bộ layout (được sinh tự động)
scripts/check_deck.py    kiểm tra màu/font/layout, chụp từng slide, phát hiện chữ tràn
scripts/export_pdf.py    xuất PDF 16:9
src/snippets.html        nguồn của các layout mẫu
src/build.py             sinh lại references/layouts.md và examples/showcase.html
```

## Chỉnh sửa design system

1. Sửa CSS trong `assets/starter.html` hoặc sửa và thêm layout trong `src/snippets.html`. Mỗi layout bắt đầu bằng dòng `<!--@ id | Tên | Khi nào dùng -->`.
2. Chạy `python3 src/build.py` để sinh lại danh mục và trang showcase.
3. Chạy `python3 scripts/check_deck.py examples/showcase.html --render /tmp/check` rồi xem ảnh `contact-sheet.png`.
4. Nếu thêm layout mới, nhớ thêm class `l-...` của nó vào `LAYOUTS` trong `scripts/check_deck.py`.
