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

export const RegisterSchema = z.object({
  username,
  email: z.email('email không hợp lệ').toLowerCase(),
  password,
  displayName: z.string().trim().min(1, 'chưa có tên hiển thị').max(48),
  dateOfBirth,
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  /** Tên đăng nhập hoặc email. */
  identifier: z.string().trim().min(1, 'chưa nhập tên đăng nhập'),
  password: z.string().min(1, 'chưa nhập mật khẩu'),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const GoogleSignInSchema = z.object({
  /** ID token do Google Identity Services trả về trên trình duyệt. */
  credential: z.string().min(1),
  /** Chỉ dùng khi tạo tài khoản mới từ Google. */
  dateOfBirth: dateOfBirth.optional(),
});
export type GoogleSignInDto = z.infer<typeof GoogleSignInSchema>;

export const ConsentSchema = z.object({
  guardianName: z.string().trim().min(1, 'chưa có tên người giám hộ').max(64),
  guardianEmail: z.email('email không hợp lệ').toLowerCase(),
});
export type ConsentDto = z.infer<typeof ConsentSchema>;

export const UpdateAccountSchema = z.object({
  displayName: z.string().trim().min(1).max(48).optional(),
  email: z.email('email không hợp lệ').toLowerCase().optional(),
});
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;

export const ChangePasswordSchema = z.object({
  /** Rỗng với tài khoản Google chưa từng đặt mật khẩu. */
  currentPassword: z.string().optional(),
  newPassword: password,
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
