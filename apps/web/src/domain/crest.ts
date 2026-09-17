/**
 * Chân dung sinh bằng mã, không cần hoạ sĩ.
 *
 * Cùng một ý với hành tinh: băm một định danh ra hình dáng và màu sắc, nên
 * NPC "an" ở màn nào cũng đúng một khuôn mặt ấy, và thêm nhân vật mới thì
 * không phải vẽ thêm gì. Trước đây NPC chỉ là bốn chữ cái trong ô tròn xám,
 * nên ai cũng giống ai.
 *
 * Mỗi huy hiệu gồm ba tầng: khung (hình dáng), nền (dải màu chéo), và dấu
 * (một hình kỷ hà). Ba tầng nhân với nhau cho đủ tổ hợp để không ai trùng ai
 * trong một cảnh.
 */
import { hashCode } from './roleTheme';

export type CrestShape = 'shield' | 'circle' | 'hex' | 'diamond';
export type CrestGlyph = 'bolt' | 'eye' | 'wave' | 'star' | 'arrow' | 'ring';

/** Sắc độ đủ tươi để đọc trên nền tối, lấy quanh dải sáng của bảng màu nhấn. */
const INK = [
  '#7FB2E8',
  '#E8968F',
  '#6FC9C9',
  '#D9B96B',
  '#B69AE0',
  '#7FC98A',
  '#D89BD2',
  '#8FA6C4',
];

const SHAPES: CrestShape[] = ['shield', 'circle', 'hex', 'diamond'];
const GLYPHS: CrestGlyph[] = ['bolt', 'eye', 'wave', 'star', 'arrow', 'ring'];

export interface Crest {
  shape: CrestShape;
  glyph: CrestGlyph;
  /** Màu nền tối và màu dấu. */
  ground: string;
  ink: string;
  /** Góc của dải màu nền, tính bằng độ. */
  angle: number;
}

/**
 * Huy hiệu của một định danh bất kỳ — `npc_id`, id người chơi, hay `role_code`.
 *
 * Dùng bốn lát băm khác nhau cho bốn thuộc tính, nếu không thì hình dáng và
 * màu sẽ đi cùng nhau thành từng cặp và bộ mặt trông có quy luật.
 */
export function crest(seed: string): Crest {
  const h = hashCode(seed);
  return {
    shape: SHAPES[h % SHAPES.length],
    glyph: GLYPHS[Math.floor(h / 7) % GLYPHS.length],
    ink: INK[Math.floor(h / 13) % INK.length],
    ground: '#0D1F3F',
    angle: [22, -18, 40, -35, 8][Math.floor(h / 29) % 5],
  };
}

/** Đường viền của khung, vẽ trong hệ toạ độ 100×100. */
export const SHAPE_PATH: Record<CrestShape, string> = {
  shield: 'M50 4 92 20v34c0 24-18 36-42 42C26 90 8 78 8 54V20z',
  circle: 'M50 6a44 44 0 1 0 .1 0z',
  hex: 'M50 4 90 27v46L50 96 10 73V27z',
  diamond: 'M50 3 97 50 50 97 3 50z',
};

/** Dấu ở giữa huy hiệu, cũng trong hệ toạ độ 100×100. */
export const GLYPH_PATH: Record<CrestGlyph, string> = {
  bolt: 'M56 24 34 54h14l-6 24 24-32H52z',
  eye: 'M24 50c10-14 42-14 52 0-10 14-42 14-52 0zm26-8a8 8 0 1 1 0 16 8 8 0 0 1 0-16z',
  wave: 'M22 44c8-8 14-8 22 0s14 8 22 0M22 60c8-8 14-8 22 0s14 8 22 0',
  star: 'M50 22 58 44l22 2-17 15 5 21-18-11-18 11 5-21-17-15 22-2z',
  arrow: 'M50 22 74 50H60v26H40V50H26z',
  ring: 'M50 24a26 26 0 1 1-.1 0zm0 12a14 14 0 1 0 .1 0z',
};

/** Dấu nào vẽ bằng nét, dấu nào tô đặc. */
export const STROKED_GLYPHS: ReadonlySet<CrestGlyph> = new Set(['wave']);

/** Tên viết tắt hiện kèm huy hiệu — tối đa 4 ký tự của từ đầu. */
export const crestInitials = (name: string): string =>
  name.trim().split(/\s+/)[0].slice(0, 4);
