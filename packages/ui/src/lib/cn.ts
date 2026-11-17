/** Ghép class, bỏ giá trị rỗng. Không trộn xung đột kiểu tailwind-merge: component đặt class gốc trước, class truyền vào sau. */
export function cn(
  ...parts: Array<string | false | null | undefined | 0>
): string {
  return parts.filter(Boolean).join(' ');
}
