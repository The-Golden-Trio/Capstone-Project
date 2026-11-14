/**
 * CL-07 `StorageService`: kho object cho asset (và sau này release, file
 * import). Bản chạy thật là kho tương thích S3 (`S3StorageAdapter`); test dùng bộ nhớ.
 */
export const STORAGE = Symbol('STORAGE');

export interface StorageService {
  /** `false` khi chưa cấu hình kho (thiếu S3_ENDPOINT). */
  readonly available: boolean;
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** URL tải có hạn, trình duyệt mở thẳng được. */
  signedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export class InMemoryStorage implements StorageService {
  readonly available = true;
  readonly files = new Map<string, { body: Buffer; contentType: string }>();

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    this.files.set(key, { body, contentType });
  }

  async signedUrl(key: string): Promise<string> {
    return `memory://${key}`;
  }
}
