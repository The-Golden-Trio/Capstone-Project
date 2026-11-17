import { describe, expect, it } from 'vitest';
import { foldVietnamese, formatDate, lineDiff, percent } from './format';

describe('định dạng CA', () => {
  it('tìm tiếng Việt không dấu kể cả Đ/đ', () => {
    expect(foldVietnamese('Đánh giá nghề')).toBe('danh gia nghe');
  });
  it('không hiển thị ngày giả khi chưa có dữ liệu', () => {
    expect(formatDate(null)).toBe('Chưa có dữ liệu');
    expect(formatDate('bad')).toBe('Chưa có dữ liệu');
  });
  it('định dạng tỉ lệ theo tiếng Việt', () => {
    expect(percent(0.765)).toBe('76,5%');
  });
  it('diff hiển thị dòng bị bỏ và dòng mới', () => {
    expect(lineDiff('Giữ\nBỏ', 'Giữ\nThêm')).toEqual([
      { type: 'same', text: 'Giữ' },
      { type: 'removed', text: 'Bỏ' },
      { type: 'added', text: 'Thêm' },
    ]);
  });
});

it('diff giữ đúng dòng lặp và thứ tự mới', () => {
  const changes = lineDiff('A\nB\nA', 'B\nA');
  expect(
    changes.filter((line) => line.type !== 'removed').map((line) => line.text),
  ).toEqual(['B', 'A']);
  expect(
    changes.filter((line) => line.type !== 'added').map((line) => line.text),
  ).toEqual(['A', 'B', 'A']);
});
