/**
 * Bộ dữ liệu thật, dùng cho test.
 *
 * Nội dung game đã chuyển vào database, nên `game-core` không còn mang theo bộ
 * dữ liệu nào nữa. Nhưng test thì vẫn cần dữ liệu thật chứ không phải dữ liệu
 * bịa: những điều đáng kiểm nhất ở đây đều là tính chất của chính bộ dữ liệu —
 * "mọi đảo đều có đủ nhiệm vụ để mở cấp kế", "mọi hướng xử lý đều có từ khoá
 * để chấm được". Kiểm bằng dữ liệu bịa thì mấy khẳng định ấy mất hết ý nghĩa.
 *
 * Đọc thẳng tệp JSON mà bộ sinh dữ liệu xuất ra — cùng tệp mà script seed đổ
 * vào database. Chỉ dùng được ở Node (test chạy ở Node), không nằm trong
 * `index.ts` nên không bao giờ lọt vào bundle trình duyệt.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createGameIndex, type GameIndex } from '../data/indexes.js';
import { GameDataSchema, type GameData } from '../data/schema.js';
import { ShiftDataSchema, type ShiftData } from '../shift/schema.js';
import type { ShiftContext } from '../shift/context.js';
import type { NpcWorkProfile } from '../domain/narration/npcCard.js';

const HERE = dirname(fileURLToPath(import.meta.url));

/** `packages/game-core/data/` — cùng chỗ script seed đọc. */
const DATA_DIR = join(HERE, '..', '..', 'data');

let cached: GameIndex | null = null;

/** Bảng tra dựng từ bộ dữ liệu thật. Đọc một lần cho cả bộ test. */
export function fixtureIndex(): GameIndex {
  cached ??= createGameIndex(fixtureData());
  return cached;
}

export function fixtureData(): GameData {
  const path = join(DATA_DIR, 'game-data.json');
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    throw new Error(
      `Không đọc được ${path}. Sinh lại bằng: node docs/data/build.mjs\n` +
        `(${err instanceof Error ? err.message : String(err)})`,
    );
  }

  const result = GameDataSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.') || '(gốc)'}: ${i.message}`)
      .join('; ');
    throw new Error(`game-data.json không đúng hình dạng — ${issues}`);
  }
  return result.data;
}

/* ── Ca làm (seed v2) ── */

let shiftCached: ShiftData | null = null;

/** Seed ca làm và gói cấp, đọc từ `data/shift-seeds.json`, đã qua schema. */
export function fixtureShiftData(): ShiftData {
  shiftCached ??= ShiftDataSchema.parse(
    JSON.parse(readFileSync(join(DATA_DIR, 'shift-seeds.json'), 'utf-8')),
  );
  return shiftCached;
}

/** Ngữ cảnh chạy engine cho một seed. */
export function fixtureShiftContext(seedId: string): ShiftContext {
  const data = fixtureShiftData();
  const seed = data.seeds[seedId];
  if (!seed) throw new Error(`Không có seed ${seedId} trong shift-seeds.json`);
  const pack = data.packs[seed.level_ref];
  if (!pack) throw new Error(`Không có gói cấp ${seed.level_ref}`);
  return { seed, pack };
}

/**
 * Phần hồ sơ màn làm việc của 22 lá NPC (Hồ sơ NPC bản chốt v1.0), theo mã lá.
 *
 * Chép từ research notes, chỉ cho test và chạy thử AI-4: nơi đặt dữ liệu NPC
 * chính thức còn chờ nhóm duyệt (Hồ sơ NPC mục 5.7).
 */
export function npcCast(): Record<string, NpcWorkProfile> {
  const path = join(HERE, '..', '..', 'fixtures', 'npc-cast.v1.0.json');
  return (
    JSON.parse(readFileSync(path, 'utf-8')) as {
      cast: Record<string, NpcWorkProfile>;
    }
  ).cast;
}
