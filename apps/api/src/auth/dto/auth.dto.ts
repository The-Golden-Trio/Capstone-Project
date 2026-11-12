import { z } from 'zod';

/** Chỉ chữ, số, gạch dưới và gạch ngang — để tên đăng nhập còn dùng được trong URL. */
const username = z
  .string()
  .trim()
  .min(3, 'cần ít nhất 3 ký tự')
  .max(24, 'tối đa 24 ký tự')
  .regex(/^[a-zA-Z0-9_-]+$/, 'chỉ dùng chữ, số, "_" và "-"');

/**
 * Đặt sàn ở độ dài chứ không bắt ký tự đặc biệt: quy tắc phức tạp đẩy người
 * dùng sang mật khẩu dễ đoán mà khó nhớ. Argon2 lo phần còn lại.
 */
const password = z
  .string()
  .min(8, 'cần ít nhất 8 ký tự')
  .max(128, 'tối đa 128 ký tự');

/** Chặn ngày sinh vô lý ở cả hai đầu. */
const dateOfBirth = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'định dạng YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const year = date.getUTCFullYear();
    return year >= 1900 && date.getTime() <= Date.now();
  }, 'ngày sinh không hợp lệ');

/**
 * openapi `RegisterInput` + hai trường ngoài hợp đồng đã duyệt (07 A22):
 * `username` và `dateOfBirth` (tính có cần người giám hộ đồng ý không).
 */
export const RegisterSchema = z.object({
  email: z.email('email không hợp lệ').toLowerCase(),
  password,
  displayName: z.string().trim().min(1, 'chưa có tên hiển thị').max(80),
  username: username.optional(),
  dateOfBirth: dateOfBirth.optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * openapi `SignInInput`. Trường `email` nhận cả tên đăng nhập (07 A22): explorer
 * cũ có tài khoản chỉ có tên đăng nhập, không có email.
 */
export const SignInSchema = z.object({
  email: z.string().trim().min(1, 'chưa nhập email hoặc tên đăng nhập'),
  password: z.string().min(1, 'chưa nhập mật khẩu'),
});
export type SignInInput = z.infer<typeof SignInSchema>;

/**
 * Lệch openapi (07 A24): web dùng Google Identity Services trả ID token
 * (`credential`) chứ không dùng code flow `{code, redirectUri}`.
 */
export const GoogleSignInSchema = z.object({
  credential: z.string().min(1),
  /** Chỉ dùng khi tạo tài khoản mới từ Google. */
  dateOfBirth: dateOfBirth.optional(),
});
export type GoogleSignInInput = z.infer<typeof GoogleSignInSchema>;

export const RefreshSessionSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshSessionInput = z.infer<typeof RefreshSessionSchema>;

/** Body tuỳ chọn của sign-out: có token thì chỉ đóng phiên đó, không thì đóng mọi phiên. */
export const SignOutSchema = z
  .object({ refreshToken: z.string().min(1).optional() })
  .optional()
  .default({});
export type SignOutInput = z.infer<typeof SignOutSchema>;

export const RequestPasswordResetSchema = z.object({
  email: z.email('email không hợp lệ').toLowerCase(),
});
export type RequestPasswordResetInput = z.infer<
  typeof RequestPasswordResetSchema
>;

export const ConfirmPasswordResetSchema = z.object({
  token: z.string().min(1),
  newPassword: password,
});
export type ConfirmPasswordResetInput = z.infer<
  typeof ConfirmPasswordResetSchema
>;

/* ── Route tài khoản prototype (`/api/auth/*`, màn Tài khoản của explorer) ── */

export const ConsentSchema = z.object({
  guardianName: z.string().trim().min(1, 'chưa có tên người giám hộ').max(64),
  guardianEmail: z.email('email không hợp lệ').toLowerCase(),
});
export type ConsentDto = z.infer<typeof ConsentSchema>;

export const UpdateAccountSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  email: z.email('email không hợp lệ').toLowerCase().optional(),
});
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;

export const ChangePasswordSchema = z.object({
  /** Rỗng với tài khoản Google chưa từng đặt mật khẩu. */
  currentPassword: z.string().optional(),
  newPassword: password,
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
