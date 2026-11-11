/**
 * Đồng hồ của ca làm: giờ trong truyện suy ra từ số điểm đã dùng (A1).
 *
 * Một điểm là một số phút cố định khai ở gói cấp, nên đồng hồ và ngân sách
 * luôn là một: không có chuyện nhảy giờ.
 */

/** "9:40" → 580 (phút từ nửa đêm). */
export function toMinutes(clock: string): number {
  const [h, m] = clock.split(':').map(Number);
  return h * 60 + m;
}

/** 580 → "9:40". */
export function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** Mốc giờ quy ra số điểm tính từ giờ bắt đầu. */
export function pointAt(
  clock: string,
  start: string,
  minutesPerPoint: number,
): number {
  return Math.ceil((toMinutes(clock) - toMinutes(start)) / minutesPerPoint);
}

/** Số điểm đã dùng quy ra giờ trong truyện. */
export function clockAt(
  points: number,
  start: string,
  minutesPerPoint: number,
): string {
  return fromMinutes(toMinutes(start) + points * minutesPerPoint);
}
