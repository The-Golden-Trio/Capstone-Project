/**
 * Vị trí thế giới của tàu, chia sẻ giữa `Ship` (ghi) và `CameraRig` (đọc).
 *
 * Để ở module thay vì store vì nó đổi 60 lần/giây — đưa vào zustand sẽ kéo
 * cả trang re-render theo từng khung hình.
 */
import { Vector3 } from 'three';

export const shipWorldPos = new Vector3();
