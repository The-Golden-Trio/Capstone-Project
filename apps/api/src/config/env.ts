/**
 * Biến môi trường, kiểm ngay lúc khởi động.
 *
 * Thiếu một bí mật thì tiến trình dừng lại với tên biến còn thiếu — rẻ hơn
 * nhiều so với việc phát hiện ra lúc người dùng đầu tiên bấm đăng nhập.
 */
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  /** Pooler chế độ transaction — ứng dụng dùng cái này. */
  DATABASE_URL: z.string().min(1),
  /** Pooler chế độ session — chỉ migrate dùng tới. */
  DIRECT_URL: z.string().min(1),

  /** Cùng client ID với VITE_GOOGLE_CLIENT_ID bên web; là `audience` khi xác minh ID token. */
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(32, 'cần ít nhất 32 ký tự'),
  JWT_REFRESH_SECRET: z.string().min(32, 'cần ít nhất 32 ký tự'),

  /** Gốc của web app, dùng cho CORS khi chạy thật. Lúc dev có proxy nên không cần. */
  WEB_ORIGIN: z.string().default('http://localhost:4200'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Cấu hình môi trường không hợp lệ:\n${issues}\n\n` +
        `Xem apps/api/.env.example để biết cần những biến nào.`,
    );
  }
  return result.data;
}

/** Thời hạn token. Access ngắn vì làm mới rẻ; refresh dài nhưng xoay vòng mỗi lần dùng. */
export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL_DAYS = 7;

/** Dưới tuổi này thì cần người giám hộ đồng ý (Nghị định 13/2023/NĐ-CP). */
export const MINOR_AGE_THRESHOLD = 16;
