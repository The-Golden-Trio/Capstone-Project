# Số liệu Chương 7 (đo 20/10/2026)

Mọi số trong Chương 7 của `report.md` lấy từ thư mục này. Đo trên prototype ở commit `9effe15`, build production, một máy: Apple M1 Pro 8 nhân, 16 GB, macOS 27.0.1, Node.js 20.19, PostgreSQL 17 (Homebrew).

| Thư mục | Mục báo cáo | Có gì |
|---|---|---|
| `frontend/` | 7.1 | Script Lighthouse (`run.mjs`), server tĩnh có gzip đóng vai CDN (`serve.mjs`), `summary.json` (trung vị 5 lần chạy cho mỗi trang và profile) |
| `backend/` | 7.2 | Script k6 (`session.js`, `capacity.js`), bộ tự chơi (`autoplay.ts`), `analyse.py`, bản tóm tắt từng lần chạy |
| `ai-pilot/` | 7.3.3 | Bộ câu thử (`probes.json`), script chấm bằng bộ chấm từ khoá (`keyword-baseline.ts`), `results.json` |

## Chạy lại

Không dùng database dev `vaonghe`. Tạo database riêng rồi seed nội dung:

```sh
createdb jobquest_eval
export DATABASE_URL=postgresql://$USER@localhost:5432/jobquest_eval DIRECT_URL=$DATABASE_URL
pnpm exec prisma migrate deploy --config apps/api/prisma.config.ts
pnpm exec nx run @datn/api:seed-content
pnpm nx run-many -t build --projects=@datn/web,@datn/api
set -a; . apps/api/.env; set +a
NODE_ENV=production DATABASE_URL=$DATABASE_URL DIRECT_URL=$DATABASE_URL node apps/api/dist/main.js
```

- **Tài khoản thử:** 500 tài khoản `eval000`…`eval499`, mật khẩu `evaluation-pass-1`, tạo bằng cách gọi `POST /api/auth/register` (xem `backend/register.mjs`).
- **k6 v2.3.0:** `k6 run -e VUS=50 -e HOLD=3m --out csv=session_50.csv session.js`, lặp lại với `VUS=500` và `VUS=1000`; `k6 run capacity.js`. Sau đó `python3 analyse.py session_50.csv`. `session.js` import `autoplay.bundle.js`, dựng bằng `esbuild autoplay.ts --bundle --format=esm --platform=neutral`.
- **Lighthouse 13.5.0:** `node serve.mjs apps/web/dist 4300`, rồi `node run.mjs out 5`. Cần cài `lighthouse` bằng npm ở thư mục chạy script.
- **Bộ chấm từ khoá:** chạy theo lệnh ở đầu `ai-pilot/keyword-baseline.ts`.

## Lưu ý khi đọc số

- Máy đo vừa chạy API vừa chạy k6, trên cùng một máy, không có mạng thật ở giữa.
- Một nhân M1 Pro nhanh hơn một vCPU trên cloud, nên trần thông lượng ở đây là cận trên cho giả định "khoảng 300 request nhẹ mỗi giây trên một replica" của §5.3.
- Lighthouse chạy Chrome headless, WebGL vẽ bằng SwiftShader (CPU). Điểm của trang bản đồ 3D vì vậy là cận dưới.
- Mức trong `probes.json` do người viết câu trả lời đặt theo thiết kế, chưa có người thứ hai gán mù và cô chưa kiểm.

## Hai lần đo hỏng (đã chạy lại, báo cáo có ghi)

- **k6, mức 1.000 lần đầu:** 54% request lỗi 401 vì chỉ có 500 tài khoản cho 1.000 người dùng ảo. Đã tạo thêm `eval500`…`eval999` (`FROM=500 N=500 node register.mjs`), và `session.js` giờ dừng ngay nếu một lượt đăng nhập trong `setup()` thất bại.
- **Lighthouse lần đầu:** mọi trang cần đăng nhập bị chuyển về `/login`, do dùng chung một Chrome cho mọi trang. `run.mjs` giờ mở Chrome mới cho từng lần chạy (cache cũng lạnh như lần đầu vào) và dừng nếu URL cuối khác URL cần đo.
- **Tài khoản cho Lighthouse:** `eval499` đã làm quiz và đã ghi danh SWE_BACKEND L1 (`POST /api/profile/roles/SWE_BACKEND/enroll {"band":"L1"}`), nếu không thì trang bản đồ cấp chuyển về trang nghề; trang `/quiz` đo bằng `eval497`, chưa làm quiz.
- Một lần chạy của trang chơi không đo được LCP (`NO_LCP` của Lighthouse); trung vị lấy từ các lần còn lại.
