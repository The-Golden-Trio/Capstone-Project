# JobQuest

_Try the job before you pick the career._ Nền tảng cho người dùng **làm thử một nghề** qua các scenario nhập vai, AI dẫn dắt và chấm điểm. Đồ án tốt nghiệp HCMUT của nhóm Golden Trio.

| App                      | Là gì                                                    | Cổng dev                      |
| ------------------------ | -------------------------------------------------------- | ----------------------------- |
| `apps/web` (`@datn/web`) | App người chơi (explorer): bản đồ nghề, màn chơi         | `http://localhost:4200`       |
| `apps/staff`             | Staff app cho Content Admin, Domain Expert soạn scenario | `http://localhost:4300/staff` |
| `apps/api` (`@datn/api`) | API NestJS + worker (chấm, sinh nội dung, email)         | `http://localhost:3000/api`   |
| `packages/game-core`     | Luật chơi dùng chung cho web và API                      | —                             |

Context dự án, bản đồ code và trạng thái hiện thực: [`AGENTS.md`](AGENTS.md). Tài liệu đề tài: [`docs/project-hub/00-tong-quan.md`](docs/project-hub/00-tong-quan.md). Quy ước commit và PR: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Cần cài

- Node.js 22, pnpm 10 (`corepack enable` là có đúng bản trong `packageManager`).
- Docker (Docker Desktop hoặc OrbStack) cho Postgres, Redis, Mailpit, MinIO.

## Chạy lần đầu

### 1. Cài dependency

```sh
pnpm install --frozen-lockfile
```

### 2. Bật dịch vụ phụ

```sh
docker compose -f infra/local/dev-stack.yml up -d
```

| Dịch vụ  | Địa chỉ                                                            | Dùng cho                         |
| -------- | ------------------------------------------------------------------ | -------------------------------- |
| Postgres | `postgresql://jobquest:jobquest@localhost:5433/jobquest`           | DB dev riêng của máy bạn         |
| Redis    | `redis://localhost:6379`                                           | Job queue và luồng sự kiện (SSE) |
| Mailpit  | SMTP `localhost:1025`, hộp thư `http://localhost:8025`             | Xem email thông báo              |
| MinIO    | `http://localhost:9000` (user `jobquest`, mật khẩu `jobquest-dev`) | Ảnh asset của staff app          |

### 3. Tạo file môi trường

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Trong `apps/api/.env`, điền tối thiểu:

```sh
DATABASE_URL=postgresql://jobquest:jobquest@localhost:5433/jobquest
DIRECT_URL=postgresql://jobquest:jobquest@localhost:5433/jobquest
JWT_ACCESS_SECRET=<openssl rand -base64 48>
JWT_REFRESH_SECRET=<openssl rand -base64 48>
GOOGLE_CLIENT_ID=<client ID Google, cùng giá trị VITE_GOOGLE_CLIENT_ID bên web>
SMTP_URL=smtp://localhost:1025
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=jobquest
S3_SECRET_KEY=jobquest-dev
```

> **Đừng trỏ dev vào DB dùng chung của nhóm (Supabase).** Migration `20261112120000_identity_erd01` chép bảng `User` sang `user_account` rồi xoá `User`; chỉ chạy lên DB dùng chung khi cả nhóm đã thống nhất. Nếu `.env` của bạn đang trỏ Supabase, đặt `DATABASE_URL`/`DIRECT_URL` ngay trên dòng lệnh như ví dụ ở bước 6: biến trên dòng lệnh đè lên `.env`.

Key AI (không bắt buộc để chạy, nhưng cần cho phần chấm và dẫn truyện thật):

| Biến                 | Dùng cho                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `OPENROUTER_API_KEY` | Panel 3 judge chấm câu tự luận (AI-5). Thiếu thì màn chơi kẹt ở "Đang soạn nhận xét…"                       |
| `QWEN_API_KEY`       | Người dẫn truyện, câu hỏi thêm (AI-4). Có thể dùng qua OpenRouter                                           |
| `AI_MODE`            | `fake`: dẫn truyện ca làm và sinh scenario ở staff app dùng bản giả, chỉ cho dev. Để trống = `fake` khi dev |

Kiểm key judge (gọi thật, tốn vài phần nghìn USD):

```sh
pnpm exec nx run @datn/api:judge-try -- --mode=live
```

### 4. Tạo bảng

```sh
pnpm exec prisma migrate deploy --config apps/api/prisma.config.ts
```

### 5. Đưa dữ liệu vào DB

```sh
pnpm exec nx run @datn/api:seed-content
SEED_STAFF_PASSWORD='<mật khẩu dev>' pnpm exec nx run @datn/api:seed-staff
```

- `seed-content`: nội dung game (2 scenario Back-end L1/L3, seed ca làm L3).
- `seed-staff`: tài khoản `sa@`, `ca@`, `de1@`, `de2@`, `de3@jobquest.local` với mật khẩu bạn đặt, nghề `SWE_BACKEND` có cấp, task, năng lực, tiêu chí duyệt. Dữ liệu gắn nhãn `[dev]`, không phải nội dung chuyên gia đã duyệt. Chạy lại không nhân dữ liệu (dùng để đổi mật khẩu).

### 6. Chạy

```sh
pnpm start
```

Lệnh này chạy API, worker, web và staff app cùng lúc. Nếu `.env` đang trỏ DB khác, đè biến ngay trên dòng lệnh:

```sh
DATABASE_URL=postgresql://jobquest:jobquest@localhost:5433/jobquest DIRECT_URL=postgresql://jobquest:jobquest@localhost:5433/jobquest pnpm start
```

Chạy riêng từng phần: `pnpm start:api`, `pnpm start:worker`, `pnpm start:web`, `pnpm start:staff`.

## Thử nhanh

- **Người chơi:** đăng ký ở `http://localhost:4200/register`, rồi chơi `http://localhost:4200/quest/SWE_BACKEND_L1_S_EXEC`. Câu tự luận cuối màn cần `OPENROUTER_API_KEY`.
- **Staff:** đăng nhập `http://localhost:4300/staff/login` bằng `ca@jobquest.local`: mở scenario cho một task, giao `de1` viết, `de2` duyệt. Đăng nhập `de1` để soạn (sinh bằng AI, sửa, kiểm, nộp), `de2` để duyệt, rồi `ca` để chọn ảnh, trình bày và dựng bản nháp. Email thông báo xem ở Mailpit.

## Kiểm tra trước khi push

```sh
pnpm exec nx format:check
pnpm check          # lint + typecheck + build + test mọi project
```

`pnpm check` chạy bước `build-data`, có thể sinh lại `docs/data/game-data.js` và `packages/game-core/data/game-data.json`. Đây là file sinh tự động; nếu không cố ý đổi dữ liệu thì trả về bằng `git checkout -- docs/data/game-data.js packages/game-core/data/game-data.json`.

## Lỗi hay gặp

| Triệu chứng                                | Cách xử lý                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| API báo `Cấu hình môi trường không hợp lệ` | Thiếu biến bắt buộc ở bước 3 (`GOOGLE_CLIENT_ID`, hai secret JWT ≥ 32 ký tự…) |
| Không kết nối được Postgres/Redis          | Docker chưa chạy: bật Docker rồi chạy lại bước 2                              |
| Màn chơi dừng ở "Đang soạn nhận xét…"      | Thiếu `OPENROUTER_API_KEY`, hoặc worker chưa chạy                             |
| Staff app báo "Chưa cấu hình kho lưu ảnh"  | Thiếu `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`                         |
