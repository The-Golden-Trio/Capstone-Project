# Context riêng: thiết kế AI của JobQuest

Áp dụng cùng [`AGENTS.md` ở gốc](../../../../AGENTS.md). Đọc file này cả khi task về AI-4 cần sửa code hoặc deck ở ngoài thư mục này.

## Đường đọc ngắn nhất

| Task                             | Đọc                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Viết/sửa một phần thiết kế AI-4  | `ai-4-thiet-ke.md`: bảng trạng thái, câu hỏi còn mở, rồi phần được yêu cầu                                                                         |
| Sửa slide AI-4                   | `../../slides/JobQuest_AI4_Deck.html`, phần tương ứng trong `ai-4-thiet-ke.md`; workflow tại `../../../../.claude/skills/capstone-slides/SKILL.md` |
| Request, response, ví dụ gọi API | `ai-4-api/README.md`, `ai-4-api/request.jsonc`, rồi code sinh request                                                                              |
| Bức tranh AI chung và mâu thuẫn  | `README.md`, `kiem-ke.md`, các quyết định liên quan ở `../../02-quyet-dinh.md`                                                                     |
| Đưa nội dung đã chốt vào báo cáo | `../../../../reports/README.md`, `../../../../reports/master/report.md` §5.3.6 và các đoạn bị ảnh hưởng                                            |

Yêu cầu như “viết phần 2”, “sửa contract”, “đồng bộ deck” trong ngữ cảnh AI-4 nên được giải quyết bằng các file trên trước khi hỏi lại. Chỉ sửa và đồng bộ nội dung liên quan; không coi cả khung 8 phần đã được duyệt.

## Trạng thái và ranh giới cần giữ

Mốc đối chiếu **31/10/2026**; kiểm lại bảng trạng thái của tài liệu khi làm task:

- `ai-4-thiet-ke.md` là **bản ý tưởng**, chưa phải văn báo cáo. Phần 1 và 4 còn là nháp chờ Nhật duyệt; phần 2 chưa viết. Không tự đánh dấu duyệt sau khi biên tập.
- **AI-4 dẫn truyện, AI-5 chấm điểm.** Engine giữ thứ tự canon, quyết cờ cho hỏi và trần follow-up. AI-4 chỉ viết một lời follow-up (câu hỏi đào sâu, hoặc lời dẫn không có dấu `?`; từ 4/11 không còn lời nối riêng) và chỉ được gọi khi engine cho hỏi; không chấm điểm, tự thêm sự kiện hay quyết luồng chơi.
- **① đã chốt 30/10 trong tài liệu AI-4:** AI-5 chấm khi nộp câu trả lời; AI-4 không chờ điểm; quyền hỏi do engine quyết. Một số đoạn report master còn mô tả chờ chấm rồi mới hỏi: ghi nhận chỗ lệch, không tự đổi ngược quyết định mới khi sửa AI-4.
- **② còn mở:** cách xử lý phiên khi đầu ra hỏng/hết model. Code đã có sinh lại/đổi model và trả `unavailable`; điều đó chưa có nghĩa nhóm đã chốt mọi hành vi ở engine/UI. Report có chỗ nói dùng follow-up mặc định, có chỗ nói tạm dừng: không âm thầm chọn một phương án.
- **④ còn mở:** AI nào có được đọc thẻ “Mục tiêu của bạn” hay không. Xem thêm các câu hỏi mới phát sinh trong phần đang sửa, gồm ⑤ ở phần 4.
- Phân biệt quyết định nghiệp vụ, code hiện có và giá trị khởi đầu cần đo. Model, temperature, timeout, chi phí và latency mục tiêu không tự trở thành kết quả thực nghiệm.

## Đối chiếu code và artifact

Đường dẫn bên dưới tính từ gốc repo:

- Schema/luật: `packages/game-core/src/domain/narration/rules.ts`; bộ lọc seed: `narratorView.ts`; khử định danh: `deidentify.ts` cùng thư mục.
- Schema hiện hành (từ 4/11) trả **`speaker`, `follow_up`**; `follow_up` luôn có chữ, tối đa 200 ký tự, nhiều nhất một dấu `?`. Trần token đầu ra theo hãng: Qwen 600, DeepSeek 300 (`narrator.profile.ts`). Khi mô tả payload thực tế, theo schema và request sinh từ code.
- Prompt: `apps/api/src/ai/narrator/narrator.prompt.ts`, `prompts/narrator.v1.ts`; cấu hình lượt gọi: `narrator.profile.ts`; điều phối: `narrator.service.ts`; model và adapter: `apps/api/src/ai/gateway/`.
- AI-4 không nhận rubric, khoá chấm, gợi ý chưa hiện, kết cục hay hoạt động tương lai. Không mở rộng prompt bằng cách gửi toàn bộ scenario thô; dùng `narratorView` và kiểm test chống lộ nội dung.
- Luật R1–R4 chạy bằng code; không mô tả chúng như bảo đảm phát hiện mọi ý bịa hay rubric diễn đạt lại. Nội dung người chơi là dữ liệu không đáng tin, cần được phân định trong prompt và khử định danh trước khi gửi.
- `apps/api/src/scripts/narrator-try.ts` sinh request mẫu. Theo `ai-4-api/README.md`, response đi kèm là **giả**, token và nội dung không dùng làm bằng chứng chất lượng/chi phí thật.
- `request.jsonc` là bản trình bày cho người đọc: message content được tách dòng, có chú thích. Payload gửi thật dùng chuỗi. Không “sửa JSON” bằng cách xoá cấu trúc trình bày này; khi đổi prompt/payload, sửa code rồi export lại và kiểm artifact.
- Chế độ thử offline không cần key: `pnpm exec nx run @datn/api:narrator-try -- --mode=fake`. Export artifact: `--mode=export`. Live cần key và gọi nhà cung cấp thật; không tự chạy để minh hoạ tài liệu.

Khi sửa nội dung đã có trong cả bản thiết kế, deck và request, kiểm các chỗ diễn đạt cùng ý. Giữ rõ nhãn “nháp”, “đã duyệt”, “chưa đo” và “còn chờ chốt”; chỉ chuyển vào report master khi yêu cầu bao gồm việc đó.
