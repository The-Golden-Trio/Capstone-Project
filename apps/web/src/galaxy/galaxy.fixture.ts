/**
 * Dữ liệu ngân hà thật, cho test.
 *
 * Dữ liệu đã chuyển vào database nên module `galaxy` không còn tự mang theo
 * bộ nào; trong app thật thì `contentStore` tải về rồi gọi `initGalaxy`. Test
 * chạy ở Node nên đọc thẳng tệp JSON mà bộ sinh dữ liệu xuất ra — cùng tệp mà
 * script seed đổ vào database, nên test vẫn kiểm trên dữ liệu thật.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initGalaxy } from './galaxy';

const HERE = dirname(fileURLToPath(import.meta.url));

/** Nạp bản đồ ngân hà cho một bộ test. Gọi lại nhiều lần cũng không sao. */
export function loadGalaxyFixture(): void {
  const path = join(HERE, '../../../../packages/game-core/data/galaxy-data.json');
  try {
    initGalaxy(JSON.parse(readFileSync(path, 'utf-8')));
  } catch (err) {
    throw new Error(
      `Không đọc được ${path}. Sinh lại bằng: node docs/data/build-galaxy.mjs\n` +
        `(${err instanceof Error ? err.message : String(err)})`,
    );
  }
}
