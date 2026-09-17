/** Hàm định dạng và chuẩn hoá chuỗi. Thuần, không phụ thuộc React. */
import type { Role } from '../data/schema';

/** 18_500_000 -> "18.5 tr". Không có số thì trả dấu gạch. */
export const formatVnd = (amount: number | null | undefined): string =>
  amount ? `${(amount / 1e6).toFixed(1).replace(/\.0$/, '')} tr` : '—';

/** "Lập trình viên Back-end / Kỹ sư Back-end" -> "Lập trình viên Back-end". */
export const shortRoleName = (role: Role): string =>
  role.role_name_vn.split('/')[0].trim();

export const shortName = (name: string): string => name.split('/')[0].trim();

/**
 * Bỏ dấu tiếng Việt và hạ chữ thường — dùng cho so khớp từ khoá khi chấm.
 * "Truy vấn" và "truy van" phải khớp nhau.
 */
export const normalizeVi = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

/** Bỏ tiền tố tên NPC ("An: '…'") khỏi một câu thoại. */
export const stripNpcPrefix = (line: string): string =>
  String(line)
    .replace(/^[^:]{1,14}:\s*/, '')
    .replace(/^['"]|['"]$/g, '');

/** Viết tắt tên hiển thị trên avatar: tối đa 4 ký tự của từ đầu. */
export const initials = (name: string): string =>
  name.split(/\s+/)[0].slice(0, 4);

/** Khoá nhận diện một việc đã hoàn thành trong hồ sơ người chơi. */
export const taskKey = (roleCode: string, band: string, id: string): string =>
  `${roleCode}:${band}:${id}`;
