import { costOf, upperBoundUsd } from './cost';
import type { Price } from './gateway.types';

const qwenImplicit: Price = {
  inputPerMTok: 0.15,
  outputPerMTok: 0.47,
  cachedInputRatio: 0.2,
  cacheWriteRatio: null,
  source: 'test',
  verified: false,
};

describe('chi phí một lượt gọi', () => {
  it('không trúng cache: token × giá', () => {
    const cost = costOf({ input: 5000, cachedInput: 0, cacheWrite: 0, output: 250, reasoning: 0 }, qwenImplicit);
    // 5000 × 0,15 + 250 × 0,47 = 750 + 117,5 → 867,5 / 1e6
    expect(cost.usd).toBeCloseTo(0.0008675, 10);
    expect(cost.basis).toBe('list');
  });

  it('trúng cache: phần trúng chỉ tính 20%', () => {
    const cost = costOf({ input: 5000, cachedInput: 4000, cacheWrite: 0, output: 250, reasoning: 0 }, qwenImplicit);
    // 1000 × 0,15 + 4000 × 0,15 × 0,2 + 250 × 0,47 = 150 + 120 + 117,5
    expect(cost.usd).toBeCloseTo(0.0003875, 10);
  });

  it('chưa biết tỉ lệ giảm giá cache thì tính như không trúng, và nói rõ là cận trên', () => {
    const cost = costOf(
      { input: 5000, cachedInput: 4000, cacheWrite: 0, output: 250, reasoning: 0 },
      { ...qwenImplicit, cachedInputRatio: null },
    );
    expect(cost.usd).toBeCloseTo(0.0008675, 10);
    expect(cost.basis).toBe('upper_bound');
  });

  it('cận trên trước khi gọi luôn ≥ chi phí thật khi chưa trúng cache', () => {
    const chars = 12_000;
    const actual = costOf({ input: Math.ceil(chars / 2.5), cachedInput: 0, cacheWrite: 0, output: 300, reasoning: 0 }, qwenImplicit);
    expect(upperBoundUsd(chars, 300, qwenImplicit)).toBeGreaterThanOrEqual(actual.usd);
  });
});
