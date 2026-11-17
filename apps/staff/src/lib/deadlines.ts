/** Sắp hạn gần nhất trước; thiếu/sai ngày để cuối, giữ nguyên mảng nguồn. */
export function byDeadline<T>(
  items: readonly T[],
  deadline: (item: T) => string | null | undefined,
): T[] {
  const timestamp = (item: T) => {
    const raw = deadline(item);
    const time = raw ? Date.parse(raw) : NaN;
    return Number.isFinite(time) ? time : Infinity;
  };
  return [...items].sort((a, b) => timestamp(a) - timestamp(b));
}
