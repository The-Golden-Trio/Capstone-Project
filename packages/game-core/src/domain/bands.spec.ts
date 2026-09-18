/**
 * Luật mở khoá cấp bậc.
 *
 * Điều dễ vỡ nhất ở đây không phải là một hàm sai, mà là một bộ số không đi
 * được: bộ dữ liệu chỉ dựng nhiệm vụ chính ở vài cấp bậc, nên nếu nhiệm vụ
 * phụ không đủ sức mở cấp kế thì người chơi tắc đường và không ai biết cho
 * tới lúc ngồi bấm thử.
 */
import { describe, expect, it } from 'vitest';
import { fixtureIndex } from '../testing/fixture.js';

const game = fixtureIndex();
import {
  SIDE_QUEST_POINTS,
  UNLOCK_AT,
  bandsOf,
  isBandOpen,
  nextBand,
  previousBand,
} from './bands.js';

const backend = game.data.roles.find((r) => r.role_code === 'SWE_BACKEND');
if (!backend) throw new Error('Bộ dữ liệu không còn SWE_BACKEND');

describe('mở khoá cấp bậc', () => {
  it('cấp bậc đầu luôn mở', () => {
    for (const role of game.data.roles) {
      expect(isBandOpen(role, bandsOf(role)[0], () => 0)).toBe(true);
    }
  });

  it('cấp sau chỉ mở khi cấp trước đủ điểm', () => {
    const role = backend;
    const [first, second] = bandsOf(role);
    expect(isBandOpen(role, second, () => UNLOCK_AT - 1)).toBe(false);
    expect(isBandOpen(role, second, () => UNLOCK_AT)).toBe(true);
    expect(previousBand(role, second)).toBe(first);
    expect(nextBand(role, first)).toBe(second);
  });
});

describe('đi hết một nghề chỉ bằng nhiệm vụ phụ', () => {
  it('có đủ nhiệm vụ phụ để mở cấp kế ở MỌI cấp bậc', () => {
    for (const role of game.data.roles) {
      const needed = Math.ceil(UNLOCK_AT / SIDE_QUEST_POINTS);
      expect(game.eventsForRole(role).length).toBeGreaterThanOrEqual(needed);
    }
  });

  it('SWE_BACKEND đi được hết cả bảy chặng', () => {
    const role = backend;
    const list = bandsOf(role);
    expect(list).toHaveLength(7);

    // Mỗi chặng làm đủ số nhiệm vụ phụ cần thiết thì chặng sau mở ra.
    const earned = new Map<string, number>();
    const perBand = Math.ceil(UNLOCK_AT / SIDE_QUEST_POINTS) * SIDE_QUEST_POINTS;

    for (const band of list) {
      expect(isBandOpen(role, band, (b) => earned.get(b) ?? 0)).toBe(true);
      earned.set(band, perBand);
    }
  });

  it('và đó là con đường DUY NHẤT: phần lớn chặng chưa có nhiệm vụ chính', () => {
    const role = backend;
    const withScenario = bandsOf(role).filter((b) =>
      game.hasScenario(role.role_code, b),
    );
    // Nếu ngày nào đó dựng đủ kịch bản cho cả bảy chặng thì test này đỏ —
    // lúc ấy hãy xoá nó đi, vì nó chỉ tồn tại để ghi nhận chỗ thiếu.
    expect(withScenario.length).toBeLessThan(bandsOf(role).length);
  });
});
