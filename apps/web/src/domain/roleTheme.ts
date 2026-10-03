/**
 * Mỗi nghề một màu riêng.
 *
 * `planetLook()` vốn đã gán cho mỗi nghề một cặp màu cố định, nhưng màu đó chỉ
 * dùng để vẽ hành tinh. File này nâng nó lên thành màu nhấn của cả giao diện:
 * bước vào Back-end thì màn hình ngả xanh dương, Front-end ngả xanh ngọc. Hành
 * tinh và màn hình lấy màu từ cùng một chỗ nên không bao giờ lệch nhau.
 *
 * ── Về bảng màu ──────────────────────────────────────────────────────────
 * Chín màu dựng trong không gian OKLCH ở L=0.62, cách đều nhau về sắc, rồi
 * kiểm bằng bộ kiểm tra bảng màu (chế độ tối, nền #142B52):
 *
 *   dải sáng ✓   sàn chroma ✓   tương phản nền ✓   tách cặp kề ✓
 *
 * Thứ tự các ô KHÔNG tuỳ tiện — đây là một hoán vị tìm được bằng cách thử,
 * trong đó mọi cặp kề nhau đều vượt ngưỡng phân biệt (xếp xanh lá cạnh đỏ san
 * hô chẳng hạn thì tụt xuống ΔE 0.8 với người mù màu deutan). Đổi thứ tự là
 * phải chạy lại bộ kiểm tra.
 *
 * Chín màu cùng xuất hiện trên bản đồ sao thì không thể tách hết mọi cặp —
 * đây là giới hạn đã biết, bảng màu chuẩn tám ô cũng chỉ bảo đảm được ba.
 * Ở đây không sao, vì trên bản đồ màu không phải thứ duy nhất để phân biệt:
 * mỗi hành tinh luôn kèm tên, thêm vành đai và vệ tinh khác nhau.
 */

/** Hash ổn định trên chuỗi — cùng chuỗi luôn cho cùng số. */
export function hashCode(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

export interface RoleTheme {
  /** Màu nhấn — chữ, viền, chi tiết nổi. */
  accent: string;
  /** Nền loãng cùng tông, dùng cho mảng lớn. */
  accentSoft: string;
  /** Quầng sáng, cho bóng đổ và hiệu ứng. */
  accentGlow: string;
  /** Lõi tối của hành tinh, cùng sắc độ với màu nhấn. */
  core: string;
  /** Tên gọi nội bộ, để dò lỗi cho dễ. */
  name: string;
}

const make = (
  name: string,
  core: string,
  accent: string,
  rgb: string,
): RoleTheme => ({
  name,
  core,
  accent,
  accentSoft: `rgba(${rgb}, 0.14)`,
  accentGlow: `rgba(${rgb}, 0.45)`,
});

const THEMES: readonly RoleTheme[] = [
  make('amber', '#491700', '#C56A3E', '197, 106, 62'),
  make('magenta', '#480046', '#B167AB', '177, 103, 171'),
  make('green', '#003306', '#4E9A52', '78, 154, 82'),
  make('violet', '#360761', '#9372C8', '147, 114, 200'),
  make('jade', '#013125', '#109D7B', '16, 157, 123'),
  make('blue', '#002A4E', '#418AD1', '65, 138, 209'),
  make('coral', '#540006', '#C8635D', '200, 99, 93'),
  make('teal', '#003030', '#06999A', '6, 153, 154'),
  make('gold', '#362600', '#A87F09', '168, 127, 9'),
];

/**
 * Nghề chơi được thì lấy màu theo thứ tự trong bộ dữ liệu, không lấy theo hash.
 *
 * Hash cho kết quả dồn cục: chín nghề rơi vào bảy màu khiến Front-end, UI/UX
 * và Tech Lead cùng một màu — mà Front-end với UI/UX lại là hai nghề gần nhau,
 * nằm cạnh nhau trên bản đồ và có đường nối giữa chúng. Chia theo thứ tự thì
 * mỗi nghề một màu, đúng như bảng màu được dựng ra để làm.
 *
 * Nghề ngoài nhóm chơi được (gợi ý chuyển ngang như DATA_DE) không có trong
 * danh sách này nên rơi về hash — chúng chỉ xuất hiện lẻ một mình nên trùng
 * màu cũng không sao.
 */
const ORDER = new Map<string, number>(
  [
    'SWE_FRONTEND',
    'SWE_BACKEND',
    'SWE_MOBILE',
    'SWE_GAME',
    'SWE_UIUX',
    'SWE_EMBEDDED',
    'SWE_ARCH_SOL',
    'SWE_TECHLEAD',
    'SWE_EM',
  ].map((code, index) => [code, index]),
);

/** Màu của một nghề. Cùng `role_code` thì lần nào cũng ra đúng một màu. */
export function roleTheme(roleCode: string): RoleTheme {
  const slot = ORDER.get(roleCode);
  return THEMES[slot ?? hashCode(roleCode) % THEMES.length];
}

/** Màu mặc định khi chưa ở nghề nào — giữ nguyên vàng của Celestial Night. */
export const DEFAULT_THEME: RoleTheme = make(
  'starlight',
  '#5E4418',
  '#D4B06A',
  '212, 176, 106',
);

/** Biến CSS để gắn lên một nhánh DOM. */
export const themeVars = (theme: RoleTheme): Record<string, string> => ({
  '--accent': theme.accent,
  '--accent-soft': theme.accentSoft,
  '--accent-glow': theme.accentGlow,
  '--accent-core': theme.core,
});
