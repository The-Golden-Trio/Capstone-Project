/**
 * Mỗi nghề là một hành tinh. Màu, vành đai, vệ tinh đều suy ra từ `role_code`
 * nên cùng một nghề lần nào cũng ra đúng một hành tinh — không random.
 */

const PALETTE: ReadonlyArray<readonly [string, string]> = [
  ['#16305C', '#4A7FC8'], // xanh đêm
  ['#14454B', '#3E9AA1'], // ngọc lam
  ['#262050', '#6152B8'], // tím sao
  ['#5E4418', '#D4B06A'], // hổ phách
  ['#52251F', '#C4655A'], // gỉ sắt
  ['#1D3550', '#7FA8D4'], // băng
  ['#213F2E', '#5FAE83'], // lục rêu
];

const BAND_ANGLES = [18, -24, 42, -8, 64];

/** Hash ổn định trên chuỗi — cùng chuỗi luôn cho cùng số. */
export function hashCode(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

export interface PlanetLook {
  /** Màu tối (lõi) và màu sáng (được chiếu). */
  core: string;
  glow: string;
  hasRing: boolean;
  hasMoon: boolean;
  /** Góc nghiêng của các dải mây, tính bằng độ. */
  bandAngle: number;
}

export function planetLook(roleCode: string): PlanetLook {
  const hash = hashCode(roleCode);
  const [core, glow] = PALETTE[hash % PALETTE.length];
  return {
    core,
    glow,
    hasRing: hash % 5 === 0 || hash % 5 === 3,
    hasMoon: hash % 3 === 0,
    bandAngle: BAND_ANGLES[hash % BAND_ANGLES.length],
  };
}
