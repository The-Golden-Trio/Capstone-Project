/**
 * Ngẫu nhiên có hạt giống cho tranh vẽ thủ tục (hành tinh, chân dung, bầu
 * trời): cùng mã nghề, cùng tên NPC thì luôn ra cùng một hình, ở mọi máy.
 */

/** Băm chuỗi thành số 32 bit (FNV-1a). */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Bộ sinh số mulberry32: trả hàm cho số trong [0, 1). */
export function seededRandom(seed: number | string): () => number {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T>(rand: () => number, items: readonly T[]): T =>
  items[Math.floor(rand() * items.length) % items.length];

export const between = (rand: () => number, min: number, max: number) =>
  min + rand() * (max - min);

/** Id ổn định cho `<defs>` SVG khi cùng một hình vẽ nhiều lần trên trang. */
export const svgId = (prefix: string, key: string) =>
  `${prefix}-${hashString(key).toString(36)}`;
