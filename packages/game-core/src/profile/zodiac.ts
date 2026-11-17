/**
 * Chòm sao là luật của game (khối F, D-113): cung Mặt Trời theo ngày sinh,
 * luôn bật, +12% điểm cộng cho 2 nhóm soft skill. Không dùng cho AI hay
 * gợi ý nghề; không nhân phần bị trừ.
 */
import type { SoftSkillId } from './softSkills.js';

export type ZodiacElement = 'lua' | 'dat' | 'khi' | 'nuoc';
export type ZodiacModality = 'tien_phong' | 'kien_dinh' | 'linh_hoat';

export interface ZodiacSign {
  id: string;
  name: string;
  /** Ký hiệu chiêm tinh. */
  symbol: string;
  /** Ngày bắt đầu, `[tháng, ngày]`. */
  from: [number, number];
  /** Ngày kết thúc, `[tháng, ngày]`. */
  to: [number, number];
  element: ZodiacElement;
  modality: ZodiacModality;
  buffs: [SoftSkillId, SoftSkillId];
}

export const ZODIAC_BUFF = 0.12;

export const ELEMENT_NAMES: Record<ZodiacElement, string> = {
  lua: 'Lửa',
  dat: 'Đất',
  khi: 'Khí',
  nuoc: 'Nước',
};

export const MODALITY_NAMES: Record<ZodiacModality, string> = {
  tien_phong: 'Tiên phong',
  kien_dinh: 'Kiên định',
  linh_hoat: 'Linh hoạt',
};

export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  {
    id: 'bach_duong',
    name: 'Bạch Dương',
    symbol: '♈',
    from: [3, 21],
    to: [4, 19],
    element: 'lua',
    modality: 'tien_phong',
    buffs: ['lanh_dao_kinh_doanh', 'tu_quan_ly_ap_luc'],
  },
  {
    id: 'kim_nguu',
    name: 'Kim Ngưu',
    symbol: '♉',
    from: [4, 20],
    to: [5, 20],
    element: 'dat',
    modality: 'kien_dinh',
    buffs: ['tu_quan_ly_ap_luc', 'dao_duc_chuyen_nghiep'],
  },
  {
    id: 'song_tu',
    name: 'Song Tử',
    symbol: '♊',
    from: [5, 21],
    to: [6, 20],
    element: 'khi',
    modality: 'linh_hoat',
    buffs: ['giao_tiep_hop_tac', 'thich_ung_hoc_hoi'],
  },
  {
    id: 'cu_giai',
    name: 'Cự Giải',
    symbol: '♋',
    from: [6, 21],
    to: [7, 22],
    element: 'nuoc',
    modality: 'tien_phong',
    buffs: ['tri_tue_cam_xuc', 'dao_duc_chuyen_nghiep'],
  },
  {
    id: 'su_tu',
    name: 'Sư Tử',
    symbol: '♌',
    from: [7, 23],
    to: [8, 22],
    element: 'lua',
    modality: 'kien_dinh',
    buffs: ['lanh_dao_kinh_doanh', 'giao_tiep_hop_tac'],
  },
  {
    id: 'xu_nu',
    name: 'Xử Nữ',
    symbol: '♍',
    from: [8, 23],
    to: [9, 22],
    element: 'dat',
    modality: 'linh_hoat',
    buffs: ['tu_duy_giai_quyet_van_de', 'dao_duc_chuyen_nghiep'],
  },
  {
    id: 'thien_binh',
    name: 'Thiên Bình',
    symbol: '♎',
    from: [9, 23],
    to: [10, 22],
    element: 'khi',
    modality: 'tien_phong',
    buffs: ['tri_tue_cam_xuc', 'giao_tiep_hop_tac'],
  },
  {
    id: 'bo_cap',
    name: 'Bọ Cạp',
    symbol: '♏',
    from: [10, 23],
    to: [11, 21],
    element: 'nuoc',
    modality: 'kien_dinh',
    buffs: ['tu_duy_giai_quyet_van_de', 'tu_quan_ly_ap_luc'],
  },
  {
    id: 'nhan_ma',
    name: 'Nhân Mã',
    symbol: '♐',
    from: [11, 22],
    to: [12, 21],
    element: 'lua',
    modality: 'linh_hoat',
    buffs: ['thich_ung_hoc_hoi', 'tu_duy_giai_quyet_van_de'],
  },
  {
    id: 'ma_ket',
    name: 'Ma Kết',
    symbol: '♑',
    from: [12, 22],
    to: [1, 19],
    element: 'dat',
    modality: 'tien_phong',
    buffs: ['tu_quan_ly_ap_luc', 'lanh_dao_kinh_doanh'],
  },
  {
    id: 'bao_binh',
    name: 'Bảo Bình',
    symbol: '♒',
    from: [1, 20],
    to: [2, 18],
    element: 'khi',
    modality: 'kien_dinh',
    buffs: ['tu_duy_giai_quyet_van_de', 'giao_tiep_hop_tac'],
  },
  {
    id: 'song_ngu',
    name: 'Song Ngư',
    symbol: '♓',
    from: [2, 19],
    to: [3, 20],
    element: 'nuoc',
    modality: 'linh_hoat',
    buffs: ['tri_tue_cam_xuc', 'thich_ung_hoc_hoi'],
  },
];

const key = (month: number, day: number) => month * 100 + day;

/** Cung Mặt Trời của một ngày sinh dạng `YYYY-MM-DD`; sai định dạng thì `null`. */
export function zodiacOf(
  dateOfBirth: string | null | undefined,
): ZodiacSign | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth ?? '');
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const k = key(month, day);
  for (const sign of ZODIAC_SIGNS) {
    const from = key(...sign.from);
    const to = key(...sign.to);
    const inside = from <= to ? k >= from && k <= to : k >= from || k <= to;
    if (inside) return sign;
  }
  return null;
}

/**
 * Điểm sau buff: chỉ phần dương được nhân 1,12, làm tròn tới 10 (khối G).
 * Trả cả phần cộng thêm để hiện "gồm +43 từ Song Tử".
 */
export function withZodiacBuff(
  delta: number,
  group: SoftSkillId,
  sign: ZodiacSign | null,
): { total: number; bonus: number } {
  const round10 = (n: number) => Math.round(n / 10) * 10;
  if (delta <= 0 || !sign || !sign.buffs.includes(group)) {
    return { total: round10(delta), bonus: 0 };
  }
  const total = round10(delta * (1 + ZODIAC_BUFF));
  return { total, bonus: total - round10(delta) };
}
