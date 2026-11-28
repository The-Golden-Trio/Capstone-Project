/**
 * Ký hiệu của sáu vùng nghề (D-125): mỗi vùng một biểu tượng và một màu cố
 * định, dùng thay chữ ở bộ lọc, danh sách và bảng chú giải.
 */
import {
  Briefcase,
  ConciergeBell,
  Cpu,
  HeartPulse,
  Orbit,
  Palette,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { regionColor } from '@datn/ui';
import type { RegionId } from '../../api/types';

const ICONS: Record<string, LucideIcon> = {
  ky_thuat: Wrench,
  suc_khoe: HeartPulse,
  kinh_doanh: Briefcase,
  cong_nghe: Cpu,
  sang_tao: Palette,
  dich_vu: ConciergeBell,
};

export function RegionGlyph({
  id,
  size = 16,
  tinted = true,
  className,
}: {
  id: RegionId;
  size?: number;
  /** Tô màu vùng; tắt khi đặt trên nền màu (chip đang chọn). */
  tinted?: boolean;
  className?: string;
}) {
  const Icon = ICONS[id] ?? Orbit;
  return (
    <Icon
      aria-hidden
      size={size}
      strokeWidth={2.4}
      className={className}
      style={tinted ? { color: regionColor(id) } : undefined}
    />
  );
}
