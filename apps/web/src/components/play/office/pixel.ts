/**
 * Vẽ pixel-art lên canvas: nhân vật từ `sprites.ts`, nội thất vẽ bằng hình
 * chữ nhật. Mọi thứ vẽ một lần rồi cache theo khoá — vòng lặp mỗi khung chỉ
 * `drawImage`, không vẽ lại từng pixel.
 *
 * Tỉ lệ: một pixel nghệ thuật = `PX` pixel thế giới. Nhân vật 12×18 thành
 * 24×36, cao hơn một ô (32) một chút — đúng tỉ lệ "chibi" của game 2D.
 */
import { SPRITE_H, SPRITE_W, type Frame, type Palette } from './sprites';
import { TILE, type TileKind } from './world';

export const PX = 2;

const cache = new Map<string, HTMLCanvasElement>();

function canvasOf(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không mở được canvas 2D');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

/* ── Nhân vật ──────────────────────────────────────────────────────── */

/** Một khung nhân vật đã tô màu, sẵn để `drawImage`. */
export function renderSprite(
  key: string,
  frame: Frame,
  palette: Palette,
  mirror: boolean,
): HTMLCanvasElement {
  const id = `${key}:${mirror ? 'L' : 'R'}:${frame.join('')}`;
  const hit = cache.get(id);
  if (hit) return hit;

  const ctx = canvasOf(SPRITE_W * PX, SPRITE_H * PX);
  frame.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const color = palette[ch as keyof Palette];
      if (!color) return;
      const drawX = mirror ? SPRITE_W - 1 - x : x;
      ctx.fillStyle = color;
      ctx.fillRect(drawX * PX, y * PX, PX, PX);
    });
  });

  cache.set(id, ctx.canvas);
  return ctx.canvas;
}

/* ── Nội thất ──────────────────────────────────────────────────────── */

const C = {
  floor: '#2a2f45',
  floorAlt: '#2d3249',
  speck: '#262b3f',
  carpet: '#3a3550',
  wall: '#3b4262',
  wallTop: '#4a5278',
  wallBottom: '#232840',
  glass: 'rgba(127, 210, 224, 0.16)',
  glassEdge: '#9fb3c8',
  glassShine: 'rgba(255,255,255,0.35)',
  wood: '#8a5a3c',
  woodTop: '#a06f4c',
  woodDark: '#5b3a26',
  screen: '#0f1424',
  bezel: '#2b3247',
  glow: '#6fc9c9',
  key: '#454c66',
  mug: '#e0e6f0',
  seat: '#3a3f5c',
  seatBack: '#2b2f47',
  pot: '#8a5a3c',
  leaf: '#3e8f5a',
  leafLight: '#57b072',
  counter: '#6d7a8c',
  counterTop: '#8593a6',
  machine: '#2f3542',
  light: '#e05a5a',
  shelf: '#5b3a26',
  paper: '#e8ecf3',
  ink: '#5a8bd6',
  ink2: '#d66a6a',
  mat: '#4a4f6a',
} as const;

/** Vẽ một hình chữ nhật theo lưới pixel nghệ thuật (16×16 mỗi ô). */
const rect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) => {
  ctx.fillStyle = color;
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
};

/** Nền sàn — hai tông xen kẽ theo ô và vài chấm bụi cố định. */
function floor(ctx: CanvasRenderingContext2D, col: number, row: number, carpet: boolean) {
  const base = carpet ? C.carpet : (col + row) % 2 === 0 ? C.floor : C.floorAlt;
  rect(ctx, 0, 0, 16, 16, base);
  if (carpet) {
    // Thảm: sọc chéo nhẹ.
    for (let i = 0; i < 16; i += 4) rect(ctx, i, i, 1, 1, '#463f60');
  } else if ((col * 7 + row * 13) % 5 === 0) {
    rect(ctx, 3, 11, 1, 1, C.speck);
    rect(ctx, 12, 4, 1, 1, C.speck);
  }
}

function wall(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 0, 16, 16, C.wall);
  rect(ctx, 0, 0, 16, 3, C.wallTop);
  rect(ctx, 0, 14, 16, 2, C.wallBottom);
  // Gạch: hai đường ngang.
  rect(ctx, 0, 7, 16, 1, C.wallBottom);
  rect(ctx, 4, 3, 1, 4, C.wallBottom);
  rect(ctx, 11, 8, 1, 6, C.wallBottom);
}

function whiteboard(ctx: CanvasRenderingContext2D) {
  wall(ctx);
  rect(ctx, 1, 3, 14, 10, C.glassEdge);
  rect(ctx, 2, 4, 12, 8, C.paper);
  rect(ctx, 3, 6, 6, 1, C.ink);
  rect(ctx, 3, 8, 8, 1, C.ink);
  rect(ctx, 3, 10, 4, 1, C.ink2);
}

function glass(ctx: CanvasRenderingContext2D, col: number, row: number, door: boolean) {
  floor(ctx, col, row, false);
  ctx.fillStyle = C.glass;
  ctx.fillRect(0, 0, TILE, TILE);
  rect(ctx, 0, 0, 16, 1, C.glassEdge);
  rect(ctx, 0, 15, 16, 1, C.glassEdge);
  if (door) {
    rect(ctx, 7, 0, 2, 16, C.glassEdge);
    rect(ctx, 5, 7, 1, 3, C.mug);
    rect(ctx, 10, 7, 1, 3, C.mug);
  } else {
    rect(ctx, 0, 0, 1, 16, C.glassEdge);
    rect(ctx, 15, 0, 1, 16, C.glassEdge);
    rect(ctx, 3, 2, 1, 10, C.glassShine);
  }
}

/** Nửa bàn có màn hình. */
function desk(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 4, 16, 12, C.wood);
  rect(ctx, 0, 4, 16, 2, C.woodTop);
  rect(ctx, 0, 14, 16, 2, C.woodDark);
  // Màn hình + chân đế.
  rect(ctx, 3, 0, 10, 8, C.bezel);
  rect(ctx, 4, 1, 8, 6, C.screen);
  rect(ctx, 5, 2, 4, 1, C.glow);
  rect(ctx, 5, 4, 6, 1, C.glow);
  rect(ctx, 7, 8, 2, 2, C.bezel);
  rect(ctx, 5, 10, 6, 1, C.bezel);
}

/** Nửa bàn còn lại: bàn phím và cốc. */
function deskSide(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 4, 16, 12, C.wood);
  rect(ctx, 0, 4, 16, 2, C.woodTop);
  rect(ctx, 0, 14, 16, 2, C.woodDark);
  rect(ctx, 2, 8, 8, 4, C.key);
  for (let i = 0; i < 4; i++) rect(ctx, 3 + i * 2, 9, 1, 1, C.bezel);
  rect(ctx, 12, 7, 3, 4, C.mug);
  rect(ctx, 12, 8, 3, 1, C.ink2);
}

function table(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 2, 16, 14, C.wood);
  rect(ctx, 0, 2, 16, 2, C.woodTop);
  rect(ctx, 0, 14, 16, 2, C.woodDark);
  rect(ctx, 4, 6, 5, 4, C.paper);
  rect(ctx, 5, 7, 3, 1, C.ink);
}

function chair(ctx: CanvasRenderingContext2D, col: number, row: number) {
  floor(ctx, col, row, false);
  rect(ctx, 4, 3, 8, 3, C.seatBack);
  rect(ctx, 3, 6, 10, 7, C.seat);
  rect(ctx, 4, 12, 2, 2, C.seatBack);
  rect(ctx, 10, 12, 2, 2, C.seatBack);
}

function plant(ctx: CanvasRenderingContext2D, col: number, row: number) {
  floor(ctx, col, row, false);
  rect(ctx, 5, 10, 6, 5, C.pot);
  rect(ctx, 5, 10, 6, 1, C.woodTop);
  rect(ctx, 4, 3, 8, 7, C.leaf);
  rect(ctx, 3, 5, 3, 4, C.leaf);
  rect(ctx, 10, 4, 3, 4, C.leaf);
  rect(ctx, 6, 2, 3, 3, C.leafLight);
  rect(ctx, 9, 6, 2, 2, C.leafLight);
}

function counter(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 6, 16, 10, C.counter);
  rect(ctx, 0, 6, 16, 2, C.counterTop);
  rect(ctx, 0, 14, 16, 2, C.wallBottom);
  // Máy pha cà phê.
  rect(ctx, 4, 0, 8, 8, C.machine);
  rect(ctx, 5, 1, 6, 2, C.bezel);
  rect(ctx, 6, 5, 4, 2, C.mug);
  rect(ctx, 10, 2, 1, 1, C.light);
}

function shelf(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 0, 16, 16, C.shelf);
  rect(ctx, 1, 1, 14, 6, C.wallBottom);
  rect(ctx, 1, 9, 14, 6, C.wallBottom);
  const spines = [C.ink, C.ink2, C.leafLight, C.glow, C.mug, C.light];
  spines.forEach((color, i) => {
    rect(ctx, 2 + i * 2, 2 + (i % 2), 1, 5 - (i % 2), color);
    rect(ctx, 2 + i * 2, 10, 1, 5, spines[(i + 3) % spines.length]);
  });
}

function entrance(ctx: CanvasRenderingContext2D, col: number, row: number) {
  floor(ctx, col, row, false);
  rect(ctx, 1, 2, 14, 12, C.mat);
  rect(ctx, 2, 3, 12, 10, '#555b7a');
  rect(ctx, 4, 7, 8, 1, C.mat);
}

/** Vật cao che được nhân vật đứng phía sau — vẽ theo thứ tự chiều sâu. */
export const PROPS: ReadonlySet<TileKind> = new Set<TileKind>([
  'desk',
  'deskSide',
  'table',
  'plant',
  'counter',
  'shelf',
]);

/** Một ô đã vẽ xong, cache theo loại (và toạ độ nếu hoa văn phụ thuộc vị trí). */
export function tileCanvas(kind: TileKind, col: number, row: number): HTMLCanvasElement {
  const positional = kind === 'floor' || kind === 'carpet' || kind === 'chair' ||
    kind === 'plant' || kind === 'entrance' || kind === 'glass' || kind === 'glassDoor';
  const id = positional ? `${kind}@${(col + row) % 2}:${(col * 7 + row * 13) % 5}` : kind;
  const hit = cache.get(id);
  if (hit) return hit;

  const ctx = canvasOf(TILE, TILE);
  switch (kind) {
    case 'floor':
      floor(ctx, col, row, false);
      break;
    case 'carpet':
      floor(ctx, col, row, true);
      break;
    case 'wall':
      wall(ctx);
      break;
    case 'whiteboard':
      whiteboard(ctx);
      break;
    case 'glass':
      glass(ctx, col, row, false);
      break;
    case 'glassDoor':
      glass(ctx, col, row, true);
      break;
    case 'desk':
      desk(ctx);
      break;
    case 'deskSide':
      deskSide(ctx);
      break;
    case 'table':
      table(ctx);
      break;
    case 'chair':
      chair(ctx, col, row);
      break;
    case 'plant':
      plant(ctx, col, row);
      break;
    case 'counter':
      counter(ctx);
      break;
    case 'shelf':
      shelf(ctx);
      break;
    case 'entrance':
      entrance(ctx, col, row);
      break;
  }
  cache.set(id, ctx.canvas);
  return ctx.canvas;
}
