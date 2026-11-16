/**
 * Token dùng trong TypeScript (SVG, canvas, biểu đồ) — cùng giá trị với
 * `styles/tokens.css`. Sửa một bên thì sửa cả hai.
 */

export const palette = {
  deepSpace: '#0a1026',
  midnight: '#142b52',
  constellation: '#254a7a',
  moonlight: '#5d7ea8',
  starlight: '#d4b06a',
  softGold: '#f0d79a',
  ivory: '#f8f6ee',
  mist: '#c7d2e0',
} as const;

export const night = {
  950: '#060a1a',
  900: '#0a1026',
  850: '#0f1a38',
  800: '#142b52',
  700: '#1c3866',
  600: '#254a7a',
  500: '#3a6292',
  400: '#5d7ea8',
  300: '#8ea5c3',
  200: '#c7d2e0',
  100: '#e3e9f1',
  50: '#f8f6ee',
} as const;

export const gold = {
  900: '#3d3014',
  800: '#6e5626',
  700: '#8f7235',
  600: '#b08f4c',
  500: '#d4b06a',
  400: '#e2c47e',
  300: '#f0d79a',
  200: '#f6e6bf',
  100: '#fbf3de',
} as const;

export const status = {
  success: '#7fd1ae',
  warning: '#f2a65a',
  danger: '#ef8a8a',
  info: '#9db8e0',
} as const;

/** Sáu vùng nghề của Get to know me (D-125). */
export type RegionId =
  'ky_thuat' | 'suc_khoe' | 'kinh_doanh' | 'cong_nghe' | 'sang_tao' | 'dich_vu';

export const REGION_COLORS: Record<RegionId, string> = {
  ky_thuat: '#e8a07a',
  suc_khoe: '#74d3b4',
  kinh_doanh: '#b9a1f2',
  cong_nghe: '#72c5f2',
  sang_tao: '#f293bd',
  dich_vu: '#cdd977',
};

export const regionColor = (region: string | null | undefined): string =>
  REGION_COLORS[region as RegionId] ?? palette.moonlight;

/** Mức keyword (khối B): Làm quen · Thành thạo · Chuyên sâu. */
export const MEDAL = {
  1: { name: 'Làm quen', color: '#d39468', deep: '#6b3f22' },
  2: { name: 'Thành thạo', color: '#c9d4e3', deep: '#4a5a72' },
  3: { name: 'Chuyên sâu', color: '#f0d79a', deep: '#7a5f28' },
} as const;
export type MedalLevel = keyof typeof MEDAL;

/** Bộ 8 biểu cảm có asset (seed khối C3, lint A5). */
export const EXPRESSIONS = [
  'binh_thuong',
  'vui',
  'cuoi_lon',
  'ngac_nhien',
  'suy_nghi',
  'lo_lang',
  'kho_chiu',
  'buon',
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export const EXPRESSION_LABELS: Record<Expression, string> = {
  binh_thuong: 'Bình thường',
  vui: 'Vui',
  cuoi_lon: 'Cười lớn',
  ngac_nhien: 'Ngạc nhiên',
  suy_nghi: 'Suy nghĩ',
  lo_lang: 'Lo lắng',
  kho_chiu: 'Khó chịu',
  buon: 'Buồn',
};

/** Loại thành tựu (khối D): màu lục giác theo loại. */
export const ACHIEVEMENT_KINDS = {
  kham_pha: { name: 'Khám phá', color: '#72c5f2' },
  thanh_thao: { name: 'Thành thạo', color: '#f0d79a' },
  tien_bo: { name: 'Tiến bộ', color: '#7fd1ae' },
  tu_soi: { name: 'Tự soi', color: '#b9a1f2' },
  kien_tri: { name: 'Kiên trì', color: '#e8a07a' },
} as const;
export type AchievementKind = keyof typeof ACHIEVEMENT_KINDS;

/** Kết cục của scenario. */
export const ENDING_TONES = {
  GOOD: { name: 'Kết tốt', color: '#7fd1ae' },
  PARTIAL: { name: 'Kết chưa trọn', color: '#f0d79a' },
  BAD: { name: 'Kết chưa ổn', color: '#ef8a8a' },
  SECRET: { name: 'Kết bí mật', color: '#b9a1f2' },
} as const;
export type EndingType = keyof typeof ENDING_TONES;
