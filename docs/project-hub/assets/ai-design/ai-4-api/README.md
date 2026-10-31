# AI-4: một lượt gọi API

Kịch bản *"Tối ưu hóa các API bị chậm"*, activity a2: người chơi vừa trả lời anh An rằng lỗi là N+1 và sẽ gộp bằng join.

| File | Là gì |
|---|---|
| `request.jsonc` | Máy chủ JobQuest gửi Qwen (Frankfurt): method, URL, headers, body với toàn bộ prompt |
| `response.json` | Qwen trả về: lời của An, câu hỏi đào sâu, số token |

- `request.jsonc` là JSON có chú thích (`//`) cho các trường quan trọng; JSON chuẩn không cho comment nên đuôi là `.jsonc`, VS Code đọc bình thường. Để dễ đọc, `content` của mỗi message được tách thành mảng từng dòng và các dòng JSON được mở ra; gửi thật thì `content` là **một chuỗi**, các dòng nối bằng `\n`. Bản nguyên dạng: chạy chế độ `live --out`.
- Request **sinh ra từ chính code**, khớp từng ký tự với thứ sẽ gửi đi. Key thay bằng `{QWEN_API_KEY}`.
- Response là của **model giả**: đúng định dạng tài liệu Qwen, nội dung và số liệu giả vì chưa có key.

Sinh lại: `pnpm exec nx run @datn/api:narrator-try -- --mode=export`

Có key rồi thì ghi request và response **thật**: `pnpm exec nx run @datn/api:narrator-try -- --mode=live --out=docs/project-hub/assets/ai-design/ai-4-api/live`
