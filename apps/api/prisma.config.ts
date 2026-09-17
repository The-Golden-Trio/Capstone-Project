/**
 * Cấu hình cho Prisma CLI (migrate, introspect).
 *
 * Từ Prisma 7, chuỗi kết nối không nằm trong file lược đồ nữa. Ở đây dùng
 * DIRECT_URL — pooler chế độ session (cổng 5432) — vì migrate cần prepared
 * statement, thứ mà chế độ transaction (cổng 6543) không giữ được.
 *
 * Lúc chạy thật thì khác: PrismaService dựng client bằng adapter pg trỏ vào
 * DATABASE_URL. Xem apps/api/src/prisma/prisma.service.ts.
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Nạp .env theo vị trí của chính file này, không theo thư mục đang đứng:
// `pnpm db:migrate` gọi từ gốc workspace thì `dotenv/config` mặc định sẽ tìm
// .env ở gốc và không thấy gì, rồi báo thiếu DIRECT_URL một cách khó hiểu.
const here = dirname(fileURLToPath(import.meta.url));
config({ path: join(here, '.env') });

export default defineConfig({
  schema: join(here, 'prisma/schema.prisma'),
  migrations: {
    path: join(here, 'prisma/migrations'),
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
