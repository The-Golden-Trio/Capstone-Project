/**
 * RIASEC sáu trục sở thích (khối B, C, E). Tên trục tả loại việc mình thích,
 * không tả mình là người thế nào. Thang 1–3: Không thích · Bình thường · Thích.
 */

export const RIASEC_AXES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecAxis = (typeof RIASEC_AXES)[number];

export interface RiasecAxisInfo {
  axis: RiasecAxis;
  name: string;
  /** Nói với người chơi: thích loại việc nào. */
  meaning: string;
}

export const RIASEC_INFO: Record<RiasecAxis, RiasecAxisInfo> = {
  R: {
    axis: 'R',
    name: 'Thực hành',
    meaning: 'Thích việc động tay, làm với thiết bị, lắp và sửa',
  },
  I: {
    axis: 'I',
    name: 'Tìm tòi',
    meaning: 'Thích hỏi "vì sao", lần ra nguyên nhân',
  },
  A: { axis: 'A', name: 'Sáng tạo', meaning: 'Thích làm ra thứ mới, thứ đẹp' },
  S: {
    axis: 'S',
    name: 'Kết nối',
    meaning: 'Thích trò chuyện, hỗ trợ người khác',
  },
  E: { axis: 'E', name: 'Dẫn dắt', meaning: 'Thích thuyết phục, điều phối' },
  C: {
    axis: 'C',
    name: 'Tổ chức',
    meaning: 'Thích sắp xếp, làm theo quy trình, soát dữ liệu',
  },
};

/** Ba mức chạm của thẻ và câu "thích tới đâu". */
export type LikeLevel = 1 | 2 | 3;

export const LIKE_LABELS: Record<LikeLevel, string> = {
  1: 'Không thích',
  2: 'Bình thường',
  3: 'Thích',
};

/** Điểm một trục là trung bình các lần chạm (khối C); chưa chạm thì `null`. */
export function axisMean(taps: readonly LikeLevel[]): number | null {
  if (taps.length === 0) return null;
  return taps.reduce<number>((sum, t) => sum + t, 0) / taps.length;
}

/** Sức nặng của vạch "tự kể", tính như 2 lần chạm (khối E, phép tính 2a). */
export const SELF_REPORT_WEIGHT = 2;

/**
 * Gộp "tự kể" S và "sau khi thử" T: P = (2·S + n·T) / (2 + n).
 * Bỏ qua Get to know me thì S = 2 (giữa thang).
 */
export function combinedAxis(
  selfReported: number | null,
  afterTrying: number | null,
  tries: number,
): number {
  const s = selfReported ?? 2;
  if (afterTrying === null || tries <= 0) return s;
  return (
    (SELF_REPORT_WEIGHT * s + tries * afterTrying) /
    (SELF_REPORT_WEIGHT + tries)
  );
}

/** Độ lệch chuẩn của 6 điểm P dưới ngưỡng này thì coi là hồ sơ phẳng (E2). */
export const FLAT_PROFILE_SD = 0.15;

export function isFlatProfile(scores: readonly number[]): boolean {
  if (scores.length === 0) return true;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  return Math.sqrt(variance) < FLAT_PROFILE_SD;
}

/**
 * Câu "thích tới đâu" bị bỏ khi người chơi bấm cùng một mức cho mọi việc
 * (luật giảm lệch, khối B), trừ khi chỉ có một việc.
 */
export const isStraightLined = (taps: readonly LikeLevel[]): boolean =>
  taps.length > 1 && taps.every((t) => t === taps[0]);
