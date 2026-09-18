/**
 * Nhiệm vụ phụ của từng hòn đảo.
 *
 * Hai điều dễ vỡ: đảo nào cũng ra cùng một danh sách (lỗi đã từng có), và
 * hòn đảo nghèo nhiệm vụ nhất không đủ điểm để mở cấp bậc kế — cái sau thì
 * chỉ lộ ra khi ngồi bấm hết sáu chặng.
 */
import { describe, expect, it } from 'vitest';
import { fixtureIndex } from '../testing/fixture.js';
import { SIDE_QUEST_POINTS, UNLOCK_AT, bandsOf } from './bands.js';

const game = fixtureIndex();
import {
  SIDE_QUESTS_MAX,
  SIDE_QUESTS_MIN,
  questKind,
  questsToUnlock,
  sideQuestCount,
  sideQuestsFor,
} from './sideQuests.js';

const backend = game.data.roles.find((r) => r.role_code === 'SWE_BACKEND');
if (!backend) throw new Error('Bộ dữ liệu không còn SWE_BACKEND');

describe('chọn nhiệm vụ phụ cho một đảo', () => {
  it('mỗi đảo 3 hoặc 4 nhiệm vụ', () => {
    for (const role of game.data.roles) {
      for (const band of bandsOf(role)) {
        const list = sideQuestsFor(role, band, game);
        expect(list.length).toBeGreaterThanOrEqual(SIDE_QUESTS_MIN);
        expect(list.length).toBeLessThanOrEqual(SIDE_QUESTS_MAX);
        expect(list).toHaveLength(sideQuestCount(role.role_code, band));
      }
    }
  });

  it('không trùng nhiệm vụ trong cùng một đảo', () => {
    for (const role of game.data.roles) {
      for (const band of bandsOf(role)) {
        const ids = sideQuestsFor(role, band, game).map((e) => e.event_id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it('CÁC ĐẢO KHÔNG BÀY RA CÙNG MỘT DANH SÁCH', () => {
    const lists = bandsOf(backend).map((band) =>
      sideQuestsFor(backend, band, game)
        .map((e) => e.event_id)
        .sort()
        .join(','),
    );
    // Bảy chặng thì ít nhất phải có bốn danh sách khác nhau; giống hệt nhau
    // đúng là lỗi đã từng có.
    expect(new Set(lists).size).toBeGreaterThanOrEqual(4);
  });

  it('ưu tiên nhiệm vụ đúng cấp bậc khi dữ liệu có đủ', () => {
    // L4 của SWE_BACKEND có thừa nhiệm vụ hợp cấp bậc, nên không được mượn.
    for (const event of sideQuestsFor(backend, 'L4', game)) {
      expect(event.band_range).toContain('L4');
    }
  });

  it('cấp bậc dữ liệu chưa phủ vẫn có nhiệm vụ để làm', () => {
    // L1 không nhiệm vụ nào nhận, L7 chỉ có một — phải mượn từ cấp gần nhất.
    for (const band of ['L1', 'L7']) {
      expect(sideQuestsFor(backend, band, game).length).toBeGreaterThanOrEqual(
        SIDE_QUESTS_MIN,
      );
    }
  });

  it('cùng một đảo thì lần nào mở cũng ra đúng những nhiệm vụ ấy', () => {
    expect(sideQuestsFor(backend, 'L3', game)).toEqual(sideQuestsFor(backend, 'L3', game));
  });

  it('không đòi nhiều nhiệm vụ hơn số nghề đó có', () => {
    for (const role of game.data.roles) {
      expect(
        sideQuestsFor(role, bandsOf(role)[0], game).length,
      ).toBeLessThanOrEqual(game.eventsForRole(role).length);
    }
  });
});

describe('đủ điểm để đi hết đường', () => {
  it('HÒN ĐẢO ÍT NHIỆM VỤ NHẤT VẪN MỞ ĐƯỢC CẤP BẬC KẾ', () => {
    expect(questsToUnlock()).toBe(Math.ceil(UNLOCK_AT / SIDE_QUEST_POINTS));
    expect(questsToUnlock()).toBeLessThanOrEqual(SIDE_QUESTS_MIN);
  });

  it('mọi đảo của mọi nghề đều bày đủ số nhiệm vụ cần thiết', () => {
    for (const role of game.data.roles) {
      for (const band of bandsOf(role)) {
        expect(sideQuestsFor(role, band, game).length).toBeGreaterThanOrEqual(
          questsToUnlock(),
        );
      }
    }
  });
});

describe('kiểu hỏi', () => {
  it('một nhiệm vụ ở một đảo luôn giữ đúng kiểu của nó', () => {
    expect(questKind(backend, 'L3', 'SH_OT', game)).toBe(
      questKind(backend, 'L3', 'SH_OT', game),
    );
  });

  it('KHÔNG ĐẢO NÀO CHỈ CÓ MỘT KIỂU HỎI', () => {
    for (const role of game.data.roles) {
      for (const band of bandsOf(role)) {
        const kinds = new Set(
          sideQuestsFor(role, band, game).map((e) => questKind(role, band, e.event_id, game)),
        );
        // Đảo ít nhất cũng có ba nhiệm vụ, nên phải đủ cả ba kiểu.
        expect(kinds.size).toBe(3);
      }
    }
  });

  it('mọi đảo đều có một câu phải tự viết', () => {
    for (const role of game.data.roles) {
      for (const band of bandsOf(role)) {
        const kinds = sideQuestsFor(role, band, game).map((e) =>
          questKind(role, band, e.event_id, game),
        );
        expect(kinds).toContain('WRITE');
      }
    }
  });

  it('cùng một nhiệm vụ ở hai đảo có thể hỏi theo kiểu khác nhau', () => {
    const kinds = bandsOf(backend)
      .filter((band) =>
        sideQuestsFor(backend, band, game).some((e) => e.event_id === 'SH_LAYOFF'),
      )
      .map((band) => questKind(backend, band, 'SH_LAYOFF', game));
    expect(new Set(kinds).size).toBeGreaterThan(1);
  });
});
