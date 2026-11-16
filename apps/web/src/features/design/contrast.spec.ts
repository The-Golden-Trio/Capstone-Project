import { describe, expect, it } from 'vitest';
import { compositeOnNight, contrastRatio } from './contrast';
describe('tương phản màu', () => {
  it('cho đúng hai cực WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
    expect(contrastRatio('#0A1026')).toBe(1);
  });
  it('đối xứng và nhận màu viết hoa', () => {
    expect(contrastRatio('#d4b06a', '#0a1026')).toBeCloseTo(
      contrastRatio('#0A1026', '#D4B06A'),
    );
    expect(contrastRatio('#f8f6ee')).toBeGreaterThan(16);
  });
  it('từ chối chuỗi không phải hex', () => {
    expect(() => contrastRatio('gold')).toThrow();
  });
});

describe('pha màu trên nền đêm', () => {
  it('giữ màu ở alpha 1 và nền ở alpha 0', () => {
    expect(compositeOnNight('#FFFFFF', 1)).toBe('#ffffff');
    expect(compositeOnNight('#ffffff', 0)).toBe('#0a1026');
    expect(compositeOnNight('#ffffff', 0.5)).toBe('#858893');
  });
  it('từ chối alpha sai', () => {
    expect(() => compositeOnNight('#ffffff', -1)).toThrow();
    expect(() => compositeOnNight('#ffffff', Number.NaN)).toThrow();
  });
});
