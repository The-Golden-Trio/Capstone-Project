import { MINOR_AGE_THRESHOLD } from '../config/env';

export type ConsentStatus = 'not_required' | 'pending' | 'granted';

/** Tuổi tròn tính tới hôm nay. Hàm thuần nên kiểm được không cần cơ sở dữ liệu. */
export function ageInYears(
  dateOfBirth: Date,
  now: Date = new Date(),
): number {
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  const dayDiff = now.getUTCDate() - dateOfBirth.getUTCDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
  return age;
}

export const isMinor = (dateOfBirth: Date, now?: Date): boolean =>
  ageInYears(dateOfBirth, now) < MINOR_AGE_THRESHOLD;

/**
 * Trạng thái đồng ý của người giám hộ.
 *
 * Chưa khai ngày sinh thì coi như chưa cần — không chặn người dùng vì một ô
 * còn trống. Dưới 16 tuổi mà chưa có bản ghi đồng ý thì `pending`, và giao
 * diện dẫn thẳng tới màn hình đồng ý.
 */
export function consentStatus(
  dateOfBirth: Date | null,
  hasConsentRecord: boolean,
  now?: Date,
): ConsentStatus {
  if (!dateOfBirth || !isMinor(dateOfBirth, now)) return 'not_required';
  return hasConsentRecord ? 'granted' : 'pending';
}
