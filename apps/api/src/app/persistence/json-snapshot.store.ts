import { Logger } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Map trong memory + snapshot ra 1 file JSON sau MỖI lần ghi, load lại lúc khởi tạo.
 * Đủ để demo thật và sống sót qua restart khi chưa chọn DB. Ghi atomic (tmp + rename)
 * để không bao giờ để lại file hỏng nếu process chết giữa chừng.
 *
 * `dir = null` → thuần in-memory (dùng cho unit test).
 */
export class JsonSnapshotStore<T> {
  private readonly logger = new Logger(JsonSnapshotStore.name);
  private readonly map = new Map<string, T>();
  private readonly filePath: string | null;

  constructor(dir: string | null, name: string) {
    this.filePath = dir ? join(dir, `${name}.json`) : null;
    this.load();
  }

  get(key: string): T | undefined {
    return this.map.get(key);
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  values(): T[] {
    return [...this.map.values()];
  }

  get size(): number {
    return this.map.size;
  }

  set(key: string, value: T): T {
    this.map.set(key, value);
    this.flush();
    return value;
  }

  private load(): void {
    if (!this.filePath || !existsSync(this.filePath)) return;
    try {
      const raw = JSON.parse(readFileSync(this.filePath, 'utf-8')) as Record<string, T>;
      for (const [k, v] of Object.entries(raw)) this.map.set(k, v);
      this.logger.log(`Loaded ${this.map.size} row(s) from ${this.filePath}`);
    } catch (err) {
      this.logger.error(`Không đọc được snapshot ${this.filePath}: ${(err as Error).message}`);
    }
  }

  private flush(): void {
    if (!this.filePath) return;
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(Object.fromEntries(this.map), null, 2));
    renameSync(tmp, this.filePath);
  }
}
