import { afterEach, describe, expect, it, vi } from 'vitest';
// Reset module để mô phỏng nạp lại trang, không chỉ tạo một facade API mới.
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
describe('lưu trữ demo', () => {
  it('đọc lại trạng thái từ localStorage khi module khởi tạo lại', async () => {
    localStorage.clear();
    vi.resetModules();
    const first = await import('./store');
    first.db.current = 'saved-session';
    first.save();
    vi.resetModules();
    const second = await import('./store');
    expect(second.db.current).toBe('saved-session');
  });
  it('storage bị chặn vẫn sửa và giữ trạng thái trong RAM', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    vi.resetModules();
    const store = await import('./store');
    store.db.current = 'in-memory';
    expect(() => store.save()).not.toThrow();
    expect(store.db.current).toBe('in-memory');
  });
});
