/**
 * Điểm vào duy nhất của dữ liệu game. Kiểm một lần, lúc nạp module.
 *
 * Bản prototype đọc `window.GAME` không kiểm gì cả. Ở đây dataset hỏng thì
 * app dừng ngay với đường dẫn field sai — rẻ hơn nhiều so với đi tìm một
 * `undefined` ở màn chơi.
 */
import raw from './game-data.json';
import { GameDataSchema, type GameData } from './schema';

function parseGameData(): GameData {
  const result = GameDataSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 10)
      .map((i) => `  • ${i.path.join('.') || '(gốc)'}: ${i.message}`)
      .join('\n');
    throw new Error(
      `game-data.json không đúng hình dạng mong đợi.\n${issues}\n\n` +
        `Sinh lại bằng: node docs/data/build.mjs`,
    );
  }
  return result.data;
}

export const GAME: GameData = parseGameData();

/** Khoá của 8 chiều fit, theo đúng thứ tự trong dataset. */
export const DIMENSIONS: readonly string[] = Object.keys(GAME.fit_dimensions);
