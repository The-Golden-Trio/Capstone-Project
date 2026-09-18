/**
 * Pixel-art nhân vật, viết bằng chữ.
 *
 * Mỗi nhân vật là một lưới 12×18, mỗi ký tự trỏ vào một màu trong bảng màu
 * của nhân vật đó. Cùng một khuôn, đổi bảng màu là ra người khác — đủ cho
 * bản mẫu, và khi có hoạ sĩ thì chỉ cần thay `renderSprite` bằng ảnh thật,
 * phần còn lại của cảnh không đổi.
 *
 * Ký hiệu:  `.` trong suốt · `O` viền · `H` tóc · `S` da · `E` mắt
 *           `T` áo · `P` quần · `F` giày
 */

export const SPRITE_W = 12;
export const SPRITE_H = 18;

export type PaletteKey = 'O' | 'H' | 'S' | 'E' | 'T' | 'P' | 'F';
export type Palette = Record<PaletteKey, string>;

export type Frame = readonly string[];

/** Ba tư thế; trái là lật gương của phải. */
export interface Pose {
  idle: Frame;
  walk: Frame;
}

export interface SpriteSheet {
  down: Pose;
  up: Pose;
  right: Pose;
}

/* ── Khuôn tóc ngắn ────────────────────────────────────────────────── */

const HEAD_DOWN: Frame = [
  '....OOOO....',
  '...OHHHHO...',
  '..OHHHHHHO..',
  '..OHHHHHHO..',
  '..OSSSSSSO..',
  '..OSESSESO..',
  '..OSSSSSSO..',
  '...OSSSSO...',
];

const HEAD_UP: Frame = [
  '....OOOO....',
  '...OHHHHO...',
  '..OHHHHHHO..',
  '..OHHHHHHO..',
  '..OHHHHHHO..',
  '..OHHHHHHO..',
  '..OSSSSSSO..',
  '...OSSSSO...',
];

const HEAD_RIGHT: Frame = [
  '....OOOO....',
  '...OHHHHO...',
  '..OHHHHHHO..',
  '..OHHHHHHO..',
  '..OHHSSSSO..',
  '..OHSSESSO..',
  '..OHSSSSSO..',
  '...OSSSSO...',
];

/* ── Khuôn tóc dài ─────────────────────────────────────────────────── */

const LONG_DOWN: Frame = [
  '....OOOO....',
  '...OHHHHO...',
  '..OHHHHHHO..',
  '.OHHHHHHHHO.',
  '.OHSSSSSSHO.',
  '.OHSESSESHO.',
  '.OHSSSSSSHO.',
  '.OHHOSSOHHO.',
];

const LONG_UP: Frame = [
  '....OOOO....',
  '...OHHHHO...',
  '..OHHHHHHO..',
  '.OHHHHHHHHO.',
  '.OHHHHHHHHO.',
  '.OHHHHHHHHO.',
  '.OHHHHHHHHO.',
  '.OHHOSSOHHO.',
];

const LONG_RIGHT: Frame = [
  '....OOOO....',
  '...OHHHHO...',
  '..OHHHHHHO..',
  '.OHHHHHHHHO.',
  '.OHHHSSSSO..',
  '.OHHSSESSO..',
  '.OHHSSSSSO..',
  '.OHHOSSSO...',
];

/* ── Thân ──────────────────────────────────────────────────────────── */

/** Đứng: hai tay buông, hai chân khép. */
const BODY_FRONT_IDLE: Frame = [
  '..OOTTTTOO..',
  '.OSOTTTTOSO.',
  '.OSOTTTTOSO.',
  '.OOOTTTTOOO.',
  '...OTTTTO...',
  '...OPPPPO...',
  '...OPPPPO...',
  '...OPOOPO...',
  '...OFO.OFO..',
  '...OOO.OOO..',
];

/** Bước: chân dang, người nhún xuống một pixel (dòng đầu trống). */
const BODY_FRONT_WALK: Frame = [
  '..OOTTTTOO..',
  '.OSOTTTTOSO.',
  '.OSOTTTTOSO.',
  '.OOOTTTTOOO.',
  '...OTTTTO...',
  '...OPPPPO...',
  '..OPPOOPPO..',
  '..OPO..OPO..',
  '..OFO..OFO..',
  '..OOO..OOO..',
];

const BODY_RIGHT_IDLE: Frame = [
  '..OOTTTTOO..',
  '..OTTTOSO...',
  '..OTTTOSO...',
  '..OTTTTOO...',
  '...OTTTTO...',
  '...OPPPPO...',
  '...OPPPPO...',
  '...OPPOPO...',
  '...OFFOFO...',
  '...OOOOOO...',
];

const BODY_RIGHT_WALK: Frame = [
  '..OOTTTTOO..',
  '..OTTTOSO...',
  '..OTTTOSO...',
  '..OTTTTOO...',
  '...OTTTTO...',
  '...OPPPPO...',
  '..OPPOOPPO..',
  '..OPO..OPO..',
  '..OFO..OFO..',
  '..OOO..OOO..',
];

const join = (head: Frame, body: Frame): Frame => [...head, ...body];

function sheet(down: Frame, up: Frame, right: Frame): SpriteSheet {
  return {
    down: { idle: join(down, BODY_FRONT_IDLE), walk: join(down, BODY_FRONT_WALK) },
    up: { idle: join(up, BODY_FRONT_IDLE), walk: join(up, BODY_FRONT_WALK) },
    right: { idle: join(right, BODY_RIGHT_IDLE), walk: join(right, BODY_RIGHT_WALK) },
  };
}

export const SHORT_HAIR = sheet(HEAD_DOWN, HEAD_UP, HEAD_RIGHT);
export const LONG_HAIR = sheet(LONG_DOWN, LONG_UP, LONG_RIGHT);

/* ── Nhân vật ──────────────────────────────────────────────────────── */

export interface Character {
  id: string;
  label: string;
  sheet: SpriteSheet;
  palette: Palette;
}

const OUTLINE = '#141a2e';

export const CHARACTERS: Record<'player' | 'an' | 'ha', Character> = {
  player: {
    id: 'player',
    label: 'Bạn',
    sheet: SHORT_HAIR,
    palette: {
      O: OUTLINE,
      H: '#2b2118',
      S: '#f1c9a5',
      E: '#1c1c2a',
      T: '#3e7bd6',
      P: '#2c3552',
      F: '#1f2430',
    },
  },
  an: {
    id: 'an',
    label: 'An',
    sheet: SHORT_HAIR,
    palette: {
      O: OUTLINE,
      H: '#111111',
      S: '#e9bd93',
      E: '#1c1c2a',
      T: '#5f6b7a',
      P: '#1f2a3a',
      F: '#111318',
    },
  },
  ha: {
    id: 'ha',
    label: 'Hà',
    sheet: LONG_HAIR,
    palette: {
      O: OUTLINE,
      H: '#4a2a22',
      S: '#f4d2b6',
      E: '#1c1c2a',
      T: '#c9569b',
      P: '#3a2f4a',
      F: '#2a1f2f',
    },
  },
};

/** Khung hiện tại theo hướng + đang đi hay đứng. Trái lật từ phải lúc vẽ. */
export function frameFor(
  sheetOf: SpriteSheet,
  facing: 'down' | 'up' | 'left' | 'right',
  walking: boolean,
  tick: number,
): { frame: Frame; mirror: boolean } {
  const pose =
    facing === 'down' ? sheetOf.down : facing === 'up' ? sheetOf.up : sheetOf.right;
  // Đi: luân phiên đứng/bước mỗi 8 tick để ra nhịp chân.
  const frame = walking && Math.floor(tick / 8) % 2 === 1 ? pose.walk : pose.idle;
  return { frame, mirror: facing === 'left' };
}
