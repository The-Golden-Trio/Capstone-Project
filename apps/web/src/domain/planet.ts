/**
 * Mỗi nghề là một hành tinh. Vành đai, vệ tinh và độ nghiêng của dải mây đều
 * suy ra từ `role_code` nên cùng một nghề lần nào cũng ra đúng một hành tinh.
 *
 * Màu thì lấy thẳng từ `roleTheme` — cùng một nguồn với màu nhấn của giao
 * diện, nên hành tinh Back-end và màn hình Back-end luôn cùng tông. Trước đây
 * hai chỗ giữ hai bảng màu riêng và không có gì bắt chúng phải khớp nhau.
 */
import { hashCode, roleTheme } from './roleTheme';

export { hashCode };

const BAND_ANGLES = [18, -24, 42, -8, 64];

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
  const theme = roleTheme(roleCode);
  return {
    core: theme.core,
    glow: theme.accent,
    hasRing: hash % 5 === 0 || hash % 5 === 3,
    hasMoon: hash % 3 === 0,
    bandAngle: BAND_ANGLES[hash % BAND_ANGLES.length],
  };
}
