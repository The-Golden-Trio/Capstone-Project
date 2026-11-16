import { describe, expect, it } from 'vitest';
import { byDeadline } from './deadlines';

describe('byDeadline', () => {
  it('ưu tiên hạn cũ nhất và không đổi mảng nguồn', () => {
    const items = [
      { id: 'b', due: '2026-11-20T01:00:00Z' },
      { id: 'a', due: '2026-11-16T01:00:00Z' },
    ];
    expect(
      byDeadline(items, (item) => item.due).map((item) => item.id),
    ).toEqual(['a', 'b']);
    expect(items.map((item) => item.id)).toEqual(['b', 'a']);
  });
  it('đưa hạn thiếu hoặc không hợp lệ về cuối, giữ thứ tự khi cùng hạn', () => {
    const items = [
      { id: 'none', due: null },
      { id: 'a', due: '2026-11-16' },
      { id: 'invalid', due: 'không hợp lệ' },
      { id: 'b', due: '2026-11-16' },
    ];
    expect(
      byDeadline(items, (item) => item.due).map((item) => item.id),
    ).toEqual(['a', 'b', 'none', 'invalid']);
  });
});
