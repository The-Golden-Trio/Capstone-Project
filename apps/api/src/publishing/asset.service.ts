import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Problem } from '../core/problem';
import { STORAGE, type StorageService } from '../core/storage/storage.port';
import type { AssetKind } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

export const MAX_ASSET_BYTES = 5 * 1024 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** openapi `Asset`. */
export interface AssetView {
  id: string;
  kind: AssetKind;
  url: string;
  source: 'LIBRARY' | 'LICENSED' | 'AI_GENERATED';
  sourceNote: string;
  biasCheck: 'PENDING' | 'PASSED' | 'FAILED';
}

/** CL-06 asset library (C07, FR-36). Sinh ảnh bằng AI hoãn theo D-104. */
@Injectable()
export class AssetService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE) private readonly storage: StorageService,
  ) {}

  private requireStorage(): void {
    if (!this.storage.available)
      throw new Problem(
        503,
        'STORAGE_UNAVAILABLE',
        'Chưa cấu hình kho lưu ảnh (S3_ENDPOINT)',
      );
  }

  async toView(row: {
    id: string;
    kind: AssetKind;
    storageKey: string;
    source: AssetView['source'];
    sourceNote: string | null;
    biasCheck: AssetView['biasCheck'];
  }): Promise<AssetView> {
    return {
      id: row.id,
      kind: row.kind,
      url: await this.storage.signedUrl(row.storageKey, 3600),
      source: row.source,
      sourceNote: row.sourceNote ?? '',
      biasCheck: row.biasCheck,
    };
  }

  /** Chỉ asset đã qua kiểm thiên kiến mới được chọn (FR-36). */
  async list(kind?: AssetKind): Promise<AssetView[]> {
    this.requireStorage();
    const rows = await this.prisma.asset.findMany({
      where: { biasCheck: 'PASSED', ...(kind ? { kind } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return Promise.all(rows.map((r) => this.toView(r)));
  }

  async upload(
    userId: string,
    input: { kind: AssetKind; sourceNote: string },
    file: { buffer: Buffer; mimetype: string; size: number } | undefined,
  ): Promise<AssetView> {
    this.requireStorage();
    if (!file)
      throw new Problem(422, 'VALIDATION_FAILED', 'Chưa có file ảnh', [
        { field: 'file', reason: 'bắt buộc' },
      ]);
    if (
      file.mimetype !== 'image/png' ||
      !file.buffer.subarray(0, 8).equals(PNG_MAGIC)
    )
      throw new Problem(422, 'VALIDATION_FAILED', 'Chỉ nhận ảnh PNG', [
        { field: 'file', reason: 'không phải PNG' },
      ]);
    if (file.size > MAX_ASSET_BYTES)
      throw new Problem(422, 'VALIDATION_FAILED', 'Ảnh lớn hơn 5 MB', [
        { field: 'file', reason: 'quá lớn' },
      ]);
    const storageKey = `assets/${randomUUID()}.png`;
    await this.storage.put(storageKey, file.buffer, 'image/png');
    const row = await this.prisma.asset.create({
      data: {
        kind: input.kind,
        storageKey,
        source: 'LICENSED',
        sourceNote: input.sourceNote,
        biasCheck: 'PASSED',
        checkedBy: userId,
      },
    });
    return this.toView(row);
  }
}
