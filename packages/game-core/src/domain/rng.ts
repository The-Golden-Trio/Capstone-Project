/**
 * Bộ sinh số giả ngẫu nhiên có hạt giống.
 *
 * Vì sao cần: điểm kỹ năng do máy chủ quyết định, mà máy chủ chấm bằng cách
 * *chạy lại* đúng lượt chơi của người chơi. Sự kiện xen ngang lại được gieo
 * ngẫu nhiên — nếu hai bên gieo khác nhau thì lượt chạy lại sẽ rẽ nhánh khác
 * và điểm ra khác. Máy chủ phát một hạt giống lúc mở màn, cả hai bên dùng
 * chung, nên cùng một chuỗi hành động luôn cho cùng một kết cục.
 *
 * mulberry32: 32-bit, nhanh, chất lượng thừa đủ cho việc gieo sự kiện, và
 * quan trọng nhất là cho cùng kết quả trên mọi máy chạy JavaScript.
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hạt giống mới cho một lượt chơi. Chỉ máy chủ gọi hàm này. */
export const newSeed = (): number => Math.floor(Math.random() * 2 ** 32) >>> 0;
