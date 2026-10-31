# ai-design: tài liệu làm việc cho Thiết kế mô hình AI (§5.3.6)

Task **T1910.2** (Nhật). Tài liệu làm việc, chưa phải báo cáo. Nội dung chốt sẽ vào `reports/<ngày>/report.md` §5.3.6; quyết định ghi ở [`02`](../../02-quyet-dinh.md) (D-98 đến D-103).

| File | Là gì |
|---|---|
| [`kiem-ke.md`](kiem-ke.md) | Kiểm kê mọi thứ về AI đang có: 15 chỗ chạm AI, các đầu việc của §5.3.6, mâu thuẫn M1–M14, luật dùng lại được từ spec Khối B |
| `fig-ai-flow.html` → `fig-ai-flow.png` | Hình 1: flow AI end-to-end (soạn, chơi, vòng phản hồi, gateway). Chữ tiếng Anh để dùng thẳng trong báo cáo. Mở với `#compact` (bỏ chữ mô tả, chữ to hơn) → `fig-ai-flow-compact.png` cho brief |
| `fig-ai-data.html` → `fig-ai-data.png` | Hình 2: đường đi của dữ liệu, phiên bản, ranh giới DC-03 |
| `brief-thiet-ke-ai.html` → `brief-thiet-ke-ai.pdf` | Brief gửi cô: **1 trang A4 ngang** (hình flow rút gọn, cách hiểu và phạm vi, quyết định mới, phép thử, 5 câu hỏi) |
| [`mail-nhap.md`](mail-nhap.md) | Mail nháp đi kèm brief |
| [`ai-4-thiet-ke.md`](ai-4-thiet-ke.md) | Bản ý tưởng thiết kế AI-4 theo khung 8 phần (AI-4 làm mẫu), viết cuốn chiếu |

## Dựng lại hình và PDF

Sửa file `.html` rồi chạy trong thư mục này (macOS, Google Chrome):

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1790,770 --screenshot="$PWD/fig-ai-flow.png" "file://$PWD/fig-ai-flow.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1790,800 --screenshot="$PWD/fig-ai-data.png" "file://$PWD/fig-ai-data.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1530,590 --screenshot="$PWD/fig-ai-flow-compact.png" "file://$PWD/fig-ai-flow.html#compact"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/brief-thiet-ke-ai.pdf" "file://$PWD/brief-thiet-ke-ai.html"
```

Hình thêm nội dung thì tăng chiều cao `--window-size` cho khỏi bị cắt.
