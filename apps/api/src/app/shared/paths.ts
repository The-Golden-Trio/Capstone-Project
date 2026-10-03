import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const API_PACKAGE_NAME = '@datn/api';

/**
 * Tìm thư mục gốc của apps/api dù đang chạy từ dist/main.js (webpack) hay từ src (jest).
 * Đi ngược từ __dirname tới khi gặp package.json có name = @datn/api.
 */
export function resolveApiRoot(): string {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const pkg = join(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        const parsed = JSON.parse(readFileSync(pkg, 'utf-8')) as { name?: string };
        if (parsed.name === API_PACKAGE_NAME) return dir;
      } catch {
        /* không phải package.json hợp lệ — đi tiếp */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function resolveWorkspaceRoot(): string {
  return resolve(resolveApiRoot(), '..', '..');
}

/**
 * Thư mục chứa skills_taxonomy.json + role_graph.json.
 * Ưu tiên: env DATA_DIR → dist/assets/data (webpack copy) → occupation-data/generated (dev/test).
 */
export function resolveDataDir(): string {
  const candidates = [
    process.env['DATA_DIR'],
    join(__dirname, 'assets', 'data'),
    join(resolveWorkspaceRoot(), 'occupation-data', 'generated'),
  ].filter((p): p is string => !!p);
  for (const c of candidates) {
    if (existsSync(join(c, 'skills_taxonomy.json'))) return c;
  }
  throw new Error(
    `Không tìm thấy skills_taxonomy.json ở: ${candidates.join(', ')} — chạy occupation-data/scripts/build_skill_taxonomy.py trước.`,
  );
}

/** Thư mục snapshot JSON của in-memory repository (apps/api/.data, git-ignored). */
export function resolveSnapshotDir(): string {
  return process.env['DATA_SNAPSHOT_DIR'] ?? join(resolveApiRoot(), '.data');
}
