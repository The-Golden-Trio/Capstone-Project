import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiProblem } from './client';
import { caExtra, withDemoFallback } from './ca-extra';
import { caDemo } from './ca-extra.demo';
vi.mock('./client', async (importOriginal) => {
  const original = await importOriginal<typeof import('./client')>();
  return { ...original, api: vi.fn() };
});
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('fallback CA', () => {
  it('giữ nguyên dữ liệu và provenance của API thành công', async () => {
    const fallback = vi.fn(() => 2);
    expect(await withDemoFallback(async () => 1, fallback, false)).toEqual({
      data: 1,
      demo: false,
    });
    expect(fallback).not.toHaveBeenCalled();
  });
  it.each([404, 501])('chỉ chuyển sang mẫu cho HTTP %s', async (status) => {
    expect(
      await withDemoFallback(
        async () => {
          throw new ApiProblem(status, 'HTTP_ERROR', 'Thiếu endpoint');
        },
        () => 2,
        false,
      ),
    ).toEqual({ data: 2, demo: true });
  });
  it.each([0, 401, 403, 409, 422, 500])(
    'không che lỗi HTTP %s bằng dữ liệu mẫu',
    async (status) => {
      const error = new ApiProblem(status, 'ERROR', 'Lỗi');
      const fallback = vi.fn(() => 2);
      await expect(
        withDemoFallback(
          async () => {
            throw error;
          },
          fallback,
          false,
        ),
      ).rejects.toBe(error);
      expect(fallback).not.toHaveBeenCalled();
    },
  );
  it('không che lỗi lập trình', async () => {
    await expect(
      withDemoFallback(
        async () => {
          throw new TypeError('Lỗi');
        },
        () => 2,
        false,
      ),
    ).rejects.toThrow(TypeError);
  });
  it('không gọi mạng khi VITE_STAFF_DEMO=1', async () => {
    vi.stubEnv('VITE_STAFF_DEMO', '1');
    const request = vi.fn(async () => 1);
    expect(await withDemoFallback(request, () => 2)).toEqual({
      data: 2,
      demo: true,
    });
    expect(request).not.toHaveBeenCalled();
  });
  it('giữ chế độ demo cho mutation của một tài nguyên mẫu', async () => {
    const item = caDemo.occupations()[0];
    const response = await caExtra.updateOccupation(
      item.id,
      { domainId: item.domainId, code: item.code, name: item.name },
      true,
    );
    expect(response.demo).toBe(true);
    expect(api).not.toHaveBeenCalled();
  });
  it('gọi release với request OpenAPI, không gửi version/build/checklist do UI tự tạo', async () => {
    vi.mocked(api).mockResolvedValue({ id: 'release-1' });
    const body = {
      effectiveFrom: '2026-11-16T08:00:00Z',
      releaseNote: 'Bản đầu',
    };
    await caExtra.publish('scenario-1', body, false);
    expect(api).toHaveBeenCalledWith('/staff/scenarios/scenario-1/release', {
      method: 'POST',
      body,
    });
  });
  it('upload multipart dùng source/file, không coi jobId API thật là importId', async () => {
    vi.mocked(api).mockResolvedValue({ jobId: 'job-1' });
    const file = new File(['test'], 'ESCO.csv');
    const response = await caExtra.startImport('ESCO', file);
    const [path, options] = vi.mocked(api).mock.calls[0];
    expect(path).toBe('/staff/imports');
    expect(options?.method).toBe('POST');
    expect(options?.form?.get('source')).toBe('ESCO');
    expect(options?.form?.get('file')).toBe(file);
    expect(response).toEqual({ data: { jobId: 'job-1' }, demo: false });
  });
});
describe('trạng thái demo', () => {
  it('có 221 nghề nguồn và không suy playable thành lifecycle PUBLISHED', () => {
    expect(caDemo.occupations()).toHaveLength(221);
    expect(caDemo.occupations().every((o) => o.status === 'DRAFT')).toBe(true);
  });
  it('không xuất bản nghề thiếu scenario đã phát hành', () => {
    expect(() => caDemo.lifecycle('SWE_BACKEND', 'publish')).toThrow(
      'ít nhất một scenario',
    );
  });
  it('không hoàn tất import trước khi xử lý hết và không hoàn tất hai lần', () => {
    const { jobId } = caDemo.startImport('ONET');
    expect(() => caDemo.completeImport(jobId)).toThrow();
    for (const record of caDemo.getImport(jobId).records)
      caDemo.fixRecord(jobId, record.recordId, { action: 'SKIP' });
    expect(caDemo.completeImport(jobId).skippedRecords).toBe(3);
    expect(() => caDemo.completeImport(jobId)).toThrow();
  });
  it('release mẫu bất biến, không ghi đè khi phát hành lần nữa', () => {
    const id = 'scenario-immutable-test';
    const release = caDemo.publish(id, {
      effectiveFrom: '2026-11-16T08:00:00Z',
    });
    release.version = 'sửa ở UI';
    expect(caDemo.publishPreview(id).releases[0].version).toBe('1.0.0');
    expect(() =>
      caDemo.publish(id, { effectiveFrom: '2026-11-16T09:00:00Z' }),
    ).toThrow('bất biến');
  });
});
