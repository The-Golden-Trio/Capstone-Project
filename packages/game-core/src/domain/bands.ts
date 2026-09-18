/** Thang cấp bậc L1–L10 và luật mở khoá. Thuần, không phụ thuộc React. */
import type { GameIndex } from '../data/indexes.js';
import type { Anchor, Role } from '../data/schema.js';

export const BANDS = [
  'L1',
  'L2',
  'L3',
  'L4',
  'L5',
  'L6',
  'L7',
  'L8',
  'L9',
  'L10',
] as const;

export type Band = (typeof BANDS)[number];

export const BAND_LABEL: Record<string, string> = {
  L1: 'Thực tập sinh',
  L2: 'Mới ra trường',
  L3: 'Junior',
  L4: 'Middle',
  L5: 'Senior',
  L6: 'Lead / Staff',
  L7: 'Principal / Manager',
  L8: 'Senior Manager',
  L9: 'Head',
  L10: 'C-level',
};

/** Điểm kỹ năng cần có ở một cấp bậc để mở cấp kế tiếp. */
export const UNLOCK_AT = 6;

/**
 * Điểm kỹ năng cho mỗi nhiệm vụ phụ làm xong tại một cấp bậc.
 *
 * Nhiệm vụ phụ không có thang chấm như hoạt động trong kịch bản — dữ liệu chỉ
 * có tín hiệu tính cách, không có mốc hành vi — nên trao đều.
 *
 * Con số 2 đi cùng với việc mỗi hòn đảo chỉ bày ra 3–4 nhiệm vụ: 3 × 2 = 6 =
 * `UNLOCK_AT`, nên hòn đảo nghèo nhiệm vụ nhất vẫn đủ để mở cấp bậc kế. Đó là
 * con đường duy nhất qua những cấp bậc chưa dựng nhiệm vụ chính.
 */
export const SIDE_QUEST_POINTS = 2;

/** Mốc hành vi -> điểm kỹ năng. */
export const POINTS: Record<Anchor, number> = { '+2': 2, '0': 1, '-1': 0 };

export const bandLabel = (band: string): string => BAND_LABEL[band] ?? '';

/** Các cấp bậc của một nghề, từ `band_start` tới `band_end`. */
export function bandsOf(role: Role): string[] {
  const from = BANDS.indexOf(role.band_start as Band);
  const to = BANDS.indexOf(role.band_end as Band);
  if (from < 0 || to < 0) return [role.band_start];
  return BANDS.slice(from, to + 1) as unknown as string[];
}

export const nextBand = (role: Role, band: string): string | undefined => {
  const list = bandsOf(role);
  return list[list.indexOf(band) + 1];
};

export const previousBand = (role: Role, band: string): string | undefined => {
  const list = bandsOf(role);
  const index = list.indexOf(band);
  return index > 0 ? list[index - 1] : undefined;
};

/**
 * Cấp bậc đầu tiên luôn mở; cấp sau mở khi cấp ngay trước đã đủ điểm.
 * `skillAt` tra điểm kỹ năng của người chơi tại một cấp bậc.
 */
export function isBandOpen(
  role: Role,
  band: string,
  skillAt: (band: string) => number,
): boolean {
  const previous = previousBand(role, band);
  if (!previous) return true;
  return skillAt(previous) >= UNLOCK_AT;
}

/** Nghề này có chỗ nào đã dựng nhiệm vụ chính chưa. */
export const roleHasAnyScenario = (role: Role, index: GameIndex): boolean =>
  bandsOf(role).some((band) => index.hasScenario(role.role_code, band));
