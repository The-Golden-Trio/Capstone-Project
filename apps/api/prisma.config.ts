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
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
