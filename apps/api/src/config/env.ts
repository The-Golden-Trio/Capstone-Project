/**
 * Biến môi trường, kiểm ngay lúc khởi động.
 *
 * Thiếu một bí mật thì tiến trình dừng lại với tên biến còn thiếu — rẻ hơn
 * nhiều so với việc phát hiện ra lúc người dùng đầu tiên bấm đăng nhập.
 */
import { z } from 'zod';

/**
 * Dòng `KHOÁ=` để trống trong `.env` nghĩa là "không đặt", không phải chuỗi
 * rỗng — nếu không thì giá trị mặc định không bao giờ được dùng.
 */
const blankAsUnset = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema);

const optionalText = blankAsUnset(z.string().trim().min(1).optional());

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

  /*
   * Model AI. Không bắt buộc: thiếu key thì API vẫn chạy, chỉ phần gọi model
   * báo "không có model" — để cả nhóm chạy được backend khi chưa mua token.
   */

  /** Key của Alibaba Cloud Model Studio (Qwen). */
  QWEN_API_KEY: optionalText,
  /**
   * Region của Model Studio. Singapore gần Việt Nam nhất nhưng (29/10/2026)
   * chưa hỗ trợ JSON Schema strict; Frankfurt và Virginia có.
   */
  QWEN_REGION: blankAsUnset(
    z.enum(['ap-southeast-1', 'eu-central-1', 'us-east-1']).default('eu-central-1'),
  ),
  /** Workspace ID — endpoint của Model Studio có dạng `{WorkspaceId}.{region}.maas.aliyuncs.com`. */
  QWEN_WORKSPACE_ID: optionalText,
  /** Đè hẳn endpoint, khi Alibaba đổi đường dẫn. */
  QWEN_BASE_URL: optionalText,
  /** `implicit`: tự động, không phí tạo. `explicit`: đánh dấu, rẻ hơn khi ≥ 4 lượt dùng chung trong 5 phút. */
  QWEN_CACHE_MODE: blankAsUnset(
    z.enum(['implicit', 'explicit']).default('implicit'),
  ),

  /** Key của DeepSeek — model dự phòng. */
  DEEPSEEK_API_KEY: optionalText,

  /**
   * Cho gửi câu người chơi tới nhà cung cấp CHƯA có cam kết không huấn luyện
   * trên dữ liệu (phần 7 thiết kế AI-4). Mặc định tắt; chỉ bật khi thử nghiệm
   * bằng dữ liệu giả.
   */
  AI_ALLOW_UNCONFIRMED_PROVIDERS: blankAsUnset(
    z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  ),
});

export type Env = z.infer<typeof EnvSchema>;

const AiEnvSchema = EnvSchema.pick({
  QWEN_API_KEY: true,
  QWEN_REGION: true,
  QWEN_WORKSPACE_ID: true,
  QWEN_BASE_URL: true,
  QWEN_CACHE_MODE: true,
  DEEPSEEK_API_KEY: true,
  AI_ALLOW_UNCONFIRMED_PROVIDERS: true,
});

export type AiEnv = z.infer<typeof AiEnvSchema>;

/** Chỉ phần biến của AI — cho script chạy ngoài Nest, không cần database hay secret JWT. */
export const loadAiEnv = (source: NodeJS.ProcessEnv = process.env): AiEnv =>
  AiEnvSchema.parse(source);

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
