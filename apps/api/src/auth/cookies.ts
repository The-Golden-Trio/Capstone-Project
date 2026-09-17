import type { CookieOptions, Response } from 'express';
import { REFRESH_TOKEN_TTL_DAYS } from '../config/env';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

/** Đường dẫn hẹp cho refresh token: chỉ gửi kèm khi gọi các route auth. */
const REFRESH_COOKIE_PATH = '/api/auth';

/**
 * Cả hai cookie đều `httpOnly`: JavaScript không đọc được, nên một lỗ hổng
 * XSS cũng không lấy được phiên đi. Đây là lý do chọn cookie thay vì trả
 * token về cho máy khách tự giữ — người dùng của hệ thống này có trẻ vị
 * thành niên, Nghị định 13/2023/NĐ-CP đặt ra yêu cầu bảo vệ dữ liệu tương ứng.
 *
 * `sameSite: 'lax'` đủ an toàn vì lúc dev web và api cùng origin (proxy Vite),
 * còn khi chạy thật thì đứng sau cùng một tên miền.
 */
function baseOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; refreshExpiresAt: Date },
  isProduction: boolean,
): void {
  const base = baseOptions(isProduction);

  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response, isProduction: boolean): void {
  const base = baseOptions(isProduction);
  res.clearCookie(ACCESS_COOKIE, { ...base, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...base, path: REFRESH_COOKIE_PATH });
}
