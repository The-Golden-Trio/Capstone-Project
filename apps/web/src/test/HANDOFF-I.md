# Bàn giao Codex I — automated explorer UI tests

Chỉ thêm test và helper; không sửa mã app, không install, commit hay tạo subagent.

## Đã thực hiện

17 test mới trong 10 file `*.spec.tsx` cạnh mã nguồn:

- `features/auth/AuthFlow.spec.tsx`: validation đăng ký (5 trường/đồng ý, email, độ dài mật khẩu, ngày sinh), tạo tài khoản và redirect `/welcome`, lỗi đăng nhập, RequireAuth giữ pathname + query khi redirect.
- `features/galaxy/GalaxyPage.spec.tsx`: danh sách đủ 221 nghề, tìm `dieu duong`, chip vùng đối chiếu đúng mã nghề, mở/đóng peek qua `?nghe=` và chọn hành tinh cập nhật URL.
- `features/occupation/OccupationPage.spec.tsx`: toàn bộ downsides và link đảo tới đúng cấp.
- `features/quiz/QuizJourney.spec.tsx`: đi đủ 18 thẻ bằng phím 1/2/3; kiểm payload gửi đủ câu trả lời; bỏ phần kể về bạn; chuyển result; 1–3 gợi ý, nội dung mặt khó đã tải, không có “phù hợp”, “hợp nhất”, “bạn nên”, “%”.
- `features/play/PlayJourney.spec.tsx`: mở SWE_BACKEND.L3.m2 qua demo, “Vào ca”, Space qua thoại, chọn việc qua Sheet, hội thoại say/end, timed choice, form tài liệu, confirm end, tới reflect và gửi tự soi; tổng kết đối chiếu điểm, đủ ba phần phản hồi và từng soft-skill delta.
- `features/play/BeatProgression.spec.tsx`: Space tiến thoại, không tiến khi gõ trong input; ca mới giữ nhịp sau trong queue.
- `features/summary/SummaryPage.spec.tsx`: mock hook cho PENDING/NOT_AVAILABLE; vẫn xem được diễn biến/dữ kiện, không giả điểm 0 hoặc phản hồi khi chưa có.
- `features/profile/ProfileTabs.spec.tsx`: khởi tạo từ `?tab=nhat-ky`, đổi đủ bốn tab, kiểm tabpanel tương ứng và giữ query khác. Tên riêng để giữ nguyên `ProfilePage.spec.tsx` do agent khác bổ sung song song.
- `features/settings/SettingsPage.spec.tsx`: từ chối rỗng/XOA/xoá/“XOÁ ”; huỷ và mở lại reset ô nhập; chỉ XOÁ mới gọi API, xoá dữ liệu demo, clear session, về trang đầu.
- `features/feedback/FeedbackPage.spec.tsx`: chặn gửi trống, chọn loại, gửi payload đã trim, xác nhận success + toast và reset form để gửi tiếp.

`test/renderWithProviders.tsx`: QueryClient riêng mỗi lần render, retry off, ToastProvider, MemoryRouter và LocationProbe; polyfill dialog/matchMedia/ResizeObserver/scrollIntoView; cleanup DOM/cache/storage/demo DB/session giữa test. Đặt VITE_API_MODE=demo trước import. Mock riêng độ trễ `wait`/`service` của store, vẫn dùng toàn bộ API demo, dữ liệu nghề, engine ca làm và mock AI hiện hành. Giảm chuyển động để không chờ typewriter. GalaxyMap được thay bằng nút gọi callback vì jsdom không dựng canvas.

Các test profile/settings/feedback được viết sau các luồng còn lại theo yêu cầu.

## Lỗi phát hiện

Lỗi tự hiện hết nhịp thoại khi mở ca mới được xác nhận ở bản đầu của `features/play/usePlaySession.ts` (effect tăng revealed). Repro: mở ca mẫu mới, không bấm Space; toàn bộ NPC/scene đã vào `shown`, `queued=0`. Expected: chỉ nhịp đầu hiện, các nhịp sau chờ bấm.

Mã app đã được agent khác sửa song song trong lúc chạy kiểm tra. Test hồi quy ban đầu dùng `it.fails`, sau đó được chuyển thành `it` khi bản sửa làm kỳ vọng đúng chạy đạt. Codex I không sửa mã app. Hiện không còn lỗi app tái hiện được trong phạm vi bộ test này, không có `it.todo`/`it.fails` treo lại.

## Kiểm tra

- `pnpm exec vitest run --config apps/web/vite.config.mts`: toàn bộ web đạt 65/65; lần chạy toàn bộ trước bàn giao khoảng 16 giây, dưới 60 giây. Bao gồm test do các agent khác bổ sung.
- `pnpm exec tsc --noEmit -p apps/web/tsconfig.app.json`: đạt.
- ESLint toàn bộ helper và 10 file test của Codex I: đạt, không warning.
- Prettier toàn bộ helper và 10 file test của Codex I: đã format.
- Kiểm tra TypeScript riêng các test mới qua TypeScript compiler API, dùng options strict của app nhưng không dùng project reference/output build: đạt. `tsconfig.spec.json` hiện yêu cầu declaration output của app qua project reference, nên chạy trực tiếp `tsc --noEmit -p ...spec.json` khi chưa build báo TS6305; không sửa cấu hình trong task chỉ viết test.

## Giới hạn

Đây là integration UI test với jsdom và API demo; không kiểm CSS/layout 360 px, canvas thật, backend/Redis/SSE mạng thật hay AI thật. Điểm/tổng kết ca mẫu là dữ liệu heuristic demo, không phải kết quả AI-5 thực nghiệm. Các thư mục app vẫn được sửa song song; cần chạy lại test nếu có thêm thay đổi sau bàn giao.
