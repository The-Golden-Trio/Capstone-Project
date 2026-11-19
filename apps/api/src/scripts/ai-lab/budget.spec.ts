import { DEFAULT_BUDGET_USD, parseBudgetUsd } from './budget';

describe('parseBudgetUsd', () => {
  it('không có --budget thì dùng trần mặc định', () => {
    expect(parseBudgetUsd(undefined)).toBe(DEFAULT_BUDGET_USD);
  });

  it('nhận số dương hữu hạn, kể cả dạng khoa học', () => {
    expect(parseBudgetUsd('0.5')).toBe(0.5);
    expect(parseBudgetUsd('2')).toBe(2);
    expect(parseBudgetUsd('1e-3')).toBe(0.001);
  });

  it.each([
    ['chữ', 'abc'],
    ['--budget không kèm giá trị (parser đổi thành "true")', 'true'],
    ['rỗng', ''],
    ['toàn dấu cách', '  '],
    ['không', '0'],
    ['âm', '-1'],
    ['vô cực', 'Infinity'],
    ['NaN', 'NaN'],
  ])('từ chối %s', (_label, raw) => {
    expect(parseBudgetUsd(raw)).toBeNull();
  });
});
