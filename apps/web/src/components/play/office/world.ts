/**
 * Thế giới 2D nhìn từ trên xuống: lưới ô, va chạm, đường đi.
 *
 * Thuần — không canvas, không React — để kiểm được bằng vitest và để phần vẽ
 * (`OfficeCanvas`) chỉ là một cách bày ra. Toạ độ thực thể tính bằng pixel
 * của thế giới (chưa nhân tỉ lệ màn hình), gốc ở chân nhân vật.
 */

/** Cạnh một ô, tính bằng pixel thế giới. */
export const TILE = 32;

/** Một ô trên bản đồ, tính bằng chỉ số ô (không phải pixel). */
export interface Tile {
  col: number;
  row: number;
}

export interface Point {
  x: number;
  y: number;
}

export type Facing = 'down' | 'up' | 'left' | 'right';

/* ── Ký hiệu ô ─────────────────────────────────────────────────────── */

/**
 * Mỗi ký tự trong bản đồ là một loại ô. Ký tự thường là "đi được", ký tự
 * hoa là vật cản — quy ước đó giúp đọc bản đồ bằng mắt mà không cần tra.
 */
export type TileKind =
  | 'floor'
  | 'carpet'
  | 'wall'
  | 'whiteboard'
  | 'glass'
  | 'glassDoor'
  | 'desk'
  | 'deskSide'
  | 'table'
  | 'chair'
  | 'plant'
  | 'counter'
  | 'shelf'
  | 'entrance';

const LEGEND: Record<string, TileKind> = {
  '.': 'floor',
  ',': 'carpet',
  '#': 'wall',
  W: 'whiteboard',
  G: 'glass',
  d: 'glassDoor',
  T: 'desk',
  S: 'deskSide',
  M: 'table',
  c: 'chair',
  P: 'plant',
  K: 'counter',
  B: 'shelf',
  e: 'entrance',
};

const SOLID: ReadonlySet<TileKind> = new Set<TileKind>([
  'wall',
  'whiteboard',
  'glass',
  'desk',
  'deskSide',
  'table',
  'plant',
  'counter',
  'shelf',
]);

export interface World {
  cols: number;
  rows: number;
  tiles: TileKind[][];
  /** Kích thước thế giới, pixel. */
  width: number;
  height: number;
}

/** Dựng thế giới từ các dòng ký tự. Mọi dòng phải dài bằng nhau. */
export function parseWorld(lines: readonly string[]): World {
  const cols = lines[0]?.length ?? 0;
  if (cols === 0) throw new Error('Bản đồ trống');

  const tiles = lines.map((line, row) => {
    if (line.length !== cols) {
      throw new Error(`Dòng ${row} dài ${line.length}, cần ${cols}`);
    }
    return [...line].map((ch, col) => {
      const kind = LEGEND[ch];
      if (!kind) throw new Error(`Ký tự lạ "${ch}" tại (${col},${row})`);
      return kind;
    });
  });

  return {
    cols,
    rows: lines.length,
    tiles,
    width: cols * TILE,
    height: lines.length * TILE,
  };
}

export const tileAt = (world: World, col: number, row: number): TileKind =>
  world.tiles[row]?.[col] ?? 'wall';

export const isSolidTile = (world: World, col: number, row: number): boolean =>
  SOLID.has(tileAt(world, col, row));

/** Tâm-chân của một ô: điểm nhân vật đứng khi "ở" ô đó. */
export const tileCenter = (tile: Tile): Point => ({
  x: (tile.col + 0.5) * TILE,
  y: (tile.row + 1) * TILE - 4,
});

/* ── Va chạm ───────────────────────────────────────────────────────── */

/**
 * Hộp va chạm của nhân vật: một dải mỏng quanh bàn chân, không phải cả
 * người. Nhờ vậy đầu nhân vật được đè lên mép bàn phía trên mà chân vẫn
 * không lọt qua tường — đúng cách các game 2D nhìn từ trên xuống làm.
 */
export const FEET_W = 18;
export const FEET_H = 10;

function feetBlocked(world: World, x: number, y: number): boolean {
  const left = x - FEET_W / 2;
  const right = x + FEET_W / 2 - 1;
  const top = y - FEET_H;
  const bottom = y - 1;
  const corners: Array<[number, number]> = [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom],
  ];
  return corners.some(([cx, cy]) =>
    isSolidTile(world, Math.floor(cx / TILE), Math.floor(cy / TILE)),
  );
}

/**
 * Di chuyển có trượt: thử trục x rồi trục y riêng, nên chạm tường chéo vẫn
 * lướt dọc theo tường thay vì đứng khựng.
 */
export function moveWithCollision(
  world: World,
  from: Point,
  dx: number,
  dy: number,
): Point {
  let { x, y } = from;
  if (dx !== 0 && !feetBlocked(world, x + dx, y)) x += dx;
  if (dy !== 0 && !feetBlocked(world, x, y + dy)) y += dy;
  return { x, y };
}

/* ── Đường đi kịch bản ─────────────────────────────────────────────── */

export const distance = (a: Point, b: Point): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** Hướng nhìn suy từ vector di chuyển; đứng yên thì giữ hướng cũ. */
export function facingOf(dx: number, dy: number, fallback: Facing): Facing {
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/** Quay mặt về phía một điểm khác — NPC nhìn người chơi khi bắt chuyện. */
export const faceToward = (from: Point, to: Point): Facing =>
  facingOf(to.x - from.x, to.y - from.y, 'down');

export interface Walker {
  pos: Point;
  facing: Facing;
  /** Các mốc còn phải qua, theo thứ tự. Rỗng nghĩa là đang đứng yên. */
  route: Point[];
}

/**
 * Tiến một bước dọc lộ trình. Trả về walker mới và cờ "vừa tới nơi" để
 * kịch bản biết lúc nào NPC đã đứng vào chỗ và có thể bắt chuyện.
 */
export function stepAlongRoute(
  walker: Walker,
  speedPx: number,
): { walker: Walker; arrived: boolean } {
  const [target, ...rest] = walker.route;
  if (!target) return { walker, arrived: false };

  const dx = target.x - walker.pos.x;
  const dy = target.y - walker.pos.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= speedPx) {
    const next: Walker = {
      pos: target,
      facing: facingOf(dx, dy, walker.facing),
      route: rest,
    };
    return { walker: next, arrived: rest.length === 0 };
  }

  const step = speedPx / dist;
  return {
    walker: {
      pos: { x: walker.pos.x + dx * step, y: walker.pos.y + dy * step },
      facing: facingOf(dx, dy, walker.facing),
      route: walker.route,
    },
    arrived: false,
  };
}

/** Lộ trình qua các ô, đổi sang pixel. Các ô kề nhau phải thẳng hàng. */
export const routeThrough = (tiles: readonly Tile[]): Point[] =>
  tiles.map(tileCenter);

/* ── Điểm tương tác ────────────────────────────────────────────────── */

/** Bán kính (pixel) mà người chơi được coi là "đang ở cạnh" một điểm. */
export const REACH = 44;

export const withinReach = (player: Point, target: Point): boolean =>
  distance(player, target) <= REACH;
