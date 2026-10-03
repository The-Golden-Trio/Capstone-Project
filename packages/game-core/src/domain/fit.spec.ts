/**
 * Chân dung nghề nghiệp.
 *
 * Điều dễ vỡ nhất sau khi dữ liệu chuyển vào database: `DIMENSIONS` ở lại
 * trong mã (nó là khoá của vector, tức là luật), còn `fit_dimensions` thì nằm
 * trong DB. Hai chỗ lệch nhau thì `blankFit()` tạo vector thiếu chiều, và
 * `applySignal` sẽ LẶNG LẼ bỏ qua mọi tín hiệu rơi vào chiều ấy — không lỗi,
 * không cảnh báo, chỉ là chân dung sai.
 */
import { describe, expect, it } from 'vitest';
import { fixtureIndex } from '../testing/fixture.js';
import { DIMENSIONS, applySignal, blankFit, cosine, hasFit } from './fit.js';

const game = fixtureIndex();

describe('tám chiều', () => {
  it('KHỚP ĐÚNG với fit_dimensions trong bộ dữ liệu', () => {
    expect([...DIMENSIONS]).toEqual(game.dimensions);
  });

  it('chân dung rỗng có đủ tám chiều, tất cả bằng 0', () => {
    const blank = blankFit();
    expect(Object.keys(blank)).toEqual([...DIMENSIONS]);
    expect(hasFit(blank)).toBe(false);
  });

  it('mọi tín hiệu trong bộ dữ liệu đều rơi vào một chiều có thật', () => {
    // Nếu một tín hiệu dùng khoá lạ thì `applySignal` bỏ qua nó mà không báo,
    // và chiều đó biến mất khỏi chân dung người chơi.
    const known = new Set(DIMENSIONS);
    for (const role of game.data.roles) {
      for (const event of game.eventsForRole(role)) {
        for (const choice of event.choices) {
          for (const key of Object.keys(choice.signal)) {
            expect(known.has(key)).toBe(true);
          }
        }
      }
    }
    for (const question of game.data.quiz.questions) {
      for (const option of question.options) {
        for (const key of Object.keys(option.signal)) {
          expect(known.has(key)).toBe(true);
        }
      }
    }
  });

  it('cộng tín hiệu thì chân dung không còn rỗng', () => {
    const fit = applySignal(blankFit(), { [DIMENSIONS[0]]: 2 });
    expect(hasFit(fit)).toBe(true);
    expect(fit[DIMENSIONS[0]]).toBe(2);
  });

  it('hồ sơ hợp nghề của mọi nghề đều so khớp được', () => {
    const fit = applySignal(blankFit(), { [DIMENSIONS[0]]: 1 });
    for (const role of game.data.roles) {
      const score = cosine(fit, role.fit_profile);
      expect(Number.isFinite(score)).toBe(true);
    }
  });
});
