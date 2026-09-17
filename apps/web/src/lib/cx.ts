/** Ghép className, bỏ qua giá trị rỗng. Đủ dùng, không cần thư viện. */
export const cx = (
  ...parts: Array<string | false | null | undefined>
): string => parts.filter(Boolean).join(' ');
