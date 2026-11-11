# AI-4: một lượt gọi API

Contract theo nhịp (D-130). Seed *SWE_BACKEND.L3.m2 "Sự cố hệ thống giờ cao điểm!"*, nút n2, task `probe`: người chơi vừa lưu ghi chú sự cố nêu nguyên nhân; mentor (lá XVIII Sang) hỏi theo hook "lấy gì để loại khả năng DB quá tải".

| File | Là gì |
|---|---|
| `request.jsonc` | Máy chủ JobQuest gửi Qwen (Frankfurt): method, URL, headers, body với toàn bộ prompt (luật, màn, công ty, thẻ nhân vật, cảnh, việc lượt này) |
| `response.json` | Qwen trả về: các nhịp `{speaker, text, expression}`, `question_by`, số token |

- `request.jsonc` là JSON có chú thích (`//`) cho các trường quan trọng; JSON chuẩn không cho comment nên đuôi là `.jsonc`, VS Code đọc bình thường. Để dễ đọc, `content` của mỗi message được tách thành mảng từng dòng và các dòng JSON được mở ra; gửi thật thì `content` là **một chuỗi**, các dòng nối bằng `\n`. Bản nguyên dạng: chạy chế độ `live --out`.
- Request **sinh ra từ chính code**, khớp từng ký tự với thứ sẽ gửi đi. Key thay bằng `{QWEN_API_KEY}`.
- Response là của **model giả**: đúng định dạng tài liệu Qwen, nội dung và số liệu giả, để file ví dụ không đổi mỗi lần sinh lại. Kết quả gọi thật (11/11/2026) ghi ở mục "Contract theo nhịp" và "Lần gọi thật đầu tiên" của `../ai-4-thiet-ke.md`.

Sinh lại: `pnpm exec nx run @datn/api:narrator-try -- --mode=export`

Chạy cả 6 cảnh mẫu bằng model thật: `pnpm exec nx run @datn/api:narrator-try -- --mode=live --scene=all` (một cảnh: `--scene=n2_probe`; tự gõ câu người chơi: `--player="…"`; xưng hô: `--choice=anh`). Contract một câu follow-up cũ: thêm `--contract=legacy`.

## Chạy với key thật

Cần **một** trong hai key, thêm vào `apps/api/.env` (file này không được commit):

```sh
# Mua trực tiếp từ Alibaba, tạo key ở region Singapore: chỉ cần dòng này
QWEN_API_KEY=sk-...

# Hoặc mua qua OpenRouter: chỉ cần dòng này
OPENROUTER_API_KEY=sk-or-...
```

Key gói Token Plan (`sk-sp-…`) cần thêm endpoint riêng của gói và cờ cho phép, vì điều khoản dữ liệu của gói chưa kiểm được:

```sh
QWEN_API_KEY=sk-sp-...
QWEN_BASE_URL=https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1
AI_ALLOW_UNCONFIRMED_PROVIDERS=true
```

Tạo key ở region khác Singapore thì thêm `QWEN_REGION` và `QWEN_WORKSPACE_ID`, hoặc dán nguyên "API Host" trong hộp thoại tạo key vào `QWEN_BASE_URL`. Key không dùng chéo region được.

Rồi kiểm tra, tốn cỡ vài nghìn token:

```sh
pnpm exec nx run @datn/api:narrator-try -- --mode=check
# hoạt động khác: --scenario=SWE_BACKEND_L1_S_EXEC --activity=a4 --answer="…"
```

`.env` ở gốc repo cũng được đọc, sau `apps/api/.env`.

Lệnh này gọi thật, in độ trễ, số token, câu model viết, và nói rõ phải sửa gì nếu hỏng. Thoát với mã khác 0 nếu chưa chạy được.

Sau đó có thể ghi request và response **thật**: `pnpm exec nx run @datn/api:narrator-try -- --mode=live --out=docs/project-hub/assets/ai-design/ai-4-api/live`

**Đã kiểm khi chưa có key (6/11/2026):** URL của Alibaba và OpenRouter đều có thật, trả 401 khi dùng key giả. Body của OpenRouter hợp lệ theo `openapi.json` của họ, mọi tham số đều có trong danh sách của endpoint. Body của Alibaba qua được máy chủ giả làm đúng các luật trong tài liệu (`apps/api/src/ai/testing/strict-provider.ts`).

**Chỉ `--mode=check` với key thật mới biết được:** key có đúng region không, tài khoản đã kích hoạt và có tiền chưa, hãng có làm đúng tài liệu không, thinking có tắt thật không, model trả lời nhanh cỡ nào, câu viết ra qua R1–R4 bao nhiêu lần.
